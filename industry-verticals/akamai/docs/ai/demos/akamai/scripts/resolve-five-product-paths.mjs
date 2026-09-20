/**
 * Outputs all Sitecore item paths for five products (for get_content_item_by_path resolution).
 */
import { readFileSync, writeFileSync } from 'fs';
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

const rows = [];
for (let i = 0; i <= 11; i++) {
  const batch = JSON.parse(readFileSync(join(dir, `batch-${i}.json`), 'utf8'));
  for (const it of batch) {
    if (!PRODUCTS.includes(it.product)) continue;
    const folder = PARENT[it.parentId];
    rows.push({
      product: it.product,
      key: it.key,
      name: it.name,
      itemPath: `${BASE}${folder}/${it.name}`,
    });
    if (it.faqChildren) {
      for (const c of it.faqChildren) {
        rows.push({
          product: it.product,
          key: `FAQ: ${c.name}`,
          name: c.name,
          itemPath: `${BASE}${folder}/${it.name}/${c.name}`,
        });
      }
    }
  }
}

writeFileSync(join(dir, '_five-product-paths.json'), JSON.stringify(rows, null, 2));
console.log('paths', rows.length);
