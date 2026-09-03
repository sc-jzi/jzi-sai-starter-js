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

/* Walden variant — left mission copy, right stacked icon highlights */
export const Walden = (props: FeaturesProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component features walden-features ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row g-5 align-items-start">
          <div className="col-lg-6">
            <h2 className="walden-features__heading">
              <Text field={props.fields?.Eyebrow} />
            </h2>
            <div className="walden-features__copy">
              <RichText field={props.fields?.Text} />
            </div>
            <Link field={props.fields?.Link} className="walden-link-arrow" />
          </div>
          <div className="col-lg-6">
            <div className="walden-features__item">
              <div className="walden-features__icon">
                <NextImage field={props.fields?.Image1} width={32} height={32} />
              </div>
              <div>
                <div className="walden-features__item-title">
                  <Text field={props.fields?.Title1} />
                </div>
                <p>
                  <Text field={props.fields?.Text1} />
                </p>
              </div>
            </div>
            <div className="walden-features__item">
              <div className="walden-features__icon">
                <svg viewBox="0 0 32 32" fill="none" aria-hidden>
                  <path d="M6 22c4-6 16-6 20 0" stroke="currentColor" strokeWidth="2" />
                  <path d="M16 6v10" stroke="currentColor" strokeWidth="2" />
                  <circle cx="16" cy="20" r="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <div className="walden-features__item-title">
                  <Text field={props.fields?.Title2} />
                </div>
                <p>
                  <Text field={props.fields?.Text2} />
                </p>
              </div>
            </div>
            <div className="walden-features__item">
              <div className="walden-features__icon">
                <svg viewBox="0 0 32 32" fill="none" aria-hidden>
                  <rect x="6" y="8" width="20" height="16" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 14h12M10 18h8" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <div className="walden-features__item-title">Certificates &amp; Credentials</div>
                <p>Earn industry-recognized certificates, including new AI credentials with Google Cloud.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
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
