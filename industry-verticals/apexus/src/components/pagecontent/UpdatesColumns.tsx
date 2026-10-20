'use client';

import { JSX } from 'react';
import {
  Field,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { useApexusAudience } from 'src/lib/apexus-audience';

interface UpdatesColumnItem {
  id: string;
  heading?: { jsonValue?: Field<string> };
  body?: { jsonValue?: RichTextField };
  link?: { jsonValue?: LinkField };
}

interface UpdatesColumnsFields {
  data?: {
    datasource?: {
      title?: { jsonValue?: Field<string> };
      children?: { results?: UpdatesColumnItem[] };
    };
  };
}

export type UpdatesColumnsProps = ComponentProps & {
  fields: UpdatesColumnsFields;
};

const AUDIENCE_COLUMNS: Record<
  string,
  { heading: string; body: string; link: string; href: string; external?: boolean }[]
> = {
  manufacturer: [
    {
      heading: 'Articles and Updates',
      body: '<p><a href="/about-us/articles-and-updates/expert-tip-from-apexus-may-2025">Expert Tip: Working with TPA\'s</a><br />May 14, 2025</p><p><a href="/about-us/articles-and-updates/compliance-issues-requiring-repayment-to-manufacturers">Compliance Issues Requiring Repayment to Manufacturers</a></p>',
      link: 'View all Articles',
      href: '/about-us/articles-and-updates',
    },
    {
      heading: 'EVENTS',
      body: '<p><a href="https://na.eventscloud.com/ereg/newreg.php?eventid=872144&amp;language=eng">340B University</a><br />November 16, 2026</p><p><a href="https://www.apexus.com/340b-program-integrity-practicum-understand-financial-impact">340B Program Integrity Practicum: Understand Financial Impact</a><br />November 5, 2026</p>',
      link: 'View all Events',
      href: '/events',
    },
    {
      heading: 'Fast Facts',
      body: '<ul><li>More than 70 manufacturers supported</li><li>Nearly 390,000 refunds processed</li><li>Nearly 19,000 covered entities reached</li><li>Over 99% of refund dollars accepted, with refunds not accepted returned to manufacturer</li></ul>',
      link: 'Request More Information',
      href: 'https://info.340bpvp.com/l/543422/2026-03-25/8zfdhf',
      external: true,
    },
  ],
  'covered-entity': [
    {
      heading: 'Articles and Updates',
      body: '<p><a href="/apexus-refund-services/covered-entity-refund-service/questions-and-guides">Common Questions, Guides, and Case Studies</a><br />July 1, 2026</p><p><a href="/about-us/articles-and-updates/expert-tip-resolve-negative-340b-accumulations">Expert Tip: Resolve Negative 340B Accumulations</a></p><p><a href="/about-us/articles-and-updates/compliance-issues-requiring-repayment-to-manufacturers">Compliance Issues Requiring Repayment to Manufacturers</a></p>',
      link: 'View all Articles',
      href: '/about-us/articles-and-updates',
    },
    {
      heading: 'EVENTS',
      body: '<p><a href="https://na.eventscloud.com/ereg/index.php?eventid=894439">FY27 Update: HRSA 340B Audit Data Request List (DRL)</a><br />October 28, 2026</p><p><a href="https://www.apexus.com/340b-program-integrity-practicum-understand-financial-impact">340B Program Integrity Practicum: Understand Financial Impact</a><br />November 5, 2026</p>',
      link: 'View all Events',
      href: '/events',
    },
    {
      heading: 'Guides and Case Studies',
      body: '<p><a href="https://340bopais.hrsa.gov/SearchMfr" target="_blank" rel="noopener">340B OPAIS (Manufacturer Search)</a></p><p><a href="https://data.medicaid.gov/dataset/9fcb14ec-d5f0-536e-9938-3f0024531e5b" target="_blank" rel="noopener">MDRP Manufacturer Contacts</a></p>',
      link: 'Common Questions, Guides, and Case Studies',
      href: '/apexus-refund-services/covered-entity-refund-service/questions-and-guides',
    },
  ],
};

const UpdatesColumnsEmpty = (): JSX.Element => (
  <div className="component updates-columns">
    <div className="container">
      <span className="is-empty-hint">Updates columns</span>
    </div>
  </div>
);

const UpdatesColumnsBody = ({
  props,
  variantClass,
}: {
  props: UpdatesColumnsProps;
  variantClass: string;
}): JSX.Element => {
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const datasource = props.fields?.data?.datasource;
  if (!datasource) return <UpdatesColumnsEmpty />;

  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const columns = datasource.children?.results ?? [];
  const audience = useApexusAudience();
  const homeUpdates = datasource.title?.jsonValue?.value === 'FIND OUT MORE ABOUT APEXUS';
  const personalized =
    !isPageEditing && homeUpdates && audience ? AUDIENCE_COLUMNS[audience] ?? null : null;

  return (
    <div
      className={`component updates-columns ${variantClass} ${sxaStyles}`}
      id={id ? id : undefined}
    >
      <div className="updates-columns-inner">
        {(isPageEditing || datasource.title?.jsonValue?.value) && (
          <Text tag="h2" field={datasource.title?.jsonValue} className="updates-columns-title" />
        )}
        <div className="updates-columns-row">
          {personalized
            ? personalized.map((column) => (
                <div key={column.heading} className="updates-column">
                  <h5 className="updates-column-heading">{column.heading}</h5>
                  <div
                    className="updates-column-body"
                    dangerouslySetInnerHTML={{ __html: column.body }}
                  />
                  <div className="updates-column-footer">
                    <a href={column.href} target={column.external ? '_blank' : undefined} rel={column.external ? 'noopener noreferrer' : undefined}>
                      {column.link}
                    </a>
                  </div>
                </div>
              ))
            : columns.map((column) => (
            <div key={column.id} className="updates-column">
              {(isPageEditing || column.heading?.jsonValue?.value) && (
                <Text tag="h5" field={column.heading?.jsonValue} className="updates-column-heading" />
              )}
              <div className="updates-column-body">
                <RichText field={column.body?.jsonValue} />
              </div>
              {(isPageEditing || column.link?.jsonValue?.value?.href) && (
                <div className="updates-column-footer">
                  <Link field={column.link?.jsonValue as LinkField} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: UpdatesColumnsProps): JSX.Element => (
  <UpdatesColumnsBody props={props} variantClass="" />
);

/* Apexus variant: cyan band, centered uppercase white title, three equal white cards with divider lines */
export const Apexus = (props: UpdatesColumnsProps): JSX.Element => (
  <UpdatesColumnsBody props={props} variantClass="variant-apexus" />
);
