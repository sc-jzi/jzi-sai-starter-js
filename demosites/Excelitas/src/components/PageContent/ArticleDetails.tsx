import { JSX } from 'react';
import {
  Field,
  ImageField,
  Placeholder,
  Text,
  RichText,
  RichTextField,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
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
        className={`component article-details page-background ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <div className="bg-excelitas-gray-50 py-4">
          <div className="container-excelitas">
            <Placeholder name="page-navigation" rendering={props.rendering} />
          </div>
        </div>

        <div className="section-spacing bg-white">
          <div className="container-excelitas">
            <div className="background-content rounded-sm border border-excelitas-gray-300 bg-white shadow-sm">
              <div className="p-6 md:p-10 lg:p-12">
                <div className="article-content">
                  <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
                    <div className="overflow-hidden">
                      <NextImage
                        field={props.fields.Thumbnail}
                        className="article-img w-full object-cover"
                        width={600}
                        height={400}
                      />
                    </div>
                    <div>
                      <div className="mb-4">
                        <Placeholder name="article-meta" rendering={props.rendering} />
                      </div>
                      <h1 className="article-title mb-4">
                        <Text field={props.fields.Title} />
                      </h1>
                      <p className="article-excerpt text-lg text-excelitas-gray-500">
                        <Text field={props.fields.Excerpt} />
                      </p>
                    </div>
                  </div>
                  <div className="article-content-body rich-text mt-10 border-t border-excelitas-gray-300 pt-10">
                    <RichText field={props.fields.Content} />
                  </div>
                </div>
                <div className="mt-10">
                  <Placeholder name="background-page-content" rendering={props.rendering} />
                </div>
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
        className={`component simple-article-details ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <div className="section-spacing bg-white">
          <div className="container-excelitas-wide mb-8">
            <h1 className="article-title text-balance">
              <Text field={props.fields.Title} />
            </h1>
          </div>
          <div className="container-excelitas-wide mb-10">
            <NextImage
              field={props.fields.Thumbnail}
              className="article-img w-full object-cover"
              width={1650}
              height={750}
            />
          </div>
          <div className="container-excelitas">
            <div className="article-content mx-auto max-w-3xl">
              <p className="article-excerpt mb-8 text-xl text-excelitas-gray-500">
                <Text field={props.fields.Excerpt} />
              </p>
              <div className="article-content-body rich-text">
                <RichText field={props.fields.Content} />
              </div>
              <div className="article-meta-row mt-10 border-t border-excelitas-gray-300 pt-8">
                <Placeholder name="article-meta" rendering={props.rendering} />
              </div>
            </div>
            <div className="mt-12">
              <Placeholder name="background-page-content" rendering={props.rendering} />
            </div>
          </div>
        </div>
        <Placeholder name="page-content" rendering={props.rendering} />
      </div>
    </>
  );
};
