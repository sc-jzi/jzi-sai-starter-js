'use client';

import { JSX } from 'react';
import {
  Field,
  LinkField,
  Link,
  Text,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import useVisibility from 'src/hooks/useVisibility';

interface Fields {
  Text1: Field<string>;
  Description1: Field<string>;
  Link1: LinkField;
  Text2: Field<string>;
  Description2: Field<string>;
  Link2: LinkField;
  Text3: Field<string>;
  Description3: Field<string>;
  Link3: LinkField;
  Text4: Field<string>;
  Description4: Field<string>;
  Link4: LinkField;
  Text5: Field<string>;
  Description5: Field<string>;
  Link5: LinkField;
}

export type FiveColumnCtaProps = {
  params: { [key: string]: string };
  fields: Fields;
};

export const Default = (props: FiveColumnCtaProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;

  const Column = ({
    title,
    description,
    link,
    delay,
  }: {
    title: Field<string>;
    description: Field<string>;
    link: LinkField;
    delay?: number;
  }) => {
    const [isVisible, domRef] = useVisibility(delay);
    const hasContent =
      isPageEditing ||
      title?.value ||
      description?.value ||
      link?.value?.href;

    if (!hasContent) {
      return null;
    }

    return (
      <div
        className={`col ${!isPageEditing ? `fade-section ${isVisible ? 'is-visible' : ''}` : ''}`}
        ref={domRef}
      >
        <Link field={link} className="card-link">
          <div className="card-content">
            {(isPageEditing || title?.value) && (
              <h2 className="card-title">
                <Text field={title} />
              </h2>
            )}
            {(isPageEditing || description?.value) && (
              <p className="card-description">
                <Text field={description} />
              </p>
            )}
          </div>
        </Link>
      </div>
    );
  };

  return (
    <div
      className={`component component-spaced five-column-cta colored-blocks ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="container-fluid px-0">
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-4">
          <Column
            title={props.fields.Text1}
            description={props.fields.Description1}
            link={props.fields.Link1}
          />
          <Column
            title={props.fields.Text2}
            description={props.fields.Description2}
            link={props.fields.Link2}
            delay={500}
          />
          <Column
            title={props.fields.Text3}
            description={props.fields.Description3}
            link={props.fields.Link3}
            delay={1000}
          />
          <Column
            title={props.fields.Text4}
            description={props.fields.Description4}
            link={props.fields.Link4}
            delay={1500}
          />

        </div>
      </div>
    </div>
  );
};
