import { JSX } from 'react';
import { Field, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface JsonValue<T> {
  jsonValue?: T;
}

interface ListItem {
  id: string;
  text?: JsonValue<Field<string>>;
}

export type ColumnListProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        title?: JsonValue<Field<string>>;
        children?: { results?: ListItem[] };
      };
    };
  };
};

const render = (props: ColumnListProps, variantClass: string): JSX.Element | null => {
  const ds = props.fields?.data?.datasource;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';
  const isEditing = props.page?.mode?.isEditing;

  if (!ds) {
    return isEditing ? (
      <div className={`component column-list ${styles}`}>ColumnList: choose a datasource.</div>
    ) : null;
  }

  const items = ds.children?.results ?? [];

  return (
    <section className={`component column-list ${variantClass} ${styles}`} id={id ? id : undefined}>
      <div className="column-list__inner">
        {ds.title?.jsonValue && (
          <h2 className="column-list__title">
            <Text field={ds.title.jsonValue} />
          </h2>
        )}
        <ul className="column-list__items">
          {items.map((i) =>
            i.text?.jsonValue ? (
              <li key={i.id}>
                <Text field={i.text.jsonValue} />
              </li>
            ) : null
          )}
        </ul>
      </div>
    </section>
  );
};

export const Default = (props: ColumnListProps): JSX.Element | null => render(props, '');

export const OhioHealth = (props: ColumnListProps): JSX.Element | null =>
  render(props, 'column-list--ohiohealth');
