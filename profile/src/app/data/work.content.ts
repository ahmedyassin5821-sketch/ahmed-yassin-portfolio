/**
 * Copy for `/work` and `/work/:slug`.
 *
 * Every user-facing string on both pages lives here in both languages, so a
 * template never holds a literal and a missing translation is a type error
 * rather than an English word appearing in an Arabic layout.
 *
 * Kept deliberately short. The screenshots and each project's own brief do the
 * explaining; these labels exist to orient rather than to narrate.
 */
export const WORK_CONTENT = {
  index: {
    eyebrow: { en: 'Selected work', ar: 'أعمال مختارة' },
    title: { en: 'Work', ar: 'الأعمال' },
    lede: {
      en: 'Front-end and eCommerce engineering across Angular, Magento, and Shopify — for enterprise teams and independent brands.',
      ar: 'هندسة واجهات أمامية وتجارة إلكترونية عبر Angular وMagento وShopify — لفرق مؤسسية وعلامات تجارية مستقلة.',
    },
    /**
     * Two numbers, both substituted from data and neither typed as a word.
     *
     * `{shipped}` is the career total; `{selected}` is how many are presented
     * here. Stating only the second would read as "he has done seven projects",
     * which is false — the showcase is curated, not complete.
     */
    count: {
      en: '{shipped}+ projects shipped — {selected} selected here',
      ar: 'أكثر من {shipped} مشروع — {selected} منها هنا',
    },
  },

  labels: {
    /** The business, stated before any technology. */
    market: { en: 'Market', ar: 'السوق' },
    field: { en: 'Field', ar: 'المجال' },
    domain: { en: 'Domain', ar: 'نوع المنتج' },

    platform: { en: 'Platform', ar: 'المنصة' },
    role: { en: 'Role', ar: 'الدور' },
    technologies: { en: 'Technologies', ar: 'التقنيات' },
    theme: { en: 'Theme', ar: 'القالب' },
    dashboard: { en: 'Includes dashboard', ar: 'يشمل لوحة تحكّم' },
    screenshots: { en: 'Screenshots', ar: 'لقطات الشاشة' },
  },

  actions: {
    view: { en: 'View project', ar: 'عرض المشروع' },
    visit: { en: 'Visit site', ar: 'زيارة الموقع' },
    /**
     * NAS HR has no public URL because it is an internal system. Saying so is
     * more honest — and more informative — than hiding the project or linking
     * somewhere that 404s.
     */
    private: { en: 'Internal project', ar: 'مشروع داخلي' },
    privateNote: {
      en: 'An internal system with no public address.',
      ar: 'نظام داخلي بلا عنوان عام.',
    },
    /**
     * The counterpart to `private` on the index. Both are stated as plain text
     * rather than badges — whether a project has a public address is a fact
     * about the work, and a pill made it read as a disabled control.
     */
    live: { en: 'Live ↗', ar: '↗ مباشر' },
    backToWork: { en: 'All work', ar: 'كل الأعمال' },
    previous: { en: 'Previous', ar: 'السابق' },
    next: { en: 'Next', ar: 'التالي' },
  },

  a11y: {
    /** Announced on the wrapping link so the card is not read as bare text. */
    viewProject: { en: 'View {name}', ar: 'عرض {name}' },
    previousProject: { en: 'Previous project: {name}', ar: 'المشروع السابق: {name}' },
    nextProject: { en: 'Next project: {name}', ar: 'المشروع التالي: {name}' },
    gallery: { en: 'Screenshots of {name}', ar: 'لقطات شاشة من {name}' },
  },
} as const;
