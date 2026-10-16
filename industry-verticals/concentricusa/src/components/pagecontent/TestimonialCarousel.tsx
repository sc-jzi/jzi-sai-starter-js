'use client';

import { JSX, useEffect, useState } from 'react';
import { ImageField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

const AUTOPLAY_MS = 5000;

type QuerySlide = {
  id: string;
  image?: { jsonValue?: ImageField };
};

type ItemSlide = {
  id?: string;
  url?: string;
  fields?: {
    Image?: ImageField;
  };
};

export type TestimonialCarouselProps = ComponentProps & {
  fields?: {
    data?: {
      datasource?: {
        children?: {
          results?: QuerySlide[];
        };
      };
    };
    items?: ItemSlide[];
  };
};

const readSlides = (fields: TestimonialCarouselProps['fields']): QuerySlide[] => {
  const fromQuery = fields?.data?.datasource?.children?.results;
  if (fromQuery?.length) return fromQuery;

  return (fields?.items ?? []).map((item, index) => ({
    id: item.id || item.url || `slide-${index}`,
    image: { jsonValue: item.fields?.Image },
  }));
};

const TestimonialCarouselFallback = (): JSX.Element => (
  <div className="component testimonial-carousel">
    <div className="component-content">
      <span className="is-empty-hint">TestimonialCarousel</span>
    </div>
  </div>
);

const Chevron = ({ direction }: { direction: 'left' | 'right' }): JSX.Element => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
    {direction === 'left' ? <polyline points="15 18 9 12 15 6" /> : <polyline points="9 18 15 12 9 6" />}
  </svg>
);

export const Default = (props: TestimonialCarouselProps): JSX.Element => {
  const { fields, params } = props;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const hasDatasource = Boolean(fields?.data?.datasource) || Boolean(fields?.items);
  const slides = readSlides(fields).filter(
    (slide) => isPageEditing || Boolean(slide.image?.jsonValue?.value?.src)
  );
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPageEditing || isPaused || slides.length < 2) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [isPageEditing, isPaused, slides.length]);

  if (!hasDatasource) return <TestimonialCarouselFallback />;

  const safeIndex = slides.length ? index % slides.length : 0;
  const showControls = slides.length > 1;

  const go = (delta: number) => {
    if (slides.length < 2) return;
    setIndex((current) => (current + delta + slides.length) % slides.length);
  };

  return (
    <section
      className={`component testimonial-carousel ${params?.styles || ''}`}
      id={params?.RenderingIdentifier || undefined}
      aria-roledescription="carousel"
      aria-label="Testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container">
        <div className="testimonial-frame">
          {showControls && (
            <button
              type="button"
              className="testimonial-control testimonial-control-prev"
              aria-label="Previous testimonial"
              onClick={() => go(-1)}
            >
              <Chevron direction="left" />
            </button>
          )}
          <div className="testimonial-stage">
            {slides.length === 0 && <span className="is-empty-hint">Add testimonial images</span>}
            <div
              className="testimonial-track"
              style={{ transform: `translateX(-${safeIndex * 100}%)` }}
            >
              {slides.map((slide, slideIndex) => {
                const isActive = slideIndex === safeIndex;
                return (
                  <div
                    key={slide.id}
                    className={`testimonial-slide${isActive ? ' active' : ''}`}
                    aria-hidden={!isActive}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${slideIndex + 1} of ${slides.length}`}
                  >
                    <NextImage field={slide.image?.jsonValue} width={1600} height={280} />
                  </div>
                );
              })}
            </div>
          </div>
          {showControls && (
            <button
              type="button"
              className="testimonial-control testimonial-control-next"
              aria-label="Next testimonial"
              onClick={() => go(1)}
            >
              <Chevron direction="right" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};
