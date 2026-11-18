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

/* OhioHealth variants. OhioHealth: photo, title, text and button below. OhioHealthCard: the same as one bordered card (live Women's Center
   card on the homepage). OhioHealthPicture: only the image (the building rendering on the Women's Center page). */
const OhHero = (props: AppPromoProps, mode: 'plain' | 'card' | 'picture'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  if (!props.fields) return <div className={`component hero oh-hero ${sxaStyles}`} />;
  return (
    <div className={`component hero oh-hero oh-hero--${mode} ${sxaStyles}`} id={id ? id : undefined}>
      <div className="oh-container">
        <div className="oh-hero__box">
          <div className="oh-hero__media">
            <NextImage field={props.fields.Image} width={1400} height={760} />
          </div>
          {mode !== 'picture' && (
            <div className="oh-hero__body">
              {(isPageEditing || props.fields.Title?.value) && (
                <h2 className="oh-hero__title">
                  <Text field={props.fields.Title} />
                </h2>
              )}
              <RichText field={props.fields.Text} className="oh-hero__text" />
              {(isPageEditing || props.fields.Link?.value?.href) && (
                <Link field={props.fields.Link} className="oh-button" />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export const OhioHealth = (props: AppPromoProps): JSX.Element => OhHero(props, 'plain');
export const OhioHealthCard = (props: AppPromoProps): JSX.Element => OhHero(props, 'card');
export const OhioHealthPicture = (props: AppPromoProps): JSX.Element => OhHero(props, 'picture');
