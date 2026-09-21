'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
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
  Title3: Field<string>;
  Text3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Title4: Field<string>;
  Text4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
}

export type FourColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
    delay,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-3 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <Link field={link}>
          <div className="content-wrapper">
            <NextImage field={image} width={300} height={300} />
            <div className="text-wrapper">
              <h2>
                <Text field={title} />
              </h2>
              <p>
                <Text field={text} />
              </p>
            </div>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced four-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            title={props.fields.Title1}
            text={props.fields.Text1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            title={props.fields.Title3}
            text={props.fields.Text3}
            link={props.fields.Link3}
            delay={1000}
          />
          <Column
            image={props.fields.Image4}
            title={props.fields.Title4}
            text={props.fields.Text4}
            link={props.fields.Link4}
            delay={1500}
          />
        </div>
      </div>
    </div>
  );
};

const FourColumnCtaEmpty = (): JSX.Element => (
  <div className="component four-column-cta">
    <div className="component-content">
      <span className="is-empty-hint">Four Column CTA</span>
    </div>
  </div>
);

/* OINewsGrid — 2x2 gold-border news tiles */
export const OINewsGrid = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return <FourColumnCtaEmpty />;
  }

  const cards = [
    {
      image: props.fields.Image1,
      title: props.fields.Title1,
      text: props.fields.Text1,
      link: props.fields.Link1,
    },
    {
      image: props.fields.Image2,
      title: props.fields.Title2,
      text: props.fields.Text2,
      link: props.fields.Link2,
    },
    {
      image: props.fields.Image3,
      title: props.fields.Title3,
      text: props.fields.Text3,
      link: props.fields.Link3,
    },
    {
      image: props.fields.Image4,
      title: props.fields.Title4,
      text: props.fields.Text4,
      link: props.fields.Link4,
    },
  ];

  return (
    <div
      className={`component four-column-cta oi-brand oi-news-grid bg-[var(--brand-bg)] py-6 text-[var(--brand-fg)] ${sxaStyles}`}
      id={id ? id : undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="grid gap-4 sm:grid-cols-2">
          {cards.map((card, index) => (
            <article key={index} className="flex flex-col">
              <Link
                field={card.link}
                className="group relative block overflow-hidden rounded-[var(--brand-card-radius)] border border-[var(--brand-primary)] no-underline"
              >
                <NextImage
                  field={card.image}
                  width={640}
                  height={360}
                  className="aspect-[16/7] h-auto w-full object-cover"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <Text
                    field={card.title}
                    tag="h3"
                    className="m-0 text-sm font-semibold leading-snug text-white md:text-base"
                  />
                </div>
              </Link>
              {(card.text?.value || isPageEditing) && (
                <Text
                  field={card.text}
                  tag="p"
                  className="mb-0 mt-2 text-sm text-[var(--brand-muted-fg)]"
                />
              )}
            </article>
          ))}
        </div>
        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="mb-0 text-sm font-semibold text-[var(--brand-fg)]">More and Stories</p>
          <div className="flex gap-2" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-[var(--brand-muted-fg)] opacity-50" />
            <span className="h-2 w-2 rounded-full bg-[var(--brand-muted-fg)] opacity-50" />
            <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
          </div>
        </div>
      </div>
    </div>
  );
};
