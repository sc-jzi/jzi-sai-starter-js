'use client';

import { useCallback, type FormEvent, type JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { identity } from '@sitecore-content-sdk/events';

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

const leadInputClass =
  'rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm';

/* Password-manager / extension ignore attrs — prevent hydration mismatches in Pages */
const ignoreAutofill = {
  autoComplete: 'off' as const,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
};

const toTitleCase = (value: string): string =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');

const getFormValue = (form: HTMLFormElement, name: string): string => {
  const element = form.elements.namedItem(name);
  if (!element || !('value' in element)) return '';
  return String(element.value ?? '').trim();
};

/* AkamaiLead — split portrait + lead form card (product page contact) */
export const AkamaiLead = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const firstName = getFormValue(form, 'firstName');
    const lastName = getFormValue(form, 'lastName');
    const email = getFormValue(form, 'email').toLowerCase();
    const jobTitle = getFormValue(form, 'jobTitle');
    const company = getFormValue(form, 'company');
    const country = getFormValue(form, 'country');
    const phone = getFormValue(form, 'phone');
    const message = getFormValue(form, 'message');

    if (!email) {
      return;
    }

    const extensionData: Record<string, string> = {};
    if (jobTitle) extensionData.jobTitle = jobTitle;
    if (company) extensionData.company = company;
    if (message) extensionData.message = message;

    try {
      await identity({
        channel: 'WEB',
        currency: 'USD',
        email,
        ...(firstName ? { firstName: toTitleCase(firstName) } : {}),
        ...(lastName ? { lastName: toTitleCase(lastName) } : {}),
        ...(phone ? { phone } : {}),
        ...(country
          ? { country: country.length === 2 ? country.toUpperCase() : toTitleCase(country) }
          : {}),
        identifiers: [
          {
            id: email,
            provider: 'email',
          },
        ],
        ...(Object.keys(extensionData).length > 0 ? { extensionData } : {}),
      });
    } catch (error) {
      // Events SDK is not initialized in development / edit / preview modes.
      console.debug('IDENTITY event failed:', error);
    }
  }, []);

  return (
    <div
      className={`component contact-form akamai-brand akamai-contact-lead bg-[var(--brand-bg)] py-16 ${sxaStyles}`}
      id={id || undefined}
      style={{ fontFamily: 'var(--brand-heading-font)' }}
    >
      <div className="mx-auto grid max-w-[1200px] overflow-hidden rounded-[var(--akamai-card-radius)] bg-white shadow-[var(--akamai-card-shadow)] md:grid-cols-2">
        <div className="relative min-h-[320px] bg-[var(--brand-hero-navy)]">
          <NextImage
            field={props.fields.BackgroundImage}
            width={800}
            height={960}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>

        <div className="p-8 md:p-10" suppressHydrationWarning>
          <Text
            field={props.fields?.Title}
            tag="h2"
            className="m-0 text-2xl font-bold text-black"
          />
          <form
            className="mt-6 grid gap-3 sm:grid-cols-2"
            onSubmit={handleSubmit}
            autoComplete="off"
            data-lpignore="true"
            data-1p-ignore="true"
            suppressHydrationWarning
          >
            <input
              className={leadInputClass}
              placeholder="First Name"
              name="firstName"
              {...ignoreAutofill}
            />
            <input
              className={leadInputClass}
              placeholder="Last Name"
              name="lastName"
              {...ignoreAutofill}
            />
            <input
              className={`${leadInputClass} sm:col-span-2`}
              placeholder={props.fields.EmailLabel?.value || 'Business Email'}
              name="email"
              type="text"
              inputMode="email"
              required
              {...ignoreAutofill}
            />
            <input
              className={leadInputClass}
              placeholder={props.fields.SubjectLabel?.value || 'Job Title'}
              name="jobTitle"
              {...ignoreAutofill}
            />
            <input
              className={leadInputClass}
              placeholder="Company"
              name="company"
              {...ignoreAutofill}
            />
            <input
              className={leadInputClass}
              placeholder="Country"
              name="country"
              {...ignoreAutofill}
            />
            <input
              className={leadInputClass}
              placeholder="Phone Number"
              name="phone"
              type="text"
              inputMode="tel"
              {...ignoreAutofill}
            />
            <textarea
              className={`${leadInputClass} min-h-[96px] sm:col-span-2`}
              placeholder={props.fields.MessageLabel?.value || 'How can we help?'}
              name="message"
              {...ignoreAutofill}
            />
            <div className="flex justify-end sm:col-span-2">
              <button type="submit" className="akamai-button-primary border-0">
                {props.fields.ButtonLabel?.value || 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
