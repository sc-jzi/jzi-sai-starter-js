import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/revalidate { sku }: asks the Bobcat site to expire its cached PIM + enrichment reads for one product
 * (the site's POST /api/pim/revalidate), so a Save shows on the next page load. Server side, so the secret stays here.
 */
export async function POST(req: NextRequest) {
  const { sku } = (await req.json().catch(() => ({}))) as { sku?: string };
  const site = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3010').replace(/\/$/, '');
  if (!sku) return NextResponse.json({ error: 'sku required' }, { status: 400 });
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (process.env.PIM_REVALIDATE_SECRET) headers['x-pim-revalidate-secret'] = process.env.PIM_REVALIDATE_SECRET;
  try {
    const res = await fetch(`${site}/api/pim/revalidate`, { method: 'POST', headers, body: JSON.stringify({ sku }) });
    const detail = res.ok ? undefined : (await res.text().catch(() => '')).slice(0, 200);
    return NextResponse.json({ ok: res.ok, status: res.status, site, detail });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e), site }, { status: 502 });
  }
}
