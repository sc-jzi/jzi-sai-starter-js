import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getProductBySku, slugTag } from 'src/lib/pim/client';

/**
 * POST /api/pim/revalidate: expires cached PIM reads so a PIM change shows at once (catalog plan section 4).
 * Body (JSON) or query: { sku } | { category } | { all: true }.
 * Auth: header `x-pim-revalidate-secret` (or ?secret=) equal to PIM_REVALIDATE_SECRET. Without that variable set, the
 * endpoint only answers in development (localhost); on Vercel it refuses until the secret is configured.
 * Called by `npm run pim:revalidate`, later by the Marketplace app after Publish and by the PIM on change.
 */
export const dynamic = 'force-dynamic';

const expire = (tag: string) => revalidateTag(tag, { expire: 0 });

export async function POST(req: NextRequest) {
  const secret = process.env.PIM_REVALIDATE_SECRET;
  const given = req.headers.get('x-pim-revalidate-secret') || req.nextUrl.searchParams.get('secret');
  if (secret ? given !== secret : process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: secret ? 'unauthorized' : 'PIM_REVALIDATE_SECRET is not set' },
      { status: secret ? 401 : 503 }
    );
  }

  const body = (await req.json().catch(() => ({}))) as { sku?: string; category?: string; all?: boolean };
  const q = req.nextUrl.searchParams;
  const sku = (body.sku || q.get('sku') || '').trim();
  const category = (body.category || q.get('category') || '').trim().toLowerCase();
  const all = body.all === true || q.get('all') === 'true';

  const tags: string[] = [];
  if (all) tags.push('pim');
  if (category) tags.push(`pim:cat:${category}`);
  if (sku) {
    const p = await getProductBySku(sku).catch(() => null);
    if (!p?.category) return NextResponse.json({ error: `unknown SKU ${sku}` }, { status: 404 });
    tags.push(slugTag(p.category.slug, p.slug));
  }
  if (!tags.length) return NextResponse.json({ error: 'give sku, category or all' }, { status: 400 });

  tags.forEach(expire);
  return NextResponse.json({ revalidated: tags, at: new Date().toISOString() });
}
