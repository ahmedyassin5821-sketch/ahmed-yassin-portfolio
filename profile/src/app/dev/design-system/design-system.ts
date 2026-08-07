import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DirectionService } from '@core/i18n/direction.service';
import { Logo } from '@shared/ui/logo/logo';
import { Button } from '@shared/ui/button/button';
import { Divider } from '@shared/ui/divider/divider';

import { BrandSection } from './sections/brand-section';
import { ColorSection } from './sections/color-section';
import { TypographySection } from './sections/typography-section';
import { ComponentsSection } from './sections/components-section';
import { MotionSection } from './sections/motion-section';

interface SectionLink {
  readonly id: string;
  readonly label: string;
}

/**
 * Design system playground. **Development only.**
 *
 * angular.json swaps `dev.routes.ts` for `dev.routes.prod.ts` in the production
 * configuration, which severs the only route to this component and lets the
 * bundler drop it entirely. Verified by `grep -r design-system dist/`.
 */
@Component({
  selector: 'app-design-system',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Logo,
    Button,
    Divider,
    BrandSection,
    ColorSection,
    TypographySection,
    ComponentsSection,
    MotionSection,
  ],
  template: `
    <header class="ds-header">
      <div class="ds-header__inner">
        <div class="ds-header__brand">
          <app-logo variant="mark" [size]="40" label="Ahmed Yassin" />
          <div>
            <p class="ds-header__title">Design System</p>
            <p class="ds-header__meta">Sprint 2 · light-first · monochrome</p>
          </div>
        </div>

        <div class="ds-header__actions">
          <!--
            Temporary. Sprint 3 replaces this with Angular's compile-time
            LOCALE_ID (ARCHITECTURE.md ADR-001), where each locale is its own
            build and switching is a navigation. What survives is the shape:
            components never ask which locale is active — they rely on dir/lang
            on the document root plus logical CSS properties. This toggle exists
            so RTL is verifiable before that lands.
          -->
          <app-button
            variant="secondary"
            size="sm"
            (pressed)="direction.toggle()"
            [ariaLabel]="
              'Switch to ' + (direction.locale() === 'en' ? 'Arabic (RTL)' : 'English (LTR)')
            "
          >
            {{ direction.locale() === 'en' ? 'العربية · RTL' : 'English · LTR' }}
          </app-button>
        </div>
      </div>

      <nav class="ds-nav" aria-label="Design system sections">
        <ul class="ds-nav__list" role="list">
          @for (link of sections; track link.id) {
            <li>
              <a class="ds-nav__link" [href]="'#' + link.id">{{ link.label }}</a>
            </li>
          }
        </ul>
      </nav>
    </header>

    <div class="ds-page">
      <section id="brand" class="ds-section" aria-labelledby="brand-h">
        <h2 id="brand-h" class="ds-section__title">Brand</h2>
        <ds-brand-section />
      </section>

      <app-divider />

      <section id="colour" class="ds-section" aria-labelledby="colour-h">
        <h2 id="colour-h" class="ds-section__title">Colour</h2>
        <ds-color-section />
      </section>

      <app-divider />

      <section id="typography" class="ds-section" aria-labelledby="typography-h">
        <h2 id="typography-h" class="ds-section__title">Typography</h2>
        <ds-typography-section />
      </section>

      <app-divider />

      <section id="components" class="ds-section" aria-labelledby="components-h">
        <h2 id="components-h" class="ds-section__title">Primitives</h2>
        <ds-components-section />
      </section>

      <app-divider />

      <section id="motion" class="ds-section" aria-labelledby="motion-h">
        <h2 id="motion-h" class="ds-section__title">Motion</h2>
        <ds-motion-section />
      </section>
    </div>
  `,
  styleUrl: './design-system.scss',
})
export class DesignSystem {
  protected readonly direction = inject(DirectionService);

  protected readonly sections: readonly SectionLink[] = [
    { id: 'brand', label: 'Brand' },
    { id: 'colour', label: 'Colour' },
    { id: 'typography', label: 'Typography' },
    { id: 'components', label: 'Primitives' },
    { id: 'motion', label: 'Motion' },
  ];
}
