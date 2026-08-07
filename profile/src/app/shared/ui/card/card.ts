import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Surface primitive. Zero radius, hairline border — the monogram has no rounded
 * corners anywhere, and softening them is the single fastest way to make this
 * design read as a generic template.
 *
 * ## The interactive variant
 *
 * When `route` is set the whole card becomes clickable via ONE anchor stretched
 * over it with an `::after` overlay. The alternative — wrapping the card in an
 * anchor — nests any inner links inside it, which is invalid HTML and leaves
 * screen readers announcing one enormous link containing the entire card.
 *
 * With the overlay approach the anchor's text is the accessible name and inner
 * links still work, because they sit above the overlay in z-order.
 */
@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <ng-content />

    @if (route()) {
      <a class="card__overlay" [routerLink]="route()">
        <span class="sr-only">{{ linkLabel() }}</span>
      </a>
    }
  `,
  styleUrl: './card.scss',
  host: {
    // Signal inputs are not reflected as DOM attributes, so styling must hang
    // off explicit class bindings rather than [attr] selectors.
    '[class.is-interactive]': '!!route()',
    '[class.is-flush]': 'flush()',
  },
})
export class Card {
  /** Setting this makes the whole card a single link. */
  readonly route = input<string | readonly unknown[] | undefined>(undefined);

  /** Accessible name for the whole-card link. */
  readonly linkLabel = input<string>('View');

  /** Removes the internal padding — for cards that are entirely media. */
  readonly flush = input(false, { transform: booleanAttribute });
}
