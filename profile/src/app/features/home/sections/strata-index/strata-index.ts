import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { PLATFORM_GROUPS } from '@data/projects.data';
import { RevealDirective } from '@shared/directives/reveal.directive';

/**
 * The three platforms, as an editorial index.
 *
 * Rows and rules rather than cards — three boxed cards side by side is the
 * single most template-like pattern available, and the brand system's whole
 * depth vocabulary is hairlines, not containers.
 *
 * Each row corresponds to one stratum in the visual: this is the section where
 * the claim "the mark is composed of these" is actually cashed out, so the
 * project counts are real numbers derived from the data rather than copy.
 */
@Component({
  selector: 'app-strata-index',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RevealDirective],
  templateUrl: './strata-index.html',
  styleUrl: './strata-index.scss',
})
export class StrataIndex {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(HOME_CONTENT.strata);

  protected readonly groups = computed(() =>
    PLATFORM_GROUPS.map((group, index) => ({
      platform: group.platform,
      label: group.label,
      summary: resolveLocalized(group.summary, this.direction.locale()),
      count: group.projects.length,
      index: String(index + 1).padStart(2, '0'),
      // Project names are proper nouns and stay Latin in both languages.
      names: group.projects.map((p) => p.name),
    })),
  );
}
