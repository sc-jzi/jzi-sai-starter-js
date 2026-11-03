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
  Placeholder,
  NextImage,
} from "@sitecore-content-sdk/nextjs";
import useVisibility from "src/hooks/useVisibility";
import { ComponentProps } from "lib/component-props";
import { DottedAccent } from "components/non-sitecore/DottedAccent";

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Subtitle: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
  Link2: LinkField;
}

export type PromoCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component promo-cta ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-5 text-center text-lg-start">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="display-6 fw-bold mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="fs-5">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content" />

              <div className="row mt-2">
                <Placeholder name="promo-cta" rendering={props.rendering} />
              </div>

              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link
                  field={props.fields.Link}
                  className="button button-main mt-3 me-4"
                />
              )}
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link
                  field={props.fields.Link2}
                  className="button button-simple mt-3 "
                />
              )}
            </div>
          </div>
          <div className="col-md-10 mx-auto col-lg-7 mx-lg-0">
            <div className="image-wrapper">
              <DottedAccent className="dotted-accent-top" />
              <NextImage
                field={props.fields.Image}
                className={`d-block mx-lg-auto img-fluid ${
                  !isPageEditing
                    ? `fade-section ${isVisible ? "is-visible" : ""}`
                    : ""
                }`}
                width={900}
                height={900}
              />
              <DottedAccent className="dotted-accent-bottom" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithPlaceholderColumn = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component promo-cta with-placeholder-column ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container">
        <div className="row row-gap-4 main-content align-items-center">
          <div className="col-lg-5 text-center text-lg-start">
            <h6 className="eyebrow-accent">
              <Text field={props.fields.Eyebrow} />
            </h6>
            <h1 className="fs-1 fw-bold mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="promo-cta-text">
              <p className="fs-5">
                <Text field={props.fields.Subtitle} />
              </p>

              <RichText field={props.fields.Text} className="text-content" />

              {(isPageEditing || props.fields?.Link?.value?.href) && (
                <Link
                  field={props.fields.Link}
                  className="button button-main mt-3"
                />
              )}
              {(isPageEditing || props.fields?.Link2?.value?.href) && (
                <Link
                  field={props.fields.Link2}
                  className="button button-simple mt-3 mx-4"
                />
              )}
            </div>
          </div>

          <div className="col-md-12 mx-auto col-lg-7 mx-lg-0">
            <div className="row align-items-center">
              <div className="promo-cta-placeholder col-12 col-md-9">
                <div className="promo-cta-placeholder-inner">
                  <div className="row">
                    <Placeholder name="promo-cta" rendering={props.rendering} />
                  </div>
                </div>
              </div>

              <div className="image-wrapper d-none d-md-block col-md-8">
                <DottedAccent className="dotted-accent-top" />
                <NextImage
                  field={props.fields.Image}
                  className={`d-block mx-lg-auto img-fluid ${
                    !isPageEditing
                      ? `fade-section ${isVisible ? "is-visible" : ""}`
                      : ""
                  }`}
                  width={900}
                  height={900}
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

