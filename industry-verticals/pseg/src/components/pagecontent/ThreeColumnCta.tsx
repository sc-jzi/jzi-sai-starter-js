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
import { PsegMedia, hasRealHref } from 'components/non-sitecore/PsegMedia';

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

/* Pseg variant — bordered WorryFree Repair / Protect / Replace cards */
export const PsegWorryFree = (props: ThreeColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Card = ({
    image,
    text,
    subText,
    link,
    fallback,
    alt,
  }: {
    image: ImageField;
    text: Field<string>;
    subText: Field<string>;
    link: LinkField;
    fallback: string;
    alt: string;
  }) => (
    <div className="col-sm-12 col-lg-4">
      <div className="pseg-wf-card">
        <PsegMedia field={image} fallback={fallback} alt={alt} width={600} height={360} />
        <div className="pseg-wf-body">
          <h2>
            <Text field={text} />
          </h2>
          <p>
            <Text field={subText} />
          </p>
          {(isPageEditing || hasRealHref(link?.value?.href)) && <Link field={link} className="button" />}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`component three-column-cta pseg-worryfree ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row g-4">
          <Card
            image={props.fields.Image1}
            text={props.fields.Text1}
            subText={props.fields.SubText1}
            link={props.fields.Link1}
            fallback="/pseg/worryfree-repair.jpg"
            alt="PSE&G technician servicing an HVAC unit"
          />
          <Card
            image={props.fields.Image2}
            text={props.fields.Text2}
            subText={props.fields.SubText2}
            link={props.fields.Link2}
            fallback="/pseg/worryfree-protect.jpg"
            alt="PSE&G technician leaning out of a truck window"
          />
          <Card
            image={props.fields.Image3}
            text={props.fields.Text3}
            subText={props.fields.SubText3}
            link={props.fields.Link3}
            fallback="/pseg/worryfree-replace.jpg"
            alt="PSE&G technician kneeling in front of an HVAC unit"
          />
        </div>
      </div>
    </div>
  );
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
