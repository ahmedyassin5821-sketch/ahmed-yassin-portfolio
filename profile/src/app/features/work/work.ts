import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { PLATFORM_LABELS, PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { WorkPreview, WorkPreviewData } from './work-preview/work-preview';
import { WorkRow, WorkRowData } from './work-row/work-row';

/**
 * The work index — an editorial archive, not a grid.
 *
 * Seven oversized numbered rows beside a sticky pane that shows whichever
 * project the reader is on. The previous treatment gave each project an
 * identical bordered card two-across, which made a curated selection look like a
 * database listing.
 *
 * Deliberately *not* the Home showcase. Home presents plates inside a fixed
 * viewport act; this is a scrolling archive, so it reads as a list of names with
 * the work held beside it.
 *
 * Localisation happens once here, so both child components stay presentational
 * and know nothing about languages.
 */
@Component({
  selector: 'app-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkRow, WorkPreview],
  templateUrl: './work.html',
  styleUrl: './work.scss',
})
export class Work {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(WORK_CONTENT);

  /**
   * Both numbers derived from data.
   *
   * `{shipped}` is the career total and `{selected}` is what is presented here.
   * Rendering the array length alone would read as "seven projects, total",
   * which is false — this is a curated selection.
   */
  protected readonly countLabel = computed(() =>
    this.c()
      .index.count.replace('{shipped}', String(PROJECTS_SHIPPED))
      .replace('{selected}', String(PROJECTS.length)),
  );

  /**
   * Which project the preview pane is showing.
   *
   * Defaults to the first, so the pane shows real work before any interaction
   * and on the server — it is an enhancement, never a blank slot waiting for JS.
   */
  protected readonly activeSlug = signal(PROJECTS[0].slug);

  private readonly resolved = computed(() => {
    const locale = this.direction.locale();

    return PROJECTS.map((project) => {
      // "Magento · Porto" — assembled here rather than stored, so a project that
      // gains a dashboard or a theme needs no copy change.
      const stack = [
        resolveLocalized(PLATFORM_LABELS[project.platform], locale),
        project.theme,
        project.dashboard ? resolveLocalized(WORK_CONTENT.labels.dashboard, locale) : null,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        slug: project.slug,
        name: resolveLocalized(project.name, locale),
        logo: {
          src: project.logo.src,
          width: project.logo.width,
          height: project.logo.height,
        },
        field: resolveLocalized(project.field, locale),
        // "Egypt · Coffee e-commerce" — where it trades and what kind of product
        // it is, in one line under the industry.
        context: [
          resolveLocalized(project.market, locale),
          resolveLocalized(project.domain, locale),
        ].join(' · '),
        stack,
        // Derived from `url` rather than stored, so the label and the link can
        // never disagree. NAS HR is internal; everything else is public.
        linkStatus: project.url ? ('live' as const) : ('private' as const),
        image: {
          src: project.cover.src,
          srcset: project.cover.srcset,
          width: project.cover.width,
          height: project.cover.height,
          alt: resolveLocalized(project.cover.alt, locale),
        },
      };
    });
  });

  protected readonly rows = computed<WorkRowData[]>(() => this.resolved());

  /** Passed to every row, so the label set is defined once. */
  protected readonly statusLabels = computed(() => {
    const a = this.c().actions;
    return { live: a.live, private: a.private };
  });

  protected readonly previews = computed<WorkPreviewData[]>(() =>
    this.resolved().map(({ slug, name, field, image }) => ({ slug, name, field, image })),
  );

  protected setActive(slug: string): void {
    this.activeSlug.set(slug);
  }
}
