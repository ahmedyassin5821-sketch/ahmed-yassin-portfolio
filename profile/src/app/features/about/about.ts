import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { CV_EXPERIENCE, CV_PROFILE, PROFESSIONAL_TITLE } from '@data/cv.data';
import { PROFILE_CONTENT } from '@data/profile.content';
import { PLATFORM_GROUPS, PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { CONTACT_LOCATION } from '../../layout/footer/contact-links';
import { PageHead } from '@shared/ui/page-head/page-head';

/**
 * About.
 *
 * Reads the CV rather than paraphrasing it. The profile paragraph is the CV's
 * own; "what I work on" is the three platform groups the whole site is organised
 * around; "now" is the current role, taken from the first experience entry
 * instead of being typed out again — so when the CV changes, this page does.
 *
 * Deliberately short. Someone who wants the full record follows the link to the
 * CV, which is the complete document; duplicating it here would give the site
 * two biographies to keep in step, and one of them would eventually be wrong.
 */
@Component({
  selector: 'app-about',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHead],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(PROFILE_CONTENT.about);
  protected readonly role = localizedContent(PROFESSIONAL_TITLE);
  protected readonly profile = localizedContent(CV_PROFILE);

  protected readonly location = CONTACT_LOCATION;

  /**
   * Both counts from data — the career total and the size of the showcase.
   * Typing either as a word here is how a page ends up claiming seven projects.
   */
  protected readonly workNote = computed(() =>
    this.c()
      .workNote.replace('{selected}', String(PROJECTS.length))
      .replace('{shipped}', String(PROJECTS_SHIPPED)),
  );

  /** The three platform groups, each with the work it covers. */
  protected readonly practice = computed(() =>
    PLATFORM_GROUPS.map((group) => ({
      label: group.label,
      summary: resolveLocalized(group.summary, this.direction.locale()),
      count: group.projects.length,
    })),
  );

  /**
   * The current role, from the CV's first experience entry.
   *
   * Read rather than restated: a second copy of "Front-End Developer at 2B" is a
   * second thing to remember to update.
   */
  protected readonly now = computed(() => {
    const current = resolveLocalized(CV_EXPERIENCE[0], this.direction.locale());
    return { title: current.title, organisation: current.organisation, period: current.period };
  });
}
