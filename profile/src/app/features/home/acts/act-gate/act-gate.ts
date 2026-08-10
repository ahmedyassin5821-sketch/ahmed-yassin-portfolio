import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { ProjectPlatform } from '@data/models/project.model';
import { HOME_CONTENT } from '@data/home.content';
import {
  PLATFORM_GROUPS,
  PLATFORM_LABELS,
  PROJECTS,
  projectsByPlatform,
} from '@data/projects.data';
import { ProjectFigure, ProjectFigureData } from './project-figure/project-figure';

/**
 * A platform gate — acts 4, 5 and 6.
 *
 * One component, rendered three times with a different `platform`, rather than
 * three near-identical sections. The gates are the same structure by definition:
 * a platform the camera passes through, then the work built on it.
 *
 * ## Composition, not a grid
 *
 * The first project of each platform leads at a larger size and the rest support
 * it, with the media side alternating. Six equal boxes two-across read as a CMS
 * listing — the eye finds no entry point and nothing signals that these are
 * *selected* pieces. An asymmetric composition gives each gate a subject.
 *
 * In the scene this same platform is a typographic plane the camera flies
 * through, followed by that platform's project planes. Neither is a copy of the
 * other; this one is the accessible, indexable, always-present presentation.
 */
@Component({
  selector: 'app-act-gate',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ProjectFigure],
  templateUrl: './act-gate.html',
  styleUrl: './act-gate.scss',
})
export class ActGate {
  readonly platform = input.required<ProjectPlatform>();

  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(HOME_CONTENT.gates);

  protected readonly label = computed(() =>
    resolveLocalized(PLATFORM_LABELS[this.platform()], this.direction.locale()),
  );

  /**
   * Where this platform's first project sits in the whole showcase.
   *
   * Numbering runs 01–07 across the entire selection rather than restarting at
   * each gate, so the numerals read as one curated sequence.
   */
  protected readonly offset = computed(() =>
    PROJECTS.findIndex((p) => p.platform === this.platform()),
  );

  /**
   * What this platform does for a business.
   *
   * Read from `PLATFORM_GROUPS` rather than authored here, so the gate, `/about`
   * and the `/work` category sections cannot say three different things about the
   * same platform.
   */
  protected readonly summary = computed(() => {
    const group = PLATFORM_GROUPS.find((g) => g.platform === this.platform());
    return group ? resolveLocalized(group.summary, this.direction.locale()) : '';
  });

  protected readonly countLabel = computed(() => {
    const total = projectsByPlatform(this.platform()).length;
    return this.c().countLabel.replace('{count}', String(total));
  });

  /**
   * Localised once here, so `ProjectFigure` stays presentational and knows
   * nothing about languages.
   */
  protected readonly projects = computed<ProjectFigureData[]>(() => {
    const locale = this.direction.locale();

    return projectsByPlatform(this.platform()).map((project) => {
      // "Shopify · Dashboard" — what it was built with, plus the one capability
      // worth calling out. Assembled here rather than stored, so a project that
      // gains a dashboard needs no copy change.
      const stack = [
        resolveLocalized(PLATFORM_LABELS[project.platform], locale),
        project.theme,
        project.dashboard ? this.c().dashboard : null,
      ]
        .filter(Boolean)
        .join(' · ');

      return {
        slug: project.slug,
        name: resolveLocalized(project.name, locale),
        // The industry, then where it trades. Two short lines that say what the
        // business is before the stack says how it was built.
        field: resolveLocalized(project.field, locale),
        market: resolveLocalized(project.market, locale),
        stack,
        url: project.url,
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
}
