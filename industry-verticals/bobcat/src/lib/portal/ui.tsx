'use client';

import { JSX, ReactNode } from 'react';
import { Field, LinkField, RichText, RichTextField, Text } from '@sitecore-content-sdk/nextjs';

/**
 * Shared pieces of the My Machine portal blocks: the "Example data" tag that marks everything coming from the simulated
 * My Machine API, and the block frame (authorable heading and intro from the datasource, then the read-only data).
 */

export type PortalSectionFields = {
  Title?: Field<string>;
  Text?: RichTextField;
  Link?: LinkField;
  SecondaryLink?: LinkField;
  ActionLabel?: Field<string>;
};

export const ExampleDataTag = ({ source, sample }: { source?: string; sample?: boolean }): JSX.Element => (
  <span
    className="portal-example-tag"
    title={`${source || 'Simulated My Machine API'}${sample ? ' (sample shown in Pages)' : ''}`}
  >
    <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7v4M8 4.5v.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
    Example data
  </span>
);

export const PortalBlock = ({
  name,
  fields,
  isEditing,
  source,
  sample,
  id,
  styles,
  aside,
  children,
}: {
  name: string;
  fields?: PortalSectionFields;
  isEditing: boolean;
  source?: string;
  sample?: boolean;
  id?: string;
  styles?: string;
  aside?: ReactNode;
  children: ReactNode;
}): JSX.Element => (
  <section className={`component portal-block portal-${name} ${styles ?? ''}`} id={id || undefined}>
    <div className="portal-block__inner">
      <header className="portal-block__header">
        <div className="portal-block__heading">
          {(isEditing || !!fields?.Title?.value) && (
            <h2 className="portal-block__title">
              <Text field={fields?.Title} />
            </h2>
          )}
          <ExampleDataTag source={source} sample={sample} />
        </div>
        {aside}
      </header>
      {(isEditing || !!fields?.Text?.value) && <RichText field={fields?.Text} className="portal-block__intro" />}
      {children}
    </div>
  </section>
);

export const PortalLoading = (): JSX.Element => (
  <div className="portal-block__loading" aria-busy="true">
    <span />
    <span />
    <span />
  </div>
);
