# ahmed-yassin-portfolio

Portfolio of Ahmed Yassin — Front-End Web Developer. Angular 21, prerendered to
static HTML, with a WebGL hero and per-project brand atmospheres.

The application lives in [`profile/`](profile/); the repository root holds only this
file and the deployment workflow. Architecture and decisions are documented in
[`profile/docs/ARCHITECTURE.md`](profile/docs/ARCHITECTURE.md).

## Deployment

| | |
| --- | --- |
| Production URL | https://ahmedyassin5821-sketch.github.io/ahmed-yassin-portfolio/ |
| Host | GitHub Pages (GitHub Actions, not a `gh-pages` branch) |
| Source branch | `main` |
| Build | `npm run build:pages` in `profile/` |
| Published directory | `profile/dist/profile/browser` |

Every route is prerendered to static HTML at build time, so GitHub Pages serves real
HTML for each one — including `/work/:slug` on a direct visit or a refresh — with no
SPA fallback and no server. Unknown paths get the portfolio's own not-found page with
a genuine 404 status, from `404.html`.

### How it works

Pushing to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml):
install with `npm ci`, check styles, run tests, build, publish to Pages. A failing
test or a budget violation fails the deploy rather than shipping.

`scripts/build-pages.mjs` derives the base href and the site URL from
`GITHUB_REPOSITORY`, then writes `404.html`, `.nojekyll`, `robots.txt` and a
`sitemap.xml` generated from the routes Angular actually prerendered. Nothing is
hard-coded to a machine or a URL.

Asset paths are **base-relative** (`projects/…`, not `/projects/…`) so the same build
is correct at a domain root or under a repository sub-path.

### Deploying a change

```bash
git push origin main      # that is the whole deployment step
```

Watch it in the repository's **Actions** tab; the live URL appears on the
`github-pages` environment. To re-deploy without a commit, run the workflow manually
from that tab.

### Running it locally

```bash
cd profile
npm ci
npm start                                   # dev server
npm test                                    # unit tests
npm run build && npm run serve:ssr           # the Node/SSR target, at :4000

# Or reproduce the Pages output exactly:
GITHUB_REPOSITORY=owner/repo npm run build:pages
```

The Node server in `profile/src/server.ts` is retained and still works. It is not
used by GitHub Pages — the only thing it adds over the static output is rendering the
404 route on demand, which `404.html` covers instead.

### First-time setup

GitHub Pages has to be pointed at Actions once, by hand: **Settings → Pages → Build
and deployment → Source → GitHub Actions**. Until that is set, the workflow builds
successfully and the deploy step fails.
