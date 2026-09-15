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
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const bgSrc = props.fields?.Image?.value?.src;

  return (
    <section
      className={`component hero akamai-hero relative overflow-hidden bg-[var(--brand-hero-navy)] text-[var(--brand-primary-foreground)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{
        fontFamily: 'var(--brand-heading-font)',
        backgroundImage: bgSrc ? `url("${bgSrc}")` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center right',
      }}
    >
      <div className="relative z-10 mx-auto flex min-h-[28rem] max-w-[1200px] flex-col justify-center px-6 py-16 md:min-h-[32rem] md:py-24">
        <div className="max-w-2xl text-left">
          <Text
            field={props.fields.Title}
            tag="h1"
            className="m-0 text-4xl font-bold leading-tight tracking-tight md:text-5xl"
          />
          <RichText
            field={props.fields.Text}
            className="mt-5 max-w-xl text-base font-normal leading-relaxed text-white/90 md:text-lg [&_p]:mb-0"
          />
          {(isPageEditing || props.fields?.Link?.value?.href) && (
            <Link
              field={props.fields.Link}
              className="mt-8 inline-flex rounded-[var(--brand-button-radius)] bg-[var(--brand-accent)] px-6 py-3 text-sm font-semibold text-[var(--brand-accent-foreground)] no-underline hover:brightness-110"
            />
          )}
        </div>
      </div>
      {/* Keep Image field editable in Experience Editor */}
      {isPageEditing && (
        <div className="sr-only">
          <NextImage field={props.fields.Image} width={1920} height={800} />
        </div>
      )}
    </section>
  );
};
