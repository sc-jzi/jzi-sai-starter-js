'use client';

import { JSX, useMemo, useState } from 'react';
import { Image, Link, RichText, Text, type Field, type ImageField, type LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonField<T> = { jsonValue?: Field<T> | ImageField | LinkField };

interface CourseItem {
  id?: string;
  title?: JsonField<string>;
  text?: JsonField<string>;
  image?: JsonField<string>;
  link?: JsonField<string>;
  level?: JsonField<string>;
  format?: JsonField<string>;
  code?: JsonField<string>;
}

interface CourseCatalogFields {
  data?: {
    datasource?: {
      title?: JsonField<string>;
      searchPlaceholder?: JsonField<string>;
      showFilters?: JsonField<string>;
      children?: { results?: CourseItem[] };
    };
  };
}

type CourseCatalogProps = ComponentProps & {
  fields?: CourseCatalogFields;
};

const textValue = (field?: JsonField<string>) => String((field?.jsonValue as Field<string> | undefined)?.value || '');

const CourseCatalog = ({
  fields,
  params,
  look,
  filters,
}: CourseCatalogProps & { look: string; filters: boolean }) => {
  const datasource = fields?.data?.datasource;
  const courses = datasource?.children?.results || [];
  const [query, setQuery] = useState('');
  const [format, setFormat] = useState('');
  const formats = useMemo(
    () => Array.from(new Set(courses.map((course) => textValue(course.format)).filter(Boolean))),
    [courses]
  );
  const visible = courses.filter((course) => {
    const haystack = `${textValue(course.title)} ${textValue(course.code)} ${textValue(course.level)}`.toLowerCase();
    const matchesQuery = !query || haystack.includes(query.trim().toLowerCase());
    const matchesFormat = !format || textValue(course.format) === format;
    return matchesQuery && matchesFormat;
  });
  const id = params?.RenderingIdentifier;

  return (
    <section className={`component course-catalog col-12 ${look} ${params?.styles || ''}`} id={id}>
      <div className="container">
        {datasource?.title?.jsonValue && <Text tag="h2" field={datasource.title.jsonValue as Field<string>} />}
        {filters && (
          <form className="course-filters" onSubmit={(event) => event.preventDefault()}>
            <input
              type="search"
              value={query}
              placeholder={textValue(datasource?.searchPlaceholder)}
              onChange={(event) => setQuery(event.target.value)}
            />
            <select value={format} onChange={(event) => setFormat(event.target.value)}>
              <option value="">All formats</option>
              {formats.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </form>
        )}
        <div className={look === 'variant-carousel' ? 'course-carousel' : look === 'variant-list' ? 'course-list' : 'row'}>
          {visible.map((course, index) => (
            <article className={look === 'variant-list' ? 'course-list-item' : 'col-md-6 col-lg-3'} key={course.id || index}>
              {course.image?.jsonValue && <Image field={course.image.jsonValue as ImageField} />}
              {course.code?.jsonValue && <Text tag="p" className="course-code" field={course.code.jsonValue as Field<string>} />}
              {course.title?.jsonValue && <Text tag="h3" field={course.title.jsonValue as Field<string>} />}
              {course.text?.jsonValue && <RichText field={course.text.jsonValue as Field<string>} />}
              {course.level?.jsonValue && <Text tag="p" field={course.level.jsonValue as Field<string>} />}
              {course.format?.jsonValue && <Text tag="p" field={course.format.jsonValue as Field<string>} />}
              {course.link?.jsonValue && <Link field={course.link.jsonValue as LinkField} className="button" />}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

const filtersOn = (fields?: CourseCatalogFields) => textValue(fields?.data?.datasource?.showFilters) === '1';

export const Default = (props: CourseCatalogProps): JSX.Element => (
  <CourseCatalog {...props} look="variant-list" filters={filtersOn(props.fields)} />
);

export const Carousel = (props: CourseCatalogProps): JSX.Element => (
  <CourseCatalog {...props} look="variant-carousel" filters={false} />
);

export const Search = (props: CourseCatalogProps): JSX.Element => (
  <CourseCatalog {...props} look="variant-search" filters />
);

export const List = (props: CourseCatalogProps): JSX.Element => (
  <CourseCatalog {...props} look="variant-list" filters={false} />
);
