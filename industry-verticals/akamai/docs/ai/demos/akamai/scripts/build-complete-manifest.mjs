import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const paths = JSON.parse(readFileSync(join(dir, '_five-product-paths.json'), 'utf8'));
const resPath = join(dir, '_path-resolutions.jsonl');

const faqMeta = {
  'Backups FAQ': {
    itemId: 'dfe4e107-5856-421c-8d8f-5dd3d3953677',
    children: {
      'What does Backups cover': '45f2718a-86f8-453f-9813-38e4cc775554',
      'How is this different from snapshots': 'af748d63-0096-47d0-a22e-9d9fe100aef2',
      'Can I restore to a new instance': 'dd615868-b065-4999-b62f-623ab5775c2b',
    },
  },
  'Block Storage FAQ': {
    itemId: '538ee574-1a5b-4572-83b9-6a6f50aaf59c',
    children: {
      'Can I resize a volume': '46e7b978-013e-4f01-8869-ef6f74352552',
      'Is Block Storage the same as Object Storage': 'bdeb7f8f-e1d2-45a1-98d0-8a3bd39ce17e',
      'Does it work with Kubernetes': 'b44230c6-befb-47c8-84e6-db003acabb79',
    },
  },
  'Cloud Firewall FAQ': {
    itemId: '6839d02a-b83d-4d20-bad5-886d530b8c23',
    children: {
      'What resources can Cloud Firewall protect': 'f42699ce-5cf4-462c-8c24-f0436a6b5833',
      'Is it a WAF': '28401831-7312-49ae-9fc1-d672013b9708',
      'Does it cost extra': 'ec695d61-5862-43af-9297-dd788c60c41a',
    },
  },
  'CPU FAQ': {
    itemId: '317270d8-60d2-4730-a331-3c865db26544',
    children: {
      'Shared vs dedicated CPU': '4d36e3c0-1ac7-4b26-bc33-f53ca03d9a7b',
      'Can I run containers': 'f106e739-203d-414b-8cf9-76a14eb9a8a1',
      'How do GPUs differ': '876158a4-d6fd-4d72-a417-ea53fd934087',
    },
  },
  'DNS Manager FAQ': {
    itemId: '5d62d877-2e53-4938-bdef-2e723f2a6393',
    children: {
      'Is this Edge DNS': '9cc0f5d9-f7f8-4550-8c80-4b96ed2ea47a',
      'Can I use it with external hosts': 'e9622a5e-ea3f-4bd9-8d62-71720bd94216',
      'Does it support DNSSEC': '0afe85ab-16d1-404b-8cb8-17f4f2bf8219',
    },
  },
};

const map = new Map();
if (existsSync(resPath)) {
  for (const line of readFileSync(resPath, 'utf8').trim().split('\n')) {
    if (!line) continue;
    const row = JSON.parse(line);
    if (row.itemId) map.set(`${row.product}\0${row.key}`, row);
  }
}

const extraPath = join(dir, '_path-resolutions-extra.jsonl');
if (existsSync(extraPath)) {
  for (const line of readFileSync(extraPath, 'utf8').trim().split('\n')) {
    if (!line) continue;
    const row = JSON.parse(line);
    if (row.itemId) map.set(`${row.product}\0${row.key}`, row);
  }
}

for (const row of paths) {
  const k = `${row.product}\0${row.key}`;
  if (map.has(k)) continue;
  if (row.key === 'FAQ' && faqMeta[row.name]) {
    map.set(k, { ...row, itemId: faqMeta[row.name].itemId });
    continue;
  }
  if (row.key.startsWith('FAQ: ')) {
    const parent = `${row.product} FAQ`;
    const id = faqMeta[parent]?.children[row.name];
    if (id) map.set(k, { ...row, itemId: id });
  }
}

const products = ['Backups', 'Block Storage', 'Cloud Firewall', 'CPU', 'DNS Manager'];
const out = { products: {} };
const failures = [];
for (const p of products) out.products[p] = [];
for (const row of paths) {
  const hit = map.get(`${row.product}\0${row.key}`);
  if (hit?.itemId) {
    out.products[row.product].push({ key: row.key, name: row.name, itemId: hit.itemId });
  } else failures.push(row);
}
for (const p of products) out.products[p].sort((a, b) => a.key.localeCompare(b.key));

writeFileSync(join(dir, 'product-ds-created-five-products.json'), JSON.stringify(out, null, 2));
writeFileSync(join(dir, '_missing-paths.json'), JSON.stringify(failures, null, 2));
console.log(
  JSON.stringify({
    counts: Object.fromEntries(products.map((p) => [p, out.products[p].length])),
    failures: failures.length,
  })
);
