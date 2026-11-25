'use client';

import { JSX, useState } from 'react';
import { Field, RichText, RichTextField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { fitmentOf, MachineOption, productOf, productPath } from 'lib/pim/product-context';

/**
 * ProductDetails: the Product page's own Details fields (no datasource). Default / Bobcat show the overview (Title +
 * OverviewTitle as the heading, Overview rich text); BobcatSpecs shows the specs (Title + SpecsTitle, Specs rich text
 * holding the key-specs table, styled as the live compare table). A part with no content in it renders nothing.
 * BobcatWorksWith (attachment pages, catalog plan section 4b): the machines the attachment fits, from PIM fitment on the
 * page's product context (src/lib/pim): current models as linked cards, previous models behind a toggle, and a
 * "Fits my machine?" check (pick any machine: yes / no). What fits is PIM data; nothing here is authored.
 * BobcatAttachments (machine pages, catalog plan section 4b): "<model> Compatible Attachments", the current attachments
 * that fit the machine (PIM fitment on `pimFitment`, src/lib/pim/fitment.ts) as cards, with a tab per subcategory. When
 * marketing featured some (enrichment, Product Enrichment app), a Featured tab comes first and is open on page load.
 */

interface ProductDetailsFields {
  Title?: Field<string>;
  OverviewTitle?: Field<string>;
  Overview?: RichTextField;
  SpecsTitle?: Field<string>;
  Specs?: RichTextField;
}

type Look = 'overview' | 'specs';

const ProductDetailsView = ({ props, look }: { props: ComponentProps; look: Look }): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = (page?.layout?.sitecore?.route?.fields ?? {}) as ProductDetailsFields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const heading = look === 'specs' ? f.SpecsTitle : f.OverviewTitle;
  const body = look === 'specs' ? f.Specs : f.Overview;
  if (!isEditing && !body?.value) return null;

  return (
    <div className={`component product-details product-details--${look} ${styles}`} id={id ? id : undefined}>
      <div className="product-details__inner">
        <h2 className="product-details__title">
          {`${f.Title?.value ?? ''}`} <Text field={heading} />
        </h2>
        <RichText field={body} className="product-details__body" />
      </div>
    </div>
  );
};

const MachineLinks = ({ machines }: { machines: MachineOption[] }): JSX.Element => (
  <ul className="works-with__list">
    {machines.map((m) => (
      <li key={m.sku}>
        <a className="works-with__machine" href={productPath(m)}>
          <strong>{m.model}</strong>
          <span>{m.name.replace(/^Bobcat\s+/i, '').replace(m.model, '').trim()}</span>
        </a>
      </li>
    ))}
  </ul>
);

