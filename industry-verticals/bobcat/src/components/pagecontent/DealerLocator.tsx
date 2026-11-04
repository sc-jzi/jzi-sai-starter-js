'use client';

import { JSX, useEffect, useMemo, useState } from 'react';
import { Field, LinkField, RichTextField, Text, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * DealerLocator: Location (with Auto Detect) + Product + Search, then the dealers within MaxDistance that carry the product,
 * nearest first (straight-line miles from the location), each with Call / Visit Website / Get Directions.
 * The dealers are the children of the folder in the Dealers field; each lists the products it carries (Products multilist).
 * Personalization swaps the datasource: a datasource with ShowResults ticked opens with PresetLocation (PresetLatitude/
 * PresetLongitude) and PresetProduct already searched, and the visitor can still change both.
 * A typed location is looked up with OpenStreetMap Nominatim; "lat, lng" (what Auto Detect fills in) is used as is.
 * Datasource and dealer fields come as field lists (fields(ownFields: true)) to stay within Experience Edge's query-depth limit.
 */

type FieldList = { name: string; jsonValue?: unknown }[];

type RefItem = { id?: string; name?: string; fields?: { Title?: { value?: string } } };

interface LocatorFields {
  title?: Field<string>;
  text?: RichTextField;
  locationLabel?: Field<string>;
  locationPlaceholder?: Field<string>;
  autoDetectLabel?: Field<string>;
  productLabel?: Field<string>;
  productPlaceholder?: Field<string>;
  searchLabel?: Field<string>;
  promptText?: Field<string>;
  noResultsText?: Field<string>;
  resultsLabel?: Field<string>;
  callLabel?: Field<string>;
  websiteLabel?: Field<string>;
  directionsLabel?: Field<string>;
  presetLocation?: Field<string>;
  presetLatitude?: Field<number | string>;
  presetLongitude?: Field<number | string>;
  presetProduct?: RefItem | null;
  showResults?: Field<boolean | string>;
  maxDistance?: Field<number | string>;
}

interface DealerFields {
  title?: Field<string>;
  address?: Field<string>;
  phone?: Field<string>;
  website?: LinkField;
  latitude?: Field<number | string>;
  longitude?: Field<number | string>;
  products?: RefItem[];
}

export type DealerLocatorProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        fields?: FieldList;
        dealers?: { targetItem?: { children?: { results?: { id: string; fields?: FieldList }[] } } } | null;
      };
    };
  };
};

type Look = 'default' | 'bobcat';
type Point = { lat: number; lng: number };

/** FieldName -> fieldName, the jsonValue as the value (as the other list components that read field lists). */
const keyed = <T,>(list?: FieldList): T => {
  const out: Record<string, unknown> = {};
  for (const f of list ?? []) {
    if (f?.name) out[f.name.charAt(0).toLowerCase() + f.name.slice(1)] = f.jsonValue;
  }
  return out as T;
};

const str = (f?: Field<unknown>) => `${f?.value ?? ''}`.trim();
const num = (f?: Field<unknown>) => {
  const n = parseFloat(str(f));
  return Number.isFinite(n) ? n : undefined;
};
const productTitle = (p?: RefItem | null) => `${p?.fields?.Title?.value || p?.name || ''}`;
const sameId = (a?: string, b?: string) => !!a && !!b && a.replace(/[{}-]/g, '').toLowerCase() === b.replace(/[{}-]/g, '').toLowerCase();

const miles = (a: Point, b: Point) => {
  const rad = (d: number) => (d * Math.PI) / 180;
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 3958.8 * 2 * Math.asin(Math.sqrt(h));
};

const parseLatLng = (text: string): Point | undefined => {
  const m = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  return m ? { lat: parseFloat(m[1]), lng: parseFloat(m[2]) } : undefined;
};

const geocode = async (text: string): Promise<Point | undefined> => {
  const direct = parseLatLng(text);
  if (direct) return direct;
  const q = new URLSearchParams({ q: text, format: 'json', limit: '1', countrycodes: 'us,ca' });
  const res = await fetch(`https://nominatim.openstreetmap.org/search?${q.toString()}`, { headers: { Accept: 'application/json' } });
  if (!res.ok) return undefined;
  const hits = (await res.json()) as { lat: string; lon: string }[];
  return hits?.[0] ? { lat: parseFloat(hits[0].lat), lng: parseFloat(hits[0].lon) } : undefined;
};

const PinIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="dealer-locator__pin">
    <path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" fill="currentColor" />
  </svg>
);

const TargetIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
    <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
    <path d="M12 1v4M12 19v4M1 12h4M19 12h4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const ArrowIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path d="M13.125 10.875H4.125C3.45 10.875 3 11.325 3 12s.45 1.125 1.125 1.125h9V18.75L21 12l-7.875-6.75v5.625z" fill="currentColor" />
  </svg>
);

const DealerLocatorView = ({ props, look }: { props: DealerLocatorProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const f = useMemo(() => keyed<LocatorFields>(datasource?.fields), [datasource]);

  const dealers = useMemo(
    () =>
      (datasource?.dealers?.targetItem?.children?.results ?? [])
        .map((d) => ({ id: d.id, ...keyed<DealerFields>(d.fields) }))
        .filter((d) => num(d.latitude) !== undefined && num(d.longitude) !== undefined),
    [datasource]
  );

  // Product picker: every product a dealer carries, in the order first seen (the Dealer Products folder order)
  const products = useMemo(() => {
    const seen = new Map<string, string>();
    for (const d of dealers) for (const p of d.products ?? []) if (p?.id && !seen.has(p.id)) seen.set(p.id, productTitle(p));
    return [...seen].map(([pid, title]) => ({ id: pid, title }));
  }, [dealers]);

  const presetPoint = useMemo(() => {
    const lat = num(f.presetLatitude);
    const lng = num(f.presetLongitude);
    return lat !== undefined && lng !== undefined ? { lat, lng } : undefined;
  }, [f]);
  const presetOn = ['1', 'true'].includes(str(f.showResults).toLowerCase()) && !!presetPoint;
  const maxDistance = num(f.maxDistance) ?? 150;

  const [location, setLocation] = useState('');
  const [product, setProduct] = useState('');
  const [origin, setOrigin] = useState<Point | undefined>();
  const [searched, setSearched] = useState<{ point: Point; product: string } | undefined>();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  // A personalized datasource opens with its preset search already run
  useEffect(() => {
    if (!presetOn || !presetPoint) return;
    const pid = f.presetProduct?.id ?? '';
    setLocation(str(f.presetLocation));
    setProduct(pid);
    setOrigin(presetPoint);
    setSearched({ point: presetPoint, product: pid });
  }, [presetOn, presetPoint, f]);

  const results = useMemo(() => {
    if (!searched) return [];
    return dealers
      .filter((d) => !searched.product || (d.products ?? []).some((p) => sameId(p.id, searched.product)))
      .map((d) => ({ ...d, distance: miles(searched.point, { lat: num(d.latitude)!, lng: num(d.longitude)! }) }))
      .filter((d) => d.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }, [dealers, searched, maxDistance]);

  if (!datasource) {
    return (
      <div className={`component dealer-locator ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Dealer Locator: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const search = async () => {
    if (!location.trim() || !product) return;
    setError('');
    setBusy(true);
    try {
      const point =
        origin && (location.trim() === str(f.presetLocation) || parseLatLng(location)) ? origin : await geocode(location.trim());
      if (!point) {
        setError(str(f.noResultsText));
        setSearched(undefined);
      } else {
        setOrigin(point);
        setSearched({ point, product });
      }
    } catch {
      setError(str(f.noResultsText));
    } finally {
      setBusy(false);
    }
  };

  const autoDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const point = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setOrigin(point);
      setLocation(`${point.lat.toFixed(4)}, ${point.lng.toFixed(4)}`);
    });
  };

  const searchedProduct = products.find((p) => sameId(p.id, searched?.product))?.title ?? '';
  const directions = (address: string) =>
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={`component dealer-locator dealer-locator--${look} ${styles}`} id={id ? id : undefined}>
      <div className="dealer-locator__inner">
        {(isEditing || !!str(f.title)) && (
          <h2 className="dealer-locator__title">
            <Text field={f.title} />
          </h2>
        )}
        {(isEditing || !!f.text?.value) && <RichText field={f.text} className="dealer-locator__text" />}

        <form
          className="dealer-locator__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isEditing) search();
          }}
        >
          <div className="dealer-locator__group dealer-locator__group--location">
            <div className="dealer-locator__row">
              <label className="dealer-locator__label" htmlFor={`${datasource.id}-location`}>
                <Text field={f.locationLabel} />*
              </label>
              {(isEditing || !!str(f.autoDetectLabel)) && (
                <button type="button" className="dealer-locator__detect" onClick={() => !isEditing && autoDetect()}>
                  <TargetIcon />
                  <Text field={f.autoDetectLabel} />
                </button>
              )}
            </div>
            <div className="dealer-locator__field">
              <PinIcon />
              <input
                id={`${datasource.id}-location`}
                type="text"
                className="dealer-locator__input"
                placeholder={str(f.locationPlaceholder)}
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setOrigin(undefined);
                }}
                disabled={isEditing}
              />
            </div>
          </div>
          <div className="dealer-locator__group">
            <label className="dealer-locator__label" htmlFor={`${datasource.id}-product`}>
              <Text field={f.productLabel} />*
            </label>
            <select
              id={`${datasource.id}-product`}
              className="dealer-locator__select"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
              disabled={isEditing}
            >
              <option value="">{str(f.productPlaceholder)}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="dealer-locator__submit"
            disabled={!isEditing && (busy || !location.trim() || !product)}
          >
            {isEditing ? <Text field={f.searchLabel} /> : str(f.searchLabel) || 'Search'}
          </button>
        </form>

        {isEditing && (
          <p className="dealer-locator__hint">
            Placeholders: <Text field={f.locationPlaceholder} /> / <Text field={f.productPlaceholder} />. Preset (shown on load
            when Show Results is ticked): <Text field={f.presetLocation} />
            {f.presetProduct ? `, ${productTitle(f.presetProduct)}` : ''}. {dealers.length} dealers in the Dealers folder, within{' '}
            {maxDistance} mi.
          </p>
        )}
      </div>

      <div className="dealer-locator__results">
        <div className="dealer-locator__inner">
          {!searched && !error && (
            <p className="dealer-locator__prompt">
              <Text field={f.promptText} />
            </p>
          )}
          {error && <p className="dealer-locator__prompt">{error}</p>}
          {searched && (
            <>
              <p className="dealer-locator__summary">
                {str(f.productLabel)}: <strong>{searchedProduct}</strong>
                <span className="dealer-locator__count">
                  <strong>{results.length}</strong> {str(f.resultsLabel)}
                </span>
              </p>
              {results.length === 0 && <p className="dealer-locator__prompt">{str(f.noResultsText)}</p>}
              <ol className="dealer-locator__list">
                {results.map((d, i) => {
                  const address = str(d.address);
                  const phone = str(d.phone);
                  const web = d.website?.value?.href;
                  return (
                    <li key={d.id} className="dealer-card">
                      <span className="dealer-card__index">{i + 1}</span>
                      <div className="dealer-card__body">
                        <h3 className="dealer-card__name">
                          <ArrowIcon />
                          {str(d.title)}
                        </h3>
                        <p className="dealer-card__address">{address}</p>
                        <p className="dealer-card__distance">{d.distance.toFixed(1)} mi</p>
                        <div className="dealer-card__links">
                          {phone && (
                            <a href={`tel:${phone}`}>
                              {str(f.callLabel)} {phone}
                            </a>
                          )}
                          {web && (
                            <a href={web} target="_blank" rel="noreferrer">
                              {str(f.websiteLabel)}
                            </a>
                          )}
                          {address && (
                            <a href={directions(address)} target="_blank" rel="noreferrer">
                              {str(f.directionsLabel)}
                            </a>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: DealerLocatorProps): JSX.Element => <DealerLocatorView props={props} look="default" />;

/* Bobcat: the dealer locator page (form on white, results on the grey band with numbered dealer cards) */
export const Bobcat = (props: DealerLocatorProps): JSX.Element => <DealerLocatorView props={props} look="bobcat" />;
