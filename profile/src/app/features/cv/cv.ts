import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import {
  CV_CERTIFICATIONS,
  CV_DOWNLOAD_NAME,
  CV_EDUCATION,
  CV_EXPERIENCE,
  CV_FILE,
  CV_LANGUAGES,
  CV_PROFILE,
  CV_SKILLS,
  PROFESSIONAL_TITLE,
} from '@data/cv.data';
import { PROFILE_CONTENT } from '@data/profile.content';
import { PROJECTS, PROJECTS_SHIPPED } from '@data/projects.data';
import { PageHead } from '@shared/ui/page-head/page-head';
import { CvSection } from './cv-section/cv-section';

/**
 * The CV as a page.
 *
 * ## Why the PDF is not enough on its own
 *
 * A PDF behind a download button is invisible to search, unreadable on a phone
 * without pinching, impossible to link into, and hostile to a screen reader.
 * This page is the same record as real HTML — and the PDF is still one control
 * away, because a recruiter who wants a file wants the file.
 *
 * Both come from one place: `cv.data.ts` is a transcription of the shipped PDF,
 * and `CV_FILE` points at that exact document in `public/`. Nothing is written
 * from memory and nothing is summarised.
 *
 * ## The projects section
 *
 * The CV lists projects as a paragraph each. Repeating that here would be a
 * worse version of `/work`, which presents seven of them in full with the
 * business each one serves. So this section states the counts — both from data —
 * and links there instead.
 */
@Component({
  selector: 'app-cv',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHead, CvSection],
  templateUrl: './cv.html',
  styleUrl: './cv.scss',
})
export class Cv {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(PROFILE_CONTENT.cv);
  protected readonly title = localizedContent(PROFESSIONAL_TITLE);
  protected readonly profile = localizedContent(CV_PROFILE);

  protected readonly file = CV_FILE;
  protected readonly downloadName = CV_DOWNLOAD_NAME;

  protected readonly experience = computed(() =>
    resolveLocalized(CV_EXPERIENCE, this.direction.locale()),
  );
  protected readonly education = computed(() =>
    resolveLocalized(CV_EDUCATION, this.direction.locale()),
  );
  protected readonly certifications = computed(() =>
    resolveLocalized(CV_CERTIFICATIONS, this.direction.locale()),
  );
  protected readonly skills = computed(() =>
    resolveLocalized(CV_SKILLS, this.direction.locale()),
  );
  protected readonly languages = computed(() =>
    resolveLocalized(CV_LANGUAGES, this.direction.locale()),
  );

  /**
   * Both numbers from data.
   *
   * `{shipped}` is the career total and `{selected}` is what `/work` presents.
   * Neither is typed as a word anywhere, so the CV page cannot end up claiming a
   * different total from the rest of the site.
   */
  protected readonly projectsNote = computed(() =>
    this.c()
      .projectsNote.replace('{selected}', String(PROJECTS.length))
      .replace('{shipped}', String(PROJECTS_SHIPPED)),
  );
}
