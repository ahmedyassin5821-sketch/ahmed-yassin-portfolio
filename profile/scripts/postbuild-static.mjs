/**
 * Finishes the static output after `ng build`.
 *
 * Three files Angular does not write, none of them host-specific:
 *
 *   404.html      the not-found page as a file, so a static host can answer 404
 *   robots.txt    with the production URL in the sitemap line
 *   sitemap.xml   one entry per route Angular actually prerendered
 *
 * ## No base-path handling
 *
 * The site is served from the root, so there is nothing to prefix. This replaced a
 * GitHub Pages script that derived a `/repo/` base href; that logic is gone rather
 * than disabled, because a half-removed special case is worse than either state.
 *
 * ## The site URL
 *
 * Only robots.txt and sitemap.xml need an absolute URL. On Vercel it comes from
 * `VERCEL_PROJECT_PRODUCTION_URL`, which the build environment sets to the
 * production host — so production always gets correct files with no configuration.
 * Locally there is no such thing as the production URL, so both files are skipped
 * and the script says so; 404.html is still written, because that one is part of the
 * site rather than metadata about it.
 *
 *   npm run build:static
 *   node scripts/postbuild-static.mjs --site https://example.com --skip-build
 *
 * No dependencies. Routes come from `prerendered-routes.json`, which the build
 * writes beside `browser/`, so the sitemap can neither miss a built page nor invent
 * one.
 */
import { spawnSync } from 'node:child_process';
import { access, copyFile, readFile, writeFile } from 'node:fs/promises';
import { argv, env, execPath, exit } from 'node:process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = 'dist/profile';
const BROWSER = join(DIST, 'browser');

/** `--name value` or `--name=value`. `null` when absent or when it carries no value. */
function flag(name) {
  const index = argv.indexOf(`--${name}`);
  if (index !== -1) {
    const next = argv[index + 1];
    return next && !next.startsWith('--') ? next : null;
  }
  const inline = argv.find((arg) => arg.startsWith(`--${name}=`));
  return inline ? inline.slice(name.length + 3) : null;
}

/**
 * A valueless switch.
 *
 * Separate from `flag()` because `flag('skip-build')` returns `null` for a bare
 * `--skip-build` — there is no value after it — so the switch silently did nothing
 * and an earlier version of this script rebuilt every time it was told not to.
 */
const has = (name) => argv.includes(`--${name}`);

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
if (!has('skip-build')) {
  // Runs the CLI's own entry point with this Node binary rather than shelling out
  // to `npx`: no shell means no argument quoting to get wrong, and no dependence on
  // how npx happens to be installed.
  const cli = fileURLToPath(import.meta.resolve('@angular/cli/bin/ng.js'));
  const build = spawnSync(execPath, [cli, 'build'], { stdio: 'inherit' });
  if (build.status !== 0) exit(build.status ?? 1);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// 404.html
// ---------------------------------------------------------------------------
const notFoundSource = join(BROWSER, '404', 'index.html');
if (!(await exists(notFoundSource))) {
  // Failing loudly matters: a missing 404.html is invisible until someone follows a
  // dead link and gets the host's default page instead of the portfolio's.
  console.error(
    `postbuild-static: expected ${notFoundSource}. Is the '404' route still declared ` +
      `as RenderMode.Prerender in app.routes.server.ts?`,
  );
  exit(1);
}
await copyFile(notFoundSource, join(BROWSER, '404.html'));

// ---------------------------------------------------------------------------
// robots.txt and sitemap.xml
// ---------------------------------------------------------------------------
const host = env['VERCEL_PROJECT_PRODUCTION_URL'];
const rawSite = flag('site') ?? (host ? `https://${host}` : null);

if (!rawSite) {
  console.log('postbuild-static: 404.html written');
  console.log(
    'postbuild-static: no site URL (VERCEL_PROJECT_PRODUCTION_URL unset and no --site), ' +
      'so robots.txt and sitemap.xml were skipped — they need absolute URLs',
  );
  exit(0);
}

// Normalised without a trailing slash, so joining a path never produces `//`.
const site = rawSite.replace(/\/+$/, '');
const manifest = JSON.parse(await readFile(join(DIST, 'prerendered-routes.json'), 'utf8'));

/**
 * Angular writes `{ "routes": { "/about": {}, ... } }`.
 *
 * The nesting is easy to miss: `Object.keys` of the whole document yields
 * `["routes"]`, which once produced a one-entry sitemap whose `<loc>` ended in
 * "routes". The array branch is kept for older Angular versions that emitted one.
 */
const rawRoutes = Array.isArray(manifest)
  ? manifest
  : Object.keys(manifest?.routes ?? manifest ?? {});

const paths = rawRoutes
  .map((entry) => (typeof entry === 'string' ? entry : entry?.route))
  .filter((route) => typeof route === 'string' && route.length > 0)
  // The not-found page is noindex by definition, and it is the one prerendered
  // route that must never appear in a sitemap.
  .filter((route) => !route.replace(/\/+$/, '').endsWith('/404'))
  .sort();

if (paths.length === 0) {
  console.error(
    'postbuild-static: no prerendered routes found — refusing to write an empty sitemap',
  );
  exit(1);
}

const urls = paths.map((path) => `  <url>\n    <loc>${site}${path}</loc>\n  </url>`).join('\n');

await writeFile(
  join(BROWSER, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

await writeFile(
  join(BROWSER, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
);

console.log(`postbuild-static: site ${site}`);
console.log(`postbuild-static: 404.html, robots.txt, sitemap.xml (${paths.length} routes)`);
