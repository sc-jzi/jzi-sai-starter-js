'use client';

import { JSX } from 'react';
import { ImageField, Link, LinkField, NextImage, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { signOut, usePortalData } from 'lib/portal/use-portal-data';

/**
 * PortalHeader: the My Machine top bar - the logo on its orange block (linking to Link) on a dark bar; when the visitor
 * is signed in, their name and Sign out on the right, and under the bar the portal navigation: the pages picked in
 * Navigation (My Machine pages, by their NavigationTitle), the current one underlined. Used in the Portal Header partial.
 */

interface NavPage {
  id?: string;
  url?: string;
  name?: string;
  fields?: { NavigationTitle?: { value?: string }; Title?: { value?: string } };
}

interface HeaderFields {
  Logo?: ImageField;
  Link?: LinkField;
  Navigation?: NavPage[];
}

type PortalHeaderProps = ComponentProps & { fields?: HeaderFields };

const PortalHeaderView = ({ props, look }: { props: PortalHeaderProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  // the account menu is not shown on the sign-in page itself (no session there)
  const onLoginPage = `${page?.layout?.sitecore?.route?.name ?? ''}`.toLowerCase() === 'login';
  const { data } = usePortalData(isEditing, false, !onLoginPage);
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const nav = Array.isArray(f.Navigation) ? f.Navigation : [];
  const current = `${page?.layout?.sitecore?.route?.itemId ?? ''}`.replace(/[^0-9a-f]/gi, '').toLowerCase();
  const logo = <NextImage field={f.Logo} width={143} height={38} className="portal-header__logo" priority />;

  return (
    <header className={`component portal-header portal-header--${look} ${styles}`} id={id ? id : undefined}>
      <div className="portal-header__brand">
        {!isEditing && f.Link?.value?.href ? (
          <Link field={f.Link} className="portal-header__home" aria-label="Bobcat home">
            {logo}
          </Link>
        ) : (
          logo
        )}
      </div>
      {data && (
        <div className="portal-header__account">
          <span className="portal-header__user">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7" fill="currentColor" />
            </svg>
            {data.profile.firstName} {data.profile.lastName}
          </span>
          {!isEditing && (
            <button type="button" className="portal-header__signout" onClick={() => signOut()}>
              Sign out
            </button>
          )}
        </div>
      )}
      {(isEditing || !!data) && nav.length > 0 && (
        <nav className="portal-header__nav" aria-label="My Machine">
          <ul>
            {nav.map((p) => {
              const active = `${p.id ?? ''}`.replace(/[^0-9a-f]/gi, '').toLowerCase() === current;
              return (
                <li key={p.id}>
                  <a href={p.url} className={active ? 'is-active' : undefined} aria-current={active ? 'page' : undefined}>
                    {p.fields?.NavigationTitle?.value || p.fields?.Title?.value || p.name}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
};

export const Default = (props: PortalHeaderProps): JSX.Element => <PortalHeaderView props={props} look="default" />;

/* Bobcat: the dark My Machine bar with the logo on an orange block */
export const Bobcat = (props: PortalHeaderProps): JSX.Element => <PortalHeaderView props={props} look="bobcat" />;
