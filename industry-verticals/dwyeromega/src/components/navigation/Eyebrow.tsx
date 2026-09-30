'use client';

import {
  AppPlaceholder,
  ComponentMap,
  ImageField,
  NextImage,
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

/* Two-row catalog bar: assistance line, then logo, search, and account links. */
export const DwyerOmega = (props: EyebrowProps): JSX.Element => {
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
        className={`component eyebrow dwyer-omega-eyebrow relative z-[60] ${props.params.styles?.trimEnd() ?? ''}`}
        id={id || undefined}
      >
        <div className="bg-[#F3F3F3] py-1.5 text-center text-[13px] text-[#5E6265]">
          Need assistance? Call us:{' '}
          <a className="font-semibold text-[#1C1C1C] no-underline" href="tel:18006634209">
            1-800-663-4209
          </a>
        </div>
        <div className="bg-white">
          <div className="mx-auto flex max-w-[1200px] items-center gap-6 px-6 py-3">
            <a href="/" className="shrink-0 no-underline">
              {props.fields?.LogoImage?.value?.src ? (
                <NextImage field={props.fields.LogoImage} width={210} height={36} />
              ) : (
                <span className="text-lg font-bold tracking-wide text-[#1C1C1C]">DWYEROMEGA</span>
              )}
            </a>
            <div className="ml-auto flex items-center gap-6 text-sm text-[#1C1C1C]">
              <button
                type="button"
                aria-label="Open search"
                aria-expanded={isSearchOpen}
                aria-controls="site-search-panel"
                onClick={() => setIsSearchOpen(true)}
                className="inline-flex h-10 w-10 items-center justify-center text-[#232C65]"
              >
                <svg
                  aria-hidden="true"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <circle cx="11" cy="11" r="7" strokeWidth="2" />
                  <path d="m16.25 16.25 4 4" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              <a href="/contact-us">Contact us</a>
              <a href="/cart" className="inline-flex items-center gap-1" aria-label="Cart, 0 items">
                <svg aria-hidden="true" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 7h15l-1.5 9h-12L6 7Zm0 0L5 4H2"
                  />
                  <circle cx="9" cy="20" r="1.25" fill="currentColor" stroke="none" />
                  <circle cx="18" cy="20" r="1.25" fill="currentColor" stroke="none" />
                </svg>
                <span>0</span>
              </a>
              <a href="/account" className="inline-flex items-center gap-1">
                My Account
                <svg aria-hidden="true" className="h-3 w-3" viewBox="0 0 12 8" fill="currentColor">
                  <path d="M1 1.5 6 6.5 11 1.5" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      {isSearchOpen && (
        <>
          <button
            type="button"
            aria-label="Close search"
            onClick={() => setIsSearchOpen(false)}
            className="fixed inset-x-0 bottom-0 top-[190px] z-[40] cursor-default bg-white/20 backdrop-blur-md"
          />
          <div
            id="site-search-panel"
            ref={searchPanelRef}
            role="search"
            className="fixed inset-x-0 top-[190px] z-[50] bg-[#f5f5f5] px-6 py-10 shadow-sm"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto max-w-[1200px]">
              <PreviewSearch isOpen={isSearchOpen} setIsSearchOpen={setIsSearchOpen} />
            </div>
          </div>
        </>
      )}
    </>
  );
};
