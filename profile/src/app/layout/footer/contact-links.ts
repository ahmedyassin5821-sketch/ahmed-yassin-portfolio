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
 * The CV also lists a personal mobile number. It is deliberately left out:
 * publishing a mobile on a public page invites abuse, and email plus the planned
 * contact form already cover the need. Add it here if that trade is not wanted.
 *
 * Extend this array as further profiles are confirmed. The footer renders
 * whatever is present, so no template change is needed.
 */
export const CONTACT_EMAIL = 'ahmedyassin5821@gmail.com';

export const CONTACT_LOCATION = 'Cairo, Egypt';

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
