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
import { GoldArrow } from 'components/non-sitecore/GoldArrow';

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

/* Walden variant — dark teal program finder bar */
export const WaldenProgramFinder = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const buttons = [
    { title: props.fields.Title1, link: props.fields.Link1 },
    { title: props.fields.Title2, link: props.fields.Link2 },
    { title: props.fields.Title3, link: props.fields.Link3 },
    { title: props.fields.Title4, link: props.fields.Link4 },
  ];

  return (
    <div className={`component four-column-cta walden-program-finder ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row align-items-end g-3">
          <div className="col-lg-5">
            <div className="walden-finder__label">
              <Text field={props.fields.Text1} />
            </div>
            <input className="walden-finder__search" type="search" placeholder="SEARCH WALDEN PROGRAMS" aria-label="Search Walden programs" />
          </div>
          <div className="col-lg-7">
            <div className="row g-2">
              {buttons.map((button, index) => (
                <div className="col-6" key={index}>
                  <Link field={button.link} className="walden-finder__btn">
                    <Text field={button.title} />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Walden variant — area of interest cards with gold-arrow links */
export const WaldenInterestGrid = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = [
    { title: props.fields.Title1, text: props.fields.Text1, link: props.fields.Link1 },
    { title: props.fields.Title2, text: props.fields.Text2, link: props.fields.Link2 },
    { title: props.fields.Title3, text: props.fields.Text3, link: props.fields.Link3 },
    { title: props.fields.Title4, text: props.fields.Text4, link: props.fields.Link4 },
  ];

  return (
    <div className={`component four-column-cta walden-interest-grid ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <h2 className="walden-interest__heading">Browse by Your Area of Interest</h2>
        <div className="row">
          {columns.map((column, index) => (
            <div className="col-sm-6 col-lg-3" key={index}>
              <div className="walden-interest__card">
                <h3 className="walden-interest__title">
                  <Text field={column.title} />
                </h3>
                <Link field={column.link} className="walden-interest__link">
                  <Text field={column.text} />
                  <GoldArrow />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
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
