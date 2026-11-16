'use client';

import React, { JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  DateField,
  Field,
  ImageField,
  Text,
  RichTextField,
  withDatasourceCheck,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
  // Extra fields of the TMX article page template; only the Tmx variant reads them.
  PublicationDate?: Field<string>;
  SxaTags?: ArticleTagItem[];
}

/* A tag item as the layout service serializes a multilist (SxaTags) */
type ArticleTagItem = {
  id?: string;
  name?: string;
  displayName?: string;
  fields?: { Title?: Field<string> };
};

export type ArticleListItemProps = {
  fields: Fields;
  name: string;
  url: string;
};

interface ArticleListComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items: ArticleListItemProps[];
  };
}

const getNewsItems = (items: ArticleListItemProps[], numOfItems: number) => {
  return items
    ?.filter((item) => item.name !== 'Data' && item.name !== 'Authors')
    .slice(0, numOfItems || undefined);
};

const getAllArticlesPageHref = (items: ArticleListItemProps[]) => {
  return items?.find((item) => item.name === 'Data')?.url.replace(/\/Data$/, '') || '#';
};

const ArticleListDefault = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));

  return (
    <div
      className={`component article-list ${props.params?.styles.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="background p-3 p-sm-5">
          {newsItems?.map((item, i) => (
            <React.Fragment key={item.url}>
              <div
                className={`row gx-5 row-gap-3 align-items-center ${
                  i % 2 !== 0 ? 'flex-row-reverse' : ''
                }`}
              >
                <div className="col-lg-4">
                  <NextImage field={item.fields.Thumbnail} width={400} height={300} />
                </div>

                <div className="col-lg-8">
                  <h3 className="fs-4">
                    <Text field={item.fields.Title}></Text>
                  </h3>
                  <p className="article-excerpt fs-5">
                    <Text field={item.fields.Excerpt}></Text>
                  </p>
                  <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center">
                    <Link href={item.url} className="button button-secondary">
                      Read More
                    </Link>
                  </div>
                </div>
              </div>
              {i === newsItems.length - 1 ? <></> : <hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArticleListThreeColumn = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row row-gap-3">
          {newsItems?.map((item) => (
            <div className="col-lg-4" key={item.url}>
              <Link href={item.url} className="wrapper-link">
                <NextImage field={item.fields.Thumbnail} width={400} height={300} />
                <h3 className="fs-4 mt-3">
                  <Text field={item.fields.Title}></Text>
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArticleListSimplified = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const allArticlesPageHref = getAllArticlesPageHref(props.fields?.items);
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row align-items-center">
          <div className="col">
            <div className="title display-6">News</div>
          </div>
          <div className="col-auto learn-more">
            <Link href={allArticlesPageHref} className="button button-simple">
              See All <i className="fa fa-angle-right fs-4" />
            </Link>
          </div>
        </div>

        <div className="background p-3 p-sm-5">
          {newsItems?.map((item, i) => (
            <React.Fragment key={item.url}>
              <div className="row gx-5 row-gap-3 align-items-center">
                <div className="col-lg-4">
                  <NextImage field={item.fields.Thumbnail} width={400} height={300} />
                </div>

                <div className="col-lg-6">
                  <h3 className="fs-4">
                    <Text field={item.fields.Title}></Text>
                  </h3>
                  <p>
                    <Text field={item.fields.Excerpt}></Text>
                  </p>
                  <Link href={item.url} className="button button-simple">
                    Read More
                  </Link>
                </div>
              </div>
              {i === newsItems.length - 1 ? <></> : <hr />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

const ArticleListGrid = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component component-spaced article-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container container-wide">
        <div className="article-list-grid">
          {newsItems?.map((item) => (
            <div className="article-grid-item" key={item.url}>
              <Link href={item.url} className="wrapper-link">
                <NextImage field={item.fields.Thumbnail} width={800} height={400} />
                <h3 className="fs-4 mt-3">
                  <Text field={item.fields.Title}></Text>
                </h3>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = withDatasourceCheck()<ArticleListComponentProps>(ArticleListDefault);
export const ThreeColumn = withDatasourceCheck()<ArticleListComponentProps>(ArticleListThreeColumn);
export const Simplified = withDatasourceCheck()<ArticleListComponentProps>(ArticleListSimplified);
export const Grid = withDatasourceCheck()<ArticleListComponentProps>(ArticleListGrid);

const formatTmxDate = (date: Date | null): string =>
  date
    ? date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      })
    : '';

// Sitecore returns 0001-01-01 for an empty Date field.
const hasTmxDate = (field?: Field<string>): boolean =>
  !!field?.value && new Date(field.value).getUTCFullYear() > 1;

const tmxTagLabels = (tags?: ArticleTagItem[]): string[] =>
  Array.isArray(tags)
    ? tags
        .map((t) => t?.fields?.Title?.value || t?.displayName || t?.name || '')
        .filter((label) => !!label)
    : [];

/* Date and tags line: "September 22, 2026 | #TSX30 #Mining" (featured) or "... - #POV" (compact).
   The separator and tags are the line's own text (as on tmx.com), the date a span inside it. */
const TmxMeta = ({
  item,
  separator,
}: {
  item: ArticleListItemProps;
  separator: string;
}): JSX.Element | null => {
  const date = item.fields?.PublicationDate;
  const showDate = hasTmxDate(date);
  const tags = tmxTagLabels(item.fields?.SxaTags);
  if (!showDate && tags.length === 0) return null;
  return (
    <div className="article-list-tmx__meta">
      {showDate && date && (
        <DateField
          field={date}
          tag="span"
          className="article-list-tmx__date"
          render={formatTmxDate}
          editable={false}
        />
      )}
      {tags.length > 0 &&
        `${showDate ? ` ${separator} ` : ''}${tags.map((t) => `#${t}`).join(' ')}`}
    </div>
  );
};

/* TMX lightbulb icon before the panel heading (decoration, drawn in code) */
const TmxBulbIcon = (): JSX.Element => (
  <svg className="article-list-tmx__icon" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
    <circle cx="20" cy="20" r="18.5" fill="none" strokeWidth="2" />
    <path
      d="M20 9.5a7.5 7.5 0 0 0-4.4 13.6c.8.6 1.3 1.5 1.3 2.5v1.4h6.2v-1.4c0-1 .5-1.9 1.3-2.5A7.5 7.5 0 0 0 20 9.5Z"
      fill="none"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M17 29.5h6M18 32h4" fill="none" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/* TMX variant: white panel, "TMX POV" heading, FEATURED article large left, next four as compact rows right.
   As on tmx.com, each article's title is plain text and the whole card is the link (the image link is stretched
   over the card in CSS), so a card reads image, title, date line. */
const ArticleListTmx = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const requested = parseInt(props.params?.NumberOfItems);
  const limit = requested > 0 ? Math.min(requested, 5) : 5;
  const newsItems = getNewsItems(props.fields?.items, limit) ?? [];
  const [featured, ...rest] = newsItems;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component article-list variant-tmx ${sxaStyles}`} id={id ? id : undefined}>
      <div className="article-list-tmx__panel">
        <h2 className="article-list-tmx__heading">
          <TmxBulbIcon />
          <span>TMX POV</span>
        </h2>
        <div className="article-list-tmx__body">
          <h3 className="article-list-tmx__label">Featured</h3>
          <div className="article-list-tmx__grid">
            {featured && (
              <div className="article-list-tmx__featured article-list-tmx__card">
                <Link
                  href={featured.url}
                  className="article-list-tmx__featured-media article-list-tmx__card-link"
                  aria-label={featured.fields?.Title?.value || undefined}
                >
                  <NextImage field={featured.fields?.Thumbnail} width={549} height={300} />
                </Link>
                <Text tag="div" field={featured.fields?.Title} className="article-list-tmx__featured-title" />
                <TmxMeta item={featured} separator="|" />
                {featured.fields?.Excerpt?.value && (
                  <Text tag="p" field={featured.fields.Excerpt} className="article-list-tmx__excerpt" />
                )}
              </div>
            )}
            {rest.length > 0 && (
              <div className="article-list-tmx__list">
                {rest.map((item) => (
                  <div className="article-list-tmx__row article-list-tmx__card" key={item.url}>
                    <Link
                      href={item.url}
                      className="article-list-tmx__row-media article-list-tmx__card-link"
                      aria-label={item.fields?.Title?.value || undefined}
                    >
                      <NextImage field={item.fields?.Thumbnail} width={145} height={77} />
                    </Link>
                    <div className="article-list-tmx__row-text">
                      <Text tag="div" field={item.fields?.Title} className="article-list-tmx__row-title" />
                      <TmxMeta item={item} separator="-" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Tmx = withDatasourceCheck()<ArticleListComponentProps>(ArticleListTmx);
