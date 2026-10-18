'use client';

import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';

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

export const CCI = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { fields } = props;

  return (
    <div
      className={`component variant-cci cci-contact-form ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container cci-contact-form-row">
        <div className="cci-contact-form-logo">
          <NextImage field={fields?.BackgroundImage} width={600} height={241} />
        </div>
        <form className="cci-contact-form-form" onSubmit={(event) => event.preventDefault()}>
          <h2>
            <Text field={fields?.Title} />
          </h2>
          <div className="cci-contact-form-grid">
            <input
              type="email"
              placeholder={fields?.EmailLabel?.value}
              aria-label={fields?.EmailLabel?.value}
            />
            <input
              type="text"
              placeholder={fields?.SubjectLabel?.value}
              aria-label={fields?.SubjectLabel?.value}
            />
          </div>
          <textarea
            rows={5}
            placeholder={fields?.MessageLabel?.value}
            aria-label={fields?.MessageLabel?.value}
          />
          <button type="submit" className="cci-button">
            {fields?.ButtonLabel?.value || 'Submit'}
          </button>
        </form>
      </div>
    </div>
  );
};
