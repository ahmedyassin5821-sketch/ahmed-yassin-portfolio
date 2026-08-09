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
 * The seven-act structure.
 *
 * Boundaries are contiguous and cover 0→1 exactly; `ACT_TIMELINE.spec.ts`
 * asserts both, because a gap would leave the page in an undefined act and an
 * overlap would run two acts at once.
 *
 * The weighting is deliberate. `mark` is short and completely still — it exists
 * so the identity is readable before anything moves, which is also what protects
 * the LCP. The three gates get the most time because that is where the actual
 * evidence of the work lives.
 */
export const ACT_TIMELINE: readonly Act[] = [
  { id: 'mark', start: 0.0, end: 0.1 },
  { id: 'separation', start: 0.1, end: 0.26 },
  { id: 'passage', start: 0.26, end: 0.38 },
  { id: 'count', start: 0.38, end: 0.5 },
  { id: 'angular', start: 0.5, end: 0.65, platform: 'angular' },
  { id: 'magento', start: 0.65, end: 0.78, platform: 'magento' },
  { id: 'shopify', start: 0.78, end: 0.9, platform: 'shopify' },
  { id: 'resolve', start: 0.9, end: 1.0 },
];

/** The gates, in travel order. Derived so it cannot fall out of step. */
export const GATE_ACTS: readonly Act[] = ACT_TIMELINE.filter((act) => act.platform !== undefined);

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
