import { ChangeDetectionStrategy, Component } from '@angular/core';

import { localizedContent } from '@core/i18n/localized';
import { PROFILE_CONTENT } from '@data/profile.content';
import { CONTACT_PHONE } from '../../../layout/footer/contact-links';

/**
 * The number, and the two ways to use it.
 *
 * ## Why this is its own component
 *
 * The same reason as `project-facts` and `page-head`: `contact.scss` carries a 4 kB
 * per-component style budget and this block took it past it. Extracting is the fix
 * the budget is asking for — the alternative is raising a limit that exists to stop
 * exactly this.
 *
 * Self-contained rather than presentational-with-inputs: it needs one constant and
 * four strings, and threading five inputs through `/contact` for a block that only
 * ever shows one thing would be more plumbing than the component is worth. Same
 * shape as `brand-marquee`.
 *
 * ## Bidirectional text
 *
 * The displayed number is wrapped in `.ltr-isolate`. A leading `+` inside Arabic copy
 * is otherwise reordered by the bidi algorithm and the sign lands at the wrong end,
 * so the reader is shown a number that is not the number.
 */
@Component({
  selector: 'app-contact-phone',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './contact-phone.html',
  styleUrl: './contact-phone.scss',
})
export class ContactPhone {
  protected readonly c = localizedContent(PROFILE_CONTENT.contact);

  /** Display, `tel:` and `wa.me` forms — one constant, shared with the footer. */
  protected readonly phone = CONTACT_PHONE;
}
