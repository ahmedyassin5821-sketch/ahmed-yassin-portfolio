import { Injectable, computed, signal } from '@angular/core';

import { Act, ActId, actAt, actProgress } from './act-timeline';

/**
 * The single contract between scroll and everything it drives.
 *
 * Everything the choreography knows how to say is one number: how far through
 * the Home narrative the reader is, 0 → 1. The scene and the DOM are both pure
 * functions of it.
 *
 * Keeping the surface this narrow is deliberate. The alternative — components
 * reaching into the scene, or the scene subscribing to scroll — produces a web
 * of couplings where neither side can be changed or removed alone. Here the
 * animation layer can be deleted entirely and the page still renders.
 *
 * ## Why `act` is derived, not written
 *
 * It used to be set by three extra ScrollTriggers, one per platform row — and
 * nothing ever read it. Deriving it from `scroll` against `ACT_TIMELINE` gives
 * the same information from the one trigger that already exists, and makes it
 * impossible for the act and the scroll position to disagree.
 */
@Injectable({ providedIn: 'root' })
export class HomeProgress {
  private readonly _scroll = signal(0);

  /** Normalised scroll through the Home narrative, 0 → 1. */
  readonly scroll = this._scroll.asReadonly();

  /** The act the reader is currently inside. Derived — never written. */
  readonly act = computed<Act>(() => actAt(this._scroll()));

  /** Convenience for templates that only need the name. */
  readonly actId = computed<ActId>(() => this.act().id);

  /** Progress *within* the current act, 0 → 1. */
  readonly withinAct = computed(() => actProgress(this._scroll(), this.act()));

  set(value: number): void {
    this._scroll.set(Math.min(1, Math.max(0, value)));
  }

  reset(): void {
    this._scroll.set(0);
  }
}
