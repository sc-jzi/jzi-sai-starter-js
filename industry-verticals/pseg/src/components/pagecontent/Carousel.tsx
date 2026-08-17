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

const HERO_FALLBACKS = ['/pseg/hero-jdp.jpg', '/pseg/hero-bill.jpg', '/pseg/hero-gas.jpg'];
const PSEG_LOGIN = 'https://nj.myaccount.pseg.com/user/login';
const PSEG_REGISTER = 'https://nj.myaccount.pseg.com/user/register';

/* Pseg variant — navy gradient hero with award image and static login card */
export const Pseg = (props: CarouselComponentProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const [index, setIndex] = useState(0);
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const items = props.fields?.items || [];
  const sxaStyles = `${props.params?.styles || ''}`;

  const handleNext = () => {
    setIndex((prevIndex) => (prevIndex < items.length - 1 ? prevIndex + 1 : 0));
  };

  const handlePrev = () => {
    setIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : items.length - 1));
  };

  return (
    <section className={`component carousel pseg ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="pseg-hero-grid">
          <div className="carousel-inner">
            {items.map((item, i) => (
              <div key={item.id || i} className={'carousel-item ' + (i == index ? 'active' : '')}>
                <div className="row align-items-center g-4">
                  <div className="col-lg-7 pseg-hero-copy">
                    <h1 className="pseg-hero-title">
                      <Text field={item.fields.Title} />
                    </h1>
                    <RichText field={item.fields.Text} className="pseg-hero-text" />
                    {(isPageEditing || item.fields?.Link?.value?.href) && (
                      <Link field={item.fields.Link} className="pseg-hero-link" />
                    )}
                  </div>
                  <div className="col-lg-5 pseg-hero-media">
                    {item.fields?.Image?.value?.src ? (
                      <NextImage field={item.fields.Image} width={640} height={480} />
                    ) : (
                      <img
                        src={HERO_FALLBACKS[i] || HERO_FALLBACKS[0]}
                        alt={item.fields?.Title?.value || 'PSE&G'}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <aside className="pseg-login-card" aria-label="Login to My Account">
            <h2>Login to My Account</h2>
            <a className="pseg-login-btn" href={PSEG_LOGIN}>
              Login
            </a>
            <a className="pseg-register-btn" href={PSEG_REGISTER}>
              Register
            </a>
          </aside>
        </div>
        {items.length > 1 && (
          <ol className="carousel-indicators">
            {items.map((_item, i) => (
              <li
                key={i}
                aria-label={`Slide ${i + 1}`}
                className={i == index ? 'active' : ''}
                onClick={() => setIndex(i)}
              ></li>
            ))}
          </ol>
        )}
      </div>
      {items.length > 1 && (
        <>
          <button className="carousel-control-prev" type="button" onClick={handlePrev}>
            <span className="carousel-control-prev-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
            </span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button className="carousel-control-next" type="button" onClick={handleNext}>
            <span className="carousel-control-next-icon" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor">
                <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z" />
              </svg>
            </span>
            <span className="visually-hidden">Next</span>
          </button>
        </>
      )}
    </section>
  );
};

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
