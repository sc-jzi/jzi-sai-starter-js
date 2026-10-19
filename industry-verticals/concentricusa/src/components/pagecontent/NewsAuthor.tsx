'use client';

import { JSX } from 'react';
import { Field, ImageField, Text, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Image: ImageField;
  Name: Field<string>;
  Bio: Field<string>;
}

export type NewsAuthorProps = ComponentProps & { fields: Fields };

const NewsAuthorEmpty = (): JSX.Element => (
  <div className="component news-author">
    <div className="component-content">
      <span className="is-empty-hint">News Author</span>
    </div>
  </div>
);

export const Default = (props: NewsAuthorProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  if (!props.fields) return <NewsAuthorEmpty />;

  const { Image: photo, Name, Bio } = props.fields;

  return (
    <div className={`component news-author ${props.params?.styles || ''}`} id={id ? id : undefined}>
      <div className="container">
        <div className="news-author-card">
          {(isPageEditing || photo?.value?.src) && (
            <NextImage field={photo} className="news-author-photo" width={96} height={96} />
          )}
          <div className="news-author-copy">
            <p className="news-author-label">Author</p>
            <h2 className="news-author-name">
              <Text field={Name} />
            </h2>
            {(isPageEditing || Bio?.value) && (
              <p className="news-author-bio">
                <Text field={Bio} />
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
