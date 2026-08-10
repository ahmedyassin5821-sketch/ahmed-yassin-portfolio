import { PROJECTS } from './projects.data';

/**
 * Every project's atmosphere, checked for contrast.
 *
 * These eight colours per project shadow the semantic tokens for a whole page, so
 * a badly chosen tint does not make one component look wrong — it makes the entire
 * page fail WCAG. The neutral palette's ratios are asserted by the brand system;
 * this asserts that borrowing a client's brand cannot quietly undo them.
 *
 * Derived in a script from each brand's own logo artwork, then checked here, so
 * adding a project means adding a row and running the suite rather than trusting
 * a spreadsheet.
 */

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((i) => {
    const value = parseInt(hex.slice(i, i + 2), 16) / 255;
    return value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

describe('project atmospheres', () => {
  it('gives every project a full ramp of valid hex colours', () => {
    for (const project of PROJECTS) {
      const values = Object.values(project.atmosphere);
      expect(values.length).toBe(8);
      for (const value of values) {
        expect(value).toMatch(/^#[0-9a-f]{6}$/);
      }
    }
  });

  it('keeps body text at AA and primary text at AAA on every tinted paper', () => {
    for (const project of PROJECTS) {
      const a = project.atmosphere;

      // Primary text carries the page. AAA, as it is on the neutral paper (13.41:1).
      expect(contrast(a.text, a.surface)).toBeGreaterThanOrEqual(7);
      // Secondary and muted are still body copy: AA is the floor, and muted is the
      // one that gets close — it was below 4.5 on two brands before the ramp was
      // darkened, which is exactly why this test exists.
      expect(contrast(a.textSecondary, a.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(a.textMuted, a.surface)).toBeGreaterThanOrEqual(4.5);
      // The accent is a brand's real colour, darkened only as far as legibility
      // needs — but it carries the role line at heading scale, so it has to clear AA
      // on BOTH grounds. Measured only against the paper, three brands passed there
      // and failed on the plate the role block actually sits on.
      expect(contrast(a.accent, a.surface)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(a.accent, a.surfaceStrong)).toBeGreaterThanOrEqual(4.5);
      // Plates and image grounds take primary and secondary text as well.
      expect(contrast(a.text, a.surfaceStrong)).toBeGreaterThanOrEqual(7);
      expect(contrast(a.textSecondary, a.surfaceStrong)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('keeps the paper as paper, never a saturated field', () => {
    for (const project of PROJECTS) {
      // A tinted paper, not the brand colour at full strength: the portfolio stays
      // the portfolio and the brand arrives as an atmosphere inside it.
      //
      // Sprint 9.1 deepened both steps deliberately — Sprint 9's tint was correct
      // and nearly invisible — so these floors are lower than they were. They are
      // still floors: below them the ground stops being paper and the page becomes
      // the client's site, which is the thing the whole system is arranged to avoid.
      expect(luminance(project.atmosphere.surface)).toBeGreaterThan(0.75);
      expect(luminance(project.atmosphere.surfaceStrong)).toBeGreaterThan(0.55);
    }
  });

  it('gives each project a distinguishable ground', () => {
    // Seven near-identical papers would read as a bug rather than as seven brands.
    const surfaces = PROJECTS.map((p) => p.atmosphere.surface);
    expect(new Set(surfaces).size).toBe(PROJECTS.length);

    const accents = PROJECTS.map((p) => p.atmosphere.accent);
    expect(new Set(accents).size).toBe(PROJECTS.length);
  });
});
