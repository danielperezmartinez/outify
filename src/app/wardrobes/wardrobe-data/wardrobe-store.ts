import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { Backend, unwrap } from '../../platform/backend';
import { Wardrobe, Zone } from './models';
import { readPages } from '../../shared/utilities/read-pages';
import { WorkspaceAccess } from '../../platform/workspace-access';
@Injectable()
export class WardrobeStore {
  private readonly db = inject(Backend).client;
  private readonly workspace = inject(WorkspaceAccess);
  private readonly wardrobeState = signal<Wardrobe[]>([]);
  private readonly zoneState = signal<Zone[]>([]);
  readonly wardrobes = this.wardrobeState.asReadonly();
  readonly zones = this.zoneState.asReadonly();
  constructor() {
    this.workspace.registerCache(() => {
      this.wardrobeState.set([]);
      this.zoneState.set([]);
    }, inject(DestroyRef));
  }
  async load() {
    const revision = this.workspace.revision;
    const [w, z] = await Promise.all([
      readPages((from, to) => this.db.from('wardrobes').select('*').order('id').range(from, to)),
      readPages((from, to) =>
        this.db.from('zones').select('*').order('z_index').order('id').range(from, to),
      ),
    ]);
    if (revision !== this.workspace.revision) return;
    this.wardrobeState.set(w);
    this.zoneState.set(z);
  }
  async saveWardrobe(value: Partial<Wardrobe> & { name: string }) {
    const revision = this.workspace.revision;
    const { id, ...payload } = value;
    const result = id
      ? await this.db.from('wardrobes').update(payload).eq('id', id).select().single()
      : await this.db.from('wardrobes').insert(payload).select().single();
    const saved = unwrap(result);
    if (!saved) throw new Error('El servidor no confirmó el armario. Recarga antes de continuar.');
    if (revision === this.workspace.revision)
      this.wardrobeState.update((wardrobes) =>
        [...wardrobes.filter((wardrobe) => wardrobe.id !== saved.id), saved].sort(
          (a, b) => a.id - b.id,
        ),
      );
    return saved;
  }
  async saveZone(value: Partial<Zone> & { name: string; wardrobe_id: number }) {
    const revision = this.workspace.revision;
    const { id, ...payload } = value;
    const previous = this.zones().find((zone) => zone.id === id);
    if (previous) this.replaceZone({ ...previous, ...payload });
    try {
      const result = id
        ? await this.db.from('zones').update(payload).eq('id', id).select().single()
        : await this.db.from('zones').insert(payload).select().single();
      const saved = unwrap(result);
      if (!saved) throw new Error('El servidor no confirmó la zona. Recarga antes de continuar.');
      if (revision === this.workspace.revision) this.replaceZone(saved);
      return saved;
    } catch (error) {
      if (previous && revision === this.workspace.revision) this.replaceZone(previous);
      throw error;
    }
  }
  private replaceZone(zone: Zone) {
    this.zoneState.update((zones) =>
      [...zones.filter((value) => value.id !== zone.id), zone].sort(
        (a, b) => a.z_index - b.z_index || a.id - b.id,
      ),
    );
  }
  async deleteWardrobe(id: number) {
    unwrap(await this.db.from('wardrobes').delete().eq('id', id));
    await this.load();
  }
  async deleteZone(id: number) {
    unwrap(await this.db.from('zones').delete().eq('id', id));
    this.zoneState.update((zones) => zones.filter((zone) => zone.id !== id));
  }
  async restoreZoneState(
    id: number,
    expected: Zone | null,
    restored: Zone | null,
    itemIds: number[],
  ) {
    const revision = this.workspace.revision;
    const wardrobeId = (restored ?? expected)?.wardrobe_id;
    if (!wardrobeId) throw new Error('No se encuentra el armario de esta operación.');
    const previous = this.zones();
    if (restored) this.replaceZone(restored);
    else this.zoneState.update((zones) => zones.filter((zone) => zone.id !== id));
    try {
      const saved = unwrap(
        await this.db.rpc('restore_zone_state', {
          target_id: id,
          target_wardrobe: wardrobeId,
          expected_state: expected,
          restored_state: restored,
          assigned_items: itemIds,
        }),
      );
      if (saved && revision === this.workspace.revision) this.replaceZone(saved as Zone);
    } catch (error) {
      if (revision === this.workspace.revision) this.zoneState.set(previous);
      throw error;
    }
  }
  locationLabel(zoneId: number | null) {
    const zone = this.zones().find((z) => z.id === zoneId);
    const wardrobe = this.wardrobes().find((w) => w.id === zone?.wardrobe_id);
    return zone && wardrobe ? `${wardrobe.name} → ${zone.name}` : 'Sin asignar';
  }
}
