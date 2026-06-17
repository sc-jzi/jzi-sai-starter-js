'use client';

import { Fragment, useState, JSX } from 'react';
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
import { useI18n } from 'next-localization';

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

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

const ArticleListDefault = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const { t } = useI18n();

  return (
    <div
      className={`component article-list section-spacing bg-white ${props.params?.styles.trimEnd()}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        {newsItems?.map((item, i) => (
          <Fragment key={item.url}>
            <div
              className={`grid items-center gap-8 py-8 lg:grid-cols-2 lg:gap-12 ${
                i % 2 !== 0 ? 'lg:[&>div:first-child]:order-2' : ''
              }`}
            >
              <div className="overflow-hidden">
                <NextImage
                  field={item.fields.Thumbnail}
                  width={600}
                  height={400}
                  className="w-full object-cover"
                />
              </div>
              <div>
                <h3 className="mb-3">
                  <Text field={item.fields.Title} />
                </h3>
                <p className="article-excerpt mb-6 text-lg text-excelitas-gray-500">
                  <Text field={item.fields.Excerpt} />
                </p>
                <Link href={item.url} className="button button-secondary">
                  {t('Read more') || 'Read more'}
                </Link>
              </div>
            </div>
            {i < newsItems.length - 1 && <hr className="border-excelitas-gray-300" />}
          </Fragment>
        ))}
      </div>
    </div>
  );
};

const ArticleListThreeColumn = (props: ArticleListComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const newsItems = getNewsItems(props.fields?.items, parseInt(props.params?.NumberOfItems));
  const sxaStyles = `${props.params?.styles || ''}`;
  const { t } = useI18n();

  return (
    <div
      className={`component article-list section-spacing bg-white ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        <div className="mb-10 text-center">
          <h2 className="mb-3">{t('Our Products') || 'Our Products'}</h2>
          <p className="mx-auto max-w-2xl text-lg text-excelitas-gray-500">
            {t('We develop innovative products and components to enable your innovation.') ||
              'We develop innovative products and components to enable your innovation.'}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newsItems?.map((item) => (
            <Link href={item.url} className="wrapper-link group no-underline" key={item.url}>
              <div className="card-excelitas overflow-hidden p-4">
                <div className="mb-4 flex h-48 items-center justify-center bg-excelitas-gray-50 p-4">
                  <NextImage
                    field={item.fields.Thumbnail}
                    width={300}
                    height={200}
                    className="max-h-full w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-center text-base font-semibold text-excelitas-gray-900">
                  <Text field={item.fields.Title} />
                </h3>
              </div>
            </Link>
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
  const { t } = useI18n();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component article-list section-spacing bg-excelitas-teal text-white ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <h2 className="text-white">{t('The Latest at Excelitas') || 'The Latest at Excelitas'}</h2>
          <Link href={allArticlesPageHref} className="btn-excelitas-text-light">
            {t('See all') || 'See all'} &rsaquo;
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {newsItems?.map((item) => (
            <article key={item.url} className="flex flex-col">
              <p className="eyebrow-light mb-2">
                <Text field={item.fields.Excerpt} />
              </p>
              <h3 className="mb-4 flex-1 text-lg font-bold text-white">
                <Text field={item.fields.Title} />
              </h3>
              <Link href={item.url} className="btn-excelitas-text-light">
                {t('Learn More') || 'Learn More'} &rsaquo;
              </Link>
            </article>
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
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;
  const canScroll = (newsItems?.length || 0) > visibleCount;

  const handlePrev = () => {
    setStartIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setStartIndex((prev) =>
      Math.min((newsItems?.length || 0) - visibleCount, prev + 1)
    );
  };

  const visibleItems = newsItems?.slice(startIndex, startIndex + visibleCount);

  return (
    <div
      className={`component article-list section-spacing bg-excelitas-teal text-white ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-excelitas-wide relative">
        <h2 className="mb-10 text-center text-white md:text-left">The Latest at Excelitas</h2>

        {canScroll && (
          <>
            <button
              type="button"
              aria-label="Previous articles"
              className="absolute -left-2 top-1/2 z-10 hidden -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white lg:block xl:-left-8"
              onClick={handlePrev}
              disabled={startIndex === 0}
            >
              <ChevronLeft />
            </button>
            <button
              type="button"
              aria-label="Next articles"
              className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white lg:block xl:-right-8"
              onClick={handleNext}
              disabled={startIndex >= (newsItems?.length || 0) - visibleCount}
            >
              <ChevronRight />
            </button>
          </>
        )}

        <div className="article-list-grid grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {visibleItems?.map((item) => (
            <article className="article-grid-item flex flex-col" key={item.url}>
              <Link href={item.url} className="wrapper-link group no-underline">
                <div className="mb-4 overflow-hidden">
                  <NextImage
                    field={item.fields.Thumbnail}
                    width={400}
                    height={250}
                    className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <p className="eyebrow-light mb-2">
                  <Text field={item.fields.Excerpt} />
                </p>
                <h3 className="mb-4 text-lg font-bold text-white">
                  <Text field={item.fields.Title} />
                </h3>
                <span className="btn-excelitas-text-light">
                  Learn More &rsaquo;
                </span>
              </Link>
            </article>
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
