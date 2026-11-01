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

/* Iml: centered heading block in the IML type scale */
export const Iml = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta iml-heading ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-container iml-heading__inner">
        {(isPageEditing || props.fields?.Eyebrow?.value) && (
          <p className="iml-eyebrow">
            <Text field={props.fields.Eyebrow} />
          </p>
        )}
        {(isPageEditing || props.fields?.Heading?.value) && (
          <h2 className="iml-section-title">
            <Text field={props.fields.Heading} />
          </h2>
        )}
        {(isPageEditing || props.fields?.Text?.value) && (
          <p className="iml-heading__text">
            <Text field={props.fields.Text} />
          </p>
        )}
        {(isPageEditing || props.fields?.Link?.value?.href) && (
          <Link field={props.fields.Link} className="iml-btn iml-btn--primary" />
        )}
      </div>
    </div>
  );
};

/* ImlStatement: one large centered statement paragraph with outlined decorative shapes (drawn in CSS) */
export const ImlStatement = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta iml-statement ${sxaStyles}`} id={id ? id : undefined}>
      <span className="iml-statement__shape iml-statement__shape--top" aria-hidden="true" />
      <span className="iml-statement__shape iml-statement__shape--bottom" aria-hidden="true" />
      <div className="iml-container iml-statement__inner">
        {(isPageEditing || props.fields?.Heading?.value) && (
          <h2 className="iml-section-title">
            <Text field={props.fields.Heading} />
          </h2>
        )}
        <p className="iml-statement__text">
          <Text field={props.fields?.Text} />
        </p>
      </div>
    </div>
  );
};

/* ImlSocial: one centered line with the Instagram and LinkedIn icons of the live site.
   The icons and their URLs are drawn by the variant (not editable in the CMS), as listed in the plan. */
export const ImlSocial = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta iml-social ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-container iml-social__inner">
        <h2 className="iml-social__title">
          <Text field={props.fields?.Heading} />
        </h2>
        <div className="iml-social__icons">
          <a
            href="https://www.instagram.com/mcc.verstraete"
            target="_blank"
            rel="noreferrer"
            aria-label="Instagram"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="17.6" cy="6.4" r="1.3" fill="currentColor" />
            </svg>
          </a>
          <a
            href="https://www.linkedin.com/company/mcc-verstraete"
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true">
              <rect x="1" y="1" width="22" height="22" rx="2" fill="currentColor" />
              <rect x="5" y="9.5" width="3" height="9" fill="#fff" />
              <circle cx="6.5" cy="6.3" r="1.7" fill="#fff" />
              <path
                d="M10.5 9.5h2.9v1.3c.5-.9 1.6-1.5 2.9-1.5 2.4 0 3.2 1.5 3.2 4v5.2h-3v-4.6c0-1.1-.2-2-1.4-2s-1.6.9-1.6 2v4.6h-3z"
                fill="#fff"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ImlPageTitle: title-only placeholder page heading (stub pages) */
export const ImlPageTitle = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component heading-cta iml-page-title ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-container">
        <h1 className="iml-page-title__title">
          <Text field={props.fields?.Heading} />
        </h1>
      </div>
    </div>
  );
};
