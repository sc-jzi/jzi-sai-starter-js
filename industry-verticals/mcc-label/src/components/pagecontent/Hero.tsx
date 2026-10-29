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
      {(isPageEditing || props.fields?.Link?.value?.href) && (
        <Link field={props.fields.Link} className="hero-back" />
      )}
      <picture>
        <NextImage field={props.fields.Image} className="" width={1920} height={400}></NextImage>
      </picture>
      <div className="container content-container">
        <div className="hero-card">
        <div className="top-layout">
          <h1 className="title">
            <Text field={props.fields.Title} />
          </h1>
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
    </div>
  );
};

export const MccLabel = (props: AppPromoProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

export const MccLabelPageHero = (props: AppPromoProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-page-hero">
    <Default {...props} />
  </section>
);

export const MccLabelArticle = (props: AppPromoProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-article">
    <Default {...props} />
  </section>
);
