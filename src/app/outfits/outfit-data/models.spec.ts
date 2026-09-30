import { describe, expect, it } from 'vitest';
import { Item } from '../../inventory/item-data/models';
import {
  Outfit,
  OutfitEntry,
  addSelection,
  filterOutfits,
  moveSelection,
  resolvePieces,
} from './models';

const item = {
  id: 10,
  name: 'Camisa actual',
  status: 'active',
  imageUrl: 'foto-nueva',
  zoneId: 8,
} as Item;
const entries: OutfitEntry[] = [
  { id: 1, outfit_id: 2, user_id: 'owner', item_id: 10, deleted_name: null, position: 0 },
  { id: 2, outfit_id: 2, user_id: 'owner', item_id: null, deleted_name: 'Zapatos', position: 1 },
];
describe('composición de outfits', () => {
  it('resuelve datos actuales sin recuperar imágenes de prendas eliminadas', () => {
    const pieces = resolvePieces([{ id: 1 }, { id: 2 }], entries, [item]);
    expect(pieces[0]).toMatchObject({
      name: 'Camisa actual',
      state: 'active',
      item: { imageUrl: 'foto-nueva', zoneId: 8 },
    });
    expect(pieces[1]).toMatchObject({ name: 'Zapatos', state: 'deleted', item: null });
    expect(
      resolvePieces([{ id: 1 }], entries, [{ ...item, status: 'archived', zoneId: null }])[0].state,
    ).toBe('archived');
  });
  it('impide duplicados y recupera la identidad de una entrada retirada', () => {
    expect(addSelection([{ id: 1 }], 10, entries)).toEqual([{ id: 1 }]);
    expect(addSelection([], 10, entries)).toEqual([{ id: 1 }]);
    expect(addSelection([{ item_id: 11 }], 11, entries)).toEqual([{ item_id: 11 }]);
    expect(addSelection([{ id: 1 }], 11, entries)).toEqual([{ id: 1 }, { item_id: 11 }]);
  });
  it('reordena sin mutar y respeta los límites', () => {
    const selected = [{ id: 1 }, { id: 2 }];
    expect(moveSelection(selected, 1, -1)).toEqual([{ id: 2 }, { id: 1 }]);
    expect(selected).toEqual([{ id: 1 }, { id: 2 }]);
    expect(moveSelection(selected, 0, -1)).toBe(selected);
    expect(moveSelection(selected, 1, 1)).toBe(selected);
  });
  it('combina búsqueda y favoritos con orden estable', () => {
    const base = { name: 'Verano', is_favorite: true, updated_at: '2026-09-30' } as Outfit;
    const outfits = [
      { ...base, id: 3 },
      { ...base, id: 2 },
      { ...base, id: 1, is_favorite: false },
    ];
    expect(filterOutfits(outfits, ' VERANO ', true).map((row) => row.id)).toEqual([2, 3]);
    expect(filterOutfits(outfits, 'invierno', false)).toEqual([]);
  });
});
