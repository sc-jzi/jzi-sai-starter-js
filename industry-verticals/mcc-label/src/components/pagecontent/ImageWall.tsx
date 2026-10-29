import { JSX } from 'react';
import { ImageField, NextImage, Text, TextField } from '@sitecore-content-sdk/nextjs';

type JsonValue<T> = { jsonValue?: T };
type Tile = { id?: string; image?: JsonValue<ImageField> };

export type ImageWallProps = {
  params: { [key: string]: string };
  fields?: {
    data?: { datasource?: { title?: JsonValue<TextField>; children?: { results?: Tile[] } } };
  };
};

const ImageWallView = (props: ImageWallProps): JSX.Element => {
  const source = props.fields?.data?.datasource;
  const id = props.params?.RenderingIdentifier;

  return (
    <section className={`component image-wall ${props.params?.styles || ''}`} id={id || undefined}>
      {source?.title?.jsonValue && <Text tag="h2" field={source.title.jsonValue} />}
      <div className="image-wall__grid">
        {(source?.children?.results ?? []).map((tile) =>
          tile.image?.jsonValue ? <NextImage key={tile.id} field={tile.image.jsonValue} width={240} height={240} /> : null
        )}
      </div>
      <button type="button" className="btn">
        Previous
      </button>
    </section>
  );
};

export const Default = ImageWallView;
export const MccLabel = ImageWallView;
