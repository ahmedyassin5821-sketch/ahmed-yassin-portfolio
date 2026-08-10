import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { ProjectAtmosphere, ProjectPlatform } from '@data/models/project.model';
import {
  PLATFORM_GROUPS,
  PLATFORM_LABELS,
  PROJECTS,
  PROJECTS_SHIPPED,
} from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { AtmosphereDirective } from '@shared/directives/atmosphere.directive';
import { WorkPreview, WorkPreviewData } from './work-preview/work-preview';
import { WorkRow, WorkRowData } from './work-row/work-row';

/**
 * A row plus the three things this page needs that the row itself does not.
 *
 * `index` is the position in the whole showcase, carried alongside the row rather
 * than taken from the template's `$index` — which now restarts inside every
 * category and would have numbered the Angular group 01, 02 again.
 */
interface IndexedRow extends WorkRowData {
  readonly index: number;
  readonly platform: ProjectPlatform;
  readonly atmosphere: ProjectAtmosphere;
}

interface WorkCategory {
  readonly platform: ProjectPlatform;
  /** "Shopify" — a product name, Latin in both languages. */
  readonly label: string;
  readonly summary: string;
  readonly rows: readonly IndexedRow[];
}

/**
 * The work index — an editorial archive, not a grid.
 *
 * Oversized numbered rows beside a sticky pane that shows whichever project the
 * reader is on. The previous treatment gave each project an identical bordered
 * card two-across, which made a curated selection look like a database listing.
 *
 * ## Grouped by platform, Shopify first
 *
 * The rows are gathered under three category headings in the order `PROJECTS` is
 * written in: Shopify, then Angular, then Magento. The numerals still run 01–07
 * across the whole selection — a project keeps its number here, on Home and on its
 * own page — but the heading is what carries the hierarchy, and the numbering
 * follows the grouping rather than fighting it.
 *
 * ## One active project, three consequences
 *
 * `active` is the only interaction state on this page. It drives the preview pane,
 * the row's own emphasis and logo, and the page's atmosphere — from pointer and
 * keyboard alike, because the row raises the same event for both. There is
 * deliberately no second signal: two would eventually disagree.
 *
 * `null` means the reader is not on any project. The pane still shows the first
 * project (real work, not an empty frame, including on the server) but the page
 * stays on neutral paper — the brand colour is something you enter, so it must not
 * already be there when the page loads.
 *
 * Localisation happens once here, so both child components stay presentational
 * and know nothing about languages.
 */
@Component({
  selector: 'app-work',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [WorkRow, WorkPreview, AtmosphereDirective],
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
   * The last project the reader was on. `null` before any interaction.
   *
   * Outlives leaving the list on purpose: the pane keeps showing what was last
   * pointed at rather than snapping back to the first project, which would undo
   * the reader's own action the moment they moved to read it.
   */
  protected readonly active = signal<string | null>(null);

  /**
   * Whether the pointer or the keyboard is currently *inside* the index.
   *
   * The second half of the same interaction, not a second source of truth about
   * which project: `active` answers "which", this answers "still there". The
   * atmosphere and the dimming need the second question — the brand colour is
   * something the reader is inside, so it has to leave when they do — while the
   * pane needs only the first.
   */
  protected readonly engaged = signal(false);

  private readonly resolved = computed<IndexedRow[]>(() => {
    const locale = this.direction.locale();

    return PROJECTS.map((project, index) => {
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
        /**
         * Position in the whole showcase, not within its category.
         *
         * Assigned here rather than from the template's `$index`, which now
         * restarts inside each category section and would have numbered the
         * Angular group 01, 02 again.
         */
        index,
        platform: project.platform,
        atmosphere: project.atmosphere,
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
        // What Ahmed was on it. Stated on the index and not only on the detail
        // page, because "who built what" is part of placing the work.
        role: resolveLocalized(project.role, locale),
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

  /**
   * The rows, grouped under their platform.
   *
   * Built from `PLATFORM_GROUPS` so the order and the copy are the data's, not
   * this component's.
   */
  protected readonly categories = computed<WorkCategory[]>(() => {
    const locale = this.direction.locale();
    const rows = this.resolved();

    return PLATFORM_GROUPS.map((group) => ({
      platform: group.platform,
      label: group.label,
      summary: resolveLocalized(group.summary, locale),
      rows: rows.filter((row) => row.platform === group.platform),
    }));
  });

  /** Passed to every row, so the label set is defined once. */
  protected readonly statusLabels = computed(() => {
    const a = this.c().actions;
    return { live: a.live, private: a.private };
  });

  protected readonly previews = computed<WorkPreviewData[]>(() =>
    this.resolved().map(({ slug, name, field, logo, image }) => ({
      slug,
      name,
      field,
      logo,
      image,
    })),
  );

  /**
   * What the pane shows: the active project, or the first before any interaction.
   *
   * Separate from `active` on purpose — the pane must never be empty, and the
   * page must never be pre-tinted.
   */
  protected readonly previewSlug = computed(() => this.active() ?? PROJECTS[0].slug);

  /** `null` whenever the reader is not inside the index. */
  protected readonly atmosphere = computed<ProjectAtmosphere | null>(() => {
    if (!this.engaged()) return null;
    const slug = this.active();
    return slug ? (this.resolved().find((row) => row.slug === slug)?.atmosphere ?? null) : null;
  });

  protected setActive(slug: string): void {
    this.active.set(slug);
    this.engaged.set(true);
  }

  /** The pointer left the whole index — not merely one row for the next. */
  protected release(): void {
    this.engaged.set(false);
  }

  /**
   * Focus left the index.
   *
   * `focusout` fires on every hop between rows too, so the new target has to be
   * checked: without this, tabbing from row 1 to row 2 would drop to neutral and
   * come straight back, flashing the page on every keystroke.
   */
  protected releaseFocus(event: FocusEvent): void {
    const next = event.relatedTarget;
    const host = event.currentTarget as HTMLElement | null;
    if (!host || !(next instanceof Node) || !host.contains(next)) this.engaged.set(false);
  }
}
