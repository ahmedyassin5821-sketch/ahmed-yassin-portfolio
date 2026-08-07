import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';

import { Icon } from '../icon/icon';
import { IconName } from '../icon/icon-paths';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

/**
 * Button.
 *
 * Renders a real `<button>`. For navigation use `TextLink` or an anchor — a
 * button that navigates breaks middle-click, ctrl-click, and the screen-reader
 * contract, which is why this component does not accept an `href`.
 *
 * Press feedback is an opacity shift, never a scale. The brand system bans
 * scaling outright: the monogram is a rigid Didone form, and springy or
 * squashing feedback reads as playful, which is explicitly excluded.
 */
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading() ? 'true' : null"
      [attr.aria-label]="ariaLabel() || null"
      [class]="'btn btn--' + variant() + ' btn--' + size()"
      (click)="pressed.emit($event)"
    >
      @if (loading()) {
        <!-- Replaces the leading icon slot rather than being added beside it, so
             the button's width does not jump on state change.
             data-motion-essential keeps it turning (slowly) under
             prefers-reduced-motion: it reports state, so freezing it would
             remove information rather than discomfort. -->
        <span class="btn__spinner" data-motion-essential aria-hidden="true"></span>
      } @else if (iconStart()) {
        <app-icon [name]="iconStart()!" [size]="iconSize()" />
      }

      <span class="btn__label"><ng-content /></span>

      @if (iconEnd() && !loading()) {
        <app-icon [name]="iconEnd()!" [size]="iconSize()" />
      }
    </button>
  `,
  styleUrl: './button.scss',
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly iconStart = input<IconName | undefined>(undefined);
  readonly iconEnd = input<IconName | undefined>(undefined);

  /** Only needed when the visible label is insufficient on its own. */
  readonly ariaLabel = input<string>('');

  readonly pressed = output<MouseEvent>();

  /** Icons sit one step below the text so they never optically outweigh it. */
  protected readonly iconSize = computed(() => (this.size() === 'lg' ? 'md' : 'sm'));
}
