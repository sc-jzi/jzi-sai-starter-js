'use client';

import { JSX, useState } from 'react';
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
  link?: { jsonValue?: LinkField };
};

type IndustryNode = {
  id?: string;
  title?: { jsonValue?: Field<string> };
  image?: { jsonValue?: ImageField };
  link?: { jsonValue?: LinkField };
  products?: { targetItems?: ProductNode[] };
};

type IndustryListFields = {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      industries?: { targetItems?: IndustryNode[] };
    };
  };
};

export type IndustryListProps = ComponentProps & {
  fields: IndustryListFields;
};

/* DwyerOmega industry grid — click flips a card to its product list */
export const Default = (props: IndustryListProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = props.fields?.data?.datasource;
  const industries = datasource?.industries?.targetItems ?? [];
  const [flippedId, setFlippedId] = useState<string | null>(null);

  return (
    <section className={`component ${props.params?.styles || ''}`} id={id || undefined} style={{ background: 'var(--brand-bg, #fff)' }}>
      <div className="mx-auto max-w-[1100px] px-6 py-14">
        <h2 className="mb-8 text-center text-3xl font-semibold" style={{ color: 'var(--brand-fg, #1C1C1C)', fontFamily: 'var(--brand-heading-font, inherit)' }}>
          {datasource?.title?.jsonValue && <Text field={datasource.title.jsonValue} />}
        </h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {industries.map((industry) => {
            const productItems = industry.products?.targetItems ?? [];
            const canFlip = productItems.length > 0;
            const flipped = canFlip && flippedId === industry.id;
            const toggleFlip = () => setFlippedId(flipped ? null : industry.id || null);
            return (
              <li key={industry.id} className="h-[210px] [perspective:1200px]">
                <div
                  role={canFlip ? 'button' : undefined}
                  tabIndex={canFlip ? 0 : undefined}
                  aria-pressed={canFlip ? flipped : undefined}
                  className={`relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d] ${canFlip ? 'cursor-pointer' : ''}`}
                  style={{ transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
                  onClick={canFlip ? toggleFlip : undefined}
                  onKeyDown={
                    canFlip
                      ? (event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            toggleFlip();
                          }
                        }
                      : undefined
                  }
                >
                  <div
                    className="absolute inset-0 overflow-hidden rounded-2xl [backface-visibility:hidden]"
                    style={{ background: 'var(--brand-muted, #F5F5F7)' }}
                  >
                    {(industry.image?.jsonValue || isPageEditing) && (
                      <NextImage
                        field={industry.image?.jsonValue}
                        className="h-full w-full object-cover"
                        width={520}
                        height={280}
                      />
                    )}
                    <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <span className="pointer-events-auto rounded-full bg-white/95 px-6 py-1.5 text-[17px] font-semibold shadow-sm" style={{ color: 'var(--brand-fg, #1C1C1C)' }}>
                        {!canFlip && (industry.link?.jsonValue?.value?.href || isPageEditing) && industry.link?.jsonValue ? (
                          <span onClick={(event) => event.stopPropagation()}>
                            <Link field={industry.link.jsonValue} />
                          </span>
                        ) : (
                          industry.title?.jsonValue && <Text field={industry.title.jsonValue} />
                        )}
                      </span>
                    </span>
                  </div>
                  {canFlip && (
                    <div
                      className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-6 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                      style={{ border: '2px solid var(--brand-primary, #232C65)' }}
                    >
                      {productItems.map((product) => (
                        <span key={product.id} className="text-sm leading-snug" style={{ color: 'var(--brand-fg, #1C1C1C)' }}>
                          {product.link?.jsonValue?.value?.href ? (
                            <span onClick={(event) => event.stopPropagation()}>
                              <Link field={product.link.jsonValue} />
                            </span>
                          ) : (
                            product.title?.jsonValue && <Text field={product.title.jsonValue} />
                          )}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        {isPageEditing && industries.length === 0 && <p>Select industries on the datasource multilist.</p>}
      </div>
    </section>
  );
};

export const DwyerOmega = Default;
