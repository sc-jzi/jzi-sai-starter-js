'use client';

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

const HeadingCtaEmpty = (): JSX.Element => (
  <div className="component heading-cta">
    <div className="component-content">
      <span className="is-empty-hint">Heading CTA</span>
    </div>
  </div>
);

/* OINewsletter — gold-outlined subscribe card */
export const OINewsletter = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <HeadingCtaEmpty />;
  }

  return (
    <div
      className={`component heading-cta oi-brand oi-newsletter bg-[var(--brand-bg)] py-16 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="mx-auto max-w-3xl rounded-[var(--brand-radius)] border border-[var(--brand-primary)] px-8 py-12 text-center md:px-16">
          <Text
            field={props.fields?.Heading}
            tag="h2"
            className="m-0 text-[2.25rem] font-semibold text-[var(--brand-fg)]"
          />
          {(props.fields?.Text?.value || isPageEditing) && (
            <Text
              field={props.fields?.Text}
              tag="p"
              className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-[var(--brand-muted-fg)]"
            />
          )}
          <form
            className="mx-auto mt-8 flex max-w-lg flex-col gap-3 sm:flex-row sm:items-center"
            onSubmit={(event) => event.preventDefault()}
          >
            <label htmlFor="oi-newsletter-email" className="sr-only">
              Email
            </label>
            <input
              id="oi-newsletter-email"
              type="email"
              placeholder="Email"
              className="min-h-11 flex-1 rounded-[var(--brand-button-radius)] border border-[var(--brand-border)] bg-transparent px-5 text-sm text-[var(--brand-fg)] outline-none placeholder:text-[var(--brand-muted-fg)]"
            />
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link
                field={props.fields.Link}
                className="inline-flex min-h-11 items-center justify-center rounded-[var(--brand-button-radius)] bg-[var(--brand-primary)] px-8 text-sm font-bold text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
              />
            )}
          </form>
        </div>
      </div>
    </div>
  );
};
