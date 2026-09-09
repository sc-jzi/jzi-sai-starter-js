'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  useSitecore,
  Link,
  LinkField,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
}

export type AppPromoProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component hero ${sxaStyles}`} id={id ? id : undefined}>
      <picture>
        <NextImage field={props.fields.Image} className="" width={1920} height={400}></NextImage>
      </picture>
      <div className="container content-container">
        <div className="top-layout">
          <div className="title">
            <Text field={props.fields.Title} />
          </div>
          <div className="subtitle">
            <RichText field={props.fields.Text} />
          </div>
        </div>
        <div className="bottom-layout">
          <div className="btn-array">
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-main mt-3" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const GBTS_SECONDARY_HERO_LINKS = [
  {
    text: 'OSHA Courses',
    href: 'https://gbts.learnshare.com/',
  },
  {
    text: 'Virtual Courses',
    href: 'https://www.gbtstraining.com/courses/',
  },
];

/* GBTS variant — compact centered hero with three training CTAs. */
export const GbtsMultiCta = (props: AppPromoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component hero gbts-multi-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <picture>
        <NextImage field={props.fields.Image} width={1920} height={480} />
      </picture>
      <div className="container content-container">
        <div className="gbts-hero-copy">
          <h1>
            <Text field={props.fields.Title} />
          </h1>
          <RichText field={props.fields.Text} className="subtitle" />
          <div className="gbts-hero-actions">
            {(isPageEditing || props.fields?.Link?.value?.href) && (
              <Link field={props.fields.Link} className="button button-accent" />
            )}
            {GBTS_SECONDARY_HERO_LINKS.map((link) => (
              <a
                key={link.text}
                className="button button-accent"
                href={link.href}
                target="_blank"
                rel="noreferrer"
              >
                {link.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
