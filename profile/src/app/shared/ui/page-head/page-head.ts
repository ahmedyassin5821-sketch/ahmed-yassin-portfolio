import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * The opening of a standard page: eyebrow, `display-1` title, lede.
 *
 * Extracted because /about, /cv and /contact all open the same way and each
 * component carries a 4 kB style budget — three copies of the same forty lines
 * is how that budget gets spent on nothing. It also guarantees the three pages
 * cannot drift apart typographically, which is the actual point.
 *
 * Not used by `/work` or `/work/:slug`: those two deliberately open differently
 * (a count line beside the title, and a numeral above a project name).
 *
 * The `<h1>` lives here, so every page using it has exactly one.
 */
@Component({
  selector: 'app-page-head',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './page-head.html',
  styleUrl: './page-head.scss',
})
export class PageHead {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly lede = input<string>('');

  /** Ties the page's landmark to this heading via aria-labelledby. */
  readonly headingId = input<string>('page-title');
}
