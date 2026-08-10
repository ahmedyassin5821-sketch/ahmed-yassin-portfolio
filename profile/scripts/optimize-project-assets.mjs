/**
 * Turns the raw project captures into the web assets the portfolio actually
 * ships, and writes a manifest of their real dimensions.
 *
 * ## Why this exists
 *
 * The supplied source material is ~38 MB of unoptimised PNG screen captures,
 * some of them 2.7 MB each. `angular.json` copies `public/**` verbatim into the
 * build output, so anything left in `public/` is deployed as-is. The raw files
 * therefore live in `project-assets/` — outside `public/` — and this script is
 * the only thing that writes into `public/projects/`.
 *
 * Run with: npm run assets:projects
 *
 * ## What it guarantees
 *
 * - **Originals are never modified.** `project-assets/` is read-only to this
 *   script. Re-running is idempotent and always derives from the sources.
 * - **Metadata is stripped.** sharp drops EXIF/XMP unless asked to keep it, so
 *   the Canva authoring metadata embedded in the Nader logo does not ship.
 * - **Redactions are irreversible.** Sensitive regions are downsampled by 20×
 *   and re-upsampled before blurring, so the original pixels are destroyed
 *   rather than merely smeared — a recoverable blur would be a fake redaction.
 * - **Dimensions are measured, never guessed.** Every width/height in the
 *   generated manifest comes from the encoder's own output, which is what lets
 *   the templates set intrinsic size and avoid layout shift.
 *
 * ## The redaction map
 *
 * Rectangles were read off the full-resolution captures by eye, then verified
 * against the rendered output. They are deliberately generous: over-covering
 * costs a few pixels of UI, under-covering publishes someone's phone number.
 *
 * Two distinct reasons appear below:
 *   `pii`  — real third-party personal data (names, emails, phones, salaries,
 *            penalty amounts, account avatars) from a client's internal HR
 *            system. Publishing it would be a data leak.
 *   `junk` — placeholder rows typed during development ("asaccsacasc",
 *            "TEST EXPORT"). Real, but it reads as unfinished work.
 */

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';

const SOURCE_ROOT = 'project-assets';
const OUT_ROOT = join('public', 'projects');
const MANIFEST_OUT = join('src', 'app', 'data', 'project-media.generated.ts');

/**
 * Two widths per screenshot, not five.
 *
 * These are UI captures rendered at most ~1100 CSS px wide in the detail
 * gallery and ~640 px in a card. 800 covers cards and small viewports, 1600
 * covers the widest presentation at comfortable density. A third width would
 * add 34 files to save a few kilobytes nobody measures.
 */
const SHOT_WIDTHS = [800, 1600];

/** Cards on `/work` are the LCP candidates, so they earn a second format. */
const COVER_FORMATS = ['avif', 'webp'];
const GALLERY_FORMATS = ['webp'];

/** Logos render at ~160 CSS px; one 2× file is enough. */
const LOGO_WIDTH = 400;

const rect = (left, top, width, height, reason) => ({ left, top, width, height, reason });

