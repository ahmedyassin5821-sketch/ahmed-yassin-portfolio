import { Injectable, computed, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { isBrowser } from './is-browser';
import { MotionPreferenceService } from './motion-preference.service';
import { ViewportService } from './viewport.service';

interface NetworkInformation {
  readonly saveData?: boolean;
  readonly effectiveType?: string;
}

/**
 * Whether this device should be asked to run WebGL.
 *
 * The scene is an enhancement, never a requirement, so the gate is deliberately
 * conservative: it is better to show the static composition to a capable device
 * than to hand a struggling one a scroll-linked render loop.
 *
 * All checks are browser-only. During SSR every signal reports the cautious
 * answer, so server-rendered HTML is always the static version and the browser
 * only ever upgrades it.
 */
@Injectable({ providedIn: 'root' })
export class DeviceCapabilityService {
  private readonly doc = inject(DOCUMENT);
  private readonly browser = isBrowser();
  private readonly motion = inject(MotionPreferenceService);
  private readonly viewport = inject(ViewportService);

  /** Cached: creating a probe context is not free, and the answer cannot change. */
  private webgl2Support: boolean | null = null;

  /**
   * The single gate the WebGL layer consults.
   *
   * Reduced motion is included here rather than handled inside the scene: a
   * scene that exists but refuses to move is still a WebGL context, a render
   * loop, and ~120KB of JavaScript for no benefit. Not building it is the
   * honest interpretation of the preference.
   */
  readonly canRunWebGL = computed(() => {
    if (!this.browser) return false;
    if (this.motion.prefersReduced()) return false;
    if (this.prefersLightweight()) return false;
    return this.supportsWebGL2();
  });

  /** Fewer strata, lower pixel ratio, no pointer parallax. */
  readonly isLowPower = computed(() => !this.viewport.isDesktop() || this.hasLimitedHardware());

  /** Pointer parallax only where a pointer can hover accurately. */
  readonly allowsPointerParallax = computed(
    () => this.viewport.isFinePointer() && !this.isLowPower(),
  );

  /** Capped so a high-DPI phone does not render four times the pixels it needs. */
  readonly pixelRatioCap = computed(() => (this.isLowPower() ? 1.5 : 2));

  private supportsWebGL2(): boolean {
    if (this.webgl2Support !== null) return this.webgl2Support;

    try {
      const canvas = this.doc.createElement('canvas');
      const gl = canvas.getContext('webgl2');
      this.webgl2Support = gl !== null;
      // Release the probe immediately. Browsers cap simultaneous WebGL contexts,
      // and a leaked probe can cost the real scene its context.
      if (gl) gl.getExtension('WEBGL_lose_context')?.loseContext();
    } catch {
      this.webgl2Support = false;
    }

    return this.webgl2Support;
  }

  /**
   * Data Saver, or hardware that reports itself as modest.
   *
   * `deviceMemory` and `hardwareConcurrency` are absent on Safari, so a missing
   * value is treated as acceptable — refusing to render whenever a browser
   * declines to self-report would disable the scene across all of iOS.
   */
  private prefersLightweight(): boolean {
    const nav = this.doc.defaultView?.navigator as
      | (Navigator & { connection?: NetworkInformation })
      | undefined;

    return nav?.connection?.saveData === true;
  }

  private hasLimitedHardware(): boolean {
    const nav = this.doc.defaultView?.navigator as
      | (Navigator & { deviceMemory?: number })
      | undefined;
    if (!nav) return true;

    const memory = nav.deviceMemory;
    const cores = nav.hardwareConcurrency;

    if (typeof memory === 'number' && memory < 4) return true;
    if (typeof cores === 'number' && cores < 4) return true;
    return false;
  }
}
