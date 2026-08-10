import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';

import { DeviceCapabilityService } from '@core/platform/device-capability.service';
import { ViewportService } from '@core/platform/viewport.service';
import { ACT_TIMELINE, Act, GATE_BEATS } from './animation/act-timeline';
import { HomeChoreography } from './animation/home-choreography';
import { HomeProgress } from './animation/home-progress';
import { ActCount } from './acts/act-count/act-count';
import { ActGate } from './acts/act-gate/act-gate';
import { ActMark } from './acts/act-mark/act-mark';
import { ActResolve } from './acts/act-resolve/act-resolve';
import { StrataCanvas } from './webgl/strata-canvas/strata-canvas';
import { StrataPoster } from './webgl/strata-poster/strata-poster';

/**
 * The Home stage.
 *
 * ## What this component is
 *
 * A viewport that sticks, a spacer that gives it travel, and the acts layered
 * inside it. It owns the scene because the scene now spans the whole journey
 * rather than decorating the hero.
 *
 * ## Two layouts, one DOM
 *
 * Everything here renders as an ordinary vertical document. The choreography
 * adds `.is-staged` only once it has actually started, and that class is what
 * turns the document into a stage: the spacer gains height, the viewport begins
 * to stick, and the acts stack into it.
 *
 * The consequence is that the fallback is the *absence* of an enhancement rather
 * than a second code path. Under reduced motion, without JavaScript, or if GSAP
 * fails to load, no class is added: there is no scroll void, no frozen
 * half-state, and all seven acts read in order as plain sections. Nothing about
 * the page's content depends on the scene.
 *
 * ## Why the acts carry their own timings
 *
 * Each act element is given its `--act-start` and `--act-end` from
 * `ACT_TIMELINE`. Combined with the `--home-progress` the choreography writes,
 * that lets each act's stylesheet compute its own visibility in pure CSS — no
 * per-element tween, no per-frame change detection, and no chance of the DOM
 * timing disagreeing with the scene's, because both read the same table.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActMark, ActCount, ActGate, ActResolve, StrataPoster, StrataCanvas],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  // Provided here rather than at root so its ScrollTrigger is torn down with
  // the route rather than leaking into every other page.
  providers: [HomeChoreography],
})
export class Home {
  private readonly stage = viewChild.required<ElementRef<HTMLElement>>('stage');
  private readonly choreography = inject(HomeChoreography);
  private readonly capability = inject(DeviceCapabilityService);
  private readonly viewport = inject(ViewportService);

  /** The eight acts, in order, for the template to lay out. */
  protected readonly acts: readonly Act[] = ACT_TIMELINE;

  /**
   * The gate beat fractions, bound onto every act element as custom properties.
   *
   * Published from here rather than typed into a stylesheet so that the DOM
   * ramps and the WebGL hand-off are two readings of one table. Set on all acts
   * for simplicity — only the three gates have rules that consume them.
   */
  protected readonly beats = GATE_BEATS;

  /**
   * Which act the reader is inside, derived from scroll.
   *
   * Used only to decide which act accepts pointer input — `pointer-events` is
   * not interpolatable, so it cannot come from the CSS envelope. This changes a
   * handful of times across the whole page rather than once per frame.
   */
  protected readonly currentAct = inject(HomeProgress).actId;

  /**
   * Whether to attempt WebGL at all.
   *
   * False on the server, without WebGL2, under reduced motion, and on Data
   * Saver — in every one of those cases the poster is not a downgrade, it is
   * the correct rendering.
   */
  protected readonly canRunWebGL = this.capability.canRunWebGL;

  /**
   * Set only when the scene reports it is genuinely rendering.
   *
   * Drives retiring the static poster. Gated on the scene's own signal rather
   * than on the canvas element existing, so a scene that fails to build leaves
   * the poster in place instead of leaving an empty frame.
   */
  protected readonly sceneReady = signal(false);

  /** Matches the scene's own tuning, so poster and canvas agree in density. */
  protected readonly posterLayers = () => (this.viewport.isDesktop() ? 10 : 4);

  constructor() {
    afterNextRender(() => {
      void this.choreography.setup({ stage: this.stage().nativeElement });
    });
  }
}
