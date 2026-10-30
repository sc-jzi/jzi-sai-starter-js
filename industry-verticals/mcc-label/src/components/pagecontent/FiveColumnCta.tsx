'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link,
  Text,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Text1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Description1: Field<string>;
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Description2: Field<string>;
  Text3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Description3: Field<string>;
  Text4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
  Description4: Field<string>;
  Text5: Field<string>;
  Image5: ImageField;
  Link5: LinkField;
  Description5: Field<string>;
}

export type FiveColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FiveColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    link,
    description,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    link: LinkField;
    description?: Field<string>;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col ${!isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''} `}
        ref={domRef}
      >
        <Link field={link}>
          <div className="image-container">
            <NextImage field={image} className="d-block w-100 h-100" width={200} height={200} />
          </div>
        </Link>
        <h2 className="text-container">
          <Text field={text} />
        </h2>
        {description?.value ? (
          <p className="stat-caption">
            <Text field={description} />
          </p>
        ) : null}
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced five-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row row-cols-2 row-cols-sm-3 row-cols-lg-5 row-gap-3 gx-5 justify-content-center">
          <Column image={props.fields.Image1} text={props.fields.Text1} link={props.fields.Link1} description={props.fields.Description1} />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            description={props.fields.Description2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            link={props.fields.Link3}
            description={props.fields.Description3}
            delay={1000}
          />
          <Column
            image={props.fields.Image4}
            text={props.fields.Text4}
            link={props.fields.Link4}
            description={props.fields.Description4}
            delay={1500}
          />
          <Column
            image={props.fields.Image5}
            text={props.fields.Text5}
            link={props.fields.Link5}
            description={props.fields.Description5}
            delay={2000}
          />
        </div>
      </div>
    </div>
  );
};

export const MccLabel = (props: FiveColumnCtaProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);

// MCC Label Stats: a full-width row of five stats, each an icon on a blue tile, the figure and its caption.
// The tile is drawn by the component; a figure, caption or link renders only when it has content.
export const MccLabelStats = (props: FiveColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const f = props.fields;
  const stats = [
    { image: f?.Image1, text: f?.Text1, link: f?.Link1, description: f?.Description1 },
    { image: f?.Image2, text: f?.Text2, link: f?.Link2, description: f?.Description2 },
    { image: f?.Image3, text: f?.Text3, link: f?.Link3, description: f?.Description3 },
    { image: f?.Image4, text: f?.Text4, link: f?.Link4, description: f?.Description4 },
    { image: f?.Image5, text: f?.Text5, link: f?.Link5, description: f?.Description5 },
  ];

  return (
    <section className="variant-mcc-label mcc-label-stats">
      <div className={`component five-column-cta ${props.params?.styles || ''}`} id={id ? id : undefined}>
        <div className="mcc-stats">
          {stats.map((s, i) => {
            const tile = (
              <div className="mcc-stat-tile">
                <NextImage field={s.image} width={32} height={32} />
              </div>
            );
            return (
              <div className="mcc-stat" key={i}>
                {s.link?.value?.href && !isPageEditing ? <Link field={s.link}>{tile}</Link> : tile}
                {(isPageEditing || s.text?.value) && (
                  <p className="mcc-stat-figure">
                    <Text field={s.text} />
                  </p>
                )}
                {(isPageEditing || s.description?.value) && (
                  <p className="mcc-stat-caption">
                    <Text field={s.description} />
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
