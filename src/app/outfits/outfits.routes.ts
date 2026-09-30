import { Routes } from '@angular/router';
import { ItemStore } from '../inventory/item-data/item-store';
import { WardrobeStore } from '../wardrobes/wardrobe-data/wardrobe-store';
import { OutfitStore } from './outfit-data/outfit-store';
import type { OutfitForm } from './outfit-form';

export const OUTFIT_ROUTES: Routes = [
  {
    path: '',
    providers: [ItemStore, WardrobeStore, OutfitStore],
    children: [
      {
        path: '',
        title: 'Mis outfits · Outify',
        loadComponent: () => import('./outfit-list').then((m) => m.OutfitList),
      },
      {
        path: 'new',
        title: 'Crear outfit · Outify',
        canDeactivate: [(component: OutfitForm) => component.canLeave()],
        loadComponent: () => import('./outfit-form').then((m) => m.OutfitForm),
      },
      {
        path: ':id/edit',
        title: 'Editar outfit · Outify',
        canDeactivate: [(component: OutfitForm) => component.canLeave()],
        loadComponent: () => import('./outfit-form').then((m) => m.OutfitForm),
      },
      {
        path: ':id',
        title: 'Mi outfit · Outify',
        loadComponent: () => import('./outfit-detail').then((m) => m.OutfitDetail),
      },
    ],
  },
];
