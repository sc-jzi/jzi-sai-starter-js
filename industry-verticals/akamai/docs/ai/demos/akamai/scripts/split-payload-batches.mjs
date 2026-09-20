import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const payloads = JSON.parse(readFileSync(join(dir, 'product-ds-payloads.json'), 'utf8'));
const BATCH = 8;
for (let i = 0; i < payloads.length; i += BATCH) {
  const slice = payloads.slice(i, i + BATCH);
  writeFileSync(join(dir, `batch-${Math.floor(i / BATCH)}.json`), JSON.stringify(slice, null, 2));
}
console.log('batches', Math.ceil(payloads.length / BATCH));
