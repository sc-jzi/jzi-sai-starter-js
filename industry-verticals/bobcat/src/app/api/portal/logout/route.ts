import { NextResponse } from 'next/server';
import { SESSION_COOKIE } from 'lib/portal/session';
import { PENDING_SAVE_COOKIE, SAVED_COOKIE } from 'lib/portal/saved';

/** POST -> ends the portal session and forgets the saved machines (the demo starts clean for the next run). */
export async function POST() {
  const res = NextResponse.json({ ok: true });
  for (const name of [SESSION_COOKIE, SAVED_COOKIE, PENDING_SAVE_COOKIE]) {
    res.cookies.set(name, '', { httpOnly: true, path: '/', maxAge: 0 });
  }
  return res;
}
