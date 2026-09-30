import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Backend, errorMessage, unwrap } from '../../platform/backend';
import { WorkspaceAccess } from '../../platform/workspace-access';
import { ItemStore } from '../../inventory/item-data/item-store';
import { WardrobeStore } from '../../wardrobes/wardrobe-data/wardrobe-store';
import { readPages } from '../../shared/utilities/read-pages';
import { Outfit, OutfitEntry, OutfitSelection, resolvePieces } from './models';

@Injectable()
export class OutfitStore {
  private readonly backend = inject(Backend);
  private readonly workspace = inject(WorkspaceAccess);
  readonly items = inject(ItemStore);
  readonly wardrobes = inject(WardrobeStore);
  private readonly state = signal<Outfit[]>([]);
  private readonly entryState = signal<OutfitEntry[]>([]);
  readonly outfits = this.state.asReadonly();
  readonly entries = this.entryState.asReadonly();
  readonly loading = signal(true);
  readonly error = signal('');
  readonly busy = signal(false);
  private generation = 0;
  readonly cards = computed(() =>
    this.outfits().map((outfit) => {
      const pieces = this.pieces(outfit.id);
      return {
        ...outfit,
        pieces,
        preview: pieces.slice(0, 4),
        unavailable: pieces.filter((piece) => piece.state !== 'active').length,
      };
    }),
  );
  constructor() {
    this.workspace.registerCache(() => {
      this.generation++;
      this.state.set([]);
      this.entryState.set([]);
    }, inject(DestroyRef));
  }
  outfitEntries(id: number) {
    return this.entries()
      .filter((entry) => entry.outfit_id === id)
      .sort((a, b) => a.position - b.position);
  }
  pieces(id: number) {
    const entries = this.outfitEntries(id);
    return resolvePieces(
      entries.map((entry) => ({ id: entry.id })),
      entries,
      this.items.items(),
    );
  }
  async load() {
    const generation = ++this.generation;
    const revision = this.workspace.revision;
    this.loading.set(true);
    this.error.set('');
    try {
      const [outfits, entries] = await Promise.all([
        readPages((from, to) =>
          this.backend.client
            .from('outfits')
            .select('*')
            .order('updated_at', { ascending: false })
            .order('id')
            .range(from, to),
        ),
        readPages((from, to) =>
          this.backend.client.from('outfit_items').select('*').order('id').range(from, to),
        ),
        this.items.load(),
        this.wardrobes.load(),
      ]);
      if (generation !== this.generation || revision !== this.workspace.revision) return;
      this.state.set(outfits);
      this.entryState.set(entries);
    } catch (error) {
      if (generation === this.generation) this.error.set(errorMessage(error));
    } finally {
      if (generation === this.generation) this.loading.set(false);
    }
  }
  async save(id: number | null, name: string, notes: string, entries: OutfitSelection[]) {
    const savedId = unwrap(
      await this.backend.client.rpc('save_outfit', {
        outfit_id: id ?? 0,
        outfit_name: name.trim(),
        outfit_notes: notes,
        entries: entries.map((entry) =>
          entry.id === undefined ? { item_id: entry.item_id } : { id: entry.id },
        ),
      }),
    );
    if (!savedId) throw new Error('No se pudo confirmar el guardado. Reintenta.');
    return savedId;
  }
  async favorite(outfit: Outfit) {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    const revision = this.workspace.revision;
    try {
      const updated = unwrap(
        await this.backend.client
          .from('outfits')
          .update({ is_favorite: !outfit.is_favorite })
          .eq('id', outfit.id)
          .select('*')
          .single(),
      );
      if (!updated) throw new Error('Este outfit no está disponible.');
      if (revision === this.workspace.revision)
        this.state.update((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
    } catch (error) {
      this.error.set(errorMessage(error));
    } finally {
      this.busy.set(false);
    }
  }
  async remove(id: number) {
    const removed = unwrap(
      await this.backend.client.from('outfits').delete().eq('id', id).select('id'),
    );
    if (!removed?.length) throw new Error('Este outfit no está disponible.');
    this.state.update((rows) => rows.filter((row) => row.id !== id));
    this.entryState.update((rows) => rows.filter((row) => row.outfit_id !== id));
  }
}
