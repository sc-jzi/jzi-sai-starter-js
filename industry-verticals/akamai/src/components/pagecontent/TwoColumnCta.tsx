'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Title1: Field<string>;
  Text1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Title2: Field<string>;
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
}

export type TwoColumnCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: TwoColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
    placeholder,
    delay,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
    placeholder: string;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : 'button-main';

    return (
      <div
        className={`col-sm-12 col-lg-6 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={800} height={800} />
          {(isPageEditing || title?.value) && (
            <h2>
              <Text field={title} />
            </h2>
          )}
          {(isPageEditing || text?.value) && (
            <p>
              <Text field={text} />
            </p>
          )}
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
          <Placeholder name={placeholder} rendering={props.rendering} />
        </div>
      </div>
    );
  };

  return (
    <div className={`component two-column-cta pb-5 ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            title={props.fields.Title1}
            text={props.fields.Text1}
            link={props.fields.Link1}
            placeholder="two-col-placeholder-left"
            delay={0}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            placeholder="two-col-placeholder-right"
            delay={500}
          />
        </div>
      </div>
    </div>
  );
};

/* AkamaiProductTiles — side-by-side navy dotted tiles with orange CTAs */
export const AkamaiProductTiles = (props: TwoColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const tiles = [
    {
      title: props.fields?.Title1,
      text: props.fields?.Text1,
      image: props.fields?.Image1,
      link: props.fields?.Link1,
    },
    {
      title: props.fields?.Title2,
      text: props.fields?.Text2,
      image: props.fields?.Image2,
      link: props.fields?.Link2,
    },
  ];

  return (
    <div
      className={`component two-column-cta akamai-product-tiles bg-[var(--brand-bg)] py-4 ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto grid max-w-[1200px] gap-4 px-6 md:grid-cols-2">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className="relative min-h-[14rem] overflow-hidden rounded-[var(--brand-card-radius)] bg-[var(--brand-tile-navy)] p-8 text-[var(--brand-primary-foreground)]"
            style={{
              backgroundImage: [
                'radial-gradient(circle, rgba(79,195,247,0.35) 1px, transparent 1px)',
                tile.image?.value?.src ? `url("${tile.image.value.src}")` : undefined,
              ]
                .filter(Boolean)
                .join(', '),
              backgroundSize: tile.image?.value?.src ? '18px 18px, cover' : '18px 18px',
              backgroundPosition: 'center',
            }}
          >
            <div className="relative z-10 flex h-full min-h-[10rem] flex-col justify-end">
              {(isPageEditing || tile.title?.value) && (
                <Text
                  field={tile.title}
                  tag="h2"
                  className="m-0 text-3xl font-bold leading-tight md:text-4xl"
                />
              )}
              {(isPageEditing || tile.text?.value) && (
                <Text
                  field={tile.text}
                  tag="p"
                  className="mb-0 mt-3 max-w-md text-sm text-white/85"
                />
              )}
              {(isPageEditing || tile.link?.value?.href) && (
                <Link
                  field={tile.link}
                  className="mt-6 inline-flex w-fit rounded-[var(--brand-button-radius)] bg-[var(--brand-accent)] px-5 py-2.5 text-sm font-semibold text-[var(--brand-accent-foreground)] no-underline hover:brightness-110"
                />
              )}
            </div>
            {isPageEditing && (
              <div className="sr-only">
                <NextImage field={tile.image} width={800} height={400} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
