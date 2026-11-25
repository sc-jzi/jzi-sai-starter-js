'use client';

import { useEffect, useState } from 'react';
import { ClientSDK } from '@sitecore-marketplace-sdk/client';
import { XMC } from '@sitecore-marketplace-sdk/xmc';

/**
 * The Marketplace SDK client (built-in authorization: the host authorizes the request for this app). Seen on the first
 * save: SitecoreAI records writes as the app's own client identity (`__Updated by` = a client ID), not as the person
 * using it. Per-user attribution and rights would need custom authorization (Auth0), which also allows server-side calls.
 * Outside SitecoreAI (the app opened directly on localhost) there is no host: the app shows the PIM data, read-only.
 */
export interface MarketplaceState {
  client: ClientSDK | null;
  /** the environment's preview context ID: Authoring GraphQL requests go to it */
  contextId: string | null;
  tenantName: string | null;
  status: 'loading' | 'ready' | 'standalone' | 'error';
  error: string | null;
}

let shared: Promise<ClientSDK> | null = null;
const getClient = () => (shared ??= ClientSDK.init({ target: window.parent, modules: [XMC] }));

type ResourceAccess = { tenantName?: string; context?: { preview?: string; live?: string } };

export function useMarketplace(): MarketplaceState {
  const [state, setState] = useState<MarketplaceState>({
    client: null,
    contextId: null,
    tenantName: null,
    status: 'loading',
    error: null,
  });

  useEffect(() => {
    if (window.parent === window) {
      setState((s) => ({ ...s, status: 'standalone' }));
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const client = await getClient();
        const res = await client.query('application.context');
        const access = ((res.data as { resourceAccess?: ResourceAccess[] } | undefined)?.resourceAccess ?? [])[0];
        if (cancelled) return;
        setState({
          client,
          contextId: access?.context?.preview ?? null,
          tenantName: access?.tenantName ?? null,
          status: access?.context?.preview ? 'ready' : 'error',
          error: access?.context?.preview ? null : 'The app has no SitecoreAI API access in this environment.',
        });
      } catch (e) {
        if (!cancelled) setState((s) => ({ ...s, status: 'error', error: e instanceof Error ? e.message : String(e) }));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/** One Authoring GraphQL request through the host. Throws on GraphQL errors. */
export async function authoring<T>(
  client: ClientSDK,
  contextId: string,
  query: string,
  variables: Record<string, unknown> = {}
): Promise<T> {
  const res = (await client.mutate('xmc.authoring.graphql', {
    params: { query: { sitecoreContextId: contextId }, body: { query, variables } },
  })) as unknown as { data?: { data?: T; errors?: { message: string }[] } & T; error?: unknown };
  const payload = res?.data as { data?: T; errors?: { message: string }[] } | undefined;
  if (payload?.errors?.length) throw new Error(payload.errors.map((e) => e.message).join('; '));
  if (res?.error) throw new Error(typeof res.error === 'string' ? res.error : JSON.stringify(res.error));
  return (payload?.data ?? (payload as unknown as T)) as T;
}
