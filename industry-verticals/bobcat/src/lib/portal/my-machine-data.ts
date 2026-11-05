/**
 * Simulated "My Machine API": what the portal would get from Bobcat's other systems (CRM for the owner and the machine
 * they are considering, telematics and the dealer DMS for owned machines and service, the product catalog for documents
 * and attachments). EXAMPLE DATA for the demo: the person, company, serial numbers, hours and dates are invented; models,
 * links, attachments and the dealer are real (bobcat.com, captured 2026-11-04).
 * The route handler /api/portal/me serves it to a logged-in visitor; in Pages (editing) the components show it as a sample.
 */

export type ConsideredStatus = 'saved' | 'recommended' | 'pending';

export type PortalLink = { label: string; href: string };

export type OwnedMachine = {
  id: string;
  model: string;
  type: string;
  image: string;
  imageAlt: string;
  serialNumber: string;
  year: number;
  hours: number;
  lastService: string;
  nextServiceAtHours: number;
  nextServiceLabel: string;
  warranty: { status: 'active' | 'expired'; until: string; label: string };
  openRecalls: number;
  detailsUrl: string;
  serviceHistory: { date: string; hours: number; work: string; by: string }[];
};

/** A machine the owner saved on a Product page (catalog values from Sitecore, statuses from the saved list and the CRM). */
export type ConsideredMachine = {
  id: string;
  model: string;
  type: string;
  image: string;
  imageAlt: string;
  summary: string;
  highlights: string[];
  statuses: ConsideredStatus[];
  savedOn: string;
  recommendedBy: string;
  detailsUrl: string;
};

export type Attachment = { name: string; image: string; imageAlt: string; href: string };

export type AttachmentGroup = { forModel: string; machineType: string; browseUrl: string; items: Attachment[] };

export type Dealer = {
  name: string;
  street: string;
  city: string;
  region: string;
  postalCode: string;
  phone: string;
  website: string;
  directionsUrl: string;
  dealerPageUrl: string;
};

export type PortalData = {
  source: string;
  profile: { firstName: string; lastName: string; email: string; company: string; city: string; customerSince: number };
  owned: OwnedMachine[];
  considered: ConsideredMachine[];
  /** CRM: models the dealer recommends to this owner; a saved machine with one of these names is marked Recommended */
  recommendations: { models: string[]; by: string };
  resources: { forModel: string; links: PortalLink[] }[];
  ownerResources: PortalLink[];
  attachments: AttachmentGroup[];
  dealer: Dealer;
};

const CDN = 'https://res.cloudinary.com/doosan-bobcat/image/upload/ar_1.5,c_fill,f_auto,g_auto,q_auto,w_640';
const SERVICE = 'https://www.bobcat.com/na/en/parts-service/service';

