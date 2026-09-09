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

const HeroDefault = (props: AppPromoProps): JSX.Element => {
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

export const Default = HeroDefault;

export const Quorum = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const hasImage = Boolean(props.fields?.Image?.value?.src);

  return (
    <section
      className={`component quorum-hero ${hasImage ? '' : 'quorum-hero--no-image'} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      {(hasImage || isPageEditing) && (
        <NextImage
          field={props.fields?.Image}
          className="quorum-hero__image"
          width={1920}
          height={440}
        />
      )}
      <div className="quorum-hero__overlay" aria-hidden="true" />
      <div className="quorum-container quorum-hero__content">
        <h1 className="quorum-hero__title">
          <Text field={props.fields?.Title} />
        </h1>
        <RichText field={props.fields?.Text} className="quorum-hero__text" />
        {(isPageEditing || props.fields?.Link?.value?.href) && (
          <Link field={props.fields?.Link} className="quorum-button quorum-button--primary" />
        )}
      </div>
    </section>
  );
};
