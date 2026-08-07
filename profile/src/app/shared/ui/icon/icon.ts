import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ICON_PATHS, IconName, RTL_MIRRORED_ICONS } from './icon-paths';

export type IconSize = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Inline SVG icon.
 *
 * Inline rather than `<img>` or a sprite `<use>` so `currentColor` resolves
 * against the cascade — an `<img>` cannot inherit a theme token, which would
 * force a hardcoded colour and break the system's central promise.
 *
 * Stroke width is optically sized: perceived weight stays constant as the box
 * grows, echoing the monogram's stem ratio rather than its hairline (which at
 * 24px would be sub-pixel).
 *
 * Decorative by default (`aria-hidden`). Pass `label` only when the icon is the
 * sole carrier of meaning — if it sits beside text, it should stay hidden so
 * screen readers don't announce it twice.
 */
@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 24 24'"
      [attr.width]="pixelSize()"
      [attr.height]="pixelSize()"
      [attr.stroke-width]="strokeWidth()"
      [attr.aria-hidden]="label() ? null : 'true'"
      [attr.role]="label() ? 'img' : 'presentation'"
      [attr.aria-label]="label() || null"
      fill="none"
      stroke="currentColor"
      stroke-linecap="square"
      stroke-linejoin="miter"
      stroke-miterlimit="4"
      focusable="false"
    >
      <path [attr.d]="path()" />
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      align-items: center;
      justify-content: center;
      color: inherit;
    }

    /* Directional glyphs follow the reading direction — RTL only. */
    :host-context([dir='rtl'])[data-flip='true'] svg {
      scale: -1 1;
    }

    /* Forced-colors mode discards currentColor in favour of system palettes. */
    @media (forced-colors: active) {
      svg {
        stroke: CanvasText;
      }
    }
  `,
  host: {
    '[attr.data-flip]': 'shouldFlip()',
  },
})
export class Icon {
  readonly name = input.required<IconName>();
  readonly size = input<IconSize>('md');

  /** Accessible name. Omit for decorative icons. */
  readonly label = input<string>('');

  /**
   * Force mirroring on or off. Defaults to the per-icon rule in
   * `RTL_MIRRORED_ICONS`, which is right almost always — set this only for a
   * genuine exception.
   */
  readonly flipInRtl = input<boolean | undefined>(undefined);

  protected readonly path = computed(() => ICON_PATHS[this.name()]);

  protected readonly pixelSize = computed(
    () => ({ sm: 16, md: 24, lg: 32, xl: 48 })[this.size()],
  );

  /** Optical sizing: bigger box, proportionally heavier stroke. */
  protected readonly strokeWidth = computed(
    () => ({ sm: 1.25, md: 1.5, lg: 2, xl: 2.5 })[this.size()],
  );

  protected readonly shouldFlip = computed(() =>
    String(this.flipInRtl() ?? RTL_MIRRORED_ICONS.has(this.name())),
  );
}
