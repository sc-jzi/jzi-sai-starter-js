import { JSX } from 'react';
import { Field, ImageField, LinkField, NextImage, Link, RichText, RichTextField, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ChildFields {
  Title?: { jsonValue?: Field<string> };
  Image?: { jsonValue?: ImageField };
  Text?: { jsonValue?: RichTextField };
  Link?: { jsonValue?: LinkField };
  Eyebrow?: { jsonValue?: Field<string> };
  Category?: { jsonValue?: Field<string> };
}

interface Fields {
  SearchLabel?: Field<string>;
  items?: { fields?: ChildFields }[];
}

export type ResourceBrowserProps = ComponentProps & {
  fields?: Fields;
};

const Browser = ({ props, className }: { props: ResourceBrowserProps; className: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const items = props.fields?.items ?? [];
  return (
    <section className={className} id={id || undefined}>
      <div className="container">
        <label>
          <Text field={props.fields?.SearchLabel} tag="span" />
          <input type="search" />
        </label>
        <ul className="resource-browser-grid">
          {items.map((item, index) => (
            <li key={index}>
              <NextImage field={item.fields?.Image?.jsonValue} />
              <Text field={item.fields?.Eyebrow?.jsonValue} tag="p" />
              <Text field={item.fields?.Title?.jsonValue} tag="h3" />
              <RichText field={item.fields?.Text?.jsonValue} />
              {item.fields?.Link?.jsonValue && <Link field={item.fields.Link.jsonValue} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const FILTERS = [
  ['Cases', '1888'],
  ['Event', '2'],
  ['Label Magazine', '13'],
  ['Sample Kit', '4'],
  ['Trend Article', '15'],
  ['Uncategorized', '7'],
  ['Webinar', '39'],
  ['Whitepaper', '18'],
];

const PHOTOS = [
  'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/106515-resources-s02-1?v=6d158483',
  'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/106523-resources-s02-2?v=477a0bdf',
  'https://jzi-verticals.sitecoresandbox.cloud/api/public/content/106544-resources-s02-3?v=c9074b4a',
];

export const Default = (props: ResourceBrowserProps): JSX.Element => (
  <section className={`component resource-browser ${props.params?.styles || ''}`} id={props.params?.RenderingIdentifier || undefined}>
    <form className="resource-browser-band">
      <input type="search" aria-label="Search resources" />
      <div className="resource-photos">
        {PHOTOS.map((src) => (
          <img key={src} src={src} alt="" width={200} height={140} />
        ))}
      </div>
      <div className="resource-filters">
        <button type="submit">Go</button>
        {FILTERS.map(([name, count]) => (
          <div className="resource-filter" key={name}>
            <button type="button">{`Toggle to Filter By ${name}`}</button>
            <p>{`${name} (${count})`}</p>
            <span>{`(${count})`}</span>
          </div>
        ))}
        <p>Cases</p>
        <p>Cases</p>
      </div>
    </form>
  </section>
);

export const MccLabel = (props: ResourceBrowserProps): JSX.Element => (
  <Browser props={props} className={`component resource-browser mcc-label ${props.params?.styles || ''}`} />
);
