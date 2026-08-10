import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { DeviceCapabilityService } from '@core/platform/device-capability.service';
import { ProjectAtmosphere, SculptureKind } from '@data/models/project.model';
import type { SculptureScene } from './sculpture-scene';

/**
 * The small 3D object on a project's detail page.
 *
 * ## Enhancement, in the strict sense
 *
 * Nothing on the page depends on it. It carries no information, it is `aria-hidden`,
 * it appears on two of seven projects, and it is reached only through a `@defer`
 * block in `work-detail.html` — so `three` stays out of the initial bundle and out
 * of the detail route's own chunk.
 *
 * It is not rendered at all when `canRunWebGL()` is false, which covers the server,
 * WebGL2-less browsers, Data Saver, **and `prefers-reduced-motion`**. Under reduced
 * motion there is therefore no WebGL context, no canvas and no animation — which is
 * what the brief asked for in preference to a frozen object — and the screenshots
 * and text are untouched, because they were never behind this.
 *
 * ## Why it takes the atmosphere
 *
 * The object is the brand's, not the portfolio's. Handing it the project's accent
 * and glow is what stops it reading as a stock 3D widget dropped onto seven
 * different pages.
 */
@Component({
  selector: 'app-project-sculpture',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-sculpture.html',
  styleUrl: './project-sculpture.scss',
  host: {
    'aria-hidden': 'true',
  },
})
export class ProjectSculpture {
  readonly kind = input.required<SculptureKind>();
  readonly atmosphere = input.required<ProjectAtmosphere>();

  /**
   * Whether to put a canvas in the page at all.
   *
   * False on the server, without WebGL2, on Data Saver, and under
   * `prefers-reduced-motion` — so in every one of those cases this component renders
   * nothing rather than an empty element.
   */
  protected readonly canRender = inject(DeviceCapabilityService).canRunWebGL;

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly capability = inject(DeviceCapabilityService);
  private readonly destroyRef = inject(DestroyRef);

  private scene: SculptureScene | null = null;
  private destroyed = false;

  constructor() {
    afterNextRender(() => void this.initialise());
    this.destroyRef.onDestroy(() => this.teardown());
  }

  private async initialise(): Promise<void> {
    // The last gate before a GPU context is created and the three chunk is
    // fetched. Re-checked here rather than trusted from the template.
    if (!this.capability.canRunWebGL()) return;

    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;

    const { SculptureScene } = await import('./sculpture-scene');
    if (this.destroyed) return;

    const atmosphere = this.atmosphere();

    this.scene = new SculptureScene({
      canvas,
      kind: this.kind(),
      accent: atmosphere.accent,
      glow: atmosphere.glow,
      pixelRatioCap: this.capability.pixelRatioCap(),
      pointerParallax: this.capability.allowsPointerParallax(),
    });

    if (!this.scene.isBuilt) {
      this.scene.dispose();
      this.scene = null;
      return;
    }

    this.observeVisibility();
    this.observeResize();
    this.observeScroll();
    if (this.capability.allowsPointerParallax()) this.observePointer();
  }

  /** Renders only while on screen and only while the tab is visible. */
  private observeVisibility(): void {
    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? this.scene?.start() : this.scene?.stop()),
      { threshold: 0 },
    );
    io.observe(this.host.nativeElement);

    const onVisibility = () => {
      if (this.doc.hidden) this.scene?.stop();
    };
    this.doc.addEventListener('visibilitychange', onVisibility);

    this.destroyRef.onDestroy(() => {
      io.disconnect();
      this.doc.removeEventListener('visibilitychange', onVisibility);
    });
  }

  private observeResize(): void {
    const ro = new ResizeObserver(() => this.scene?.resize());
    ro.observe(this.host.nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  /**
   * How far the object has travelled through the viewport, 0→1.
   *
   * Read on scroll rather than driven by a ScrollTrigger: this is one number for
   * one decorative object, and it has nothing to do with the Home choreography.
   */
  private observeScroll(): void {
    const onScroll = () => {
      const view = this.doc.defaultView;
      if (!view) return;
      const rect = this.host.nativeElement.getBoundingClientRect();
      const span = view.innerHeight + rect.height;
      if (span === 0) return;
      this.scene?.setScroll((view.innerHeight - rect.top) / span);
    };

    onScroll();
    this.doc.addEventListener('scroll', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => this.doc.removeEventListener('scroll', onScroll));
  }

  private observePointer(): void {
    const onMove = (event: PointerEvent) => {
      const rect = this.host.nativeElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.scene?.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };

    this.doc.addEventListener('pointermove', onMove, { passive: true });
    this.destroyRef.onDestroy(() => this.doc.removeEventListener('pointermove', onMove));
  }

  private teardown(): void {
    this.destroyed = true;
    this.scene?.dispose();
    this.scene = null;
  }
}
