import { Color, Fog, Group, PerspectiveCamera, Scene, WebGLRenderer } from 'three';

import {
  CAMERA_PATH_DESKTOP,
  CORRIDOR,
  CAMERA_PATH_MOBILE,
  CameraKey,
  sampleCamera,
} from '../../animation/camera-path';
import { ProjectPlaneSpec, TypePlaneSpec } from '../../animation/corridor-layout';
import { MonogramLayers } from './monogram-layers';
import { ProjectPlanes } from './project-planes';
import { TypePlanes } from './type-planes';

export interface ApertureSceneOptions {
  readonly canvas: HTMLCanvasElement;
  readonly layers: number;
  readonly pixelRatioCap: number;
  readonly pointerParallax: boolean;
  /** Chooses the choreography, not merely the detail level. */
  readonly mobile: boolean;
  /** Negated in RTL so depth recedes with the reading direction. */
  readonly directionSign: 1 | -1;
  readonly inkColor: string;
  readonly surfaceColor: string;
  /** Headline words that live inside the corridor. */
  readonly typePlanes: readonly TypePlaneSpec[];
  /** Project screenshots hung past each gate. */
  readonly projectPlanes: readonly ProjectPlaneSpec[];
  /** The page's real typeface, so scene type matches DOM type. */
  readonly fontFamily: string;
  /** Maximum textures resident at once. */
  readonly textureBudget: number;
}

/**
 * THE APERTURE — the AY monogram as a corridor the reader travels through.
 *
 * ## The concept
 *
 * Face-on the mark reads as the flat identity. As the camera dollies forward the
 * sheets separate along the brand's own 24° axis, and then the camera passes
 * *through* the letterform. Everything after that point — the project count, the
 * three platform gates — is inside the monogram.
 *
 * ## Structure
 *
 * This file owns the renderer, the camera and the loop, and nothing else. Each
 * subsystem (`MonogramLayers` today; type and project planes next) builds and
 * disposes its own resources and exposes a single `update(progress, cameraZ)`.
 * Adding a subsystem must never require editing the loop.
 *
 * Framework-free on purpose: no Angular import anywhere under `scene/`, so the
 * whole thing is unit-testable, reasoned about in isolation, and deletable. The
 * Angular wrapper owns lifecycle and gating; this owns geometry and rendering.
 *
 * ## Rendering discipline
 *
 * The scene only ever *reads* progress. It never writes to the DOM, never
 * touches Angular, and never triggers change detection — which is what makes a
 * scroll-linked render loop affordable under zoneless change detection.
 */
export class ApertureScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene: Scene;
  private readonly camera: PerspectiveCamera;
  private readonly root = new Group();
  private readonly path: readonly CameraKey[];
  private readonly monogram: MonogramLayers;
  private readonly exitMark: MonogramLayers;
  private readonly type: TypePlanes;
  private readonly projects: ProjectPlanes;

  private frame = 0;
  private running = false;
  private disposed = false;

  /** Scroll position, 0 → 1. Written by the wrapper, eased toward here. */
  private progress = 0;
  private targetProgress = 0;

  private pointerX = 0;
  private pointerY = 0;
  private targetPointerX = 0;
  private targetPointerY = 0;

  constructor(private readonly options: ApertureSceneOptions) {
    const { canvas, pixelRatioCap, surfaceColor, mobile } = options;

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
    this.scene.add(this.root);

    // Atmospheric depth, and the single biggest thing separating a corridor from
    // a flat backdrop. Everything recedes into the page's own paper colour, so
    // distance is legible without a single new hue — depth cueing that stays
    // strictly inside a monochrome system.
    this.scene.fog = new Fog(new Color(surfaceColor).getHex(), 18, 110);

    // `far` must clear the whole corridor: the exit sits at z ≈ −186, and the
    // camera looks back along it from the start.
    this.camera = new PerspectiveCamera(38, 1, 0.1, 400);

    this.path = mobile ? CAMERA_PATH_MOBILE : CAMERA_PATH_DESKTOP;

    this.monogram = new MonogramLayers({
      layers: options.layers,
      inkColor: options.inkColor,
      directionSign: options.directionSign,
    });
    this.root.add(this.monogram.root);

    // The mirror of the opening: fully open while the reader travels, collapsing
    // back to the flat mark across the final act. The camera arrives squared up
    // on it, so the last thing seen is the first thing seen.
    this.exitMark = new MonogramLayers({
      layers: options.layers,
      inkColor: options.inkColor,
      directionSign: options.directionSign,
      phase: 'close',
      z: CORRIDOR.exit - 16,
      // Offset so the closing sentence beside it is read against paper.
      x: 2.4,
    });
    this.root.add(this.exitMark.root);

    this.type = new TypePlanes({
      specs: options.typePlanes,
      inkColor: options.inkColor,
      directionSign: options.directionSign,
      fontFamily: options.fontFamily,
    });
    this.root.add(this.type.root);

    this.projects = new ProjectPlanes({
      specs: options.projectPlanes,
      directionSign: options.directionSign,
      inkColor: options.inkColor,
      textureBudget: options.textureBudget,
    });
    this.root.add(this.projects.root);

    this.applyProgress();
    this.resize();
  }

  /** False when the mark produced no usable geometry — the caller keeps the poster. */
  get isBuilt(): boolean {
    return this.monogram.isBuilt;
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
    // needing to know anything about scroll velocity. This is the only mutable
    // state in the scene, and it only ever chases a value derived from scroll.
    this.progress += (this.targetProgress - this.progress) * 0.08;
    this.pointerX += (this.targetPointerX - this.pointerX) * 0.05;
    this.pointerY += (this.targetPointerY - this.pointerY) * 0.05;

    this.applyProgress();
    this.renderer.render(this.scene, this.camera);

    this.frame = requestAnimationFrame(this.tick);
  };

  /**
   * The whole composition, derived from one number.
   *
   * Because state lives entirely in `progress`, the scene is deterministic: any
   * scroll position produces exactly one frame, and jumping to it — anchor link,
   * restored scroll, refresh — lands correctly with no catch-up.
   */
  private applyProgress(): void {
    const p = this.progress;
    const key = sampleCamera(this.path, p);

    // Lateral offset mirrors in RTL, so the mark always sits away from the
    // reading edge rather than printing through the identity text.
    const lateral = key.x * this.options.directionSign;
    this.camera.position.set(lateral + this.pointerX * 0.4, key.y + this.pointerY * 0.25, key.z);
    this.camera.rotation.x = key.pitch + this.pointerY * 0.02;
    this.camera.rotation.y = this.pointerX * 0.03;

    if (this.camera.fov !== key.fov) {
      this.camera.fov = key.fov;
      this.camera.updateProjectionMatrix();
    }

    this.monogram.update(p, key.z);
    this.exitMark.update(p, key.z);
    this.type.update(p, key.z);
    this.projects.update(p, key.z);
  }

  dispose(): void {
    this.stop();
    this.disposed = true;

    this.monogram.dispose();
    this.exitMark.dispose();
    this.type.dispose();
    this.projects.dispose();

    this.renderer.dispose();
    // Browsers cap simultaneous WebGL contexts. Releasing explicitly means
    // navigating away and back cannot exhaust them.
    this.renderer.forceContextLoss();
  }
}
