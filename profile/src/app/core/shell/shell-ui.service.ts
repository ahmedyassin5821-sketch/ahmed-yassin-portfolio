import { DestroyRef, Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

import { isBrowser } from '../platform/is-browser';

/**
 * Shell chrome state.
 *
 * Exists because the mobile panel's open state has to be known in two places at
 * once: the header owns the trigger and the panel, while `app.ts` needs it to
 * mark `<main>` and `<footer>` as `inert`. A root service is the smallest seam
 * that serves both without either component reaching into the other.
 */
@Injectable({ providedIn: 'root' })
export class ShellUiService {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly browser = isBrowser();

  private readonly _menuOpen = signal(false);

  readonly menuOpen = this._menuOpen.asReadonly();

  /** Anything that should scope the page behind it. */
  readonly scoped = computed(() => this._menuOpen());

  constructor() {
    // Close on navigation rather than on link click.
    //
    // Router events cover every way the route can change — a link tap, the
    // browser back button, a programmatic navigate — so the panel can never be
    // left open over a page it no longer belongs to. A click handler on the links
    // would miss the back button entirely.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this._menuOpen.set(false));

    // Scroll lock is a consequence of the open state, not a separate action, so
    // it lives in an effect. That way it cannot drift out of sync however the
    // panel is closed.
    effect(() => {
      const locked = this.scoped();
      if (!this.browser) return;
      this.doc.documentElement.style.overflow = locked ? 'hidden' : '';
    });

    // A destroyed service must never leave the page unscrollable.
    inject(DestroyRef).onDestroy(() => {
      if (this.browser) this.doc.documentElement.style.overflow = '';
    });
  }

  open(): void {
    this._menuOpen.set(true);
  }

  close(): void {
    this._menuOpen.set(false);
  }

  toggle(): void {
    this._menuOpen.update((open) => !open);
  }
}
