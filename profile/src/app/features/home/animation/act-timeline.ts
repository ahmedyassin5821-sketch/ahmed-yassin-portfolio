import { ProjectPlatform } from '@data/models/project.model';
import { normalise } from './easing';

/**
 * The Home choreography, as data.
 *
 * ## Why this file exists
 *
 * The DOM and the WebGL scene both need to know when each act happens. If each
 * held its own copy of those numbers they would drift the first time one was
 * tuned — the classic failure of scroll choreography, where the text says one
 * thing and the scene shows another.
 *
 * So the timeline is a table, declared once, imported by both. The scene reads
 * it to place its camera keys; the stage reads it to drive CSS. Tuning the
 * choreography means editing this file and nothing else.
 *
 * Framework-free: no Angular import, so it can be unit-tested and so the scene
 * can import it without pulling the framework into the WebGL chunk.
 */

export type ActId =
  | 'mark'
  | 'separation'
  | 'passage'
  | 'count'
  | 'angular'
  | 'magento'
  | 'shopify'
  | 'resolve';

export interface Act {
  readonly id: ActId;
  /** Inclusive start, as scroll progress 0→1. */
  readonly start: number;
  /** Exclusive end, except for the final act. */
  readonly end: number;
  /**
   * Set on the three platform gates. Lets a gate component be data-driven
   * rather than three near-identical hand-written sections.
   */
  readonly platform?: ProjectPlatform;
}

/**
 * The eight-act structure.
 *
 * Boundaries are contiguous and cover 0→1 exactly; `choreography.spec.ts`
 * asserts both, because a gap would leave the page in an undefined act and an
 * overlap would run two acts at once.
 *
 * The weighting is deliberate. `mark` is short and completely still — it exists
 * so the identity is readable before anything moves, which is also what protects
 * the LCP. The three gates take **60% of the whole scroll** between them, up
 * from 40%, because each one now plays a four-beat sequence rather than showing
 * everything at once (see `GATE_BEATS`). At the old weighting a beat lasted
 * under half a screen and the platform name and the screenshots arrived
 * effectively together, which is exactly the confusion the beats exist to fix.
 */
export const ACT_TIMELINE: readonly Act[] = [
  { id: 'mark', start: 0.0, end: 0.08 },
  { id: 'separation', start: 0.08, end: 0.16 },
  { id: 'passage', start: 0.16, end: 0.24 },
  { id: 'count', start: 0.24, end: 0.32 },
  { id: 'angular', start: 0.32, end: 0.53, platform: 'angular' },
  { id: 'magento', start: 0.53, end: 0.73, platform: 'magento' },
  { id: 'shopify', start: 0.73, end: 0.92, platform: 'shopify' },
  { id: 'resolve', start: 0.92, end: 1.0 },
];

/** The gates, in travel order. Derived so it cannot fall out of step. */
export const GATE_ACTS: readonly Act[] = ACT_TIMELINE.filter((act) => act.platform !== undefined);

/**
 * The four beats inside a gate, as fractions of that gate's own span.
 *
 * ## Why a gate has beats at all
 *
 * A gate used to present its platform name and its project plates in the same
 * instant, and the two competed: the reader could not tell whether they were
 * being shown a technology or a piece of work. The act now tells one thing at a
 * time.
 *
 * ```
 *   0 ─────────── settle ────── image ────── info ─────────── 1
 *   │  ANGULAR    │  the word   │  the lead  │  its name,     │
 *   │  alone,     │  settles    │  project's │  field, market │  hold
 *   │  centred    │  into a     │  screenshot│  and stack     │
 *   │  and large  │  header     │  arrives   │  arrive        │
 * ```
 *
 * The transition between the text phase and the image phase is the camera, which
 * holds still across the whole sequence (see `camera-path.ts`) while the name
 * rises out of the frame and the screenshot arrives out of depth. The beats
 * overlap by a few percent at each boundary, so the phases read as separate
 * without being separated by dead air.
 *
 * Fractions rather than absolute progress, so the three gates share one shape
 * despite having different lengths. Read by the stylesheet through custom
 * properties bound in `home.html`, so the timing is declared once.
 */
export const GATE_BEATS = {
  /** The platform name stops being the whole frame and becomes a header. */
  settle: 0.3,
  /**
   * The lead project's screenshot has fully arrived.
   *
   * The gap between `settle` and where the image window *starts* fading in
   * (`image - WINDOW_FADE` in `type-planes.ts`) is the deliberate pause between
   * the technology and the work — confirmed by rendering actual frames, not
   * assumed. It reads clean at rest, but was narrow (~0.013 of the gate, under a
   * tenth of a screen) before this value moved from 0.48.
   */
  image: 0.52,
  /** Its name, field, market and stack have arrived. */
  info: 0.66,
} as const;

/** Absolute scroll progress of a beat within `act`. */
export function gateBeat(act: Act, beat: keyof typeof GATE_BEATS): number {
  return act.start + (act.end - act.start) * GATE_BEATS[beat];
}

/** The act containing `progress`. Never returns undefined for 0→1 input. */
export function actAt(progress: number): Act {
  const value = Math.min(1, Math.max(0, progress));

  for (const act of ACT_TIMELINE) {
    if (value < act.end) return act;
  }

  // Only reachable at exactly 1.
  return ACT_TIMELINE[ACT_TIMELINE.length - 1];
}

/** How far through its own act `progress` is, 0→1. */
export function actProgress(progress: number, act: Act): number {
  return normalise(progress, act.start, act.end);
}

/** Lookup by id, for a component that knows which act it renders. */
export function actById(id: ActId): Act {
  const found = ACT_TIMELINE.find((act) => act.id === id);
  if (!found) throw new Error(`Unknown act: ${id}`);
  return found;
}
