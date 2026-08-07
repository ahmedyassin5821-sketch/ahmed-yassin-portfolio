# Ahmed Yassin — Brand System

**Sprint 1.5 deliverable. The visual source of truth for this portfolio.**
Status: approved. Supersedes the provisional visual direction in [ARCHITECTURE.md](./ARCHITECTURE.md) §8 — see §11.

The single input to this system is the finalized logo. Every value below is either measured from that mark, derived from it by a stated rule, or computed against WCAG. Nothing here is decorative preference.

**Theme is light-first.** Dark mode is deferred and did not influence any decision in this document. The token architecture keeps it a later swap rather than a rewrite.

---

## 1. Logo analysis

The mark is an **AY ligature monogram set in a high-contrast Didone (Modern) serif**. The A's thick right diagonal and the stroke descending from the crossbar converge to form the Y's stem, which drops half a cap-height below the A's baseline. It is one continuous path, not two letters placed together.

Measurements were taken by parsing the SVG path, flattening the béziers, and scanline-filling the result — see the appendix for reproduction.

| Property | Measured | Derived constant |
| --- | --- | --- |
| Mark bounding box | 250.32 × 284.79 | aspect **0.879** → the **7:8** portrait rectangle |
| Hairline strokes | 7.1 – 8.1 units | **2.6%** of mark height |
| Thick strokes | 27.0 – 29.4 units | **9.0%** of mark height |
| **Stroke contrast** | 27.5 ÷ 7.3 | **3.8 : 1** — the defining number |
| A left leg, from vertical | 22.62° | |
| A right leg, from vertical | ~24.5° | **brand angle = 24°** |
| Y right arm, from vertical | 30.37° | secondary angle |
| Y left arm, from crossbar | ~34.5° | |
| Y stem | exactly vertical, width 25.7 | the mark's anchor |
| Cap height (apex → A baseline) | ~190 | |
| Descender (baseline → stem foot) | ~94 | **cap : descender = 2 : 1** |
| Hairline serif span | 44 – 56 on a 7–8 stem | **6:1 – 7:1** |
| Stem foot serif | 65.4 on a 25.7 stem | **2.5:1**, flaring over only ~7 units |
| Apex | 4.3 units wide at y=28 | near knife-point, **no top serif** |
| Corner radii | none anywhere | flat terminals, miter joins |
| Colour | `#000000` on `#FFFFFF` | natively monochrome |
| Artboard margins | L 49.8 · R 52.8 · T 27.3 · B 19.9 | ≈ 2× stem width horizontally |

### Brand DNA

**Extreme modulation under absolute discipline.** The mark sustains a 3.8:1 thick-to-thin ratio while every terminal stays dead flat and every join stays mitered. Nothing is soft, nothing is rounded, nothing overshoots. Dramatic contrast with zero softness — that pairing is the entire personality, and reproducing it is the job of everything below.

| Logo trait | Consequence for the UI |
| --- | --- |
| 3.8:1 stroke contrast | The system needs a **loud/quiet register** — hairline rules against large light display type. No mid-weight mush |
| Flat, unbracketed terminals | 0–2px radius. Square caps. Miter joins. No soft shadows |
| Pointed apex, no top serif | Compositions resolve to a **point of emphasis**, not a decorated frame |
| Vertical stress, plumb stem | Layouts hang from a strict vertical axis. Alignment is the primary compositional tool |
| Descender crosses the baseline | The system may **break its own baseline** deliberately — once per view, never twice |
| 14% artboard margins | Whitespace is structural, not leftover. Without it the mark stops reading as premium |
| Purely achromatic | Colour is not part of the identity. Any future accent is an *addition*, never a dependency |

**Calm here comes from restraint, not softness.** This is the trap: "calm" and "elegant" tempt toward rounded corners, soft shadows, and gentle gradients, all of which contradict the mark. In this system calm is produced by spacing, alignment, and a narrow value range. Sharpness is never traded away for it.

---

## 2. Colour system

Warm neutral. Hue is held constant across the ramp (R = G+1 = B+2) so no step drifts toward beige or green.

