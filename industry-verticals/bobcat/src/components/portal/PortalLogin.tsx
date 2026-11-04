'use client';

import { FormEvent, JSX, useState } from 'react';
import { Field, ImageField, Link, LinkField, NextImage, Text, useSitecore } from '@sitecore-content-sdk/nextjs';
import { identity } from '@sitecore-content-sdk/events';
import { ComponentProps } from 'lib/component-props';

/**
 * PortalLogin: the My Machine sign-in card over a full-width photo (shown in black and white). Username and password go to
 * POST /api/portal/login (hashed demo account, signed session cookie); on success the browser sends a Sitecore identity
 * event (the visitor becomes a known owner for personalization) and goes to returnUrl or the datasource's Redirect link.
 * Every label, link and the background photo are datasource fields.
 */

interface LoginFields {
  Title?: Field<string>;
  UsernameLabel?: Field<string>;
  PasswordLabel?: Field<string>;
  SubmitLabel?: Field<string>;
  ErrorText?: Field<string>;
  ForgotLink?: LinkField;
  UnlockLink?: LinkField;
  HelpLink?: LinkField;
  RedirectLink?: LinkField;
  BackgroundImage?: ImageField;
}

type PortalLoginProps = ComponentProps & { fields?: LoginFields };

const str = (f?: Field<unknown>) => `${f?.value ?? ''}`.trim();

/** Only a path on this site may be a returnUrl (no open redirect). */
const safeReturn = (value: string | null): string | null =>
  value && value.startsWith('/') && !value.startsWith('//') ? value : null;

const EyeIcon = ({ open }: { open: boolean }): JSX.Element => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" fill="none" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
    {!open && <path d="M3 3l18 18" stroke="currentColor" strokeWidth="2" />}
  </svg>
);

const PortalLoginView = ({ props, look }: { props: PortalLoginProps; look: 'default' | 'bobcat' }): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const f = props.fields ?? {};
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (isEditing || busy) return;
    setBusy(true);
    setError(false);
    try {
      const res = await fetch('/api/portal/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('login failed');
      const { profile } = (await res.json()) as {
        profile?: { email: string; firstName: string; lastName: string; company: string };
      };
      // Identity first: it ties this visitor's browsing to the owner. It rejects outside a deployed site (development,
      // editing), which never blocks the sign-in.
      if (profile?.email) {
        try {
          await identity({
            channel: 'WEB',
            currency: 'USD',
            language: page?.locale || 'en',
            email: profile.email,
            firstName: profile.firstName,
            lastName: profile.lastName,
            identifiers: [{ id: profile.email, provider: 'email' }],
            extensionData: { source: 'My Machine portal', company: profile.company },
          } as Parameters<typeof identity>[0]);
        } catch (err) {
          console.debug('Portal login: identity event not sent', err);
        }
      }
      const target =
        safeReturn(new URLSearchParams(window.location.search).get('returnUrl')) ||
        f.RedirectLink?.value?.href ||
        window.location.pathname.replace(/\/login\/?$/i, '');
      window.location.assign(target);
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <div className={`component portal-login portal-login--${look} ${styles}`} id={id ? id : undefined}>
      {(isEditing || !!f.BackgroundImage?.value?.src) && (
        <div className="portal-login__photo">
          <NextImage field={f.BackgroundImage} width={1920} height={760} className="portal-login__image" priority />
        </div>
      )}
      <form className="portal-login__card" onSubmit={submit} noValidate>
        <h1 className="portal-login__title">
          <Text field={f.Title} />
        </h1>
        <label className="portal-login__label" htmlFor="portal-username">
          <Text field={f.UsernameLabel} />
        </label>
        <input
          id="portal-username"
          className="portal-login__input"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isEditing}
          required
        />
        <label className="portal-login__label" htmlFor="portal-password">
          <Text field={f.PasswordLabel} />
        </label>
        <div className="portal-login__password">
          <input
            id="portal-password"
            className="portal-login__input"
            type={show ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isEditing}
            required
          />
          <button
            type="button"
            className="portal-login__eye"
            aria-label={show ? 'Hide password' : 'Show password'}
            onClick={() => setShow((s) => !s)}
          >
            <EyeIcon open={!show} />
          </button>
        </div>
        {(isEditing || error) && (
          <p className="portal-login__error" role="alert">
            <Text field={f.ErrorText} />
          </p>
        )}
        <button type="submit" className="portal-login__submit" disabled={busy || (!isEditing && (!username || !password))}>
          {isEditing ? <Text field={f.SubmitLabel} /> : str(f.SubmitLabel) || 'Sign in'}
        </button>
        <div className="portal-login__links">
          {[f.ForgotLink, f.UnlockLink, f.HelpLink].map((link, i) =>
            isEditing || link?.value?.href ? <Link key={i} field={link as LinkField} className="portal-login__link" /> : null
          )}
        </div>
        {isEditing && (
          <p className="portal-login__hint">
            After sign-in: <Link field={f.RedirectLink as LinkField} /> (or the page the visitor came from)
          </p>
        )}
      </form>
    </div>
  );
};

export const Default = (props: PortalLoginProps): JSX.Element => <PortalLoginView props={props} look="default" />;

/* Bobcat: the My Machine sign-in (white card on a black-and-white jobsite photo, orange Sign in button, orange links) */
export const Bobcat = (props: PortalLoginProps): JSX.Element => <PortalLoginView props={props} look="bobcat" />;
