import { Routes } from '@angular/router';
import { ItemStore } from './item-data/item-store';
import { WardrobeStore } from '../wardrobes/wardrobe-data/wardrobe-store';
export const INVENTORY_ROUTES: Routes = [
  {
    path: '',
    providers: [ItemStore, WardrobeStore],
    children: [
      {
        path: '',
        title: 'Mis artículos · Outify',
        loadComponent: () => import('./item-list/item-list').then((m) => m.ItemList),
      },
      {
        path: 'nuevo',
        canDeactivate: [
          (component: import('./item-form/item-form').ItemForm) => component.canLeave(),
        ],
        title: 'Crear artículo · Outify',
        loadComponent: () => import('./item-form/item-form').then((m) => m.ItemForm),
      },
      {
        path: ':id',
        canDeactivate: [
          (component: import('./item-form/item-form').ItemForm) => component.canLeave(),
        ],
        title: 'Editar artículo · Outify',
        loadComponent: () => import('./item-form/item-form').then((m) => m.ItemForm),
      },
    ],
  },
];
