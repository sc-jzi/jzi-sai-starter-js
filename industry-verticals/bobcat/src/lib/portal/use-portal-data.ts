'use client';

import { useEffect, useState } from 'react';
import { PortalData, SAMPLE_PORTAL_DATA } from './my-machine-data';

/**
 * The portal components' data: GET /api/portal/me once per page view (shared by every component on the page).
 * In Pages (editing) there is no portal session, so they get the sample account and `sample` is true.
 * Signed out: `redirect` sends the visitor to the login page (dashboard blocks); the header just shows nothing.
 */
type State = { status: 'loading' | 'ready' | 'signed-out'; data: PortalData | null; sample: boolean };

let request: Promise<PortalData | null> | null = null;

const load = (): Promise<PortalData | null> => {
  request ??= fetch('/api/portal/me', { credentials: 'same-origin', cache: 'no-store' })
    .then(async (r) => (r.ok ? ((await r.json()) as { data: PortalData }).data : null))
    .catch(() => null);
  return request;
};

/** Forget the cached response (after a quote request or sign-out). */
export const refreshPortalData = (): void => {
  request = null;
};

export const loginUrl = (): string => {
  const { pathname, search } = window.location;
  const base = pathname.replace(/\/my-machine(\/.*)?$/i, '');
  return `${base}/my-machine/login?returnUrl=${encodeURIComponent(pathname + search)}`;
};

export const usePortalData = (
  isEditing: boolean,
  redirect = true,
  enabled = true
): State & { reload: () => void } => {
  const [state, setState] = useState<State>(
    isEditing
      ? { status: 'ready', data: SAMPLE_PORTAL_DATA, sample: true }
      : { status: 'loading', data: null, sample: false }
  );
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (isEditing || !enabled) return;
    let alive = true;
    load().then((data) => {
      if (!alive) return;
      if (!data && redirect) window.location.assign(loginUrl());
      setState({ status: data ? 'ready' : 'signed-out', data, sample: false });
    });
    return () => {
      alive = false;
    };
  }, [isEditing, redirect, enabled, version]);

  return {
    ...state,
    reload: () => {
      refreshPortalData();
      setVersion((v) => v + 1);
    },
  };
};

export const signOut = async (): Promise<void> => {
  await fetch('/api/portal/logout', { method: 'POST', credentials: 'same-origin' }).catch(() => undefined);
  refreshPortalData();
  window.location.assign(loginUrl().replace(/\?returnUrl=.*$/, ''));
};

export const formatPortalDate = (iso: string): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric', year: 'numeric' });
};
