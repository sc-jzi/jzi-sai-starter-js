'use client';

import { JSX } from 'react';
import { ImageField, LinkField, Link, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * IconLinkTiles: a row of equal tiles, each an Icon (Image) above a label (the Link's text).
 * Data comes from the rendering's ComponentQuery (parent datasource with Icon Link Tile children).
 */

type JsonField<T> = { jsonValue?: T };

export interface IconLinkTileItem {
  id: string;
  icon?: JsonField<ImageField>;
  link?: JsonField<LinkField>;
}

export type IconLinkTilesProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        children?: { results?: IconLinkTileItem[] };
      };
    };
  };
};

type Look = 'default' | 'icons' | 'image-tiles';

const IconLinkTilesEmpty = ({ id, styles }: { id?: string; styles: string }): JSX.Element => (
  <div className={`component icon-link-tiles ${styles}`} id={id}>
    <div className="component-content">
      <span className="is-empty-hint">Icon Link Tiles: choose or create a datasource</span>
    </div>
  </div>
);

const Tile = ({ item, isEditing }: { item: IconLinkTileItem; isEditing: boolean }): JSX.Element => {
  const icon = item.icon?.jsonValue;
  const link = item.link?.jsonValue;

  if (isEditing) {
    return (
      <div className="icon-link-tile">
        <div className="icon-link-tile__media">
          <NextImage field={icon} width={240} height={160} className="icon-link-tile__image" />
        </div>
        <h3 className="icon-link-tile__label">
          <Link field={link as LinkField} />
        </h3>
      </div>
    );
  }

  const label = link?.value?.text || link?.value?.title || '';
  const image = icon?.value?.src ? (
    <div className="icon-link-tile__media">
      <NextImage field={icon} width={240} height={160} className="icon-link-tile__image" />
    </div>
  ) : null;

  if (!link?.value?.href) {
    return (
      <div className="icon-link-tile">
        {image}
        <h3 className="icon-link-tile__label">{label}</h3>
      </div>
    );
  }

  return (
    <Link field={link} className="icon-link-tile">
      {image}
      <h3 className="icon-link-tile__label">{label}</h3>
    </Link>
  );
};

const IconLinkTilesView = ({
  props,
  look,
}: {
  props: IconLinkTilesProps;
  look: Look;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;

  if (!datasource) {
    return <IconLinkTilesEmpty id={id} styles={styles} />;
  }

  const items = datasource.children?.results ?? [];

  return (
    <div
      className={`component icon-link-tiles icon-link-tiles--${look} ${styles}`}
      id={id ? id : undefined}
    >
      <div className="icon-link-tiles__band">
        <div className="icon-link-tiles__inner">
          {items.map((item) => (
            <div className="icon-link-tiles__item" key={item.id}>
              <Tile item={item} isEditing={isEditing} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: IconLinkTilesProps): JSX.Element => (
  <IconLinkTilesView props={props} look="default" />
);

export const Bobcat = (props: IconLinkTilesProps): JSX.Element => (
  <IconLinkTilesView props={props} look="icons" />
);

export const BobcatImageTiles = (props: IconLinkTilesProps): JSX.Element => (
  <IconLinkTilesView props={props} look="image-tiles" />
);
