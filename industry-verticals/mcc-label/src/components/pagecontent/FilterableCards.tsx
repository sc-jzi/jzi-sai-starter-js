'use client';

import { JSX, useState } from 'react';
import { ImageField, Link, LinkField, NextImage, RichText, RichTextField, Text, TextField } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Card = {
  id?: string;
  title?: JsonValue<TextField>;
  text?: JsonValue<RichTextField>;
  image?: JsonValue<ImageField>;
  link?: JsonValue<LinkField>;
  date?: JsonValue<TextField>;
  eyebrow?: JsonValue<TextField>;
};

export type FilterableCardsProps = {
  params: { [key: string]: string };
  fields?: {
    data?: {
      datasource?: {
        searchPlaceholder?: JsonValue<TextField>;
        children?: { results?: Card[] };
      };
    };
  };
};

const FilterableCardsView = (props: FilterableCardsProps): JSX.Element => {
  const source = props.fields?.data?.datasource;
  const cards = source?.children?.results ?? [];
  const [query, setQuery] = useState('');
  const needle = query.trim().toLowerCase();
  const visible = cards.filter((card) => {
    if (!needle) return true;
    const hay = `${card.title?.jsonValue?.value ?? ''} ${card.eyebrow?.jsonValue?.value ?? ''}`.toLowerCase();
    return hay.includes(needle);
  });
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component filterable-cards ${props.params?.styles || ''}`} id={id || undefined}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <input
          type="search"
          value={query}
          placeholder={String(source?.searchPlaceholder?.jsonValue?.value ?? '')}
          onChange={(event) => setQuery(event.target.value)}
        />
        <button type="submit" aria-label="Search" />
      </form>
      <div className="filterable-cards__grid" style={{ display: "block" }}>
        {visible.map((card) => (
          <article key={card.id}>
            {card.image?.jsonValue && <NextImage field={card.image.jsonValue} width={480} height={280} />}
            <button type="button" className="btn">
              Toggle to Filter By Cases
            </button>
            {card.eyebrow?.jsonValue && <Text tag="p" field={card.eyebrow.jsonValue} />}
            {card.title?.jsonValue && <Text tag="h3" field={card.title.jsonValue} />}
            {card.date?.jsonValue && <Text tag="p" field={card.date.jsonValue} />}
            {card.text?.jsonValue && <RichText field={card.text.jsonValue} />}
            {card.link?.jsonValue && <Link field={card.link.jsonValue} />}
          </article>
        ))}
      </div>
    </section>
  );
};

export const Default = FilterableCardsView;
export const MccLabel = FilterableCardsView;
