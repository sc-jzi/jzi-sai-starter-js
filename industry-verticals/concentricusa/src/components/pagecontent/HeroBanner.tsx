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

export const ConcentricUSA = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section
      className={`component hero-banner relative flex min-h-[520px] items-center justify-center overflow-hidden bg-[#465773] text-white ${props.params?.styles || ''}`}
      id={id || undefined}
    >
      {(props.fields?.Image?.value?.src || isPageEditing) && (
        <NextImage
          field={props.fields.Image}
          className="absolute inset-0 h-full w-full object-cover"
          width={1600}
          height={700}
        />
      )}
      <div className="absolute inset-0 bg-black/45" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-20 text-center">
        {(props.fields?.Title?.value || isPageEditing) && (
          <h1 className="text-4xl font-bold text-white md:text-5xl">
            <Text field={props.fields.Title} />
          </h1>
        )}
        {(props.fields?.Text?.value || isPageEditing) && (
          <div className="mt-4 text-lg text-white">
            <RichText field={props.fields.Text} />
          </div>
        )}
        {(isPageEditing || props.fields?.Cta1?.value?.href) && (
          <div className="mt-8">
            <Link
              field={props.fields.Cta1}
              className="inline-block rounded-[6px] bg-[#51C748] px-6 py-3 font-bold text-white"
            />
          </div>
        )}
      </div>
    </section>
  );
};
