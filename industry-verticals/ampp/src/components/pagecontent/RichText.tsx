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

/* AMPP variant: body copy in the measured column, red links. */
export const Ampp = (props: RichTextProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const text = String(props.fields?.Text?.value || '');
  const markers: Array<[string, string]> = [
    ['data-ampp-band', 'ampp-band'],
    ['data-welcome', 'welcome-band'],
    ['data-discussions', 'discussions'],
    ['data-dark', 'dark-band'],
    ['data-ampp-h50', 'ampp-h50'],
    ['data-ampp-h32', 'ampp-h32'],
    ['data-ampp-h24', 'ampp-h24'],
    ['data-ampp-h20', 'ampp-h20'],
  ];
  const band = markers
    .filter(([marker]) => text.includes(marker))
    .map(([, className]) => className)
    .join(' ');

  return (
    <div className={`component rich-text variant-ampp ${band} ${props.params?.styles || ''} ${props.params?.Styles || ''}`} id={id || undefined}>
      <div className="component-content">
        {props.fields ? <JssRichText field={props.fields.Text} /> : <span className="is-empty-hint">Rich text</span>}
      </div>
    </div>
  );
};
