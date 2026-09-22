'use client';

import { useCallback, useEffect, useMemo, useState, type FormEvent, type JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { identity } from '@sitecore-content-sdk/events';
import { personalize } from '@sitecore-content-sdk/personalize';

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
  'rounded border border-[rgba(0,40,86,0.2)] px-3 py-2.5 text-sm bg-white';

/* Password-manager / extension ignore attrs — prevent hydration mismatches in Pages */
const ignoreAutofill = {
  autoComplete: 'off' as const,
  'data-lpignore': 'true',
  'data-1p-ignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
};

/** ISO 3166-1 alpha-2 → E.164 dialing prefix (common demo set). */
const COUNTRY_DIAL_CODES: Record<string, string> = {
  AU: '+61',
  AT: '+43',
  BE: '+32',
  BR: '+55',
  CA: '+1',
  CH: '+41',
  CL: '+56',
  CN: '+86',
  CO: '+57',
  CZ: '+420',
  DE: '+49',
  DK: '+45',
  ES: '+34',
  FI: '+358',
  FR: '+33',
  GB: '+44',
  HK: '+852',
  IE: '+353',
  IL: '+972',
  IN: '+91',
  IT: '+39',
  JP: '+81',
  KR: '+82',
  MX: '+52',
  MY: '+60',
  NL: '+31',
  NO: '+47',
  NZ: '+64',
  PH: '+63',
  PL: '+48',
  PT: '+351',
  SE: '+46',
  SG: '+65',
  TH: '+66',
  TW: '+886',
  AE: '+971',
  US: '+1',
  ZA: '+27',
};

const regionDisplayNames =
  typeof Intl !== 'undefined' ? new Intl.DisplayNames(['en'], { type: 'region' }) : null;

const getCountryName = (code: string): string => {
  try {
    return regionDisplayNames?.of(code) || code;
  } catch {
    return code;
  }
};

const COUNTRY_OPTIONS = Object.keys(COUNTRY_DIAL_CODES)
  .map((code) => ({
    code,
    dial: COUNTRY_DIAL_CODES[code],
    name: getCountryName(code),
  }))
  .sort((a, b) => a.name.localeCompare(b.name));

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

/** Build E.164 from dial prefix + national number. */
const toE164 = (dialCode: string, nationalNumber: string): string | null => {
  const dialDigits = dialCode.replace(/\D/g, '');
  const nationalDigits = nationalNumber.replace(/\D/g, '');
  if (!dialDigits || !nationalDigits) return null;
  return `+${dialDigits}${nationalDigits}`;
};

const extractProfileCountry = (response: unknown): string | null => {
  if (!response || typeof response !== 'object') return null;
  const root = response as Record<string, unknown>;
  const profile =
    root.profile && typeof root.profile === 'object'
      ? (root.profile as Record<string, unknown>)
      : root;
  const sessions = Array.isArray(profile.sessions) ? profile.sessions : [];
  const openSession =
    sessions.find((session) => {
      if (!session || typeof session !== 'object') return false;
      return String((session as { status?: string }).status || '').toLowerCase() === 'open';
    }) || sessions[0];

  if (!openSession || typeof openSession !== 'object') return null;
  const geo = (openSession as { geolocation?: { country?: string } }).geolocation;
  const country = geo?.country?.trim().toUpperCase();
  if (!country || country.length !== 2) return null;
  return COUNTRY_DIAL_CODES[country] ? country : null;
};

/* AkamaiLead — split portrait + lead form card (product page contact) */
export const AkamaiLead = (props: ContactFormProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;

  const [country, setCountry] = useState('');
  const [phoneDial, setPhoneDial] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>(
    'idle'
  );
  const [submitMessage, setSubmitMessage] = useState('');

  const dialOptions = useMemo(() => {
    const unique = new Map<string, string>();
    COUNTRY_OPTIONS.forEach((option) => {
      if (!unique.has(option.dial)) {
        unique.set(option.dial, `${option.dial} (${option.code})`);
      }
    });
    return Array.from(unique.entries())
      .map(([dial, label]) => ({ dial, label }))
      .sort((a, b) => a.dial.localeCompare(b.dial, undefined, { numeric: true }));
  }, []);

  useEffect(() => {
    let active = true;

    const prefillFromProfile = async () => {
      try {
        const response = await personalize({
          channel: 'WEB',
          friendlyId: 'profile',
        });
        if (!active) return;

        const profileCountry = extractProfileCountry(response);
        if (!profileCountry) return;

        setCountry(profileCountry);
        setPhoneDial(COUNTRY_DIAL_CODES[profileCountry] || '+1');
      } catch (error) {
        console.debug('ContactForm: could not prefill country from profile', error);
      }
    };

    const timer = setTimeout(() => {
      void prefillFromProfile();
    }, 600);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, []);

  const handleCountryChange = useCallback((nextCountry: string) => {
    setCountry(nextCountry);
    if (nextCountry && COUNTRY_DIAL_CODES[nextCountry]) {
      setPhoneDial(COUNTRY_DIAL_CODES[nextCountry]);
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      const form = event.currentTarget;
      const firstName = getFormValue(form, 'firstName');
      const lastName = getFormValue(form, 'lastName');
      const email = getFormValue(form, 'email').toLowerCase();
      const jobTitle = getFormValue(form, 'jobTitle');
      const company = getFormValue(form, 'company');
      const message = getFormValue(form, 'message');
      const countryCode = country.trim().toUpperCase();
      const e164Phone = toE164(phoneDial, phoneNumber);

      if (!email) {
        return;
      }

      if (countryCode && countryCode.length !== 2) {
        setSubmitState('error');
        setSubmitMessage('Please select a valid country.');
        return;
      }

      if (phoneNumber.trim() && !e164Phone) {
        setSubmitState('error');
        setSubmitMessage('Please enter a valid phone number with country code.');
        return;
      }

      const extensionData: Record<string, string> = {};
      if (jobTitle) extensionData.jobTitle = jobTitle;
      if (company) extensionData.company = company;
      if (message) extensionData.message = message;

      setSubmitState('submitting');
      setSubmitMessage('');

      try {
        await identity({
          channel: 'WEB',
          currency: 'USD',
          email,
          ...(firstName ? { firstName: toTitleCase(firstName) } : {}),
          ...(lastName ? { lastName: toTitleCase(lastName) } : {}),
          ...(e164Phone ? { phone: e164Phone } : {}),
          ...(countryCode ? { country: countryCode } : {}),
          identifiers: [
            {
              id: email,
              provider: 'email',
            },
          ],
          ...(Object.keys(extensionData).length > 0 ? { extensionData } : {}),
        });
        setSubmitState('success');
        setSubmitMessage('Thanks — your details were submitted.');
      } catch (error) {
        console.error('IDENTITY event failed:', error);
        setSubmitState('error');
        setSubmitMessage('Something went wrong submitting your details. Please try again.');
      }
    },
    [country, phoneDial, phoneNumber]
  );

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
            <select
              className={leadInputClass}
              name="country"
              value={country}
              onChange={(event) => handleCountryChange(event.target.value)}
              aria-label="Country"
              {...ignoreAutofill}
            >
              <option value="">Country</option>
              {COUNTRY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-[7.5rem_minmax(0,1fr)] gap-2">
              <select
                className={leadInputClass}
                name="phoneDial"
                value={phoneDial}
                onChange={(event) => setPhoneDial(event.target.value)}
                aria-label="Phone country code"
                {...ignoreAutofill}
              >
                {dialOptions.map((option) => (
                  <option key={option.dial} value={option.dial}>
                    {option.label}
                  </option>
                ))}
              </select>
              <input
                className={leadInputClass}
                placeholder="Phone Number"
                name="phoneNumber"
                type="text"
                inputMode="tel"
                value={phoneNumber}
                onChange={(event) => setPhoneNumber(event.target.value)}
                {...ignoreAutofill}
              />
            </div>
            <textarea
              className={`${leadInputClass} min-h-[96px] sm:col-span-2`}
              placeholder={props.fields.MessageLabel?.value || 'How can we help?'}
              name="message"
              {...ignoreAutofill}
            />
            <div className="flex flex-col items-end gap-2 sm:col-span-2">
              {submitMessage ? (
                <p
                  className={`m-0 text-sm ${
                    submitState === 'error' ? 'text-red-600' : 'text-[var(--brand-primary,#0b4be8)]'
                  }`}
                >
                  {submitMessage}
                </p>
              ) : null}
              <button
                type="submit"
                className="akamai-button-primary border-0 disabled:opacity-60"
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting'
                  ? 'Submitting…'
                  : props.fields.ButtonLabel?.value || 'Submit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
