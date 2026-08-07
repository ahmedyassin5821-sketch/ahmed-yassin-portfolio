import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';

/**
 * Labelled demo block for the playground. Dev-only scaffolding — not a design
 * system primitive, and it never ships.
 */
@Component({
  selector: 'ds-block',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="block">
      <div class="block__head">
        <h3 class="block__title">{{ title() }}</h3>
        @if (note()) {
          <p class="block__note">{{ note() }}</p>
        }
        @if (token()) {
          <code class="block__token">{{ token() }}</code>
        }
      </div>
      <div class="block__body" [class.block__body--row]="row()">
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    @use 'index' as ds;

    .block {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      padding-block: var(--space-5);
      border-block-start: var(--border-hairline) solid var(--color-divider);
    }

    .block__head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--space-2) var(--space-4);
    }

    .block__title {
      @include ds.label;

      color: var(--color-text-secondary);
    }

    .block__note {
      @include ds.caption;

      max-inline-size: min(60ch, 100%);
      color: var(--color-text-muted);
    }

    .block__token {
      @include ds.mono;

      font-size: var(--fs-label);
      color: var(--color-text-muted);
    }

    .block__body--row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--space-3);
    }
  `,
})
export class DsBlock {
  readonly title = input.required<string>();
  readonly note = input<string>('');
  readonly token = input<string>('');
  readonly row = input(false, { transform: booleanAttribute });
}
