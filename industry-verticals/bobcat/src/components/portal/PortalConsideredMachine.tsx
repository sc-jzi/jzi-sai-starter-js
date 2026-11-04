'use client';

import { JSX, useState } from 'react';
import { Link, LinkField, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ConsideredStatus } from 'lib/portal/my-machine-data';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { formatPortalDate, usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalConsideredMachine: the machine the owner is considering (from the CRM via the My Machine API) with its status
 * badges - Saved, Recommended by the dealer, Quote pending - photo, summary and key specs. ActionLabel is the "request a
 * quote" button (POST /api/portal/quote turns the status to Quote pending); Link (e.g. Build & Quote) and SecondaryLink
 * are authored links. The machine values are example data.
 */

type PortalConsideredMachineProps = ComponentProps & { fields?: PortalSectionFields };

const STATUS_LABEL: Record<ConsideredStatus, string> = {
  saved: 'Saved',
  recommended: 'Recommended',
  pending: 'Quote pending',
};

const PortalConsideredMachineView = ({
  props,
  look,
}: {
  props: PortalConsideredMachineProps;
  look: 'default' | 'bobcat';
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample, reload } = usePortalData(isEditing);
  const [busy, setBusy] = useState(false);
  const m = data?.considered;
  const pending = !!m?.statuses.includes('pending');

  const requestQuote = async () => {
    if (isEditing || busy) return;
    setBusy(true);
    await fetch('/api/portal/quote', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
    setBusy(false);
    reload();
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
      {!m ? (
        <PortalLoading />
      ) : (
        <article className="portal-considered__card">
          <div className="portal-considered__media">
            {/* eslint-disable-next-line @next/next/no-img-element -- product catalog image from the (simulated) API */}
            <img src={m.image} alt={m.imageAlt} className="portal-considered__image" loading="lazy" />
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
              Saved {formatPortalDate(m.savedOn)}
              {m.statuses.includes('recommended') && <> · Recommended by {m.recommendedBy}</>}
            </p>
            <p className="portal-considered__summary">{m.summary}</p>
            <dl className="portal-considered__specs">
              {m.specs.map((s) => (
                <div key={s.label}>
                  <dt>{s.label}</dt>
                  <dd>{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="portal-considered__actions">
              {(isEditing || !!f.ActionLabel?.value) && (
                <button type="button" className="bobcat-button portal-considered__quote" onClick={requestQuote} disabled={busy || pending}>
                  {isEditing ? <Text field={f.ActionLabel} /> : pending ? 'Quote requested' : `${f.ActionLabel?.value}`}
                </button>
              )}
              {(isEditing || !!f.Link?.value?.href) && <Link field={f.Link as LinkField} className="bobcat-button bobcat-button--secondary" />}
              {(isEditing || !!f.SecondaryLink?.value?.href) && (
                <Link field={f.SecondaryLink as LinkField} className="bobcat-arrow-link" />
              )}
              <a className="bobcat-arrow-link" href={m.detailsUrl} target="_blank" rel="noreferrer">
                Model details
              </a>
            </div>
          </div>
        </article>
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalConsideredMachineProps): JSX.Element => (
  <PortalConsideredMachineView props={props} look="default" />
);

/* Bobcat: one wide card, machine photo left on white, status pills (orange Recommended, dark Saved, amber Quote pending) */
export const Bobcat = (props: PortalConsideredMachineProps): JSX.Element => (
  <PortalConsideredMachineView props={props} look="bobcat" />
);
