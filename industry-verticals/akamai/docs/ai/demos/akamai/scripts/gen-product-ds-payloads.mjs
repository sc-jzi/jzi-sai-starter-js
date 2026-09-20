/** Generates create_content_item payloads for MCP — run: node gen-product-ds-payloads.mjs */
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const FOLDERS = {
  Hero: '4B0AD535-96E3-400F-94D3-DC0452238EE5',
  PromoCTA: '16712A4D-2A46-4F41-B535-30E134893C1C',
  HeadingCTA: 'DD4CA9E9-D740-4CDE-A72E-4E047205767C',
  ThreeColumn: '9452E48F-4BA3-4483-AB97-B40FF9AE3F03',
  FourColumn: 'D1B87644-6DD8-4CC9-BA2D-861839B5BCB4',
  TwoColumn: '8D46D2C3-C71B-46E1-BA80-DBC4FE319F15',
  CtaBanner: '6E161443-E85B-430F-B301-170B54A79BC4',
  Questions: 'D8E44B11-8072-49FE-B6E2-8C6BB87C60CB',
  ContactForm: '09699ECB-5715-4AA1-81F2-90D273AECE92',
};
const TEMPLATES = {
  Hero: '90D315E8-AA42-4B23-A7EB-4491396453F8',
  PromoCTA: 'C0943942-AE0F-4205-86FA-84884CCE4A53',
  HeadingCTA: 'FA136527-6302-471D-83AB-E66FC72BDA99',
  ThreeColumn: '148D07BA-F923-4FB2-8907-0BD440D5DB44',
  FourColumn: '1B694EF9-154D-429A-9C3F-D7774CD4A852',
  TwoColumn: '1812BF3E-6BDD-466D-99B2-0D7CEBB020FC',
  CtaBanner: '4900D7E5-61B0-483A-A9D6-69419D4D5982',
  Questions: 'FAE81BF9-1117-4F97-9133-00E752F41772',
  Question: '2DC7A13E-6753-47EF-805A-1CDE39012EEC',
  ContactForm: '6D166C16-D4CC-4BA9-B1E1-FE6378916533',
};

const IMG = {
  hero: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/eb4e64b104634aafa4235c4739ff7465?v=3eac35b5" dam-id="7qH3BpfRQ1WJdm02Ke0MlQ" width="1440" height="476" dam-content-type="Image" />',
  promo: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/523ffd946e114ed188937fefff99003a?v=bd45c27f" dam-id="Q5NywY0sTXCj57irhWCIOg" width="1280" height="720" dam-content-type="Image" />',
  card1: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/4475e2a6ea5744d8b75a42548341a97e?v=7a4ff561" dam-id="o6HjDHniTDOZrG7uwSe9jQ" width="1280" height="720" dam-content-type="Image" />',
  card2: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/cbc51ba1387348cf82e4b747a9f91f9e?v=48102d9b" dam-id="hpEEbmruRL2O-Ygj9wVKTQ" width="1280" height="720" dam-content-type="Image" />',
  card3: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/73c12faf8b84484eb13d6907c61b118e?v=93fea706" dam-id="4G3qeznlT66jVoGoOWfJbw" width="1280" height="720" dam-content-type="Image" />',
  story1: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/bd50562aecd24a78bcca4a5704725e49?v=cd4087e9" dam-id="GgddnJb_Tpij8fYolsoj8Q" width="1280" height="720" dam-content-type="Image" />',
  story2: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/a17b886d156343c3a8ac17a61af5b642?v=06dde9a9" dam-id="EqQ9aUZHSXeczVAP-Ji4mw" width="1280" height="720" dam-content-type="Image" />',
  story3: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/9f6207cd304f4c80bae642a14106b0d1?v=5ce99937" dam-id="LUitv03nRBKLyedV8u-2NQ" width="1280" height="720" dam-content-type="Image" />',
  contact: '<Image src="https://jzi-verticals.sitecoresandbox.cloud/api/public/content/29d61b83511747dbb4bada3a63cda110?v=5fc11426" dam-id="DiN6UrZDRyCAVpFBgzRj4A" width="1280" height="720" dam-content-type="Image" />',
  vp1: '<image mediaid="{A6E1E406-694C-41DB-8F9B-AE69C32CA47E}" alt="" height="" width="" hspace="" vspace="" />',
  vp2: '<image mediaid="{D3A0CC0B-EAAE-4A88-AD26-E5DC28DCDEBF}" alt="" height="" width="" hspace="" vspace="" />',
  vp3: '<image mediaid="{CF40EE41-9D96-4764-9DCF-77684EE004AF}" alt="" height="" width="" hspace="" vspace="" />',
  ic1: '<image mediaid="{4986F57F-1293-4B48-86BB-1281B6A31573}" alt="" height="" width="" hspace="" vspace="" />',
  ic2: '<image mediaid="{032B60ED-5AA8-4DA5-A142-C96693C88D17}" alt="" height="" width="" hspace="" vspace="" />',
  ic3: '<image mediaid="{A66B93B7-7A89-47A4-A44F-492C4381B75E}" alt="" height="" width="" hspace="" vspace="" />',
  ic4: '<image mediaid="{EF4C0417-CC75-4483-BA8E-1DBE32DD7487}" alt="" height="" width="" hspace="" vspace="" />',
  split2: '<image mediaid="{F64C8C16-8C71-44E1-A658-B3070574B89E}" alt="" height="" width="" hspace="" vspace="" />',
  bannerIcon: '<image mediaid="{23592312-2C5F-49EE-8517-2D9DF508280B}" />',
  bannerImg: '<image mediaid="{4A120536-025E-42C8-8F24-8412246D7C26}" />',
};

