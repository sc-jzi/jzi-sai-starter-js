'use client';

import { FormEvent, JSX, useState } from 'react';
import { ComponentProps } from 'lib/component-props';

/*
 * SymbolSearch: the "Search for a symbol..." box of the tmx.com header (cms: false, no datasource).
 * Submitting opens the symbol's quote page on TMX Money in a new tab.
 */
const symbolSearchConfig = {
  placeholder: 'Search for a symbol...',
  quoteUrl: 'https://money.tmx.com/en/quote/',
  poweredByPrefix: 'Powered by',
  poweredByLabel: 'TMX Money',
  poweredByHref: 'https://money.tmx.com/en/',
};

type SymbolSearchProps = ComponentProps;

const SymbolSearchBox = ({ variantClass, props }: { variantClass: string; props: SymbolSearchProps }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const [symbol, setSymbol] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = symbol.trim().toUpperCase();
    if (!value) return;
    window.open(`${symbolSearchConfig.quoteUrl}${encodeURIComponent(value)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className={`component symbol-search ${variantClass} ${props.params?.styles?.trimEnd() ?? ''}`}
      id={id || undefined}
    >
      <form className="symbol-search__form" role="search" onSubmit={onSubmit}>
        <input
          type="text"
          className="symbol-search__input"
          placeholder={symbolSearchConfig.placeholder}
          aria-label={symbolSearchConfig.placeholder}
          value={symbol}
          onChange={(event) => setSymbol(event.target.value)}
        />
        <button type="submit" className="symbol-search__button" aria-label="Search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" strokeWidth="2.6" />
            <path d="m15.5 15.5 5 5" strokeWidth="2.6" strokeLinecap="round" />
          </svg>
        </button>
      </form>
      <div className="symbol-search__powered">
        {symbolSearchConfig.poweredByPrefix}{' '}
        <a href={symbolSearchConfig.poweredByHref} target="_blank" rel="noopener noreferrer">
          {symbolSearchConfig.poweredByLabel}
        </a>
      </div>
    </div>
  );
};

export const Default = (props: SymbolSearchProps): JSX.Element => <SymbolSearchBox variantClass="" props={props} />;

/* Tmx variant: rounded #eaeff1 input (~365x40, radius 20px) with the search icon, "Powered by TMX Money" right-aligned below */
export const Tmx = (props: SymbolSearchProps): JSX.Element => <SymbolSearchBox variantClass="variant-tmx" props={props} />;
