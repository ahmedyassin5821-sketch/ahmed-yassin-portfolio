import { Routes } from '@angular/router';

import { DEV_ROUTES } from './dev/dev.routes';

/**
 * Route data consumed by `RouteStub` through `withComponentInputBinding()`.
 *
 * Every entry below is scaffolding replaced by a real feature in a later sprint.
 * When that happens, swap `loadComponent` and drop the `data` block.
 */
const STUB = (heading: string, note: string) => ({
  loadComponent: () => import('./route-stub/route-stub').then((m) => m.RouteStub),
  data: { heading, note, eyebrow: 'Coming soon' },
});

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    title: 'Ahmed Yassin — Front-End & eCommerce Engineer',
  },
  {
    path: 'work',
    ...STUB('Work', 'Case studies across Magento 2, Angular, and Shopify arrive in a later sprint.'),
    title: 'Work — Ahmed Yassin',
  },
  {
    path: 'about',
    ...STUB('About', 'Background, experience, and approach arrive in a later sprint.'),
    title: 'About — Ahmed Yassin',
  },
  {
    path: 'cv',
    ...STUB('CV', 'The full CV, and a downloadable version, arrive in a later sprint.'),
    title: 'CV — Ahmed Yassin',
  },
  {
    path: 'contact',
    ...STUB('Contact', 'The contact form arrives with its endpoint in a later sprint.'),
    title: 'Contact — Ahmed Yassin',
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
