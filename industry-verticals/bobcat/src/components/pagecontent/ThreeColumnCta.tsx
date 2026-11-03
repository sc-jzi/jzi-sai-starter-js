"use client";

import { JSX } from "react";
import {
  Field,
  ImageField,
  Text,
  LinkField,
  Link,
  useSitecore,
  NextImage,
} from "@sitecore-content-sdk/nextjs";
import useVisibility from "src/hooks/useVisibility";

interface Fields {
  Text1: Field<string>;
  SubText1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Text2: Field<string>;
  SubText2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Text3: Field<string>;
  SubText3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
}

export type ThreeColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : "button-main";

    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? "is-visible" : ""}` : ""
        } `}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={400} height={400} />
          <h2>
            <Text field={text} />
          </h2>
          <p>
            <Text field={subText} />
          </p>
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIcons = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? "is-visible" : ""}` : ""
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="image-wrapper mb-5">
              <NextImage field={image} width={32} height={32} />
            </div>
            <h2>
              <Text field={text} />
            </h2>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIconsCompact = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? "is-visible" : ""}` : ""
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="image-wrapper">
                <NextImage field={image} width={32} height={32} />
              </div>
              <h2 className="eyebrow-accent mb-0 mt-2">
                <Text field={text} />
              </h2>
            </div>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons with-icons-compact ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

/* Bobcat variant: three white cards with a soft shadow (Buying Tools "Build & Quote" / "Contact a Dealer"):
   icon picture 351x234 on top, 44px title, 16/24 text and an orange text link with an arrow at the bottom. */
type BobcatColumnProps = {
  image?: ImageField;
  text?: Field<string>;
  subText?: Field<string>;
  link?: LinkField;
  isEditing: boolean;
};

const BobcatColumn = ({
  image,
  text,
  subText,
  link,
  isEditing,
}: BobcatColumnProps): JSX.Element | null => {
  const hasContent = !!(
    image?.value?.src ||
    text?.value ||
    subText?.value ||
    link?.value?.href
  );
  if (!isEditing && !hasContent) return null;

  return (
    <div className="three-column-cta-bobcat__card">
      {(isEditing || image?.value?.src) && (
        <div className="three-column-cta-bobcat__media">
          <NextImage
            field={image}
            width={702}
            height={468}
            className="three-column-cta-bobcat__image"
          />
        </div>
      )}
      <div className="three-column-cta-bobcat__body">
        {(isEditing || text?.value) && (
          <Text
            field={text}
            tag="h2"
            className="three-column-cta-bobcat__title"
          />
        )}
        {(isEditing || subText?.value) && (
          <Text
            field={subText}
            tag="p"
            className="three-column-cta-bobcat__text"
          />
        )}
        {(isEditing || link?.value?.href) && (
          <div className="three-column-cta-bobcat__actions">
            <Link
              field={link as LinkField}
              className="bobcat-arrow-link bobcat-card-link"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Bobcat = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const f = props.fields;

  return (
    <div
      className={`component three-column-cta-bobcat ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="three-column-cta-bobcat__grid">
        {f ? (
          <>
            <BobcatColumn
              image={f.Image1}
              text={f.Text1}
              subText={f.SubText1}
              link={f.Link1}
              isEditing={isEditing}
            />
            <BobcatColumn
              image={f.Image2}
              text={f.Text2}
              subText={f.SubText2}
              link={f.Link2}
              isEditing={isEditing}
            />
            <BobcatColumn
              image={f.Image3}
              text={f.Text3}
              subText={f.SubText3}
              link={f.Link3}
              isEditing={isEditing}
            />
          </>
        ) : (
          <span className="is-empty-hint">Three Column CTA</span>
        )}
      </div>
    </div>
  );
};
