'use client';

import { JSX, useRef, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * ProductCards: a parent datasource (Eyebrow, Title, Link = "View all") with Product Card children
 * (Image, Badge, Title, Highlight, Subtitle, Text, Link). Data comes from the rendering's ComponentQuery.
 * Looks are named variant exports; each one only changes order and styling, never the item shape.
 */

type JsonField<T> = { jsonValue?: T };

export interface ProductCardItem {
  id: string;
  image?: JsonField<ImageField>;
  badge?: JsonField<Field<string>>;
  title?: JsonField<Field<string>>;
  tag?: JsonField<Field<string>>;
  highlight?: JsonField<Field<string>>;
  subtitle?: JsonField<Field<string>>;
  priceLabel?: JsonField<Field<string>>;
  price?: JsonField<Field<string>>;
  text?: JsonField<RichTextField>;
  link?: JsonField<LinkField>;
}

/** A card as the ComponentQuery returns it: `fields(ownFields: true) { name jsonValue }` (one selection keeps the
 * query inside Edge's depth limit), or the older aliased shape. */
type RawCard = ProductCardItem & { fields?: { name: string; jsonValue?: unknown }[] };

const CARD_FIELD_KEYS: Record<string, keyof ProductCardItem> = {
  Image: 'image',
  Badge: 'badge',
  Title: 'title',
  Tag: 'tag',
  Highlight: 'highlight',
  Subtitle: 'subtitle',
  PriceLabel: 'priceLabel',
  Price: 'price',
  Text: 'text',
  Link: 'link',
};

const toCard = (raw: RawCard): ProductCardItem => {
  if (!Array.isArray(raw.fields)) return raw;
  const card: Record<string, unknown> = { id: raw.id };
  for (const f of raw.fields) {
    const key = CARD_FIELD_KEYS[f.name];
    if (key) card[key] = { jsonValue: f.jsonValue };
  }
  return card as unknown as ProductCardItem;
};

interface ProductCardsDatasource {
  id?: string;
  eyebrow?: JsonField<Field<string>>;
  title?: JsonField<Field<string>>;
  link?: JsonField<LinkField>;
  children?: { results?: RawCard[] };
}

export type ProductCardsProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: ProductCardsDatasource;
    };
  };
};

type Look =
  | 'default'
  | 'offer-cards'
  | 'two-up'
  | 'two-up-dark'
  | 'size-cards'
  | 'feature-grid'
  | 'attachments'
  | 'slider'
  | 'slider-dark'
  | 'stories';

const hasText = (f?: Field<string> | RichTextField) => !!f?.value;
const hasLink = (f?: LinkField) => !!f?.value?.href;
const hasImage = (f?: ImageField) => !!f?.value?.src;

const ProductCardsEmpty = ({ id, styles }: { id?: string; styles: string }): JSX.Element => (
  <div className={`component product-cards ${styles}`} id={id}>
    <div className="component-content">
      <span className="is-empty-hint">Product Cards: choose or create a datasource</span>
    </div>
  </div>
);

