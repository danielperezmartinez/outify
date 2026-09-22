import { Wardrobe, Zone } from './models';

export type EditorCommand =
  | { kind: 'zone'; id: number; before: Zone | null; after: Zone | null; itemIds: number[] }
  | { kind: 'wardrobe'; before: Wardrobe; after: Wardrobe };
