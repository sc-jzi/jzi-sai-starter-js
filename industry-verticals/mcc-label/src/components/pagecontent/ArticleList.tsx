'use client';

import React, { JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  Text,
  RichTextField,
  withDatasourceCheck,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { asImageField } from 'lib/as-image-field';

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
}

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
      className={`component article-list ${props.params?.styles?.trimEnd() || ''}`}
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

export const MccLabel = (props: ArticleListComponentProps): JSX.Element => {
  const first = props.fields?.items?.[0] as
    | { fields?: Fields & { Image?: ImageField; Date?: Field<string>; Excerpt?: Field<string> } }
    | undefined;
  const image = asImageField(first?.fields?.Image);
  return (
    <div className="component article-list mcc-label-variant MccLabel">
      <div className="news-card">
        {image && <NextImage field={image} width={430} height={250} />}
        <div className="news-copy">
          <Text field={first?.fields?.Date} tag="p" />
          <Text field={first?.fields?.Title} tag="h2" />
          <Text field={first?.fields?.Excerpt} tag="p" />
          <a className="news-see-all" href="/news">See All</a>
          <a className="news-read-more" href="/news/mcc-earns-ecovadis-silver-medal">Read More</a>
        </div>
      </div>
    </div>
  );
};

export const MccLabelNewsCards = (props: ArticleListComponentProps): JSX.Element => (
  <div className="mcc-label-variant MccLabelNewsCards">
    <Default {...props} />
  </div>
);

export const MccLabelResourceRow = (props: ArticleListComponentProps): JSX.Element => {
  const items = (props.fields?.items ?? []).filter((item) => item.fields?.Title);
  const head = items.find((item) => item.fields.Title?.value === "Label expert knowledge to inspire you") ?? items[0];
  const rest = items.filter((item) => item !== head);
  return (
    <div className="component article-list mcc-label-variant MccLabelResourceRow">
      <div className="resource-row">
        <div className="resource-photos">
          {rest.map((item, index) => {
            const image = asImageField((item.fields as { Image?: ImageField }).Image);
            return image ? <NextImage key={item.url || index} field={image} width={430} height={250} /> : null;
          })}
        </div>
        <div className="resource-copy">
          <Text field={head?.fields?.Title} tag="h2" />
          <Text field={(head?.fields as { Text?: Field<string> } | undefined)?.Text} tag="p" />
          {rest.map((item, index) => (
            <article key={item.url || index}>
              <Text field={item.fields?.Title} tag="h3" />
              <Text field={item.fields?.Excerpt} tag="p" />
            </article>
          ))}
          <a className="news-see-all" href="/resources">SEE ALL</a>
          <a href="/resources">Read More</a>
        </div>
      </div>
    </div>
  );
};
