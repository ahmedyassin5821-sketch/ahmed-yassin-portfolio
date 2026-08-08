import { DestroyRef, Injectable, inject } from '@angular/core';

import { GsapService } from '@core/animation/gsap.service';
import { isBrowser } from '@core/platform/is-browser';
import { HomeProgress } from './home-progress';

export interface ChoreographyTargets {
  /** The element whose scroll span drives the whole narrative. */
  readonly narrative: HTMLElement;
  /** Platform rows; whichever is in view sets the active act. */
  readonly acts: readonly HTMLElement[];
}

/**
 * All Home scroll choreography, in one place.
 *
 * ## Why GSAP is used here and nowhere else
 *
 * Section entrances are handled by the existing `appReveal` directive —
 * IntersectionObserver, already tested, zero additional bytes. Reimplementing
 * them in GSAP would add a dependency to do a job that was already done.
 *
 * What IntersectionObserver genuinely cannot do is report *continuous* scroll
 * position, and that is the one thing the WebGL scene needs. So GSAP's entire
 * remit is the scrub below: one ScrollTrigger converting scroll into a
 * normalised 0→1 signal. That is the whole DOM↔WebGL contract.
 *
 * Everything is registered inside `gsap.context()` scoped to the narrative
 * element and reverted through `DestroyRef`. Leaked ScrollTriggers are the
 * classic GSAP-in-SPA defect; the context makes cleanup structural.
 *
 * If GSAP does not load — server, reduced motion, failed fetch — `setup()`
 * resolves having done nothing, the progress signal stays at 0, and the scene
 * (which will not exist in those cases anyway) is never asked for anything.
 */
@Injectable()
export class HomeChoreography {
  private readonly gsapService = inject(GsapService);
  private readonly progress = inject(HomeProgress);
  private readonly destroyRef = inject(DestroyRef);
  private readonly browser = isBrowser();

  private context: { revert: () => void } | null = null;

  async setup(targets: ChoreographyTargets): Promise<void> {
    if (!this.browser) return;

    const bundle = await this.gsapService.load();
    // null means SSR or reduced motion. Sections keep their resting CSS state,
    // which is their final state, so the page is complete either way.
    if (!bundle) return;

    const { gsap, ScrollTrigger } = bundle;

    this.context = gsap.context(() => {
      // The narrative scrub — the only thing the WebGL scene ever reads.
      // Native scroll drives it; nothing is pinned and nothing is hijacked.
      ScrollTrigger.create({
        trigger: targets.narrative,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: (self) => this.progress.set(self.progress),
      });

      // Which platform stratum the reader is level with.
      for (const [index, element] of targets.acts.entries()) {
        ScrollTrigger.create({
          trigger: element,
          start: 'top 60%',
          end: 'bottom 40%',
          onEnter: () => this.progress.setAct(index),
          onEnterBack: () => this.progress.setAct(index),
        });
      }
    }, targets.narrative);

    this.destroyRef.onDestroy(() => this.dispose());
  }

  private dispose(): void {
    this.context?.revert();
    this.context = null;
    this.progress.reset();
  }
}
