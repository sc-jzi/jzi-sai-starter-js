'use client';

import { useState, JSX } from 'react';
import { Field, ImageField, NextImage, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

interface AccordionItemFields {
  Icon: ImageField;
  Title: Field<string>;
  Content: Field<string>;
}

export type AccordionItemProps = {
  fields: AccordionItemFields;
  name: string;
  url: string;
};

export type AccordionProps = {
  params: { [key: string]: string };
  fields: {
    items: AccordionItemProps[];
  };
};

const AccordionItem = ({ item }: { item: AccordionItemProps }): JSX.Element => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="accordion-group">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`button-clear-appearance ${isExpanded ? 'expanded' : ''}`}
      >
        <div className="icon-wrapper">
          <NextImage field={item.fields.Icon} width={32} height={32} />
        </div>
        <h3 className="display-6 fw-bold mb-0">
          <Text field={item.fields.Title} />
        </h3>
        <span className="button-icon-wrapper">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            width={23}
            fill="currentColor"
          >
            <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z" />
          </svg>
        </span>
      </button>
      <div className={`content-wrapper ${isExpanded ? 'd-block' : 'd-none'}`}>
        <div className="row justify-content-end">
          <div className="col-12 col-lg-6">
            <div className="rich-text styled-list">
              <RichText field={item.fields.Content} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default = (props: AccordionProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const accordionItems = props.fields?.items;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component accordion component-spaced ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        {accordionItems?.map((item) => (
          <AccordionItem key={item.url} item={item} />
        ))}
      </div>
    </div>
  );
};

/* Bobcat variant: the offers page groups ("0% Financing Offers", "Rebate Offers"): an orange "Expand all"
   control right above full-width #f1f1f1 rows, each with a chevron before the 24px uppercase title; the
   open row shows its content below. The chevrons and the Expand all control are drawn here, not content. */
const BobcatChevron = ({ open }: { open: boolean }): JSX.Element => (
  <svg
    className={`accordion-bobcat__chevron ${open ? 'is-open' : ''}`}
    viewBox="0 0 16 16"
    width="12"
    height="12"
    aria-hidden="true"
  >
    <path d="M5 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

export const Bobcat = (props: AccordionProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`.trim();
  const items = props.fields?.items ?? [];
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const allOpen = items.length > 0 && items.every((item) => open[item.url]);

  const toggleAll = () =>
    setOpen(allOpen ? {} : Object.fromEntries(items.map((item) => [item.url, true])));

  return (
    <div className={`component accordion-bobcat ${sxaStyles}`} id={id || undefined}>
      <div className="accordion-bobcat__inner">
        {items.length > 1 && (
          <div className="accordion-bobcat__toolbar">
            <button type="button" className="accordion-bobcat__expand" onClick={toggleAll}>
              {allOpen ? 'Collapse all' : 'Expand all'}
              <BobcatChevron open={allOpen} />
            </button>
          </div>
        )}
        {items.length === 0 && <span className="is-empty-hint">Accordion</span>}
        {items.map((item) => {
          // In Pages every panel stays open so its content can be edited.
          const isOpen = isEditing || !!open[item.url];
          return (
            <div key={item.url} className={`accordion-bobcat__group ${isOpen ? 'is-open' : ''}`}>
              <button
                type="button"
                className="accordion-bobcat__header"
                aria-expanded={isOpen}
                onClick={() => setOpen((state) => ({ ...state, [item.url]: !state[item.url] }))}
              >
                <BobcatChevron open={isOpen} />
                <Text field={item.fields?.Title} tag="h3" className="accordion-bobcat__title" />
              </button>
              <div className="accordion-bobcat__panel" hidden={!isOpen}>
                <RichText field={item.fields?.Content} className="accordion-bobcat__content" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
