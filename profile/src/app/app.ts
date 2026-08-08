import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';
import { RouteFocusService } from '@core/routing/route-focus.service';
import { ShellUiService } from '@core/shell/shell-ui.service';
import { Footer } from './layout/footer/footer';
import { Header } from './layout/header/header';

/**
 * Global application shell.
 *
 * Header, content outlet, and footer — everything every page shares, and nothing
 * any single page owns. Route content mounts into `<main>`.
 */
@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  template: `
    <a class="skip-link" href="#main">Skip to main content</a>

    <app-header />

    <!--
      Marked inert while the mobile panel is open. This is what actually scopes
      the page: it removes both regions from the accessibility tree and from
      pointer input, so a screen reader cannot wander out of the panel into the
      page behind it. The focus trap is the keyboard backstop on top of this.
    -->
    <main id="main" tabindex="-1" [attr.inert]="shell.menuOpen() ? '' : null">
      <router-outlet />
    </main>

    <app-footer [attr.inert]="shell.menuOpen() ? '' : null" />

    <!--
      Route announcements. A client-side navigation is otherwise silent to a
      screen reader: the DOM swaps with nothing to say a new page arrived.
      Populated by RouteFocusService, which also moves focus to <main>.
    -->
    <div class="sr-only" aria-live="polite" role="status">{{ announcement() }}</div>
  `,
  styleUrl: './app.scss',
})
export class App {
  protected readonly shell = inject(ShellUiService);

  /**
   * Injected for its side effect, not its API.
   *
   * The service's effect writes `lang` and `dir` onto the document root, and it
   * runs during server render too — so prerendered HTML already carries the
   * correct attributes. Nothing is mutated after paint, so there is no flash of
   * wrong direction.
   */
  private readonly direction = inject(DirectionService);

  /** Also injected for its side effect: focus and announcement on navigation. */
  private readonly routeFocus = inject(RouteFocusService);

  protected readonly locale = this.direction.locale;
  protected readonly announcement = this.routeFocus.announcement;
}
