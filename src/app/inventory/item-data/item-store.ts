import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Backend, unwrap } from '../../platform/backend';
import { Json } from '../../platform/database.types';
import { Session } from '../../platform/session';
import { Item } from './models';
import { readPages } from '../../shared/utilities/read-pages';
import { WorkspaceAccess } from '../../platform/workspace-access';
import { prepareImage } from './prepare-image';
import { pathsToSign, SIGNED_URL_SECONDS, SignedUrl } from './signed-urls';
@Injectable()
export class ItemStore {
  private readonly backend = inject(Backend);
  private readonly session = inject(Session);
  private readonly workspace = inject(WorkspaceAccess);
  private readonly state = signal<Item[]>([]);
  readonly items = this.state.asReadonly();
  private readonly signedUrls = new Map<string, SignedUrl>();
  constructor() {
    this.workspace.registerCache(() => {
      this.state.set([]);
      this.signedUrls.clear();
    }, inject(DestroyRef));
    const timer = setInterval(
      () => {
        void this.refreshImages().catch(() => {});
      },
      15 * 60 * 1000,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  // Solo firma las fotos sin URL vigente; las demás conservan la suya y la caché del navegador.
  private async refreshImages() {
    const revision = this.workspace.revision;
    const pending = pathsToSign(
      this.items().map((i) => i.image_path),
      this.signedUrls,
      Date.now(),
    );
    for (let offset = 0; offset < pending.length; offset += 100) {
      const batch = pending.slice(offset, offset + 100);
      const expiresAt = Date.now() + SIGNED_URL_SECONDS * 1000;
      const signed = unwrap(await this.backend.images.createSignedUrls(batch, SIGNED_URL_SECONDS));
      if (revision !== this.workspace.revision) return;
      batch.forEach((path, index) => {
        const url = signed?.[index]?.signedUrl;
        if (url) this.signedUrls.set(path, { url, expiresAt });
      });
    }
    if (revision !== this.workspace.revision) return;
    this.state.update((items) =>
      items.map((i) => ({ ...i, imageUrl: this.signedUrls.get(i.image_path)?.url ?? '' })),
    );
  }
  async load() {
    const revision = this.workspace.revision;
    this.state.set([]);
    const rows = await readPages((from, to) =>
      this.backend.client
        .from('items')
        .select('*,item_locations(zone_id),item_tags(tags(name))')
        .order('updated_at', { ascending: false })
        .order('id')
        .range(from, to),
    );
    if (revision !== this.workspace.revision) return;
    this.state.set(
      rows.map((i, index) => ({
        ...i,
        imageUrl: '',
        zoneId: i.item_locations?.[0]?.zone_id ?? null,
        tags: i.item_tags.map((t) => t.tags?.name ?? '').filter(Boolean),
      })),
    );
    await this.refreshImages();
    await this.cleanupImages();
  }
  async upload(original: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(original.type))
      throw new Error('Elige una imagen JPG, PNG o WebP.');
    const file = await prepareImage(original);
    if (file.size > 8 * 1024 * 1024) throw new Error('La imagen no puede superar 8 MB.');
    const uid = this.session.user()?.id;
    if (!uid) throw new Error('Tu sesión ha caducado.');
    const extension = file.type === 'image/jpeg' ? 'jpg' : file.type.split('/')[1];
    const path = `${uid}/${crypto.randomUUID()}.${extension}`;
    unwrap(
      await this.backend.client
        .from('image_cleanup')
        .insert({ path, process_after: new Date(Date.now() + 3600000).toISOString() }),
    );
    unwrap(await this.backend.images.upload(path, file, { contentType: file.type, upsert: false }));
    return path;
  }
  async save(data: Json, zoneId: number | null, tags: string[]) {
    return unwrap(
      await this.backend.client.rpc('save_item', {
        item_data: data,
        target_zone: zoneId ?? undefined,
        tag_names: tags,
      }),
    );
  }
  async locate(id: number, zoneId: number | null) {
    if (zoneId === null)
      unwrap(await this.backend.client.from('item_locations').delete().eq('item_id', id));
    else
      unwrap(
        await this.backend.client.from('item_locations').upsert({ item_id: id, zone_id: zoneId }),
      );
    this.state.update((items) => items.map((i) => (i.id === id ? { ...i, zoneId } : i)));
  }
  restoreZoneLocations(zoneId: number, exists: boolean, itemIds: number[]) {
    this.state.update((items) =>
      items.map((item) =>
        !exists && item.zoneId === zoneId
          ? { ...item, zoneId: null }
          : exists && itemIds.includes(item.id)
            ? { ...item, zoneId }
            : item,
      ),
    );
  }
  async archive(id: number) {
    unwrap(await this.backend.client.from('items').update({ status: 'archived' }).eq('id', id));
    await this.load();
  }
  async restore(id: number) {
    unwrap(await this.backend.client.from('items').update({ status: 'active' }).eq('id', id));
    await this.load();
  }
  async delete(id: number) {
    unwrap(await this.backend.client.rpc('delete_archived_item', { item: id }));
    await this.cleanupImages();
    await this.load();
  }
  async retireImage(path: string) {
    const referenced = unwrap(
      await this.backend.client.from('items').select('id').eq('image_path', path),
    );
    if (referenced?.length) return;
    unwrap(await this.backend.client.from('image_cleanup').delete().eq('path', path));
    unwrap(await this.backend.client.from('image_cleanup').insert({ path }));
    await this.cleanupImages();
  }
  async cleanupImages() {
    const pending =
      unwrap(
        await this.backend.client.from('image_cleanup').select('path').lte('process_after', 'now'),
      ) ?? [];
    for (const entry of pending) {
      const referenced = unwrap(
        await this.backend.client.from('items').select('id').eq('image_path', entry.path),
      );
      if (referenced?.length) {
        unwrap(await this.backend.client.from('image_cleanup').delete().eq('path', entry.path));
        continue;
      }
      const { error } = await this.backend.images.remove([entry.path]);
      if (error)
        throw new Error(
          'La ficha está guardada. Falta limpiar una foto; se reintentará al abrir el inventario.',
        );
      unwrap(await this.backend.client.from('image_cleanup').delete().eq('path', entry.path));
    }
  }
}
