/**
 * The owner's saved machines (server only), kept in an httpOnly cookie for the demo instead of a CRM: a list of Product
 * page ids with the date saved and whether a quote was requested. A save made while signed out is parked in a second
 * cookie and moved into the list at sign-in (see /api/portal/login), so "Save" on a product page survives the login.
 */
import type { NextRequest, NextResponse } from 'next/server';
import { SESSION_TTL_SECONDS } from './session';

export const SAVED_COOKIE = 'bobcat_mm_saved';
export const PENDING_SAVE_COOKIE = 'bobcat_mm_pending_save';

export type SavedEntry = { id: string; at: string; quote?: boolean };

/** Sitecore item ids in one form (no braces or dashes, lower case) so the same item always matches. */
export const normalizeId = (id: string): string => `${id ?? ''}`.replace(/[^0-9a-f]/gi, '').toLowerCase();

export const isItemId = (id: string): boolean => normalizeId(id).length === 32;

export const readSaved = (req: NextRequest): SavedEntry[] => {
  try {
    const raw = req.cookies.get(SAVED_COOKIE)?.value;
    const list = raw ? (JSON.parse(decodeURIComponent(raw)) as SavedEntry[]) : [];
    return Array.isArray(list) ? list.filter((e) => e && isItemId(e.id)).slice(0, 12) : [];
  } catch {
    return [];
  }
};

export const writeSaved = (res: NextResponse, list: SavedEntry[]): void => {
  res.cookies.set(SAVED_COOKIE, encodeURIComponent(JSON.stringify(list.slice(0, 12))), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
};

/** The list with this product added (newest first); already-saved products keep their date. */
export const addSaved = (list: SavedEntry[], id: string): SavedEntry[] => {
  const key = normalizeId(id);
  if (list.some((e) => e.id === key)) return list;
  return [{ id: key, at: new Date().toISOString().slice(0, 10) }, ...list];
};
