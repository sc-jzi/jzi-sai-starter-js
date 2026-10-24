'use client';

import { JSX } from 'react';
import { ImageField, Link, LinkField, NextImage, Image } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

export type AdvanceHeroProps = ComponentProps & {
  fields: {
    Image: ImageField;
    MainLink: LinkField;
    CTA1Icon: ImageField;
    CTA1Link: LinkField;
    CTA2Icon: ImageField;
    CTA2Link: LinkField;
    CTA3Icon: ImageField;
    CTA3Link: LinkField;
    CTA4Icon: ImageField;
    CTA4Link: LinkField;
  }
};

const linkLines = (link?: LinkField): string[] =>
  (link?.value?.text || '')
    .split(/\||\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);


export const Default = (props: AdvanceHeroProps): JSX.Element => {
  const mainLink = props.fields.MainLink;
  const lines = linkLines(mainLink);
  console.log(props);
  return (
    <section
      className={`component advance-hero ${props.params?.styles || ''}`}>
      <div className="advance-hero-media">
        <NextImage field={props.fields.Image} className="advance-hero-image" width={900} height={520} />
        <Link field={props.fields.MainLink} className="advance-hero-main-link" />
      </div>
      <div className="advance-hero-grid">
        <div className="advance-hero-cta">
          <NextImage field={props.fields.CTA1Icon} className="advance-hero-cta-icon" width={56} height={56} />
          <Link field={props.fields.CTA1Link} />
        </div>
        <div className="advance-hero-cta">
          <NextImage field={props.fields.CTA2Icon} className="advance-hero-cta-icon" width={56} height={56} />
          <Link field={props.fields.CTA2Link} />
        </div>
        <div className="advance-hero-cta">
          <NextImage field={props.fields.CTA3Icon} className="advance-hero-cta-icon" width={56} height={56} />
          <Link field={props.fields.CTA3Link} />
        </div>
        <div className="advance-hero-cta">
          <NextImage field={props.fields.CTA4Icon} className="advance-hero-cta-icon" width={56} height={56} />
          <Link field={props.fields.CTA4Link} />
        </div>
      </div>
    </section>
  );
};
