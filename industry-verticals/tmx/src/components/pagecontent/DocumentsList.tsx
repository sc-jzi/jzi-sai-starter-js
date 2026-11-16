'use client';

import { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link,
  Text,
  useSitecore,
  NextImage,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Title1: Field<string>;
  Subtitle1: Field<string>;
  Image1: ImageField;
  Link1: LinkField;
  Subtitle2: Field<string>;
  Image2: ImageField;
  Link2: LinkField;
  Subtitle3: Field<string>;
  Image3: ImageField;
  Link3: LinkField;
  Subtitle4: Field<string>;
  Image4: ImageField;
  Link4: LinkField;
  // Extra fields of the TMX derived datasource template (R22); only the Tmx variant reads them.
  SectionTitle?: Field<string>;
  Subheading?: Field<string>;
  Text?: Field<string>;
  Link?: LinkField;
}

export type DocumentsListProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: DocumentsListProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const DocumentItem = ({
    image,
    subtitle,
    link,
    delay,
  }: {
    image: ImageField;
    subtitle: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    return (
      <div
        className={`col  ${!isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''}`}
        ref={domRef}
      >
        <div className="item">
          <NextImage field={image} width={30} height={40} />
          <div className="text-container">
            <Link field={link} />
            <span className="subtitle">
              <Text field={subtitle} />
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced documents-list ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container">
        <div className="title display-6">
          <Text field={props.fields?.Title1} />
        </div>
        <div className="documents-container">
          <div className="row row-cols-1 row-cols-xl-2 gx-4 justify-content-center">
            <DocumentItem
              image={props.fields?.Image1}
              subtitle={props.fields?.Subtitle1}
              link={props.fields?.Link1}
              delay={0}
            />
            <DocumentItem
              image={props.fields?.Image2}
              subtitle={props.fields?.Subtitle2}
              link={props.fields?.Link2}
              delay={500}
            />
            <DocumentItem
              image={props.fields?.Image3}
              subtitle={props.fields?.Subtitle3}
              link={props.fields?.Link3}
              delay={1000}
            />
            <DocumentItem
              image={props.fields?.Image4}
              subtitle={props.fields?.Subtitle4}
              link={props.fields?.Link4}
              delay={1500}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

/* TMX variant: light cyan band, section title with chevron, intro + Learn More left, 2x2 linked result tiles right */
export const Tmx = (props: DocumentsListProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const fields = props.fields;

  const tiles = [
    { key: 'doc-1', image: fields?.Image1, subtitle: fields?.Subtitle1, link: fields?.Link1 },
    { key: 'doc-2', image: fields?.Image2, subtitle: fields?.Subtitle2, link: fields?.Link2 },
    { key: 'doc-3', image: fields?.Image3, subtitle: fields?.Subtitle3, link: fields?.Link3 },
    { key: 'doc-4', image: fields?.Image4, subtitle: fields?.Subtitle4, link: fields?.Link4 },
  ].filter(
    (t) => isPageEditing || t.subtitle?.value || t.image?.value?.src || t.link?.value?.href
  );

  return (
    <div className={`component documents-list variant-tmx ${sxaStyles}`} id={id ? id : undefined}>
      <div className="documents-list-tmx__inner">
        {(isPageEditing || fields?.SectionTitle?.value) && (
          <h2 className="documents-list-tmx__section-title">
            <svg className="tmx-chevron" viewBox="0 0 26 30" aria-hidden="true" focusable="false">
              <polygon points="0,0 12,0 26,15 12,30 0,30 14,15" />
            </svg>
            <Text field={fields?.SectionTitle} />
          </h2>
        )}
        <div className="documents-list-tmx__grid">
          <div className="documents-list-tmx__intro">
            {(isPageEditing || fields?.Subheading?.value) && (
              <Text field={fields?.Subheading} tag="h3" className="documents-list-tmx__heading" />
            )}
            {(isPageEditing || fields?.Text?.value) && (
              <Text field={fields?.Text} tag="p" className="documents-list-tmx__text" />
            )}
            {(isPageEditing || fields?.Link?.value?.href) && fields?.Link && (
              <Link field={fields.Link} className="documents-list-tmx__button" />
            )}
          </div>
          <div className="documents-list-tmx__results">
            {(isPageEditing || fields?.Title1?.value) && (
              <Text field={fields?.Title1} tag="h3" className="documents-list-tmx__heading" />
            )}
            {tiles.length > 0 && (
              <div className="documents-list-tmx__tiles">
                {tiles.map((t) => {
                  const content = (
                    <>
                      {(isPageEditing || t.image?.value?.src) && (
                        <NextImage
                          field={t.image}
                          className="documents-list-tmx__icon"
                          width={32}
                          height={32}
                        />
                      )}
                      {(isPageEditing || t.subtitle?.value) && (
                        <Text
                          field={t.subtitle}
                          tag="span"
                          className="documents-list-tmx__tile-label"
                        />
                      )}
                    </>
                  );
                  return (isPageEditing || t.link?.value?.href) && t.link ? (
                    <Link key={t.key} field={t.link} className="documents-list-tmx__tile">
                      {content}
                    </Link>
                  ) : (
                    <div key={t.key} className="documents-list-tmx__tile">
                      {content}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
