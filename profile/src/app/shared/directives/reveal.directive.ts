import {
  DestroyRef,
  Directive,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';

import { MotionPreferenceService } from '@core/platform/motion-preference.service';

/**
 * Scroll-triggered entrance.
 *
 * Deliberately built on `IntersectionObserver` rather than GSAP/ScrollTrigger:
 * a one-shot entrance needs no timeline and no scrub, so a 45KB dependency
 * would serve nothing. GSAP arrives in Sprint 3 for scrubbed choreography.
 *
 * ## Content is never held hostage to this
 *
 * The staged state lives at `.js [data-reveal]` in styles/_motion.scss. The
 * `js` class is added by an inline script in index.html, so if scripting is
 * unavailable the selector never matches and content is simply visible. Nothing
 * is ever stranded at `opacity: 0`.
 *
 * Under `prefers-reduced-motion` the element is marked shown immediately and no
 * observer is constructed at all.
 *
 * Do not apply this to an LCP element — the brand system forbids animating it.
 *
 * @example
 * <p appReveal>Fades up once.</p>
 * <li appReveal [revealIndex]="i">Staggered by 40ms per item.</li>
 */
@Directive({
  selector: '[appReveal]',
  host: {
    '[attr.data-reveal]': 'state()',
    '[style.--reveal-delay]': 'delayMs()',
  },
})
export class RevealDirective {
  /** Position in a list. Drives the stagger; leave unset for a single element. */
  readonly revealIndex = input<number, unknown>(0, { transform: numberAttribute });

  /** Per-item stagger. 40ms matches the brand system's motion spec. */
  readonly revealStagger = input<number, unknown>(40, { transform: numberAttribute });

  /** Fraction of the element that must be visible before it reveals. */
  readonly revealThreshold = input<number, unknown>(0.15, { transform: numberAttribute });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly motion = inject(MotionPreferenceService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly revealed = signal(false);

  /**
   * `''` = staged, `'shown'` = revealed. On the server this is always `''`, and
   * because `.js` is absent from server HTML the staged styles never apply.
   */
  protected readonly state = computed(() => (this.revealed() ? 'shown' : ''));

  protected readonly delayMs = computed(() =>
    this.revealed() || this.revealIndex() === 0
      ? '0ms'
      : `${this.revealIndex() * this.revealStagger()}ms`,
  );

  constructor() {
    // afterNextRender never runs on the server and runs post-paint in the
    // browser, so measurement and observation cannot block first paint.
    afterNextRender(() => {
      if (this.motion.prefersReduced() || typeof IntersectionObserver === 'undefined') {
        this.revealed.set(true);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            this.revealed.set(true);
            // One-shot. Re-animating on scroll-back is the fastest way to make
            // a page feel cheap, so the observer disconnects on first hit.
            observer.disconnect();
          }
        },
        {
          threshold: this.revealThreshold(),
          // Start slightly before the element enters, so the motion reads as
          // "already arriving" rather than "triggered by the scroll".
          rootMargin: '0px 0px -8% 0px',
        },
      );

      observer.observe(this.host.nativeElement);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}

function numberAttribute(value: unknown): number {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : 0;
}
