import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { asImageField } from 'lib/as-image-field';

interface ChildFields {
  Title?: { jsonValue?: Field<string> };
  Image?: { jsonValue?: ImageField };
  Text?: { jsonValue?: Field<string> };
}

interface Fields {
  Title?: Field<string>;
  Text?: Field<string>;
  Image?: ImageField;
  items?: { fields?: ChildFields }[];
}

export type ProductTabsProps = ComponentProps & {
  fields?: Fields;
};

const Panel = ({ props, className }: { props: ProductTabsProps; className: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const image = asImageField(props.fields?.Image);
  return (
    <section className={className} id={id || undefined}>
      <div className="container product-tabs-band">
        <button type="button">Label Solutions</button>
        <div className="product-tabs-main">
          <div className="product-tabs-copy">
            <button type="button">Label Enhancements</button>
            <Text field={props.fields?.Title} tag="h2" />
            <button type="button">Cut & Stack</button>
            <Text field={props.fields?.Text} tag="p" />
            <button type="button">Heat Transfer</button>
          </div>
          {image && <NextImage field={image} width={540} height={330} />}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ProductTabsProps): JSX.Element => (
  <Panel props={props} className={`component product-tabs ${props.params?.styles || ''}`} />
);

export const MccLabel = (props: ProductTabsProps): JSX.Element => (
  <Panel props={props} className={`component product-tabs mcc-label ${props.params?.styles || ''}`} />
);
