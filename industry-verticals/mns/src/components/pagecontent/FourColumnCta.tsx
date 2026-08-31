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

function hasAuthoredLink(link?: LinkField): boolean {
  const href = link?.value?.href;
  return Boolean(href && href !== '#');
}

/* MnsTiles variant — equal-height cultural color tiles with motif image */
export const MnsTiles = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
  }) => (
    <div className="col-sm-12 col-md-6 col-lg-3">
      <Link field={link} className="mns-tile">
        <div className="mns-tile__media">
          <NextImage field={image} width={400} height={220} />
        </div>
        <div className="mns-tile__copy">
          <h2>
            <Text field={title} />
          </h2>
          {(isPageEditing || text?.value) && (
            <p>
              <Text field={text} />
            </p>
          )}
        </div>
      </Link>
    </div>
  );

  return (
    <div
      className={`component four-column-cta mns-tiles ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row g-3">
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
          />
          <Column
            image={props.fields.Image3}
            title={props.fields.Title3}
            text={props.fields.Text3}
            link={props.fields.Link3}
          />
          <Column
            image={props.fields.Image4}
            title={props.fields.Title4}
            text={props.fields.Text4}
            link={props.fields.Link4}
          />
        </div>
      </div>
    </div>
  );
};

/* MnsStories variant — 2x2 text-only bordered cards */
export const MnsStories = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    title,
    text,
    link,
  }: {
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
  }) => (
    <div className="col-sm-12 col-lg-6">
      <div className="mns-story">
        <h3>
          <Text field={title} />
        </h3>
        <p>
          <Text field={text} />
        </p>
        {(isPageEditing || hasAuthoredLink(link)) && <Link field={link} className="mns-story__link" />}
      </div>
    </div>
  );

  return (
    <div
      className={`component four-column-cta mns-stories ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row g-4">
          <Column title={props.fields.Title1} text={props.fields.Text1} link={props.fields.Link1} />
          <Column title={props.fields.Title2} text={props.fields.Text2} link={props.fields.Link2} />
          <Column title={props.fields.Title3} text={props.fields.Text3} link={props.fields.Link3} />
          <Column title={props.fields.Title4} text={props.fields.Text4} link={props.fields.Link4} />
        </div>
      </div>
    </div>
  );
};

/* MnsLogos variant — four centered affiliate logos */
export const MnsLogos = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
  }) => (
    <div className="col-6 col-lg-3">
      <Link field={link} className="mns-logo">
        {(isPageEditing || image?.value?.src) && <NextImage field={image} width={180} height={90} />}
        <span className="visually-hidden">
          <Text field={title} />
        </span>
        {(isPageEditing || (!image?.value?.src && text?.value)) && (
          <p className="mns-logo__fallback">
            <Text field={text} />
          </p>
        )}
      </Link>
    </div>
  );

  return (
    <div
      className={`component four-column-cta mns-logos ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="row align-items-center g-4">
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
          />
          <Column
            image={props.fields.Image3}
            title={props.fields.Title3}
            text={props.fields.Text3}
            link={props.fields.Link3}
          />
          <Column
            image={props.fields.Image4}
            title={props.fields.Title4}
            text={props.fields.Text4}
            link={props.fields.Link4}
          />
        </div>
      </div>
    </div>
  );
};
