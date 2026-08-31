'use client';

import { AppPlaceholder, ComponentMap, ImageField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

export type HeaderProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const PENTAIR_WATER_EYEBROW_LEFT = [
  { label: 'Home Water', href: 'https://www.pentair.com/en-us/home-water-treatment.html' },
  { label: 'Foodservice', href: 'https://www.pentair.com/en-us/commercial-filtration.html' },
] as const;

const PENTAIR_WATER_EYEBROW_RIGHT = [
  { label: 'Pentair.com Homepage', href: 'https://www.pentair.com/en-us.html', icon: 'globe' },
  { label: 'Contact Us', href: 'https://www.pentair.com/en-us/water-solutions/contact-us.html', icon: 'headset' },
  { label: 'Find a Dealer', href: 'https://www.pentair.com/en-us/home-water-treatment/find-a-water-professional.html', icon: 'pin' },
  { label: 'Partner Portal', href: 'https://www.pentair.com/en-us/partners.html', icon: 'users' },
] as const;

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
};

function EyebrowIcon({ name }: { name: (typeof PENTAIR_WATER_EYEBROW_RIGHT)[number]['icon'] }): JSX.Element {
  switch (name) {
    case 'globe':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
    case 'headset':
      return (
        <svg {...iconProps}>
          <path d="M4 13V11a8 8 0 0 1 16 0v2" />
          <rect x="2.5" y="12" width="4.5" height="6.5" rx="1.5" />
          <rect x="17" y="12" width="4.5" height="6.5" rx="1.5" />
          <path d="M19.5 18.5v1A2.5 2.5 0 0 1 17 22h-3" />
        </svg>
      );
    case 'pin':
      return (
        <svg {...iconProps}>
          <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 1 1 13 0C18.5 15.4 12 21 12 21z" />
          <circle cx="12" cy="10.5" r="2.25" />
        </svg>
      );
    case 'users':
      return (
        <svg {...iconProps}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <circle cx="17" cy="8.5" r="2.5" />
          <path d="M16 14.2a4.8 4.8 0 0 1 4.5 4.8" />
        </svg>
      );
    default:
      return <></>;
  }
}

function PentairWaterEyebrow(): JSX.Element {
  return (
    <nav className="pentair-water-eyebrow" aria-label="Utility">
      <div className="container">
        <ul className="pentair-water-eyebrow__list pentair-water-eyebrow__list--left">
          {PENTAIR_WATER_EYEBROW_LEFT.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
        <ul className="pentair-water-eyebrow__list pentair-water-eyebrow__list--right">
          {PENTAIR_WATER_EYEBROW_RIGHT.map((link) => (
            <li key={link.label}>
              <a href={link.href} target="_blank" rel="noopener noreferrer">
                <EyebrowIcon name={link.icon} />
                <span>{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export const Default = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();

  return (
    <div className={`component header pentair-water-header ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <PentairWaterEyebrow />
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row align-items-center">
          <div className="col-auto">
            <AppPlaceholder name="header-left" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithLogoImage = (props: HeaderProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();

  return (
    <div className={`component header pentair-water-header ${sxaStyles}`} id={id ? id : undefined}>
      <PentairWaterEyebrow />
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row align-items-center">
          <div className="col-auto">
            <NextImage field={props.fields.LogoImage} width={200} height={50} />
          </div>
          <div className="col">
            <AppPlaceholder name="header-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};

/* PentairWater variant — utility bar + logo + nav placeholders */
export const PentairWater = (props: HeaderProps): JSX.Element => {
  return <WithLogoImage {...props} />;
};
