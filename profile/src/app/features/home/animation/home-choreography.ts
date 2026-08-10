import { DestroyRef, Injectable, inject } from '@angular/core';

import { GsapService } from '@core/animation/gsap.service';
import { isBrowser } from '@core/platform/is-browser';
import { ViewportService } from '@core/platform/viewport.service';
import { HomeProgress } from './home-progress';

export interface ChoreographyTargets {
  /**
   * The outer element whose scroll span drives the narrative. Its height is the
   * travel; the stage inside it is what sticks.
   */
  readonly stage: HTMLElement;
}

/**
 * Desktop travels further than mobile — the mobile choreography settles at each
 * gate rather than gliding, so it needs less distance to say the same thing, and
 * a phone should not have to scroll fourteen screens to reach the footer.
 *
 * Raised from 12/7 when the gates gained their four-beat sequence. Each gate now
 * owns roughly a fifth of the scroll and plays four beats inside it; at the old
 * distance a beat lasted under half a screen, which is fast enough that the
 * platform name and the screenshots read as arriving together — the exact
 * confusion the beats exist to remove.
 */
const TRAVEL_SCREENS = { desktop: 14, mobile: 9 } as const;

/**
 * All Home scroll choreography, in one place.
 *
 * ## Exactly one ScrollTrigger
 *
 * It reports scroll position. It does not animate anything. There are no GSAP
 * tweens in this project by design: every visual result is derived from the one
 * progress value — by the scene, which is a pure function of it, and by CSS,
 * which reads it from a custom property.
 *
 * That is what keeps a large choreography understandable. Fifteen triggers each
 * owning a fragment of the motion is how scroll work becomes unmaintainable and
 * how the text ends up disagreeing with the scene.
 *
 * ## Why the hold is CSS `position: sticky`, not GSAP `pin`
 *
 * They look identical to the reader; they are not identical to the application.
 * GSAP's pin wraps the element in a generated spacer and switches it to fixed
 * positioning at runtime. This app has three standing constraints that punish
 * that: the router restores scroll position on back-navigation, incremental
 * hydration means a `@defer` subtree can hydrate *after* a pin was measured, and
 * the sticky header depends on no ancestor becoming a scroll container.
 *
 * A sticky stage over a tall spacer has none of those failure modes, is layout
 * stable at first paint, and needs no `refresh()` after fonts load. GSAP keeps
 * the job it is genuinely best at: reading scroll accurately.
 *
 * ## The CSS custom property
 *
 * DOM motion is driven by writing `--home-progress` once per update. One style
 * write, and every act's stylesheet derives its own transform from it. The
 * alternative — a tween per element — would multiply work per frame for no gain,
 * and under zoneless change detection the single signal write is what keeps this
 * off the change-detection path entirely.
 *
 * ## If GSAP never loads
 *
 * Server, reduced motion, or a failed fetch: `setup()` resolves having done
 * nothing. `.is-staged` is never added, so the spacer collapses and the stage
 * un-sticks — the page becomes an ordinary vertical document with every act
 * readable in order. The fallback is the absence of this class, not a separate
 * code path that could rot.
 */
@Injectable()
export class HomeChoreography {
  private readonly gsapService = inject(GsapService);
  private readonly progress = inject(HomeProgress);
  private readonly viewport = inject(ViewportService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isBrowser();

  private context: { revert: () => void } | null = null;
  private stage: HTMLElement | null = null;

  async setup(targets: ChoreographyTargets): Promise<void> {
    if (!this.browser) return;

    const bundle = await this.gsapService.load();
    if (!bundle) return;

    const { gsap, ScrollTrigger } = bundle;
    this.stage = targets.stage;

    // Only now is the tall spacer applied. Adding it before this point would
    // open a scroll void on every path where the choreography never starts.
    //
    // The screen count is written as a custom property rather than duplicated in
    // the stylesheet, so the CSS height and the trigger's travel below are two
    // readings of one number instead of two constants that can drift apart.
    targets.stage.style.setProperty('--home-screens', String(this.screens()));
    targets.stage.classList.add('is-staged');
    this.write(0);

    this.context = gsap.context(() => {
      ScrollTrigger.create({
        trigger: targets.stage,
        start: 'top top',
        // Read as a function so a resize recomputes it rather than keeping a
        // stale pixel value from whichever viewport happened to load first.
        end: () => `+=${this.travel()}`,
        // Deliberately no `scrub`. Scrub exists to smooth an *attached
        // animation*, and there is none here — this trigger only reports a
        // number. Smoothing belongs where the motion is: the scene damps toward
        // the target in its own loop, and CSS transitions handle the DOM.
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          this.progress.set(self.progress);
          this.write(self.progress);
        },
      });
    }, targets.stage);

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private screens(): number {
    return this.viewport.isDesktop() ? TRAVEL_SCREENS.desktop : TRAVEL_SCREENS.mobile;
  }

  /**
   * How far the sticky viewport actually travels, in pixels.
   *
   * One screen shorter than the stage's height: a sticky element releases when
   * its container's *bottom* reaches the viewport bottom, so a stage `n` screens
   * tall holds for `n − 1`. Using the full height here would leave progress
   * short of 1 by a whole screen and the final act would never resolve.
   */
  private travel(): number {
    return globalThis.innerHeight * (this.screens() - 1);
  }

  /**
   * The only DOM write in the choreography.
   *
   * Rounded to four decimals because a custom property change invalidates style
   * for the subtree, and float noise at the 15th decimal would do that on frames
   * where nothing has visibly moved.
   */
  private write(value: number): void {
    this.stage?.style.setProperty('--home-progress', value.toFixed(4));
  }

  private dispose(): void {
    this.context?.revert();
    this.context = null;
    this.stage?.classList.remove('is-staged');
    this.stage?.style.removeProperty('--home-progress');
    this.stage = null;
    this.progress.reset();
  }
}
