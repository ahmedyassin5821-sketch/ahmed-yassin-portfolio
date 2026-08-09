import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MediaPlaceholder } from '@shared/ui/media-placeholder/media-placeholder';

export interface WorkRowData {
  readonly slug: string;
  readonly name: string;
  /** "E-commerce / Electronics" — what the product is. */
  readonly category: string;
  /** "Magento · Porto" — what it was built with. */
  readonly stack: string;
  /**
   * Why there is no link, when there is none.
   *
   * `live` has a public address; `private` is an internal system; `pending` is
   * work whose address has not been supplied yet. Collapsing the last two into
   * one label misrepresents both.
   */
  readonly linkStatus: 'live' | 'private' | 'pending';
  readonly image: {
    readonly src: string;
    readonly srcset: string | null;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  } | null;
}

/**
 * One row of the work index.
 *
 * ## Why a row and not a card
 *
 * `/work` is an archive, and an archive reads as a list. The previous treatment
 * gave every project an identical bordered box in a two-column grid, which made
 * seven pieces of work look like seven database records. Here the project name
 * carries the row at display scale, the number sits in its own column, and the
 * only rules are the hairlines *between* rows — no box, no pills, no chip.
 *
 * The whole row is one link. The link wraps only the name and is stretched by a
 * pseudo-element, so the accessible name stays "NAS HR" rather than swallowing
 * the category, the stack and the link marker into one unreadable label.
 *
 * ## Its image
 *
 * Above `md` the row reports hover/focus upward and a sticky pane shows the
 * image; below `md` there is no room for a pane, so the row renders the image
 * itself. Both paths use the same data — the pane is an enhancement, never the
 * only way to see the work.
 */
@Component({
  selector: 'app-work-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MediaPlaceholder],
  templateUrl: './work-row.html',
  styleUrl: './work-row.scss',
  host: {
    '[class.is-active]': 'active()',
  },
})
export class WorkRow {
  readonly project = input.required<WorkRowData>();
  readonly index = input<number>(0);

  /** Marked when this row is the one the preview pane is showing. */
  readonly active = input<boolean>(false);

  /** Keyed by `linkStatus`, so the row never decides what the states mean. */
  readonly statusLabels = input<Record<string, string>>({});
  readonly viewLabel = input<string>('');
  readonly placeholderLabel = input<string>('');

  /** Raised on pointer or keyboard focus so the pane can follow the reader. */
  readonly focused = output<string>();

  protected readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));

  protected readonly statusLabel = computed(
    () => this.statusLabels()[this.project().linkStatus] ?? '',
  );

  /** Inline image only exists below `md`, where it spans the measure. */
  protected readonly sizes = '(min-width: 48rem) 40vw, 92vw';
}
