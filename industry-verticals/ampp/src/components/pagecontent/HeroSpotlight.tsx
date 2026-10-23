'use client';

import { JSX } from 'react';
import { Field, ImageField, Link, LinkField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title?: Field<string>;
  Text?: Field<string>;
  Image?: ImageField;
  Link1?: LinkField;
  Link2?: LinkField;
  Link3?: LinkField;
  Link4?: LinkField;
  Cta1?: LinkField;
  Cta2?: LinkField;
}

export type HeroSpotlightProps = {
  params: { [key: string]: string };
  fields: Fields;
};

const Tile = ({ link, isPageEditing }: { link?: LinkField; isPageEditing: boolean }): JSX.Element | null => {
  if (!link || (!isPageEditing && !link.value?.href)) return null;
  return (
    <div className="ampp-hero-tile">
      <Link field={link}>
        <h2>{link.value?.text}</h2>
      </Link>
    </div>
  );
};

const Spotlight = (props: HeroSpotlightProps): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const tiles = [props.fields?.Link1, props.fields?.Link2, props.fields?.Link3, props.fields?.Link4, props.fields?.Cta1, props.fields?.Cta2];
  const image = props.fields?.Image;
  const title = props.fields?.Title;
  const text = props.fields?.Text;

  return (
    <section className={`component hero-spotlight variant-ampp ${props.params?.styles || ''}`} id={props.params.RenderingIdentifier || undefined}>
      {image && (isPageEditing || image.value?.src) && (
        <div className="ampp-hero-media">
          <NextImage field={image} width={1440} height={500} />
        </div>
      )}
      <div className="ampp-hero-copy container">
        <div className="ampp-hero-tiles">
          {tiles.map((link, i) => (
            <Tile key={link?.value?.href || i} link={link} isPageEditing={isPageEditing} />
          ))}
        </div>
        {title && (isPageEditing || title.value) && (
          <p className="ampp-hero-title">
            <Text field={title} />
          </p>
        )}
        {text && (isPageEditing || text.value) && (
          <p>
            <Text field={text} />
          </p>
        )}
      </div>
    </section>
  );
};

/* Full-bleed photo with the title and four action tiles. */
export const Default = (props: HeroSpotlightProps): JSX.Element => Spotlight(props);

/* AMPP hero: same full-bleed photo and four tiles. */
export const Ampp = (props: HeroSpotlightProps): JSX.Element => Spotlight(props);
