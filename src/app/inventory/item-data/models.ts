import { Tables } from '../../platform/database.types';
export type Item = Tables<{ schema: 'outify' }, 'items'> & {
  imageUrl: string;
  zoneId: number | null;
  tags: string[];
};
export const CATEGORIES = {
  top: 'Parte superior',
  bottom: 'Parte inferior',
  dress: 'Vestido o mono',
  outerwear: 'Abrigo',
  footwear: 'Calzado',
  accessory: 'Accesorio',
  underwear: 'Ropa interior',
  sportswear: 'Ropa deportiva',
  other: 'Otra',
};
export const SEASONS = {
  spring: 'Primavera',
  summer: 'Verano',
  autumn: 'Otoño',
  winter: 'Invierno',
};
export const categoryOptions = Object.entries(CATEGORIES).map(([value, label]) => ({
  value,
  label,
}));
export const seasonOptions = Object.entries(SEASONS).map(([value, label]) => ({ value, label }));
export function categoryLabel(value: string) {
  return CATEGORIES[value as keyof typeof CATEGORIES] ?? value;
}