/** BobcatWorksWith: renders only on a PIM attachment page (Pages shows a hint on the wildcard item). */
const WorksWithView = ({ props }: { props: ComponentProps }): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const product = productOf(page);
  const [showPrevious, setShowPrevious] = useState(false);
  const [picked, setPicked] = useState('');
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const works = product?.worksWith;
  if (!works) {
    return isEditing ? (
      <div className={`component product-details works-with ${styles}`}>
        <div className="product-details__inner">
          <span className="is-empty-hint">Works With: filled from the PIM fitment on attachment pages</span>
        </div>
      </div>
    ) : null;
  }
  const fitting = new Set([...works.current, ...works.previous].map((m) => m.sku));
  const machines = product?.machines ?? [];
  const chosen = machines.find((m) => m.sku === picked);

  return (
    <div className={`component product-details works-with ${styles}`} id={id ? id : undefined}>
      <div className="product-details__inner">
        <h2 className="product-details__title">{product.model} Works With</h2>
        {works.current.length === 0 && works.previous.length === 0 ? (
          <p className="works-with__none">No machines are listed for this attachment yet.</p>
        ) : (
          <>
            <MachineLinks machines={works.current} />
            {works.previous.length > 0 && (
              <>
                <button
                  type="button"
                  className="works-with__toggle"
                  aria-expanded={showPrevious}
                  onClick={() => setShowPrevious((v) => !v)}
                >
                  {showPrevious ? 'Hide' : 'Show'} previous models ({works.previous.length})
                </button>
                {showPrevious && <MachineLinks machines={works.previous} />}
              </>
            )}
          </>
        )}

        {machines.length > 0 && (
          <div className="works-with__check">
            <label className="works-with__check-label" htmlFor={`fits-${product.sku}`}>
              Fits my machine?
            </label>
            <select
              id={`fits-${product.sku}`}
              className="works-with__select"
              value={picked}
              onChange={(e) => setPicked(e.target.value)}
            >
              <option value="">Choose your machine</option>
              {machines.map((m) => (
                <option key={m.sku} value={m.sku}>
                  {m.model}
                  {m.status === 'discontinued' ? ' (previous model)' : ''}
                </option>
              ))}
            </select>
            {chosen && (
              <p
                className={`works-with__answer ${fitting.has(chosen.sku) ? 'is-yes' : 'is-no'}`}
                role="status"
                aria-live="polite"
              >
                {fitting.has(chosen.sku)
                  ? `Yes: the ${product.model} works with the ${chosen.model}.`
                  : `No: the ${product.model} is not listed for the ${chosen.model}.`}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/** BobcatAttachments: renders only on a machine page the PIM has fitment for (Pages shows a hint elsewhere). */
const CompatibleAttachmentsView = ({ props }: { props: ComponentProps }): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fitment = fitmentOf(page);
  const [tab, setTab] = useState(() => (fitmentOf(page)?.featured?.length ? 'featured' : 'all'));
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  if (!fitment) {
    return isEditing ? (
      <div className={`component product-details compatible-attachments ${styles}`}>
        <div className="product-details__inner">
          <span className="is-empty-hint">Compatible Attachments: filled from the PIM fitment on machine pages</span>
        </div>
      </div>
    ) : null;
  }
  const total = fitment.groups.reduce((n, g) => n + g.items.length, 0);
  const featured = fitment.featured ?? [];
  const shown =
    tab === 'featured' && featured.length
      ? [{ slug: 'featured', name: 'Featured', items: featured }]
      : tab === 'all' || tab === 'featured'
        ? fitment.groups
        : fitment.groups.filter((g) => g.slug === tab);
  const tabs = [
    ...(featured.length ? [{ slug: 'featured', name: 'Featured', count: featured.length }] : []),
    { slug: 'all', name: 'All', count: total },
    ...fitment.groups.map((g) => ({ slug: g.slug, name: g.name, count: g.items.length })),
  ];

  return (
    <div className={`component product-details compatible-attachments ${styles}`} id={id ? id : undefined}>
      <div className="product-details__inner">
        <h2 className="product-details__title">{fitment.machine.model} Compatible Attachments</h2>
        <div className="compatible-attachments__tabs" role="tablist" aria-label="Attachment types">
          {tabs.map(
            (t) => (
              <button
                key={t.slug}
                type="button"
                role="tab"
                aria-selected={tab === t.slug}
                className={`compatible-attachments__tab${tab === t.slug ? ' is-active' : ''}`}
                onClick={() => setTab(t.slug)}
              >
                {t.name} ({t.count})
              </button>
            )
          )}
        </div>
        {shown.map((g) => (
          <div className="compatible-attachments__group" key={g.slug}>
            {(tab === 'all' || (tab === 'featured' && !featured.length)) && (
              <h3 className="compatible-attachments__group-title">{g.name}</h3>
            )}
            <ul className="compatible-attachments__grid">
              {g.items.map((a) => (
                <li key={a.sku}>
                  <a className="compatible-attachments__card" href={productPath(a)}>
                    {a.hero_image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.hero_image_url} alt="" loading="lazy" className="compatible-attachments__image" />
                    )}
                    {a.featured && tab !== 'featured' && <span className="compatible-attachments__featured">Featured</span>}
                    <strong>{a.model}</strong>
                    {a.hydraulics_required && (
                      <span className="compatible-attachments__note">Requires {a.hydraulics_required}</span>
                    )}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="overview" />;

/* Bobcat: "E35 Overview" - condensed 40px heading, 2-column text on white */
export const Bobcat = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="overview" />;

/* BobcatSpecs: "E35 Specs & Compare" on the light grey band - the key specs table with zebra rows, first column bold */
export const BobcatSpecs = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="specs" />;

/* BobcatWorksWith: "<model> Works With" on attachment pages - linked machine chips, previous models behind a toggle,
   and the Fits my machine? picker (PIM fitment, src/lib/pim) */
export const BobcatWorksWith = (props: ComponentProps): JSX.Element | null => <WorksWithView props={props} />;

/* BobcatAttachments: "<model> Compatible Attachments" on machine pages - attachment cards with a tab per subcategory
   (PIM fitment, src/lib/pim/fitment.ts) */
export const BobcatAttachments = (props: ComponentProps): JSX.Element | null => <CompatibleAttachmentsView props={props} />;
