'use client';

import { AppPlaceholder, ComponentMap, ImageField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { JSX } from 'react';

export type EyebrowProps = ComponentProps & {
  fields: {
    LogoImage: ImageField;
  };
  componentMap: ComponentMap;
};

const EYEBROW_LINKS = [
  { label: 'Español', href: '#' },
  { label: 'About Us', href: '#' },
  { label: 'Health Professionals', href: '#' },
  { label: 'MyChart', href: '#' },
  { label: 'Careers', href: '#' },
  { label: 'Media', href: '#' },
  { label: 'Contact Us', href: '#' },
] as const;

function ChevronDownIcon(): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width={10} fill="currentColor" aria-hidden="true">
      <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
    </svg>
  );
}

function CalendarIcon(): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width={14} fill="currentColor" aria-hidden="true">
      <path d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z" />
    </svg>
  );
}

function CartIcon(): JSX.Element {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width={14} fill="currentColor" aria-hidden="true">
      <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z" />
    </svg>
  );
}

export const Default = (props: EyebrowProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();

  return (
    <div className={`component eyebrow ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row">
          <div className="col col-placeholder">
            <nav className="eyebrow-nav" aria-label="Utility navigation">
              <a className="eyebrow-nav__system button button-main" href="#">
                Our System
                <ChevronDownIcon />
              </a>
              <div className="eyebrow-nav__right">
                <ul className="eyebrow-nav__links">
                  {EYEBROW_LINKS.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
                <a className="eyebrow-nav__donate button success" href="#">
                  Donate
                </a>
                <a className="eyebrow-nav__events" href="#">
                  <CalendarIcon />
                  Classes &amp; Events (0)
                  <CartIcon />
                </a>
              </div>
            </nav>
            <AppPlaceholder name="eyebrow-left" rendering={props.rendering} page={page} componentMap={props.componentMap} />
            <AppPlaceholder name="eyebrow-right" rendering={props.rendering} page={page} componentMap={props.componentMap} />
          </div>
        </div>
      </div>
    </div>
  );
};
