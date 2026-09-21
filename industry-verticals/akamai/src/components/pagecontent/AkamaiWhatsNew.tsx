'use client';

import { useMemo, useRef, type JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';
import { ComponentProps } from 'lib/component-props';

const ARTICLE_PAGE_TEMPLATE_ID = 'F83CCEFD-FC41-4A60-9882-8F7EA5CF41A8';
const MAX_ITEMS = 5;

type JsonField<T> = { jsonValue?: T };

interface ArticleResult {
  id?: string;
  name?: string;
  url?: { path?: string };
  template?: { id?: string };
  updated?: { value?: string };
  title?: JsonField<Field<string>>;
  excerpt?: JsonField<Field<string>>;
  thumbnail?: JsonField<ImageField>;
}

interface AkamaiWhatsNewFields {
  data?: {
    datasource?: {
      children?: {
        results?: ArticleResult[];
      };
    };
  };
}

export type AkamaiWhatsNewProps = ComponentProps & {
  fields: AkamaiWhatsNewFields;
};

const normalizeId = (id?: string): string =>
  (id || '').replace(/[{}-]/g, '').toUpperCase();

const getArticleHref = (item: ArticleResult): string => item.url?.path || '#';

export const Default = (props: AkamaiWhatsNewProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const scrollerRef = useRef<HTMLDivElement>(null);

  const articles = useMemo(() => {
    const results = props.fields?.data?.datasource?.children?.results || [];
    const articleTemplateId = normalizeId(ARTICLE_PAGE_TEMPLATE_ID);

    return [...results]
      .filter((item) => {
        const templateId = normalizeId(item.template?.id);
        // Prefer explicit template match; if template is missing from the payload, keep items that have Title
        if (templateId) {
          return templateId === articleTemplateId;
        }
        return Boolean(item.title?.jsonValue || item.name);
      })
      .sort((a, b) => {
        const aUpdated = a.updated?.value || '';
        const bUpdated = b.updated?.value || '';
        return bUpdated.localeCompare(aUpdated);
      })
      .slice(0, MAX_ITEMS);
  }, [props.fields]);

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * (el.clientWidth * 0.75),
      behavior: 'smooth',
    });
  };

  if (!articles.length) {
    return (
      <div
        className={`component akamai-whats-new akamai-brand bg-[var(--brand-bg)] pb-14 ${sxaStyles}`}
        id={id || undefined}
      >
        {isPageEditing ? (
          <div className="mx-auto max-w-[1200px] px-6 py-10 text-sm text-black/70">
            Select the articles folder as the datasource to display recent news.
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`component akamai-whats-new akamai-brand bg-[var(--brand-bg)] pb-14 ${sxaStyles}`}
      id={id || undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6">
        <div
          ref={scrollerRef}
          className="flex gap-6 overflow-x-auto scroll-smooth px-1 py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {articles.map((article) => {
            const href = getArticleHref(article);

            return (
              <article
                key={article.id || href}
                className="flex w-[min(85vw,24rem)] shrink-0 flex-col overflow-hidden rounded-[var(--akamai-card-radius)] bg-[var(--akamai-card-background)] shadow-[var(--akamai-card-shadow)]"
              >
                <div className="relative w-full">
                  <NextImage
                    field={article.thumbnail?.jsonValue}
                    width={768}
                    height={432}
                    className="h-auto w-full"
                  />

                  <Text
                    field={article.title?.jsonValue}
                    tag="h3"
                    className="absolute top-1/2 left-0 m-0 w-full -translate-y-1/2 px-5 text-xl font-bold leading-snug text-white"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <Text
                    field={article.excerpt?.jsonValue}
                    tag="p"
                    className="mb-0 flex-1 text-sm leading-relaxed text-black"
                  />

                  <Link href={href} className="akamai-button-primary mt-5">
                    Read more
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-5 flex justify-end gap-3 pb-[20px]">
          <button
            type="button"
            aria-label="Previous cards"
            onClick={() => scrollBy(-1)}
            className="akamai-carousel-control akamai-carousel-control--previous"
          >
            ‹
          </button>

          <button
            type="button"
            aria-label="Next cards"
            onClick={() => scrollBy(1)}
            className="akamai-carousel-control akamai-carousel-control--next"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
};
