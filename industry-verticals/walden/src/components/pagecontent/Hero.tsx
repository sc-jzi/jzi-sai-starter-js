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

/* Walden variant — full-bleed photo, gold ribbon, dropdowns, gold CTA */
export const Walden = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero walden-hero ${sxaStyles}`} id={id ? id : undefined}>
      <div className="walden-hero__media">
        <NextImage field={props.fields.Image} className="" width={1920} height={720} />
      </div>
      <div className="walden-hero__overlay" />
      <div className="container walden-hero__content">
        <div className="walden-hero__ribbon">Set a course for change®</div>
        {(props.fields.Title?.value || isPageEditing) && (
          <h1 className="walden-hero__title">
            <Text field={props.fields.Title} />
          </h1>
        )}
        {(props.fields.Text?.value || isPageEditing) && (
          <div className="walden-hero__text">
            <RichText field={props.fields.Text} />
          </div>
        )}
        <div className="walden-hero__actions">
          <select className="walden-hero__select" aria-label="Select your degree level" defaultValue="">
            <option value="" disabled>
              Select your degree level
            </option>
            <option>Bachelor&apos;s</option>
            <option>Master&apos;s</option>
            <option>Doctoral</option>
            <option>Certificate</option>
          </select>
          <select className="walden-hero__select" aria-label="What field of study interests you?" defaultValue="">
            <option value="" disabled>
              What field of study interests you?
            </option>
            <option>Business and Management</option>
            <option>Counseling</option>
            <option>Education</option>
            <option>Nursing</option>
            <option>Psychology</option>
          </select>
          {(isPageEditing || props.fields?.Link?.value?.href) && (
            <Link field={props.fields.Link} className="button button-main" />
          )}
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
