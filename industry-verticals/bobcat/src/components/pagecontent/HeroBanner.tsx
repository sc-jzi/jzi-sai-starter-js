"use client";

import { JSX } from "react";
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
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { IconAccent } from "components/non-sitecore/IconAccent";
import { DottedAccent } from "components/non-sitecore/DottedAccent";

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
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component hero-banner ${sxaStyles}`}
      id={id ? id : undefined}
    >
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
                <Link
                  field={props.fields.Cta1}
                  className="button button-main"
                />
              )}
              {(isPageEditing || props.fields?.Cta2?.value?.href) && (
                <Link
                  field={props.fields.Cta2}
                  className="button button-simple mx-4"
                />
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

/* Bobcat variant: centred band on light grey (Compact Track Loaders "Two paths. Classic or Pro."):
   eyebrow, uppercase headline, 640px rich text (its h4 titles are the Classic / Pro points), the product
   photo, then the two calls to action as orange uppercase text links with an arrow. No icon accent.
   Outside editing (--flow) the rich text's first paragraph is the intro and the photo sits between it and the
   Classic / Pro points, as on the prospect's page (CSS order only; the field is rendered unchanged). */
export const Bobcat = (props: HeroBannerProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  return (
    <div
      className={`component hero-banner-bobcat ${isEditing ? "" : "hero-banner-bobcat--flow"} ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="hero-banner-bobcat__inner">
        {f ? (
          <>
            {(isEditing || f.Tagline?.value) && (
              <Text
                field={f.Tagline}
                tag="h2"
                className="hero-banner-bobcat__eyebrow"
              />
            )}
            {(isEditing || f.Title?.value) && (
              <Text
                field={f.Title}
                tag="h2"
                className="hero-banner-bobcat__title"
              />
            )}
            {(isEditing || f.Text?.value) && (
              <RichText field={f.Text} className="hero-banner-bobcat__text" />
            )}
            {(isEditing || f.Image?.value?.src) && (
              <div className="hero-banner-bobcat__media">
                <NextImage
                  field={f.Image}
                  width={830}
                  height={554}
                  className="hero-banner-bobcat__image"
                />
              </div>
            )}
            {(isEditing || f.Cta1?.value?.href || f.Cta2?.value?.href) && (
              <div className="hero-banner-bobcat__actions">
                {(isEditing || f.Cta1?.value?.href) && (
                  <Link
                    field={f.Cta1}
                    className="bobcat-arrow-link hero-banner-bobcat__link hero-banner-bobcat__cta"
                  />
                )}
                {(isEditing || f.Cta2?.value?.href) && (
                  <Link
                    field={f.Cta2}
                    className="bobcat-arrow-link hero-banner-bobcat__link hero-banner-bobcat__cta"
                  />
                )}
              </div>
            )}
          </>
        ) : (
          <span className="is-empty-hint">Hero Banner</span>
        )}
      </div>
    </div>
  );
};
