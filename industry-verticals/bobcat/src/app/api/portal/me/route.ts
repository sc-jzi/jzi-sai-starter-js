import { NextRequest, NextResponse } from 'next/server';
import { getPortalData } from 'lib/portal/my-machine-data';
import { QUOTE_COOKIE } from 'lib/portal/quote';
import { SESSION_COOKIE, verifySessionToken } from 'lib/portal/session';

/** GET -> the logged-in owner's portal data (simulated My Machine API); 401 without a valid session. */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const data = session ? getPortalData(session.sub) : null;
  if (!data) return NextResponse.json({ ok: false }, { status: 401 });
  const quoted = request.cookies.get(QUOTE_COOKIE)?.value === '1';
  const statuses = quoted
    ? [...data.considered.statuses.filter((s) => s !== 'pending'), 'pending' as const]
    : data.considered.statuses;
  return NextResponse.json(
    { ok: true, data: { ...data, considered: { ...data.considered, statuses } } },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
