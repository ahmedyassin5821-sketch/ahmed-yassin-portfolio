import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, skip } from 'rxjs/operators';

import { isBrowser } from '../platform/is-browser';

/**
 * Focus and announcement on route change.
 *
 * A client-side route change is silent and invisible to assistive technology:
 * the URL and DOM change, but focus stays wherever it was — often on a link that
 * no longer exists — and nothing tells a screen-reader user that a new page
 * arrived. Angular's router does not handle this; scroll restoration is a
 * separate concern and is already covered by `withInMemoryScrolling`.
 *
 * Two things are needed, and both have a subtlety:
 *
 * 1. Move focus to `<main>`, with `preventScroll: true`. Without that flag the
 *    focus call scrolls the element into view and fights scroll restoration,
 *    landing the user part-way down the new page.
 * 2. Announce the new title through a polite live region rendered by `app.ts`.
 *
 * `skip(1)` matters: on first load nothing has changed, so stealing focus and
 * announcing would be wrong.
 */
@Injectable({ providedIn: 'root' })
export class RouteFocusService {
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);
  private readonly title = inject(Title);
  private readonly browser = isBrowser();

  private readonly _announcement = signal('');

  /** Bound to a polite live region in `app.ts`. */
  readonly announcement = this._announcement.asReadonly();

  constructor() {
    if (!this.browser) return;

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        // Ignore the initial navigation — nothing changed yet.
        skip(1),
      )
      .subscribe((event) => {
        // An in-page anchor jump is not a page change. Moving focus or
        // announcing here would interrupt someone who just used a jump link.
        if (this.router.parseUrl(event.urlAfterRedirects).fragment) return;

        this.doc.getElementById('main')?.focus({ preventScroll: true });
        this._announcement.set(this.title.getTitle());
      });
  }
}
