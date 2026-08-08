import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  effect,
  inject,
  output,
  viewChild,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { DirectionService } from '@core/i18n/direction.service';
import { DeviceCapabilityService } from '@core/platform/device-capability.service';
import { HomeProgress } from '../../animation/home-progress';
import type { StrataScene } from '../strata-scene';

/**
 * Angular wrapper around the STRATA scene.
 *
 * Owns everything the scene deliberately does not: platform gating, lifecycle,
 * resize, visibility, and teardown. `strata-scene.ts` stays framework-free, and
 * `three` is imported dynamically here so it never enters the initial bundle —
 * this component is itself only reachable through a `@defer` block.
 *
 * The canvas is decorative: `aria-hidden`, and every fact it gestures at is
 * stated in text elsewhere on the page.
 */
@Component({
  selector: 'app-strata-canvas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './strata-canvas.html',
  styleUrl: './strata-canvas.scss',
})
export class StrataCanvas {
  /**
   * Emitted once the scene is actually rendering.
   *
   * The parent uses this to cross-fade the static poster out. Deliberately tied
   * to a *successful* construction rather than to the element mounting: if
   * building the scene throws, this never fires, the poster stays, and the
   * composition survives instead of collapsing to an empty canvas.
   */
  readonly ready = output<void>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly doc = inject(DOCUMENT);
  private readonly capability = inject(DeviceCapabilityService);
  private readonly direction = inject(DirectionService);
  private readonly progress = inject(HomeProgress);
  private readonly destroyRef = inject(DestroyRef);

  private scene: StrataScene | null = null;

  constructor() {
    // Never runs on the server, and runs after paint in the browser — so
    // constructing a WebGL context can never block first render or the LCP.
    afterNextRender(() => void this.initialise());

    // The scene reads progress; it never reaches back into Angular. This effect
    // is the only write, and it is a plain number.
    effect(() => {
      const value = this.progress.scroll();
      this.scene?.setProgress(value);
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  private async initialise(): Promise<void> {
    // Re-checked here rather than trusted from the parent: capability can only
    // be known in the browser, and this is the last gate before ~120KB is
    // fetched and a GPU context is created.
    if (!this.capability.canRunWebGL()) return;

    const { StrataScene } = await import('../strata-scene');
    if (this.destroyed) return;

    const styles = getComputedStyle(this.doc.documentElement);
    const lowPower = this.capability.isLowPower();

    this.scene = new StrataScene({
      canvas: this.canvasRef().nativeElement,
      // Fewer sheets on constrained devices — the concept survives at four.
      layers: lowPower ? 4 : 10,
      pixelRatioCap: this.capability.pixelRatioCap(),
      pointerParallax: this.capability.allowsPointerParallax(),
      directionSign: this.direction.isRtl() ? -1 : 1,
      // Colours are read from the live token values, so the scene can never
      // drift from the design system or hardcode a brand colour.
      inkColor: styles.getPropertyValue('--color-brand-mark').trim() || '#0a0a09',
      surfaceColor: styles.getPropertyValue('--color-background').trim() || '#fdfcfb',
    });

    this.observeVisibility();
    this.observeResize();
    if (this.capability.allowsPointerParallax()) this.observePointer();

    this.scene.setProgress(this.progress.scroll());

    // Only now is it safe for the parent to retire the poster.
    this.ready.emit();
  }

  /**
   * Renders only while on screen and only while the tab is visible.
   *
   * A hero canvas is scrolled past within seconds; continuing to render behind
   * the rest of the page would drain battery for nothing.
   */
  private observeVisibility(): void {
    const element = this.host.nativeElement;

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? this.scene?.start() : this.scene?.stop()),
      { threshold: 0 },
    );
    io.observe(element);

    const onVisibility = () => {
      if (this.doc.hidden) this.scene?.stop();
      else if (this.isOnScreen()) this.scene?.start();
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

  private observePointer(): void {
    const onMove = (event: PointerEvent) => {
      const rect = this.host.nativeElement.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      this.scene?.setPointer(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1,
      );
    };

    // Passive: this never calls preventDefault, and saying so keeps it off the
    // scroll-blocking path.
    this.doc.addEventListener('pointermove', onMove, { passive: true });
    this.destroyRef.onDestroy(() => this.doc.removeEventListener('pointermove', onMove));
  }

  private isOnScreen(): boolean {
    const rect = this.host.nativeElement.getBoundingClientRect();
    return rect.bottom > 0 && rect.top < (this.doc.defaultView?.innerHeight ?? 0);
  }

  private destroyed = false;

  private teardown(): void {
    this.destroyed = true;
    this.scene?.dispose();
    this.scene = null;
  }
}
