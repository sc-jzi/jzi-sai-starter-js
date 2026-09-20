/** Print MCP create args for op index range: node run-remaining-op-range.mjs 4 7 */
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? from);
const ops = JSON.parse(readFileSync(join(dir, 'remaining-ops.json'), 'utf8'));

for (let i = from; i <= to && i < ops.length; i++) {
  const x = ops[i];
  const line = {
    index: i,
    op: x.op || 'create',
    product: x.product,
    key: x.key,
    mcp: {
      name: x.name,
      templateId: x.templateId,
      parentId: x.parentId,
      fields: x.fields,
    },
  };
  if (x.op === 'create_faq_child') delete line.mcp.parentId;
  console.log(JSON.stringify(line));
}
