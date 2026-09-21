import { readFileSync } from 'fs';

const yaml = readFileSync(new URL('../../config/credentials.local.yaml', import.meta.url), 'utf8');
const host = (yaml.match(/host:\s*"([^"]+)"/) || [])[1];
const user = (yaml.match(/user:\s*"([^"]+)"/) || [])[1];
const password = (yaml.match(/password:\s*"([^"]+)"/) || [])[1];

if (!host || !user || !password) {
  console.error('ERROR: missing host/user/password');
  process.exit(1);
}

const res = await fetch(`${host.replace(/\/$/, '')}/api/authenticate`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ user_name: user, password }),
});

const text = await res.text();
console.log(`[auth] HTTP ${res.status}`);
if (!res.ok) {
  console.error(`ERROR: ${text.slice(0, 400)}`);
  process.exit(1);
}
console.log('[auth] OK');
