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

import { ProjectPlaneSpec } from '../../animation/corridor-layout';

const NEAR_FADE_DISTANCE = 10;

/**
 * Screenshots in the scene sit behind the DOM cards that carry the real,
 * accessible presentation. Held well below full strength so the two read as
 * foreground and background rather than as a collision.
 */
const PEAK_OPACITY = 0.5;

/** Only load a plane's texture once the camera is within this many units. */
const PRELOAD_DISTANCE = 90;

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

      group.position.set(spec.offsetX * directionSign, spec.offsetY, spec.z);
      // Angled toward the corridor centre, so a plane is read at a glance
      // rather than edge-on.
      group.rotation.y = -directionSign * Math.sign(spec.offsetX) * 0.35;

      this.planes.push({ spec, group, mesh, material, texture: null, requested: false });
      this.root.add(group);
    }
  }

  /**
   * @param cameraZ current camera depth — drives both visibility and loading
   */
  update(cameraZ: number): void {
    for (const plane of this.planes) {
      const distance = cameraZ - plane.spec.z;

      // Fade in from the far side, dissolve before the camera reaches it.
      const near = Math.min(1, Math.max(0, distance / NEAR_FADE_DISTANCE));
      const visible = distance > 0 && distance < PRELOAD_DISTANCE * 1.5;

      plane.material.opacity = plane.texture ? near * PEAK_OPACITY : 0;
      plane.group.visible = visible && near > 0.01;

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
