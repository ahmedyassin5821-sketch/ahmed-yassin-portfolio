import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { Badge } from '@shared/ui/badge/badge';
import { Button } from '@shared/ui/button/button';
import { Card } from '@shared/ui/card/card';
import { Divider } from '@shared/ui/divider/divider';
import { FormField } from '@shared/ui/form-field/form-field';
import { TextLink } from '@shared/ui/text-link/text-link';
import { DsBlock } from '../ui/ds-block';

@Component({
  selector: 'ds-components-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Badge, Button, Card, Divider, FormField, TextLink, DsBlock],
  template: `
    <ds-block
      title="Button — variants"
      note="Press feedback is an opacity shift, never a scale. The brand system bans scaling: the monogram is a rigid Didone form, and squashing feedback reads as playful. Ghost draws its underline along the mark's own 24° leg axis — hover it, and switch to Arabic to see the angle mirror."
      row
    >
      <app-button variant="primary">Primary</app-button>
      <app-button variant="secondary">Secondary</app-button>
      <app-button variant="ghost">Ghost</app-button>
    </ds-block>

    <ds-block title="Button — sizes" note="md is 44px, the minimum touch target." row>
      <app-button size="sm">Small</app-button>
      <app-button size="md">Medium</app-button>
      <app-button size="lg">Large</app-button>
    </ds-block>

    <ds-block
      title="Button — states"
      note="The spinner occupies the leading icon slot rather than being added beside it, so the button never changes width. It keeps turning (slowly) under prefers-reduced-motion, because it reports state — freezing it would remove information rather than discomfort."
      row
    >
      <app-button [disabled]="true">Disabled</app-button>
      <app-button [loading]="true">Loading</app-button>
      <app-button iconStart="mail">With icon</app-button>
      <app-button iconEnd="arrow-right">Continue</app-button>
    </ds-block>

    <ds-block
      title="Text link"
      note="External links get rel=noopener, a glyph, and a visually-hidden 'opens in a new tab' note — changing browsing context silently is a WCAG 3.2.5 failure, and the icon alone tells a screen reader nothing. Underlines are the default: in a monochrome system there is no link colour to rely on."
    >
      <p class="prose">
        An <app-text-link route="/">internal link</app-text-link> and an
        <app-text-link href="https://angular.dev">external one</app-text-link> inside a sentence, so
        wrapping and baseline alignment are visible. Here is a
        <app-text-link route="/" [subtle]="true">subtle variant</app-text-link> for dense UI.
      </p>
    </ds-block>

    <ds-block title="Badge / tag" note="Read-only. Monochrome — distinguished by outline and mono label, never by hue." row>
      <app-badge>Angular</app-badge>
      <app-badge>Magento 2</app-badge>
      <app-badge variant="outline">Shopify</app-badge>
      <app-badge variant="outline">TypeScript</app-badge>
      <app-badge variant="status" icon="check">Verified</app-badge>
    </ds-block>

    <ds-block
      title="Card"
      note="Zero radius, hairline border. The interactive variant stretches ONE anchor over the card via an ::after overlay — wrapping the card in an anchor would nest inner links inside it, which is invalid and makes screen readers announce the whole card as a single link. Tab to the second card to see the ring land on the card, not the invisible anchor."
    >
      <div class="cards">
        <app-card>
          <h4 class="card-title">Static card</h4>
          <p class="card-body">No route, so no overlay and no hover treatment.</p>
        </app-card>

        <app-card route="/" linkLabel="View the 2B Website Revamp case study">
          <h4 class="card-title">Interactive card</h4>
          <p class="card-body">Whole surface is a link. Hover promotes the border and lifts 2px.</p>
        </app-card>
      </div>
    </ds-block>

    <ds-block title="Divider" note="Presentational by default. The angled variant cuts its ends at the brand angle, mirrored in RTL.">
      <div class="stack">
        <app-divider />
        <app-divider [angled]="true" />
        <div class="divider-row">
          <span class="card-body">Vertical</span>
          <app-divider orientation="vertical" />
          <span class="card-body">rule</span>
        </div>
      </div>
    </ds-block>

    <ds-block
      title="Input — with a real error state"
      note="Labels are always visible; a placeholder is never a label substitute. Errors surface on blur, not per keystroke. Because the palette is monochrome, an invalid field is marked three ways at once: a 2px border, an alert icon, and message text — plus aria-invalid and role=alert. Focus the email field, type nothing valid, then tab away."
    >
      <div class="fields">
        <app-form-field label="Name" placeholder="Ahmed Yassin" autocomplete="name" />

        <app-form-field
          label="Email"
          type="email"
          [required]="true"
          hint="Used only to reply to your message."
          autocomplete="email"
          [error]="emailError()"
          [(value)]="email"
        />

        <app-form-field label="Disabled" [disabled]="true" value="Not editable" />

        <app-form-field label="Message" [multiline]="true" [rows]="3" />
      </div>
    </ds-block>
  `,
  styles: `
    @use 'index' as ds;

    .stack { display: flex; flex-direction: column; gap: var(--space-4); }
    .prose { @include ds.body; max-inline-size: var(--measure-prose); }

    .cards {
      display: grid;
      gap: var(--space-4);
      grid-template-columns: 1fr;

      @include ds.mq(md) { grid-template-columns: repeat(2, 1fr); }
    }

    .card-title { @include ds.heading-3; margin-block-end: var(--space-2); }
    .card-body { @include ds.body; color: var(--color-text-secondary); }

    .divider-row { display: flex; align-items: center; gap: var(--space-3); block-size: 2rem; }

    .fields {
      display: grid;
      gap: var(--space-5);
      grid-template-columns: 1fr;
      max-inline-size: 32rem;

      @include ds.mq(md) { grid-template-columns: repeat(2, 1fr); }
    }
  `,
})
export class ComponentsSection {
  protected readonly email = signal('');

  /** Deliberately naive — this demonstrates the error UI, not validation logic. */
  protected readonly emailError = () =>
    this.email().length > 0 && !this.email().includes('@')
      ? 'Enter a valid email address, including the @ symbol.'
      : '';
}
