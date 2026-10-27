import { JSX } from 'react';
import { Field, LinkField, Link, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface ChildFields {
  Name?: { jsonValue?: Field<string> };
  Address?: { jsonValue?: Field<string> };
  Link?: { jsonValue?: LinkField };
}

interface Fields {
  Title?: Field<string>;
  items?: { fields?: ChildFields }[];
}

export type LocationDirectoryProps = ComponentProps & {
  fields?: Fields;
};

const Directory = ({ props, className }: { props: LocationDirectoryProps; className: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const items = props.fields?.items ?? [];
  return (
    <section className={className} id={id || undefined}>
      <div className="container">
        <Text field={props.fields?.Title} tag="h1" />
        <div className="location-directory-tabs">
          <button type="button">List</button>
          <button type="button">Map</button>
        </div>
        <ul className="location-directory-list">
          {items.map((item, index) => (
            <li key={index}>
              <Text field={item.fields?.Name?.jsonValue} tag="h3" />
              <Text field={item.fields?.Address?.jsonValue} tag="p" />
              {item.fields?.Link?.jsonValue && <Link field={item.fields.Link.jsonValue} />}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const PLANTS = [
  ['Ablis', '18 Rue de la Font Chaude, 78660 Ablis, France', true],
  ['Adelaide', '381 South Rd, Mile End South SA 5031, Australia', true],
  ['Albany', '3 Armstrong Road, Rosedale, North Harbour 0632, New Zealand', true],
  ['Alessandria', 'VIA VECCHIA REALE, 15062 Bosco Marengo AL, Italy', true],
  ['Algoma, Wisconsin', '1102 Jefferson St, Algoma, WI 54201, USA', true],
  ['Asheville, North Carolina', '15 Conrad Industrial Dr, Weaverville, NC 28787, USA', true],
  ['Auckland', '19 Smales Road, East Tāmaki, Auckland 2013, New Zealand', true],
  ['Batavia, Ohio', '4053 Clough Woods Dr, Batavia, OH 45103, USA', true],
  ['Batavia, Ohio (IML)', '4101 Founders Blvd, Batavia, OH 45103, USA', false],
] as const;

export const Default = (props: LocationDirectoryProps): JSX.Element => (
  <section className={`component location-directory ${props.params?.styles || ''}`} id={props.params?.RenderingIdentifier || undefined}>
    <div className="location-band">
      <div className="location-tools">
        <button type="button">To Top</button>
        <button type="button">List View</button>
        <button type="button">Map View</button>
        <button type="button">All Locations</button>
      </div>
      {PLANTS.map(([name, address, linked]) => (
        <div className="location-row" key={name}>
          <h2>{name}</h2>
          <p>{address}</p>
          {linked && <a href="/contact-us">Get In Touch</a>}
        </div>
      ))}
    </div>
  </section>
);

export const MccLabel = (props: LocationDirectoryProps): JSX.Element => (
  <Directory props={props} className={`component location-directory mcc-label ${props.params?.styles || ''}`} />
);
