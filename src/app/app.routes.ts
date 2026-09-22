import { inject } from '@angular/core';
import { Router, Routes, RedirectFunction } from '@angular/router';
import { sessionGuard } from './platform/session';
const legacyRedirect =
  (path: string, item = false): RedirectFunction =>
  ({ params, queryParams }) => {
    const { armario: legacyWardrobe, zona: legacyZone, ...remaining } = queryParams;
    return inject(Router).createUrlTree(item ? [path, params['id']] : [path], {
      queryParams: {
        ...remaining,
        ...(legacyWardrobe ? { wardrobe: legacyWardrobe } : {}),
        ...(legacyZone ? { zone: legacyZone } : {}),
      },
    });
  };
export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Outify · Un lugar para cada prenda',
    loadComponent: () => import('./public/landing').then((m) => m.Landing),
  },
  {
    path: 'en',
    title: 'Outify · Know what you own',
    data: { language: 'en' },
    loadComponent: () => import('./public/landing').then((m) => m.Landing),
  },
  {
    path: 'privacy',
    title: 'Privacidad · Outify',
    data: { document: 'privacy' },
    loadComponent: () => import('./public/legal').then((m) => m.Legal),
  },
  {
    path: 'terms',
    title: 'Condiciones · Outify',
    data: { document: 'terms' },
    loadComponent: () => import('./public/legal').then((m) => m.Legal),
  },
  { path: 'armarios', pathMatch: 'full', redirectTo: legacyRedirect('/wardrobes') },
  { path: 'articulos/nuevo', pathMatch: 'full', redirectTo: legacyRedirect('/items/new') },
  { path: 'articulos/:id', pathMatch: 'full', redirectTo: legacyRedirect('/items', true) },
  { path: 'articulos', pathMatch: 'full', redirectTo: legacyRedirect('/items') },
  { path: 'acceso', pathMatch: 'full', redirectTo: 'login' },
  { path: 'cuenta', pathMatch: 'full', redirectTo: 'account' },
  {
    path: 'login',
    title: 'Bienvenido · Outify',
    loadComponent: () => import('./platform/login').then((m) => m.Login),
  },
  { path: 'auth/callback', loadComponent: () => import('./platform/login').then((m) => m.Login) },
  {
    path: '',
    canActivate: [sessionGuard],
    loadComponent: () => import('./platform/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'wardrobes' },
      {
        path: 'wardrobes',
        loadChildren: () => import('./wardrobes/wardrobes.routes').then((m) => m.WARDROBE_ROUTES),
      },
      {
        path: 'items',
        loadChildren: () => import('./inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'account',
        title: 'Mi cuenta · Outify',
        loadComponent: () => import('./account/account').then((m) => m.Account),
      },
    ],
  },
  { path: '**', redirectTo: 'wardrobes' },
];
