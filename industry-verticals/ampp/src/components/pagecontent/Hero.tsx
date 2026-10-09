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

const HeroEmpty = ({ variantClass }: { variantClass: string }): JSX.Element => (
  <div className={`component hero ${variantClass}`}>
    <span className="is-empty-hint">Hero</span>
  </div>
);

/* AMPP variant: dark conference hero, copy on the left and portrait on the right */
export const ConferenceHero = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) return <HeroEmpty variantClass="variant-conference-hero" />;

  return (
    <div
      className={`component hero variant-conference-hero ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="conference-hero-layout">
          <div className="conference-hero-copy">
            <h1>
              <Text field={props.fields.Title} />
            </h1>
            {(isPageEditing || props.fields.Text?.value) && <RichText field={props.fields.Text} />}
            {(isPageEditing || props.fields.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
          {(isPageEditing || props.fields.Image?.value?.src) && (
            <div className="conference-hero-media">
              <NextImage field={props.fields.Image} width={640} height={480} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* AMPP variant: light course hero, summary on the left and image on the right */
export const CourseHero = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) return <HeroEmpty variantClass="variant-course-hero" />;

  return (
    <div className={`component hero variant-course-hero ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="course-hero-layout">
          <div className="course-hero-copy">
            <h1>
              <Text field={props.fields.Title} />
            </h1>
            {(isPageEditing || props.fields.Text?.value) && <RichText field={props.fields.Text} />}
            {(isPageEditing || props.fields.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
          {(isPageEditing || props.fields.Image?.value?.src) && (
            <div className="course-hero-media">
              <NextImage field={props.fields.Image} width={720} height={480} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
