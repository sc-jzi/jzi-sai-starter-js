"use client";

import { JSX } from "react";
import {
  Field,
  Text,
  Link,
  LinkField,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import Head from "next/head";

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
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component heading-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
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
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component heading-cta compact ${sxaStyles}`}
      id={id ? id : undefined}
    >
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
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Text.value} />
        <meta property="og:name" content={props.fields?.Heading?.value} />
        <meta property="og:title" content={props.fields?.Heading?.value} />
        <meta property="og:type" content="page" />
      </Head>
      <div
        className={`component heading-cta ${sxaStyles}`}
        id={id ? id : undefined}
      >
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
                <Link
                  field={props.fields.Link}
                  className="button button-main"
                />
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
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component heading-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
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

/* ---------------------------------------------------------------------------------------------
 * Bobcat variants. Section headings on the prospect's pages are centred: small eyebrow (24px),
 * headline (36-44px), a 640px text column and, when there is one, an orange uppercase text link
 * with an arrow. BobcatPageTitle is the left-aligned page title (56px/84) with an optional intro line.
 * ------------------------------------------------------------------------------------------- */

const BobcatHeading = ({
  props,
  dark,
}: {
  props: HeadingCtaProps;
  dark?: boolean;
}): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  return (
    <div
      className={`component heading-cta-bobcat ${dark ? "heading-cta-bobcat--dark" : ""} ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="heading-cta-bobcat__inner">
        {f ? (
          <>
            {(isEditing || f.Eyebrow?.value) && (
              <Text
                field={f.Eyebrow}
                tag="h2"
                className="heading-cta-bobcat__eyebrow"
              />
            )}
            {(isEditing || f.Heading?.value) && (
              <Text
                field={f.Heading}
                tag="h2"
                className="heading-cta-bobcat__title"
              />
            )}
            {(isEditing || f.Text?.value) && (
              <Text
                field={f.Text}
                tag="p"
                className="heading-cta-bobcat__text"
              />
            )}
            {(isEditing || f.Link?.value?.href) && (
              <div className="heading-cta-bobcat__actions">
                <Link
                  field={f.Link}
                  className="bobcat-arrow-link heading-cta-bobcat__link"
                />
              </div>
            )}
          </>
        ) : (
          <span className="is-empty-hint">Heading CTA</span>
        )}
      </div>
    </div>
  );
};

/* Bobcat variant: centred section heading (2026 Year-End Sales Event, Sizes of Loaders, ...) */
export const Bobcat = (props: HeadingCtaProps): JSX.Element => (
  <BobcatHeading props={props} />
);

/* BobcatDark variant: the same heading on the dark #333 band with white text (Home "Bobcat Company") */
export const BobcatDark = (props: HeadingCtaProps): JSX.Element => (
  <BobcatHeading props={props} dark />
);

/* BobcatPageTitle variant: left-aligned page title, the intro line only when it has text */
export const BobcatPageTitle = (props: HeadingCtaProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  return (
    <>
      {f?.Heading?.value && (
        <Head>
          <meta property="og:title" content={f.Heading.value} />
        </Head>
      )}
      <div
        className={`component heading-cta-bobcat-title ${sxaStyles}`}
        id={id || undefined}
      >
        <div className="heading-cta-bobcat-title__inner">
          {f ? (
            <>
              <Text
                field={f.Heading}
                tag="h1"
                className="heading-cta-bobcat-title__title"
              />
              {f.Text?.value && (
                <Text
                  field={f.Text}
                  tag="p"
                  className="heading-cta-bobcat-title__text"
                />
              )}
            </>
          ) : (
            <span className="is-empty-hint">Page title</span>
          )}
        </div>
      </div>
    </>
  );
};
