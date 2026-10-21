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

export const Pvp = (props: HeroBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <section className={`component hero-banner variant-pvp ${sxaStyles}`} id={id ? id : undefined}>
      <div className="pvp-hero">
        <div className="pvp-hero-media">
          <NextImage field={props.fields.Image} sizes="200vw" priority />
        </div>
        <div className="pvp-hero-copy">
          <Text tag="h1" field={props.fields.Title} />
          <RichText field={props.fields.Text} />
          {(isPageEditing || props.fields?.Cta1?.value?.href) && (
            <Link field={props.fields.Cta1} className="pvp-button" />
          )}
        </div>
      </div>
    </section>
  );
};

const PvpTitleBand = (props: HeroBannerProps, tone: 'navy' | 'green' | 'photo'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const hasImage = isPageEditing || !!props.fields?.Image?.value?.src;

  return (
    <section
      className={`component hero-banner variant-pvp-band variant-pvp-band-${tone} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      {tone === 'photo' && hasImage && (
        <div className="pvp-band-photo">
          <NextImage field={props.fields.Image} sizes="100vw" priority />
        </div>
      )}
      <div className="pvp-band-inner">
        <div className="pvp-band-copy">
          <Text tag="h1" field={props.fields.Title} />
          {(isPageEditing || props.fields?.Text?.value) && <RichText field={props.fields.Text} />}
          {(isPageEditing || props.fields?.Cta1?.value?.href) && (
            <Link field={props.fields.Cta1} className="pvp-button" />
          )}
        </div>
        {tone !== 'photo' && hasImage && (
          <div className="pvp-band-icon">
            <NextImage field={props.fields.Image} />
          </div>
        )}
      </div>
    </section>
  );
};

export const PvpNavy = (props: HeroBannerProps): JSX.Element => PvpTitleBand(props, 'navy');
export const PvpGreen = (props: HeroBannerProps): JSX.Element => PvpTitleBand(props, 'green');
export const PvpPhoto = (props: HeroBannerProps): JSX.Element => PvpTitleBand(props, 'photo');
