import { NextRequest, NextResponse } from 'next/server';
import { ALLOWED, pimGet } from '@/lib/pim';

/** GET /api/pim/<path>?<query>: read-only proxy to the PIM for the browser (allowlisted paths only); ?fresh=1 skips the cache. */
export async function GET(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
  const path = (await ctx.params).path.join('/');
  if (!ALLOWED.some((re) => re.test(path))) return NextResponse.json({ error: 'not allowed' }, { status: 404 });
  const params = new URLSearchParams(req.nextUrl.searchParams);
  const fresh = params.get('fresh') === '1';
  params.delete('fresh');
  const res = await pimGet(path, params.toString() ? `?${params}` : '', fresh);
  const body = await res.text();
  return new NextResponse(body, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
