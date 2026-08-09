import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ProjectFact {
  readonly label: string;
  readonly value: string;
  /** Latin product names are bidi-isolated so Arabic copy does not reorder them. */
  readonly isolate?: boolean;
}

/**
 * A project's facts, as a definition list.
 *
 * It is a list of label/value pairs, so it is marked up as one rather than as
 * styled paragraphs. Its own component for the same two reasons as
 * `project-gallery`: a self-contained state-free contract, and keeping its CSS
 * out of `work-detail.scss`, which the 4 kB per-component budget would otherwise
 * reject.
 */
@Component({
  selector: 'app-project-facts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-facts.html',
  styleUrl: './project-facts.scss',
})
export class ProjectFacts {
  readonly facts = input.required<readonly ProjectFact[]>();
}
