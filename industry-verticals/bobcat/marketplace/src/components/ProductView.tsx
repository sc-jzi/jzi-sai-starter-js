'use client';

import { useEffect, useMemo, useState } from 'react';
import { MarketplaceState } from '@/lib/marketplace';
import {
  EMPTY_VALUES,
  EnrichmentItem,
  EnrichmentValues,
  OFFER_PAGES,
  publishEnrichment,
  saveEnrichment,
} from '@/lib/enrichment';
import { AttachmentGroup, pim, PimProduct, productUrl } from '@/lib/pim-client';
import { formatDate } from './CategoryView';
import CloudinaryPicker from './CloudinaryPicker';

/** Rich text <-> the plain paragraphs the form edits (the override is stored as Rich Text, R26). */
const toPlain = (html: string) =>
  html
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const toHtml = (plain: string) =>
  plain
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p>${esc(p).replace(/\n/g, '<br />')}</p>`)
    .join('');

const LIMITS = { metaTitle: 60, metaDescription: 160, aeoShortAnswer: 300 };

/**
 * Product: PIM data on the left (read-only, "Source: PIM"), enrichment on the right (editable). Save creates the
 * SitecoreAI item on the first save and updates it afterwards (recorded as the app's identity, see lib/marketplace.ts);
 * Preview opens the product page on the site; Publish sends the item to Experience Edge (the live site).
 */
export default function ProductView({
  sku,
  mp,
  item,
  folders,
  onSaved,
  inPanel = false,
  onAfterSave,
}: {
  sku: string;
  mp: MarketplaceState;
  item: EnrichmentItem | null;
  folders: Record<string, string>;
  onSaved: (item: EnrichmentItem) => void;
  /** in the Page Builder panel: no Preview link (Pages is the preview), and the canvas reloads after a save */
  inPanel?: boolean;
  onAfterSave?: () => Promise<void> | void;
}) {
  const [product, setProduct] = useState<PimProduct | null>(null);
  const [groups, setGroups] = useState<AttachmentGroup[] | null>(null);
  const [values, setValues] = useState<EnrichmentValues>(EMPTY_VALUES);
  const [summaryPlain, setSummaryPlain] = useState('');
  const [busy, setBusy] = useState<'' | 'save' | 'publish' | 'refresh'>('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const canEdit = mp.status === 'ready' && !!mp.client && !!mp.contextId;

  useEffect(() => {
    pim
      .product(sku)
      .then((p) => {
        setProduct(p);
        if (p.product_kind === 'machine') pim.compatibleAttachments(p.sku).then((r) => setGroups(r.groups)).catch(() => setGroups([]));
      })
      .catch((e) => setLoadError(String(e)));
  }, [sku]);

  // the form starts from the saved enrichment (or empty), and follows it when another save comes back
  useEffect(() => {
    const v = item?.values ?? EMPTY_VALUES;
    setValues(v);
    setSummaryPlain(toPlain(v.summaryOverride));
  }, [item]);

  const saved = item?.values ?? EMPTY_VALUES;
  const dirty = useMemo(
    () => JSON.stringify({ ...values, summaryOverride: toHtml(summaryPlain) }) !== JSON.stringify(saved),
    [values, summaryPlain, saved]
  );
  const set = <K extends keyof EnrichmentValues>(k: K, v: EnrichmentValues[K]) => setValues((s) => ({ ...s, [k]: v }));
  const category = product?.category?.slug ?? '';

  const onSave = async () => {
    if (!canEdit || !product) return;
    setBusy('save');
    setMessage(null);
    try {
      const back = await saveEnrichment(mp.client!, mp.contextId!, {
        sku: product.sku,
        category,
        folderId: folders[category],
        itemId: item?.itemId,
        values: { ...values, summaryOverride: toHtml(summaryPlain) },
      });
      onSaved(back);
      // the site's cache for this product (PIM + enrichment) is expired, so Preview shows the change at once
      const rv = await fetch('/api/revalidate', { method: 'POST', body: JSON.stringify({ sku: product.sku }) })
        .then((r) => r.json())
        .catch(() => ({ ok: false }));
      if (onAfterSave) await Promise.resolve(onAfterSave()).catch(() => undefined);
      setMessage({
        kind: 'ok',
        text: inPanel
          ? `${item ? 'Saved' : 'Created and saved'} in SitecoreAI. The page in Pages is reloaded.`
          : `${item ? 'Saved' : 'Created and saved'} in SitecoreAI.${rv.ok ? ' The site preview is refreshed.' : ' The site preview refreshes within a minute.'}`,
      });
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy('');
    }
  };

  /**
   * Refresh from PIM: re-reads the product from the PIM (skipping the app's one-minute cache) and asks the site to drop
   * its cached copy (the site keeps PIM data for a day), so a change made in the PIM shows on the next page load.
   */
  const onRefresh = async () => {
    setBusy('refresh');
    setMessage(null);
    try {
      const before = product;
      const [fresh, rv] = await Promise.all([
        pim.product(sku, true),
        fetch('/api/revalidate', { method: 'POST', body: JSON.stringify({ sku }) })
          .then((r) => r.json() as Promise<{ ok: boolean; status?: number; site?: string; detail?: string }>)
          .catch((e) => ({ ok: false, status: undefined, detail: String(e) })),
      ]);
      setProduct(fresh);
      const changed =
        !!before &&
        (before.summary !== fresh.summary ||
          JSON.stringify(before.specs) !== JSON.stringify(fresh.specs) ||
          before.status !== fresh.status ||
          before.msrp !== fresh.msrp ||
          before.hero_image_url !== fresh.hero_image_url);
      setMessage(
        rv.ok
          ? {
              kind: 'ok',
              text: `${changed ? 'New product data from the PIM.' : 'Product data is up to date with the PIM.'} The site shows the PIM's current data on the next page load.`,
            }
          : {
              kind: 'err',
              text: `Read the PIM, but the site did not refresh (${rv.status ?? 'unreachable'}${rv.detail ? `: ${rv.detail}` : ''}). Check NEXT_PUBLIC_SITE_URL and PIM_REVALIDATE_SECRET.`,
            }
      );
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy('');
    }
  };

  const onPublish = async () => {
    if (!canEdit || !item) return;
    if (!window.confirm(`Publish the enrichment of ${sku} to the live site (Experience Edge)?`)) return;
    setBusy('publish');
    setMessage(null);
    try {
      const r = await publishEnrichment(mp.client!, mp.contextId!, item.itemId);
      setMessage({ kind: 'ok', text: `Publishing started (operation ${r.publishItem.operationId}).` });
    } catch (e) {
      setMessage({ kind: 'err', text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy('');
    }
  };

  if (loadError) return <p className="pe-error">{loadError}</p>;
  if (!product) return <p className="pe-muted">Loading {sku} from the PIM…</p>;

  const specGroups = [...new Set(product.specs.map((s) => s.group))];
  const allAttachments = (groups ?? []).flatMap((g) => g.items.map((i) => ({ ...i, group: g.name })));
  const toggleFeatured = (s: string) =>
    set(
      'featuredAttachments',
      values.featuredAttachments.includes(s)
        ? values.featuredAttachments.filter((x) => x !== s)
        : [...values.featuredAttachments, s]
    );

  return (
    <section className={`pe-product${inPanel ? ' pe-product--panel' : ''}`}>
      <div className="pe-product__bar">
        <div>
          <h2 className="pe-h1">
            {product.model} <span className="pe-muted pe-mono">{product.sku}</span>
          </h2>
          <p className="pe-muted">
            {item ? (
              <>
                <span className="pe-badge pe-badge--enriched">Enriched</span>
                {item.updated && ` Last edited ${formatDate(item.updated)}${item.updatedBy ? ` by ${item.updatedBy}` : ''}`}
                {item.workflowState && <span className="pe-badge pe-badge--muted">{item.workflowState}</span>}
              </>
            ) : canEdit ? (
              'Not enriched yet: the first Save creates its item in SitecoreAI.'
            ) : mp.status === 'loading' ? (
              'Connecting to SitecoreAI…'
            ) : (
              'Enrichment lives in SitecoreAI: open this app from SitecoreAI to see and edit it.'
            )}
          </p>
        </div>
        <div className="pe-actions">
          <button type="button" className="pe-btn pe-btn--ghost" onClick={onRefresh} disabled={!!busy}
            title="Re-read this product from the PIM and refresh the site's copy">
            {busy === 'refresh' ? 'Refreshing…' : 'Refresh from PIM'}
          </button>
          {!inPanel && (
            <a className="pe-btn pe-btn--ghost" href={productUrl(product)} target="_blank" rel="noreferrer">
              Preview
            </a>
          )}
          <button type="button" className="pe-btn pe-btn--ghost" onClick={onPublish} disabled={!canEdit || !item || dirty || !!busy}
            title={dirty ? 'Save first' : !item ? 'Nothing saved yet' : 'Publish to the live site'}>
            {busy === 'publish' ? 'Publishing…' : 'Publish'}
          </button>
          <button type="button" className="pe-btn" onClick={onSave} disabled={!canEdit || !dirty || !!busy}
            title={canEdit ? '' : 'Open the app from SitecoreAI to save'}>
            {busy === 'save' ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
      {message && <p className={message.kind === 'ok' ? 'pe-ok' : 'pe-error'} role="status">{message.text}</p>}

      <div className="pe-panes">
        {/* PIM: read-only */}
        <div className="pe-card pe-pane pe-pane--pim">
          <h3 className="pe-h3">
            <span aria-hidden="true">🔒</span> Product data <span className="pe-source">Source: PIM</span>
          </h3>
          {product.hero_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.hero_image_url} alt={product.name} className="pe-hero" />
          )}
          <dl className="pe-dl">
            <dt>Name</dt>
            <dd>{product.name}</dd>
            <dt>Category</dt>
            <dd>{product.category?.name}</dd>
            <dt>Status</dt>
            <dd>
              {product.status === 'active' ? 'Current' : 'Discontinued'}
              {product.model_years ? ` · ${product.model_years}` : ''}
              {product.successor ? ` · replaced by ${product.successor.model}` : ''}
            </dd>
            {!!product.msrp && (
              <>
                <dt>MSRP</dt>
                <dd>${Math.round(product.msrp).toLocaleString('en-US')} (illustrative)</dd>
              </>
            )}
            <dt>Data</dt>
            <dd>{product.data_origin === 'real' ? 'Real (bobcat.com)' : 'Illustrative'}</dd>
          </dl>
          {product.summary && (
            <>
              <h4 className="pe-h4">Summary</h4>
              <p className="pe-pim-text">{product.summary}</p>
            </>
          )}
          {specGroups.map((g) => (
            <div key={g}>
              <h4 className="pe-h4">{g}</h4>
              <table className="pe-specs">
                <tbody>
                  {product.specs
                    .filter((s) => s.group === g)
                    .map((s) => (
                      <tr key={s.label}>
                        <th>{s.label}</th>
                        <td>
                          {s.value}
                          {s.unit ? ` ${s.unit}` : ''}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Enrichment: editable */}
        <form className="pe-card pe-pane" onSubmit={(e) => (e.preventDefault(), onSave())}>
          <h3 className="pe-h3">
            Marketing enrichment <span className="pe-source pe-source--sc">Saved in SitecoreAI</span>
          </h3>
          <fieldset disabled={!canEdit} className="pe-fieldset">
            <label className="pe-field">
              <span className="pe-label">Marketing title</span>
              <input className="pe-input" value={values.marketingTitle} onChange={(e) => set('marketingTitle', e.target.value)}
                placeholder={`e.g. ${product.model}: the right size for the job`} />
              <span className="pe-hint">Shown as a tagline under the model name.</span>
            </label>

            <label className="pe-field">
              <span className="pe-label">Summary</span>
              <textarea className="pe-input" rows={4} value={summaryPlain} onChange={(e) => setSummaryPlain(e.target.value)}
                placeholder="Leave empty to use the PIM summary" />
              <span className="pe-hint">
                {summaryPlain ? 'Overrides the PIM summary. ' : 'PIM default is used. '}
                {summaryPlain && (
                  <button type="button" className="pe-link" onClick={() => setSummaryPlain('')}>
                    Reset to PIM
                  </button>
                )}
              </span>
              {product.summary && <span className="pe-pimdefault">PIM default: {product.summary}</span>}
            </label>

            <label className="pe-field">
              <span className="pe-label">Highlights</span>
              <textarea className="pe-input" rows={4} value={values.highlights} onChange={(e) => set('highlights', e.target.value)}
                placeholder="One highlight per line" />
              <span className="pe-hint">One per line; shown as the checklist in the product hero.</span>
            </label>

            <div className="pe-grid2">
              <label className="pe-field">
                <span className="pe-label">Badge</span>
                <input className="pe-input" value={values.badge} onChange={(e) => set('badge', e.target.value)} placeholder="e.g. Special Offer" />
              </label>
              <label className="pe-field">
                <span className="pe-label">Offer link</span>
                <select className="pe-input" value={values.offerPageId} onChange={(e) => set('offerPageId', e.target.value)}>
                  <option value="">None</option>
                  {OFFER_PAGES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {product.product_kind === 'machine' && (
              <div className="pe-field">
                <span className="pe-label">Featured attachments</span>
                <span className="pe-hint">Only attachments that fit this machine (PIM fitment). Featured ones lead the Compatible Attachments row, in this order.</span>
                {!groups ? (
                  <span className="pe-muted">Loading compatible attachments…</span>
                ) : !allAttachments.length ? (
                  <span className="pe-muted">The PIM lists no attachments for this machine.</span>
                ) : (
                  <div className="pe-checks">
                    {allAttachments.map((a) => {
                      const i = values.featuredAttachments.indexOf(a.sku);
                      return (
                        <label key={a.sku} className={`pe-check${i >= 0 ? ' is-on' : ''}`}>
                          <input type="checkbox" checked={i >= 0} onChange={() => toggleFeatured(a.sku)} />
                          <span>{a.model}</span>
                          <span className="pe-muted">{a.group}</span>
                          {i >= 0 && <span className="pe-order">{i + 1}</span>}
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <h4 className="pe-h4">Search and AI answers</h4>
            <label className="pe-field">
              <span className="pe-label">
                Meta title <Counter v={values.metaTitle} max={LIMITS.metaTitle} />
              </span>
              <input className="pe-input" value={values.metaTitle} onChange={(e) => set('metaTitle', e.target.value)}
                placeholder={`${product.name} | Bobcat Company`} />
            </label>
            <label className="pe-field">
              <span className="pe-label">
                Meta description <Counter v={values.metaDescription} max={LIMITS.metaDescription} />
              </span>
              <textarea className="pe-input" rows={3} value={values.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
            </label>
            <div className="pe-field">
              <span className="pe-label">Social image (og:image)</span>
              <CloudinaryPicker value={values.ogImageUrl} onChange={(url) => set('ogImageUrl', url)} alt={`Bobcat ${product.model}`} />
              <span className="pe-hint">Shown when the page is shared on LinkedIn, Facebook or in chat apps. Picked from Cloudinary, stored as its URL.</span>
            </div>
            <label className="pe-field">
              <span className="pe-label">
                Short answer (AEO) <Counter v={values.aeoShortAnswer} max={LIMITS.aeoShortAnswer} />
              </span>
              <textarea className="pe-input" rows={3} value={values.aeoShortAnswer} onChange={(e) => set('aeoShortAnswer', e.target.value)}
                placeholder={`What is the Bobcat ${product.model}? One or two factual sentences.`} />
              <span className="pe-hint">Shown as the product overview: the answer AI assistants and search can quote.</span>
            </label>
            <label className="pe-check pe-check--inline">
              <input type="checkbox" checked={values.noindex} onChange={(e) => set('noindex', e.target.checked)} />
              <span>Hide from search engines (noindex, left out of the sitemap)</span>
            </label>

            {product.status === 'discontinued' && (
              <label className="pe-field">
                <span className="pe-label">When discontinued</span>
                <select className="pe-input" value={values.discontinuedHandling || 'Keep page'}
                  onChange={(e) => set('discontinuedHandling', e.target.value as EnrichmentValues['discontinuedHandling'])}>
                  <option value="Keep page">Keep the page (Discontinued badge, no price)</option>
                  <option value="Redirect to successor" disabled={!product.successor}>
                    Redirect to the successor{product.successor ? ` (${product.successor.model})` : ' (none in the PIM)'}
                  </option>
                  <option value="Hide">Hide the page (404)</option>
                </select>
                <span className="pe-hint">The PIM decides that a model is discontinued; this decides what the site does about it.</span>
              </label>
            )}
          </fieldset>
        </form>
      </div>
    </section>
  );
}

const Counter = ({ v, max }: { v: string; max: number }) => (
  <span className={`pe-counter${v.length > max ? ' is-over' : ''}`}>
    {v.length}/{max}
  </span>
);