**Every ratio below is computed, not estimated.**

### Primitives

```
--warm-50:   #FDFCFB      --warm-500:  #8C8B8A
--warm-100:  #F8F7F5      --warm-600:  #6E6D6C
--warm-150:  #F2F1EE      --warm-700:  #51504F
--warm-200:  #ECEAE6      --warm-800:  #2E2D2C
--warm-250:  #E4E2DD      --warm-950:  #0A0A09
--warm-300:  #EDEBE7
```

Primitives are never referenced by a component.

### Semantic tokens

Names are as implemented in `src/styles/_tokens-semantic.scss` (Sprint 2 renamed
these from `--color-canvas` / `--color-text-1` for legibility; **values are
unchanged** and every ratio below still holds).

| Token | Value | on background | on surface-nested | Role |
| --- | --- | --- | --- | --- |
| `--color-background` | `#FDFCFB` | — | — | Page |
| `--color-surface` | `#F8F7F5` | 1.04 | — | Cards, header |
| `--color-surface-nested` | `#F2F1EE` | 1.10 | — | Nested panels, code blocks |
| `--color-surface-sunken` | `#ECEAE6` | 1.17 | 1.06 | Inset wells, media placeholders |
| `--color-surface-elevated` | `#FDFCFB` + `--shadow-3` | — | — | Overlays, modals |
| `--color-divider` | `#EDEBE7` | 1.16 | 1.05 | Decorative rules |
| `--color-border` | `#E4E2DD` | 1.26 | 1.15 | Card and section edges — seam only |
| `--color-border-interactive` | `#8C8B8A` | **3.32** | **3.01** | Control boundaries — WCAG 1.4.11 |
| `--color-text-muted` | `#6E6D6C` | **5.04** | **4.57** | Muted, metadata |
| `--color-text-secondary` | `#51504F` | **7.85** | **7.12** | Secondary body |
| `--color-text-primary` | `#2E2D2C` | **13.41** | **12.17** | Primary text |
| `--color-brand-mark` | `#0A0A09` | **19.33** | **17.54** | **The logo alone** |

`--color-surface-elevated` returns to the lightest paper value rather than
continuing darker: in a light theme a *darker* floating surface reads as
recessed, so overlays are separated by shadow instead of tint.

### Status tokens — monochrome

The identity is achromatic, so status is carried by **icon + text + border
weight**, which is also what WCAG 1.4.1 requires. All nine resolve to neutrals
today:

```
--color-{success,warning,error}          → --color-text-primary
--color-{success,warning,error}-surface  → --color-surface-sunken
--color-{success,warning,error}-border   → --color-text-primary
```

Introducing real hues later is an edit to these nine lines and no components.

### Three rules that fall out of the numbers

1. **Pure ink is reserved for the mark.** Body text is `#2E2D2C` at 13.4:1; the logo is `#0A0A09` at 19.3:1. The requirement that the logo stay the strongest visual element is therefore enforced by the token system rather than by discipline — nothing else on any page is permitted to be as dark as the monogram.

2. **`sunken` is a decorative surface only.** On it, `text-3` falls to 4.30:1 and `border-interactive` to 2.83:1 — both below threshold. No muted text and no control borders on `sunken`. Enforced by lint.

3. **`border-subtle` is not a control boundary.** At 1.26:1 it is a visual seam. Any border that identifies an interactive control must use `border-interactive`.

### Accent contract — deferred but pre-wired

No brand colour is finalized. The full accent contract ships now, resolving to neutrals:

```
--brand-hue          /* the only two values that ever change */
--brand-chroma

--color-accent        → --color-text-1     /* today: near-black */
--color-accent-hover  → --color-ink
--color-accent-muted  → --color-surface
--color-on-accent     → --color-canvas
--color-focus         → --color-ink
```

Every component consumes `--color-accent`. Today it renders near-black, so the portfolio is genuinely monochrome. When a brand colour is chosen, two primitives change and the entire site follows — **with no component edits**.

Required contrast for any future accent, so it can be validated against the same gates:

