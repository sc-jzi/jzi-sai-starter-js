'use client';

import { JSX } from 'react';
import { ComponentProps } from 'lib/component-props';

/*
 * StockTicker: a small static quote line for the header eyebrow (cms: false, no datasource).
 * The price below is ILLUSTRATIVE ONLY: there is no live market data feed in this demo. Change the values here.
 */
const tickerConfig = {
  label: 'TMX (X):',
  price: '64.07',
  change: '0.10',
  direction: 'up' as 'up' | 'down',
};

type StockTickerProps = ComponentProps;

const TickerLine = ({ variantClass, props }: { variantClass: string; props: StockTickerProps }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const isUp = tickerConfig.direction === 'up';
  return (
    <div
      className={`component stock-ticker ${variantClass} ${props.params?.styles?.trimEnd() ?? ''}`}
      id={id || undefined}
    >
      <span className="stock-ticker__label">{tickerConfig.label}</span>{' '}
      <span className="stock-ticker__price">{tickerConfig.price}</span>
      <span className={`stock-ticker__change ${isUp ? 'is-up' : 'is-down'}`}>
        <svg className="stock-ticker__arrow" viewBox="0 0 10 6" aria-hidden="true">
          <path d={isUp ? 'M5 0l5 6H0z' : 'M5 6L0 0h10z'} fill="currentColor" />
        </svg>
        {tickerConfig.change}
      </span>
    </div>
  );
};

export const Default = (props: StockTickerProps): JSX.Element => <TickerLine variantClass="" props={props} />;

/* Tmx variant: 13px quote line of the tmx.com eyebrow (bold label, price, green up-triangle and change) */
export const Tmx = (props: StockTickerProps): JSX.Element => <TickerLine variantClass="variant-tmx" props={props} />;
