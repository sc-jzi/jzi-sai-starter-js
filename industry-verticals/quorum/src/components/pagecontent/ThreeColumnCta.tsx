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

type QuorumColumn = {
  image: ImageField;
  text: Field<string>;
  subText: Field<string>;
  link: LinkField;
};

const getQuorumColumns = (fields: Fields): QuorumColumn[] => [
  { image: fields?.Image1, text: fields?.Text1, subText: fields?.SubText1, link: fields?.Link1 },
  { image: fields?.Image2, text: fields?.Text2, subText: fields?.SubText2, link: fields?.Link2 },
  { image: fields?.Image3, text: fields?.Text3, subText: fields?.SubText3, link: fields?.Link3 },
];

const ThreeColumnCtaDefault = (props: ThreeColumnCtaProps): JSX.Element => {
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

export const QuorumDecisionCards = (props: ThreeColumnCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section
      className={`component quorum-decision-cards ${props.params?.styles || ''}`}
      id={props.params.RenderingIdentifier || undefined}
    >
      <div className="quorum-container quorum-card-grid">
        {getQuorumColumns(props.fields).map((column, index) => (
          <article className="quorum-decision-card" key={index}>
           
            <Text field={column.text} tag="h3" className="quorum-decision-card__title" />
            <div className="quorum-decision-card__body">
              <Text field={column.subText} tag="p" />
              {(isPageEditing || column.link?.value?.href) && (
                <Link field={column.link} className="quorum-link-arrow" />
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export const Hidden = (): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;  


  return (
    <>{(isPageEditing) && (<p>[This component is hidden]</p>)}</>
  );
}

export const QuorumCustomerStories = (props: ThreeColumnCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section
      className={`component quorum-customer-stories ${props.params?.styles || ''}`}
      id={props.params.RenderingIdentifier || undefined}
    >
      <div className="quorum-container quorum-card-grid">
        {getQuorumColumns(props.fields).map((column, index) => (
          <article className="quorum-customer-card" key={index}>
            {(isPageEditing || column.image?.value?.src) && (
              <div className="quorum-customer-card__logo">
                <NextImage field={column.image} width={220} height={72} />
              </div>
            )}
            <Text field={column.text} tag="h3" className="quorum-customer-card__title" />
            <Text field={column.subText} tag="p" className="quorum-customer-card__body" />
            {(isPageEditing || column.link?.value?.href) && (
              <Link field={column.link} className="quorum-link-arrow quorum-customer-card__link" />
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export const QuorumTopStories = (props: ThreeColumnCtaProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section
      className={`component quorum-top-stories ${props.params?.styles || ''}`}
      id={props.params.RenderingIdentifier || undefined}
    >
      <div className="quorum-container quorum-top-stories__grid">
        {getQuorumColumns(props.fields).map((column, index) => (
          <article className="quorum-story-card" key={index}>
            <Link field={column.link} className="quorum-story-card__link">
              {(isPageEditing || column.image?.value?.src) && (
                <NextImage
                  field={column.image}
                  width={520}
                  height={292}
                  className="quorum-story-card__image"
                />
              )}
              <div className="quorum-story-card__content">
                <Text
                  field={column.subText}
                  tag="p"
                  className="quorum-story-card__category"
                />
                <Text field={column.text} tag="h3" className="quorum-story-card__title" />
              </div>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
};

export const Default = ThreeColumnCtaDefault;
