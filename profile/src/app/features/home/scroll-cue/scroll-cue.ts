import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';

import { localizedContent } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { HomeProgress } from '../animation/home-progress';

/** Progress past which the reader has clearly understood, and the cue is retired. */
const SPENT_AT = 0.05;

/**
 * "Scroll to explore", at the foot of the hero.
 *
 * ## It creates no second scroll system
 *
 * There is exactly one scroll listener on this page — the choreography's single
 * ScrollTrigger — and it already publishes everything needed as `HomeProgress`. This
 * reads that. The *fade* is not even done here: `--home-progress` is already on the
 * stage as a custom property, so the opacity ramp is a CSS expression in the
 * stylesheet, computed per frame by the compositor with no change detection at all.
 *
 * What this component contributes is the one thing CSS cannot express: a latch.
 *
 * ## Why a latch
 *
 * A pure function of scroll position is symmetric — scroll back to the top and the
 * cue returns, telling a reader who has already been through the corridor to start
 * again. So `spent` is one-way: once progress passes `SPENT_AT` it never goes back,
 * for the lifetime of the page. Reloading is a new visit and shows it again, which
 * is right; the reader is at the top with an unscrolled hero.
 *
 * ## Why it is absent under reduced motion
 *
 * The cue is only rendered by `home.html` inside the staged experience. Under
 * reduced motion the choreography never starts, so `HomeProgress` stays at 0
 * forever — a cue driven by it could never retire and would sit there permanently
 * over a page that is an ordinary scrolling document and needs no instruction. The
 * honest answer is not a frozen indicator but no indicator.
 */
@Component({
  selector: 'app-scroll-cue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './scroll-cue.html',
  styleUrl: './scroll-cue.scss',
  host: {
    // Hidden from assistive technology once spent, and inert throughout: it is an
    // instruction to a sighted reader about a gesture, not content.
    'aria-hidden': 'true',
    '[class.is-spent]': 'spent()',
  },
})
export class ScrollCue {
  private readonly progress = inject(HomeProgress);
  private readonly c = localizedContent(HOME_CONTENT.hero);

  protected readonly label = computed(() => this.c().scrollHint);

  private readonly _spent = signal(false);

  /** One-way: set once and never cleared, so the cue cannot come back. */
  protected readonly spent = this._spent.asReadonly();

  constructor() {
    // An effect, not a computed. A computed must be pure — writing the latch inside
    // one throws — and this is precisely a write in response to a read.
    effect(() => {
      if (this.progress.scroll() > SPENT_AT) this._spent.set(true);
    });
  }
}
