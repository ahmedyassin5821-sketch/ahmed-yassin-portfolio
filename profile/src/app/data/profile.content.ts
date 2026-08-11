/**
 * Copy for `/about`, `/cv` and `/contact`.
 *
 * These three pages present one record — the CV in `cv.data.ts` — at three
 * depths: About reads it as a short narrative, CV lays it out in full, Contact
 * reduces it to the two or three facts someone needs in order to write. Nothing
 * biographical is written here that is not in that record; this file holds the
 * page furniture only.
 */
export const PROFILE_CONTENT = {
  about: {
    eyebrow: { en: 'About', ar: 'نبذة' },
    title: { en: 'Ahmed Yassin', ar: 'أحمد ياسين' },
    lede: {
      en: 'I build front-end and eCommerce systems — enterprise Angular applications, Magento 2 storefronts at scale, and custom Shopify themes for independent brands.',
      ar: 'أبني أنظمة واجهات أمامية وتجارة إلكترونية — تطبيقات Angular مؤسسية، ومتاجر Magento 2 على نطاق واسع، وقوالب Shopify مخصّصة لعلامات تجارية مستقلة.',
    },
    /** Headings over the three blocks the page is built from. */
    profileHeading: { en: 'Profile', ar: 'نبذة مهنية' },
    practiceHeading: { en: 'What I work on', ar: 'مجالات العمل' },
    nowHeading: { en: 'Now', ar: 'حالياً' },
    cvNote: {
      en: 'The full record — experience, education, certifications and skills — is on the CV.',
      ar: 'السجل الكامل — الخبرات والتعليم والشهادات والمهارات — موجود في السيرة الذاتية.',
    },
    /**
     * Both numbers substituted from data. Writing "seven projects" here would
     * state the size of the showcase as if it were the size of the career.
     */
    workNote: {
      en: '{selected} of {shipped}+ projects are presented in detail; the rest are not public.',
      ar: '{selected} من أكثر من {shipped} مشروعاً معروضة بالتفصيل، وبقية الأعمال غير منشورة.',
    },
    viewWork: { en: 'See the work', ar: 'اطّلع على الأعمال' },
    viewCv: { en: 'Read the CV', ar: 'اقرأ السيرة الذاتية' },
  },

  cv: {
    eyebrow: { en: 'Curriculum vitae', ar: 'السيرة الذاتية' },
    title: { en: 'CV', ar: 'السيرة الذاتية' },
    lede: {
      en: 'The same document available as a PDF, laid out as a page so it can be read, searched and linked to directly.',
      ar: 'المستند نفسه المتاح بصيغة PDF، معروضاً كصفحة يمكن قراءتها والبحث فيها والربط إليها مباشرة.',
    },
    download: { en: 'Download PDF', ar: 'تنزيل الملف PDF' },
    /** Appended to the download control for screen readers. */
    downloadNote: { en: '(PDF, opens in a new tab)', ar: '(ملف PDF، يفتح في تبويب جديد)' },
    sections: {
      profile: { en: 'Profile', ar: 'نبذة مهنية' },
      experience: { en: 'Experience', ar: 'الخبرة العملية' },
      projects: { en: 'Selected projects', ar: 'مشاريع مختارة' },
      education: { en: 'Education', ar: 'التعليم' },
      certifications: { en: 'Courses & certifications', ar: 'الدورات والشهادات' },
      skills: { en: 'Skills', ar: 'المهارات' },
      languages: { en: 'Languages', ar: 'اللغات' },
    },
    /**
     * The CV lists projects as prose; the site has a page per project. Rather
     * than repeat the list, this section points at the real presentation.
     */
    projectsNote: {
      en: '{selected} of {shipped}+ projects are presented in full, each with the business it serves, the platform it runs on, and screenshots.',
      ar: '{selected} من أكثر من {shipped} مشروعاً معروضة بالكامل، ولكل منها نشاط الجهة التي يخدمها والمنصة التي يعمل عليها ولقطات الشاشة.',
    },
    viewWork: { en: 'See the work', ar: 'اطّلع على الأعمال' },
  },

  contact: {
    eyebrow: { en: 'Contact', ar: 'تواصل' },
    title: { en: 'Get in touch', ar: 'لنتحدث' },
    lede: {
      en: 'Available for freelance and full-time front-end and eCommerce work. Email is the fastest way to reach me.',
      ar: 'متاح للعمل الحر والدوام الكامل في مجالات الواجهات الأمامية والتجارة الإلكترونية. البريد الإلكتروني هو أسرع وسيلة للتواصل.',
    },
    emailLabel: { en: 'Email', ar: 'البريد الإلكتروني' },

    // One number, two ways to use it. Said explicitly, because a bare number does
    // not tell anyone whether WhatsApp will reach him.
    phoneLabel: { en: 'Phone & WhatsApp', ar: 'الهاتف وواتساب' },
    phoneNote: {
      en: 'The same number works for calls and WhatsApp.',
      ar: 'الرقم نفسه يعمل للاتصال والواتساب.',
    },
    callAction: { en: 'Call', ar: 'اتصال' },
    whatsappAction: { en: 'WhatsApp', ar: 'واتساب' },

    locationLabel: { en: 'Based in', ar: 'المقر' },
    languagesLabel: { en: 'Languages', ar: 'اللغات' },
    roleLabel: { en: 'Role', ar: 'التخصص' },
    profilesHeading: { en: 'Elsewhere', ar: 'روابط أخرى' },
    cvHeading: { en: 'Curriculum vitae', ar: 'السيرة الذاتية' },
    cvNote: {
      en: 'Experience, education, certifications and skills — as a page or a PDF.',
      ar: 'الخبرات والتعليم والشهادات والمهارات — كصفحة أو كملف PDF.',
    },
    viewCv: { en: 'Read the CV', ar: 'اقرأ السيرة الذاتية' },
    /**
     * There is no form. Building one without an endpoint would be a control that
     * silently discards what someone typed, which is worse than not offering it.
     */
    noFormNote: {
      en: 'No form to fill in — a direct email reaches me faster and lets you attach anything you need to.',
      ar: 'لا يوجد نموذج لتعبئته — البريد المباشر يصلني أسرع ويتيح لك إرفاق ما تحتاجه.',
    },
  },
} as const;
