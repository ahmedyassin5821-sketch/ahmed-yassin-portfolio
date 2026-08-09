import { Localized } from '@core/i18n/localized';
import { PlatformGroup, Project, ProjectPlatform } from './models/project.model';
import { PROJECT_MEDIA as M } from './project-media.generated';

/**
 * The projects Ahmed presents — a curated selection, not the whole body of work.
 *
 * `PROJECTS_SHIPPED` below is the real total. This array is what is *shown*, and
 * every count rendered anywhere on the site is derived from one or the other, so
 * the site can never imply that seven is all there is.
 *
 * ## What is and is not written here
 *
 * Every field is either stated by Ahmed, visible in the supplied captures, or
 * carried over from the established project data. Nothing is inferred to make an
 * entry look fuller: no business results, no metrics, no team sizes, no
 * ownership or "sole developer" claims, no invented technologies.
 *
 * `url` is `null` only where there genuinely is no public address — NAS HR is an
 * internal system — and the UI marks that state instead of linking nowhere.
 *
 * ## Media
 *
 * Paths and dimensions are spread in from `project-media.generated.ts`, written
 * by `npm run assets:projects` from the originals in `project-assets/`. Alt text
 * is authored here because only a person can write it. Referencing a shot by
 * property name means a renamed or deleted capture fails the build rather than
 * silently rendering a broken image.
 *
 * Several NAS HR and Nature captures carry irreversible redactions — real
 * employee data and development placeholder rows respectively. The redaction map
 * and its reasoning live in the script.
 */

const angular: readonly Project[] = [
  {
    slug: 'nas-hr',
    name: { en: 'NAS HR', ar: 'NAS HR' },
    platform: 'angular',
    projectType: {
      en: 'HR / Enterprise',
      ar: 'موارد بشرية / مؤسسي',
    },
    role: {
      en: 'Front-End / Angular Developer',
      ar: 'مطوّر واجهات أمامية / Angular',
    },
    summary: {
      en: 'An HR management system with dashboards for employees, payroll, requests, and attendance.',
      ar: 'نظام إدارة موارد بشرية مع لوحات تحكّم للموظفين والرواتب والطلبات والحضور.',
    },
    technology: ['Angular', 'TypeScript', 'SCSS'],
    theme: null,
    dashboard: true,
    // An internal system. There is no public address to link to.
    url: null,
    logo: {
      ...M['nas-hr'].logo,
      alt: { en: 'NAS HR logo', ar: 'شعار NAS HR' },
    },
    cover: {
      ...M['nas-hr'].shots.dashboard,
      alt: {
        en: 'NAS HR dashboard showing summary cards and an employee table',
        ar: 'لوحة تحكّم NAS HR تعرض بطاقات ملخّصة وجدول الموظفين',
      },
    },
    screenshots: [
      {
        ...M['nas-hr'].shots.employees,
        alt: {
          en: 'Employee directory with filtering, import, and export',
          ar: 'دليل الموظفين مع التصفية والاستيراد والتصدير',
        },
      },
      {
        ...M['nas-hr'].shots.penalties,
        alt: {
          en: 'Penalty records with an approve and reject workflow',
          ar: 'سجلات الجزاءات مع مسار الموافقة والرفض',
        },
      },
      {
        ...M['nas-hr'].shots['leave-requests'],
        alt: {
          en: 'Hourly leave requests with duration and balance columns',
          ar: 'طلبات الإذن بالساعات مع أعمدة المدة والرصيد',
        },
      },
      {
        ...M['nas-hr'].shots.attendance,
        alt: {
          en: 'Attendance records grouped by location and date',
          ar: 'سجلات الحضور مجمّعة حسب الموقع والتاريخ',
        },
      },
    ],
    featured: true,
  },

  {
    slug: 'nature',
    // Both names are the brand's own — the logo carries the Arabic form.
    name: { en: 'Nature', ar: 'الطبيعة' },
    platform: 'angular',
    projectType: {
      en: 'Environmental / Corporate',
      ar: 'بيئي / مؤسسي',
    },
    role: {
      en: 'Front-End / Angular Developer',
      ar: 'مطوّر واجهات أمامية / Angular',
    },
    summary: {
      en: 'A corporate site for an environmental and agricultural company, with an admin dashboard for managing projects, services, and content.',
      ar: 'موقع مؤسسي لشركة بيئية وزراعية، مع لوحة تحكّم لإدارة المشاريع والخدمات والمحتوى.',
    },
    technology: ['Angular', 'TypeScript'],
    theme: null,
    dashboard: true,
    url: 'https://www.neas.ae/',
    logo: {
      ...M.nature.logo,
      alt: { en: 'Nature logo', ar: 'شعار الطبيعة' },
    },
    cover: {
      ...M.nature.shots.home,
      alt: {
        en: 'Nature home page with a full-width mangrove landscape',
        ar: 'الصفحة الرئيسية لموقع الطبيعة بخلفية من أشجار المانغروف',
      },
    },
    screenshots: [
      {
        ...M.nature.shots.about,
        alt: {
          en: 'About section with company overview panels',
          ar: 'قسم “من نحن” مع لوحات تعريفية بالشركة',
        },
      },
      {
        ...M.nature.shots.reach,
        alt: {
          en: 'Regional coverage section rendered in Arabic',
          ar: 'قسم الانتشار الإقليمي معروضاً بالعربية',
        },
      },
      {
        ...M.nature.shots.blog,
        alt: {
          en: 'Blog listing with featured articles',
          ar: 'قائمة المقالات مع المقالات المميّزة',
        },
      },
      {
        ...M.nature.shots['admin-dashboard'],
        alt: {
          en: 'Admin dashboard with content totals and a recent projects table',
          ar: 'لوحة تحكّم الإدارة مع إجماليات المحتوى وجدول أحدث المشاريع',
        },
      },
      {
        ...M.nature.shots['admin-services'],
        alt: {
          en: 'Services management screen with per-language publishing toggles',
          ar: 'شاشة إدارة الخدمات مع مفاتيح النشر لكل لغة',
        },
      },
      {
        ...M.nature.shots['admin-projects'],
        alt: {
          en: 'Projects management screen with country, city, and locale columns',
          ar: 'شاشة إدارة المشاريع مع أعمدة الدولة والمدينة واللغة',
        },
      },
    ],
    featured: true,
  },
];

