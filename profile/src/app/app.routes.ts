import { Routes } from '@angular/router';

import { DEV_ROUTES } from './dev/dev.routes';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
    // Kept in step with PROFESSIONAL_TITLE.en by hand: a route `title` is a plain
    // string the router reads before any injector exists.
    title: 'Ahmed Yassin — Front-End Web Developer',
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
    loadComponent: () => import('./features/about/about').then((m) => m.About),
    title: 'About — Ahmed Yassin',
  },
  {
    path: 'cv',
    loadComponent: () => import('./features/cv/cv').then((m) => m.Cv),
    title: 'CV — Ahmed Yassin',
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then((m) => m.Contact),
    title: 'Contact — Ahmed Yassin',
  },

  // Development-only. In a production build angular.json swaps dev.routes.ts
  // for dev.routes.prod.ts (an empty array), so the playground and every
  // component it imports tree-shake out entirely rather than shipping behind a
  // runtime flag.
  ...DEV_ROUTES,

  {
    /**
     * The not-found page at a real address, so it can be prerendered.
     *
     * A static host has no Angular engine to render `'**'` on demand: GitHub Pages
     * answers an unknown path by serving `404.html` with a 404 status. That file has
     * to exist on disk, so this route gives the not-found page a concrete path to be
     * prerendered at, and the deploy step copies the result to `404.html`.
     *
     * Not a redirect target and not linked from anywhere — `'**'` below still
     * handles unknown paths in the browser and on the Node server.
     */
    path: '404',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
    title: 'Page not found — Ahmed Yassin',
  },
  {
    path: '**',
    loadComponent: () => import('./not-found/not-found').then((m) => m.NotFound),
    title: 'Page not found — Ahmed Yassin',
  },
];
