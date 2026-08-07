import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Badge } from '@shared/ui/badge/badge';
import { DsBlock } from '../ui/ds-block';

interface Swatch {
  readonly token: string;
  readonly value: string;
  readonly note: string;
}

@Component({
  selector: 'ds-color-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge, DsBlock],
  template: `
    <ds-block
      title="Surfaces"
      note="The ramp darkens as content nests — the paper metaphor, where the page is the lightest thing on it. 'Elevated' is the exception: floating surfaces return to the lightest value and are separated by shadow, because in a light theme a darker overlay reads as recessed."
    >
      <div class="swatches">
        @for (s of surfaces; track s.token) {
          <div class="swatch">
            <div class="swatch__chip" [style.background-color]="'var(' + s.token + ')'"></div>
            <code class="swatch__token">{{ s.token }}</code>
            <span class="swatch__value">{{ s.value }}</span>
            <span class="swatch__note">{{ s.note }}</span>
          </div>
        }
      </div>
    </ds-block>

    <ds-block
      title="Text hierarchy"
      note="Every ratio is computed against --color-background, not estimated. Note the ceiling: primary text stops at 13.41:1 while the mark gets 19.33:1, so nothing on the page is ever as dark as the logo."
    >
      <div class="stack">
        @for (t of text; track t.token) {
          <p class="text-row" [style.color]="'var(' + t.token + ')'">
            <span class="text-row__sample">The quick brown fox jumps over the lazy dog</span>
            <code class="text-row__token">{{ t.token }}</code>
            <span class="text-row__note">{{ t.note }}</span>
          </p>
        }
      </div>
    </ds-block>

    <ds-block
      title="Lines"
      note="--color-border is a visual seam at 1.26:1 and is NOT a control boundary. Anything that identifies an interactive control must use --color-border-interactive, verified at 3.32:1 for WCAG 1.4.11."
    >
      <div class="stack">
        <div class="line-demo">
          <div class="line-demo__box line-demo__box--seam">--color-border · 1.26:1 · seam only</div>
        </div>
        <div class="line-demo">
          <div class="line-demo__box line-demo__box--interactive">
            --color-border-interactive · 3.32:1 · controls
          </div>
        </div>
        <div class="line-demo">
          <div class="line-demo__rule"></div>
          <span class="line-demo__caption">--color-divider · decorative rule</span>
        </div>
      </div>
    </ds-block>

    <ds-block
      title="Status — monochrome"
      note="The identity is achromatic, so status is carried by icon + text + border weight. That is also what WCAG 1.4.1 requires: colour may never be the sole carrier of meaning. Adding real hues later is an edit to nine token lines and no components."
      row
    >
      <app-badge variant="status" icon="check-circle">Success</app-badge>
      <app-badge variant="status" icon="alert-triangle">Warning</app-badge>
      <app-badge variant="status" icon="alert-circle">Error</app-badge>
      <app-badge variant="status" icon="info">Info</app-badge>
    </ds-block>

    <ds-block
      title="Accent — deferred, pre-wired"
      note="No brand colour is chosen yet, so --color-accent resolves to a neutral and the site is genuinely monochrome. Every component already consumes it, so picking a colour later is a two-primitive edit with zero component changes."
      row
    >
      <div class="accent-chip">
        <div class="accent-chip__fill"></div>
        <code>--color-accent</code>
      </div>
      <div class="accent-chip">
        <div class="accent-chip__fill accent-chip__fill--hover"></div>
        <code>--color-accent-hover</code>
      </div>
      <div class="accent-chip">
        <div class="accent-chip__fill accent-chip__fill--muted"></div>
        <code>--color-accent-muted</code>
      </div>
    </ds-block>
  `,
  styles: `
    @use 'index' as ds;

    .swatches {
      display: grid;
      gap: var(--space-3);
      grid-template-columns: 1fr;

      @include ds.mq(md) { grid-template-columns: repeat(2, 1fr); }
      @include ds.mq(xl) { grid-template-columns: repeat(3, 1fr); }
    }

    .swatch {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-areas: 'chip token' 'chip value' 'chip note';
      align-items: center;
      gap: 0 var(--space-3);
    }

    .swatch__chip {
      grid-area: chip;
      inline-size: 56px;
      block-size: 56px;
      border: var(--border-hairline) solid var(--color-border-interactive);
    }

    .swatch__token { @include ds.mono; grid-area: token; font-size: var(--fs-label); }
    .swatch__value { @include ds.caption; @include ds.tabular; grid-area: value; color: var(--color-text-secondary); }
    .swatch__note { @include ds.caption; grid-area: note; color: var(--color-text-muted); }

    .stack { display: flex; flex-direction: column; gap: var(--space-3); }

    .text-row {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--space-2) var(--space-4);
    }

    .text-row__sample { font-size: var(--fs-body); }
    .text-row__token { @include ds.mono; font-size: var(--fs-label); color: var(--color-text-muted); }
    .text-row__note { @include ds.caption; @include ds.tabular; color: var(--color-text-muted); }

    .line-demo { display: flex; align-items: center; gap: var(--space-3); }

    .line-demo__box {
      @include ds.caption;

      flex: 1;
      padding: var(--space-3);
      color: var(--color-text-secondary);
    }

    .line-demo__box--seam { border: var(--border-hairline) solid var(--color-border); }
    .line-demo__box--interactive { border: var(--border-hairline) solid var(--color-border-interactive); }

    .line-demo__rule {
      flex: 1;
      block-size: var(--border-hairline);
      background-color: var(--color-divider);
    }

    .line-demo__caption { @include ds.caption; color: var(--color-text-muted); }

    .accent-chip { display: flex; align-items: center; gap: var(--space-2); }
    .accent-chip code { @include ds.mono; font-size: var(--fs-label); color: var(--color-text-muted); }

    .accent-chip__fill {
      inline-size: 32px;
      block-size: 32px;
      background-color: var(--color-accent);
      border: var(--border-hairline) solid var(--color-border-interactive);
    }

    .accent-chip__fill--hover { background-color: var(--color-accent-hover); }
    .accent-chip__fill--muted { background-color: var(--color-accent-muted); }
  `,
})
export class ColorSection {
  protected readonly surfaces: readonly Swatch[] = [
    { token: '--color-background', value: '#FDFCFB', note: 'page' },
    { token: '--color-surface', value: '#F8F7F5', note: 'cards, header' },
    { token: '--color-surface-nested', value: '#F2F1EE', note: 'nested panels, code' },
    { token: '--color-surface-sunken', value: '#ECEAE6', note: 'wells — decorative only' },
    { token: '--color-surface-elevated', value: '#FDFCFB + shadow-3', note: 'overlays, modals' },
    { token: '--color-brand-mark', value: '#0A0A09', note: '19.33:1 — the logo alone' },
  ];

  protected readonly text: readonly Swatch[] = [
    { token: '--color-text-primary', value: '#2E2D2C', note: '13.41:1 · AAA' },
    { token: '--color-text-secondary', value: '#51504F', note: '7.85:1 · AAA' },
    { token: '--color-text-muted', value: '#6E6D6C', note: '5.04:1 · AA — not on sunken' },
  ];
}
