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

/* Tmx variant: light cyan band, image left in a teal offset frame, condensed uppercase tagline, title, text and a navy pill button */
export const Tmx = (props: HeroBannerProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;

  return (
    <div className={`component hero-banner variant-tmx ${sxaStyles}`} id={id ? id : undefined}>
      <div className="tmx-hero-inner">
        <div className="tmx-hero-media">
          {(isPageEditing || fields?.Image?.value?.src) && (
            <div className="tmx-hero-frame">
              <NextImage field={fields?.Image} className="tmx-hero-img" width={545} height={400} />
            </div>
          )}
        </div>
        <div className="tmx-hero-copy">
          {(isPageEditing || fields?.Tagline?.value) && (
            <Text field={fields?.Tagline} tag="p" className="tmx-hero-tagline" />
          )}
          {(isPageEditing || fields?.Title?.value) && (
            <Text field={fields?.Title} tag="h1" className="tmx-hero-title" />
          )}
          {(isPageEditing || fields?.Text?.value) && (
            <RichText field={fields?.Text} className="tmx-hero-text" />
          )}
          {(isPageEditing || fields?.Cta1?.value?.href) && (
            <Link field={fields?.Cta1} className="tmx-hero-button" />
          )}
        </div>
      </div>
    </div>
  );
};
