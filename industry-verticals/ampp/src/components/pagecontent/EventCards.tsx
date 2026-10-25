import { JSX } from 'react';
import { Image, Link, Text, type Field, type ImageField, type LinkField } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

type JsonField<T> = { jsonValue?: Field<T> | ImageField | LinkField };

interface EventCardItem {
  id?: string;
  image?: JsonField<string>;
  title?: JsonField<string>;
  date?: JsonField<string>;
  location?: JsonField<string>;
  register?: JsonField<string>;
  info?: JsonField<string>;
}

interface EventCardsFields {
  data?: {
    datasource?: {
      title?: JsonField<string>;
      children?: { results?: EventCardItem[] };
    };
  };
}

type EventCardsProps = ComponentProps & {
  fields?: EventCardsFields;
};

const EventCards = ({ fields, params, look, photos }: EventCardsProps & { look: string; photos: boolean }) => {
  const datasource = fields?.data?.datasource;
  const cards = datasource?.children?.results || [];
  const id = params?.RenderingIdentifier;

  return (
    <section className={`component event-cards col-12 ${look} ${params?.styles || ''}`} id={id}>
      <div className="container">
        {(datasource?.title?.jsonValue as Field<string> | undefined)?.value && (
          <Text tag="h2" field={datasource?.title?.jsonValue as Field<string>} />
        )}
        <div className={photos ? 'row' : 'event-list'}>
          {cards.map((card, index) => (
            <article className={photos ? 'col-md-6 col-lg-3' : 'event-list-item'} key={card.id || index}>
              {photos && card.image?.jsonValue && <Image field={card.image.jsonValue as ImageField} />}
              {card.title?.jsonValue && <Text tag="h3" field={card.title.jsonValue as Field<string>} />}
              {card.date?.jsonValue && <Text tag="p" className="event-date" field={card.date.jsonValue as Field<string>} />}
              {card.location?.jsonValue && (
                <Text tag="p" className="event-location" field={card.location.jsonValue as Field<string>} />
              )}
              <p className="event-actions">
                {card.register?.jsonValue && (
                  <Link field={card.register.jsonValue as LinkField} className="button" />
                )}
                {card.info?.jsonValue && <Link field={card.info.jsonValue as LinkField} className="button button-light" />}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: EventCardsProps): JSX.Element => <EventCards {...props} look="variant-featured" photos />;

export const Featured = (props: EventCardsProps): JSX.Element => <EventCards {...props} look="variant-featured" photos />;

export const EventList = (props: EventCardsProps): JSX.Element => (
  <EventCards {...props} look="variant-event-list" photos={false} />
);
