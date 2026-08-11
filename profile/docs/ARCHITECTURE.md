# Ahmed Yassin — Portfolio Architecture

**Sprint 1 deliverable — planning & architecture. No implementation code.**
Status: awaiting approval. Nothing in this document has been built yet.

---

## 0. Context

Ahmed Yassin is a Front-End & eCommerce Engineer at 2B Egypt, an Angular developer, a freelance Shopify developer, and an experienced Magento 2 front-end engineer. This portfolio has to convert three distinct audiences — Angular recruiters, Magento companies, Shopify clients — and it has to feel like a premium software product, not a template.

**What exists today**

| Item | State |
| --- | --- |
| Angular app | Scaffolded at `profile/`, CLI 21.0.4, `@angular/core` **21.2.19** installed, SSR + Express wired |
| App code | Untouched boilerplate — `app.html` is the Angular welcome page, `styles.scss` empty, `routes` is `[]` |
| Test runner | **Vitest** via `@angular/build:unit-test` + jsdom (not Karma) |
| i18n | **Nothing** — no `i18n` block in `angular.json`, `@angular/localize` not installed |
| Animation deps | **Wrong.** `motion@13` is in dependencies; it pulls `framer-motion`, which declares React/React-DOM peers. `gsap` and `three` are **not installed** |
| Repo | One commit (`.gitignore` + README). Everything else untracked. Stray root `package.json` installs Framer Motion and no Angular |
| Content | CV received: `Attachments/Ahmed-Yassin FE Reaume.pdf` — 9 real projects, roles, dates, education, certifications |

**Approved decisions (Sprint 1)**

1. **i18n:** Angular native `@angular/localize` — compile-time, two builds at `/en/` and `/ar/`.
2. **Content:** real content from the CV, modelled as typed TS data files.
3. **3D:** hero accent **plus one** signature moment. Two lazy WebGL chunks, capability-gated.
4. **Zero React, anywhere.** `motion`/`framer-motion` gets removed in Sprint 2, step 1.
5. ~~**Accent:** "Signal Indigo" `#6E8BFF`~~ → **superseded by Sprint 1.5**, see [BRAND-SYSTEM.md](./BRAND-SYSTEM.md).
6. ~~**Themes:** dark default and a full light theme~~ → **amended by Sprint 1.5**: light-first only, dark deferred.
7. **Contact:** `POST /api/contact` on the existing Express server. No third-party service.
8. **Project assets:** all nine projects shown visually, pending written permission per client. Work pages build against placeholders so nothing blocks; anything without permission falls back to a text wordmark.
9. **Arabic numerals:** Latin digits (`2025`) in the Arabic build.

**Sprint 1.5 added** the finalized brand system, derived from the logo at `Attachments/my-logo.svg`: monochrome warm neutral, Geist + IBM Plex Mono + IBM Plex Sans Arabic + Amiri, near-zero radius, no spring motion. See [BRAND-SYSTEM.md](./BRAND-SYSTEM.md).

---

## 1. Folder structure

Deliberate rule: **`three/` and `features/` sit at the same level**, so every bundle boundary is visible from the tree alone.

```
ahmed-yassin-portfolio/                 ← repo root (app promoted here, see ADR-009)
├── angular.json  package.json  tsconfig*.json
├── .eslintrc / eslint.config.js        ← angular-eslint + import boundaries
├── .stylelintrc.json                   ← bans physical CSS props + raw hex
├── docs/
│   ├── ARCHITECTURE.md                 ← this file
│   ├── DESIGN-SYSTEM.md                ← token tables, component specs
│   └── CONTENT-MODEL.md                ← what copy is needed, in both languages
├── project-assets/                     ← raw project captures. NOT deployed —
│   │                                     everything in public/ ships verbatim.
│   ├── <slug>/                         ← originals exactly as supplied
│   └── _unused/                        ← kept, not shown (see §12)
├── scripts/
│   ├── generate-logo-assets.mjs        ← the AY mark, all variants
│   └── optimize-project-assets.mjs     ← redact + optimise → public/projects/
├── public/
│   ├── fonts/                          ← self-hosted woff2, subset per locale
│   ├── projects/<slug>/                ← GENERATED. Never edit by hand; §12
│   ├── img/{projects,og,profile}/       ← AVIF + WebP, pre-sized
│   ├── posters/                         ← static stills of the WebGL scenes
│   ├── cv/ahmed-yassin-{en,ar}.pdf
│   ├── icons/sprite.svg                ← Lucide subset, one sprite
│   └── robots.txt
├── src/
│   ├── index.html  main.ts  main.server.ts  server.ts
│   ├── locale/
│   │   ├── messages.xlf                ← extracted source (en-US)
│   │   └── messages.ar.xlf             ← Arabic translations
│   ├── styles/
│   │   ├── _tokens.primitive.scss      ← raw scale values
│   │   ├── _tokens.semantic.scss       ← themeable custom properties
│   │   ├── _themes.scss                ← dark (default) + light
│   │   ├── _typography.scss            ← incl. [lang^="ar"] guards
│   │   ├── _breakpoints.scss           ← mq() mixin, em-based, emits nothing
│   │   ├── _logical.scss               ← RTL-safe helpers
│   │   ├── _motion.scss                ← duration/easing tokens + reduced-motion
│   │   ├── _a11y.scss                  ← sr-only, focus ring, forced-colors
│   │   ├── _reset.scss   _fonts.scss   _utilities.scss
│   │   └── _index.scss                 ← @forward barrel consumed by components
│   ├── styles.scss                     ← global entry
│   └── app/
│       ├── app.ts / app.html / app.scss
│       ├── app.config.ts  app.config.server.ts
│       ├── app.routes.ts  app.routes.server.ts
│       │
│       ├── core/                       ← injectables only, zero UI, providedIn:'root'
│       │   ├── i18n/         locale.config.ts · locale.service.ts · locale-path.token.ts
│       │   ├── seo/          seo.service.ts · structured-data.service.ts · title.strategy.ts
│       │   ├── theme/        theme.store.ts        ← deferred with dark mode; not built in Sprint 2
│       │   ├── animation/    gsap.service.ts · motion-preference.service.ts · scroll.service.ts · motion.tokens.ts
│       │   ├── platform/     viewport.service.ts · device-capability.service.ts · is-browser.ts
│       │   ├── routing/      network-aware-preload.strategy.ts
│       │   └── tokens/       window.token.ts
│       │
│       ├── shared/                     ← presentational, reusable, feature-blind
│       │   ├── ui/           one folder per component (see §7)
│       │   ├── directives/   reveal · stagger · parallax · count-up · split-text · focus-trap · ltr · magnetic
│       │   ├── pipes/        duration.pipe.ts · safe-html.pipe.ts
│       │   └── models/       icon-name.ts · variant.ts
│       │
│       ├── layout/                     ← app chrome, part of the initial bundle
│       │   ├── header/ nav/ footer/ mobile-nav/
│       │   ├── language-switcher/ skip-link/ scroll-progress/
│       │   │   (theme-toggle/ deferred — light-only per BRAND-SYSTEM.md)
│       │
│       ├── features/                   ← lazy route boundaries
│       │   ├── home/                   REWORKED — Sprint 6 (see §13)
│       │   │   ├── home.ts | .html | .scss   ← the sticky stage + spacer
│       │   │   ├── acts/      act-mark/ act-count/ act-gate/ act-resolve/
│       │   │   ├── animation/ act-timeline.ts   ← the acts, as data
│       │   │   │              camera-path.ts    ← camera keyframes, pure
│       │   │   │              corridor-layout.ts ← where the planes sit
│       │   │   │              easing.ts · home-progress.ts
│       │   │   │              home-choreography.ts  ← the ONE ScrollTrigger
│       │   │   └── webgl/     scene/           ← framework-free Three.js
│       │   │                  strata-canvas/   ← Angular wrapper, gating + lifecycle
│       │   │                  strata-poster/   ← static SVG fallback
│       │   ├── work/                   BUILT — Sprint 5
│       │   │   ├── work.ts | .html | .scss        ← the six-project index
│       │   │   ├── project-card/       ← one project on the index
│       │   │   ├── project-logo/       ← client logo chip, incl. the dark surface
│       │   │   ├── project-nav/        ← previous / next, wraps around
│       │   │   └── work-detail/        ← /work/:slug, prerendered per slug
│       │   ├── about/        about.routes.ts · sections/
│       │   ├── services/     services.routes.ts
│       │   ├── contact/      contact.routes.ts
│       │   └── not-found/
│       │
│       ├── data/                       ← content-as-code, typed, bilingual
│       │   ├── models/       project.model.ts · experience.model.ts · skill.model.ts · …
│       │   ├── projects.data.ts   home.content.ts   work.content.ts   ← BUILT
│       │   ├── project-media.generated.ts  ← paths + measured sizes; see §12
│       │   ├── experience.data.ts skills.data.ts
│       │   ├── education.data.ts  certifications.data.ts  profile.data.ts
│       │   └── content.service.ts      ← signal selectors + filters
│       │
│       └── three/                      ← superseded: WebGL now lives beside the
│                                          feature that owns it, in
│                                          features/home/webgl/. Scene files stay
│                                          framework-free and are still reachable
│                                          ONLY via dynamic import().
│           ├── hero-field/        hero-field.ts (component) · hero-field.scene.ts (pure three)
│           ├── stack-constellation/
│           └── shared/            renderer.factory.ts · raf-loop.ts · shaders/
└── e2e/                                ← Playwright: a11y, RTL screenshots, budgets
```

**Path aliases** (none exist today — add to `tsconfig.json`):
`@core/*`, `@shared/*`, `@layout/*`, `@features/*`, `@data/*`, `@styles/*`.
`@three/*` is deliberately **omitted** so a static import is inconvenient and stands out in review.

**Naming convention** — set explicitly in `angular.json` schematics, applied without exception:

| Kind | File | Class |
| --- | --- | --- |
| Component | `project-card/project-card.ts` `.html` `.scss` | `ProjectCard` |
| Directive | `reveal.directive.ts` | `RevealDirective` |
| Service / store | `gsap.service.ts` / `theme.store.ts` | `GsapService` / `ThemeStore` |
| Pipe | `duration.pipe.ts` | `DurationPipe` |
| Model | `project.model.ts` | `Project` (type/interface) |

This keeps the CLI-default no-suffix style for components while retaining explicit suffixes elsewhere (ADR-010).

---

## 2. Feature & component organization

No `NgModule` anywhere. Everything standalone.

### Layer contract

```
features  ──▶  shared  ──▶  core
    │                         ▲
    └────────▶  data  ────────┘
```

| Layer | May import | Must never |
| --- | --- | --- |
| `core/` | Angular, other `core/` | Import `features/`, `shared/`, or `data/`. Contain a template |
| `shared/` | `core/`, `shared/` | Import `features/` or `data/`. Know any business concept |
| `data/` | `core/i18n`, models | Import a component |
| `layout/` | `core/`, `shared/` | Import `features/` |
| `features/` | anything except another feature | Cross-import a sibling feature |
| `three/` | `core/`, `three/` | Be imported statically from anywhere |

Enforced by ESLint `no-restricted-imports` zones — a violation fails CI, not review.

### Angular template convention

**Components use external `.html` templates and `.scss` stylesheets. TypeScript files contain component logic, state, configuration, dependency injection, animation orchestration, and types — not markup.**

This is a permanent project convention, not a per-sprint preference. It applies to every component created from Sprint 4 onward.

```
home/
├── home.ts        logic, state, DI, types
├── home.html      markup
└── home.scss      styles
```

| Rule | |
| --- | --- |
| Substantial HTML | Never inside a `template:` literal |
| Large SVG markup | Never inside TypeScript — see `logo-path.ts` for the pattern: geometry as a constant, markup in the template |
| Complex styles | Never inside `styles: [...]` |
| Inline templates | Acceptable **only** for genuinely trivial structural components, where extracting a file would add a file and no clarity |

Two practical reasons beyond tidiness, both encountered in this project:

1. **Backticks inside a template literal terminate the string.** A comment containing `` `inert` `` or `` `currentColor` `` produces "Incorrect number of arguments to @Component decorator" — an error that points nowhere near the real cause. External templates cannot fail this way.
2. **Editors format, lint, and autocomplete `.html` properly.** Angular's own language service is markedly better in a real template file than inside a string.

When modifying an existing component, do not rewrite unrelated components purely to satisfy this rule — but if you are already working in a substantial inline template, move it to an external file.

Applying exactly that: Sprint 5 moved `Button` and `TextLink` to `.html` files,
because both were being edited anyway — `TextLink` to localise its new-tab
warning, `Button` because the same change touched it. Other Sprint 2/3
components (`Badge`, `Card`, `Icon`, `Logo`, `FormField`, the layout chrome, and
the dev playground) still carry inline templates and are left alone until
something else brings a change to them. Everything created from Sprint 4 onward
— all of `features/home/` and `features/work/` — uses external files.

### Component rules

- `changeDetection: ChangeDetectionStrategy.OnPush` on every component.
- Signal APIs only: `input()`, `input.required()`, `output()`, `model()`, `viewChild()`, `computed()`.
- `host: { … }` metadata object — no `@HostBinding` / `@HostListener`.
- Built-in control flow `@if` / `@for` / `@switch` / `@defer`. No `NgIf`/`NgFor` imports.
- No `ngClass` / `ngStyle`. Use `[class.x]` and `[style.--custom-prop]`.
- Never inject `DOCUMENT`/`window` directly — go through `core/tokens` and `core/platform`.
- All DOM measurement and animation setup inside `afterNextRender()`.

