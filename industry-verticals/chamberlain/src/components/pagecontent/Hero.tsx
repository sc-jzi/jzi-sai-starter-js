'use client';

import { JSX, useEffect, useRef, useState } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  useSitecore,
  Link,
  LinkField,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
}

export type AppPromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero ${sxaStyles}`} id={id ? id : undefined}>
      <picture>
        <NextImage field={props.fields.Image} className="" width={1920} height={400}></NextImage>
      </picture>
      <div className="container content-container">
        <div className="top-layout">
          <div className="title">
            <Text field={props.fields.Title} />
          </div>
          <div className="subtitle">
            <RichText field={props.fields.Text} />
          </div>
        </div>
        <div className="bottom-layout">
          <div className="btn-array">
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main mt-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const RN_OPTIONS = [
  { value: '', label: 'Are you a registered nurse?' },
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' },
];

const ChevronIcon = ({ up }: { up: boolean }): JSX.Element => (
  <svg className="chamberlain-hero__chevron" viewBox="0 0 12 8" fill="none" aria-hidden>
    {up ? (
      <path d="M1.2 6.4 6 1.6l4.8 4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    ) : (
      <path d="M1.2 1.6 6 6.4l4.8-4.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    )}
  </svg>
);

/* Chamberlain variant — full-bleed photo, condensed headline, RN dropdown, gold CTA */
export const Chamberlain = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(RN_OPTIONS[0]);
  const menuRef = useRef<HTMLDivElement>(null);
  const ctaHref = props.fields?.Link?.value?.href || 'https://www.chamberlain.edu/';

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`component hero chamberlain-hero ${sxaStyles}`} id={id ? id : undefined}>
      <div className="chamberlain-hero__media">
        <NextImage field={props.fields.Image} className="" width={1920} height={720} />
      </div>
      <div className="chamberlain-hero__overlay" />
      <div className="container chamberlain-hero__content">
        {(props.fields.Title?.value || isPageEditing) && (
          <h1 className="chamberlain-hero__title">
            <Text field={props.fields.Title} />
          </h1>
        )}
        {(props.fields.Text?.value || isPageEditing) && (
          <div className="chamberlain-hero__text">
            <RichText field={props.fields.Text} />
          </div>
        )}
        <div className="chamberlain-hero__actions">
          <div className="chamberlain-hero__dropdown" ref={menuRef}>
            <button
              type="button"
              className={`chamberlain-hero__trigger${isOpen ? ' is-open' : ''}`}
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-controls="chamberlain-rn-options"
              onClick={() => setIsOpen((open) => !open)}
            >
              <span>{selected.label}</span>
              <ChevronIcon up={isOpen} />
            </button>
            {isOpen ? (
              <ul id="chamberlain-rn-options" className="chamberlain-hero__menu" role="listbox">
                {RN_OPTIONS.map((option) => {
                  const isActive = option.value === selected.value;

                  return (
                    <li key={option.label} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        className={`chamberlain-hero__option${isActive ? ' is-active' : ''}`}
                        onClick={() => {
                          setSelected(option);
                          setIsOpen(false);
                        }}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </div>
          {isPageEditing ? (
            <Link field={props.fields.Link} className="chamberlain-hero__cta" />
          ) : (
            <a className="chamberlain-hero__cta" href={ctaHref}>
              Get Started
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
