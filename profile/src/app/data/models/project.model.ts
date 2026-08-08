import { Localized } from '@core/i18n/localized';

/** The three platforms the portfolio is organised around. */
export type ProjectPlatform = 'angular' | 'magento' | 'shopify';

export interface ProjectMedia {
  /** Path under `public/`. `null` until a real asset exists. */
  readonly src: string | null;
  /** Required whenever `src` is set — a meaningful image needs a description. */
  readonly alt: Localized | null;
}

export interface Project {
  readonly slug: string;
  readonly name: string;
  readonly platform: ProjectPlatform;

  /** One line. Home presents work succinctly; case studies live on `/work`. */
  readonly summary: Localized;

  /** Ahmed's role, where it is worth stating. */
  readonly role: Localized | null;

  /**
   * Technologies actually used, verbatim from the project brief and CV.
   * Never inferred — an invented stack is worse than an absent one.
   */
  readonly technology: readonly string[];

  /** Live URL. `null` until confirmed; never guessed. */
  readonly url: string | null;

  readonly logo: ProjectMedia | null;
  readonly screenshot: ProjectMedia | null;
  readonly gallery: readonly ProjectMedia[];

  /** Surfaced on Home. Everything else waits for `/work`. */
  readonly featured: boolean;
}

export interface PlatformGroup {
  readonly platform: ProjectPlatform;
  readonly label: string;
  readonly summary: Localized;
  readonly projects: readonly Project[];
}
