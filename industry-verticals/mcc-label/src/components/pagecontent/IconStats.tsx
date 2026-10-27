import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { asImageField } from 'lib/as-image-field';

interface ChildFields {
  Icon?: { jsonValue?: ImageField };
  Value?: { jsonValue?: Field<string> };
  Caption?: { jsonValue?: Field<string> };
}

interface Fields {
  Title?: Field<string>;
  Caption?: Field<string>;
  Image?: ImageField;
  Image2?: ImageField;
  Image3?: ImageField;
  items?: { fields?: ChildFields }[];
}

export type IconStatsProps = ComponentProps & {
  fields?: Fields;
};

const Row = ({ props, className }: { props: IconStatsProps; className: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const items = props.fields?.items ?? [];
  return (
    <section className={className} id={id || undefined}>
      <div className="container">
        <div className="icon-stats-images">
          {[props.fields?.Image, props.fields?.Image2, props.fields?.Image3].map((field, index) => {
            const image = asImageField(field);
            return image ? <NextImage key={index} field={image} width={48} height={48} /> : null;
          })}
        </div>
        <Text field={props.fields?.Title} tag="h2" />
        <Text field={props.fields?.Caption} tag="p" />
        <ul className="icon-stats-row">
          {items.map((item, index) => (
            <li key={index}>
              <NextImage field={item.fields?.Icon?.jsonValue} />
              <Text field={item.fields?.Value?.jsonValue} tag="strong" />
              <Text field={item.fields?.Caption?.jsonValue} tag="span" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const Default = (props: IconStatsProps): JSX.Element => (
  <Row props={props} className={`component icon-stats ${props.params?.styles || ''}`} />
);

export const MccLabel = (props: IconStatsProps): JSX.Element => (
  <Row props={props} className={`component icon-stats mcc-label ${props.params?.styles || ''}`} />
);
