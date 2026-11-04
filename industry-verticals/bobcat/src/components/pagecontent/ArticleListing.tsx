'use client';

import { JSX, useMemo, useRef, useState } from 'react';
import { Field, ImageField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { formatArticleDate } from './ArticleHeader';

/**
 * ArticleListing: the article pages under the datasource's Root page as cards (Thumbnail, NavigationTitle or Title,
 * PublishDate, Excerpt), newest first.
 * - Grid (press releases page): "N Results", Sort By (newest / oldest), View (page size) and a filter sidebar built from
 *   the tag groups in Filters (each group's children are the options; an article matches when its Tags hold the option).
 *   Options in one group are OR, groups are AND.
 * - Slider (More Releases on an article): the same cards in a scroller, the current page left out, PageSize cards.
 * The datasource and the articles come as field lists (fields(ownFields: true)) to stay within Edge's query-depth limit.
 */

type FieldList = { name: string; jsonValue?: unknown }[];
type JsonField<T> = { jsonValue?: T };
type RefItem = { id?: string };

interface ListingFields {
  title?: Field<string>;
  filterLabel?: Field<string>;
  sortLabel?: Field<string>;
  newestLabel?: Field<string>;
  oldestLabel?: Field<string>;
  viewLabel?: Field<string>;
  resultsLabel?: Field<string>;
  clearLabel?: Field<string>;
  pageSize?: Field<number | string>;
}

interface ArticleFields {
  publishDate?: Field<string>;
  excerpt?: Field<string>;
  thumbnail?: ImageField;
  tags?: RefItem[];
}

type ArticleResult = {
  id: string;
  url?: { path?: string };
  title?: JsonField<Field<string>>;
  navigationTitle?: JsonField<Field<string>>;
  fields?: FieldList;
};

type TagGroup = {
  id: string;
  title?: JsonField<Field<string>>;
  children?: { results?: { id: string; title?: JsonField<Field<string>> }[] };
};

export type ArticleListingProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        fields?: FieldList;
        filters?: { targetItems?: TagGroup[] } | null;
        root?: { targetItem?: { children?: { results?: ArticleResult[] } } } | null;
      };
    };
  };
};

type Look = 'default' | 'bobcat' | 'slider';

const keyed = <T,>(list?: FieldList): T => {
  const out: Record<string, unknown> = {};
  for (const f of list ?? []) if (f?.name) out[f.name.charAt(0).toLowerCase() + f.name.slice(1)] = f.jsonValue;
  return out as T;
};
const str = (f?: Field<unknown>) => `${f?.value ?? ''}`.trim();
const normId = (id?: string) => `${id ?? ''}`.replace(/[^0-9a-f]/gi, '').toLowerCase();
const PAGE_SIZES = [12, 24, 48];

type Card = {
  id: string;
  href: string;
  title: string;
  date: string;
  time: number;
  excerpt: string;
  thumbnail?: ImageField;
  tags: Set<string>;
};

const ArticleCard = ({ card, showDate }: { card: Card; showDate: boolean }): JSX.Element => (
  <div className="article-card">
    {card.thumbnail?.value?.src && (
      <NextImage field={card.thumbnail} width={480} height={320} className="article-card__image" />
    )}
    <div className="article-card__body">
      <h4 className="article-card__title">
        <a href={card.href} className="article-card__link">
          {card.title}
        </a>
      </h4>
      {showDate && card.date && <p className="article-card__date">{card.date}</p>}
      {card.excerpt && <p className="article-card__excerpt">{card.excerpt}</p>}
    </div>
  </div>
);

const Chevron = ({ dir }: { dir: 'prev' | 'next' | 'down' }): JSX.Element => (
  <svg viewBox="0 0 24 24" width={dir === 'down' ? 14 : 28} height={dir === 'down' ? 14 : 28} aria-hidden="true">
    <path
      d={dir === 'prev' ? 'M15 4 7 12l8 8' : dir === 'next' ? 'm9 4 8 8-8 8' : 'm4 8 8 8 8-8'}
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    />
  </svg>
);

