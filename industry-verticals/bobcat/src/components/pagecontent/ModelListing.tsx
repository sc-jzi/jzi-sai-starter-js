'use client';

import { JSX, useMemo, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { plainText, toJsonLd } from 'lib/json-ld';

/**
 * ModelListing: model cards (children) with a filter column built from the children's values:
 * Category, rated operating capacity bucket, horsepower bucket and lift path, each with a count.
 * Apply filters the cards in the browser; Compare ticks up to three models (illustrative, no compare page).
 * Horsepower and OperatingCapacity hold plain numbers (the units are added here).
 *
 * Other machine types (excavators, tractors): when the listing's Spec1Label is filled, each card shows up to three specs
 * (SpecNLabel / SpecNUnit on the listing, SpecN a plain number on each model), every labelled spec gets a Min-Max range
 * filter, and GroupLabel / Group2Label add checkbox filters built from each model's Group / Group2 value.
 *
 * The models are also written as schema.org JSON-LD: an ItemList of Products (name, image, description, the card's specs
 * as additionalProperty, the "Starting at" price as an Offer when it is a dollar amount, the details link when absolute).
 */

type JsonField<T> = { jsonValue?: T };

export interface ModelItem {
  id: string;
  image?: JsonField<ImageField>;
  badges?: JsonField<Field<string>>;
  model?: JsonField<Field<string>>;
  price?: JsonField<Field<string>>;
  text?: JsonField<RichTextField>;
  horsepower?: JsonField<Field<string>>;
  operatingCapacity?: JsonField<Field<string>>;
  attachments?: JsonField<Field<string>>;
  category?: JsonField<Field<string>>;
  liftPath?: JsonField<Field<string>>;
  spec1?: JsonField<Field<string>>;
  spec2?: JsonField<Field<string>>;
  spec3?: JsonField<Field<string>>;
  group?: JsonField<Field<string>>;
  group2?: JsonField<Field<string>>;
  quoteLink?: JsonField<LinkField>;
  detailsLink?: JsonField<LinkField>;
}

interface ListingFields {
  id?: string;
  title?: JsonField<Field<string>>;
  applyLabel?: JsonField<Field<string>>;
  guideLink?: JsonField<LinkField>;
  alternativeText?: JsonField<Field<string>>;
  alternativeLink?: JsonField<LinkField>;
  spec1Label?: JsonField<Field<string>>;
  spec1Unit?: JsonField<Field<string>>;
  spec2Label?: JsonField<Field<string>>;
  spec2Unit?: JsonField<Field<string>>;
  spec3Label?: JsonField<Field<string>>;
  spec3Unit?: JsonField<Field<string>>;
  groupLabel?: JsonField<Field<string>>;
  group2Label?: JsonField<Field<string>>;
  children?: { results?: ModelItem[] };
}

export type ModelListingProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: ListingFields;
    };
  };
};

type Look = 'default' | 'bobcat' | 'bobcat-light';
type FilterKey = string;
type Filters = Record<FilterKey, string[]>;
type SpecKey = 'spec1' | 'spec2' | 'spec3';
type Ranges = Partial<Record<SpecKey, { min: string; max: string }>>;
type Spec = { key: SpecKey; label: string; unit: string; labelField?: Field<string> };

const EMPTY_FILTERS: Filters = {};
const MAX_COMPARE = 3;
const SPEC_KEYS: SpecKey[] = ['spec1', 'spec2', 'spec3'];

/**
 * The ComponentQuery reads each child's own fields as a list (`fields(ownFields: true) { name jsonValue }`) to stay within
 * Experience Edge's query-depth limit; this turns that list into the keyed shape used below (FieldName -> fieldName).
 */
type ChildFieldList = { id: string; fields?: { name: string; jsonValue?: unknown }[] };
const keyedChild = (child: ModelItem & ChildFieldList): ModelItem => {
  if (!Array.isArray(child.fields)) return child;
  const keyed: Record<string, unknown> = { id: child.id };
  for (const f of child.fields) {
    if (f?.name)
      keyed[f.name.charAt(0).toLowerCase() + f.name.slice(1)] = { jsonValue: f.jsonValue };
  }
  return keyed as unknown as ModelItem;
};

