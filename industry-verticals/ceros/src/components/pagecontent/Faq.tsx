'use client';

import { JSX, useState } from 'react';
import { Field, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

type JsonField = { jsonValue?: Field<string> };

type FaqItem = {
  id: string;
  question?: JsonField;
  answer?: JsonField;
};

type FaqDatasource = {
  id?: string;
  title?: JsonField;
  intro?: JsonField;
  children?: { results?: FaqItem[] };
};

export type FaqProps = {
  params: { [key: string]: string };
  fields?: { data?: { datasource?: FaqDatasource } };
};

const FaqRow = ({ item, isEditing }: { item: FaqItem; isEditing: boolean }): JSX.Element => {
  const [open, setOpen] = useState(false);
  const expanded = open || isEditing;
  const panelId = `faq-${item.id}`;

  return (
    <div className={`faq__item ${expanded ? 'is-open' : ''}`}>
      <button
        type="button"
        className="faq__question"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
      >
        <Text field={item.question?.jsonValue} tag="span" className="faq__question-text" />
        {/* plus / minus drawn in code (decoration, not content) */}
        <span className="faq__sign" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16">
            <rect x="0" y="7" width="16" height="2" fill="currentColor" />
            {!expanded && <rect x="7" y="0" width="2" height="16" fill="currentColor" />}
          </svg>
        </span>
      </button>
      <div id={panelId} className="faq__answer" hidden={!expanded}>
        <RichText field={item.answer?.jsonValue} />
      </div>
    </div>
  );
};

const FaqBody = ({ props, modifier }: { props: FaqProps; modifier: string }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const ds = props.fields?.data?.datasource;
  const items = ds?.children?.results ?? [];

  if (!ds) {
    return (
      <div className={`component faq ${modifier} ${sxaStyles}`} id={id || undefined}>
        <div className="is-empty-hint">FAQ</div>
      </div>
    );
  }

  return (
    <section className={`component faq ${modifier} ${sxaStyles}`} id={id || undefined}>
      <div className="faq__inner">
        {(ds.title?.jsonValue?.value || isEditing) && (
          <Text field={ds.title?.jsonValue} tag="h2" className="faq__title" />
        )}
        {(ds.intro?.jsonValue?.value || isEditing) && (
          <RichText field={ds.intro?.jsonValue} className="faq__intro" />
        )}
        <div className="faq__list">
          {items.map((item) => (
            <FaqRow key={item.id} item={item} isEditing={isEditing} />
          ))}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: FaqProps): JSX.Element => <FaqBody props={props} modifier="faq--default" />;

export const Ceros = (props: FaqProps): JSX.Element => <FaqBody props={props} modifier="faq--ceros" />;
