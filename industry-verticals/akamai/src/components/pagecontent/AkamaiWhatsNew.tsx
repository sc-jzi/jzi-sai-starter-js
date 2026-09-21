'use client';

import { useRef, JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  NextImage,
  Text,
  useSitecore,
  withDatasourceCheck,
} from '@sitecore-content-sdk/nextjs';
import Link from 'next/link';

const MAX_ITEMS = 5;

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Thumbnail: ImageField;
}

export type AkamaiWhatsNewItemProps = {
  fields: Fields;
  name: string;
  url: string;
};

interface AkamaiWhatsNewComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items: AkamaiWhatsNewItemProps[];
  };
}

const getNewsItems = (items: AkamaiWhatsNewItemProps[], numOfItems: number) => {
  return items
    ?.filter((item) => item.name !== 'Data' && item.name !== 'Authors')
    .slice(0, numOfItems || undefined);
};

const AkamaiWhatsNewDefault = (props: AkamaiWhatsNewComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const numOfItems = parseInt(props.params?.NumberOfItems, 10) || MAX_ITEMS;
  const articles = getNewsItems(props.fields?.items, numOfItems);

  const scrollBy = (direction: number) => {
    const el = scrollerRef.current;
    if (!el) return;

    el.scrollBy({
      left: direction * (el.clientWidth * 0.75),
      behavior: 'smooth',
    });
  };

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
          {articles.map((article) => (
            <article
              key={article.url}
              className="flex w-[min(85vw,24rem)] shrink-0 flex-col overflow-hidden rounded-[var(--akamai-card-radius)] bg-[var(--akamai-card-background)] shadow-[var(--akamai-card-shadow)]"
            >
              <div className="relative w-full">
                <NextImage
                  field={article.fields.Thumbnail}
                  width={384}
                  height={216}
                  className="aspect-video h-[216px] w-full object-cover"
                />

                <Text
                  field={article.fields.Title}
                  tag="h3"
                  className="absolute top-1/2 left-0 m-0 w-full -translate-y-1/2 px-5 text-xl font-bold leading-snug text-white"
                />
              </div>

              <div className="flex flex-1 flex-col p-5">
                <Text
                  field={article.fields.Excerpt}
                  tag="p"
                  className="mb-0 flex-1 text-sm leading-relaxed text-black"
                />

                <Link href={article.url || '#'} className="akamai-button-primary mt-5">
                  Read more
                </Link>
              </div>
            </article>
          ))}
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

export const Default = withDatasourceCheck()<AkamaiWhatsNewComponentProps>(AkamaiWhatsNewDefault);
