'use client';

import { JSX } from 'react';
import { LinkField, useSitecore } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  Video: LinkField;
}

export type VideoProps = ComponentProps & {
  fields: Fields;
};

const VideoFallback = (): JSX.Element => (
  <div className="component video">
    <div className="component-content">
      <span className="is-empty-hint">Video</span>
    </div>
  </div>
);

const youtubeIdFromUrl = (url: string): string | null => {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return match?.[1] ?? null;
};

const vimeoIdFromUrl = (url: string): string | null => {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return match?.[1] ?? null;
};

export const Default = (props: VideoProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;
  const sxaStyles = `${props.params?.styles || ''}`;
  const src = props.fields?.Video?.value?.href?.trim() || '';

  if (!props.fields) {
    return <VideoFallback />;
  }

  const youtubeId = youtubeIdFromUrl(src);
  const vimeoId = vimeoIdFromUrl(src);

  return (
    <div className={`component video ${sxaStyles}`} id={id ? id : undefined}>
      <div className="apexus-video">
        {youtubeId && (
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&playsinline=1`}
            title="Video"
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        )}
        {!youtubeId && vimeoId && (
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&muted=1`}
            title="Video"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        )}
        {!youtubeId && !vimeoId && src && (
          <video src={src} autoPlay muted playsInline loop />
        )}
        {!src && isPageEditing && (
          <div className="component-content">
            <span className="is-empty-hint">Set the Video link on the datasource</span>
          </div>
        )}
      </div>
    </div>
  );
};
