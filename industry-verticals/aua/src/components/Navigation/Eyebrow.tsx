'use client';

import React, { useCallback, useRef, useState, JSX } from 'react';
import { ComponentProps } from 'lib/component-props';
import PreviewSearchWidget, { ArticleModel } from '../Search/PreviewSearch/PreviewSearch';
import { Default as ThemeSwitcher } from '../Utilities/ThemeSwitcher';
import { isSearchSDKEnabled } from 'src/services/SearchSDKService';
import ClickOutside from '../../hooks/ClickOutside';
import { useRouter } from 'next/router';

type EyebrowLink = {
  label: string;
  href: string;
};

const UTILITY_LINKS: EyebrowLink[] = [
  { label: 'Annual Meeting', href: 'https://www.auanet.org/meetings-and-education/annual-meeting' },
  { label: 'AQUA Registry', href: 'https://www.auanet.org/research-and-data/aua-quality-aqua-registry' },
  {
    label: 'Publications & Podcasts',
    href: 'https://www.auanet.org/publications-and-podcasts',
  },
  { label: 'Urology Careers', href: 'https://www.auanet.org/urology-careers' },
  { label: 'myAUA', href: 'https://www.auanet.org/membership/member-central/myaua' },
];

const WEBSITE_LINKS: EyebrowLink[] = [
  { label: 'AUA Journals', href: 'https://www.auajournals.org/' },
  { label: 'AUANews', href: 'https://www.auanet.org/news/auanews' },
  { label: 'AUAUniversity', href: 'https://www.auanet.org/meetings-and-education/aua-university' },
  { label: 'Annual Meeting', href: 'https://www.auanet.org/meetings-and-education/annual-meeting' },
  { label: 'Didusch Museum', href: 'https://www.auanet.org/about-us/didusch-museum' },
  { label: 'AUA Innovation Nexus', href: 'https://www.auanet.org/aua-innovation-nexus' },
  {
    label: 'Urology Care Foundation',
    href: 'https://www.urologyhealth.org/',
  },
];

const ChevronIcon = ({ expanded }: { expanded: boolean }): JSX.Element => (
  <svg
    className={`eyebrow-chevron ${expanded ? 'eyebrow-chevron-up' : ''}`}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 512 512"
    width={9}
    height={9}
    aria-hidden="true"
  >
    <path
      fill="currentColor"
      d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"
    />
  </svg>
);

const SearchIcon = (): JSX.Element => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={13} height={13} aria-hidden="true">
    <path
      fill="currentColor"
      d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
    />
  </svg>
);

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  const router = useRouter();
  const websitesRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const [isWebsitesOpen, setIsWebsitesOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const closeWebsites = useCallback(() => setIsWebsitesOpen(false), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);

  ClickOutside([websitesRef], closeWebsites);
  ClickOutside([searchRef], closeSearch);

  const onSearchOpen = useCallback(() => {
    setIsWebsitesOpen(false);
    setIsSearchOpen((open) => !open);
    setTimeout(() => {
      document.getElementById('search-input')?.focus();
    }, 0);
  }, []);

  const onRedirect = useCallback(
    (article: ArticleModel) => {
      closeSearch();
      router.push(new URL(article.url, window.location.origin).pathname);
    },
    [closeSearch, router]
  );

  const toggleWebsites = useCallback(() => {
    setIsSearchOpen(false);
    setIsWebsitesOpen((open) => !open);
  }, []);

  return (
    <div
      className={`component eyebrow ${sxaStyles}`.trim()}
      id={id ? id : undefined}
      ref={websitesRef}
    >
      <div className="eyebrow-primary">
        <div className="eyebrow-container">
          {isSearchOpen && isSearchSDKEnabled ? (
            <div className="eyebrow-search-panel" ref={searchRef}>
              <PreviewSearchWidget rfkId="rfkid_6" itemRedirectionHandler={onRedirect} />
            </div>
          ) : (
            <div className="eyebrow-inner">
              <div className="eyebrow-left">
                <button
                  type="button"
                  className={`eyebrow-websites-toggle ${isWebsitesOpen ? 'is-open' : ''}`}
                  onClick={toggleWebsites}
                  aria-expanded={isWebsitesOpen}
                  aria-controls="eyebrow-websites-panel"
                >
                  <span>AUA Websites</span>
                  <ChevronIcon expanded={isWebsitesOpen} />
                </button>
              </div>

              <div className="eyebrow-right">
                <nav className="eyebrow-utility-nav" aria-label="Utility navigation">
                  <ul>
                    {UTILITY_LINKS.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="text-white">{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </nav>

                <div className="eyebrow-actions">
                  <ThemeSwitcher />
                  <button
                    type="button"
                    className="eyebrow-search-button"
                    onClick={onSearchOpen}
                    aria-label="Search"
                  >
                    <SearchIcon />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {isWebsitesOpen && (
        <div className="eyebrow-secondary" id="eyebrow-websites-panel">
          <div className="eyebrow-container">
            <nav className="eyebrow-websites-nav" aria-label="AUA websites">
              <ul>
                {WEBSITE_LINKS.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="text-white">{link.label}</a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};
