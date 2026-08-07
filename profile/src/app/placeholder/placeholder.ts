import { ChangeDetectionStrategy, Component } from '@angular/core';
import { isDevMode } from '@angular/core';

import { Logo } from '@shared/ui/logo/logo';
import { TextLink } from '@shared/ui/text-link/text-link';

/**
 * Root route placeholder.
 *
 * Not the Home page — Sprint 2 explicitly excludes portfolio pages. This exists
 * because an app needs a root route, and because it is a useful proof that the
 * token layer works in the real application and not only inside the playground.
 *
 * Sprint 3 replaces this with the actual Home feature.
 */
@Component({
  selector: 'app-placeholder',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, TextLink],
  template: `
    <div class="placeholder">
      <app-logo variant="mark" [size]="96" label="Ahmed Yassin" />

      <div class="placeholder__text">
        <h1 class="placeholder__title">Ahmed Yassin</h1>
        <p class="placeholder__role">Front-End &amp; eCommerce Engineer</p>
      </div>

      <p class="placeholder__note">
        Design foundation in place. Portfolio pages arrive in the next sprint.
      </p>

      @if (isDev) {
        <app-text-link route="/dev/design-system">View the design system</app-text-link>
      }
    </div>
  `,
  styleUrl: './placeholder.scss',
})
export class Placeholder {
  protected readonly isDev = isDevMode();
}
