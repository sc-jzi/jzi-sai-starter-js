'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link,
  Text,
  RichTextField,
  RichText,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

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
  SocialLink4?: LinkField;
  SocialIcon4?: ImageField;
}

export type FooterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component component-spaced footer ${sxaStyles}`} id={id ? id : undefined}>
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
  const sxaStyles = `${props.params?.styles || ''}`;

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
                  <NextImage field={props.fields?.SocialIcon1} width={16} height={16} />
                </Link>
                <Link field={props.fields?.SocialLink2}>
                  <NextImage field={props.fields?.SocialIcon2} width={16} height={16} />
                </Link>
                <Link field={props.fields?.SocialLink3}>
                  <NextImage field={props.fields?.SocialIcon3} width={16} height={16} />
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

/* Iml: logo, social icons, four link columns on a blue-grey panel with a rounded bottom-right corner, legal links below */
export const Iml = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns: [Field<string>, RichTextField][] = [
    [props.fields?.Title1, props.fields?.Text1],
    [props.fields?.Title2, props.fields?.Text2],
    [props.fields?.Title3, props.fields?.Text3],
    [props.fields?.Title4, props.fields?.Text4],
  ];
  const socials: [LinkField, ImageField][] = [
    [props.fields?.SocialLink1, props.fields?.SocialIcon1],
    [props.fields?.SocialLink2, props.fields?.SocialIcon2],
    [props.fields?.SocialLink3, props.fields?.SocialIcon3],
    [props.fields?.SocialLink4 as LinkField, props.fields?.SocialIcon4 as ImageField],
  ];

  return (
    <div className={`component footer iml-footer ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-footer__panel">
        <div className="iml-container iml-footer__row">
          <div className="iml-footer__brand">
            <NextImage
              field={props.fields?.Image1}
              width={200}
              height={47}
              className="iml-footer__logo"
              unoptimized
            />
            <div className="iml-footer__socials">
              {socials.map(([link, icon], k) =>
                link?.value?.href ? (
                  <Link key={k} field={link} aria-label={String(link.value.text ?? '')}>
                    <NextImage field={icon} width={20} height={20} unoptimized />
                  </Link>
                ) : null
              )}
            </div>
            {/* Hardcoded language selector, as on the live site; the demo site is English only (not editable in the CMS) */}
            <button type="button" className="iml-footer__language" aria-label="Language">
              English
              <svg viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
                <path d="M1 1l5 5 5-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          {columns.map(([title, text], k) => (
            <div className="iml-footer__col" key={k}>
              <h3 className="iml-footer__title">
                <Text field={title} />
              </h3>
              <RichText field={text} className="iml-footer__links" />
            </div>
          ))}
        </div>
      </div>
      <div className="iml-container iml-footer__legal">
        <Text field={props.fields?.Copyright} />
        <Link field={props.fields?.Link1} />
        <Link field={props.fields?.Link2} />
      </div>
    </div>
  );
};