const link = (text, url) =>
  `<link text="${text}" anchor="" linktype="external" class="" title="" target="" querystring="" url="${url}" />`;
const linkDetails = '<link text="Details" linktype="external" url="https://example.com" anchor="" target="" />';
const linkEmpty = link('', '#');
const p = (t) => `<p>${t}</p>`;

const products = [
  {
    name: 'Backups',
    skipHero: true,
    url: 'https://www.akamai.com/products/backups',
    heroTitle: 'Protect cloud workloads with Akamai Backups',
    heroText:
      'Automated backups for Linode instances — restore quickly and meet recovery objectives without DIY scripts.',
    promo1Title: 'Simple, reliable instance backups',
    promo1Text:
      'Schedule backups for compute instances and recover when you need to roll back or rebuild.',
    sectionHeading: 'Recovery you can count on',
    value1: ['Automated schedules', 'Set backup frequency that matches your RPO.'],
    value2: ['Fast restores', 'Recover instances without rebuilding from scratch.'],
    value3: ['Cloud-native', 'Integrated with Akamai Cloud compute.'],
    promo2Title: 'Don’t leave recovery to chance',
    promo2Text: 'Pair Backups with snapshots and Object Storage for layered data protection.',
    icons: [
      ['Schedule', 'Set backup windows'],
      ['Store', 'Keep restore points'],
      ['Restore', 'Recover instances'],
      ['Verify', 'Test your RTO'],
    ],
    splitTitle: 'Introducing Akamai Backups',
    splitRightTitle: 'Get the Backups overview',
    splitRightText: 'See how automated backups protect Linode workloads.',
    banner1Title: 'Enable backups in a few clicks',
    banner1Text: 'Turn on backups for new or existing compute instances.',
    features: [
      ['Instance coverage', 'Protect Linode compute instances.'],
      ['Predictable pricing', 'Add backups without complex licensing.'],
      ['Works with snapshots', 'Combine with manual snapshots when needed.'],
    ],
    banner2Title: 'Protect your workloads today',
    banner2Text: 'Enable Backups on your Akamai Cloud instances.',
    banner3Title: 'Data protection resources',
    banner3Text: 'Best practices for backup, snapshot, and restore strategies.',
    contactTitle: 'Talk with a Backups specialist',
    faq: [
      ['What does Backups cover?', 'Automated backups for supported Linode compute instances.'],
      [
        'How is this different from snapshots?',
        'Snapshots are point-in-time manual copies; Backups provide scheduled automated protection.',
      ],
      ['Can I restore to a new instance?', 'Yes — restore workflows let you recover to a replacement instance.'],
    ],
  },
  {
    name: 'Block Storage',
    url: 'https://www.akamai.com/products/block-storage',
    heroTitle: 'Scale durable volumes with Akamai Block Storage',
    heroText:
      'Attach high-performance NVMe block volumes to Linode instances — grow capacity independently of compute.',
    promo1Title: 'Detachable, resizable block volumes',
    promo1Text: 'Add persistent storage to your VMs, resize as you grow, and move volumes between instances.',
    sectionHeading: 'Storage that keeps pace with your apps',
    value1: ['Independent scaling', 'Grow storage without resizing the whole instance.'],
    value2: ['NVMe performance', 'Low-latency volumes for databases and stateful apps.'],
    value3: ['Flexible attach', 'Move volumes across compatible instances.'],
    promo2Title: 'Stateful workloads without local-disk lock-in',
    promo2Text: 'Run databases, CMS, and analytics with volumes you control.',
    icons: [
      ['Create', 'Provision volumes'],
      ['Attach', 'Mount to instances'],
      ['Grow', 'Resize online'],
      ['Protect', 'Snapshot volumes'],
    ],
    splitTitle: 'Introducing Block Storage',
    splitRightTitle: 'Get the Block Storage overview',
    splitRightText: 'See how block volumes complement local instance disks.',
    banner1Title: 'Pay for the capacity you need',
    banner1Text: 'Start small and expand volumes as applications grow.',
    features: [
      ['Snapshots', 'Capture volume state for recovery.'],
      ['Multi-size plans', 'Choose capacity tiers that fit your workload.'],
      ['Region availability', 'Deploy in supported Akamai Cloud regions.'],
    ],
    banner2Title: 'Add Block Storage to your stack',
    banner2Text: 'Create a volume and attach it to a running instance.',
    banner3Title: 'Storage architecture resources',
    banner3Text: 'Patterns for databases, CMS, and stateful Kubernetes workloads.',
    contactTitle: 'Talk with a Block Storage specialist',
    faq: [
      ['Can I resize a volume?', 'Yes — expand capacity as needs grow (see current resize limits).'],
      [
        'Is Block Storage the same as Object Storage?',
        'No — Block Storage is attachable volumes; Object Storage is S3-compatible object buckets.',
      ],
      ['Does it work with Kubernetes?', 'Use with PVC workflows on managed Kubernetes where supported.'],
    ],
  },
  {
    name: 'Cloud Firewall',
    url: 'https://www.akamai.com/products/cloud-firewall',
    heroTitle: 'Control network traffic with Akamai Cloud Firewall',
    heroText:
      'Stateful firewall rules for Linode instances and NodeBalancers — allow, deny, and segment traffic at the network edge of your VPC.',
    promo1Title: 'Network security without appliance sprawl',
    promo1Text: 'Define inbound and outbound rules once and apply them across compute and load balancers.',
    sectionHeading: 'Segment and protect cloud workloads',
    value1: ['Stateful filtering', 'Track connections and enforce allow/deny policies.'],
    value2: ['Instance & LB coverage', 'Protect Linodes and NodeBalancers with shared rules.'],
    value3: ['VPC friendly', 'Works with private networking topologies.'],
    promo2Title: 'Least-privilege networking by default',
    promo2Text: 'Lock down management ports and expose only what your apps need.',
    icons: [
      ['Define', 'Write firewall rules'],
      ['Apply', 'Attach to resources'],
      ['Segment', 'Isolate tiers'],
      ['Audit', 'Review traffic policy'],
    ],
    splitTitle: 'Introducing Cloud Firewall',
    splitRightTitle: 'Get the Cloud Firewall overview',
    splitRightText: 'See how firewall rules protect Akamai Cloud resources.',
    banner1Title: 'Free with Akamai Cloud networking',
    banner1Text: 'Cloud Firewall is included to harden your cloud estate.',
    features: [
      ['Rule groups', 'Reuse policies across resources.'],
      ['Inbound & outbound', 'Control both directions of traffic.'],
      ['Integrates with VPC', 'Pair with private networking and VLANs.'],
    ],
    banner2Title: 'Harden your instances today',
    banner2Text: 'Create a firewall and attach it to production Linodes.',
    banner3Title: 'Network security resources',
    banner3Text: 'Best practices for firewall rules and VPC segmentation.',
    contactTitle: 'Talk with a Cloud Firewall specialist',
    faq: [
      ['What resources can Cloud Firewall protect?', 'Linode instances and NodeBalancers.'],
      [
        'Is it a WAF?',
        'No — Cloud Firewall is network-layer filtering; pair with WAAP/API Security for app-layer threats.',
      ],
      ['Does it cost extra?', 'Cloud Firewall is included with Akamai Cloud networking.'],
    ],
  },
  {
    name: 'CPU',
    url: 'https://www.akamai.com/products/cpu',
    heroTitle: 'General-purpose compute with Akamai CPU instances',
    heroText:
      'Reliable, cost-efficient virtual machines for web apps, APIs, and backends — available across Akamai’s distributed cloud.',
    promo1Title: 'Right-size CPU for every workload',
    promo1Text: 'Choose shared or dedicated CPU plans with predictable pricing and global regions.',
    sectionHeading: 'Compute built for everyday production',
    value1: ['Global regions', 'Deploy close to customers on Akamai Cloud.'],
    value2: ['Flexible plans', 'From lightweight to high-memory CPU shapes.'],
    value3: ['Simple ops', 'API, CLI, and Terraform to automate fleets.'],
    promo2Title: 'The foundation of your cloud stack',
    promo2Text: 'Pair CPU instances with Block Storage, NodeBalancers, and Kubernetes.',
    icons: [
      ['Launch', 'Create instances'],
      ['Configure', 'Secure & network'],
      ['Scale', 'Grow capacity'],
      ['Automate', 'API & Terraform'],
    ],
    splitTitle: 'Introducing Akamai CPU',
    splitRightTitle: 'Get the CPU compute overview',
    splitRightText: 'Compare shared and dedicated CPU plans for your apps.',
    banner1Title: 'Predictable hourly pricing',
    banner1Text: 'No surprise egress traps — transparent compute pricing.',
    features: [
      ['Shared & dedicated', 'Pick the isolation level you need.'],
      ['Images & stacks', 'Boot from marketplace and custom images.'],
      ['Private networking', 'VPC, VLAN, and Cloud Firewall ready.'],
    ],
    banner2Title: 'Launch your first CPU instance',
    banner2Text: 'Create a Linode in minutes from Cloud Manager or the API.',
    banner3Title: 'Compute resources',
    banner3Text: 'Guides for sizing, images, and high availability.',
    contactTitle: 'Talk with a CPU compute specialist',
    faq: [
      ['Shared vs dedicated CPU?', 'Shared maximizes value; dedicated guarantees CPU resources for noisier neighbors.'],
      ['Can I run containers?', 'Yes — run Docker directly or use managed Kubernetes.'],
      ['How do GPUs differ?', 'GPUs accelerate AI/ML and parallel workloads; CPU suits general apps.'],
    ],
  },
  {
    name: 'DNS Manager',
    url: 'https://www.akamai.com/products/dns-manager',
    heroTitle: 'Authoritative DNS with Akamai DNS Manager',
    heroText:
      'Host and manage DNS zones on Akamai Cloud — fast lookups, easy records, and integration with your Linode resources.',
    promo1Title: 'DNS that stays out of your way',
    promo1Text: 'Create domains, manage records, and point traffic to Akamai Cloud services from one console.',
    sectionHeading: 'Reliable name resolution for cloud apps',
    value1: ['Authoritative hosting', 'Host zones with Akamai’s DNS infrastructure.'],
    value2: ['Simple record management', 'A, AAAA, CNAME, MX, TXT, and more.'],
    value3: ['Cloud integrated', 'Works with Linodes, NodeBalancers, and Object Storage.'],
    promo2Title: 'Connect users to the right endpoint',
    promo2Text: 'Use DNS Manager as the control plane for domain routing into your cloud.',
    icons: [
      ['Add zone', 'Create a domain'],
      ['Edit records', 'Point to services'],
      ['Delegate', 'Update registrars'],
      ['Monitor', 'Validate resolution'],
    ],
    splitTitle: 'Introducing DNS Manager',
    splitRightTitle: 'Get the DNS Manager overview',
    splitRightText: 'See how Akamai Cloud DNS fits with Edge DNS and enterprise offerings.',
    banner1Title: 'Included with Akamai Cloud',
    banner1Text: 'Manage DNS alongside compute and storage.',
    features: [
      ['API access', 'Automate record changes.'],
      ['Multi-record types', 'Cover web, mail, and verification needs.'],
      ['Pairs with CDN', 'Point apex and www to Akamai delivery.'],
    ],
    banner2Title: 'Move a zone to DNS Manager',
    banner2Text: 'Create a domain and update nameservers at your registrar.',
    banner3Title: 'DNS resources',
    banner3Text: 'Guides for records, migration, and troubleshooting.',
    contactTitle: 'Talk with a DNS Manager specialist',
    faq: [
      [
        'Is this Edge DNS?',
        'DNS Manager is Akamai Cloud’s authoritative DNS for Linode domains; Edge DNS is part of the broader Akamai portfolio.',
      ],
      ['Can I use it with external hosts?', 'Yes — records can point to any IP or hostname.'],
      ['Does it support DNSSEC?', 'Check current DNS Manager capabilities for DNSSEC support.'],
    ],
  },
];

