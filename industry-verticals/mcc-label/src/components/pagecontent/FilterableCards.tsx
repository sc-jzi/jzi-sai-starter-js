'use client';

import { JSX } from 'react';
import NextLink from 'next/link';
import { DateField, Field, ImageField, NextImage, Text, TextField, useSitecore } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Article = {
  id?: string;
  url?: { path?: string };
  title?: JsonValue<TextField>;
  excerpt?: JsonValue<TextField>;
  thumbnail?: JsonValue<ImageField>;
  date?: JsonValue<Field<string>>;
  readTime?: JsonValue<TextField>;
};

// Datasource is the news section item; the cards are its article pages (ComponentQuery on the rendering).
export type FilterableCardsProps = {
  params: { [key: string]: string };
  fields?: {
    data?: {
      datasource?: {
        children?: { results?: Article[] };
      };
    };
  };
};

const formatDate = (value?: string): string => {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
};

const Chevron = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const FilterableCardsView = (props: FilterableCardsProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const articles = [...(props.fields?.data?.datasource?.children?.results ?? [])].sort((a, b) =>
    String(b.date?.jsonValue?.value ?? '').localeCompare(String(a.date?.jsonValue?.value ?? ''))
  );
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component filterable-cards ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="filterable-cards__grid">
        {articles.map((article) => {
          const href = article.url?.path || '#';
          const hasDate = !!article.date?.jsonValue?.value;
          const hasReadTime = !!article.readTime?.jsonValue?.value;
          return (
            <article className="filterable-cards__card" key={article.id}>
              {article.thumbnail?.jsonValue?.value?.src && (
                <NextLink href={href} className="filterable-cards__image" tabIndex={-1} aria-hidden="true">
                  {/* unoptimized: some thumbnails are SVG logos, which the Next image optimizer refuses */}
                  <NextImage field={article.thumbnail.jsonValue} width={480} height={330} unoptimized />
                </NextLink>
              )}
              {article.title?.jsonValue && (
                <h3 className="filterable-cards__title">
                  <NextLink href={href}>
                    <Text field={article.title.jsonValue} />
                  </NextLink>
                </h3>
              )}
              {article.excerpt?.jsonValue && <Text tag="p" className="filterable-cards__excerpt" field={article.excerpt.jsonValue} />}
              {(hasDate || hasReadTime || isPageEditing) && (
                <p className="filterable-cards__meta">
                  {article.date?.jsonValue && (
                    <DateField field={article.date.jsonValue} render={(date) => formatDate(date?.toISOString())} />
                  )}
                  {hasDate && hasReadTime && <span className="filterable-cards__dot" aria-hidden="true" />}
                  {article.readTime?.jsonValue && <Text field={article.readTime.jsonValue} />}
                </p>
              )}
              <NextLink href={href} className="filterable-cards__more">
                Read More
                <Chevron />
              </NextLink>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const Default = FilterableCardsView;
export const MccLabel = FilterableCardsView;
