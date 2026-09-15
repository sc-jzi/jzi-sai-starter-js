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

/* Akamai — five link columns, social row, navy footer */
export const Akamai = (props: FooterProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    { title: props.fields?.Title1, text: props.fields?.Text1 },
    { title: props.fields?.Title2, text: props.fields?.Text2 },
    { title: props.fields?.Title3, text: props.fields?.Text3 },
    { title: props.fields?.Title4, text: props.fields?.Text4 },
  ];

  return (
    <footer
      className={`component footer akamai-footer bg-[var(--brand-footer-bg)] text-[var(--brand-footer-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[1200px] px-6 py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {columns.map((column, index) => (
            <div key={index}>
              <Text
                field={column.title}
                tag="h2"
                className="mb-4 text-xs font-bold uppercase tracking-wide text-white"
              />
              <RichText
                field={column.text}
                className="text-sm leading-7 text-[var(--brand-footer-fg)] [&_a]:text-inherit [&_a]:no-underline [&_a:hover]:text-white [&_ul]:m-0 [&_ul]:list-none [&_ul]:p-0 [&_li]:mb-1"
              />
            </div>
          ))}
          <div>
            <Text
              field={props.fields?.SocialsTitle}
              tag="h2"
              className="mb-4 text-xs font-bold uppercase tracking-wide text-white"
            />
            <div className="flex flex-wrap gap-3">
              <Link field={props.fields?.SocialLink1} className="inline-flex opacity-90 hover:opacity-100">
                <NextImage field={props.fields?.SocialIcon1} width={20} height={20} />
              </Link>
              <Link field={props.fields?.SocialLink2} className="inline-flex opacity-90 hover:opacity-100">
                <NextImage field={props.fields?.SocialIcon2} width={20} height={20} />
              </Link>
              <Link field={props.fields?.SocialLink3} className="inline-flex opacity-90 hover:opacity-100">
                <NextImage field={props.fields?.SocialIcon3} width={20} height={20} />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-6 border-t border-white/15 pt-8 sm:flex-row sm:items-center">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <Text field={props.fields?.Copyright} tag="span" />
            <Link field={props.fields?.Link1} className="text-inherit no-underline hover:text-white" />
            <Link field={props.fields?.Link2} className="text-inherit no-underline hover:text-white" />
          </div>
          <NextImage
            field={props.fields?.Image1}
            width={140}
            height={36}
            className="h-8 w-auto brightness-0 invert"
          />
        </div>
      </div>
    </footer>
  );
};
