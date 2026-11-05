'use client';

import { JSX, useState } from 'react';
import { Link, LinkField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ConsideredMachine, ConsideredStatus } from 'lib/portal/my-machine-data';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { formatPortalDate, usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalConsideredMachine: the machines the owner is considering - the Product pages they saved (Save on the product
 * page) with their status badges: Saved, Recommended (the dealer recommends that model, from the CRM) and Quote pending.
 * Photo, summary and highlights come from the Product page in Sitecore; the statuses are example data. ActionLabel is the
 * "request a quote" button (POST /api/portal/quote); Link (e.g. Build & Quote) and SecondaryLink are authored links.
 * Without saved machines it shows an empty state that points to the equipment pages.
 * Variants: Default and Bobcat (dashboard cards), BobcatList (Saved Machines page: compact rows with Remove).
 */

type PortalConsideredMachineProps = ComponentProps & { fields?: PortalSectionFields };

const STATUS_LABEL: Record<ConsideredStatus, string> = {
  saved: 'Saved',
  recommended: 'Recommended',
  pending: 'Quote pending',
};

const BROWSE_URL = '/equipment/excavators/compact-excavators';

const PortalConsideredMachineView = ({
  props,
  look,
}: {
  props: PortalConsideredMachineProps;
  look: 'default' | 'bobcat' | 'list';
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample, reload } = usePortalData(isEditing);
  const [busy, setBusy] = useState('');
  const list = look === 'list';

  const call = async (url: string, method: 'POST' | 'DELETE', productId: string) => {
    if (isEditing || busy) return;
    setBusy(productId);
    await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    }).catch(() => undefined);
    setBusy('');
    reload();
  };

  const card = (m: ConsideredMachine) => {
    const pending = m.statuses.includes('pending');
    return (
      <article key={m.id} className="portal-considered__card">
        <div className="portal-considered__media">
          {m.image && (
            // eslint-disable-next-line @next/next/no-img-element -- product image from the catalog lookup
            <img src={m.image} alt={m.imageAlt} className="portal-considered__image" loading="lazy" />
          )}
        </div>
        <div className="portal-considered__body">
          <ul className="portal-considered__badges" aria-label="Status">
            {m.statuses.map((s) => (
              <li key={s} className={`portal-status portal-status--${s}`}>
                {STATUS_LABEL[s]}
              </li>
            ))}
          </ul>
          <p className="portal-considered__type">{m.type}</p>
          <h3 className="portal-considered__model">{m.model}</h3>
          <p className="portal-considered__meta">
            {m.savedOn && <>Saved {formatPortalDate(m.savedOn)}</>}
            {m.recommendedBy && <> · Recommended by {m.recommendedBy}</>}
          </p>
          {!list && m.summary && <p className="portal-considered__summary">{m.summary}</p>}
          {!list && m.highlights.length > 0 && (
            <ul className="portal-considered__highlights">
              {m.highlights.map((h) => (
                <li key={h}>{h}</li>
              ))}
            </ul>
          )}
          <div className="portal-considered__actions">
            {(isEditing || !!f.ActionLabel?.value) && (
              <button
                type="button"
                className="bobcat-button portal-considered__quote"
                onClick={() => call('/api/portal/quote', 'POST', m.id)}
                disabled={!!busy || pending}
              >
                {isEditing ? <Text field={f.ActionLabel} /> : pending ? 'Quote requested' : `${f.ActionLabel?.value}`}
              </button>
            )}
            {!list && (isEditing || !!f.Link?.value?.href) && (
              <Link field={f.Link as LinkField} className="bobcat-button bobcat-button--secondary" />
            )}
            <a className="bobcat-arrow-link" href={m.detailsUrl}>
              Model details
            </a>
            {list && (
              <button
                type="button"
                className="portal-considered__remove"
                onClick={() => call('/api/portal/saved', 'DELETE', m.id)}
                disabled={!!busy}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </article>
    );
  };

  return (
    <PortalBlock
      name="considered"
      fields={f}
      isEditing={isEditing}
      source={data?.source}
      sample={sample}
      id={props.params?.RenderingIdentifier}
      styles={`portal-considered--${look} ${props.params?.styles || ''}`}
    >
      {!data ? (
        <PortalLoading />
      ) : data.considered.length === 0 ? (
        <div className="portal-considered__empty">
          <p>You have not saved any machines yet. Use Save to My Machine on a product page and it shows up here.</p>
          <a className="bobcat-button" href={BROWSE_URL}>
            Browse compact excavators
          </a>
        </div>
      ) : (
        <div className="portal-considered__list">{data.considered.map(card)}</div>
      )}
      {(isEditing || !!f.SecondaryLink?.value?.href) && (
        <p className="portal-considered__more">
          <Link field={f.SecondaryLink as LinkField} className="bobcat-arrow-link" />
        </p>
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalConsideredMachineProps): JSX.Element => (
  <PortalConsideredMachineView props={props} look="default" />
);

/* Bobcat: wide cards, machine photo left on white, status pills (orange Recommended, dark Saved, amber Quote pending) */
export const Bobcat = (props: PortalConsideredMachineProps): JSX.Element => (
  <PortalConsideredMachineView props={props} look="bobcat" />
);

/* BobcatList: the Saved Machines page - compact rows (photo, statuses, model) with Request a quote and Remove */
export const BobcatList = (props: PortalConsideredMachineProps): JSX.Element => (
  <PortalConsideredMachineView props={props} look="list" />
);
