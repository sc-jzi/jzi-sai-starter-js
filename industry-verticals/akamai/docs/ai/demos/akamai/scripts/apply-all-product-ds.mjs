/**
 * Reads batch-*.json and product-ds-payloads.json; prints one JSON line per create for tooling.
 * FAQ children are emitted after parent with parentPlaceholder = parent name.
 */
import { readFileSync, readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const payloads = JSON.parse(readFileSync(join(dir, 'product-ds-payloads.json'), 'utf8'));
const out = [];
for (const p of payloads) {
  out.push({
    op: 'create',
    product: p.product,
    key: p.key,
    name: p.name,
    templateId: p.templateId,
    parentId: p.parentId,
    fields: p.fields,
  });
  if (p.faqChildren) {
    for (const c of p.faqChildren) {
      out.push({
        op: 'create_faq_child',
        product: p.product,
        parentName: p.name,
        name: c.name,
        templateId: '2DC7A13E-6753-47EF-805A-1CDE39012EEC',
        fields: c.fields,
      });
    }
  }
}
writeFileSync(join(dir, 'create-queue.jsonl'), out.map((x) => JSON.stringify(x)).join('\n'), 'utf8');
console.log('queue lines', out.length);