### Section vs. shared component

A **section** is layout-and-copy specific to one page; it lives under `features/<page>/sections/`. It is presentational: data arrives via `input()`, events leave via `output()`, and the page component is the only thing that touches `ContentService`. The moment a section is needed by a second feature it moves to `shared/ui/` and loses its copy.

### Page composition example (Home)

```
Home (page)          ← injects ContentService, owns SEO, passes data down
├── Hero             ← @defer(hydrate on interaction) + WebGL child
├── ProofStrip       ← 2B · Magento · Shopify · Angular, above the fold
├── Pillars          ← the three offers
├── FeaturedWork     ← 3 ProjectCards (one per platform)
├── ExperienceTimeline
├── TechStack        ← @defer(on viewport) + WebGL constellation
├── Services
└── ContactCta
```

---

## 3. Routing strategy

Because i18n is compile-time, each build is served under a fixed base href. Both locales get symmetric URLs — no locale is second-class.

```
/                     → server-side 302 by Accept-Language → /en/ or /ar/
/en/                  Home            (eager — in the main bundle)
/en/work              Work list       (lazy)
/en/work/:slug        Case study      (lazy, same chunk as the list)
/en/about             About           (lazy)
/en/services          Services        (lazy)
/en/contact           Contact         (lazy)
/en/**                Not found       (lazy, HTTP 404)
/ar/…                 identical tree
```

**Home is eager, deliberately.** It is the LCP page; a `loadChildren` round-trip buys nothing when the HTML is already prerendered. Every other feature is lazy via `loadChildren: () => import('./features/x/x.routes')`.

**Slugs stay Latin in both locales** (`/ar/work/2b-revamp`, not `/ar/أعمال/…`). `$localize` *can* translate route paths, but percent-encoded Arabic URLs break sharing, analytics, and backlinks. Recorded as a deliberate trade-off.

**Router configuration**

| Feature | Why |
| --- | --- |
| `withComponentInputBinding()` | `:slug` binds straight into `input()` |
| `withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })` | Back must restore position — a stated UX gate |
| `withViewTransitions({ skipInitialTransition: true })` | Native shared-element page transitions, zero JS cost; skipped under reduced-motion |
| `withPreloading(NetworkAwarePreloadStrategy)` | Custom: preload on idle, only when `effectiveType === '4g'` and `!saveData` |
| Custom `TitleStrategy` | Localized `<title>` + delegates to `SeoService` on every navigation |

No guards. **No resolvers** — content is compile-time data, so a resolver would only add navigation latency.

**Server routes** (`app.routes.server.ts`) — the SSG win:

```ts
{ path: 'work/:slug', renderMode: RenderMode.Prerender,
  getPrerenderParams: async () => PROJECTS.map(p => ({ slug: p.slug })) }
{ path: '**',         renderMode: RenderMode.Prerender }
```

Every page for both locales becomes static HTML at build time — deployable to a pure CDN. The Express server stays only as the `/` language redirect, the 404 status handler, and the contact endpoint.

**Focus on navigation:** move focus to `<main>` and announce the new page title in an `aria-live="polite"` region. Route transitions must never leave a screen-reader user stranded at the old position.

---

## 4. Translation strategy

### Build configuration

```jsonc
// angular.json
"i18n": {
  "sourceLocale": { "code": "en-US", "baseHref": "/en/", "subPath": "en" },
  "locales": {
    "ar-EG": { "translation": "src/locale/messages.ar.xlf", "baseHref": "/ar/", "subPath": "ar" }
  }
}
// build options
"localize": true,
"i18nMissingTranslation": "error"   ← a missing Arabic string fails CI instead of shipping English
```

Output: `dist/browser/en/` and `dist/browser/ar/`, each containing only its own locale's strings **and only its own fonts**. Arabic visitors never download Latin display faces and vice-versa — a real perf dividend of compile-time i18n.

### Rules

| Concern | Rule |
| --- | --- |
| IDs | **Custom IDs mandatory** — `i18n="@@hero.headline"`. Auto-generated hash IDs break on every copy edit. CI check rejects any `messages.xlf` unit without a custom id |
| Attributes | `i18n-aria-label`, `i18n-alt`, `i18n-title` — a11y text is translated too, not just visible copy |
| TS strings | `$localize` tagged templates for SEO titles, meta descriptions, and data files |
| Content data | `title: $localize\`:@@project.2b.title:2B Website Revamp\`` — compile-time substitution keeps one object and ships one language |
| Plurals | ICU `{count, plural, …}` — Arabic has **six** plural categories (zero/one/two/few/many/other); never string-concatenate counts |
| Dates & numbers | Angular pipes are locale-aware automatically (`LOCALE_ID` is set per build) |
| Digits | `ar-EG` renders Arabic-Indic digits (٢٠٢٥) by default. For a technical portfolio Latin digits read better — force via `Intl.NumberFormat('ar-EG-u-nu-latn')` in a wrapper pipe. Ahmed's call at review |
| Extraction | `ng extract-i18n --format xlf2 --output-path src/locale`, merged into `messages.ar.xlf` |
| Authorship | Ahmed writes and reviews all Arabic (Native/Bilingual). No machine translation |

### Hydration

`provideClientHydration(withEventReplay(), withI18nSupport(), withIncrementalHydration())`

`withI18nSupport()` is **required** — hydrating templates that contain i18n blocks fails without it. All three are verified present in the installed `@angular/platform-browser` 21.2.19.

### Language switcher

A real `<a href>`, never a JS-only button — crawlable, works without JS, and gives search engines the locale relationship. It maps the current path onto the other locale's base href, preserving path, query, and hash:

```
/en/work/2b-revamp?tag=magento#gallery  →  /ar/work/2b-revamp?tag=magento#gallery
```

### `lang` / `dir`

`index.html` is shared across locales and Angular does not rewrite it. Setting these in the root component's constructor runs **during SSR**, so the prerendered HTML already carries the correct values — no flash, no post-paint mutation:

```
<html lang="en" dir="ltr">   ← en build
<html lang="ar" dir="rtl">   ← ar build
```

### RTL

Each build has a fixed direction, so there is no runtime `[dir]` switching to manage. Styles are still written direction-agnostically so a component is correct in either build.

| Concern | Rule |
| --- | --- |
| CSS | **Logical properties only** — `margin-inline-start`, `padding-inline`, `inset-inline-end`, `border-start-start-radius`, `text-align: start`. Physical `left`/`right`/`margin-left`… banned by stylelint (`stylelint-use-logical`) |
| GSAP | `x` is physical. All horizontal tweens go through `GsapService.dirX(px)`, which negates in RTL. **This is the single most likely RTL bug** |
| Horizontal ScrollTrigger | Track direction and `end` values invert in RTL |
| Icons | Directional glyphs (arrows, chevrons, back) flip via an `Icon` `flipInRtl` input. Logos, play buttons, and checkmarks must **not** flip |
| Embedded Latin | "Angular 21", "Magento 2", phone numbers, code — wrap in `appLtr` (`dir="ltr"` + `unicode-bidi: isolate`) or Arabic sentences render them backwards |
| Arabic typography | `letter-spacing: normal` **forced** (tracking breaks Arabic letter joining), no `text-transform: uppercase`, no small-caps, no synthetic bold, line-height 1.85 vs 1.6, +1px optical size compensation |
| Text splitting | `appSplitText` splits by **word only** in Arabic — character splitting destroys joined letterforms |
| 3D scenes | Not mirrored. Abstract geometry has no reading order; documented as intentional |

---

## 5. Responsive strategy

Mobile-first. Every rule is the base rule; media queries only add.

| Token | Min-width | Target |
| --- | --- | --- |
| `xs` | 0 (base) | 320–479 phones |
| `sm` | 30em / 480px | large phones |
| `md` | 48em / 768px | tablets |
| `lg` | 64em / 1024px | laptops |
| `xl` | 80em / 1280px | desktop |
| `2xl` | 96em / 1536px | wide |

Media queries are **em-based** so they honour the user's browser font size — a px query silently breaks zoom users.

**Container queries do the real work.** Viewport queries handle page layout; `@container` handles components. A `ProjectCard` adapts to the width of its slot, so the same component is correct in a 3-up grid, a 2-up grid, and a sidebar without a single variant flag. This is the difference between a responsive site and a responsive design *system*.

**Fluid, not stepped**

```scss
--fs-display-xl: clamp(2.75rem, 1.6rem + 5.2vw, 5.5rem);
--section-y:     clamp(3rem, 2rem + 6vw, 8rem);
--gutter:        clamp(1rem, 0.5rem + 2vw, 2.5rem);
```

No JS measures anything for layout.

| Concern | Rule |
| --- | --- |
| Layout | CSS Grid for page/section, `subgrid` where card internals must align across a row, Flexbox for 1-D clusters. No floats, no fixed px widths |
| Viewport units | `100dvh` / `svh` / `lvh` — never `100vh` |
| Hero on landscape phone | `(orientation: landscape) and (max-height: 500px)` releases the min-height lock, or content clips |
| Widths | `--content-max: 75rem`; prose capped at `68ch` |
| Images | `NgOptimizedImage` with `ngSrcset` + explicit `width`/`height`; `priority` on the hero image **only**; AVIF with WebP fallback; `aspect-ratio` on every media box |
| Horizontal scroll | `overflow-x: clip` on `body`; wide tables and code get their own `overflow-x: auto` wrapper |
| Touch | ≥44×44px everywhere, ≥48px in primary nav, ≥8px between targets, `touch-action: manipulation` |
| Mobile nav | Full-screen sheet: focus-trapped, background `inert`, Escape closes, focus returns to the trigger |
| Behavioural breakpoints | `ViewportService` exposes `isMobile`/`isDesktop`/`isCoarsePointer` as signals from `matchMedia`, SSR-safe (server assumes mobile). Used **only** to decide whether to boot WebGL — never for layout |

**Test matrix:** 320 · 375 · 414 · 768 · 1024 · 1280 · 1440 · 1920, plus landscape phone, 200% zoom, 400% reflow, and `text-size-adjust`.

---

## 6. Animation strategy

### Six non-negotiables

1. **Content never waits on animation.** SSR HTML is fully readable before any JS runs. Reveal styles apply only under a `.js` class that an inline script adds to `<html>` — if JS fails, everything is simply visible. No element is ever left stranded at `opacity: 0`.
2. **The LCP element is never animated.** The `<h1>` paints immediately; its siblings animate around it. This protects the metric that the whole "premium but fast" claim rests on.
3. **`transform` and `opacity` only.** Never width, height, top, or left. `will-change` is added on demand and removed on completion.
4. **`prefers-reduced-motion: reduce` short-circuits everything** — final states applied instantly, ScrollTrigger scrubs off, WebGL replaced by its poster. Implemented once, in `_motion.scss` and `GsapService`.
5. **CSS owns micro-interactions; GSAP owns choreography.** Hover, press, and focus are CSS transitions. GSAP is only for timelines, scroll-linked sequences, and stagger.
6. **No scroll-jacking and no smooth-scroll library.** Native `scroll-behavior: smooth`, gated on reduced-motion.

### Motion tokens

Single source in `core/animation/motion.tokens.ts`, mirrored into CSS custom properties, with a unit test asserting the two stay in sync.

```
instant 0ms · fast 120ms · base 180ms · moderate 240ms · slow 320ms · deliberate 480ms
--ease-out: cubic-bezier(.22, 1, .36, 1)     entrances
--ease-in:  cubic-bezier(.55, 0, 1, .45)     exits (≈65% of enter duration)
--ease-spring: cubic-bezier(.34, 1.56, .64, 1)   press & pop
```

### GSAP integration

- Lazy-loaded and memoized: `GsapService.load()` dynamic-imports `gsap` + `ScrollTrigger` and registers the plugin. Browser-only. Never in the initial bundle.
- **Every** tween lives inside a `gsap.context()` scoped to the host element, reverted through `DestroyRef.onDestroy()`. Leaked ScrollTriggers are the number-one GSAP-in-SPA defect; the context pattern makes cleanup structural rather than remembered.
- `ScrollTrigger.refresh()` after navigation, after `document.fonts.ready`, and after lazy images decode — otherwise triggers compute against pre-font layout and fire at the wrong offsets.
- Zoneless change detection means GSAP's rAF loop triggers **no** change detection at all. This pairing is a large part of why the animation budget is affordable.
- Route transitions use the native View Transitions API via `withViewTransitions()`, with `view-transition-name` shared between a `ProjectCard` and the case-study hero — a true shared-element transition for zero JS.

**Reusable primitives** (directives, each reduced-motion aware and RTL-aware):
`appReveal` · `appStagger` · `appParallax` · `appCountUp` · `appSplitText` · `appMagnetic` · `appTilt` · `appMarquee`

**Budget:** ≤2 headline elements animating per viewport, 40ms stagger, ≤5 ScrollTriggers per section, GSAP chunk ≤45KB gz.

### Three.js — two scenes, both optional

| Scene | Placement | Concept |
| --- | --- | --- |
| `hero-field` | Behind the hero | Instanced `Points` drifting slowly, coloured from theme tokens, subtle pointer parallax. One custom shader, **no post-processing** |
| `stack-constellation` | Tech-stack section | Angular · Magento · Shopify · TypeScript nodes on a slowly rotating sphere, scroll-scrubbed. Labels are **DOM text overlaid on the canvas**, not rendered in WebGL |