| Token | Must achieve |
| --- | --- |
| `--color-accent` as text on `canvas` | ≥ 4.5:1 |
| `--color-on-accent` on `--color-accent` fill | ≥ 4.5:1 |
| `--color-accent` as a border or non-text indicator | ≥ 3:1 |
| `--color-focus` against every adjacent surface | ≥ 3:1 |

Stylelint rejects any raw hex, `rgb()`, or `hsl()` under `src/app/**`. That is what makes the promise enforceable rather than aspirational.

---

## 3. Typography

**The logo is the only serif in the system.** Nothing else competes with it.

| Role | Latin | Arabic |
| --- | --- | --- |
| Display | **Geist** 300 | **Amiri** 400 |
| Heading | **Geist** 500 / 600 | **IBM Plex Sans Arabic** 600 |
| Body / UI | **Geist** 400 | **IBM Plex Sans Arabic** 400 |
| Mono | **IBM Plex Mono** 400 / 500 | IBM Plex Mono |

**Geist** (variable, 100–900) is engineered, tightly spaced, and architectural — a precision instrument rather than a personality. It is deliberately not Inter, which has become the signature of exactly the generic developer aesthetic this brand avoids.

**IBM Plex Mono over Geist Mono**, deliberately: Plex Mono and IBM Plex Sans Arabic are one designed superfamily, so the Arabic build ships a single coherent type system, and Plex Mono's subtle slab terminals rhyme with the logo's serifs.

**Amiri** is a classical Naskh with genuine thick/thin modulation — the closest Arabic analogue to a Didone. Arabic has no serif/sans distinction, so a Latin monogram cannot carry contrast within Arabic text; Amiri fills that role on the Arabic side, exactly as the logo does on the Latin side.

### Reproducing 3.8:1 contrast in type

The logo has no mid-weights — hairline or stem, nothing between. The type system mirrors this as a **deliberate weight gap**:

```
display   Geist 300, 64–140px, tracking −0.03em   ← the hairline
heading   Geist 600                                ← the stem
label     IBM Plex Mono 500, uppercase, +0.08em    ← the serif
```

Weights 400 and 500 exist for body and UI only. **Geist 700 and above are not in the system** — heaviness would compete with the mark. Display is *light and enormous*, which is the counter-intuitive move that makes a page feel drawn from a Didone rather than from a bold sans.

### Type scale

Fluid `clamp()`; 1.25 ratio at UI sizes widening to 1.333 at display.

| Token | Size | LH (LTR) | LH (AR) | Tracking (LTR / AR) |
| --- | --- | --- | --- | --- |
| `display-1` | `clamp(3rem, 1.5rem + 7.5vw, 8.75rem)` | 0.94 | 1.35 | −0.03em / **0** |
| `display-2` | `clamp(2.5rem, 1.6rem + 4.5vw, 5rem)` | 1.00 | 1.40 | −0.025em / **0** |
| `h1` | `clamp(2rem, 1.4rem + 3vw, 3.25rem)` | 1.10 | 1.50 | −0.02em / **0** |
| `h2` | `clamp(1.5rem, 1.2rem + 1.5vw, 2.25rem)` | 1.20 | 1.55 | −0.015em / **0** |
| `h3` | `1.375rem` | 1.30 | 1.60 | −0.01em / **0** |
| `body-lg` | `1.125rem` | 1.65 | 1.90 | 0 |
| `body` | `1rem` | 1.65 | 1.90 | 0 |
| `body-sm` | `0.9375rem` | 1.60 | 1.85 | 0 |
| `caption` | `0.8125rem` | 1.50 | 1.75 | 0 — UI only, never prose |
| `label` | `0.75rem` | 1.40 | 1.60 | +0.08em / **0** |

**Arabic overrides are mandatory, not stylistic.** Negative tracking destroys Arabic letter joining, so tracking is forced to `0` under `[lang^="ar"]`. Amiri's Naskh ascenders and descenders are far taller than Geist's, so every Arabic line-height runs ~0.25 higher. Both are enforced in `_typography.scss`, never left to component authors.

### Amiri constraints

