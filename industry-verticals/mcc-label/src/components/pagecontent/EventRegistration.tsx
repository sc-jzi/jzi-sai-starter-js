import { JSX } from 'react';
import { Field, Link, LinkField, RichText, RichTextField, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

// Context component: no datasource, it reads the event page's own fields (the route; props.fields arrives empty)
interface Fields {
  RegistrationTitle?: Field<string>;
  RegistrationText?: RichTextField;
  RegistrationDetails?: RichTextField;
  RegistrationLink?: LinkField;
}

export type EventRegistrationProps = ComponentProps & {
  fields?: Fields;
};

// Grey band: heading and text on the left, a white card with the registration details and a register button on the right.
// Its id is the target of the "Secure your spot" link in EventDetails.
export const Default = (props: EventRegistrationProps): JSX.Element => {
  const isPageEditing = props.page?.mode?.isEditing;
  const fields = (props.page?.layout?.sitecore?.route?.fields ?? props.fields ?? {}) as Fields;
  const show = (f?: Field<string> | RichTextField) => !!f && (isPageEditing || !!f.value);

  return (
    <div className={`component event-registration ${props.params?.styles || ''}`} id="register">
      <div className="event-registration__layout">
        <div className="event-registration__intro">
          {show(fields.RegistrationTitle) && (
            <Text tag="h2" className="event-registration__title" field={fields.RegistrationTitle} />
          )}
          {show(fields.RegistrationText) && <RichText className="event-registration__text" field={fields.RegistrationText} />}
        </div>
        <div className="event-registration__card">
          {show(fields.RegistrationDetails) && (
            <RichText className="event-registration__details" field={fields.RegistrationDetails} />
          )}
          {fields.RegistrationLink && (isPageEditing || fields.RegistrationLink.value?.href) && (
            <Link field={fields.RegistrationLink} className="event-registration__button" />
          )}
        </div>
      </div>
    </div>
  );
};

export const MccLabel = (props: EventRegistrationProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-event">
    <Default {...props} />
  </section>
);
