import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ShellUiService } from '@core/shell/shell-ui.service';
import { FocusTrapDirective } from '@shared/directives/focus-trap.directive';
import { Icon } from '@shared/ui/icon/icon';
import { Logo } from '@shared/ui/logo/logo';
import { NAV_LINKS } from '../nav-links';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

/**
 * Mobile navigation — a full-viewport panel, not a shrunken desktop nav.
 *
 * Links are set at display scale and widely spaced, which makes the panel read as
 * a deliberate destination and incidentally puts every target far above 44px
 * without padding tricks.
 *
 * ## Accessibility
 *
 * `role="dialog"` + `aria-modal` describes what it is; the real scoping comes
 * from `app.ts` marking `<main>` and `<footer>` as `inert` while it is open,
 * which removes them from the accessibility tree and from pointer input.
 * `appFocusTrap` is the keyboard backstop and handles returning focus to the
 * trigger on close.
 *
 * Closing is centralised in `ShellUiService`, which listens to router events — so
 * a link tap, the browser back button, and Escape all resolve through one path.
 *
 * The panel is only rendered when open (`@if`), so nothing is in the DOM or the
 * accessibility tree at rest. It is also hidden entirely at `md` and above, where
 * the desktop navigation applies.
 */
@Component({
  selector: 'app-mobile-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, Logo, Icon, LanguageSwitcher, FocusTrapDirective],
  template: `
    @if (shell.menuOpen()) {
      <div
        id="mobile-nav"
        class="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        appFocusTrap
        [focusTrapActive]="true"
        (keydown.escape)="shell.close()"
      >
        <div class="panel__top">
          <!-- The mark stays put so the header does not appear to jump as the
               panel opens. -->
          <app-logo variant="mark" [size]="40" label="Ahmed Yassin" />

          <button
            type="button"
            class="panel__close"
            aria-label="Close navigation menu"
            (click)="shell.close()"
          >
            <app-icon name="close" size="md" />
          </button>
        </div>

        <nav class="panel__nav" aria-label="Primary">
          <ul class="panel__list" role="list">
            @for (link of navLinks; track link.path) {
              <li>
                <a
                  class="panel__link"
                  [routerLink]="link.path"
                  routerLinkActive="is-active"
                  #active="routerLinkActive"
                  [attr.aria-current]="active.isActive ? 'page' : null"
                >
                  {{ link.label }}
                </a>
              </li>
            }
          </ul>
        </nav>

        <div class="panel__foot">
          <app-language-switcher size="stacked" />
        </div>
      </div>
    }
  `,
  styleUrl: './mobile-nav.scss',
})
export class MobileNav {
  protected readonly shell = inject(ShellUiService);
  protected readonly navLinks = NAV_LINKS;
}
