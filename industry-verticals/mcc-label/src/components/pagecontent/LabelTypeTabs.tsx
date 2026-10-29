'use client';

import { JSX, useState } from 'react';
import { ImageField, NextImage, RichText, RichTextField, Text, TextField } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Item = {
  id?: string;
  title?: JsonValue<TextField>;
  image?: JsonValue<ImageField>;
  text?: JsonValue<RichTextField>;
};

export type LabelTypeTabsProps = {
  params: { [key: string]: string };
  fields?: { data?: { datasource?: { children?: { results?: Item[] } } } };
};

const LabelTypeTabsView = (props: LabelTypeTabsProps): JSX.Element => {
  const items = props.fields?.data?.datasource?.children?.results ?? [];
  const [index, setIndex] = useState(0);
  const current = items[index];
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component label-type-tabs ${props.params?.styles || ''}`} id={id || undefined}>
      {items[0] && (
        <button type="button" role="tab" aria-selected={index === 0} onClick={() => setIndex(0)}>
          {items[0].title?.jsonValue && <Text field={items[0].title.jsonValue} />}
        </button>
      )}
      {current?.image?.jsonValue && <NextImage field={current.image.jsonValue} width={960} height={540} />}
      {items[1] && (
        <button type="button" role="tab" aria-selected={index === 1} onClick={() => setIndex(1)}>
          {items[1].title?.jsonValue && <Text field={items[1].title.jsonValue} />}
        </button>
      )}
      <div className="label-type-tabs__card">
      {current?.title?.jsonValue && (
        <h2>
          <Text field={current.title.jsonValue} />
        </h2>
      )}
      {items[2] && (
        <button type="button" role="tab" aria-selected={index === 2} onClick={() => setIndex(2)}>
          {items[2].title?.jsonValue && <Text field={items[2].title.jsonValue} />}
        </button>
      )}
      {current?.text?.jsonValue && <RichText field={current.text.jsonValue} />}
      </div>
    </section>
  );
};

export const Default = LabelTypeTabsView;
export const MccLabel = LabelTypeTabsView;
