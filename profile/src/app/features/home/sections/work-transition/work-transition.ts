import { ChangeDetectionStrategy, Component, computed } from '@angular/core';
import { RouterLink } from '@angular/router';

import { localizedContent } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { PROJECTS } from '@data/projects.data';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { Icon } from '@shared/ui/icon/icon';

/**
 * The handoff to `/work`.
 *
 * Closes the narrative on a real number rather than a slogan: the count comes
 * from the data, so it cannot drift from the projects actually listed.
 */
@Component({
  selector: 'app-work-transition',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Icon, RevealDirective],
  templateUrl: './work-transition.html',
  styleUrl: './work-transition.scss',
})
export class WorkTransition {
  protected readonly c = localizedContent(HOME_CONTENT.transition);

  /**
   * The headline, with the real project count substituted in.
   *
   * Derived rather than written into the copy so the sentence cannot drift from
   * the data. Latin digits in both languages, per ADR-016.
   */
  protected readonly title = computed(() =>
    this.c().title.replace('{count}', String(PROJECTS.length)),
  );
}
