'use client';

import { JSX, useState } from 'react';
import { ImageField, Link, LinkField, NextImage, Text, TextField } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Card = {
  id?: string;
  title?: JsonValue<TextField>;
  image?: JsonValue<ImageField>;
  link?: JsonValue<LinkField>;
  tab?: JsonValue<TextField>;
};

export type CardTabsProps = {
  params: { [key: string]: string };
  fields?: {
    data?: {
      datasource?: {
        tabOneLabel?: JsonValue<TextField>;
        tabTwoLabel?: JsonValue<TextField>;
        children?: { results?: Card[] };
      };
    };
  };
};

const CardTabsView = (props: CardTabsProps): JSX.Element => {
  const source = props.fields?.data?.datasource;
  const cards = source?.children?.results ?? [];
  const labels = [source?.tabOneLabel?.jsonValue?.value, source?.tabTwoLabel?.jsonValue?.value].filter(Boolean) as string[];
  const [tab, setTab] = useState(0);
  // each card names the tab it belongs to: its Tab field holds that tab's label
  const selected = (labels[tab] ?? '').trim();
  const visible = cards.filter((card) => String(card.tab?.jsonValue?.value ?? '').trim() === selected);
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component card-tabs ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="card-tabs__tabs" role="tablist">
        {labels.map((label, index) => (
          <button
            key={label}
            type="button"
            role="tab"
            className={`card-tabs__tab${index === tab ? ' is-active' : ''}`}
            aria-selected={index === tab}
            onClick={() => setTab(index)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="card-tabs__grid" role="tabpanel">
        {visible.map((card) => {
          const link = card.link?.jsonValue;
          const image = card.image?.jsonValue;
          const title = card.title?.jsonValue;
          const picture = image?.value?.src ? (
            <NextImage field={image} width={664} height={400} className="card-tabs__image" />
          ) : null;
          const heading = title?.value ? <Text tag="h3" field={title} className="card-tabs__title" /> : null;
          return (
            <div key={card.id} className="card-tabs__card">
              {link?.value?.href ? (
                <Link field={link} className="card-tabs__link">
                  {picture}
                  {heading}
                </Link>
              ) : (
                <>
                  {picture}
                  {heading}
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export const Default = CardTabsView;
export const MccLabel = CardTabsView;
