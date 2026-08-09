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
    loadComponent: () => import('./features/work/work').then((m) => m.Work),
    title: 'Work — Ahmed Yassin',
  },
  {
    // `slug` binds straight to WorkDetail's required input through
    // withComponentInputBinding(). The set is finite and known at build time, so
    // every one of these prerenders — see app.routes.server.ts.
    path: 'work/:slug',
    loadComponent: () => import('./features/work/work-detail/work-detail').then((m) => m.WorkDetail),
    title: 'Project — Ahmed Yassin',
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
