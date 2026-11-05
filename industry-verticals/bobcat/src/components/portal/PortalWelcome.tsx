'use client';

import { JSX } from 'react';
import { Link, LinkField, RichText, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { ExampleDataTag, PortalLoading, PortalSectionFields } from 'lib/portal/ui';
import { usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalWelcome: the dashboard's opening band - the authored greeting (Title) followed by the owner's first name, the
 * intro (Text), the account summary from the My Machine API (company, location, customer since, machine count) and an
 * optional link (Link). The account values are example data.
 */

type PortalWelcomeProps = ComponentProps & { fields?: PortalSectionFields };

const PortalWelcomeView = ({ props, look }: { props: PortalWelcomeProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const { data, sample } = usePortalData(isEditing);
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();

  return (
    <section className={`component portal-welcome portal-welcome--${look} ${styles}`} id={id ? id : undefined}>
      <div className="portal-welcome__inner">
        <div className="portal-welcome__text">
          <h1 className="portal-welcome__title">
            <Text field={f.Title} />
            {data && <span className="portal-welcome__name"> {data.profile.firstName}</span>}
          </h1>
          {(isEditing || !!f.Text?.value) && <RichText field={f.Text} className="portal-welcome__intro" />}
          {(isEditing || !!f.Link?.value?.href) && (
            <Link field={f.Link as LinkField} className="bobcat-arrow-link portal-welcome__link" />
          )}
        </div>
        <div className="portal-welcome__account">
          {data ? (
            <>
              <ExampleDataTag source={data.source} sample={sample} />
              <dl>
                <div>
                  <dt>Company</dt>
                  <dd>{data.profile.company}</dd>
                </div>
                <div>
                  <dt>Location</dt>
                  <dd>{data.profile.city}</dd>
                </div>
                <div>
                  <dt>Customer since</dt>
                  <dd>{data.profile.customerSince}</dd>
                </div>
                <div>
                  <dt>Machines</dt>
                  <dd>{data.owned.length} owned · {data.considered.length} considered</dd>
                </div>
              </dl>
            </>
          ) : (
            <PortalLoading />
          )}
        </div>
      </div>
    </section>
  );
};

export const Default = (props: PortalWelcomeProps): JSX.Element => <PortalWelcomeView props={props} look="default" />;

/* Bobcat: dark band, 44px greeting with the owner's name in orange, account summary card on the right */
export const Bobcat = (props: PortalWelcomeProps): JSX.Element => <PortalWelcomeView props={props} look="bobcat" />;
