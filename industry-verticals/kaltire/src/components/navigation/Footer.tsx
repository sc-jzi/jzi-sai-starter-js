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

/* Kal Tire variant — dense white columns with orange legal band */
export const KalTire = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const groups = [
    { title: props.fields?.Title1, text: props.fields?.Text1 },
    { title: props.fields?.Title2, text: props.fields?.Text2 },
    { title: props.fields?.Title3, text: props.fields?.Text3 },
    { title: props.fields?.Title4, text: props.fields?.Text4 },
  ];

  return (
    <footer
      className={`component footer kal-tire-footer bg-[var(--brand-footer-bg)] text-[var(--brand-footer-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="mx-auto max-w-[1180px] px-6 py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, index) => (
            <div key={index}>
              <Text
                field={group.title}
                tag="h2"
                className="mb-4 text-xs font-extrabold uppercase tracking-wide"
              />
              <RichText
                field={group.text}
                className="text-xs font-medium leading-6 text-[var(--brand-muted-fg)] [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-[var(--brand-primary)]"
              />
            </div>
          ))}
        </div>
        <div className="mt-9 flex flex-col items-start justify-between gap-5 border-t border-[var(--brand-border)] pt-7 sm:flex-row sm:items-center">
          <NextImage
            field={props.fields?.Image1}
            width={150}
            height={42}
            className="h-auto w-32"
          />
          <div>
            <Text
              field={props.fields?.SocialsTitle}
              tag="span"
              className="mb-2 block text-xs font-extrabold uppercase"
            />
            <div className="flex gap-4 text-xs font-bold uppercase">
              <Link field={props.fields?.SocialLink1} />
              <Link field={props.fields?.SocialLink2} />
              <Link field={props.fields?.SocialLink3} />
            </div>
          </div>
        </div>
      </div>
      <div className="bg-[var(--brand-primary)] px-6 py-5 text-center text-[0.7rem] font-semibold text-[var(--brand-primary-foreground)]">
        <Text field={props.fields?.Copyright} tag="span" />
        <span className="mx-2">|</span>
        <Link field={props.fields?.Link1} className="text-inherit" />
        <span className="mx-2">|</span>
        <Link field={props.fields?.Link2} className="text-inherit" />
      </div>
    </footer>
  );
};
