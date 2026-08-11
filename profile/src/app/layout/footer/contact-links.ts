export interface ContactLink {
  readonly label: string;
  readonly href: string;
  /** Text shown instead of the raw URL. */
  readonly display: string;
}

/**
 * Contact and profile links.
 *
 * Every value here is sourced from Ahmed's CV (`Attachments/`) or from the
 * repository's own git remote — nothing is invented. The shell brief forbids
 * fabricating social accounts, and a dead link in a portfolio footer is worse
 * than an absent one.
 *
 * Extend `SOCIAL_LINKS` as further profiles are confirmed. The footer renders
 * whatever is present, so no template change is needed.
 */
export const CONTACT_EMAIL = 'ahmedyassin5821@gmail.com';

export const CONTACT_LOCATION = 'Cairo, Egypt';

/**
 * The mobile number, in three shapes, defined once.
 *
 * Earlier sprints deliberately withheld it — publishing a mobile invites abuse,
 * and the CV PDF already carried it. Ahmed has since asked for it on the site, so
 * that trade is reversed: it is now on `/contact` and in the footer.
 *
 * Three fields rather than one because each destination needs a different form of
 * the same number, and deriving them at the call site is how they drift:
 *
 * - `display` is what a reader sees, grouped for legibility.
 * - `tel` is E.164 with the `+`, which is what `tel:` requires to dial
 *   internationally.
 * - `whatsapp` is digits only with no `+` and no spaces, which is what `wa.me`
 *   requires — it silently fails to resolve a chat otherwise.
 *
 * ## Bidirectional text
 *
 * The displayed form must be wrapped in `.ltr-isolate` wherever it appears. A
 * number beginning with `+` inside Arabic copy is otherwise reordered by the bidi
 * algorithm and the `+` jumps to the wrong end, so the reader is shown a number
 * that is not the number.
 */
export const CONTACT_PHONE = {
  display: '+20 111 171 3877',
  tel: '+201111713877',
  whatsapp: '201111713877',
} as const;

export const SOCIAL_LINKS: readonly ContactLink[] = [
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/ahmedyassin5821',
    display: 'ahmedyassin5821',
  },
  {
    label: 'GitHub',
    href: 'https://github.com/ahmedyassin5821-sketch',
    display: 'ahmedyassin5821-sketch',
  },
];
