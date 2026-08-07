import { ChangeDetectionStrategy, Component } from '@angular/core';

import { Logo } from '@shared/ui/logo/logo';
import { DsBlock } from '../ui/ds-block';

@Component({
  selector: 'ds-brand-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Logo, DsBlock],
  template: `
    <ds-block
      title="Primary logo"
      note="Full source artboard, including the designed clear space (~14% margins). Colour comes from --color-brand-mark via currentColor — no fill is hardcoded anywhere."
      token="variant=&quot;primary&quot;"
    >
      <app-logo variant="primary" [size]="140" label="Ahmed Yassin" />
    </ds-block>

    <ds-block
      title="Mark"
      note="Cropped to the measured glyph bounds so it can be optically aligned against text without the artboard's asymmetric padding."
      token="variant=&quot;mark&quot;"
      row
    >
      <app-logo variant="mark" [size]="140" />
      <app-logo variant="mark" [size]="96" />
      <app-logo variant="mark" [size]="64" />
      <app-logo variant="mark" [size]="48" />
    </ds-block>

    <ds-block
      title="Small-size variant — automatic below 48px"
      note="The true hairlines are 2.6% of the mark's height, so under ~48px they fall below one device pixel and vanish. The component swaps to a stroke-expanded variant on its own. Contrast drops from 3.8:1 to roughly 2:1 — an unavoidable trade, documented in BRAND-SYSTEM.md §10. Compare 40px and below against the sizes above."
      row
    >
      <app-logo [size]="40" />
      <app-logo [size]="32" />
      <app-logo [size]="24" />
      <app-logo [size]="16" />
    </ds-block>

    <ds-block
      title="On every surface"
      note="The baked-in white background plate has been removed, so the mark sits correctly on tinted surfaces. The original SVG could not do this."
      row
    >
      <div class="surface surface--background"><app-logo [size]="56" /></div>
      <div class="surface surface--surface"><app-logo [size]="56" /></div>
      <div class="surface surface--nested"><app-logo [size]="56" /></div>
      <div class="surface surface--sunken"><app-logo [size]="56" /></div>
    </ds-block>

    <ds-block
      title="Clear space"
      note="Minimum one stem width (9% of mark height) on all sides; two preferred. The dashed guide shows the minimum."
    >
      <div class="clearspace"><app-logo [size]="88" /></div>
    </ds-block>
  `,
  styles: `
    @use 'index' as ds;

    .surface {
      display: grid;
      place-items: center;
      padding: var(--space-6);
      border: var(--border-hairline) solid var(--color-border);
    }

    .surface--background { background-color: var(--color-background); }
    .surface--surface { background-color: var(--color-surface); }
    .surface--nested { background-color: var(--color-surface-nested); }
    .surface--sunken { background-color: var(--color-surface-sunken); }

    .clearspace {
      display: inline-grid;
      place-items: center;
      /* One stem width at this render size: 88px * 0.09 ~= 8px */
      padding: 8px;
      outline: 1px dashed var(--color-border-interactive);
      outline-offset: 0;
    }
  `,
})
export class BrandSection {}