const magento: readonly Project[] = [
  {
    slug: '2b',
    name: { en: '2B', ar: '2B' },
    platform: 'magento',
    projectType: {
      en: 'Consumer Electronics / E-commerce',
      ar: 'إلكترونيات استهلاكية / تجارة إلكترونية',
    },
    role: {
      en: 'Front-End Magento Developer',
      ar: 'مطوّر واجهات أمامية Magento',
    },
    summary: {
      en: 'An electronics e-commerce storefront — product pages, cart, instalment plans, and checkout.',
      ar: 'متجر إلكترونيات — صفحات المنتجات والسلة وخطط التقسيط وإتمام الشراء.',
    },
    technology: ['Magento 2', 'PHTML', 'LESS', 'JavaScript'],
    theme: null,
    dashboard: false,
    url: 'https://2b.com.eg/',
    logo: {
      ...M['2b'].logo,
      alt: { en: '2B logo', ar: 'شعار 2B' },
    },
    cover: {
      ...M['2b'].shots.home,
      alt: {
        en: '2B home page with promotional banners and category shortcuts',
        ar: 'الصفحة الرئيسية لمتجر 2B مع لافتات العروض واختصارات الأقسام',
      },
    },
    screenshots: [
      {
        ...M['2b'].shots.deals,
        alt: {
          en: 'Deals section with instalment offers and brand tiles',
          ar: 'قسم العروض مع خطط التقسيط وبطاقات الماركات',
        },
      },
      {
        ...M['2b'].shots.product,
        alt: {
          en: 'Product page for a large appliance',
          ar: 'صفحة منتج لأحد الأجهزة المنزلية',
        },
      },
      {
        ...M['2b'].shots.cart,
        alt: {
          en: 'Shopping cart summary with order total',
          ar: 'ملخّص سلة التسوق مع إجمالي الطلب',
        },
      },
      {
        ...M['2b'].shots.instalments,
        alt: {
          en: 'Instalment plan comparison across finance providers',
          ar: 'مقارنة خطط التقسيط بين جهات التمويل',
        },
      },
      {
        ...M['2b'].shots.checkout,
        alt: {
          en: 'Checkout payment step with wallet and card options',
          ar: 'خطوة الدفع مع خيارات المحفظة والبطاقات',
        },
      },
    ],
    featured: true,
  },

  {
    slug: 'esterad',
    name: { en: 'Esterad', ar: 'Esterad' },
    platform: 'magento',
    projectType: {
      en: 'Technology / E-commerce',
      ar: 'تقنية / تجارة إلكترونية',
    },
    role: {
      en: 'Front-End Magento Developer',
      ar: 'مطوّر واجهات أمامية Magento',
    },
    summary: {
      en: 'An electronics storefront built on the Porto theme.',
      ar: 'متجر إلكترونيات مبني على قالب Porto.',
    },
    technology: ['Magento 2', 'PHTML', 'JavaScript'],
    theme: 'Porto',
    dashboard: false,
    url: 'https://esterad.com.eg/',
    logo: {
      ...M.esterad.logo,
      alt: { en: 'Esterad logo', ar: 'شعار Esterad' },
    },
    cover: {
      ...M.esterad.shots.home,
      alt: {
        en: 'Esterad home page with a laptop promotion banner',
        ar: 'الصفحة الرئيسية لمتجر Esterad مع لافتة عروض الحاسبات المحمولة',
      },
    },
    screenshots: [
      {
        ...M.esterad.shots.listing,
        alt: {
          en: 'Product listing page with laptop results',
          ar: 'صفحة قائمة المنتجات لنتائج الحاسبات المحمولة',
        },
      },
      {
        ...M.esterad.shots.brands,
        alt: {
          en: 'Brand strip above a product grid',
          ar: 'شريط الماركات أعلى شبكة المنتجات',
        },
      },
      {
        ...M.esterad.shots.categories,
        alt: {
          en: 'Category tiles across the storefront',
          ar: 'بطاقات الأقسام في المتجر',
        },
      },
      {
        ...M.esterad.shots.promotion,
        alt: {
          en: 'Promotional section with featured configurations',
          ar: 'قسم ترويجي يعرض تجهيزات مميّزة',
        },
      },
    ],
    featured: true,
  },
];

