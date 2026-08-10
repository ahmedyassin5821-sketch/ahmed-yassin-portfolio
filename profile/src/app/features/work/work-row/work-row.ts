import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface WorkRowData {
  readonly slug: string;
  readonly name: string;
  /** The industry — "Coffee / Food & Beverage". */
  readonly field: string;
  /** "Egypt · Coffee e-commerce" — where it trades and what kind of product it is. */
  readonly context: string;
  /** "Magento · Porto" — what it was built with. */
  readonly stack: string;
  /**
   * Whether there is a public address.
   *
   * `internal` is a fact about the work, not missing data: NAS HR has no public
   * URL because it is an internal system.
   */
  readonly linkStatus: 'live' | 'private';
  readonly image: {
    readonly src: string;
    readonly srcset: string | null;
    readonly width: number;
    readonly height: number;
    readonly alt: string;
  };
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
 * the field, the market, the stack and the link marker into one unreadable
 * label.
 *
 * ## What it says
 *
 * Field, then market and domain, then the stack. The business before the
 * tooling — a reader should be able to place the work without opening it.
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
  imports: [RouterLink],
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

  /** Raised on pointer or keyboard focus so the pane can follow the reader. */
  readonly focused = output<string>();

  protected readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));

  protected readonly statusLabel = computed(
    () => this.statusLabels()[this.project().linkStatus] ?? '',
  );

  /** Inline image only exists below `md`, where it spans the measure. */
  protected readonly sizes = '(min-width: 48rem) 40vw, 92vw';
}
