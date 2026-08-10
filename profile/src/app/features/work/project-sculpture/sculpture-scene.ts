import {
  AmbientLight,
  BoxGeometry,
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

/**
 * How far back the camera sits, per object.
 *
 * The band these sit in is ~160px tall, so "roughly fills the frame" is the whole
 * difference between an object and a speck. Tuned by rendering each one, not by
 * arithmetic on bounding boxes.
 */
const CAMERA_DISTANCE: Record<SculptureKind, number> = {
  'perfume-bottle': 4.1,
  'coffee-bean': 4.4,
  jacket: 4.6,
};

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

    this.camera = new PerspectiveCamera(34, 1, 0.1, 40);
    // Framed per object, because they are not the same shape. A bottle is tall and
    // narrow, a bean is wide and flat, a garment is tall and wide — one distance for
    // all three left each of them small in the middle of the band with air around it.
    this.camera.position.set(0, 0, CAMERA_DISTANCE[options.kind]);

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

    const builders = {
      'perfume-bottle': () => this.buildBottle(material),
      'coffee-bean': () => this.buildBean(material),
      jacket: () => this.buildJacket(material),
    };

    this.pivot.add(builders[this.options.kind]());
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

    // A finer profile than the first pass, which was a plain squat cylinder with a
    // lid. This one has the details that make a flacon read as one: a chamfer off
    // the base, a slight waist, a pronounced shoulder into the neck, and a rolled
    // lip under the stopper. Each is two or three points on the profile — the whole
    // object is still one revolve.
    const profile = [
      new Vector2(0.0, -1.0),
      new Vector2(0.44, -1.0),
      new Vector2(0.56, -0.94), // chamfer off the base
      new Vector2(0.6, -0.84),
      new Vector2(0.615, -0.5),
      new Vector2(0.6, -0.16), // the waist
      new Vector2(0.615, 0.1),
      new Vector2(0.6, 0.26),
      new Vector2(0.5, 0.38), // shoulder
      new Vector2(0.33, 0.46),
      new Vector2(0.2, 0.52),
      new Vector2(0.175, 0.6),
      new Vector2(0.2, 0.64), // rolled lip
      new Vector2(0.19, 0.68),
      new Vector2(0.0, 0.68),
    ];

    const body = new Mesh(new LatheGeometry(profile, 128), material);
    group.add(body);

    // A translucent inner shell was tried here to suggest glass and removed: without
    // an environment to refract, it only greyed the form and cost the profile its
    // crispness. The refined silhouette plus the rim light is what reads.
    const collar = new Mesh(new TorusGeometry(0.205, 0.028, 20, 80), material);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = 0.585;
    group.add(collar);

    // The stopper: a tapered cap with its own chamfer, not a plain cylinder.
    const cap = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.0, 0.0),
          new Vector2(0.2, 0.0),
          new Vector2(0.245, 0.045),
          new Vector2(0.25, 0.24),
          new Vector2(0.225, 0.3),
          new Vector2(0.0, 0.31),
        ],
        96,
      ),
      material,
    );
    cap.position.y = 0.66;
    group.add(cap);

    return group;
  }

  /**
   * A jacket on a hanger.
   *
   * Sprint 9 left Designed by G without an object on the grounds that a garment
   * cannot be built from primitives without becoming a blob. Asked for it directly,
   * this is the honest attempt: a torso lathed from a garment silhouette — wide at
   * the shoulder, in at the waist, flaring at the hem — with two tapered sleeves,
   * a collar, and the opening down the front cut as a recessed placket.
   *
   * It reads as a hanging garment rather than as a person: no head, no hands, and it
   * hangs from a visible hanger hook, which is what fixes the scale and tells the eye
   * what kind of object it is looking at.
   */
  private buildJacket(material: MeshStandardMaterial): Group {
    const group = new Group();

    // What makes a garment read at this size is its OUTLINE: wide shoulders, a waist,
    // and two sleeves clearly outside the body. The first attempt kept the sleeves
    // tucked against a near-circular torso and the whole thing read as a canister.
    // So the torso is strongly flattened and the shoulders are the widest point by a
    // clear margin.
    const torso = new Mesh(
      new LatheGeometry(
        [
          new Vector2(0.0, -0.86),
          new Vector2(0.46, -0.84), // hem
          new Vector2(0.44, -0.5),
          new Vector2(0.38, -0.1), // waist
          new Vector2(0.44, 0.24),
          new Vector2(0.5, 0.5), // chest into the shoulder
          new Vector2(0.46, 0.6),
          new Vector2(0.17, 0.64), // neck opening
          new Vector2(0.16, 0.7),
          new Vector2(0.0, 0.7),
        ],
        96,
      ),
      material,
    );
    // A garment is not a solid of revolution. Flattened hard front-to-back, which is
    // the single change that stops it reading as a vase.
    torso.scale.set(1, 1, 0.44);
    group.add(torso);

    // Sleeves, hanging outside the silhouette and angled away from the body — the
    // detail that makes the outline unmistakably a garment.
    for (const side of [-1, 1]) {
      const sleeve = new Mesh(new CylinderGeometry(0.155, 0.115, 0.98, 28), material);
      sleeve.position.set(side * 0.6, -0.02, 0);
      sleeve.rotation.z = side * 0.3;
      sleeve.scale.set(1, 1, 0.6);
      group.add(sleeve);

      // The shoulder join, so the sleeve does not look bolted on.
      const shoulder = new Mesh(new SphereGeometry(0.17, 24, 16), material);
      shoulder.position.set(side * 0.44, 0.42, 0);
      shoulder.scale.set(1, 1, 0.55);
      group.add(shoulder);
    }

    // Collar and the placket down the front: outerwear rather than a shirt.
    const collar = new Mesh(new TorusGeometry(0.2, 0.055, 16, 48), material);
    collar.rotation.x = Math.PI / 2;
    collar.position.set(0, 0.63, 0);
    collar.scale.set(1, 1, 0.5);
    group.add(collar);

    const placket = new Mesh(new BoxGeometry(0.05, 1.44, 0.04), material);
    placket.position.set(0, -0.1, 0.2);
    group.add(placket);

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

      // The crease runs along the long axis, drifting a little in Y because a
      // dead-straight groove looks machined.
      //
      // On BOTH faces, and that is the third correction here. A real bean has its
      // deep crease on one side and a shallower ridge on the other, and once the
      // object turns continuously the back face is on screen half the time — creased
      // only at the front, it rotated round to a plain brown ellipsoid. The front
      // groove stays the deeper of the two so the bean still has a right way up.
      //
      // The two earlier corrections, both found by rendering: the displacement is
      // scaled by how far a vertex already is from the centre plane, so there is no
      // discontinuity at bz = 0 — a `Math.sign()` there put a visible spike on the
      // silhouette — and the depth is a fifth of the half-depth, not more than half,
      // which cut through and made it read as split open.
      const axis = by - 0.07 * Math.sin(bx * 2.0);
      const falloff = Math.exp(-(axis * axis) / 0.02);
      const depth = bz > 0 ? 0.2 : 0.12;
      const away = Math.abs(bz) / 0.72;

      position.setXYZ(i, bx, by, bz - Math.sign(bz) * depth * falloff * away);
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

    // Turning on its own axis, continuously, always — the object is never static.
    // A full revolution takes ~24 seconds: fast enough that the form is legible
    // from every side within a few seconds of arriving, slow enough that it reads as
    // a display piece rotating rather than as a spinning icon.
    //
    // This accumulates rather than being derived from scroll, so it keeps turning
    // while the reader sits still. Pointer and scroll only *lean* it (below); they
    // never drive the rotation, which is why letting go of the mouse does not stop
    // the object.
    this.pivot.rotation.y += delta * 0.26;

    // Both inputs are damped toward their target, so a flicked pointer or a fast
    // scroll arrives as a lean rather than a jolt.
    this.pointer.lerp(this.pointerTarget, 1 - Math.pow(0.001, delta));
    this.scrollEased += (this.scroll - this.scrollEased) * (1 - Math.pow(0.02, delta));

    // A gentle nod on the cross axis as well, so a silhouette that is symmetric
    // about its own vertical axis — a bottle, a bean — still changes as it turns.
    this.pivot.rotation.x =
      Math.sin(this.elapsed * 0.22) * 0.08 + this.pointer.y * 0.16 + this.scrollEased * 0.2 - 0.1;
    this.pivot.rotation.z = this.pointer.x * -0.06;
    this.pivot.position.y = Math.sin(this.elapsed * 0.5) * 0.07;

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
