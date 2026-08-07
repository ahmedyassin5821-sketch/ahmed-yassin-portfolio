import { Routes } from '@angular/router';
import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Development-only routes.
 *
 * angular.json replaces this file with `dev.routes.prod.ts` in the production
 * configuration. Because the playground is reachable ONLY through the dynamic
 * import below, replacing this array with an empty one makes the playground —
 * and every component it pulls in — unreachable, so the bundler drops it. That
 * is why this is a fileReplacement rather than an `isDevMode()` check: a runtime
 * flag would still ship the code.
 */
export const DEV_ROUTES: Routes = [
  {
    path: 'dev/design-system',
    loadComponent: () => import('./design-system/design-system').then((m) => m.DesignSystem),
    title: 'Design System — Ahmed Yassin',
  },
];

/**
 * Server render modes for the routes above.
 *
 * These must be declared, not left to the catch-all. `app.routes.server.ts` ends
 * with `'**' → status: 404`, and that catch-all matches any path it has not been
 * told about — so an undeclared real route renders correctly but answers 404.
 *
 * Exported from this file (rather than written inline in app.routes.server.ts)
 * so the production fileReplacement remains the single switch that removes the
 * playground from every part of the build at once.
 */
export const DEV_SERVER_ROUTES: ServerRoute[] = [
  {
    path: 'dev/design-system',
    // Rendered on demand rather than prerendered: it is a dev tool, and there is
    // no reason to spend build time generating it.
    renderMode: RenderMode.Server,
    headers: { 'X-Robots-Tag': 'noindex' },
  },
];
