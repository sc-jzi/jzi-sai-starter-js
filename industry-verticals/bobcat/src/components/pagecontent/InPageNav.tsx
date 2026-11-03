'use client';

import { JSX, MouseEvent } from 'react';
import { Field, LinkField, Text, Link, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * InPageNav: a sticky bar with the page title, jump links (children: Label + Anchor = target element id)
 * and one button on the right (Link). Clicking a jump link scrolls smoothly to the element with that id.
 */

type JsonField<T> = { jsonValue?: T };

export interface InPageNavItem {
  id: string;
  label?: JsonField<Field<string>>;
  anchor?: JsonField<Field<string>>;
}

export type InPageNavProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        title?: JsonField<Field<string>>;
        link?: JsonField<LinkField>;
        children?: { results?: InPageNavItem[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat' | 'bobcat-light';

const scrollToAnchor = (event: MouseEvent<HTMLAnchorElement>, anchor: string) => {
  const target = typeof document !== 'undefined' ? document.getElementById(anchor) : null;
  if (!target) return;
  event.preventDefault();
  target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (typeof history !== 'undefined') history.replaceState(null, '', `#${anchor}`);
};

const InPageNavView = ({ props, look }: { props: InPageNavProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;

  if (!datasource) {
    return (
      <div className={`component in-page-nav ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">In Page Nav: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const title = datasource.title?.jsonValue;
  const link = datasource.link?.jsonValue;
  const items = datasource.children?.results ?? [];

  return (
    <nav
      className={`component in-page-nav in-page-nav--${look} ${isEditing ? 'is-editing' : ''} ${styles}`}
      id={id ? id : undefined}
      aria-label={title?.value || 'On this page'}
    >
      <div className="in-page-nav__band">
        <div className="in-page-nav__inner">
          {(isEditing || !!title?.value) && (
            <h2 className="in-page-nav__title">
              <Text field={title} />
            </h2>
          )}
          <ul className="in-page-nav__links">
            {items.map((item) => {
              const label = item.label?.jsonValue;
              const anchor = `${item.anchor?.jsonValue?.value || ''}`.trim().replace(/^#/, '');
              return (
                <li key={item.id} className="in-page-nav__link-item">
                  {isEditing ? (
                    <span className="in-page-nav__link">
                      <Text field={label} />
                      <small className="in-page-nav__anchor">
                        #<Text field={item.anchor?.jsonValue} />
                      </small>
                    </span>
                  ) : (
                    <a
                      className="in-page-nav__link"
                      href={anchor ? `#${anchor}` : '#'}
                      onClick={(e) => anchor && scrollToAnchor(e, anchor)}
                    >
                      {label?.value}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
          {(isEditing || !!link?.value?.href) && (
            <Link field={link as LinkField} className="bobcat-button in-page-nav__button" />
          )}
        </div>
      </div>
    </nav>
  );
};

export const Default = (props: InPageNavProps): JSX.Element => (
  <InPageNavView props={props} look="default" />
);

export const Bobcat = (props: InPageNavProps): JSX.Element => (
  <InPageNavView props={props} look="bobcat" />
);

export const BobcatLight = (props: InPageNavProps): JSX.Element => (
  <InPageNavView props={props} look="bobcat-light" />
);
