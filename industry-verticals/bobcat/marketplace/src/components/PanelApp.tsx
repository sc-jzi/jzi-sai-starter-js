'use client';

import { useEffect, useMemo, useState } from 'react';
import { authoring, useMarketplace } from '@/lib/marketplace';
import { EnrichmentItem, listEnrichment } from '@/lib/enrichment';
import { pim, PimCategory, PimListed } from '@/lib/pim-client';
import ProductView from './ProductView';

/**
 * Page Builder context panel (catalog plan section 7): on a category's wildcard (*) page, pick which PIM product Pages
 * shows while you edit the layout. The pick is saved in the wildcard's `Preview SKU` field (shared, so every author
 * editing that category's layout sees it) and the canvas reloads; the site's route renders that product in editing.
 * Below the picker, the previewed product's enrichment can be edited (the same editor as the full-screen app); a save
 * reloads the canvas, so the change shows in Pages at once. Maximize the panel for the side-by-side layout.
 */
type PageInfo = { id?: string; name?: string; path?: string; displayName?: string };

const HOME = /^\/sitecore\/content\/[^/]+\/[^/]+\/home/i;
/** "/sitecore/content/Bobcat/bobcat/Home/equipment/excavators/compact-excavators/*" -> "/equipment/excavators/compact-excavators" */
const categoryPathOf = (itemPath: string) => itemPath.replace(HOME, '').replace(/\/\*$/, '').toLowerCase();

