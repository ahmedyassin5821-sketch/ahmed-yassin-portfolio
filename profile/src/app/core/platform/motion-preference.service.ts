import { Injectable } from '@angular/core';

import { mediaQuery } from './media-query';

/**
 * `prefers-reduced-motion` as a signal.
 *
 * CSS already handles the visual side (styles/_motion.scss collapses every
 * transition). This exists for the JS side: an IntersectionObserver that would
 * otherwise stage an entrance should not be constructed at all, and future GSAP
 * timelines should never be built.
 *
 * The server default is `true` — assume reduced. Server-rendered HTML is
 * therefore the fully-visible, un-staged version, so a reduced-motion user never
 * receives content that depends on an animation to become readable.
 */
@Injectable({ providedIn: 'root' })
export class MotionPreferenceService {
  readonly prefersReduced = mediaQuery('(prefers-reduced-motion: reduce)', true);
}
