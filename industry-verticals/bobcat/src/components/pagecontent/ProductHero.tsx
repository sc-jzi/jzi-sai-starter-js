'use client';

import { JSX, useEffect, useState } from 'react';
import {
  Field,
  Image,
  ImageField,
  Link,
  LinkField,
  RichText,
  RichTextField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { plainText, toJsonLd } from 'lib/json-ld';

/**
 * ProductHero: the Product page's own fields (no datasource) - a gallery of Image1-Image4 beside the model name (Title),
 * Subtitle, Summary, Highlights, the starting price, the Build & Price button with the inventory / offers / dealer links,
 * the Special Offers box and the brochure link. "Save to My Machine" (SaveLabel / SavedLabel) adds the page to the
 * owner's saved machines (POST /api/portal/saved); signed out, the save is kept and the visitor goes to the My Machine
 * sign-in, then to Saved Machines. Also writes the page's schema.org Product JSON-LD.
 */

interface ProductRouteFields {
  Title?: Field<string>;
  Subtitle?: Field<string>;
  Summary?: RichTextField;
  Highlights?: RichTextField;
  PriceLabel?: Field<string>;
  Price?: Field<string>;
  OfferTitle?: Field<string>;
  OfferText?: RichTextField;
  Image1?: ImageField;
  Image2?: ImageField;
  Image3?: ImageField;
  Image4?: ImageField;
  BuildLink?: LinkField;
  InventoryLink?: LinkField;
  OffersLink?: LinkField;
  DealerLink?: LinkField;
  BrochureLink?: LinkField;
  SaveLabel?: Field<string>;
  SavedLabel?: Field<string>;
}

type Look = 'default' | 'bobcat';
type SaveState = 'idle' | 'busy' | 'saved';

const IMAGE_KEYS = ['Image1', 'Image2', 'Image3', 'Image4'] as const;

const productJsonLd = (f: ProductRouteFields): string | null => {
  const name = `${f.Title?.value ?? ''}`.trim();
  if (!name) return null;
  const price = `${f.Price?.value ?? ''}`.replace(/[^0-9.]/g, '');
  return toJsonLd({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `Bobcat ${name} ${`${f.Subtitle?.value ?? ''}`.trim()}`.trim(),
    description: plainText(f.Summary?.value),
    image: IMAGE_KEYS.map((k) => f[k]?.value?.src).filter(Boolean),
    brand: { '@type': 'Brand', name: 'Bobcat' },
    category: `${f.Subtitle?.value ?? ''}`.trim(),
    offers: price
      ? { '@type': 'Offer', price, priceCurrency: 'USD', availability: 'https://schema.org/InStock' }
      : undefined,
  });
};

/** /my-machine paths keep the site / locale prefix the page was served under. */
const portalPath = (path: string): string => {
  const base = window.location.pathname.replace(/\/equipment(\/.*)?$/i, '');
  return `${base}/my-machine${path}`;
};

const ProductHeroView = ({ props, look }: { props: ComponentProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const route = page?.layout?.sitecore?.route;
  const f = (route?.fields ?? {}) as ProductRouteFields;
  const itemId = `${route?.itemId ?? ''}`;
  const key = itemId.replace(/[^0-9a-f]/gi, '').toLowerCase();
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const images = IMAGE_KEYS.filter((k) => isEditing || !!f[k]?.value?.src);
  const [active, setActive] = useState<(typeof IMAGE_KEYS)[number]>('Image1');
  const [save, setSave] = useState<SaveState>('idle');
  const jsonLd = isEditing ? null : productJsonLd(f);

  useEffect(() => {
    if (isEditing || !key) return;
    fetch('/api/portal/saved', { credentials: 'same-origin', cache: 'no-store' })
      .then((r) => r.json())
      .then((d: { ids?: string[] }) => {
        if (d.ids?.includes(key)) setSave('saved');
      })
      .catch(() => undefined);
  }, [isEditing, key]);

  const onSave = async () => {
    if (isEditing || save !== 'idle' || !itemId) return;
    setSave('busy');
    const res = await fetch('/api/portal/saved', {
      method: 'POST',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: itemId }),
    }).catch(() => null);
    if (res?.status === 401) {
      // signed out: the save is parked server-side and joins the list at sign-in
      window.location.assign(`${portalPath('/login')}?returnUrl=${encodeURIComponent(portalPath('/saved'))}`);
      return;
    }
    setSave(res?.ok ? 'saved' : 'idle');
  };

  const has = (l?: LinkField) => isEditing || !!l?.value?.href;
  const main = f[active]?.value?.src || isEditing ? active : images[0];

  return (
    <div className={`component product-hero product-hero--${look} ${styles}`} id={id ? id : undefined}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <div className="product-hero__inner">
        <div className="product-hero__gallery">
          <div className="product-hero__main">{main && <Image field={f[main]} className="product-hero__image" />}</div>
          {images.length > 1 && (
            <ul className="product-hero__thumbs">
              {images.map((k) => (
                <li key={k}>
                  {isEditing ? (
                    <Image field={f[k]} className="product-hero__thumb" />
                  ) : (
                    <button
                      type="button"
                      className={`product-hero__thumb-button${k === main ? ' is-active' : ''}`}
                      onClick={() => setActive(k)}
                      aria-label={`Show image ${k.slice(-1)}`}
                    >
                      <Image field={f[k]} className="product-hero__thumb" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="product-hero__body">
          <h1 className="product-hero__title">
            <Text field={f.Title} />
          </h1>
          {(isEditing || !!f.Subtitle?.value) && (
            <p className="product-hero__subtitle">
              <Text field={f.Subtitle} />
            </p>
          )}
          {(isEditing || !!f.Summary?.value) && <RichText field={f.Summary} className="product-hero__summary" />}
          {(isEditing || !!f.Highlights?.value) && (
            <RichText field={f.Highlights} className="product-hero__highlights" />
          )}
          {(isEditing || !!f.Price?.value) && (
            <p className="product-hero__price">
              <Text field={f.PriceLabel} tag="span" className="product-hero__price-label" />{' '}
              <Text field={f.Price} tag="strong" />
            </p>
          )}

          <div className="product-hero__actions">
            {has(f.BuildLink) && <Link field={f.BuildLink as LinkField} className="bobcat-button" />}
            {(isEditing || !!f.SaveLabel?.value) &&
              (isEditing ? (
                <span className="bobcat-button bobcat-button--secondary product-hero__save">
                  <Text field={f.SaveLabel} />
                </span>
              ) : save === 'saved' ? (
                <a className="bobcat-button bobcat-button--secondary product-hero__save is-saved" href={portalPath('/saved')}>
                  {`${f.SavedLabel?.value || f.SaveLabel?.value}`}
                </a>
              ) : (
                <button
                  type="button"
                  className="bobcat-button bobcat-button--secondary product-hero__save"
                  onClick={onSave}
                  disabled={save === 'busy'}
                >
                  {`${f.SaveLabel?.value}`}
                </button>
              ))}
          </div>

          <ul className="product-hero__links">
            {[f.InventoryLink, f.OffersLink, f.DealerLink].map(
              (l, i) =>
                has(l) && (
                  <li key={i}>
                    <Link field={l as LinkField} className="bobcat-arrow-link" />
                  </li>
                )
            )}
          </ul>

          {(isEditing || !!f.OfferText?.value) && (
            <div className="product-hero__offer">
              <h2 className="product-hero__offer-title">
                <Text field={f.OfferTitle} />
              </h2>
              <RichText field={f.OfferText} className="product-hero__offer-text" />
            </div>
          )}
          {has(f.BrochureLink) && (
            <p className="product-hero__brochure">
              <Link field={f.BrochureLink as LinkField} className="bobcat-arrow-link" />
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <ProductHeroView props={props} look="default" />;

/* Bobcat: gallery left (main image over a row of thumbnails), 64px condensed model name, orange check highlights,
   price line, orange Build & Price beside an outlined Save, grey Special Offers box */
export const Bobcat = (props: ComponentProps): JSX.Element => <ProductHeroView props={props} look="bobcat" />;
