import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { HOME_CONTENT } from '@data/home.content';
import { PROJECTS } from '@data/projects.data';
import { WORK_CONTENT } from '@data/work.content';
import { ProjectLogo, ProjectLogoImage } from '@shared/ui/project-logo/project-logo';

interface BrandMark {
  readonly slug: string;
  /** The link's accessible name — "View Nader Coffee". */
  readonly viewLabel: string;
  readonly logo: ProjectLogoImage;
}

/**
 * The brand strip: the seven marks, drifting, after the corridor.
 *
 * ## Why it exists
 *
 * The corridor names each project one act at a time, and only while the reader is
 * scrolling through that act. Nothing on Home shows the *whole* set at rest. This
 * band does — as the clients' own artwork rather than as more of the portfolio's
 * own type, which is the one thing on the page that carries an identity other
 * than AY's.
 *
 * It is not a "trusted by" strip: it is titled, it links, and each mark leads to
 * that project's page.
 *
 * ## One source of truth
 *
 * Every name, route and logo comes from `PROJECTS`, in showcase order, so adding
 * or reordering a project changes this band with it. Nothing about a project is
 * written here.
 *
 * ## The loop is CSS, and the geometry is what makes it seamless
 *
 * The track holds the same row twice and animates one row's width. See the
 * stylesheet — the arithmetic is the whole trick, and it is the reason the items
 * carry a trailing margin instead of the track carrying a `gap`.
 *
 * `:hover` and `:focus-within` pause it with `animation-play-state`, which
 * suspends the animation where it stands and resumes from that exact position —
 * no JavaScript, no measured offset to restore, and no way for the two to
 * disagree.
 */
@Component({
  selector: 'app-brand-marquee',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ProjectLogo],
  templateUrl: './brand-marquee.html',
  styleUrl: './brand-marquee.scss',
})
export class BrandMarquee {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(HOME_CONTENT.marquee);

  /**
   * Two passes over the same row.
   *
   * The second is a visual duplicate: `aria-hidden`, and its links are removed
   * from the tab order so the keyboard walks seven brands rather than fourteen.
   * They stay clickable, because a logo the reader can see should be clickable.
   */
  protected readonly copies = [0, 1] as const;

  protected readonly brands = computed<BrandMark[]>(() => {
    const locale = this.direction.locale();
    // The same string the work index uses, so a brand is announced identically
    // in both places rather than in two hand-written variants.
    const template = resolveLocalized(WORK_CONTENT.a11y.viewProject, locale);

    return PROJECTS.map((project) => ({
      slug: project.slug,
      viewLabel: template.replace('{name}', resolveLocalized(project.name, locale)),
      logo: {
        src: project.logo.src,
        width: project.logo.width,
        height: project.logo.height,
      },
    }));
  });
}
