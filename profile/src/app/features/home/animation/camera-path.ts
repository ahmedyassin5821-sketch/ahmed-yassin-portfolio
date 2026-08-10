import { ProjectPlatform } from '@data/models/project.model';
import { GATE_ACTS } from './act-timeline';
import { clamp, easeInOutCubic, lerp, normalise } from './easing';

/**
 * The camera's journey through the monogram, as keyframes.
 *
 * ## Why a path table rather than formulas
 *
 * The scene must be a **pure function of scroll progress**: any position must
 * produce exactly one composition, with no accumulated state. That is what makes
 * scroll restoration, anchor jumps, a refresh mid-page, and a fast flick all land
 * correctly instead of playing catch-up.
 *
 * Writing the camera as `z = 14 - progress * 200` would satisfy that too, but it
 * is unreadable and untunable — every adjustment becomes an argument with
 * arithmetic. A keyframe table is the same purity with the shape visible, and it
 * is what lets the timing live beside `ACT_TIMELINE`.
 *
 * ## The corridor
 *
 * Objects sit at fixed depths; only the camera moves.
 *
 * ```
 *     0   the monogram plane — sheets extend back from here
 *   −38   "20+"
 *   −62   first gate    ┐
 *  −100   second gate   ├ whichever platforms GATE_ACTS lists, in that order
 *  −138   third gate    ┘
 *  −180   exit
 * ```
 *
 * Framework-free and side-effect-free, so the whole path is unit-testable
 * without a renderer.
 */

export interface CameraKey {
  /** Scroll progress this key is anchored at, 0→1. */
  readonly at: number;
  readonly z: number;
  /**
   * Lateral offset. Negated in RTL by the scene, so the mark always sits away
   * from the reading edge and the opening text has clear space beside it rather
   * than a monogram printed through it.
   */
  readonly x: number;
  readonly y: number;
  /** Radians. Kept small — a portfolio is not a rollercoaster. */
  readonly pitch: number;
  readonly fov: number;
}

export interface CameraState {
  readonly z: number;
  readonly x: number;
  readonly y: number;
  readonly pitch: number;
  readonly fov: number;
}

/**
 * How deep each gate sits, in travel order. The camera path below is written
 * against these three numbers, so they are the ones to tune — never the mapping.
 */
const GATE_DEPTHS = [-62, -100, -138] as const;

/**
 * Fixed depths for everything the camera passes. Shared with the scene.
 *
 * `gates` is keyed by platform for the callers' convenience but **assigned by
 * travel order**: the first gate in `ACT_TIMELINE` gets the nearest depth. When
 * the showcase was reordered to lead with Shopify, a hardcoded
 * `{ angular: -62, magento: -100, shopify: -138 }` would have sent the camera
 * flying to the far end of the corridor first and then back — the acts and the
 * geometry disagreeing, which is exactly the failure this whole module is
 * arranged to prevent. Derived, they cannot.
 */
export const CORRIDOR = {
  mark: 0,
  count: -38,
  gates: Object.fromEntries(
    GATE_ACTS.map((act, index) => [act.platform, GATE_DEPTHS[index]]),
  ) as Record<ProjectPlatform, number>,
  exit: -180,
} as const;

/**
 * Desktop: one continuous glide.
 *
 * The `at` values line up with `ACT_TIMELINE` boundaries so a tuning change to
 * the timeline and a change here stay legible together. FOV widens through the
 * passage — the standard cinematic cue for "you are moving fast through a tight
 * space" — then settles back to the resting 38°.
 */
export const CAMERA_PATH_DESKTOP: readonly CameraKey[] = [
  // Act 0: the mark sits toward the far edge of the frame so the identity text
  // beside it is read against paper, not through a monogram.
  { at: 0.0, z: 14, x: -2.6, y: 0.1, pitch: 0, fov: 38 },
  { at: 0.08, z: 12.4, x: -2.5, y: 0.1, pitch: 0, fov: 38 },
  // Centring as it opens: the camera lines up with the counter it will enter.
  { at: 0.16, z: 2, x: -0.4, y: 0.35, pitch: 0.05, fov: 46 },
  // Through the counter of the A.
  { at: 0.24, z: -18, x: 0, y: 0, pitch: 0, fov: 54 },
  // Arriving at each gate, then **holding** across the beats that follow.
  //
  // A gate now plays a four-beat sequence, and a camera still dollying through
  // it would pull the presenting plane past the frame while the reader is being
  // asked to look at it. Each gate therefore gets an arrival key and a hold key
  // with identical `z`: the travel happens between gates, the reading happens
  // at them. This is the desktop path adopting the grammar the mobile path has
  // always had, for the same reason.
  { at: 0.32, z: -42, x: 0.6, y: -0.2, pitch: -0.02, fov: 48 },
  { at: 0.48, z: -52, x: 0.2, y: -0.1, pitch: 0, fov: 46 },
  { at: 0.53, z: -80, x: -0.8, y: 0, pitch: 0, fov: 46 },
  { at: 0.68, z: -90, x: -0.3, y: 0, pitch: 0, fov: 45 },
  { at: 0.73, z: -120, x: 0.8, y: 0, pitch: 0, fov: 46 },
  { at: 0.87, z: -130, x: 0.3, y: 0, pitch: 0, fov: 45 },
  { at: 0.92, z: -166, x: 0, y: 0, pitch: 0, fov: 42 },
  // Decelerating out, squared up on the reconverging mark.
  { at: 1.0, z: -186, x: 0, y: 0, pitch: 0, fov: 38 },
];

