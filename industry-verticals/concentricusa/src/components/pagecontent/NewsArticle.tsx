'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface NewsRouteFields {
  Title?: Field<string>;
  Content?: RichTextField;
  HeroImage?: ImageField;
}

export const Default = (props: ComponentProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const fields = (page.layout?.sitecore?.route?.fields ?? {}) as NewsRouteFields;

  return (
    <div
      className={`component news-article ${props.params?.styles || ''}`}
      id={id ? id : undefined}
    >
      <section className="news-hero">
        {(isPageEditing || fields.HeroImage?.value?.src) && (
          <NextImage field={fields.HeroImage} className="news-hero-media" width={1600} height={640} priority />
        )}
        <div className="news-hero-scrim" />
        <div className="container">
          <h1 className="news-hero-title">
            <Text field={fields.Title} />
          </h1>
        </div>
      </section>
      <section className="news-body">
        <div className="container">
          <RichText field={fields.Content} className="news-content" />
        </div>
      </section>
    </div>
  );
};
