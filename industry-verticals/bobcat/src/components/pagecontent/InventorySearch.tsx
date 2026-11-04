'use client';

import { JSX, useMemo, useState } from 'react';
import {
  Field,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * InventorySearch: a headline and text beside a search card (location, distance stops from the "Distance Option" children,
 * Search), and a "view all" link under it. Search opens SearchLink with ?location=…&distance=… (the demo has no dealer
 * inventory service, so the page behind SearchLink shows the inventory). Auto Detect fills the location from the browser.
 * The listing's own fields come as a field list (fields(ownFields: true)) to stay within Experience Edge's query-depth limit.
 */

type JsonField<T> = { jsonValue?: T };

interface SearchFields {
  title?: JsonField<Field<string>>;
  text?: JsonField<RichTextField>;
  locationLabel?: JsonField<Field<string>>;
  locationPlaceholder?: JsonField<Field<string>>;
  autoDetectLabel?: JsonField<Field<string>>;
  distanceLabel?: JsonField<Field<string>>;
  searchLabel?: JsonField<Field<string>>;
  searchLink?: JsonField<LinkField>;
  viewAllLink?: JsonField<LinkField>;
}

interface DistanceOption {
  id: string;
  label?: JsonField<Field<string>>;
}

type FieldList = { name: string; jsonValue?: unknown }[];

export type InventorySearchProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        fields?: FieldList;
        children?: { results?: DistanceOption[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat';

/** FieldName -> fieldName, keyed like the other list components that read field lists. */
const keyed = (list?: FieldList): SearchFields => {
  const out: Record<string, unknown> = {};
  for (const f of list ?? []) {
    if (f?.name) out[f.name.charAt(0).toLowerCase() + f.name.slice(1)] = { jsonValue: f.jsonValue };
  }
  return out as SearchFields;
};

const str = (f?: JsonField<Field<string>>) => `${f?.jsonValue?.value ?? ''}`.trim();

const PinIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" className="inventory-search__pin">
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

const InventorySearchView = ({ props, look }: { props: InventorySearchProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const f = useMemo(() => keyed(datasource?.fields), [datasource]);
  const options = datasource?.children?.results ?? [];
  const [location, setLocation] = useState('');
  const [stop, setStop] = useState(0);

  if (!datasource) {
    return (
      <div className={`component inventory-search ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Inventory Search: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const searchHref = f.searchLink?.jsonValue?.value?.href;
  const distance = str(options[stop]?.label);
  const search = () => {
    if (!searchHref || !location.trim()) return;
    const q = new URLSearchParams({ location: location.trim(), ...(distance ? { distance } : {}) });
    window.location.href = `${searchHref}${searchHref.includes('?') ? '&' : '?'}${q.toString()}`;
  };
  const autoDetect = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) =>
      setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`)
    );
  };

  return (
    <div className={`component inventory-search inventory-search--${look} ${styles}`} id={id ? id : undefined}>
      <div className="inventory-search__inner">
        <div className="inventory-search__intro">
          {(isEditing || !!str(f.title)) && (
            <h2 className="inventory-search__title">
              <Text field={f.title?.jsonValue} />
            </h2>
          )}
          {(isEditing || !!f.text?.jsonValue?.value) && (
            <RichText field={f.text?.jsonValue} className="inventory-search__text" />
          )}
        </div>
        <form
          className="inventory-search__card"
          onSubmit={(e) => {
            e.preventDefault();
            if (!isEditing) search();
          }}
        >
          <div className="inventory-search__row">
            <label className="inventory-search__label" htmlFor={`${datasource.id}-location`}>
              <Text field={f.locationLabel?.jsonValue} />
            </label>
            {(isEditing || !!str(f.autoDetectLabel)) && (
              <button type="button" className="inventory-search__detect" onClick={() => !isEditing && autoDetect()}>
                <TargetIcon />
                <Text field={f.autoDetectLabel?.jsonValue} />
              </button>
            )}
          </div>
          <div className="inventory-search__field">
            <PinIcon />
            <input
              id={`${datasource.id}-location`}
              type="text"
              className="inventory-search__input"
              placeholder={str(f.locationPlaceholder)}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={isEditing}
            />
          </div>
          {isEditing && (
            <p className="inventory-search__hint">
              Placeholder: <Text field={f.locationPlaceholder?.jsonValue} />
            </p>
          )}
          <p className="inventory-search__label">
            <Text field={f.distanceLabel?.jsonValue} />
          </p>
          {options.length > 0 && (
            <div className="inventory-search__distance">
              <input
                type="range"
                className="inventory-search__range"
                min={0}
                max={Math.max(options.length - 1, 0)}
                step={1}
                value={stop}
                onChange={(e) => setStop(Number(e.target.value))}
                aria-label={str(f.distanceLabel) || 'Distance'}
                disabled={isEditing}
              />
              <div className="inventory-search__stops">
                {options.map((o) => (
                  <span key={o.id}>
                    <Text field={o.label?.jsonValue} />
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            className="inventory-search__submit"
            disabled={!isEditing && !location.trim()}
          >
            {isEditing ? <Text field={f.searchLabel?.jsonValue} /> : str(f.searchLabel) || 'Search'}
          </button>
        </form>
        {(isEditing || !!f.viewAllLink?.jsonValue?.value?.href) && (
          <div className="inventory-search__view-all">
            <Link field={f.viewAllLink?.jsonValue as LinkField} className="bobcat-arrow-link" />
          </div>
        )}
        {isEditing && (
          <p className="inventory-search__hint">
            Search opens: <Link field={f.searchLink?.jsonValue as LinkField} />
          </p>
        )}
      </div>
    </div>
  );
};

export const Default = (props: InventorySearchProps): JSX.Element => (
  <InventorySearchView props={props} look="default" />
);

/* Bobcat: the equipment pages' "Search New Excavator Inventory" band (text left, grey search card right, link under it) */
export const Bobcat = (props: InventorySearchProps): JSX.Element => (
  <InventorySearchView props={props} look="bobcat" />
);
