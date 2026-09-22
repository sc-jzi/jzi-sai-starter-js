'use client';

import { useEffect, useRef, useState, type JSX } from 'react';
import { LinkField, useSitecore, Link } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

interface Fields {
  VideoLink: LinkField;
  CTA: LinkField;
}

export type VideoProps = ComponentProps & {
  fields: Fields;
};

const IconPlay = (): JSX.Element => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7L8 5z" />
  </svg>
);

const IconPause = (): JSX.Element => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M6 5h4v14H6V5zm8 0h4v14h-4V5z" />
  </svg>
);

const IconMute = (): JSX.Element => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
  </svg>
);

const IconUnmute = (): JSX.Element => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const EmptyState = ({
  id,
  sxaStyles,
  isPageEditing,
}: {
  id?: string;
  sxaStyles: string;
  isPageEditing: boolean;
}): JSX.Element => (
  <div
    className={`component video relative flex min-h-[500px] items-center justify-center bg-neutral-900 text-white ${sxaStyles}`}
    id={id || undefined}
  >
    {isPageEditing ? (
      <p className="text-sm opacity-80">Select a video link datasource to display the video.</p>
    ) : null}
  </div>
);

export const Default = (props: VideoProps): JSX.Element => {
  const id = props.params.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const { page } = useSitecore();
  const isPageEditing = page.mode.isEditing;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const videoUrl = props.fields?.VideoLink?.value?.href || '';

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoUrl) return;

    video.muted = true;
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  }, [videoUrl]);

  if (!videoUrl) {
    return <EmptyState id={id} sxaStyles={sxaStyles} isPageEditing={isPageEditing} />;
  }

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !video.muted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
  };

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play().then(() => setIsPlaying(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div
      className={`component video akamai-brand group relative min-h-[600px] w-full overflow-hidden bg-black ${sxaStyles}`}
      id={id || undefined}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full min-h-[600px] w-full object-cover"
        src={videoUrl}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-label={props.fields.VideoLink?.value?.text || 'Video'}
      />
      <Link
        field={props.fields.CTA}
        className="akamai-button-accent absolute bottom-10 left-1/2 z-10 -translate-x-1/2 !px-10"
      />
      <div className="absolute bottom-4 right-4 z-10 flex gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={handleTogglePlay}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? <IconPause /> : <IconPlay />}
        </button>
        <button
          type="button"
          onClick={handleToggleMute}
          className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label={isMuted ? 'Unmute video' : 'Mute video'}
        >
          {isMuted ? <IconMute /> : <IconUnmute />}
        </button>


      </div>
    </div>
  );
};
