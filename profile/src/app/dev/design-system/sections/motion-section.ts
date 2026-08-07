import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Button } from '@shared/ui/button/button';
import { RevealDirective } from '@shared/directives/reveal.directive';
import { MotionPreferenceService } from '@core/platform/motion-preference.service';
import { DsBlock } from '../ui/ds-block';

@Component({
  selector: 'ds-motion-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, RevealDirective, DsBlock],
  template: `
    <ds-block
      title="Reduced motion — live state"
      note="Read from the OS via matchMedia. Toggle it in your system settings and this updates without a reload. On the server this defaults to 'reduced', so server-rendered HTML is always the un-staged, fully-visible version."
    >
      <p class="state">
        prefers-reduced-motion:
        <strong>{{ motion.prefersReduced() ? 'reduce' : 'no-preference' }}</strong>
      </p>
    </ds-block>

    <ds-block
      title="Durations"
      note="Hover each bar. Exits run at roughly 65% of entrance duration, which is what makes a UI feel responsive rather than sluggish on the way out."
    >
      <div class="stack">
        @for (d of durations; track d.token) {
          <div class="bar-row">
            <code class="bar-row__token">{{ d.token }}</code>
            <span class="bar-row__value">{{ d.value }}</span>
            <div class="bar" [style.transition-duration]="'var(' + d.token + ')'">
              <div class="bar__fill"></div>
            </div>
          </div>
        }
      </div>
    </ds-block>

    <ds-block
      title="Easing"
      note="There is no spring or overshoot token in this system, deliberately. A Didone is rigid and drafted; elastic easing reads as playful, which the brief excludes. Things slide, wipe, and settle — they never bounce."
    >
      <div class="stack">
        @for (e of easings; track e.token) {
          <div class="bar-row">
            <code class="bar-row__token">{{ e.token }}</code>
            <span class="bar-row__value">{{ e.note }}</span>
            <div class="bar" [style.transition-timing-function]="'var(' + e.token + ')'">
              <div class="bar__fill"></div>
            </div>
          </div>
        }
      </div>
    </ds-block>

    <ds-block
      title="Scroll reveal"
      note="IntersectionObserver, not GSAP — a one-shot entrance needs no timeline, so a 45KB dependency would serve nothing. One-shot by design: it never re-triggers on scroll-back, because repeat animation is the fastest route to feeling cheap. Staged styles are scoped to html.js, so with scripting unavailable everything is simply visible."
    >
      <div class="reveal-grid">
        <!-- Tracked by the nonce-offset key so "Replay" recreates the nodes,
             but staggered by $index so delays stay 0/40/80ms. -->
        @for (key of revealItems; track key; let i = $index) {
          <div class="reveal-card" appReveal [revealIndex]="i">
            <span class="reveal-card__index">{{ i + 1 }}</span>
            <span class="reveal-card__delay">{{ i * 40 }}ms</span>
          </div>
        }
      </div>
      <app-button variant="secondary" size="sm" (pressed)="remount()">Replay</app-button>
    </ds-block>

    <ds-block
      title="Hover — the brand angle"
      note="The ghost button's underline wipes in along the monogram's own 24° leg axis. The angle is mirrored in RTL so it always travels with the reading direction — switch language in the header and hover again."
      row
    >
      <app-button variant="ghost">Hover me</app-button>
      <app-button variant="ghost" iconEnd="arrow-right">And me</app-button>
    </ds-block>

    <ds-block
      title="Skeleton"
      note="A linear sweep along the brand angle. Linear, and never a pulse — a pulse reads organic, and this brand is drafted."
    >
      <div class="skeletons">
        <div class="skeleton skeleton--title"></div>
        <div class="skeleton skeleton--line"></div>
        <div class="skeleton skeleton--line skeleton--short"></div>
      </div>
    </ds-block>
  `,
  styles: `
    @use 'index' as ds;

    .stack { display: flex; flex-direction: column; gap: var(--space-3); }
    .state { @include ds.body; }

    .bar-row {
      display: grid;
      align-items: center;
      gap: var(--space-3);
      grid-template-columns: 12rem 5rem 1fr;

      @include ds.mq-below(md) { grid-template-columns: 1fr; }
    }

    .bar-row__token { @include ds.mono; font-size: var(--fs-label); }
    .bar-row__value { @include ds.caption; @include ds.tabular; color: var(--color-text-muted); }

    .bar {
      block-size: 8px;
      background-color: var(--color-surface-sunken);
      transition-property: none;
    }

    .bar__fill {
      block-size: 100%;
      inline-size: 12%;
      background-color: var(--color-text-primary);
      transition-property: inline-size;
      transition-duration: inherit;
      transition-timing-function: inherit;
    }

    .bar:hover .bar__fill { inline-size: 100%; }

    .reveal-grid {
      display: grid;
      gap: var(--space-3);
      grid-template-columns: repeat(auto-fill, minmax(6rem, 1fr));
      margin-block-end: var(--space-4);
    }

    .reveal-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      aspect-ratio: var(--brand-ratio);
      border: var(--border-hairline) solid var(--color-border);
      background-color: var(--color-surface);
    }

    .reveal-card__index { @include ds.heading-3; }
    .reveal-card__delay { @include ds.caption; @include ds.tabular; color: var(--color-text-muted); }

    .skeletons { display: flex; flex-direction: column; gap: var(--space-2); max-inline-size: 28rem; }
    .skeleton { @include ds.skeleton; block-size: 1rem; }
    .skeleton--title { block-size: 2rem; }
    .skeleton--line { inline-size: 100%; }
    .skeleton--short { inline-size: 60%; }
  `,
})
export class MotionSection {
  protected readonly motion = inject(MotionPreferenceService);

  private readonly nonce = signal(0);

  /** Re-keying the @for destroys and recreates the items so reveal runs again. */
  protected get revealItems(): readonly number[] {
    const n = this.nonce();
    return Array.from({ length: 8 }, (_, i) => i + n * 100);
  }

  protected readonly durations = [
    { token: '--dur-instant', value: '40ms' },
    { token: '--dur-fast', value: '120ms' },
    { token: '--dur-base', value: '200ms' },
    { token: '--dur-slow', value: '320ms' },
    { token: '--dur-deliberate', value: '480ms' },
  ];

  protected readonly easings = [
    { token: '--ease-out', note: 'entrances' },
    { token: '--ease-in', note: 'exits' },
    { token: '--ease-inout', note: 'position' },
    { token: '--ease-linear', note: 'sweeps' },
  ];

  protected remount(): void {
    this.nonce.update((n) => n + 1);
  }
}
