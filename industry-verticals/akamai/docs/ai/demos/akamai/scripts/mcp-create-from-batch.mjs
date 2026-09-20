/**
 * Prints create_content_item args as JSON for batch N (for agent/MCP replay).
 * Usage: node mcp-create-from-batch.mjs 2
 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const batchNum = process.argv[2];
if (!batchNum) {
  console.error('Usage: node mcp-create-from-batch.mjs <batchNumber>');
  process.exit(1);
}
const dir = dirname(fileURLToPath(import.meta.url));
const items = JSON.parse(readFileSync(join(dir, `batch-${batchNum}.json`), 'utf8'));
for (const item of items) {
  console.log(JSON.stringify({
    name: item.name,
    templateId: item.templateId,
    parentId: item.parentId,
    fields: item.fields ?? [],
    faqChildren: item.faqChildren,
  }));
}
