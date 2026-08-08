import { PlatformGroup, Project, ProjectPlatform } from './models/project.model';

/**
 * Real projects only.
 *
 * Every entry comes from Ahmed's CV or the project brief. Nothing here is
 * inferred, embellished, or filled in to look complete:
 *
 * - `url` is `null` wherever a live address has not been confirmed. A guessed
 *   URL in a portfolio is a broken link waiting to be clicked by a recruiter.
 * - `logo` / `screenshot` are `null` until real assets are supplied. The UI
 *   renders a token-styled placeholder in the meantime — no stock photography,
 *   no AI-generated imagery, no borrowed screenshots.
 * - `technology` lists only what was actually stated.
 *
 * Populating a project later is a data edit here and nothing else.
 */

const angular: readonly Project[] = [
  {
    slug: 'nas-hr-system',
    name: 'NAS — HR System',
    platform: 'angular',
    summary: {
      en: 'Complex dashboards and reusable components for an HR SaaS platform, built with a cross-functional team.',
      ar: 'لوحات تحكم معقّدة ومكوّنات قابلة لإعادة الاستخدام لمنصة موارد بشرية، بالتعاون مع فريق متعدّد التخصصات.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    technology: ['Angular', 'TypeScript', 'SCSS'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
  {
    slug: 'nature',
    name: 'Nature',
    platform: 'angular',
    summary: {
      en: 'Dynamic dashboards and reusable UI components for an enterprise Angular application.',
      ar: 'لوحات تحكّم ديناميكية ومكوّنات واجهة قابلة لإعادة الاستخدام لتطبيق Angular مؤسسي.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    technology: ['Angular', 'TypeScript'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: false,
  },
  {
    slug: 'egyptian-treasure',
    name: 'Egyptian Treasure',
    platform: 'angular',
    summary: {
      en: 'An enterprise Angular application supported by Eva Pharma.',
      ar: 'تطبيق Angular مؤسسي بدعم من إيفا فارما.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    technology: ['Angular', 'TypeScript'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
];

const magento: readonly Project[] = [
  {
    slug: '2b',
    name: '2B',
    platform: 'magento',
    summary: {
      en: 'Full storefront revamp on the Wide theme — CMS pages, responsive UI components, and front-end features as part of the Magento team.',
      ar: 'تجديد كامل للمتجر باستخدام قالب Wide — صفحات CMS ومكوّنات واجهة متجاوبة وخصائص أمامية ضمن فريق Magento.',
    },
    role: {
      en: 'Front-End Developer, Magento team',
      ar: 'مطوّر واجهات أمامية، فريق Magento',
    },
    technology: ['Magento 2', 'PHTML', 'LESS', 'JavaScript'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
  {
    slug: 'kaza',
    name: 'Kaza',
    platform: 'magento',
    summary: {
      en: 'Front-end features delivered through CMS work, PHTML customisation, module overrides, and UI enhancements.',
      ar: 'خصائص أمامية عبر إدارة المحتوى وتخصيص PHTML وتجاوز الوحدات وتحسينات الواجهة.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    technology: ['Magento 2', 'PHTML', 'JavaScript'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: false,
  },
  {
    slug: 'esterad',
    name: 'Esterad',
    platform: 'magento',
    summary: {
      en: 'Sole front-end developer on the Porto theme — UI features, theme customisation, and ongoing maintenance.',
      ar: 'المطوّر الأمامي الوحيد على قالب Porto — خصائص الواجهة وتخصيص القالب والصيانة المستمرة.',
    },
    role: {
      en: 'Sole Front-End Developer',
      ar: 'المطوّر الأمامي الوحيد',
    },
    technology: ['Magento 2', 'Porto theme', 'PHTML'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
];

const shopify: readonly Project[] = [
  {
    slug: 'designed-by-g',
    name: 'Designed by G',
    platform: 'shopify',
    summary: {
      en: 'A custom fashion storefront built with Liquid — responsive theme, custom sections, and performance work.',
      ar: 'متجر أزياء مخصّص مبني بـ Liquid — قالب متجاوب وأقسام مخصّصة وتحسينات للأداء.',
    },
    role: { en: 'Freelance Shopify Developer', ar: 'مطوّر Shopify مستقل' },
    technology: ['Shopify', 'Liquid', 'JavaScript'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
  {
    slug: 'nader-coffee',
    name: 'Nader Coffee',
    platform: 'shopify',
    summary: {
      en: 'A custom Shopify storefront with bespoke sections and third-party integrations.',
      ar: 'متجر Shopify مخصّص بأقسام مصمّمة خصيصاً وتكاملات مع خدمات خارجية.',
    },
    role: { en: 'Freelance Shopify Developer', ar: 'مطوّر Shopify مستقل' },
    technology: ['Shopify', 'Liquid'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: true,
  },
  {
    slug: 'vivace',
    name: 'Vivace',
    platform: 'shopify',
    summary: {
      en: 'A perfume storefront built on a customised Shopify theme.',
      ar: 'متجر عطور مبني على قالب Shopify مخصّص.',
    },
    role: { en: 'Freelance Shopify Developer', ar: 'مطوّر Shopify مستقل' },
    technology: ['Shopify', 'Liquid'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: false,
  },
  {
    slug: 'mistka-home',
    name: 'Mistka Home',
    platform: 'shopify',
    summary: {
      en: 'A homeware storefront with theme customisation and UI enhancements.',
      ar: 'متجر مستلزمات منزلية مع تخصيص القالب وتحسينات الواجهة.',
    },
    role: { en: 'Freelance Shopify Developer', ar: 'مطوّر Shopify مستقل' },
    technology: ['Shopify', 'Liquid'],
    url: null,
    logo: null,
    screenshot: null,
    gallery: [],
    featured: false,
  },
];

export const PROJECTS: readonly Project[] = [...angular, ...magento, ...shopify];

/**
 * Platform groups — the three strata of the Home composition.
 *
 * Order is deliberate and matches the header narrative: Angular first (the role
 * being applied for), Magento second (the enterprise depth), Shopify third (the
 * independent client work).
 */
export const PLATFORM_GROUPS: readonly PlatformGroup[] = [
  {
    platform: 'angular',
    label: 'Angular',
    summary: {
      en: 'Enterprise applications, complex dashboards, and reusable component systems.',
      ar: 'تطبيقات مؤسسية ولوحات تحكّم معقّدة وأنظمة مكوّنات قابلة لإعادة الاستخدام.',
    },
    projects: angular,
  },
  {
    platform: 'magento',
    label: 'Magento',
    summary: {
      en: 'High-traffic storefronts — theme customisation, module overrides, and performance.',
      ar: 'متاجر عالية الزيارات — تخصيص القوالب وتجاوز الوحدات وتحسين الأداء.',
    },
    projects: magento,
  },
  {
    platform: 'shopify',
    label: 'Shopify',
    summary: {
      en: 'Custom Liquid themes and bespoke sections for independent brands.',
      ar: 'قوالب Liquid مخصّصة وأقسام مصمّمة خصيصاً لعلامات تجارية مستقلة.',
    },
    projects: shopify,
  },
];

export const FEATURED_PROJECTS: readonly Project[] = PROJECTS.filter((p) => p.featured);

export function projectsByPlatform(platform: ProjectPlatform): readonly Project[] {
  return PROJECTS.filter((p) => p.platform === platform);
}
