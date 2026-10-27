import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { asImageField } from 'lib/as-image-field';

interface Fields {
  Title?: Field<string>;
  Image?: ImageField;
  Image2?: ImageField;
  Image3?: ImageField;
  Image4?: ImageField;
  Image5?: ImageField;
  Image6?: ImageField;
  Image7?: ImageField;
  Image8?: ImageField;
  TabOneLabel?: Field<string>;
  TabTwoLabel?: Field<string>;
}

export type TabbedCardsProps = ComponentProps & {
  fields?: Fields;
};

const Grid = ({ props, className }: { props: TabbedCardsProps; className: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const images = [
    props.fields?.Image,
    props.fields?.Image2,
    props.fields?.Image3,
    props.fields?.Image4,
    props.fields?.Image5,
    props.fields?.Image6,
    props.fields?.Image7,
    props.fields?.Image8,
  ]
    .map((field) => asImageField(field))
    .filter((field): field is NonNullable<typeof field> => !!field);
  return (
    <section className={className} id={id || undefined}>
      <div className="container">
        <div className="tabbed-cards-tabs">
          <Text field={props.fields?.TabOneLabel} tag="button" />
          <Text field={props.fields?.TabTwoLabel} tag="button" />
        </div>
        <ul className="tabbed-cards-grid">
          {images.map((image, index) => (
            <li key={index}>
              <a href={index === 1 ? '/markets/beverage' : index === 3 ? '/markets/food-dairy' : '/markets'}>
                <NextImage field={image} width={261} height={200} />
                {index === 0 ? (
                  <Text field={props.fields?.Title} tag="h3" />
                ) : (
                  <h3>{String(image.value?.alt || '').replace(/ Image$/, '').replace(/&amp;/g, '&')}</h3>
                )}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export const Default = (props: TabbedCardsProps): JSX.Element => (
  <Grid props={props} className={`component tabbed-cards ${props.params?.styles || ''}`} />
);

export const MccLabel = (props: TabbedCardsProps): JSX.Element => (
  <Grid props={props} className={`component tabbed-cards mcc-label ${props.params?.styles || ''}`} />
);
