'use client';

import { AppPlaceholder, ComponentMap, ImageField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useState } from 'react';
import PreviewSearch from '../search/PreviewSearch';
import { PREVIEW_WIDGET_ID } from '../../_data/customizations';

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const QUORUM_UTILITY_LINKS = [
  { label: 'Training', href: 'https://www.quorumsoftware.com/training/' },
  { label: 'Careers', href: 'https://www.quorumsoftware.com/about/careers/' },
  { label: 'Contact', href: 'https://www.quorumsoftware.com/contact-us/' },
  { label: 'Support', href: 'https://www.quorumsoftware.com/support/' },
  { label: 'Login', href: 'https://www.quorumsoftware.com/login/' },
];

const QUORUM_DEMO_CTA = {
  label: 'Request a Demo',
  href: 'https://www.quorumsoftware.com/request-a-demo/',
};

const SearchIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path strokeLinecap="round" d="m20 20-3.5-3.5" />
  </svg>
);

export const Quorum = (props: EyebrowProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div
      className={`component eyebrow quorum-eyebrow ${props.params?.styles?.trimEnd() ?? ''}`}
      id={id ? id : undefined}
    >
      <div className="quorum-eyebrow__inner">
        <ul className="quorum-eyebrow__links">
          {QUORUM_UTILITY_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
          <li>
            <button
              type="button"
              className="quorum-eyebrow__search"
              aria-label="Search"
              aria-expanded={isSearchOpen}
              onClick={() => setIsSearchOpen((open) => !open)}
            >
              <SearchIcon />
            </button>
          </li>
        </ul>

        <a className="quorum-eyebrow__cta" href={QUORUM_DEMO_CTA.href}>
          {QUORUM_DEMO_CTA.label}
        </a>
      </div>

      {isSearchOpen && (
        <div className="quorum-eyebrow__search-panel">
          <PreviewSearch
            rfkId={PREVIEW_WIDGET_ID}
            isOpen={isSearchOpen}
            setIsSearchOpen={setIsSearchOpen}
          />
        </div>
      )}
    </div>
  );
};

export const WithPlaceholders = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();

  return (
    <div
      className={`component eyebrow	${props.params.styles?.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row">
          <div className="col col-placeholder">
            <AppPlaceholder
              name="eyebrow-left"
              rendering={props.rendering}
              page={page}
              componentMap={props.componentMap}
            />
            <AppPlaceholder
              name="eyebrow-right"
              rendering={props.rendering}
              page={page}
              componentMap={props.componentMap}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default = Quorum;
