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
├── project-planes.ts   screenshots as textured planes + texture queue
└── svg-path.ts         the minimal path parser
```

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
