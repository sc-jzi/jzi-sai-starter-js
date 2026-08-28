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

/* PentairFlow variant — stage plus labeled thumbnail strip */
export const PentairFlow = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const items = props.fields?.items || [];
  const active = items[index];

  if (!items.length) {
    return <Default {...props} />;
  }

  return (
    <section className={`component carousel pentair-flow-carousel ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        {active && (
          <div className="pentair-flow-carousel__stage">
            {!isPageEditing && active.fields?.Video?.value?.src ? (
              <video
                className="object-fit-cover d-block w-100"
                key={active.id}
                autoPlay
                loop
                muted
                playsInline
                poster={active.fields.Image?.value?.src}
              >
                <source src={active.fields.Video.value.src} type="video/webm" />
              </video>
            ) : (
              <NextImage
                field={active.fields.Image}
                className="object-fit-cover d-block w-100"
                width={1280}
                height={720}
              />
            )}
            <div className="pentair-flow-carousel__caption">
              <h3>
                <Text field={active.fields.Title} />
              </h3>
              <RichText field={active.fields.Text} />
            </div>
          </div>
        )}
        <div className="pentair-flow-carousel__thumbs">
          <button
            type="button"
            className="pentair-flow-carousel__nav"
            aria-label="Previous"
            onClick={() => setIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1))}
          >
            ‹
          </button>
          <div className="pentair-flow-carousel__track">
            {items.map((item, i) => (
              <button
                type="button"
                key={item.id || i}
                className={`pentair-flow-carousel__thumb ${i === index ? 'is-active' : ''}`}
                onClick={() => setIndex(i)}
              >
                <NextImage field={item.fields.Image} width={160} height={90} />
                <span>
                  <Text field={item.fields.Title} />
                </span>
              </button>
            ))}
          </div>
          <button
            type="button"
            className="pentair-flow-carousel__nav"
            aria-label="Next"
            onClick={() => setIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0))}
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};