Amiri ships **400 and 700 only**, non-variable, so the light-display strategy cannot cross over. Arabic display uses Amiri 400 as its lightest available voice, in the same slots and at the same sizes where English uses Geist 300.

**Amiri is never used below 32px** — its contrast collapses at text sizes. Everything under 32px in Arabic is IBM Plex Sans Arabic.

**Amiri's Latin subset is deliberately not loaded** (Sprint 2 finding). Amiri's Latin companion is a serif, so loading it put serif Latin into Arabic headlines — breaking the rule that the monogram is the only serif in the system. Latin glyphs inside Arabic display now resolve to Geist instead, via stack order:

```
--font-arabic-display: 'Geist Variable', 'Amiri', serif;
```

Font fallback resolves per glyph and Geist has no Arabic coverage, so Arabic falls through to Amiri while Latin stays in the sans. The language→font mapping is declared in **both** directions (`[lang='ar']` and `[lang='en']`), because custom properties inherit — an English block nested inside an Arabic page would otherwise keep the Arabic stack.

### Loading

Self-hosted woff2, subset per locale. EN ships Geist + Plex Mono. AR ships Plex Sans Arabic + Amiri + Plex Mono. Preload exactly two faces per locale. `font-display: swap` with `size-adjust`-tuned fallback metrics. Budget ≤90KB per locale.

---

## 4. Design tokens

Three layers — **primitive → semantic → component**. Components read semantic and component tokens only.

### Spacing — 4px base

```
--space-0: 0       --space-6:  24px    --space-20:  80px
--space-1: 4px     --space-8:  32px    --space-24:  96px
--space-2: 8px     --space-10: 40px    --space-32: 128px
--space-3: 12px    --space-12: 48px    --space-40: 160px
--space-4: 16px    --space-16: 64px
--space-5: 20px
```

### Radius

```
--radius-none: 0        default — cards, sections, code blocks, media
--radius-xs:   2px      buttons, inputs, tags, chips
--radius-sm:   4px      nested surfaces only
--radius-full: 999px    avatar and status dot ONLY
```

### Border widths — the 4:1 range mirrors the logo

```
--border-hairline: 1px    default
--border-emphasis: 2px    active nav, focus ring, selected state
--border-display:  4px    section rules, display underlines
```

### Shadow — warm-tinted, never pure black

```
--shadow-0: none
--shadow-1: 0 1px 2px  rgb(10 10 9 / 0.04)
--shadow-2: 0 2px 8px  rgb(10 10 9 / 0.06)
--shadow-3: 0 8px 24px rgb(10 10 9 / 0.08)     overlays only
--shadow-4: 0 16px 48px rgb(10 10 9 / 0.12)    modals only
```

Hairline borders are the primary depth cue. Shadow is secondary and levels 3–4 never appear on in-flow content.

### Elevation — composite, not a shadow alone

| Level | Surface | Border | Shadow | Use |
| --- | --- | --- | --- | --- |
| `e0` | canvas | none | none | Page |
| `e1` | raised | border-subtle | `--shadow-0` | Cards at rest |
| `e2` | raised | border-interactive | `--shadow-1` | Card hover, sticky header |
| `e3` | raised | border-subtle | `--shadow-3` | Dropdown, popover |
| `e4` | raised | border-subtle | `--shadow-4` | Modal, sheet |

### Blur

```
--blur-0: 0    --blur-2: 8px     --blur-4: 16px
--blur-1: 4px  --blur-3: 12px    --blur-5: 24px
```

Applied to the sticky header only.

### Z-index

```
--z-base: 0        --z-header:  200     --z-toast:     1000
--z-raised: 10     --z-overlay: 800     --z-skip-link: 1100
--z-sticky: 100    --z-modal:   900
```

### Logo-derived geometry

```
--brand-angle:     24deg     the A's leg axis
--brand-angle-alt: 30deg     the Y's right arm
--brand-contrast:  3.8       thick ÷ thin
--brand-ratio:     0.875     7:8 portrait
--brand-rhythm:    2         cap : descender
```