/** The listing's own fields come as the same list (same query-depth reason); its children stay as they are. */
const keyedListing = (ds?: ListingFields & Partial<ChildFieldList>): ListingFields | undefined => {
  if (!ds || !Array.isArray(ds.fields)) return ds;
  const keyed = keyedChild(ds as unknown as ModelItem & ChildFieldList) as unknown as ListingFields;
  return { ...keyed, children: ds.children };
};

const str = (f?: JsonField<Field<string>>) => `${f?.jsonValue?.value ?? ''}`.trim();
const num = (f?: JsonField<Field<string>>) => {
  const n = Number(str(f).replace(/,/g, ''));
  return Number.isFinite(n) && str(f) !== '' ? n : null;
};

const rocBucket = (roc: number | null): string | null => {
  if (roc === null) return null;
  if (roc < 2400) return 'under-2400';
  if (roc < 3400) return '2400-3400';
  return '3400-plus';
};

const hpBucket = (hp: number | null): string | null => {
  if (hp === null) return null;
  if (hp <= 70) return 'up-to-70';
  if (hp <= 90) return '71-90';
  return '91-plus';
};

/** One filter group: its options in first-seen order with counts and a readable label. */
const buildGroup = (
  items: ModelItem[],
  keyOf: (m: ModelItem) => string | null,
  labelOf: (key: string, members: ModelItem[]) => string
) => {
  const map = new Map<string, ModelItem[]>();
  for (const item of items) {
    const key = keyOf(item);
    if (!key) continue;
    map.set(key, [...(map.get(key) ?? []), item]);
  }
  return [...map.entries()].map(([key, members]) => ({
    key,
    label: labelOf(key, members),
    count: members.length,
  }));
};

const range = (values: number[], unit: string, plus = false) => {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (plus) return `${Math.floor(min / 100) * 100} ${unit}+`;
  return min === max ? `${min} ${unit}` : `${min}-${max} ${unit}`;
};

const productListJsonLd = (title: string, items: ModelItem[], specs: Spec[] | null): string | null => {
  const products = items
    .filter((m) => str(m.model))
    .map((m, i) => {
      const price = str(m.price);
      const amount = price.startsWith('$') ? Number(price.replace(/[^0-9.]/g, '')) : NaN;
      const url = m.detailsLink?.jsonValue?.value?.href ?? '';
      const properties = specs
        ? specs.map((s) => ({ name: s.label.replace(/:\s*$/, ''), value: str(m[s.key]), unitText: s.unit }))
        : [
            { name: 'Horsepower', value: str(m.horsepower), unitText: 'hp' },
            { name: 'Rated Operating Capacity', value: str(m.operatingCapacity), unitText: 'lbs' },
            { name: 'Compatible Attachments', value: str(m.attachments) },
          ];
      return {
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'Product',
          name: str(m.model),
          brand: { '@type': 'Brand', name: 'Bobcat' },
          image: m.image?.jsonValue?.value?.src,
          description: plainText(m.text?.jsonValue?.value as string | undefined),
          url: /^https?:\/\//.test(url) ? url : '',
          additionalProperty: properties.filter((p) => p.value).map((p) => ({ '@type': 'PropertyValue', ...p })),
          offers: Number.isFinite(amount) && amount > 0 ? { '@type': 'Offer', price: amount, priceCurrency: 'USD' } : undefined,
        },
      };
    });
  if (!products.length) return null;
  return toJsonLd({ '@context': 'https://schema.org', '@type': 'ItemList', name: title, itemListElement: products });
};

