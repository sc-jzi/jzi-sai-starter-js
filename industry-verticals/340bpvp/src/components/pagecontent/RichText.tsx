'use client';

import { JSX } from 'react';
import { Field, RichText as JssRichText } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Text: Field<string>;
}

export type RichTextProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: RichTextProps): JSX.Element => {
  const text = props.fields ? (
    <JssRichText field={props.fields.Text} />
  ) : (
    <span className="is-empty-hint">Rich text</span>
  );
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component rich-text ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content">{text}</div>
    </div>
  );
};

export const Pvp = (props: RichTextProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component rich-text variant-pvp ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content">
        <JssRichText field={props.fields?.Text} />
      </div>
    </div>
  );
};

export const PvpGrayBand = (props: RichTextProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component rich-text variant-pvp variant-pvp-gray ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content">
        <JssRichText field={props.fields?.Text} />
      </div>
    </div>
  );
};
