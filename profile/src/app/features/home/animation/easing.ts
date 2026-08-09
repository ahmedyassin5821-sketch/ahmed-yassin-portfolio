/**
 * Easing and interpolation used by both the DOM choreography and the WebGL
 * scene.
 *
 * Framework-free and side-effect-free on purpose: the scene must stay importable
 * without Angular, and every one of these is a pure function of its arguments so
 * the whole choreography can be unit-tested without a renderer.
 *
 * These are *shaping* functions for a scrubbed timeline, not CSS transitions.
 * The design system's `--ease-*` tokens still own everything that is a real CSS
 * transition; these own values derived from scroll position.
 */

/** Constrains to a range. */
export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

/** Linear interpolation. */
export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t;
}

/**
 * Normalises `value` to 0→1 across [start, end].
 *
 * Returns 0 for a zero-width span rather than dividing by zero — which is what
 * a mistyped timeline entry would otherwise produce, as `NaN` propagating
 * silently into every transform on the page.
 */
export function normalise(value: number, start: number, end: number): number {
  const span = end - start;
  if (span <= 0) return 0;
  return clamp((value - start) / span);
}

/**
 * Smoothstep — the default for scrubbed motion.
 *
 * Its first derivative is zero at both ends, so a value driven by scroll leaves
 * and arrives at rest. Linear interpolation between keyframes reads as
 * mechanical precisely because it does not.
 */
export function smoothstep(t: number): number {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
}

/** Stronger ease for large positional moves — the camera's default. */
export function easeInOutCubic(t: number): number {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

/** Decelerating ease, for arrivals. */
export function easeOutCubic(t: number): number {
  const x = clamp(t);
  return 1 - Math.pow(1 - x, 3);
}
