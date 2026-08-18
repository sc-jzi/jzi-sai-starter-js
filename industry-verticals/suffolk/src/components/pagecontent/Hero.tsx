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

/* Suffolk variant — full-bleed lighthouse photo with search chrome */
export const Suffolk = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const placeholder = props.fields?.Link?.value?.text || 'Search Suffolk County';

  return (
    <div className={`component hero suffolk ${sxaStyles}`} id={id ? id : undefined}>
      <div className="hero-media">
        <NextImage field={props.fields.Image} className="hero-image" width={1920} height={720} />
        <div className="hero-overlay" />
      </div>
      <div className="container content-container">
        <div className="hero-copy">
          <h1 className="hero-title">
            <Text field={props.fields.Title} />
          </h1>
          <form className="suffolk-search" action="#" method="get" role="search">
            <input
              className="suffolk-search-input"
              type="search"
              name="q"
              placeholder={placeholder}
              aria-label={placeholder}
              readOnly={!isPageEditing}
            />
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="suffolk-search-button">
                Search
              </Link>
            )}
          </form>
        </div>
      </div>
    </div>
  );
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
