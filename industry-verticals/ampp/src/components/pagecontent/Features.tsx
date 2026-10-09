'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  RichText,
  RichTextField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Eyebrow: Field<string>;
  Text: RichTextField;
  Link: LinkField;
  Image1: ImageField;
  Title1: Field<string>;
  Text1: Field<string>;
  Title2: Field<string>;
  Text2: Field<string>;
}

export type FeaturesProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FeaturesProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component features component-spaced ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="info">
          <div className="eyebrow-accent">
            <Text field={props.fields?.Eyebrow} />
          </div>
          <div className="tagline">
            <RichText field={props.fields?.Text} />
          </div>
          <div className="button button-main">
            <Link field={props.fields?.Link} />
          </div>
        </div>
        <div className="items">
          <div className="item left">
            <div className="icon">
              <NextImage field={props.fields?.Image1} width={32} height={32} />
            </div>
            <div className="title">
              <Text field={props.fields?.Title1} />
            </div>
            <p className="subtitle">
              <Text field={props.fields?.Text1} />
            </p>
          </div>
          <div className="item right">
            <div className="title">
              <Text field={props.fields?.Title2} />
            </div>
            <p className="subtitle">
              <Text field={props.fields?.Text2} />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* AMPP variant: conference story with copy, portrait, and two supporting points */
export const ConferenceContent = (props: FeaturesProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return (
      <div className="component features variant-conference-content">
        <span className="is-empty-hint">Features</span>
      </div>
    );
  }

  return (
    <div
      className={`component features variant-conference-content ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="conference-content-layout">
          <div className="conference-content-copy">
            {(isPageEditing || props.fields.Eyebrow?.value) && (
              <p className="eyebrow-accent">
                <Text field={props.fields.Eyebrow} />
              </p>
            )}
            {(isPageEditing || props.fields.Text?.value) && <RichText field={props.fields.Text} />}
            {(isPageEditing || props.fields.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
          {(isPageEditing || props.fields.Image1?.value?.src) && (
            <div className="conference-content-media">
              <NextImage field={props.fields.Image1} width={560} height={420} />
              {(isPageEditing || props.fields.Title2?.value) && (
                <p className="conference-content-caption">
                  <Text field={props.fields.Title2} />
                </p>
              )}
            </div>
          )}
        </div>
        <div className="row row-gap-4 conference-content-points">
          <div className="col-md-6">
            <h2>
              <Text field={props.fields.Title1} />
            </h2>
            {(isPageEditing || props.fields.Text1?.value) && (
              <p>
                <Text field={props.fields.Text1} />
              </p>
            )}
          </div>
          <div className="col-md-6">
            {(isPageEditing || props.fields.Text2?.value) && (
              <p>
                <Text field={props.fields.Text2} />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
