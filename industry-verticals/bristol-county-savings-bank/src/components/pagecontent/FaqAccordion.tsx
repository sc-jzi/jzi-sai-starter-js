'use client';

import { JSX, useState } from 'react';
import { Field, RichText, RichTextField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue?: T };

interface Faq {
  id?: string;
  title?: JsonValue<Field<string>>;
  content?: JsonValue<RichTextField>;
}

export type FaqAccordionProps = ComponentProps & {
  fields?: { data?: { datasource?: { heading?: JsonValue<Field<string>>; children?: { results?: Faq[] } } } };
};

const Chevron = ({ open }: { open: boolean }): JSX.Element => (
  <svg className={`faq-accordion__chevron${open ? ' is-open' : ''}`} viewBox="0 0 12 8" width="12" height="8" aria-hidden="true">
    <path d="M1 1 L6 6 L11 1" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const Body = ({ props, className }: { props: FaqAccordionProps; className: string }): JSX.Element => {
  const { page } = useSitecore();
  const editing = !!page?.mode?.isEditing;
  const ds = props.fields?.data?.datasource;
  const faqs = ds?.children?.results ?? [];
  const [open, setOpen] = useState<string | undefined>(faqs[0]?.id);
  const id = props.params?.RenderingIdentifier;

  if (!ds) {
    return (
      <div className={`component faq-accordion ${className}`} id={id}>
        <span className="is-empty-hint">FAQ</span>
      </div>
    );
  }

  return (
    <section className={`component faq-accordion ${className}`} id={id}>
      <div className="container">
        <Text tag="h2" className="faq-accordion__heading" field={ds.heading?.jsonValue} />
        <div className="faq-accordion__list">
          {faqs.map((f) => {
            const isOpen = editing || open === f.id;
            return (
              <div key={f.id} className={`faq-accordion__item${isOpen ? ' is-open' : ''}`}>
                <a
                  href="#"
                  role="button"
                  className="faq-accordion__question"
                  aria-expanded={isOpen}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpen(open === f.id ? undefined : f.id);
                  }}
                >
                  <Chevron open={isOpen} />
                  <Text tag="span" field={f.title?.jsonValue} />
                </a>
                {isOpen && <RichText className="faq-accordion__answer" field={f.content?.jsonValue} />}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: FaqAccordionProps): JSX.Element => <Body props={props} className={props.params?.styles || ''} />;

export const BristolCountySavingsBank = (props: FaqAccordionProps): JSX.Element => (
  <Body props={props} className={`faq-accordion--bcsb ${props.params?.styles || ''}`} />
);
