'use client';

import { useEffect, useMemo, useState } from 'react';
import { EnrichmentItem } from '@/lib/enrichment';
import { pim, PimCategory, PimListed } from '@/lib/pim-client';

/** Category: every product of a PIM category with its status and enrichment state; filter enriched / not / previous. */
export default function CategoryView({
  category,
  slug,
  items,
  onOpen,
}: {
  category: PimCategory | null;
  slug: string;
  items: Record<string, EnrichmentItem> | null;
  onOpen: (sku: string) => void;
}) {
  const [products, setProducts] = useState<PimListed[] | null>(null);
  const [filter, setFilter] = useState<'all' | 'enriched' | 'not' | 'previous'>('all');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pim.listing(slug).then(setProducts).catch((e) => setError(String(e)));
  }, [slug]);

  const shown = useMemo(
    () =>
      (products ?? []).filter((p) =>
        filter === 'enriched'
          ? !!items?.[p.sku]
          : filter === 'not'
            ? !items?.[p.sku]
            : filter === 'previous'
              ? p.status === 'discontinued'
              : true
      ),
    [products, items, filter]
  );
  const enrichedCount = (products ?? []).filter((p) => items?.[p.sku]).length;

  return (
    <section className="pe-card">
      <div className="pe-card__head">
        <h2 className="pe-h2">
          {category?.name ?? slug}{' '}
          <span className="pe-muted">
            {products ? `${products.length} products · ${items ? enrichedCount : '…'} enriched` : 'loading…'}
          </span>
        </h2>
        <div className="pe-tabs" role="group" aria-label="Filter">
          {(
            [
              ['all', 'All'],
              ['enriched', 'Enriched'],
              ['not', 'Not enriched'],
              ['previous', 'Previous models'],
            ] as const
          ).map(([k, label]) => (
            <button
              key={k}
              type="button"
              className={`pe-tab${filter === k ? ' is-active' : ''}`}
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {error && <p className="pe-error">{error}</p>}
      <table className="pe-table">
        <thead>
          <tr>
            <th aria-label="Image" />
            <th>Model</th>
            <th>SKU</th>
            <th>PIM status</th>
            <th>Enrichment</th>
            <th>Last edited</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((p) => {
            const e = items?.[p.sku];
            return (
              <tr key={p.sku} onClick={() => onOpen(p.sku)} className="pe-table__row" tabIndex={0} onKeyDown={(ev) => ev.key === 'Enter' && onOpen(p.sku)}>
                <td>
                  {p.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.hero_image_url} alt="" className="pe-thumb" loading="lazy" />
                  )}
                </td>
                <td>
                  <strong>{p.model}</strong>
                  {p.data_origin === 'illustrative' && <span className="pe-badge pe-badge--muted">illustrative</span>}
                </td>
                <td className="pe-mono">{p.sku}</td>
                <td>
                  <span className={`pe-badge ${p.status === 'active' ? 'pe-badge--ok' : 'pe-badge--muted'}`}>
                    {p.status === 'active' ? 'Current' : `Discontinued${p.model_years ? ` ${p.model_years}` : ''}`}
                  </span>
                </td>
                <td>
                  {e ? <span className="pe-badge pe-badge--enriched">Enriched</span> : <span className="pe-muted">—</span>}
                  {e?.workflowState && <span className="pe-badge pe-badge--muted">{e.workflowState}</span>}
                </td>
                <td className="pe-muted">{e?.updated ? formatDate(e.updated) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {products && !shown.length && <p className="pe-muted">No products match this filter.</p>}
    </section>
  );
}

/** Sitecore dates look like 20261125T202030Z. */
export const formatDate = (v: string) => {
  const m = v.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/);
  return m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5])).toLocaleString() : v;
};
