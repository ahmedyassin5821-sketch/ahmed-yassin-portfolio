import {
  BufferGeometry,
  Color,
  EdgesGeometry,
  ExtrudeGeometry,
  Group,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  ShapePath,
  WebGLRenderer,
} from 'three';

import { AY_MARK_PATH } from '@shared/ui/logo/logo-path';

export interface StrataSceneOptions {
  readonly canvas: HTMLCanvasElement;
  readonly layers: number;
  readonly pixelRatioCap: number;
  readonly pointerParallax: boolean;
  /** Negated in RTL so depth recedes with the reading direction. */
  readonly directionSign: 1 | -1;
  readonly inkColor: string;
  readonly surfaceColor: string;
}

/** The measured axis of the A's legs. See BRAND-SYSTEM.md §1. */
const BRAND_ANGLE_RAD = (24 * Math.PI) / 180;

/**
 * STRATA — the AY monogram as depth.
 *
 * Framework-free on purpose: nothing here imports Angular, so the scene can be
 * unit-tested, reasoned about, or deleted without touching a component. The
 * Angular wrapper owns lifecycle and gating; this owns geometry and rendering.
 *
 * ## The concept
 *
 * The mark is built from the real logo outline — `AY_MARK_PATH`, the same 96-
 * anchor path the `<app-logo>` and the SVG poster use — extruded and repeated
 * along the brand's own 24° axis. Viewed face-on the layers coincide and read as
 * the flat monogram. As scroll progress advances they separate, revealing that
 * the identity is composed rather than drawn.
 *
 * Layer edges are drawn as hairlines, echoing the 1px rules the CSS design
 * system is built from, so the WebGL and the DOM share a visual language rather
 * than merely coexisting.
 *
 * ## Rendering discipline
 *
 * The scene only ever *reads* progress. It never writes to the DOM, never
 * touches Angular, and never triggers change detection — which is what makes a
 * scroll-linked render loop affordable under zoneless change detection.
 */