Loading gate — all of these must pass, or the poster is used:

```
@defer (on viewport; prefetch on idle)  +  DeviceCapability.canRunWebGL()
  WebGL2 available · !saveData · deviceMemory ≥ 4 · hardwareConcurrency ≥ 4
  · (fine pointer OR viewport ≥ md) · !prefersReducedMotion
@placeholder → static AVIF poster, rendered offline from the same scene
```

The poster is what keeps LCP and CLS clean: the visual is always present in the SSR HTML, and WebGL only ever upgrades it.

| Constraint | Rule |
| --- | --- |
| Imports | Named imports from `three` only. **Never** `import * as THREE`. No `three/examples` |
| Renderer | `antialias: false`, `setPixelRatio(min(dpr, 2))`, `powerPreference: 'low-power'` |
| Loop | One shared rAF loop, paused by `IntersectionObserver` off-screen and on `visibilitychange`. Non-negotiable for battery |
| Teardown | Dispose geometries, materials, textures, renderer; `forceContextLoss()` |
| Structure | `*.scene.ts` is framework-free — testable, and deletable without touching Angular |
| Budget | ≤120KB gz for both scenes combined; must hold 60fps on a mid-range Android or it degrades to poster |
| a11y | Canvas is `aria-hidden="true"` + `role="presentation"`. Every fact it conveys also exists as DOM text |

`@angular/animations` is not used at all (ADR-004).

---

## 7. Shared component inventory

Tiered so Sprint 2 has an unambiguous starting set. All standalone, OnPush, signal-input, feature-blind.

### P0 — required for the Home page

| # | Component | Notes |
| --- | --- | --- |
| 1 | `Button` | primary/secondary/ghost/link · sm/md/lg · `loading` · `iconStart/End` · renders `<button>` or `<a>` correctly · ≥44px |
| 2 | `IconButton` | `ariaLabel` is `input.required()` — an unlabelled icon button becomes a compile error |
| 3 | `Icon` | Typed `IconName` union over the Lucide sprite · `flipInRtl` · token sizes · never emoji |
| 4 | `Link` | Internal vs external; external gets `rel="noopener"`, an indicator, and "opens in new tab" for SR |
| 5 | `Badge` / `Chip` | Tech tags and platform labels; always text + colour, never colour alone |
| 6 | `Card` | Surface primitive; `interactive` variant uses one real anchor with an `::after` overlay — never nested links |
| 7 | `SectionHeader` | eyebrow + heading + lead, with a `headingLevel` input so hierarchy stays legal |
| 8 | `ProjectCard` | Thumbnail (aspect-locked) · platform badge · role · tech chips · `view-transition-name` |
| 9 | `StatTile` | tabular-nums + `appCountUp`; reduced-motion shows the final value |
| 10 | `Timeline` / `TimelineItem` | Semantic `<ol>`; rail mirrors via logical properties |
| 11 | `SkillGroup` | Honest tiers — **no percentage bars** (ADR-008) |
| 12 | `Marquee` | Tech strip; static under reduced-motion; pauses on hover and focus |
| 13 | `MediaFrame` | Aspect-locked `<picture>`, AVIF/WebP, lazy, `<figcaption>` |
| 14 | `SkipLink` | First focusable element on the page |
| 15 | `ScrollProgress` | Grows from `inset-inline-start` so RTL is automatic |

### P1 — Work, About, Services

`Breadcrumbs` (+ JSON-LD) · `FilterChip` (`aria-pressed`) · `EmptyState` · `Tabs` (roving tabindex, arrow keys) · `Accordion` (button + `aria-expanded` + region) · `Lightbox` (focus trap, keyboard nav) · `CodeBlock` (forced `dir="ltr"`, build-time highlighting) · `ServiceCard` · `Avatar` · `LogoWall` (see Risk 7) · `Tooltip` (hover + focus + touch, never the sole source of information) · `Skeleton` · `Spinner`

### P2 — Contact & feedback

`FormField` (visible label, helper text, error slot, `aria-describedby`/`aria-invalid` wiring) · `TextInput` / `Textarea` / `Select` (16px font to prevent iOS zoom, ≥44px, correct `type`/`inputmode`/`autocomplete`) · `FormErrorSummary` (`role="alert"`, anchor links, focuses the first invalid field) · `Toast` + `ToastHost` (`aria-live="polite"`, 4s, never steals focus) · `Modal` (native `<dialog>`, 40–60% scrim, Escape, focus returns) · `Sheet` · `CopyButton` · honeypot + submit-timing spam guard (no CAPTCHA — better UX and better a11y)

### Directives & pipes

**Directives:** `appReveal` · `appStagger` · `appParallax` · `appCountUp` · `appSplitText` · `appMagnetic` · `appTilt` · `appFocusTrap` · `appClickOutside` · `appAutosize` · `appLtr`
**Pipes:** `DurationPipe` ("Feb 2025 – Present") · `SafeHtmlPipe`

**Deliberately not components:** `Container`, `Divider`, `Spacer`, `VisuallyHidden` — SCSS mixins and utility classes. Wrapping a `max-width` in a component adds a node and a template for nothing.

---

## 8. Design system

> [!IMPORTANT]
> **This entire section is superseded by [BRAND-SYSTEM.md](./BRAND-SYSTEM.md) (Sprint 1.5).**
>
> It was written before the logo was finalized. The logo turned out to be a purely achromatic, high-contrast Didone serif monogram, which invalidated the dark-first indigo direction and the Space Grotesk + Inter pairing below.
>
> The section is retained for decision history only. **For any visual value — colour, type, spacing, radius, shadow, motion, icons, grid — use BRAND-SYSTEM.md.** What survives from here: the token-layer architecture (primitive → semantic → component), the accessibility gates, and the performance budgets.

### Direction

Three audiences, one read: **an engineer who ships commerce at scale.** That rules out agency-brutalism and heavy gradient work. The direction is **Swiss/minimal structure with motion-driven behaviour** — near-monochrome, dark-first, one restrained accent, and craft carried by typography, spacing, and precision rather than decoration. Reference points: Linear, Vercel, Raycast.

Sourced from the UI-UX-Pro-Max dataset: product type 11 *Portfolio/Personal* → Motion-Driven + Minimalism; style 15 *Motion-Driven* (GSAP 10/10) + style 7 *Dark Mode (OLED)* (WCAG AAA, excellent perf); palette 81 *Developer Tool / IDE*; landing patterns 27 *Portfolio Grid* + 32 *Hero-Centric*. Aurora UI was rejected — the dataset flags its text-contrast risk, which conflicts with an accessibility-first brief.

### Colour — "Signal Indigo" (SUPERSEDED — history only)

Near-black slate canvas, one accent. Contrast measured against `--bg-0`.

| Semantic token | Dark (default) | Contrast |
| --- | --- | --- |
| `--bg-0` canvas | `#08090C` | — |
| `--bg-1` raised | `#0E1116` | — |
| `--bg-2` card | `#151922` | — |
| `--bg-3` hover | `#1D222D` | — |
| `--border-subtle` | `#262C38` | — |
| `--border-strong` | `#37404F` | 3.1:1 |
| `--fg-0` primary text | `#F4F6FA` | **17.5:1** AAA |
| `--fg-1` secondary | `#B6BECC` | **9.5:1** AAA |
| `--fg-2` muted | `#7C8697` | 5.2:1 AA — ≥16px only |
| `--accent-400` | `#6E8BFF` | 6.5:1 — accent text, borders, icons |
| `--accent-600` | `#4A6BF5` | fill for white text (4.6:1) |
| `--on-accent` | `#08090C` | 6.5:1 on `--accent-400` |
| `--focus` | `#7DD3FC` | ~9:1 — **distinct from the accent** so focus is never mistaken for hover |

Indigo-periwinkle is chosen specifically because it does **not** collide with any of the three platform hues below — a green or orange accent would fight Shopify and Magento respectively.

**Platform hues** — badges and case-study accents only, always paired with a text label so nothing is colour-only:

| Platform | Token | Value |
| --- | --- | --- |
| Angular | `--platform-angular` | `#F472A0` |
| Magento | `--platform-magento` | `#F2853A` |
| Shopify | `--platform-shopify` | `#A8CF5C` |

This is information design, not decoration: a Magento company can scan the work grid and find its platform instantly.

*Considered and rejected:* "Terminal Lime" (`#B8F135`) — sharper devtool read but collides with the Shopify platform hue; and a near-monochrome no-accent palette, which leaves CTAs without visual pull.

**Light theme is in scope for Sprint 2** (approved). Dark-only is a genuine accessibility limitation, and Cairo daylight is a real viewing condition. Built as a pure semantic-token swap: dark lives on bare `:root`, light redefines **semantic tokens only** under `[data-theme="light"]` and under `@media (prefers-color-scheme: light)` guarded as `:root:not([data-theme="dark"])` so an explicit choice always wins. Because components consume semantic tokens exclusively, none of them needs a second pass. First visit follows `prefers-color-scheme`, falling back to dark; an inline script in `index.html` stamps `data-theme` **before first paint** so there is no flash.

The contrast ratios in the table above are **dark-mode values and do not transfer** — the light palette gets its own independent verification pass.

### Typography

| Role | English build | Arabic build |
| --- | --- | --- |
| Display | **Space Grotesk** 600/700 | **IBM Plex Sans Arabic** 600/700 |
| Body / UI | **Inter** 400/500/600 | **IBM Plex Sans Arabic** 400/500/600 |
| Mono | **JetBrains Mono** 400/500 | same (code stays LTR) |

IBM Plex Sans Arabic is a genuine multi-script system — it ships `arabic` + `latin` + `latin-ext` subsets, so embedded English terms inside Arabic copy ("Angular", "Magento 2") render in a matched face rather than a fallback. One Arabic family covers display and body via weight alone.

**Scale** (fluid `clamp()`): display-xl · display-l · h2 · h3 · h4 · body-l 1.125rem · body 1rem · body-s 0.875rem *(UI only)* · caption 0.8125rem *(UI only, never prose)*. Body text never drops below 1rem.

**Line-height:** display 1.05–1.15 · headings 1.2 · body **1.6 LTR / 1.85 Arabic**.
**Letter-spacing:** display `-0.02em` in Latin; **`normal` forced under `[lang^="ar"]`**.
**Numerals:** `font-variant-numeric: tabular-nums` on every stat, date, and metric.
**Measure:** 60–70ch.

**Loading:** self-hosted woff2, subset per locale, `font-display: swap`, preload exactly two faces per locale (display 600 + body 400), and a `size-adjust`-tuned local fallback so the swap costs no layout shift. Budget ≤90KB per locale.

### Spacing, radii, elevation

- **Spacing:** 4px base — `0 1 2 3 4 6 8 12 16 20 24 32 40 48 64 80 96 128` as `--space-*`. Section rhythm via one fluid `--section-y`.
- **Radii:** 4 · 8 · 12 · 16 · 24 · full, expressed as **logical** corner properties.
- **Elevation on dark needs different tools.** Shadows barely read on `#08090C`. Depth comes from a border plus a 6%-white inset top highlight (`box-shadow: inset 0 1px 0 rgb(255 255 255 / .06)`), with a coloured glow reserved for the single primary CTA. This one detail separates a considered dark UI from an inverted light one.

### Effects — restrained by design

| Effect | Use |
| --- | --- |
| Grain | Tiled SVG at 2–3% opacity over the canvas. Kills the flatness of large dark areas at zero perf cost |
| Signature gradient | One very low-saturation radial wash behind the hero, interpolated in `oklch`. Not animated on mobile |
| Glass | Sticky header **only** — `backdrop-filter: blur(12px) saturate(140%)` with a solid fallback |
| Focus ring | 2px `--focus` + 2px offset, `:focus-visible`, never removed |
| Details | Themed selection, caret, and scrollbar. Small things, disproportionate effect |
| Icons | Lucide, 1.5px stroke, one sprite, only the icons actually used |

### Token architecture — three layers

```
primitive   --slate-950: #08090C          raw values, never referenced by a component
    ↓
semantic    --color-bg-canvas: var(--slate-950)    the only layer themes swap
    ↓
component   --btn-primary-bg: var(--color-accent-600)
```

Components consume semantic and component tokens only. Stylelint rejects a raw hex value anywhere under `src/app/**`.

### Quality gates

**Accessibility — WCAG 2.2 AA minimum, AAA for body text**

Keyboard-complete including work filters and lightbox · `:focus-visible` ring ≥3:1 against adjacent colours · exactly one `<h1>` per page · full landmark structure + skip link + `aria-current="page"` · `prefers-reduced-motion`, `prefers-contrast: more`, and **`forced-colors: active`** (Windows High Contrast — routinely forgotten; borders must survive it) · 200% zoom and 400% reflow without loss · screen-reader pass with NVDA in English **and** with Arabic SR settings · axe zero violations and Lighthouse a11y 100 in CI.

**Performance**

| Metric | Budget |
| --- | --- |
| Initial JS (gz) | ≤150KB |
| LCP (4G, mid-range Android) | ≤2.0s |
| CLS | ≤0.02 |
| INP | ≤150ms |
| GSAP chunk (lazy) | ≤45KB gz |
| WebGL chunks (lazy, combined) | ≤120KB gz |
| Fonts per locale | ≤90KB |
| Home, first view, total | ≤900KB |
| Lighthouse mobile | Perf ≥95 · A11y 100 · Best Practices 100 · SEO 100 |

