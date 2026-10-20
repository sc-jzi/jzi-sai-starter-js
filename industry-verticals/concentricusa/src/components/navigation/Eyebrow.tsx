'use client';

import {
  AppPlaceholder,
  ComponentMap,
  ImageField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX, useEffect, useRef, useState } from 'react';
import PreviewSearch from '../search/PreviewSearch';

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const CONCENTRIC_EYEBROW_LINKS = [
  { label: 'About Us', href: '/about-us' },
  { label: 'Join Our Team', href: '/join-our-team' },
  { label: 'Locations', href: '/locations' },
  { label: 'Contact Us', href: '/contact-us' },
];

/* ConcentricUSA variant: black utility bar with fixed links, language, and preview search */
export const ConcentricUSA = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (searchPanelRef.current && !searchPanelRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <>
      <div
        className={`component eyebrow variant-concentricusa ${props.params.styles?.trimEnd() ?? ''}`}
        id={id || undefined}
      >
        <div className="container">
          <nav className="eyebrow-bar" aria-label="Utility">
            <ul className="eyebrow-links">
              {CONCENTRIC_EYEBROW_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href}>{link.label}</a>
                </li>
              ))}
            </ul>
            <a className="eyebrow-phone" href="tel:+18886918630">
              888-691-8630
            </a>
            <a className="eyebrow-cta" href="/contact-us">
              Request A Quote
            </a>
            <button type="button" className="eyebrow-language" aria-label="Language: English">
              English
              <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor">
                <path d="m3 6 5 5 5-5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              className="eyebrow-search"
              aria-label="Open search"
              aria-expanded={isSearchOpen}
              aria-controls="site-search-panel"
              onClick={() => setIsSearchOpen(true)}
            >
              <svg aria-hidden="true" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="11" cy="11" r="7" strokeWidth="2" />
                <path d="m16.25 16.25 4 4" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </nav>
        </div>
      </div>

      {isSearchOpen && (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setIsSearchOpen(false)}
            className="eyebrow-search-backdrop"
          />
          <div
            id="site-search-panel"
            ref={searchPanelRef}
            role="search"
            className="eyebrow-search-panel"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="container">
              <PreviewSearch isOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
            </div>
          </div>
        </>
      )}
    </>
  );
};

export const Default = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isSearchOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        searchPanelRef.current &&
        !searchPanelRef.current.contains(target)
      ) {
        setIsSearchOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isSearchOpen]);

  return (
    <>
      <div
        className={`component eyebrow relative z-[60] bg-white ${props.params.styles?.trimEnd() ?? ''}`}
        id={id || undefined}
      >
        <div
          className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}
        >
          <div className="row">
            <div className="col col-placeholder flex items-center justify-between">
              <AppPlaceholder
                name="eyebrow-left"
                rendering={props.rendering}
                page={page}
                componentMap={props.componentMap}
              />

              <div className="flex items-center gap-4">
                <AppPlaceholder
                  name="eyebrow-right"
                  rendering={props.rendering}
                  page={page}
                  componentMap={props.componentMap}
                />

                <button
                  type="button"
                  aria-label="Open search"
                  aria-expanded={isSearchOpen}
                  aria-controls="site-search-panel"
                  onClick={() => setIsSearchOpen(true)}
                  className="inline-flex h-10 w-10 items-center justify-center text-[#004bdf] transition-colors hover:text-[#0037a6]"
                >
                  <svg
                    aria-hidden="true"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="7" strokeWidth="2" />
                    <path
                      d="m16.25 16.25 4 4"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <>
          {/*
            This begins below the eyebrow and main navigation, leaving both
            sharp while blurring and disabling interaction with page content.
            Adjust 100px if the combined header height differs.
          */}
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[150px] z-[40] cursor-default bg-white/20 backdrop-blur-md"
          />

          <div
            id="site-search-panel"
            ref={searchPanelRef}
            role="search"
            className="fixed inset-x-0 top-[150px] z-[50] bg-[#f5f5f5] px-6 py-10 shadow-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-[1200px]">
              <PreviewSearch
                isOpen={isSearchOpen}
                setIsSearchOpen={setIsSearchOpen}
              />
            </div>
          </div>
        </>
      )}
    </>
  );
};
