import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { MediaPlaceholder } from '@shared/ui/media-placeholder/media-placeholder';

export interface ProjectFigureData {
  readonly slug: string;
  readonly name: string;
  /** "Coffee · E-commerce" — what the product is. */
  readonly category: string;
  /** "Shopify · Dashboard" — what it was built with. */
  readonly stack: string;
  readonly url: string | null;
  readonly image: {
    readonly src: string;
    readonly srcset: string | null;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  } | null;
}

/**
 * One project, presented as a plate in a portfolio rather than a record in a
 * grid.
 *
 * ## Why this replaced the card
 *
 * The previous treatment rendered every project into an identical bordered box,
 * two across. Six identical boxes read as a CMS listing: the eye finds no entry
 * point, and nothing signals that these are *selected* pieces rather than a
 * complete table.
 *
 * This gives each project an oversized index numeral, a name at display scale,
 * and its category as a line of its own — so the hierarchy is
 * number → name → category → stack, and a reader takes in "Coffee · E-commerce,
 * Shopify" in one glance without reading a paragraph.
 *
 * `variant` is what makes a gate a composition instead of a row: one project
 * leads at a larger size and the others support it. `align` flips which side the
 * media sits on, so consecutive gates alternate rather than repeat.
 */
@Component({
  selector: 'app-project-figure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaPlaceholder],
  templateUrl: './project-figure.html',
  styleUrl: './project-figure.scss',
  host: {
    '[class]': "'figure--' + variant() + ' figure--' + align()",
  },
})
export class ProjectFigure {
  readonly project = input.required<ProjectFigureData>();

  /** Position in the whole showcase, for the editorial numeral. */
  readonly index = input<number>(0);

  /** The lead project of a gate is larger and sets the composition. */
  readonly variant = input<'lead' | 'support'>('support');

  /** Which side the media sits on. Logical — mirrors in RTL. */
  readonly align = input<'start' | 'end'>('start');

  readonly placeholderLabel = input<string>('');

  /** Announced on the link, so it is not read as a bare project name. */
  readonly viewLabel = input<string>('');

  protected readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));

  /**
   * A lead plate is shown at roughly half the viewport, a support plate at a
   * third. Stating that lets the browser choose the 800px variant instead of
   * fetching 1600px it cannot use.
   */
  protected readonly sizes = computed(() =>
    this.variant() === 'lead'
      ? '(min-width: 64rem) 52vw, 92vw'
      : '(min-width: 64rem) 30vw, 92vw',
  );
}