`angular.json` budgets tighten from the CLI defaults (500kB warn / 1MB error) to **300kB warn / 450kB error** on `initial`, plus explicit budgets on the lazy chunks. A budget that can't fail isn't a budget.

---

## 9. Risks & architectural decisions

### Decision records

| # | Decision | Consequence |
| --- | --- | --- |
| 001 | `@angular/localize` (compile-time) over a runtime i18n library | Two build outputs; language switch is a navigation; XLIFF workflow; `withI18nSupport()` required; Arabic dev needs its own serve configuration |
| 002 | Remove `motion`/`framer-motion`; add `gsap`, `three`, `@angular/localize` | Eliminates the only React-adjacent dependency in the tree |
| 003 | `provideZonelessChangeDetection()` | Drops zone.js (~14KB); GSAP/Three rAF loops trigger no change detection. Verified stable in 21.2.19 |
| 004 | No `@angular/animations` | CSS transitions + GSAP + native View Transitions instead |
| 005 | Content-as-code: typed TS data + `$localize` | Fully prerenderable, type-safe, git-versioned. Copy edits need a deploy — acceptable for a portfolio |
| 006 | Prerender every route including `work/:slug` | Static CDN hosting; Express kept only for the `/` redirect, 404 status, and contact endpoint |
| 007 | WebGL is optional enhancement behind `@defer` + capability gate + poster | Either scene can be deleted at any time without breaking a page |
| 008 | Skills shown as honest tiers, not percentage bars | Recruiters distrust "Angular 92%", and it is unfalsifiable |
| 009 | Promote the app to the repo root; delete the stray root `package.json`/lock | Clone → `npm ci` → `npm start` works, and the last React artifact leaves the repo |
| 010 | Keep `.service.ts` / `.directive.ts` / `.pipe.ts` suffixes | Deviates from the newest Angular style guide; chosen for legibility at scale. Set in `angular.json` schematics |
| 011 | Logical CSS properties mandatory | Enforced by `stylelint-use-logical`, not by review discipline |
| 012 | Keep Vitest; add Playwright for e2e, axe, and RTL visual regression | Already configured; no runner migration |
| 013 | ~~Accent is "Signal Indigo" `#6E8BFF`~~ | **SUPERSEDED by Sprint 1.5** → [BRAND-SYSTEM.md](./BRAND-SYSTEM.md) §2. The finalized logo is a purely achromatic Didone monogram; the system is now monochrome warm neutral with the accent deferred and pre-wired |
| 014 | ~~Dark **and** light theme, both in Sprint 2~~ | **AMENDED by Sprint 1.5** → [BRAND-SYSTEM.md](./BRAND-SYSTEM.md). Light-first only; dark mode deferred and explicitly excluded from influencing current decisions. Tokens stay theme-ready so dark remains a swap, not a rewrite |
| 015 | Contact via `POST /api/contact` on the existing Express server | No third-party processor sees visitor messages. Requires a Node host — pages stay prerendered, the server handles the `/` redirect, 404 status, and this endpoint |
| 016 | Arabic build uses Latin digits (`2025`, not `٢٠٢٥`) | A technical audience reads version numbers and metrics more easily. Implemented in one `Intl.NumberFormat('ar-EG-u-nu-latn')` wrapper, so it is reversible in a single place |
| 017 | Work pages are built layout-first against `MediaFrame` placeholders | Grid and case-study templates are reviewable before any client asset lands; permission arrives on its own schedule without blocking development |

### Risks

| # | Risk | Mitigation |
| --- | --- | --- |
| 1 | **Bilingual content debt.** Every string needs Arabic, and Arabic is the harder half | `i18nMissingTranslation: "error"` makes gaps a CI failure, not a silent English fallback. Ahmed authors Arabic natively. If it threatens the launch date, ship EN and gate the AR build behind a CI flag — the architecture is unchanged either way |
| 2 | **RTL regressions.** Physical CSS and GSAP `x` are the two leak points | Stylelint ban + a single `dirX()` helper + Playwright RTL screenshots on every PR |
| 3 | **Arabic typography breakage.** Tracking, uppercase, or character-level text splitting destroys Arabic letter joining | `[lang^="ar"]` guard block in `_typography.scss`; `appSplitText` is word-level-only in Arabic |
| 4 | **Animation ambition vs. Core Web Vitals** | Hard CI budgets, everything lazy, poster fallbacks, and the LCP element is never animated |
| 5 | **Three.js size and API churn** | Framework-free scene files, tree-shaken named imports, pinned version, two scenes maximum, poster fallback makes deletion safe |
| 6 | **Two-build SEO failure modes** — wrong canonicals, missing hreflang, an unreachable `/` | `SeoService` emits canonical + `hreflang` en/ar/x-default per route; server-side Accept-Language redirect at `/`; per-locale sitemaps under a sitemap index; verify in Search Console post-launch |
| 7 | **Client logo and screenshot rights — now a schedule risk, not a design one.** All nine projects will be shown visually, so the site depends on written permission from 2B (employer IP) and from Kaza, Esterad, NAS HR, Designed By G, Nader Coffee, Mistka Home, and Vivace Perfumes | Work pages build against `MediaFrame` placeholders (ADR-017), so development never waits. Real assets drop into the same slots as permission arrives. Any project still unlicensed at launch falls back to a text wordmark plus a described contribution — decided **per project**, not all-or-nothing. **The site cannot launch with unlicensed client assets in it.** Permission requests should start now, in parallel with Sprint 2 |
| 8 | **Message dilution.** The CV lists 28 skills — jQuery, Bootstrap, Kali Linux, Machine Learning next to Angular. Dumping all of them destroys the five-second read | Curate to three pillars (Angular · Magento · Shopify) with a secondary "also works with" list; keep CCNA/security/ML in a collapsed "background" area on About, where it reads as range rather than noise |
| 9 | **Zoneless edge cases** with third-party libraries | Only GSAP and Three are used, both DOM-direct and needing no change detection. Anything future either gets a signal wrapper or `markForCheck()` |
| 10 | **Incremental hydration + i18n is a newer combination** — possible hydration mismatches | `withI18nSupport()` enabled; CI fails on NG0500/NG0505; documented fallback is to drop to plain `withEventReplay()` |
| 11 | **Contact endpoint lives on the SSR server** (ADR-015), so hosting must run Node | `POST /api/contact` is registered **above** the existing catch-all in `src/server.ts` — the current `app.use` at line 41 swallows every request, so ordering is the whole trick. Server-side validation, per-IP rate limit, honeypot + submit-timing check, no CAPTCHA. Credentials via env, never committed. Form degrades to a working `mailto:` plus copy buttons without JS |
| 12 | **Untracked noise.** 18 mirrored agent-skill directories (`.cursor/`, `.windsurf/`, `.kiro/`, …) and `Attachments/` will be committed on the first `git add .` | Extend `.gitignore`; move the CV to `public/cv/` where it is a deliberate, served asset |

### Unrelated, but worth knowing

`~/.claude/settings.json` holds a live `FIGMA_API_KEY` (`figd_…`) in plaintext. Outside this sprint's scope — flagging it because a committed or synced settings file would leak it.

---

## 10. Sprint 2 proposal

Ordered so each step is verifiable before the next begins.

1. **Repo hygiene** — promote the app to the repo root, delete the stray root `package.json`/lock, `npm rm motion`, extend `.gitignore`, move the CV to `public/cv/`, commit the current state.
2. **Dependencies** — `@angular/localize`, `gsap`, `three` (+ `@types/three`); dev: `angular-eslint`, `typescript-eslint`, `stylelint` + `stylelint-config-standard-scss` + `stylelint-use-logical`, `@playwright/test`, `@axe-core/playwright`.
3. **Foundation** — path aliases, tightened budgets, `angular.json` i18n block and schematics config, zoneless + hydration providers, ESLint boundary zones, stylelint rules.
4. **Design system in code** — implement [BRAND-SYSTEM.md](./BRAND-SYSTEM.md): the three token layers, typography with Arabic guards, breakpoint and logical mixins, reset, utilities, font loading. Light theme only. Verified by a `/dev/tokens` sandbox route excluded from production.
4b. **Logo assets** — remediate the supplied SVG per BRAND-SYSTEM.md §10: transparent `currentColor` variant, thickened small-size variant, favicon set, OG lockup. The mark cannot ship as-is.
5. **Layout shell** — header, nav, footer, skip link, language switcher, scroll progress. (No theme toggle — light only.)
6. **P0 components** — the 15 above, each with a Vitest spec and an axe assertion.
7. **Content layer** — models and data files populated from the CV, `$localize`'d, plus `ContentService`.
8. **Home page** — sections in order, English strings with custom i18n IDs throughout.
9. **Animation layer** — `GsapService`, motion tokens, reveal/stagger/parallax directives, View Transitions.
10. **WebGL** — `hero-field` first, behind the full gate, with its poster. `stack-constellation` only after the hero holds its budget.
11. **Remaining routes** — Work list and detail with prerendered slugs (layout-first against placeholders, per ADR-017), About, Services, Contact, Not-found.
12. **Contact endpoint** — `POST /api/contact` in `src/server.ts`, registered above the existing catch-all.
13. **Arabic build** — extract, translate, verify RTL end to end.
14. **Gates** — Lighthouse CI, axe, Playwright RTL and visual regression, bundle-size checks.

### Verification

```bash
npm start                                  # en dev server
ng serve --configuration=ar                # Arabic dev server (separate config — see ADR-001)
ng build                                   # expect dist/browser/en/ and dist/browser/ar/
ng extract-i18n --format xlf2 --output-path src/locale
npm test                                   # Vitest
npx playwright test                        # e2e + axe + RTL screenshots
```

Manual gate before any "done": 375px width · 200% zoom · keyboard only · reduced-motion on · forced-colors on · WebGL disabled · both locales.

---

## Resolved at approval

All five questions raised by Sprint 1 are closed and recorded as ADR-013 through ADR-017:

| Question | Decision |
| --- | --- |
| Accent colour | ~~Signal Indigo `#6E8BFF`~~ → **superseded in Sprint 1.5**: monochrome, accent deferred |
| Light theme | ~~Dark + light both in Sprint 2~~ → **amended in Sprint 1.5**: light only, dark deferred |
| Contact backend | **Express `POST /api/contact`** on the existing SSR server — ADR-015 |
| Arabic numerals | **Latin digits** (`2025`) — ADR-016 |
| Client logos & screenshots | **All nine shown**, pending per-client written permission; placeholder-first build — ADR-017, Risk 7 |

### Still owned by Ahmed, outside the code

1. **Permission requests** to 2B and the seven clients. Start now — they run in parallel with Sprint 2 and gate launch, not development.
2. **Arabic copy** for `messages.ar.xlf`. `i18nMissingTranslation: "error"` means a gap fails the build rather than shipping English silently.
3. **Skills curation** — the CV's 28 tags need to become three pillars plus a secondary list (Risk 8). A proposal will come with Sprint 2 step 7 for review.

---

## 11. Development tooling: agent skills

**Not part of the Angular application.** This section documents `.claude/skills/`, a directory of reference material for AI coding agents (Claude Code and similar tools) working on this repository. It has no relationship to the portfolio's runtime, build, or SSR pipeline — it is recorded here only so a future contributor doesn't mistake it for either dead application code or an accidental commit.

### What happened

A multi-tool skill installer (`npx skills`) wrote one copy of the same 7 reference skills into 18 tool-specific locations — `.claude/skills`, `.cursor/skills`, `.windsurf/skills`, `.github/prompts`, `.kiro/steering`, and 13 others, each named for a different AI tool's convention. The repository's first commit (`8a9eaf5`) swept all of them in via an unqualified `git add .`. A repository-hygiene review ahead of Sprint 3 found this and corrected it:

- The 17 tool-specific mirrors were removed from git tracking (`e0f67ca`) and later deleted from the working tree entirely. They are regenerable at any time with `npx skills` and are now gitignored so they cannot be re-added by accident.
- Of the 7 skills, only **`ui-ux-pro-max`** was ever used by this project — and only its `data/*.csv` files, read directly (see below). The other six (`banner-design`, `brand`, `design`, `design-system`, `slides`, `ui-styling`) were untracked from `.claude/skills` and gitignored. They may still exist on disk for local agent use; they are simply no longer part of the repository.

### Why `ui-ux-pro-max` is the one exception

Its dataset is **documented provenance**, not incidental tooling. [BRAND-SYSTEM.md](./BRAND-SYSTEM.md) §8 cites specific rows from this dataset — product type 11 (*Portfolio/Personal*), styles 7 and 15 (*Dark Mode*, *Motion-Driven*), palette 81 (*Developer Tool/IDE*), landing patterns 27 and 32 — as the sourcing for the approved visual direction. Sprint 1.5 read `colors.csv`, `styles.csv`, `typography.csv`, `google-fonts.csv`, `products.csv`, `landing.csv`, `motion.csv`, and `ux-guidelines.csv` directly, because the skill's own `scripts/search.py` requires Python, which is not installed in this environment.

Removing this dataset would sever the ability to verify or re-derive a decision already recorded as approved. It stays tracked for that reason alone — not because the skill is used at runtime, which it never is.

### What this is not

