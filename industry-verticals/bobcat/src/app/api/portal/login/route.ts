import { NextResponse } from 'next/server';
import { verifyCredentials } from 'lib/portal/accounts';
import { getPortalData } from 'lib/portal/my-machine-data';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from 'lib/portal/session';

/**
 * POST { username, password } -> sets the signed session cookie and returns the profile the browser needs for the
 * Sitecore identity event. Wrong credentials and a missing signing secret both answer 401 with the same message.
 */
export const runtime = 'nodejs';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { username?: string; password?: string };
  const account = verifyCredentials(`${body.username ?? ''}`, `${body.password ?? ''}`);
  const token = account ? await createSessionToken(account.accountId) : null;
  if (!account || !token) {
    return NextResponse.json({ ok: false, error: 'invalid_credentials' }, { status: 401 });
  }
  const profile = getPortalData(account.accountId)?.profile;
  const res = NextResponse.json({ ok: true, profile });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
