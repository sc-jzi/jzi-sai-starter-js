/**
 * Helper: slice create queue for agent-driven MCP create_content_item runs.
 * Usage: node apply-five-product-creates.mjs [--from N] [--limit N] [--record path]
 */
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const queuePath = join(dir, '_create-queue-compact.jsonl');
const FAQ_TEMPLATE = '2DC7A13E-6753-47EF-805A-1CDE39012EEC';

const args = process.argv.slice(2);
let from = 0;
let limit = 999;
let recordPath = join(dir, '_create-results.json');

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--from') from = Number(args[++i]);
  else if (args[i] === '--limit') limit = Number(args[++i]);
  else if (args[i] === '--record') recordPath = args[++i];
}

const lines = readFileSync(queuePath, 'utf8').trim().split('\n');
const slice = lines.slice(from, from + limit).map((l) => JSON.parse(l));

const results = existsSync(recordPath) ? JSON.parse(readFileSync(recordPath, 'utf8')) : { created: [], failures: [] };

/** Emit MCP-ready payloads including expanded FAQ child ops after parent. */
const ops = [];
for (const item of slice) {
  ops.push({
    op: 'create',
    product: item.product,
    key: item.key,
    name: item.name,
    templateId: item.templateId,
    parentId: item.parentId,
    fields: item.fields,
    itemPath: item.itemPath,
  });
  if (item.faqChildren?.length) {
    for (const child of item.faqChildren) {
      ops.push({
        op: 'create_faq_child',
        product: item.product,
        key: `FAQ: ${child.name}`,
        name: child.name,
        templateId: FAQ_TEMPLATE,
        parentName: item.name,
        parentPath: item.itemPath,
        fields: child.fields,
        itemPath: `${item.itemPath}/${child.name}`,
      });
    }
  }
}

writeFileSync(join(dir, '_create-ops-batch.json'), JSON.stringify({ from, limit, ops }, null, 2));
console.log(JSON.stringify({ from, limit, opCount: ops.length, recordPath, resultsCount: results.created.length }));
