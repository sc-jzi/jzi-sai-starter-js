'use client';

import { JSX } from 'react';
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

interface UpdatesColumnItem {
  id: string;
  heading?: { jsonValue?: Field<string> };
  body?: { jsonValue?: RichTextField };
  link?: { jsonValue?: LinkField };
}

interface UpdatesColumnsFields {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      children?: { results?: UpdatesColumnItem[] };
    };
  };
}

export type UpdatesColumnsProps = ComponentProps & {
  fields: UpdatesColumnsFields;
};

const UpdatesColumnsEmpty = (): JSX.Element => (
  <div className="component updates-columns">
    <div className="container">
      <span className="is-empty-hint">Updates columns</span>
    </div>
  </div>
);

const UpdatesColumnsBody = ({
  props,
  variantClass,
}: {
  props: UpdatesColumnsProps;
  variantClass: string;
}): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = props.fields?.data?.datasource;
  if (!datasource) return <UpdatesColumnsEmpty />;

  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = datasource.children?.results ?? [];

  return (
    <div
      className={`component updates-columns ${variantClass} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="updates-columns-inner">
        {(isPageEditing || datasource.title?.jsonValue?.value) && (
          <Text tag="h2" field={datasource.title?.jsonValue} className="updates-columns-title" />
        )}
        <div className="updates-columns-row">
          {columns.map((column) => (
            <div key={column.id} className="updates-column">
              {(isPageEditing || column.heading?.jsonValue?.value) && (
                <Text tag="h5" field={column.heading?.jsonValue} className="updates-column-heading" />
              )}
              <div className="updates-column-body">
                <RichText field={column.body?.jsonValue} />
              </div>
              {(isPageEditing || column.link?.jsonValue?.value?.href) && (
                <div className="updates-column-footer">
                  <Link field={column.link?.jsonValue as LinkField} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: UpdatesColumnsProps): JSX.Element => (
  <UpdatesColumnsBody props={props} variantClass="" />
);

/* Apexus variant: cyan band, centered uppercase white title, three equal white cards with divider lines */
export const Apexus = (props: UpdatesColumnsProps): JSX.Element => (
  <UpdatesColumnsBody props={props} variantClass="variant-apexus" />
);
