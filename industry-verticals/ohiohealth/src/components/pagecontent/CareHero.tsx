import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface JsonValue<T> {
  jsonValue?: T;
}

interface CareHeroChild {
  id: string;
  template?: { name?: string };
  title?: JsonValue<Field<string>>;
  subtitle?: JsonValue<Field<string>>;
  label?: JsonValue<Field<string>>;
  icon?: JsonValue<ImageField>;
  link?: JsonValue<LinkField>;
}

interface CareHeroDatasource {
  id?: string;
  title?: JsonValue<Field<string>>;
  text?: JsonValue<RichTextField>;
  backgroundImage?: JsonValue<ImageField>;
  scheduleTitle?: JsonValue<Field<string>>;
  scheduleLink?: JsonValue<LinkField>;
  quickAccessTitle?: JsonValue<Field<string>>;
  children?: { results?: CareHeroChild[] };
}

export type CareHeroProps = ComponentProps & {
  fields: {
    data?: { datasource?: CareHeroDatasource };
  };
};

const Chevron = (): JSX.Element => (
  <svg className="care-hero__chevron" viewBox="0 0 10 16" width="10" height="16" aria-hidden="true">
    <path d="M1.5 1.5 8 8l-6.5 6.5" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// stacked: one narrow schedule panel with the cards in a column and a "see all" link under them, no quick links panel.
const render = (
  props: CareHeroProps,
  variantClass: string,
  stacked = false
): JSX.Element | null => {
  const ds = props.fields?.data?.datasource;
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';
  const isEditing = props.page?.mode?.isEditing;

  if (!ds) {
    return isEditing ? (
      <div className={`component care-hero ${styles}`}>CareHero: choose a datasource.</div>
    ) : null;
  }

  const children = ds.children?.results ?? [];
  const cards = children.filter((c) => c.template?.name === 'ScheduleCard');
  const quickLinks = children.filter((c) => c.template?.name === 'QuickLink');
  const bg = ds.backgroundImage?.jsonValue;

  return (
    <section
      className={`component care-hero ${variantClass} ${styles}`}
      id={id ? id : undefined}
    >
      {(bg?.value?.src || isEditing) && (
        <div className="care-hero__bg">
          <NextImage field={bg} fill sizes="100vw" priority />
        </div>
      )}
      <div className="care-hero__inner">
        <div className="care-hero__copy">
          {ds.title?.jsonValue && (
            <h1 className="care-hero__title">
              <Text field={ds.title.jsonValue} />
            </h1>
          )}
          {ds.text?.jsonValue && <RichText field={ds.text.jsonValue} className="care-hero__text" />}
        </div>
        <div className="care-hero__panels">
          <div className="care-hero__panel">
            {ds.scheduleTitle?.jsonValue && (
              <h2 className="care-hero__panel-title">
                <Text field={ds.scheduleTitle.jsonValue} />
              </h2>
            )}
            <div className="care-hero__cards">
              {cards.map((c) => (
                <div className="care-hero__card" key={c.id}>
                  {c.link?.jsonValue && (
                    <Link field={c.link.jsonValue} className="care-hero__card-link">
                      <span className="care-hero__card-body">
                        {c.title?.jsonValue && (
                          <span className="care-hero__card-title">
                            <Text field={c.title.jsonValue} />
                          </span>
                        )}
                        {c.subtitle?.jsonValue && (
                          <span className="care-hero__card-subtitle">
                            <Text field={c.subtitle.jsonValue} />
                          </span>
                        )}
                      </span>
                      <Chevron />
                    </Link>
                  )}
                </div>
              ))}
            </div>
            {stacked && ds.scheduleLink?.jsonValue && (ds.scheduleLink.jsonValue.value?.href || isEditing) && (
              <Link field={ds.scheduleLink.jsonValue} className="care-hero__panel-link" />
            )}
          </div>
          {!stacked && (
          <div className="care-hero__panel care-hero__panel--quick">
            {ds.quickAccessTitle?.jsonValue && (
              <h2 className="care-hero__panel-title">
                <Text field={ds.quickAccessTitle.jsonValue} />
              </h2>
            )}
            <ul className="care-hero__quick">
              {quickLinks.map((q) => (
                <li key={q.id}>
                  {q.link?.jsonValue && (
                    <Link field={q.link.jsonValue} className="care-hero__quick-link">
                      {q.icon?.jsonValue && (
                        <span className="care-hero__quick-icon">
                          <NextImage field={q.icon.jsonValue} width={60} height={40} />
                        </span>
                      )}
                      {q.label?.jsonValue && (
                        <span className="care-hero__quick-label">
                          <Text field={q.label.jsonValue} />
                        </span>
                      )}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
          )}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: CareHeroProps): JSX.Element | null => render(props, '');

export const OhioHealth = (props: CareHeroProps): JSX.Element | null =>
  render(props, 'care-hero--ohiohealth');

export const OhioHealthStacked = (props: CareHeroProps): JSX.Element | null =>
  render(props, 'care-hero--ohiohealth care-hero--stacked', true);
