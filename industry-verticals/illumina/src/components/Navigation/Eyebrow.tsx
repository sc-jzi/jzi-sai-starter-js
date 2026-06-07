import { Placeholder } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import React, { JSX } from 'react';

const utilityLinks = [
  { label: 'Order Status', href: '#', type: 'text' as const },
  { label: 'Favorites', href: '#', icon: 'fa-star' },
  { label: 'Shopping cart', href: '#', icon: 'fa-shopping-cart' },
  { label: 'Notifications', href: '#', icon: 'fa-bell' },
  { label: 'Account', href: '#', icon: 'fa-user' },
  { label: 'Apps', href: '#', icon: 'fa-th' },
  { label: 'Language', href: '#', icon: 'fa-globe' },
];

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;

  return (
    <div className={`component eyebrow ${props.params.styles?.trimEnd()}`} id={id ? id : undefined}>
      <div className={`container container-${props.params?.ContainerWidth?.toLowerCase()}-fluid`}>
        <div className="row">
          <div className="col col-placeholder">
            <Placeholder name="eyebrow-left" rendering={props.rendering} />
            <nav className="eyebrow-utility-nav" aria-label="Utility navigation">
              {utilityLinks.map((item) =>
                item.type === 'text' ? (
                  <a key={item.label} href={item.href} className="eyebrow-utility-link">
                    {item.label}
                  </a>
                ) : (
                  <a
                    key={item.label}
                    href={item.href}
                    className="eyebrow-utility-icon"
                    aria-label={item.label}
                  >
                    <i className={`fa ${item.icon}`} aria-hidden="true" />
                  </a>
                )
              )}
            </nav>
            <Placeholder name="eyebrow-right" rendering={props.rendering} />
          </div>
        </div>
      </div>
    </div>
  );
};
