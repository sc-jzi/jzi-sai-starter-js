'use client';

import { JSX } from 'react';
import { Field, LinkField, Text, Link, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * LinkColumns: an optional heading (Title) and one column per child item: its Title and up to twelve links.
 * The arrow after each link is drawn in CSS.
 */

type JsonField<T> = { jsonValue?: T };

export interface LinkColumnItem {
  id: string;
  title?: JsonField<Field<string>>;
  link1?: JsonField<LinkField>;
  link2?: JsonField<LinkField>;
  link3?: JsonField<LinkField>;
  link4?: JsonField<LinkField>;
  link5?: JsonField<LinkField>;
  link6?: JsonField<LinkField>;
  link7?: JsonField<LinkField>;
  link8?: JsonField<LinkField>;
  link9?: JsonField<LinkField>;
  link10?: JsonField<LinkField>;
  link11?: JsonField<LinkField>;
  link12?: JsonField<LinkField>;
}

export type LinkColumnsProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        title?: JsonField<Field<string>>;
        children?: { results?: LinkColumnItem[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat';

const linksOf = (item: LinkColumnItem) =>
  [
    item.link1,
    item.link2,
    item.link3,
    item.link4,
    item.link5,
    item.link6,
    item.link7,
    item.link8,
    item.link9,
    item.link10,
    item.link11,
    item.link12,
  ].map((l) => l?.jsonValue);

const LinkColumnsView = ({ props, look }: { props: LinkColumnsProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;

  if (!datasource) {
    return (
      <div className={`component link-columns ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Link Columns: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const title = datasource.title?.jsonValue;
  const columns = datasource.children?.results ?? [];

  return (
    <div className={`component link-columns link-columns--${look} ${styles}`} id={id ? id : undefined}>
      <div className="link-columns__inner">
        {(isEditing || !!title?.value) && (
          <h2 className="link-columns__heading">
            <Text field={title} />
          </h2>
        )}
        <div className="link-columns__grid">
          {columns.map((column) => (
            <div className="link-columns__column" key={column.id}>
              {(isEditing || !!column.title?.jsonValue?.value) && (
                <h3 className="link-columns__title">
                  <Text field={column.title?.jsonValue} />
                </h3>
              )}
              <ul className="link-columns__links">
                {linksOf(column).map((link, i) =>
                  isEditing || link?.value?.href ? (
                    <li key={i}>
                      <Link field={link as LinkField} className="bobcat-arrow-link" />
                    </li>
                  ) : null
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: LinkColumnsProps): JSX.Element => (
  <LinkColumnsView props={props} look="default" />
);

export const Bobcat = (props: LinkColumnsProps): JSX.Element => (
  <LinkColumnsView props={props} look="bobcat" />
);
