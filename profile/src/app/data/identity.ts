import { Localized } from '@core/i18n/localized';

/**
 * The one professional title.
 *
 * ## Why this is its own module
 *
 * It lives with the CV conceptually, and `cv.data.ts` re-exports it so every
 * existing importer is unaffected. But the footer is in the app shell — eager, on
 * every page — and importing it from `cv.data` pulled the entire CV (profile,
 * experience, education, certifications, skills) into the **initial bundle**: 2.4 kB
 * gzipped for one string. Measured, not guessed.
 *
 * So the constant sits in a module small enough for the shell to import, and the
 * value is still defined exactly once.
 *
 * ## What it is not
 *
 * Ahmed's own wording in **both** languages, and neither is a translation of the
 * other. Not to be rephrased, and specifically:
 *
 * - the Arabic is never replaced, and never becomes "مصمم واجهات أمامية";
 * - the design work on individual Shopify projects is stated on those projects, in
 *   `Project.role`, and never promoted into this line.
 */
export const PROFESSIONAL_TITLE: Localized = {
  en: 'Front-End Web Developer',
  ar: 'مبرمج مواقع ومتاجر إلكترونية',
};
