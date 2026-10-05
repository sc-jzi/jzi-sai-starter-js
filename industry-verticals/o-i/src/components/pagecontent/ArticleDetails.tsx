'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Placeholder,
  Text,
  RichText,
  RichTextField,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ParallaxBackgroundImage } from 'components/non-sitecore/ParallaxBackgroundImage';
import Head from 'next/head';

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
}

export type PageBackgroundProps = ComponentProps & {
  fields: Fields;
};

export const Default = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta property="og:image" content={props.fields?.Thumbnail?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component article-details page-background spaced-top col-12 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <ParallaxBackgroundImage BackgroundImage={props.fields.BackgroundImage} />

        <div className="container">
          <Placeholder name="page-navigation" rendering={props.rendering} />
        </div>

        <div>
          <div className="background-content component-spaced container rounded-corners">
            <div className="p-3 p-sm-5">
              <div className="article-content">
                <div className="row row-gap-4 gx-5">
                  <div className="col-12 col-lg-6">
                    <NextImage
                      field={props.fields.Thumbnail}
                      className="article-img img-fluid"
                      width={600}
                      height={400}
                    />
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="row">
                      <Placeholder name="article-meta" rendering={props.rendering} />
                    </div>
                    <h1 className="article-title">
                      <Text field={props.fields.Title} />
                    </h1>
                    <p className="article-excerpt">
                      <Text field={props.fields.Excerpt} />
                    </p>
                  </div>
                </div>
                <div className="article-content-body mt-5">
                  <RichText field={props.fields.Content} />
                </div>
              </div>
              <div className="row">
                <Placeholder name="background-page-content" rendering={props.rendering} />
              </div>
            </div>
          </div>
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};

export const Simple = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta property="og:image" content={props.fields?.Thumbnail?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component simple-article-details mt-4 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <div className="container container-wide">
          <h1 className="article-title display-1 fw-bold">
            <Text field={props.fields.Title} />
          </h1>
        </div>
        <div className="container container-widest-fluid">
          <NextImage
            field={props.fields.Thumbnail}
            className="article-img img-fluid"
            width={1650}
            height={750}
          />
        </div>
        <div className="container">
          <div className="article-content">
            <div className="row">
              <div className="col-12 col-lg-6 mx-auto">
                <p className="article-excerpt fs-5">
                  <Text field={props.fields.Excerpt} />
                </p>
                <div className="article-content-body rich-text mt-5">
                  <RichText field={props.fields.Content} />
                </div>
                <div className="row article-meta-row">
                  <Placeholder name="article-meta" rendering={props.rendering} />
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <Placeholder name="background-page-content" rendering={props.rendering} />
          </div>
        </div>
        <div className="row">
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};

const ShareLinks = (): JSX.Element => (
  <div className="oi-article-share" aria-label="Share">
    <a href="#share-facebook" aria-label="Share on Facebook" className="oi-article-share__btn">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H9v3h2v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"
        />
      </svg>
    </a>
    <a href="#share-x" aria-label="Share on X" className="oi-article-share__btn">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M17.5 4h2.3l-5 5.7L21 20h-5.2l-3.3-4.4L8 20H5.6l5.4-6.1L4 4h5.3l3 4.1L17.5 4zm-1 14.3h1.3L8.6 5.6H7.2l9.3 12.7z"
        />
      </svg>
    </a>
    <a href="#share-linkedin" aria-label="Share on LinkedIn" className="oi-article-share__btn">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M6.5 9H4v11h2.5V9zM5.2 4C4.3 4 3.6 4.7 3.6 5.6S4.3 7.2 5.2 7.2 6.9 6.5 6.9 5.6 6.2 4 5.2 4zM20 20v-6.2c0-3.3-1.8-4.8-4.1-4.8-1.9 0-2.7 1-3.2 1.7V9H10.2c0 1.7 0 11 0 11H12.8v-6.1c0-.3 0-.7.1-1 .3-.7.9-1.4 2-1.4 1.4 0 2 1.1 2 2.6V20H20z"
        />
      </svg>
    </a>
    <a href="#share-email" aria-label="Share by email" className="oi-article-share__btn">
      <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
        <path
          fill="currentColor"
          d="M4 6h16v12H4V6zm8 7 8-6H4l8 6zm0 2.2L4 9.4V18h16V9.4l-8 5.8z"
        />
      </svg>
    </a>
  </div>
);

export const OI = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const heroImage = props.fields?.Thumbnail || props.fields?.BackgroundImage;
  const hasAuthor =
    Boolean(props.fields?.Name?.value) || Boolean(props.fields?.Photo?.value?.src);

  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt?.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta property="og:image" content={props.fields?.Thumbnail?.value?.src} />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component article-details oi-brand oi-article-details col-12 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
        style={{ fontFamily: 'var(--brand-body-font)' }}
      >
        {(heroImage?.value?.src || isEditing) && (
          <div className="oi-article-hero">
            <NextImage field={heroImage} className="oi-article-hero__img" width={1920} height={720} />
          </div>
        )}

        <div className={isEditing ? '' : 'sr-only'}>
          <Placeholder name="page-navigation" rendering={props.rendering} />
        </div>

        <div className="oi-article-paper">
          <div className="oi-article-paper__inner">
            <h1 className="oi-article-title">
              <Text field={props.fields?.Title} />
            </h1>
            <div className="oi-article-meta">
              <div className="oi-article-meta__author">
                <Placeholder name="article-meta" rendering={props.rendering} />
              </div>
              <ShareLinks />
            </div>
            <div className="oi-article-body">
              <RichText field={props.fields?.Content} />
            </div>
            {hasAuthor && (
              <aside className="oi-article-author-card">
                <NextImage
                  field={props.fields?.Photo}
                  className="oi-article-author-card__photo"
                  width={88}
                  height={88}
                />
                <div>
                  <p className="oi-article-author-card__name">
                    <Text field={props.fields?.Name} />
                  </p>
                  <p className="oi-article-author-card__role">
                    <Text field={props.fields?.Position} />
                  </p>
                </div>
              </aside>
            )}
            <Placeholder name="background-page-content" rendering={props.rendering} />
          </div>
        </div>
        <Placeholder name="page-content" rendering={props.rendering} />
      </div>
    </>
  );
};
