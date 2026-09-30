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

/* Two elevated help cards on the gray band */
export const DwyerOmegaHelpCards = (props: TwoColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const cards = [
    { title: props.fields.Title1, text: props.fields.Text1, link: props.fields.Link1 },
    { title: props.fields.Title2, text: props.fields.Text2, link: props.fields.Link2 },
  ];

  return (
    <section
      className={`component two-column-cta ${props.params?.styles || ''}`}
      id={id || undefined}
      style={{ background: 'var(--brand-muted, #F5F5F7)' }}
    >
      <div className="mx-auto grid max-w-[1100px] gap-5 px-6 py-6 md:grid-cols-2">
        {cards.map((card) => (
          <article key={card.title?.value} className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-2 text-sm font-bold tracking-[0.12em]" style={{ color: 'var(--brand-primary, #232C65)' }}>
              <Text field={card.title} />
            </h3>
            <p className="mb-3 text-sm" style={{ color: 'var(--brand-muted-fg, #5E6265)' }}>
              <Text field={card.text} />
            </p>
            {(isPageEditing || card.link?.value?.href) && (
              <Link field={card.link} className="text-sm font-semibold" style={{ color: 'var(--brand-accent, #D4232D)' }} />
            )}
          </article>
        ))}
      </div>
    </section>
  );
};
