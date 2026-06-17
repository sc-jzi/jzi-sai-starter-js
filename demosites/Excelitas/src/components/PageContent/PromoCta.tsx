'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  RichTextField,
  Text,
  RichText,
  Link,
  LinkField,
  useSitecore,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Eyebrow: Field<string>;
  Title: Field<string>;
  Subtitle: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  Link: LinkField;
  Link2: LinkField;
}

export type PromoCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

function isImageLeft(styles: string) {
  return styles.includes('image-left') || styles.includes('position-right');
}

export const Default = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;
  const imageFirst = isImageLeft(sxaStyles);

  return (
    <div
      className={`component promo-cta section-spacing bg-white ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container-excelitas">
        <div
          className={`grid items-center gap-8 lg:grid-cols-2 lg:gap-16 ${
            imageFirst ? '' : ''
          }`}
        >
          <div className={`${imageFirst ? 'lg:order-2' : 'lg:order-1'} text-center lg:text-left`}>
            <p className="eyebrow">
              <Text field={props.fields.Eyebrow} />
            </p>
            <h2 className="mb-4 text-balance">
              <Text field={props.fields.Title} />
            </h2>
            <div className="promo-cta-text">
              <p className="mb-4 text-lg text-excelitas-gray-500">
                <Text field={props.fields.Subtitle} />
              </p>
              <RichText field={props.fields.Text} className="rich-text text-content mb-6" />
              <div className="mb-4">
                <Placeholder name="promo-cta" rendering={props.rendering} />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                {(isPageEditing || props.fields?.Link?.value?.href) && (
                  <Link field={props.fields.Link} className="button button-main" />
                )}
                {(isPageEditing || props.fields?.Link2?.value?.href) && (
                  <Link field={props.fields.Link2} className="button button-simple" />
                )}
              </div>
            </div>
          </div>
          <div className={`${imageFirst ? 'lg:order-1' : 'lg:order-2'}`}>
            <div className="image-wrapper overflow-hidden">
              <NextImage
                field={props.fields.Image}
                className={`mx-auto w-full object-cover ${
                  !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                }`}
                width={900}
                height={600}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithPlaceholderColumn = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [isVisible, domRef] = useVisibility();
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-placeholder-column section-spacing bg-excelitas-gray-50 ${sxaStyles}`}
      id={id ? id : undefined}
      ref={domRef}
    >
      <div className="container-excelitas">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-left">
            <p className="eyebrow">
              <Text field={props.fields.Eyebrow} />
            </p>
            <h2 className="mb-4">
              <Text field={props.fields.Title} />
            </h2>
            <div className="promo-cta-text">
              <p className="mb-4 text-lg text-excelitas-gray-500">
                <Text field={props.fields.Subtitle} />
              </p>
              <RichText field={props.fields.Text} className="rich-text text-content mb-6" />
              <div className="flex flex-wrap items-center justify-center gap-4 lg:justify-start">
                {(isPageEditing || props.fields?.Link?.value?.href) && (
                  <Link field={props.fields.Link} className="button button-main" />
                )}
                {(isPageEditing || props.fields?.Link2?.value?.href) && (
                  <Link field={props.fields.Link2} className="button button-simple" />
                )}
              </div>
            </div>
          </div>

          <div className="grid items-center gap-6">
            <div className="promo-cta-placeholder rounded-sm bg-white p-6 shadow-sm">
              <Placeholder name="promo-cta" rendering={props.rendering} />
            </div>
            <div className="image-wrapper hidden overflow-hidden md:block">
              <NextImage
                field={props.fields.Image}
                className={`mx-auto w-full object-cover ${
                  !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
                }`}
                width={900}
                height={600}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const WithBackgroundImage = (props: PromoCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component promo-cta with-background-image relative overflow-hidden ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="absolute inset-0">
        <NextImage
          field={props.fields.Image}
          className="h-full w-full object-cover"
          width={1920}
          height={800}
        />
        <div className="absolute inset-0 bg-excelitas-dark/75" />
      </div>
      <div className="container-excelitas relative z-10 section-spacing-lg text-center text-white">
        <h2 className="mb-6 text-balance text-white">
          <Text field={props.fields.Title} />
        </h2>
        <div className="rich-text-light mx-auto max-w-3xl text-lg md:text-xl">
          <RichText field={props.fields.Text} />
        </div>
        {(isPageEditing || props.fields?.Link?.value?.href) && (
          <div className="mt-8">
            <Link field={props.fields.Link} className="button button-accent" />
          </div>
        )}
      </div>
    </div>
  );
};
