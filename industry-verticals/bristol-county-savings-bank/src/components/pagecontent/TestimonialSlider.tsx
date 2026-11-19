'use client';

import { JSX, useState } from 'react';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue?: T };

interface Quote {
  id?: string;
  content?: JsonValue<Field<string>>;
  authorName?: JsonValue<Field<string>>;
  authorPosition?: JsonValue<Field<string>>;
}

export type TestimonialSliderProps = ComponentProps & {
  fields?: { data?: { datasource?: { heading?: JsonValue<Field<string>>; children?: { results?: Quote[] } } } };
};

const Arrow = ({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }): JSX.Element => (
  <a
    href="#"
    role="button"
    className={`testimonial-slider__arrow testimonial-slider__arrow--${dir}`}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
  >
    <svg viewBox="0 0 20 60" width="20" height="60" aria-hidden="true">
      <path d={dir === 'prev' ? 'M18 2 L2 30 L18 58' : 'M2 2 L18 30 L2 58'} fill="none" stroke="currentColor" strokeWidth="1.5" />
    </svg>
    <span className="sr-only">{dir === 'prev' ? 'Scroll left...' : 'Scroll right...'}</span>
  </a>
);

const Body = ({ props, className }: { props: TestimonialSliderProps; className: string }): JSX.Element => {
  const { page } = useSitecore();
  const editing = !!page?.mode?.isEditing;
  const ds = props.fields?.data?.datasource;
  const quotes = ds?.children?.results ?? [];
  const [i, setI] = useState(0);
  const id = props.params?.RenderingIdentifier;

  if (!ds) {
    return (
      <div className={`component testimonial-slider ${className}`} id={id}>
        <span className="is-empty-hint">Testimonials</span>
      </div>
    );
  }

  const shown = quotes; // all slides stay in the track (as on the bank's slider); the track slides to the active one
  const go = (d: number) => setI((v) => (quotes.length ? (v + d + quotes.length) % quotes.length : 0));

  return (
    <section className={`component testimonial-slider ${className}`} id={id}>
      <div className="container">
        <Text tag="h2" className="testimonial-slider__heading" field={ds.heading?.jsonValue} />
        <div className="testimonial-slider__stage">
          {!editing && quotes.length > 1 && <Arrow dir="prev" onClick={() => go(-1)} />}
          <div className="testimonial-slider__slides">
            <div className="testimonial-slider__track" style={editing ? { flexDirection: 'column' } : { transform: `translateX(-${i * 100}%)` }}>
            {shown.map((q) => (
              <figure key={q.id} className="testimonial-slider__quote">
                <blockquote>
                  <Text tag="p" field={q.content?.jsonValue} />
                </blockquote>
                <figcaption>
                  <Text tag="p" className="testimonial-slider__name eyebrow" field={q.authorName?.jsonValue} />
                  <Text tag="span" className="testimonial-slider__position" field={q.authorPosition?.jsonValue} />
                </figcaption>
              </figure>
            ))}
            </div>
          </div>
          {!editing && quotes.length > 1 && <Arrow dir="next" onClick={() => go(1)} />}
        </div>
        {!editing && quotes.length > 1 && (
          <div className="testimonial-slider__dots" role="tablist">
            {quotes.map((q, k) => (
              <button key={q.id} type="button" role="tab" aria-selected={k === i} className={k === i ? 'is-active' : ''} onClick={() => setI(k)}>
                <span className="sr-only">Jump to slide {k + 1}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export const Default = (props: TestimonialSliderProps): JSX.Element => <Body props={props} className={props.params?.styles || ''} />;

export const BristolCountySavingsBank = (props: TestimonialSliderProps): JSX.Element => (
  <Body props={props} className={`testimonial-slider--bcsb ${props.params?.styles || ''}`} />
);
