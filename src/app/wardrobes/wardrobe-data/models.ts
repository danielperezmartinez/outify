import { Tables } from '../../platform/database.types';
export type Wardrobe = Tables<{ schema: 'outify' }, 'wardrobes'>;
export type Zone = Tables<{ schema: 'outify' }, 'zones'>;
export const ZONE_TYPES = {
  section: 'Sección',
  shelf: 'Balda',
  drawer: 'Cajón',
  rail: 'Barra',
  box: 'Caja',
  other: 'Otro',
};
export const zoneTypeOptions = Object.entries(ZONE_TYPES).map(([value, label]) => ({
  value,
  label,
}));
