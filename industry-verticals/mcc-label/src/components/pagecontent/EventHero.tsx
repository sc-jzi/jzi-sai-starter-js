import { JSX } from 'react';
import { Field, ImageField, NextImage, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

// Context component: no datasource, it reads the event page's own fields (the route; props.fields arrives empty)
interface Fields {
  Title?: Field<string>;
  HeroImage?: ImageField;
}

export type EventHeroProps = ComponentProps & {
  fields?: Fields;
};

// Event title on the left, the event image on the right (one rounded corner)
export const Default = (props: EventHeroProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const isPageEditing = props.page?.mode?.isEditing;
  const fields = (props.page?.layout?.sitecore?.route?.fields ?? props.fields ?? {}) as Fields;

  return (
    <div className={`component event-hero ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="event-hero__layout">
        {fields.Title && (
          <h1 className="event-hero__title">
            <Text field={fields.Title} />
          </h1>
        )}
        {fields.HeroImage && (isPageEditing || fields.HeroImage.value?.src) && (
          <div className="event-hero__media">
            <NextImage field={fields.HeroImage} width={734} height={480} priority />
          </div>
        )}
      </div>
    </div>
  );
};

export const MccLabel = (props: EventHeroProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-event">
    <Default {...props} />
  </section>
);
