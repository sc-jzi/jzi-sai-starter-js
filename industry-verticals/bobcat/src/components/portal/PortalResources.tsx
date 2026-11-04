'use client';

import { JSX } from 'react';
import { Link, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { formatPortalDate, usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalResources: manuals, maintenance and warranty/service information per owned machine (documents from the product
 * catalog, warranty and service status from the dealer system, via the My Machine API), then general owner resources.
 * Title, Text and an optional Link (e.g. book a service) are authored; the values are example data.
 */

type PortalResourcesProps = ComponentProps & { fields?: PortalSectionFields };

const DocIcon = (): JSX.Element => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M6 2h9l5 5v15H6z" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M14 2v6h6M9 13h8M9 17h8" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

const PortalResourcesView = ({ props, look }: { props: PortalResourcesProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample } = usePortalData(isEditing);

  return (
    <PortalBlock
      name="resources"
      fields={f}
      isEditing={isEditing}
      source={data?.source}
      sample={sample}
      id={props.params?.RenderingIdentifier}
      styles={`portal-resources--${look} ${props.params?.styles || ''}`}
      aside={(isEditing || !!f.Link?.value?.href) && <Link field={f.Link as LinkField} className="bobcat-button" />}
    >
      {!data ? (
        <PortalLoading />
      ) : (
        <div className="portal-resources__grid">
          {data.resources.map((r) => {
            const machine = data.owned.find((m) => m.model === r.forModel);
            return (
              <div className="portal-resources__machine" key={r.forModel}>
                <h3 className="portal-resources__model">{r.forModel}</h3>
                {machine && (
                  <p className="portal-resources__warranty">
                    <span className={`portal-dot ${machine.warranty.status === 'active' ? 'is-ok' : 'is-muted'}`} />
                    {machine.warranty.status === 'active'
                      ? `Warranty active until ${formatPortalDate(machine.warranty.until)}`
                      : `Warranty ended ${formatPortalDate(machine.warranty.until)} · extended coverage available from your dealer`}
                  </p>
                )}
                <ul className="portal-resources__links">
                  {r.links.map((l) => (
                    <li key={l.label}>
                      <a href={l.href} target="_blank" rel="noreferrer">
                        <DocIcon />
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          <div className="portal-resources__machine portal-resources__machine--general">
            <h3 className="portal-resources__model">Owner resources</h3>
            <ul className="portal-resources__links">
              {data.ownerResources.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer">
                    <DocIcon />
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalResourcesProps): JSX.Element => <PortalResourcesView props={props} look="default" />;

/* Bobcat: one column per machine on white, document links with icons, warranty status dot */
export const Bobcat = (props: PortalResourcesProps): JSX.Element => <PortalResourcesView props={props} look="bobcat" />;
