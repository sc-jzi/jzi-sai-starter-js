'use client';

import { JSX } from 'react';
import {
  Field,
  Link,
  LinkField,
  RichText,
  RichTextField,
  Text,
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

/* AkamaiLead — product-page lead form with Akamai field labels and styling */
export const AkamaiLead = (props: ApplicationFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  return (
    <div
      className={`component application-form akamai-brand akamai-lead-form bg-[var(--brand-bg)] py-16 ${sxaStyles}`}
      id={id || undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto max-w-[720px] rounded-[var(--akamai-card-radius)] bg-white p-8 shadow-[var(--akamai-card-shadow)] md:p-10">
        <Text
          field={props.fields?.Title}
          tag="h2"
          className="m-0 text-2xl font-bold text-black md:text-3xl"
        />
        <RichText
          field={props.fields?.Subtitle}
          className="mt-3 text-sm leading-relaxed text-[var(--brand-muted-fg)] [&_p]:mb-0"
        />

        <form
          className="mt-8 grid gap-4 sm:grid-cols-2"
          onSubmit={(e) => e.preventDefault()}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          suppressHydrationWarning
        >
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            defaultValue={props.fields?.FullName?.value}
            placeholder="First Name"
            name="firstName"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            defaultValue={props.fields?.IDNumber?.value}
            placeholder="Last Name"
            name="lastName"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] sm:col-span-2"
            defaultValue={props.fields?.Email?.value}
            placeholder="Business Email"
            name="email"
            type="text"
            inputMode="email"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            placeholder="Job Title"
            name="jobTitle"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            placeholder="Company"
            name="company"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            placeholder="Country"
            name="country"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <input
            className="rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)]"
            defaultValue={props.fields?.MobileNumber?.value}
            placeholder="Phone Number"
            name="phone"
            type="text"
            inputMode="tel"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <textarea
            className="min-h-[100px] rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm outline-none focus:border-[var(--brand-secondary)] sm:col-span-2"
            placeholder="How can we help?"
            name="message"
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
          />
          <div className="sm:col-span-2">
            <RichText
              field={props.fields?.Footnote}
              className="mb-4 text-xs text-[var(--brand-muted-fg)] [&_p]:mb-0"
            />
            <Link field={props.fields.SubmitButton} className="akamai-button-primary" />
          </div>
        </form>
      </div>
    </div>
  );
};
