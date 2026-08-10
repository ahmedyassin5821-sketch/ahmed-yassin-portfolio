import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface WorkPreviewData {
  readonly slug: string;
  readonly name: string;
  readonly field: string;
  readonly image: {
    readonly src: string;
    readonly srcset: string | null;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  };
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
 * ## Why it has to stick, properly
 *
 * The first version was `position: sticky` inside a grid item that was sized to
 * its own content, which gives sticky zero travel — so hovering the sixth
 * project changed an image that had left the viewport five rows earlier. The
 * host now stretches to the height of the index beside it (see the stylesheet),
 * which is what makes the pane stay in view for the whole list.
 *
 * ## It is an enhancement, never the content
 *
 * The pane shows whichever project is active, defaulting to the first — so with
 * JavaScript unavailable, or before hydration, it still shows real work rather
 * than an empty frame. Every image it can show also exists on its own row below
 * `md`, and every project is reachable as a link regardless.
 *
 * Decorative by contract: `aria-hidden`. The name, field, market and stack of
 * every project are real text in the rows beside it, so nothing here is the only
 * copy of anything — including the caption, which repeats the row it points at.
 */
@Component({
  selector: 'app-work-preview',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  /** Falls back to the first project, which is also what the pane shows. */
  protected readonly active = computed(
    () => this.projects().find((p) => p.slug === this.activeSlug()) ?? this.projects()[0] ?? null,
  );

  /** The pane occupies roughly a third of the page at its widest. */
  protected readonly sizes = '(min-width: 64rem) 34vw, 40vw';
}
