import { JSX } from 'react';
import { DateField, Field, RichText, RichTextField, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

// Context component: no datasource, it reads the event page's own fields (the route; props.fields arrives empty)
interface Fields {
  Content?: RichTextField;
  EventType?: Field<string>;
  Location?: Field<string>;
  StartDate?: Field<string>;
  EndDate?: Field<string>;
  Schedule?: RichTextField;
}

export type EventDetailsProps = ComponentProps & {
  fields?: Fields;
};

const formatDate = (date?: Date | null): string =>
  date && !isNaN(date.getTime())
    ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : '';

const PinIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

const CalendarIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18 M8 3v4 M16 3v4" />
  </svg>
);

// The event description on the left; an Event details card on the right (type, location, dates, schedule, link to registration)
export const Default = (props: EventDetailsProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const isPageEditing = props.page?.mode?.isEditing;
  const fields = (props.page?.layout?.sitecore?.route?.fields ?? props.fields ?? {}) as Fields;
  const show = (f?: Field<string> | RichTextField) => !!f && (isPageEditing || !!f.value);
  // An empty Date field comes back as 0001-01-01, not as an empty string
  const hasDate = (f?: Field<string>) => !!f?.value && !String(f.value).startsWith('0001-01-01');
  const showDate = (f?: Field<string>) => !!f && (isPageEditing || hasDate(f));
  const hasDates = showDate(fields.StartDate) || showDate(fields.EndDate);

  return (
    <div className={`component event-details ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="event-details__layout">
        {show(fields.Content) && <RichText className="event-details__body" field={fields.Content} />}
        <aside className="event-details__card">
          <h3 className="event-details__card-title">Event details</h3>
          {show(fields.EventType) && <Text tag="p" className="event-details__type" field={fields.EventType} />}
          {show(fields.Location) && (
            <div className="event-details__row">
              <PinIcon />
              <Text tag="p" className="event-details__location" field={fields.Location} />
            </div>
          )}
          {(hasDates || show(fields.Schedule)) && (
            <div className="event-details__row">
              <CalendarIcon />
              <div>
                {hasDates && (
                  <p className="event-details__dates">
                    {showDate(fields.StartDate) && <DateField field={fields.StartDate!} render={formatDate} />}
                    {showDate(fields.EndDate) && (
                      <>
                        {' – '}
                        <DateField field={fields.EndDate!} render={formatDate} />
                      </>
                    )}
                  </p>
                )}
                {show(fields.Schedule) && <RichText className="event-details__schedule" field={fields.Schedule} />}
              </div>
            </div>
          )}
          <a className="event-details__register" href="#register">
            Secure your spot
          </a>
        </aside>
      </div>
    </div>
  );
};

export const MccLabel = (props: EventDetailsProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label-event">
    <Default {...props} />
  </section>
);
