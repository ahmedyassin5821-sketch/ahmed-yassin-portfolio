import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { localizedContent, resolveLocalized } from '@core/i18n/localized';
import { CV_LANGUAGES, PROFESSIONAL_TITLE } from '@data/cv.data';
import { PROFILE_CONTENT } from '@data/profile.content';
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  SOCIAL_LINKS,
} from '../../layout/footer/contact-links';
import { PageHead } from '@shared/ui/page-head/page-head';
import { TextLink } from '@shared/ui/text-link/text-link';
import { ContactPhone } from './contact-phone/contact-phone';

/**
 * Contact.
 *
 * ## Why there is no form
 *
 * A form needs an endpoint. Rendering the fields before one exists ships a
 * control that accepts what someone typed and silently discards it — strictly
 * worse than not offering it, because the sender believes they have written to
 * him. The page states the address instead, which also lets people attach files
 * and keeps a copy in their own sent mail.
 *
 * ## Reads the CV
 *
 * Title and languages come from `cv.data.ts`, and the address, phone and profiles
 * from the same `contact-links.ts` the footer uses. Nothing on this page is a
 * second copy of a fact that lives somewhere else.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, PageHead, TextLink, ContactPhone],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private readonly direction = inject(DirectionService);

  protected readonly c = localizedContent(PROFILE_CONTENT.contact);
  protected readonly role = localizedContent(PROFESSIONAL_TITLE);

  protected readonly email = CONTACT_EMAIL;
  protected readonly location = CONTACT_LOCATION;
  protected readonly profiles = SOCIAL_LINKS;

  /** "Arabic (native), English (fluent)" — assembled from the CV. */
  protected readonly languages = computed(() =>
    resolveLocalized(CV_LANGUAGES, this.direction.locale())
      .map((language) => `${language.name} — ${language.level}`)
      .join(' · '),
  );
}
