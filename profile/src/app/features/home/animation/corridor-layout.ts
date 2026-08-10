import { CORRIDOR } from './camera-path';
import { GATE_ACTS, actById, gateBeat } from './act-timeline';

/**
 * Where everything sits in the corridor.
 *
 * Computed from the same `CORRIDOR` depths the camera path is written against,
 * so a plane can never end up somewhere the camera does not fly. Pure and
 * framework-free: the Angular wrapper feeds it the labels, the scene consumes
 * the result, and it is testable without either.
 *
 * ## Type only
 *
 * The corridor used to hang each project's screenshot as a textured plane. They
 * are gone. Seen from behind — which is most of the time, because the camera
 * flies past them — a plane renders its texture mirrored, so the reader was
 * shown a backwards screenshot; and when one was squared up to the camera for
 * the gate hand-off it simply duplicated the DOM plate landing over it at the
 * same moment. The scene now carries the mark and the words; the work is
 * presented in the DOM, where it is legible, selectable and indexable.
 */

export interface TypePlaneSpec {
  /** The word to draw. Latin wordmarks and figures only. */
  readonly text: string;
  readonly z: number;
  /** World units, signed. Negated for RTL by the scene. */
  readonly offsetX: number;
  readonly scale: number;
  /**
   * The scroll window this word may appear in.
   *
   * Distance alone is not enough to gate visibility: these planes are 16 units
   * tall and the fog reaches 110, so SHOPIFY was legible behind the ANGULAR gate
   * — the reader saw the wrong word two acts early. Tying each word to its own
   * act means it can only ever appear where it belongs.
   */
  readonly from: number;
  readonly to: number;
}

/**
 * The typographic gates: the project count, then one word per platform.
 *
 * Offsets alternate so the camera does not fly down a perfectly symmetrical
 * tunnel — a corridor with everything dead-centre reads as a screensaver.
 *
 * ## Windows are relative to each act, not absolute
 *
 * A word may only be legible inside its own act plus a short lead-in and
 * tail-out, and both are measured as a fraction of that act's own span. Fixed
 * offsets do not survive a retimed timeline: with a ±0.06 lead-in and 0.20-long
 * gates, MAGENTO became legible at 0.47 — while the reader was still two thirds
 * of the way through reading Angular's projects. Verified by rendering, not by
 * reasoning about it.
 */
export function buildTypePlanes(countLabel: string): readonly TypePlaneSpec[] {
  const count = actById('count');
  const countSpan = count.end - count.start;

  const planes: TypePlaneSpec[] = [
    {
      text: countLabel,
      z: CORRIDOR.count,
      offsetX: 0,
      scale: 1.35,
      from: count.start - countSpan * 0.25,
      // Ends with its own act. The camera passes z = −38 partway through the
      // count act, so every frame after that was dead window anyway — and
      // leaving it open past the boundary is how this word ended up still
      // ghosting behind "Angular".
      to: count.end,
    },
  ];

  GATE_ACTS.forEach((act, index) => {
    const platform = act.platform!;
    const span = act.end - act.start;

    planes.push({
      text: platform.toUpperCase(),
      z: CORRIDOR.gates[platform],
      offsetX: index % 2 === 0 ? -2.4 : 2.4,
      scale: 1,
      from: act.start - span * 0.1,
      // Leaves as that gate's screenshot arrives.
      //
      // This is the beat the whole sequence turns on: the word says what the
      // platform is, then gets out of the way of the work. Held to the end of the
      // act it stayed ten units from a holding camera — filling the frame — and
      // the project plates read as printed on top of a watermark. The platform is
      // still named in the DOM header the name settled into.
      to: gateBeat(act, 'image'),
    });
  });

  return planes;
}
