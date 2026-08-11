/**
 * Builds the portfolio for GitHub Pages, then makes the output a Pages site.
 *
 * ## Why this is a Node script and not two npm scripts
 *
 * The base href and the absolute site URL are the same two facts in different
 * shapes, and both are derivable from `GITHUB_REPOSITORY` in Actions. Doing that in
 * an npm script means shell variable expansion, which differs between cmd.exe,
 * PowerShell and sh — `$PAGES_BASE_HREF` on Windows expands to the literal string
 * and silently produces a broken `<base href>`. Node reads `process.env` the same
 * way everywhere, so the derivation lives here and the npm script is one line.
 *
 * ## What it produces
 *
 *   ng build --base-href <href>     prerendered HTML for every real route
 *   404.html                        the not-found page, as the file Pages serves
 *   .nojekyll                       stops Pages running the output through Jekyll
 *   robots.txt                      with the real production URL
 *   sitemap.xml                     one entry per route Angular actually prerendered
 *
 * ## Usage
 *
 *   npm run build:pages                                   # derived from GITHUB_REPOSITORY
 *   node scripts/build-pages.mjs --site https://x.dev     # explicit, for a custom domain
 *   node scripts/build-pages.mjs --base-href / --site http://localhost:8080
 *
 * No dependencies. The route list comes from `prerendered-routes.json`, which the
 * build writes beside `browser/`, so the sitemap can never list a page that was not
 * built or miss one that was.
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
 * Separate from `flag()` on purpose: `flag('skip-build')` returns `null` for a bare
 * `--skip-build`, because there is no value after it — so the switch silently did
 * nothing and the script rebuilt every time it was asked not to.
 */
const has = (name) => argv.includes(`--${name}`);

/**
 * Where the site will live.
 *
 * A GitHub Pages *project* site is served from `/<repo>/`, so the base href has to
 * carry that prefix or every asset resolves one level too high. A *user* site
 * (`<owner>.github.io`) and a custom domain are both served from the root, where the
 * base href is just `/`.
 *
 * `GITHUB_REPOSITORY` is `owner/repo` and is set for us by Actions.
 */
function resolveTarget() {
  const explicitSite = flag('site');
  const explicitBase = flag('base-href');
  if (explicitSite && explicitBase) return { site: explicitSite, baseHref: explicitBase };

  const repository = env['GITHUB_REPOSITORY'];
  if (!repository) {
    console.error(
      'build-pages: no GITHUB_REPOSITORY in the environment. Pass --site and --base-href ' +
        'explicitly, e.g. --base-href / --site http://localhost:8080',
    );
    exit(1);
  }

  const [owner, repo] = repository.split('/');
  const isUserSite = repo.toLowerCase() === `${owner.toLowerCase()}.github.io`;

  return {
    site: explicitSite ?? (isUserSite ? `https://${repo}` : `https://${owner}.github.io/${repo}`),
    baseHref: explicitBase ?? (isUserSite ? '/' : `/${repo}/`),
  };
}

const { site: rawSite, baseHref: rawBaseHref } = resolveTarget();

// Normalised without a trailing slash, so joining a path never produces `//`.
const site = rawSite.replace(/\/+$/, '');

/**
 * The base href MUST end in a slash, and this is not cosmetic.
 *
 * `configure-pages` reports `base_path` as `/ahmed-yassin-portfolio` — no trailing
 * slash. With `<base href="/ahmed-yassin-portfolio">` a browser treats the last
 * segment as a *file* and resolves `projects/x.webp` against its parent, giving
 * `/projects/x.webp` — every asset 404s, on every page. Normalised here rather than
 * in the workflow, so it holds however the value arrives.
 */
const baseHref = `/${rawBaseHref.replace(/^\/+|\/+$/g, '')}/`.replace(/^\/{2,}/, '/');

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------
if (!has('skip-build')) {
  console.log(`build-pages: ng build --base-href ${baseHref}`);

  // Runs the CLI's own entry point with this Node binary rather than shelling out to
  // `npx`. No shell means no argument quoting to get wrong — via a shell, a value
  // containing a space arrives at `ng` split in two and it exits with
  // "Unknown argument: base-href" — and no dependence on how npx is installed.
  const cli = fileURLToPath(import.meta.resolve('@angular/cli/bin/ng.js'));
  const build = spawnSync(execPath, [cli, 'build', '--base-href', baseHref], {
    stdio: 'inherit',
  });
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
  // dead link and gets Pages' own default page instead of the portfolio's.
  console.error(
    `build-pages: expected ${notFoundSource}. Is the '404' route still declared as ` +
      `RenderMode.Prerender in app.routes.server.ts?`,
  );
  exit(1);
}
await copyFile(notFoundSource, join(BROWSER, '404.html'));

// ---------------------------------------------------------------------------
// .nojekyll
// ---------------------------------------------------------------------------
// Jekyll ignores files and directories beginning with an underscore. Angular does
// not currently emit any, but a future chunk or asset that did would vanish
// silently, and this is one empty file.
await writeFile(join(BROWSER, '.nojekyll'), '');

// ---------------------------------------------------------------------------
// robots.txt and sitemap.xml
// ---------------------------------------------------------------------------
const manifest = JSON.parse(await readFile(join(DIST, 'prerendered-routes.json'), 'utf8'));

/**
 * Angular writes `{ "routes": { "/base/about": {}, ... } }`.
 *
 * Two things about that shape cost a wrong sitemap the first time, both found by
 * reading the file rather than assuming it:
 *
 * 1. The routes are nested under a `routes` key. Taking `Object.keys` of the whole
 *    document yields `["routes"]` — one entry, and a `<loc>` ending "portfolioroutes".
 * 2. Each path **already carries the base href**, so it is `/ahmed-yassin-portfolio/about`,
 *    not `/about`. Appending it to a site URL that also has the prefix doubles it.
 *
 * So the loc is built from the *origin* of the site URL plus the route as written.
 * The array branch is kept for older Angular versions that emitted one.
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
  // The home route comes through without a trailing slash (`/ahmed-yassin-portfolio`);
  // canonicalise it so the sitemap and the served URL agree.
  .map((route) => (route === baseHref.replace(/\/+$/, '') ? baseHref : route))
  .sort();

if (paths.length === 0) {
  console.error('build-pages: no prerendered routes found — refusing to write an empty sitemap');
  exit(1);
}

const origin = new URL(site).origin;
const urls = paths.map((path) => `  <url>\n    <loc>${origin}${path}</loc>\n  </url>`).join('\n');

await writeFile(
  join(BROWSER, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);

await writeFile(
  join(BROWSER, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`,
);

console.log(`build-pages: base href ${baseHref}`);
console.log(`build-pages: site ${site}`);
console.log(`build-pages: 404.html, .nojekyll, robots.txt, sitemap.xml (${paths.length} routes)`);
