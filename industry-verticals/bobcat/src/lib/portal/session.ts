/**
 * My Machine portal session: a signed, httpOnly cookie "<payload>.<signature>" (base64url JSON + HMAC-SHA256).
 * Web Crypto only, so the same code runs in the proxy (edge) and in the route handlers (node).
 * The signing key is derived from SITECORE_EDITING_SECRET (a server-only secret the app already has); without it no
 * session can be created or verified, so the portal stays closed rather than open.
 */

export const SESSION_COOKIE = 'bobcat_mm_session';
export const SESSION_TTL_SECONDS = 8 * 60 * 60;

export type PortalSession = { sub: string; exp: number };

const encoder = new TextEncoder();

const b64url = (bytes: Uint8Array): string => {
  let s = '';
  bytes.forEach((b) => (s += String.fromCharCode(b)));
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

const fromB64url = (value: string): Uint8Array => {
  const s = atob(value.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((value.length + 3) % 4));
  return Uint8Array.from(s, (c) => c.charCodeAt(0));
};

const signingKey = async (): Promise<CryptoKey | null> => {
  const secret = process.env.SITECORE_EDITING_SECRET;
  if (!secret) return null;
  const material = await crypto.subtle.digest('SHA-256', encoder.encode(`bobcat-my-machine-session:${secret}`));
  return crypto.subtle.importKey('raw', material, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
};

export const createSessionToken = async (sub: string): Promise<string | null> => {
  const key = await signingKey();
  if (!key) return null;
  const payload = b64url(
    encoder.encode(JSON.stringify({ sub, exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS }))
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
  return `${payload}.${b64url(signature)}`;
};

export const verifySessionToken = async (token?: string | null): Promise<PortalSession | null> => {
  if (!token || !token.includes('.')) return null;
  const key = await signingKey();
  if (!key) return null;
  const [payload, signature] = token.split('.');
  try {
    const ok = await crypto.subtle.verify('HMAC', key, fromB64url(signature), encoder.encode(payload));
    if (!ok) return null;
    const session = JSON.parse(new TextDecoder().decode(fromB64url(payload))) as PortalSession;
    return session.sub && session.exp > Math.floor(Date.now() / 1000) ? session : null;
  } catch {
    return null;
  }
};

/** /my-machine and everything below it, with or without a locale prefix; the login page itself excluded. */
export const portalPath = (pathname: string): 'login' | 'protected' | null => {
  const m = pathname.toLowerCase().match(/^(?:\/[a-z]{2}(?:-[a-z]{2})?)?\/my-machine(\/.*)?$/);
  if (!m) return null;
  return m[1] === '/login' || m[1]?.startsWith('/login/') ? 'login' : 'protected';
};
