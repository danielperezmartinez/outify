import { Injectable, inject, signal } from '@angular/core';
import { Backend, unwrap } from '../../platform/backend';
import { Wardrobe, Zone } from './models';
import { readPages } from '../../shared/utilities/read-pages';
@Injectable()
export class WardrobeStore {
  private readonly db = inject(Backend).client;
  private readonly wardrobeState = signal<Wardrobe[]>([]);
  private readonly zoneState = signal<Zone[]>([]);
  readonly wardrobes = this.wardrobeState.asReadonly();
  readonly zones = this.zoneState.asReadonly();
  async load() {
    const [w, z] = await Promise.all([
      readPages((from, to) => this.db.from('wardrobes').select('*').order('id').range(from, to)),
      readPages((from, to) =>
        this.db.from('zones').select('*').order('z_index').order('id').range(from, to),
      ),
    ]);
    this.wardrobeState.set(w);
    this.zoneState.set(z);
  }
  async saveWardrobe(value: Partial<Wardrobe> & { name: string }) {
    const { id, ...payload } = value;
    const result = id
      ? await this.db.from('wardrobes').update(payload).eq('id', id).select().single()
      : await this.db.from('wardrobes').insert(payload).select().single();
    const saved = unwrap(result);
    await this.load();
    return saved;
  }
  async saveZone(value: Partial<Zone> & { name: string; wardrobe_id: number }) {
    const { id, ...payload } = value;
    const result = id
      ? await this.db.from('zones').update(payload).eq('id', id).select().single()
      : await this.db.from('zones').insert(payload).select().single();
    const saved = unwrap(result);
    await this.load();
    return saved;
  }
  async deleteWardrobe(id: number) {
    unwrap(await this.db.from('wardrobes').delete().eq('id', id));
    await this.load();
  }
  async deleteZone(id: number) {
    unwrap(await this.db.from('zones').delete().eq('id', id));
    await this.load();
  }
  locationLabel(zoneId: number | null) {
    const zone = this.zones().find((z) => z.id === zoneId);
    const wardrobe = this.wardrobes().find((w) => w.id === zone?.wardrobe_id);
    return zone && wardrobe ? `${wardrobe.name} → ${zone.name}` : 'Sin asignar';
  }
}
