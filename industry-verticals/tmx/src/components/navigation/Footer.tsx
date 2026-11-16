'use client';

import { JSX, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  // extra fields of the derived template FooterTmx (absent on the base Footer template)
  Link3?: LinkField;
  Link4?: LinkField;
  Link5?: LinkField;
  SocialLink4?: LinkField;
  SocialIcon4?: ImageField;
  Disclaimer?: Field<string>;
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

/* Tmx variant: tmx.com footer (sections/10-div.png). Four link columns, a thin divider, a bottom row with the logo left, centred
   legal links (Link1..Link5) and grey social glyphs right (X / Facebook / LinkedIn / YouTube by position, or the SocialIcon image
   when set), then the justified disclaimer and the centred copyright. A fixed round "TOP" back-to-top button is drawn in code.
   SocialsTitle is not rendered (the live footer has none). */
const TmxSocialGlyphs: JSX.Element[] = [
  // X
  <svg key="x" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3zm-1.08 16.17h1.7L7.4 4.74H5.58l11.09 14.43z" />
  </svg>,
  // Facebook (square)
  <svg key="fb" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M21 2H3a1 1 0 0 0-1 1v18a1 1 0 0 0 1 1h9.6v-7.7H10v-3h2.6V9.1c0-2.6 1.6-4 3.9-4 1.1 0 2.1.1 2.3.1v2.7h-1.6c-1.3 0-1.5.6-1.5 1.5v1.9h3l-.4 3h-2.6V22H21a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
  </svg>,
  // LinkedIn
  <svg key="in" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M3.5 8.5h3.9V21H3.5V8.5zM5.45 2.5a2.25 2.25 0 1 1 0 4.5 2.25 2.25 0 0 1 0-4.5zM9.8 8.5h3.7v1.7h.05c.52-.98 1.8-2 3.7-2 3.95 0 4.7 2.6 4.7 6V21h-3.9v-6.1c0-1.45-.03-3.33-2.03-3.33-2.03 0-2.34 1.59-2.34 3.22V21H9.8V8.5z" />
  </svg>,
  // YouTube
  <svg key="yt" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.8a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
  </svg>,
];

/* The fixed round "TOP" button: drawn in code and portalled to document.body, so it is page chrome, not part of the footer band. */
const TmxBackToTop = (): JSX.Element | null => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <a
      href="#top"
      className="tmx-back-to-top"
      aria-label="Back to top"
      onClick={(event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <svg viewBox="0 0 14 8" aria-hidden="true">
        <path d="M1 7l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span>TOP</span>
    </a>,
    document.body
  );
};

export const Tmx = (props: FooterProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields;

  if (!f) {
    return <div className={`component footer variant-tmx ${sxaStyles}`} id={id ? id : undefined} />;
  }

  const columns = [
    { title: f.Title1, text: f.Text1 },
    { title: f.Title2, text: f.Text2 },
    { title: f.Title3, text: f.Text3 },
    { title: f.Title4, text: f.Text4 },
  ];
  const legal = [f.Link1, f.Link2, f.Link3, f.Link4, f.Link5];
  const socials = [
    { link: f.SocialLink1, icon: f.SocialIcon1 },
    { link: f.SocialLink2, icon: f.SocialIcon2 },
    { link: f.SocialLink3, icon: f.SocialIcon3 },
    { link: f.SocialLink4, icon: f.SocialIcon4 },
  ];

  return (
    <footer className={`component footer variant-tmx ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="tmx-footer-columns">
          {columns.map((col, index) =>
            isEditing || col.title?.value || col.text?.value ? (
              <div className="tmx-footer-col" key={index}>
                {/* a plain text label, not a heading: the live footer's column titles are not headings */}
                {(isEditing || col.title?.value) && <Text field={col.title} tag="div" className="tmx-footer-title" />}
                {(isEditing || col.text?.value) && <RichText field={col.text} className="tmx-footer-links" />}
              </div>
            ) : null
          )}
        </div>
      </div>
      <hr className="tmx-footer-divider" />
      <div className="container">
        <div className="tmx-footer-bottom">
          <div className="tmx-footer-logo">
            {(isEditing || f.Image1?.value?.src) && (
              <a href="/">
                <NextImage field={f.Image1} width={72} height={64} />
              </a>
            )}
          </div>
          <ul className="tmx-footer-legal">
            {legal.map((link, index) =>
              link && (isEditing || link.value?.href) ? (
                <li key={index}>
                  <Link field={link} />
                </li>
              ) : null
            )}
          </ul>
          <ul className="tmx-footer-socials">
            {socials.map((social, index) =>
              social.link && (isEditing || social.link.value?.href) ? (
                <li key={index}>
                  <Link field={social.link} aria-label={social.link.value?.text || undefined}>
                    {social.link.value?.text && <span className="tmx-visually-hidden">{social.link.value.text}</span>}
                    {social.icon?.value?.src ? (
                      <NextImage field={social.icon} width={20} height={20} />
                    ) : (
                      TmxSocialGlyphs[index]
                    )}
                  </Link>
                </li>
              ) : null
            )}
          </ul>
        </div>
        {f.Disclaimer && (isEditing || f.Disclaimer.value) && (
          <Text field={f.Disclaimer} tag="p" className="tmx-footer-disclaimer" />
        )}
        {(isEditing || f.Copyright?.value) && <Text field={f.Copyright} tag="p" className="tmx-footer-copyright" />}
      </div>
      <TmxBackToTop />
    </footer>
  );
};
