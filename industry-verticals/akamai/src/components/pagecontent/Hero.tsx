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
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
}

export type AppPromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero ${sxaStyles}`} id={id ? id : undefined}>
      <picture>
        <NextImage field={props.fields.Image} className="" width={1920} height={400}></NextImage>
      </picture>
      <div className="container content-container">
        <div className="top-layout">
          <div className="title">
            <Text field={props.fields.Title} />
          </div>
          <div className="subtitle">
            <RichText field={props.fields.Text} />
          </div>
        </div>
        <div className="bottom-layout">
          <div className="btn-array">
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main mt-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* Akamai variant — left-aligned navy hero with wave bg and orange CTA */
export const Akamai = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <section
      className={`component hero akamai-brand akamai-hero relative h-[500px] max-h-[500px] overflow-hidden bg-[var(--brand-hero-navy)] text-white ${sxaStyles}`}
      id={id || undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <NextImage
        field={props.fields.Image}
        width={1920}
        height={800}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1200px] flex-col items-center justify-center px-6 py-10 text-center">
        <div className="mx-auto max-w-3xl text-center">
          <Text
            field={props.fields.Title}
            tag="h1"
            className="akamai-hero__title m-0 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
          />

          <RichText
            field={props.fields.Text}
            className="akamai-hero__text mx-auto mt-6 max-w-2xl text-base font-semibold leading-relaxed md:text-lg [&_p]:mb-0"
          />

          <Link
            field={props.fields.Link}
            className="akamai-button-accent mt-8"
          />
        </div>
      </div>
    </section>
  );
};
