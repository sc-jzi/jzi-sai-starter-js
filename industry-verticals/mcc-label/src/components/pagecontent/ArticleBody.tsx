'use client';

import { JSX, useEffect, useState } from 'react';
import { RichText, RichTextField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Text: RichTextField;
}

export type ArticleBodyProps = ComponentProps & {
  fields: Fields;
};

const shareLinks = (url: string) => {
  const u = encodeURIComponent(url);
  return [
    { name: 'Email', href: `mailto:?body=${u}`, path: 'M3 6h18v12H3z M3 6l9 7 9-7' },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, path: 'M14 8h2V5h-2a3 3 0 0 0-3 3v2H9v3h2v6h3v-6h2l1-3h-3V8z' },
    { name: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, path: 'M6 9v9 M6 6v.01 M10 18v-9 M10 13a3 3 0 0 1 6 0v5' },
    { name: 'Twitter', href: `https://twitter.com/intent/tweet?url=${u}`, path: 'M4 18c8 1 13-4 13-11l2-2-2 .5L18 4l-2 1a3.5 3.5 0 0 0-6 3C7 8 5 6.5 4 5c-1 3 0 5 2 6.5L4 11c0 2 1.5 3.5 3.5 4L5 15.5' },
  ];
};

const Icon = ({ path }: { path: string }): JSX.Element => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

export const Default = (props: ArticleBodyProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page?.mode?.isEditing;
  const [url, setUrl] = useState('');
  useEffect(() => setUrl(window.location.href), []);

  return (
    <div className={`component article-body ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="container article-body-layout">
        <aside className="article-body-rail">
          <p className="rail-label">Share</p>
          <ul className="rail-icons">
            {shareLinks(url).map((s) => (
              <li key={s.name}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`Share by ${s.name}`}>
                  <Icon path={s.path} />
                </a>
              </li>
            ))}
          </ul>
          <button type="button" className="rail-print" onClick={() => window.print()}>
            <span className="rail-label">Print</span>
            <span className="rail-icon">
              <Icon path="M7 9V3h10v6 M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2 M7 14h10v7H7z" />
            </span>
          </button>
        </aside>
        <div className="article-body-text">
          {(props.fields?.Text?.value || isPageEditing) && <RichText field={props.fields?.Text} />}
        </div>
      </div>
    </div>
  );
};

export const MccLabel = (props: ArticleBodyProps): JSX.Element => (
  <section className="variant-mcc-label mcc-label">
    <Default {...props} />
  </section>
);