These are functional, not documentation. `--brand-angle` drives hover underline wipes, media reveal masks, divider terminals, and the skeleton sweep. `--brand-ratio` is the aspect of every project thumbnail and avatar frame. `--brand-rhythm` sets section gap = 2 × block gap.

Font family, size, weight, line-height, letter-spacing, and motion tokens are specified in §3 and §6.

---

## 5. Component language

Applied without exception: **1px hairline borders · 0–2px radius · square caps and miter joins · no gradients · no glass except the header · one primary action per view.**

| Component | Specification |
| --- | --- |
| **Buttons** | 2px radius · 44px min height · 16–24px inline padding. *Primary*: `accent` fill, `on-accent` text. *Secondary*: 1px `border-interactive`, transparent fill. *Ghost*: text only, hairline underline wiping in at `--brand-angle` on hover. No shadow. Press = 40ms opacity shift, **never a scale** — scaling contradicts the mark's rigidity |
| **Cards** | 0 radius · `raised` on `canvas` · 1px `border-subtle`. Hover promotes the border to `border-interactive` and lifts 2px. No shadow bloom |
| **Inputs** | 2px radius · 48px height · 16px font (blocks iOS zoom) · 1px `border-interactive` (3.01:1 verified). Label always visible above the field, never a placeholder substitute. Focus = 2px `--color-focus` ring at 2px offset. Errors pair colour with an icon and text |
| **Navigation** | Sticky · `raised` at 88% alpha + `blur(12px)` · 1px bottom hairline. Monogram at 40px on the inline-start edge. Active item marked by a 2px underline, never by colour alone. Mobile: full-screen sheet, focus-trapped, background `inert`, Escape closes |
| **Footer** | `surface` · 1px top hairline · 3 columns at ≥1024 collapsing to 1. Monogram at 64px in `--color-ink` as the closing mark |
| **Project cards** | 7:8 media frame (`--brand-ratio`) · `sunken` placeholder · `h3` title · platform badge · mono metadata row. `view-transition-name` for the shared-element push into the case study |
| **Timeline** | Semantic `<ol>` · 1px rail on the `inset-inline-start` edge · 8px **square** nodes, not circles · dates in mono. Mirrors automatically in RTL |
| **Tags** | Read-only. 2px radius · `surface` fill · `caption` size · no border |
| **Chips** | Interactive filter. 2px radius · 1px `border-interactive` · `aria-pressed`. Selected = `accent` fill |
| **Code blocks** | 0 radius · `surface` · 1px `border-subtle` · IBM Plex Mono · **forced `dir="ltr"` even in Arabic** · own `overflow-x` container · copy button at the block-start inline-end corner |
| **Badges** | Platform identity (Angular / Magento / Shopify). Monochrome — 1px outline plus a mono label. **No platform brand colours**; they would break the achromatic identity. Distinguished by text, never by colour alone |

---

## 6. Motion language

**Governing principle: the logo does not bounce.** A Didone is rigid, drafted, and exact. Springs, overshoot, and elastic curves are therefore **excluded from this system** — they read as playful, which contradicts the brief. Elements slide, wipe, and settle. They never spring.

