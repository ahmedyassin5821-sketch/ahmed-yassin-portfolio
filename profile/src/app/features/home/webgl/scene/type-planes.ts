import {
  CanvasTexture,
  Group,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  SRGBColorSpace,
} from 'three';

import { TypePlaneSpec } from '../../animation/corridor-layout';

/** Texture height in device pixels. 2× the largest on-screen size. */
const TEXTURE_HEIGHT = 256;

/** Sheets closer than this dissolve rather than clip through the camera. */
const NEAR_FADE_DISTANCE = 8;

/** Ghosted: the DOM copy of each word is the one meant to be read. */
const PEAK_OPACITY = 0.13;

export interface TypePlanesOptions {
  readonly specs: readonly TypePlaneSpec[];
  readonly inkColor: string;
  /** Mirrors lateral placement in RTL. Glyphs themselves are never mirrored. */
  readonly directionSign: 1 | -1;
  /** Resolved from the document, so the scene uses the page's real typeface. */
  readonly fontFamily: string;
}

interface TypePlane {
  readonly mesh: Mesh;
  readonly z: number;
  readonly spec: TypePlaneSpec;
}

/**
 * The headline typography that lives *inside* the corridor.
 *
 * ## Why these words are textures rather than DOM
 *
 * DOM text sits above the canvas in the stacking order, so it can never be
 * occluded by a nearer 3D layer — which is exactly the effect that sells the
 * corridor. A word the camera flies past has to be *in* the scene.
 *
 * The alternative, `TextGeometry`, needs a font loader and a typeface converted
 * to Three's own JSON format — a second copy of the type system that would drift
 * from the real one. Drawing to a 2D canvas instead uses the page's actual
 * computed font, costs no extra bytes, and stays correct when the type system
 * changes.
 *
 * ## These words are never the only copy
 *
 * Every string here also exists as real DOM text in the matching act. This layer
 * is decorative and additive: with WebGL unavailable, under reduced motion, or
 * for a screen reader, the same words are read from the document.
 */
export class TypePlanes {
  readonly root = new Group();

  private readonly planes: TypePlane[] = [];
  private readonly textures: CanvasTexture[] = [];
  private readonly materials: MeshBasicMaterial[] = [];
  private readonly geometries: PlaneGeometry[] = [];

  constructor(private readonly options: TypePlanesOptions) {
    this.build();
  }

  private build(): void {
    const { specs, directionSign } = this.options;

    for (const spec of specs) {
      const texture = this.draw(spec.text);
      if (!texture) continue;
      this.textures.push(texture);

      // Aspect comes from the drawn canvas, so a long word is a long plane
      // rather than a squashed one.
      const aspect = texture.image.width / texture.image.height;
      // Monumental and deliberately cropped by the viewport. At 2.2 these read
      // as captions floating beside the DOM heading — two versions of the same
      // string competing at the same size, which looked like a mistake. At this
      // scale the word is architecture the camera moves through: only ever
      // partly visible, so it is felt rather than read.
      const height = 16 * spec.scale;
      const geometry = new PlaneGeometry(height * aspect, height);
      this.geometries.push(geometry);

      const material = new MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        // Ghosted on purpose. The DOM copy of every one of these words is the
        // one that must be read; this is architecture the reader moves through,
        // and at full strength it would compete with the text it belongs to.
        opacity: PEAK_OPACITY,
      });
      this.materials.push(material);

      const mesh = new Mesh(geometry, material);
      mesh.position.set(spec.offsetX * directionSign, 0, spec.z);

      this.planes.push({ mesh, z: spec.z, spec });
      this.root.add(mesh);
    }
  }

  /** Renders one word to a canvas texture using the page's own typeface. */
  private draw(text: string): CanvasTexture | null {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return null;

    const fontSize = TEXTURE_HEIGHT * 0.72;
    const font = `600 ${fontSize}px ${this.options.fontFamily}`;

    // Measure first so the canvas is exactly the width of the word — a fixed
    // canvas would letterbox short words and clip long ones.
    context.font = font;
    const width = Math.ceil(context.measureText(text).width) + 32;

    canvas.width = width;
    canvas.height = TEXTURE_HEIGHT;

    // Re-applied: resizing a canvas resets its 2D context state.
    context.font = font;
    context.fillStyle = this.options.inkColor;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, width / 2, TEXTURE_HEIGHT / 2);

    const texture = new CanvasTexture(canvas);
    texture.colorSpace = SRGBColorSpace;
    // The plane is only ever viewed near 1:1 or smaller; mipmaps would cost
    // memory and blur the hairline-weight strokes.
    texture.minFilter = LinearFilter;
    texture.generateMipmaps = false;
    return texture;
  }

  /**
   * Pure function of scroll position and camera depth.
   *
   * Two independent gates: the act window decides whether a word belongs on
   * screen at all, and the near-fade dissolves it as the camera arrives.
   */
  update(progress: number, cameraZ: number): void {
    for (const plane of this.planes) {
      const distance = cameraZ - plane.z;
      // Behind the camera, or so close it would clip: hide entirely.
      const near = Math.min(1, Math.max(0, distance / NEAR_FADE_DISTANCE));
      const inAct = progress >= plane.spec.from && progress <= plane.spec.to;
      const material = plane.mesh.material as MeshBasicMaterial;
      material.opacity = inAct ? near * PEAK_OPACITY : 0;
      plane.mesh.visible = inAct && near > 0.01;
    }
  }

  dispose(): void {
    for (const texture of this.textures) texture.dispose();
    for (const material of this.materials) material.dispose();
    for (const geometry of this.geometries) geometry.dispose();
    this.textures.length = 0;
    this.materials.length = 0;
    this.geometries.length = 0;
    this.planes.length = 0;
  }
}
