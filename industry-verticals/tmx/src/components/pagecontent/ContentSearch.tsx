'use client';

import React, { JSX, useCallback, useEffect, useRef, useState } from 'react';
import { Field, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/* ------------------------------------------------------------------ types */

interface Fields {
  Title: Field<string>;
  Placeholder: Field<string>;
  ButtonText: Field<string>;
  ContentTypeLabel: Field<string>;
  TopicLabel: Field<string>;
  Scope: Field<string>;
}

export type ContentSearchProps = ComponentProps & {
  fields: Fields;
};

type FacetValue = { name: string; count: number };

type SearchResult = {
  id: string;
  title: string;
  url: string;
  date: string | null;
  excerpt: string;
  image: { src: string; alt?: string; width?: string; height?: string } | null;
  contentType: string;
  topics: string[];
};

type SearchResponse = {
  total: number;
  results: SearchResult[];
  facets: { contentType: FacetValue[]; topic: FacetValue[]; year: FacetValue[]; month: FacetValue[] };
  error?: string;
};

type Filters = {
  q: string;
  types: string[];
  topics: string[];
  year: string;
  month: string;
};

const EMPTY_FACETS: SearchResponse['facets'] = { contentType: [], topic: [], year: [], month: [] };
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/* ------------------------------------------------------------------ helpers */

const formatDate = (iso: string | null): string =>
  iso
    ? new Date(iso).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      })
    : '';

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((v) => v !== value) : [...list, value];

/** Reads ?q / ?year / ?month / ?topic from the page URL once on the client. */
const readUrlFilters = (): Partial<Filters> => {
  if (typeof window === 'undefined') return {};
  const sp = new URLSearchParams(window.location.search);
  return {
    q: sp.get('q') || '',
    year: sp.get('year') || '',
    month: sp.get('month') || '',
    topics: sp.getAll('topic').filter(Boolean),
  };
};

/**
 * Fetches /api/content-search for the given scope and filters, with "load more" paging.
 */
