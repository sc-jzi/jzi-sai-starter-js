'use client';

import { JSX } from 'react';
import { ImageField, NextImage, RichText, RichTextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * ArticleBody: the Article page's Body (rich text) in the centred reading column, then the Image below it (the live
 * page's one-image gallery). Both are the page's own fields, so the component has no datasource.
 */

interface ArticleRouteFields {
  Body?: RichTextField;
  Image?: ImageField;
}

type Look = 'default' | 'bobcat';

const ArticleBodyView = ({ props, look }: { props: ComponentProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fields = (page?.layout?.sitecore?.route?.fields ?? {}) as ArticleRouteFields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const hasImage = !!fields.Image?.value?.src;

  return (
    <div className={`component article-body article-body--${look} ${styles}`} id={id ? id : undefined}>
      <div className="article-body__inner">
        <RichText field={fields.Body} className="article-body__text" />
      </div>
      {(isEditing || hasImage) && (
        <div className="article-body__gallery">
          <NextImage field={fields.Image} width={1090} height={816} className="article-body__image" />
        </div>
      )}
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <ArticleBodyView props={props} look="default" />;

/* Bobcat: 16/24 body copy with orange links in the 640px column, the image centred below at 545px */
export const Bobcat = (props: ComponentProps): JSX.Element => <ArticleBodyView props={props} look="bobcat" />;
