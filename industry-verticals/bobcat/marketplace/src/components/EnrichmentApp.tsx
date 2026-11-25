'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMarketplace } from '@/lib/marketplace';
import { EnrichmentItem, listEnrichment } from '@/lib/enrichment';
import { pim, PimCategory } from '@/lib/pim-client';
import CatalogView from './CatalogView';
import CategoryView from './CategoryView';
import ProductView from './ProductView';

/**
 * Product Enrichment (catalog plan section 7): Catalog -> Category -> Product, one screen at a time (?category=, ?sku=).
 * PIM data is read-only everywhere; enrichment is what marketing edits, saved to SitecoreAI as the signed-in user.
 */
export default function EnrichmentApp() {
  const mp = useMarketplace();
  const router = useRouter();
  const params = useSearchParams();
  const category = params.get('category');
  const sku = params.get('sku');

  const [categories, setCategories] = useState<PimCategory[] | null>(null);
  const [enrichment, setEnrichment] = useState<{ folders: Record<string, string>; items: Record<string, EnrichmentItem> } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    pim.categories().then(setCategories).catch((e) => setError(String(e)));
  }, []);

  const reloadEnrichment = useCallback(async () => {
    if (!mp.client || !mp.contextId) return;
    try {
      setEnrichment(await listEnrichment(mp.client, mp.contextId));
    } catch (e) {
      setError(`Could not read enrichment from SitecoreAI: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, [mp.client, mp.contextId]);

  useEffect(() => {
    reloadEnrichment();
  }, [reloadEnrichment]);

  const go = (next: { category?: string | null; sku?: string | null }) => {
    const q = new URLSearchParams();
    if (next.category) q.set('category', next.category);
    if (next.sku) q.set('sku', next.sku);
    router.push(`/catalog${q.toString() ? `?${q}` : ''}`);
  };

  const onSaved = (item: EnrichmentItem) =>
    setEnrichment((e) => (e ? { ...e, items: { ...e.items, [item.sku]: item } } : e));

  const crumbs = [
    { label: 'Catalog', onClick: () => go({}) },
    ...(category ? [{ label: categories?.find((c) => c.slug === category)?.name ?? category, onClick: () => go({ category }) }] : []),
    ...(sku ? [{ label: sku, onClick: undefined }] : []),
  ];

  return (
    <div className="pe-app">
      <header className="pe-header">
        <div>
          <h1 className="pe-title">Product Enrichment</h1>
          <nav className="pe-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) => (
              <span key={i}>
                {i > 0 && <span className="pe-crumbs__sep">/</span>}
                {c.onClick && i < crumbs.length - 1 ? (
                  <button type="button" className="pe-link" onClick={c.onClick}>
                    {c.label}
                  </button>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        </div>
        <div className="pe-env">
          <span className="pe-chip pe-chip--pim">PIM: Product Data (Xano)</span>
          {mp.status === 'ready' && <span className="pe-chip pe-chip--ok">SitecoreAI: {mp.tenantName ?? 'connected'}</span>}
          {mp.status === 'loading' && <span className="pe-chip">Connecting to SitecoreAI…</span>}
          {mp.status === 'standalone' && (
            <span className="pe-chip pe-chip--warn" title="Open the app from SitecoreAI to edit enrichment">
              Not in SitecoreAI: read-only
            </span>
          )}
          {mp.status === 'error' && <span className="pe-chip pe-chip--err" title={mp.error ?? ''}>SitecoreAI: not connected</span>}
        </div>
      </header>

      {error && <p className="pe-error" role="alert">{error}</p>}

      <main className="pe-main">
        {sku ? (
          <ProductView
            key={sku}
            sku={sku}
            mp={mp}
            item={enrichment?.items[sku.toUpperCase()] ?? null}
            folders={enrichment?.folders ?? {}}
            onSaved={onSaved}
          />
        ) : category ? (
          <CategoryView
            key={category}
            category={categories?.find((c) => c.slug === category) ?? null}
            slug={category}
            items={enrichment?.items ?? null}
            onOpen={(s) => go({ category, sku: s })}
          />
        ) : (
          <CatalogView
            categories={categories}
            items={enrichment?.items ?? null}
            connected={mp.status === 'ready' || mp.status === 'loading'}
            onCategory={(c) => go({ category: c })}
            onProduct={(c, s) => go({ category: c, sku: s })}
          />
        )}
      </main>
    </div>
  );
}
