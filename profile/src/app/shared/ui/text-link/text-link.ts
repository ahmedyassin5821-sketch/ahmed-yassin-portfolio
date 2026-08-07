import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Icon } from '../icon/icon';

/**
 * Text link.
 *
 * Renders an internal `routerLink` or an external `<a href>` depending on
 * `href`. External links get `rel="noopener noreferrer"`, a trailing
 * external-link glyph, and a visually-hidden "opens in a new tab" note — because
 * changing the browsing context without warning is a WCAG 3.2.5 failure, and the
 * icon alone conveys nothing to a screen reader.
 */
@Component({
  selector: 'app-text-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon],
  template: `
    @if (isExternal()) {
      <a
        class="link"
        [href]="href()"
        [attr.target]="newTab() ? '_blank' : null"
        [attr.rel]="newTab() ? 'noopener noreferrer' : null"
      >
        <ng-content />
        @if (newTab()) {
          <app-icon name="external-link" size="sm" />
          <span class="sr-only">(opens in a new tab)</span>
        }
      </a>
    } @else {
      <a class="link" [routerLink]="route()">
        <ng-content />
      </a>
    }
  `,
  styleUrl: './text-link.scss',
  host: {
    '[class.is-subtle]': 'subtle()',
  },
})
export class TextLink {
  /** Absolute URL. Presence of a scheme is what makes a link external. */
  readonly href = input<string>('');

  /** Internal router target. Ignored when `href` is set. */
  readonly route = input<string | readonly unknown[]>('/');

  readonly newTab = input<boolean>(true);

  /** Removes the underline until hover — for links inside dense UI, not prose. */
  readonly subtle = input(false, { transform: booleanAttribute });

  protected readonly isExternal = computed(() => this.href().length > 0);
}
