/**
 * Resolves every row in _five-product-paths.json via get_content_item_by_path (agent-run),
 * or merges pre-resolved _path-resolutions.jsonl into product-ds-created-five-products.json.
 *
 * Agent workflow: for each paths-chunk-N.json, call get per itemPath and append:
 *   node append-path-resolution.mjs '{"product","key","name","itemPath","itemId"}'
 */
import { readFileSync, writeFileSync, existsSync, appendFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const cmd = process.argv[2];

if (cmd === 'append' && process.argv[3]) {
  appendFileSync(join(dir, '_path-resolutions.jsonl'), process.argv[3] + '\n');
  process.exit(0);
}

if (cmd === 'merge') {
  const paths = JSON.parse(readFileSync(join(dir, '_five-product-paths.json'), 'utf8'));
  const resPath = join(dir, '_path-resolutions.jsonl');
  const map = new Map();
  if (existsSync(resPath)) {
    for (const line of readFileSync(resPath, 'utf8').trim().split('\n')) {
      if (!line) continue;
      const row = JSON.parse(line);
      if (row.itemId) map.set(`${row.product}\0${row.key}`, row);
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
  console.log(JSON.stringify({ counts: Object.fromEntries(products.map((p) => [p, out.products[p].length])), failures: failures.length }));
  process.exit(0);
}

console.log('Usage: finalize-manifest-from-paths.mjs merge | append <jsonline>');
