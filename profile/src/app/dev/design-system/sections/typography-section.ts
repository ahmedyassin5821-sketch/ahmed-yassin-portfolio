import { ChangeDetectionStrategy, Component } from '@angular/core';

import { DsBlock } from '../ui/ds-block';

@Component({
  selector: 'ds-typography-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DsBlock],
  template: `
    <ds-block
      title="The weight gap"
      note="The monogram has no mid-weights — it is hairline or stem, nothing between. The type system mirrors that: display is light (300) and enormous, headings are semibold (600), labels are mono and tracked out. Geist 700+ is deliberately absent, because heaviness would compete with the mark."
    >
      <!-- Explicitly lang="en" so these Latin specimens stay in Geist even when
           the page is switched to Arabic — the font tokens are language-scoped. -->
      <div class="stack" lang="en">
        <p class="t-display-1">Ahmed Yassin</p>
        <p class="t-display-2">Front-End &amp; eCommerce Engineer</p>
        <h2 class="t-h1">Angular · Magento · Shopify</h2>
        <h3 class="t-h2">Selected work</h3>
        <h4 class="t-h3">2B Website Revamp</h4>
        <p class="t-body">
          Body copy at 1rem with a 1.65 line-height. Prose never drops below 1rem, and the measure
          is capped at 68ch so a line never outruns comfortable reading. This paragraph is set at
          the maximum measure to make that limit visible.
        </p>
        <p class="t-caption">Caption — UI only, never prose.</p>
        <p class="t-label">Label · mono · uppercase · tracked</p>
        <p class="t-mono">const contrast = 27.5 / 7.3; // 3.77</p>
      </div>
    </ds-block>

    <ds-block
      title="Arabic — same components, no forks"
      note="This block forces lang=ar/dir=rtl locally so both scripts can be compared side by side. Tracking is neutralised (negative tracking severs Arabic letter joins — a rendering error, not a style choice) and every line-height runs ~0.25 higher, because Amiri's Naskh ascenders and descenders are far taller than Geist's."
    >
      <div class="stack" lang="ar" dir="rtl">
        <p class="t-display-2">أحمد ياسين</p>
        <h2 class="t-h1">مبرمج مواقع ومتاجر إلكترونية</h2>
        <p class="t-body">
          أطوّر تطبيقات <span class="ltr-isolate">Angular</span> للمؤسسات، ومتاجر
          <span class="ltr-isolate">Magento 2</span> و<span class="ltr-isolate">Shopify</span>، مع
          التركيز على الأداء وسهولة الوصول والأداء على الأجهزة المحمولة.
        </p>
        <p class="t-caption">تعليق قصير — لواجهة المستخدم فقط.</p>
      </div>
    </ds-block>

    <ds-block
      title="Bidirectional text isolation"
      note="Latin terms embedded in Arabic must be wrapped in .ltr-isolate. Without it the bidi algorithm reorders the run and trailing digits or punctuation jump to the wrong side. Compare the two lines below — the second is what happens when the wrapper is omitted."
    >
      <div class="stack" lang="ar" dir="rtl">
        <p class="t-body">
          صحيح: أعمل على <span class="ltr-isolate">Angular 21</span> و<span class="ltr-isolate"
            >Magento 2</span
          >.
        </p>
        <p class="t-body">خطأ: أعمل على Angular 21 و Magento 2.</p>
      </div>
    </ds-block>

    <ds-block
      title="Amiri is not used below 32px"
      note="Amiri's contrast collapses at text sizes, so anything under 32px in Arabic falls to IBM Plex Sans Arabic. The font families are tokens (--font-arabic-display / --font-arabic-body) precisely so the Arabic face stays comparable rather than baked in — Readex Pro is already installed as an alternate."
    >
      <div class="stack" lang="ar" dir="rtl">
        <p class="t-arabic-display">أحمد ياسين — عرض ٤٨ بكسل</p>
        <p class="t-arabic-body">نص أساسي بخط IBM Plex Sans Arabic في الأحجام الصغيرة.</p>
      </div>
    </ds-block>

    <ds-block
      title="Tabular figures"
      note="Required on every stat, date, and metric. Proportional digits change width as values change, which makes numbers visibly jitter in a table or a counter."
    >
      <div class="figures">
        <p class="t-mono">Tabular&nbsp;&nbsp; 1111 · 0000 · 2025 · 8888</p>
        <p class="t-mono t-proportional">Proportional 1111 · 0000 · 2025 · 8888</p>
      </div>
    </ds-block>
  `,
  styles: `
    @use 'index' as ds;

    .stack { display: flex; flex-direction: column; gap: var(--space-4); }

    .t-display-1 { @include ds.display-1; max-inline-size: var(--measure-display); }
    .t-display-2 { @include ds.display-2; }
    .t-h1 { @include ds.heading-1; }
    .t-h2 { @include ds.heading-2; }
    .t-h3 { @include ds.heading-3; }
    .t-body { @include ds.body; max-inline-size: var(--measure-prose); color: var(--color-text-secondary); }
    .t-caption { @include ds.caption; color: var(--color-text-muted); }
    .t-label { @include ds.label; color: var(--color-text-secondary); }
    .t-mono { @include ds.mono; @include ds.tabular; }

    .t-arabic-display {
      font-family: var(--font-arabic-display);
      font-size: 3rem;
      line-height: var(--lh-display-2);
    }

    .t-arabic-body {
      font-family: var(--font-arabic-body);
      font-size: var(--fs-body);
      line-height: var(--lh-body);
      color: var(--color-text-secondary);
    }

    .figures { display: flex; flex-direction: column; gap: var(--space-2); }
    .t-proportional { font-variant-numeric: proportional-nums; }
  `,
})
export class TypographySection {}
