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
  Text2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Text3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Text4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
  Text5: Field<string>;
  Image5: ImageField;
  Link5: LinkField;
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
    delay,
  }: {
    image: ImageField;
    text: Field<string>;
    link: LinkField;
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
        <div className="text-container">
          <Text field={text} />
        </div>
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
          <Column image={props.fields.Image1} text={props.fields.Text1} link={props.fields.Link1} />
          <Column
            image={props.fields.Image2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            text={props.fields.Text3}
            link={props.fields.Link3}
            delay={1000}
          />
          <Column
            image={props.fields.Image4}
            text={props.fields.Text4}
            link={props.fields.Link4}
            delay={1500}
          />
          <Column
            image={props.fields.Image5}
            text={props.fields.Text5}
            link={props.fields.Link5}
            delay={2000}
          />
        </div>
      </div>
    </div>
  );
};

const ACCREDITATION_COPY =
  'Chamberlain is accredited by the Higher Learning Commission and proudly holds programmatic accreditations, including CCNE, for many programs.';
const ACCREDITATION_URL = 'https://www.chamberlain.edu/about/accreditation';

const ViewAllArrow = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path
      fill="currentColor"
      d="M9.3 3.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 1 1-1.4-1.4L11.6 9H2a1 1 0 1 1 0-2h9.6L9.3 4.7a1 1 0 0 1 0-1.4Z"
    />
  </svg>
);

/* Chamberlain variant — Proudly Accredited split layout with seal boxes */
export const ChamberlainLogos = (props: FiveColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields || {};
  const seals = [
    { image: fields.Image1, link: fields.Link1 },
    { image: fields.Image2, link: fields.Link2 },
    { image: fields.Image3, link: fields.Link3 },
    { image: fields.Image4, link: fields.Link4 },
  ].filter((seal) => isPageEditing || Boolean(seal.image?.value?.src));

  return (
    <div
      className={`component five-column-cta chamberlain-logos ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="chamberlain-logos__layout">
          <div className="chamberlain-logos__copy">
            <h2 className="chamberlain-logos__heading">
              <span className="chamberlain-logos__proudly">Proudly </span>
              <span className="chamberlain-logos__accredited">Accredited</span>
            </h2>
            <p>{ACCREDITATION_COPY}</p>
            <a href={ACCREDITATION_URL} className="chamberlain-link-arrow chamberlain-logos__all">
              View All
              <ViewAllArrow />
            </a>
          </div>
          <div className="chamberlain-logos__seals-wrap">
            <div className="chamberlain-logos__pattern" aria-hidden />
            <div className="chamberlain-logos__seals">
              {seals.map((seal, index) => {
                const image = (
                  <div className="image-container">
                    <NextImage field={seal.image} className="d-block" width={220} height={120} />
                  </div>
                );
                const href = seal.link?.value?.href;

                return (
                  <div className="chamberlain-logos__seal" key={index}>
                    {href ? <Link field={seal.link}>{image}</Link> : image}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