export const WithBackgroundImage = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component promo-cta with-background-image ${sxaStyles}]`}
      id={id ? id : undefined}
      style={{
        backgroundImage: `url("${props.fields.Image.value?.src}")`,
      }}
    >
      <div className="container">
        <div className="row justify-content-center main-content">
          <div className="col-12 mx-auto">
            <h1 className="display-3 fw-bold text-center mb-3">
              <Text field={props.fields.Title} />
            </h1>
            <div className="fs-3 text-center">
              <RichText field={props.fields.Text} />

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
    </div>
  );
};

/* ---------------------------------------------------------------------------------------------
 * Bobcat variants (measured from the prospect's photo-and-text bands and full-bleed heroes).
 * Split bands: eyebrow (small), uppercase headline with the Subtitle as the orange second line,
 * text, clipped orange primary button + white/orange outlined secondary, photo beside the text.
 * Background bands: full-bleed photo with the headline over a dark fade (hero), or a short
 * eyebrow + headline strip when the band has no sub-headline and no button.
 * ------------------------------------------------------------------------------------------- */

type BobcatSplitOptions = { imageLeft?: boolean; dark?: boolean };

const BobcatSplit = ({
  props,
  options,
}: {
  props: PromoCtaProps;
  options: BobcatSplitOptions;
}): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;
  // An image-left band without an eyebrow is the offers page hero: the photo fills the left half and the
  // text sits on a grey panel on the right (outlined first button, solid second one).
  const isPanel = !!options.imageLeft && !!f && !f.Eyebrow?.value;
  const modifiers = [
    options.imageLeft ? "promo-cta-bobcat--image-left" : "",
    isPanel ? "promo-cta-bobcat--panel" : "",
    options.dark ? "promo-cta-bobcat--dark" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!f) {
    return (
      <div
        className={`component promo-cta-bobcat ${modifiers} ${sxaStyles}`}
        id={id || undefined}
      >
        <div className="promo-cta-bobcat__inner">
          <span className="is-empty-hint">Promo CTA</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`component promo-cta-bobcat ${modifiers} ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="promo-cta-bobcat__band">
        <div className="promo-cta-bobcat__inner">
          <div className="promo-cta-bobcat__content">
            {(isEditing || f.Eyebrow?.value) && (
              <Text
                field={f.Eyebrow}
                tag="h2"
                className="promo-cta-bobcat__eyebrow"
              />
            )}
            {(isEditing || f.Title?.value || f.Subtitle?.value) && (
              <h2 className="promo-cta-bobcat__title">
                {(isEditing || f.Title?.value) && (
                  <Text field={f.Title} tag="span" />
                )}
                {(isEditing || f.Title?.value) &&
                  (isEditing || f.Subtitle?.value) &&
                  " "}
                {(isEditing || f.Subtitle?.value) && (
                  <Text
                    field={f.Subtitle}
                    tag="span"
                    className="promo-cta-bobcat__accent"
                  />
                )}
              </h2>
            )}
            {(isEditing || f.Text?.value) && (
              <RichText field={f.Text} className="promo-cta-bobcat__text" />
            )}
            {(isEditing || f.Link?.value?.href || f.Link2?.value?.href) && (
              <div className="promo-cta-bobcat__actions">
                {(isEditing || f.Link?.value?.href) && (
                  <Link
                    field={f.Link}
                    className={`bobcat-button${isPanel ? " bobcat-button--secondary" : ""}`}
                  />
                )}
                {(isEditing || f.Link2?.value?.href) && (
                  <Link
                    field={f.Link2}
                    className={`bobcat-button${isPanel ? "" : " bobcat-button--secondary"}`}
                  />
                )}
              </div>
            )}
          </div>
          {(isEditing || f.Image?.value?.src) && (
            <div className="promo-cta-bobcat__media">
              <NextImage
                field={f.Image}
                width={1090}
                height={726}
                className="promo-cta-bobcat__image"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* Bobcat variant: text left, photo right (Home Loader Evolution / Help Me Choose, Buyer's Guide, ...) */
export const Bobcat = (props: PromoCtaProps): JSX.Element => (
  <BobcatSplit props={props} options={{}} />
);

/* BobcatImageLeft variant: photo left, text right (Year-End Sales Event, Jobsite Awareness, offers page) */
export const BobcatImageLeft = (props: PromoCtaProps): JSX.Element => (
  <BobcatSplit props={props} options={{ imageLeft: true }} />
);

/* BobcatDark variant: the same split on the dark #333 band with white text (Home Loader Evolution) */
export const BobcatDark = (props: PromoCtaProps): JSX.Element => (
  <BobcatSplit props={props} options={{ dark: true }} />
);

/* BobcatBackgroundImage variant: full-bleed photo with the text over it (Home hero, Compact Track
   Loaders hero); without a sub-headline and a button it is the short "Models / Explore & Compare" strip. */
export const BobcatBackgroundImage = (props: PromoCtaProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  if (!f) {
    return (
      <div
        className={`component promo-cta-bobcat-bg ${sxaStyles}`}
        id={id || undefined}
      >
        <span className="is-empty-hint">Promo CTA</span>
      </div>
    );
  }

  const hasActions = !!(f.Link?.value?.href || f.Link2?.value?.href);
  // The strip shows an eyebrow and a headline only; an empty datasource renders the full hero so every field can be authored.
  const isStrip =
    !!f.Eyebrow?.value && !hasActions && !f.Subtitle?.value && !f.Text?.value;
  // With two calls to action the band is a category page header (56px title, small uppercase offer line);
  // with one it is the campaign hero (44px title, the sub-headline as a 24px second heading).
  const isPageHeader = !isStrip && !!f.Link2?.value?.href;
  const variantClass = isStrip
    ? "promo-cta-bobcat-bg--strip"
    : isPageHeader
      ? "promo-cta-bobcat-bg--page"
      : "";

  // The strip carries its photo as the band's CSS background (as on the prospect's page); in editing the
  // image field is rendered so it can be picked.
  const stripBackground =
    isStrip && !isEditing && f.Image?.value?.src
      ? {
          backgroundImage: `url("${f.Image.value.src}")`,
        }
      : undefined;

  return (
    <div
      className={`component promo-cta-bobcat-bg ${variantClass} ${sxaStyles}`}
      id={id || undefined}
      style={stripBackground}
    >
      {!stripBackground && (isEditing || f.Image?.value?.src) && (
        <div className="promo-cta-bobcat-bg__media">
          <NextImage
            field={f.Image}
            width={2400}
            height={1200}
            className="promo-cta-bobcat-bg__image"
            priority
          />
        </div>
      )}
      <div className="promo-cta-bobcat-bg__content">
        {isStrip && (
          <Text
            field={f.Eyebrow}
            tag="h2"
            className="promo-cta-bobcat-bg__eyebrow"
          />
        )}
        <Text
          field={f.Title}
          tag={isStrip ? "h2" : "h1"}
          className="promo-cta-bobcat-bg__title"
        />
        {!isStrip && (isEditing || f.Subtitle?.value) && (
          <Text
            field={f.Subtitle}
            tag={isPageHeader ? "p" : "h2"}
            className="promo-cta-bobcat-bg__subtitle"
          />
        )}
        {!isStrip && f.Text?.value && (
          <RichText field={f.Text} className="promo-cta-bobcat-bg__text" />
        )}
        {!isStrip && (isEditing || hasActions) && (
          <div className="promo-cta-bobcat-bg__actions">
            {(isEditing || f.Link?.value?.href) && (
              <Link field={f.Link} className="bobcat-button" />
            )}
            {(isEditing || f.Link2?.value?.href) && (
              <Link
                field={f.Link2}
                className="bobcat-button bobcat-button--secondary"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};
