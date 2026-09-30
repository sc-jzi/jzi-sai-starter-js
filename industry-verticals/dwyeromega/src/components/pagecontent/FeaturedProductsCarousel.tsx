'use client';

import { JSX, useMemo, useState } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type ProductNode = {
  id?: string;
  title?: { jsonValue?: Field<string> };
  image?: { jsonValue?: ImageField };
  link?: { jsonValue?: LinkField };
};

type CarouselFields = {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      link?: { jsonValue?: LinkField };
      products?: { targetItems?: ProductNode[] };
    };
  };
};

export type FeaturedProductsCarouselProps = ComponentProps & {
  fields: CarouselFields;
};

const VISIBLE = 4;

/* DwyerOmega featured products — four-up carousel, ends disable the matching arrow */
export const Default = (props: FeaturedProductsCarouselProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = props.fields?.data?.datasource;
  const products = useMemo(() => datasource?.products?.targetItems ?? [], [datasource]);
  const [index, setIndex] = useState(0);
  const maxIndex = Math.max(0, products.length - VISIBLE);
  const visible = products.slice(index, index + VISIBLE);
  const atStart = index <= 0;
  const atEnd = index >= maxIndex;

  return (
    <section className={`component ${props.params?.styles || ''}`} id={id || undefined} style={{ background: 'var(--brand-bg, #fff)' }}>
      <div className="mx-auto max-w-[1200px] px-6 py-14 text-center">
        <h2 className="mb-10 text-3xl font-semibold" style={{ color: 'var(--brand-fg, #1C1C1C)', fontFamily: 'var(--brand-heading-font, inherit)' }}>
          {datasource?.title?.jsonValue && <Text field={datasource.title.jsonValue} />}
        </h2>
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Previous products"
            disabled={atStart}
            onClick={() => setIndex((value) => Math.max(0, value - VISIBLE))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
            style={
              atStart
                ? { borderColor: '#D9D9DE', background: '#fff', color: '#C8C8CE' }
                : { borderColor: 'var(--brand-primary, #232C65)', background: 'var(--brand-primary, #232C65)', color: '#fff' }
            }
          >
            <span aria-hidden="true" className="text-xl leading-none">‹</span>
          </button>
          <ul className="grid flex-1 grid-cols-2 gap-6 md:grid-cols-4">
            {visible.map((product) => (
              <li key={product.id} className="flex flex-col items-center">
                <div className="mb-4 flex h-40 w-full items-center justify-center">
                  {product.image?.jsonValue && (
                    <NextImage field={product.image.jsonValue} className="max-h-40 w-auto object-contain" width={180} height={160} />
                  )}
                </div>
                {product.link?.jsonValue?.value?.href ? (
                  <Link field={product.link.jsonValue} className="text-sm" style={{ color: 'var(--brand-muted-fg, #5E6265)' }} />
                ) : (
                  product.title?.jsonValue && (
                    <p className="text-sm" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
                      <Text field={product.title.jsonValue} />
                    </p>
                  )
                )}
              </li>
            ))}
            {isPageEditing && products.length === 0 && <li>Select products on the datasource multilist.</li>}
          </ul>
          <button
            type="button"
            aria-label="Next products"
            disabled={atEnd}
            onClick={() => setIndex((value) => Math.min(maxIndex, value + VISIBLE))}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
            style={
              atEnd
                ? { borderColor: '#D9D9DE', background: '#fff', color: '#C8C8CE' }
                : { borderColor: 'var(--brand-primary, #232C65)', background: 'var(--brand-primary, #232C65)', color: '#fff' }
            }
          >
            <span aria-hidden="true" className="text-xl leading-none">›</span>
          </button>
        </div>
        {(isPageEditing || datasource?.link?.jsonValue?.value?.href) && datasource?.link?.jsonValue && (
          <Link
            field={datasource.link.jsonValue}
            className="dwyer-browse-all mt-10 inline-flex items-center justify-center rounded-[0.375rem] px-8 py-3 text-base font-semibold no-underline transition-colors duration-200"
          />
        )}
      </div>
    </section>
  );
};

export const DwyerOmega = Default;