const Card = ({
  item,
  look,
  isEditing,
}: {
  item: ProductCardItem;
  look: Look;
  isEditing: boolean;
}): JSX.Element => {
  const image = item.image?.jsonValue;
  const badge = item.badge?.jsonValue;
  const title = item.title?.jsonValue;
  const tag = item.tag?.jsonValue;
  const highlight = item.highlight?.jsonValue;
  const price = item.price?.jsonValue;
  const priceLabel = item.priceLabel?.jsonValue;
  const subtitle = item.subtitle?.jsonValue;
  const text = item.text?.jsonValue;
  const link = item.link?.jsonValue;
  const show = (ok: boolean) => isEditing || ok;
  // Offer cards: the badge sits on the photo; elsewhere it is the small heading above the title.
  const badgeOnImage = look === 'offer-cards';
  // Offer and two-up cards carry the card title on a layer behind the photo (the prospect's card markup).
  const titleLayer = (look === 'offer-cards' || look === 'two-up') && !isEditing && hasText(title);

  const badgeEl =
    show(hasText(badge)) &&
    (badgeOnImage ? (
      <div className="product-card__badge">
        <Text field={badge} />
      </div>
    ) : (
      <h4 className="product-card__badge">
        <span>
          <Text field={badge} />
        </span>
      </h4>
    ));
  const imageEl = show(hasImage(image)) && (
    <div className="product-card__media">
      {titleLayer && (
        <h3 className="product-card__title-layer" aria-hidden="true">
          {title?.value}
        </h3>
      )}
      <NextImage field={image} width={720} height={480} className="product-card__image" />
      {badgeOnImage && badgeEl}
    </div>
  );
  const titleEl = show(hasText(title)) && (
    <h3 className="product-card__title">
      <Text field={title} />
    </h3>
  );
  // FeatureGrid: the Tag groups the cards into the toggle buttons instead of showing on the card
  const tagEl = look !== 'feature-grid' && show(hasText(tag)) && (
    <div className="product-card__tag">
      <Text field={tag} />
    </div>
  );
  // "Starting at" is its own line before the price, as on the prospect's offer cards.
  const priceLabelEl = show(hasText(priceLabel)) && (
    <p className="product-card__price-label">
      <Text field={priceLabel} />
    </p>
  );
  const priceEl = show(hasText(price)) && (
    <h4 className="product-card__price">
      <Text field={price} />
    </h4>
  );
  const showHighlight = show(hasText(highlight));
  const showSubtitle = show(hasText(subtitle));
  // Attachments: the subtitle ("5 Options Available") is a small line above the title.
  const subtitleAbove = look === 'attachments';
  const offerEl = (showHighlight || (showSubtitle && !subtitleAbove)) && (
    <h4 className="product-card__offer">
      {showHighlight && (
        <span className="product-card__highlight">
          <Text field={highlight} />
        </span>
      )}
      {showSubtitle && !subtitleAbove && (
        <span className="product-card__subtitle">
          <Text field={subtitle} />
        </span>
      )}
    </h4>
  );
  const subtitleAboveEl = subtitleAbove && showSubtitle && (
    <p className="product-card__subtitle">
      <Text field={subtitle} />
    </p>
  );
  const textEl = show(hasText(text)) && <RichText field={text} className="product-card__text" />;
  // Slider (offer cards): the whole card is the link, no link line (as on the prospect's page)
  const stretched = look === 'slider' && !isEditing && hasLink(link);
  const linkEl = stretched ? (
    <a
      className="product-card__stretched"
      href={link?.value?.href}
      target={link?.value?.target || undefined}
      aria-label={link?.value?.text || title?.value || link?.value?.href}
    />
  ) : (
    show(hasLink(link)) && (
      <div className="product-card__actions">
        <Link
          field={link as LinkField}
          className={
            look === 'size-cards'
              ? 'bobcat-button bobcat-button--block'
              : look === 'attachments'
                ? 'bobcat-arrow-link product-card__cta'
                : 'bobcat-arrow-link'
          }
        />
      </div>
    )
  );

  // Size cards: the title sits in a dark bar right under the photo.
  if (look === 'size-cards') {
    return (
      <div className="product-card">
        {imageEl}
        {titleEl}
        <div className="product-card__body">
          {badgeEl}
          {tagEl}
          {offerEl}
          {priceLabelEl}
          {priceEl}
          {textEl}
        </div>
        {linkEl}
      </div>
    );
  }

  return (
    <div className="product-card">
      {imageEl}
      <div className="product-card__body">
        {(!badgeOnImage || !imageEl) && badgeEl}
        {subtitleAboveEl}
        {titleEl}
        {tagEl}
        {offerEl}
        {priceLabelEl}
        {priceEl}
        {textEl}
        {linkEl}
      </div>
    </div>
  );
};

