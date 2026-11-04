'use client';

import { FormEvent, JSX, useState } from 'react';
import {
  Field,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { identity } from '@sitecore-content-sdk/events';
import type { IdentityData } from '@sitecore-content-sdk/events';
import { ComponentProps } from 'lib/component-props';

/**
 * LeadForm: a lead form whose fields are the datasource's child items (Label, FieldName, FieldType,
 * Required, Pattern, Options, HalfWidth). Client-side validation (required + pattern), then a JSON POST to
 * the SubmitEndpoint link when one is set; the SuccessMessage is shown afterwards. In editing mode every
 * field is editable and nothing is submitted.
 *
 * FieldType: text | email | tel | textarea | checkbox | checkbox-group | select | address
 * (address: one search-style line with an "Enter Address Manually" button that opens city / state / ZIP lines).
 * Options (Multi-Line): one option per line; a line starting with "#" starts a named group (checkbox-group).
 */

type JsonField<T> = { jsonValue?: T };

export interface LeadFormFieldItem {
  id: string;
  label?: JsonField<Field<string>>;
  fieldName?: JsonField<Field<string>>;
  fieldType?: JsonField<Field<string>>;
  required?: JsonField<Field<boolean | string>>;
  pattern?: JsonField<Field<string>>;
  options?: JsonField<Field<string>>;
  halfWidth?: JsonField<Field<boolean | string>>;
}

export type LeadFormProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        eyebrow?: JsonField<Field<string>>;
        title?: JsonField<Field<string>>;
        text?: JsonField<RichTextField>;
        consentText?: JsonField<RichTextField>;
        submitLabel?: JsonField<Field<string>>;
        successMessage?: JsonField<RichTextField>;
        submitEndpoint?: JsonField<LinkField>;
        children?: { results?: LeadFormFieldItem[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat';
type Values = Record<string, string | string[]>;

/**
 * The ComponentQuery reads each child's own fields as a list (`fields(ownFields: true) { name jsonValue }`) to stay within
 * Experience Edge's query-depth limit; this turns that list into the keyed shape used below (FieldName -> fieldName).
 */
type ChildFieldList = { id: string; fields?: { name: string; jsonValue?: unknown }[] };
const keyedChild = (child: LeadFormFieldItem & ChildFieldList): LeadFormFieldItem => {
  if (!Array.isArray(child.fields)) return child;
  const keyed: Record<string, unknown> = { id: child.id };
  for (const f of child.fields) {
    if (f?.name)
      keyed[f.name.charAt(0).toLowerCase() + f.name.slice(1)] = { jsonValue: f.jsonValue };
  }
  return keyed as unknown as LeadFormFieldItem;
};

const isChecked = (f?: Field<boolean | string>) =>
  f?.value === true || f?.value === '1' || f?.value === 'true';

const typeOf = (item: LeadFormFieldItem) =>
  `${item.fieldType?.jsonValue?.value || 'text'}`.trim().toLowerCase();

const nameOf = (item: LeadFormFieldItem) =>
  `${item.fieldName?.jsonValue?.value || item.label?.jsonValue?.value || item.id}`.trim();

type OptionGroup = { label: string; options: string[] };

const optionGroups = (item: LeadFormFieldItem): OptionGroup[] => {
  const groups: OptionGroup[] = [];
  let current: OptionGroup = { label: '', options: [] };
  `${item.options?.jsonValue?.value || ''}`
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (line.startsWith('#')) {
        if (current.label || current.options.length) groups.push(current);
        current = { label: line.replace(/^#+\s*/, ''), options: [] };
      } else current.options.push(line);
    });
  if (current.label || current.options.length) groups.push(current);
  return groups;
};

const validate = (items: LeadFormFieldItem[], values: Values): Record<string, string> => {
  const errors: Record<string, string> = {};
  for (const item of items) {
    const name = nameOf(item);
    const type = typeOf(item);
    const label = item.label?.jsonValue?.value || name;
    const value = values[name];
    const empty = Array.isArray(value) ? value.length === 0 : !`${value ?? ''}`.trim();
    if (isChecked(item.required?.jsonValue) && empty) {
      errors[name] = `${label} is required.`;
      continue;
    }
    if (empty || Array.isArray(value)) continue;
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(`${value}`)) {
      errors[name] = `Enter a valid email address.`;
      continue;
    }
    const pattern = `${item.pattern?.jsonValue?.value || ''}`.trim();
    if (pattern) {
      try {
        if (!new RegExp(pattern).test(`${value}`)) errors[name] = `${label} is not valid.`;
      } catch {
        // an invalid authored pattern never blocks the visitor
      }
    }
  }
  return errors;
};

/**
 * IDENTITY event (Sitecore CDP / Personalize) for a submitted lead form. The form's FieldName values decide where each answer goes:
 * firstName, lastName, email, phone, mobile and an `address` field (street line + city / state / zip parts) become identity attributes;
 * every other answer (company, product interests, opt-in, ...) goes into extensionData under its FieldName, together with the form and
 * the visit (page, referrer, UTM parameters). The email is the identifier; without an email no identity event is sent.
 */
const IDENTITY_FIELDS = new Set(['firstName', 'lastName', 'email', 'phone', 'mobile']);
const PHONE_FIELDS = new Set(['phone', 'mobile']);

/** Edge rejects a phone that is not E.164 (400). A 10-digit number gets +1 (this is a North America form); others need their own +code. */
const toE164 = (raw: string): string | null => {
  const digits = raw.replace(/[^\d+]/g, '');
  if (/^\+[1-9]\d{6,14}$/.test(digits)) return digits;
  const d = digits.replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return null;
};

const buildIdentity = (
  items: LeadFormFieldItem[],
  values: Values,
  form: { id?: string; title?: string },
  language?: string
): IdentityData | null => {
  const text = (v: string | string[] | undefined) => (Array.isArray(v) ? v.join(', ') : `${v ?? ''}`.trim());
  const email = text(values.email).toLowerCase();
  if (!email) return null;

  const data: IdentityData = {
    channel: 'WEB',
    language,
    page: typeof window !== 'undefined' ? window.location.pathname : undefined,
    identifiers: [{ id: email, provider: 'email' }],
    email,
  };
  const extensionData: Record<string, string | number | boolean> = {
    formName: form.title || 'Lead form',
    ...(form.id ? { formId: form.id } : {}),
  };

  for (const item of items) {
    const name = nameOf(item);
    const type = typeOf(item);
    const value = text(values[name]);
    if (type === 'address') {
      // the Events SDK types street as string[], but the Edge events API answers 500 ("ArrayList cannot be cast to String") for an array
      if (value) data.street = value as unknown as string[];
      const city = text(values[`${name}-city`]);
      const state = text(values[`${name}-state`]);
      const zip = text(values[`${name}-zip`]);
      if (city) data.city = city;
      if (state) data.state = state;
      if (zip) data.postalCode = zip;
      continue;
    }
    if (IDENTITY_FIELDS.has(name)) {
      if (!value || name === 'email') continue;
      if (PHONE_FIELDS.has(name)) {
        const e164 = toE164(value);
        if (e164) (data as unknown as Record<string, string>)[name] = e164;
        else extensionData[name] = value; // kept, but outside the validated phone attribute
        continue;
      }
      (data as unknown as Record<string, string>)[name] = value;
      continue;
    }
    if (type === 'checkbox') {
      extensionData[name] = values[name] === 'yes';
      continue;
    }
    if (value) extensionData[name] = value;
  }

  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content']) {
      const v = params.get(key);
      if (v) extensionData[key.replace(/_(\w)/g, (_, c: string) => c.toUpperCase())] = v;
    }
    if (document.referrer) extensionData.referrer = document.referrer;
  }

  data.extensionData = extensionData;
  return data;
};

