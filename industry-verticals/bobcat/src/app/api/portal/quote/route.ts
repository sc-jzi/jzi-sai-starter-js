import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from 'lib/portal/session';
import { normalizeId, readSaved, writeSaved } from 'lib/portal/saved';

/** POST { productId } -> records a quote request for a saved machine (simulated; it shows "Quote pending"). */
export async function POST(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const { productId } = (await req.json().catch(() => ({}))) as { productId?: string };
  const key = normalizeId(`${productId ?? ''}`);
  const list = readSaved(req);
  if (!list.some((e) => e.id === key)) return NextResponse.json({ ok: false }, { status: 404 });
  const res = NextResponse.json({ ok: true });
  writeSaved(
    res,
    list.map((e) => (e.id === key ? { ...e, quote: true } : e))
  );
  return res;
}
