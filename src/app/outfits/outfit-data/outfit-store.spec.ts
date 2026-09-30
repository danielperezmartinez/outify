import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Backend } from '../../platform/backend';
import { WorkspaceAccess } from '../../platform/workspace-access';
import { ItemStore } from '../../inventory/item-data/item-store';
import { WardrobeStore } from '../../wardrobes/wardrobe-data/wardrobe-store';
import { Item } from '../../inventory/item-data/models';
import { OutfitStore } from './outfit-store';
import { Outfit, OutfitEntry } from './models';

describe('OutfitStore', () => {
  const outfit: Outfit = {
    id: 1,
    name: 'Combinación',
    notes: '',
    is_favorite: false,
    user_id: 'owner',
    created_at: '',
    updated_at: '',
  };
  const entries: OutfitEntry[] = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    outfit_id: 1,
    user_id: 'owner',
    item_id: i < 4 ? i + 1 : null,
    deleted_name: i === 4 ? 'Prenda eliminada' : null,
    position: i,
  }));
  function setup() {
    const items = signal<Item[]>(
      Array.from(
        { length: 4 },
        (_, i) =>
          ({
            id: i + 1,
            name: 'Prenda ' + i,
            status: 'active',
            zoneId: 1,
            imageUrl: 'foto',
          }) as Item,
      ),
    );
    let finish!: (value: { data: Outfit | null; error: { message: string } | null }) => void;
    let finishLoad: (() => void) | null = null;
    let pauseLoad: Promise<void> | null = null;
    const pending = new Promise<{ data: Outfit | null; error: { message: string } | null }>(
      (resolve) => {
        finish = resolve;
      },
    );
    TestBed.configureTestingModule({
      providers: [
        OutfitStore,
        { provide: ItemStore, useValue: { items, load: async () => {} } },
        { provide: WardrobeStore, useValue: { load: async () => {} } },
        {
          provide: Backend,
          useValue: {
            client: {
              from: (table: string) => {
                const query = {
                  select: () => query,
                  order: () => query,
                  update: () => query,
                  eq: () => query,
                  range: async () => {
                    await pauseLoad;
                    return { data: table === 'outfits' ? [outfit] : entries, error: null };
                  },
                  single: () => pending,
                };
                return query;
              },
            },
          },
        },
      ],
    });
    return {
      store: TestBed.inject(OutfitStore),
      items,
      finish,
      pause: () => {
        pauseLoad = new Promise<void>((resolve) => {
          finishLoad = resolve;
        });
      },
      resume: () => finishLoad?.(),
    };
  }
  it('limita la preview pero avisa también sobre la quinta entrada', async () => {
    const { store, items } = setup();
    await store.load();
    expect(store.cards()[0].preview).toHaveLength(4);
    expect(store.cards()[0].unavailable).toBe(1);
    items.update((rows) =>
      rows.map((row) =>
        row.id === 1 ? { ...row, name: 'Nombre actual', zoneId: 4, imageUrl: 'nueva' } : row,
      ),
    );
    expect(store.cards()[0].preview[0]).toMatchObject({
      name: 'Nombre actual',
      item: { zoneId: 4, imageUrl: 'nueva' },
    });
  });
  it('conserva el favorito anterior cuando falla la petición', async () => {
    const { store, finish } = setup();
    await store.load();
    const request = store.favorite(outfit);
    finish({ data: null, error: { message: 'Network error' } });
    await request;
    expect(store.outfits()[0].is_favorite).toBe(false);
    expect(store.error()).toContain('conexión');
  });
  it('no repuebla los datos después de cerrar el espacio', async () => {
    const { store, finish } = setup();
    await store.load();
    const request = store.favorite(outfit);
    TestBed.inject(WorkspaceAccess).reset();
    finish({ data: { ...outfit, is_favorite: true }, error: null });
    await request;
    expect(store.outfits()).toEqual([]);
    expect(store.entries()).toEqual([]);
  });
  it('descarta una carga pendiente después de cerrar el espacio', async () => {
    const { store, pause, resume } = setup();
    pause();
    const request = store.load();
    TestBed.inject(WorkspaceAccess).reset();
    resume();
    await request;
    expect(store.outfits()).toEqual([]);
  });
});
