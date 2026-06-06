import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  RichText,
  RichTextField,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Title: Field<string>;
  Text: RichTextField;
  Image: ImageField;
  CTA: LinkField;
}

export type CardProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

const TEXTURED_BACKGROUND = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400">
    <rect fill="#0077b5" width="800" height="400"/>
    <polygon fill="#0088c7" points="0,0 280,0 0,220"/>
    <polygon fill="#006899" points="280,0 520,0 400,180 180,120"/>
    <polygon fill="#0095d1" points="520,0 800,0 800,160 620,100"/>
    <polygon fill="#005f8a" points="0,220 180,120 400,180 200,400 0,400"/>
    <polygon fill="#0088c7" points="400,180 620,100 800,160 800,400 480,400"/>
    <polygon fill="#006899" points="200,400 480,400 620,280 360,320"/>
    <polygon fill="#0095d1" points="620,280 800,400 620,400"/>
  </svg>`
)}")`;

const cardBodyPadding = 'p-6 md:p-8';
const cardNoUnderline =
  '[&_*]:!no-underline [&_a:hover]:!no-underline [&_a]:!no-underline [&_p]:!no-underline [&_span]:!no-underline !no-underline';
const cardRichTextClasses = `text-base leading-relaxed text-white ${cardNoUnderline} [&_p:last-child]:mb-0`;
const cardLinkClasses = `mt-6 inline-flex items-center gap-1 font-bold text-white ${cardNoUnderline}`;
const cardLayoutClasses =
  '!box-border !block !min-w-0 !w-[calc(100%-1.25rem)] !max-w-[calc(100%-1.25rem)] !shrink !overflow-hidden !p-0 !m-2.5 [&_img]:!block [&_img]:!max-w-full [&_img]:!w-full [&_picture]:!block [&_picture]:!max-w-full [&_picture]:!w-full';
const cardWrapperClasses = (sxaStyles: string, extra = '') =>
  `component aua-card ${cardLayoutClasses} ${extra} ${cardNoUnderline} ${sxaStyles}`.trim();

export const Default = (props: CardProps): JSX.Element => {
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <div className={cardWrapperClasses(sxaStyles)}>
      <a
        href={props.fields.CTA.value.href}
        className="group relative block overflow-hidden transition-opacity hover:opacity-95"
      >
        <NextImage
          field={props.fields.Image}
          className="block aspect-[3/2] w-full object-cover"
          width={640}
          height={427}
        />
        <div className={`absolute inset-x-0 bottom-0 bg-[#003d5b]/85 text-white ${cardBodyPadding}`}>
          <h2 className="mb-4 font-[family-name:var(--font-family-heading)] text-2xl leading-tight text-white md:text-3xl">
            <Text field={props.fields.Title} />
          </h2>
          <RichText field={props.fields.Text} className={cardRichTextClasses} />
          <Link field={props.fields.CTA} className={cardLinkClasses} />
        </div>
      </a>
    </div>
  );
};

export const TextOnly = (props: CardProps): JSX.Element | null => {
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <div className={cardWrapperClasses(sxaStyles, 'bg-[#00567a] text-white')}>
      <a
        href={props.fields.CTA.value.href}
        className={`group block overflow-hidden transition-opacity hover:opacity-95 ${cardBodyPadding}`}
      >
        <h2 className="mb-4 text-xl font-normal leading-snug text-white md:text-2xl">
          <Text field={props.fields.Title} />
        </h2>
        <RichText field={props.fields.Text} className={cardRichTextClasses} />
        <Link field={props.fields.CTA} className={cardLinkClasses} />
      </a>
    </div>
  );
};

export const Textured = (props: CardProps): JSX.Element | null => {
  const sxaStyles = `${props.params?.styles || ''}`.trim();

  return (
    <div className={cardWrapperClasses(sxaStyles)}>
      <a
        href={props.fields.CTA.value.href}
        className={`group relative block overflow-hidden text-white transition-opacity hover:opacity-95 ${cardBodyPadding}`}
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: TEXTURED_BACKGROUND }}
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="mb-4 text-xl font-normal leading-snug text-white md:text-2xl">
            <Text field={props.fields.Title} />
          </h2>
          <RichText field={props.fields.Text} className={cardRichTextClasses} />
          <Link field={props.fields.CTA} className={cardLinkClasses} />
        </div>
      </a>
    </div>
  );
};
