import {
  ACT_TIMELINE,
  GATE_ACTS,
  GATE_BEATS,
  actAt,
  actById,
  actProgress,
  gateBeat,
} from './act-timeline';
import { PROJECTS } from '@data/projects.data';
import {
  CAMERA_PATH_DESKTOP,
  CAMERA_PATH_MOBILE,
  CORRIDOR,
  CameraKey,
  sampleCamera,
} from './camera-path';
import { buildTypePlanes } from './corridor-layout';
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
    // Shopify first: the showcase's priority order, and the same order PROJECTS
    // is written in. The reader meets the platforms in one sequence everywhere.
    expect(GATE_ACTS.map((a) => a.platform)).toEqual(['shopify', 'angular', 'magento']);

    for (let i = 1; i < GATE_ACTS.length; i++) {
      expect(GATE_ACTS[i].start).toBeGreaterThanOrEqual(GATE_ACTS[i - 1].end);
    }
  });

  it('walks the gates in the order the showcase presents them', () => {
    // The corridor and the index must agree. If PROJECTS were reordered and the
    // timeline were not, the reader would walk Shopify -> Angular -> Magento on
    // one page and Angular -> Magento -> Shopify on the other.
    const firstAppearance = GATE_ACTS.map((act) =>
      PROJECTS.findIndex((p) => p.platform === act.platform),
    );

    expect(firstAppearance.every((i) => i >= 0)).toBe(true);
    for (let i = 1; i < firstAppearance.length; i++) {
      expect(firstAppearance[i]).toBeGreaterThan(firstAppearance[i - 1]);
    }
  });

  it('sends the camera deeper at every gate, whatever order the platforms are in', () => {
    // The depths are assigned by travel order rather than per platform, and this
    // is what that buys: reordering the showcase cannot make the camera fly to
    // the far end of the corridor first and then come back.
    const depths = GATE_ACTS.map((act) => CORRIDOR.gates[act.platform!]);

    expect(depths.length).toBe(3);
    for (let i = 1; i < depths.length; i++) {
      expect(depths[i]).toBeLessThan(depths[i - 1]);
    }
    expect(depths[0]).toBeLessThan(CORRIDOR.count);
    expect(depths[depths.length - 1]).toBeGreaterThan(CORRIDOR.exit);
  });

  it('throws on an unknown act rather than returning undefined', () => {
    // Guards against a renamed act silently producing a dead component.
    expect(() => actById('nope' as never)).toThrow();
  });

  it('gives the three gates most of the scroll, because that is where the work is', () => {
    const gateSpan = GATE_ACTS.reduce((sum, act) => sum + (act.end - act.start), 0);

    // The four beats inside each gate need room; below about half the scroll a
    // beat lasts under half a screen and the platform name and the screenshots
    // read as arriving together.
    expect(gateSpan).toBeGreaterThan(0.5);
  });
});

describe('gate beats', () => {
  it('runs settle -> image -> info, strictly in order and inside the act', () => {
    // Out of order, the screenshot would arrive before the platform name has
    // given up the frame — which is the confusion the beats exist to remove.
    expect(GATE_BEATS.settle).toBeGreaterThan(0);
    expect(GATE_BEATS.image).toBeGreaterThan(GATE_BEATS.settle);
    expect(GATE_BEATS.info).toBeGreaterThan(GATE_BEATS.image);
    expect(GATE_BEATS.info).toBeLessThan(1);
  });

  it('leaves the reader time to look before the act ends', () => {
    // The last beat lands with a hold still to come; without it the information
    // would arrive and immediately fade.
    expect(1 - GATE_BEATS.info).toBeGreaterThanOrEqual(0.25);
  });

  it('maps every beat into its own act, in ascending order', () => {
    for (const act of GATE_ACTS) {
      const settle = gateBeat(act, 'settle');
      const image = gateBeat(act, 'image');
      const info = gateBeat(act, 'info');

      expect(settle).toBeGreaterThan(act.start);
      expect(info).toBeLessThan(act.end);
      expect(image).toBeGreaterThan(settle);
      expect(info).toBeGreaterThan(image);
    }
  });

  it('puts only type in the corridor — no project screenshots', () => {
    // Screenshots were tried as textured planes and removed: seen from behind,
    // which is most of the time, a plane renders its texture mirrored, so the
    // reader was shown a backwards screenshot flying past. The work belongs in
    // the DOM, where it is legible, selectable and indexable.
    const planes = buildTypePlanes('20+');

    expect(planes.map((p) => p.text)).toEqual(['20+', 'SHOPIFY', 'ANGULAR', 'MAGENTO']);

    for (const gate of GATE_ACTS) {
      const word = planes.find((p) => p.text === gate.platform!.toUpperCase())!;
      // Each word is gated to its own act, so the reader never sees SHOPIFY
      // behind the ANGULAR gate.
      expect(word.from).toBeLessThan(gate.start);
      // And it leaves as the screenshot arrives, rather than sitting behind the
      // work as a full-frame watermark for the rest of the act.
      expect(word.to).toBeCloseTo(gateBeat(gate, 'image'), 10);
      expect(word.to).toBeLessThan(gate.end);
    }
  });

  it('never lets one gate’s word appear while the previous gate is being read', () => {
    // The regression this exists for: with a fixed ±0.06 lead-in, MAGENTO was
    // legible at 0.47 — two thirds of the way through reading Angular's
    // projects. Windows have to scale with the act, not sit at a fixed offset.
    const planes = buildTypePlanes('20+');

    for (let i = 1; i < GATE_ACTS.length; i++) {
      const previous = GATE_ACTS[i - 1];
      const gate = GATE_ACTS[i];
      const word = planes.find((p) => p.text === gate.platform!.toUpperCase())!;

      // Must not appear before the previous gate's information has been read.
      expect(word.from).toBeGreaterThan(gateBeat(previous, 'info'));
    }

    // Same for the count: it fills the frame at display scale, and it was still
    // ghosting behind "Angular".
    const count = planes.find((p) => p.text === '20+')!;
    expect(count.to).toBeLessThanOrEqual(GATE_ACTS[0].start);
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

  const travel = (path: readonly CameraKey[], from: number, to: number) =>
    Math.abs(sampleCamera(path, from).z - sampleCamera(path, to).z);

  it('holds at every gate while its beats play, on both paths', () => {
    // The camera must be near-still across the window where the reader is being
    // shown a screenshot and then read its details. A camera still dollying
    // through would drag the presenting plane out of frame mid-hand-off.
    for (const [name, path] of paths) {
      for (const gate of GATE_ACTS) {
        const beats = travel(path, gateBeat(gate, 'settle'), gateBeat(gate, 'info'));
        const span = gateBeat(gate, 'info') - gateBeat(gate, 'settle');
        // The equivalent-length window ending at the gate's start — the approach.
        const approach = travel(path, gate.start - span, gate.start);

        expect(`${name}:${gate.id}:${beats < approach}`).toBe(`${name}:${gate.id}:true`);
      }
    }
  });

  it('keeps mobile stiller than desktop at a gate', () => {
    // Mobile settles hard and holds; desktop eases. Same grammar, different
    // amplitude — a phone viewport smears a continuous dolly.
    const gate = actById('magento');
    const from = gateBeat(gate, 'settle');
    const to = gateBeat(gate, 'info');

    expect(travel(CAMERA_PATH_MOBILE, from, to)).toBeLessThan(
      travel(CAMERA_PATH_DESKTOP, from, to),
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
