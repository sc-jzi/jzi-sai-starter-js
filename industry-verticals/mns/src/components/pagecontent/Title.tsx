'use client';

import { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
}

export type TitleProps = {
  params: { [key: string]: string };
  fields: Fields;
};
 
export const Default = (props: TitleProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  console.log(props);

  return (
    <div className={`component rich-text ${sxaStyles}`} id={id ? id : undefined}>
      <div className="component-content"><Text field={props.fields.Title} /></div>
    </div>
  );
};