/**
 * Mobile: punctuated arrivals, not a scaled-down glide.
 *
 * A continuous dolly reads as noise on a tall narrow viewport — the vanishing
 * point sits off-screen and the sheets smear. So the mobile camera *settles* at
 * each gate instead: pairs of keys with near-identical `z` create a dwell, and
 * the travel between them is short and quick. Same story, different grammar.
 *
 * FOV runs wider throughout so a plane fills a portrait frame, and pitch stays
 * at zero because tilt on a phone reads as a bug rather than a camera move.
 */
export const CAMERA_PATH_MOBILE: readonly CameraKey[] = [
  { at: 0.0, z: 16, x: -1.2, y: 0, pitch: 0, fov: 52 },
  { at: 0.08, z: 15, x: -1.1, y: 0, pitch: 0, fov: 52 },
  { at: 0.16, z: 4, x: 0, y: 0, pitch: 0, fov: 58 },
  { at: 0.24, z: -20, x: 0, y: 0, pitch: 0, fov: 62 },
  // Each pair below holds `z` **identical** so the hold is a genuine stop, not
  // merely a slow segment. An earlier version stepped by 2 units across the
  // pair, which the choreography spec caught: it was travelling further during
  // the "dwell" than the desktop path does on its eased approach.
  //
  // The hold now spans the gate's whole four-beat sequence rather than only its
  // opening, so the camera is still while the reader is being shown the work.
  { at: 0.3, z: -44, x: 0, y: 0, pitch: 0, fov: 58 },
  { at: 0.5, z: -44, x: 0, y: 0, pitch: 0, fov: 58 },
  { at: 0.58, z: -84, x: 0, y: 0, pitch: 0, fov: 56 },
  { at: 0.7, z: -84, x: 0, y: 0, pitch: 0, fov: 56 },
  { at: 0.77, z: -122, x: 0, y: 0, pitch: 0, fov: 56 },
  { at: 0.89, z: -122, x: 0, y: 0, pitch: 0, fov: 56 },
  { at: 0.94, z: -164, x: 0, y: 0, pitch: 0, fov: 56 },
  // Further back than desktop's final key: the portrait frame is narrow, and
  // at closer range the reconverging mark fills it and prints through the
  // closing sentence.
  { at: 1.0, z: -176, x: 0, y: 0, pitch: 0, fov: 52 },
];

/**
 * Samples the path at `progress`.
 *
 * Eased *within* each segment rather than across the whole path, so every
 * keyframe is an arrival — the camera comes to rest at each act boundary instead
 * of sliding through it. That is the difference between choreography and drift.
 */
export function sampleCamera(path: readonly CameraKey[], progress: number): CameraState {
  if (path.length === 0) throw new Error('Camera path is empty');

  const value = clamp(progress);
  const first = path[0];
  const last = path[path.length - 1];

  if (value <= first.at) return toState(first);
  if (value >= last.at) return toState(last);

  for (let i = 0; i < path.length - 1; i++) {
    const from = path[i];
    const to = path[i + 1];
    if (value > to.at) continue;

    const t = easeInOutCubic(normalise(value, from.at, to.at));

    return {
      z: lerp(from.z, to.z, t),
      x: lerp(from.x, to.x, t),
      y: lerp(from.y, to.y, t),
      pitch: lerp(from.pitch, to.pitch, t),
      fov: lerp(from.fov, to.fov, t),
    };
  }

  return toState(last);
}

function toState(key: CameraKey): CameraState {
  return { z: key.z, x: key.x, y: key.y, pitch: key.pitch, fov: key.fov };
}
