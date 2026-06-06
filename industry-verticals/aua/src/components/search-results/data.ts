/**
 * Mock search catalog for AUA (American Urological Association).
 * Data only — UI lives in SearchResults.tsx.
 */

export type DemoUserTaxonomy =
  | 'Urology Residents & Trainees'
  | 'Community Practice Urologists'
  | 'Academic & Research Urologists';

export type SearchContentType = 'product' | 'blog' | 'service' | 'content';

/** Left-rail facet: AUA area of need */
export type SearchCategory =
  | 'buildingMaterials'
  | 'windowsDoorsMillwork'
  | 'manufacturedComponents'
  | 'digitalTools'
  | 'builderServices'
  | 'resources';

/** Program / property family facet */
export type SearchBrand = 'buildersFirstSource' | 'mybldr' | 'readyFrame' | 'designUltra';

/** Keyword buckets for curated searches */
export type SearchBucket =
  | 'products'
  | 'services'
  | 'mybldr'
  | 'windows'
  | 'readyFrame'
  | 'advancedManufacturing';

export type SearchResultItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  contentType: SearchContentType;
  categories: SearchCategory[];
  brands: SearchBrand[];
  searchBuckets: SearchBucket[];
  dateLabel?: string;
  breadcrumb?: string[];
  matchTerms?: string[];
  imageSrc?: string;
  isNew?: boolean;
  demoUserTaxonomy?: DemoUserTaxonomy;
  visibleForDemoUsers?: DemoUserTaxonomy[];
  sku?: string;
  priceLabel?: string;
};

export type AiSearchInsight = {
  id: string;
  headline: string;
  body: string;
  bullets: string[];
  learnMoreHref: string;
  learnMoreLabel?: string;
};

export const AUA_BASE = 'https://www.auanet.org/';

export const RESULTS_PAGE_SIZE = 9;

export const searchFacetLabels = {
  contentType: {
    product: 'Courses & CME',
    blog: 'News & stories',
    service: 'Programs & services',
    content: 'Content & resources',
  },
  category: {
    buildingMaterials: 'Clinical practice & guidelines',
    windowsDoorsMillwork: 'Patient education & public health',
    manufacturedComponents: 'Research & quality registries',
    digitalTools: 'Digital tools & myAUA',
    builderServices: 'Member services & support',
    resources: 'News & publications',
  },
  brand: {
    buildersFirstSource: 'AUA',
    mybldr: 'AUAUniversity',
    readyFrame: 'AUA Journals',
    designUltra: 'Urology Care Foundation',
  },
} as const;

export const popularSearches = [
  'Annual Meeting',
  'CME credits',
  'Prostate cancer guidelines',
  'AQUA registry',
  'myAUA',
];

export const QUERY_BUCKET_SYNONYMS: Record<SearchBucket, readonly string[]> = {
  products: [
    'course',
    'courses',
    'cme',
    'credit',
    'credits',
    'education',
    'learning',
    'webinar',
    'webinars',
    'certification',
    'training',
    'auauniversity',
  ],
  services: [
    'service',
    'services',
    'membership',
    'member',
    'support',
    'advocacy',
    'career',
    'practice management',
    'reimbursement',
    'coding',
  ],
  mybldr: [
    'myaua',
    'my aua',
    'member portal',
    'login',
    'account',
    'profile',
    'dashboard',
    'digital',
    'portal',
  ],
  windows: [
    'aqua',
    'registry',
    'research',
    'quality',
    'data',
    'outcomes',
    'registry data',
    'clinical registry',
    'mips',
  ],
  readyFrame: [
    'guideline',
    'guidelines',
    'clinical practice',
    'standard',
    'standards',
    'recommendation',
    'best practice',
    'aua guideline',
  ],
  advancedManufacturing: [
    'innovation',
    'policy',
    'advocacy',
    'legislative',
    'nexus',
    'technology',
    'artificial intelligence',
    'ai',
    'health policy',
  ],
};

const QUERY_STOP_WORDS = new Set(['and', 'or', 'the', 'for', 'with', 'from', 'your', 'our', 'are', 'you']);

/** Stable demo card images via picsum.photos (deterministic seeds, no hotlink failures). */
const SEARCH_CARD_IMAGE_SEEDS: readonly string[] = [
  'aua-clinical-01',
  'aua-clinical-02',
  'aua-clinical-03',
  'aua-clinical-04',
  'aua-clinical-05',
  'aua-clinical-06',
  'aua-clinical-07',
  'aua-clinical-08',
  'aua-clinical-09',
  'aua-clinical-10',
  'aua-clinical-11',
  'aua-clinical-12',
];

function buildCatalogImageUrl(seed: string, width = 900, height = 560): string {
  return `https://picsum.photos/seed/${seed}/${width}/${height}`;
}

export const SEARCH_CARD_IMAGE_URLS: readonly string[] = SEARCH_CARD_IMAGE_SEEDS.map((seed) =>
  buildCatalogImageUrl(seed)
);