const SliderTrack = ({
  items,
  look,
  isEditing,
}: {
  items: ProductCardItem[];
  look: Look;
  isEditing: boolean;
}): JSX.Element => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('.product-cards__item');
    const step = card ? card.offsetWidth + 16 : track.clientWidth;
    track.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  return (
    <div className="product-cards__slider">
      <div className="product-cards__track" ref={trackRef}>
        {items.map((item) => (
          <div className="product-cards__item" key={item.id}>
            <Card item={item} look={look} isEditing={isEditing} />
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="product-cards__controls">
          <button
            type="button"
            className="product-cards__arrow product-cards__arrow--prev"
            aria-label="Previous"
            onClick={() => scroll(-1)}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="M15 4 7 12l8 8" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </button>
          <button
            type="button"
            className="product-cards__arrow product-cards__arrow--next"
            aria-label="Next"
            onClick={() => scroll(1)}
          >
            <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true">
              <path d="m9 4 8 8-8 8" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

const ProductCardsView = ({
  props,
  look,
}: {
  props: ProductCardsProps;
  look: Look;
}): JSX.Element => {
  const { page } = useSitecore();
  const [activeGroup, setActiveGroup] = useState('');
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;

  if (!datasource) {
    return <ProductCardsEmpty id={id} styles={styles} />;
  }

  const allItems = (datasource.children?.results ?? []).map(toCard);
  // FeatureGrid: the cards' Tag values become toggle buttons (Classic / Pro); untagged cards always show.
  const groups =
    look === 'feature-grid'
      ? [...new Set(allItems.map((i) => i.tag?.jsonValue?.value || '').filter(Boolean))]
      : [];
  const current = groups.includes(activeGroup) ? activeGroup : groups[0];
  const items =
    groups.length && !isEditing
      ? allItems.filter((i) => !i.tag?.jsonValue?.value || i.tag.jsonValue.value === current)
      : allItems;
  const priced = allItems.some((i) => hasText(i.price?.jsonValue));
  const eyebrow = datasource.eyebrow?.jsonValue;
  const title = datasource.title?.jsonValue;
  const link = datasource.link?.jsonValue;
  const showHeader = isEditing || hasText(eyebrow) || hasText(title) || hasLink(link);
  const isSlider = look === 'slider' || look === 'slider-dark';

  return (
    <div
      className={`component product-cards product-cards--${look}${priced ? ' product-cards--priced' : ''} ${styles}`}
      id={id ? id : undefined}
    >
      <div className="product-cards__band">
        <div className="product-cards__inner">
          {showHeader && (
            <div className="product-cards__header">
              {(isEditing || hasText(eyebrow)) && (
                <h2 className="product-cards__eyebrow">
                  <Text field={eyebrow} />
                </h2>
              )}
              {(isEditing || hasText(title)) && (
                <h2 className="product-cards__heading">
                  <Text field={title} />
                </h2>
              )}
              {(isEditing || hasLink(link)) && (
                <Link
                  field={link as LinkField}
                  className="bobcat-arrow-link product-cards__view-all"
                />
              )}
            </div>
          )}
          {groups.length > 0 && !isEditing && (
            <div className="product-cards__tabs" role="tablist">
              {groups.map((g) => (
                <button
                  type="button"
                  role="tab"
                  key={g}
                  aria-selected={g === current}
                  className={`product-cards__tab${g === current ? ' is-active' : ''}`}
                  onClick={() => setActiveGroup(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          {isSlider ? (
            <SliderTrack items={items} look={look} isEditing={isEditing} />
          ) : (
            <div className="product-cards__grid">
              {items.map((item) => (
                <div className="product-cards__item" key={item.id}>
                  <Card item={item} look={look} isEditing={isEditing} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="default" />
);

export const Bobcat = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="offer-cards" />
);

export const BobcatOfferCards = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="offer-cards" />
);

export const BobcatTwoUp = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="two-up" />
);

export const BobcatTwoUpDark = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="two-up-dark" />
);

export const BobcatSizeCards = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="size-cards" />
);

export const BobcatFeatureGrid = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="feature-grid" />
);

export const BobcatAttachments = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="attachments" />
);

export const BobcatSlider = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="slider" />
);

export const BobcatSliderDark = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="slider-dark" />
);

export const BobcatStories = (props: ProductCardsProps): JSX.Element => (
  <ProductCardsView props={props} look="stories" />
);
