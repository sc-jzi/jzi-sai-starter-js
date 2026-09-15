import fs from 'fs';

const raw = fs.readFileSync('docs/ai/config/credentials.local.yaml', 'utf8');
const host = (raw.match(/host:\s*"([^"]+)"/) || [])[1]?.replace(/\/$/, '');
const user = (raw.match(/user:\s*"([^"]+)"/) || [])[1];
const password = (raw.match(/password:\s*"([^"]+)"/) || [])[1];

const res = await fetch(`${host}/api/authenticate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ userName: user, password }),
});
const text = await res.text();
console.log(`[auth] ${res.status}`);
console.log(text.slice(0, 200));
process.exit(res.ok ? 0 : 1);
