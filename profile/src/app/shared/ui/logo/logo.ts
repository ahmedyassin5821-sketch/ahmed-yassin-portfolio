import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import {
  AY_ARTBOARD_VIEWBOX,
  AY_MARK_PATH,
  AY_MARK_SMALL_VIEWBOX,
  AY_MARK_VIEWBOX,
  AY_SMALL_STROKE_WIDTH,
} from './logo-path';

export type LogoVariant = 'primary' | 'mark';

/**
 * The AY monogram.
 *
 * ## Inline, not <img>
 *
 * The SVG is inlined so it inherits `currentColor`, which resolves to
 * `--color-brand-mark`. An `<img src="ay-logo.svg">` cannot inherit a CSS
 * custom property, so it would need a baked-in fill — making the logo the single
 * element in the system with a hardcoded colour. The identical assets exist in
 * `public/brand/` for the cases that genuinely need a file (favicon, OG image).
 *
 * ## Automatic small-size variant
 *
 * The mark's hairlines are 2.6% of its height. Below roughly 48px they fall
 * under one device pixel and disappear. Rather than leave that to callers, this
 * component swaps in the stroke-expanded variant automatically once `size`
 * drops below the threshold — so a 24px logo is legible without anyone having to
 * know why.
 *
 * ## Accessibility
 *
 * Decorative by default. When the mark is the only content of a link (a header
 * home link, typically), pass `label` so it gets an accessible name.
 */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      [attr.height]="size()"
      [attr.stroke-width]="usesSmallVariant() ? strokeWidth : null"
      [attr.stroke]="usesSmallVariant() ? 'currentColor' : null"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-label]="label() || null"
      fill="currentColor"
      stroke-linejoin="miter"
      stroke-miterlimit="4"
      focusable="false"
    >
      <path [attr.d]="path" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      /* Pure ink, reserved for the mark. Nothing else in the system is this
         dark, which is how "the logo stays the strongest visual element"
         becomes a token guarantee rather than a style guideline. */
      color: var(--color-brand-mark);
    }

    svg {
      width: auto;
      /* The monogram never mirrors. It is a Latin AY ligature: flipping it
         produces a broken letterform, so RTL must not touch it. */
      transform: none !important;
    }

    @media (forced-colors: active) {
      :host {
        color: CanvasText;
      }
    }
  `,
})
export class Logo {
  /**
   * `primary` keeps the source artboard and its designed clear space.
   * `mark` crops tight to the glyph, for optical alignment against text.
   */
  readonly variant = input<LogoVariant>('mark');

  /** Rendered height in px. Width follows the mark's own aspect ratio. */
  readonly size = input<number>(48);

  /** Accessible name. Omit when the logo sits beside a visible wordmark. */
  readonly label = input<string>('');

  protected readonly path = AY_MARK_PATH;
  protected readonly strokeWidth = AY_SMALL_STROKE_WIDTH;

  /** See the class comment: below ~48px the true hairlines stop rendering. */
  protected readonly usesSmallVariant = computed(() => this.size() < 48);

  protected readonly viewBox = computed(() => {
    if (this.usesSmallVariant()) return AY_MARK_SMALL_VIEWBOX;
    return this.variant() === 'primary' ? AY_ARTBOARD_VIEWBOX : AY_MARK_VIEWBOX;
  });
}
