/**
 * My Machine portal demo accounts (server only: imported by the route handlers, never by a component).
 * Only an scrypt hash of each password is kept here; the demo password is recorded in the demo's git-ignored
 * docs/ai/demos/<customer>/manual-tasks.md.
 */
import { scryptSync, timingSafeEqual } from 'node:crypto';

export type PortalAccount = { username: string; accountId: string; salt: string; hash: string };

const ACCOUNTS: PortalAccount[] = [
  {
    username: 'alex.tremblay',
    accountId: 'demo-tremblay-site-works',
    salt: '70142c4c273ee620b1dad7abbef1b00d',
    hash: 'a3c01e59a8f555fec85a4b25243b87f743d48b47d34bd6bd850689e8589e440ae6c2f029fb07c6eb324709aade0607ab1372074963707be9a37cb376be9bb7d6',
  },
];

/** The account for these credentials, or null. Usernames are case-insensitive; the hash comparison is constant-time. */
export const verifyCredentials = (username: string, password: string): PortalAccount | null => {
  const account = ACCOUNTS.find((a) => a.username === `${username}`.trim().toLowerCase());
  if (!account || !password) return null;
  const expected = Buffer.from(account.hash, 'hex');
  const actual = scryptSync(password, account.salt, expected.length, { N: 16384, r: 8, p: 1 });
  return timingSafeEqual(actual, expected) ? account : null;
};
