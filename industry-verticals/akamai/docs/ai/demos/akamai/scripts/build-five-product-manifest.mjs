/**
 * Merge batch payloads + recorded MCP results into product-ds-created-five-products.json
 * Record format in _create-results.json: { entries: [{ product, key, name, itemId }] }
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const PARENT = {
  '4B0AD535-96E3-400F-94D3-DC0452238EE5': 'Hero',
  '16712A4D-2A46-4F41-B535-30E134893C1C': 'Promo CTA',
  'DD4CA9E9-D740-4CDE-A72E-4E047205767C': 'Heading CTA',
  '9452E48F-4BA3-4483-AB97-B40FF9AE3F03': 'Three Column CTA',
  'D1B87644-6DD8-4CC9-BA2D-861839B5BCB4': 'Four Column CTA',
  '8D46D2C3-C71B-46E1-BA80-DBC4FE319F15': 'Two Column CTA',
  '6E161443-E85B-430F-B301-170B54A79BC4': 'CTA Banner',
  'D8E44B11-8072-49FE-B6E2-8C6BB87C60CB': 'Questions',
  '09699ECB-5715-4AA1-81F2-90D273AECE92': 'Contact Form',
};
const BASE = '/sitecore/content/technology/akamai/Data/';
const PRODUCTS = ['Backups', 'Block Storage', 'Cloud Firewall', 'CPU', 'DNS Manager'];

const existing = JSON.parse(
  readFileSync(join(dir, 'product-ds-created-five-products.json'), 'utf8')
);
const resultsPath = join(dir, '_create-results.json');
const results = existsSync(resultsPath)
  ? JSON.parse(readFileSync(resultsPath, 'utf8'))
  : { entries: [], failures: [] };

const byKey = new Map();
for (const p of PRODUCTS) {
  for (const row of existing.products[p] || []) {
    byKey.set(`${p}\0${row.key}`, row);
  }
}
for (const row of results.entries) {
  byKey.set(`${row.product}\0${row.key}`, row);
}

const items = [];
for (let i = 0; i <= 11; i++) {
  items.push(...JSON.parse(readFileSync(join(dir, `batch-${i}.json`), 'utf8')));
}

for (const it of items) {
  if (!PRODUCTS.includes(it.product)) continue;
  const folder = PARENT[it.parentId];
  const itemPath = `${BASE}${folder}/${it.name}`;
  if (!byKey.has(`${it.product}\0${it.key}`)) {
    results.pending = results.pending || [];
    results.pending.push({ product: it.product, key: it.key, name: it.name, itemPath });
  }
  if (it.faqChildren) {
    for (const c of it.faqChildren) {
      const fkey = `FAQ: ${c.name}`;
      const cpath = `${itemPath}/${c.name}`;
      if (!byKey.has(`${it.product}\0${fkey}`)) {
        results.pending = results.pending || [];
        results.pending.push({
          product: it.product,
          key: fkey,
          name: c.name,
          itemPath: cpath,
        });
      }
    }
  }
}

// Value Props created earlier
if (!byKey.has('Block Storage\0Value Props')) {
  results.entries.push({
    product: 'Block Storage',
    key: 'Value Props',
    name: 'Block Storage Value Props',
    itemId: '096fbd42-abc8-4805-b372-222dc5ccf2f2',
  });
}

writeFileSync(resultsPath, JSON.stringify(results, null, 2));

const out = { products: {} };
for (const p of PRODUCTS) {
  out.products[p] = [];
}
for (const [k, row] of byKey) {
  const [product] = k.split('\0');
  if (PRODUCTS.includes(product)) out.products[product].push(row);
}
for (const row of results.entries) {
  if (!out.products[row.product].some((x) => x.key === row.key)) {
    out.products[row.product].push({
      key: row.key,
      name: row.name,
      itemId: row.itemId,
    });
  }
}
for (const p of PRODUCTS) {
  out.products[p].sort((a, b) => a.key.localeCompare(b.key));
}

writeFileSync(join(dir, 'product-ds-created-five-products.json'), JSON.stringify(out, null, 2));
console.log(
  JSON.stringify({
    pending: (results.pending || []).length,
    counts: Object.fromEntries(PRODUCTS.map((p) => [p, out.products[p].length])),
  })
);
