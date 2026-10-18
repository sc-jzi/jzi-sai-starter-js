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

type ColumnProps = {
  image: ImageField;
  title: Field<string>;
  text: Field<string>;
  link: LinkField;
  isPageEditing: boolean;
  delay?: number;
};

const Column = ({ image, title, text, link, isPageEditing, delay }: ColumnProps): JSX.Element => {
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

export const Default = (props: FourColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

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
            isPageEditing={isPageEditing}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            isPageEditing={isPageEditing}
            delay={500}
          />
          <Column
            image={props.fields.Image3}
            title={props.fields.Title3}
            text={props.fields.Text3}
            link={props.fields.Link3}
            isPageEditing={isPageEditing}
            delay={1000}
          />
          <Column
            image={props.fields.Image4}
            title={props.fields.Title4}
            text={props.fields.Text4}
            link={props.fields.Link4}
            isPageEditing={isPageEditing}
            delay={1500}
          />
        </div>
      </div>
    </div>
  );
};

export const CCI = (props: FourColumnCtaProps): JSX.Element => (
  <div className="variant-cci variant-cci-four-column-cta">
    <Default {...props} />
  </div>
);