const PROJECTS = [
  {
    slug: 'nas-hr',
    logo: { file: 'logo.png' },
    shots: [
      {
        name: 'dashboard',
        file: 'Screenshot 2026-08-08 191626.png',
        cover: true,
        redact: [
          rect(1630, 10, 260, 60, 'pii'), // signed-in account name + avatar
          rect(762, 252, 200, 62, 'pii'), // salary figure on the KPI card
          rect(548, 612, 340, 261, 'pii'), // Employee Name column (+ face thumbnails)
          rect(1256, 612, 246, 261, 'pii'), // Email column
          rect(1496, 612, 132, 261, 'pii'), // Phone column
        ],
      },
      {
        name: 'employees',
        file: 'Screenshot 2026-08-08 192108.png',
        redact: [
          rect(186, 108, 328, 514, 'pii'), // Employee Name column
          rect(878, 108, 240, 514, 'pii'), // Email column
          rect(1112, 108, 132, 514, 'pii'), // Phone column
        ],
      },
      {
        name: 'penalties',
        file: 'Screenshot 2026-08-08 192053.png',
        redact: [
          rect(56, 132, 190, 535, 'pii'), // Employee Name column
          rect(602, 132, 175, 535, 'pii'), // Manager column (@handles)
          rect(778, 132, 140, 535, 'pii'), // Value column (penalty amounts)
        ],
      },
      {
        name: 'leave-requests',
        file: 'Screenshot 2026-08-08 192610.png',
        redact: [
          rect(1725, 3, 175, 45, 'pii'), // signed-in account
          rect(252, 225, 368, 515, 'pii'), // Employee column
        ],
      },
      {
        name: 'attendance',
        file: 'Screenshot 2026-08-08 192621.png',
        redact: [
          rect(1725, 3, 175, 45, 'pii'), // signed-in account
          rect(230, 245, 560, 490, 'pii'), // Employee Name column
        ],
      },
    ],
  },

  {
    slug: '2b',
    // Copied verbatim: the official mark must not be recoloured or re-geometried.
    // It carries white fills, so the UI places it on a dark token surface.
    logo: { file: '2b_logo_web.svg', copy: true },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-08 184241.png', cover: true },
      { name: 'deals', file: 'Screenshot 2026-08-08 184315.png' },
      { name: 'product', file: 'Screenshot 2026-08-08 184613.png' },
      { name: 'cart', file: 'Screenshot 2026-08-08 184551.png' },
      { name: 'instalments', file: 'Screenshot 2026-08-08 184618.png' },
      { name: 'checkout', file: 'Screenshot 2026-08-08 184707.png' },
      // Excluded: 184653 (a saved customer address and phone number),
      // 184244 (1×1, zero-byte capture — moved to project-assets/_unused).
    ],
  },

  {
    slug: 'nature',
    logo: { file: 'logo.webp' },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-08 184943.png', cover: true },
      { name: 'about', file: 'Screenshot 2026-08-08 185003.png' },
      { name: 'reach', file: 'Screenshot 2026-08-08 185023.png' },
      { name: 'blog', file: 'Screenshot 2026-08-08 185130.png' },
      {
        name: 'admin-dashboard',
        file: join('admin', 'Screenshot 2026-08-08 191924.png'),
        redact: [
          rect(1668, 8, 52, 56, 'pii'), // account photo
          rect(372, 600, 430, 262, 'junk'), // Latest Projects — placeholder names
          rect(990, 600, 258, 262, 'junk'), // Services — placeholder names
        ],
      },
      {
        name: 'admin-services',
        file: join('admin', 'Screenshot 2026-08-08 192000.png'),
        redact: [
          rect(1718, 6, 52, 52, 'pii'), // account photo
          rect(268, 250, 388, 580, 'junk'), // Service column
          rect(648, 250, 660, 580, 'junk'), // Description column
        ],
      },
      {
        name: 'admin-projects',
        file: join('admin', 'Screenshot 2026-08-08 192008.png'),
        redact: [
          rect(62, 190, 385, 565, 'junk'), // Project column
          rect(770, 190, 485, 565, 'junk'), // Services column
        ],
      },
      // Excluded: 191914 (login form with a populated username field),
      // 191945 (every readable column is placeholder text — nothing survives
      // redaction), 184915 / 184957 (near-duplicate hero captures),
      // 185038 / 185054 (modal and partner strip, redundant here).
    ],
  },

  {
    slug: 'esterad',
    logo: { file: 'shop35_logo.png' },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-08 183601.png', cover: true },
      { name: 'listing', file: 'Screenshot 2026-08-08 183611.png' },
      { name: 'brands', file: 'Screenshot 2026-08-08 183620.png' },
      { name: 'categories', file: 'Screenshot 2026-08-08 183627.png' },
      { name: 'promotion', file: 'Screenshot 2026-08-08 183649.png' },
    ],
  },

  {
    slug: 'designed-by-g',
    // The wordmark lockup, not the standalone mark. Trimmed only — the artwork
    // itself is untouched; the source is 4475×2063 of mostly empty canvas.
    logo: { file: 'new logo of G with typoghraphy.png', trim: true },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-08 181454.png', cover: true },
      { name: 'collection', file: 'Screenshot 2026-08-08 181520.png' },
      { name: 'editorial', file: 'Screenshot 2026-08-08 181618.png' },
      { name: 'product', file: 'Screenshot 2026-08-08 181708.png' },
      { name: 'size-guide', file: 'Screenshot 2026-08-08 181837.png' },
      { name: 'checkout', file: 'Screenshot 2026-08-08 181859.png' },
    ],
  },

  {
    slug: 'nader-coffee',
    logo: { file: 'Nader_logo.avif' },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-08 183358.png', cover: true },
      { name: 'categories', file: 'Screenshot 2026-08-08 183428.png' },
      { name: 'bestsellers', file: 'Screenshot 2026-08-08 183442.png' },
      { name: 'product', file: 'Screenshot 2026-08-08 183514.png' },
      { name: 'checkout', file: 'Screenshot 2026-08-08 183535.png' },
    ],
  },

  {
    slug: 'vivace',
    logo: { file: 'logo.webp' },
    shots: [
      { name: 'home', file: 'Screenshot 2026-08-10 012530.png', cover: true },
      { name: 'brands', file: 'Screenshot 2026-08-10 012609.png' },
      { name: 'menu', file: 'Screenshot 2026-08-10 012850.png' },
      { name: 'merchandising', file: 'Screenshot 2026-08-10 012732.png' },
      { name: 'product', file: 'Screenshot 2026-08-10 012807.png' },
      { name: 'cart', file: 'Screenshot 2026-08-10 012932.png' },
      { name: 'checkout', file: 'Screenshot 2026-08-10 013014.png' },
      // Excluded: 012711 (its only unique content is a collection strip; the rest
      // of the capture is a third-party reviews widget carrying real reviewers'
      // names and profile photos — `pii`, and too large a share of the frame to
      // redact into anything but a grey slab), 012828 (the contact page, which is
      // nothing but the client's branch addresses and phone numbers), 012626 and
      // 012638 (near-duplicates of the brands grid), 012727 (a crop of 012732),
      // 012915 (quick-view modal, redundant beside the product page).
    ],
  },
];

