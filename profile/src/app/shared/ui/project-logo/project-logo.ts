import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface ProjectLogoImage {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

/**
 * A client's real logo, in a slot the caller sizes.
 *
 * ## Why this is a component and not two copies of the same CSS
 *
 * The brand marquee on Home and the work index both show the same seven marks,
 * and both need the same two non-obvious rules: `object-fit: contain` (cropping a
 * wordmark clips the letters) and a dark ground for artwork that is
 * white-on-transparent.
 *
 * That second rule is the reason this exists. 2B's official mark fills its "2"
 * and underbar with white, so on the portfolio's warm-white paper it renders as
 * a floating orange "B". Recolouring a client's logo is not an option, so the
 * surface changes instead — and the decision about *which* logos need it lives
 * here, once, rather than as a `slug === '2b'` check in every consumer.
 *
 * ## Sizing
 *
 * `--logo-block-size`, `--logo-inline-size` and `--logo-padding`, so a caller
 * chooses the slot from its own stylesheet without this component growing a size
 * enum that every new consumer has to extend. The slot must stay definite in both
 * axes — the stylesheet explains why.
 *
 * Always decorative: every caller writes the project name beside it as real text
 * or as the link's accessible name, so announcing the logo too would only repeat
 * it.
 */
@Component({
  selector: 'app-project-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-logo.html',
  styleUrl: './project-logo.scss',
  host: {
    'aria-hidden': 'true',
    '[class.is-inverse]': 'needsDarkSurface()',
  },
})
export class ProjectLogo {
  readonly logo = input.required<ProjectLogoImage>();

  /** Identifies artwork that cannot sit on a light ground. */
  readonly slug = input.required<string>();

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
