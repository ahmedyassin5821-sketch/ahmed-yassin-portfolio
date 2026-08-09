import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { PLATFORM_LABELS, PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { ProjectCard, ProjectCardData } from './project-card/project-card';

/**
 * The work index.
 *
 * A grid of six projects, each understandable at a glance: logo, platform, role,
 * technologies, and a real screenshot. No case studies, no walls of text — the
 * detail page is one click away for anyone who wants more.
 *
 * Localisation happens once, here, so `ProjectCard` stays presentational and
 * knows nothing about languages.
 */
@Component({
  selector: 'app-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectCard, RevealDirective],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(WORK_CONTENT);

  /**
   * Both numbers derived from data, so the copy cannot drift.
   *
   * `{shipped}` is the career total and `{selected}` is what is presented here.
   * Rendering only the array length would have read as "seven projects, total".
   */
  protected readonly countLabel = computed(() =>
    this.c()
      .index.count.replace('{shipped}', String(PROJECTS_SHIPPED))
      .replace('{selected}', String(PROJECTS.length)),
  );

  protected readonly projects = computed<ProjectCardData[]>(() => {
    const locale = this.direction.locale();

    return PROJECTS.map((project) => ({
      slug: project.slug,
      name: resolveLocalized(project.name, locale),
      platform: project.platform,
      platformLabel: resolveLocalized(PLATFORM_LABELS[project.platform], locale),
      role: resolveLocalized(project.role, locale),
      summary: resolveLocalized(project.summary, locale),
      projectType: resolveLocalized(project.projectType, locale),
      technology: project.technology,
      dashboard: project.dashboard,
      isPrivate: project.url === null,
      logo: project.logo
        ? {
            src: project.logo.src,
            width: project.logo.width,
            height: project.logo.height,
            alt: resolveLocalized(project.logo.alt, locale),
          }
        : null,
      // null while a project's imagery has not been supplied — the card renders
      // the placeholder frame rather than an empty box or a borrowed image.
      cover: project.cover
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

  /** Per-card view label, so each link announces which project it opens. */
  protected readonly viewLabel = computed(() => this.c().a11y.viewProject);

  /**
   * The first two cards are the only ones that can be above the fold at any
   * supported width, so they load eagerly and everything else defers.
   */
  protected isPriority(index: number): boolean {
    return index < 2;
  }
}