const DEMO_ACCOUNT: PortalData = {
  source: 'Simulated My Machine API (CRM, telematics and dealer systems)',
  profile: {
    firstName: 'Alex',
    lastName: 'Tremblay',
    email: 'alex.tremblay@example.com',
    company: 'Tremblay Site Works Ltd.',
    city: 'Kanata, ON',
    customerSince: 2021,
  },
  owned: [
    {
      id: 'm-t66-2',
      model: 'T66-2',
      type: 'Compact Track Loader',
      image: `${CDN}/v1778787362/bobcat-assets/na-approved/products/loaders/compact-track-loaders/t66-2-pro/images/bobcat-t66-2-landplane-5j2a2684-042026`,
      imageAlt: 'Bobcat Pro T66-2 Compact Track Loader With Landplane Attachment Grading Dirt at a Residential Construction Site',
      serialNumber: 'B6TZ11043',
      year: 2025,
      hours: 412,
      lastService: '2026-08-19',
      nextServiceAtHours: 500,
      nextServiceLabel: '500-hour service',
      warranty: { status: 'active', until: '2027-05-14', label: 'Standard machine warranty' },
      openRecalls: 0,
      detailsUrl: 'https://www.bobcat.com/na/en/equipment/loaders/compact-track-loaders/t66-2',
      serviceHistory: [
        { date: '2026-08-19', hours: 250, work: '250-hour service (engine oil and filter, hydraulic filter)', by: 'Bobcat of Ottawa Valley' },
        { date: '2025-09-03', hours: 50, work: 'First 50-hour inspection', by: 'Bobcat of Ottawa Valley' },
        { date: '2025-05-14', hours: 0, work: 'Delivery and pre-delivery inspection', by: 'Bobcat of Ottawa Valley' },
      ],
    },
    {
      id: 'm-t650',
      model: 'T650',
      type: 'Compact Track Loader',
      image: `${CDN}/v1771970878/bobcat-assets/na-approved/products/loaders/compact-track-loaders/t650-classic/images/bobcat-t650-soil-conditioner-6a6f2266-051325`,
      imageAlt: 'Bobcat T650 Compact Track Loader Using a Soil Conditioner Attachment to Prepare and Level Soil at a Jobsite',
      serialNumber: 'AJZ814522',
      year: 2021,
      hours: 2318,
      lastService: '2026-06-02',
      nextServiceAtHours: 2500,
      nextServiceLabel: '2,500-hour service',
      warranty: { status: 'expired', until: '2023-04-30', label: 'Standard machine warranty' },
      openRecalls: 0,
      detailsUrl: 'https://www.bobcat.com/na/en/equipment/loaders/compact-track-loaders/t650',
      serviceHistory: [
        { date: '2026-06-02', hours: 2250, work: '2,000-hour service (hydraulic fluid, fuel filters, drive motor oil)', by: 'Bobcat of Ottawa Valley' },
        { date: '2025-10-21', hours: 1760, work: 'Track replacement', by: 'Bobcat of Ottawa Valley' },
        { date: '2025-04-08', hours: 1510, work: '1,500-hour service', by: 'Bobcat of Ottawa Valley' },
      ],
    },
  ],
  // filled per visitor from the machines they save on Product pages (see /api/portal/me)
  considered: [],
  recommendations: { models: ['E35'], by: 'Bobcat of Ottawa Valley' },
  resources: [
    {
      forModel: 'T66-2',
      links: [
        { label: 'Operation & Maintenance Manual', href: `${SERVICE}/manuals` },
        { label: 'Service Schedule', href: `${SERVICE}/service-schedules` },
        { label: 'Maintenance Videos', href: `${SERVICE}/videos` },
      ],
    },
    {
      forModel: 'T650',
      links: [
        { label: 'Operation & Maintenance Manual', href: `${SERVICE}/manuals` },
        { label: 'Service Schedule', href: `${SERVICE}/service-schedules` },
        { label: 'Maintenance Videos', href: `${SERVICE}/videos` },
      ],
    },
  ],
  ownerResources: [
    { label: 'Recalls', href: `${SERVICE}/recalls` },
    { label: 'Safety Training & Operator Resources', href: 'https://www.bobcat.com/na/en/parts-service/safety-training' },
    { label: 'Find Parts', href: 'https://www.bobcat.com/na/en/parts-service/parts' },
  ],
  attachments: [
    {
      forModel: 'E35',
      machineType: 'Compact Excavator',
      browseUrl: 'https://www.bobcat.com/na/en/attachments/equipment/compact-excavators',
      items: [
        { name: 'Auger', image: `${CDN}/v1675345614/bobcat-assets/na-approved/products/attachments/auger/images/bobcat-20ph-auger-tfld09071-2022-11-07-ko`, imageAlt: 'Bobcat auger attachment', href: 'https://www.bobcat.com/na/en/attachments/augers' },
        { name: 'Grading Bucket (Pin-On)', image: `${CDN}/v1745875169/bobcat-assets/na-approved/products/attachments/bucket-excavator/images/bobcat-excavator-bucket-48-inch-grading-pin-on-v30002-rendering`, imageAlt: 'Bobcat Compact Excavator Grading Bucket on a White Background', href: 'https://www.bobcat.com/na/en/attachments/excavator-buckets' },
        { name: 'Clamp (Excavators)', image: `${CDN}/v1748021825/bobcat-assets/na-approved/parts-service/parts/excavators/compact-excavators/clamp/bobcat-clamp-ko5-050925`, imageAlt: 'Side View of the Bobcat Clamp Against a White Background', href: 'https://www.bobcat.com/na/en/attachments/clamps-thumbs' },
        { name: 'Hydraulic Breaker', image: `${CDN}/v1642762080/bobcat-assets/na-approved/products/attachments/breaker/images/bobcat-breaker-mg8967-12w1-f`, imageAlt: 'Bobcat HB980 hydraulic breaker attachment', href: 'https://www.bobcat.com/na/en/attachments/breakers-hammers' },
      ],
    },
    {
      forModel: 'T66-2 and T650',
      machineType: 'Compact Track Loader',
      browseUrl: 'https://www.bobcat.com/na/en/attachments/equipment/compact-track-loaders',
      items: [
        { name: 'Auger', image: `${CDN}/v1675345614/bobcat-assets/na-approved/products/attachments/auger/images/bobcat-20ph-auger-tfld09071-2022-11-07-ko`, imageAlt: 'Bobcat auger attachment', href: 'https://www.bobcat.com/na/en/attachments/augers' },
        { name: 'Angle Broom', image: `${CDN}/v1642778860/bobcat-assets/na-bobcat-com/products/attachments/angle-broom/images/bobcat-angle-broom-1w7a0192-19b3-ko-544x362`, imageAlt: 'Bobcat angle broom attachment', href: 'https://www.bobcat.com/na/en/attachments/brooms-sweepers' },
        { name: 'Box Blade', image: `${CDN}/v1642778875/bobcat-assets/na-bobcat-com/products/attachments/box-blade/images/bobcat-box-blade-ko-2x-544x362`, imageAlt: 'Bobcat box blade attachment', href: 'https://www.bobcat.com/na/en/attachments/blades-grading' },
        { name: 'Brushcat Rotary Cutter', image: `${CDN}/v1642778880/bobcat-assets/na-bobcat-com/products/attachments/brushcat-rotary-cutter/images/bobcat-brushcat-mg-4671-13j6-ko-544x362`, imageAlt: 'Bobcat Brushcat rotary cutter attachment', href: 'https://www.bobcat.com/na/en/attachments/mowers-cutters' },
      ],
    },
  ],
  dealer: {
    name: 'Bobcat of Ottawa Valley',
    street: '2878 Carp Rd',
    city: 'Carp',
    region: 'ON',
    postalCode: 'K0A 1L0',
    phone: '613-831-5166',
    website: 'http://bobcatov.com/',
    directionsUrl: 'https://www.google.com/maps/search/?api=1&query=2878%20Carp%20Rd,%20CARP,%20ON',
    dealerPageUrl: 'https://www.bobcat.com/na/en/dealer/399905424',
  },
};

