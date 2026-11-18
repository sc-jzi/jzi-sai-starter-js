import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface JsonValue<T> {
  jsonValue?: T;
}

interface CardItem {
  id: string;
  image?: JsonValue<ImageField>;
  title?: JsonValue<Field<string>>;
  text?: JsonValue<RichTextField>;
  link?: JsonValue<LinkField>;
}

export type CardStackProps = ComponentProps & {
  fields: {
    data?: { datasource?: { id?: string; children?: { results?: CardItem[] } } };
  };
};

const render = (props: CardStackProps, variantClass: string): JSX.Element | null => {
  const ds = props.fields?.data?.datasource;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';
  const isEditing = props.page?.mode?.isEditing;

  if (!ds) {
    return isEditing ? (
      <div className={`component card-stack ${styles}`}>CardStack: choose a datasource.</div>
    ) : null;
  }

  const cards = ds.children?.results ?? [];

  return (
    <section className={`component card-stack ${variantClass} ${styles}`} id={id ? id : undefined}>
      <div className="card-stack__list">
        {cards.map((c) => {
          const hasImage = !!c.image?.jsonValue?.value?.src;
          return (
            <article className={`card-stack__card ${hasImage ? '' : 'card-stack__card--no-image'}`} key={c.id}>
              {(hasImage || isEditing) && c.image?.jsonValue && (
                <div className="card-stack__media">
                  <NextImage field={c.image.jsonValue} fill sizes="200px" />
                </div>
              )}
              <div className="card-stack__body">
                {c.title?.jsonValue && (
                  <h3 className="card-stack__title">
                    <Text field={c.title.jsonValue} />
                  </h3>
                )}
                {c.text?.jsonValue && <RichText field={c.text.jsonValue} className="card-stack__text" />}
                {c.link?.jsonValue && (c.link.jsonValue.value?.href || isEditing) && (
                  <Link field={c.link.jsonValue} className="card-stack__button" />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export const Default = (props: CardStackProps): JSX.Element | null => render(props, '');

export const OhioHealth = (props: CardStackProps): JSX.Element | null =>
  render(props, 'card-stack--ohiohealth');
