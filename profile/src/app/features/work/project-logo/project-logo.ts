import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

export interface ProjectLogoImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

/**
 * A client logo in a fixed chip.
 *
 * ## Why this is a component and not two copies of the same CSS
 *
 * The card grid and the detail page both show a logo, and both need the same
 * two non-obvious rules: `object-fit: contain` (cropping a wordmark clips the
 * letters) and a dark ground for artwork that is white-on-transparent.
 *
 * That second rule is the reason this exists. 2B's official mark fills its "2"
 * and underbar with white, so on the portfolio's warm-white paper it renders as
 * a floating orange "B". Recolouring a client's logo is not an option, so the
 * surface changes instead — and the decision about *which* logos need it lives
 * here, once, rather than as a `slug === '2b'` check in every consumer.
 *
 * Always decorative: every caller writes the project name beside it as real
 * text, so announcing the logo too would only repeat it.
 */
@Component({
  selector: 'app-project-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-logo.html',
  styleUrl: './project-logo.scss',
  host: {
    'aria-hidden': 'true',
    '[class.is-inverse]': 'needsDarkSurface()',
    '[class.is-large]': 'large()',
  },
})
export class ProjectLogo {
  readonly logo = input.required<ProjectLogoImage>();

  /** Identifies artwork that cannot sit on a light ground. */
  readonly slug = input.required<string>();

  /**
   * The detail page shows a taller chip than the card grid.
   *
   * `booleanAttribute` so a bare `large` attribute works — without it the empty
   * string a bare attribute passes is rejected under strict templates.
   */
  readonly large = input(false, { transform: booleanAttribute });

  /**
   * Supplied as white-on-transparent artwork.
   *
   * A list rather than a flag on the project data: it is a fact about the asset
   * file, not about the project, and it is discovered by looking at the SVG.
   */
  private static readonly WHITE_ARTWORK = new Set(['2b']);

  protected readonly needsDarkSurface = computed(() =>
    ProjectLogo.WHITE_ARTWORK.has(this.slug()),
  );
}
