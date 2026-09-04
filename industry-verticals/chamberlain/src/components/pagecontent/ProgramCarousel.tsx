'use client';

import { useCallback, useEffect, useRef, useState, JSX } from 'react';
import { Field, ImageField, Text, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';

const EXCLUDED_CHILD_NAMES = new Set(['Data', 'Authors']);

type JsonField<T = string> = { jsonValue?: Field<T> | ImageField };

type QueryChild = {
  id?: string;
  name?: string;
  url?: { path?: string } | string;
  title?: JsonField;
  navigationTitle?: JsonField;
  content?: JsonField;
  backgroundImage?: JsonField;
  children?: { results?: QueryChild[] };
  fields?: {
    Title?: Field<string>;
    NavigationTitle?: Field<string>;
    Content?: Field<string>;
    BackgroundImage?: ImageField;
  };
};

export type ProgramCarouselProps = {
  params: { [key: string]: string };
  fields?: {
    data?: {
      datasource?: {
        title?: JsonField;
        children?: { results?: QueryChild[] };
      };
    };
    items?: QueryChild[];
  };
};

type ProgramLink = {
  href: string;
  text: string;
  field?: Field<string>;
};

function textFrom(field?: JsonField | Field<string>, fallback = ''): string {
  if (!field) {
    return fallback;
  }
  if ('jsonValue' in field && field.jsonValue) {
    const value = (field.jsonValue as Field<string>).value;
    return typeof value === 'string' ? value : fallback;
  }
  if ('value' in field && typeof field.value === 'string') {
    return field.value;
  }
  return fallback;
}

function titleField(item: QueryChild): Field<string> | undefined {
  if (item.title?.jsonValue) {
    return item.title.jsonValue as Field<string>;
  }
  return item.fields?.Title || item.fields?.NavigationTitle;
}

function imageFrom(item: QueryChild): ImageField | undefined {
  if (item.backgroundImage?.jsonValue) {
    return item.backgroundImage.jsonValue as ImageField;
  }
  return item.fields?.BackgroundImage;
}

function itemHref(item: QueryChild): string {
  if (typeof item.url === 'string') {
    return item.url;
  }
  return item.url?.path || '#';
}

function isProgramPage(item: QueryChild): boolean {
  return Boolean(item.name) && !EXCLUDED_CHILD_NAMES.has(item.name || '');
}

function programLinks(item: QueryChild): ProgramLink[] {
  const nested = item.children?.results?.filter(isProgramPage) || [];
  if (nested.length) {
    return nested.map((child) => ({
      href: itemHref(child),
      text:
        textFrom(child.navigationTitle) ||
        textFrom(child.title) ||
        child.fields?.NavigationTitle?.value ||
        child.fields?.Title?.value ||
        child.name ||
        '',
      field: titleField(child),
    }));
  }

  const text =
    textFrom(item.navigationTitle) ||
    textFrom(item.title) ||
    item.fields?.NavigationTitle?.value ||
    item.fields?.Title?.value ||
    item.name ||
    '';

  return text ? [{ href: itemHref(item), text, field: titleField(item) }] : [];
}

function collectPrograms(fields?: ProgramCarouselProps['fields']): QueryChild[] {
  const queried = fields?.data?.datasource?.children?.results;
  if (queried?.length) {
    return queried.filter(isProgramPage);
  }
  if (fields?.items?.length) {
    return fields.items.filter(isProgramPage);
  }
  return [];
}

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" aria-hidden>
    <path
      fill="currentColor"
      d="M9.3 3.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 1 1-1.4-1.4L11.6 9H2a1 1 0 1 1 0-2h9.6L9.3 4.7a1 1 0 0 1 0-1.4Z"
    />
  </svg>
);

const ProgramCarouselView = (props: ProgramCarouselProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const programs = collectPrograms(props.fields);
  const count = programs.length;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (count === 0) {
        return;
      }
      setActiveIndex(((index % count) + count) % count);
    },
    [count]
  );

  const handleNav = (direction: -1 | 1) => {
    setAutoPlay(false);
    goTo(activeIndex + direction);
  };

  useEffect(() => {
    const node = scrollerRef.current;
    if (!node || count === 0) {
      return;
    }
    const cards = node.querySelectorAll<HTMLElement>('.chamberlain-programs__card');
    const card = cards[activeIndex];
    if (!card) {
      return;
    }
    node.scrollTo({ left: card.offsetLeft, behavior: 'smooth' });
  }, [activeIndex, count]);

  useEffect(() => {
    if (!autoPlay || isHovering || isPageEditing || count < 2) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % count);
    }, 5000);

    return () => window.clearInterval(timer);
  }, [autoPlay, isHovering, isPageEditing, count]);

  const thumbWidth = count > 0 ? Math.max(16, 100 / count) : 100;
  const thumbLeft = count > 1 ? (activeIndex / (count - 1)) * (100 - thumbWidth) : 0;

  return (
    <div
      className={`component program-carousel chamberlain-programs ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="chamberlain-programs__pattern" aria-hidden />
      <div className="container">
        {programs.length === 0 && isPageEditing && (
          <p className="chamberlain-programs__empty">
            No Content Page children found on this datasource.
          </p>
        )}
        {programs.length > 0 && (
          <>
            <div
              className="chamberlain-programs__scroller"
              ref={scrollerRef}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {programs.map((program) => {
                const image = imageFrom(program);
                const links = programLinks(program);
                const heading = titleField(program);
                return (
                  <article
                    className="chamberlain-programs__card"
                    key={program.id || program.name || itemHref(program)}
                  >
                    <div className="chamberlain-programs__icon">
                      {image?.value?.src ? (
                        <NextImage field={image} width={40} height={40} />
                      ) : (
                        <span className="chamberlain-programs__icon-fallback" aria-hidden />
                      )}
                    </div>
                    <h3 className="chamberlain-programs__title">
                      {heading ? <Text field={heading} /> : program.name}
                    </h3>
                    {links.length > 0 && (
                      <ul className="chamberlain-programs__links">
                        {links.map((link) => (
                          <li key={`${link.href}-${link.text}`}>
                            <a href={link.href} className="chamberlain-programs__link">
                              {link.field ? <Text field={link.field} /> : link.text}
                              <ArrowIcon />
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </article>
                );
              })}
            </div>
            <div className="chamberlain-programs__controls">
              <div className="chamberlain-programs__track" aria-hidden>
                <span
                  className="chamberlain-programs__fill"
                  style={{
                    width: `${thumbWidth}%`,
                    left: `${thumbLeft}%`,
                  }}
                />
              </div>
              <div className="chamberlain-programs__buttons">
                <button
                  type="button"
                  className="chamberlain-programs__nav"
                  aria-label="Previous programs"
                  onClick={() => handleNav(-1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M10.7 2.3a1 1 0 0 1 0 1.4L6.4 8l4.3 4.3a1 1 0 1 1-1.4 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0Z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className="chamberlain-programs__nav"
                  aria-label="Next programs"
                  onClick={() => handleNav(1)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 16 16" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M5.3 2.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4L9.6 8 5.3 3.7a1 1 0 0 1 0-1.4Z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* Chamberlain variant — light-blue band, white cards, navy icons, progress + prev/next */
export const Chamberlain = (props: ProgramCarouselProps): JSX.Element => (
  <ProgramCarouselView {...props} />
);

export const Default = (props: ProgramCarouselProps): JSX.Element => (
  <ProgramCarouselView {...props} />
);