function catalogDemoImage(slot: number): string {
  const len = SEARCH_CARD_IMAGE_SEEDS.length;
  const seed = SEARCH_CARD_IMAGE_SEEDS[((slot % len) + len) % len]!;
  return buildCatalogImageUrl(seed);
}

export function getDefaultCardImage(): string {
  return catalogDemoImage(0);
}

export function parseDemoUserTaxonomy(raw: string | undefined | null): DemoUserTaxonomy | null {
  const t = raw?.trim();
  if (
    t === 'Urology Residents & Trainees' ||
    t === 'Community Practice Urologists' ||
    t === 'Academic & Research Urologists'
  ) {
    return t;
  }
  return null;
}

export function normalizeQuery(q: string): string {
  return q.toLowerCase().trim().replace(/\s+/g, ' ');
}

export function detectSearchBuckets(q: string): SearchBucket[] {
  const n = normalizeQuery(q);
  if (!n) return [];
  const words = n.split(/\s+/).filter(Boolean);
  const hits = new Set<SearchBucket>();
  for (const [bucket, synonyms] of Object.entries(QUERY_BUCKET_SYNONYMS) as [SearchBucket, readonly string[]][]) {
    for (const syn of synonyms) {
      if (n.includes(syn) || words.some((w) => w.length > 2 && syn.startsWith(w))) {
        hits.add(bucket);
        break;
      }
    }
  }
  return [...hits];
}

export function itemVisibleForDemoUser(item: SearchResultItem, user: DemoUserTaxonomy | null): boolean {
  if (!item.visibleForDemoUsers?.length) return true;
  if (!user) return false;
  return item.visibleForDemoUsers.includes(user);
}

function itemMatchesBuckets(item: SearchResultItem, buckets: SearchBucket[]): boolean {
  if (!buckets.length) return true;
  return buckets.some((b) => item.searchBuckets.includes(b));
}

function significantQueryWords(n: string): string[] {
  return n
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !QUERY_STOP_WORDS.has(w));
}

export function itemMatchesQuery(item: SearchResultItem, q: string): boolean {
  const n = normalizeQuery(q);
  if (!n) return true;
  const buckets = detectSearchBuckets(n);
  if (buckets.length && !itemMatchesBuckets(item, buckets)) return false;
  const hay = [
    item.title,
    item.description,
    ...(item.breadcrumb ?? []),
    ...(item.matchTerms ?? []),
    ...(item.sku ? [item.sku] : []),
  ]
    .join(' ')
    .toLowerCase();
  const words = significantQueryWords(n);
  if (!words.length) return true;
  if (buckets.length) return words.some((w) => hay.includes(w));
  return words.every((w) => hay.includes(w));
}

export function relevanceScore(
  item: SearchResultItem,
  q: string,
  activeDemoUserTaxonomy: DemoUserTaxonomy | null
): number {
  const n = normalizeQuery(q);
  if (!n) return 0;
  const words = significantQueryWords(n);
  const title = item.title.toLowerCase();
  const desc = item.description.toLowerCase();
  const crumbs = (item.breadcrumb ?? []).join(' ').toLowerCase();
  const extra = (item.matchTerms ?? []).join(' ').toLowerCase();
  let score = 0;
  for (const w of words) {
    if (title.includes(w)) score += 5;
    if (desc.includes(w)) score += 2;
    if (crumbs.includes(w)) score += 1;
    if (extra.includes(w)) score += 3;
  }
  if (activeDemoUserTaxonomy && item.demoUserTaxonomy === activeDemoUserTaxonomy) score += 25;
  for (const b of detectSearchBuckets(n)) {
    if (item.searchBuckets.includes(b)) score += 8;
  }
  return score;
}