| Token | Value | Use |
| --- | --- | --- |
| `--dur-instant` | 40ms | Press feedback |
| `--dur-fast` | 120ms | Hover, focus |
| `--dur-base` | 200ms | State change |
| `--dur-slow` | 320ms | Reveals, accordion |
| `--dur-deliberate` | 480ms | Page transition, hero |
| `--ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` | Entrances — decisive, no overshoot |
| `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Exits, at ~65% of entrance duration |
| `--ease-inout` | `cubic-bezier(0.65, 0, 0.35, 1)` | Position changes |
| — | — | **No spring token exists** |

| Behaviour | Specification |
| --- | --- |
| **Hover** | 120ms. Border darkens `subtle → interactive`; ghost buttons draw a hairline underline wiping in at `--brand-angle`. Maximum 2px displacement |
| **Scroll reveals** | 320ms · 16px rise + fade · 40ms stagger · **once only**. Never re-trigger on scroll-back — repeat animation is the fastest route to feeling cheap |
| **Page transitions** | Native View Transitions, 480ms. Shared-element push from project card to case-study hero |
| **Loading** | Skeletons in `sunken` with a **linear** sweep along `--brand-angle`. No pulsing — pulse reads organic; this brand is drafted |
| **Micro-interactions** | Copy-to-clipboard swaps its icon and raises a toast. Focus rings appear at 0ms — **never animate a focus ring** |
| **The one baseline break** | The logo's descender licenses exactly **one** element per view to cross its grid line — a hero numeral, or the monogram itself. Once. A second occurrence reads as an accident |
| **Reduced motion** | Everything collapses to final state. Wipes become instant, reveals become visible, transitions become cuts |

---

## 7. Iconography

Icons echo the logo's **stem**, not its hairline. At 24px the hairline ratio (2.6%) would be 0.6px and would disappear.

| Property | Value |
| --- | --- |
| Grid | 24 × 24, 20px live area, 2px padding |
| Stroke | **1.5px** at 24px — 6.25%, stem-derived |
| Optical sizing | 16px → 1.25px · 24px → 1.5px · 32px → 2px · 48px → 2.5px |
| Line cap | `square` |
| Line join | `miter`, limit 4 |
| Corner radius | **0** |
| Vertex alignment | 0.5px subgrid |
| Fill | None. Outline only, one hierarchy level |

**Base set: Lucide, with `stroke-linecap: square; stroke-linejoin: miter` overridden globally.** Lucide ships round caps, which directly contradict the mark — this override is mandatory, not cosmetic. A minor optical compromise on a few glyphs is acceptable; the ~12 highest-visibility icons (menu, close, arrow, chevron, external-link, copy) should eventually be redrawn on the 24px grid to match the geometry exactly.

Shipped as a single sprite containing only the icons in use. No icon fonts. No emoji.

---

## 8. Grid system

| Breakpoint | Gutter | Container | Columns |
| --- | --- | --- | --- |
| 320 | 16px | fluid | 4 |
| 375 / 390 | 20px | fluid | 4 |
| 768 | 32px | fluid | 8 |
| 1024 | 40px | 960px | 12 |
| 1280 | 48px | 1140px | 12 |
| 1440 | 64px | 1280px | 12 |
| 1920 | 64px | 1360px | 12 |
| ≥2560 (ultra-wide) | 64px | **1440px, capped** | 12 |

Column gap 24px desktop · 16px tablet · 12px mobile. Media queries are **em-based** so they honour the browser's font size.

**Ultra-wide is capped deliberately.** Letting content stretch past 1440px destroys both the measure and the negative space the mark depends on. Beyond 2560px the container stays fixed and the canvas simply extends — the architectural read, not a bug.

### Vertical rhythm

Derived from the logo's 2:1 cap-to-descender:

```
--space-block:   clamp(2rem, 1.25rem + 3vw, 4rem)    within a section
--space-section: calc(var(--space-block) * 2)         between sections
```

One relationship governs the whole page. Prose measure caps at 68ch; `display-1` caps at 20ch so a hero statement never runs long enough to lose impact.

---

## 9. RTL / LTR

Each locale is a separate compile-time build ([ARCHITECTURE.md](./ARCHITECTURE.md) ADR-001), so direction is fixed per build — but every component is authored direction-agnostically.

| Concern | Rule |
| --- | --- |
| **The logo never mirrors** | It is a Latin AY ligature; mirroring produces a broken letterform. Hard rule, and the single most likely mistake |
| Layout | Logical properties only. Physical `left` / `right` / `margin-left` banned by `stylelint-use-logical` |
| `--brand-angle` | **Does** mirror — `24deg` LTR, `-24deg` RTL — so diagonal wipes always run with the reading direction |
| Timeline rail | `inset-inline-start`; mirrors automatically |
| Icons | Directional glyphs (arrow, chevron, external-link) flip via the `Icon` `flipInRtl` input. Logos, checkmarks, and play triangles must **not** flip |
| GSAP | `x` is physical — every horizontal tween routes through `dirX()`, which negates in RTL |
| Tracking | Forced `0` under `[lang^="ar"]` |
| Line height | Arabic set runs ~0.25 higher throughout (§3) |
| Embedded Latin | "Angular 21", "Magento 2", metrics, code — wrapped in `appLtr` (`dir="ltr"` + `unicode-bidi: isolate`) |
| Numerals | Latin digits in both locales (ADR-016) |
| Optical balance | Amiri's larger apparent size means Arabic display steps down one scale notch from its Latin equivalent, so both locales carry equal visual weight |

---

## 10. Logo asset remediation

The supplied SVG cannot ship as-is. Six issues — all fixable, none requiring a redesign.

1. **A white background plate is baked in.** The first path is a full-canvas rectangle with the mark knocked out of it, so the logo cannot sit on `raised`, `surface`, or any tinted background without a visible white box. A transparent variant is required.
2. **Fills are hardcoded** `#ffffff` / `#000000`. They must become `currentColor` so the mark inherits `--color-ink` — otherwise the logo is the one element in the entire system violating the no-hardcoded-colour rule.
3. **Fixed `width="353px" height="332px"`.** Remove; keep only `viewBox`, or the mark will not scale responsively.
4. **Legacy SVG 1.0 DOCTYPE.** Dead weight — strip it.
5. **No accessible name.** Needs `role="img"` and a `<title>`, localized per build.
6. **It disintegrates at small sizes.** Hairlines are 2.6% of height — at a 24px favicon that is **0.6px**, below one device pixel, so the mark aliases into mush or vanishes entirely. A low-contrast small-size variant with thickened hairlines is required.

