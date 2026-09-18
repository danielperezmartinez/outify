import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Backend, unwrap } from '../../platform/backend';
import { Json } from '../../platform/database.types';
import { Session } from '../../platform/session';
import { Item } from './models';
import { readPages } from '../../shared/utilities/read-pages';
@Injectable()
export class ItemStore {
  private readonly backend = inject(Backend);
  private readonly session = inject(Session);
  private readonly state = signal<Item[]>([]);
  readonly items = this.state.asReadonly();
  constructor() {
    const timer = setInterval(
      () => {
        void this.refreshImages().catch(() => {});
      },
      45 * 60 * 1000,
    );
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }
  private async refreshImages() {
    const rows = this.items();
    for (let offset = 0; offset < rows.length; offset += 100) {
      const batch = rows.slice(offset, offset + 100);
      const signed = unwrap(
        await this.backend.images.createSignedUrls(
          batch.map((i) => i.image_path),
          3600,
        ),
      );
      const urls = new Map(batch.map((i, index) => [i.id, signed?.[index]?.signedUrl ?? '']));
      this.state.update((items) =>
        items.map((i) => (urls.has(i.id) ? { ...i, imageUrl: urls.get(i.id)! } : i)),
      );
    }
  }
  async load() {
    this.state.set([]);
    const rows = await readPages((from, to) =>
      this.backend.client
        .from('items')
        .select('*,item_locations(zone_id),item_tags(tags(name))')
        .order('updated_at', { ascending: false })
        .order('id')
        .range(from, to),
    );
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
  async upload(file: File) {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
      throw new Error('Elige una imagen JPG, PNG o WebP.');
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
