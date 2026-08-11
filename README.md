# ahmed-yassin-portfolio

Portfolio of Ahmed Yassin — Front-End Web Developer. Angular 21, prerendered to
static HTML, with a WebGL hero and per-project brand atmospheres.

The application lives in [`profile/`](profile/); the repository root holds only this
file. Architecture and decisions are documented in
[`profile/docs/ARCHITECTURE.md`](profile/docs/ARCHITECTURE.md).

## Deployment

| | |
| --- | --- |
| Host | Vercel |
| Source | this repository, branch `main` |
| Root directory | `profile` |
| Build | `npm run build:static` |
| Output directory | `dist/profile/browser` |
| Config | [`profile/vercel.json`](profile/vercel.json) |

Every route is prerendered to static HTML at build time, so the deployment is static
files served from the domain root — no serverless function and no SPA fallback.
`/work/:slug` is a real file, so a direct visit or a refresh is a plain static hit.
Unknown paths get the portfolio's own not-found page from `404.html`.

Asset paths are **base-relative** (`projects/…`, not `/projects/…`), resolved against
`<base href>`. At the root that is identical to root-relative; it also means the same
build would be correct under a sub-path, so the hosting choice is not baked into the
data.

### How it works

Pushing to `main` triggers a Vercel deployment. Vercel runs, from `profile/`:

```
npm ci
npm run lint:styles && npm test && npm run build:static
```

A failing stylelint check or unit test fails the deployment rather than shipping.
`scripts/postbuild-static.mjs` then writes `404.html`, `robots.txt` and a
`sitemap.xml` generated from the routes Angular actually prerendered, taking the
production URL from `VERCEL_PROJECT_PRODUCTION_URL`.

Pull requests get their own preview URL automatically.

### Deploying a change

```bash
git push origin main      # that is the whole deployment step
```

### Running it locally

```bash
cd profile
npm ci
npm start                                  # dev server
npm test                                   # unit tests
npm run build:static                       # exactly what Vercel builds
npm run build && npm run serve:ssr          # the Node/SSR target, at :4000
```

`build:static` skips `robots.txt` and `sitemap.xml` locally, because both need an
absolute production URL; pass `--site https://example.com` to generate them anyway.

The Node server in `profile/src/server.ts` is retained and still works. Vercel does
not use it — the only thing it adds over the static output is rendering the 404 route
on demand, which `404.html` covers instead.
