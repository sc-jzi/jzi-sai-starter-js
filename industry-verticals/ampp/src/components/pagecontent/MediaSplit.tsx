import { JSX } from 'react';
import { Image, Link, RichText, Text, type Field, type ImageField, type LinkField, type RichTextField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonField<T> = { jsonValue?: Field<T> | ImageField | LinkField | RichTextField };

interface SplitItem {
  id?: string;
  title?: JsonField<string>;
  text?: JsonField<string>;
  image?: JsonField<string>;
  link?: JsonField<string>;
  eyebrow?: JsonField<string>;
  meta?: JsonField<string>;
  column?: JsonField<string>;
  style?: JsonField<string>;
}

interface MediaSplitFields {
  data?: {
    datasource?: {
      title?: JsonField<string>;
      children?: { results?: SplitItem[] };
    };
  };
}

type MediaSplitProps = ComponentProps & {
  fields?: MediaSplitFields;
  look?: string;
};

const valueOf = (field?: JsonField<string>): string => String((field?.jsonValue as Field<string> | undefined)?.value || '');

const linkOf = (item: SplitItem): LinkField | undefined => item.link?.jsonValue as LinkField | undefined;

const plain = (value: string): string => value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const sameText = (a: string, b: string): boolean => plain(a).toLowerCase() === plain(b).toLowerCase();

const SplitCard = ({ item, linkTitle = false, actionClass = 'button' }: { item: SplitItem; linkTitle?: boolean; actionClass?: string }): JSX.Element => {
  const image = item.image?.jsonValue as ImageField | undefined;
  const style = valueOf(item.style);
  const title = valueOf(item.title);
  const text = valueOf(item.text);
  const link = linkOf(item);
  const linkText = String(link?.value?.text || '');
  const titleIsLink = Boolean(link?.value?.href) && (linkTitle || sameText(linkText, title));
  const textRepeatsLink = Boolean(linkText) && sameText(text, linkText);
  const titledLink = link?.value ? { ...link, value: { ...link.value, text: title || linkText } } : link;

  return (
    <article className={`media-split-item ${style ? `is-${style}` : ''}`}>
      {image?.value?.src && <Image field={image} />}
      <div className="media-split-copy">
        {valueOf(item.eyebrow) && <Text tag="p" className="media-split-eyebrow" field={item.eyebrow?.jsonValue as Field<string>} />}
        {title &&
          (titleIsLink && titledLink ? (
            <h3>
              <Link field={titledLink} />
            </h3>
          ) : (
            <Text tag="h3" field={item.title?.jsonValue as Field<string>} />
          ))}
        {valueOf(item.meta) && <Text tag="p" className="media-split-meta" field={item.meta?.jsonValue as Field<string>} />}
        {text && !textRepeatsLink && <RichText field={item.text?.jsonValue as RichTextField} />}
        {link?.value?.href && !titleIsLink && <Link className={actionClass} field={link} />}
      </div>
    </article>
  );
};

const isColumnHeading = (item: SplitItem): boolean => {
  const link = linkOf(item);
  return Boolean(valueOf(item.title)) && !valueOf(item.text) && !valueOf(item.eyebrow) && !valueOf(item.meta) && !valueOf(item.style) && !(item.image?.jsonValue as ImageField | undefined)?.value?.src && !link?.value?.href;
};

const NewsRailColumn = ({ items }: { items: SplitItem[] }): JSX.Element => {
  const label = items.find((item) => /^what['’]s new$/i.test(valueOf(item.title)));
  const calls = items.filter((item) => valueOf(item.style) === 'cta');
  const stories = items.filter((item) => item !== label && valueOf(item.style) !== 'cta');
  const labelLink = label ? linkOf(label) : undefined;

  return (
    <>
      {label?.title?.jsonValue && <Text tag="h3" className="media-split-rail-title" field={label.title.jsonValue as Field<string>} />}
      {label && labelLink?.value?.href && (
        <article className="media-split-item">
          <div className="media-split-copy">
            {valueOf(label.eyebrow) && <Text tag="p" className="media-split-eyebrow" field={label.eyebrow?.jsonValue as Field<string>} />}
            <h3>
              <Link field={labelLink} />
            </h3>
          </div>
        </article>
      )}
      {stories.map((item, index) => (
        <SplitCard key={item.id || index} item={item} linkTitle actionClass="media-split-action" />
      ))}
      {calls.map((item, index) => (
        <SplitCard key={item.id || `cta-${index}`} item={item} actionClass="media-split-action" />
      ))}
    </>
  );
};

const MediaSplitView = ({ fields, params, look }: MediaSplitProps): JSX.Element => {
  const datasource = fields?.data?.datasource;
  const items = datasource?.children?.results || [];
  const left = items.filter((item) => valueOf(item.column).toLowerCase() !== 'right');
  const right = items.filter((item) => valueOf(item.column).toLowerCase() === 'right');
  const title = datasource?.title?.jsonValue as Field<string> | undefined;
  const variant = look || 'variant-news-rail';
  const discussions = variant === 'variant-discussions';
  const news = variant === 'variant-news-rail';
  const rightHeading = discussions ? right.find(isColumnHeading) : undefined;
  const rightItems = right.filter((item) => item !== rightHeading);

  return (
    <section className={`component media-split col-12 ${variant} ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      <div className="container">
        {!discussions && title?.value && <Text tag="h2" field={title} />}
        <div className="media-split-columns">
          <div className="media-split-main">
            {discussions && title?.value && <Text tag="h2" field={title} />}
            {left.map((item, index) => (
              <SplitCard key={item.id || index} item={item} linkTitle={news || discussions} />
            ))}
          </div>
          <div className="media-split-rail">
            {rightHeading?.title?.jsonValue && <Text tag="h2" field={rightHeading.title.jsonValue as Field<string>} />}
            {news ? <NewsRailColumn items={rightItems} /> : rightItems.map((item, index) => <SplitCard key={item.id || index} item={item} linkTitle={discussions} />)}
          </div>
        </div>
      </div>
    </section>
  );
};

export const Default = (props: MediaSplitProps): JSX.Element => <MediaSplitView {...props} look="variant-news-rail" />;
export const NewsRail = (props: MediaSplitProps): JSX.Element => <MediaSplitView {...props} look="variant-news-rail" />;
export const Discussions = (props: MediaSplitProps): JSX.Element => <MediaSplitView {...props} look="variant-discussions" />;
export const Agenda = (props: MediaSplitProps): JSX.Element => <MediaSplitView {...props} look="variant-agenda" />;
export const Exhibitors = (props: MediaSplitProps): JSX.Element => <MediaSplitView {...props} look="variant-exhibitors" />;
