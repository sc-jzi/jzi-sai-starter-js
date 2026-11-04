'use client';

import { JSX } from 'react';
import { Link, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalDealer: the owner's assigned dealer from the CRM (via the My Machine API) - name, address, phone, website and
 * directions - with the authored contact paths: Link (e.g. Contact dealer) and SecondaryLink (e.g. Find another dealer).
 * The dealer is a real Bobcat dealer; the assignment is example data.
 */

type PortalDealerProps = ComponentProps & { fields?: PortalSectionFields };

const Icon = ({ d }: { d: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d={d} fill="currentColor" />
  </svg>
);
const PIN = 'M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z';
const PHONE = 'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.6a1 1 0 0 1-.25 1z';
const GLOBE = 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.9a15.7 15.7 0 0 0-1.4-3.6A8 8 0 0 1 18.9 8zM12 4c.8 1.2 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.8 1.9-4zM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4zm.8 2h2.9c.3 1.3.8 2.5 1.4 3.6A8 8 0 0 1 5.1 16zM8 8H5.1a8 8 0 0 1 4.3-3.6C8.8 5.5 8.3 6.7 8 8zm4 12c-.8-1.2-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.8-1.9 4zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4zm.3 5.6c.6-1.1 1.1-2.3 1.4-3.6h2.9a8 8 0 0 1-4.3 3.6zm1.7-5.6a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4z';

const PortalDealerView = ({ props, look }: { props: PortalDealerProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample } = usePortalData(isEditing);
  const d = data?.dealer;

  return (
    <PortalBlock
      name="dealer"
      fields={f}
      isEditing={isEditing}
      source={data?.source}
      sample={sample}
      id={props.params?.RenderingIdentifier}
      styles={`portal-dealer--${look} ${props.params?.styles || ''}`}
    >
      {!d ? (
        <PortalLoading />
      ) : (
        <div className="portal-dealer__card">
          <div className="portal-dealer__info">
            <p className="portal-dealer__label">Your Bobcat dealer</p>
            <h3 className="portal-dealer__name">{d.name}</h3>
            <ul className="portal-dealer__lines">
              <li>
                <Icon d={PIN} />
                <span>
                  {d.street}, {d.city}, {d.region} {d.postalCode}
                </span>
              </li>
              <li>
                <Icon d={PHONE} />
                <a href={`tel:${d.phone}`}>{d.phone}</a>
              </li>
              <li>
                <Icon d={GLOBE} />
                <a href={d.website} target="_blank" rel="noreferrer">
                  {d.website.replace(/^https?:\/\/|\/$/g, '')}
                </a>
              </li>
            </ul>
          </div>
          <div className="portal-dealer__actions">
            {(isEditing || !!f.Link?.value?.href) && <Link field={f.Link as LinkField} className="bobcat-button" />}
            <a className="bobcat-button bobcat-button--secondary" href={`tel:${d.phone}`}>
              Call {d.phone}
            </a>
            <a className="bobcat-arrow-link" href={d.directionsUrl} target="_blank" rel="noreferrer">
              Get directions
            </a>
            <a className="bobcat-arrow-link" href={d.dealerPageUrl} target="_blank" rel="noreferrer">
              Dealer page
            </a>
            {(isEditing || !!f.SecondaryLink?.value?.href) && (
              <Link field={f.SecondaryLink as LinkField} className="bobcat-arrow-link" />
            )}
          </div>
        </div>
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalDealerProps): JSX.Element => <PortalDealerView props={props} look="default" />;

/* Bobcat: dark dealer card with orange icons, contact buttons on the right */
export const Bobcat = (props: PortalDealerProps): JSX.Element => <PortalDealerView props={props} look="bobcat" />;