const shopify: readonly Project[] = [
  {
    slug: 'designed-by-g',
    name: { en: 'Designed by G', ar: 'Designed by G' },
    platform: 'shopify',
    projectType: {
      en: 'Fashion / Streetwear / E-commerce',
      ar: 'أزياء وستريت وير / تجارة إلكترونية',
    },
    role: { en: 'Shopify Developer', ar: 'مطوّر Shopify' },
    summary: {
      en: 'A fashion storefront on Shopify — collections, product pages, size guidance, and checkout.',
      ar: 'متجر أزياء على Shopify — التجميعات وصفحات المنتجات ودليل المقاسات وإتمام الشراء.',
    },
    technology: ['Shopify', 'Liquid', 'JavaScript'],
    theme: null,
    dashboard: false,
    url: 'https://www.designedby-g.com/',
    logo: {
      ...M['designed-by-g'].logo,
      alt: { en: 'Designed by G logo', ar: 'شعار Designed by G' },
    },
    cover: {
      ...M['designed-by-g'].shots.home,
      alt: {
        en: 'Designed by G home page with a dark editorial hero',
        ar: 'الصفحة الرئيسية لمتجر Designed by G بواجهة تحريرية داكنة',
      },
    },
    screenshots: [
      {
        ...M['designed-by-g'].shots.collection,
        alt: {
          en: 'Summer collection grid with product prices',
          ar: 'شبكة تجميعة الصيف مع أسعار المنتجات',
        },
      },
      {
        ...M['designed-by-g'].shots.editorial,
        alt: {
          en: 'Editorial collaboration section',
          ar: 'قسم التعاونات التحريرية',
        },
      },
      {
        ...M['designed-by-g'].shots.product,
        alt: {
          en: 'Product page with size selection',
          ar: 'صفحة منتج مع اختيار المقاس',
        },
      },
      {
        ...M['designed-by-g'].shots['size-guide'],
        alt: {
          en: 'Size recommendation dialog',
          ar: 'نافذة اقتراح المقاس',
        },
      },
      {
        ...M['designed-by-g'].shots.checkout,
        alt: {
          en: 'Checkout with contact and delivery fields',
          ar: 'صفحة إتمام الشراء مع حقول التواصل والتوصيل',
        },
      },
    ],
    featured: true,
  },

  {
    slug: 'nader-coffee',
    // The Arabic form is the one on the brand's own logo.
    name: { en: 'Nader Coffee', ar: 'بن نادر' },
    platform: 'shopify',
    projectType: {
      en: 'Coffee / Specialty Beverage / E-commerce',
      ar: 'قهوة ومشروبات مختصة / تجارة إلكترونية',
    },
    role: { en: 'Shopify Developer', ar: 'مطوّر Shopify' },
    summary: {
      en: 'A coffee storefront on Shopify — categories, offers, and checkout.',
      ar: 'متجر قهوة على Shopify — الأقسام والعروض وإتمام الشراء.',
    },
    technology: ['Shopify', 'Liquid'],
    theme: null,
    dashboard: false,
    url: 'https://www.nader-coffee.com/',
    logo: {
      ...M['nader-coffee'].logo,
      alt: { en: 'Nader Coffee logo', ar: 'شعار بن نادر' },
    },
    cover: {
      ...M['nader-coffee'].shots.home,
      alt: {
        en: 'Nader Coffee home page with an ordering promotion',
        ar: 'الصفحة الرئيسية لمتجر بن نادر مع لافتة الطلب',
      },
    },
    screenshots: [
      {
        ...M['nader-coffee'].shots.categories,
        alt: {
          en: 'Coffee categories by brewing style',
          ar: 'أقسام القهوة حسب طريقة التحضير',
        },
      },
      {
        ...M['nader-coffee'].shots.bestsellers,
        alt: {
          en: 'Best selling products grid',
          ar: 'شبكة المنتجات الأكثر مبيعاً',
        },
      },
      {
        ...M['nader-coffee'].shots.product,
        alt: {
          en: 'Product section with an add-to-cart panel',
          ar: 'قسم المنتج مع لوحة الإضافة إلى السلة',
        },
      },
      {
        ...M['nader-coffee'].shots.checkout,
        alt: {
          en: 'Checkout with shipping and payment options',
          ar: 'صفحة إتمام الشراء مع خيارات الشحن والدفع',
        },
      },
    ],
    featured: true,
  },

  {
    slug: 'vivace',
    name: { en: 'Vivace', ar: 'Vivace' },
    platform: 'shopify',
    projectType: {
      en: 'Perfume / Fragrance / E-commerce',
      ar: 'عطور / تجارة إلكترونية',
    },
    role: { en: 'Shopify Developer', ar: 'مطوّر Shopify' },
    summary: {
      en: 'A perfume storefront on Shopify.',
      ar: 'متجر عطور على Shopify.',
    },
    technology: ['Shopify', 'Liquid'],
    theme: null,
    dashboard: false,
    // Assets — logo, screenshots and the live address — have not been supplied
    // yet. Nothing here is guessed to fill the gap: the UI renders the token
    // placeholder frame, and populating this is a data edit when they arrive.
    url: null,
    logo: null,
    cover: null,
    screenshots: [],
    featured: true,
  },
];

