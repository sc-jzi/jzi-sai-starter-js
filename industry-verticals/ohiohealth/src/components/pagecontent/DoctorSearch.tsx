'use client';

import { JSX, FormEvent, useState } from 'react';
import { Field, LinkField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface DoctorSearchFields {
  Eyebrow?: Field<string>;
  Title?: Field<string>;
  KeywordPlaceholder?: Field<string>;
  LocationPlaceholder?: Field<string>;
  CheckboxLabel?: Field<string>;
  ButtonLabel?: Field<string>;
  ResultsLink?: LinkField;
}

export type DoctorSearchProps = ComponentProps & {
  fields: DoctorSearchFields;
};

const SearchIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <circle cx="10" cy="10" r="6.5" fill="none" stroke="currentColor" strokeWidth="2.4" />
    <path d="m15 15 6 6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
  </svg>
);

const PinIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7Zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5Z"
      fill="currentColor"
    />
  </svg>
);

const StethoscopeBadge = (): JSX.Element => (
  <span className="doctor-search__badge" aria-hidden="true">
    <svg viewBox="0 0 48 48" width="30" height="30">
      <path
        d="M14 8v10a8 8 0 0 0 16 0V8M14 8h-3M30 8h3M22 26v6a8 8 0 0 0 16 0v-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="38" cy="25" r="3.5" fill="none" stroke="currentColor" strokeWidth="3" />
    </svg>
  </span>
);

const DoctorSearchView = ({
  props,
  variantClass,
}: {
  props: DoctorSearchProps;
  variantClass: string;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const f = props.fields || {};
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [accepting, setAccepting] = useState(false);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const href = f.ResultsLink?.value?.href;
    if (!href || isEditing) return;
    const url = new URL(href, window.location.origin);
    if (q) url.searchParams.set('q', q);
    if (location) url.searchParams.set('location', location);
    if (accepting) url.searchParams.set('accpat', 'anp');
    window.open(url.toString(), '_blank', 'noopener');
  };

  return (
    <section className={`component doctor-search ${variantClass} ${styles}`} id={id ? id : undefined}>
      <div className="doctor-search__inner">
        {(f.Eyebrow?.value || isEditing) && (
          <p className="doctor-search__eyebrow">
            <Text field={f.Eyebrow} />
          </p>
        )}
        <form className="doctor-search__box" onSubmit={onSubmit}>
          <div className="doctor-search__heading">
            <h2 className="doctor-search__title">
              <Text field={f.Title} />
            </h2>
            <StethoscopeBadge />
          </div>
          <div className="doctor-search__fields">
            <div className="doctor-search__inputs">
              <div className="doctor-search__input">
                <SearchIcon />
                {!q && <label className="doctor-search__label" htmlFor="ds-q">{f.KeywordPlaceholder?.value || ''}</label>}
                <input
                  id="ds-q"
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  aria-label={f.KeywordPlaceholder?.value || 'Search'}
                />
              </div>
              <div className="doctor-search__input">
                <PinIcon />
                {!location && <label className="doctor-search__label" htmlFor="ds-location">{f.LocationPlaceholder?.value || ''}</label>}
                <input
                  id="ds-location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  aria-label={f.LocationPlaceholder?.value || 'Location'}
                />
              </div>
            </div>
            <div className="doctor-search__row">
              <label className="doctor-search__check">
                <input
                  type="checkbox"
                  checked={accepting}
                  onChange={(e) => setAccepting(e.target.checked)}
                />
                <span>
                  <Text field={f.CheckboxLabel} />
                </span>
              </label>
              <button type="submit" className="doctor-search__button">
                <Text field={f.ButtonLabel} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export const Default = (props: DoctorSearchProps): JSX.Element => (
  <DoctorSearchView props={props} variantClass="" />
);

export const OhioHealth = (props: DoctorSearchProps): JSX.Element => (
  <DoctorSearchView props={props} variantClass="doctor-search--ohiohealth" />
);
