'use client';

import { JSX } from 'react';
import { Field, Text, Link, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import Head from 'next/head';

interface Fields {
  Eyebrow: Field<string>;
  Heading: Field<string>;
  Text: Field<string>;
  Link: LinkField;
}

export type HeadingCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row gx-5">
          <div className="col">
            <div className="heading-content-wrapper">
              {props.fields?.Eyebrow?.value && (
                <p className="eyebrow-accent">
                  <Text field={props.fields?.Eyebrow} />
                </p>
              )}
              <h2 className="display-4 fw-bold">
                <Text field={props.fields?.Heading} />
              </h2>
              <p>
                <Text field={props.fields?.Text} />
              </p>
            </div>
          </div>
          <div className="col-12 pt-lg-5 col-lg-auto">
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const Compact = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta compact ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <div className="col">
            <div className="heading-content-wrapper">
              {props.fields?.Eyebrow?.value && (
                <p className="eyebrow-accent">
                  <Text field={props.fields?.Eyebrow} />
                </p>
              )}
              <h2 className="display-6 fw-bold">
                <Text field={props.fields?.Heading} />
              </h2>
              <p>
                <Text field={props.fields?.Text} />
              </p>
            </div>
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PageHeading = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Text.value} />
        <meta property="og:name" content={props.fields?.Heading?.value} />
        <meta property="og:title" content={props.fields?.Heading?.value} />
        <meta property="og:type" content="page" />
      </Head>
      <div className={`component heading-cta ${sxaStyles}`} id={id ? id : undefined}>
        <div className="container container-wide">
          <div className="row gx-5">
            <div className="col">
              <div className="heading-content-wrapper">
                {props.fields?.Eyebrow?.value && (
                  <p className="eyebrow-accent">
                    <Text field={props.fields?.Eyebrow} />
                  </p>
                )}
                <h1 className="display-1 fw-bold">
                  <Text field={props.fields?.Heading} />
                </h1>
                <p>
                  <Text field={props.fields?.Text} />
                </p>
              </div>
            </div>
            <div className="col-12 pt-lg-5 col-lg-auto">
              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link field={props.fields.Link} className="button button-main" />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const Centered = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="heading-content-wrapper mx-auto text-center">
          {props.fields?.Eyebrow?.value && (
            <p className="eyebrow-accent">
              <Text field={props.fields?.Eyebrow} />
            </p>
          )}
          <h2 className="display-4 fw-bold">
            <Text field={props.fields?.Heading} />
          </h2>
          <p>
            <Text field={props.fields?.Text} />
          </p>
          {(isPageEditing || props.fields?.Link?.value?.href) && (
            <Link field={props.fields.Link} className="button button-main" />
          )}
        </div>
      </div>
    </div>
  );
};

export const MccLabel = (props: HeadingCtaProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

export const MccLabelPageTitle = (props: HeadingCtaProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-page-title">
    <Default {...props} />
  </section>
);

// Section title: the heading across the full width; an intro (Text) beside it and a link only when they have content
export const MccLabelSectionTitle = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const hasText = !!props.fields?.Text?.value;
  const hasLink = !!props.fields?.Link?.value?.href;

  return (
    <section className="variant-mcc-label mcc-label-section-title">
      <div className={`component heading-cta ${props.params?.styles || ''}`} id={id ? id : undefined}>
        <div className={`container section-title-layout${hasText ? ' with-text' : ''}`}>
          <h2>
            <Text field={props.fields?.Heading} />
          </h2>
          {hasText && (
            <p className="section-title-text">
              <Text field={props.fields.Text} />
            </p>
          )}
          {hasLink && <Link field={props.fields.Link} className="button button-main" />}
        </div>
      </div>
    </section>
  );
};

export const MccLabelGreenBar = (props: HeadingCtaProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-green-bar">
    <Default {...props} />
  </section>
);

export const MccLabelCtaBand = (props: HeadingCtaProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-cta-band">
    <Default {...props} />
  </section>
);
