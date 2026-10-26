'use client';

import { JSX } from 'react';
import { ImageField, Link, LinkField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
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

/* One tile: the icon, then the link with its label as a heading (the prospect's tiles are a link around an h5). Editing keeps the plain link so its text stays editable. */
const CtaTile = ({ icon, link, isEditing }: { icon?: ImageField; link?: LinkField; isEditing: boolean }): JSX.Element => (
  <div className="advance-hero-cta">
    {(isEditing || icon?.value?.src) && <NextImage field={icon} className="advance-hero-cta-icon" width={56} height={56} />}
    {isEditing ? (
      <Link field={link as LinkField} />
    ) : (
      link?.value?.href && (
        <Link field={link}>
          <h5 className="advance-hero-cta-label">{link.value.text}</h5>
        </Link>
      )
    )}
  </div>
);

export const Default = (props: AdvanceHeroProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const fields = props.fields;

  return (
    <section
      className={`component advance-hero ${props.params?.styles || ''}`}>
      <div className="advance-hero-media">
        <NextImage field={fields?.Image} className="advance-hero-image" width={900} height={520} />
        {(isEditing || fields?.MainLink?.value?.href) && <Link field={fields.MainLink} className="advance-hero-main-link" />}
      </div>
      <div className="advance-hero-grid">
        <CtaTile icon={fields?.CTA1Icon} link={fields?.CTA1Link} isEditing={isEditing} />
        <CtaTile icon={fields?.CTA2Icon} link={fields?.CTA2Link} isEditing={isEditing} />
        <CtaTile icon={fields?.CTA3Icon} link={fields?.CTA3Link} isEditing={isEditing} />
        <CtaTile icon={fields?.CTA4Icon} link={fields?.CTA4Link} isEditing={isEditing} />
      </div>
    </section>
  );
};
