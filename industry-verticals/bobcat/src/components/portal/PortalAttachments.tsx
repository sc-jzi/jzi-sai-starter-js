'use client';

import { JSX } from 'react';
import { Link, LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { PortalBlock, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalAttachments: compatible attachments from the product catalog (via the My Machine API), one row per machine
 * type - the considered machine first, then the owned machines - each with a "browse all" link. Title, Text and an
 * optional Link are authored; the lists are example data.
 */

type PortalAttachmentsProps = ComponentProps & { fields?: PortalSectionFields };

const PortalAttachmentsView = ({ props, look }: { props: PortalAttachmentsProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample } = usePortalData(isEditing);

  return (
    <PortalBlock
      name="attachments"
      fields={f}
      isEditing={isEditing}
      source={data?.source}
      sample={sample}
      id={props.params?.RenderingIdentifier}
      styles={`portal-attachments--${look} ${props.params?.styles || ''}`}
      aside={(isEditing || !!f.Link?.value?.href) && <Link field={f.Link as LinkField} className="bobcat-arrow-link" />}
    >
      {!data ? (
        <PortalLoading />
      ) : (
        data.attachments.map((g) => (
          <div className="portal-attachments__group" key={g.forModel}>
            <div className="portal-attachments__group-head">
              <h3 className="portal-attachments__for">
                For your {g.forModel} <span>{g.machineType}</span>
              </h3>
              <a className="bobcat-arrow-link" href={g.browseUrl} target="_blank" rel="noreferrer">
                All {g.machineType.toLowerCase()} attachments
              </a>
            </div>
            <ul className="portal-attachments__list">
              {g.items.map((a) => (
                <li key={a.name}>
                  <a href={a.href} target="_blank" rel="noreferrer" className="portal-attachment">
                    {/* eslint-disable-next-line @next/next/no-img-element -- product catalog image from the (simulated) API */}
                    <img src={a.image} alt={a.imageAlt} loading="lazy" className="portal-attachment__image" />
                    <span className="portal-attachment__name">{a.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </PortalBlock>
  );
};

export const Default = (props: PortalAttachmentsProps): JSX.Element => <PortalAttachmentsView props={props} look="default" />;

/* Bobcat: four knockout attachment tiles a row on white, condensed names, orange "all attachments" link */
export const Bobcat = (props: PortalAttachmentsProps): JSX.Element => <PortalAttachmentsView props={props} look="bobcat" />;
