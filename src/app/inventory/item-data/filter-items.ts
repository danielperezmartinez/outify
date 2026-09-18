import { Item } from './models';
export interface ItemFilter {
  search: string;
  category: string;
  color: string;
  season: string;
  tag: string;
  wardrobe: string;
  assignment: string;
  status: string;
  zone: string;
}
export function filterItems(
  items: Item[],
  filter: ItemFilter,
  zones: { id: number; wardrobe_id: number }[],
): Item[] {
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  return items.filter(
    (i) =>
      i.status === filter.status &&
      normalize(i.name).includes(normalize(filter.search)) &&
      (!filter.category || i.category === filter.category) &&
      (!filter.color || normalize(i.primary_color).includes(normalize(filter.color))) &&
      (!filter.season || i.seasons.includes(filter.season)) &&
      (!filter.tag || i.tags.some((t) => normalize(t).includes(normalize(filter.tag)))) &&
      (!filter.wardrobe ||
        zones.some((z) => z.id === i.zoneId && z.wardrobe_id === Number(filter.wardrobe))) &&
      (!filter.assignment ||
        (filter.assignment === 'unassigned' ? i.zoneId === null : i.zoneId !== null)) &&
      (!filter.zone || i.zoneId === Number(filter.zone)),
  );
}
