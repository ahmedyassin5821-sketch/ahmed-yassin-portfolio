import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  afterNextRender,
  inject,
  viewChild,
} from '@angular/core';

import { HomeChoreography } from './animation/home-choreography';
import { Hero } from './sections/hero/hero';
import { SelectedWork } from './sections/selected-work/selected-work';
import { StrataIndex } from './sections/strata-index/strata-index';
import { WorkTransition } from './sections/work-transition/work-transition';

/**
 * Home.
 *
 * Composes the four sections and owns the one piece of wiring none of them can
 * own alone: handing the choreography its targets.
 *
 * ## The animation layer is removable
 *
 * Section entrances use the existing `appReveal` directive and need nothing from
 * here. The only thing this component wires up is the scroll scrub that feeds
 * the WebGL scene: it collects the platform rows and hands them, plus the
 * narrative element, to `HomeChoreography`.
 *
 * Delete `animation/` and `webgl/`, drop the constructor below, and the page
 * still renders completely — every section's resting state is its CSS state,
 * not an animated end state.
 *
 * `HomeChoreography` is provided here rather than at root so its ScrollTriggers
 * are torn down with the route.
 */
@Component({
  selector: 'app-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Hero, StrataIndex, SelectedWork, WorkTransition],
  providers: [HomeChoreography],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly narrative = viewChild.required<ElementRef<HTMLElement>>('narrative');
  private readonly choreography = inject(HomeChoreography);

  constructor() {
    // afterNextRender never runs on the server and runs post-paint in the
    // browser, so GSAP is fetched only after the page is readable.
    afterNextRender(() => {
      const root = this.narrative().nativeElement;

      void this.choreography.setup({
        narrative: root,
        acts: Array.from(root.querySelectorAll<HTMLElement>('[data-home-act]')),
      });
    });
  }
}