const DATA: Record<string, PortalData> = { 'demo-tremblay-site-works': DEMO_ACCOUNT };

export const getPortalData = (accountId: string): PortalData | null => DATA[accountId] ?? null;

/**
 * What the components show in Pages (no portal session there): the demo account with the E35 as a saved, recommended
 * machine, so every block has something to show while it is being placed and styled.
 */
export const SAMPLE_PORTAL_DATA: PortalData = {
  ...DEMO_ACCOUNT,
  considered: [
    {
      id: 'sample-e35',
      model: 'E35',
      type: 'Compact Excavator',
      image: 'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/111279-compact-excavators-card-e35?v=6e295f69',
      imageAlt: 'Bobcat E35 Compact Excavator Knockout Image On White Background',
      summary:
        'The time-tested E35 is our best-selling compact excavator, delivering proven performance on the most demanding jobsites.',
      highlights: [
        'Refined, low-effort joysticks',
        'Exclusive in-track swing frame',
        'Dual-flange roller system',
        'Reduced and simplified routine maintenance',
      ],
      statuses: ['saved', 'recommended'],
      savedOn: '2026-11-05',
      recommendedBy: DEMO_ACCOUNT.recommendations.by,
      detailsUrl: '/equipment/excavators/compact-excavators/e35',
    },
  ],
};
