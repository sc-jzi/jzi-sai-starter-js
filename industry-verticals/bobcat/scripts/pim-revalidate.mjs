// npm run pim:revalidate -- [--sku E32 | --category compact-excavators | --all] [--url https://bobcat-nine.vercel.app]
// Expires the app's cached PIM reads (POST /api/pim/revalidate). Default URL: http://localhost:3000.
// The secret comes from PIM_REVALIDATE_SECRET in the environment (not needed against a local dev server).
const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i < 0 ? undefined : args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
};
const body = { sku: opt('sku'), category: opt('category'), all: opt('all') === true };
if (!body.sku && !body.category && !body.all) {
  console.error('usage: npm run pim:revalidate -- --sku <SKU> | --category <slug> | --all [--url <site url>]');
  process.exit(2);
}
const url = `${String(opt('url') || 'http://localhost:3000').replace(/\/$/, '')}/api/pim/revalidate`;
const headers = { 'Content-Type': 'application/json' };
if (process.env.PIM_REVALIDATE_SECRET) headers['x-pim-revalidate-secret'] = process.env.PIM_REVALIDATE_SECRET;
const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
const text = await res.text();
console.log(res.ok ? `✔ ${text}` : `✖ HTTP ${res.status} ${text}`);
process.exit(res.ok ? 0 : 1);
