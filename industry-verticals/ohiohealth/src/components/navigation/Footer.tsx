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

/* OhioHealth variant (live footer): blue band, white logo with three round social icons (drawn in code, links from SocialLink1-3) and the
   TTY line on the left, four link columns, a rule, then copyright left and four legal links right separated by bars. The extra fields
   (Link3, Link4, AccessibilityNote) come from the derived template FooterOhioHealth. */
type OhFooterFields = Fields & { Link3?: LinkField; Link4?: LinkField; AccessibilityNote?: Field<string> };
const OhSocialIcon = ({ kind }: { kind: number }): JSX.Element => {
  if (kind === 1)
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9z" fill="currentColor" />
      </svg>
    );
  if (kind === 2)
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.8 4h2.7l-5.9 6.8L21.5 20h-5.4l-4.2-5.5L7 20H4.3l6.3-7.2L4 4h5.5l3.8 5zm-1 14.4h1.5L8.3 5.5H6.7z" fill="currentColor" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="4.5" width="15" height="15" rx="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="16.6" cy="7.4" r="1" fill="currentColor" />
    </svg>
  );
};
export const OhioHealth = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const f = (props.fields || {}) as OhFooterFields;
  const cols = [
    [f.Title1, f.Text1],
    [f.Title2, f.Text2],
    [f.Title3, f.Text3],
    [f.Title4, f.Text4],
  ] as const;
  const socials = [f.SocialLink1, f.SocialLink2, f.SocialLink3];
  const icons = [f.SocialIcon1, f.SocialIcon2, f.SocialIcon3];
  const legal = [f.Link1, f.Link2, f.Link3, f.Link4].filter((l) => l?.value?.href);
  return (
    <footer className={`component footer oh-footer ${sxaStyles}`} id={id ? id : undefined}>
      <div className="oh-container">
        <div className="oh-footer__top">
          <div className="oh-footer__brand">
            <NextImage field={f.Image1} width={200} height={52} className="oh-footer__logo" />
            <div className="oh-footer__socials">
              {socials.map((l, i) =>
                l?.value?.href ? (
                  <Link key={i} field={l} className={`oh-footer__social ${icons[i]?.value?.src ? 'oh-footer__social--img' : 'btn-social'}`} aria-label={l.value.text || undefined}>
                    {icons[i]?.value?.src ? (
                      <NextImage field={icons[i]} width={18} height={18} className="oh-footer__social-img" />
                    ) : (
                      <>
                        <OhSocialIcon kind={i + 1} />
                        <span className="visually-hidden">{l.value.text}</span>
                      </>
                    )}
                  </Link>
                ) : null
              )}
            </div>
            {f.AccessibilityNote?.value && (
              <p className="oh-footer__note">
                <Text field={f.AccessibilityNote} />
              </p>
            )}
          </div>
          <div className="oh-footer__cols">
            {cols.map(([t, x], i) => (
              <div className="oh-footer__col" key={i}>
                <div className="oh-footer__title">
                  <Text field={t} />
                </div>
                <RichText field={x} className="oh-footer__links" />
              </div>
            ))}
          </div>
        </div>
        <hr className="oh-footer__rule" />
        <div className="oh-footer__bottom">
          <span className="oh-footer__copy">
            <Text field={f.Copyright} />
          </span>
          <div className="oh-footer__legal">
            {legal.map((l, i) => (
              <span key={i}>
                {i > 0 && <span className="oh-footer__sep">|</span>}
                <Link field={l as LinkField} />
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
