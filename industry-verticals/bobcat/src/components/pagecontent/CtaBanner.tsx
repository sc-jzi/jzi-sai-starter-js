"use client";

import { JSX } from "react";
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  Link,
  LinkField,
  useSitecore,
  NextImage,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { DottedAccent } from "components/non-sitecore/DottedAccent";
import { IconAccent } from "components/non-sitecore/IconAccent";
import useVisibility from "src/hooks/useVisibility";

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Text: RichTextField;
  Link: LinkField;
  Image: ImageField;
  Icon: ImageField;
}

export type CtaBannerProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component cta-banner component-spaced ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container container-widest-fluid">
        <div className="container">
          <div className="row row-gap-4 main-content align-items-center">
            <div className="col-lg-6">
              <IconAccent image={props.fields.Icon} inverted />
              <div className="content-wrapper">
                <h6 className="eyebrow-accent">
                  <Text field={props.fields.Eyebrow} />
                </h6>
                <h1 className="display-4 fw-bold mb-3">
                  <Text field={props.fields.Title} />
                </h1>
                <div className="fs-5">
                  <RichText
                    field={props.fields.Text}
                    className="text-content"
                  />

                  {(isPageEditing || props.fields?.Link?.value?.href) && (
                    <Link
                      field={props.fields.Link}
                      className="button button-main mt-3"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-10 mx-auto col-lg-6 mx-lg-0">
              <div className="image-wrapper">
                <DottedAccent className="dotted-accent-top" />
                <NextImage
                  field={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing
                      ? `fade-section ${isVisible ? "is-visible" : ""}`
                      : ""
                  }`}
                  width={800}
                  height={800}
                />
                <DottedAccent className="dotted-accent-bottom" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const LargeImage = (props: CtaBannerProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component cta-banner component-spaced with-large-image with-dotted-accents ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container container-widest-fluid">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-6">
            <div className="content-column">
              <IconAccent image={props.fields.Icon} inverted />
              <div className="content-wrapper">
                <h6 className="eyebrow-accent">
                  <Text field={props.fields.Eyebrow} />
                </h6>
                <h1 className="display-4 fw-bold mb-3">
                  <Text field={props.fields.Title} />
                </h1>
                <div className="fs-5">
                  <RichText
                    field={props.fields.Text}
                    className="text-content"
                  />

                  {(isPageEditing || props.fields?.Link?.value?.href) && (
                    <Link
                      field={props.fields.Link}
                      className="button button-main mt-3"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-10 mx-auto col-lg-6 mx-lg-0">
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className={`d-block mx-lg-auto img-fluid ${
                  !isPageEditing
                    ? `fade-section ${isVisible ? "is-visible" : ""}`
                    : ""
                }`}
                width={850}
                height={850}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Bobcat variant: the Buying Tools "Apply for Financing" tile: one white card (351px, soft shadow) in the
   card grid, the Eyebrow as the orange "NEW" badge on its top-left corner, the picture on top, then the
   44px title, text and an orange text link with an arrow. */
export const Bobcat = (props: CtaBannerProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  return (
    <div
      className={`component cta-banner-bobcat ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="cta-banner-bobcat__grid">
        {f ? (
          <div className="cta-banner-bobcat__card">
            {/* As on the prospect: the whole card is one link whose (visually hidden) text is the card title. */}
            {!isEditing && f.Title?.value && f.Link?.value?.href && (
              <Link
                field={f.Link}
                editable={false}
                className="cta-banner-bobcat__stretched"
              >
                <Text field={f.Title} tag="h2" editable={false} />
              </Link>
            )}
            {(isEditing || f.Image?.value?.src) && (
              <div className="cta-banner-bobcat__media">
                <NextImage
                  field={f.Image}
                  width={702}
                  height={468}
                  className="cta-banner-bobcat__image"
                />
              </div>
            )}
            {(isEditing || f.Eyebrow?.value) && (
              <Text
                field={f.Eyebrow}
                tag="span"
                className="cta-banner-bobcat__badge"
              />
            )}
            <div className="cta-banner-bobcat__body">
              {(isEditing || f.Title?.value) && (
                <Text
                  field={f.Title}
                  tag="h2"
                  className="cta-banner-bobcat__title"
                />
              )}
              {(isEditing || f.Text?.value) && (
                <RichText field={f.Text} className="cta-banner-bobcat__text" />
              )}
              {(isEditing || f.Link?.value?.href) && (
                <div className="cta-banner-bobcat__actions">
                  <Link
                    field={f.Link}
                    className="bobcat-arrow-link bobcat-card-link"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <span className="is-empty-hint">CTA Banner</span>
        )}
      </div>
    </div>
  );
};