/**
 * Total projects shipped across the career — not the length of this array.
 *
 * The showcase is curated; the number is not. Every "how many" string on the
 * site substitutes this, so the portfolio never implies that the seven projects
 * presented here are the whole record.
 */
export const PROJECTS_SHIPPED = 20;

export const PROJECTS: readonly Project[] = [...angular, ...magento, ...shopify];

/**
 * Platform labels.
 *
 * Held in one place rather than repeated on every project, and Latin in both
 * languages because these are product names — "Angular" is not translated.
 */
export const PLATFORM_LABELS: Record<ProjectPlatform, Localized> = {
  angular: { en: 'Angular', ar: 'Angular' },
  magento: { en: 'Magento', ar: 'Magento' },
  shopify: { en: 'Shopify', ar: 'Shopify' },
};

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

export function projectBySlug(slug: string): Project | undefined {
  return PROJECTS.find((p) => p.slug === slug);
}

/**
 * The project before and after `slug`, for detail-page navigation.
 *
 * Wraps around, so the last project's "next" is the first. A dead end at either
 * end of the list is a worse experience than a loop, and it keeps both controls
 * present on every page rather than disappearing at the edges.
 */
export function projectNeighbours(slug: string): { previous: Project; next: Project } | null {
  const index = PROJECTS.findIndex((p) => p.slug === slug);
  if (index === -1) return null;

  const count = PROJECTS.length;
  return {
    previous: PROJECTS[(index - 1 + count) % count],
    next: PROJECTS[(index + 1) % count],
  };
}
