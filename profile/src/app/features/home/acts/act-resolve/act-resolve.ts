import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { localizedContent } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { PROJECTS_SHIPPED } from '@data/projects.data';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { Icon } from '@shared/ui/icon/icon';

/**
 * The handoff to `/work`.
 *
 * Closes the narrative on a real number rather than a slogan. The number is the
 * career total, not the length of the showcase array — the projects on this page
 * are a selection, and counting them here would have understated the work.
 */
@Component({
  selector: 'app-act-resolve',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, RevealDirective],
  templateUrl: './act-resolve.html',
  styleUrl: './act-resolve.scss',
})
export class ActResolve {
  protected readonly c = localizedContent(HOME_CONTENT.transition);

  /**
   * The headline, with the career total substituted in.
   *
   * Derived rather than written into the copy so the sentence cannot drift from
   * the data. Latin digits in both languages, per ADR-016.
   */
  protected readonly title = computed(() =>
    this.c().title.replace('{shipped}', String(PROJECTS_SHIPPED)),
  );
}
