/**
 * Icon path data.
 *
 * Drawn on a 24×24 grid with a 20px live area, to the geometry in
 * BRAND-SYSTEM.md §7: 1.5px stroke, SQUARE caps, MITER joins, zero corner
 * radius. Lucide was the reference for proportion and metaphor, but Lucide ships
 * round caps and rounded corners, which contradict the monogram's flat
 * terminals — so these are redrawn rather than restyled. Overriding Lucide's
 * caps in CSS leaves its rounded *path corners* intact and looks half-converted.
 *
 * Keep this set small. Every icon here ships; nothing is loaded on demand.
 */
export const ICON_PATHS = {
  // Directional — these flip in RTL.
  'arrow-right': 'M4 12h16M13 5l7 7-7 7',
  'arrow-left': 'M20 12H4M11 5l-7 7 7 7',
  'chevron-right': 'M9 4l8 8-8 8',
  'chevron-left': 'M15 4l-8 8 8 8',
  'external-link': 'M14 4h6v6M20 4L10 14M18 14v6H4V6h6',

  // Non-directional — these must NOT flip.
  'chevron-down': 'M4 9l8 8 8-8',
  'chevron-up': 'M4 15l8-8 8 8',
  close: 'M5 5l14 14M19 5L5 19',
  menu: 'M3 6h18M3 12h18M3 18h18',
  check: 'M4 12l5 5L20 6',
  copy: 'M9 9h11v11H9zM15 5H4v11h1',
  mail: 'M2 5h20v14H2zM2 5l10 8 10-8',
  search: 'M3 10a7 7 0 1114 0 7 7 0 01-14 0zM15 15l6 6',

  /**
   * Status glyphs. Load-bearing, not decorative: the palette is monochrome, so
   * these are what actually distinguish error from success. WCAG 1.4.1 forbids
   * colour as the sole carrier of meaning — here there is no colour to rely on
   * at all, which makes the icon mandatory.
   */
  'alert-triangle': 'M12 3L2 20h20L12 3zM12 9v5M12 17.5v.5',
  'alert-circle': 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v5M12 16.5v.5',
  'check-circle': 'M12 3a9 9 0 100 18 9 9 0 000-18zM8 12l3 3 5-6',
  info: 'M12 3a9 9 0 100 18 9 9 0 000-18zM12 7.5v.5M12 11v6',
} as const;

export type IconName = keyof typeof ICON_PATHS;

/**
 * Icons whose meaning is tied to reading direction, so they mirror in RTL.
 *
 * Everything else must not: `check`, `close`, and `menu` are symmetric or
 * absolute, and mirroring `chevron-down` would point it up. Vertical chevrons
 * are excluded on purpose — a common bug is flipping every chevron.
 */
export const RTL_MIRRORED_ICONS: ReadonlySet<IconName> = new Set<IconName>([
  'arrow-right',
  'arrow-left',
  'chevron-right',
  'chevron-left',
  'external-link',
]);
