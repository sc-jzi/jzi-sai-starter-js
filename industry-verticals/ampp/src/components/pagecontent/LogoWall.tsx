import { JSX } from 'react';
import { Image, Link, Text, type Field, type ImageField, type LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonField<T> = { jsonValue?: Field<T> | ImageField | LinkField };

interface LogoItem {
  id?: string;
  image?: JsonField<string>;
  link?: JsonField<string>;
}

interface LogoWallFields {
  data?: {
    datasource?: {
      title?: JsonField<string>;
      children?: { results?: LogoItem[] };
    };
  };
}

type LogoWallProps = ComponentProps & {
  fields?: LogoWallFields;
};

const LogoWallView = ({ fields, params }: LogoWallProps): JSX.Element => {
  const datasource = fields?.data?.datasource;
  const logos = datasource?.children?.results || [];
  const id = params?.RenderingIdentifier;
  const title = datasource?.title?.jsonValue as Field<string> | undefined;

  return (
    <section className={`component logo-wall col-12 variant-logo-wall ${params?.styles || ''}`} id={id}>
      <div className="container">
        {title?.value && <Text tag="h2" field={title} />}
        <ul className="logo-wall-grid">
          {logos.map((logo, index) => {
            const image = logo.image?.jsonValue as ImageField | undefined;
            const link = logo.link?.jsonValue as LinkField | undefined;
            const picture = image?.value?.src ? <Image field={image} /> : null;
            return (
              <li key={logo.id || index}>
                {link?.value?.href ? <Link field={link}>{picture}</Link> : picture}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export const Default = (props: LogoWallProps): JSX.Element => <LogoWallView {...props} />;