export function supplementalResultsForDemoUserTaxonomy(persona: DemoUserTaxonomy): SearchResultItem[] {
  const code =
    persona === 'Urology Residents & Trainees'
      ? 'urt'
      : persona === 'Community Practice Urologists'
        ? 'cpu'
        : 'aru';

  const rows: Omit<SearchResultItem, 'id' | 'demoUserTaxonomy'>[] =
    persona === 'Urology Residents & Trainees'
      ? [
          {
            title: 'Resident quick path: curriculum resources, board prep, and Annual Meeting programming',
            description:
              'A resident-focused view of AUAUniversity courses, in-training exam resources, and resident events at the AUA Annual Meeting.',
            href: `${AUA_BASE}meetings-and-education/aua-university`,
            contentType: 'service',
            categories: ['builderServices', 'digitalTools'],
            brands: ['mybldr', 'buildersFirstSource'],
            searchBuckets: ['services', 'products'],
            dateLabel: 'Personalized guide',
            breadcrumb: ['Education', 'Residents & trainees'],
            matchTerms: ['resident', 'trainee', 'board prep', 'curriculum', 'annual meeting'],
            imageSrc: catalogDemoImage(0),
            isNew: true,
          },
          {
            title: 'AUAUniversity courses for urology residents',
            description:
              'On-demand and live CME aligned to residency milestones — from foundational science to procedural skills and professional development.',
            href: `${AUA_BASE}meetings-and-education/aua-university`,
            contentType: 'product',
            categories: ['buildingMaterials', 'digitalTools'],
            brands: ['mybldr', 'buildersFirstSource'],
            searchBuckets: ['products', 'services'],
            priceLabel: 'Member pricing',
            dateLabel: 'Course catalog',
            breadcrumb: ['AUAUniversity', 'Residents'],
            matchTerms: ['resident', 'cme', 'course', 'training', 'skills'],
            imageSrc: catalogDemoImage(1),
          },
        ]
      : persona === 'Community Practice Urologists'
        ? [
            {
              title: 'Practice management hub for community urologists',
              description:
                'Coding, reimbursement, staffing, and operational resources to help independent and group practices run efficiently.',
              href: `${AUA_BASE}practice-management`,
              contentType: 'content',
              categories: ['builderServices', 'resources'],
              brands: ['buildersFirstSource'],
              searchBuckets: ['services', 'products'],
              dateLabel: 'Personalized resource',
              breadcrumb: ['Practice management', 'Community practice'],
              matchTerms: ['practice management', 'coding', 'reimbursement', 'community', 'group practice'],
              imageSrc: catalogDemoImage(2),
              isNew: true,
            },
            {
              title: 'CME bundles for maintenance of certification',
              description:
                'Curated AUAUniversity credit packages for practicing urologists maintaining ABU certification and state licensure requirements.',
              href: `${AUA_BASE}meetings-and-education/aua-university`,
              contentType: 'product',
              categories: ['buildingMaterials', 'digitalTools'],
              brands: ['mybldr', 'buildersFirstSource'],
              searchBuckets: ['products', 'services'],
              priceLabel: 'Member pricing',
              dateLabel: 'Personalized CME',
              breadcrumb: ['AUAUniversity', 'Practicing urologists'],
              matchTerms: ['moc', 'certification', 'cme credits', 'practicing', 'community'],
              imageSrc: catalogDemoImage(3),
            },
          ]
        : [
            {
              title: 'AQUA registry: quality reporting and research participation',
              description:
                'Join the AUA Quality (AQUA) Registry to benchmark outcomes, satisfy quality reporting programs, and contribute urology-specific data.',
              href: `${AUA_BASE}research-and-data/aua-quality-aqua-registry`,
              contentType: 'service',
              categories: ['manufacturedComponents', 'builderServices'],
              brands: ['buildersFirstSource'],
              searchBuckets: ['windows', 'advancedManufacturing'],
              dateLabel: 'Personalized program',
              breadcrumb: ['Research & data', 'AQUA Registry'],
              matchTerms: ['aqua', 'registry', 'quality', 'research', 'outcomes'],
              imageSrc: catalogDemoImage(4),
              isNew: true,
            },
            {
              title: 'Journal author resources and submission guidelines',
              description:
                'Guidance for academic urologists submitting to The Journal of Urology and other AUA publications — formatting, peer review, and open access options.',
              href: 'https://www.auajournals.org/',
              contentType: 'content',
              categories: ['resources', 'manufacturedComponents'],
              brands: ['readyFrame', 'buildersFirstSource'],
              searchBuckets: ['windows', 'readyFrame'],
              dateLabel: 'Personalized publishing',
              breadcrumb: ['Publications', 'AUA Journals'],
              matchTerms: ['journal', 'research', 'academic', 'submission', 'publication'],
              imageSrc: catalogDemoImage(5),
            },
          ];

  return rows.map((row, i) => ({
    ...row,
    id: `demo-sup-${code}-${i + 1}`,
    demoUserTaxonomy: persona,
  }));
}

function result(partial: Omit<SearchResultItem, 'href'> & { href?: string }): SearchResultItem {
  return {
    href: partial.href ?? AUA_BASE,
    imageSrc: partial.imageSrc ?? catalogDemoImage(6),
    ...partial,
  };
}

