'use client';

import { useState } from 'react';

/**
 * Picks one image from Cloudinary with Cloudinary's own Media Library widget (https://cloudinary.com/documentation/media_library_widget).
 * The author signs in to Cloudinary inside the widget; the app only holds the cloud name and the API key (both public; the API secret is
 * never used here). The picked asset comes back with a 1200x630 fill transformation, the size social networks show for og:image.
 */
type MlAsset = { secure_url: string; public_id: string; derived?: { secure_url: string }[] };
type MediaLibrary = { show: (opts?: object) => void; hide: () => void };
declare global {
  interface Window {
    cloudinary?: {
      createMediaLibrary: (
        options: Record<string, unknown>,
        handlers: { insertHandler: (data: { assets: MlAsset[] }) => void }
      ) => MediaLibrary;
    };
  }
}

const SCRIPT = 'https://media-library.cloudinary.com/global/all.js';
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const API_KEY = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '';
export const cloudinaryConfigured = !!CLOUD_NAME && !!API_KEY;

let loading: Promise<void> | null = null;
const loadWidget = () =>
  (loading ??= new Promise<void>((resolve, reject) => {
    if (window.cloudinary?.createMediaLibrary) return resolve();
    const s = document.createElement('script');
    s.src = SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => {
      loading = null;
      reject(new Error('Could not load the Cloudinary Media Library widget.'));
    };
    document.head.appendChild(s);
  }));

export default function CloudinaryPicker({ value, onChange, alt }: { value: string; onChange: (url: string) => void; alt: string }) {
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState(false);

  const open = async () => {
    setError(null);
    setOpening(true);
    try {
      await loadWidget();
      const ml = window.cloudinary!.createMediaLibrary(
        {
          cloud_name: CLOUD_NAME,
          api_key: API_KEY,
          multiple: false,
          max_files: 1,
          insert_caption: 'Use as social image',
          default_transformations: [[{ width: 1200, height: 630, crop: 'fill', gravity: 'auto', fetch_format: 'auto', quality: 'auto' }]],
        },
        {
          insertHandler: ({ assets }) => {
            const a = assets?.[0];
            const url = a?.derived?.[0]?.secure_url || a?.secure_url;
            if (url) onChange(url);
          },
        }
      );
      ml.show();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setOpening(false);
    }
  };

  return (
    <div className="pe-cld">
      {value ? (
        <figure className="pe-cld__preview">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt} />
          <figcaption className="pe-muted pe-mono" title={value}>
            {value.replace(/^https:\/\/res\.cloudinary\.com\//, '')}
          </figcaption>
        </figure>
      ) : (
        <div className="pe-cld__empty pe-muted">No social image: the product&rsquo;s hero image is shared.</div>
      )}
      <div className="pe-cld__actions">
        <button type="button" className="pe-btn pe-btn--ghost" onClick={open} disabled={!cloudinaryConfigured || opening}>
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path fill="currentColor" d="M19.4 10.2A7 7 0 0 0 6 8.6 5 5 0 0 0 6.5 18.6h12.4a4.2 4.2 0 0 0 .5-8.4Z" />
          </svg>
          {opening ? 'Opening…' : value ? 'Change in Cloudinary' : 'Choose from Cloudinary'}
        </button>
        {value && (
          <button type="button" className="pe-btn pe-btn--ghost" onClick={() => onChange('')}>
            Remove
          </button>
        )}
      </div>
      {!cloudinaryConfigured && (
        <p className="pe-hint">Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_API_KEY in the app&rsquo;s .env.local.</p>
      )}
      {error && <p className="pe-error">{error}</p>}
    </div>
  );
}
