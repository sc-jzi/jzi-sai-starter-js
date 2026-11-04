'use client';

import { JSX } from 'react';
import { DateField, Field, ImageField, RichText, RichTextField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { plainText, toJsonLd } from 'lib/json-ld';

/**
 * ArticleHeader: the Article page's own fields (no datasource) - Title as the page heading, "Published on" PublishDate and the
 * Summary (lead bullets or paragraphs) in one centred column. Sits on the Article template's standard values, so it also
 * writes the page's schema.org NewsArticle JSON-LD (headline, description, date, images, tag keywords) from those fields.
 */

interface ArticleRouteFields {
  Title?: Field<string>;
  PublishDate?: Field<string>;
  Summary?: RichTextField;
  Excerpt?: Field<string>;
  Image?: ImageField;
  Thumbnail?: ImageField;
  Tags?: { fields?: { Title?: Field<string> } }[];
}

// the press releases are issued by the company; it is both author and publisher
const PUBLISHER = { '@type': 'Organization', name: 'Bobcat Company' };

const articleJsonLd = (fields: ArticleRouteFields): string | null => {
  const headline = `${fields.Title?.value ?? ''}`.trim();
  if (!headline) return null;
  const date = fields.PublishDate?.value && !fields.PublishDate.value.startsWith('0001') ? fields.PublishDate.value : '';
  const images = [...new Set([fields.Image?.value?.src, fields.Thumbnail?.value?.src].filter(Boolean))];
  return toJsonLd({
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description: `${fields.Excerpt?.value ?? ''}`.trim() || plainText(fields.Summary?.value),
    datePublished: date,
    image: images,
    keywords: (fields.Tags ?? []).map((t) => `${t.fields?.Title?.value ?? ''}`.trim()).filter(Boolean).join(', '),
    author: PUBLISHER,
    publisher: PUBLISHER,
  });
};

type Look = 'default' | 'bobcat';

export const formatArticleDate = (value?: string): string => {
  if (!value || value.startsWith('0001')) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', day: 'numeric', year: 'numeric' });
};

const ArticleHeaderView = ({ props, look }: { props: ComponentProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fields = (page?.layout?.sitecore?.route?.fields ?? {}) as ArticleRouteFields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const hasDate = !!formatArticleDate(fields.PublishDate?.value);
  const jsonLd = isEditing ? null : articleJsonLd(fields);

  return (
    <div className={`component article-header article-header--${look} ${styles}`} id={id ? id : undefined}>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <div className="article-header__inner">
        <h1 className="article-header__title">
          <Text field={fields.Title} />
        </h1>
        {(isEditing || hasDate) && (
          <p className="article-header__date">
            Published on{' '}
            <DateField field={fields.PublishDate ?? {}} render={(date) => formatArticleDate(date?.toISOString())} />
          </p>
        )}
        {(isEditing || !!fields.Summary?.value) && (
          <RichText field={fields.Summary} className="article-header__summary" />
        )}
      </div>
    </div>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <ArticleHeaderView props={props} look="default" />;

/* Bobcat: the press release header (56px condensed title, 14px grey date, lead bullets) in a 640px centred column */
export const Bobcat = (props: ComponentProps): JSX.Element => <ArticleHeaderView props={props} look="bobcat" />;
