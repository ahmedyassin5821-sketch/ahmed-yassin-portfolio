import { ChangeDetectionStrategy, Component } from '@angular/core';

import { localizedContent } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { PROJECTS_SHIPPED } from '@data/projects.data';

/**
 * Act 3 — the scale of the work, stated before any single project is named.
 *
 * The numeral is the career total, not the length of the showcase array. The
 * projects that follow are a selection, and counting them here would have
 * claimed seven projects total.
 *
 * When the scene is running, the same numeral also exists as a texture plane the
 * camera passes. This DOM copy is then the accessible one — it is never removed,
 * only visually suppressed, so the figure is always readable as text.
 */
@Component({
  selector: 'app-act-count',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './act-count.html',
  styleUrl: './act-count.scss',
})
export class ActCount {
  protected readonly c = localizedContent(HOME_CONTENT.count);

  /** Latin digits in both languages, per ADR-016. */
  protected readonly shipped = `${PROJECTS_SHIPPED}+`;
}