- **Not read by the Angular CLI, TypeScript compiler, or SSR server.** `tsconfig.app.json` includes `src/**/*.ts` only; `angular.json` copies assets from `public/` only. Nothing under `.claude/` is on either path.
- **Not a dependency.** No `import` in `src/` references anything under `.claude/skills`. Removing the six unused skills required no application code change, no dependency change, and no design-system change.
- **Not secret.** The tracked files are markdown and CSV reference data with no credentials, tokens, or personal data.

---

## 12. Project data & assets (Sprint 5)

The portfolio presents **exactly six projects**. They are defined once, in
`src/app/data/projects.data.ts`, and every surface — the Home strata index, Home
selected work, `/work`, and `/work/:slug` — reads from that one array. There is
no second list anywhere.

| # | Project | Platform | Dashboard | Public URL |
| --- | --- | --- | --- | --- |
| 1 | NAS HR | Angular | Yes | — internal |
| 2 | Nature (الطبيعة) | Angular | Yes | `https://www.neas.ae/` |
| 3 | 2B | Magento | No | `https://2b.com.eg/` |
| 4 | Esterad | Magento | No (Porto theme) | `https://esterad.com.eg/` |
| 5 | Designed by G | Shopify | No | `https://www.designedby-g.com/` |
| 6 | Nader Coffee (بن نادر) | Shopify | No | `https://www.nader-coffee.com/` |

Kaza, Egyptian Treasure, Vivace, and Mistka Home were removed from the dataset.

### Two directories, one direction of flow

```
project-assets/          originals — NOT deployed, NOT referenced by the app
  <slug>/                raw PNG/SVG/WebP captures exactly as supplied
  _unused/               material kept but not shown (see below)
        │
        │  npm run assets:projects   (scripts/optimize-project-assets.mjs)
        ▼
public/projects/         generated — the ONLY images the site serves
  <slug>/logo.webp|svg
  <slug>/<name>-800.webp, <name>-1600.webp, + .avif for covers
        │
        ▼
src/app/data/project-media.generated.ts   paths + measured dimensions
```

`angular.json` copies `public/**` verbatim into the build output, so anything
left in `public/` ships. That is the whole reason the originals live outside it:
the supplied material is ~38 MB of unoptimised PNG, and the generated set is
**3.2 MB**. Nothing is ever hand-placed in `public/projects/` — the script
deletes and rebuilds that directory on every run.

Images are never imported into TypeScript. Only paths and dimensions cross into
the bundle, via the generated manifest.

### Why the manifest is generated

`ProjectImage` carries `width`/`height` because the templates render them as
attributes, which reserves the correct box before any bytes arrive. Those numbers
come from the encoder's own output rather than being typed by hand, so they
cannot drift from the files. `projects.data.ts` spreads a generated entry and
adds the one thing a machine cannot write — bilingual `alt` text:

```ts
cover: { ...M.nature.shots.home, alt: { en: '…', ar: '…' } }
```

Referencing a shot by property name means a renamed or deleted capture fails the
build instead of silently rendering a broken image.

### Redaction

Some captures could not be published as supplied. The script destroys the
affected regions — downsampling 20× before blurring, so the original pixels are
gone rather than merely smeared — and the full rectangle map with per-region
reasons lives in `scripts/optimize-project-assets.mjs`.

- **NAS HR (`pii`)** — every capture showed real employee names, work email
  addresses, phone numbers, salary and penalty figures, and account photos from a
  client's internal HR system. 15 regions across 5 captures.
- **Nature admin (`junk`)** — development placeholder rows (`asaccsacasc`,
  `TEST EXPORT`) that read as unfinished work, plus an account photo. 8 regions
  across 3 captures.

Captures excluded outright, for reasons redaction could not fix: a 2B checkout
holding a customer's address and phone number; a Nature admin login with a
populated username field; a Nature services list where every readable column was
placeholder text; and a zero-byte 1×1 capture. All are preserved under
`project-assets/`, none are referenced.

### Third-party logos

Client logos are shown as supplied and are never recoloured or re-drawn. 2B's
official mark fills its "2" and underbar with white, which would be invisible on
this light theme, so `project-logo` places that one asset on
`--color-surface-inverse` — the surface changes, not the artwork. Which logos
need it is decided inside `project-logo`, not by each consumer.

Logos are always decorative (`aria-hidden`): every caller writes the project name
beside them as real text.

### `--ratio-screenshot`

Project media does not use `--brand-ratio`. The brand's 7:8 portrait would crop a
desktop screenshot to a sliver. The token is set just above the widest supplied
capture, because `object-fit: cover` crops whichever axis overflows — a narrower
frame crops the *sides* and decapitates the site logo in the corner.

Gallery images on the detail page use no frame at all; they render at their own
intrinsic ratio, so a 510px-wide cart drawer is not stretched to a 1024px column.

### Routes

`/work` and `/work/:slug` are both prerendered. `getPrerenderParams` reads the
slugs from `PROJECTS`, so adding a project cannot leave a page rendering
correctly while answering 404 — the failure mode that rule in §3 exists to
prevent.

### Private projects

`url: null` is a real state, not missing data. NAS HR is an internal system, so
the UI renders a labelled "Internal project" marker instead of an anchor. No
disabled link, no dead href — the tests assert that the anchor does not exist.

---

## 13. THE APERTURE — the Home scene (Sprint 6)

The Home page is one continuous camera journey through the AY monogram. Face-on
the mark reads as the flat identity; as the reader scrolls, the sheets separate
along the brand's own 24° axis and the camera passes *through* the letterform.
Everything after that — the project count, the three platform gates — is inside
the mark.

The geometry is `AY_MARK_PATH`, the same outline the logo, favicon and SVG poster
use. The corridor is Ahmed's own letterform, not a generic tunnel.

### One trigger, one number

```
scroll ──▶ ScrollTrigger.onUpdate ──▶ HomeProgress.scroll (signal) ──▶ scene
                                 └──▶ --home-progress (CSS var) ──▶ acts
```

There is **exactly one `ScrollTrigger`** in the application, and **zero GSAP
tweens**. GSAP reports scroll position; it does not animate. Every visual result
is derived from that one value — by the scene, which is a pure function of it,
and by CSS, which reads it from a custom property.

`HomeProgress.act` is now `computed()` from `ACT_TIMELINE`. It used to be written
by three extra triggers that nothing read.

### The timeline is a table

`animation/act-timeline.ts` holds the eight acts and their boundaries;
`animation/camera-path.ts` holds the camera keyframes; `animation/corridor-layout.ts`
places the type and project planes. All three are pure, framework-free, and
unit-tested in `choreography.spec.ts` — the choreography is verifiable before
anything renders.

Both the DOM and the scene read the same table, so the text and the camera cannot
drift apart. Tuning the choreography means editing these files and nothing else.

### Why `position: sticky`, not GSAP `pin`

Identical to the reader; not identical to the application. GSAP's pin injects a
spacer wrapper and switches to fixed positioning at runtime, which collides with
three standing constraints here: `scrollPositionRestoration: 'enabled'`,
incremental hydration (a `@defer` subtree can hydrate after a pin was measured),
and the sticky header's requirement that no ancestor become a scroll container.

The stage's height comes from `--home-screens`, written by the choreography, so
the CSS height and the trigger's travel are two readings of one number. The
trigger's travel is one screen *less* than the height: a sticky element releases
when its container's bottom reaches the viewport bottom.

### The fallback is the absence of a class

`.is-staged` is added only once the choreography has actually started. Under
`prefers-reduced-motion`, without JavaScript, or if GSAP fails to load, it is
never added — the spacer collapses, the viewport un-sticks, and the page is an
ordinary vertical document with every act readable in order. There is no second
code path to rot, and no scroll void. Verified: 5.5 screens of real content
instead of 12, canvas never built, all seven project names present.

### Scene structure

```
webgl/scene/          framework-free — no Angular import anywhere below here
├── aperture-scene.ts   renderer, camera, loop; owns nothing else
├── monogram-layers.ts  the extruded AY sheets
├── type-planes.ts      headline words as canvas textures
└── svg-path.ts         the minimal path parser
```

> **Removed in Sprint 8.5:** `project-planes.ts` — project screenshots as
> textured planes. See §16.



Each subsystem builds and disposes its own resources and exposes
`update(progress, cameraZ)`. Adding one must never require editing the loop.

**Typography in the scene** is drawn to a 2D canvas using the page's *computed*
font, not `TextGeometry` — no font loader, no typeface converted to Three's JSON
format, no second copy of the type system to drift. Those words are held at 16%
opacity: every one of them also exists as real DOM text, and the DOM copy is the
one meant to be read.

**Screenshots** reuse the existing `-800.webp` variants, are decoded with
`createImageBitmap` off the main thread, and upload **one per frame**. A plane
requests its texture only within 90 units and the resident count is capped —
7 on desktop, 3 on mobile. Vivace, which has no imagery, renders as a wireframe
frame: the 3D equivalent of `MediaPlaceholder`, never an invented screenshot.

### Desktop and mobile are different choreographies

Not a scaled-down copy. Desktop glides continuously through the corridor over 12
screens with pointer parallax and 10 sheets. Mobile settles *at* each gate — the
camera path has paired keys with identical `z`, producing a genuine hold — over 7
screens, with 4 sheets, no parallax and a wider field of view. A continuous dolly
reads as noise on a tall narrow viewport.

The spec asserts the mobile dwell is real: an earlier version stepped 2 units
across the "hold" and was travelling further during it than desktop does on its
eased approach.

### Counts are never the array length

`PROJECTS_SHIPPED` (20) is the career total; `PROJECTS.length` (7) is the curated
showcase. Every "how many" string substitutes one or both. Rendering the array
length alone would have claimed seven projects total, which is false.

### Visual decisions from the Sprint 6 review

Reviewing the rendered page — not the tests — surfaced five defects that no unit
test could have caught. Each fix is recorded here because each encodes a
constraint that is easy to reintroduce.

**The camera carries a lateral offset.** `CameraKey.x` exists so the mark sits
away from the reading edge during act 0 and again at the close. Centred, the
monogram printed straight through the `<h1>` — a collision, not a composition.
It mirrors in RTL, so the mark moves to the opposite side when the text does.

**Fog is the depth cue.** `scene.fog` fades everything into the page's own paper
colour. It is the single largest contributor to the corridor reading as space
rather than as shapes on a backdrop, and it adds depth without introducing a
hue — depth cueing that stays strictly inside the monochrome system.

**`NEAR_FADE_DISTANCE` is 16, not 6.** The front sheet is a solid extrusion, and
at close range the camera sees its *side* faces: a flat grey slab filling the
frame that read as a rendering bug. Dissolving well before arrival is what makes
the passage feel like flight through an opening letterform.

**Type planes are gated by act, not only by distance.** They are 16 units tall
and the fog reaches 110, so `SHOPIFY` was legible behind the `ANGULAR` gate — the
reader saw the wrong word two acts early. `TypePlaneSpec.from`/`.to` tie each word
to its own act. They also sit at 13% opacity and are deliberately cropped by the
viewport: at readable size they duplicated the DOM heading beside them, which
looked like a mistake rather than a layer.

**The reconvergence is a second mark, not a rewind.** `MonogramLayers` takes a
`phase`: `open` spreads across act 1, `close` collapses across the final act. The
closing instance sits near `CORRIDOR.exit`, so the camera arrives squared up on a
mark re-forming ahead of it. Flying the camera backwards to the entry mark would
have undone the journey rather than ended it. The geometry resolves — the canvas
is never simply faded out.

**Mobile resolves vertically.** On a portrait viewport the closing sentence takes
the top of the frame and the mark converges beneath it (`align-content: start`
below `lg`), and the mobile camera's final key sits further back. A phone has
vertical room to spare and no horizontal room at all, so the lateral answer that
works on desktop does not transfer.

### Selected Work as an editorial system (Sprint 7)

The gates were a two-across grid of bordered cards. Six identical boxes read as a
CMS listing: the eye finds no entry point, and nothing signals that these are
*selected* pieces rather than a complete table.

`ProjectFigure` replaces the card. Each project is a plate with an oversized
index numeral, a name at display scale, its category on its own line, and the
stack beneath — so the hierarchy is **number → name → category → stack** and a
reader places the work in one glance without reading a paragraph.

`variant` (`lead` | `support`) is what makes a gate a composition rather than a
row: the first project of each platform leads at a larger size in a wider column
and the rest support it, with `align` flipping which side the media sits on. The
grid is `3fr / 2fr`, never `1fr / 1fr` — an even split is a grid, an uneven one
is a composition.

Two constraints the layout has to respect:

- **An act is exactly one viewport.** A plate cannot be sized by aspect ratio
  alone; the three-project Shopify gate overflowed and clipped. `max-block-size`
  in `dvh` caps each plate and `object-fit` absorbs the extra crop.
- **Numbering runs 01–07 across the whole showcase**, not per gate, so the
  numerals read as one curated sequence. `offset` derives it from `PROJECTS`.

The stack line (`Shopify · Dashboard`) is assembled in the component from
`platform`, `theme` and `dashboard` rather than stored as copy, so a project that
gains a dashboard needs no content edit.

**Project planes moved to the periphery.** Once every project had a real
editorial plate in the DOM, a textured plane sitting behind it rendered the same
screenshot twice — which reads as a bug, not as depth. They now sit at ±12 units
with peak opacity 0.26: scenery the camera passes at the frame edges, not a
second presentation. Planes also clear entirely across the final act, so the
reconvergence is the mark and nothing else.

