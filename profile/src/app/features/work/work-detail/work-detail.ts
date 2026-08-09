import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { PLATFORM_LABELS, projectBySlug, projectNeighbours } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { Icon } from '@shared/ui/icon/icon';
import { MediaPlaceholder } from '@shared/ui/media-placeholder/media-placeholder';
import { TextLink } from '@shared/ui/text-link/text-link';
import { ProjectLogo } from '../project-logo/project-logo';
import { ProjectNav } from '../project-nav/project-nav';

/**
 * One project.
 *
 * Concise by design: identity, a sentence, the facts as a definition list, the
 * screenshots, an outbound link when there is one, and previous/next. No
 * narrative sections, no "the challenge / the solution" scaffolding.
 *
 * ## Resolution happens in a computed, not a resolver
 *
 * `slug` arrives as a route input through `withComponentInputBinding()`, and the
 * project is looked up from the static dataset. There is no async, so there is
 * nothing to wait for and nothing to guard — which is also why every one of
 * these pages prerenders to real HTML.
 */
@Component({
  selector: 'app-work-detail',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RevealDirective,
    Icon,
    MediaPlaceholder,
    TextLink,
    ProjectLogo,
    ProjectNav,
  ],
  templateUrl: './work-detail.html',
  styleUrl: './work-detail.scss',
})
export class WorkDetail {
  /** Bound from the route path by `withComponentInputBinding()`. */
  readonly slug = input.required<string>();

  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(WORK_CONTENT);

  /**
   * `undefined` for an unknown slug.
   *
   * Cannot happen through navigation — every slug is prerendered and the router
   * has no wildcard into this component — but the template still guards it
   * rather than dereferencing a missing project and throwing during SSR.
   */
  protected readonly project = computed(() => projectBySlug(this.slug()));

  protected readonly content = computed(() => {
    const project = this.project();
    if (!project) return null;

    const locale = this.direction.locale();

    return {
      name: resolveLocalized(project.name, locale),
      platformLabel: resolveLocalized(PLATFORM_LABELS[project.platform], locale),
      role: resolveLocalized(project.role, locale),
      summary: resolveLocalized(project.summary, locale),
      technology: project.technology,
      theme: project.theme,
      dashboard: project.dashboard,
      url: project.url,
      isPrivate: project.url === null,
      logo: project.logo
        ? {
            src: project.logo.src,
            width: project.logo.width,
            height: project.logo.height,
            alt: resolveLocalized(project.logo.alt, locale),
          }
        : null,
      projectType: resolveLocalized(project.projectType, locale),
      // null until imagery is supplied; the template renders the empty frame.
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
      screenshots: project.screenshots.map((shot) => ({
        src: shot.src,
        srcset: shot.srcset,
        width: shot.width,
        height: shot.height,
        alt: resolveLocalized(shot.alt, locale),
      })),
    };
  });

  protected readonly neighbours = computed(() => {
    const found = projectNeighbours(this.slug());
    if (!found) return null;

    const locale = this.direction.locale();
    return {
      previous: {
        slug: found.previous.slug,
        name: resolveLocalized(found.previous.name, locale),
      },
      next: {
        slug: found.next.slug,
        name: resolveLocalized(found.next.name, locale),
      },
    };
  });

  /**
   * The cover spans the content column; gallery shots do too. One `sizes` value
   * serves both because they share a measure.
   */
  protected readonly sizes = '(min-width: 64rem) 64rem, 100vw';

  protected fill(template: string, name: string): string {
    return template.replace('{name}', name);
  }
}
