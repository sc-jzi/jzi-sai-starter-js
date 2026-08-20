'use client';

import { JSX, useState } from 'react';
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

interface KalTireFinderHeroFields {
  Title: Field<string>;
  Description: RichTextField;
  BackgroundImage: ImageField;
  VehicleTitle: Field<string>;
  VehicleDescription: Field<string>;
  VehicleImage: ImageField;
  VehicleLink: LinkField;
  SizeTitle: Field<string>;
  SizeDescription: Field<string>;
  SizeImage: ImageField;
  SizeLink: LinkField;
  PackagesLink: LinkField;
}

type KalTireFinderHeroProps = ComponentProps & {
  fields: KalTireFinderHeroFields;
};

type FinderTab = 'tires' | 'wheels' | 'packages';

const KalTireFinderHeroEmpty = (): JSX.Element => (
  <div className="component kal-tire-finder-hero">
    <div className="component-content">
      <span className="is-empty-hint">Kal Tire Finder Hero</span>
    </div>
  </div>
);

export const Default = ({
  fields,
  params,
  page,
}: KalTireFinderHeroProps): JSX.Element => {
  const [activeTab, setActiveTab] = useState<FinderTab>('tires');
  const isEditing = page?.mode?.isEditing;
  const { RenderingIdentifier, styles } = params;

  if (!fields) {
    return <KalTireFinderHeroEmpty />;
  }

  const renderFinderOption = (
    title: Field<string>,
    description: Field<string>,
    image: ImageField,
    link: LinkField
  ) => (
    <ContentSdkLink
      field={link}
      className="group grid min-h-24 grid-cols-[7rem_1fr] items-center gap-4 bg-[var(--brand-muted)] px-5 py-3 text-[var(--brand-fg)] no-underline transition-colors hover:bg-white"
    >
      <ContentSdkImage
        field={image}
        width={150}
        height={80}
        className="h-20 w-28 object-contain"
      />
      <span>
        <Text
          field={title}
          tag="strong"
          className="block text-base font-extrabold uppercase leading-tight"
        />
        <Text
          field={description}
          tag="span"
          className="mt-1 block text-sm font-medium leading-tight text-[var(--brand-muted-fg)]"
        />
      </span>
    </ContentSdkLink>
  );

  return (
    <div
      className={`component kal-tire-finder-hero ${styles || ''}`}
      id={RenderingIdentifier || undefined}
    >
      <section className="relative min-h-[34rem] overflow-hidden bg-[var(--brand-secondary)] text-white lg:min-h-[42rem]">
        {(fields.BackgroundImage?.value?.src || isEditing) && (
          <ContentSdkImage
            field={fields.BackgroundImage}
            width={1440}
            height={710}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-black/10 to-transparent" />

        <div className="relative mx-auto grid min-h-[34rem] max-w-[1280px] items-center gap-10 px-6 py-12 lg:min-h-[42rem] lg:grid-cols-[1fr_1.05fr] lg:px-10">
          <div className="max-w-xl self-end pb-8 lg:self-center lg:pb-0">
            <Text
              field={fields.Title}
              tag="h1"
              className="max-w-lg text-5xl font-extrabold uppercase leading-[0.98] tracking-tight drop-shadow md:text-6xl"
            />
            <ContentSdkRichText
              field={fields.Description}
              className="mt-4 text-lg font-semibold drop-shadow"
            />
          </div>

          <div className="self-end bg-white text-[var(--brand-fg)] shadow-xl lg:self-center">
            <div className="grid grid-cols-3 bg-[var(--brand-secondary)]" role="tablist">
              {(['tires', 'wheels', 'packages'] as FinderTab[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab}
                  onClick={() => setActiveTab(tab)}
                  className={`border-0 px-4 py-4 text-sm font-extrabold uppercase tracking-wide ${
                    activeTab === tab
                      ? 'bg-white text-[var(--brand-fg)]'
                      : 'bg-[var(--brand-secondary)] text-white hover:bg-black'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-5 md:p-7" role="tabpanel">
              {activeTab === 'packages' ? (
                <ContentSdkLink
                  field={fields.PackagesLink}
                  className="flex min-h-52 items-center justify-center bg-[var(--brand-muted)] px-6 text-center text-xl font-extrabold uppercase text-[var(--brand-fg)] no-underline hover:bg-white"
                />
              ) : (
                <>
                  {renderFinderOption(
                    fields.VehicleTitle,
                    fields.VehicleDescription,
                    fields.VehicleImage,
                    fields.VehicleLink
                  )}
                  {renderFinderOption(
                    fields.SizeTitle,
                    fields.SizeDescription,
                    fields.SizeImage,
                    fields.SizeLink
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
