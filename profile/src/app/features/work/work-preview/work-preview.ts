import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { MediaPlaceholder } from '@shared/ui/media-placeholder/media-placeholder';

export interface WorkPreviewData {
  readonly slug: string;
  readonly name: string;
  readonly category: string;
  readonly image: {
    readonly src: string;
    readonly srcset: string | null;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  } | null;
}

/**
 * The sticky pane beside the work index.
 *
 * ## Why it exists
 *
 * A typographic index of seven projects is only a portfolio if the work is
 * visible. This pane is what stops the archive reading as a table of contents:
 * the reader moves down a column of names and the corresponding screenshot
 * holds beside it.
 *
 * ## It is an enhancement, never the content
 *
 * The pane shows whichever project is active, defaulting to the first — so with
 * JavaScript unavailable, or before hydration, it still shows real work rather
 * than an empty frame. Every image it can show also exists on its own row below
 * `md`, and every project is reachable as a link regardless.
 *
 * Decorative by contract: `aria-hidden`. The name, category and stack of every
 * project are real text in the rows beside it, so nothing here is the only copy
 * of anything.
 */
@Component({
  selector: 'app-work-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MediaPlaceholder],
  templateUrl: './work-preview.html',
  styleUrl: './work-preview.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class WorkPreview {
  /** Every project, so switching is a class change rather than a new request. */
  readonly projects = input.required<readonly WorkPreviewData[]>();

  /** Slug of the project currently being shown. */
  readonly activeSlug = input.required<string>();

  readonly placeholderLabel = input<string>('');

  /** The pane occupies roughly a third of the page at its widest. */
  protected readonly sizes = '(min-width: 64rem) 34vw, 40vw';
}
