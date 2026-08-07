import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { isBrowser } from '../platform/is-browser';

export type AppLocale = 'en' | 'ar';
export type Direction = 'ltr' | 'rtl';

const STORAGE_KEY = 'ay-dev-locale';

/**
 * Document language and direction.
 *
 * ## Why this is temporary
 *
 * Sprint 3 replaces the writable signal with Angular's compile-time `LOCALE_ID`
 * (see ARCHITECTURE.md ADR-001): each locale becomes its own build with a fixed
 * direction, and switching becomes a navigation rather than a runtime toggle.
 *
 * What survives is the shape — components never ask which locale is active.
 * They rely on `dir`/`lang` on the document root plus logical CSS properties, so
 * the seam being swapped is exactly this file and nothing else. That is what
 * keeps RTL from becoming a component fork.
 *
 * Setting `lang`/`dir` here rather than in index.html matters for SSR: this runs
 * during server render too, so prerendered HTML already carries the correct
 * attributes. There is no post-paint mutation and no flash.
 */
@Injectable({ providedIn: 'root' })
export class DirectionService {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isBrowser();

  private readonly _locale = signal<AppLocale>(this.readInitialLocale());

  readonly locale = this._locale.asReadonly();
  readonly dir = computed<Direction>(() => (this._locale() === 'ar' ? 'rtl' : 'ltr'));
  readonly isRtl = computed(() => this.dir() === 'rtl');

  constructor() {
    effect(() => {
      const root = this.doc.documentElement;
      root.lang = this._locale();
      root.dir = this.dir();

      if (this.browser) {
        try {
          this.doc.defaultView?.localStorage.setItem(STORAGE_KEY, this._locale());
        } catch {
          // Private browsing or blocked storage. Direction still applies; only
          // the preference is not remembered.
        }
      }
    });
  }

  set(locale: AppLocale): void {
    this._locale.set(locale);
  }

  toggle(): void {
    this._locale.update((current) => (current === 'en' ? 'ar' : 'en'));
  }

  /**
   * `?lang=ar` wins over the stored preference.
   *
   * This makes direction URL-addressable, which matters for more than
   * convenience: it is how an RTL screenshot or an automated visual-regression
   * run reaches the Arabic layout without driving the UI. It is also read during
   * SSR, so the server-rendered HTML already carries the right `dir`.
   */
  private readInitialLocale(): AppLocale {
    const fromQuery = this.readQueryLocale();
    if (fromQuery) return fromQuery;
    return this.readStoredLocale();
  }

  private readQueryLocale(): AppLocale | null {
    const search = this.doc.defaultView?.location?.search;
    if (!search) return null;
    const value = new URLSearchParams(search).get('lang');
    return value === 'ar' ? 'ar' : value === 'en' ? 'en' : null;
  }

  private readStoredLocale(): AppLocale {
    if (!this.browser) return 'en';
    try {
      return this.doc.defaultView?.localStorage.getItem(STORAGE_KEY) === 'ar' ? 'ar' : 'en';
    } catch {
      return 'en';
    }
  }
}
