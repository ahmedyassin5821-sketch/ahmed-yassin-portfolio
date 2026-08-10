import {
  AmbientLight,
  Color,
  CylinderGeometry,
  DirectionalLight,
  Group,
  LatheGeometry,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  WebGLRenderer,
} from 'three';

import { SculptureKind } from '@data/models/project.model';

export interface SculptureSceneOptions {
  readonly canvas: HTMLCanvasElement;
  readonly kind: SculptureKind;
  /** The project's own accent, so the object belongs to the brand it sits under. */
  readonly accent: string;
  readonly glow: string;
  readonly pixelRatioCap: number;
  readonly pointerParallax: boolean;
}

/**
 * One small object, built from primitives, for one project's page.
 *
 * ## What is here and what deliberately is not
 *
 * A perfume flacon for Vivace and a coffee bean for Nader Coffee. Both are things
 * those businesses actually sell, and both can be built honestly out of a lathe and
 * a displaced sphere — no model file, no loader, no second 3D library, nothing added
 * to `package.json`.
 *
 * There is no object for the other five projects, and that is a decision rather
 * than an omission. A jacket, an HR platform, an electronics catalogue and a
 * mangrove nursery have no shape that can be made from primitives without either
 * looking like a toy or collapsing into an abstract blob — and an abstract blob
 * standing in for a business says nothing about it. The brief allowed for exactly
 * this: if it cannot be done without a huge dependency or a fake-looking result,
 * do not force it.
 *
 * ## Matte, not glass
 *
 * A transparent material needs an environment to refract, and without one it
 * renders as grey soup. These are lit as solid matte sculpture in the brand's own
 * accent — closer to a display object in a shop window than to a product render,
 * which is also the right register for something sitting beside real screenshots.
 *
 * Framework-free on purpose: no Angular import, so `three` stays in the deferred
 * chunk this file lives in.
 */
export class SculptureScene {
  private readonly renderer: WebGLRenderer;
  private readonly scene = new Scene();
  private readonly camera: PerspectiveCamera;
  private readonly pivot = new Group();
  private readonly canvas: HTMLCanvasElement;
  private readonly pointerParallax: boolean;

  private readonly pointer = new Vector2(0, 0);
  private readonly pointerTarget = new Vector2(0, 0);

  /** 0→1 through the object's own passage of the page. Drives a slow turn. */
  private scroll = 0;
  private scrollEased = 0;

  private frame = 0;
  private elapsed = 0;
  private lastTime = 0;
  private running = false;
  private disposed = false;

