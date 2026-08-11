import { Localized } from '@core/i18n/localized';
import { PROFESSIONAL_TITLE } from './cv.data';

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
    readonly eyebrow: Localized;
    /** "{count} selected" — the number is substituted from the data. */
    readonly countLabel: Localized;
    /** Appended to a project's stack line when it included a dashboard. */
    readonly dashboard: Localized;
    readonly viewLabel: Localized;
    readonly placeholderLabel: Localized;
  };
  /**
   * The brand strip — the marks themselves, after the corridor.
   *
   * No per-project strings: the marquee derives every name, route and logo from
   * `PROJECTS`, and takes each link's accessible name from
   * `WORK_CONTENT.a11y.viewProject` so the two indexes announce a project
   * identically.
   */
  readonly marquee: {
    readonly eyebrow: Localized;
    readonly title: Localized;
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
    // One source for the professional title, shared with /about, /cv and
    // /contact. The Arabic is Ahmed's own wording, not a translation of the
    // English line — see PROFESSIONAL_TITLE.
    role: PROFESSIONAL_TITLE,
    // Business first, platforms second.
    //
    // This line used to open with the tooling — "enterprise Angular applications,
    // Magento 2 storefronts, Shopify themes" — which answers a question no client
    // asked. It now says what the work is *for*, and names the platforms only as
    // the means. No superlatives, no "solutions", no "next level".
    lede: {
      en: 'I build websites and online stores that help businesses sell, present their products, and be found by the customers looking for them.',
      ar: 'أبني مواقع ومتاجر إلكترونية تساعد الأعمال على البيع وعرض منتجاتها والوصول إلى العملاء الذين يبحثون عنها.',
    },
    meta: [
      {
        label: { en: 'Currently', ar: 'حالياً' },
        value: { en: 'Front-End Developer at 2B', ar: 'مطوّر واجهات أمامية في 2B' },
      },
      {
        // Shopify first, matching the order the showcase is presented in.
        label: { en: 'Focus', ar: 'التخصص' },
        value: { en: 'Shopify · Angular · Magento', ar: 'Shopify · Angular · Magento' },
      },
      {
        label: { en: 'Languages', ar: 'اللغات' },
        value: { en: 'Arabic · English', ar: 'العربية · الإنجليزية' },
      },
    ],
    // Read by `scroll-cue`, at the foot of the hero. "Scroll" alone was a label on
    // a static line; the cue is an instruction, so it says what scrolling gets you.
    scrollHint: {
      en: 'Scroll to explore',
      ar: 'مرّر للاستكشاف',
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
    // What the work does for the businesses that commissioned it — stores that
    // sell, sites that present a brand, platforms that run on their own admin.
    // Concise on purpose: this act is a single screen, not a services page.
    lede: {
      en: 'Stores that sell, sites that present a brand, platforms that run on their own admin. For independent brands and for enterprise teams. A selection follows.',
      ar: 'متاجر تبيع، ومواقع تعرّف بعلامة، ومنصّات تُدار بلوحة تحكّم خاصة بها. لعلامات مستقلة ولفرق مؤسسية. وفيما يلي مختارات منها.',
    },
  },
  gates: {
    eyebrow: {
      en: 'Selected work',
      ar: 'أعمال مختارة',
    },
    countLabel: {
      en: '{count} selected',
      ar: '{count} مختارة',
    },
    dashboard: {
      en: 'Dashboard',
      ar: 'لوحة تحكّم',
    },
    viewLabel: {
      en: '(opens the live site in a new tab)',
      ar: '(يفتح الموقع في تبويب جديد)',
    },
    placeholderLabel: {
      en: 'Imagery coming soon',
      ar: 'الصور قريباً',
    },
  },
  marquee: {
    eyebrow: {
      en: 'Brands & products',
      ar: 'علامات ومنتجات',
    },
    // "worked on", not "built" or "launched": one of these is an enterprise
    // product with its own team, and the strip must not read as a claim to have
    // made each of these businesses. No number either — the seven marks here are
    // a selection, and counting them would contradict PROJECTS_SHIPPED.
    title: {
      en: 'Brands and digital products I have worked on.',
      ar: 'علامات تجارية ومنتجات رقمية عملت عليها.',
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
