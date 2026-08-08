import { Injectable, signal } from '@angular/core';

/**
 * The single contract between scroll and the WebGL scene.
 *
 * Everything the choreography knows how to say is one number: how far through
 * the Home narrative the reader is, 0 → 1. The scene is a pure function of it.
 *
 * Keeping the surface this narrow is deliberate. The alternative — components
 * reaching into the scene, or the scene subscribing to scroll — produces a web
 * of couplings where neither side can be changed or removed alone. Here the
 * animation layer can be deleted entirely and the page still renders: nothing
 * reads this except the canvas.
 */
@Injectable({ providedIn: 'root' })
export class HomeProgress {
  private readonly _scroll = signal(0);
  private readonly _act = signal(0);

  /** Normalised scroll through the Home narrative, 0 → 1. */
  readonly scroll = this._scroll.asReadonly();

  /** Index of the platform stratum currently in view; −1 when none. */
  readonly act = this._act.asReadonly();

  set(value: number): void {
    this._scroll.set(Math.min(1, Math.max(0, value)));
  }

  setAct(index: number): void {
    this._act.set(index);
  }

  reset(): void {
    this._scroll.set(0);
    this._act.set(0);
  }
}
