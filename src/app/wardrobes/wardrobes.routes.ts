import { Routes } from '@angular/router';
import { WardrobeStore } from './wardrobe-data/wardrobe-store';
import { ItemStore } from '../inventory/item-data/item-store';
export const WARDROBE_ROUTES: Routes = [
  {
    path: '',
    title: 'Mis armarios · Outify',
    providers: [WardrobeStore, ItemStore],
    loadComponent: () => import('./wardrobe-view/wardrobe-view').then((m) => m.WardrobeView),
  },
];
