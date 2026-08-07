import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';

export type BadgeVariant = 'default' | 'outline' | 'status';

/**
 * Badge / tag.
 *
 * Read-only. For an interactive filter, build a Chip — a badge that responds to
 * clicks but is not a button fails keyboard access.
 *
 * The palette is monochrome, so a badge is distinguished by its outline, its
 * mono label, and (for status) an icon. Nothing here depends on hue, which is
 * also what WCAG 1.4.1 requires.
 */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    @if (icon()) {
      <app-icon [name]="icon()!" size="sm" />
    }
    <span class="badge__label"><ng-content /></span>
  `,
  styleUrl: './badge.scss',
  host: {
    '[class]': "'badge badge--' + variant()",
  },
})
export class Badge {
  readonly variant = input<BadgeVariant>('default');

  /**
   * Required in practice for `status`: with no colour in the system, the icon is
   * the only thing that separates an error badge from a success one.
   */
  readonly icon = input<IconName | undefined>(undefined);
}
