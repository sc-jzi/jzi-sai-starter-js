"use client";

import { JSX } from "react";
import {
  Field,
  ImageField,
  LinkField,
  Link,
  Text,
  RichTextField,
  RichText,
  NextImage,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";

interface Fields {
  Image1: ImageField;
  Title1: Field<string>;
  Text1: RichTextField;
  Title2: Field<string>;
  Text2: RichTextField;
  Title3: Field<string>;
  Text3: RichTextField;
  Title4: Field<string>;
  Text4: RichTextField;
  Copyright: Field<string>;
  Link1: LinkField;
  Link2: LinkField;
  SocialsTitle: Field<string>;
  SocialLink1: LinkField;
  SocialIcon1: ImageField;
  SocialLink2: LinkField;
  SocialIcon2: ImageField;
  SocialLink3: LinkField;
  SocialIcon3: ImageField;
  // only on the demo's derived FooterBobcat template (R22 extend): the group logo and the legal paragraphs
  Logo2?: ImageField;
  LegalText?: RichTextField;
}

export type FooterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component component-spaced footer ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="content">
          <div className="logo">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={200}
              className="img-fluid"
            />
          </div>
          <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 row-gap-5 gx-5">
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title3} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text3} />
              </div>
            </div>
            <div className="col">
              <div className="title">
                <Text field={props.fields?.Title4} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text4} />
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="footnote">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithSocials = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ""}`;

  return (
    <div
      className={`component component-spaced footer with-socials ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="content">
          <div className="logo">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={200}
              className="img-fluid"
            />
          </div>
          <div className="row row-cols-1 row-cols-md-3 row-gap-5 gx-5">
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.Title1} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text1} />
              </div>
            </div>
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.Title2} />
              </div>
              <div className="links">
                <RichText field={props.fields?.Text2} />
              </div>
            </div>
            <div className="col">
              <div className="title eyebrow-accent">
                <Text field={props.fields?.SocialsTitle} />
              </div>
              <div className="links links-socials">
                <Link field={props.fields?.SocialLink1}>
                  <NextImage
                    field={props.fields?.SocialIcon1}
                    width={16}
                    height={16}
                  />
                </Link>
                <Link field={props.fields?.SocialLink2}>
                  <NextImage
                    field={props.fields?.SocialIcon2}
                    width={16}
                    height={16}
                  />
                </Link>
                <Link field={props.fields?.SocialLink3}>
                  <NextImage
                    field={props.fields?.SocialIcon3}
                    width={16}
                    height={16}
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
        <hr />
        <div className="footnote">
          <Text field={props.fields?.Copyright} />
          <div className="privacy-links">
            <Link field={props.fields?.Link1} />
            <Link field={props.fields?.Link2} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* Bobcat variant: the measured footer band (sections.json band 10). Dark #333 band: the logo with the
   social icons under it on the left, then four columns (Buying Tools, Contact Us, Legal, Region Selector),
   grey uppercase column titles over white uppercase links. A white band below holds the group logo (Logo2)
   on the left and the legal paragraphs (LegalText) with the copyright line on the right; those two fields exist
   only on the derived FooterBobcat datasource template. */
const BobcatFooterColumn = ({
  title,
  text,
  isEditing,
}: {
  title?: Field<string>;
  text?: RichTextField;
  isEditing: boolean;
}): JSX.Element | null => {
  if (!isEditing && !title?.value && !text?.value) return null;
  return (
    <div className="footer-bobcat__column">
      {(isEditing || title?.value) && (
        <Text field={title} tag="h2" className="footer-bobcat__title" />
      )}
      {(isEditing || text?.value) && (
        <RichText field={text} className="footer-bobcat__links" />
      )}
    </div>
  );
};

export const Bobcat = (props: FooterProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ""}`.trim();
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields;

  if (!f) {
    return (
      <div
        className={`component footer-bobcat ${sxaStyles}`}
        id={id || undefined}
      >
        <span className="is-empty-hint">Footer</span>
      </div>
    );
  }

  const socials = [
    { link: f.SocialLink1, icon: f.SocialIcon1 },
    { link: f.SocialLink2, icon: f.SocialIcon2 },
    { link: f.SocialLink3, icon: f.SocialIcon3 },
  ].filter((s) => isEditing || s.link?.value?.href || s.icon?.value?.src);

  return (
    <footer
      className={`component footer-bobcat ${sxaStyles}`}
      id={id || undefined}
    >
      <div className="footer-bobcat__main">
        <div className="footer-bobcat__inner">
          <div className="footer-bobcat__brand">
            {(isEditing || f.Image1?.value?.src) && (
              <div className="footer-bobcat__logo">
                <NextImage
                  field={f.Image1}
                  width={354}
                  height={48}
                  className="footer-bobcat__logo-img"
                />
              </div>
            )}
            {socials.length > 0 && (
              <div className="footer-bobcat__socials">
                {socials.map((s, i) =>
                  s.icon?.value?.src || isEditing ? (
                    <Link
                      key={i}
                      field={s.link}
                      className="footer-bobcat__social"
                      aria-label={s.link?.value?.text || undefined}
                    >
                      <NextImage field={s.icon} width={16} height={16} />
                    </Link>
                  ) : (
                    // no icon picked yet: the link shows its own text (the network's name)
                    <Link
                      key={i}
                      field={s.link}
                      className="footer-bobcat__social"
                    />
                  ),
                )}
              </div>
            )}
          </div>
          <div className="footer-bobcat__columns">
            <BobcatFooterColumn
              title={f.Title1}
              text={f.Text1}
              isEditing={isEditing}
            />
            <BobcatFooterColumn
              title={f.Title2}
              text={f.Text2}
              isEditing={isEditing}
            />
            <BobcatFooterColumn
              title={f.Title3}
              text={f.Text3}
              isEditing={isEditing}
            />
            <BobcatFooterColumn
              title={f.Title4}
              text={f.Text4}
              isEditing={isEditing}
            />
          </div>
        </div>
      </div>
      {(isEditing ||
        f.Copyright?.value ||
        f.LegalText?.value ||
        f.Logo2?.value?.src ||
        f.Link1?.value?.href ||
        f.Link2?.value?.href) && (
        <div className="footer-bobcat__legal">
          <div className="footer-bobcat__inner footer-bobcat__inner--legal">
            {((isEditing && f.Logo2) || f.Logo2?.value?.src) && (
              <div className="footer-bobcat__group-logo">
                <NextImage
                  field={f.Logo2}
                  width={219}
                  height={70}
                  className="footer-bobcat__group-logo-img"
                />
              </div>
            )}
            <div className="footer-bobcat__legal-body">
              {((isEditing && f.LegalText) || f.LegalText?.value) && (
                <RichText
                  field={f.LegalText}
                  className="footer-bobcat__legal-text"
                />
              )}
              {(isEditing || f.Copyright?.value) && (
                <Text
                  field={f.Copyright}
                  tag="p"
                  className="footer-bobcat__copyright"
                />
              )}
              {(isEditing || f.Link1?.value?.href || f.Link2?.value?.href) && (
                <div className="footer-bobcat__legal-links">
                  {(isEditing || f.Link1?.value?.href) && (
                    <Link field={f.Link1} />
                  )}
                  {(isEditing || f.Link2?.value?.href) && (
                    <Link field={f.Link2} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
