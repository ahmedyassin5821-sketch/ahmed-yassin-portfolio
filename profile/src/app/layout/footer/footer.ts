import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Logo } from '@shared/ui/logo/logo';
import { TextLink } from '@shared/ui/text-link/text-link';
import { NAV_LINKS } from '../nav-links';
import { CONTACT_EMAIL, CONTACT_LOCATION, SOCIAL_LINKS } from './contact-links';

/**
 * Global footer.
 *
 * Same design language as the header — hairline rules, mono labels, zero radius,
 * no shadow — so the chrome reads as one system top and bottom. The closing AY
 * mark at 64px is the largest instance of the logo on the page after the hero,
 * which is what makes it read as a sign-off rather than decoration.
 *
 * Contact values come from the CV; see `contact-links.ts` for why the phone
 * number is excluded.
 */
@Component({
  selector: 'app-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, Logo, TextLink],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <app-logo variant="mark" [size]="64" label="Ahmed Yassin" />
          <p class="footer__role">Front-End &amp; eCommerce Engineer</p>
          <p class="footer__location">{{ location }}</p>
        </div>

        <!-- Labelled to distinguish it from the header's primary nav. -->
        <nav class="footer__nav" aria-label="Footer">
          <h2 class="footer__heading">Navigate</h2>
          <ul class="footer__list" role="list">
            @for (link of navLinks; track link.path) {
              <li>
                <a class="footer__link" [routerLink]="link.path">{{ link.label }}</a>
              </li>
            }
          </ul>
        </nav>

        <div class="footer__contact">
          <h2 class="footer__heading">Contact</h2>
          <ul class="footer__list" role="list">
            <li>
              <app-text-link [href]="'mailto:' + email" [newTab]="false">
                {{ email }}
              </app-text-link>
            </li>
            @for (social of socials; track social.href) {
              <li>
                <app-text-link [href]="social.href">
                  {{ social.label }}
                </app-text-link>
              </li>
            }
          </ul>
        </div>
      </div>

      <div class="footer__base">
        <p class="footer__copyright">© {{ year }} Ahmed Yassin</p>
      </div>
    </footer>
  `,
  styleUrl: './footer.scss',
})
export class Footer {
  protected readonly navLinks = NAV_LINKS;
  protected readonly email = CONTACT_EMAIL;
  protected readonly location = CONTACT_LOCATION;
  protected readonly socials = SOCIAL_LINKS;

  /**
   * Evaluated once, at render.
   *
   * Every route is prerendered, so this is the BUILD year and it will not roll
   * over on its own — the site has to be rebuilt. That is inherent to static
   * generation, not a bug, but it is the kind of thing that gets reported as one
   * each January.
   */
  protected readonly year = new Date().getFullYear();
}
