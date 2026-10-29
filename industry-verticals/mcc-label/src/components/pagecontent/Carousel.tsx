'use client';

import { useState, JSX, MouseEvent } from 'react';
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
  Image,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Image2?: ImageField;
  Image3?: ImageField;
  Image4?: ImageField;
  Link: LinkField;
  Video: ImageField;
}

const PICTURE_FIELDS = ['Image', 'Image2', 'Image3', 'Image4'] as const;

function pictureFields(item: CarouselItemProps | undefined, editing: boolean): ImageField[] {
  if (!item?.fields) return [];
  const named = PICTURE_FIELDS.map((name) => item.fields[name]).filter(
    (field): field is ImageField => !!field && (editing || !!field.value?.src)
  );
  return named.length ? named : item.fields.Image ? [item.fields.Image] : [];
}

export type CarouselItemProps = {
  id: string;
  fields: Fields;
};

interface CarouselComponentProps {
  rendering: ComponentRendering & { params: ComponentParams };
  params: ComponentParams;
  fields: {
    items?: CarouselItemProps[];
  } & Partial<Fields>;
}

function slideFromFields(
  fields: CarouselComponentProps['fields'] | undefined,
  id: string
): CarouselItemProps | undefined {
  if (!fields?.Title && !fields?.Text && !fields?.Image && !fields?.Image2) return undefined;
  return { id, fields: fields as Fields };
}

export const Default = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const sxaStyles = `${props.params?.styles || ''}`;
  const childItems = props.fields?.items ?? [];
  const flatSlide = slideFromFields(props.fields, String(props.rendering?.dataSource || 'hero'));
  const sharedCopy = props.params?.heroPictures === 'true' || (!childItems.length && !!flatSlide);
  const items = childItems;
  const source = sharedCopy ? flatSlide ?? items[0] : items[index];
  const pictures = sharedCopy ? pictureFields(source, isPageEditing) : [];
  const count = sharedCopy ? pictures.length : items.length;
  const item = source;
  const picture = sharedCopy ? pictures[index] : item?.fields?.Image;

  const handleNext = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((prevIndex) => (count === 0 ? 0 : prevIndex < count - 1 ? prevIndex + 1 : 0));
  };

  const handlePrev = (event: MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIndex((prevIndex) => (count === 0 ? 0 : prevIndex > 0 ? prevIndex - 1 : count - 1));
  };
  const videoSrc = item?.fields?.Video?.value?.src;
  const showVideo = !isPageEditing && !!videoSrc && /\.(mp4|webm|mov)(\?|$)/i.test(videoSrc);

  return (
    <section className={`component carousel ${sxaStyles}`} id={id ? id : undefined}>
      <span className="band-edge" aria-hidden="true" />
      <span className="play video-play" aria-hidden="true" />
      <div className="carousel-inner">
        {item && (
          <div className="carousel-item active" key={item.id}>
            {showVideo ? (
              <video
                className="object-fit-cover d-block w-100 h-100"
                autoPlay={true}
                loop={true}
                muted
                playsInline
                poster={item.fields.Image?.value?.src}
              >
                <source src={videoSrc} type="video/webm" />
              </video>
            ) : isPageEditing ? (
              <Image field={picture} className="d-block w-100 carousel-picture" />
            ) : (
              picture && (
                <NextImage
                  field={picture}
                  className="object-fit-cover d-block w-100 h-100"
                  width={1920}
                  height={800}
                />
              )
            )}

            <div className="side-content">
              <div className="container">
                <div className="col-lg-5 col-md-6 offset-md-6 offset-lg-7">
                  <h1 className="display-6 fw-bold">
                    <Text field={item.fields.Title}></Text>
                  </h1>
                  <RichText field={item.fields.Text}></RichText>
                  {(isPageEditing || item.fields?.Link?.value?.href) && (
                    <Link field={item.fields.Link} className="button button-accent"></Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <ol className="carousel-indicators">
        {(sharedCopy ? pictures : items).map((_entry, i) => (
          <li
            key={i}
            aria-label="Slide"
            className={i == index ? 'active' : ''}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              setIndex(i);
            }}
          ></li>
        ))}
      </ol>
      <button
        className="carousel-control-prev"
        type="button"
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

export const MccLabel = (props: CarouselComponentProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

export const MccLabelHero = (props: CarouselComponentProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-hero">
    <Default {...props} params={{ ...props.params, heroPictures: 'true' }} />
  </section>
);
