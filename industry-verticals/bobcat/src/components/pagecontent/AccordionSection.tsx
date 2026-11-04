'use client';

import { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * AccordionSection: a headline block (Eyebrow, Title, Text) and expandable panels (children: Title, Body);
 * the first panel starts open (FAQ and offer looks only when OpenFirst is ticked); "Expand all" shows when ExpandAllLabel is filled.
 * Looks: WithImage = panels left, Image right. Faq = one column of questions, plus a schema.org FAQPage
 * JSON-LD block built from the panels; it renders on the server pass, so it is in the initial HTML.
 */

type JsonField<T> = { jsonValue?: T };

export interface AccordionPanelItem {
  id: string;
  title?: JsonField<Field<string>>;
  count?: JsonField<Field<string>>;
  body?: JsonField<RichTextField>;
}

export type AccordionSectionProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        eyebrow?: JsonField<Field<string>>;
        title?: JsonField<Field<string>>;
        text?: JsonField<RichTextField>;
        image?: JsonField<ImageField>;
        expandAllLabel?: JsonField<Field<string>>;
        openFirst?: JsonField<Field<boolean | string>>;
        children?: { results?: AccordionPanelItem[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat' | 'with-image' | 'faq';

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

/** Plain text of a Rich Text answer for the FAQPage JSON-LD (search engines want text, not markup). */
const plainText = (html?: string) =>
  `${html || ''}`
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/(p|li|div|h\d)>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&(#\d+|#x[0-9a-f]+|\w+);/gi, (m, e: string) => {
      if (e[0] === '#') {
        const code =
          e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
        return Number.isFinite(code) ? String.fromCodePoint(code) : m;
      }
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();

const faqJsonLd = (panels: AccordionPanelItem[]) => {
  const mainEntity = panels
    .map((p) => ({
      question: `${p.title?.jsonValue?.value || ''}`.trim(),
      answer: plainText(p.body?.jsonValue?.value as string | undefined),
    }))
    .filter((q) => q.question && q.answer)
    .map((q) => ({
      '@type': 'Question',
      name: q.question,
      acceptedAnswer: { '@type': 'Answer', text: q.answer },
    }));
  if (!mainEntity.length) return null;
  // "<" is escaped so the JSON can never close the script tag
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity,
  }).replace(/</g, '\\u003c');
};

const Chevron = ({ open }: { open: boolean }): JSX.Element => (
  <svg
    className={`accordion-section__chevron ${open ? 'is-open' : ''}`}
    viewBox="0 0 24 24"
    width="18"
    height="18"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const AccordionSectionView = ({
  props,
  look,
}: {
  props: AccordionSectionProps;
  look: Look;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const panels = datasource?.children?.results ?? [];
  // FAQ and offer groups start collapsed (as on the prospect's pages) unless OpenFirst is ticked; the other looks open the first panel.
  const openFirst = [true, '1', 'true'].includes(datasource?.openFirst?.jsonValue?.value as boolean | string);
  const startClosed = (look === 'faq' || look === 'bobcat') && !openFirst;
  const [open, setOpen] = useState<string[]>(panels[0] && !startClosed ? [panels[0].id] : []);

  if (!datasource) {
    return (
      <div className={`component accordion-section ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Accordion Section: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const eyebrow = datasource.eyebrow?.jsonValue;
  const title = datasource.title?.jsonValue;
  const text = datasource.text?.jsonValue;
  const image = datasource.image?.jsonValue;
  const expandAll = datasource.expandAllLabel?.jsonValue;
  const allOpen = panels.length > 0 && panels.every((p) => open.includes(p.id));
  const isOpen = (pid: string) => isEditing || open.includes(pid);
  const toggle = (pid: string) =>
    setOpen((o) => (o.includes(pid) ? o.filter((x) => x !== pid) : [...o, pid]));
  const jsonLd = look === 'faq' ? faqJsonLd(panels) : null;
  const showImage = look === 'with-image' && (isEditing || !!image?.value?.src);

  const list = (
    <div className="accordion-section__panels">
      {(isEditing || !!expandAll?.value) && panels.length > 1 && (
        <div className="accordion-section__toolbar">
          {isEditing ? (
            <span className="accordion-section__expand-all">
              <Text field={expandAll} />
            </span>
          ) : (
            <button
              type="button"
              className="accordion-section__expand-all"
              onClick={() => setOpen(allOpen ? [] : panels.map((p) => p.id))}
            >
              {expandAll?.value}
            </button>
          )}
        </div>
      )}
      {panels.map((panel) => {
        const opened = isOpen(panel.id);
        const headId = `${id || datasource.id || 'accordion'}-${panel.id}-head`;
        const bodyId = `${id || datasource.id || 'accordion'}-${panel.id}-body`;
        return (
          <div className={`accordion-section__panel ${opened ? 'is-open' : ''}`} key={panel.id}>
            {look === 'bobcat' ? (
              // offer groups: the whole bar toggles; it holds the h3 title and the item count after it
              <div
                role="button"
                tabIndex={0}
                id={headId}
                className="accordion-section__trigger"
                aria-expanded={opened}
                aria-controls={bodyId}
                onClick={() => !isEditing && toggle(panel.id)}
                onKeyDown={(e) => {
                  if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    toggle(panel.id);
                  }
                }}
              >
                <Chevron open={opened} />
                <h3 className="accordion-section__panel-heading accordion-section__panel-title">
                  <Text field={panel.title?.jsonValue} />
                </h3>
                {(isEditing || !!panel.count?.jsonValue?.value) && (
                  <p className="accordion-section__count">
                    <Text field={panel.count?.jsonValue} />
                  </p>
                )}
              </div>
            ) : look === 'faq' ? (
              // the question itself is the heading; the whole bar toggles it (a row count, when filled, follows the heading)
              <div className="accordion-section__faq-head">
              <h3 className="accordion-section__panel-heading">
                <span
                  role="button"
                  tabIndex={0}
                  id={headId}
                  className="accordion-section__trigger"
                  aria-expanded={opened}
                  aria-controls={bodyId}
                  onClick={() => !isEditing && toggle(panel.id)}
                  onKeyDown={(e) => {
                    if (!isEditing && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      toggle(panel.id);
                    }
                  }}
                >
                  <Chevron open={opened} />
                  <span className="accordion-section__panel-title">
                    <Text field={panel.title?.jsonValue} />
                  </span>
                </span>
              </h3>
              {(isEditing || !!panel.count?.jsonValue?.value) && (
                <span className="accordion-section__count">
                  <Text field={panel.count?.jsonValue} />
                </span>
              )}
              </div>
            ) : (
              <button
                type="button"
                id={headId}
                className="accordion-section__trigger"
                aria-expanded={opened}
                aria-controls={bodyId}
                onClick={() => !isEditing && toggle(panel.id)}
              >
                <Chevron open={opened} />
                <h3 className="accordion-section__panel-heading accordion-section__panel-title">
                  <Text field={panel.title?.jsonValue} />
                </h3>
              </button>
            )}
            <div
              id={bodyId}
              role="region"
              aria-labelledby={headId}
              className="accordion-section__body"
              hidden={!opened}
            >
              <RichText field={panel.body?.jsonValue} />
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={`component accordion-section accordion-section--${look} ${styles}`}
      id={id ? id : undefined}
    >
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <div className="accordion-section__inner">
        {(isEditing || !!eyebrow?.value || !!title?.value || !!text?.value) && (
          <div className="accordion-section__header">
            {(isEditing || !!eyebrow?.value) && (
              <h2 className="accordion-section__eyebrow">
                <Text field={eyebrow} />
              </h2>
            )}
            {(isEditing || !!title?.value) && (
              <h2 className="accordion-section__title">
                <Text field={title} />
              </h2>
            )}
            {(isEditing || !!text?.value) && (
              <RichText field={text} className="accordion-section__text" />
            )}
          </div>
        )}
        {showImage ? (
          <div className="accordion-section__split">
            {list}
            <div className="accordion-section__media">
              <NextImage
                field={image}
                width={720}
                height={540}
                className="accordion-section__image"
              />
            </div>
          </div>
        ) : (
          list
        )}
      </div>
    </div>
  );
};

export const Default = (props: AccordionSectionProps): JSX.Element => (
  <AccordionSectionView props={props} look="default" />
);

export const Bobcat = (props: AccordionSectionProps): JSX.Element => (
  <AccordionSectionView props={props} look="bobcat" />
);

export const BobcatWithImage = (props: AccordionSectionProps): JSX.Element => (
  <AccordionSectionView props={props} look="with-image" />
);

export const BobcatFaq = (props: AccordionSectionProps): JSX.Element => (
  <AccordionSectionView props={props} look="faq" />
);
