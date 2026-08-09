import {
  BufferGeometry,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Material,
  Mesh,
  MeshBasicMaterial,
  ShapePath,
} from 'three';

import { AY_MARK_PATH } from '@shared/ui/logo/logo-path';
import { easeInOutCubic, normalise } from '../../animation/easing';
import { parseSvgPath } from './svg-path';

/** The measured axis of the A's legs. See BRAND-SYSTEM.md §1. */
const BRAND_ANGLE_RAD = (24 * Math.PI) / 180;

/**
 * Nearly-coincident at rest, so act 0 reads as the flat identity.
 *
 * Not zero: perfectly coincident coplanar faces z-fight, and a hair of depth is
 * what makes the mark look printed rather than drawn.
 */
const RESTING_SEPARATION = 0.08;

/** How far apart the sheets travel once fully open. */
const OPEN_SEPARATION = 1.95;

/**
 * Sheets closer than this to the camera dissolve rather than clip through it.
 *
 * Generous on purpose. The front sheet is a solid extrusion, and at close range
 * the camera sees its *side* faces — which fill the frame as a flat grey slab
 * that reads as a rendering bug rather than a passage. Beginning the dissolve
 * well before arrival means the reader flies through an opening letterform
 * instead of into the inside of one.
 */
const NEAR_FADE_DISTANCE = 16;

export interface MonogramOptions {
  readonly layers: number;
  readonly inkColor: string;
  /** Negated in RTL so depth recedes with the reading direction. */
  readonly directionSign: 1 | -1;
  /**
   * Which end of the story this mark belongs to.
   *
   * `open` is the mark the reader arrives at: coincident at rest, opening during
   * act 1 as the camera approaches. `close` is its mirror at the far end of the
   * corridor: fully open while the camera travels, collapsing back to the flat
   * monogram across the final act.
   *
   * Two instances rather than flying the camera back to the first one. The
   * reader has passed the entry mark by act 2 and it is 180 units behind them;
   * reversing to re-show it would undo the journey instead of ending it.
   */
  readonly phase?: 'open' | 'close';
  /** Where this mark sits in the corridor. */
  readonly z?: number;
  /**
   * Lateral placement, mirrored in RTL. The closing mark is offset for the same
   * reason the opening camera is: the resolve text sits beside it, and a mark
   * printed through a sentence is a collision, not a composition.
   */
  readonly x?: number;
}

interface Sheet {
  readonly group: Group;
  readonly depth: number;
  readonly material: MeshBasicMaterial | LineBasicMaterial;
  readonly baseOpacity: number;
}

/**
 * The AY monogram as a stack of extruded sheets — the corridor the camera flies
 * through.
 *
 * ## Why the mark is the architecture, not a logo on a page
 *
 * The geometry comes from `AY_MARK_PATH`, the same 96-anchor outline the
 * `<app-logo>`, the favicon and the SVG poster use. The counters of the A and Y
 * become real openings, so the passage in act 2 goes through Ahmed's own
 * letterform rather than through a generic tunnel.
 *
 * Only the front sheet is solid. The rest are hairline edges — the same 1px rule
 * the CSS design system is built from, so the 3D and the stylesheet share a
 * visual language instead of merely coexisting.
 *
 * ## Everything here is a pure function of progress
 *
 * `update()` derives every transform from the scroll value and the camera's z.
 * No easing state, no accumulated velocity, no internal clock. That is what lets
 * a refresh mid-page, a restored scroll position, or an anchor jump land on
 * exactly the right composition with no catch-up.
 */
export class MonogramLayers {
  readonly root = new Group();

  private readonly sheets: Sheet[] = [];
  private readonly geometries: BufferGeometry[] = [];
  private readonly materials: Material[] = [];

  private readonly origin: number;

  constructor(private readonly options: MonogramOptions) {
    this.origin = options.z ?? 0;
    this.root.position.z = this.origin;
    this.root.position.x = (options.x ?? 0) * options.directionSign;
    this.build();
  }

