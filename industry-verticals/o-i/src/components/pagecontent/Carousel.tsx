'use client';

import { useState, JSX } from 'react';
import {
  ComponentParams,
  ComponentRendering,
  Field,
  ImageField,
  RichTextField,
  LinkField,
  Text,
  Link,
  RichText,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
  Video: ImageField;
}

export type CarouselItemProps = {
  id: string;
  fields: Fields;
};

interface CarouselComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items: CarouselItemProps[];
  };
}

export const Default = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex < props.fields.items.length - 1 ? prevIndex + 1 : 0));
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : props.fields.items.length - 1));
  };

  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <section className={`component carousel ${sxaStyles}`} id={id ? id : undefined}>
      <div className="carousel-inner">
        {props.fields.items.map((item, i) => (
          <div key={i} className={'carousel-item ' + (i == index ? 'active' : '')}>
            {!isPageEditing && item.fields?.Video?.value?.src ? (
              <video
                className="object-fit-cover d-block w-100 h-100"
                key={item.id}
                autoPlay={true}
                loop={true}
                muted
                playsInline
                poster={item.fields.Image?.value?.src}
              >
                <source src={item.fields.Video.value.src} type="video/webm" />
              </video>
            ) : (
              <NextImage
                field={item.fields.Image}
                className="object-fit-cover d-block w-100 h-100"
                width={1920}
                height={800}
              />
            )}

            <div className="side-content">
              <div className="container">
                <div className="col-lg-5 col-md-6 offset-md-6 offset-lg-7">
                  <h1 className="display-6 fw-bold">
                    <Text field={item.fields.Title}></Text>
                  </h1>
                  <RichText field={item.fields.Text}></RichText>
                  {!isPageEditing && item.fields?.Link?.value?.href && (
                    <Link field={item.fields.Link} className="button button-accent"></Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ol className="carousel-indicators">
        {props.fields.items.map((_item, i) => (
          <li
            key={i}
            aria-label="Slide"
            className={i == index ? 'active' : ''}
            onClick={() => setIndex(i)}
          ></li>
        ))}
      </ol>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="prev"
        onClick={handlePrev}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
          </svg>
        </span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#carouselExampleCaptions"
        data-bs-slide="next"
        onClick={handleNext}
      >
        <span className="carousel-control-next-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
            <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
          </svg>
        </span>
        <span className="visually-hidden">Next</span>
      </button>
    </section>
  );
};

const CarouselEmpty = (): JSX.Element => (
  <div className="component carousel">
    <div className="component-content">
      <span className="is-empty-hint">Carousel</span>
    </div>
  </div>
);

/* OI variant — dark split slides, gold circular CTA, dots only */
export const OI = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const items = props.fields?.items || [];

  if (!items.length) {
    return <CarouselEmpty />;
  }

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : 0));
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : items.length - 1));
  };

  return (
    <section
      className={`component carousel oi-brand oi-carousel bg-[var(--brand-bg)] py-16 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
      aria-roledescription="carousel"
    >
      <div className="relative mx-auto max-w-[1280px] px-6">
        {items.map((item, i) => (
          <div
            key={item.id || i}
            className={i === index ? 'block' : 'hidden'}
            aria-hidden={i !== index}
          >
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div className="max-w-xl">
                <Text
                  field={item.fields.Title}
                  tag="h2"
                  className="m-0 text-[2.25rem] font-semibold leading-tight text-[var(--brand-fg)] md:text-[2.75rem]"
                />
                <RichText
                  field={item.fields.Text}
                  className="mt-5 text-[1.125rem] leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-4 [&_p:last-child]:mb-0 [&_p:first-child]:mb-4 [&_p:first-child]:text-xs [&_p:first-child]:font-bold [&_p:first-child]:uppercase [&_p:first-child]:tracking-[0.22em] [&_p:first-child]:text-[var(--brand-primary)]"
                />
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-[var(--brand-radius)] border border-[var(--brand-primary)]">
                  <NextImage
                    field={item.fields.Image}
                    className="h-auto w-full object-cover"
                    width={900}
                    height={700}
                  />
                </div>
                {(isPageEditing || item.fields?.Link?.value?.href) && (
                  isPageEditing ? (
                    <Link
                      field={item.fields.Link}
                      className="absolute -bottom-5 -right-4 flex h-[7.75rem] w-[7.75rem] items-center justify-center rounded-full bg-[var(--brand-primary)] px-3 text-center text-[11px] font-bold leading-tight text-[var(--brand-primary-foreground)] no-underline"
                    />
                  ) : (
                    <Link
                      field={item.fields.Link}
                      className="absolute -bottom-5 -right-4 flex h-[7.75rem] w-[7.75rem] flex-col items-center justify-center rounded-full bg-[var(--brand-primary)] px-3 text-center text-[11px] font-bold leading-tight text-[var(--brand-primary-foreground)] no-underline hover:brightness-95"
                    >
                      <span className="flex flex-col items-center gap-1">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <path
                            d="M4 12L12 4M12 4H6M12 4V10"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{item.fields.Link?.value?.text}</span>
                      </span>
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>
        ))}

        <div className="mt-12 flex items-center justify-center gap-3">
          <button
            type="button"
            className="sr-only"
            onClick={handlePrev}
          >
            Previous
          </button>
          {items.map((_item, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === index}
              className={`h-2.5 w-2.5 rounded-full border-0 p-0 ${
                i === index
                  ? 'bg-[var(--brand-primary)]'
                  : 'bg-[var(--brand-muted-fg)] opacity-50'
              }`}
              onClick={() => setIndex(i)}
            />
          ))}
          <button
            type="button"
            className="sr-only"
            onClick={handleNext}
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};
