import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { DirectionService } from '@core/i18n/direction.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet],
  template: `
    <a class="skip-link" href="#main">Skip to main content</a>

    <main id="main" tabindex="-1">
      <router-outlet />
    </main>
  `,
  styleUrl: './app.scss',
})
export class App {
  /**
   * Injected for its side effect, not its API.
   *
   * The service's effect writes `lang` and `dir` onto the document root, and it
   * runs during server render too — so prerendered HTML already carries the
   * correct attributes. Nothing is mutated after paint, so there is no flash of
   * wrong direction.
   */
  private readonly direction = inject(DirectionService);

  protected readonly locale = this.direction.locale;
}
