import { JSX } from 'react';
import { RichText, RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Text?: RichTextField;
}

export type ArticleBodyProps = ComponentProps & {
  fields?: Fields;
};

export const Default = (props: ArticleBodyProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const html = props.fields?.Text?.value || '';
  const parts = html.split('<!--print-->');
  const field = props.fields?.Text;
  return (
    <section className={`component article-body ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="article-top">
        <span className="rail-label">Share</span>
        <RichText field={field ? { ...field, value: parts[0] } : undefined} />
      </div>
      <div className="article-print">
        <span className="rail-label">Print</span>
        <RichText field={field ? { ...field, value: parts[1] || '' } : undefined} />
      </div>
      <button type="button">Print</button>
    </section>
  );
};

export const MccLabel = (props: ArticleBodyProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <section className={`component article-body mcc-label ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="container article-body-layout">
        <RichText field={props.fields?.Text} />
        <div className="article-body-rail">
          <button type="button">Share</button>
          <button type="button">Print</button>
        </div>
      </div>
    </section>
  );
};