  /** True when the mark produced usable geometry. */
  get isBuilt(): boolean {
    return this.sheets.length > 0;
  }

  private build(): void {
    const shapePath = new ShapePath();
    parseSvgPath(AY_MARK_PATH, shapePath);
    // Three 0.185 dropped the isCCW argument; winding is inferred from the path.
    // toShapes() treats the counters as holes, which is what keeps the
    // letterforms readable rather than filled in.
    const shapes = shapePath.toShapes();
    if (shapes.length === 0) return;

    const ink = new Color(this.options.inkColor);

    for (let i = 0; i < this.options.layers; i++) {
      const depth = this.options.layers - 1 - i;
      const isFront = depth === 0;

      const geometry = new ExtrudeGeometry(shapes, {
        depth: 6,
        bevelEnabled: false,
        curveSegments: 6,
      });
      // The SVG coordinate system is Y-down and the mark sits far from the
      // origin; centring here means nothing downstream has to know that.
      geometry.center();
      geometry.scale(0.026, -0.026, 0.026);
      this.geometries.push(geometry);

      const group = new Group();
      let material: MeshBasicMaterial | LineBasicMaterial;
      let baseOpacity: number;

      if (isFront) {
        baseOpacity = 1;
        material = new MeshBasicMaterial({ color: ink, transparent: true, opacity: baseOpacity });
        group.add(new Mesh(geometry, material));
      } else {
        const edges = new EdgesGeometry(geometry, 20);
        this.geometries.push(edges);
        baseOpacity = Math.max(0.06, 0.36 - depth * 0.028);
        material = new LineBasicMaterial({ color: ink, transparent: true, opacity: baseOpacity });
        group.add(new LineSegments(edges, material));
      }

      this.materials.push(material);
      this.sheets.push({ group, depth, material, baseOpacity });
      this.root.add(group);
    }
  }

  /**
   * @param progress scroll position, 0 → 1
   * @param cameraZ where the camera currently is, so sheets can dissolve before
   *   the near plane reaches them
   */
  update(progress: number, cameraZ: number): void {
    const sign = this.options.directionSign;
    const closing = this.options.phase === 'close';

    // Opening mark: coincident through act 0, spreading across act 1 — the
    // conceit only lands if the flat identity is believed first.
    //
    // Closing mark: the exact inverse across the final act, so the story ends on
    // the same image it began with. This is a visual full stop, not a fade: the
    // geometry itself resolves.
    const t = closing
      ? 1 - easeInOutCubic(normalise(progress, 0.9, 1))
      : easeInOutCubic(normalise(progress, 0.1, 0.26));
    const separation = RESTING_SEPARATION + t * OPEN_SEPARATION;

    // A yaw that rises and returns: enough three-quarter view to reveal the
    // stack is a stack, back to square before the camera arrives so the passage
    // goes straight through rather than clipping a corner.
    // The closing mark squares up as it converges; the opening one turns to
    // reveal that it is a stack at all.
    const reveal = closing
      ? t * 0.5
      : Math.sin(Math.PI * normalise(progress, 0.1, 0.34));
    this.root.rotation.y = sign * reveal * 0.38;
    this.root.rotation.x = reveal * 0.06;

    for (const sheet of this.sheets) {
      const offset = sheet.depth * separation;

      sheet.group.position.set(
        sign * offset * Math.sin(BRAND_ANGLE_RAD),
        offset * Math.cos(BRAND_ANGLE_RAD) * 0.32,
        -offset,
      );

      // Dissolve on approach. Without this the camera visibly clips through a
      // solid slab at the exact moment the passage should feel like flight.
      const distance = cameraZ - (this.origin + sheet.group.position.z);
      const nearFade = Math.min(1, Math.max(0, distance / NEAR_FADE_DISTANCE));
      sheet.material.opacity = sheet.baseOpacity * nearFade;
      sheet.group.visible = nearFade > 0.01;
    }
  }

  dispose(): void {
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();
    this.geometries.length = 0;
    this.materials.length = 0;
    this.sheets.length = 0;
  }
}
