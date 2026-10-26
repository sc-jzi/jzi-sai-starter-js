import { JSX } from 'react';
import {
  Link,
  RichText,
  Text,
  type Field,
  type LinkField,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface CourseRouteFields {
  Duration?: Field<string>;
  Languages?: Field<string>;
}

interface CourseBodyFields {
  Text?: Field<string>;
  Video?: LinkField;
  Sidebar?: Field<string>;
}

const hasText = (field?: Field<string>) => Boolean(field?.value);
const hasLink = (field?: LinkField) => Boolean(field?.value?.href);

const youtubeEmbed = (href?: string) => {
  const match = String(href || '').match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}` : '';
};

export const Default = ({ params, page, fields }: ComponentProps & { fields?: CourseBodyFields }): JSX.Element => {
  const route = (page?.layout?.sitecore?.route?.fields || {}) as CourseRouteFields;
  const isEditing = Boolean(page?.mode?.isEditing);
  const id = params?.RenderingIdentifier;
  const showDuration = isEditing || hasText(route.Duration);
  const showLanguages = isEditing || hasText(route.Languages);
  const showVideo = isEditing || hasLink(fields?.Video);
  const showSidebar = isEditing || hasText(fields?.Sidebar);

  return (
    <section className={`component course-body col-12 ${params?.styles || ''}`} id={id || undefined}>
      <div className="container">
        <div className="row">
          <div className="col-lg-8">
            {(isEditing || hasText(fields?.Text)) && fields?.Text && <RichText field={fields.Text} />}
          </div>
          <aside className="col-lg-4">
            {(showDuration || showLanguages) && (
              <div className="course-facts">
                {showDuration && (
                  <p className="course-fact">
                    <Text field={route.Duration} />
                  </p>
                )}
                {showLanguages && (
                  <p className="course-fact">
                    <Text field={route.Languages} />
                  </p>
                )}
              </div>
            )}
            {showSidebar && fields?.Sidebar && <RichText className="course-sidebar" field={fields.Sidebar} />}
            {showVideo && fields?.Video && (isEditing || !youtubeEmbed(fields.Video.value?.href) ? (
              <Link field={fields.Video} className="course-video" />
            ) : (
              <iframe
                className="course-video"
                src={youtubeEmbed(fields.Video.value?.href)}
                title="Course video"
              />
            ))}
          </aside>
        </div>
      </div>
    </section>
  );
};
