import { Routes } from '@angular/router';
import { ServerRoute } from '@angular/ssr';

/**
 * Production stand-in for `dev.routes.ts`, wired via angular.json
 * `fileReplacements`.
 *
 * Both arrays are empty by design: that severs the only path to the
 * design-system playground so the bundler removes it from the production output,
 * and it drops the playground's server route so the URL falls through to the
 * catch-all and correctly answers 404.
 *
 * Do not add routes here.
 */
export const DEV_ROUTES: Routes = [];

export const DEV_SERVER_ROUTES: ServerRoute[] = [];
