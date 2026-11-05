import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from 'lib/portal/session';
import { PENDING_SAVE_COOKIE, addSaved, isItemId, normalizeId, readSaved, writeSaved } from 'lib/portal/saved';

/**
 * Saved machines (simulated My Machine API):
 * GET    -> { signedIn, ids } (the product page shows "Saved" when its id is in the list)
 * POST   { productId } -> saves it; signed out: the save is parked for the sign-in and the answer is 401 { login: true }
 * DELETE { productId } -> removes it
 */
export const dynamic = 'force-dynamic';

const body = async (req: NextRequest): Promise<string> => {
  const json = (await req.json().catch(() => ({}))) as { productId?: string };
  return `${json.productId ?? ''}`;
};

export async function GET(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  return NextResponse.json(
    { signedIn: !!session, ids: session ? readSaved(req).map((e) => e.id) : [] },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}

export async function POST(req: NextRequest) {
  const productId = await body(req);
  if (!isItemId(productId)) return NextResponse.json({ ok: false }, { status: 400 });
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const res = NextResponse.json({ ok: false, login: true }, { status: 401 });
    res.cookies.set(PENDING_SAVE_COOKIE, normalizeId(productId), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 60,
    });
    return res;
  }
  const res = NextResponse.json({ ok: true, saved: true });
  writeSaved(res, addSaved(readSaved(req), productId));
  return res;
}

export async function DELETE(req: NextRequest) {
  const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ ok: false }, { status: 401 });
  const key = normalizeId(await body(req));
  const res = NextResponse.json({ ok: true });
  writeSaved(
    res,
    readSaved(req).filter((e) => e.id !== key)
  );
  return res;
}
