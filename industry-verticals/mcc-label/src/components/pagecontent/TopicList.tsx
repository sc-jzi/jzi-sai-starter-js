import { JSX } from 'react';
import { Text, TextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue?: T };
type Topic = {
  id?: string;
  title?: JsonValue<TextField>;
};

// Datasource fields and its child topics come from the rendering's ComponentQuery.
export type TopicListProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: {
        heading?: JsonValue<TextField>;
        children?: { results?: Topic[] };
      };
    };
  };
};

// Heading above a yellow panel with one rounded corner; the topics as a bulleted list in two columns.
export const Default = (props: TopicListProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const isPageEditing = props.page?.mode?.isEditing;
  const datasource = props.fields?.data?.datasource;
  const topics = datasource?.children?.results ?? [];

  return (
    <div className={`component topic-list ${props.params?.styles || ''}`} id={id || undefined}>
      {datasource?.heading?.jsonValue && (isPageEditing || datasource.heading.jsonValue.value) && (
        <Text tag="h2" className="topic-list__heading" field={datasource.heading.jsonValue} />
      )}
      {(topics.length > 0 || isPageEditing) && (
        <div className="topic-list__panel">
          <ul className="topic-list__items">
            {topics.map(
              (topic) =>
                topic.title?.jsonValue && (
                  <li key={topic.id}>
                    <Text field={topic.title.jsonValue} />
                  </li>
                )
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export const MccLabel = (props: TopicListProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label mcc-label-topic-list">
    <Default {...props} />
  </section>
);