/**
 * Destroys the pixels under each rectangle.
 *
 * Downsampling by 20× discards the information, and only then is a blur applied
 * to soften the mosaic edges. Blurring alone would leave a recoverable image;
 * this cannot be undone.
 */
async function redactRegions(file, regions, meta) {
  if (!regions?.length) return file;

  const composites = [];

  for (const region of regions) {
    // Clamp, so a rectangle that overhangs the capture cannot throw.
    const left = Math.max(0, Math.min(region.left, meta.width - 1));
    const top = Math.max(0, Math.min(region.top, meta.height - 1));
    const width = Math.max(1, Math.min(region.width, meta.width - left));
    const height = Math.max(1, Math.min(region.height, meta.height - top));

    const patch = await sharp(file)
      .extract({ left, top, width, height })
      .resize(Math.max(1, Math.round(width / 20)), Math.max(1, Math.round(height / 20)), {
        fit: 'fill',
      })
      .resize(width, height, { fit: 'fill', kernel: 'nearest' })
      .blur(8)
      .toBuffer();

    composites.push({ input: patch, left, top });
  }

  // Flattened to a full-size lossless buffer rather than returned as a pending
  // pipeline: sharp always resizes *before* compositing, so a pipeline carrying
  // full-size patches throws the moment a smaller variant is requested.
  return sharp(file).composite(composites).png().toBuffer();
}

async function emit(input, outPath, width, format) {
  await mkdir(dirname(outPath), { recursive: true });

  const encoder = sharp(input).resize({ width, withoutEnlargement: true });
  const encoded =
    format === 'avif'
      ? encoder.avif({ quality: 55, effort: 5 })
      : encoder.webp({ quality: 80, effort: 5 });

  // No .withMetadata() anywhere: EXIF/XMP/ICC authoring data is dropped.
  const info = await encoded.toFile(outPath);
  return { width: info.width, height: info.height, bytes: info.size };
}

const publicPath = (slug, file) => `/projects/${slug}/${file}`;

