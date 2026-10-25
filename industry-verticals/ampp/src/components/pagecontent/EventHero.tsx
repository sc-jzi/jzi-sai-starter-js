import { JSX } from 'react';
import { Image, Link, Text, type Field, type ImageField, type LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface EventRouteFields {
  Title?: Field<string>;
  Subtitle?: Field<string>;
  Date?: Field<string>;
  Location?: Field<string>;
  Image?: ImageField;
  Register?: LinkField;
}

const hasText = (field?: Field<string>): boolean => Boolean(field?.value);

// Shared by every Event page through the Event page design. Copy comes from the page item, so the hero layout stays the same.
const EventHeroView = ({ params, page }: ComponentProps): JSX.Element => {
  const fields = (page?.layout?.sitecore?.route?.fields || {}) as EventRouteFields;
  const image = fields.Image;
  const register = fields.Register;

  return (
    <section className={`component hero-banner variant-ampp-banner col-12 ${params?.styles || ''}`} id={params?.RenderingIdentifier}>
      {image?.value?.src && (
        <div className="ampp-hero-media">
          <Image field={image} />
        </div>
      )}
      <div className="ampp-hero-copy">
        {hasText(fields.Title) && <Text tag="h1" field={fields.Title} />}
        {hasText(fields.Subtitle) && <Text tag="p" className="event-hero-subtitle" field={fields.Subtitle} />}
        {hasText(fields.Date) && <Text tag="p" field={fields.Date} />}
        {hasText(fields.Location) && <Text tag="p" field={fields.Location} />}
        {register?.value?.href && <Link field={register} className="button button-main" />}
      </div>
    </section>
  );
};

export const Default = (props: ComponentProps): JSX.Element => <EventHeroView {...props} />;

export const EventHero = (props: ComponentProps): JSX.Element => <EventHeroView {...props} />;
