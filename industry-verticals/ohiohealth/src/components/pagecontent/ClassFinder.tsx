'use client';

import { JSX, useMemo, useState } from 'react';
import { Field, RichTextField, Text, RichText, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface JsonValue<T> {
  jsonValue?: T;
}

interface ClassItem {
  id: string;
  title?: JsonValue<Field<string>>;
  description?: JsonValue<RichTextField>;
  registrationLinks?: JsonValue<RichTextField>;
  category?: JsonValue<Field<string>>;
  locations?: JsonValue<Field<string>>;
}

export type ClassFinderProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        title?: JsonValue<Field<string>>;
        children?: { results?: ClassItem[] };
      };
    };
  };
};

// Category and Locations are comma-separated lists typed by the editor.
const splitList = (v?: string): string[] =>
  (v || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const uniqueSorted = (lists: string[][]): string[] =>
  Array.from(new Set(lists.flat())).sort((a, b) => a.localeCompare(b));

const ClassFinderView = ({
  props,
  variantClass,
}: {
  props: ClassFinderProps;
  variantClass: string;
}): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = page?.mode?.isEditing;
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const ds = props.fields?.data?.datasource;
  const items = useMemo(() => ds?.children?.results ?? [], [ds]);
  const categories = useMemo(
    () => uniqueSorted(items.map((i) => splitList(i.category?.jsonValue?.value))),
    [items]
  );
  const locations = useMemo(
    () => uniqueSorted(items.map((i) => splitList(i.locations?.jsonValue?.value))),
    [items]
  );
  const id = props.params?.RenderingIdentifier;
  const styles = props.params?.styles || '';

  if (!ds) {
    return isEditing ? (
      <div className={`component class-finder ${styles}`}>ClassFinder: choose a datasource.</div>
    ) : null;
  }

  const visible = items.filter(
    (i) =>
      (!category || splitList(i.category?.jsonValue?.value).includes(category)) &&
      (!location || splitList(i.locations?.jsonValue?.value).includes(location))
  );

  return (
    <section className={`component class-finder ${variantClass} ${styles}`} id={id ? id : undefined}>
      <div className="class-finder__inner">
        <h2 className="class-finder__count">
          {visible.length}{' '}
          {ds.title?.jsonValue ? <Text field={ds.title.jsonValue} /> : null}
        </h2>
        <div className="class-finder__filters">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by category"
          >
            <option value="">Filter by category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            aria-label="Filter by facility or location"
          >
            <option value="">Filter by facility/location</option>
            {locations.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </select>
        </div>
        <div className="class-finder__grid">
          {visible.map((i) => (
            <article className="class-finder__card" key={i.id}>
              {i.title?.jsonValue && (
                <h3 className="class-finder__title">
                  <Text field={i.title.jsonValue} />
                </h3>
              )}
              {i.description?.jsonValue && (
                <RichText field={i.description.jsonValue} className="class-finder__description" />
              )}
              {i.registrationLinks?.jsonValue && (
                <RichText field={i.registrationLinks.jsonValue} className="class-finder__links" />
              )}
              {(i.category?.jsonValue?.value || isEditing) && (
                <p className="class-finder__meta">
                  <strong>Category:</strong> <Text field={i.category?.jsonValue} />
                </p>
              )}
              {(i.locations?.jsonValue?.value || isEditing) && (
                <p className="class-finder__meta">
                  <strong>Location:</strong> <Text field={i.locations?.jsonValue} />
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: ClassFinderProps): JSX.Element | null => (
  <ClassFinderView props={props} variantClass="" />
);

export const OhioHealth = (props: ClassFinderProps): JSX.Element | null => (
  <ClassFinderView props={props} variantClass="class-finder--ohiohealth" />
);
