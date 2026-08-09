import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { ProjectPlatform } from '@data/models/project.model';
import { HOME_CONTENT } from '@data/home.content';
import { PLATFORM_LABELS, projectsByPlatform } from '@data/projects.data';
import { ProjectSurface, ProjectSurfaceData } from '@shared/ui/project-surface/project-surface';

/**
 * A platform gate — acts 4, 5 and 6.
 *
 * One component, rendered three times with a different `platform`, rather than
 * three near-identical sections. The gates are the same structure by definition:
 * a platform name the camera passes through, then the work built on it. Writing
 * them separately would be three places to fix every future change.
 *
 * In the scene this is a typographic plane followed by that platform's project
 * planes; here it is the same information as text. Neither is a copy of the
 * other — they are two presentations of one dataset, and this one is the
 * accessible, indexable, always-present presentation.
 */
@Component({
  selector: 'app-act-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectSurface],
  templateUrl: './act-gate.html',
  styleUrl: './act-gate.scss',
})
export class ActGate {
  readonly platform = input.required<ProjectPlatform>();

  /** Editorial numeral — 01, 02, 03 — supplied by the stage. */
  readonly index = input<number>(0);

  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(HOME_CONTENT.gates);

  protected readonly label = computed(() =>
    resolveLocalized(PLATFORM_LABELS[this.platform()], this.direction.locale()),
  );

  protected readonly indexLabel = computed(() => String(this.index() + 1).padStart(2, '0'));

  /**
   * Localised once here, so `ProjectSurface` stays presentational and knows
   * nothing about languages.
   */
  protected readonly projects = computed<ProjectSurfaceData[]>(() => {
    const locale = this.direction.locale();

    return projectsByPlatform(this.platform()).map((project) => ({
      slug: project.slug,
      name: resolveLocalized(project.name, locale),
      platform: project.platform,
      summary: resolveLocalized(project.projectType, locale),
      role: resolveLocalized(project.role, locale),
      technology: project.technology,
      url: project.url,
      screenshot: project.cover
        ? {
            src: project.cover.src,
            srcset: project.cover.srcset,
            avif: project.cover.avif ?? null,
            width: project.cover.width,
            height: project.cover.height,
            alt: resolveLocalized(project.cover.alt, locale),
          }
        : null,
    }));
  });
}
