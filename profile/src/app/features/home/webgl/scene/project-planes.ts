import {
  Group,
  LinearFilter,
  LineBasicMaterial,
  LineSegments,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  Texture,
  WireframeGeometry,
} from 'three';

import { easeInOutCubic, lerp, normalise } from '../../animation/easing';
import { ProjectPlaneSpec } from '../../animation/corridor-layout';

const NEAR_FADE_DISTANCE = 10;

/**
 * Screenshots in the scene are peripheral scenery, not the presentation.
 *
 * The DOM carries a full editorial plate for every project; these pass at the
 * edges of the frame to give the corridor something to move against. Held low
 * because at higher strength the same screenshot appeared twice on screen.
 */
const PEAK_OPACITY = 0.26;

/** Only load a plane's texture once the camera is within this many units. */
const PRELOAD_DISTANCE = 90;

/**
 * How much scroll the lead plane's presentation occupies before its gate.
 *
 * This is the hand-off. Over this window the lead plane leaves the periphery,
 * rotates square to the camera and scales up, so when the gate's DOM plate lands
 * it reads as the same object arriving rather than a new panel fading in.
 */
const HANDOFF_WINDOW = 0.06;

/** How much larger the lead plane grows as it presents. */
const HANDOFF_SCALE = 3.2;

export interface ProjectPlanesOptions {
  readonly specs: readonly ProjectPlaneSpec[];
  readonly directionSign: 1 | -1;
  readonly inkColor: string;
  /**
   * How many textures may be resident at once. Desktop holds the whole set;
   * mobile keeps a small window so a mid-range phone is never asked to hold
   * seven full-size uploads.
   */
  readonly textureBudget: number;
}

interface Plane {
  readonly spec: ProjectPlaneSpec;
  readonly group: Group;
  readonly mesh: Mesh;
  readonly material: MeshBasicMaterial;
  /** Resting pose, so the hand-off can interpolate away from it and back. */
  readonly baseX: number;
  readonly baseRotationY: number;
  texture: Texture | null;
  requested: boolean;
}

/**
 * Project screenshots as physical planes in the corridor.
 *
 * ## Loading discipline
 *
 * Textures are the `-800.webp` variants the Sprint 5 optimiser already emits —
 * no new assets and no second pipeline. They are decoded with
 * `createImageBitmap`, which happens off the main thread, and uploaded **one per
 * frame**: uploading several together is what produces the single long frame
 * that reads as a stutter exactly when the camera is moving fastest.
 *
 * A plane only requests its texture once the camera is within `PRELOAD_DISTANCE`,
 * and releases it once the camera is well past. That keeps resident memory bounded
 * by `textureBudget` rather than by the number of projects.
 *
 * ## Vivace
 *
 * A project with no imagery renders as a wireframe frame — the 3D equivalent of
 * the DOM's `MediaPlaceholder`. Never a stock image, never a borrowed
 * screenshot, never an invented one.
 *
 * ## Accessibility
 *
 * These are decorative. Every project's name, type, role and technologies are
 * real DOM text in the same act, and `/work` remains the complete presentation.
 */
export class ProjectPlanes {
  readonly root = new Group();

  private readonly planes: Plane[] = [];
  private readonly geometries: PlaneGeometry[] = [];
  private readonly materials: (MeshBasicMaterial | LineBasicMaterial)[] = [];
  private pendingUpload = false;
  private disposed = false;

  constructor(private readonly options: ProjectPlanesOptions) {
    this.build();
  }

  private build(): void {
    const { specs, directionSign, inkColor } = this.options;

    for (const spec of specs) {
      // The brand's own screenshot ratio, so a plane reads as a browser window.
      const width = 4.4;
      const geometry = new PlaneGeometry(width, width / 2.26);
      this.geometries.push(geometry);

      const material = new MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
      this.materials.push(material);

      const mesh = new Mesh(geometry, material);
      const group = new Group();
      group.add(mesh);

      if (!spec.src) {
        // Awaiting assets: an honest empty frame.
        const wireframe = new WireframeGeometry(geometry);
        const lineMaterial = new LineBasicMaterial({
          color: inkColor,
          transparent: true,
          opacity: 0.3,
        });
        this.materials.push(lineMaterial);
        group.add(new LineSegments(wireframe, lineMaterial));
      }

      const baseX = spec.offsetX * directionSign;
      // Angled toward the corridor centre, so a plane is read at a glance
      // rather than edge-on.
      const baseRotationY = -directionSign * Math.sign(spec.offsetX) * 0.35;

      group.position.set(baseX, spec.offsetY, spec.z);
      group.rotation.y = baseRotationY;

      this.planes.push({
        spec,
        group,
        mesh,
        material,
        baseX,
        baseRotationY,
        texture: null,
        requested: false,
      });
      this.root.add(group);
    }
  }

