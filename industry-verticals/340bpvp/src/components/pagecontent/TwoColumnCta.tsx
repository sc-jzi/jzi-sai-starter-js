'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link,
  useSitecore,
  Placeholder,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
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
}

export type TwoColumnCtaProps = ComponentProps & {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: TwoColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    image,
    title,
    text,
    link,
    placeholder,
    delay,
  }: {
    image: ImageField;
    title: Field<string>;
    text: Field<string>;
    link: LinkField;
    placeholder: string;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const buttonStyle = props.params?.ButtonStyle
      ? `button-${props.params.ButtonStyle.toLowerCase()}`
      : 'button-main';

    return (
      <div
        className={`col-sm-12 col-lg-6 ${
          !isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''
        }`}
        ref={domRef}
      >
        <div className="content-wrapper">
          <NextImage field={image} width={800} height={800} />
          {(isPageEditing || title?.value) && (
            <h2>
              <Text field={title} />
            </h2>
          )}
          {(isPageEditing || text?.value) && (
            <p>
              <Text field={text} />
            </p>
          )}
          {(isPageEditing || link?.value?.href) && (
            <Link field={link} className={`button ${buttonStyle}`} />
          )}
          <Placeholder name={placeholder} rendering={props.rendering} />
        </div>
      </div>
    );
  };

  return (
    <div className={`component two-column-cta pb-5 ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        <div className="row">
          <Column
            image={props.fields.Image1}
            title={props.fields.Title1}
            text={props.fields.Text1}
            link={props.fields.Link1}
            placeholder="two-col-placeholder-left"
            delay={0}
          />
          <Column
            image={props.fields.Image2}
            title={props.fields.Title2}
            text={props.fields.Text2}
            link={props.fields.Link2}
            placeholder="two-col-placeholder-right"
            delay={500}
          />
        </div>
      </div>
    </div>
  );
};

const PvpBoxesLook = (props: TwoColumnCtaProps, look: 'outline' | 'gray-navy'): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const boxes = [
    [props.fields?.Title1, props.fields?.Text1, props.fields?.Link1, 'two-col-placeholder-left'],
    [props.fields?.Title2, props.fields?.Text2, props.fields?.Link2, 'two-col-placeholder-right'],
  ] as const;

  return (
    <section
      className={`component two-column-cta variant-pvp-boxes variant-pvp-boxes-${look} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="pvp-boxes">
        {boxes.map(([title, text, link, placeholder], index) => (
          <div className={`pvp-box pvp-box-${index + 1}`} key={placeholder}>
            {(isPageEditing || title?.value) && (
              <h2 className="pvp-box-title">
                {link?.value?.href && !isPageEditing ? (
                  <Link field={link}>
                    <Text field={title} />
                  </Link>
                ) : (
                  <Text field={title} />
                )}
              </h2>
            )}
            {isPageEditing && link && <Link field={link} className="pvp-box-edit-link" />}
            {(isPageEditing || text?.value) && <Text tag="p" field={text} />}
            <Placeholder name={placeholder} rendering={props.rendering} />
          </div>
        ))}
      </div>
    </section>
  );
};

export const PvpBoxes = (props: TwoColumnCtaProps): JSX.Element => PvpBoxesLook(props, 'outline');
export const PvpBoxesGrayNavy = (props: TwoColumnCtaProps): JSX.Element =>
  PvpBoxesLook(props, 'gray-navy');
