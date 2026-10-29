'use client';

import { JSX, useMemo, useState } from 'react';
import { Link, LinkField, Text, TextField } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Plant = {
  id?: string;
  name?: JsonValue<TextField>;
  address?: JsonValue<TextField>;
  region?: JsonValue<TextField>;
  country?: JsonValue<TextField>;
  capability?: JsonValue<TextField>;
  market?: JsonValue<TextField>;
  link?: JsonValue<LinkField>;
};

export type LocationDirectoryProps = {
  params: { [key: string]: string };
  fields?: {
    data?: { datasource?: { title?: JsonValue<TextField>; children?: { results?: Plant[] } } };
  };
};

const valueOf = (field?: JsonValue<TextField>) => String(field?.jsonValue?.value ?? '');

const LocationDirectoryView = (props: LocationDirectoryProps): JSX.Element => {
  const source = props.fields?.data?.datasource;
  const plants = source?.children?.results ?? [];
  const regions = useMemo(() => [...new Set(plants.map((plant) => valueOf(plant.region)).filter(Boolean))], [plants]);
  const [region, setRegion] = useState('');
  const visible = plants.filter((plant) => !region || valueOf(plant.region) === region);
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component location-directory ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="location-directory__filters">
        <button type="button" aria-pressed={region === ''} onClick={() => setRegion('')}>
          All
        </button>
        {regions.map((name) => (
          <button key={name} type="button" aria-pressed={region === name} onClick={() => setRegion(name)}>
            {name}
          </button>
        ))}
      </div>
      <ul>
        {visible.map((plant) => (
          <li key={plant.id}>
            {plant.name?.jsonValue && <Text tag="h3" field={plant.name.jsonValue} />}
            {plant.address?.jsonValue && <Text tag="p" field={plant.address.jsonValue} />}
            {plant.link?.jsonValue?.value?.href && <Link field={plant.link.jsonValue} />}
          </li>
        ))}
      </ul>
    </section>
  );
};

export const Default = LocationDirectoryView;
export const MccLabel = LocationDirectoryView;