/**
 * Editing only: the field's technical settings, collapsed under its control so Pages shows the form as visitors see it.
 * Required and HalfWidth are checkboxes: edit them in the item's fields panel.
 */
const FieldSettings = ({ item }: { item: LeadFormFieldItem }): JSX.Element => (
  <details className="lead-form__settings">
    <summary>Field settings</summary>
    <div className="lead-form__editing-meta">
      <div>
        name: <Text field={item.fieldName?.jsonValue} />
      </div>
      <div>
        type: <Text field={item.fieldType?.jsonValue} /> (text, email, tel, textarea, checkbox,
        checkbox-group, select, address)
      </div>
      <div>
        pattern: <Text field={item.pattern?.jsonValue} />
      </div>
      <div>required: {isChecked(item.required?.jsonValue) ? 'yes' : 'no'}</div>
    </div>
    <div className="lead-form__editing-options">
      options (one per line, &quot;#Group&quot; starts a group): <Text field={item.options?.jsonValue} />
    </div>
  </details>
);

const LeadFormView = ({ props, look }: { props: LeadFormProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const [values, setValues] = useState<Values>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');
  const [manualAddress, setManualAddress] = useState<string[]>([]);

  if (!datasource) {
    return (
      <div className={`component lead-form ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Lead Form: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const items = (datasource.children?.results ?? []).map((c) =>
    keyedChild(c as LeadFormFieldItem & ChildFieldList)
  );
  const endpoint = datasource.submitEndpoint?.jsonValue;
  const submitLabel = datasource.submitLabel?.jsonValue;

  const setValue = (name: string, value: string | string[]) => {
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const toggle = (name: string, option: string, on: boolean) => {
    const current = Array.isArray(values[name]) ? (values[name] as string[]) : [];
    setValue(name, on ? [...current, option] : current.filter((o) => o !== option));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isEditing) return;
    const found = validate(items, values);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setStatus('sending');
    // IDENTITY event first: it ties this visitor's browsing (and personalization) to the person who submitted the form.
    // It rejects when the Events SDK is not initialized (development mode, editing/preview): that never blocks the visitor.
    const identityData = buildIdentity(
      items,
      values,
      { id: datasource.id, title: datasource.title?.jsonValue?.value },
      page?.locale
    );
    if (identityData) {
      try {
        await identity(identityData);
      } catch (e) {
        console.debug('Lead form: identity event not sent', e);
      }
    }
    const href = endpoint?.value?.href;
    if (href) {
      try {
        await fetch(href, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            form: datasource.title?.jsonValue?.value || 'Lead form',
            fields: values,
          }),
        });
      } catch {
        // illustrative endpoint: a network or CORS error does not stop the visitor
      }
    }
    setStatus('sent');
  };

  // In Pages the form renders as visitors see it (controls disabled), the label is editable in place, and each field's settings sit
  // in a collapsed "Field settings" block under it.
  const renderField = (item: LeadFormFieldItem): JSX.Element => {
    const control = renderControl(item);
    if (!isEditing) return control;
    return (
      <div
        key={item.id}
        className={`lead-form__editable ${isChecked(item.halfWidth?.jsonValue) ? 'is-half' : ''}`}
      >
        {control}
        <FieldSettings item={item} />
      </div>
    );
  };

  const renderControl = (item: LeadFormFieldItem): JSX.Element => {
    const name = nameOf(item);
    const type = typeOf(item);
    const label = item.label?.jsonValue?.value || '';
    const required = isChecked(item.required?.jsonValue);
    const error = errors[name];
    const inputId = `${id || 'lead-form'}-${name}`;
    const half = isChecked(item.halfWidth?.jsonValue);
    const common = {
      id: inputId,
      name,
      disabled: isEditing,
      'aria-invalid': !!error,
      'aria-describedby': error ? `${inputId}-error` : undefined,
    };
    const labelText = isEditing ? <Text field={item.label?.jsonValue} /> : label;
    const labelEl = (
      <label className="lead-form__label" htmlFor={inputId}>
        {labelText}
        {required && <span className="lead-form__required"> *</span>}
      </label>
    );
    const errorEl = error ? (
      <div className="lead-form__error" id={`${inputId}-error`}>
        {error}
      </div>
    ) : null;

    if (type === 'checkbox') {
      return (
        <div key={item.id} className="lead-form__field lead-form__field--checkbox">
          <label className="lead-form__check">
            <input
              type="checkbox"
              {...common}
              checked={values[name] === 'yes'}
              onChange={(e) => setValue(name, e.target.checked ? 'yes' : '')}
            />
            <span>{labelText}</span>
          </label>
          {errorEl}
        </div>
      );
    }

    if (type === 'checkbox-group') {
      const selected = Array.isArray(values[name]) ? (values[name] as string[]) : [];
      return (
        <fieldset
          key={item.id}
          className="lead-form__field lead-form__field--group"
          aria-invalid={!!error}
        >
          <legend className="lead-form__label">
            <span>
              {labelText}
              {required ? ' *' : ''}
            </span>
          </legend>
          <div className="lead-form__groups">
            {optionGroups(item).map((group, gi) => (
              <div className="lead-form__group" key={gi}>
                {group.label && <div className="lead-form__group-label">{group.label}</div>}
                {group.options.map((option) => (
                  <label className="lead-form__check" key={option}>
                    <input
                      type="checkbox"
                      name={name}
                      value={option}
                      checked={selected.includes(option)}
                      disabled={isEditing}
                      onChange={(e) => toggle(name, option, e.target.checked)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            ))}
          </div>
          {errorEl}
        </fieldset>
      );
    }

    if (type === 'address') {
      const manual = manualAddress.includes(name);
      const part = (suffix: string, partLabel: string) => (
        <div className="lead-form__address-part" key={suffix}>
          <label className="lead-form__label" htmlFor={`${inputId}-${suffix}`}>
            {partLabel}
          </label>
          <input
            id={`${inputId}-${suffix}`}
            name={`${name}-${suffix}`}
            type="text"
            className="lead-form__input"
            disabled={isEditing}
            value={`${values[`${name}-${suffix}`] ?? ''}`}
            onChange={(e) => setValue(`${name}-${suffix}`, e.target.value)}
          />
        </div>
      );
      return (
        <div key={item.id} className="lead-form__field lead-form__field--address">
          {labelEl}
          <input
            {...common}
            type="text"
            autoComplete="street-address"
            placeholder="Start Typing"
            className="lead-form__input"
            value={`${values[name] ?? ''}`}
            onChange={(e) => setValue(name, e.target.value)}
          />
          <button
            type="button"
            className="lead-form__manual"
            aria-expanded={manual}
            onClick={() =>
              setManualAddress((m) => (manual ? m.filter((x) => x !== name) : [...m, name]))
            }
          >
            Enter Address Manually
          </button>
          {manual && (
            <div className="lead-form__address-parts">
              {part('city', 'City')}
              {part('state', 'State / Province')}
              {part('zip', 'ZIP / Postal Code')}
            </div>
          )}
          {errorEl}
        </div>
      );
    }

    if (type === 'select') {
      return (
        <div key={item.id} className={`lead-form__field ${half ? 'is-half' : ''}`}>
          {labelEl}
          <select
            {...common}
            className="lead-form__input"
            value={`${values[name] ?? ''}`}
            onChange={(e) => setValue(name, e.target.value)}
          >
            <option value="">Select…</option>
            {optionGroups(item)
              .flatMap((g) => g.options)
              .map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
          </select>
          {errorEl}
        </div>
      );
    }

    return (
      <div key={item.id} className={`lead-form__field ${half ? 'is-half' : ''}`}>
        {labelEl}
        {type === 'textarea' ? (
          <textarea
            {...common}
            className="lead-form__input"
            rows={4}
            value={`${values[name] ?? ''}`}
            onChange={(e) => setValue(name, e.target.value)}
          />
        ) : (
          <input
            {...common}
            type={type === 'email' || type === 'tel' ? type : 'text'}
            className="lead-form__input"
            value={`${values[name] ?? ''}`}
            onChange={(e) => setValue(name, e.target.value)}
          />
        )}
        {errorEl}
      </div>
    );
  };

  return (
    <div className={`component lead-form lead-form--${look} ${styles}`} id={id ? id : undefined}>
      <div className="lead-form__band">
        <div className="lead-form__inner">
          {/* an empty eyebrow is left out in Pages too (no "[No text in field]" line above the title); fill it in the item's fields */}
          {!!datasource.eyebrow?.jsonValue?.value && (
            <div className="lead-form__eyebrow">
              <Text field={datasource.eyebrow?.jsonValue} />
            </div>
          )}
          {(isEditing || !!datasource.title?.jsonValue?.value) && (
            <h2 className="lead-form__title">
              <Text field={datasource.title?.jsonValue} />
            </h2>
          )}
          {(isEditing || !!datasource.text?.jsonValue?.value) && (
            <RichText field={datasource.text?.jsonValue} className="lead-form__intro" />
          )}

          {status === 'sent' && !isEditing ? (
            <div className="lead-form__success" role="status">
              <RichText field={datasource.successMessage?.jsonValue} />
            </div>
          ) : (
            <form className="lead-form__form" noValidate onSubmit={onSubmit}>
              <div className="lead-form__fields">{items.map(renderField)}</div>
              {(isEditing || !!datasource.consentText?.jsonValue?.value) && (
                <RichText
                  field={datasource.consentText?.jsonValue}
                  className="lead-form__consent"
                />
              )}
              {isEditing ? (
                <div className="lead-form__editing-footer">
                  <div className="bobcat-button lead-form__submit">
                    <Text field={submitLabel} />
                  </div>
                  <div className="lead-form__editing-meta">
                    Submit endpoint: <Link field={endpoint as LinkField} />
                  </div>
                  <div className="lead-form__editing-meta">Success message:</div>
                  <RichText field={datasource.successMessage?.jsonValue} />
                </div>
              ) : (
                <button
                  type="submit"
                  className="bobcat-button lead-form__submit"
                  disabled={status === 'sending'}
                >
                  {submitLabel?.value || 'Submit'}
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: LeadFormProps): JSX.Element => (
  <LeadFormView props={props} look="default" />
);

export const Bobcat = (props: LeadFormProps): JSX.Element => (
  <LeadFormView props={props} look="bobcat" />
);
