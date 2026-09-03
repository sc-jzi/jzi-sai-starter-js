'use client';

import { ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

const UTILITY_LINKS = [
  { href: '/employer-partners', label: 'Employer Partners' },
  { href: '/media-resources', label: 'Media Resources' },
];

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
};

const CovistaEyebrow = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;

  return (
    <div className={`component eyebrow cv-eyebrow ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className="cv-eyebrow__inner">
        <nav className="cv-eyebrow__nav" aria-label="Utility">
          {UTILITY_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};

export const Default = CovistaEyebrow;
export const Covista = CovistaEyebrow;
