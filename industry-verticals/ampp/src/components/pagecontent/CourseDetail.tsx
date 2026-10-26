import { JSX } from 'react';
import {
  Image,
  Link,
  RichText,
  Text,
  type Field,
  type ImageField,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface CourseRouteFields {
  Title?: Field<string>;
  Description?: Field<string>;
  Duration?: Field<string>;
  Languages?: Field<string>;
  CourseLevel?: Field<string>;
  Image?: ImageField;
  Cta?: LinkField;
}

const hasText = (field?: Field<string>) => Boolean(field?.value);
const hasImage = (field?: ImageField) => Boolean(field?.value?.src);
const hasLink = (field?: LinkField) => Boolean(field?.value?.href);

export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const fields = (page?.layout?.sitecore?.route?.fields || {}) as CourseRouteFields;
  const isEditing = Boolean(page?.mode?.isEditing);
  const id = params?.RenderingIdentifier;

  return (
    <section
      className={`component course-detail col-12 ${params?.styles || ''}`}
      id={id || undefined}
    >
      <div className="container">
        <div className="row course-hero">
          <div className="col-lg-4">
            {(isEditing || hasImage(fields.Image)) && <Image field={fields.Image} />}
          </div>
          <div className="col-lg-8">
            {(isEditing || hasText(fields.Title)) && <Text tag="h1" field={fields.Title} />}
            {(isEditing || hasText(fields.Description)) && <RichText field={fields.Description} />}
            {(isEditing || hasLink(fields.Cta)) && fields.Cta && (
              <Link field={fields.Cta} className="button button-main" />
            )}
            {isEditing && (
              <div className="course-editing-fields">
                <Text tag="p" field={fields.CourseLevel} />
                <Text tag="p" field={fields.Duration} />
                <Text tag="p" field={fields.Languages} />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
