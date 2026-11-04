import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from 'lib/portal/session';
import { QUOTE_COOKIE } from 'lib/portal/quote';

/** POST -> ends the portal session (and forgets the demo's quote request). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  res.cookies.set(QUOTE_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
  return res;
}
