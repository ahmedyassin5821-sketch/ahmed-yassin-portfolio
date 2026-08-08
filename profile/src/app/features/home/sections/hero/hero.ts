import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { localizedContent } from '@core/i18n/localized';
import { DeviceCapabilityService } from '@core/platform/device-capability.service';
import { ViewportService } from '@core/platform/viewport.service';
import { HOME_CONTENT } from '@data/home.content';
import { StrataPoster } from '../../webgl/strata-poster/strata-poster';
import { StrataCanvas } from '../../webgl/strata-canvas/strata-canvas';

/**
 * The opening.
 *
 * ## LCP is protected structurally, not by tuning
 *
 * The `<h1>` is plain server-rendered text. It sits outside the `@defer` block,
 * carries no entrance animation, and never waits on Three.js, GSAP, a texture,
 * or a font swap. Whatever happens to the WebGL layer, the identity has already
 * painted.
 *
 * The visual is layered *behind* the text rather than beside it, so the
 * composition holds at every width without the type reflowing around artwork.
 */
@Component({
  selector: 'app-hero',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [StrataPoster, StrataCanvas],
  templateUrl: './hero.html',
  styleUrl: './hero.scss',
})
export class Hero {
  private readonly capability = inject(DeviceCapabilityService);
  private readonly viewport = inject(ViewportService);

  protected readonly c = localizedContent(HOME_CONTENT.hero);
  protected readonly visual = localizedContent(HOME_CONTENT.visual);

  /**
   * Whether to attempt WebGL at all.
   *
   * False on the server, without WebGL2, under reduced motion, and on Data
   * Saver — in every one of those cases the poster is not a downgrade, it is
   * the correct rendering.
   */
  protected readonly canRunWebGL = this.capability.canRunWebGL;

  /**
   * Set only when the WebGL scene reports it is actually rendering.
   *
   * Drives retiring the static poster. Gated on the scene's own signal rather
   * than on the canvas element existing, so a scene that fails to build leaves
   * the poster in place instead of leaving an empty frame.
   */
  protected readonly sceneReady = signal(false);

  /** Matches the scene's own tuning, so poster and canvas agree in density. */
  protected readonly posterLayers = () => (this.viewport.isDesktop() ? 10 : 4);
}