---

## 14. Spatial continuity & the editorial archive (Sprint 8)

### The hero → work hand-off

The corridor and the gates used to be two systems occupying the same instant
without acknowledging each other: the scene showed peripheral scenery while the
DOM faded an unrelated composition over it.

`ProjectPlaneSpec` now carries `isLead` and `gateAt`. Over the
`HANDOFF_WINDOW` before a gate, that one plane leaves the periphery — `offsetX →
0`, `rotation.y → 0`, scaling up — and the gate's DOM act settles out of depth on
the same beat (`perspective` + a scale driven by `--enter`, scoped to gate acts
only so act 0's LCP heading is never transformed).

Two details that were wrong on the first attempt:

- **The near-fade had to be released during presentation.** It exists to stop a
  plane clipping through the camera, so it dims by proximity — exactly backwards
  for a hand-off, where the plane must be most present when it is closest.
- **The gate's scale composes with the base exit-recede** rather than replacing
  it. A bare `scale` on the gate rule overrode the outgoing act's depth
  separation, and consecutive gates cross-faded at identical size again.

Nothing is pixel-matched between the plane and the plate; matching a projected
rect across viewports and RTL is fragile. The two share a direction, a size and
an instant, and that is what reads as one world.

### `/work` — a typographic index

Home presents *plates*; the archive presents a *list*. Seven oversized numbered
rows (`display-2` names, mono numeral column, category as a label, stack as one
`·`-joined line) beside a sticky pane holding the active project's screenshot.
Hairline rules between rows, and **no boxes, pills, chips or badges** anywhere.

- The pane is an **enhancement, never the content**: it defaults to the first
  project, so it shows real work on the server and without JavaScript. Below
  `md` it disappears and each row carries its own image instead.
- All plates are rendered and cross-faded by class rather than swapped in and
  out of the DOM — swapping re-requests the image and flashes an empty frame.
- Non-active names dim to 0.6, not 0.38; at 0.38 six of seven names read as
  disabled and the page looked washed out.

**Link status has three states, not two.** `live` · `private` · `pending`.
NAS HR has no public address because it is an internal system; Vivace has none
because its assets have not been supplied. Labelling Vivace "Internal project"
was false, and the spec now asserts the three counts separately.

### `/work/:slug` — type-first

Identity lands on paper before any imagery: index numeral, name at `display-1`,
category, stack, link status. The cover then **breaks the measure full-bleed** —
the one moment on the page where the work is larger than the words about it.
Facts follow as a hairline-ruled row, then the gallery with every second plate
inset so a long page reads as a sequence rather than a contact sheet.

Everything unboxed: no logo chip, no dashed private box (a left rule instead), no
bordered plates, no bordered prev/next.

### Component budget forced a better structure

`work-detail.scss` went 1.55 kB over the 4 kB per-component budget. Rather than
weaken the budget, the two self-contained units moved out — `project-gallery` and
`project-facts`, each owning its own styles, matching what `project-nav` already
did. The budget did its job: it caught a component accumulating unrelated
responsibilities.

### Removed

`shared/ui/project-surface/` — dead, zero usages, a generation older than
`ProjectFigure`. And `features/work/project-card/`, replaced by `work-row`.

---

## 15. Project research & the business/contribution split (Sprint 8.5)

A portfolio that says "a Shopify storefront" has described the tooling and
nothing else. Every project now carries two separable things, and the separation
is the point.

**The business** — `market`, `field`, `domain`, `brief`. Established from the
client's own public site or a published source, never inferred from a screenshot.

**Ahmed's part in it** — `role`, `technologies`, `theme`, `dashboard`. Taken from
the CV in `public/Attachments/` or from what he stated directly.

Describing a client's business in detail must not read as a claim to have built
that business. Nothing in the dataset states results, metrics, traffic, revenue,
team size, or ownership.

### Sources

| Project | Market | Field | Established from |
| --- | --- | --- | --- |
| NAS HR | Egypt | HR Technology / Enterprise Software | The product's own logo and the supplied captures — HR/attendance/payroll dashboards. The publisher is deliberately not named in the copy. |
| Nature | UAE | Environmental & Agricultural Services | `neas.ae` — "Nature for Environmental and Agricultural Solutions L.L.C" |
| 2B | Egypt | Consumer Electronics Retail | `2b.com.eg` — catalogue, branches, instalment providers |
| Esterad | Egypt | Consumer Electronics / Refurbished | `esterad.com.eg/about-us` — "أجهزة مستوردة ومجدّدة", warranty and return terms |
| Designed by G | Egypt | Fashion / Apparel | `designedby-g.com` — collections, EGP pricing, About copy |
| Nader Coffee | Egypt | Coffee / Food & Beverage | `nader-coffee.com` — seven named coffee categories, pack sizes |
| Vivace | UAE & Qatar | Fragrance / Luxury Retail | `vivace.shop` captures — branch addresses, brand roster, Shop Pay at checkout |

Marketing superlatives on those sites ("the largest…", "20,000 customers") are
deliberately **not** carried across. They are the client's claims, not facts about
the work.

### Detail page order

Business before build, and the brief before the picture:

```
back -> 07 -> Vivace -> [FIELD | MARKET | DOMAIN] -> stack -> link
     -> brief -> FULL-BLEED COVER -> platform/role/theme/technologies
     -> gallery -> prev/next
```

`project-facts` renders both fact rows in two variants (`identity`, `build`) —
the same object at two weights rather than two stylesheets that would drift.

### The counts stay separate

`PROJECTS_SHIPPED` (20) is the career total. `PROJECTS.length` (7) is the size of
this selection. Every count string substitutes one or the other; none is typed as
a word. Asserted on `/work`, `/work/:slug`, `/about` and `/cv`.

---

## 16. The gate beats, and why the scene lost its screenshots (Sprint 8.5)

### The defect

A gate showed its platform name and its project plates in the same instant. The
reader could not tell whether they were being shown a technology or a piece of
work, because both arrived together.

### One thing at a time

`GATE_BEATS` in `act-timeline.ts` divides each gate into four beats, as fractions
of that gate's own span:

```
  0 ------- settle .30 ------ image .48 ------ info .64 ----------- 1
  | ANGULAR | the word       | the lead      | its name, field,   |
  | alone,  | settles into   | project's     | market and stack   | hold
  | large   | a header       | screenshot    | arrive             |
```

Supporting projects cascade in after `info`, staggered by index.

The gates grew from 40% of the scroll to **60%**, and travel from 12/7 screens to
**14/9**. At the old weighting a beat lasted under half a screen, which is fast
enough that the phases read as simultaneous.

**The camera holds still** across `settle` to `info` on both paths — desktop
adopting the grammar the mobile path always had. A camera still dollying would
drag the arriving plate out of frame while the reader was being asked to look at
it.

### One source for the timing

`GATE_BEATS` is bound onto each act element in `home.html` as `--beat-settle` /
`--beat-image` / `--beat-info`. `home.scss` derives `--act-t`, `--settle`,
`--media` and `--info` from those plus the act window; `act-gate.scss` and
`project-figure.scss` decide what each ramp does. No stylesheet holds a copy of
a number.

Those rules are scoped with `:host-context(.home.is-staged)`. Without that, the
ramps evaluate to 0 under reduced motion and without JavaScript — where
`--home-progress` does not exist — and the entire gate would render at opacity 0.

### Why the project planes are gone

The corridor used to hang each project's screenshot as a textured plane. Removed
on the user's instruction, and the instruction was right:

- Seen from behind — which is most of the time, because the camera flies past
  them — a plane renders its texture **mirrored**. The reader was shown a
  backwards screenshot.
- Squared up to the camera for the gate hand-off, the plane simply **duplicated**
  the DOM plate landing over it at the same moment.

The scene now carries the mark and the words. The work is presented in the DOM,
where it is legible, selectable, translatable and indexable. `ProjectPlanes`,
`buildProjectPlanes`, `ProjectPlaneSpec`, the texture queue and the
`textureBudget` option are all deleted — the scene loads no textures at all.

### Word windows are relative to their act

A type plane may only appear inside its own act, and both its lead-in and its
tail-out are fractions of that act's span. Fixed offsets did not survive the
retimed timeline: with a ±0.06 lead-in and 0.20-long gates, **MAGENTO became
legible at 0.47** — two thirds of the way through reading Angular's projects.
Found by rendering a frame, not by reasoning about the numbers.

A gate word's window now closes at its own `image` beat: the word says what the
platform is, then gets out of the way of the work. Held to the end of the act it
sat ten units from a holding camera, filling the frame, and the project plates
read as printed on a watermark. The platform is still named by the DOM header the
name settled into.

`TypePlanes.update` ramps the window instead of switching it. A boolean was fine
while the camera was still approaching — the near-fade hid the transition — but a
word that leaves while the camera holds needs a real fade.

### The gate name is shrink-wrapped

Beat 1 enlarges the platform name. As a full-width block, scaling it from any
origin moved edges that had nothing in them, which reads as an overflow in an
audit and makes the real question — is the word clipped? — unanswerable. It is now
`inline-size: fit-content` with `transform-origin` at the reading edge, and an
explicit RTL override because `transform-origin` has no logical keyword.

---

## 17. /about, /cv, /contact (Sprint 8.5)

Three pages, one record. `cv.data.ts` is a transcription of the PDF that ships at
`public/Attachments/`, and every one of these pages reads it:

- **`/cv`** lays it out in full. A PDF behind a download button is invisible to
  search, unreadable on a phone, impossible to link into and hostile to a screen
  reader — so the document is HTML, and the file is still one control away.
  `download` renames it on save, because the stored filename carries a typo.
- **`/about`** reads the CV's own profile paragraph and takes "now" from the first
  experience entry, rather than restating either.
- **`/contact`** reduces it to the two or three facts someone needs in order to
  write.

### No contact form

A form needs an endpoint. Rendering the fields before one exists ships a control
that accepts what someone typed and silently discards it — worse than not offering
it, because the sender believes they have written to him.

### The phone number

The CV lists a personal mobile. It is **not** transcribed into `cv.data.ts` and
does not appear on any page; anyone who downloads the document still has it. That
is the document's own disclosure, not one the site makes on his behalf. Asserted
in `contact.spec.ts`.

### The Arabic professional title

`PROFESSIONAL_TITLE` in `cv.data.ts` is the single source, consumed by the Home
hero, `/about`, `/cv` and `/contact`. The Arabic is **مبرمج مواقع ومتاجر إلكترونية**
— Ahmed's own wording, not a translation of the English line, and not to be
re-translated to match it. Asserted on all three pages.

`page-head` (`shared/ui/`) exists because these three pages open identically and
each carries a 4 kB style budget; `cv-section` because experience, education and
certifications are the same shape.

---

## 18. The /work preview pane (Sprint 8.5)

**The bug:** hovering the sixth project changed an image that had left the
viewport five rows earlier, so the reader had to scroll back to the top to see
what they had just done.

**The cause:** `position: sticky` can only travel inside its own containing block.
`.work__body` used `align-items: start`, which sized the preview column to its
own content — the same height as the pane — giving sticky exactly zero travel.

**The fix:** the grid item stretches to the height of the index beside it. One
declaration; the pane now holds at `18vh` for the whole list. Verified by
measurement at rows 1, 4 and 7: `paneFullyVisible: true` at every one.

Also added: a caption naming the project on screen, a second non-opacity active
signal in the list (a rule that grows in the index column — grown on the inline
axis, because `transform-origin` has no logical keyword and a `scaleX` marker
would extend from the wrong edge in Arabic), and `focusin` parity so tabbing
through the index drives the pane exactly as hovering does.

---

## 19. Verification (Sprint 8.5)

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | 156 / 18 files |
| Build | zero warnings, 12 prerendered, initial 94.67 kB gz |
| SSR | `/`, `/work`, `/work/:slug`, `/about`, `/cv`, `/contact` → 200; `/nope` → 404 |
| CV file | `/Attachments/…pdf` → 200, `application/pdf`, 85 390 bytes |
| Responsive + RTL | **84 combinations** (7 paths × 6 widths × EN/AR): 0px overflow, exactly one `h1`, no clipped text, no image without `alt`/`width`, 0 console errors |
| Hero beats | sampled at 100 scroll positions: name → image → info strictly sequential in all three gates, with 0.15–0.22 of the act between the name settling and the image arriving |
| Reduced motion | never staged, canvas never built, 7/7 projects, 3/3 platforms, pane still shows images, 0 overflow, 0 errors |

### Three harness bugs, for the next person

The measuring tools were wrong before the page was. Each of these produced a
confident false result:

1. **`--act-t` cannot be read back** through `getComputedStyle`. An unregistered
   custom property returns its unresolved token stream (`clamp(0, calc(…), 1)`),
   which `parseFloat` turns into `0` — so every beat appeared to happen at the
   same instant. Act-relative time has to be derived from `--home-progress`.
2. **The locale switcher is an `<a hreflang>`, not a `<button>`**, and the choice
   **persists across tabs in one browser profile**. Matching on `button` measured
   every Arabic row in English; leaving English implicit measured half a later
   run in Arabic. Pin the locale explicitly on every pass.
3. **The scene damps toward its target at 0.08/frame**, and rAF in headless with
   `--disable-gpu` runs far below 60fps. At a 700ms settle the canvas still showed
   progress ~0.20 while the DOM was at 0.35 — which in a screenshot reads exactly
   like "the 20+ plane is still up during the Angular gate". 3s converges.

Precedent from Sprint 6 holds: the iframe harness silently froze at progress 0
because rAF is throttled in frames. Verify the tool before trusting the result.

---

## 20. The brand marquee (Sprint 9)

Home names each project one act at a time, and only while the reader is inside
that act. Nothing showed the whole set at rest. `features/home/brand-marquee/`
does — as the clients' own artwork, which is the only identity on the page other
than AY's.

Every name, route and logo comes from `PROJECTS`, in showcase order. The
component holds no per-project string, and each link's accessible name is
`WORK_CONTENT.a11y.viewProject` — the same string the work index uses, so a brand
is announced identically in both places.

### It is a sibling of the stage, not an act

The acts share one sticky viewport and are revealed by scroll position. A marquee
in there would exist only for the slice of scroll belonging to its act, and would
add to the stage's travel. So it sits after `.home` in normal flow, beginning
where the corridor's travel ends. The choreography is untouched — asserted in
`home.spec.ts` (`closest('.home')` must be null).

### Why the items carry a margin and the row carries no `gap`

The track holds the same row twice and animates one row's width, so the frame at
100% is the frame at 0% and the restart is invisible.

That only holds if half the track is exactly one row. With `gap` on the row it is
not: a row of 7 is 7 slots and 6 gaps, the track is 14 slots and 12 gaps — there
is no gap between the two rows either — so half the track falls one gap short and
the strip jumps ~64px on every repeat. A trailing `margin-inline-end` on **every**
item, including the last of each row, makes every item cost the same and the
arithmetic exact.

Verified by measuring all 13 joins: spread 0.00px, the seam identical to its
neighbours, and the animation's end translate 1399.97px against a 1400.00px row.

RTL flips `--marquee-shift` from `-50%` to `50%`, because `translate` has no
logical form. The row is laid out from the right there, so travelling the other
way keeps the marks entering from the reading edge in both directions.

### Pause is `animation-play-state`, not JavaScript

`:hover` (behind `mq-fine-pointer`, so a touch device does not get stuck paused)
and `:focus-within` set `animation-play-state: paused` on the track. That
suspends the animation where it stands and resumes from that same position —
there is no offset to measure, store and restore, and therefore no way for a
stored position and the real one to disagree. Confirmed: paused at 4067ms,
resumed at 4350ms, never at 0.

Under reduced motion the strip becomes a static wrapped set of all seven marks,
every one still a link. The second pass is dropped — it exists only to hide the
seam of a loop that is no longer running — and the items swap their margin for a
`gap`, which is safe once there is no loop to keep seamless.

### `ProjectLogo` moved to `shared/ui/`, and its slot must be definite

Two features now show the same seven marks, so the component that knows 2B ships
white-on-transparent artwork lives in `shared/ui/project-logo/`. Callers size the
slot through `--logo-inline-size` / `--logo-block-size` / `--logo-padding`.

It was a `display: grid` host with `max-block-size: 100%` on the image, and that
constrained nothing. A percentage max-size resolves against the containing block;
for a grid item that is the *grid area*, and an auto-sized row track is sized to
the item's own content. Nader Coffee's 200×200 mark rendered 120×120 in a 36px
slot — four of the seven logos overflowed. A flex item's containing block is the
flex container's content box, which is definite here, so both maxima bite and a
replaced element under two max constraints keeps its ratio.

The dark ground for 2B is on the **image**, not the host: under those two
constraints the image's box is already the artwork's box, so it paints a plate the
size of the mark instead of a dark field the size of a uniform slot — which would
have read as a card, and neither the strip nor the index has one.

### The index rows

The mark sits on the name's own line, inside `.row__heading`. It is decorative —
the name is right there as text — and it reads the same `.is-active` host class as
the name, the numeral and the preview pane, so there is one source of truth for
which project is active and pointer and keyboard cannot diverge. Inactive marks
are `grayscale(1)` at 0.5; the active one is full colour.

`.row__index` gained `min-inline-size: var(--space-6)`. Each row is its own grid,
so that column is sized per row — the numeral is 15.6px and the active-row
indicator rule is 24px, so becoming active widened the column and shoved the logo
and the name 8px along. Measured across all seven rows: 276px for every one now,
active or not.

### Verification (Sprint 9)

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | 166 / 19 files |
| Build | zero warnings, 12 prerendered, initial 94.67 kB gz — unchanged |
| SSR | all 14 logo `src`s in the prerendered Home, 7 in `/work`; `/nope` → 404 |
| Browser pass | **98 / 98** checks: seam arithmetic and all 13 joins, hover pause + resume-in-place, focus pause + resume, 7 tab stops not 14, RTL direction and seam, reduced motion, 0px overflow at 320/390/768/1024/1440/1920 in EN and AR, 0 console errors, every mark contained and painted at a legible size, a mark navigates to its project |

Two harness bugs, for the next person — both produced confident false results:

1. **`getComputedStyle().translate` keeps a percentage.** Translate percentages
   resolve at used-value time, so it returns `-49.999%`, not pixels.
   `parseFloat` gives `-49.999`, which compared against a 1400px row looks like a
   catastrophic failure.
2. **At `currentTime === duration` an infinite animation is at the *start* of
   iteration 2**, so it renders the `from` keyframe and translate reads `0%`.
   Read 1ms earlier. Also: `Page.captureScreenshot`'s `clip` is in **document**
   coordinates — a viewport-relative rect at the foot of a 12-screen page
   captured a blank slice of the top of the document.

And one measurement that was asking the wrong question: `object-fit: contain`
letterboxes the artwork inside the element box, so the box's aspect ratio says
nothing about whether the picture is distorted. Compute the painted size.

---

## 21. Positioning, roles and brand atmosphere (Sprint 9)

### Shopify leads, and the order is stated once

`PROJECTS` is `[...shopify, ...angular, ...magento]`, and everything derives from
it: the `/work` category sections, the numerals 01–07, previous/next, and the order
of the Home corridor's gates.

The corridor was the interesting part. `CORRIDOR.gates` used to be written
`{ angular: -62, magento: -100, shopify: -138 }` — depths keyed by platform. With
Shopify moved to the front, that would have sent the camera to the *far* end of the
corridor first and then back toward the viewer. The depths are now a list in travel
order and the platform mapping is derived from `GATE_ACTS`:

```
GATE_DEPTHS = [-62, -100, -138]   ->   the first gate is the nearest, whichever it is
```

`choreography.spec.ts` asserts both halves: that the gates appear in the same order
as `PROJECTS`, and that each gate is deeper than the last.

### Role, team, contribution — three fields, because they are three claims

| Project | Role | Project team | What the contribution says |
| --- | --- | --- | --- |
| Designed by G | Shopify Developer · Visual Design | — | independent build, plus the store's visual assets |
| Nader Coffee | Shopify Developer · Visual Design | — | same |
| Vivace | Shopify Developer | — | independent build. **No design claim** — the visual work was stated for the other two only |
| NAS HR | Front-End Developer | 3 Front-End · 4 Backend | one of the front-end developers on the project team |
| Nature | Front-End Developer | — | front-end of the public site and the admin screens |
| 2B | Front-End Developer | — | front-end and theme work, **in collaboration with a backend team** |
| Esterad | Front-End Developer | — | sole front-end developer *on the project*, with a backend team |

Three rules hold across the set, and `work-detail.spec.ts` enforces them:

- **`team` is `null` wherever the real composition is not known**, and the row is
  omitted rather than filled with an estimate. Only NAS HR has one.
- It is labelled **"Project team"**, not "Team". Beside one person's name the
  shorter word reads as *his* team.
- No page contains "built the entire", "developed the complete", "the whole
  platform", "founded" or "I own". Esterad's CV line — "sole Front-End Magento
  developer" — is carried as *sole front-end developer on the project*, which is
  what it means, and the backend team is named in the same sentence.

Ownership of NAS HR is **not stated at all**. Sprint 8.5 was told not to name the
publisher; Sprint 9 says not to claim ownership. Saying nothing satisfies both, and
role plus team already make it impossible to read as his product.

`PROFESSIONAL_TITLE` is now `Front-End Web Developer` / **مبرمج مواقع ومتاجر
إلكترونية**. The Arabic is untouched. "Visual Design" appears only in individual
project roles and never in the title. Three hardcoded copies of the old English line
were found — the footer, `index.html`, and a dev specimen — and the footer now reads
the constant instead of repeating it, which is how it went stale in the first place.

### The atmosphere system

Each project carries eight colours. They are **data about a client**, not design
tokens, so they live in `projects.data.ts` rather than in the token sheet — adding a
project should not mean editing `_tokens-primitive.scss`.

**Where the colours come from.** Each brand's own logo artwork in
`public/projects/<slug>/logo.*` was sampled for the colours actually in the mark —
not a screenshot, and nothing invented:

| Project | From the mark | Ground |
| --- | --- | --- |
| Designed by G | `#771415` down to `#2d0809` | warm red paper |
| Nader Coffee | `#2e2018`, `#5f4c30` | roast brown |
| Vivace | `#103b3e` | deep teal |
| NAS HR | `#11282b` with cool greys | cool graphite — the mark is monochrome, so the ground is too |
| Nature | `#7dc261` | leaf green |
| 2B | `#f37021`, exact from the SVG source | graphite, as the logo's own ground is, with the orange as the accent |
| Esterad | `#34b643` with `#222021` type | graphite with a green accent |

Each hue then becomes a *tinted paper* ramp. `atmosphere.spec.ts` asserts every
value in every ramp: primary and secondary text at AAA, muted text and the accent at
AA or better, and primary text AAA on the plate tone as well. The worst case in the
set is 4.58:1. Two brands were below 4.5 before the ramp was darkened, which is why
that test exists rather than a note in a document.

**How it reaches the page, without any component knowing.** `AtmosphereDirective`
binds the eight values as `--atmos-*` and adds one class.
`styles/_atmosphere.scss` rebinds the *semantic tokens* from them on that element:

```
--color-background: var(--atmos-surface);
--color-text-primary: var(--atmos-text);   ... and so on
```

Custom properties inherit through Angular's emulated encapsulation, and stylelint
already forbids a component from using anything but a token — so the whole page
adapts because what is under it changed. No component has a theme branch.

Not rebound, deliberately: `--color-focus` (a focus ring that changes colour stops
reading as focus), `--color-surface-inverse` (2B's white logo needs its dark plate on
any surface), and the status colours.

**Why `@property`.** Unregistered custom properties are not animatable, so the
surface would snap. Registered with a `<color>` syntax they interpolate, and because
`var()` substitution is live, every derived token interpolates with them — one 900ms
transition drives the entire page. Their `initial-value` is the neutral token each
one shadows, which is what makes neutral the *default* rather than a second code
path: `/work` passes `null`, the properties fall back, and the transition runs in
that direction too.

### /work: one interaction, two questions

`active` is which project the reader is on; `engaged` is whether they are still in
the list. Not two sources of truth about the same thing — the atmosphere and the
dimming need "still there", because the colour is something you are *inside* and it
has to leave when you do, while the preview pane needs only "which" and should keep
showing what was last pointed at rather than snapping back to the first project.

`focusout` is filtered on `relatedTarget`: it fires on every hop between rows, so
without that check tabbing down the list would flash to neutral and back on every
keystroke.

The dimming of inactive rows is gated on `engaged`. Without it the page opened with
all seven names at 0.6 and nothing to explain why — six disabled-looking projects and
no active one.

### The 3D objects: two of seven, and that is the answer

A perfume flacon for Vivace (a `LatheGeometry` profile, plus a collar and a stopper)
and a coffee bean for Nader Coffee (a sphere with the crease displaced into one
face). Both are things those businesses sell, both are built from primitives, and
nothing was added to `package.json`.

The other five have none. A jacket, an HR platform, an electronics catalogue and a
mangrove nursery have no shape that can be made from primitives without looking like
a toy, and an abstract blob standing in for a business says nothing about it. The
brief allowed for exactly this.

The bean took two attempts, and both were decided by looking at a render:

1. A crease 0.42 deep in a 0.72 half-depth reached past the centre and the bean read
   as **split open** — more pistachio than coffee.
2. `Math.sign(bz || 1)` put a **visible spike** on the silhouette at the seam.

It now displaces only the front hemisphere, scaled by how far forward a vertex
already is, so there is no discontinuity at all, at a depth of 0.2.

Performance and reduced motion: reached only through `@defer (on viewport)`, so
`three` is absent from the initial bundle *and* from the detail route's chunk —
verified by grepping the built `main-*.js` for `WebGLRenderer`. It is gated on
`canRunWebGL()`, which is false under `prefers-reduced-motion`, so in that case there
is no canvas, no context and no animation rather than a frozen object. It is
`aria-hidden`, `pointer-events: none`, and absent from the server render — the content
that matters is all there.

### Verification (Sprint 9)

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | 183 / 20 files |
| Build | zero warnings, 12 prerendered, initial 95.31 kB gz (+0.63 kB) |
| `three` in the initial bundle | absent — 0 occurrences in `main-*.js` |
| SSR | role, team, contribution, business facts, brief and the theme all in the prerendered HTML; the object is not |
| Browser pass | **263 / 263**: gate order, hover *and* focus theming all seven projects to seven distinguishable grounds, neutral restored on leaving, sticky pane still fully visible at rows 5 and 7, roles on every row, objects arriving only where they exist, reduced motion with zero canvases, 0px overflow at 320–1920 in EN and AR, 0 console errors |

Two more harness bugs, and one real fix that came from looking rather than
measuring:

1. **`html { scroll-behavior: smooth }`** is set in the reset, so `scrollIntoView`
   *animates*. Reading a rect in the same turn returns a mid-flight position and the
   synthetic pointer lands on the next row — or off the page. Seven "the atmosphere
   does not follow the reader" failures, every one of them the harness. Settle the
   scroll, then measure, then move.
2. `getComputedStyle().translate` keeps a percentage, and an `infinite` animation at
   `currentTime === duration` renders its `from` keyframe — both from §20, both hit
   again here.
3. **`dir="auto"` on a fact value** auto-detected "Magento" and "Wide" as LTR and
   aligned them to the left of their column in Arabic while their labels stayed
   right — a label and its value at opposite edges of one cell. Removed;
   `.ltr-isolate` already isolates the Latin run without moving the block. Found by
   reading the Arabic page, not by a measurement.

---

## 22. The split detail page, and the mark over the capture (Sprint 9, follow-up)

### The account beside the evidence

`/work/:slug` is two columns above `lg`. The captures scroll in the wider column;
the account of the project — the 3D object, the name, the business facts, the role,
the build and the brief — holds beside them. A reader looking at the fifth
screenshot no longer has to remember what the project was, or scroll back up to
check which part of it was his.

Two details are load-bearing:

**The account is first in the DOM and second in the grid.** A reader, and a screen
reader, should meet the project's name before its screenshots; the eye should be
able to travel down the column of images. Placing the account in column 2 also
means it mirrors for free — right in English, left in Arabic, the same side of the
reading direction in both — with no directional override anywhere.

**The sticky box is inside the grid item, not the item.** `position: sticky` can
only travel inside its containing block, so `.detail__aside` stretches to the row
(the grid must NOT use `align-items: start`) and `.detail__pinned` inside it does
the sticking. This is the same mistake that cost the `/work` preview pane all its
travel in Sprint 8.5, in the same shape.

### The account has to fit a viewport, so it was measured until it did

A pinned column taller than the viewport cannot be read: sticky pins it, and the
part below the fold never scrolls into view. So the content was measured, not
guessed:

| | needed at first | after trimming |
| --- | --- | --- |
| Vivace (object + brief) | 1065px | 834px |
| 2B (no object, long build facts) | 956px | 813px |
| NAS HR (team row) | 891px | 727px |

The budget at a 900px-tall window is 836px. What changed: the object band 208 → 128,
the title from `display-1` to `heading-1`, the identity triad from stacked rows to
inline label-and-value, the brief to `--fs-body-sm`, and every join between blocks
tightened. **At 1080 — the common desktop height — all seven projects fit with room
to spare.** One project, Nader Coffee, runs 49px over at 900px, which is why
`max-block-size` plus `overflow-y: auto` stays: nothing is ever clipped or
unreachable, and no scrollbar is reserved when it is not needed.

### The mark over the capture

Hovering or focusing a row on `/work` lays that client's own logo over the top of
the preview screenshot, at the reading edge, and it leaves when the reader does —
the same `engaged` signal that drives the page's atmosphere, so the two arrive
together.

It sits on a wash of the page's own paper rather than bare on the image. These
captures have a dark navigation bar in that corner, a white banner in the next and
a photograph in a third; half the marks would have disappeared. The wash reads as
the portfolio labelling the image, not as a badge stuck to it.

### One regression, caused by the move

The object used to sit mid-page, so `@defer (on viewport)` never fired until the
reader scrolled. In the pinned column it is in the first viewport, fires
immediately — and `ProjectSculpture` was guarding only the *scene*, not the canvas.
Under `prefers-reduced-motion` an empty `<canvas>` appeared. The template now guards
the element itself on `canRunWebGL()`, so the component renders nothing at all in
that state. Caught by the existing "zero canvases under reduced motion" assertion,
which is the entire argument for asserting the absence of things.

### Verification

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | 185 / 20 files |
| Build | zero warnings, 12 prerendered, initial 95.52 kB gz |
| Split layout | **77 / 77** browser checks: column sides in LTR *and* RTL, DOM order, which blocks are in which column, sticky with real travel, the account still on screen mid-gallery, every project fitting at 1080, stacked below `lg` at 390/768, 0px overflow |
| The mark | absent at rest, present on hover *and* on keyboard focus, the correct project's artwork, at the top of the frame, on a scrim, mirrored to the reading edge in Arabic, gone on leaving |
| Sprint 9 suite | **263 / 263**, re-run after both changes |

---

## 23. Sprint 9.1 — role prominence, deeper atmospheres, three sculptures

### The role now leads the account

The information order on a detail page is number → name → platform · category →
**ROLE → CONTRIBUTION → PROJECT TEAM** → platform/technologies → brief → gallery.

Two changes made it read that way. `field` moved out of the facts and up beside the
platform under the name — "Shopify · Fashion / Apparel" is one statement about what
the project is, and splitting it across two blocks made the reader assemble it. And
the role block moved ahead of market and domain, took a rule top and bottom and the
brand's plate tone as a ground, and its value is set at `heading-2` in the brand's
accent.

In Sprint 9 the role was a small label halfway down a list of facts — the wrong
weight for the one thing on a page about someone else's business that says which
part of it was his.

The contributions were also rewritten to the sprint's own wording, shorter and
flatter: "Independent Shopify build, plus the visual assets it presents", "Front-end
development as one member of the front-end team", "Sole front-end developer on the
project, working with a backend team".

### The atmospheres got deeper, and the accent moved to the harder ground

Sprint 9's papers were at L 96.8% — correct in principle and nearly invisible in
practice. The same brand hues now sit at 94% with more chroma, the plate tone at
86%, and every ramp still measures AAA on primary and secondary text.

One real bug came out of deepening them. The accent had been checked against
`surface` only, and the role value — the one place the accent is set at heading
scale — sits on `surfaceStrong`. Three brands passed on the paper and failed on the
plate: Nature 4.17:1, 2B 3.78:1, Esterad 3.92:1. The accents are now darkened
against `surfaceStrong`, and `atmosphere.spec.ts` asserts both grounds.

More of the page participates: the client's mark sits above their name in the
header, and the cover and every gallery plate take `--color-surface-sunken` and a
hairline in `--color-border`, both of which the atmosphere rebinds — so the imagery
sits *in* the brand's world rather than on neutral grey islands inside it.

### Three sculptures, all turning

They rotate continuously on their own axis now — `rotation.y += delta * 0.26`, a
revolution every ~24 seconds — accumulated rather than derived from scroll, so
they keep turning while the reader sits still. Pointer and scroll only lean them.

A **jacket** was added for Designed by G, which Sprint 9 had refused on the grounds
that a garment from primitives becomes a blob. Asked for directly, it took two
attempts and the first proved the original objection: a near-circular torso with the
sleeves tucked against it rendered as a dark red canister. What fixed it was the
outline — the torso flattened hard front-to-back (`scale.z = 0.44`), the sleeves
moved clearly outside the silhouette at ±0.6 and angled away, plus a collar and a
placket. The hanger from the first attempt was dropped: at this size it was clutter.

The **flacon** was refined — a chamfer off the base, a waist, a shoulder, a rolled
lip and a tapered stopper, all extra points on one revolve — and a translucent inner
shell meant to suggest glass was tried and removed, because without an environment
to refract it only greyed the form.

The **bean** needed a third correction, and continuous rotation is what exposed it:
the crease existed only on the front face, so once the object turned it presented a
plain brown ellipsoid half the time. Both faces are now creased, the front more
deeply than the back, as a real bean is.

All three are framed per object (`CAMERA_DISTANCE`) because a bottle, a bean and a
garment are not the same shape, and one distance left each of them small in the
middle of the band.

### The cost, measured

The larger role block and the 10rem object band added to the pinned column. Every
project still fits exactly at 1080 — the common desktop height — with needs from
768px (Nature) to 940px (Designed by G, Vivace). At 900px tall the overshoot is
3–100px depending on the project, absorbed by the column's own `overflow-y: auto`,
which is a deliberate trade: shrinking the role line and the objects to satisfy the
shortest common desktop window would give up the two things this sprint was about.

### Verification (Sprint 9.1)

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | 188 / 20 files |
| Build | zero warnings, 12 prerendered, initial 95.52 kB gz — unchanged |
| Sprint 9 suite, re-run | **279 / 279** |
| Split-layout suite | **77 / 77**, including every project fitting at 1080 |
| Marquee suite | **98 / 98** |
| SSR | all seven roles, the team row on NAS HR alone, the platform · category line and the client's mark in the prerendered HTML of all seven pages |
| Ordering | `/work` still serves designed-by-g, nader-coffee, vivace, nas-hr, nature, 2b, esterad |

One test was wrong rather than one feature: `describes every image and reserves its
box` asserted a non-empty `alt` on every image in the detail page, which the new
decorative logo legitimately fails. It now requires alt text *unless* the image is
declared decorative by an `aria-hidden` ancestor — so a genuinely missing alt still
fails, which the blanket rule would no longer have caught.

---

## 24. Two UX additions (Sprint 10.1)

### The phone number, and the reversal it represents

`CONTACT_PHONE` in `contact-links.ts` is the single source, in three shapes because
each destination needs a different form of the same number and deriving them at the
call site is how they drift: `display` for reading, `tel` in E.164 with the `+`,
`whatsapp` as digits only — `wa.me` silently fails to resolve a chat otherwise.

This reverses an earlier decision. Sprints up to 8.5 deliberately withheld the
number, and `contact.spec.ts` asserted its *absence*. Ahmed asked for it, so that
test now asserts the opposite, and the reasoning is recorded here rather than left as
a puzzle for whoever reads the old comment.

Wherever it appears it is wrapped in `.ltr-isolate` and set `white-space: nowrap`. A
number beginning with `+` inside Arabic copy is otherwise reordered by the bidi
algorithm — the sign lands at the wrong end and the reader is shown a number that is
not the number. Asserted, not assumed.

`contact-phone` is its own component because `contact.scss` carries the 4 kB
per-component budget and the block took it 1.28 kB past it. Grouping the duplicated
`ds.label` / `ds.focus-visible` includes recovered most of it; extraction recovered
the rest. Same remedy as `project-facts` and `page-head`, for the same reason.

### The hero scroll cue

`features/home/scroll-cue/`. Type and one hairline that travels its own track. No
mouse icon, no chevron, nothing that bounces.

**It creates no second scroll system.** There is one scroll listener on the page — the
choreography's single ScrollTrigger — and it already publishes `HomeProgress`. The
*fade* is not even computed in TypeScript: `--home-progress` is on the staged
ancestor, so the opacity ramp is a CSS expression the compositor evaluates with no
change detection at all. The component contributes the one thing CSS cannot express:
a latch.

**Why a latch.** A pure function of scroll position is symmetric, so scrolling back to
the top would return the cue and tell a reader who has already been through the
corridor to start again. `spent` is one-way, set in an effect and never cleared. A
`computed` cannot do this — writing a signal inside one throws.

**Absent under reduced motion, deliberately.** `home.html` renders it only while
`staged()`. Unstaged, the choreography never runs, `HomeProgress` stays at 0 forever,
and a cue driven by it could never retire — it would sit permanently over a page that
is an ordinary scrolling document and needs no instruction. The honest answer is no
indicator, not a frozen one.

Two placement bugs, both found by rendering rather than reasoning:

1. **Clipped below the fold at scroll 0.** The cue was `position: absolute` inside the
   stage's viewport, which is `sticky; inset-block-start: 0` — but at scroll 0 sticky
   has not engaged, so the element still sits at its flow position *below* the sticky
   header. Measured: the viewport spanned 73→973 in a 900px window, so the cue landed
   at 872→941 and its lower 41px sat under the fold, at exactly the moment it matters
   most. `position: fixed` anchors it to the window, which is what "near the bottom of
   the viewport" actually means; it cannot leak past the hero because it is retired by
   5% of the journey and removed from the DOM when unstaged.
2. **Printing through the hero's own meta list.** Centred at the foot of the window it
   crossed "FOCUS  Shopify · Angular · Magento", because that block is left-aligned and
   reaches low. Moved to the inline-end corner, which is empty paper at every width and
   mirrors to the left in Arabic for free. Asserted by intersecting the cue's rect with
   every hero text node: zero overlaps at 1440 LTR, 1440 RTL and 390.

The static `.mark__scroll` hint inside `act-mark` is gone. Two hints saying the same
thing was one too many, and its CSS rule was left styling nothing.

### Verification (Sprint 10.1)

| Gate | Result |
| --- | --- |
| Typecheck, stylelint | clean |
| Tests | pass across all spec files |
| Build | zero warnings, prerendered, initial bundle unchanged |
| Prerender contract | the phone present on `/contact` and in every page's footer; the cue absent (browser-only) |
| Browser pass | the cue at rest / mid-fade / retired / after scrolling back, the hero and marquee unchanged, reduced motion, `/contact` and the footer in EN and AR with the number bidi-intact and unwrapped, and mobile — with zero hydration errors, zero console errors and zero horizontal overflow throughout.

A first-visit language gate was built and then removed from this sprint: on review
it did not read well against the rest of the identity, so the two remaining additions
are the phone number and the scroll cue.
