'use client';

import { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  Link,
  LinkField,
  NextImage,
  RichText,
  RichTextField,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue?: T };

interface OptionItem {
  id?: string;
  name?: string;
  label?: JsonValue<Field<string>>;
  heading?: JsonValue<Field<string>>;
  text?: JsonValue<RichTextField>;
  card1Title?: JsonValue<Field<string>>;
  card1Link?: JsonValue<LinkField>;
  card1Icon?: JsonValue<ImageField>;
  card2Title?: JsonValue<Field<string>>;
  card2Link?: JsonValue<LinkField>;
  card2Icon?: JsonValue<ImageField>;
  card3Title?: JsonValue<Field<string>>;
  card3Link?: JsonValue<LinkField>;
  card3Icon?: JsonValue<ImageField>;
}

// The ComponentQuery returns each child's own fields as a { name, jsonValue } list (keeps the query small for Experience Edge).
interface RawOption {
  id?: string;
  name?: string;
  fields?: { name: string; jsonValue: unknown }[];
}

const KEYS: Record<string, keyof OptionItem> = {
  Label: 'label', Heading: 'heading', Text: 'text',
  Card1Title: 'card1Title', Card1Link: 'card1Link', Card1Icon: 'card1Icon',
  Card2Title: 'card2Title', Card2Link: 'card2Link', Card2Icon: 'card2Icon',
  Card3Title: 'card3Title', Card3Link: 'card3Link', Card3Icon: 'card3Icon',
};

const toOption = (raw: RawOption): OptionItem => {
  const o: Record<string, unknown> = { id: raw.id, name: raw.name };
  for (const f of raw.fields ?? []) if (KEYS[f.name]) o[KEYS[f.name]] = { jsonValue: f.jsonValue };
  return o as OptionItem;
};

interface IWantToData {
  datasource?: {
    id?: string;
    title?: JsonValue<Field<string>>;
    placeholder?: JsonValue<Field<string>>;
    buttonLabel?: JsonValue<Field<string>>;
    children?: { results?: RawOption[] };
  };
}

export type IWantToProps = ComponentProps & { fields?: { data?: IWantToData } };

const Card = ({
  title,
  link,
  icon,
  editing,
}: {
  title?: Field<string>;
  link?: LinkField;
  icon?: ImageField;
  editing: boolean;
}): JSX.Element | null => {
  if (!editing && !title?.value && !link?.value?.href) return null;
  return (
    <div className="i-want-to__card">
      {(editing || icon?.value?.src) && <NextImage field={icon} className="i-want-to__card-icon" width={90} height={90} />}
      <Text tag="h4" className="i-want-to__card-title" field={title} />
      {(editing || link?.value?.href) && <Link field={link as LinkField} className="i-want-to__card-link" />}
    </div>
  );
};

const Panel = ({ option, editing }: { option: OptionItem; editing: boolean }): JSX.Element => (
  <div className="i-want-to__panel" role="region" aria-label={String(option.heading?.jsonValue?.value ?? '')}>
    <div className="i-want-to__panel-intro">
      <Text tag="h3" className="i-want-to__panel-heading" field={option.heading?.jsonValue} />
      <RichText className="i-want-to__panel-text" field={option.text?.jsonValue} />
    </div>
    <div className="i-want-to__cards">
      <Card title={option.card1Title?.jsonValue} link={option.card1Link?.jsonValue} icon={option.card1Icon?.jsonValue} editing={editing} />
      <Card title={option.card2Title?.jsonValue} link={option.card2Link?.jsonValue} icon={option.card2Icon?.jsonValue} editing={editing} />
      <Card title={option.card3Title?.jsonValue} link={option.card3Link?.jsonValue} icon={option.card3Icon?.jsonValue} editing={editing} />
    </div>
  </div>
);

const IWantToBody = ({ props, className }: { props: IWantToProps; className: string }): JSX.Element => {
  const { page } = useSitecore();
  const editing = !!page?.mode?.isEditing;
  const ds = props.fields?.data?.datasource;
  const options = (ds?.children?.results ?? []).map(toOption);
  const [choice, setChoice] = useState('');
  const [shown, setShown] = useState('');
  const id = props.params?.RenderingIdentifier;

  if (!ds) {
    return (
      <div className={`component i-want-to ${className}`} id={id}>
        <span className="is-empty-hint">I want to</span>
      </div>
    );
  }

  const active = options.find((o) => o.id === shown);

  return (
    <div className={`component i-want-to ${className}`} id={id}>
      <form
        className="i-want-to__bar container"
        onSubmit={(e) => {
          e.preventDefault();
          setShown(choice);
        }}
      >
        <Text tag="h2" className="i-want-to__title" field={ds.title?.jsonValue} />
        {/* like the bank's styled dropdown: the current choice and a caret over the native select, which stays the real control */}
        <span className="i-want-to__combo">
        <select
          className="i-want-to__select"
          aria-label={String(ds.title?.jsonValue?.value ?? 'I want to')}
          value={choice}
          onChange={(e) => setChoice(e.target.value)}
        >
          <option value="">{String(ds.placeholder?.jsonValue?.value ?? '')}</option>
          {options.map((o) => (
            <option key={o.id} value={o.id}>
              {String(o.label?.jsonValue?.value ?? o.name ?? '')}
            </option>
          ))}
        </select>
          <span className="i-want-to__current" aria-hidden="true">
            {String(options.find((o) => o.id === choice)?.label?.jsonValue?.value ?? ds.placeholder?.jsonValue?.value ?? '')}
          </span>
        </span>
        {editing ? (
          <span className="i-want-to__button">
            <Text field={ds.buttonLabel?.jsonValue} />
          </span>
        ) : (
          <input type="submit" className="i-want-to__button" value={String(ds.buttonLabel?.jsonValue?.value ?? '')} />
        )}
      </form>
      {editing ? (
        <div className="i-want-to__panels container">
          {options.map((o) => (
            <div key={o.id} className="i-want-to__edit-option">
              <Text tag="div" className="i-want-to__edit-label" field={o.label?.jsonValue} />
              <Panel option={o} editing />
            </div>
          ))}
        </div>
      ) : (
        active && (
          <div className="i-want-to__panels container">
            <Panel option={active} editing={false} />
          </div>
        )
      )}
    </div>
  );
};

export const Default = (props: IWantToProps): JSX.Element => (
  <IWantToBody props={props} className={props.params?.styles || ''} />
);

export const BristolCountySavingsBank = (props: IWantToProps): JSX.Element => (
  <IWantToBody props={props} className={`i-want-to--bcsb ${props.params?.styles || ''}`} />
);