export const searchCatalog: SearchResultItem[] = [
  result({
    id: 'content-home-aua',
    title: 'American Urological Association — advancing urology worldwide',
    description:
      'The AUA promotes the highest standards of urological clinical care through education, research, and advocacy — serving urologists, trainees, and the patients they treat.',
    contentType: 'content',
    categories: ['resources', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'services'],
    dateLabel: 'Organization overview',
    breadcrumb: ['Home', 'AUA'],
    matchTerms: ['american urological association', 'aua', 'urology', 'education', 'advocacy'],
    imageSrc: catalogDemoImage(7),
  }),
  result({
    id: 'content-myaua',
    title: 'myAUA member portal',
    description:
      'Sign in to myAUA to manage membership, access CME transcripts, update your profile, and connect with AUA communities and resources.',
    href: `${AUA_BASE}membership/member-central/myaua`,
    contentType: 'content',
    categories: ['digitalTools'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['mybldr', 'services'],
    dateLabel: 'Digital tool',
    breadcrumb: ['Membership', 'myAUA'],
    matchTerms: ['myaua', 'member portal', 'login', 'account', 'profile'],
    imageSrc: catalogDemoImage(8),
    isNew: true,
  }),
  result({
    id: 'content-myaua-dashboard',
    title: 'myAUA dashboard: CME transcripts and membership benefits',
    description:
      'View earned CME credits, membership status, and personalized recommendations from AUAUniversity and Annual Meeting programming.',
    href: `${AUA_BASE}membership/member-central/myaua`,
    contentType: 'content',
    categories: ['digitalTools'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['mybldr'],
    dateLabel: 'Portal feature',
    breadcrumb: ['myAUA', 'Dashboard'],
    matchTerms: ['dashboard', 'cme transcript', 'membership benefits', 'personalized'],
    imageSrc: catalogDemoImage(9),
  }),
  result({
    id: 'content-membership',
    title: 'AUA membership — join or renew',
    description:
      'Membership connects urologists to CME, clinical guidelines, advocacy, peer networks, and exclusive access to AUAUniversity and the Annual Meeting.',
    href: `${AUA_BASE}membership`,
    contentType: 'content',
    categories: ['builderServices', 'digitalTools'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'mybldr'],
    dateLabel: 'Membership',
    breadcrumb: ['Membership', 'Join or renew'],
    matchTerms: ['membership', 'join', 'renew', 'member benefits', 'dues'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'content-find-guidelines',
    title: 'AUA clinical practice guidelines library',
    description:
      'Search evidence-based AUA guidelines across urologic conditions — prostate cancer, BPH, stone disease, incontinence, and more.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines`,
    contentType: 'content',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['readyFrame', 'products'],
    dateLabel: 'Guidelines library',
    breadcrumb: ['Guidelines & quality', 'Clinical guidelines'],
    matchTerms: ['guidelines', 'clinical practice', 'evidence-based', 'standard of care', 'aua guideline'],
    imageSrc: catalogDemoImage(11),
  }),

  result({
    id: 'product-auauniversity-cme',
    title: 'AUAUniversity on-demand CME courses',
    description:
      'Earn AMA PRA Category 1 Credit™ with on-demand courses covering urologic oncology, reconstructive surgery, pediatrics, and practice management.',
    href: `${AUA_BASE}meetings-and-education/aua-university`,
    contentType: 'product',
    categories: ['buildingMaterials', 'digitalTools'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['products', 'mybldr'],
    priceLabel: 'Member & non-member rates',
    dateLabel: 'Featured catalog',
    breadcrumb: ['AUAUniversity', 'On-demand CME'],
    matchTerms: ['cme', 'on-demand', 'course', 'credit', 'auauniversity'],
    imageSrc: catalogDemoImage(0),
    isNew: true,
  }),
  result({
    id: 'product-live-webinars',
    title: 'AUAUniversity live webinars',
    description:
      'Interactive live sessions with expert faculty on emerging topics — prostate cancer screening updates, surgical techniques, and health policy.',
    href: `${AUA_BASE}meetings-and-education/aua-university`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['products'],
    priceLabel: 'Registration required',
    dateLabel: 'Live education',
    breadcrumb: ['AUAUniversity', 'Webinars'],
    matchTerms: ['webinar', 'live', 'cme', 'interactive', 'faculty'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'product-annual-meeting-cme',
    title: 'AUA Annual Meeting CME programming',
    description:
      'The premier urology educational event — plenary sessions, instructional courses, hands-on workshops, and poster sessions with CME credit.',
    href: `${AUA_BASE}meetings-and-education/annual-meeting`,
    contentType: 'product',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource', 'mybldr'],
    searchBuckets: ['products', 'services'],
    priceLabel: 'Meeting registration',
    dateLabel: 'Annual Meeting',
    breadcrumb: ['Meetings', 'Annual Meeting CME'],
    matchTerms: ['annual meeting', 'cme', 'conference', 'workshop', 'plenary'],
    imageSrc: catalogDemoImage(2),
  }),
  result({
    id: 'product-board-review',
    title: 'AUA board review and self-assessment',
    description:
      'Structured review materials and self-assessment exams to support urology residents and practicing urologists preparing for certification.',
    href: `${AUA_BASE}meetings-and-education/aua-university`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['mybldr'],
    searchBuckets: ['products'],
    priceLabel: 'Member pricing',
    dateLabel: 'Exam prep',
    breadcrumb: ['AUAUniversity', 'Board review'],
    matchTerms: ['board review', 'self-assessment', 'certification', 'exam prep', 'qualifying exam'],
    imageSrc: catalogDemoImage(3),
  }),
  result({
    id: 'product-prostate-guideline-course',
    title: 'CME course: AUA prostate cancer guideline updates',
    description:
      'On-demand course reviewing the latest AUA prostate cancer detection and localized disease management guideline recommendations.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines/prostate-cancer`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['products', 'readyFrame'],
    priceLabel: 'CME credit available',
    dateLabel: 'Guideline CME',
    breadcrumb: ['Guidelines', 'Prostate cancer'],
    matchTerms: ['prostate cancer', 'guideline', 'screening', 'psa', 'detection'],
    imageSrc: catalogDemoImage(4),
    isNew: true,
  }),
  result({
    id: 'product-bph-guideline-course',
    title: 'CME course: benign prostatic hyperplasia management',
    description:
      'Educational module aligned to AUA BPH guidelines — medical therapy, minimally invasive procedures, and surgical options.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines/benign-prostatic-hyperplasia-bph`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['products', 'readyFrame'],
    priceLabel: 'CME credit available',
    dateLabel: 'Guideline CME',
    breadcrumb: ['Guidelines', 'BPH'],
    matchTerms: ['bph', 'benign prostatic hyperplasia', 'guideline', 'LUTS', 'treatment'],
    imageSrc: catalogDemoImage(5),
  }),
  result({
    id: 'product-stone-disease-course',
    title: 'CME course: surgical management of kidney stones',
    description:
      'Course covering AUA guideline recommendations for metabolic evaluation, medical expulsive therapy, and surgical stone removal.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines/kidney-stones`,
    contentType: 'product',
    categories: ['buildingMaterials'],
    brands: ['mybldr'],
    searchBuckets: ['products'],
    priceLabel: 'CME credit available',
    dateLabel: 'Guideline CME',
    breadcrumb: ['Guidelines', 'Kidney stones'],
    matchTerms: ['kidney stone', 'nephrolithiasis', 'urolithiasis', 'guideline', 'surgical'],
    imageSrc: catalogDemoImage(6),
  }),
  result({
    id: 'product-incontinence-course',
    title: 'CME course: female stress urinary incontinence',
    description:
      'Review AUA/SUFU guideline pathways for evaluation and treatment of stress urinary incontinence in women.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines/stress-urinary-incontinence`,
    contentType: 'product',
    categories: ['buildingMaterials', 'windowsDoorsMillwork'],
    brands: ['mybldr', 'buildersFirstSource'],
    searchBuckets: ['products', 'readyFrame'],
    priceLabel: 'CME credit available',
    dateLabel: 'Guideline CME',
    breadcrumb: ['Guidelines', 'Incontinence'],
    matchTerms: ['incontinence', 'sui', 'stress urinary', 'guideline', 'female'],
    imageSrc: catalogDemoImage(7),
  }),

  result({
    id: 'service-advocacy',
    title: 'AUA advocacy and health policy',
    description:
      'The AUA advocates for urology on Capitol Hill and with federal agencies — protecting scope of practice, reimbursement, and patient access to care.',
    href: `${AUA_BASE}advocacy`,
    contentType: 'service',
    categories: ['builderServices', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'advancedManufacturing'],
    dateLabel: 'Advocacy',
    breadcrumb: ['Advocacy', 'Health policy'],
    matchTerms: ['advocacy', 'policy', 'legislative', 'reimbursement', 'scope of practice'],
    imageSrc: catalogDemoImage(8),
  }),
  result({
    id: 'service-aqua-registry',
    title: 'AQUA Registry — urology quality reporting',
    description:
      'Participate in the AUA Quality (AQUA) Registry to track outcomes, meet MIPS requirements, and advance urology-specific quality measures.',
    href: `${AUA_BASE}research-and-data/aua-quality-aqua-registry`,
    contentType: 'service',
    categories: ['manufacturedComponents', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['windows', 'services'],
    dateLabel: 'Quality program',
    breadcrumb: ['Research & data', 'AQUA Registry'],
    matchTerms: ['aqua', 'registry', 'quality', 'mips', 'outcomes'],
    imageSrc: catalogDemoImage(9),
    isNew: true,
  }),
  result({
    id: 'service-practice-management',
    title: 'Practice management resources',
    description:
      'Tools and guidance for urology practices — coding updates, compliance, staffing models, and value-based care transitions.',
    href: `${AUA_BASE}practice-management`,
    contentType: 'service',
    categories: ['builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Practice support',
    breadcrumb: ['Practice management', 'Resources'],
    matchTerms: ['practice management', 'coding', 'compliance', 'staffing', 'value-based care'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'service-urology-careers',
    title: 'Urology Careers job board and workforce resources',
    description:
      'Find urology positions, explore career pathways, and access workforce data from the AUA Careers platform.',
    href: `${AUA_BASE}urology-careers`,
    contentType: 'service',
    categories: ['builderServices', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Careers',
    breadcrumb: ['Careers', 'Job board'],
    matchTerms: ['careers', 'jobs', 'workforce', 'recruitment', 'fellowship'],
    imageSrc: catalogDemoImage(11),
  }),
  result({
    id: 'service-innovation-nexus',
    title: 'AUA Innovation Nexus',
    description:
      'Explore emerging technologies in urology — robotics, AI, digital health, and device innovation through the AUA Innovation Nexus.',
    href: `${AUA_BASE}aua-innovation-nexus`,
    contentType: 'service',
    categories: ['manufacturedComponents', 'digitalTools'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['advancedManufacturing', 'services'],
    dateLabel: 'Innovation',
    breadcrumb: ['Innovation', 'AUA Innovation Nexus'],
    matchTerms: ['innovation', 'robotics', 'ai', 'digital health', 'technology'],
    imageSrc: catalogDemoImage(0),
    isNew: true,
  }),
  result({
    id: 'service-member-support',
    title: 'Member services and support',
    description:
      'Contact AUA member services for help with membership, CME transcripts, meeting registration, and account questions.',
    href: `${AUA_BASE}membership/member-central/contact-member-services`,
    contentType: 'service',
    categories: ['builderServices', 'digitalTools'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services', 'mybldr'],
    dateLabel: 'Member support',
    breadcrumb: ['Membership', 'Member services'],
    matchTerms: ['member services', 'support', 'help', 'contact', 'account'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'service-patient-education',
    title: 'Urology Care Foundation patient education partnership',
    description:
      'Connect patients to trusted urology health information through the Urology Care Foundation — AUA\'s patient education arm.',
    href: 'https://www.urologyhealth.org/',
    contentType: 'service',
    categories: ['windowsDoorsMillwork', 'builderServices'],
    brands: ['designUltra', 'buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Patient resources',
    breadcrumb: ['Patient education', 'Urology Care Foundation'],
    matchTerms: ['patient education', 'urology care foundation', 'patient resources', 'public health'],
    imageSrc: catalogDemoImage(2),
  }),
  result({
    id: 'service-research-grants',
    title: 'AUA research funding and grant programs',
    description:
      'Funding opportunities for urology researchers — career development awards, research grants, and abstract submission for the Annual Meeting.',
    href: `${AUA_BASE}research-and-data`,
    contentType: 'service',
    categories: ['manufacturedComponents', 'builderServices'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['windows', 'services'],
    dateLabel: 'Research funding',
    breadcrumb: ['Research & data', 'Grants'],
    matchTerms: ['research', 'grants', 'funding', 'abstract', 'award'],
    imageSrc: catalogDemoImage(3),
  }),

  result({
    id: 'blog-annual-meeting-announce',
    title: 'AUA Annual Meeting: registration now open',
    description:
      'Join thousands of urologists at the AUA Annual Meeting for the latest science, surgical innovations, and networking across the specialty.',
    href: `${AUA_BASE}meetings-and-education/annual-meeting`,
    contentType: 'blog',
    categories: ['resources', 'buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['products', 'services'],
    dateLabel: 'AUANews',
    breadcrumb: ['News', 'Annual Meeting'],
    matchTerms: ['annual meeting', 'registration', 'conference', 'science', 'networking'],
    imageSrc: catalogDemoImage(4),
  }),
  result({
    id: 'blog-prostate-guideline-update',
    title: 'AUA releases updated prostate cancer detection guideline',
    description:
      'New recommendations address PSA screening, shared decision-making, and early detection strategies for prostate cancer.',
    href: `${AUA_BASE}guidelines-and-quality/guidelines/prostate-cancer`,
    contentType: 'blog',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource', 'readyFrame'],
    searchBuckets: ['readyFrame', 'products'],
    dateLabel: 'Guideline news',
    breadcrumb: ['News', 'Prostate cancer guideline'],
    matchTerms: ['prostate cancer', 'guideline', 'psa', 'screening', 'detection'],
    imageSrc: catalogDemoImage(5),
  }),
  result({
    id: 'blog-auanews-feature',
    title: 'AUANews: trends shaping the future of urology',
    description:
      'Coverage of health policy shifts, workforce challenges, and clinical advances from the AUA\'s flagship news publication.',
    href: `${AUA_BASE}news/auanews`,
    contentType: 'blog',
    categories: ['resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'AUANews',
    breadcrumb: ['News', 'AUANews'],
    matchTerms: ['auanews', 'news', 'trends', 'workforce', 'policy'],
    imageSrc: catalogDemoImage(6),
  }),
  result({
    id: 'blog-ai-urology',
    title: 'Artificial intelligence in urology: AUA Innovation Nexus spotlight',
    description:
      'How AI-assisted diagnostics, pathology, and decision support are entering clinical urology — opportunities and cautions for practitioners.',
    href: `${AUA_BASE}aua-innovation-nexus`,
    contentType: 'blog',
    categories: ['manufacturedComponents', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['advancedManufacturing'],
    dateLabel: 'Innovation news',
    breadcrumb: ['News', 'Artificial intelligence'],
    matchTerms: ['artificial intelligence', 'ai', 'innovation', 'diagnostics', 'technology'],
    imageSrc: catalogDemoImage(7),
  }),
  result({
    id: 'blog-journal-highlight',
    title: 'Journal of Urology: top articles this month',
    description:
      'Highlights from The Journal of Urology — landmark trials, surgical outcomes research, and health services studies in urology.',
    href: 'https://www.auajournals.org/',
    contentType: 'blog',
    categories: ['resources', 'manufacturedComponents'],
    brands: ['readyFrame', 'buildersFirstSource'],
    searchBuckets: ['windows'],
    dateLabel: 'Journal highlight',
    breadcrumb: ['Publications', 'Journal of Urology'],
    matchTerms: ['journal', 'publication', 'research', 'trial', 'outcomes'],
    imageSrc: catalogDemoImage(8),
  }),
  result({
    id: 'blog-resident-workforce',
    title: 'Addressing the urology workforce pipeline',
    description:
      'AUA initiatives supporting urology residency training, fellowship pathways, and recruitment to meet growing patient demand.',
    href: `${AUA_BASE}urology-careers`,
    contentType: 'blog',
    categories: ['builderServices', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['services'],
    dateLabel: 'Workforce news',
    breadcrumb: ['News', 'Workforce'],
    matchTerms: ['workforce', 'resident', 'fellowship', 'recruitment', 'pipeline'],
    imageSrc: catalogDemoImage(9),
  }),
  result({
    id: 'blog-patient-education-launch',
    title: 'New patient education series from Urology Care Foundation',
    description:
      'Plain-language resources on common urologic conditions — helping urologists extend trusted education beyond the clinic visit.',
    href: 'https://www.urologyhealth.org/',
    contentType: 'blog',
    categories: ['windowsDoorsMillwork', 'resources'],
    brands: ['designUltra'],
    searchBuckets: ['services'],
    dateLabel: 'Patient education',
    breadcrumb: ['News', 'Urology Care Foundation'],
    matchTerms: ['patient education', 'urology care foundation', 'patient resources', 'plain language'],
    imageSrc: catalogDemoImage(10),
  }),
  result({
    id: 'blog-aqua-milestone',
    title: 'AQUA Registry reaches new participation milestone',
    description:
      'Growing urology practice participation in AQUA strengthens specialty-specific quality benchmarking and MIPS reporting support.',
    href: `${AUA_BASE}research-and-data/aua-quality-aqua-registry`,
    contentType: 'blog',
    categories: ['manufacturedComponents', 'resources'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['windows'],
    dateLabel: 'Registry news',
    breadcrumb: ['News', 'AQUA Registry'],
    matchTerms: ['aqua', 'registry', 'quality', 'mips', 'participation'],
    imageSrc: catalogDemoImage(11),
  }),

  result({
    id: 'content-education-overview',
    title: 'Meetings & education at the AUA',
    description:
      'From AUAUniversity on-demand CME to the Annual Meeting and regional courses — comprehensive urologic education for every career stage.',
    href: `${AUA_BASE}meetings-and-education`,
    contentType: 'content',
    categories: ['buildingMaterials', 'resources'],
    brands: ['buildersFirstSource', 'mybldr'],
    searchBuckets: ['products', 'services'],
    dateLabel: 'Education overview',
    breadcrumb: ['Meetings & education', 'Overview'],
    matchTerms: ['education', 'cme', 'meetings', 'courses', 'learning'],
    imageSrc: catalogDemoImage(0),
  }),
  result({
    id: 'content-guidelines-overview',
    title: 'Guidelines & quality — clinical standards for urology',
    description:
      'Access the full library of AUA guidelines, quality measures, and clinical performance tools developed by multidisciplinary expert panels.',
    href: `${AUA_BASE}guidelines-and-quality`,
    contentType: 'content',
    categories: ['buildingMaterials'],
    brands: ['buildersFirstSource'],
    searchBuckets: ['readyFrame', 'products'],
    dateLabel: 'Guidelines overview',
    breadcrumb: ['Guidelines & quality', 'Overview'],
    matchTerms: ['guidelines', 'quality', 'clinical standards', 'evidence-based', 'performance'],
    imageSrc: catalogDemoImage(1),
  }),
  result({
    id: 'content-publications-overview',
    title: 'Publications & podcasts from the AUA',
    description:
      'Explore AUA journals, AUANews, podcasts, and multimedia content covering clinical urology, research, and health policy.',
    href: `${AUA_BASE}publications-and-podcasts`,
    contentType: 'content',
    categories: ['resources'],
    brands: ['readyFrame', 'buildersFirstSource'],
    searchBuckets: ['services', 'windows'],
    dateLabel: 'Publications overview',
    breadcrumb: ['Publications', 'Overview'],
    matchTerms: ['publications', 'podcasts', 'journals', 'auanews', 'media'],
    imageSrc: catalogDemoImage(2),
  }),
];

export const contentTypes = Object.keys(searchFacetLabels.contentType) as SearchContentType[];
export const categories = Object.keys(searchFacetLabels.category) as SearchCategory[];
export const brands = Object.keys(searchFacetLabels.brand) as SearchBrand[];

function insightKey(buckets: SearchBucket[], user: DemoUserTaxonomy | null): string {
  const b = [...buckets].sort().join('|') || 'browse';
  const u = user ?? 'any';
  return `${b}::${u}`;
}

export function selectAiSearchInsight(query: string, user: DemoUserTaxonomy | null): AiSearchInsight | null {
  const n = normalizeQuery(query);
  if (n.length < 2) return null;
  const buckets = detectSearchBuckets(n);
  const key = insightKey(buckets, user);

  const personaHint =
    user === 'Urology Residents & Trainees'
      ? 'Prioritize AUAUniversity board prep, resident programming, and Annual Meeting events.'
      : user === 'Community Practice Urologists'
        ? 'Use practice management resources and CME bundles for maintenance of certification.'
        : user === 'Academic & Research Urologists'
          ? 'Look for AQUA registry participation, journal author resources, and research grant programs.'
          : 'Use facets to compare courses, programs, news, and resources by clinical area.';

  if (buckets.includes('mybldr')) {
    return {
      id: `ai-portal-${key}`,
      headline: 'AI suggestion — start with myAUA',
      body:
        'myAUA is the member portal for managing membership, viewing CME transcripts, and accessing personalized AUA resources.',
      bullets: [
        personaHint,
        'Open myAUA to review your CME dashboard and membership benefits',
        'Pair portal access with AUAUniversity courses for credit tracking',
      ],
      learnMoreHref: `${AUA_BASE}membership/member-central/myaua`,
      learnMoreLabel: 'Open myAUA',
    };
  }

  if (buckets.includes('readyFrame') || buckets.includes('advancedManufacturing')) {
    return {
      id: `ai-guidelines-${key}`,
      headline: 'AI suggestion — explore guidelines and innovation resources',
      body:
        'Clinical practice guidelines and innovation content are strong matches when the goal is evidence-based care or emerging technology in urology.',
      bullets: [
        personaHint,
        'Filter to Clinical practice & guidelines for AUA guideline library and CME modules',
        'Add Innovation Nexus or advocacy resources when the query involves policy or technology',
      ],
      learnMoreHref: `${AUA_BASE}guidelines-and-quality/guidelines`,
      learnMoreLabel: 'View guidelines',
    };
  }

  if (buckets.includes('windows')) {
    return {
      id: `ai-research-${key}`,
      headline: 'AI suggestion — combine research programs with quality reporting',
      body:
        'Research and registry searches should include the AQUA Registry, journal publications, and research funding opportunities.',
      bullets: [
        personaHint,
        'Use Research & quality registries for AQUA participation and outcomes data',
        'Add Journal of Urology or research grant services for academic workflows',
      ],
      learnMoreHref: `${AUA_BASE}research-and-data/aua-quality-aqua-registry`,
      learnMoreLabel: 'Browse AQUA Registry',
    };
  }

  if (buckets.includes('services')) {
    return {
      id: `ai-services-${key}`,
      headline: 'AI suggestion — map the program to your member needs',
      body:
        'AUA programs span membership, advocacy, practice management, careers, patient education, and member support services.',
      bullets: [
        personaHint,
        'Use Member services & support for account and membership questions',
        'Use Digital tools & myAUA when the need includes portal access or CME transcripts',
      ],
      learnMoreHref: `${AUA_BASE}membership`,
      learnMoreLabel: 'View membership',
    };
  }

  if (buckets.includes('products')) {
    return {
      id: `ai-products-${key}`,
      headline: 'AI suggestion — confirm the right education pathway early',
      body:
        'AUA CME selection depends on career stage, certification requirements, and clinical interests — use AUAUniversity or Annual Meeting programming to plan credits.',
      bullets: [
        personaHint,
        'Filter by Courses & CME for AUAUniversity on-demand and live webinars',
        'Filter by Clinical practice & guidelines for guideline-aligned CME modules',
      ],
      learnMoreHref: `${AUA_BASE}meetings-and-education/aua-university`,
      learnMoreLabel: 'Browse AUAUniversity',
    };
  }

  return {
    id: `ai-gen-${key}`,
    headline: 'AI suggestion — refine by courses, programs, news, or resources',
    body:
      'This AUA mock catalog combines CME courses, clinical guidelines, member services, AQUA registry resources, newsroom stories, and patient education.',
    bullets: [
      'Try popular searches such as Annual Meeting, CME credits, Prostate cancer guidelines, or AQUA registry',
      'Switch the demo persona to personalize result ordering and supplemental rows',
    ],
    learnMoreHref: AUA_BASE,
    learnMoreLabel: 'Visit auanet.org',
  };
}

export function itemMetadataLine(item: SearchResultItem): string {
  const type = searchFacetLabels.contentType[item.contentType];
  const when = item.dateLabel ?? (item.contentType === 'product' ? 'Course' : 'Resource');
  const trail = item.breadcrumb?.length ? item.breadcrumb.join(' · ') : '';
  const sku = item.sku ? `SKU ${item.sku}` : '';
  const bits = [type, when, sku, trail].filter(Boolean);
  return bits.join(' · ');
}
