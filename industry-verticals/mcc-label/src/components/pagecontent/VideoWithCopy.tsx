'use client';

import { JSX } from 'react';
import {
  ImageField,
  Link,
  LinkField,
  RichText,
  RichTextField,
  Text,
  TextField,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';

interface Fields {
  Title?: TextField;
  Text?: RichTextField;
  Poster?: ImageField;
  Video?: LinkField;
}

export type VideoWithCopyProps = {
  params: { [key: string]: string };
  fields?: Fields;
};

function vimeoPlayerSrc(href: string | undefined): string | undefined {
  if (!href) return undefined;
  try {
    const url = new URL(href);
    const host = url.hostname.toLowerCase();
    if (host !== 'vimeo.com' && host !== 'player.vimeo.com') return undefined;
    if (host === 'player.vimeo.com' && url.pathname.startsWith('/video/')) return url.toString();
    const id = url.pathname.split('/').filter(Boolean).pop();
    return id && /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : undefined;
  } catch {
    return undefined;
  }
}

const VideoWithCopyView = (props: VideoWithCopyProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const playerSrc = vimeoPlayerSrc(props.fields?.Video?.value?.href);
  const title = String(props.fields?.Title?.value || 'Video');

  return (
    <section className={`component video-with-copy ${props.params?.styles || ''}`} id={id || undefined}>
      <div className="video-with-copy__media">
        {playerSrc && (
          <iframe
            src={playerSrc}
            title={title}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        )}
        {(isEditing || !playerSrc) && props.fields?.Video && (
          <Link field={props.fields.Video} className="video-with-copy__link" />
        )}
      </div>
      <div className="video-with-copy__copy">
        {props.fields?.Title && <Text tag="h2" field={props.fields.Title} />}
        {props.fields?.Text && <RichText field={props.fields.Text} />}
      </div>
    </section>
  );
};

export const Default = VideoWithCopyView;
export const MccLabel = VideoWithCopyView;
