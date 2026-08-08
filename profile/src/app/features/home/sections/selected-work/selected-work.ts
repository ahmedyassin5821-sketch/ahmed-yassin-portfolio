import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { FEATURED_PROJECTS } from '@data/projects.data';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { ProjectSurface, ProjectSurfaceData } from '@shared/ui/project-surface/project-surface';

/**
 * Selected work.
 *
 * A *selection*, not the archive — Home shows the featured subset and hands off
 * to `/work`. This is a traditional portfolio, so each project gets a surface
 * and a sentence, not a case study.
 *
 * Localisation happens here, once, so `ProjectSurface` stays a presentational
 * component that knows nothing about languages.
 */
@Component({
  selector: 'app-selected-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectSurface, RevealDirective],
  templateUrl: './selected-work.html',
  styleUrl: './selected-work.scss',
})
export class SelectedWork {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(HOME_CONTENT.work);

  protected readonly projects = computed<ProjectSurfaceData[]>(() => {
    const locale = this.direction.locale();

    return FEATURED_PROJECTS.map((project) => ({
      slug: project.slug,
      name: project.name,
      platform: project.platform,
      summary: resolveLocalized(project.summary, locale),
      role: project.role ? resolveLocalized(project.role, locale) : null,
      technology: project.technology,
      url: project.url,
      screenshot: project.screenshot
        ? {
            src: project.screenshot.src,
            alt: project.screenshot.alt ? resolveLocalized(project.screenshot.alt, locale) : null,
          }
        : null,
    }));
  });
}
