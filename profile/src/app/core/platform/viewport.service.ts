import { Injectable, computed } from '@angular/core';

import { mediaQuery } from './media-query';

/**
 * Breakpoint and capability state as signals.
 *
 * These exist for BEHAVIOURAL decisions only — whether to construct an
 * observer, whether to enable a cursor-dependent affordance. Layout is CSS's
 * job; reading a width here to decide what to render reintroduces the layout
 * flash that mobile-first CSS exists to prevent.
 *
 * Breakpoints are em-based to match styles/_breakpoints.scss, so they track the
 * user's font size rather than diverging from the stylesheet.
 */
@Injectable({ providedIn: 'root' })
export class ViewportService {
  /** >= 768px */
  readonly isTablet = mediaQuery('(min-width: 48em)');
  /** >= 1024px */
  readonly isDesktop = mediaQuery('(min-width: 64em)');
  /** < 768px — the server-side assumption */
  readonly isMobile = computed(() => !this.isTablet());

  /** A pointer that can hover accurately. Gate magnetic/tilt effects on this. */
  readonly isFinePointer = mediaQuery('(hover: hover) and (pointer: fine)');

  /** Short landscape phones, where a 100dvh hero clips its own content. */
  readonly isShortLandscape = mediaQuery('(orientation: landscape) and (max-height: 31.25em)');

  /** Windows High Contrast and similar. */
  readonly isForcedColors = mediaQuery('(forced-colors: active)');
}