  /**
   * @param cameraZ current camera depth — drives both visibility and loading
   */
  update(progress: number, cameraZ: number): void {
    for (const plane of this.planes) {
      const distance = cameraZ - plane.spec.z;

      // Fade in from the far side, dissolve before the camera reaches it.
      const near = Math.min(1, Math.max(0, distance / NEAR_FADE_DISTANCE));
      const visible = distance > 0 && distance < PRELOAD_DISTANCE * 1.5;

      // Cleared entirely across the final act. A screenshot still hanging in the
      // corridor while the mark reconverges reads as debris: the ending has to
      // be the mark and nothing else for the close to feel deliberate.
      const resolveFade = 1 - Math.min(1, Math.max(0, (progress - 0.88) / 0.05));

      // The hand-off, for the lead plane only.
      //
      // 0 while it is scenery, 1 at the instant the gate's DOM takes over. Its
      // own `isLead` flag gates this, so the supporting planes keep drifting past
      // at the frame edges and only one object ever claims the centre.
      const present = plane.spec.isLead
        ? easeInOutCubic(
            normalise(progress, plane.spec.gateAt - HANDOFF_WINDOW, plane.spec.gateAt),
          )
        : 0;

      if (present > 0) {
        // Leaves the periphery for the camera axis and squares up to it.
        plane.group.position.x = lerp(plane.baseX, 0, present);
        plane.group.position.y = lerp(plane.spec.offsetY, 0, present);
        plane.group.rotation.y = lerp(plane.baseRotationY, 0, present);
        const scale = lerp(1, HANDOFF_SCALE, present);
        plane.group.scale.setScalar(scale);
      } else {
        plane.group.position.x = plane.baseX;
        plane.group.position.y = plane.spec.offsetY;
        plane.group.rotation.y = plane.baseRotationY;
        plane.group.scale.setScalar(1);
      }

      // A presenting plane rises well above scenery opacity — it is the subject
      // for a moment — then the DOM plate lands and it dissolves with the rest.
      const peak = PEAK_OPACITY + (0.92 - PEAK_OPACITY) * present;

      // The near-fade is released as the plane presents. It exists to stop a
      // plane clipping through the camera, but it dims by proximity — which is
      // exactly backwards during a hand-off, where the plane must be at its
      // most present at the instant it is closest.
      const nearTerm = near + (1 - near) * present;

      plane.material.opacity = plane.texture ? nearTerm * peak * resolveFade : 0;
      plane.group.visible = visible && nearTerm > 0.01 && resolveFade > 0.01;

      if (visible && distance < PRELOAD_DISTANCE) this.request(plane);
    }
  }

  /** Queues one texture at a time; the rest wait for the next frame. */
  private request(plane: Plane): void {
    if (plane.requested || !plane.spec.src || this.pendingUpload || this.disposed) return;
    if (this.resident() >= this.options.textureBudget) return;

    plane.requested = true;
    this.pendingUpload = true;

    void this.load(plane.spec.src)
      .then((texture) => {
        if (this.disposed || !texture) return;
        plane.texture = texture;
        plane.material.map = texture;
        plane.material.needsUpdate = true;
      })
      .catch(() => {
        // A texture that fails to decode leaves the plane invisible rather than
        // black. The composition is unaffected; nothing else depends on it.
      })
      .finally(() => {
        this.pendingUpload = false;
      });
  }

  private async load(src: string): Promise<Texture | null> {
    const response = await fetch(src);
    if (!response.ok) return null;

    // Decoded off the main thread — the whole point of using ImageBitmap here.
    const bitmap = await createImageBitmap(await response.blob());
    if (this.disposed) {
      bitmap.close();
      return null;
    }

    const texture = new Texture(bitmap as unknown as HTMLImageElement);
    texture.colorSpace = SRGBColorSpace;
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.needsUpdate = true;
    return texture;
  }

  private resident(): number {
    return this.planes.reduce((n, p) => n + (p.texture ? 1 : 0), 0);
  }

  dispose(): void {
    this.disposed = true;

    for (const plane of this.planes) {
      plane.texture?.dispose();
      plane.texture = null;
    }
    for (const geometry of this.geometries) geometry.dispose();
    for (const material of this.materials) material.dispose();

    this.geometries.length = 0;
    this.materials.length = 0;
    this.planes.length = 0;
  }
}