const ModelCard = ({
  item,
  specs,
  isEditing,
  compared,
  compareDisabled,
  onCompare,
}: {
  item: ModelItem;
  specs: Spec[] | null;
  isEditing: boolean;
  compared: boolean;
  compareDisabled: boolean;
  onCompare: (on: boolean) => void;
}): JSX.Element => {
  const badges = str(item.badges)
    .split(',')
    .map((b) => b.trim())
    .filter(Boolean);
  const hp = str(item.horsepower);
  const roc = str(item.operatingCapacity);
  const att = str(item.attachments);

  return (
    <div className="model-card">
      <div className="model-card__media">
        {isEditing ? (
          <div className="model-card__badges">
            <span className="model-card__badge">
              <Text field={item.badges?.jsonValue} />
            </span>
          </div>
        ) : (
          badges.length > 0 && (
            <div className="model-card__badges">
              {badges.map((b) => (
                <span
                  key={b}
                  className={`model-card__badge ${b.toLowerCase() === 'new' ? 'is-new' : ''}`}
                >
                  {b}
                </span>
              ))}
            </div>
          )
        )}
        {(isEditing || !!item.image?.jsonValue?.value?.src) && (
          <NextImage
            field={item.image?.jsonValue}
            width={360}
            height={240}
            className="model-card__image"
          />
        )}
      </div>
      <h3 className="model-card__model">
        <Text field={item.model?.jsonValue} />
      </h3>
      {(isEditing || !!str(item.price)) && (
        <div className="model-card__price">
          <span className="model-card__price-label">Starting at</span>
          <span className="model-card__price-value">
            <Text field={item.price?.jsonValue} />
          </span>
        </div>
      )}
      {(isEditing || !!item.text?.jsonValue?.value) && (
        <RichText field={item.text?.jsonValue} className="model-card__text" />
      )}
      {specs ? (
        <dl className="model-card__specs">
          {specs.map((s) =>
            isEditing || str(item[s.key]) ? (
              <div className="model-card__spec" key={s.key}>
                <dt>{s.label}</dt>
                <dd>
                  <Text field={item[s.key]?.jsonValue} /> {s.unit}
                </dd>
              </div>
            ) : null
          )}
          {isEditing && (
            <>
              <div className="model-card__spec">
                <dt>Group:</dt>
                <dd>
                  <Text field={item.group?.jsonValue} />
                </dd>
              </div>
              <div className="model-card__spec">
                <dt>Group 2:</dt>
                <dd>
                  <Text field={item.group2?.jsonValue} />
                </dd>
              </div>
            </>
          )}
        </dl>
      ) : (
      <dl className="model-card__specs">
        {(isEditing || hp) && (
          <div className="model-card__spec">
            <dt>Horsepower:</dt>
            <dd>
              <Text field={item.horsepower?.jsonValue} /> hp
            </dd>
          </div>
        )}
        {(isEditing || roc) && (
          <div className="model-card__spec">
            <dt>ROC:</dt>
            <dd>
              <Text field={item.operatingCapacity?.jsonValue} /> lbs
            </dd>
          </div>
        )}
        {(isEditing || att) && (
          <div className="model-card__spec">
            <dt>Compatible Attachments:</dt>
            <dd>
              <Text field={item.attachments?.jsonValue} />
            </dd>
          </div>
        )}
        {isEditing && (
          <>
            <div className="model-card__spec">
              <dt>Category:</dt>
              <dd>
                <Text field={item.category?.jsonValue} />
              </dd>
            </div>
            <div className="model-card__spec">
              <dt>Lift path:</dt>
              <dd>
                <Text field={item.liftPath?.jsonValue} />
              </dd>
            </div>
          </>
        )}
      </dl>
      )}
      <div className="model-card__actions">
        {(isEditing || !!item.quoteLink?.jsonValue?.value?.href) && (
          <Link
            field={item.quoteLink?.jsonValue as LinkField}
            className="bobcat-button bobcat-button--block"
          />
        )}
        {(isEditing || !!item.detailsLink?.jsonValue?.value?.href) && (
          <Link
            field={item.detailsLink?.jsonValue as LinkField}
            className="bobcat-button bobcat-button--block"
          />
        )}
      </div>
      {!isEditing && (
        <label className="model-card__compare">
          <input
            type="checkbox"
            checked={compared}
            disabled={compareDisabled && !compared}
            onChange={(e) => onCompare(e.target.checked)}
          />
          <span>Compare</span>
        </label>
      )}
    </div>
  );
};

