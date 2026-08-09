import { RenderMode, ServerRoute } from '@angular/ssr';

import { DEV_SERVER_ROUTES } from './dev/dev.routes';

/**
 * Server render modes.
 *
 * Known routes are prerendered to static HTML at build time (ARCHITECTURE.md
 * ADR-006), so the site can sit behind a CDN and the Node server is left
 * handling only what genuinely needs a request: the future locale redirect, 404
 * status, and the contact endpoint.
 *
 * ## Every real route must be declared here
 *
 * The final `'**'` entry answers 404, and it matches any path this file has not
 * been told about. A real route left undeclared therefore renders its content
 * correctly while returning 404 — which is invisible in a browser and very
 * visible to a crawler. Add an entry whenever a route is added.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },

  // Shell routes. Prerendered because the set is finite and known at build time.
  // Each MUST be listed: without an entry it falls through to the `**` rule below
  // and answers 404 while still rendering its content correctly.
  { path: 'work', renderMode: RenderMode.Prerender },
  {
    // Six known slugs, so the whole set becomes static HTML at build time. The
    // params come from the dataset rather than a hand-maintained list, which is
    // what stops a new project from silently rendering with a 404 status.
    path: 'work/:slug',
    renderMode: RenderMode.Prerender,
    async getPrerenderParams() {
      const { PROJECTS } = await import('./data/projects.data');
      return PROJECTS.map((project) => ({ slug: project.slug }));
    },
  },
  { path: 'about', renderMode: RenderMode.Prerender },
  { path: 'cv', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },

  // Empty in production — see dev/dev.routes.prod.ts.
  ...DEV_SERVER_ROUTES,

  {
    // Genuinely unknown paths. Unbounded, so there is no finite set to
    // prerender; rendered on demand instead, which is what makes the not-found
    // page real server HTML rather than an empty shell.
    path: '**',
    renderMode: RenderMode.Server,
    // A not-found page answering 200 tells crawlers the URL is real, which is how
    // dead links get indexed. RenderMode.Prerender cannot carry a status — the
    // type omits it — which is the second reason this is server-rendered.
    status: 404,
    headers: {
      'X-Robots-Tag': 'noindex',
    },
  },
];
