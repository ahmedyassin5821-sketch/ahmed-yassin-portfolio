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
  templateUrl: './button.html',
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
