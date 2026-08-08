import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { AY_MARK_PATH, AY_MARK_VIEWBOX } from '@shared/ui/logo/logo-path';

interface StratumLayer {
  readonly index: number;
  readonly x: number;
  readonly y: number;
  readonly opacity: number;
}

/**
 * The STRATA composition as static SVG.
 *
 * This is not a loading spinner or a degraded stand-in — it is the same idea
 * expressed without WebGL: the AY mark repeated in depth along its own 24° leg
 * axis. It carries the concept on its own, which is what lets the 3D be a
 * genuine enhancement rather than a requirement.
 *
 * It serves three cases with one implementation:
 *   1. the `@defer` placeholder, so the composition is in the server-rendered
 *      HTML and never pops in;
 *   2. devices without WebGL;
 *   3. `prefers-reduced-motion`, where building a render loop would be wrong.
 *
 * Geometry comes from `AY_MARK_PATH` — the same source the logo and the WebGL
 * scene use — so the fallback can never drift from the mark.
 *
 * Decorative: `aria-hidden`, with the real information carried by the page's
 * text. Nothing here is the only way to learn anything.
 */
@Component({
  selector: 'app-strata-poster',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './strata-poster.html',
  styleUrl: './strata-poster.scss',
})
export class StrataPoster {
  /** Fewer layers on small screens, matching the WebGL scene's own tuning. */
  readonly layers = input<number>(10);

  private readonly direction = inject(DirectionService);

  protected readonly viewBox = AY_MARK_VIEWBOX;
  protected readonly markPath = AY_MARK_PATH;

  /**
   * Layer offsets along the brand angle.
   *
   * 24° is the measured axis of the A's legs (BRAND-SYSTEM.md §1), so the stack
   * separates along a line the mark itself already contains. In RTL the
   * horizontal component negates, so depth recedes with the reading direction
   * instead of against it.
   */
  protected readonly strata = computed<StratumLayer[]>(() => {
    const count = Math.max(1, this.layers());
    const radians = (24 * Math.PI) / 180;
    const step = 9;
    const sign = this.direction.isRtl() ? -1 : 1;

    return Array.from({ length: count }, (_, i) => {
      const depth = count - 1 - i;
      return {
        index: i,
        x: sign * depth * step * Math.sin(radians),
        y: depth * step * Math.cos(radians),
        // Farthest layer faintest. The front layer is fully opaque so the mark
        // still reads as itself at a glance.
        opacity: depth === 0 ? 1 : Math.max(0.04, 0.3 - depth * 0.028),
      };
    });
  });
}
