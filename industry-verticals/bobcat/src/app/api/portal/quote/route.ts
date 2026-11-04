import { NextRequest, NextResponse } from 'next/server';
import { QUOTE_COOKIE } from 'lib/portal/quote';
import { SESSION_COOKIE, SESSION_TTL_SECONDS, verifySessionToken } from 'lib/portal/session';

/** POST -> records a quote request for the considered machine (simulated; it becomes "Quote pending"). */
export async function POST(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(QUOTE_COOKIE, '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
  return res;
}
