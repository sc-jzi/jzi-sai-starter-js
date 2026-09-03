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

const getMediaSrc = (field?: ImageField): string => {
  const value = field?.value as
    | string
    | { src?: string; href?: string; url?: string; mediaUrl?: string }
    | undefined;

  if (!value) {
    return '';
  }

  if (typeof value === 'string') {
    return value;
  }

  return value.src || value.href || value.url || value.mediaUrl || '';
};

const getVideoType = (src: string): string =>
  /webm/i.test(src) ? 'video/webm' : 'video/mp4';

const CarouselImage = ({ item }: { item: CarouselItemProps }): JSX.Element => (
  <NextImage
    field={item.fields.Image}
    className="object-fit-cover d-block w-100 h-100"
    width={1920}
    height={800}
  />
);

const CarouselVideo = ({ item }: { item: CarouselItemProps }): JSX.Element => {
  const src = getMediaSrc(item.fields?.Video) || getMediaSrc(item.fields?.Image);

  if (!src) {
    return <CarouselImage item={item} />;
  }

  return (
    <video
      className="object-fit-cover d-block w-100 h-100"
      key={src}
      autoPlay
      loop
      muted
      playsInline
    >
      <source src={src} type={getVideoType(src)} />
    </video>
  );
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
            {getMediaSrc(item.fields?.Video) ? (
              <CarouselVideo item={item} />
            ) : (
              <CarouselImage item={item} />
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

const CovistaFrame = ({
  props,
  Media,
}: {
  props: CarouselComponentProps;
  Media: (mediaProps: { item: CarouselItemProps }) => JSX.Element;
}): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const items = props.fields?.items || [];

  return (
    <section className={`component carousel cv-carousel ${sxaStyles}`} id={id ? id : undefined}>
      <div className="carousel-inner">
        {items.map((item, i) => (
          <div key={item.id || i} className={'carousel-item ' + (i == index ? 'active' : '')}>
            <Media item={item} />
            <div className="side-content">
              <div className="container">
                <div className="cv-carousel__copy">
                  <h1 className="cv-carousel__title">
                    <Text field={item.fields.Title} />
                  </h1>
                  {(isPageEditing || item.fields?.Link?.value?.href) && (
                    <Link field={item.fields.Link} className="cv-btn cv-btn--light" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export const CovistaImage = (props: CarouselComponentProps): JSX.Element => (
  <CovistaFrame props={props} Media={CarouselImage} />
);

export const CovistaVideo = (props: CarouselComponentProps): JSX.Element => (
  <CovistaFrame props={props} Media={CarouselVideo} />
);

export const Covista = CovistaVideo;
