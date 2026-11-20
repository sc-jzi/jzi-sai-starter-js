'use client';

import { JSX, useState } from 'react';
import { Field, RichTextField, Text, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface JsonValue<T> {
  jsonValue?: T;
}

interface FaqItem {
  id: string;
  question?: JsonValue<Field<string>>;
  answer?: JsonValue<RichTextField>;
}

interface FaqDatasource {
  id?: string;
  title?: JsonValue<Field<string>>;
  children?: { results?: FaqItem[] };
}

export type FaqProps = ComponentProps & {
  fields: {
    data?: { datasource?: FaqDatasource };
  };
};

// Plus / minus drawn in code (decoration, R26).
const ToggleIcon = ({ open }: { open: boolean }): JSX.Element => (
  <svg className="faq__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
    <circle cx="10" cy="10" r="10" fill="currentColor" />
    <path d="M5.5 10h9" stroke="#fff" strokeWidth="1.6" />
    {!open && <path d="M10 5.5v9" stroke="#fff" strokeWidth="1.6" />}
  </svg>
);

const Question = ({ item, isEditing }: { item: FaqItem; isEditing: boolean }): JSX.Element => {
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
        <ToggleIcon open={expanded} />
        {item.question?.jsonValue && (
          <span className="faq__question-text">
            <Text field={item.question.jsonValue} />
          </span>
        )}
      </button>
      <div id={panelId} className="faq__answer" hidden={!expanded}>
        {item.answer?.jsonValue && <RichText field={item.answer.jsonValue} />}
      </div>
    </div>
  );
};

const FaqView = ({ variantClass, ...props }: FaqProps & { variantClass: string }): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const ds = props.fields?.data?.datasource;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';

  if (!ds) {
    return isEditing ? <div className={`component faq ${styles}`}>Faq: choose a datasource.</div> : null;
  }

  const items = ds.children?.results ?? [];
  const half = Math.ceil(items.length / 2);
  const columns = [items.slice(0, half), items.slice(half)];

  // Two bands, as on the live page: the heading block, then the questions block.
  return (
    <>
      {(ds.title?.jsonValue?.value || isEditing) && ds.title?.jsonValue && (
        <section className={`component faq faq--heading ${variantClass} ${styles}`}>
          <div className="faq__inner">
            <h2 className="faq__title">
              <Text field={ds.title.jsonValue} />
            </h2>
          </div>
        </section>
      )}
      <section className={`component faq ${variantClass} ${styles}`} id={id ? id : undefined}>
        <div className="faq__inner">
          <div className="faq__columns">
            {columns.map((col, i) => (
              <div className="faq__column" key={i}>
                {col.map((item) => (
                  <Question key={item.id} item={item} isEditing={isEditing} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export const Default = (props: FaqProps): JSX.Element => <FaqView {...props} variantClass="" />;

export const OhioHealth = (props: FaqProps): JSX.Element => (
  <FaqView {...props} variantClass="faq--ohiohealth" />
);
