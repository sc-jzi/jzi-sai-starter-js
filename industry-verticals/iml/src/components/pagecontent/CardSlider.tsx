'use client';

import { JSX, useRef } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
  DateField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue: T };

interface CardItem {
  id: string;
  image?: JsonValue<ImageField>;
  tag?: JsonValue<Field<string>>;
  category?: JsonValue<Field<string>>;
  date?: JsonValue<Field<string>>;
  title?: JsonValue<Field<string>>;
  text?: JsonValue<RichTextField>;
  link?: JsonValue<LinkField>;
}

interface Fields {
  data?: {
    datasource?: {
      heading?: JsonValue<Field<string>>;
      link?: JsonValue<LinkField>;
      children?: { results?: CardItem[] };
    };
  };
}

export type CardSliderProps = ComponentProps & {
  fields: Fields;
};

type Look = 'default' | 'iml' | 'stories' | 'resources';

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })
    : '';

/* Arrows and chevrons are decoration, drawn here */
const Chevron = ({ left }: { left?: boolean }) => (
  <svg viewBox="0 0 8 14" width="8" height="14" aria-hidden="true">
    <path
      d={left ? 'M7 1L1 7l6 6' : 'M1 1l6 6-6 6'}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Card = ({ item, look, isPageEditing }: { item: CardItem; look: Look; isPageEditing: boolean }) => {
  const hasImage = !!item.image?.jsonValue?.value?.src;
  const date = item.date?.jsonValue?.value;
  const link = item.link?.jsonValue as LinkField | undefined;

  if (look === 'stories') {
    return (
      <article className="iml-card iml-card--story">
        {(isPageEditing || item.tag?.jsonValue?.value) && (
          <span className="iml-card__tag">
            <Text field={item.tag?.jsonValue} />
          </span>
        )}
        {(isPageEditing || item.category?.jsonValue?.value) && (
          <p className="iml-card__category">
            <Text field={item.category?.jsonValue} />
          </p>
        )}
        <h3 className="iml-card__title iml-card__title--large">
          <Text field={item.title?.jsonValue} />
        </h3>
        {(isPageEditing || link?.value?.href) && <Link field={link as LinkField} className="iml-card__link" />}
      </article>
    );
  }

  if (look === 'resources') {
    return (
      <article className="iml-card iml-card--resource">
        <div className="iml-card__media">
          {(isPageEditing || hasImage) && (
            <NextImage field={item.image?.jsonValue} className="iml-card__img" width={316} height={240} />
          )}
          {(isPageEditing || item.tag?.jsonValue?.value) && (
            <span className="iml-card__tag iml-card__tag--floating">
              <Text field={item.tag?.jsonValue} />
            </span>
          )}
        </div>
        <div className="iml-card__body">
          {(isPageEditing || item.category?.jsonValue?.value) && (
            <p className="iml-card__category iml-card__category--dot">
              <Text field={item.category?.jsonValue} />
            </p>
          )}
          {(isPageEditing || date) && (
            <p className="iml-card__date">
              <DateField
                field={item.date?.jsonValue ?? { value: '' }}
                render={(d) => formatDate(d?.toISOString())}
              />
            </p>
          )}
          <h3 className="iml-card__title">
            {link?.value?.href && !isPageEditing ? (
              <Link field={link} className="iml-card__title-link">
                {item.title?.jsonValue?.value}
              </Link>
            ) : (
              <Text field={item.title?.jsonValue} />
            )}
          </h3>
          <RichText field={item.text?.jsonValue} className="iml-card__text" />
        </div>
      </article>
    );
  }

  return (
    <article className="iml-card iml-card--image">
      <div className="iml-card__media">
        {(isPageEditing || hasImage) && (
          <NextImage field={item.image?.jsonValue} className="iml-card__img" width={528} height={420} />
        )}
      </div>
      <div className="iml-card__overlay">
        <h3 className="iml-card__title iml-card__title--bold">
          <Text field={item.title?.jsonValue} />
        </h3>
        <RichText field={item.text?.jsonValue} className="iml-checklist iml-checklist--small" />
      </div>
      {(isPageEditing || link?.value?.href) && (
        <Link field={link as LinkField} className="iml-card__footer-link">
          {link?.value?.text}
          <Chevron />
        </Link>
      )}
    </article>
  );
};

const CardSliderView = (props: CardSliderProps, look: Look): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const track = useRef<HTMLDivElement>(null);
  const datasource = props.fields?.data?.datasource;
  const cards = datasource?.children?.results ?? [];
  const lookClass = look === 'default' ? '' : `iml-slider iml-slider--${look}`;

  if (!datasource) {
    return (
      <div className={`component card-slider ${lookClass} ${sxaStyles}`} id={id ? id : undefined}>
        <div className="component-content">CardSlider: no datasource</div>
      </div>
    );
  }

  // Four or fewer cards that fit the row are a static grid; more cards slide
  const slides = look !== 'resources' && cards.length > 0;
  const scroll = (dir: number) => {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: 'smooth' });
  };
  const viewAll = datasource.link?.jsonValue as LinkField | undefined;

  return (
    <div className={`component card-slider ${lookClass} ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-container">
        {(isPageEditing || datasource.heading?.jsonValue?.value) && (
          <h2 className="iml-section-title">
            <Text field={datasource.heading?.jsonValue} />
          </h2>
        )}
      </div>
      <div className={`iml-slider__track ${slides ? 'is-sliding' : 'is-grid'}`} ref={track}>
        {cards.map((item) => (
          <Card key={item.id} item={item} look={look === 'default' ? 'iml' : look} isPageEditing={isPageEditing} />
        ))}
      </div>
      <div className={`iml-container iml-slider__controls ${slides ? '' : 'is-centered'}`}>
        {slides && (
          <div className="iml-slider__arrows">
            <button type="button" className="iml-slider__arrow" aria-label="Previous" onClick={() => scroll(-1)}>
              <Chevron left />
            </button>
            <button type="button" className="iml-slider__arrow" aria-label="Next" onClick={() => scroll(1)}>
              <Chevron />
            </button>
          </div>
        )}
        {(isPageEditing || viewAll?.value?.href) && (
          <Link field={viewAll as LinkField} className="iml-slider__more button-link">
            {viewAll?.value?.text}
            {!slides && <Chevron />}
          </Link>
        )}
      </div>
    </div>
  );
};

export const Default = (props: CardSliderProps): JSX.Element => CardSliderView(props, 'default');

/* Iml: image cards with a white rounded panel (title + check list) and a link bar, sliding */
export const Iml = (props: CardSliderProps): JSX.Element => CardSliderView(props, 'iml');

/* ImlStories: text-only blue-grey cards (tag, category, large title, Read story), sliding */
export const ImlStories = (props: CardSliderProps): JSX.Element => CardSliderView(props, 'stories');

/* ImlResources: a static row of resource cards (image with floating tag, category, date, title, text) */
export const ImlResources = (props: CardSliderProps): JSX.Element => CardSliderView(props, 'resources');
