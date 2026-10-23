'use client';

import { JSX } from 'react';
import { Field, Link, LinkField, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title1: Field<string>;
  Text1: Field<string>;
  Link1: LinkField;
  Title2: Field<string>;
  Text2: Field<string>;
  Link2: LinkField;
}

export type SplitPanelProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const Column = ({
  title,
  text,
  link,
  isPageEditing,
}: {
  title: Field<string>;
  text: Field<string>;
  link: LinkField;
  isPageEditing: boolean;
}): JSX.Element => (
  <div className="col-lg-6">
    {(isPageEditing || title?.value) && (
      <h2>
        <Text field={title} />
      </h2>
    )}
    {(isPageEditing || text?.value) && <RichText field={text} />}
    {(isPageEditing || link?.value?.href) && <Link field={link} className="button" />}
  </div>
);

const Split = (props: SplitPanelProps, look: string): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  return (
    <section className={`component split-panel ${look} ${props.params?.styles || ''}`} id={props.params.RenderingIdentifier || undefined}>
      <div className="container">
        <div className="row">
          <Column title={props.fields?.Title1} text={props.fields?.Text1} link={props.fields?.Link1} isPageEditing={isPageEditing} />
          <Column title={props.fields?.Title2} text={props.fields?.Text2} link={props.fields?.Link2} isPageEditing={isPageEditing} />
        </div>
      </div>
    </section>
  );
};

/* Two text columns. */
export const Default = (props: SplitPanelProps): JSX.Element => Split(props, 'variant-ampp');

/* AMPP news rail. */
export const Ampp = (props: SplitPanelProps): JSX.Element => Split(props, 'variant-ampp');

/* AMPP news rail look. */
export const AmppNewsRail = (props: SplitPanelProps): JSX.Element => Split(props, 'variant-ampp-news');

/* AMPP discussions look. */
export const AmppDiscussions = (props: SplitPanelProps): JSX.Element => Split(props, 'variant-ampp-discussions');
