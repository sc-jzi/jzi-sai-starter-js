'use client';

import { JSX } from 'react';
import { Field, RichText, RichTextField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * ProductDetails: the Product page's own Details fields (no datasource). Default / Bobcat show the overview (Title +
 * OverviewTitle as the heading, Overview rich text); BobcatSpecs shows the specs (Title + SpecsTitle, Specs rich text
 * holding the key-specs table, styled as the live compare table). A part with no content in it renders nothing.
 */

interface ProductDetailsFields {
  Title?: Field<string>;
  OverviewTitle?: Field<string>;
  Overview?: RichTextField;
  SpecsTitle?: Field<string>;
  Specs?: RichTextField;
}

type Look = 'overview' | 'specs';

const ProductDetailsView = ({ props, look }: { props: ComponentProps; look: Look }): JSX.Element | null => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = (page?.layout?.sitecore?.route?.fields ?? {}) as ProductDetailsFields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const heading = look === 'specs' ? f.SpecsTitle : f.OverviewTitle;
  const body = look === 'specs' ? f.Specs : f.Overview;
  if (!isEditing && !body?.value) return null;

  return (
    <div className={`component product-details product-details--${look} ${styles}`} id={id ? id : undefined}>
      <div className="product-details__inner">
        <h2 className="product-details__title">
          {`${f.Title?.value ?? ''}`} <Text field={heading} />
        </h2>
        <RichText field={body} className="product-details__body" />
      </div>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="overview" />;

/* Bobcat: "E35 Overview" - condensed 40px heading, 2-column text on white */
export const Bobcat = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="overview" />;

/* BobcatSpecs: "E35 Specs & Compare" on the light grey band - the key specs table with zebra rows, first column bold */
export const BobcatSpecs = (props: ComponentProps): JSX.Element | null => <ProductDetailsView props={props} look="specs" />;
