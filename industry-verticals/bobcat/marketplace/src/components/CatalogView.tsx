'use client';

import { useEffect, useMemo, useState } from 'react';
import { EnrichmentItem } from '@/lib/enrichment';
import { pim, PimCategory, PimListed } from '@/lib/pim-client';

/** Catalog: the PIM category tree with product counts and how many are enriched, plus a search across the PIM. */
export default function CatalogView({
  categories,
  items,
  connected,
  onCategory,
  onProduct,
}: {
  categories: PimCategory[] | null;
  items: Record<string, EnrichmentItem> | null;
  /** false when the app runs outside SitecoreAI (no enrichment to count) */
  connected: boolean;
  onCategory: (slug: string) => void;
  onProduct: (categorySlug: string, sku: string) => void;
}) {
  const [q, setQ] = useState('');
  const [hits, setHits] = useState<PimListed[] | null>(null);

  useEffect(() => {
    if (q.trim().length < 2) {
      setHits(null);
      return;
    }
    const t = setTimeout(() => pim.search(q.trim()).then((r) => setHits(r.items)).catch(() => setHits([])), 350);
    return () => clearTimeout(t);
  }, [q]);

  const enrichedBy = useMemo(() => {
    const m: Record<string, number> = {};
    for (const it of Object.values(items ?? {})) m[it.category] = (m[it.category] ?? 0) + 1;
    return m;
  }, [items]);

  const roots = (categories ?? []).filter((c) => !c.parent_id).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const childrenOf = (id: number) => (categories ?? []).filter((c) => c.parent_id === id).sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0));
  const leafSlug = (path: string) => path.replace(/\/$/, '').split('/').pop() ?? '';

  return (
    <section>
      <div className="pe-search">
        <input
          type="search"
          className="pe-input pe-input--search"
          placeholder="Search the PIM by name, model or SKU"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          aria-label="Search products"
        />
      </div>

      {hits && (
        <div className="pe-card">
          <h2 className="pe-h2">{hits.length} result{hits.length === 1 ? '' : 's'}</h2>
          <ul className="pe-list">
            {hits.map((p) => (
              <li key={p.sku}>
                <button type="button" className="pe-row" onClick={() => onProduct(leafSlug(p.category_path), p.sku)}>
                  <span className="pe-row__main">
                    <strong>{p.model}</strong> <span className="pe-muted">{p.sku}</span>
                  </span>
                  <span className="pe-muted">{p.name}</span>
                  {items?.[p.sku] && <span className="pe-badge pe-badge--enriched">Enriched</span>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!categories ? (
        <p className="pe-muted">Loading the PIM category tree…</p>
      ) : (
        <div className="pe-tree">
          {roots.map((root) => {
            const kids = childrenOf(root.id);
            const leaves = kids.length ? kids : [root];
            return (
              <div className="pe-card" key={root.id}>
                <h2 className="pe-h2">
                  {root.name} <span className="pe-muted">{root.product_count ?? 0} products</span>
                </h2>
                <ul className="pe-list">
                  {leaves.map((c) => (
                    <li key={c.id}>
                      <button type="button" className="pe-row" onClick={() => onCategory(c.slug)}>
                        <span className="pe-row__main">{c.name}</span>
                        <span className="pe-muted">{c.product_count ?? 0} products</span>
                        <span className="pe-count" title="Products with enrichment in SitecoreAI">
                          {items ? `${enrichedBy[c.slug] ?? 0} enriched` : connected ? '…' : '—'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
