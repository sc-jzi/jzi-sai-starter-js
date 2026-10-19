'use client';

import { JSX } from 'react';
import { Field, ImageField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  EmailLabel: Field<string>;
  SubjectLabel: Field<string>;
  MessageLabel: Field<string>;
  ButtonLabel: Field<string>;
  BackgroundImage: ImageField;
}

export type ContactFormProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component contact-form component-spaced ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container container-widest-fluid">
        <NextImage
          field={props.fields.BackgroundImage}
          className="img-fluid"
          width={1920}
          height={800}
        />
        <div className="container">
          <div className="contact-form-inner">
            <form>
              <h2 className="mb-4">
                <Text field={props.fields?.Title} />
              </h2>
              <input type="text" placeholder={props.fields.EmailLabel.value} />
              <input type="text" placeholder={props.fields.SubjectLabel.value} />
              <textarea placeholder={props.fields.MessageLabel.value} />
              <input
                type="submit"
                value={props.fields.ButtonLabel.value}
                className="button button-main mt-3"
              />
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ConcentricUSA variant: centered inquiry form on the dark page */
export const ConcentricUSA = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const showImage = props.fields?.BackgroundImage?.value?.src || isPageEditing;

  return (
    <div
      className={`component contact-form variant-concentricusa ${props.params?.styles || ''}`}
      id={id || undefined}
    >
      <div className="container">
        {showImage && (
          <NextImage field={props.fields.BackgroundImage} className="img-fluid" width={1920} height={480} />
        )}
        <div className="contact-form-inner">
          <form>
            <h2>
              <Text field={props.fields?.Title} />
            </h2>
            <input type="text" placeholder={props.fields?.EmailLabel?.value} />
            <input type="text" placeholder={props.fields?.SubjectLabel?.value} />
            <textarea placeholder={props.fields?.MessageLabel?.value} />
            <input
              type="submit"
              value={props.fields?.ButtonLabel?.value}
              className="button button-main"
            />
          </form>
        </div>
      </div>
    </div>
  );
};

/* ConcentricUSA photo background with a dark overlay; white title and form on top */
export const ConcentricUSAOverlay = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const showImage = props.fields?.BackgroundImage?.value?.src || isPageEditing;

  return (
    <div
      className={`component contact-form variant-concentricusa-overlay ${props.params?.styles || ''}`}
      id={id || undefined}
    >
      {showImage && (
        <NextImage
          field={props.fields.BackgroundImage}
          className="contact-form-media"
          width={1920}
          height={900}
        />
      )}
      <div className="contact-form-scrim" />
      <div className="container">
        <div className="contact-form-inner">
          <h2>
            <Text field={props.fields?.Title} />
          </h2>
          <form>
            <input type="email" placeholder={props.fields?.EmailLabel?.value} />
            <input type="text" placeholder={props.fields?.SubjectLabel?.value} />
            <textarea placeholder={props.fields?.MessageLabel?.value} />
            <input
              type="submit"
              value={props.fields?.ButtonLabel?.value}
              className="button button-main"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
