import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface ProjectFact {
  readonly label: string;
  readonly value: string;
  /** Latin product names are bidi-isolated so Arabic copy does not reorder them. */
  readonly isolate?: boolean;
  /**
   * Spans every column.
   *
   * For a value that is a sentence rather than a phrase — the contribution line —
   * which in a half-width column wraps to four ragged lines beside a two-word
   * role.
   */
  readonly wide?: boolean;
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
 * ## Three variants, one component
 *
 * `identity` is the field / market / domain triad that opens the page: three
 * columns, ruled above and below, sitting inside the header. `role` is what
 * Ahmed's part in it was — role, the project's team where it is known, and his
 * contribution. `build` is the platform / theme / technologies set: two columns,
 * one rule above.
 *
 * They are the same object — a row of facts about the project — presented at three
 * weights, so they are one component rather than three stylesheets that would
 * drift the first time the hairline colour changed.
 *
 * `role` is separated from `build` on purpose, and it is not a styling decision:
 * what a project *is* and what one person's part in it *was* are different claims,
 * and folding "Front-End Developer" into a list beside "Magento 2, PHTML, LESS"
 * files a responsibility under tooling.
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

  /** `identity` opens the page, `role` follows it, `build` comes after. */
  readonly variant = input<'identity' | 'role' | 'build'>('build');
}
