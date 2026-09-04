'use client';

import { AppPlaceholder, ComponentMap, ImageField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useState } from 'react';
import PreviewSearch from "../search/PreviewSearch"
import { PREVIEW_WIDGET_ID } from "../../_data/customizations";

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const LockIcon = (): JSX.Element => (
  <svg className="walden-eyebrow__lock" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
    <rect x="3.25" y="7" width="9.5" height="7.25" rx="1.4" fill="currentColor" />
    <path
      d="M5.15 7V5.2a2.85 2.85 0 0 1 5.7 0V7"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

/* Walden variant — dark teal utility bar with Login dropdown */
export const Walden = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;

  return (
    <div className={`component eyebrow walden-eyebrow ${props.params.styles?.trimEnd() || ''}`} id={id ? id : undefined}>
      <div className="walden-eyebrow__inner">
        <nav className="walden-eyebrow__nav" aria-label="Utility">
          <div className="walden-eyebrow__login">
            <a className="walden-eyebrow__link" href="https://www.waldenu.edu/login">
              <LockIcon />
              Login
            </a>
            <div className="walden-eyebrow__dropdown">
              <a href="https://my.waldenu.edu/">Students</a>
              <a href="https://www.waldenu.edu/login">Faculty</a>
            </div>
          </div>
          <a className="walden-eyebrow__link" href="https://www.waldenu.edu/alumni">
            Alumni
          </a>
          <a className="walden-eyebrow__link" href="https://www.waldenu.edu/international">
            International
          </a>
          <a className="walden-eyebrow__link" href="https://www.waldenu.edu/contact-us">
            Contact Us
          </a>
          <a className="walden-eyebrow__link" href="https://www.waldenu.edu/experience/support-services">
            Help Center
          </a>
          <a className="walden-eyebrow__link" href="https://www.waldenu.edu/news-and-events">
            News &amp; Events
          </a>
          <a className="walden-eyebrow__phone" href="tel:8553253014">
            Call Us: 855-325-3014
          </a>
        </nav>
        <a className="walden-eyebrow__apply" href="https://www.waldenu.edu/admissions/apply">
          APPLY NOW
        </a>
      </div>
    </div>
  );
};

export const Default = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className={`component eyebrow	${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row">
          <div className="col col-placeholder">
            <AppPlaceholder name="eyebrow-left" rendering={props.rendering} page={page} componentMap={props.componentMap} />
            <AppPlaceholder name="eyebrow-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
          <div className="flex items-center gap-2">
              <PreviewSearch rfkId={PREVIEW_WIDGET_ID} isOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />

              <button
                onClick={() => setIsSearchOpen(false)}
                className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
