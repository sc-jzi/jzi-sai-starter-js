'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  useSitecore,
  Link,
  LinkField,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { IconAccent } from 'components/non-sitecore/IconAccent';
import { DottedAccent } from 'components/non-sitecore/DottedAccent';

interface Fields {
  Tagline: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Cta1: LinkField;
  Cta2: LinkField;
  Icon: ImageField;
}

export type HeroBannerProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero-banner ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container container-wide">
        <div className="hero-row">
          <div className="content-column">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Tagline} />
            </h6>
            <h1 className="display-2 fw-bold">
              <Text field={props.fields.Title} />
            </h1>

            <div className="rich-content mb-4">
              <RichText field={props.fields.Text} />
            </div>
            <div className="btn-array pt-3 pb-4">
              {(isPageEditing || props.fields?.Cta1?.value?.href) && (
                <Link field={props.fields.Cta1} className="button button-main" />
              )}
              {(isPageEditing || props.fields?.Cta2?.value?.href) && (
                <Link field={props.fields.Cta2} className="button button-simple mx-4" />
              )}
            </div>
            <div className="row mt-2">
              <Placeholder name="hero-banner" rendering={props.rendering} />
            </div>
            <IconAccent image={props.fields.Icon} />
          </div>
          <div className="img-column">
            <div className="img-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className="img-fluid"
                width={700}
                height={700}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HeroBannerEmpty = (): JSX.Element => (
  <div className="component hero-banner">
    <div className="component-content">
      <span className="is-empty-hint">Hero Banner</span>
    </div>
  </div>
);

/* OI variant — 50/50 news placeholder + stacked headline / gold pill */
export const OI = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <HeroBannerEmpty />;
  }

  return (
    <div
      className={`component hero-banner oi-brand oi-hero bg-[var(--brand-bg)] py-10 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <Placeholder name="hero-banner" rendering={props.rendering} />
        </div>
        <div className="max-w-xl">
          {(props.fields.Title?.value || isPageEditing) && (
            <Text
              field={props.fields.Title}
              tag="h1"
              className="m-0 max-w-[11ch] text-[2.75rem] font-semibold leading-[1.08] text-[var(--brand-fg)] md:text-[4rem]"
            />
          )}
          {(props.fields.Text?.value || isPageEditing) && (
            <RichText
              field={props.fields.Text}
              className="mt-6 text-[1.05rem] leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-0"
            />
          )}
          {(isPageEditing || props.fields?.Cta1?.value?.href) && (
            <Link
              field={props.fields.Cta1}
              className="mt-8 inline-flex items-center rounded-[var(--brand-button-radius)] bg-[var(--brand-primary)] px-7 py-2.5 text-sm font-bold text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
            />
          )}
        </div>
      </div>
    </div>
  );
};
