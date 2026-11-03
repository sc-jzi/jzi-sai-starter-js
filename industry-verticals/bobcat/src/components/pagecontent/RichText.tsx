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

/* Bobcat variant: offer terms small print, 14px/21 body text across the 1120px content width, padding 32/32. */
export const Bobcat = (props: RichTextProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <div className={`component rich-text rich-text-bobcat ${sxaStyles}`} id={id || undefined}>
      <div className="component-content rich-text-bobcat__inner">
        {props.fields ? (
          <JssRichText field={props.fields.Text} />
        ) : (
          <span className="is-empty-hint">Rich text</span>
        )}
      </div>
    </div>
  );
};
