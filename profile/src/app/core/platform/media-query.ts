import { DestroyRef, Signal, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { isBrowser } from './is-browser';

/**
 * A media query as a signal.
 *
 * On the server there is no `matchMedia`, so the caller supplies the value to
 * assume. Every default in this app assumes the *mobile, reduced, low-capability*
 * answer, so server-rendered HTML is the conservative version and the browser
 * only ever upgrades it. Guessing "desktop" on the server produces a layout
 * flash on real phones.
 *
 * Must be called in an injection context.
 */
export function mediaQuery(query: string, serverDefault = false): Signal<boolean> {
  const browser = isBrowser();
  const doc = inject(DOCUMENT);

  if (!browser) {
    return signal(serverDefault).asReadonly();
  }

  const view = doc.defaultView;
  if (!view?.matchMedia) {
    return signal(serverDefault).asReadonly();
  }

  const list = view.matchMedia(query);
  const state = signal(list.matches);
  const onChange = (event: MediaQueryListEvent) => state.set(event.matches);

  list.addEventListener('change', onChange);
  inject(DestroyRef).onDestroy(() => list.removeEventListener('change', onChange));

  return state.asReadonly();
}
