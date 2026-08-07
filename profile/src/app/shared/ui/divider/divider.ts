import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

export type DividerOrientation = 'horizontal' | 'vertical';

/**
 * Rule.
 *
 * Presentational by default (`role="presentation"`), because a decorative line
 * announced as "separator" is noise. Set `semantic` when the rule genuinely
 * marks a thematic break that a screen-reader user should know about.
 *
 * The `angled` variant terminates at the monogram's own 24° leg axis, mirrored
 * in RTL.
 */
@Component({
  selector: 'app-divider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styleUrl: './divider.scss',
  host: {
    '[attr.role]': "semantic() ? 'separator' : 'presentation'",
    '[attr.aria-orientation]': "semantic() ? orientation() : null",
    '[class]': "'divider divider--' + orientation()",
    '[class.divider--angled]': 'angled()',
  },
})
export class Divider {
  readonly orientation = input<DividerOrientation>('horizontal');

  /** Announce as a thematic break rather than decoration. */
  readonly semantic = input(false, { transform: booleanAttribute });

  /** Cut the ends at the brand angle. */
  readonly angled = input(false, { transform: booleanAttribute });
}
