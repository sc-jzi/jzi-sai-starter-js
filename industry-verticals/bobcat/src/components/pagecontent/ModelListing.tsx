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

/**
 * ModelListing: model cards (children) with a filter column built from the children's values:
 * Category, rated operating capacity bucket, horsepower bucket and lift path, each with a count.
 * Apply filters the cards in the browser; Compare ticks up to three models (illustrative, no compare page).
 * Horsepower and OperatingCapacity hold plain numbers (the units are added here).
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
  quoteLink?: JsonField<LinkField>;
  detailsLink?: JsonField<LinkField>;
}

export type ModelListingProps = ComponentProps & {
  fields: {
    data?: {
      datasource?: {
        id?: string;
        title?: JsonField<Field<string>>;
        applyLabel?: JsonField<Field<string>>;
        guideLink?: JsonField<LinkField>;
        alternativeText?: JsonField<Field<string>>;
        alternativeLink?: JsonField<LinkField>;
        children?: { results?: ModelItem[] };
      };
    };
  };
};

type Look = 'default' | 'bobcat';
type FilterKey = 'category' | 'roc' | 'hp' | 'liftPath';
type Filters = Record<FilterKey, string[]>;

const EMPTY_FILTERS: Filters = { category: [], roc: [], hp: [], liftPath: [] };
const MAX_COMPARE = 3;

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

const ModelCard = ({
  item,
  isEditing,
  compared,
  compareDisabled,
  onCompare,
}: {
  item: ModelItem;
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
  const datasource = props.fields?.data?.datasource;
  const items = useMemo(
    () =>
      (datasource?.children?.results ?? []).map((c) => keyedChild(c as ModelItem & ChildFieldList)),
    [datasource]
  );

  const [pending, setPending] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);
  const [compare, setCompare] = useState<string[]>([]);
  const [closed, setClosed] = useState<FilterKey[]>([]);
  const [sort, setSort] = useState<'asc' | 'desc'>('asc');

  const keyOf: Record<FilterKey, (m: ModelItem) => string | null> = {
    category: (m) => str(m.category) || null,
    roc: (m) => rocBucket(num(m.operatingCapacity)),
    hp: (m) => hpBucket(num(m.horsepower)),
    liftPath: (m) => str(m.liftPath) || null,
  };

  const groups = useMemo(
    () => [
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
    [items]
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

  // sorted by rated operating capacity (a plain number field, as the filters use it); models without one go last
  const byRoc = (a: ModelItem, b: ModelItem) => {
    const x = num(a.operatingCapacity);
    const y = num(b.operatingCapacity);
    if (x === null) return y === null ? 0 : 1;
    if (y === null) return -1;
    return sort === 'asc' ? x - y : y - x;
  };
  const visible = isEditing
    ? items
    : [...items].sort(byRoc).filter((item) =>
        (Object.keys(applied) as FilterKey[]).every((k) => {
          const chosen = applied[k];
          if (!chosen.length) return true;
          const key = keyOf[k](item);
          return !!key && chosen.includes(key);
        })
      );

  const togglePending = (k: FilterKey, option: string, on: boolean) =>
    setPending((p) => ({ ...p, [k]: on ? [...p[k], option] : p[k].filter((o) => o !== option) }));

  const applyLabel = datasource.applyLabel?.jsonValue;

  return (
    <div
      className={`component model-listing model-listing--${look} ${styles}`}
      id={id ? id : undefined}
    >
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
                  {visible.length} {visible.length === 1 ? 'Machine' : 'Machines'}
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
                <div className="model-listing__sort-box">
                  <button
                    type="button"
                    className="model-listing__sort"
                    onClick={() => setSort((v) => (v === 'asc' ? 'desc' : 'asc'))}
                  >
                    ROC ({sort === 'asc' ? 'Low to High' : 'High to Low'})
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="model-listing__layout">
            <aside className="model-listing__filters" aria-label="Filters">
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
                      onClick={() =>
                        setClosed((c) =>
                          c.includes(group.key)
                            ? c.filter((k) => k !== group.key)
                            : [...c, group.key]
                        )
                      }
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
                            checked={pending[group.key].includes(o.key)}
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
                  onClick={() => setApplied(pending)}
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
