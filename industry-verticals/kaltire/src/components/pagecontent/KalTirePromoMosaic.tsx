'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  RichTextField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface GraphqlField<T> {
  jsonValue?: T;
}

interface PromoMosaicItem {
  id: string;
  title?: GraphqlField<Field<string>>;
  description?: GraphqlField<RichTextField>;
  image?: GraphqlField<ImageField>;
  link?: GraphqlField<LinkField>;
  theme?: GraphqlField<Field<string>>;
}

interface PromoMosaicDatasource {
  title?: GraphqlField<Field<string>>;
  children?: {
    results?: PromoMosaicItem[];
  };
}

type KalTirePromoMosaicProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: PromoMosaicDatasource;
    };
  };
};

const KalTirePromoMosaicEmpty = (): JSX.Element => (
  <div className="component kal-tire-promo-mosaic">
    <div className="component-content">
      <span className="is-empty-hint">Kal Tire Promotional Mosaic</span>
    </div>
  </div>
);

const getThemeClasses = (theme: string): string => {
  if (theme === 'orange') {
    return 'bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]';
  }

  if (theme === 'photo') {
    return 'bg-[var(--brand-secondary)] text-white';
  }

  return 'bg-[var(--brand-muted)] text-[var(--brand-fg)]';
};

export const Default = ({
  fields,
  params,
  page,
}: KalTirePromoMosaicProps): JSX.Element => {
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results ?? [];
  const isEditing = page?.mode?.isEditing;
  const { RenderingIdentifier, styles } = params;

  if (!datasource) {
    return <KalTirePromoMosaicEmpty />;
  }

  return (
    <div
      className={`component kal-tire-promo-mosaic ${styles || ''}`}
      id={RenderingIdentifier || undefined}
    >
      <section className="mx-auto grid max-w-[1280px] lg:grid-cols-2">
        {items.map((item, index) => {
          const title = item.title?.jsonValue;
          const description = item.description?.jsonValue;
          const image = item.image?.jsonValue;
          const link = item.link?.jsonValue;
          const theme = item.theme?.jsonValue?.value?.toLowerCase() || 'light';
          const isLarge = index === 0;

          return (
            <article
              key={item.id}
              className={`group relative isolate overflow-hidden ${getThemeClasses(theme)} ${
                isLarge ? 'min-h-[32rem] lg:row-span-2 lg:min-h-[42rem]' : 'min-h-[21rem]'
              }`}
            >
              {(image?.value?.src || isEditing) && (
                <ContentSdkImage
                  field={image}
                  width={isLarge ? 700 : 850}
                  height={isLarge ? 800 : 500}
                  className={`absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02] ${
                    theme === 'orange' ? 'object-left-bottom' : ''
                  }`}
                />
              )}
              {theme === 'photo' && (
                <div className="absolute inset-0 -z-[5] bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
              )}

              <div
                className={`flex h-full max-w-[62%] flex-col items-start p-7 md:p-10 ${
                  isLarge ? 'justify-start' : 'justify-center'
                }`}
              >
                {(title?.value || isEditing) && (
                  <Text
                    field={title}
                    tag="h2"
                    className="text-2xl font-extrabold leading-[1.05] md:text-3xl"
                  />
                )}
                {(description?.value || isEditing) && (
                  <ContentSdkRichText
                    field={description}
                    className="mt-3 text-sm font-semibold leading-snug md:text-base"
                  />
                )}
                {link && (link.value?.href || isEditing) && (
                  <ContentSdkLink
                    field={link}
                    className="mt-6 inline-flex bg-black px-5 py-3 text-xs font-extrabold uppercase tracking-wide text-white no-underline transition-transform hover:-translate-y-0.5"
                  />
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
};
