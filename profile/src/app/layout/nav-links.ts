export interface NavLink {
  /** Router path, without a leading slash. */
  readonly path: string;
  /** Visible label. Becomes an i18n message when compile-time i18n lands. */
  readonly label: string;
}

/**
 * Primary navigation, single source of truth.
 *
 * Shared as DATA between the desktop header and the mobile panel — deliberately
 * not as a shared component. The two presentations are genuinely different (a
 * mono label row versus a display-scale stack), so a single component would need
 * variant flags and would drift toward being the desktop nav shrunk down, which
 * is the outcome the mobile-navigation brief rules out.
 *
 * Order is information hierarchy: work first because it is what a recruiter or
 * client came to see; contact last because it is the action taken after looking.
 */
export const NAV_LINKS: readonly NavLink[] = [
  { path: 'work', label: 'Work' },
  { path: 'about', label: 'About' },
  { path: 'cv', label: 'CV' },
  { path: 'contact', label: 'Contact' },
];
