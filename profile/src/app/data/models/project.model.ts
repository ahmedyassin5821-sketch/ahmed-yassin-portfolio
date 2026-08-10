import { Localized } from '@core/i18n/localized';

/** The three platforms the portfolio is organised around. */
export type ProjectPlatform = 'angular' | 'magento' | 'shopify';

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

  /** Ahmed's role on the project, as supported by the CV. */
  readonly role: Localized;

  /**
   * Technologies actually used — from the brief, the CV, or visible in the
   * supplied captures. Never inferred to pad the list.
   */
  readonly technologies: readonly string[];

  /** A named third-party or in-house theme, where one was used. */
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
