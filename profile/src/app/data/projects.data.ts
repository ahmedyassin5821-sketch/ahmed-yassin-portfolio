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
 * Each project carries two separable things:
 *
 * - **The business** — `market`, `field`, `domain`, `brief`. Established from the
 *   client's own public site or a published source, and cited in
 *   `docs/ARCHITECTURE.md` §15. Never inferred from a screenshot alone.
 * - **Ahmed's part in it** — `role`, `technologies`, `theme`, `dashboard`. Taken
 *   from the CV in `Attachments/` or from what he stated directly.
 *
 * Keeping them apart is the point: describing a client's business in detail must
 * not read as a claim to have built that business. Nothing here states results,
 * metrics, traffic, revenue, team size, or ownership.
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
    market: { en: 'Egypt', ar: 'مصر' },
    field: {
      en: 'HR Technology / Enterprise Software',
      ar: 'تقنيات الموارد البشرية / برمجيات المؤسسات',
    },
    domain: { en: 'HR management platform', ar: 'منصة إدارة موارد بشرية' },
    brief: {
      en: 'An HR management platform for the Egyptian market. It covers employee records, attendance, hourly leave, penalties and payroll, with role-based dashboards and approval workflows, and it handles Egyptian labour-law, social-insurance and tax rules directly.',
      ar: 'منصة لإدارة الموارد البشرية موجّهة للسوق المصري. تغطي ملفات الموظفين والحضور والأذونات بالساعات والجزاءات والرواتب، مع لوحات تحكّم حسب الصلاحية ومسارات موافقة، وتتعامل مباشرة مع قواعد قانون العمل والتأمينات الاجتماعية والضرائب في مصر.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    // The project's team, stated because the real composition is known. Ahmed was
    // one of the three front-end developers; the backend was not his work, and
    // the product is not his. Nothing here is estimated.
    team: {
      en: '3 Front-End Developers · 4 Backend Developers',
      ar: '٣ مطوّري واجهات أمامية · ٤ مطوّري خدمات خلفية',
    },
    contribution: {
      en: 'Front-end development as one member of the front-end team.',
      ar: 'تطوير الواجهات الأمامية كأحد أعضاء فريق الواجهات الأمامية.',
    },
    technologies: ['Angular', 'TypeScript', 'SCSS'],
    theme: null,
    dashboard: true,
    // Sampled from the supplied mark: #11282b, a very dark slate beside cool
    // greys. NAS's own artwork is effectively monochrome, so its atmosphere is a
    // cool graphite rather than a hue it does not have.
    atmosphere: {
      surface: '#ecf0f4',
      surfaceStrong: '#d2dce4',
      border: '#aebfcb',
      text: '#121c23',
      textSecondary: '#314451',
      textMuted: '#495e6c',
      accent: '#11282b',
      glow: '#5cb6c1',
    },
    sculpture: null,
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
    market: { en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
    field: {
      en: 'Environmental & Agricultural Services',
      ar: 'خدمات بيئية وزراعية',
    },
    domain: {
      en: 'Corporate platform with content management',
      ar: 'منصة مؤسسية مع إدارة محتوى',
    },
    brief: {
      en: 'The corporate platform for Nature for Environmental and Agricultural Solutions L.L.C, a UAE company that cultivates and maintains mangrove trees and reserves, carries out environmental studies, and develops environmental, urban and eco-tourism projects. The bilingual public site is backed by an admin dashboard for managing projects, services and articles per language.',
      ar: 'المنصة المؤسسية لشركة الطبيعة للحلول البيئية والزراعية ذ.م.م في الإمارات، المتخصصة في زراعة أشجار وغابات المانغروف وصيانتها، وإعداد الدراسات البيئية، وتطوير المشاريع البيئية والعمرانية والسياحة البيئية. الموقع العام ثنائي اللغة تدعمه لوحة تحكّم لإدارة المشاريع والخدمات والمقالات لكل لغة.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    // Not stated: the composition of this project's team is not known, and a
    // headcount is not something to estimate. Nor is "· Solo" claimed here — the
    // site is backed by an admin system, so sole authorship is not established.
    team: null,
    contribution: {
      en: 'Front-end development of the bilingual public site and of the admin screens that manage its content.',
      ar: 'تطوير واجهات الموقع العام ثنائي اللغة وشاشات الإدارة التي تدير محتواه.',
    },
    technologies: ['Angular', 'TypeScript'],
    theme: null,
    dashboard: true,
    // Sampled from the mark: #7dc261, the leaf green of the logo's flame.
    atmosphere: {
      surface: '#eff6e9',
      surfaceStrong: '#d8e9cc',
      border: '#b9d5a5',
      text: '#18290d',
      textSecondary: '#3d5b27',
      textMuted: '#56773e',
      accent: '#3b6d27',
      glow: '#79c15c',
    },
    sculpture: null,
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
    market: { en: 'Egypt', ar: 'مصر' },
    field: {
      en: 'Consumer Electronics Retail',
      ar: 'تجزئة الإلكترونيات الاستهلاكية',
    },
    domain: { en: 'High-traffic e-commerce storefront', ar: 'متجر إلكتروني عالي الزيارات' },
    brief: {
      en: 'The online storefront of 2B, an Egyptian consumer-electronics retailer selling computers, mobiles, home appliances, televisions, audio and gaming both online and through its own branches. Beyond catalogue, cart and checkout it carries click-and-collect from those branches and instalment plans from several Egyptian finance providers.',
      ar: 'المتجر الإلكتروني لشركة 2B، إحدى شركات تجزئة الإلكترونيات الاستهلاكية في مصر، ويبيع الحاسبات والهواتف والأجهزة المنزلية والتلفزيونات والصوتيات والألعاب عبر الإنترنت وعبر فروعها. وإلى جانب الكتالوج والسلة وإتمام الشراء، يوفّر الاستلام من الفرع وخطط التقسيط من عدة جهات تمويل مصرية.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    // A backend team worked alongside him. Its size is not stated because it is
    // not known, and this project must never read as "built the whole platform".
    team: null,
    contribution: {
      en: 'Front-end and Magento theme work, as part of a project with a backend team.',
      ar: 'العمل على الواجهات الأمامية وقالب Magento، كجزء من مشروع يعمل فيه فريق البنية التحتية.',
    },
    technologies: ['Magento 2', 'PHTML', 'HTML', 'CSS', 'JavaScript'],
    // The revamp Ahmed contributed to ran on 2B's new Wide theme.
    theme: 'Wide',
    dashboard: false,
    // Their mark is white-and-orange artwork made for a dark neutral ground —
    // #f37021 exactly, read from the SVG source. So the paper is graphite, as the
    // logo's own ground is, and the orange arrives as the accent.
    atmosphere: {
      surface: '#edeff3',
      surfaceStrong: '#d4dae1',
      border: '#b2bbc7',
      text: '#151a21',
      textSecondary: '#363f4c',
      textMuted: '#4e5967',
      accent: '#9e3f06',
      glow: '#f3762a',
    },
    sculpture: null,
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
    market: { en: 'Egypt', ar: 'مصر' },
    field: {
      en: 'Consumer Electronics / Refurbished Devices',
      ar: 'إلكترونيات استهلاكية / أجهزة مجدّدة',
    },
    domain: { en: 'Refurbished-device e-commerce', ar: 'تجارة إلكترونية لأجهزة مجدّدة' },
    brief: {
      en: 'An Egyptian storefront for imported and refurbished computing hardware — laptops, desktops, Microsoft Surface devices and phones — sold as tested used equipment in working condition at a lower price than new. Every device is inspected before delivery and ships with a warranty and a return window.',
      ar: 'متجر مصري للأجهزة المستوردة والمجدّدة — حاسبات محمولة ومكتبية وأجهزة Microsoft Surface وهواتف — تُباع كأجهزة مستعملة مفحوصة بحالة تشغيل جيدة وبسعر أقل من الجديد. يُفحص كل جهاز قبل التسليم ويُشحن بضمان وفترة استبدال.',
    },
    role: {
      en: 'Front-End Developer',
      ar: 'مطوّر واجهات أمامية',
    },
    team: null,
    contribution: {
      // The CV says "Sole Front-End Magento developer" — the only front-end
      // developer on the project, which is not the same as having built the
      // platform. Both halves of that are said explicitly here.
      en: 'Sole front-end developer on the project, working with a backend team.',
      ar: 'مطوّر الواجهات الأمامية الوحيد في المشروع، بالعمل مع فريق البنية التحتية.',
    },
    technologies: ['Magento 2', 'PHTML', 'JavaScript'],
    theme: 'Porto',
    dashboard: false,
    // Sampled from the mark: near-black type #222021 with a green "e" #34b643.
    // Graphite-dominant, as the logo is, with the green as the accent.
    atmosphere: {
      surface: '#ecf4ee',
      surfaceStrong: '#d2e4d8',
      border: '#aecbb8',
      text: '#122318',
      textSecondary: '#31513c',
      textMuted: '#496c55',
      accent: '#1c6d26',
      glow: '#50cd5f',
    },
    sculpture: null,
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
    market: { en: 'Egypt', ar: 'مصر' },
    field: { en: 'Fashion / Apparel', ar: 'أزياء وملابس' },
    domain: {
      en: 'Direct-to-consumer fashion e-commerce',
      ar: 'تجارة إلكترونية مباشرة للأزياء',
    },
    brief: {
      en: 'The direct-to-consumer store for Designed by G, an Egyptian avant-garde fashion label. It sells denim, shirting, outerwear and bags in named collections and limited one-of-one pieces, alongside collaborations with Egyptian artists — a catalogue that runs from everyday basics to couture price points.',
      ar: 'المتجر المباشر للمستهلك لعلامة Designed by G، وهي علامة أزياء مصرية ذات طابع طليعي. تبيع الدنيم والقمصان والجاكيتات والحقائب ضمن تجميعات مسمّاة وقطع فريدة محدودة، إلى جانب تعاونات مع فنانين مصريين — كتالوج يمتد من القطع اليومية إلى أسعار الأزياء الراقية.',
    },
    // Two things, said in one line: the build was his, and so were the visuals.
    // "Visual Design" is scoped to this project — it is not, and must not become,
    // the professional title in `PROFESSIONAL_TITLE`.
    role: { en: 'Shopify Developer · Visual Design', ar: 'مطوّر Shopify · تصميم بصري' },
    // No separate backend team on the Shopify work, and no other developers to
    // state. Absence of a team row is itself the accurate answer here.
    team: null,
    contribution: {
      en: 'Independent Shopify build, plus the visual assets it presents — logos, banners and designs.',
      ar: 'تنفيذ مستقل لمتجر Shopify، مع الأصول البصرية التي يعرضها — الشعارات واللافتات والتصميمات.',
    },
    technologies: ['Shopify', 'Liquid', 'JavaScript'],
    theme: null,
    dashboard: false,
    // Sampled from the mark: #771415 oxblood running down to #2d0809 near-black.
    // The red/black the brand actually uses, as a tinted paper rather than a field.
    atmosphere: {
      surface: '#f6e9e9',
      surfaceStrong: '#e9cccc',
      border: '#d5a5a5',
      text: '#290d0d',
      textSecondary: '#5b2727',
      textMuted: '#773e3e',
      accent: '#771415',
      glow: '#df3f41',
    },
    // A jacket, on the user's explicit instruction after Sprint 9 had left this
    // `null`. Built as a garment on a hanger from lathed and extruded primitives —
    // see `sculpture-scene.ts` for what that does and does not attempt.
    sculpture: 'jacket',
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
    market: { en: 'Egypt', ar: 'مصر' },
    field: { en: 'Coffee / Food & Beverage', ar: 'قهوة / أغذية ومشروبات' },
    domain: {
      en: 'Direct-to-consumer coffee e-commerce',
      ar: 'تجارة إلكترونية مباشرة للقهوة',
    },
    brief: {
      en: 'A direct-to-consumer coffee platform serving the Egyptian market. It sells Turkish, espresso, American, Arabic, specialty and flavoured coffee — ground and whole bean, from 10 g sachets to one-kilogram bags — with bundles that pair beans with brewing equipment.',
      ar: 'منصة قهوة تبيع مباشرة للمستهلك في السوق المصري. تقدّم القهوة التركي والإسبريسو والأمريكي والعربي والمختصة وبنكهات مميّزة — مطحونة وحبوباً كاملة، من أظرف 10 جرام إلى أكياس الكيلو — مع عروض تجمع البن مع أدوات التحضير.',
    },
    role: { en: 'Shopify Developer · Visual Design', ar: 'مطوّر Shopify · تصميم بصري' },
    team: null,
    contribution: {
      en: 'Independent Shopify build, plus the visual assets it presents — logos, banners and designs.',
      ar: 'تنفيذ مستقل لمتجر Shopify، مع الأصول البصرية التي يعرضها — الشعارات واللافتات والتصميمات.',
    },
    technologies: ['Shopify', 'Liquid'],
    theme: null,
    dashboard: false,
    // Sampled from the mark: #2e2018 through #5f4c30 — roasted-bean browns.
    atmosphere: {
      surface: '#f6efe9',
      surfaceStrong: '#e9dacc',
      border: '#d5bba5',
      text: '#291a0d',
      textSecondary: '#5b3f27',
      textMuted: '#77593e',
      accent: '#5f4c30',
      glow: '#c1985c',
    },
    sculpture: 'coffee-bean',
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
    market: { en: 'United Arab Emirates & Qatar', ar: 'الإمارات العربية المتحدة وقطر' },
    field: { en: 'Fragrance / Luxury Retail', ar: 'عطور / تجزئة فاخرة' },
    domain: { en: 'Niche perfume e-commerce', ar: 'تجارة إلكترونية للعطور النيتشية' },
    brief: {
      en: 'Vivace Perfumes — “House of Artisanal Fragrance” — retails niche and artisanal perfume houses such as Areej Le Doré, Agar Aura, Laurent Smal, Elixir Attar and Aton alongside its own Vivace line. It runs from stores in the UAE and Qatar, with a multi-currency storefront, worldwide delivery and instalment payment.',
      ar: 'Vivace Perfumes — «بيت العطور الحرفية» — تبيع عطور دور نيتشية وحرفية مثل Areej Le Doré وAgar Aura وLaurent Smal وElixir Attar وAton، إلى جانب خطها الخاص Vivace. تعمل من متاجرها في الإمارات وقطر، بمتجر متعدد العملات وتوصيل عالمي ودفع بالتقسيط.',
    },
    // No design contribution claimed here. The visual work was stated for
    // Designed by G and Nader Coffee specifically, and extending it to a third
    // project would be inventing a responsibility.
    role: { en: 'Shopify Developer', ar: 'مطوّر Shopify' },
    team: null,
    contribution: {
      en: 'Independent Shopify build — theme, custom sections and the multi-brand storefront structure.',
      ar: 'تنفيذ مستقل لمتجر Shopify — القالب والأقسام المخصّصة وبنية المتجر متعدد الماركات.',
    },
    technologies: ['Shopify', 'Liquid'],
    theme: null,
    dashboard: false,
    // Sampled from the mark: #103b3e, the deep teal of the VIVACE wordmark — the
    // same teal the storefront's own header carries.
    atmosphere: {
      surface: '#e9f5f6',
      surfaceStrong: '#cce7e9',
      border: '#a5d1d5',
      text: '#0d2729',
      textSecondary: '#27585b',
      textMuted: '#3e7477',
      accent: '#103b3e',
      glow: '#4dc8d1',
    },
    sculpture: 'perfume-bottle',
    url: 'https://www.vivace.shop/',
    logo: {
      ...M.vivace.logo,
      alt: { en: 'Vivace Perfumes logo', ar: 'شعار Vivace Perfumes' },
    },
    cover: {
      ...M.vivace.shots.home,
      alt: {
        en: 'Vivace home page with a campaign banner for a perfume release',
        ar: 'الصفحة الرئيسية لمتجر Vivace مع لافتة إطلاق أحد العطور',
      },
    },
    screenshots: [
      {
        ...M.vivace.shots.brands,
        alt: {
          en: 'Exclusive brands grid, one panel per perfume house',
          ar: 'شبكة الماركات الحصرية، بلوحة لكل دار عطور',
        },
      },
      {
        ...M.vivace.shots.menu,
        alt: {
          en: 'Multi-level brands menu open over the storefront',
          ar: 'قائمة الماركات متعددة المستويات مفتوحة فوق المتجر',
        },
      },
      {
        ...M.vivace.shots.merchandising,
        alt: {
          en: 'Last-piece section listing bottles with only one unit left',
          ar: 'قسم القطع الأخيرة الذي يعرض العبوات المتبقية بوحدة واحدة',
        },
      },
      {
        ...M.vivace.shots.product,
        alt: {
          en: 'Product page with size options and an illustrated note list',
          ar: 'صفحة المنتج مع خيارات الحجم وقائمة مصوّرة للمكوّنات العطرية',
        },
      },
      {
        ...M.vivace.shots.cart,
        alt: {
          en: 'Cart drawer with the order subtotal',
          ar: 'درج السلة مع الإجمالي الفرعي للطلب',
        },
      },
      {
        ...M.vivace.shots.checkout,
        alt: {
          en: 'Checkout payment step with card, Instapay and transfer options',
          ar: 'خطوة الدفع مع خيارات البطاقة وInstapay والتحويل',
        },
      },
    ],
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

/**
 * The showcase, in priority order: **Shopify, then Angular, then Magento.**
 *
 * Shopify leads because it is the work that is most completely Ahmed's — the
 * storefront and, on two of the three, the visual assets as well — and because
 * selling online is what most businesses arriving here are trying to do.
 *
 * This array is the single source of the ordering. `/work`, its category
 * sections, the numerals 01–07, the detail pages' previous/next, and the order of
 * the Home corridor's gates are all derived from it, so the hierarchy is stated
 * once. Changing it here changes it everywhere — including the depth each gate
 * sits at in the corridor, which `camera-path.ts` derives from `GATE_ACTS`.
 */
export const PROJECTS: readonly Project[] = [...shopify, ...angular, ...magento];

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
 * Platform groups — the three strata, in the same priority as `PROJECTS`.
 *
 * Each summary says what the platform does *for a business*, not what it is made
 * of. A reader deciding whether to hire someone is asking what they will get, and
 * "reusable component systems" answers a different question.
 */
export const PLATFORM_GROUPS: readonly PlatformGroup[] = [
  {
    platform: 'shopify',
    label: 'Shopify',
    summary: {
      en: 'Shopify stores that turn a product range into an online shopping experience — and, where it was mine to do, the visual assets they present.',
      ar: 'متاجر Shopify تحوّل تشكيلة المنتجات إلى تجربة شراء عبر الإنترنت — ومعها الأصول البصرية التي تعرضها، حيث كان ذلك من عملي.',
    },
    projects: shopify,
  },
  {
    platform: 'angular',
    label: 'Angular',
    summary: {
      en: 'Custom web experiences for businesses that need more than a standard storefront — a platform, a catalogue, or a system with its own admin.',
      ar: 'تجارب ويب مخصّصة للأعمال التي تحتاج أكثر من متجر جاهز — منصة أو كتالوج أو نظام بلوحة إدارة خاصة به.',
    },
    projects: angular,
  },
  {
    platform: 'magento',
    label: 'Magento',
    summary: {
      en: 'Storefronts built to carry a large catalogue, and the operational detail that comes with retail at scale.',
      ar: 'متاجر مبنية لتحمل كتالوجات كبيرة، وما يرافق التجزئة الواسعة من تفاصيل تشغيلية.',
    },
    projects: magento,
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
