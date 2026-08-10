import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface CvSectionEntry {
  readonly title: string;
  readonly organisation: string | null;
  readonly period: string;
  readonly points: readonly string[];
}

/**
 * One ruled section of the CV — experience, education, or certifications.
 *
 * All three are the same shape (a dated entry with an organisation and some
 * bullets), so they are one component rendered three times rather than three
 * near-identical blocks that would drift the first time one was restyled. It
 * also keeps `cv.scss` well inside the 4 kB per-component budget.
 *
 * The period is a `<time>`-adjacent fact but deliberately not a `<time>`
 * element: the CV prints ranges like "02/2025 – present", which has no valid
 * datetime representation, and a half-marked-up list is worse than a consistent
 * plain one.
 */
@Component({
  selector: 'app-cv-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cv-section.html',
  styleUrl: './cv-section.scss',
})
export class CvSection {
  readonly heading = input.required<string>();
  readonly entries = input.required<readonly CvSectionEntry[]>();

  /** Used for the section's `aria-labelledby`, so each heading is unique. */
  readonly sectionId = input.required<string>();
}
