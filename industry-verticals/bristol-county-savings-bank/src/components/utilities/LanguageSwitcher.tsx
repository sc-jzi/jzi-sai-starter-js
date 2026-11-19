'use client';

import { useSitecore } from '@sitecore-content-sdk/nextjs';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, JSX } from 'react';
import { DEFAULT_LANGUAGE, LOCALE_COOKIE, SITE_LANGUAGES, findLanguage, sameLocale } from 'src/i18n/languages';

function getPathSuffix(path: string | string[] | undefined): string {
  if (path === undefined) {
    return '';
  }

  if (Array.isArray(path)) {
    return path.length > 0 ? `/${path.join('/')}` : '';
  }

  return path ? `/${path}` : '';
}

/**
 * The public URL of this page in another language. The [site]/[locale] route segments are internal (the multisite and
 * locale proxies rewrite to them), so the visitor-facing URL is the page path, prefixed with the locale unless it is the
 * default language (localePrefix "as-needed").
 */
function localizedHref(langCode: string, pathSuffix: string, query: string): string {
  const prefix = sameLocale(langCode, DEFAULT_LANGUAGE) ? '' : `/${langCode}`;
  const href = `${prefix}${pathSuffix}` || '/';
  return query ? `${href}?${query}` : href;
}

const labelFor = (locale?: string) => (findLanguage(locale) ?? SITE_LANGUAGES[0]).label;

type LanguageSwitcherViewProps = {
  selectedLabel: string;
  selectedCode?: string;
  showLanguageDropdown: boolean;
  onToggleDropdown: () => void;
  onSelectLanguage: (langCode: string) => void;
  rootRef?: React.Ref<HTMLDivElement>;
};

function LanguageSwitcherView({
  selectedLabel,
  selectedCode,
  showLanguageDropdown,
  onToggleDropdown,
  onSelectLanguage,
  rootRef,
}: LanguageSwitcherViewProps): JSX.Element {
  return (
    <div ref={rootRef} className={`language-switcher ${showLanguageDropdown ? 'expanded' : ''}`}>
      <button
        type="button"
        className="language-switcher__toggle"
        aria-haspopup="listbox"
        aria-expanded={showLanguageDropdown}
        onClick={onToggleDropdown}
      >
        <span className="selected-language">{selectedLabel}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="chevron-icon"
          viewBox="0 0 512 512"
          width={16}
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
        </svg>
      </button>
      {showLanguageDropdown && (
        <ul className="language-dropdown" role="listbox" aria-label="Language">
          {SITE_LANGUAGES.map((lang) => {
            const active = sameLocale(lang.code, selectedCode);
            return (
              <li key={lang.code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={`language-dropdown__option${active ? ' is-active' : ''}`}
                  lang={lang.code}
                  onClick={() => onSelectLanguage(lang.code)}
                >
                  {lang.label}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function LanguageSwitcherFallback(): JSX.Element {
  const { page } = useSitecore();

  return (
    <LanguageSwitcherView
      selectedLabel={labelFor(page.locale)}
      selectedCode={page.locale}
      showLanguageDropdown={false}
      onToggleDropdown={() => {}}
      onSelectLanguage={() => {}}
    />
  );
}

function LanguageSwitcherInner(): JSX.Element {
  const { page } = useSitecore();
  const params = useParams();
  const searchParams = useSearchParams();
  const rootRef = useRef<HTMLDivElement>(null);

  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const isEditing = !!page?.mode?.isEditing;

  // the URL's locale: on a page shown in the default language because it is not translated, the switcher still shows the
  // language the visitor chose
  const currentLocale = (typeof params.locale === 'string' ? params.locale : undefined) ?? page.locale;
  const selectedLabel = useMemo(() => labelFor(currentLocale), [currentLocale]);

  // close on a click outside the switcher or on Escape
  useEffect(() => {
    if (!showLanguageDropdown) return;
    const onPointerDown = (event: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setShowLanguageDropdown(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowLanguageDropdown(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showLanguageDropdown]);

  const changeLanguage = useCallback(
    (langCode: string) => {
      setShowLanguageDropdown(false);
      // in Pages the editor switches language in its own toolbar; the page itself stays put
      if (isEditing) return;
      // remember the choice: src/proxy.ts keeps unprefixed links in this language until the visitor switches again
      document.cookie = `${LOCALE_COOKIE}=${langCode}; path=/; max-age=31536000; samesite=lax`;
      if (sameLocale(langCode, currentLocale)) return;
      // a full navigation: the locale and multisite proxies run again and the page renders in the new language
      window.location.assign(localizedHref(langCode, getPathSuffix(params.path), searchParams.toString()));
    },
    [currentLocale, isEditing, params.path, searchParams]
  );

  return (
    <LanguageSwitcherView
      rootRef={rootRef}
      selectedLabel={selectedLabel}
      selectedCode={currentLocale}
      showLanguageDropdown={showLanguageDropdown}
      onToggleDropdown={() => setShowLanguageDropdown((open) => !open)}
      onSelectLanguage={changeLanguage}
    />
  );
}

export const Default = (): JSX.Element => (
  <Suspense fallback={<LanguageSwitcherFallback />}>
    <LanguageSwitcherInner />
  </Suspense>
);
