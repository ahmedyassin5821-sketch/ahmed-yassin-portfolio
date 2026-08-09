import { CORRIDOR } from './camera-path';
import { GATE_ACTS } from './act-timeline';

/**
 * Where everything sits in the corridor.
 *
 * Computed from the same `CORRIDOR` depths the camera path is written against,
 * so a plane can never end up somewhere the camera does not fly. Pure and
 * framework-free: the Angular wrapper feeds it project data, the scene consumes
 * the result, and it is testable without either.
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

export interface ProjectPlaneSpec {
  readonly slug: string;
  /** `null` for a project whose imagery has not been supplied — Vivace today. */
  readonly src: string | null;
  readonly z: number;
  readonly offsetX: number;
  readonly offsetY: number;
  /**
   * The first project of a gate. This one plane performs the hand-off: as the
   * camera closes on the gate it leaves the periphery, squares up to the camera
   * and grows, so the DOM plate that lands next appears to be the same object.
   * The others stay peripheral scenery throughout.
   */
  readonly isLead: boolean;
  /** Scroll position at which the gate's DOM takes over. */
  readonly gateAt: number;
}

/** Minimal shape the layout needs. Keeps `three` and Angular out of this file. */
export interface CorridorProject {
  readonly slug: string;
  readonly platform: string;
  readonly src: string | null;
}

/**
 * The typographic gates: the project count, then one word per platform.
 *
 * Offsets alternate so the camera does not fly down a perfectly symmetrical
 * tunnel — a corridor with everything dead-centre reads as a screensaver.
 */
export function buildTypePlanes(countLabel: string): readonly TypePlaneSpec[] {
  const planes: TypePlaneSpec[] = [
    { text: countLabel, z: CORRIDOR.count, offsetX: 0, scale: 1.35, from: 0.22, to: 0.54 },
  ];

  GATE_ACTS.forEach((act, index) => {
    const platform = act.platform!;
    planes.push({
      text: platform.toUpperCase(),
      z: CORRIDOR.gates[platform],
      offsetX: index % 2 === 0 ? -2.4 : 2.4,
      scale: 1,
      from: act.start - 0.06,
      to: act.end + 0.02,
    });
  });

  return planes;
}

/**
 * Project planes, hung just past their platform's gate.
 *
 * They step back and alternate side to side, so passing a gate reads as flying
 * between that platform's work rather than at a wall of it.
 */
export function buildProjectPlanes(
  projects: readonly CorridorProject[],
): readonly ProjectPlaneSpec[] {
  const planes: ProjectPlaneSpec[] = [];

  for (const act of GATE_ACTS) {
    const platform = act.platform!;
    const gateZ = CORRIDOR.gates[platform];
    const forPlatform = projects.filter((p) => p.platform === platform);

    forPlatform.forEach((project, index) => {
      planes.push({
        slug: project.slug,
        src: project.src,
        isLead: index === 0,
        gateAt: act.start,
        z: gateZ + CORRIDOR.planeOffset + index * CORRIDOR.planeStep,
        // Far enough out to be cropped by the frame edges. Once the DOM gained
        // a real editorial plate for every project, a plane sitting behind it
        // rendered the same screenshot twice — which reads as a bug, not depth.
        // Out here they are peripheral scenery the camera passes.
        offsetX: index % 2 === 0 ? -12 : 12,
        offsetY: index % 2 === 0 ? 2.4 : -2.4,
      });
    });
  }

  return planes;
}
