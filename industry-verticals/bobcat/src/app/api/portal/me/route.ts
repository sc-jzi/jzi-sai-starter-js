import { NextRequest, NextResponse } from 'next/server';
import { getCatalogProducts } from 'lib/portal/catalog';
import { ConsideredMachine, ConsideredStatus, getPortalData } from 'lib/portal/my-machine-data';
import { readSaved } from 'lib/portal/saved';
import { SESSION_COOKIE, verifySessionToken } from 'lib/portal/session';

/**
 * GET -> the logged-in owner's portal data (simulated My Machine API); 401 without a valid session.
 * The considered machines are the Product pages the owner saved (looked up in Sitecore), marked Recommended when the
 * dealer recommends that model (CRM) and Quote pending after a quote request. Attachment groups are kept for the machines
 * the owner has or saved.
 */
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value);
  const data = session ? getPortalData(session.sub) : null;
  if (!data) return NextResponse.json({ ok: false }, { status: 401 });

  const saved = readSaved(request);
  const products = await getCatalogProducts(saved.map((e) => e.id));
  const considered: ConsideredMachine[] = products.map((p) => {
    const entry = saved.find((e) => e.id === p.id.replace(/[^0-9a-f]/gi, '').toLowerCase());
    const recommended = data.recommendations.models.some((m) => m.toLowerCase() === p.model.toLowerCase());
    const statuses: ConsideredStatus[] = ['saved'];
    if (recommended) statuses.push('recommended');
    if (entry?.quote) statuses.push('pending');
    return {
      id: p.id,
      model: p.model,
      type: p.type,
      image: p.image,
      imageAlt: p.imageAlt,
      summary: p.summary,
      highlights: p.highlights,
      statuses,
      savedOn: entry?.at ?? '',
      recommendedBy: recommended ? data.recommendations.by : '',
      detailsUrl: p.path,
    };
  });

  const relevant = [...data.owned.map((m) => m.model), ...considered.map((m) => m.model)].map((m) => m.toLowerCase());
  const attachments = data.attachments.filter((g) =>
    g.forModel
      .toLowerCase()
      .split(/\s+and\s+|,\s*/)
      .some((m) => relevant.includes(m.trim()))
  );

  return NextResponse.json(
    { ok: true, data: { ...data, considered, attachments } },
    { headers: { 'Cache-Control': 'no-store' } }
  );
}
