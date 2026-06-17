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

const ChevronLeft = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
  </svg>
);

const ChevronRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
  </svg>
);

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
    <section
      className={`component carousel relative w-full overflow-hidden bg-excelitas-dark ${sxaStyles}`}
      id={id ? id : undefined}
      aria-roledescription="carousel"
      aria-label="Hero carousel"
    >
      <div className="relative aspect-[16/7] min-h-[400px] w-full md:min-h-[500px] lg:min-h-[600px]">
        {props.fields.items.map((item, i) => (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? 'z-10 opacity-100' : 'z-0 opacity-0'
            }`}
            aria-hidden={i !== index}
          >
            {!isPageEditing && item.fields?.Video?.value?.src ? (
              <video
                className="absolute inset-0 h-full w-full object-cover"
                key={item.id}
                autoPlay
                loop
                muted
                playsInline
                poster={item.fields.Image?.value?.src}
              >
                <source src={item.fields.Video.value.src} type="video/webm" />
              </video>
            ) : (
              <NextImage
                field={item.fields.Image}
                className="absolute inset-0 h-full w-full object-cover"
                width={1920}
                height={800}
                priority={i === 0}
              />
            )}

            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

            <div className="absolute inset-0 flex items-center">
              <div className="container-excelitas">
                <div className="max-w-2xl text-white lg:max-w-3xl">
                  <h1 className="mb-4 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                    <Text field={item.fields.Title} />
                  </h1>
                  <div className="rich-text-light mb-6 text-lg text-white/90 md:text-xl">
                    <RichText field={item.fields.Text} />
                  </div>
                  {!isPageEditing && item.fields?.Link?.value?.href && (
                    <Link field={item.fields.Link} className="button button-accent" />
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {props.fields.items.length > 1 && (
        <>
          <ol className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {props.fields.items.map((_item, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index ? 'w-8 bg-excelitas-green' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                  onClick={() => setIndex(i)}
                />
              </li>
            ))}
          </ol>

          <button
            className="absolute left-2 top-1/2 z-20 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white md:left-6"
            type="button"
            aria-label="Previous slide"
            onClick={handlePrev}
          >
            <ChevronLeft />
          </button>
          <button
            className="absolute right-2 top-1/2 z-20 -translate-y-1/2 p-2 text-white/70 transition-colors hover:text-white md:right-6"
            type="button"
            aria-label="Next slide"
            onClick={handleNext}
          >
            <ChevronRight />
          </button>
        </>
      )}
    </section>
  );
};
