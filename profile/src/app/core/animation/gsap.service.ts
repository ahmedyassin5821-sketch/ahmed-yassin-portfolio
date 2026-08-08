import { Injectable, inject } from '@angular/core';

import { isBrowser } from '../platform/is-browser';
import { MotionPreferenceService } from '../platform/motion-preference.service';

/** What callers receive once GSAP has loaded. */
export interface GsapBundle {
  readonly gsap: typeof import('gsap').gsap;
  readonly ScrollTrigger: typeof import('gsap/ScrollTrigger').ScrollTrigger;
}

/**
 * Lazy GSAP loader.
 *
 * GSAP plus ScrollTrigger is roughly 45KB gzipped — real weight for a library
 * that only earns its place once someone starts scrolling. Loading it through a
 * dynamic import keeps it out of the initial bundle entirely; nothing in the
 * critical path imports this module's dependencies statically.
 *
 * The promise is memoised, so a page with several animated sections still
 * fetches and registers the plugin exactly once.
 *
 * Returns `null` rather than throwing when GSAP should not run — on the server,
 * or under `prefers-reduced-motion`. Callers treat that as "no choreography" and
 * render their final state, which is what makes the animation layer removable.
 */
@Injectable({ providedIn: 'root' })
export class GsapService {
  private readonly browser = isBrowser();
  private readonly motion = inject(MotionPreferenceService);

  private pending: Promise<GsapBundle | null> | null = null;

  /**
   * Loads GSAP and registers ScrollTrigger. Safe to call repeatedly.
   *
   * @returns the bundle, or `null` when animation must not run.
   */
  load(): Promise<GsapBundle | null> {
    if (!this.browser || this.motion.prefersReduced()) return Promise.resolve(null);

    this.pending ??= (async () => {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      gsap.registerPlugin(ScrollTrigger);
      return { gsap, ScrollTrigger };
    })();

    return this.pending;
  }

  /**
   * Horizontal distance that follows reading direction.
   *
   * GSAP's `x` is physical, so a positive value moves right in both directions —
   * which is wrong in RTL. Every horizontal tween in the app routes through
   * here so the mistake cannot be made per-component.
   */
  static dirX(distance: number, isRtl: boolean): number {
    return isRtl ? -distance : distance;
  }
}
