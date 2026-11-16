"use client";

import React, { JSX, useCallback, useEffect, useState } from "react";
import {
  Field,
  ImageField,
  Link as ContentSdkLink,
  LinkField,
  NextImage as ContentSdkImage,
  Text,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";

type JsonValue<T> = { jsonValue?: T };

interface HeroCarouselSlide {
  id: string;
  eyebrow?: JsonValue<Field<string>>;
  title?: JsonValue<Field<string>>;
  text?: JsonValue<Field<string>>;
  image?: JsonValue<ImageField>;
  link?: JsonValue<LinkField>;
}

interface HeroCarouselDatasource {
  id?: string;
  title?: JsonValue<Field<string>>;
  children?: { results?: HeroCarouselSlide[] };
}

export type HeroCarouselProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: HeroCarouselDatasource;
    };
  };
};

const AUTO_ADVANCE_MS = 6000;

const HeroCarouselEmpty = ({
  className,
}: {
  className: string;
}): JSX.Element => (
  <section className={`component hero-carousel ${className}`}>
    <div className="component-content">
      <span className="is-empty-hint">
        Hero Carousel: select a datasource with slides
      </span>
    </div>
  </section>
);

const ChevronLeft = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path
      d="M13 3 6 10l7 7"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);

const ChevronRight = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    aria-hidden="true"
  >
    <path d="m7 3 7 7-7 7" fill="none" stroke="currentColor" strokeWidth="3" />
  </svg>
);

/** Shared slider: both variants render the same elements; the variant class drives the look. */
const HeroCarouselView = ({
  props,
  variantClass,
  brandLabel = false,
}: {
  props: HeroCarouselProps;
  variantClass: string;
  /** Tmx: the eyebrow is the slide's brand label (a heading, as on tmx.com) and the photo is the slide's CSS background. */
  brandLabel?: boolean;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const datasource = props.fields?.data?.datasource;
  const slides = datasource?.children?.results ?? [];
  const count = slides.length;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(
    () => setIndex((i) => (count ? (i + 1) % count : 0)),
    [count],
  );
  const prev = useCallback(
    () => setIndex((i) => (count ? (i - 1 + count) % count : 0)),
    [count],
  );

  useEffect(() => {
    if (isEditing || paused || count < 2) return;
    const timer = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [isEditing, paused, count, next]);

  if (!datasource) return <HeroCarouselEmpty className={variantClass} />;

  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || "";
  const showControls = !isEditing && count > 1;
  const anchor = `#${id || "hero-carousel"}`;
  const go = (step: () => void) => (e: React.MouseEvent) => {
    e.preventDefault();
    step();
  };

  return (
    <section
      className={`component hero-carousel ${variantClass} ${isEditing ? "is-editing" : ""} ${styles}`}
      id={id ? id : undefined}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
    >
      <div className="hc-slides">
        {slides.map((slide, i) => {
          const eyebrow = slide.eyebrow?.jsonValue;
          const title = slide.title?.jsonValue;
          const text = slide.text?.jsonValue;
          const image = slide.image?.jsonValue;
          const link = slide.link?.jsonValue;
          const active = isEditing || i === index;
          // Tmx outside editing: the photo is the slide's CSS background (tmx.com banners); editing keeps the Image field editable.
          const cssBg = brandLabel && !isEditing && image?.value?.src;
          return (
            <div
              key={slide.id || i}
              className={`hc-slide ${active ? "active" : ""}`}
              aria-hidden={!active}
              aria-roledescription="slide"
              style={
                cssBg
                  ? { backgroundImage: `url("${image?.value?.src}")` }
                  : undefined
              }
            >
              {!cssBg && (isEditing || image?.value?.src) && (
                <ContentSdkImage
                  field={image}
                  className="hc-slide-bg"
                  width={1920}
                  height={400}
                />
              )}
              <div className="hc-slide-content">
                {(isEditing || eyebrow?.value) && (
                  <Text
                    field={eyebrow}
                    tag={brandLabel ? "h3" : "p"}
                    className="hc-eyebrow"
                  />
                )}
                {(isEditing || title?.value) && (
                  <Text field={title} tag="h2" className="hc-title" />
                )}
                {(isEditing || text?.value) && (
                  <Text field={text} tag="p" className="hc-text" />
                )}
                {(isEditing || link?.value?.href) && (
                  <ContentSdkLink
                    field={link as LinkField}
                    className="hc-button"
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      {showControls && (
        <>
          <a
            href={anchor}
            role="button"
            className="hc-arrow hc-arrow-prev"
            onClick={go(prev)}
          >
            <ChevronLeft />
            <span className="visually-hidden">Previous</span>
          </a>
          <a
            href={anchor}
            role="button"
            className="hc-arrow hc-arrow-next"
            onClick={go(next)}
          >
            <ChevronRight />
            <span className="visually-hidden">Next</span>
          </a>
          <ol className="hc-dots">
            {slides.map((slide, i) => (
              <li key={slide.id || i}>
                <button
                  type="button"
                  aria-label={`Slide ${i + 1}`}
                  aria-current={i === index}
                  className={i === index ? "active" : ""}
                  onClick={() => setIndex(i)}
                ></button>
              </li>
            ))}
          </ol>
        </>
      )}
    </section>
  );
};

/* Default: plain slider (image background, centred copy, button, arrows, dots) */
export const Default = (props: HeroCarouselProps): JSX.Element => (
  <HeroCarouselView props={props} variantClass="variant-default" />
);

/* Tmx: tmx.com home banner, full-width 400px, slate fallback, condensed eyebrow, teal pill button, grey chevrons, pill dots */
export const Tmx = (props: HeroCarouselProps): JSX.Element => (
  <HeroCarouselView props={props} variantClass="variant-tmx" brandLabel />
);
