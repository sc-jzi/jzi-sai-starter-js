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

const HEADING_ONLY = new Set([
  'page-title',
  'title-banner',
  'title-banner-navy',
  'title-banner-green',
  'section-heading',
]);

const ApexusHeadingCta = ({
  props,
  look,
}: {
  props: HeadingCtaProps;
  look:
    | 'intro'
    | 'green-band'
    | 'cyan-band'
    | 'page-title'
    | 'title-banner'
    | 'title-banner-navy'
    | 'title-banner-green'
    | 'section-heading';
}): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const headingOnly = HEADING_ONLY.has(look);

  return (
    <div
      className={`component heading-cta variant-apexus apexus-${look} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="apexus-heading-cta-inner">
        {(isPageEditing || props.fields?.Heading?.value) && (
          <Text
            tag={look === 'intro' || look === 'page-title' ? 'h1' : 'h2'}
            field={props.fields?.Heading}
            className="apexus-heading"
          />
        )}
        {!headingOnly && (isPageEditing || props.fields?.Text?.value) && (
          <Text tag="p" field={props.fields?.Text} className="apexus-text" />
        )}
        {!headingOnly && (isPageEditing || props.fields?.Link?.value?.href) && (
          <Link field={props.fields.Link} className="apexus-button" />
        )}
      </div>
    </div>
  );
};

/* Apexus variant: centered intro (page title and/or paragraph) with a blue square button */
export const Apexus = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="intro" />
);

/* Apexus variant: one centered white line on the green band with a white-outlined WATCH NOW button */
export const ApexusGreenBand = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="green-band" />
);

/* Apexus variant: cyan band, white centered heading and text, outlined white button */
export const ApexusCyanBand = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="cyan-band" />
);

/* Heading only. Menu stubs use this so Pages never shows empty Text or Link chrome. */
export const ApexusPageTitle = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="page-title" />
);

/* Colored title banners from the live refund and article pages. Heading only. */
export const ApexusTitleBanner = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="title-banner" />
);
export const ApexusTitleBannerNavy = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="title-banner-navy" />
);
export const ApexusTitleBannerGreen = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="title-banner-green" />
);

/* Section title with no button, used above stats and closing lines. */
export const ApexusSectionHeading = (props: HeadingCtaProps): JSX.Element => (
  <ApexusHeadingCta props={props} look="section-heading" />
);
