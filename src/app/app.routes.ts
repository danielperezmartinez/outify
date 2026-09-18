import { Routes } from '@angular/router';
import { sessionGuard } from './platform/session';
export const routes: Routes = [
  {
    path: 'acceso',
    title: 'Bienvenido · Outify',
    loadComponent: () => import('./platform/login').then((m) => m.Login),
  },
  { path: 'auth/callback', loadComponent: () => import('./platform/login').then((m) => m.Login) },
  {
    path: '',
    canActivate: [sessionGuard],
    loadComponent: () => import('./platform/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'armarios' },
      {
        path: 'armarios',
        loadChildren: () => import('./wardrobes/wardrobes.routes').then((m) => m.WARDROBE_ROUTES),
      },
      {
        path: 'articulos',
        loadChildren: () => import('./inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'cuenta',
        title: 'Mi cuenta · Outify',
        loadComponent: () => import('./account/account').then((m) => m.Account),
      },
    ],
  },
  { path: '**', redirectTo: 'armarios' },
];
