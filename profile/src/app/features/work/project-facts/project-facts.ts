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
 * reject — and did, the moment the identity triad was written inline there.
 *
 * ## Two variants, one component
 *
 * `identity` is the field / market / domain triad that opens the page: three
 * columns, ruled above and below, sitting inside the header. `build` is the
 * platform / role / theme / technologies set further down: two columns, one rule
 * above.
 *
 * They are the same object — a row of facts about the project — presented at two
 * weights, so they are one component rather than two stylesheets that would
 * drift the first time the hairline colour changed.
 */
@Component({
  selector: 'app-project-facts',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-facts.html',
  styleUrl: './project-facts.scss',
  host: {
    '[class]': "'facts--' + variant()",
  },
})
export class ProjectFacts {
  readonly facts = input.required<readonly ProjectFact[]>();

  /** `identity` opens the page; `build` sits below the cover. */
  readonly variant = input<'identity' | 'build'>('build');
}
