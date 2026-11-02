'use client';

import { JSX, FormEvent, useState } from 'react';
import { Field, ImageField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { identity } from '@sitecore-content-sdk/events';
import { COUNTRIES } from 'src/lib/countries';

interface Fields {
  Title: Field<string>;
  EmailLabel: Field<string>;
  SubjectLabel: Field<string>;
  MessageLabel: Field<string>;
  ButtonLabel: Field<string>;
  BackgroundImage: ImageField;
  // Only on the ContactFormMccLabel template
  NewsletterLabel?: Field<string>;
  ThankYouTitle?: Field<string>;
  ThankYouText?: Field<string>;
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

const SUBJECTS = [
  'Request a quote',
  'HR / Employment',
  'Accounting / Invoicing',
  'Customer Service',
  'Vendor Inquiry',
];
// Shown with a full stop; CDP's guest title is the plain form (Dr, Mr, Mrs, Ms, Prof)
const SALUTATIONS = ['Dr.', 'Mr.', 'Mrs.', 'Ms.', 'Prof.'];
// key = the `market` affinity key of the market pages
const MARKETS: ReadonlyArray<readonly [string, string]> = [
  ['automotive_chemicals', 'Automotive & Chemicals'],
  ['beverage', 'Beverage'],
  ['durables', 'Durables & Technical'],
  ['food_dairy', 'Food & Dairy'],
  ['healthcare', 'Healthcare'],
  ['home_care', 'Home Care & Laundry'],
  ['personal_care', 'Personal Care & Beauty'],
  ['wine_spirits', 'Wine & Spirits'],
];
const asPairs = (list: string[]) => list.map((v) => [v, v] as const);

const SelectField = ({
  name,
  label,
  options,
  required,
}: {
  name: string;
  label: string;
  options: ReadonlyArray<readonly [string, string]>;
  required?: boolean;
}) => (
  <label className="mcc-contact__field">
    <span>
      {label}
      {required && ' *'}
    </span>
    <select name={name} required={required} defaultValue="">
      <option value="">- Select -</option>
      {options.map(([value, text]) => (
        <option key={value} value={value}>
          {text}
        </option>
      ))}
    </select>
  </label>
);

const InputField = ({
  name,
  label,
  type = 'text',
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) => (
  <label className="mcc-contact__field">
    <span>
      {label}
      {required && ' *'}
    </span>
    <input name={name} type={type} required={required} />
  </label>
);

// MCC Label contact form: submit sends a Sitecore IDENTITY event (nothing else is posted) and swaps the form for the thank-you text
export const MccLabel = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const [submitted, setSubmitted] = useState(false);
  const f = props.fields;

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const field = (name: string) => String(data.get(name) ?? '').trim();
    const email = field('email').toLowerCase();
    const marketKey = field('market');

    // Profile attributes where CDP has one (title, country as ISO alpha-2); everything else in extensionData
    const eventData = {
      channel: 'WEB',
      currency: 'USD',
      identifiers: [{ id: email, provider: 'email' }],
      email,
      title: field('salutation').replace(/\.$/, '') || undefined,
      firstName: field('firstName'),
      lastName: field('lastName'),
      phone: field('phone') || undefined,
      country: field('country') || undefined,
      extensionData: {
        subject: field('subject'),
        jobTitle: field('jobTitle'),
        company: field('company'),
        market: MARKETS.find(([key]) => key === marketKey)?.[1] ?? '',
        marketKey,
        comments: field('comments'),
        newsletterOptIn: data.get('newsletter') === 'on',
      },
    };

    try {
      await identity(eventData);
      console.info('[Sitecore demo] IDENTITY event sent.');
    } catch (error) {
      console.error('[Sitecore demo] IDENTITY event failed:', error);
    }
    setSubmitted(true);
  };

  return (
    <section className="variant-mcc-label mcc-label-contact-form">
      <div
        className={`component mcc-contact ${props.params?.styles || ''}`}
        id={id ? id : undefined}
      >
        {submitted && !isPageEditing ? (
          <div className="mcc-contact__thanks" role="status">
            {f?.ThankYouTitle && <Text tag="h2" field={f.ThankYouTitle} />}
            {f?.ThankYouText && <Text tag="p" field={f.ThankYouText} />}
          </div>
        ) : (
          <form className="mcc-contact__form" onSubmit={onSubmit}>
            {f?.Title && (isPageEditing || f.Title.value) && <Text tag="h2" field={f.Title} />}
            <div className="mcc-contact__grid">
              <SelectField name="subject" label="Subject" options={asPairs(SUBJECTS)} required />
              <SelectField name="salutation" label="Salutation" options={asPairs(SALUTATIONS)} />
              <InputField name="firstName" label="First name" required />
              <InputField name="lastName" label="Last name" required />
              <InputField name="jobTitle" label="Job title" />
              <InputField name="email" label="Email address" type="email" required />
              <InputField name="phone" label="Phone" type="tel" />
              <InputField name="company" label="Company name" />
              <SelectField name="market" label="Market" options={MARKETS} />
              <SelectField name="country" label="Country" options={COUNTRIES} />
              <label className="mcc-contact__field mcc-contact__field--wide">
                <span>Message</span>
                <textarea name="comments" rows={5} />
              </label>
              <label className="mcc-contact__check mcc-contact__field--wide">
                <input name="newsletter" type="checkbox" />
                {f?.NewsletterLabel && <Text field={f.NewsletterLabel} />}
              </label>
            </div>
            <button type="submit" className="mcc-contact__submit">
              <Text field={f?.ButtonLabel} />
            </button>
          </form>
        )}
      </div>
    </section>
  );
};
