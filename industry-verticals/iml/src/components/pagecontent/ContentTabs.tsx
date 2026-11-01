'use client';

import { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonValue<T> = { jsonValue: T };

interface TabItem {
  id: string;
  tabLabel?: JsonValue<Field<string>>;
  title?: JsonValue<Field<string>>;
  subtitle?: JsonValue<Field<string>>;
  text?: JsonValue<RichTextField>;
  image?: JsonValue<ImageField>;
  link?: JsonValue<LinkField>;
}

interface Fields {
  data?: {
    datasource?: {
      heading?: JsonValue<Field<string>>;
      children?: { results?: TabItem[] };
    };
  };
}

export type ContentTabsProps = ComponentProps & {
  fields: Fields;
};

const useTabs = (props: ContentTabsProps) => {
  const datasource = props.fields?.data?.datasource;
  const tabs = datasource?.children?.results ?? [];
  const [active, setActive] = useState(0);
  const current = tabs[Math.min(active, Math.max(tabs.length - 1, 0))];
  return { datasource, tabs, active, setActive, current };
};

export const Default = (props: ContentTabsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const { datasource, tabs, active, setActive, current } = useTabs(props);

  if (!datasource) {
    return (
      <div className={`component content-tabs ${sxaStyles}`} id={id ? id : undefined}>
        <div className="component-content">ContentTabs: no datasource</div>
      </div>
    );
  }

  return (
    <div className={`component content-tabs ${sxaStyles}`} id={id ? id : undefined}>
      <div className="container">
        {(isPageEditing || datasource.heading?.jsonValue?.value) && (
          <h2 className="text-center mb-4">
            <Text field={datasource.heading?.jsonValue} />
          </h2>
        )}
        <div className="d-flex flex-wrap gap-2 justify-content-center mb-4" role="tablist">
          {tabs.map((tab, k) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={k === active}
              className={`btn ${k === active ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setActive(k)}
            >
              <Text field={tab.tabLabel?.jsonValue} />
            </button>
          ))}
        </div>
        {current && (
          <div className="row align-items-center" role="tabpanel">
            <div className="col-md-5">
              <NextImage field={current.image?.jsonValue} className="img-fluid" width={576} height={392} />
            </div>
            <div className="col-md-7">
              <h3>
                <Text field={current.title?.jsonValue} />
              </h3>
              <p>
                <Text field={current.subtitle?.jsonValue} />
              </p>
              <RichText field={current.text?.jsonValue} />
              {(isPageEditing || current.link?.jsonValue?.value?.href) && (
                <Link field={current.link?.jsonValue as LinkField} className="button button-main" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* Iml: pill tab buttons; the panel shows the image (rounded top-left corner) beside title, subtitle, a check list and a button.
   Check marks are drawn in CSS. */
export const Iml = (props: ContentTabsProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const { datasource, tabs, active, setActive, current } = useTabs(props);

  if (!datasource) {
    return (
      <div className={`component content-tabs iml-tabs ${sxaStyles}`} id={id ? id : undefined}>
        <div className="component-content">ContentTabs: no datasource</div>
      </div>
    );
  }

  return (
    <div className={`component content-tabs iml-tabs ${sxaStyles}`} id={id ? id : undefined}>
      <div className="iml-container">
        {(isPageEditing || datasource.heading?.jsonValue?.value) && (
          <h2 className="iml-section-title">
            <Text field={datasource.heading?.jsonValue} />
          </h2>
        )}
        <div className="iml-tabs__list" role="tablist">
          {tabs.map((tab, k) => (
            <div
              key={tab.id}
              role="tab"
              tabIndex={0}
              aria-selected={k === active}
              className={`iml-tabs__tab ${k === active ? 'is-active' : ''}`}
              onClick={() => setActive(k)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(k)}
            >
              <Text field={tab.tabLabel?.jsonValue} />
            </div>
          ))}
        </div>
        {current && (
          <div className="iml-tabs__panel" role="tabpanel">
            <div className="iml-tabs__media">
              <NextImage field={current.image?.jsonValue} className="iml-tabs__img" width={576} height={392} />
            </div>
            <div className="iml-tabs__content">
              <h3 className="iml-tabs__title">
                <Text field={current.title?.jsonValue} />
              </h3>
              {(isPageEditing || current.subtitle?.jsonValue?.value) && (
                <p className="iml-tabs__subtitle">
                  <Text field={current.subtitle?.jsonValue} />
                </p>
              )}
              <RichText field={current.text?.jsonValue} className="iml-checklist" />
              {(isPageEditing || current.link?.jsonValue?.value?.href) && (
                <Link field={current.link?.jsonValue as LinkField} className="iml-btn iml-btn--primary" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
