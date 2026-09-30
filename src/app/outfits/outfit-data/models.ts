import { Database } from '../../platform/database.types';
import { Item } from '../../inventory/item-data/models';

export type Outfit = Database['outify']['Tables']['outfits']['Row'];
export type OutfitEntry = Database['outify']['Tables']['outfit_items']['Row'];
export type OutfitSelection = { id: number; item_id?: never } | { id?: never; item_id: number };
export interface OutfitPiece {
  key: string;
  selection: OutfitSelection;
  item: Item | null;
  name: string;
  state: 'active' | 'archived' | 'deleted';
}

export function resolvePieces(
  selections: OutfitSelection[],
  entries: OutfitEntry[],
  items: Item[],
): OutfitPiece[] {
  const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
  const itemMap = new Map(items.map((item) => [item.id, item]));
  return selections.map((selection) => {
    const entry = selection.id === undefined ? undefined : entryMap.get(selection.id);
    const item = itemMap.get(entry?.item_id ?? selection.item_id ?? -1) ?? null;
    return {
      key: selection.id === undefined ? 'item-' + selection.item_id : 'entry-' + selection.id,
      selection,
      item,
      name: item?.name ?? entry?.deleted_name ?? 'Prenda no disponible',
      state: !item ? 'deleted' : item.status === 'archived' ? 'archived' : 'active',
    };
  });
}

export function addSelection(
  selections: OutfitSelection[],
  itemId: number,
  entries: OutfitEntry[],
) {
  if (
    selections.some(
      (s) => s.item_id === itemId || entries.some((e) => e.id === s.id && e.item_id === itemId),
    )
  )
    return selections;
  const existing = entries.find((entry) => entry.item_id === itemId);
  return [...selections, existing ? { id: existing.id } : { item_id: itemId }];
}

export function moveSelection(selections: OutfitSelection[], index: number, offset: number) {
  const target = index + offset;
  if (index < 0 || index >= selections.length || target < 0 || target >= selections.length)
    return selections;
  const result = [...selections];
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

export function filterOutfits(outfits: Outfit[], search: string, favorites: boolean) {
  const query = search.trim().toLocaleLowerCase('es');
  return outfits
    .filter(
      (outfit) =>
        (!favorites || outfit.is_favorite) && outfit.name.toLocaleLowerCase('es').includes(query),
    )
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at) || a.id - b.id);
}