export class StrataScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly root: Group;
  private readonly strata: Group[] = [];

  private readonly geometries: BufferGeometry[] = [];
  private readonly materials: (MeshBasicMaterial | LineBasicMaterial)[] = [];

  private frame = 0;
  private running = false;
  private disposed = false;

  /** Scroll position, 0 → 1. Written by the wrapper, read here each frame. */
  private progress = 0;
  private targetProgress = 0;

  private pointerX = 0;
  private pointerY = 0;
  private targetPointerX = 0;
  private targetPointerY = 0;

  constructor(private readonly options: StrataSceneOptions) {
    const { canvas, pixelRatioCap, surfaceColor } = options;

    this.renderer = new WebGLRenderer({
      canvas,
      // The composition is flat planes and straight hairlines at low contrast;
      // MSAA buys almost nothing here and costs real fill rate on mobile.
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio ?? 1, pixelRatioCap));
    this.renderer.setClearColor(new Color(surfaceColor), 0);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, 0, 14);

    this.root = new Group();
    this.scene.add(this.root);

    this.buildStrata();
    this.resize();
  }

  /**
   * Builds the layered mark.
   *
   * `ShapePath.toShapes()` handles the counters — the A's aperture and the
   * enclosed areas of the Y — as holes, so the extruded solid keeps the
   * letterforms readable instead of filling them in.
   */
  private buildStrata(): void {
    const shapePath = new ShapePath();
    parseSvgPath(AY_MARK_PATH, shapePath);
    // Three 0.185 dropped the isCCW argument; winding is inferred from the path.
    const shapes = shapePath.toShapes();

    if (shapes.length === 0) return;

    const { layers, inkColor } = this.options;
    const ink = new Color(inkColor);

    for (let i = 0; i < layers; i++) {
      const depth = layers - 1 - i;
      const isFront = depth === 0;

      const geometry = new ExtrudeGeometry(shapes, {
        depth: 6,
        bevelEnabled: false,
        curveSegments: 6,
      });
      // The SVG coordinate system is Y-down and the mark sits far from the
      // origin; centring here means the wrapper never has to know about it.
      geometry.center();
      geometry.scale(0.026, -0.026, 0.026);
      this.geometries.push(geometry);

      const group = new Group();

      // Only the front layer is solid. The rest are hairline outlines, so the
      // stack reads as drawn sheets rather than a stack of slabs — and costs
      // almost nothing to render.
      if (isFront) {
        const material = new MeshBasicMaterial({ color: ink, transparent: true, opacity: 1 });
        this.materials.push(material);
        group.add(new Mesh(geometry, material));
      } else {
        const edges = new EdgesGeometry(geometry, 20);
        this.geometries.push(edges);
        const material = new LineBasicMaterial({
          color: ink,
          transparent: true,
          opacity: Math.max(0.05, 0.34 - depth * 0.03),
        });
        this.materials.push(material);
        group.add(new LineSegments(edges, material));
      }

      group.userData['depth'] = depth;
      this.strata.push(group);
      this.root.add(group);
    }
  }

  /** Scroll progress, 0 → 1. Eased toward, never applied directly. */
  setProgress(value: number): void {
    this.targetProgress = Math.min(1, Math.max(0, value));
  }

  /** Pointer position in normalised device coordinates, −1 → 1. */
  setPointer(x: number, y: number): void {
    if (!this.options.pointerParallax) return;
    this.targetPointerX = Math.min(1, Math.max(-1, x));
    this.targetPointerY = Math.min(1, Math.max(-1, y));
  }

  resize(): void {
    const { canvas } = this.options;
    const width = canvas.clientWidth || 1;
    const height = canvas.clientHeight || 1;

    this.renderer.setSize(width, height, false);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.tick();
  }

  stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private tick = (): void => {
    if (!this.running || this.disposed) return;

    // Critically damped easing rather than raw values: scroll events arrive
    // unevenly, and interpolating here keeps motion smooth without the scene
    // needing to know anything about scroll velocity.
    this.progress += (this.targetProgress - this.progress) * 0.08;
    this.pointerX += (this.targetPointerX - this.pointerX) * 0.05;
    this.pointerY += (this.targetPointerY - this.pointerY) * 0.05;

    this.applyProgress();
    this.renderer.render(this.scene, this.camera);

    this.frame = requestAnimationFrame(this.tick);
  };

  /**
   * The whole choreography, as a pure function of progress.
   *
   * Because state lives entirely in `progress`, the scene is fully
   * deterministic: any scroll position produces exactly one composition, and
   * jumping (anchor links, restored scroll) lands correctly with no catch-up.
   */
  private applyProgress(): void {
    const p = this.progress;
    const sign = this.options.directionSign;

    // Act 1 → 2: layers separate along the 24° brand axis.
    //
    // The baseline is non-zero on purpose. Fully collapsed layers render as a
    // plain flat logo, which makes the WebGL upgrade *less* interesting than the
    // static poster it replaces — the depth has to be legible in the first five
    // seconds, before anyone has scrolled. Scrolling then opens it further.
    const RESTING_SEPARATION = 0.42;
    const separation = RESTING_SEPARATION + easeInOutCubic(Math.min(1, p / 0.55)) * 1.35;

    for (const group of this.strata) {
      const depth = group.userData['depth'] as number;
      const offset = depth * separation;

      group.position.set(
        sign * offset * Math.sin(BRAND_ANGLE_RAD),
        offset * Math.cos(BRAND_ANGLE_RAD) * 0.35,
        -offset,
      );
    }

    // Camera drifts from face-on to three-quarter, then settles.
    const orbit = easeInOutCubic(Math.min(1, p / 0.8));
    const yaw = sign * orbit * 0.42 + this.pointerX * 0.12;
    const pitch = orbit * 0.16 + this.pointerY * 0.08;

    this.root.rotation.set(pitch, yaw, 0);

    // A gentle push-in keeps the composition filling the frame as it spreads.
    this.camera.position.z = 14 - orbit * 2.2;
  }

  dispose(): void {
    this.stop();
    this.disposed = true;

    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();

    this.geometries.length = 0;
    this.materials.length = 0;
    this.strata.length = 0;

    this.renderer.dispose();
    // Browsers cap simultaneous WebGL contexts. Releasing explicitly means
    // navigating away and back cannot exhaust them.
    this.renderer.forceContextLoss();
  }
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Minimal SVG path parser for the subset the mark uses.
 *
 * Three ships `SVGLoader` for this, but it pulls in a large module to read one
 * string that is already a compile-time constant. The mark uses only `M`, `c`,
 * `l`, and `z` (verified against `logo-path.ts`), so a focused parser is both
 * smaller and easier to reason about.
 */
function parseSvgPath(d: string, target: ShapePath): void {
  const tokens = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e[-+]?\d+)?/g);
  if (!tokens) return;

  let i = 0;
  let command = '';
  let x = 0;
  let y = 0;
  let startX = 0;
  let startY = 0;

  const num = () => Number.parseFloat(tokens[i++]);

  while (i < tokens.length) {
    if (/[a-zA-Z]/.test(tokens[i])) {
      command = tokens[i++];
      if (command === 'z' || command === 'Z') {
        x = startX;
        y = startY;
        continue;
      }
    }

    switch (command) {
      case 'M':
        x = num();
        y = num();
        startX = x;
        startY = y;
        target.moveTo(x, y);
        command = 'L';
        break;
      case 'm':
        x += num();
        y += num();
        startX = x;
        startY = y;
        target.moveTo(x, y);
        command = 'l';
        break;
      case 'L':
        x = num();
        y = num();
        target.lineTo(x, y);
        break;
      case 'l':
        x += num();
        y += num();
        target.lineTo(x, y);
        break;
      case 'C': {
        const x1 = num();
        const y1 = num();
        const x2 = num();
        const y2 = num();
        x = num();
        y = num();
        target.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      case 'c': {
        const x1 = x + num();
        const y1 = y + num();
        const x2 = x + num();
        const y2 = y + num();
        x += num();
        y += num();
        target.bezierCurveTo(x1, y1, x2, y2, x, y);
        break;
      }
      default:
        // Unknown command: skip the token rather than loop forever.
        i++;
        break;
    }
  }
}