export default function PanelApp() {
  const mp = useMarketplace();
  const [page, setPage] = useState<PageInfo | null>(null);
  const [categories, setCategories] = useState<PimCategory[] | null>(null);
  const [products, setProducts] = useState<PimListed[] | null>(null);
  const [previewSku, setPreviewSku] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [show, setShow] = useState<'current' | 'previous'>('current');
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [picking, setPicking] = useState(false);
  const [enrichment, setEnrichment] = useState<{ folders: Record<string, string>; items: Record<string, EnrichmentItem> } | null>(null);

  useEffect(() => {
    if (!mp.client || !mp.contextId) return;
    listEnrichment(mp.client, mp.contextId).then(setEnrichment).catch(() => setEnrichment({ folders: {}, items: {} }));
  }, [mp.client, mp.contextId]);

  // the page open in Pages, following navigation
  useEffect(() => {
    if (!mp.client) return;
    mp.client
      .query('pages.context', {
        subscribe: true,
        onSuccess: (ctx) => setPage((ctx?.pageInfo as PageInfo | undefined) ?? null),
      })
      .then((r) => r.data?.pageInfo && setPage(r.data.pageInfo as PageInfo))
      .catch((e) => setMessage({ kind: 'err', text: `Could not read the page open in Pages: ${String(e)}` }));
  }, [mp.client]);

  useEffect(() => {
    pim.categories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const isWildcard = page?.name === '*';
  const categoryPath = isWildcard && page?.path ? categoryPathOf(page.path) : null;
  const category = categoryPath ? categories?.find((c) => c.sitecore_path.toLowerCase() === categoryPath) ?? null : null;

  // the category's products and the wildcard's current Preview SKU
  useEffect(() => {
    setProducts(null);
    setPreviewSku(null);
    setMessage(null);
    if (!category) return;
    pim.listing(category.slug).then(setProducts).catch(() => setProducts([]));
  }, [category]);

  useEffect(() => {
    if (!isWildcard || !page?.id || !mp.client || !mp.contextId) return;
    authoring<{ item: { previewSku: { value: string } | null } | null }>(
      mp.client,
      mp.contextId,
      `query($id: ID!) { item(where: { itemId: $id, language: "en" }) { previewSku: field(name: "Preview SKU") { value } } }`,
      { id: page.id }
    )
      .then((r) => setPreviewSku((r.item?.previewSku?.value || '').toUpperCase() || ''))
      .catch(() => setPreviewSku(''));
  }, [isWildcard, page?.id, mp.client, mp.contextId]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return (products ?? [])
      .filter((p) => (show === 'current' ? p.status === 'active' : p.status === 'discontinued'))
      .filter((p) => !needle || `${p.model} ${p.name} ${p.sku}`.toLowerCase().includes(needle));
  }, [products, q, show]);
  // the product Pages shows: the Preview SKU, or (none chosen / not in this category) the category's first current product
  const current =
    products?.find((p) => p.sku === previewSku) ?? (previewSku !== null ? products?.find((p) => p.status === 'active') : undefined) ?? null;

  const pick = async (p: PimListed) => {
    if (!mp.client || !mp.contextId || !page?.id) return;
    setBusy(p.sku);
    setMessage(null);
    try {
      await authoring(
        mp.client,
        mp.contextId,
        `mutation($input: UpdateItemInput!) { updateItem(input: $input) { item { itemId } } }`,
        { input: { itemId: page.id, language: 'en', fields: [{ name: 'Preview SKU', value: p.sku }] } }
      );
      // read back (R23) before telling Pages to re-render
      const back = await authoring<{ item: { previewSku: { value: string } | null } | null }>(
        mp.client,
        mp.contextId,
        `query($id: ID!) { item(where: { itemId: $id, language: "en" }) { previewSku: field(name: "Preview SKU") { value } } }`,
        { id: page.id }
      );
      const stored = (back.item?.previewSku?.value || '').toUpperCase();
      if (stored !== p.sku) throw new Error(`Saved, but the item reads back "${stored || 'empty'}".`);
      setPreviewSku(stored);
      setPicking(false);
      await mp.client.mutate('pages.reloadCanvas');
      setMessage({ kind: 'ok', text: `Pages now previews the ${p.model}.` });
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(null);
    }
  };

  if (mp.status === 'standalone') {
    return <div className="pp"><p className="pe-muted">Open this panel from the SitecoreAI Page Builder.</p></div>;
  }
  if (mp.status === 'error') {
    return <div className="pp"><p className="pe-error">{mp.error ?? 'Not connected to SitecoreAI.'}</p></div>;
  }

  return (
    <div className="pp">
      <h1 className="pp-title">Preview product</h1>
      {!page ? (
        <p className="pe-muted">Reading the page open in Pages…</p>
      ) : !isWildcard ? (
        <div className="pp-note">
          <p>
            <strong>{page.displayName || page.name}</strong> is not a product template page.
          </p>
          <p className="pe-muted">
            Open a category&rsquo;s <strong>*</strong> page (for example Equipment › Excavators › Compact Excavators › *) to choose
            which PIM product Pages shows while you edit the product layout.
          </p>
        </div>
      ) : !categories ? (
        <p className="pe-muted">Loading the PIM categories…</p>
      ) : !category ? (
        <p className="pe-error">This * page has no matching PIM category ({categoryPath}).</p>
      ) : (
        <>
          <p className="pe-muted pp-sub">
            Product layout for <strong>{category.name}</strong>. Pick the product Pages shows while you edit; the layout is the
            same for every product in this category.
          </p>

          <div className="pp-current">
            <span className="pp-label">Previewing in Pages</span>
            <div className="pp-current__row">
              {previewSku === null || !products ? (
                <span className="pe-muted">…</span>
              ) : current ? (
                <span className="pp-current__item">
                  {current.hero_image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={current.hero_image_url} alt="" />
                  )}
                  <strong>{current.model}</strong>
                  <span className="pe-muted pe-mono">{current.sku}</span>
                  {!previewSku && <span className="pe-muted">(first product: none chosen)</span>}
                </span>
              ) : (
                <span className="pe-muted">No products in this category yet.</span>
              )}
              {!!products?.length && (
                <button type="button" className="pe-btn pe-btn--ghost pp-change" onClick={() => setPicking((v) => !v)} aria-expanded={picking}>
                  {picking ? 'Done' : 'Change product'}
                </button>
              )}
            </div>
          </div>

          {message && <p className={message.kind === 'ok' ? 'pe-ok' : 'pe-error'} role="status">{message.text}</p>}

          {picking && (
            <div className="pp-picker">
              <input
                type="search"
                className="pe-input"
                placeholder="Search model, name or SKU"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Search products"
                autoFocus
              />
              <div className="pe-tabs pp-tabs" role="group" aria-label="Status">
                <button type="button" className={`pe-tab${show === 'current' ? ' is-active' : ''}`} onClick={() => setShow('current')}>
                  Current
                </button>
                <button type="button" className={`pe-tab${show === 'previous' ? ' is-active' : ''}`} onClick={() => setShow('previous')}>
                  Previous
                </button>
              </div>
              {!shown.length ? (
                <p className="pe-muted">No products match.</p>
              ) : (
                <ul className="pp-list">
                  {shown.map((p) => (
                    <li key={p.sku}>
                      <button
                        type="button"
                        className={`pp-item${p.sku === current?.sku ? ' is-on' : ''}`}
                        onClick={() => pick(p)}
                        disabled={!!busy || mp.status !== 'ready'}
                        aria-pressed={p.sku === current?.sku}
                      >
                        {p.hero_image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.hero_image_url} alt="" loading="lazy" />
                        ) : (
                          <span className="pp-item__noimg" />
                        )}
                        <span className="pp-item__text">
                          <strong>{p.model}</strong>
                          <span className="pe-muted pe-mono">{p.sku}</span>
                        </span>
                        {enrichment?.items[p.sku] && <span className="pe-badge pe-badge--enriched">Enriched</span>}
                        {busy === p.sku ? <span className="pe-muted">Saving…</span> : p.sku === current?.sku ? <span className="pp-tick">✓</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* the previewed product's enrichment, edited here; a save reloads the canvas */}
          {current && enrichment && !picking && (
            <div className="pp-editor">
              <ProductView
                key={current.sku}
                sku={current.sku}
                mp={mp}
                item={enrichment.items[current.sku] ?? null}
                folders={enrichment.folders}
                onSaved={(it) => setEnrichment((e) => (e ? { ...e, items: { ...e.items, [it.sku]: it } } : e))}
                inPanel
                onAfterSave={() => mp.client?.mutate('pages.reloadCanvas')}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
