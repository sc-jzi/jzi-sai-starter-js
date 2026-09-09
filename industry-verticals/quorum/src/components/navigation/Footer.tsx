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
}

export type FooterProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const FooterDefault = (props: FooterProps): JSX.Element => {
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

export const Default = FooterDefault;

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

export const Quorum = (props: FooterProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const columns = [
    { title: props.fields?.Title1, text: props.fields?.Text1 },
    { title: props.fields?.Title2, text: props.fields?.Text2 },
    { title: props.fields?.Title3, text: props.fields?.Text3 },
    { title: props.fields?.Title4, text: props.fields?.Text4 },
  ];
  const socials = [
    { link: props.fields?.SocialLink1, icon: props.fields?.SocialIcon1 },
    { link: props.fields?.SocialLink2, icon: props.fields?.SocialIcon2 },
    { link: props.fields?.SocialLink3, icon: props.fields?.SocialIcon3 },
  ];

  return (
    <footer
      className={`component quorum-footer ${props.params?.styles || ''}`}
      id={props.params.RenderingIdentifier || undefined}
    >
      <div className="quorum-container">
        <div className="quorum-footer__main">
          <div className="quorum-footer__brand">
            {(isPageEditing || props.fields?.Image1?.value?.src) && (
              <NextImage field={props.fields?.Image1} width={210} height={74} />
            )}
          </div>
          <div className="quorum-footer__columns">
            {columns.map((column, index) => (
              <section className="quorum-footer__column" key={index}>
                <Text field={column.title} tag="h2" className="quorum-footer__title" />
                <RichText field={column.text} className="quorum-footer__links" />
              </section>
            ))}
          </div>
        </div>

        {(isPageEditing ||
          props.fields?.SocialsTitle?.value ||
          socials.some((social) => social.link?.value?.href)) && (
          <div className="quorum-footer__social">
            <Text field={props.fields?.SocialsTitle} tag="h2" className="quorum-footer__title" />
            <div className="quorum-footer__social-links">
              {socials.map(
                (social, index) =>
                  (isPageEditing || social.link?.value?.href) && (
                    <Link
                      field={social.link}
                      className="quorum-footer__social-link"
                      key={index}
                    >
                      {(isPageEditing || social.icon?.value?.src) && (
                        <NextImage field={social.icon} width={20} height={20} />
                      )}
                    </Link>
                  )
              )}
            </div>
          </div>
        )}

        <div className="quorum-footer__legal">
          <Text field={props.fields?.Copyright} />
          <nav className="quorum-footer__legal-links" aria-label="Legal">
            {(isPageEditing || props.fields?.Link1?.value?.href) && (
              <Link field={props.fields?.Link1} />
            )}
            {(isPageEditing || props.fields?.Link2?.value?.href) && (
              <Link field={props.fields?.Link2} />
            )}
          </nav>
        </div>
      </div>
    </footer>
  );
};
