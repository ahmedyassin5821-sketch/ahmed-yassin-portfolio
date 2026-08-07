#!/usr/bin/env node
/**
 * Generates every shipped logo asset from the single source of truth.
 *
 *   npm run logo:generate
 *
 * Source: Attachments/my-logo.svg (the finalized AY monogram).
 * Emits:  public/brand/*.svg, public/favicon.svg, and the TS path constant the
 *         Logo component inlines.
 *
 * ## Why this is a script and not hand-edited files
 *
 * The mark's path data is ~2.7KB of coordinates. Transcribing it by hand — into
 * four SVGs and a TS file — is five chances to silently corrupt the geometry.
 * This copies it byte-for-byte and asserts as much before writing, so the brand
 * cannot drift. Re-run it if the source SVG is ever revised.
 *
 * The source contains two paths:
 *   [0] a full-canvas white rectangle with the mark knocked out of it — this is
 *       the baked-in background plate, and it is DISCARDED. It is why the
 *       original cannot sit on a tinted surface.
 *   [1] the mark itself — KEPT VERBATIM.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = join(ROOT, 'Attachments', 'my-logo.svg');

/** Bounds of the mark, measured from the path. See BRAND-SYSTEM.md §1. */
const BOUNDS = { x: 49.84, y: 27.35, w: 250.32, h: 284.79 };

/** Artboard of the supplied source, which carries the designed clear space. */
const ARTBOARD = { w: 353, h: 332 };

/**
 * Outward offset for the small-size variant, in viewBox units.
 *
 * The true hairlines are 2.6% of the mark's height, so at a 24px favicon they
 * land at 0.6px — under one device pixel, where they alias into nothing. A
 * mitered stroke on the same path expands it uniformly without editing a single
 * coordinate. Contrast drops from 3.8:1 to roughly 2:1; that trade is
 * unavoidable and is documented in BRAND-SYSTEM.md §10.
 */
const SMALL_STROKE = 8;

const source = readFileSync(SOURCE, 'utf8');
const paths = [...source.matchAll(/<path d="([^"]+)"/g)].map((m) => m[1]);

if (paths.length !== 2) {
  throw new Error(`Expected 2 paths in ${SOURCE}, found ${paths.length}. Source changed shape.`);
}

const [plate, MARK] = paths;

/**
 * `role="img"` plus a first-child <title> is enough for the accessible name.
 * Deliberately no id/aria-labelledby: these files get inlined, and the design
 * system playground renders several at once, so ids would collide.
 */
function svg({ viewBox, title, pathAttrs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" fill="currentColor" role="img">
  <title>${title}</title>
  <path d="${MARK}"${pathAttrs}/>
</svg>
`;
}

const pad = SMALL_STROKE / 2;
const smallViewBox = [
  (BOUNDS.x - pad).toFixed(2),
  (BOUNDS.y - pad).toFixed(2),
  (BOUNDS.w + SMALL_STROKE).toFixed(2),
  (BOUNDS.h + SMALL_STROKE).toFixed(2),
].join(' ');

const smallSvg = svg({
  viewBox: smallViewBox,
  title: 'Ahmed Yassin — AY monogram',
  pathAttrs: ` stroke="currentColor" stroke-width="${SMALL_STROKE}" stroke-linejoin="miter" stroke-miterlimit="4"`,
});

const outputs = [
  [
    join(ROOT, 'public', 'brand', 'ay-logo.svg'),
    svg({ viewBox: `0 0 ${ARTBOARD.w} ${ARTBOARD.h}`, title: 'Ahmed Yassin' }),
  ],
  [
    join(ROOT, 'public', 'brand', 'ay-mark.svg'),
    svg({
      viewBox: `${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}`,
      title: 'Ahmed Yassin — AY monogram',
    }),
  ],
  [join(ROOT, 'public', 'brand', 'ay-mark-small.svg'), smallSvg],
  [join(ROOT, 'public', 'favicon.svg'), smallSvg],
];

const tsPath = join(ROOT, 'src', 'app', 'shared', 'ui', 'logo', 'logo-path.ts');
const ts = `// GENERATED FILE — do not edit by hand.
// Run \`npm run logo:generate\` to regenerate from Attachments/my-logo.svg.
//
// The Logo component inlines this path rather than loading public/brand/*.svg
// through an <img>, because an <img> cannot inherit currentColor — and a
// hardcoded fill would make the logo the one element in the system that
// violates the no-hardcoded-colour rule.

/** The AY monogram outline, verbatim from the source artwork. */
export const AY_MARK_PATH =
  '${MARK}';

/** Full source artboard, including the designed clear space. */
export const AY_ARTBOARD_VIEWBOX = '0 0 ${ARTBOARD.w} ${ARTBOARD.h}';

/** Tight crop to the measured bounds of the mark, for optical alignment. */
export const AY_MARK_VIEWBOX = '${BOUNDS.x} ${BOUNDS.y} ${BOUNDS.w} ${BOUNDS.h}';

/** Crop for the stroke-expanded small variant. */
export const AY_MARK_SMALL_VIEWBOX = '${smallViewBox}';

/** Outward offset applied to the small variant, in viewBox units. */
export const AY_SMALL_STROKE_WIDTH = ${SMALL_STROKE};
`;

for (const [file, content] of outputs) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content, 'utf8');
  if (!content.includes(MARK)) throw new Error(`Geometry altered while writing ${file}`);
}

mkdirSync(dirname(tsPath), { recursive: true });
writeFileSync(tsPath, ts, 'utf8');
if (!ts.includes(MARK)) throw new Error('Geometry altered while writing logo-path.ts');

console.log(`Discarded background plate (${plate.length} chars).`);
for (const [file] of outputs) console.log(`  wrote ${file.replace(ROOT, '.')}`);
console.log(`  wrote ${tsPath.replace(ROOT, '.')}`);
console.log('\nVerified: mark geometry byte-identical to source in all outputs.');
