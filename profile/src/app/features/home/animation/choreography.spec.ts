import { ACT_TIMELINE, GATE_ACTS, actAt, actById, actProgress } from './act-timeline';
import { CAMERA_PATH_DESKTOP, CAMERA_PATH_MOBILE, CameraKey, sampleCamera } from './camera-path';
import { clamp, easeInOutCubic, lerp, normalise, smoothstep } from './easing';

/**
 * The choreography is pure data and pure functions, so it is tested directly —
 * no renderer, no DOM, no WebGL. If the timing is wrong, it is wrong here.
 */
describe('act timeline', () => {
  it('covers 0 to 1 with no gap and no overlap', () => {
    expect(ACT_TIMELINE[0].start).toBe(0);
    expect(ACT_TIMELINE[ACT_TIMELINE.length - 1].end).toBe(1);

    for (let i = 1; i < ACT_TIMELINE.length; i++) {
      // A gap leaves the page in an undefined act; an overlap runs two at once.
      expect(ACT_TIMELINE[i].start).toBe(ACT_TIMELINE[i - 1].end);
    }
  });

  it('gives every act a positive duration', () => {
    for (const act of ACT_TIMELINE) {
      expect(act.end).toBeGreaterThan(act.start);
    }
  });

  it('resolves an act for every position, including the endpoints', () => {
    for (let p = 0; p <= 1.0001; p += 0.01) {
      expect(actAt(p)).toBeDefined();
    }

    expect(actAt(0).id).toBe('mark');
    expect(actAt(1).id).toBe('resolve');
    // Out-of-range input is clamped rather than returning undefined.
    expect(actAt(-5).id).toBe('mark');
    expect(actAt(9).id).toBe('resolve');
  });

  it('starts still, so the identity is readable before anything moves', () => {
    const mark = actById('mark');
    // Act 0 must be short but non-zero, and must be the first thing.
    expect(mark.start).toBe(0);
    expect(mark.end).toBeGreaterThan(0);
    expect(mark.end).toBeLessThanOrEqual(0.15);
  });

  it('reports progress within an act as 0 to 1', () => {
    const act = actById('count');

    expect(actProgress(act.start, act)).toBe(0);
    expect(actProgress(act.end, act)).toBe(1);
    expect(actProgress((act.start + act.end) / 2, act)).toBeCloseTo(0.5, 5);
    // Positions outside the act clamp rather than going negative.
    expect(actProgress(0, act)).toBe(0);
    expect(actProgress(1, act)).toBe(1);
  });

  it('derives exactly three platform gates, in travel order', () => {
    expect(GATE_ACTS.map((a) => a.platform)).toEqual(['angular', 'magento', 'shopify']);

    for (let i = 1; i < GATE_ACTS.length; i++) {
      expect(GATE_ACTS[i].start).toBeGreaterThanOrEqual(GATE_ACTS[i - 1].end);
    }
  });

  it('throws on an unknown act rather than returning undefined', () => {
    // Guards against a renamed act silently producing a dead component.
    expect(() => actById('nope' as never)).toThrow();
  });
});

describe('camera path', () => {
  const paths: readonly [string, readonly CameraKey[]][] = [
    ['desktop', CAMERA_PATH_DESKTOP],
    ['mobile', CAMERA_PATH_MOBILE],
  ];

  for (const [name, path] of paths) {
    describe(name, () => {
      it('has keys in ascending order spanning the whole scroll', () => {
        expect(path[0].at).toBe(0);
        expect(path[path.length - 1].at).toBe(1);

        for (let i = 1; i < path.length; i++) {
          expect(path[i].at).toBeGreaterThan(path[i - 1].at);
        }
      });

      it('never reverses — the camera only ever travels forward', () => {
        // A backward step would read as a mistake, not a move.
        for (let i = 1; i < path.length; i++) {
          expect(path[i].z).toBeLessThanOrEqual(path[i - 1].z);
        }
      });

      it('is a pure function: the same progress always gives the same frame', () => {
        const a = sampleCamera(path, 0.42);
        const b = sampleCamera(path, 0.42);

        // This is what makes scroll restoration and refresh land correctly.
        expect(a).toEqual(b);
      });

      it('moves monotonically forward when sampled', () => {
        let previous = Infinity;

        for (let p = 0; p <= 1; p += 0.005) {
          const { z } = sampleCamera(path, p);
          expect(z).toBeLessThanOrEqual(previous + 1e-9);
          previous = z;
        }
      });

      it('pins the endpoints exactly and clamps beyond them', () => {
        expect(sampleCamera(path, 0).z).toBe(path[0].z);
        expect(sampleCamera(path, 1).z).toBe(path[path.length - 1].z);
        expect(sampleCamera(path, -3)).toEqual(sampleCamera(path, 0));
        expect(sampleCamera(path, 7)).toEqual(sampleCamera(path, 1));
      });

      it('keeps the field of view within a sane cinematic range', () => {
        for (let p = 0; p <= 1; p += 0.01) {
          const { fov } = sampleCamera(path, p);
          expect(fov).toBeGreaterThan(20);
          expect(fov).toBeLessThan(80);
        }
      });

      it('travels through the monogram plane rather than stopping short', () => {
        // The whole concept is passing through the mark, not orbiting it.
        expect(sampleCamera(path, 0).z).toBeGreaterThan(0);
        expect(sampleCamera(path, 1).z).toBeLessThan(-100);
      });
    });
  }

  it('gives mobile a dwell at each gate that desktop does not have', () => {
    // Mobile settles and holds; desktop glides. Measured as near-zero travel
    // across a gate boundary.
    const travel = (path: readonly CameraKey[], from: number, to: number) =>
      Math.abs(sampleCamera(path, from).z - sampleCamera(path, to).z);

    expect(travel(CAMERA_PATH_MOBILE, 0.62, 0.65)).toBeLessThan(
      travel(CAMERA_PATH_DESKTOP, 0.62, 0.65),
    );
  });

  it('rejects an empty path instead of rendering a broken frame', () => {
    expect(() => sampleCamera([], 0.5)).toThrow();
  });
});

describe('easing', () => {
  it('clamps', () => {
    expect(clamp(-1)).toBe(0);
    expect(clamp(2)).toBe(1);
    expect(clamp(0.4)).toBe(0.4);
  });

  it('interpolates', () => {
    expect(lerp(10, 20, 0)).toBe(10);
    expect(lerp(10, 20, 1)).toBe(20);
    expect(lerp(10, 20, 0.5)).toBe(15);
  });

  it('normalises a span, and returns 0 for a zero-width one', () => {
    expect(normalise(5, 0, 10)).toBe(0.5);
    // A mistyped timeline entry must not produce NaN across the whole page.
    expect(normalise(5, 3, 3)).toBe(0);
    expect(Number.isNaN(normalise(5, 3, 3))).toBe(false);
  });

  it('eases from rest to rest', () => {
    for (const ease of [smoothstep, easeInOutCubic]) {
      expect(ease(0)).toBe(0);
      expect(ease(1)).toBe(1);
      expect(ease(0.5)).toBeCloseTo(0.5, 5);

      // Monotonic — an easing that dips would read as a stutter.
      let previous = -Infinity;
      for (let t = 0; t <= 1; t += 0.01) {
        const value = ease(t);
        expect(value).toBeGreaterThanOrEqual(previous - 1e-9);
        previous = value;
      }
    }
  });
});
