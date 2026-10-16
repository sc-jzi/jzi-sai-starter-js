'use client';

import { JSX } from 'react';
import { ImageField, NextImage } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Image?: ImageField;
}

export type ImageProps = ComponentProps & {
  fields?: Fields;
};

export const Default = ({ fields, params }: ImageProps): JSX.Element => (
  <div className={`component image ${params?.styles || ''}`} id={params?.RenderingIdentifier || undefined}>
    <div className="component-content">
      <NextImage field={fields?.Image} width={1600} height={900} />
    </div>
  </div>
);
