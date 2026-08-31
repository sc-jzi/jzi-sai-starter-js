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

function hasAuthoredLink(link?: LinkField): boolean {
  const href = link?.value?.href;
  return Boolean(href && href !== '#');
}

function TwoToneHeroTitle({ field, isPageEditing }: { field: Field<string>; isPageEditing: boolean }): JSX.Element {
  const value = field?.value || '';
  const splitAt = value.toLowerCase().indexOf('water at');

  if (isPageEditing || splitAt <= 0) {
    return <Text field={field} />;
  }

  return (
    <>
      <span className="pentair-water-hero__lede">{value.slice(0, splitAt).trim()}</span>
      <span className="pentair-water-hero__punch">{value.slice(splitAt)}</span>
    </>
  );
}

/* PentairWater variant — lifestyle photo as full-bleed background, copy over the left */
export const PentairWater = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero pentair-water-hero ${sxaStyles}`} id={id ? id : undefined}>
      <picture>
        <NextImage field={props.fields.Image} className="" width={1920} height={640} />
      </picture>
      <div className="container content-container">
        <div className="pentair-water-hero__copy">
          <h1 className="title">
            <TwoToneHeroTitle field={props.fields.Title} isPageEditing={isPageEditing} />
          </h1>
          <div className="subtitle">
            <RichText field={props.fields.Text} />
          </div>
          {(isPageEditing || hasAuthoredLink(props.fields?.Link)) && (
            <Link field={props.fields.Link} className="button button-main" />
          )}
        </div>
      </div>
    </div>
  );
};
