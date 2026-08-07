import { Routes } from '@angular/router';

import { DEV_ROUTES } from './dev/dev.routes';

export const routes: Routes = [
  {
    path: '',
    // Eager, not lazy. This is the LCP page; a loadChildren round-trip buys
    // nothing against prerendered HTML.
    loadComponent: () => import('./placeholder/placeholder').then((m) => m.Placeholder),
    title: 'Ahmed Yassin — Front-End & eCommerce Engineer',
  },

  // Development-only. In a production build angular.json swaps dev.routes.ts
  // for dev.routes.prod.ts (an empty array), so the playground and every
  // component it imports tree-shake out entirely rather than shipping behind a
  // runtime flag.
  ...DEV_ROUTES,

  {
    path: '**',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
    title: 'Page not found — Ahmed Yassin',
  },
];
