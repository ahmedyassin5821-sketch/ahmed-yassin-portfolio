import { Localized } from '@core/i18n/localized';

/** The three platforms the portfolio is organised around. */
export type ProjectPlatform = 'angular' | 'magento' | 'shopify';

/**
 * A brand's atmosphere — the controlled colour a project brings with it.
 *
 * ## Why these are literal colours and not design tokens
 *
 * The token layer describes *AY's* system. These describe seven other companies,
 * and a client's brand is data about that client, not a decision about this
 * design system — putting 42 client colours into `_tokens-primitive.scss` would
 * make the token sheet a place brands are added.
 *
 * They are consumed by binding them onto an element as custom properties, where
 * they *rebind the semantic tokens locally*. Every component already reads
 * `var(--color-text-primary)` and friends, so the whole page adapts without a
 * single component learning that themes exist.
 *
 * ## How the values were arrived at
 *
 * Each brand's own logo artwork in `public/projects/<slug>/logo.*` was sampled
 * for the colours actually in the mark — not a screenshot, and nothing invented.
 * The ramp is then derived from that hue as a *tinted paper*: the portfolio stays
 * the portfolio and the brand arrives as an atmosphere inside it, rather than the
 * page turning into the client's website.
 *
 * Every value in every ramp was checked for WCAG contrast against its own
 * `surface`. The worst case in the set is 4.58:1; primary and secondary text are
 * AAA everywhere. See `docs/ARCHITECTURE.md` §21.
 */
export interface ProjectAtmosphere {
  /** The page ground. A tinted paper, never a saturated field. */
  readonly surface: string;
  /** Plate and image grounds — one step deeper than the paper. */
  readonly surfaceStrong: string;
  readonly border: string;
  readonly text: string;
  readonly textSecondary: string;
  readonly textMuted: string;
  /**
   * The brand's own colour, darkened only as far as legibility on `surface`
   * demands. Used for marks and accents, never for a large field.
   */
  readonly accent: string;
  /** Full-chroma brand colour, for the subtle lighting behind imagery only. */
  readonly glow: string;
}

/**
 * A small 3D object for a project's detail page.
 *
 * Deliberately a short closed union rather than a model path: each of these is
 * built from primitives in the existing Three.js scene, so there is no asset to
 * download and no second 3D library. A project only carries one where an object
 * can be made that actually reads as the business — most cannot, and those carry
 * `null` rather than an abstract shape standing in for one.
 */
export type SculptureKind = 'perfume-bottle' | 'coffee-bean' | 'jacket';

/**
 * A real image, with the geometry the encoder measured.
 *
 * `width`/`height` are the intrinsic dimensions of the largest variant. They are
 * not decoration: rendered as attributes they let the browser reserve the exact
 * box before any bytes arrive, which is what keeps a gallery of 1600px captures
 * from shifting the page as it loads.
 *
 * Everything except `alt` is spread in from `project-media.generated.ts`, so a
 * renamed file is a compile error rather than a broken image.
 */
export interface ProjectImage {
  readonly src: string;
  /** WebP candidates. `null` for vector artwork, which needs no variants. */
  readonly srcset: string | null;
  /** AVIF candidates — generated only for cover images. */
  readonly avif?: string | null;
  readonly width: number;
  readonly height: number;
  /** Required. An image worth showing is an image worth describing. */
  readonly alt: Localized;
}

export interface Project {
  readonly slug: string;

  /**
   * Localised because two of these brands own an Arabic name: Nature's logo
   * reads "الطبيعة" and Nader's reads "بن نادر". The rest are Latin wordmarks
   * that are not translated, so both languages carry the same string — a
   * transliteration would be inventing a brand asset.
   */
  readonly name: Localized;

  readonly platform: ProjectPlatform;

  // ---------------------------------------------------------------------------
  // The business
  //
  // A portfolio that only says "Shopify storefront" describes the tooling and
  // not the work. These three fields say *what the business is* before any
  // technology is named, and every one of them is taken from the client's own
  // public site or from a published source — never inferred from a screenshot.
  // ---------------------------------------------------------------------------

  /** Geography the business serves — "Egypt", "United Arab Emirates". */
  readonly market: Localized;

  /** Industry — "Coffee / Food & Beverage", "HR Technology". */
  readonly field: Localized;

  /** What kind of digital product it is — "Coffee e-commerce". */
  readonly domain: Localized;

  /**
   * Two or three sentences on what the business actually does and what the
   * platform does for it.
   *
   * Describes the *product*, not Ahmed's contribution — that is `role`, and
   * conflating the two would imply he owns businesses he built pages for.
   */
  readonly brief: Localized;

  // ---------------------------------------------------------------------------
  // Ahmed's part in it
  //
  // Kept rigorously separate from the business fields above. Describing what a
  // client's product does must never read as a claim to have built the whole of
  // it — on two of these projects the backend was another team's work, and one of
  // them is owned by an employer.
  // ---------------------------------------------------------------------------

  /** What Ahmed was on this project — "Front-End Developer". Never a job title. */
  readonly role: Localized;

  /**
   * The **project's** team, where the real composition is known — not Ahmed's
   * team, and not a headcount to be estimated. `null` everywhere it is not known,
   * and the UI omits the row entirely rather than guessing.
   */
  readonly team: Localized | null;

  /** What Ahmed actually did, in one sentence. Scoped to his own work. */
  readonly contribution: Localized;

  /**
   * Technologies actually used — from the brief, the CV, or visible in the
   * supplied captures. Never inferred to pad the list.
   */
  readonly technologies: readonly string[];

  /** The controlled colour this project brings with it. */
  readonly atmosphere: ProjectAtmosphere;

  /** A 3D object for the detail page, where one can honestly be made. */
  readonly sculpture: SculptureKind | null;

  /**
   * A named third-party or in-house **storefront** theme — "Porto", "Wide".
   *
   * Not to be confused with `atmosphere`: this is a product name that appears in
   * the build facts, and it is the reason the brand-colour field is not called
   * `theme`.
   */
  readonly theme: string | null;

  /** Whether the work included a dashboard or admin system. */
  readonly dashboard: boolean;

  /**
   * Live URL, or `null` for work that has no public address.
   *
   * `null` is a real state, not missing data: NAS HR is an internal system. The
   * UI marks it as internal rather than rendering a dead link. This is also the
   * only source of a project's status — deriving it means the label and the link
   * can never disagree, which a separate `status` field would eventually allow.
   */
  readonly url: string | null;

  readonly logo: ProjectImage;

  /** The preview image, and the lead image on the detail page. */
  readonly cover: ProjectImage;

  /** Everything after the cover. Lazy-loaded. */
  readonly screenshots: readonly ProjectImage[];

  readonly featured: boolean;
}

export interface PlatformGroup {
  readonly platform: ProjectPlatform;
  readonly label: string;
  readonly summary: Localized;
  readonly projects: readonly Project[];
}
