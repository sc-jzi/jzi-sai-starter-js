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
            <div className="image-wrapper mb-5">
              <NextImage field={image} width={32} height={32} />
            </div>
            <h2>
              <Text field={text} />
            </h2>
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
      className={`component component-spaced three-column-cta with-icons ${sxaStyles}`}
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

const ThreeColumnEmpty = ({ variantClass }: { variantClass: string }): JSX.Element => (
  <div className={`component three-column-cta ${variantClass}`}>
    <span className="is-empty-hint">Three Column CTA</span>
  </div>
);

/* AMPP variant: separate white fact cards for conference "what to expect" */
export const FactCards = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) return <ThreeColumnEmpty variantClass="variant-fact-cards" />;

  const cards = [
    {
      image: props.fields.Image1,
      text: props.fields.Text1,
      subText: props.fields.SubText1,
      link: props.fields.Link1,
    },
    {
      image: props.fields.Image2,
      text: props.fields.Text2,
      subText: props.fields.SubText2,
      link: props.fields.Link2,
    },
    {
      image: props.fields.Image3,
      text: props.fields.Text3,
      subText: props.fields.SubText3,
      link: props.fields.Link3,
    },
  ];

  return (
    <div
      className={`component three-column-cta variant-fact-cards ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row row-gap-4">
          {cards.map((card, index) => (
            <div className="col-md-4" key={index}>
              <article className="fact-card">
                {(isPageEditing || card.image?.value?.src) && (
                  <div className="fact-card-icon">
                    <NextImage field={card.image} width={48} height={48} />
                  </div>
                )}
                <h2>
                  <Text field={card.text} />
                </h2>
                {(isPageEditing || card.subText?.value) && (
                  <p>
                    <Text field={card.subText} />
                  </p>
                )}
                {(isPageEditing || card.link?.value?.href) && (
                  <Link field={card.link} className="fact-card-link" />
                )}
              </article>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* AMPP variant: three-column course fact bar (label over value) */
export const FactBar = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) return <ThreeColumnEmpty variantClass="variant-fact-bar" />;

  const facts = [
    {
      image: props.fields.Image1,
      text: props.fields.Text1,
      subText: props.fields.SubText1,
      link: props.fields.Link1,
    },
    {
      image: props.fields.Image2,
      text: props.fields.Text2,
      subText: props.fields.SubText2,
      link: props.fields.Link2,
    },
    {
      image: props.fields.Image3,
      text: props.fields.Text3,
      subText: props.fields.SubText3,
      link: props.fields.Link3,
    },
  ];

  return (
    <div
      className={`component three-column-cta variant-fact-bar ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="fact-bar">
          {facts.map((fact, index) => (
            <div className="fact-bar-item" key={index}>
              {(isPageEditing || fact.image?.value?.src) && (
                <NextImage field={fact.image} width={32} height={32} />
              )}
              <p className="fact-bar-label">
                <Text field={fact.text} />
              </p>
              <p className="fact-bar-value">
                <Text field={fact.subText} />
              </p>
              {(isPageEditing || fact.link?.value?.href) && <Link field={fact.link} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* AMPP variant: numbered course steps shared by the certification detail pages */
export const NumberedSteps = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) return <ThreeColumnEmpty variantClass="variant-numbered-steps" />;

  const steps = [
    {
      image: props.fields.Image1,
      text: props.fields.Text1,
      subText: props.fields.SubText1,
      link: props.fields.Link1,
    },
    {
      image: props.fields.Image2,
      text: props.fields.Text2,
      subText: props.fields.SubText2,
      link: props.fields.Link2,
    },
    {
      image: props.fields.Image3,
      text: props.fields.Text3,
      subText: props.fields.SubText3,
      link: props.fields.Link3,
    },
  ];

  return (
    <div
      className={`component three-column-cta variant-numbered-steps ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <ol className="numbered-steps">
          {steps.map((step, index) => (
            <li className="numbered-step" key={index}>
              <span className="step-index" aria-hidden="true" />
              {(isPageEditing || step.image?.value?.src) && (
                <NextImage field={step.image} width={48} height={48} />
              )}
              <h2>
                <Text field={step.text} />
              </h2>
              {(isPageEditing || step.subText?.value) && (
                <p>
                  <Text field={step.subText} />
                </p>
              )}
              {(isPageEditing || step.link?.value?.href) && (
                <Link field={step.link} className="button button-main" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};
