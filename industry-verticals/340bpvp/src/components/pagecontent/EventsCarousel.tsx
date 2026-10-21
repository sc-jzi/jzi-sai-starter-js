'use client';

import { JSX, ReactNode, useRef } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Text,
  Link as ContentSdkLink,
  NextImage as ContentSdkImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface EventItem {
  id: string;
  title?: { jsonValue?: Field<string> };
  text?: { jsonValue?: Field<string> };
  link?: { jsonValue?: LinkField };
  date?: { jsonValue?: Field<string> };
  location?: { jsonValue?: Field<string> };
  image?: { jsonValue?: ImageField };
}

interface EventsCarouselDatasource {
  title?: { jsonValue?: Field<string> };
  children?: { results?: EventItem[] };
}

export type EventsCarouselProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: EventsCarouselDatasource;
    };
  };
};

interface CarouselShellProps {
  props: EventsCarouselProps;
  variantClass?: string;
  itemLabel: string;
  isGrid?: boolean;
  renderCard: (item: EventItem, isPageEditing: boolean) => ReactNode;
}

const EventsCarouselEmpty = (): JSX.Element => (
  <div className="component events-carousel">
    <div className="component-content">
      <span className="is-empty-hint">Events Carousel</span>
    </div>
  </div>
);

const CarouselShell = ({
  props,
  variantClass = '',
  itemLabel,
  isGrid = false,
  renderCard,
}: CarouselShellProps): JSX.Element | null => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const trackRef = useRef<HTMLUListElement>(null);
  const datasource = props.fields?.data?.datasource;

  if (!datasource) {
    return isPageEditing ? <EventsCarouselEmpty /> : null;
  }

  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const items = datasource.children?.results ?? [];

  const scrollByCard = (direction: 1 | -1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector('li');
    const step = card ? card.getBoundingClientRect().width + 48 : track.clientWidth;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    track.scrollBy({ left: step * direction, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <section
      className={`component events-carousel ${variantClass} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      {(isPageEditing || datasource.title?.jsonValue?.value) && (
        <Text tag="h2" className="events-carousel-title" field={datasource.title?.jsonValue} />
      )}
      <div className="events-carousel-frame">
        {!isGrid && (
          <button
            type="button"
            className="events-carousel-arrow events-carousel-prev"
            aria-label={`Previous ${itemLabel}`}
            onClick={() => scrollByCard(-1)}
          />
        )}
        <ul className="events-carousel-track" ref={trackRef}>
          {items.map((item) => (
            <li className="events-carousel-card" key={item.id}>
              {renderCard(item, isPageEditing)}
            </li>
          ))}
        </ul>
        {!isGrid && (
          <button
            type="button"
            className="events-carousel-arrow events-carousel-next"
            aria-label={`Next ${itemLabel}`}
            onClick={() => scrollByCard(1)}
          />
        )}
      </div>
    </section>
  );
};

const CardTitle = ({ item, isPageEditing }: { item: EventItem; isPageEditing: boolean }) => (
  <h3 className="events-carousel-name">
    {item.link?.jsonValue?.value?.href && !isPageEditing ? (
      <ContentSdkLink field={item.link.jsonValue}>
        <Text field={item.title?.jsonValue} />
      </ContentSdkLink>
    ) : (
      <Text field={item.title?.jsonValue} />
    )}
  </h3>
);

export const Default = (props: EventsCarouselProps): JSX.Element | null => (
  <CarouselShell
    props={props}
    itemLabel="events"
    renderCard={(event, isPageEditing) => (
      <>
        <div className="events-carousel-media">
          <ContentSdkImage field={event.image?.jsonValue} width={260} height={164} />
        </div>
        <CardTitle item={event} isPageEditing={isPageEditing} />
        {isPageEditing && event.link?.jsonValue && (
          <ContentSdkLink field={event.link.jsonValue} className="events-carousel-edit-link" />
        )}
        <Text tag="p" className="events-carousel-date" field={event.date?.jsonValue} />
        <Text tag="p" className="events-carousel-location" field={event.location?.jsonValue} />
      </>
    )}
  />
);

export const QuickLinks = (props: EventsCarouselProps): JSX.Element | null => (
  <CarouselShell
    props={props}
    variantClass="events-carousel-quick-links"
    itemLabel="links"
    renderCard={(item, isPageEditing) =>
      item.link?.jsonValue?.value?.href && !isPageEditing ? (
        <ContentSdkLink field={item.link.jsonValue} className="events-carousel-tile">
          <Text field={item.title?.jsonValue} />
        </ContentSdkLink>
      ) : (
        <div className="events-carousel-tile">
          <Text field={item.title?.jsonValue} />
          {isPageEditing && item.link?.jsonValue && (
            <ContentSdkLink field={item.link.jsonValue} className="events-carousel-edit-link" />
          )}
        </div>
      )
    }
  />
);

export const Courses = (props: EventsCarouselProps): JSX.Element | null => (
  <CarouselShell
    props={props}
    variantClass="events-carousel-courses"
    itemLabel="courses"
    isGrid
    renderCard={(course, isPageEditing) => (
      <>
        <div className="events-carousel-course-main">
          {(isPageEditing || course.image?.jsonValue?.value?.src) && (
            <div className="events-carousel-course-icon">
              <ContentSdkImage field={course.image?.jsonValue} />
            </div>
          )}
          <CardTitle item={course} isPageEditing={isPageEditing} />
          {isPageEditing && course.link?.jsonValue && (
            <ContentSdkLink field={course.link.jsonValue} className="events-carousel-edit-link" />
          )}
          {(isPageEditing || course.text?.jsonValue?.value) && (
            <Text tag="p" className="events-carousel-text" field={course.text?.jsonValue} />
          )}
        </div>
        <div className="events-carousel-course-details">
          <Text tag="p" className="events-carousel-date" field={course.date?.jsonValue} />
          {isPageEditing ? (
            <Text tag="p" className="events-carousel-location" field={course.location?.jsonValue} />
          ) : (
            (course.location?.jsonValue?.value ?? '')
              .split('|')
              .map((detail) => detail.trim())
              .filter(Boolean)
              .map((detail, index) => (
                <p className="events-carousel-detail" key={index}>
                  {detail}
                </p>
              ))
          )}
        </div>
      </>
    )}
  />
);

export const Resources = (props: EventsCarouselProps): JSX.Element | null => (
  <CarouselShell
    props={props}
    variantClass="events-carousel-resources"
    itemLabel="resources"
    renderCard={(resource, isPageEditing) => (
      <>
        <div className="events-carousel-media">
          <ContentSdkImage field={resource.image?.jsonValue} width={260} height={164} />
        </div>
        <CardTitle item={resource} isPageEditing={isPageEditing} />
        {(isPageEditing || resource.text?.jsonValue?.value) && (
          <Text tag="p" className="events-carousel-text" field={resource.text?.jsonValue} />
        )}
        {resource.link?.jsonValue &&
          (isPageEditing || resource.link.jsonValue.value?.href) && (
            <ContentSdkLink field={resource.link.jsonValue} className="events-carousel-more" />
          )}
      </>
    )}
  />
);
