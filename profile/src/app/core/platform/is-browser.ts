import { PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * True only in the browser.
 *
 * Must be called in an injection context. Every service that touches
 * `window`, `matchMedia`, `IntersectionObserver`, or `localStorage` gates on
 * this — during SSR those globals do not exist and any access throws, taking
 * the whole render with it.
 */
export function isBrowser(): boolean {
  return isPlatformBrowser(inject(PLATFORM_ID));
}