async function run() {
  // The output directory is fully derived, so it is rebuilt from scratch. This
  // is why nothing hand-made may ever be placed in public/projects.
  await rm(OUT_ROOT, { recursive: true, force: true });
  await mkdir(OUT_ROOT, { recursive: true });

  const manifest = {};
  const report = [];
  let sourceBytes = 0;
  let outputBytes = 0;
  let redactionCount = 0;

  for (const project of PROJECTS) {
    const entry = { logo: null, shots: {} };

    // ---- logo -------------------------------------------------------------
    if (project.logo) {
      const src = join(SOURCE_ROOT, project.slug, project.logo.file);
      sourceBytes += (await readFile(src)).byteLength;

      if (project.logo.copy) {
        const out = join(OUT_ROOT, project.slug, 'logo.svg');
        await mkdir(dirname(out), { recursive: true });
        const svg = await readFile(src);
        await writeFile(out, svg);
        outputBytes += svg.byteLength;

        const meta = await sharp(src).metadata();
        entry.logo = {
          src: publicPath(project.slug, 'logo.svg'),
          srcset: null,
          width: meta.width,
          height: meta.height,
        };
        report.push(`  logo  ${project.slug}/logo.svg (copied verbatim)`);
      } else {
        const logoInput = project.logo.trim
          ? await sharp(src).trim({ threshold: 12 }).png().toBuffer()
          : src;

        const out = join(OUT_ROOT, project.slug, 'logo.webp');
        const info = await emit(logoInput, out, LOGO_WIDTH, 'webp');
        outputBytes += info.bytes;

        entry.logo = {
          src: publicPath(project.slug, 'logo.webp'),
          srcset: null,
          width: info.width,
          height: info.height,
        };
        report.push(
          `  logo  ${project.slug}/logo.webp ${info.width}×${info.height} ${(info.bytes / 1024).toFixed(0)}KB` +
            (project.logo.trim ? ' (whitespace trimmed)' : ''),
        );
      }
    }

    // ---- screenshots ------------------------------------------------------
    for (const shot of project.shots) {
      const src = join(SOURCE_ROOT, project.slug, shot.file);
      sourceBytes += (await readFile(src)).byteLength;

      const meta = await sharp(src).metadata();
      // A path when nothing is redacted, a flattened buffer when something is.
      const source = await redactRegions(src, shot.redact, meta);
      if (shot.redact?.length) redactionCount += shot.redact.length;

      const formats = shot.cover ? COVER_FORMATS : GALLERY_FORMATS;
      const variants = {};
      let largest = null;

      // Only widths the capture can actually satisfy, plus its own width as the
      // top variant. Emitting a nominal 1600 from a 1300px source would write a
      // file identical to the 1300 one under a misleading name; a 510px cart
      // drawer collapses to a single file instead of two duplicates.
      const cap = SHOT_WIDTHS[SHOT_WIDTHS.length - 1];
      const widths = [
        ...new Set([...SHOT_WIDTHS.filter((w) => w < meta.width), Math.min(meta.width, cap)]),
      ].sort((a, b) => a - b);

      for (const format of formats) {
        const parts = [];

        for (const width of widths) {
          const file = `${shot.name}-${width}.${format}`;
          const info = await emit(source, join(OUT_ROOT, project.slug, file), width, format);
          outputBytes += info.bytes;
          parts.push({ file, ...info });
        }

        variants[format] = parts;
        if (format === 'webp') largest = parts[parts.length - 1];
      }

      const toSrcset = (parts) =>
        parts.map((p) => `${publicPath(project.slug, p.file)} ${p.width}w`).join(', ');

      entry.shots[shot.name] = {
        src: publicPath(project.slug, largest.file),
        srcset: toSrcset(variants.webp),
        avif: variants.avif ? toSrcset(variants.avif) : null,
        width: largest.width,
        height: largest.height,
      };

      const flags = [
        shot.cover ? 'cover' : null,
        shot.redact?.length ? `${shot.redact.length} redactions` : null,
      ]
        .filter(Boolean)
        .join(', ');

      report.push(
        `  shot  ${project.slug}/${shot.name} ${largest.width}×${largest.height}` +
          ` ${Object.values(variants).flat().length} files${flags ? ` [${flags}]` : ''}`,
      );
    }

    manifest[project.slug] = entry;
  }

  await writeGenerated(manifest);

  console.log(report.join('\n'));
  console.log(
    `\nsource ${(sourceBytes / 1024 / 1024).toFixed(1)} MB` +
      ` -> shipped ${(outputBytes / 1024 / 1024).toFixed(2)} MB` +
      ` (${(100 - (outputBytes / sourceBytes) * 100).toFixed(1)}% smaller)`,
  );
  console.log(`${redactionCount} regions redacted`);
}

async function writeGenerated(manifest) {
  const body = JSON.stringify(manifest, null, 2).replace(/"([a-zA-Z][\w-]*)":/g, (m, key) =>
    /^[a-zA-Z_$][\w$]*$/.test(key) ? `${key}:` : `'${key}':`,
  );

  const file = `// GENERATED by scripts/optimize-project-assets.mjs — do not edit.
//
// Every dimension here was reported by the image encoder, so templates can set
// intrinsic width/height and reserve the right box before the bytes arrive.
// Run \`npm run assets:projects\` to regenerate.

export interface GeneratedImage {
  /** Largest WebP variant — the \`src\` fallback. */
  readonly src: string;
  /** WebP candidates, or \`null\` for vector assets. */
  readonly srcset: string | null;
  /** AVIF candidates. Only generated for cover images. */
  readonly avif?: string | null;
  readonly width: number;
  readonly height: number;
}

export const PROJECT_MEDIA = ${body.replace(/"/g, "'")} as const;
`;

  await mkdir(dirname(MANIFEST_OUT), { recursive: true });
  await writeFile(MANIFEST_OUT, file, 'utf8');
}

await run();
