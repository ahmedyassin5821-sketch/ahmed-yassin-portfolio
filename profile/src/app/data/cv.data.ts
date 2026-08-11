import { Localized } from '@core/i18n/localized';

/**
 * Ahmed's CV, as data.
 *
 * ## Source of truth
 *
 * Transcribed from the PDF that ships at `CV_FILE` below — the same document a
 * visitor downloads. Nothing here is written from memory, inferred, or rounded
 * up: if a line is not in the PDF it is not in this file, and if the PDF is
 * replaced this file has to be re-read against it.
 *
 * That constraint is what makes the CV usable as the source for /cv, /about and
 * /contact at once. Those three pages present different amounts of the same
 * record rather than three separately-maintained biographies that drift.
 *
 * ## English is the original
 *
 * The document is written in English, so every English string here is a
 * transcription. The Arabic is a translation of that transcription — job titles
 * and course names included, except where the original is a proper noun
 * ("Angular", "CCNA 200-301", "2B"), which stays Latin in both.
 *
 * ## What is deliberately absent
 *
 * The PDF carries a personal mobile number. It is not transcribed here: the page
 * offers email, LinkedIn and GitHub, and a number on a public page invites
 * automated abuse. Anyone who downloads the CV still has it — that is the
 * document's own disclosure, not one this site makes on Ahmed's behalf.
 */

/** Served straight from `public/`, so the download is the real document. */
/**
 * Base-relative, like every other asset path — see `optimize-project-assets.mjs`.
 *
 * A leading slash would resolve against the domain root and 404 wherever the site
 * is served from a sub-path, which is exactly what GitHub Pages does for a project
 * repository. Resolved against `<base href>` instead, this is correct either way.
 */
export const CV_FILE = 'Attachments/Ahmed-Yassin FE Reaume.pdf';

/** Name the browser saves it under. The stored file's own name has a typo. */
export const CV_DOWNLOAD_NAME = 'Ahmed-Yassin-CV.pdf';

export interface CvEntry {
  readonly title: Localized;
  /** Employer, institution, or issuer. `null` where the CV names none. */
  readonly organisation: Localized | null;
  /** As printed on the CV — "02/2025 – present", "2021". */
  readonly period: string;
  /** Bullet points, verbatim in substance. Empty where the CV has none. */
  readonly points: readonly Localized[];
}

export interface CvSkillGroup {
  readonly label: Localized;
  readonly items: readonly string[];
}

/**
 * The one-line professional title, used as the site's own role line.
 *
 * Defined in `identity.ts` and re-exported here, so `/about`, `/cv` and `/contact`
 * can keep reading it beside the rest of the CV while the app shell's footer imports
 * the small module instead — importing it from here put the whole CV in the initial
 * bundle. One definition, see `identity.ts`.
 */
export { PROFESSIONAL_TITLE } from './identity';

export const CV_PROFILE: Localized = {
  en: 'Front-End Developer specializing in Angular and Magento, with hands-on experience delivering scalable eCommerce and enterprise-level web applications. Currently contributing to high-traffic production platforms, focusing on modular architecture, API integration, performance optimization, and user-centered UI development. With a background in engineering and digital business, I combine technical execution with analytical thinking and business awareness.',
  ar: 'مطوّر واجهات أمامية متخصص في Angular وMagento، بخبرة عملية في تسليم تطبيقات تجارة إلكترونية وتطبيقات ويب مؤسسية قابلة للتوسّع. أعمل حالياً على منصّات إنتاجية عالية الزيارات، مع التركيز على البنية المعيارية وتكامل الواجهات البرمجية وتحسين الأداء وتطوير واجهات تتمحور حول المستخدم. وبخلفية في الهندسة والأعمال الرقمية، أجمع بين التنفيذ التقني والتفكير التحليلي والوعي بالجانب التجاري.',
};

export const CV_EXPERIENCE: readonly CvEntry[] = [
  {
    title: { en: 'Front-End Developer', ar: 'مطوّر واجهات أمامية' },
    organisation: { en: '2B Egypt (full time)', ar: '2B مصر (دوام كامل)' },
    period: '02/2025 – present',
    points: [
      {
        en: 'Angular Development: Designed, developed, and maintained enterprise Angular applications, including complex dashboards, responsive UIs, reusable components, REST API integrations, and scalable architecture.',
        ar: 'تطوير Angular: تصميم وتطوير وصيانة تطبيقات Angular مؤسسية، تشمل لوحات تحكّم معقّدة وواجهات متجاوبة ومكوّنات قابلة لإعادة الاستخدام وتكاملات REST API وبنية قابلة للتوسّع.',
      },
      {
        en: 'Magento 2 Development: Developed and maintained Magento 2 storefronts by building custom features, customizing themes, overriding modules, resolving bugs, and enhancing performance.',
        ar: 'تطوير Magento 2: تطوير وصيانة متاجر Magento 2 ببناء خصائص مخصّصة وتخصيص القوالب وتجاوز الوحدات ومعالجة الأخطاء وتحسين الأداء.',
      },
    ],
  },
  {
    title: {
      en: 'Freelance Front-End & Shopify Developer',
      ar: 'مطوّر واجهات أمامية وShopify — عمل حر',
    },
    organisation: { en: 'Self-Employed', ar: 'لحسابي الخاص' },
    period: '2025 – present',
    points: [
      {
        en: 'Shopify Development: Developed and customized Shopify stores using Liquid, building responsive themes, custom sections, UI enhancements, third-party integrations, and performance optimizations.',
        ar: 'تطوير Shopify: تطوير وتخصيص متاجر Shopify باستخدام Liquid، مع بناء قوالب متجاوبة وأقسام مخصّصة وتحسينات على الواجهة وتكاملات مع خدمات خارجية وتحسينات في الأداء.',
      },
    ],
  },
  {
    title: { en: 'Founder of Black Media', ar: 'مؤسّس Black Media' },
    organisation: null,
    period: '01/2023',
    points: [
      {
        en: 'Founded and managed a digital marketing agency, overseeing the development and maintenance of online platforms and delivering high-quality graphic design services to a diverse client base.',
        ar: 'تأسيس وإدارة وكالة تسويق رقمي، والإشراف على تطوير المنصّات الإلكترونية وصيانتها، وتقديم خدمات تصميم جرافيكي لعملاء متنوّعين.',
      },
    ],
  },
  {
    title: { en: 'Graphic Designer', ar: 'مصمّم جرافيك' },
    organisation: { en: 'Freelancer', ar: 'عمل حر' },
    period: '2021',
    points: [],
  },
];

