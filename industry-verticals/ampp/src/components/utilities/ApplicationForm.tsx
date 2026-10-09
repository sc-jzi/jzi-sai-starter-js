'use client';

import { JSX } from 'react';
import {
  Field,
  Link,
  LinkField,
  RichText,
  RichTextField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title: Field<string>;
  Subtitle: RichTextField;
  FullName: Field<string>;
  IDNumber: Field<string>;
  Email: Field<string>;
  MobileNumber: Field<number>;
  Footnote: RichTextField;
  SubmitButton: LinkField;
}

export type ApplicationFormProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: ApplicationFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div className={`component application-form ${sxaStyles}`} id={id ? id : undefined}>
      <div className="application-form-inner">
        <div className="container">
          <div className="title">
            <Text field={props.fields?.Title} />
          </div>
          <div className="subtitle">
            <RichText field={props.fields?.Subtitle} />
          </div>
          <input
            className="input-field"
            defaultValue={props.fields?.FullName?.value}
            placeholder="First and Last name"
          />
          <input
            className="input-field"
            defaultValue={props.fields?.IDNumber?.value}
            placeholder="ID number"
          />
          <input
            className="input-field"
            defaultValue={props.fields?.Email?.value}
            placeholder="Email"
          />
          <input
            className="input-field"
            defaultValue={props.fields?.MobileNumber?.value}
            placeholder="Mobile number"
          />
          <div className="footnote">
            <RichText field={props.fields?.Footnote} />
          </div>
          <Link field={props.fields.SubmitButton} className="button button-main submit-button" />
        </div>
      </div>
    </div>
  );
};

/* AMPP variant: self-service account card used by registration, login, profile, address, and preferences */
export const Account = (props: ApplicationFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  if (!props.fields) {
    return (
      <div className="component application-form variant-account">
        <span className="is-empty-hint">Application Form</span>
      </div>
    );
  }

  return (
    <div
      className={`component application-form variant-account ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <form className="account-card" onSubmit={(event) => event.preventDefault()}>
          <h2>
            <Text field={props.fields.Title} />
          </h2>
          {(isPageEditing || props.fields.Subtitle?.value) && (
            <div className="account-intro">
              <RichText field={props.fields.Subtitle} />
            </div>
          )}
          <label className="account-field">
            <span>Full name</span>
            <input
              className="input-field"
              defaultValue={props.fields.FullName?.value}
              placeholder="First and Last name"
            />
          </label>
          <label className="account-field">
            <span>ID number</span>
            <input
              className="input-field"
              defaultValue={props.fields.IDNumber?.value}
              placeholder="ID number"
            />
          </label>
          <label className="account-field">
            <span>Email</span>
            <input
              className="input-field"
              type="email"
              defaultValue={props.fields.Email?.value}
              placeholder="Email"
            />
          </label>
          <label className="account-field">
            <span>Mobile number</span>
            <input
              className="input-field"
              defaultValue={props.fields.MobileNumber?.value}
              placeholder="Mobile number"
            />
          </label>
          {(isPageEditing || props.fields.Footnote?.value) && (
            <div className="account-footnote">
              <RichText field={props.fields.Footnote} />
            </div>
          )}
          {(isPageEditing || props.fields.SubmitButton?.value?.href) && (
            <Link field={props.fields.SubmitButton} className="button button-main submit-button" />
          )}
        </form>
      </div>
    </div>
  );
};
