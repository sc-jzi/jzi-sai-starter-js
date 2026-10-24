'use client';

import { JSX } from 'react';
import { ImageField, Link, LinkField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface AdvanceHeroFields {
  Image?: ImageField;
  'Main Link'?: LinkField;
  CTA1Icon?: ImageField;
  CTA1Link?: LinkField;
  CTA2Icon?: ImageField;
  CTA2Link?: LinkField;
  CTA3Icon?: ImageField;
  CTA3Link?: LinkField;
  CTA4Icon?: ImageField;
  CTA4Link?: LinkField;
}

export type AdvanceHeroProps = ComponentProps & {
  fields: AdvanceHeroFields;
};

type CtaTile = {
  icon?: ImageField;
  link?: LinkField;
};

const linkLines = (link?: LinkField): string[] =>
  (link?.value?.text || '')
    .split(/\||\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const AdvanceHeroEmpty = (): JSX.Element => (
  <section className="component advance-hero advance-hero-empty">
    <p>Advance Hero content is not configured.</p>
  </section>
);

const Cta = ({ icon, link, isPageEditing }: CtaTile & { isPageEditing: boolean }): JSX.Element => {
  const hasLink = !!link && (isPageEditing || !!link.value?.href || !!link.value?.text);
  const hasIcon = !!icon && (isPageEditing || !!icon.value?.src);

  return (
    <div className="advance-hero-cta">
      {hasIcon && icon && <NextImage field={icon} className="advance-hero-cta-icon" width={56} height={56} />}
      {hasLink && link && <Link field={link} />}
    </div>
  );
};

const AdvanceHeroView = (props: AdvanceHeroProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const { fields } = props;
  const image = fields.Image;
  const mainLink = fields['Main Link'];
  const showImage = !!image && (isPageEditing || !!image.value?.src);
  const showMainLink = !!mainLink && (isPageEditing || !!mainLink.value?.href || !!mainLink.value?.text);
  const lines = linkLines(mainLink);
  const tiles: CtaTile[] = [
    { icon: fields.CTA1Icon, link: fields.CTA1Link },
    { icon: fields.CTA2Icon, link: fields.CTA2Link },
    { icon: fields.CTA3Icon, link: fields.CTA3Link },
    { icon: fields.CTA4Icon, link: fields.CTA4Link },
  ];

  return (
    <section
      className={`component advance-hero ${props.params?.styles || ''}`}
      id={props.params.RenderingIdentifier || undefined}
    >
      <div className="advance-hero-media">
        {showImage && image && <NextImage field={image} className="advance-hero-image" width={900} height={520} />}
        {showMainLink && mainLink &&
          (isPageEditing ? (
            <Link field={mainLink} className="advance-hero-main-link" />
          ) : (
            <Link field={mainLink} className="advance-hero-main-link">
              {(lines.length > 0 ? lines : [mainLink.value?.text || '']).map((line, index, all) => (
                <span key={`${line}-${index}`} className={index === 0 ? 'advance-hero-main-title' : 'advance-hero-main-sub'}>
                  {line}
                  {index === all.length - 1 && (
                    <span className="advance-hero-arrow" aria-hidden="true">
                      ↗
                    </span>
                  )}
                </span>
              ))}
            </Link>
          ))}
      </div>
      <div className="advance-hero-grid">
        {tiles.map((tile, index) => (
          <Cta key={index} icon={tile.icon} link={tile.link} isPageEditing={isPageEditing} />
        ))}
      </div>
    </section>
  );
};

export const Default = (props: AdvanceHeroProps): JSX.Element => {
  if (!props.fields) return <AdvanceHeroEmpty />;
  return <AdvanceHeroView {...props} />;
};
