import { ChangeDetectionStrategy, Component } from '@angular/core';

import { TextLink } from '@shared/ui/text-link/text-link';

@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TextLink],
  template: `
    <div class="not-found">
      <p class="not-found__code">404</p>
      <h1 class="not-found__title">Page not found</h1>
      <app-text-link route="/">Return to the homepage</app-text-link>
    </div>
  `,
  styleUrl: './not-found.scss',
})
export class NotFound {}
