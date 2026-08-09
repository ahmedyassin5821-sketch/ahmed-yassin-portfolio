import { Localized } from '@core/i18n/localized';

/**
 * Every user-facing string on the Home page, in both languages.
 *
 * Kept out of templates so translation is a data concern rather than a markup
 * concern, and so a missing Arabic value fails to compile. Sections resolve one
 * block each through `localizedContent()` and stay locale-unaware.
 *
 * Latin product names (Angular, Magento, Shopify, 2B) stay Latin inside Arabic
 * copy — they are proper nouns. Where they appear mid-sentence the template
 * wraps them in `.ltr-isolate` so the bidi algorithm does not reorder trailing
 * punctuation.
 */

export interface HomeContent {
  readonly hero: {
    readonly eyebrow: Localized;
    readonly name: Localized;
    readonly role: Localized;
    readonly lede: Localized;
    readonly meta: readonly { readonly label: Localized; readonly value: Localized }[];
    readonly scrollHint: Localized;
  };
  /** Act 3 — the scale of the work, before any single project is named. */
  readonly count: {
    readonly eyebrow: Localized;
    readonly label: Localized;
    readonly lede: Localized;
  };
  /** Acts 4–6 — shared chrome for the three platform gates. */
  readonly gates: {
    readonly placeholderLabel: Localized;
  };
  readonly transition: {
    readonly title: Localized;
    readonly cta: Localized;
  };
  readonly visual: {
    readonly caption: Localized;
    readonly description: Localized;
  };
}

export const HOME_CONTENT: HomeContent = {
  hero: {
    eyebrow: {
      en: 'Cairo, Egypt — available for freelance',
      ar: 'القاهرة، مصر — متاح للعمل الحر',
    },
    name: {
      en: 'Ahmed Yassin',
      ar: 'أحمد ياسين',
    },
    role: {
      en: 'Front-End & eCommerce Engineer',
      ar: 'مهندس واجهات أمامية وتجارة إلكترونية',
    },
    lede: {
      en: 'I build enterprise Angular applications at 2B, customise Magento 2 storefronts at scale, and develop Shopify themes for independent brands.',
      ar: 'أبني تطبيقات Angular مؤسسية في 2B، وأخصّص متاجر Magento 2 على نطاق واسع، وأطوّر قوالب Shopify لعلامات تجارية مستقلة.',
    },
    meta: [
      {
        label: { en: 'Currently', ar: 'حالياً' },
        value: { en: 'Front-End Developer at 2B', ar: 'مطوّر واجهات أمامية في 2B' },
      },
      {
        label: { en: 'Focus', ar: 'التخصص' },
        value: { en: 'Angular · Magento · Shopify', ar: 'Angular · Magento · Shopify' },
      },
      {
        label: { en: 'Languages', ar: 'اللغات' },
        value: { en: 'Arabic · English', ar: 'العربية · الإنجليزية' },
      },
    ],
    scrollHint: {
      en: 'Scroll',
      ar: 'مرّر',
    },
  },
  count: {
    // Sits once, here, rather than repeating above each of the three gates:
    // this act is where the selection begins.
    eyebrow: {
      en: 'Selected work',
      ar: 'أعمال مختارة',
    },
    // The numeral itself is substituted from PROJECTS_SHIPPED, never typed here.
    label: {
      en: 'Projects shipped',
      ar: 'مشروعاً منجزاً',
    },
    lede: {
      en: 'Across three platforms, for enterprise teams and independent brands. A selection follows.',
      ar: 'عبر ثلاث منصّات، لفرق مؤسسية وعلامات تجارية مستقلة. وفيما يلي مختارات منها.',
    },
  },
  gates: {
    placeholderLabel: {
      en: 'Imagery coming soon',
      ar: 'الصور قريباً',
    },
  },
  transition: {
    // {shipped} is the career total from PROJECTS_SHIPPED, not the length of the
    // showcase array. Spelling either number out in the copy would let the page
    // contradict itself the moment a project is added — and using the array
    // length here would have claimed seven projects total, which is false.
    title: {
      en: '{shipped}+ projects shipped across three platforms.',
      ar: 'أكثر من {shipped} مشروع عبر ثلاث منصّات.',
    },
    cta: {
      en: 'See all work',
      ar: 'اطّلع على جميع الأعمال',
    },
  },
  visual: {
    caption: {
      en: 'The AY monogram, separated into its layers',
      ar: 'شعار AY، مفصولاً إلى طبقاته',
    },
    description: {
      en: 'A decorative composition of the AY monogram repeated in depth. All information on this page is available as text.',
      ar: 'تكوين زخرفي لشعار AY مكرّراً في العمق. جميع المعلومات في هذه الصفحة متاحة كنص.',
    },
  },
};