const useContentSearch = (scope: string, pageSize: number, requireQuery = false) => {
  const [filters, setFilters] = useState<Filters>({ q: '', types: [], topics: [], year: '', month: '' });
  const [ready, setReady] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [facets, setFacets] = useState<SearchResponse['facets']>(EMPTY_FACETS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  useEffect(() => {
    setFilters((f) => ({ ...f, ...readUrlFilters() }));
    setReady(true);
  }, []);

  const run = useCallback(
    async (f: Filters, offset: number) => {
      const id = ++requestId.current;
      if (requireQuery && !f.q) {
        // Site search: nothing is listed until the visitor has searched (as on tmx.com's empty search page).
        setResults([]);
        setTotal(0);
        setFacets(EMPTY_FACETS);
        setError('');
        setLoading(false);
        return;
      }
      const sp = new URLSearchParams();
      if (f.q) sp.set('q', f.q);
      const types = scope ? [scope] : f.types;
      types.forEach((t) => sp.append('type', t));
      f.topics.forEach((t) => sp.append('topic', t));
      if (f.year) sp.set('year', f.year);
      if (f.month) sp.set('month', f.month);
      sp.set('offset', String(offset));
      sp.set('limit', String(pageSize));
      setLoading(true);
      try {
        const res = await fetch(`/api/content-search?${sp.toString()}`);
        const data = (await res.json()) as SearchResponse;
        if (id !== requestId.current) return;
        setResults((prev) => (offset ? [...prev, ...(data.results || [])] : data.results || []));
        setTotal(data.total || 0);
        setFacets(data.facets || EMPTY_FACETS);
        setError(data.error || '');
      } catch {
        if (id !== requestId.current) return;
        setError('Search is unavailable right now.');
      } finally {
        if (id === requestId.current) setLoading(false);
      }
    },
    [scope, pageSize, requireQuery]
  );

  useEffect(() => {
    if (ready) run(filters, 0);
  }, [ready, filters, run]);

  return {
    filters,
    setFilters,
    results,
    total,
    facets,
    loading,
    error,
    loadMore: () => run(filters, results.length),
    hasMore: results.length < total,
  };
};

/* ------------------------------------------------------------------ shared bits */

const SearchIcon = (): JSX.Element => (
  <svg className="content-search__icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
    <circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" strokeWidth="2" />
    <line x1="15.5" y1="15.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ResultImage = ({ image, className }: { image: SearchResult['image']; className: string }) =>
  image?.src ? (
    // Result images come from other pages' fields via the search API, not from this datasource.
    // eslint-disable-next-line @next/next/no-img-element
    <img className={className} src={image.src} alt={image.alt || ''} loading="lazy" />
  ) : null;

const ContentSearchEmpty = ({ className, id }: { className: string; id?: string }): JSX.Element => (
  <div className={`component content-search ${className}`} id={id}>
    <div className="component-content">
      <span className="is-empty-hint">Content Search: select a datasource.</span>
    </div>
  </div>
);

const fieldValue = (f?: Field<string>) => (f?.value ? String(f.value) : '');

type TrailLink = { title: string; url: string };

/**
 * The page's breadcrumb trail (Home > ... > this page) and its sibling pages, read from the content tree
 * through /api/content-search?crumbs=<route item id>; no labels in code.
 */
const usePageTrail = (): { crumbs: TrailLink[]; siblings: TrailLink[] } => {
  const { page } = useSitecore();
  const itemId = page?.layout?.sitecore?.route?.itemId;
  const lang = page?.locale;
  const [trail, setTrail] = useState<{ crumbs: TrailLink[]; siblings: TrailLink[] }>({
    crumbs: [],
    siblings: [],
  });
  useEffect(() => {
    if (!itemId) return;
    let alive = true;
    const qs = `crumbs=${encodeURIComponent(itemId)}${lang ? `&lang=${encodeURIComponent(lang)}` : ''}`;
    fetch(`/api/content-search?${qs}`)
      .then((r) => (r.ok ? r.json() : {}))
      .then((d: { crumbs?: TrailLink[]; siblings?: TrailLink[] }) => {
        if (!alive) return;
        setTrail({
          crumbs: Array.isArray(d?.crumbs) ? d.crumbs : [],
          siblings: Array.isArray(d?.siblings) ? d.siblings : [],
        });
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [itemId, lang]);
  return trail;
};

const ChevronIcon = ({ className }: { className: string }): JSX.Element => (
  <svg className={className} viewBox="0 0 10 16" width="7" height="11" aria-hidden="true" focusable="false">
    <path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* Breadcrumb bar above the panel (tmx.com: "Home > Site Search"): ancestors as links, this page as text. */
const PageCrumbs = ({ crumbs }: { crumbs: TrailLink[] }): JSX.Element => (
  <nav className="content-search__crumbs" aria-label="Breadcrumb">
    {crumbs.length > 1 && (
      <ol>
        {crumbs.map((c, i) =>
          i < crumbs.length - 1 ? (
            <li key={c.url + i}>
              <a href={c.url}>{c.title}</a>
              <ChevronIcon className="content-search__crumb-sep" />
            </li>
          ) : (
            <li key={c.url + i} aria-current="page">
              <span>{c.title}</span>
            </li>
          )
        )}
      </ol>
    )}
  </nav>
);

/* ------------------------------------------------------------------ site search (Default / Tmx) */

const SiteSearchView = (
  props: ContentSearchProps & { variantClass: string; showCrumbs?: boolean }
): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fields = props.fields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const scope = fieldValue(fields?.Scope);
  const s = useContentSearch(scope, 10, true);
  const { crumbs } = usePageTrail();
  // Facets and results are the demo's addition (UC6): shown once a search has been made.
  const searched = !!s.filters.q;
  const [input, setInput] = useState('');

  useEffect(() => setInput(s.filters.q), [s.filters.q]);

  if (!fields) return <ContentSearchEmpty className={styles} id={id} />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    s.setFilters((f) => ({ ...f, q: input.trim() }));
  };

  const typeFacet = s.facets.contentType;
  const topicFacet = s.facets.topic;

  return (
    <div
      className={`component content-search content-search--site ${props.variantClass} ${styles}`}
      id={id ? id : undefined}
    >
      <div className="component-content">
        {props.showCrumbs && <PageCrumbs crumbs={crumbs} />}
        <div className="content-search__panel">
          {(isEditing || fields.Title?.value) && (
            <Text tag="h1" field={fields.Title} className="content-search__title" />
          )}
          <form className="content-search__form" role="search" onSubmit={submit}>
            <input
              type="search"
              className="content-search__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={fieldValue(fields.Placeholder)}
              aria-label={fieldValue(fields.Placeholder) || 'Search'}
            />
            <button type="submit" className="content-search__button">
              {isEditing ? <Text field={fields.ButtonText} /> : fieldValue(fields.ButtonText) || 'Search'}
            </button>
          </form>
          {isEditing && (
            <p className="content-search__edit-hint">
              Placeholder: <Text field={fields.Placeholder} />
            </p>
          )}

          {searched && (
          <div className="content-search__body">
            <aside className="content-search__facets" aria-label="Filters">
              {!scope && (
                <fieldset className="content-search__facet">
                  <legend>
                    <Text field={fields.ContentTypeLabel} />
                  </legend>
                  {typeFacet.length === 0 && <p className="content-search__facet-empty">–</p>}
                  {typeFacet.map((f) => (
                    <label key={f.name} className="content-search__check">
                      <input
                        type="checkbox"
                        checked={s.filters.types.includes(f.name)}
                        onChange={() => s.setFilters((x) => ({ ...x, types: toggle(x.types, f.name) }))}
                      />
                      <span>{f.name}</span>
                      <span className="content-search__count">({f.count})</span>
                    </label>
                  ))}
                </fieldset>
              )}
              <fieldset className="content-search__facet">
                <legend>
                  <Text field={fields.TopicLabel} />
                </legend>
                {topicFacet.length === 0 && <p className="content-search__facet-empty">–</p>}
                {topicFacet.map((f) => (
                  <label key={f.name} className="content-search__check">
                    <input
                      type="checkbox"
                      checked={s.filters.topics.includes(f.name)}
                      onChange={() => s.setFilters((x) => ({ ...x, topics: toggle(x.topics, f.name) }))}
                    />
                    <span>{f.name}</span>
                    <span className="content-search__count">({f.count})</span>
                  </label>
                ))}
              </fieldset>
            </aside>

            <div className="content-search__results" aria-live="polite">
              <p className="content-search__summary">
                {s.loading && s.results.length === 0
                  ? 'Searching…'
                  : s.error
                    ? s.error
                    : `${s.total} result${s.total === 1 ? '' : 's'}${s.filters.q ? ` for “${s.filters.q}”` : ''}`}
              </p>
              {s.results.map((r) => (
                <article key={r.id} className="content-search__card">
                  <div className="content-search__card-text">
                    <a className="content-search__card-title" href={r.url}>
                      {r.title}
                    </a>
                    <div className="content-search__card-meta">
                      {r.date && <span>{formatDate(r.date)}</span>}
                      <span className="content-search__badge">{r.contentType}</span>
                      {r.topics.map((t) => (
                        <span key={t} className="content-search__tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    {r.excerpt && <p className="content-search__card-excerpt">{r.excerpt}</p>}
                  </div>
                  <ResultImage image={r.image} className="content-search__card-image" />
                </article>
              ))}
              {s.hasMore && (
                <button
                  type="button"
                  className="content-search__more"
                  onClick={s.loadMore}
                  disabled={s.loading}
                >
                  Load more
                </button>
              )}
            </div>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ContentSearchProps): JSX.Element => (
  <SiteSearchView {...props} variantClass="content-search--default" />
);

export const Tmx = (props: ContentSearchProps): JSX.Element => (
  <SiteSearchView {...props} variantClass="content-search--tmx" showCrumbs />
);

/* ------------------------------------------------------------------ press releases */

export const TmxPressReleases = (props: ContentSearchProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fields = props.fields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const scope = fieldValue(fields?.Scope) || 'Press Releases';
  const s = useContentSearch(scope, 20);
  const { crumbs, siblings } = usePageTrail();
  const years = s.facets.year;
  const latestYear = years[0]?.name || '';
  const { setFilters } = s;

  // tmx.com opens on the latest year (its months listed under it); the visitor picks another year or a month.
  useEffect(() => {
    if (latestYear) setFilters((f) => (f.year ? f : { ...f, year: latestYear, month: '' }));
  }, [latestYear, setFilters]);

  if (!fields) return <ContentSearchEmpty className={styles} id={id} />;

  const openYear = s.filters.year;
  const selectYear = (year: string) => s.setFilters((f) => ({ ...f, year, month: '' }));
  const selectMonth = (e: React.MouseEvent, month: string) => {
    e.preventDefault();
    s.setFilters((f) => ({ ...f, month }));
  };
  const showNewsroom = isEditing || siblings.length > 0;

  return (
    <div
      className={`component content-search content-search--press-releases ${styles}`}
      id={id ? id : undefined}
    >
      <div className="component-content">
        <PageCrumbs crumbs={crumbs} />
        <div className="content-search__pr-layout">
          <div className="content-search__panel content-search__pr-main">
            {(isEditing || fields.Title?.value) && (
              <Text tag="h1" field={fields.Title} className="content-search__title" />
            )}
            {s.loading && s.results.length === 0 && <p className="content-search__summary">Loading…</p>}
            {!s.loading && s.results.length === 0 && (
              <p className="content-search__summary">{s.error || 'There are no press releases to show.'}</p>
            )}
            <ul className="content-search__pr-list">
              {s.results.map((r) => (
                <li key={r.id} className="content-search__pr-item">
                  {r.date && <div className="content-search__pr-date">{formatDate(r.date)}</div>}
                  <a className="content-search__pr-title" href={r.url}>
                    {r.title}
                  </a>
                  {r.excerpt && <p className="content-search__pr-excerpt">{r.excerpt}</p>}
                </li>
              ))}
            </ul>
            {s.hasMore && (
              <button
                type="button"
                className="content-search__more"
                onClick={s.loadMore}
                disabled={s.loading}
              >
                {isEditing ? <Text field={fields.ButtonText} /> : fieldValue(fields.ButtonText) || 'Load more'}
              </button>
            )}
          </div>

          <aside className="content-search__pr-sidebar">
            <div className="content-search__pr-card">
              <ul className="content-search__years">
                {years.map((y) => {
                  const open = openYear === y.name;
                  return (
                    <li key={y.name} className={open ? 'is-open' : ''}>
                      <button
                        type="button"
                        className={`content-search__year ${open ? 'is-active' : ''}`}
                        onClick={() => selectYear(y.name)}
                        aria-expanded={open}
                      >
                        {y.name}
                      </button>
                      {open && (
                        <ul className="content-search__months">
                          <li>
                            <a
                              href={`?year=${y.name}`}
                              className={`content-search__month ${!s.filters.month ? 'is-active' : ''}`}
                              onClick={(e) => selectMonth(e, '')}
                            >
                              All months
                            </a>
                          </li>
                          {s.facets.month.map((m) => (
                            <li key={m.name}>
                              <a
                                href={`?year=${y.name}&month=${m.name}`}
                                className={`content-search__month ${s.filters.month === m.name ? 'is-active' : ''}`}
                                onClick={(e) => selectMonth(e, m.name)}
                              >
                                {MONTHS[Number(m.name) - 1] || m.name}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
            {showNewsroom && (
              <div className="content-search__pr-card content-search__newsroom">
                <h2 className="content-search__newsroom-title">
                  {isEditing ? <Text field={fields.ContentTypeLabel} /> : fieldValue(fields.ContentTypeLabel)}
                  <ChevronIcon className="content-search__newsroom-chevron" />
                </h2>
                <ul>
                  {siblings.map((l) => (
                    <li key={l.url}>
                      <a href={l.url}>{l.title}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ POV list */

export const TmxPovList = (props: ContentSearchProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const fields = props.fields;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const scope = fieldValue(fields?.Scope) || 'POV';
  const s = useContentSearch(scope, 3);
  const [input, setInput] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => setInput(s.filters.q), [s.filters.q]);
  useEffect(() => setCategory(s.filters.topics[0] || ''), [s.filters.topics]);

  if (!fields) return <ContentSearchEmpty className={styles} id={id} />;

  const apply = (e?: React.FormEvent) => {
    e?.preventDefault();
    s.setFilters((f) => ({ ...f, q: input.trim(), topics: category ? [category] : [] }));
  };
  const reset = () => {
    setInput('');
    setCategory('');
    s.setFilters((f) => ({ ...f, q: '', topics: [] }));
  };

  return (
    <div className={`component content-search content-search--pov ${styles}`} id={id ? id : undefined}>
      <div className="component-content">
        {(isEditing || fields.Title?.value) && (
          <Text tag="h2" field={fields.Title} className="content-search__title" />
        )}
        <form className="content-search__pov-form" role="search" onSubmit={apply}>
          <div className="content-search__pov-search">
            <SearchIcon />
            <input
              type="search"
              className="content-search__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={fieldValue(fields.Placeholder)}
              aria-label={fieldValue(fields.Placeholder) || 'Search'}
            />
          </div>
          <div className="content-search__pov-controls">
            <select
              className="content-search__select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              aria-label={fieldValue(fields.TopicLabel) || 'Category'}
            >
              <option value="">{fieldValue(fields.TopicLabel)}</option>
              {s.facets.topic.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
            <button type="submit" className="content-search__pov-button">
              {isEditing ? <Text field={fields.ButtonText} /> : fieldValue(fields.ButtonText) || 'Filter'}
            </button>
            <button type="button" className="content-search__pov-button" onClick={reset}>
              Reset
            </button>
          </div>
          {isEditing && (
            <p className="content-search__edit-hint">
              Placeholder: <Text field={fields.Placeholder} /> · Category label:{' '}
              <Text field={fields.TopicLabel} />
            </p>
          )}
        </form>

        <div className="content-search__pov-list" aria-live="polite">
          {s.loading && s.results.length === 0 && <p className="content-search__summary">Loading…</p>}
          {!s.loading && s.results.length === 0 && (
            <p className="content-search__summary">{s.error || 'No articles match your search.'}</p>
          )}
          {s.results.map((r) => (
            <article key={r.id} className="content-search__pov-row">
              <a href={r.url} className="content-search__pov-image" tabIndex={-1} aria-hidden="true">
                <ResultImage image={r.image} className="" />
              </a>
              <div className="content-search__pov-text">
                <a className="content-search__pov-title" href={r.url}>
                  {r.title}
                </a>
                <div className="content-search__pov-meta">
                  <span>
                    {r.date && <span className="content-search__pov-date">{formatDate(r.date)}</span>}
                    {r.topics[0] && (
                      <>
                        <span className="content-search__pov-sep">|</span>
                        <span>{r.topics[0]}</span>
                      </>
                    )}
                  </span>
                  <span className="content-search__pov-kind">
                    {fieldValue(fields.ContentTypeLabel) || 'Article'}
                  </span>
                </div>
                {r.excerpt && <p className="content-search__pov-excerpt">{r.excerpt}</p>}
              </div>
            </article>
          ))}
        </div>
        {/* tmx.com always shows LOAD MORE under the list; it is disabled when every article is listed. */}
        <div className="content-search__pov-more">
          <button
            type="button"
            className="content-search__more"
            onClick={s.loadMore}
            disabled={s.loading || !s.hasMore}
          >
            Load more
          </button>
        </div>
      </div>
    </div>
  );
};
