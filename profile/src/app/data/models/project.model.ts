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

  /**
   * What the product is — "Fashion / Streetwear / E-commerce".
   *
   * Distinct from `platform`, which is what it was built with. Together they are
   * the two-line identity every project presentation leads with, and the pair is
   * what shows range: three platforms across seven very different sectors.
   */
  readonly projectType: Localized;

  /** Ahmed's role on the project. */
  readonly role: Localized;

  /** One or two lines. This is a portfolio, not a case study. */
  readonly summary: Localized;

  /**
   * Technologies actually used — from the brief, the CV, or visible in the
   * supplied captures. Never inferred to pad the list.
   */
  readonly technology: readonly string[];

  /** A named third-party theme, where one was used. */
  readonly theme: string | null;

  /** Whether the work included a dashboard or admin system. */
  readonly dashboard: boolean;

  /**
   * Live URL, or `null` for work that has no public address.
   *
   * `null` is a real state, not missing data: NAS HR is an internal system. The
   * UI marks it as private rather than rendering a dead link.
   */
  readonly url: string | null;

  readonly logo: ProjectImage | null;

  /**
   * The card image, and the lead image on the detail page.
   *
   * `null` for a project whose assets have not been supplied yet — Vivace today.
   * The UI renders the token-styled `MediaPlaceholder` frame rather than stock
   * photography or an invented screenshot, so the gap is legible instead of
   * disguised. Populating it later is a data edit and nothing else.
   */
  readonly cover: ProjectImage | null;

  /** Everything after the cover. Lazy-loaded. Empty until assets arrive. */
  readonly screenshots: readonly ProjectImage[];

  readonly featured: boolean;
}

export interface PlatformGroup {
  readonly platform: ProjectPlatform;
  readonly label: string;
  readonly summary: Localized;
  readonly projects: readonly Project[];
}
