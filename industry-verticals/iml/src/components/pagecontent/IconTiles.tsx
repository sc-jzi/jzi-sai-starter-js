'use client';

import { JSX } from 'react';
import { Field, ImageField, LinkField, Text, Link, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue: T };

interface TileItem {
  id: string;
  icon?: JsonValue<ImageField>;
  title?: JsonValue<Field<string>>;
  link?: JsonValue<LinkField>;
}

interface Fields {
  data?: {
    datasource?: {
      heading?: JsonValue<Field<string>>;
      children?: { results?: TileItem[] };
    };
  };
}

export type IconTilesProps = ComponentProps & {
  fields: Fields;
};

/* Chevron is decoration, drawn here */
const Chevron = () => (
  <svg viewBox="0 0 6 12" width="6" height="12" aria-hidden="true">
    <path d="M1 1l4 5-4 5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const Tile = ({ item, isPageEditing }: { item: TileItem; isPageEditing: boolean }) => {
  const link = item.link?.jsonValue as LinkField | undefined;
  const inner = (
    <>
      <span className="iml-tile__icon">
        <NextImage field={item.icon?.jsonValue} width={64} height={64} unoptimized />
      </span>
      <span className="iml-tile__title">
        <Text field={item.title?.jsonValue} />
      </span>
      <span className="iml-tile__chevron">
        <Chevron />
      </span>
    </>
  );
  return link?.value?.href && !isPageEditing ? (
    <Link field={link} className="iml-tile">
      {inner}
    </Link>
  ) : (
    <div className="iml-tile">{inner}</div>
  );
};

const IconTilesView = (props: IconTilesProps, iml: boolean): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = props.fields?.data?.datasource;
  const tiles = datasource?.children?.results ?? [];

  if (!datasource) {
    return (
      <div className={`component icon-tiles ${sxaStyles}`} id={id ? id : undefined}>
        <div className="component-content">IconTiles: no datasource</div>
      </div>
    );
  }

  return (
    <div className={`component icon-tiles ${iml ? 'iml-tiles' : ''} ${sxaStyles}`} id={id ? id : undefined}>
      {iml && <span className="iml-tiles__shape" aria-hidden="true" />}
      <div className="iml-container iml-tiles__row">
        <p className="iml-tiles__heading" role="heading" aria-level={2}>
          <Text field={datasource.heading?.jsonValue} />
        </p>
        <div className="iml-tiles__grid">
          {tiles.map((item) => (
            <Tile key={item.id} item={item} isPageEditing={isPageEditing} />
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: IconTilesProps): JSX.Element => IconTilesView(props, false);

/* Iml: heading beside a staggered grid of icon tiles on a yellow shape (drawn in CSS) */
export const Iml = (props: IconTilesProps): JSX.Element => IconTilesView(props, true);
