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
  // section heading: only on the demo's derived datasource template (FourColumnCtaOhioHealth, R22 extend)
  Title?: Field<string>;
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

// OhioHealth: centred heading over four tall photo cards; each card is one link with its title on a dark gradient at the bottom.
export const OhioHealth = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const f = props.fields;
  const cards = [
    { image: f?.Image1, title: f?.Title1, link: f?.Link1 },
    { image: f?.Image2, title: f?.Title2, link: f?.Link2 },
    { image: f?.Image3, title: f?.Title3, link: f?.Link3 },
    { image: f?.Image4, title: f?.Title4, link: f?.Link4 },
  ];

  return (
    <section className={`component oh-specialty ${sxaStyles}`} id={id ? id : undefined}>
      <div className="oh-specialty__inner">
        {f?.Title && (f.Title.value || isEditing) && (
          <h2 className="oh-specialty__title">
            <Text field={f.Title} />
          </h2>
        )}
        <div className="oh-specialty__row">
          {cards.map((c, i) => {
            const body = (
              <>
                {c.image && (c.image.value?.src || isEditing) && (
                  <NextImage field={c.image} fill sizes="(max-width: 991px) 50vw, 25vw" className="oh-specialty__img" />
                )}
                <span className="oh-specialty__shade" aria-hidden="true" />
                {c.title && (
                  <span className="oh-specialty__label">
                    <Text field={c.title} />
                  </span>
                )}
              </>
            );
            return (
              <div className="oh-specialty__card" key={i}>
                {c.link?.value?.href && !isEditing ? (
                  <Link field={c.link} className="oh-specialty__link" showLinkTextWithChildrenPresent={false}>
                    {body}
                  </Link>
                ) : (
                  <div className="oh-specialty__link">{body}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
