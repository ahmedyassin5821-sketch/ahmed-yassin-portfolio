import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { PLATFORM_LABELS, PROJECTS, projectBySlug, projectNeighbours } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { AtmosphereDirective } from '@shared/directives/atmosphere.directive';
import { Icon } from '@shared/ui/icon/icon';
import { TextLink } from '@shared/ui/text-link/text-link';
import { ProjectFacts, ProjectFact } from '../project-facts/project-facts';
import { ProjectGallery } from '../project-gallery/project-gallery';
import { ProjectNav } from '../project-nav/project-nav';
import { ProjectSculpture } from '../project-sculpture/project-sculpture';

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
    Icon,
    TextLink,
    AtmosphereDirective,
    ProjectFacts,
    ProjectGallery,
    ProjectNav,
    // Used only inside a @defer block, which is what keeps it — and `three` —
    // out of this route's chunk.
    ProjectSculpture,
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

  /**
   * Position in the whole showcase, shown as an editorial numeral.
   *
   * Runs 01–07 across the selection, the same sequence the index and the Home
   * gates use, so a project keeps its number wherever it appears.
   */
  protected readonly indexLabel = computed(() => {
    const position = PROJECTS.findIndex((p) => p.slug === this.slug());
    return position < 0 ? '' : String(position + 1).padStart(2, '0');
  });

  protected readonly content = computed(() => {
    const project = this.project();
    if (!project) return null;

    const locale = this.direction.locale();

    return {
      name: resolveLocalized(project.name, locale),
      platformLabel: resolveLocalized(PLATFORM_LABELS[project.platform], locale),
      role: resolveLocalized(project.role, locale),
      // `null` where the project's team is genuinely not known. The row is then
      // omitted rather than filled with an estimate.
      team: project.team ? resolveLocalized(project.team, locale) : null,
      contribution: resolveLocalized(project.contribution, locale),
      sculpture: project.sculpture,
      // The business, ahead of anything technical.
      market: resolveLocalized(project.market, locale),
      field: resolveLocalized(project.field, locale),
      domain: resolveLocalized(project.domain, locale),
      brief: resolveLocalized(project.brief, locale),
      technologies: project.technologies,
      theme: project.theme,
      dashboard: project.dashboard,
      url: project.url,
      isPrivate: project.url === null,
      // "Magento · Porto · Dashboard" — one scannable line, assembled here so a
      // project that gains a theme or a dashboard needs no copy change.
      stack: [
        resolveLocalized(PLATFORM_LABELS[project.platform], locale),
        project.theme,
        project.dashboard ? resolveLocalized(WORK_CONTENT.labels.dashboard, locale) : null,
      ]
        .filter(Boolean)
        .join(' · '),
      cover: {
        src: project.cover.src,
        srcset: project.cover.srcset,
        avif: project.cover.avif ?? null,
        width: project.cover.width,
        height: project.cover.height,
        alt: resolveLocalized(project.cover.alt, locale),
      },
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
   * What the business is — field, market, domain.
   *
   * Deliberately the first thing on the page, above any technology: a reader
   * should be able to say what this project *is* before a platform is named.
   */
  protected readonly identity = computed<ProjectFact[]>(() => {
    const p = this.content();
    if (!p) return [];

    const labels = this.c().labels;
    return [
      { label: labels.field, value: p.field },
      { label: labels.market, value: p.market },
      { label: labels.domain, value: p.domain },
    ];
  });

  /**
   * Ahmed's part in it — role, the project's team, his contribution.
   *
   * Its own block, above the build facts, because the reader's questions arrive in
   * that order: what is this, who did what, how was it made. Folding the role into
   * the technology list files a responsibility under tooling.
   *
   * The team row is present only where the real composition is known. It is
   * labelled "Project team", not "Team" — beside one person's name the shorter word
   * reads as *his* team, which is a claim nobody made.
   */
  protected readonly roleFacts = computed<ProjectFact[]>(() => {
    const p = this.content();
    if (!p) return [];

    const labels = this.c().labels;
    return [
      { label: labels.role, value: p.role },
      ...(p.team ? [{ label: labels.team, value: p.team }] : []),
      { label: labels.contribution, value: p.contribution, wide: true },
    ];
  });

  /**
   * How it was built, assembled once here.
   *
   * Market, field and domain deliberately do *not* appear: they identify the
   * business and belong in the header, above the fold, before any technology is
   * named. Nor does the role, which now has its own block above this one.
   *
   * Technologies join into one line rather than a list, matching how the index
   * and the Home gates present a stack — the reader scans one string instead of
   * a column of single words.
   */
  protected readonly facts = computed<ProjectFact[]>(() => {
    const p = this.content();
    if (!p) return [];

    const labels = this.c().labels;
    return [
      { label: labels.platform, value: p.platformLabel, isolate: true },
      ...(p.theme ? [{ label: labels.theme, value: p.theme, isolate: true }] : []),
      {
        label: labels.technologies,
        value: [...p.technologies, p.dashboard ? labels.dashboard : null]
          .filter(Boolean)
          .join(' · '),
        isolate: true,
      },
    ];
  });

  /**
   * The project's atmosphere, active from first paint.
   *
   * Never `null` here: arriving on `/work/designed-by-g` *is* entering that brand,
   * so there is nothing to wait for. On `/work` the same directive takes `null`
   * until the reader hovers or focuses a row.
   */
  protected readonly atmosphere = computed(() => this.project()?.atmosphere ?? null);

  /**
   * The cover spans the content column; gallery shots do too. One `sizes` value
   * serves both because they share a measure.
   */
  protected readonly sizes = '(min-width: 64rem) 64rem, 100vw';

  protected fill(template: string, name: string): string {
    return template.replace('{name}', name);
  }
}