const ArticleListingView = ({ props, look }: { props: ArticleListingProps; look: Look }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const currentId = normId(page?.layout?.sitecore?.route?.itemId);
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = props.fields?.data?.datasource;
  const f = useMemo(() => keyed<ListingFields>(datasource?.fields), [datasource]);
  const configured = parseInt(str(f.pageSize), 10) || 12;

  const cards = useMemo<Card[]>(
    () =>
      (datasource?.root?.targetItem?.children?.results ?? [])
        .map((r) => {
          const a = keyed<ArticleFields>(r.fields);
          const time = a.publishDate?.value ? new Date(a.publishDate.value).getTime() : 0;
          return {
            id: r.id,
            href: r.url?.path || '#',
            title: str(r.navigationTitle?.jsonValue) || str(r.title?.jsonValue),
            date: formatArticleDate(a.publishDate?.value),
            time: Number.isNaN(time) ? 0 : time,
            excerpt: str(a.excerpt),
            thumbnail: a.thumbnail,
            tags: new Set((a.tags ?? []).map((t) => normId(t.id))),
          };
        })
        .filter((c) => !!c.title),
    [datasource]
  );
  const groups = datasource?.filters?.targetItems ?? [];

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [pageSize, setPageSize] = useState(configured);
  const [pageIndex, setPageIndex] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const trackRef = useRef<HTMLDivElement>(null);

  // an article passes a group when nothing in it is ticked or it carries one of the ticked options
  const passes = (card: Card, skipGroup?: string) =>
    groups.every((g) => {
      if (g.id === skipGroup) return true;
      const ticked = (g.children?.results ?? []).map((o) => normId(o.id)).filter((o) => selected.has(o));
      return ticked.length === 0 || ticked.some((o) => card.tags.has(o));
    });

  if (!datasource) {
    return (
      <div className={`component article-listing ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Article Listing: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  if (look === 'slider') {
    const items = [...cards]
      .filter((c) => normId(c.id) !== currentId)
      .sort((a, b) => b.time - a.time)
      .slice(0, configured);
    const scroll = (dir: 1 | -1) => {
      const track = trackRef.current;
      const card = track?.querySelector<HTMLElement>('.article-listing__slide');
      track?.scrollBy({ left: dir * (card ? card.offsetWidth : track.clientWidth), behavior: 'smooth' });
    };
    return (
      <div className={`component article-listing article-listing--slider ${styles}`} id={id ? id : undefined}>
        <div className="article-listing__inner">
          {(isEditing || !!str(f.title)) && (
            <h2 className="article-listing__heading">
              <Text field={f.title} />
            </h2>
          )}
          <div className="article-listing__slider">
            <div className="article-listing__track" ref={trackRef}>
              {items.map((c) => (
                <div className="article-listing__slide" key={c.id}>
                  <ArticleCard card={c} showDate={false} />
                </div>
              ))}
            </div>
            {items.length > 3 && (
              <>
                <button type="button" className="article-listing__arrow article-listing__arrow--prev" aria-label="Previous" onClick={() => scroll(-1)}>
                  <Chevron dir="prev" />
                </button>
                <button type="button" className="article-listing__arrow article-listing__arrow--next" aria-label="Next" onClick={() => scroll(1)}>
                  <Chevron dir="next" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const results = cards.filter((c) => passes(c)).sort((a, b) => (sort === 'newest' ? b.time - a.time : a.time - b.time));
  const pages = Math.max(1, Math.ceil(results.length / pageSize));
  const current = Math.min(pageIndex, pages - 1);
  const shown = results.slice(current * pageSize, current * pageSize + pageSize);
  const toggle = (optionId: string) => {
    const next = new Set(selected);
    if (next.has(optionId)) next.delete(optionId);
    else next.add(optionId);
    setSelected(next);
    setPageIndex(0);
  };

  return (
    <div className={`component article-listing article-listing--${look} ${styles}`} id={id ? id : undefined}>
      <div className="article-listing__inner">
        {(isEditing || !!str(f.title)) && (
          <h1 className="article-listing__title">
            <Text field={f.title} />
          </h1>
        )}
      </div>
      <div className="article-listing__band">
        <div className="article-listing__inner">
        <div className="article-listing__toolbar">
          <p className="article-listing__count">
            {results.length} {str(f.resultsLabel)}
          </p>
          <div className="article-listing__controls">
            <label className="article-listing__control">
              <span>{str(f.sortLabel)}:</span>
              <select value={sort} onChange={(e) => setSort(e.target.value as 'newest' | 'oldest')} disabled={isEditing}>
                <option value="newest">{str(f.newestLabel) || 'Newest'}</option>
                <option value="oldest">{str(f.oldestLabel) || 'Oldest'}</option>
              </select>
            </label>
            <label className="article-listing__control">
              <span>{str(f.viewLabel)}:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPageIndex(0);
                }}
                disabled={isEditing}
              >
                {[...new Set([configured, ...PAGE_SIZES])].sort((a, b) => a - b).map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="article-listing__layout">
          {groups.length > 0 && (
            <aside className="article-listing__filters" aria-label={str(f.filterLabel) || undefined}>
              {selected.size > 0 && (
                <button type="button" className="article-listing__clear" onClick={() => setSelected(new Set())}>
                  {str(f.clearLabel)}
                </button>
              )}
              {groups.map((g) => {
                const isOpen = open[g.id] !== false;
                const options = (g.children?.results ?? []).map((o) => {
                  const oid = normId(o.id);
                  const count = cards.filter((c) => c.tags.has(oid) && passes(c, g.id)).length;
                  return { oid, label: str(o.title?.jsonValue), count };
                });
                const visible = expanded[g.id] ? options : options.slice(0, 5);
                return (
                  <div className={`article-listing__group${isOpen ? '' : ' is-closed'}`} key={g.id}>
                    <button
                      type="button"
                      className="article-listing__group-title"
                      aria-expanded={isOpen}
                      onClick={() => setOpen({ ...open, [g.id]: !isOpen })}
                    >
                      {str(g.title?.jsonValue)}
                      <Chevron dir="down" />
                    </button>
                    {isOpen && (
                      <div className="article-listing__options">
                        {visible.map((o) => (
                          <label className="article-listing__option" key={o.oid}>
                            <input type="checkbox" checked={selected.has(o.oid)} onChange={() => toggle(o.oid)} />
                            <span>
                              {o.label} ({o.count})
                            </span>
                          </label>
                        ))}
                        {options.length > 5 && (
                          <button
                            type="button"
                            className="article-listing__more"
                            onClick={() => setExpanded({ ...expanded, [g.id]: !expanded[g.id] })}
                          >
                            {expanded[g.id] ? '− Show less' : '+ Show more'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </aside>
          )}
          <div className="article-listing__results">
            <div className="article-listing__grid">
              {shown.map((c) => (
                <ArticleCard card={c} showDate key={c.id} />
              ))}
            </div>
            {pages > 1 && (
              <nav className="article-listing__pager" aria-label="Pages">
                <button type="button" disabled={current === 0} onClick={() => setPageIndex(current - 1)} aria-label="Previous page">
                  ‹
                </button>
                {Array.from({ length: pages }, (_, i) => (
                  <button
                    type="button"
                    key={i}
                    className={i === current ? 'is-current' : undefined}
                    aria-current={i === current ? 'page' : undefined}
                    onClick={() => setPageIndex(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button type="button" disabled={current === pages - 1} onClick={() => setPageIndex(current + 1)} aria-label="Next page">
                  ›
                </button>
              </nav>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ArticleListingProps): JSX.Element => <ArticleListingView props={props} look="default" />;

/* Bobcat: the press releases page - title, results/sort/view toolbar, filter sidebar on the left, three cards a row */
export const Bobcat = (props: ArticleListingProps): JSX.Element => <ArticleListingView props={props} look="bobcat" />;

/* BobcatSlider: "More Releases" under an article - heading and a card scroller with arrows, the current page left out */
export const BobcatSlider = (props: ArticleListingProps): JSX.Element => <ArticleListingView props={props} look="slider" />;
