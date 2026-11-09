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
  /* FooterCeros (derived template, read by the Ceros variant only) */
  Title5?: Field<string>;
  Text5?: RichTextField;
  LegalLinks?: RichTextField;
  Badge1?: ImageField;
  Badge2?: ImageField;
  Badge3?: ImageField;
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

/* Ceros variant: logo, socials and partner badges on the left; five link columns in a two-column grid; legal row underneath (ceros.com footer) */
export const Ceros = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const f = props.fields;
  const columns: [Field<string> | undefined, RichTextField | undefined][] = [
    [f?.Title1, f?.Text1],
    [f?.Title2, f?.Text2],
    [f?.Title3, f?.Text3],
    [f?.Title4, f?.Text4],
    [f?.Title5, f?.Text5],
  ];
  const socials: [LinkField | undefined, ImageField | undefined][] = [
    [f?.SocialLink1, f?.SocialIcon1],
    [f?.SocialLink2, f?.SocialIcon2],
    [f?.SocialLink3, f?.SocialIcon3],
  ];

  return (
    <footer className={`component footer variant-ceros ${sxaStyles}`} id={id ? id : undefined}>
      <div className="ceros-footer__inner">
        <div className="ceros-footer__top">
          <div className="ceros-footer__brand">
            <a href="/" className="ceros-footer__logo">
              <NextImage field={f?.Image1} width={136} height={30} />
            </a>
            <div className="ceros-footer__socials">
              {socials.map(([link, icon], i) =>
                link?.value?.href ? (
                  <Link key={i} field={link} className="ceros-footer__social">
                    <NextImage field={icon} width={21} height={21} />
                  </Link>
                ) : null
              )}
            </div>
            {f?.Badge1?.value?.src && (
              <div className="ceros-footer__badge-wide">
                <NextImage field={f?.Badge1} width={141} height={42} />
              </div>
            )}
            <div className="ceros-footer__badges">
              {f?.Badge2?.value?.src && <NextImage field={f?.Badge2} width={70} height={81} />}
              {f?.Badge3?.value?.src && <NextImage field={f?.Badge3} width={70} height={81} />}
            </div>
          </div>
          <div className="ceros-footer__columns">
            {columns.map(([title, text], i) =>
              title?.value || text?.value ? (
                <div className="ceros-footer__column" key={i}>
                  <Text field={title} tag="p" className="ceros-footer__title" />
                  <RichText field={text} className="ceros-footer__links" />
                </div>
              ) : null
            )}
          </div>
        </div>
        <div className="ceros-footer__bottom">
          <Text field={f?.Copyright} tag="p" className="ceros-footer__copyright" />
          {f?.LegalLinks?.value ? (
            <RichText field={f?.LegalLinks} className="ceros-footer__legal" />
          ) : (
            <div className="ceros-footer__legal">
              <Link field={f?.Link1} />
              <Link field={f?.Link2} />
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
