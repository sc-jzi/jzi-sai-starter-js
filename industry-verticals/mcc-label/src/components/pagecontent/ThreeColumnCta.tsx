'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  Text,
  LinkField,
  Link,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';
import { asImageField } from 'lib/as-image-field';

interface Fields {
  Text1: Field<string>;
  SubText1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Text2: Field<string>;
  SubText2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Text3: Field<string>;
  SubText3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
}

export type ThreeColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : 'button-main';

    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={400} height={400} />
          <h2>
            <Text field={text} />
          </h2>
          <p>
            <Text field={subText} />
          </p>
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const WithIcons = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const extra = props.fields?.SubText1?.value || '';
  const pipe = extra.indexOf('|');
  const extraTitle = pipe >= 0 ? extra.slice(0, pipe).trim() : '';
  const extraBody = pipe >= 0 ? extra.slice(pipe + 1).trim() : extra;
  const cards = [
    { image: props.fields?.Image1, title: props.fields?.Text2, body: props.fields?.SubText2?.value || '' },
    { image: props.fields?.Image2, title: props.fields?.Text3, body: props.fields?.SubText3?.value || '' },
    { image: props.fields?.Image3, title: null, titleText: extraTitle, body: extraBody },
  ];

  return (
    <div className={`component component-spaced three-column-cta with-icons ${sxaStyles}`} id={id || undefined}>
      <div className="container pillars">
        {(props.fields?.Text1?.value) && <Text field={props.fields.Text1} tag="h2" className="pillars-title" />}
        <div className="pillars-row">
          {cards.map((card) => {
            const picture = asImageField(card.image);
            return (
              <div className="pillar-card" key={card.body}>
                <button type="button" className="pillar-face">
                  {picture && <NextImage field={picture} width={80} height={88} />}
                  {card.title ? <h2><Text field={card.title} /></h2> : card.titleText ? <h2>{card.titleText}</h2> : null}
                  {card.body && <p>{card.body}</p>}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const MccLabelTextCards = (props: ThreeColumnCtaProps): JSX.Element => {
  const cards = [
    { title: props.fields?.Text1, body: props.fields?.SubText1 },
    { title: props.fields?.Text2, body: props.fields?.SubText2 },
    { title: props.fields?.Text3, body: props.fields?.SubText3 },
  ];
  return (
    <div className="component three-column-cta mcc-label-text-cards" id={props.params?.RenderingIdentifier || undefined}>
      <div className="contact-cards">
        {cards.map((card) => (
          <div className="contact-card" key={card.title?.value || card.body?.value}>
            {card.title?.value && (
              <p className="contact-label">
                <Text field={card.title} />
              </p>
            )}
            {card.body?.value && (
              <p>
                <Text field={card.body} />
              </p>
            )}
            <button type="button">Get Started</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export const WithIconsCompact = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    text,
    subText,
    link,
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col-sm-12 col-lg-4 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        } `}
        ref={domRef}
      >
        <Link field={link} className="wrapper-link">
          <div className="content-wrapper">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div className="image-wrapper">
                <NextImage field={image} width={32} height={32} />
              </div>
              <h2 className="eyebrow-accent mb-0 mt-2">
                <Text field={text} />
              </h2>
            </div>
            <p>
              <Text field={subText} />
            </p>
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced three-column-cta with-icons with-icons-compact ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row gx-0">
          <Column
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
          />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            delay={1000}
          />
        </div>
      </div>
    </div>
  );
};

export const MccLabel = (props: ThreeColumnCtaProps): JSX.Element => (
  <div className="mcc-label-variant MccLabel">
    <Default {...props} />
  </div>
);

export const MccLabelIconCards = (props: ThreeColumnCtaProps): JSX.Element => (
  <div className="mcc-label-variant MccLabelIconCards">
    <Default {...props} />
  </div>
);
