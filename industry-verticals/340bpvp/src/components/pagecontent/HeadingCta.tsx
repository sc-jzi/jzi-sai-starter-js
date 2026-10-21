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
              <h6 className="eyebrow-accent">
                <Text field={props.fields?.Eyebrow} />
              </h6>
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
              <h6 className="eyebrow-accent">
                <Text field={props.fields?.Eyebrow} />
              </h6>
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
                <h6 className="eyebrow-accent">
                  <Text field={props.fields?.Eyebrow} />
                </h6>
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
          <h6 className="eyebrow-accent">
            <Text field={props.fields?.Eyebrow} />
          </h6>
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

const PvpHeading = (props: HeadingCtaProps, look: 'band' | 'steps' | 'title'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const lookClass = look === 'band' ? '' : ` variant-pvp-${look}`;

  return (
    <div className={`component heading-cta variant-pvp${lookClass} ${sxaStyles}`} id={id ? id : undefined}>
      {look !== 'title' && <Text tag="p" className="pvp-eyebrow" field={props.fields?.Eyebrow} />}
      <Text tag={look === 'title' ? 'h1' : 'h2'} field={props.fields?.Heading} />
      {look !== 'title' && <Text tag="p" field={props.fields?.Text} />}
      {look !== 'title' && (isPageEditing || props.fields?.Link?.value?.href) && (
        <Link field={props.fields.Link} className="pvp-button" />
      )}
    </div>
  );
};

const PvpCtaBand = (props: HeadingCtaProps, tone: 'green' | 'cyan'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component heading-cta variant-pvp-cta variant-pvp-cta-${tone} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="pvp-cta-inner">
        <div className="pvp-cta-copy">
          <Text tag="h2" field={props.fields?.Heading} />
          <Text tag="p" field={props.fields?.Text} />
        </div>
        {(isPageEditing || props.fields?.Link?.value?.href) && (
          <Link field={props.fields.Link} className="pvp-cta-button" />
        )}
      </div>
    </div>
  );
};

export const Pvp = (props: HeadingCtaProps): JSX.Element => PvpHeading(props, 'band');
export const PvpSteps = (props: HeadingCtaProps): JSX.Element => PvpHeading(props, 'steps');
export const PvpPageTitle = (props: HeadingCtaProps): JSX.Element => PvpHeading(props, 'title');
export const PvpCtaGreen = (props: HeadingCtaProps): JSX.Element => PvpCtaBand(props, 'green');
export const PvpCtaCyan = (props: HeadingCtaProps): JSX.Element => PvpCtaBand(props, 'cyan');
