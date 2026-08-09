import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';

import { localizedContent } from '@core/i18n/localized';
import { Icon } from '../icon/icon';

/**
 * The new-tab warning, in both languages.
 *
 * Lives here rather than in `@data` because it is a property of this control,
 * not project content — every caller would otherwise have to remember to pass
 * it, and the one that forgot would ship an English string into Arabic.
 */
const NEW_TAB_NOTICE = {
  en: '(opens in a new tab)',
  ar: '(يفتح في تبويب جديد)',
} as const;

/**
 * Text link.
 *
 * Renders an internal `routerLink` or an external `<a href>` depending on
 * `href`. External links get `rel="noopener noreferrer"`, a trailing
 * external-link glyph, and a visually-hidden "opens in a new tab" note — because
 * changing the browsing context without warning is a WCAG 3.2.5 failure, and the
 * icon alone conveys nothing to a screen reader.
 *
 * ## Why the label goes through an ng-template
 *
 * There must be exactly ONE `<ng-content>` in this component. Projected nodes are
 * moved, not copied, so they can only exist in one slot — declaring a second
 * `<ng-content>` in the other branch of the `@if` means one branch always renders
 * empty. That is not a subtle degradation: it produced anchors containing no text
 * whatsoever, with only the href to hint at their purpose.
 *
 * Wrapping the single slot in a template and stamping it with `ngTemplateOutlet`
 * lets either branch render the same label, because only one branch is ever live.
 */
@Component({
  selector: 'app-text-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, NgTemplateOutlet],
  templateUrl: './text-link.html',
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

  protected readonly newTabNotice = localizedContent(NEW_TAB_NOTICE);
}
