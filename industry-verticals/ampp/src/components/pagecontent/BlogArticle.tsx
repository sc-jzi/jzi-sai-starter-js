import { JSX } from 'react';
import { Image, RichText, Text, type Field, type ImageField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type RouteField = Field<string> | ImageField;

interface BlogRouteFields {
  Title?: RouteField;
  Description?: RouteField;
  Image?: RouteField;
}

// A server component: the route fields come from the `page` prop the Placeholder passes (useSitecore() is client-only)
const BlogArticle = ({ params, page, look }: ComponentProps & { look: string }): JSX.Element => {
  const fields = (page?.layout?.sitecore?.route?.fields || {}) as BlogRouteFields;
  const id = params?.RenderingIdentifier;

  return (
    <article className={`component blog-article col-12 ${look} ${params?.styles || ''}`} id={id}>
      <div className="container">
        {fields.Title && <Text tag="h1" field={fields.Title as Field<string>} />}
        <div className="row">
          <div className="col-md-8">
            {fields.Description && <RichText field={fields.Description as Field<string>} />}
          </div>
          <div className="col-md-4">
            {fields.Image && <Image field={fields.Image as ImageField} />}
          </div>
        </div>
      </div>
    </article>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <BlogArticle {...props} look="variant-article" />;

export const Article = (props: ComponentProps): JSX.Element => <BlogArticle {...props} look="variant-article" />;
