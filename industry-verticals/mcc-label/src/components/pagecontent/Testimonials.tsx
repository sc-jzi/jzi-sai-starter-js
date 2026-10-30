'use client';

import { JSX, useState } from 'react';
import { Field, ImageField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectCoverflow, Pagination } from 'swiper/modules';
import type { Swiper as SwiperInstance } from 'swiper';

interface TestimonialFields {
  Rating: Field<string>;
  Content: Field<string>;
  AuthorName: Field<string>;
  AuthorPosition: Field<string>;
  AuthorImage: ImageField;
}

export type TestimonialItemProps = {
  fields: TestimonialFields;
  name: string;
  url: string;
};

export type TestimonialsProps = {
  params: { [key: string]: string };
  fields: {
    items: TestimonialItemProps[];
  };
};

const StarRating = ({ item }: { item: TestimonialItemProps }): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const rating = item.fields?.Rating.value;
  const ratingField = isPageEditing && <Text field={item.fields?.Rating} />;

  if (!rating) return <></>;

  const maxStars = 5;
  const filledStars = Math.min(parseInt(rating), maxStars);
  const emptyStars = maxStars - filledStars;

  return (
    <div className="star-rating">
      {[...Array(filledStars)].map((_, index) => (
        <span key={index} className="star star-filled"></span>
      ))}
      {[...Array(emptyStars)].map((_, index) => (
        <span key={index} className="star star-empty"></span>
      ))}
      <span>{ratingField}</span>
    </div>
  );
};

const Testimonial = ({ item }: { item: TestimonialItemProps }): JSX.Element => {
  return (
    <div className="testimonial-item">
      <StarRating item={item} />
      <blockquote className="testimonial-content mt-5 mb-4">
        <Text field={item.fields.Content} />
      </blockquote>
      <div className="row align-items-center">
        <div className="col-auto">
          <NextImage
            field={item.fields.AuthorImage}
            className="author-image"
            width={100}
            height={100}
          />
        </div>
        <div className="col">
          <p className="author-name fs-4 fw-bold mb-1">
            <Text field={item.fields.AuthorName} />
          </p>
          <p className="author-position mb-0">
            <Text field={item.fields.AuthorPosition} />
          </p>
        </div>
      </div>
    </div>
  );
};

export const Default = (props: TestimonialsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const testimonials = props.fields?.items;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component testimonials ${sxaStyles}`} id={id ? id : undefined}>
      <div className="">
        <Swiper
          effect="coverflow"
          autoplay={{
            delay: 3000,
            disableOnInteraction: true,
          }}
          coverflowEffect={{
            rotate: 0,
            stretch: 0,
            depth: 0,
            modifier: 1,
          }}
          spaceBetween={0}
          slidesPerView={1}
          breakpoints={{
            992: {
              slidesPerView: 3,
            },
          }}
          pagination={{
            clickable: true,
          }}
          centeredSlides={true}
          loop={testimonials.length > 3}
          grabCursor={true}
          modules={[Autoplay, EffectCoverflow, Pagination]}
        >
          {testimonials?.map((item, i) => (
            <SwiperSlide key={`${item.url}${i}`}>
              <Testimonial key={item.url} item={item} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export const MccLabel = (props: TestimonialsProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

// MCC Label: one testimonial per slide, the quote beside a round product photo, arrows at the sides and dots below.
// The quote mark and arrows are drawn by the component.
export const MccLabelSlider = (props: TestimonialsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const items = props.fields?.items ?? [];
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);

  return (
    <section
      className={`component testimonials variant-mcc-label mcc-label-slider ${props.params?.styles || ''}`}
      id={id ? id : undefined}
    >
      <Swiper
        slidesPerView={1}
        loop={items.length > 1}
        autoHeight={false}
        allowTouchMove={!isPageEditing}
        pagination={{ clickable: true }}
        modules={[Pagination]}
        onSwiper={setSwiper}
      >
        {items.map((item, i) => (
          <SwiperSlide key={`${item.url}${i}`}>
            <div className="mcc-testimonial">
              <div className="mcc-testimonial-quote">
                <span className="quote-mark" aria-hidden="true">
                  &ldquo;
                </span>
                <div>
                  <blockquote>
                    <Text field={item.fields?.Content} />
                  </blockquote>
                  <p className="mcc-testimonial-author">
                    {(isPageEditing || item.fields?.AuthorName?.value) && (
                      <strong>
                        <Text field={item.fields?.AuthorName} />
                        {item.fields?.AuthorName?.value && item.fields?.AuthorPosition?.value ? ', ' : ''}
                      </strong>
                    )}
                    <Text field={item.fields?.AuthorPosition} />
                  </p>
                </div>
              </div>
              <div className="mcc-testimonial-photo">
                <NextImage field={item.fields?.AuthorImage} width={580} height={580} />
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {items.length > 1 && (
        <>
          <button type="button" className="mcc-slider-arrow prev" aria-label="Previous testimonial" onClick={() => swiper?.slidePrev()}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
          <button type="button" className="mcc-slider-arrow next" aria-label="Next testimonial" onClick={() => swiper?.slideNext()}>
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
          </button>
        </>
      )}
    </section>
  );
};