const ModelListingView = ({
  props,
  look,
}: {
  props: ModelListingProps;
  look: Look;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const datasource = useMemo(
    () => keyedListing(props.fields?.data?.datasource),
    [props.fields?.data?.datasource]
  );
  const items = useMemo(
    () =>
      (datasource?.children?.results ?? []).map((c) => keyedChild(c as ModelItem & ChildFieldList)),
    [datasource]
  );

  const [pending, setPending] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [pendingRange, setPendingRange] = useState<Ranges>({});
  const [appliedRange, setAppliedRange] = useState<Ranges>({});
  const [compare, setCompare] = useState<string[]>([]);
  const [closed, setClosed] = useState<FilterKey[]>([]);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  // Other machine types: the listing names its specs (see the header comment); loaders keep the fixed filters.
  const specs: Spec[] | null = str(datasource?.spec1Label)
    ? SPEC_KEYS.map((key) => {
        const label = datasource?.[`${key}Label` as const];
        return {
          key,
          label: str(label),
          unit: str(datasource?.[`${key}Unit` as const]),
          labelField: label?.jsonValue,
        };
      }).filter((s) => s.label)
    : null;

  const keyOf: Record<FilterKey, (m: ModelItem) => string | null> = specs
    ? {
        group: (m) => str(m.group) || null,
        group2: (m) => str(m.group2) || null,
      }
    : {
        category: (m) => str(m.category) || null,
        roc: (m) => rocBucket(num(m.operatingCapacity)),
        hp: (m) => hpBucket(num(m.horsepower)),
        liftPath: (m) => str(m.liftPath) || null,
      };

  const groups = useMemo(
    () =>
      specs
        ? [
            { key: 'group', title: str(datasource?.groupLabel) },
            { key: 'group2', title: str(datasource?.group2Label) },
          ]
            .filter((g) => g.title)
            .map((g) => ({ ...g, options: buildGroup(items, keyOf[g.key], (k) => k) }))
        : [
      {
        key: 'category' as FilterKey,
        title: 'Category',
        options: buildGroup(items, keyOf.category, (k) => k),
      },
      {
        key: 'roc' as FilterKey,
        title: 'Rated Operating Capacity (ROC)',
        options: buildGroup(items, keyOf.roc, (k, members) => {
          const values = members.map((m) => num(m.operatingCapacity) as number);
          if (k === 'under-2400') return `${Math.floor(Math.min(...values) / 100) * 100}-2400 lbs`;
          if (k === '2400-3400') return '2400-3400 lbs';
          return range(values, 'lbs', true);
        }),
      },
      {
        key: 'hp' as FilterKey,
        title: 'Horsepower (HP)',
        options: buildGroup(items, keyOf.hp, (_k, members) =>
          range(
            members.map((m) => num(m.horsepower) as number),
            'HP'
          )
        ),
      },
      {
        key: 'liftPath' as FilterKey,
        title: 'Lift Path',
        options: buildGroup(items, keyOf.liftPath, (k) => k),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [items, datasource]
  );

  if (!datasource) {
    return (
      <div className={`component model-listing ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Model Listing: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  // sorted by rated operating capacity (loaders) or the first named spec (a plain number field, as the filters use it);
  // models without one go last
  const sortValue = (m: ModelItem) => (specs ? num(m.spec1) : num(m.operatingCapacity));
  const byRoc = (a: ModelItem, b: ModelItem) => {
    const x = sortValue(a);
    const y = sortValue(b);
    if (x === null) return y === null ? 0 : 1;
    if (y === null) return -1;
    return sort === 'asc' ? x - y : y - x;
  };
  const inRange = (item: ModelItem) =>
    SPEC_KEYS.every((k) => {
      const r = appliedRange[k];
      if (!r || (r.min === '' && r.max === '')) return true;
      const v = num(item[k]);
      if (v === null) return false;
      return (r.min === '' || v >= Number(r.min)) && (r.max === '' || v <= Number(r.max));
    });
  const visible = isEditing
    ? items
    : [...items].sort(byRoc).filter(
        (item) =>
          inRange(item) &&
          (Object.keys(applied) as FilterKey[]).every((k) => {
            const chosen = applied[k] ?? [];
            if (!chosen.length) return true;
            const key = keyOf[k]?.(item);
            return !!key && chosen.includes(key);
          })
      );

  const togglePending = (k: FilterKey, option: string, on: boolean) =>
    setPending((p) => {
      const now = p[k] ?? [];
      return { ...p, [k]: on ? [...now, option] : now.filter((o) => o !== option) };
    });
  const setRange = (k: SpecKey, end: 'min' | 'max', value: string) =>
    setPendingRange((r) => ({ ...r, [k]: { min: '', max: '', ...r[k], [end]: value } }));
  const toggleClosed = (key: string) =>
    setClosed((c) => (c.includes(key) ? c.filter((k) => k !== key) : [...c, key]));

  const applyLabel = datasource.applyLabel?.jsonValue;
  const pageTitle = `${(page?.layout?.sitecore?.route?.fields?.Title as Field<string> | undefined)?.value ?? ''}`.trim();
  const jsonLd = isEditing ? null : productListJsonLd(pageTitle || str(datasource.title), items, specs);

  return (
    <div
      className={`component model-listing model-listing--${look} ${styles}`}
      id={id ? id : undefined}
    >
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />}
      <div className="model-listing__band">
        <div className="model-listing__inner">
          {(isEditing || !!datasource.title?.jsonValue?.value) && (
            <h2 className="model-listing__heading">
              <Text field={datasource.title?.jsonValue} />
            </h2>
          )}
          <div className="model-listing__toolbar">
            <div className="model-listing__toolbar-col">
              {!isEditing && (
                <p className="model-listing__count">
                  {specs ? (
                    <>
                      <span className="model-listing__count-num">{visible.length}</span>{' '}
                      {visible.length === 1 ? 'Result' : 'Results'}
                    </>
                  ) : (
                    <>
                      {visible.length} {visible.length === 1 ? 'Machine' : 'Machines'}
                    </>
                  )}
                </p>
              )}
              {(isEditing || !!datasource.guideLink?.jsonValue?.value?.href) && (
                <Link
                  field={datasource.guideLink?.jsonValue as LinkField}
                  className="model-listing__toolbar-link"
                />
              )}
            </div>
            {(isEditing ||
              !!datasource.alternativeText?.jsonValue?.value ||
              !!datasource.alternativeLink?.jsonValue?.value?.href) && (
              <div className="model-listing__toolbar-col">
                {(isEditing || !!datasource.alternativeText?.jsonValue?.value) && (
                  <p className="model-listing__count">
                    <Text field={datasource.alternativeText?.jsonValue} />
                  </p>
                )}
                {(isEditing || !!datasource.alternativeLink?.jsonValue?.value?.href) && (
                  <Link
                    field={datasource.alternativeLink?.jsonValue as LinkField}
                    className="model-listing__toolbar-link"
                  />
                )}
              </div>
            )}
            {!isEditing && (
              <div className="model-listing__toolbar-col model-listing__toolbar-col--sort">
                {specs && <p className="model-listing__sort-label">Sort By</p>}
                <div className="model-listing__sort-box">
                  <button
                    type="button"
                    className="model-listing__sort"
                    onClick={() => setSort((v) => (v === 'asc' ? 'desc' : 'asc'))}
                  >
                    {specs ? specs[0].label : 'ROC'} ({sort === 'asc' ? 'Low to High' : 'High to Low'})
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="model-listing__layout">
            <aside className="model-listing__filters" aria-label="Filters">
              {specs?.map((s) => (
                <div
                  className={`model-listing__filter${closed.includes(s.key) ? ' is-closed' : ''}`}
                  key={s.key}
                >
                  <button
                    type="button"
                    className="model-listing__filter-title"
                    aria-expanded={!closed.includes(s.key)}
                    onClick={() => toggleClosed(s.key)}
                  >
                    {isEditing ? <Text field={s.labelField} /> : s.label}
                  </button>
                  <div className="model-listing__filter-options model-listing__range" hidden={closed.includes(s.key)}>
                    <input
                      type="number"
                      className="model-listing__range-input"
                      placeholder="Min"
                      aria-label={`${s.label} minimum`}
                      value={pendingRange[s.key]?.min ?? ''}
                      onChange={(e) => setRange(s.key, 'min', e.target.value)}
                    />
                    <span>to</span>
                    <input
                      type="number"
                      className="model-listing__range-input"
                      placeholder="Max"
                      aria-label={`${s.label} maximum`}
                      value={pendingRange[s.key]?.max ?? ''}
                      onChange={(e) => setRange(s.key, 'max', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              {groups.map((group) =>
                group.options.length ? (
                  <div
                    className={`model-listing__filter${closed.includes(group.key) ? ' is-closed' : ''}`}
                    key={group.key}
                  >
                    <button
                      type="button"
                      className="model-listing__filter-title"
                      aria-expanded={!closed.includes(group.key)}
                      onClick={() => toggleClosed(group.key)}
                    >
                      {group.title}
                    </button>
                    <div
                      className="model-listing__filter-options"
                      hidden={closed.includes(group.key)}
                    >
                      {group.options.map((o) => (
                        <label className="model-listing__check" key={o.key}>
                          <input
                            type="checkbox"
                            checked={(pending[group.key] ?? []).includes(o.key)}
                            onChange={(e) => togglePending(group.key, o.key, e.target.checked)}
                          />
                          <span>
                            {o.label} ({o.count})
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ) : null
              )}
              {isEditing ? (
                <div className="bobcat-button model-listing__apply">
                  <Text field={applyLabel} />
                </div>
              ) : (
                <button
                  type="button"
                  className="bobcat-button model-listing__apply"
                  onClick={() => {
                    setApplied(pending);
                    setAppliedRange(pendingRange);
                  }}
                >
                  {applyLabel?.value || 'Apply'}
                </button>
              )}
            </aside>
            <div className="model-listing__results">
              {visible.length === 0 && (
                <p className="model-listing__none">No models match these filters.</p>
              )}
              <div className="model-listing__grid">
                {visible.map((item) => (
                  <ModelCard
                    key={item.id}
                    item={item}
                    specs={specs}
                    isEditing={isEditing}
                    compared={compare.includes(item.id)}
                    compareDisabled={compare.length >= MAX_COMPARE}
                    onCompare={(on) =>
                      setCompare((c) =>
                        on ? [...c, item.id].slice(0, MAX_COMPARE) : c.filter((x) => x !== item.id)
                      )
                    }
                  />
                ))}
              </div>
              {compare.length > 0 && !isEditing && (
                <div className="model-listing__compare-bar" role="status">
                  Comparing {compare.length} of {MAX_COMPARE} models
                  <button
                    type="button"
                    className="model-listing__compare-clear"
                    onClick={() => setCompare([])}
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Default = (props: ModelListingProps): JSX.Element => (
  <ModelListingView props={props} look="default" />
);

export const Bobcat = (props: ModelListingProps): JSX.Element => (
  <ModelListingView props={props} look="bobcat" />
);

/* BobcatLight: the excavator and tractor pages' Models band, light grey with a dark title-case heading. */
export const BobcatLight = (props: ModelListingProps): JSX.Element => (
  <ModelListingView props={props} look="bobcat-light" />
);
