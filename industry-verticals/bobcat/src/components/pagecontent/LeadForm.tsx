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

const EditableField = ({ item }: { item: LeadFormFieldItem }): JSX.Element => (
  <div className={`lead-form__field ${isChecked(item.halfWidth?.jsonValue) ? 'is-half' : ''}`}>
    <div className="lead-form__label">
      <Text field={item.label?.jsonValue} />
    </div>
    <div className="lead-form__editing-meta">
      name: <Text field={item.fieldName?.jsonValue} /> · type:{' '}
      <Text field={item.fieldType?.jsonValue} /> · pattern: <Text field={item.pattern?.jsonValue} />
    </div>
    <div className="lead-form__editing-options">
      <Text field={item.options?.jsonValue} />
    </div>
  </div>
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

  const renderField = (item: LeadFormFieldItem): JSX.Element => {
    if (isEditing) return <EditableField key={item.id} item={item} />;
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
      'aria-invalid': !!error,
      'aria-describedby': error ? `${inputId}-error` : undefined,
    };
    const labelEl = (
      <label className="lead-form__label" htmlFor={inputId}>
        {label}
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
            <span>{label}</span>
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
              {label}
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
          {(isEditing || !!datasource.eyebrow?.jsonValue?.value) && (
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
