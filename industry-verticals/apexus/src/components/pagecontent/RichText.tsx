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

/* Apexus variant: 1140px content column, centered uppercase heading, 18px body copy with bold lead-ins in the bullets */
export const Apexus = (props: RichTextProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component rich-text variant-apexus ${sxaStyles}`} id={id ? id : undefined}>
      <div className="apexus-rich-text-inner">
        {props.fields ? (
          <JssRichText field={props.fields.Text} />
        ) : (
          <span className="is-empty-hint">Rich text</span>
        )}
      </div>
    </div>
  );
};
