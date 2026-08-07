import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import {
  provideClientHydration,
  withEventReplay,
  withIncrementalHydration,
} from '@angular/platform-browser';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    // Zoneless. There is no zone.js in this app at all, which is why the
    // animation layer is affordable: rAF-driven work (scroll reveals now, GSAP
    // later) triggers no change detection whatsoever.
    provideZonelessChangeDetection(),

    provideRouter(
      routes,
      // Binds route params/data straight into signal inputs.
      withComponentInputBinding(),
      // Back must restore scroll position, and in-page anchors must work.
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'enabled',
      }),
      // Native View Transitions — shared-element page transitions for no JS
      // cost. Suppressed under prefers-reduced-motion by a CSS guard in
      // styles/_motion.scss rather than by branching here.
      withViewTransitions({ skipInitialTransition: true }),
    ),

    provideClientHydration(
      // Replays clicks that land before hydration finishes instead of dropping
      // them — the difference between "feels broken" and "feels instant".
      withEventReplay(),
      // Lets @defer blocks hydrate on their own trigger rather than all at once.
      withIncrementalHydration(),
      // NOTE: withI18nSupport() joins this list in Sprint 3, alongside
      // @angular/localize. Hydration of templates containing i18n blocks fails
      // without it, so the two must land together.
    ),
  ],
};
