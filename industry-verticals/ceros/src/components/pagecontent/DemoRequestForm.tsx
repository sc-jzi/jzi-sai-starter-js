'use client';

import { FormEvent, JSX, useState } from 'react';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

type NamedField = { name: string; jsonValue?: Field<string> };

type OptionItem = { id: string; fields?: NamedField[] };

type FormDatasource = {
  id?: string;
  fields?: NamedField[];
  children?: { results?: OptionItem[] };
};

export type DemoRequestFormProps = {
  params: { [key: string]: string };
  fields?: { data?: { datasource?: FormDatasource } };
};

/** Field lookup by Sitecore field name (the ComponentQuery returns the item's own fields as a list). */
const byName = (list: NamedField[] | undefined, name: string): Field<string> | undefined =>
  list?.find((f) => f.name === name)?.jsonValue;

const INPUTS: { field: string; name: string; type: string; autoComplete: string }[] = [
  { field: 'FirstNameLabel', name: 'firstName', type: 'text', autoComplete: 'given-name' },
  { field: 'LastNameLabel', name: 'lastName', type: 'text', autoComplete: 'family-name' },
  { field: 'EmailLabel', name: 'email', type: 'email', autoComplete: 'email' },
  { field: 'JobTitleLabel', name: 'jobTitle', type: 'text', autoComplete: 'organization-title' },
  { field: 'PhoneLabel', name: 'phone', type: 'tel', autoComplete: 'tel' },
  { field: 'CountryLabel', name: 'country', type: 'text', autoComplete: 'country-name' },
];

const DemoRequestFormBody = ({ props, modifier }: { props: DemoRequestFormProps; modifier: string }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const [sent, setSent] = useState(false);
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const ds = props.fields?.data?.datasource;

  if (!ds) {
    return (
      <div className={`component demo-request-form ${modifier} ${sxaStyles}`} id={id || undefined}>
        <div className="is-empty-hint">Demo request form</div>
      </div>
    );
  }

  const f = (name: string) => byName(ds.fields, name);
  const options = ds.children?.results ?? [];
  const highlight = f('TitleHighlight');
  const thankYou = f('ThankYouText');

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEditing) return;
    if (!e.currentTarget.reportValidity()) return;
    // Demo only: nothing is sent (the live site routes this form to its scheduling tool).
    setSent(true);
  };

  return (
    <section className={`component demo-request-form ${modifier} ${sxaStyles}`} id={id || undefined}>
      <div className="demo-request-form__inner">
        <h2 className="demo-request-form__title">
          <Text field={f('Title')} tag="span" className="demo-request-form__title-muted" />
          {(highlight?.value || isEditing) && (
            <>
              {' '}
              <Text field={highlight} tag="span" className="demo-request-form__title-highlight" />
            </>
          )}
        </h2>
        <div className="demo-request-form__card">
          {sent && !isEditing ? (
            <p className="demo-request-form__thanks" role="status">
              {thankYou?.value || ''}
            </p>
          ) : (
            <form className="demo-request-form__form" onSubmit={onSubmit} noValidate={isEditing}>
              {INPUTS.map((input) => {
                const label = f(input.field);
                return (
                  <label key={input.name} className="demo-request-form__field">
                    <span className="visually-hidden">{label?.value}</span>
                    {isEditing ? (
                      <Text field={label} tag="span" className="demo-request-form__input is-editing" />
                    ) : (
                      <input
                        className="demo-request-form__input"
                        name={input.name}
                        type={input.type}
                        autoComplete={input.autoComplete}
                        placeholder={label?.value}
                        required
                      />
                    )}
                  </label>
                );
              })}
              <label className="demo-request-form__field">
                <span className="visually-hidden">{f('ReasonLabel')?.value}</span>
                {isEditing ? (
                  <Text field={f('ReasonLabel')} tag="span" className="demo-request-form__input is-editing" />
                ) : (
                  <select className="demo-request-form__input demo-request-form__select" name="reason" required defaultValue="">
                    <option value="" disabled>
                      {f('ReasonLabel')?.value}
                    </option>
                    {options.map((o) => {
                      const text = byName(o.fields, 'Label')?.value || '';
                      return (
                        <option key={o.id} value={text}>
                          {text}
                        </option>
                      );
                    })}
                  </select>
                )}
              </label>
              <button type="submit" className="demo-request-form__submit">
                <Text field={f('SubmitLabel')} tag="span" />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: DemoRequestFormProps): JSX.Element => (
  <DemoRequestFormBody props={props} modifier="demo-request-form--default" />
);

export const Ceros = (props: DemoRequestFormProps): JSX.Element => (
  <DemoRequestFormBody props={props} modifier="demo-request-form--ceros" />
);