function threeCol(p, prefix, cols) {
  const [a, b, c] = cols;
  return [
    { name: 'Text1', value: a[0] },
    { name: 'SubText1', value: a[1] },
    { name: 'Image1', value: IMG.vp1 },
    { name: 'Link1', value: linkDetails },
    { name: 'Video1', value: '' },
    { name: 'Text2', value: b[0] },
    { name: 'SubText2', value: b[1] },
    { name: 'Image2', value: IMG.vp2 },
    { name: 'Link2', value: linkDetails },
    { name: 'Video2', value: '' },
    { name: 'Text3', value: c[0] },
    { name: 'SubText3', value: c[1] },
    { name: 'Image3', value: IMG.vp3 },
    { name: 'Link3', value: linkDetails },
    { name: 'Video3', value: '' },
  ];
}

const payloads = [];

for (const prod of products) {
  const n = prod.name;
  if (!prod.skipHero) {
    payloads.push({
      product: n,
      key: 'Hero',
      name: `${n} Hero`,
      templateId: TEMPLATES.Hero,
      parentId: FOLDERS.Hero,
      fields: [
        { name: 'Title', value: prod.heroTitle },
        { name: 'Text', value: p(prod.heroText) },
        { name: 'Image', value: IMG.hero },
        { name: 'Link', value: link('Get started', prod.url) },
      ],
    });
  }
  payloads.push({
    product: n,
    key: 'Promo Comprehensive',
    name: `${n} Promo Comprehensive`,
    templateId: TEMPLATES.PromoCTA,
    parentId: FOLDERS.PromoCTA,
    fields: [
      { name: 'Title', value: prod.promo1Title },
      { name: 'Text', value: p(prod.promo1Text) },
      { name: 'Image', value: IMG.promo },
      { name: 'Link', value: link('Learn how it works', prod.url) },
      { name: 'Link2', value: linkDetails },
      { name: 'Subtitle', value: '' },
      { name: 'Eyebrow', value: '' },
    ],
  });
  payloads.push({
    product: n,
    key: 'Promo Discovery',
    name: `${n} Promo Discovery`,
    templateId: TEMPLATES.PromoCTA,
    parentId: FOLDERS.PromoCTA,
    fields: [
      { name: 'Title', value: prod.promo2Title },
      { name: 'Text', value: p(prod.promo2Text) },
      { name: 'Image', value: IMG.card1 },
      { name: 'Link', value: link('Watch overview', prod.url) },
      { name: 'Link2', value: linkDetails },
      { name: 'Subtitle', value: '' },
      { name: 'Eyebrow', value: '' },
    ],
  });
  for (const [suffix, heading] of [
    ['Section Title', prod.sectionHeading],
    ['FAQ Title', 'Frequently asked questions'],
    ['Resources Title', 'Resources'],
    ['Trusted', "Trusted by the world's most innovative companies"],
  ]) {
    payloads.push({
      product: n,
      key: suffix,
      name: `${n} ${suffix}`,
      templateId: TEMPLATES.HeadingCTA,
      parentId: FOLDERS.HeadingCTA,
      fields: [
        { name: 'Heading', value: heading },
        { name: 'Text', value: '' },
        { name: 'Eyebrow', value: '' },
        { name: 'Link', value: linkEmpty },
      ],
    });
  }
  payloads.push({
    product: n,
    key: 'Value Props',
    name: `${n} Value Props`,
    templateId: TEMPLATES.ThreeColumn,
    parentId: FOLDERS.ThreeColumn,
    fields: threeCol(prod, 'Value Props', [prod.value1, prod.value2, prod.value3]),
  });
  payloads.push({
    product: n,
    key: 'Features',
    name: `${n} Features`,
    templateId: TEMPLATES.ThreeColumn,
    parentId: FOLDERS.ThreeColumn,
    fields: threeCol(prod, 'Features', prod.features),
  });
  payloads.push({
    product: n,
    key: 'Stories',
    name: `${n} Stories`,
    templateId: TEMPLATES.ThreeColumn,
    parentId: FOLDERS.ThreeColumn,
    fields: [
      { name: 'Text1', value: 'Godrej' },
      {
        name: 'SubText1',
        value: 'Modernized cyber defenses and achieved near-99.9% uptime with Akamai’s integrated portfolio.',
      },
      { name: 'Image1', value: IMG.story1 },
      { name: 'Link1', value: link('Read customer story', 'https://www.akamai.com/') },
      { name: 'Video1', value: '' },
      { name: 'Text2', value: 'Novant Health' },
      {
        name: 'SubText2',
        value: 'Finds and mitigates risk with visibility, data protection, and shift-left testing on Akamai Cloud.',
      },
      { name: 'Image2', value: IMG.story2 },
      { name: 'Link2', value: link('Read customer story', 'https://www.akamai.com/') },
      { name: 'Video2', value: '' },
      { name: 'Text3', value: 'Commerzbank' },
      {
        name: 'SubText3',
        value: 'Secured billions of monthly calls through proactive detection and enhanced controls.',
      },
      { name: 'Image3', value: IMG.story3 },
      { name: 'Link3', value: link('Read customer story', 'https://www.akamai.com/') },
      { name: 'Video3', value: '' },
    ],
  });
  payloads.push({
    product: n,
    key: 'Resources',
    name: `${n} Resources`,
    templateId: TEMPLATES.ThreeColumn,
    parentId: FOLDERS.ThreeColumn,
    fields: [
      { name: 'Text1', value: prod.splitRightTitle },
      { name: 'SubText1', value: prod.splitRightText },
      { name: 'Image1', value: IMG.card1 },
      { name: 'Link1', value: link('Read more', prod.url) },
      { name: 'Video1', value: '' },
      { name: 'Text2', value: prod.banner3Title },
      { name: 'SubText2', value: prod.banner3Text },
      { name: 'Image2', value: IMG.card2 },
      { name: 'Link2', value: link('Read more', prod.url) },
      { name: 'Video2', value: '' },
      { name: 'Text3', value: prod.banner1Title },
      { name: 'SubText3', value: prod.banner1Text },
      { name: 'Image3', value: IMG.card3 },
      { name: 'Link3', value: link('Read more', prod.url) },
      { name: 'Video3', value: '' },
    ],
  });
  const [i1, i2, i3, i4] = prod.icons;
  payloads.push({
    product: n,
    key: 'Icon Bar',
    name: `${n} Icon Bar`,
    templateId: TEMPLATES.FourColumn,
    parentId: FOLDERS.FourColumn,
    fields: [
      { name: 'Title1', value: i1[0] },
      { name: 'Text1', value: i1[1] },
      { name: 'Image1', value: IMG.ic1 },
      { name: 'Link1', value: linkDetails },
      { name: 'Title2', value: i2[0] },
      { name: 'Text2', value: i2[1] },
      { name: 'Image2', value: IMG.ic2 },
      { name: 'Link2', value: linkDetails },
      { name: 'Title3', value: i3[0] },
      { name: 'Text3', value: i3[1] },
      { name: 'Image3', value: IMG.ic3 },
      { name: 'Link3', value: linkDetails },
      { name: 'Title4', value: i4[0] },
      { name: 'Text4', value: i4[1] },
      { name: 'Image4', value: IMG.ic4 },
      { name: 'Link4', value: linkDetails },
    ],
  });
  payloads.push({
    product: n,
    key: 'Split Promo',
    name: `${n} Split Promo`,
    templateId: TEMPLATES.TwoColumn,
    parentId: FOLDERS.TwoColumn,
    fields: [
      { name: 'Title1', value: prod.splitTitle },
      { name: 'Text1', value: '' },
      { name: 'Image1', value: IMG.hero },
      { name: 'Link1', value: linkDetails },
      { name: 'Title2', value: prod.splitRightTitle },
      { name: 'Text2', value: prod.splitRightText },
      { name: 'Image2', value: IMG.split2 },
      { name: 'Link2', value: link('Read the brief', prod.url) },
    ],
  });
  for (const [key, title, text, cta] of [
    ['Banner Plans', prod.banner1Title, prod.banner1Text, 'View plans'],
    ['Banner Start', prod.banner2Title, prod.banner2Text, 'Create an account'],
    ['Banner Learn', prod.banner3Title, prod.banner3Text, 'See resources'],
  ]) {
    payloads.push({
      product: n,
      key,
      name: `${n} ${key}`,
      templateId: TEMPLATES.CtaBanner,
      parentId: FOLDERS.CtaBanner,
      fields: [
        { name: 'Title', value: title },
        { name: 'Text', value: p(text) },
        { name: 'Link', value: link(cta, prod.url) },
        { name: 'Image', value: IMG.bannerImg },
        { name: 'Icon', value: IMG.bannerIcon },
        { name: 'Eyebrow', value: '' },
      ],
    });
  }
  payloads.push({
    product: n,
    key: 'Contact',
    name: `${n} Contact`,
    templateId: TEMPLATES.ContactForm,
    parentId: FOLDERS.ContactForm,
    fields: [
      { name: 'Title', value: prod.contactTitle },
      { name: 'EmailLabel', value: 'Business Email' },
      { name: 'SubjectLabel', value: 'Job Title' },
      { name: 'MessageLabel', value: 'How can we help?' },
      { name: 'ButtonLabel', value: 'Submit' },
      { name: 'BackgroundImage', value: IMG.contact },
    ],
  });
  payloads.push({
    product: n,
    key: 'FAQ',
    name: `${n} FAQ`,
    templateId: TEMPLATES.Questions,
    parentId: FOLDERS.Questions,
    fields: [],
    faqChildren: prod.faq.map(([q, a]) => ({
      name: q.replace(/\?$/, '').slice(0, 80),
      fields: [
        { name: 'Question', value: q.endsWith('?') ? q : `${q}?` },
        { name: 'Answer', value: p(a) },
      ],
    })),
  });
}

const dir = dirname(fileURLToPath(import.meta.url));
writeFileSync(join(dir, 'product-ds-payloads.json'), JSON.stringify(payloads, null, 2), 'utf8');
console.log(`Wrote ${payloads.length} payloads`);