### Required variants

| Variant | Purpose |
| --- | --- |
| Full mark, transparent, `currentColor` | All on-page use ≥48px |
| Small-size variant, thickened hairlines | Any use below 48px |
| Favicon set (16 / 32 / 180 / 512) | Browser and app icons |
| Monochrome-on-dark | Reserved for future dark mode |
| Social lockup, 1200 × 630 | OG and Twitter cards |

**Clear space:** minimum one stem width (9% of mark height) on every side; two preferred. The supplied artboard already provides roughly two horizontally.

**Minimum sizes:** full mark ≥48px tall. Below that, the small-size variant. Never below 16px.

---

## 11. What this supersedes

| Previous decision | Status | Replaced by |
| --- | --- | --- |
| ADR-013 — Signal Indigo `#6E8BFF` accent | **Superseded** | Monochrome warm neutral; accent deferred and pre-wired (§2) |
| ADR-014 — dark + light themes both in Sprint 2 | **Amended** | Light only. Dark mode deferred, and it did not influence any decision here. Tokens remain theme-ready so it stays a swap, not a rewrite |
| Typography — Space Grotesk + Inter + JetBrains Mono | **Superseded** | Geist + IBM Plex Mono; Amiri added for Arabic display (§3) |
| Dark-mode elevation (border + inset highlight) | **Superseded** | Light-mode elevation: hairline borders first, warm-tinted shadow second (§4) |
| ADR-016 Latin numerals · ADR-017 placeholder-first work pages | **Unchanged** | |
| All structure — folders, routing, i18n, SSR, animation architecture, component inventory | **Unchanged** | ARCHITECTURE.md §7 governs *what* components exist; §5 here governs how they *look* |

Sprint 2's 13-step execution order is unchanged. Step 4 now implements this system instead of the Signal Indigo one and drops the dual-theme work, which makes it smaller.

---

## Appendix — reproducing the measurements

Logo geometry was obtained by parsing `Attachments/my-logo.svg`, flattening every cubic bézier to 24–40 segments, then scanline-filling with the nonzero winding rule and measuring horizontal ink runs at fixed intervals. Stroke axes came from linear regression over run centres; angles are reported from vertical. Contrast ratios use the WCAG 2.x relative-luminance formula.

The three scripts used (`parse-logo.js`, `fill-logo.js`, `solve-ramp.js`) were scratch tooling and are not part of the repository. Any of the numbers in §1 or §2 can be re-derived from the SVG and the hex values alone.
