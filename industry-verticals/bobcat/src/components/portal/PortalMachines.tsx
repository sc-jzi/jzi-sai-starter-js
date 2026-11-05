'use client';

import { JSX } from 'react';
import { Link, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { formatPortalDate, usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalMachines: "My Machines" - one card per owned machine from the My Machine API (photo, type, model, serial, year,
 * engine hours with progress to the next service, last service, warranty and recalls, model details link). Title, Text
 * and an optional Link (e.g. register a machine) are authored; the machine values are example data.
 * BobcatDetailed (the My Machines page) adds each machine's service history.
 */

type PortalMachinesProps = ComponentProps & { fields?: PortalSectionFields };

const PortalMachinesView = ({ props, look }: { props: PortalMachinesProps; look: 'default' | 'bobcat' | 'detailed' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample } = usePortalData(isEditing);

  return (
    <PortalBlock
      name="machines"
      fields={f}
      isEditing={isEditing}
      source={data?.source}
      sample={sample}
      id={props.params?.RenderingIdentifier}
      styles={`portal-machines--${look} ${props.params?.styles || ''}`}
      aside={(isEditing || !!f.Link?.value?.href) && <Link field={f.Link as LinkField} className="bobcat-arrow-link" />}
    >
      {!data ? (
        <PortalLoading />
      ) : (
        <div className="portal-machines__grid">
          {data.owned.map((m) => {
            const due = Math.max(m.nextServiceAtHours - m.hours, 0);
            const progress = Math.min(100, Math.round((m.hours / m.nextServiceAtHours) * 100));
            return (
              <article className="portal-machine" key={m.id}>
                <div className="portal-machine__media">
                  {/* eslint-disable-next-line @next/next/no-img-element -- product catalog image from the (simulated) API */}
                  <img src={m.image} alt={m.imageAlt} className="portal-machine__image" loading="lazy" />
                </div>
                <div className="portal-machine__body">
                  <p className="portal-machine__type">{m.type}</p>
                  <h3 className="portal-machine__model">{m.model}</h3>
                  <dl className="portal-machine__facts">
                    <div>
                      <dt>Serial no.</dt>
                      <dd>{m.serialNumber}</dd>
                    </div>
                    <div>
                      <dt>Model year</dt>
                      <dd>{m.year}</dd>
                    </div>
                    <div>
                      <dt>Engine hours</dt>
                      <dd>{m.hours.toLocaleString('en-US')} h</dd>
                    </div>
                    <div>
                      <dt>Last service</dt>
                      <dd>{formatPortalDate(m.lastService)}</dd>
                    </div>
                  </dl>
                  <div className="portal-machine__service">
                    <div className="portal-machine__service-row">
                      <span>{m.nextServiceLabel}</span>
                      <strong>in {due.toLocaleString('en-US')} h</strong>
                    </div>
                    <div className="portal-machine__bar" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
                      <span style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  <ul className="portal-machine__status">
                    <li className={m.warranty.status === 'active' ? 'is-ok' : 'is-muted'}>
                      {m.warranty.label}: {m.warranty.status === 'active' ? 'active until' : 'ended'}{' '}
                      {formatPortalDate(m.warranty.until)}
                    </li>
                    <li className={m.openRecalls ? 'is-alert' : 'is-ok'}>
                      {m.openRecalls ? `${m.openRecalls} open recall(s)` : 'No open recalls'}
                    </li>
                  </ul>
                  {look === 'detailed' && m.serviceHistory.length > 0 && (
                    <div className="portal-machine__history">
                      <h4>Service history</h4>
                      <table>
                        <thead>
                          <tr>
                            <th scope="col">Date</th>
                            <th scope="col">Hours</th>
                            <th scope="col">Work</th>
                            <th scope="col">By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {m.serviceHistory.map((h) => (
                            <tr key={`${h.date}-${h.hours}`}>
                              <td>{formatPortalDate(h.date)}</td>
                              <td>{h.hours.toLocaleString('en-US')} h</td>
                              <td>{h.work}</td>
                              <td>{h.by}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  <a className="bobcat-arrow-link portal-machine__link" href={m.detailsUrl} target="_blank" rel="noreferrer">
                    Model details
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalMachinesProps): JSX.Element => <PortalMachinesView props={props} look="default" />;

/* Bobcat: white cards on the light grey band, photo on top, service progress bar in Bobcat orange */
export const Bobcat = (props: PortalMachinesProps): JSX.Element => <PortalMachinesView props={props} look="bobcat" />;

/* BobcatDetailed: the My Machines page - one machine per row with its service history table */
export const BobcatDetailed = (props: PortalMachinesProps): JSX.Element => (
  <PortalMachinesView props={props} look="detailed" />
);