  constructor(private readonly options: SculptureSceneOptions) {
    this.canvas = options.canvas;
    this.pointerParallax = options.pointerParallax;

    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      // The page's tinted paper shows through, so the object sits on the brand's
      // surface rather than in a grey box of its own.
      alpha: true,
      powerPreference: 'low-power',
    });
    this.renderer.setClearAlpha(0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, options.pixelRatioCap));

    this.camera = new PerspectiveCamera(30, 1, 0.1, 40);
    this.camera.position.set(0, 0, 5.4);

    this.scene.add(this.pivot);
    this.buildLights();
    this.buildObject();
    this.resize();
  }

  get isBuilt(): boolean {
    return this.pivot.children.length > 0;
  }

  private buildLights(): void {
    // Enough ambient that the silhouette never goes to black on a light page, and
    // one key plus one rim so the form is legible as a form.
    this.scene.add(new AmbientLight(new Color(0xffffff), 1.15));

    const key = new DirectionalLight(new Color(0xffffff), 2.1);
    key.position.set(-2.4, 3.2, 3.0);
    this.scene.add(key);

    const rim = new DirectionalLight(new Color(this.options.glow), 1.5);
    rim.position.set(2.6, -1.2, -2.0);
    this.scene.add(rim);
  }

  private buildObject(): void {
    const material = new MeshStandardMaterial({
      color: new Color(this.options.accent),
      roughness: 0.42,
      metalness: 0.06,
    });

    const mesh =
      this.options.kind === 'perfume-bottle'
        ? this.buildBottle(material)
        : this.buildBean(material);

    this.pivot.add(mesh);
  }

  /**
   * A flacon: a solid of revolution, which is what a bottle actually is.
   *
   * The profile runs bottom to top in the XY plane and `LatheGeometry` revolves it.
   * Squat and square-shouldered rather than tall and slim — the niche-perfume
   * proportion, and it also reads at small sizes, which a slender neck does not.
   */
  private buildBottle(material: MeshStandardMaterial): Group {
    const group = new Group();

    const profile = [
      new Vector2(0.0, -1.0),
      new Vector2(0.5, -1.0),
      new Vector2(0.62, -0.9),
      new Vector2(0.66, -0.3),
      new Vector2(0.64, 0.06),
      new Vector2(0.5, 0.3),
      new Vector2(0.22, 0.46),
      new Vector2(0.17, 0.62),
      new Vector2(0.0, 0.62),
    ];

    const body = new Mesh(new LatheGeometry(profile, 96), material);
    group.add(body);

    // The collar, then the stopper. Two primitives, because a lathe cannot leave
    // the gap between the neck and the cap that makes it read as a bottle.
    const collar = new Mesh(new TorusGeometry(0.19, 0.035, 16, 64), material);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.6;
    group.add(collar);

    const cap = new Mesh(new CylinderGeometry(0.26, 0.24, 0.34, 64), material);
    cap.position.y = 0.8;
    group.add(cap);

    return group;
  }

  /**
   * A coffee bean: an ellipsoid with the crease pressed into one face.
   *
   * Not a solid of revolution — the groove is the whole reason it reads as a bean
   * rather than as a pebble — so it is a sphere whose vertices are displaced. The
   * falloff is a gaussian around the bean's long axis, and the axis itself waves
   * gently, because a dead-straight crease looks machined.
   */
  private buildBean(material: MeshStandardMaterial): Group {
    const group = new Group();
    const geometry = new SphereGeometry(1, 128, 96);
    const position = geometry.attributes['position'];

    for (let i = 0; i < position.count; i++) {
      // Bean proportions first, then the crease, so the groove is measured in the
      // shape the reader actually sees.
      const bx = position.getX(i);
      const by = position.getY(i) * 0.62;
      const bz = position.getZ(i) * 0.72;

      // The crease runs along the long axis on the +Z face only, and drifts a
      // little in Y because a dead-straight groove looks machined.
      //
      // Two things here were got wrong first time and are worth stating. The
      // displacement is scaled by how far *forward* a vertex already is, so the
      // back hemisphere is untouched and there is no discontinuity at bz = 0 —
      // a `Math.sign()` there put a visible spike on the silhouette. And the depth
      // is 0.2 of a 0.72 half-depth, not 0.42: cut that deep the groove reached
      // past the centre and the bean read as split open, more pistachio than
      // coffee. Rendered and looked at, both times.
      const axis = by - 0.07 * Math.sin(bx * 2.0);
      const falloff = Math.exp(-(axis * axis) / 0.02);
      const forward = Math.max(0, bz) / 0.72;

      position.setXYZ(i, bx, by, bz - 0.2 * falloff * forward);
    }

    position.needsUpdate = true;
    geometry.computeVertexNormals();

    const bean = new Mesh(geometry, material);
    // Creased face toward the reader, long axis on a diagonal — how a bean is
    // photographed, and the angle at which the groove is legible without the
    // silhouette losing its roundness.
    bean.rotation.set(-0.1, 0.2, 0.62);
    bean.scale.setScalar(1.2);
    group.add(bean);

    return group;
  }

  setPointer(x: number, y: number): void {
    if (!this.pointerParallax) return;
    this.pointerTarget.set(x, y);
  }

  /** 0→1 as the object crosses the viewport. */
  setScroll(value: number): void {
    this.scroll = Math.min(1, Math.max(0, value));
  }

  resize(): void {
    const { clientWidth, clientHeight } = this.canvas;
    if (clientWidth === 0 || clientHeight === 0) return;

    this.renderer.setSize(clientWidth, clientHeight, false);
    this.camera.aspect = clientWidth / clientHeight;
    this.camera.updateProjectionMatrix();
  }

  start(): void {
    if (this.running || this.disposed) return;
    this.running = true;
    this.lastTime = performance.now();
    this.frame = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    if (this.frame) cancelAnimationFrame(this.frame);
    this.frame = 0;
  }

  private readonly tick = (now: number): void => {
    if (!this.running) return;

    // Delta-timed rather than per-frame, so the drift is the same speed on a 60Hz
    // and a 144Hz display.
    const delta = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;
    this.elapsed += delta;

    // Slow. This is an object breathing in a shop window, not a spinning logo:
    // a full turn takes a little over a minute.
    this.pivot.rotation.y += delta * 0.1;

    // Both inputs are damped toward their target, so a flicked pointer or a fast
    // scroll arrives as a lean rather than a jolt.
    this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.001, delta));
    this.scrollEased += (this.scroll - this.scrollEased) * (1 - Math.pow(0.02, delta));

    this.pivot.rotation.x = this.pointer.y * 0.16 + this.scrollEased * 0.28 - 0.14;
    this.pivot.rotation.z = this.pointer.x * -0.06;
    this.pivot.position.y = Math.sin(this.elapsed * 0.5) * 0.08;

    this.renderer.render(this.scene, this.camera);
    this.frame = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    this.stop();
    this.disposed = true;

    this.pivot.traverse((child) => {
      if (!(child instanceof Mesh)) return;
      child.geometry.dispose();
      const material = child.material;
      if (Array.isArray(material)) material.forEach((m) => m.dispose());
      else material.dispose();
    });

    this.renderer.dispose();
  }
}