export const CV_EDUCATION: readonly CvEntry[] = [
  {
    title: {
      en: 'Bachelor of Engineering in Computer & Control',
      ar: 'بكالوريوس الهندسة — حاسبات وتحكّم',
    },
    organisation: {
      en: 'El Shrouk Academy engineering institute',
      ar: 'أكاديمية الشروق — المعهد العالي للهندسة',
    },
    period: '09/2019 – 07/2024',
    points: [
      { en: 'Grade: Good', ar: 'التقدير: جيد' },
      { en: 'Final year grade: Very Good', ar: 'تقدير سنة التخرج: جيد جداً' },
    ],
  },
  {
    title: { en: 'Graduation Project', ar: 'مشروع التخرج' },
    organisation: null,
    period: '09/2023 – 07/2024',
    points: [
      {
        en: 'Intelligent Safety Driving System (ISDS) — grade: Excellent',
        ar: 'نظام القيادة الآمنة الذكي (ISDS) — التقدير: امتياز',
      },
    ],
  },
];

export const CV_CERTIFICATIONS: readonly CvEntry[] = [
  {
    title: { en: 'Front-End Development internship', ar: 'تدريب تطوير واجهات أمامية' },
    organisation: { en: '2B', ar: '2B' },
    period: '08/2024 – 02/2025',
    points: [],
  },
  {
    title: { en: 'CCNA 200-301', ar: 'CCNA 200-301' },
    organisation: null,
    period: '06/2024',
    points: [],
  },
  {
    title: {
      en: 'Introduction to Artificial Intelligence and Applications',
      ar: 'مقدمة في الذكاء الاصطناعي وتطبيقاته',
    },
    organisation: {
      en: 'Zewail City of Science',
      ar: 'مدينة زويل للعلوم والتكنولوجيا',
    },
    period: '01/2024',
    points: [],
  },
  {
    title: { en: 'Python Programming Basics', ar: 'أساسيات البرمجة بلغة Python' },
    organisation: { en: 'Mahara Tech (ITI)', ar: 'مهارة تك (ITI)' },
    period: '04/2023',
    points: [],
  },
  {
    title: {
      en: 'Hacking From Beginning To Advance',
      ar: 'الاختراق من البداية إلى الاحتراف',
    },
    organisation: { en: 'Telecom Egypt (WE)', ar: 'المصرية للاتصالات (WE)' },
    period: '08/2022',
    points: [],
  },
];

/**
 * Skills, grouped.
 *
 * The CV prints these as four undifferentiated columns. Grouping them by what
 * they are is a presentation decision, not an editorial one — every item below
 * appears on the CV, and none has been added, renamed or promoted.
 */
export const CV_SKILLS: readonly CvSkillGroup[] = [
  {
    label: { en: 'Front-end', ar: 'الواجهات الأمامية' },
    items: ['Angular', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Sass', 'Bootstrap', 'jQuery'],
  },
  {
    label: { en: 'eCommerce', ar: 'التجارة الإلكترونية' },
    items: ['Magento', 'Shopify', 'WordPress', 'PrimeNG'],
  },
  {
    label: { en: 'Engineering', ar: 'الهندسة' },
    items: ['C++', 'Java', 'Machine Learning', 'Computer Graphics', 'Digital Signature', 'Hashing'],
  },
  {
    label: { en: 'Security & networks', ar: 'الأمن والشبكات' },
    items: ['CCNA', 'Kali Linux', 'CyberSecurity Tools'],
  },
  {
    label: { en: 'Design & tooling', ar: 'التصميم والأدوات' },
    items: ['Photoshop', 'Canva', 'MS Office', 'Documentation'],
  },
  {
    label: { en: 'Working style', ar: 'أسلوب العمل' },
    items: ['Problem Solving', 'Analytical and Critical Thinking', 'Decision Making', 'Report writing'],
  },
];

export const CV_LANGUAGES: readonly { name: Localized; level: Localized }[] = [
  {
    name: { en: 'Arabic', ar: 'العربية' },
    level: { en: 'Native / Bilingual', ar: 'اللغة الأم' },
  },
  {
    name: { en: 'English', ar: 'الإنجليزية' },
    level: { en: 'Fluent', ar: 'بطلاقة' },
  },
];
