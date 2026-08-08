import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Scaffolding, not a page.
 *
 * One component serving Work, About, CV, and Contact so the shell can be
 * exercised end to end — nav active states, view transitions, scroll
 * restoration, focus movement, and prerendering all need a real route to target.
 * Building four near-identical files would be worse, not more honest.
 *
 * Inputs arrive from route `data` via `withComponentInputBinding()`, already
 * enabled in `app.config.ts`.
 *
 * Each of these routes is replaced by its real feature in a later sprint.
 */
@Component({
  selector: 'app-route-stub',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stub">
      <p class="stub__eyebrow">{{ eyebrow() }}</p>
      <h1 class="stub__heading">{{ heading() }}</h1>
      <p class="stub__note">{{ note() }}</p>
    </div>
  `,
  styleUrl: './route-stub.scss',
})
export class RouteStub {
  readonly heading = input<string>('');
  readonly note = input<string>('');
  readonly eyebrow = input<string>('');
}
