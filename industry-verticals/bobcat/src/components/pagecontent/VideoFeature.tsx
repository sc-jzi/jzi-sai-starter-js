'use client';

import { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichTextField,
  Text,
  RichText,
  Link,
  NextImage,
  useSitecore,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * VideoFeature: a video (VideoLink, General Link to a YouTube or .mp4 URL) with its Poster image and text.
 * The play button is drawn here; a click swaps the poster for the player. In editing mode the poster stays
 * so the Poster field can be edited.
 */

interface Fields {
  Eyebrow?: Field<string>;
  Title?: Field<string>;
  TitleAccent?: Field<string>;
  Text?: RichTextField;
  Link?: LinkField;
  Link2?: LinkField;
  VideoLink?: LinkField;
  Poster?: ImageField;
}

export type VideoFeatureProps = ComponentProps & {
  fields?: Fields;
};

type Look = 'default' | 'split' | 'split-dark' | 'split-dark-left' | 'banner';

type VideoSource = { kind: 'youtube' | 'file'; src: string } | null;

/** Turns the VideoLink URL into a player source (a URL from a General Link, not markup). */
const videoSource = (href?: string): VideoSource => {
  if (!href) return null;
  let url: URL;
  try {
    url = new URL(href);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, '');
  let youtubeId = '';
  if (host === 'youtu.be') youtubeId = url.pathname.slice(1);
  else if (host.endsWith('youtube.com') || host.endsWith('youtube-nocookie.com')) {
    if (url.pathname.startsWith('/embed/')) youtubeId = url.pathname.split('/')[2] || '';
    else youtubeId = url.searchParams.get('v') || '';
  }
  if (youtubeId) {
    return {
      kind: 'youtube',
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0`,
    };
  }
  return { kind: 'file', src: url.toString() };
};

const PlayButton = ({ onClick }: { onClick: () => void }): JSX.Element => (
  <button type="button" className="video-feature__play" aria-label="Play video" onClick={onClick}>
    <svg viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
      <circle cx="40" cy="40" r="38" fill="rgba(0,0,0,0.45)" stroke="#fff" strokeWidth="3" />
      <path d="M32 24 58 40 32 56Z" fill="#fff" />
    </svg>
  </button>
);

const VideoMedia = ({
  fields,
  isEditing,
  look,
}: {
  fields: Fields;
  isEditing: boolean;
  look: Look;
}): JSX.Element => {
  const [playing, setPlaying] = useState(false);
  const source = videoSource(fields.VideoLink?.value?.href);
  const hasPoster = !!fields.Poster?.value?.src;
  // A background file video in the banner plays muted on its own, like the live band.
  const autoBackground = look === 'banner' && source?.kind === 'file' && !isEditing;

  // Dark split with the video left: a file video shows the browser's own player, as on the live band.
  if (look === 'split-dark-left' && source?.kind === 'file' && !isEditing) {
    return (
      <div className="video-feature__media">
        <video
          className="video-feature__video"
          src={source.src}
          controls
          playsInline
          preload="metadata"
          poster={fields.Poster?.value?.src as string | undefined}
        />
      </div>
    );
  }

  if (autoBackground && source) {
    return (
      <div className="video-feature__media">
        <video
          className="video-feature__video"
          src={source.src}
          autoPlay
          muted
          loop
          playsInline
          poster={fields.Poster?.value?.src as string | undefined}
        />
      </div>
    );
  }

  if (playing && source && !isEditing) {
    return (
      <div className="video-feature__media is-playing">
        {source.kind === 'youtube' ? (
          <iframe
            className="video-feature__video"
            src={source.src}
            title={fields.Title?.value || 'Video'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video className="video-feature__video" src={source.src} autoPlay controls playsInline />
        )}
      </div>
    );
  }

  return (
    <div className="video-feature__media">
      {(isEditing || hasPoster) && (
        <NextImage
          field={fields.Poster}
          width={1280}
          height={720}
          className="video-feature__poster"
        />
      )}
      {source && !isEditing && <PlayButton onClick={() => setPlaying(true)} />}
      {isEditing && (
        <div className="video-feature__video-link">
          Video link: <Link field={fields.VideoLink as LinkField} />
        </div>
      )}
    </div>
  );
};

const VideoFeatureView = ({
  props,
  look,
}: {
  props: VideoFeatureProps;
  look: Look;
}): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const id = props.params?.RenderingIdentifier;
  const styles = `${props.params?.styles || ''}`.trim();
  const fields = props.fields;

  if (!fields) {
    return (
      <div className={`component video-feature ${styles}`} id={id ? id : undefined}>
        <div className="component-content">
          <span className="is-empty-hint">Video Feature: choose or create a datasource</span>
        </div>
      </div>
    );
  }

  const show = (ok: boolean) => isEditing || ok;

  const content = (
    <div className="video-feature__content">
      {show(!!fields.Eyebrow?.value) && (
        <h3 className="video-feature__eyebrow">
          <Text field={fields.Eyebrow} />
        </h3>
      )}
      {show(!!fields.Title?.value || !!fields.TitleAccent?.value) && (
        <h2 className="video-feature__title">
          <Text field={fields.Title} />{' '}
          {show(!!fields.TitleAccent?.value) && (
            <span className="video-feature__accent">
              <Text field={fields.TitleAccent} />
            </span>
          )}
        </h2>
      )}
      {show(!!fields.Text?.value) && (
        <RichText field={fields.Text} className="video-feature__text" />
      )}
      {show(!!fields.Link?.value?.href || !!fields.Link2?.value?.href) && (
        <div className="video-feature__actions">
          {show(!!fields.Link?.value?.href) && (
            <Link field={fields.Link as LinkField} className="bobcat-button" />
          )}
          {show(!!fields.Link2?.value?.href) && (
            <Link
              field={fields.Link2 as LinkField}
              className="bobcat-button bobcat-button--secondary"
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <div
      className={`component video-feature video-feature--${look} ${styles}`}
      id={id ? id : undefined}
    >
      <div className="video-feature__band">
        <div className="video-feature__inner">
          <VideoMedia fields={fields} isEditing={isEditing} look={look} />
          {content}
        </div>
      </div>
    </div>
  );
};

export const Default = (props: VideoFeatureProps): JSX.Element => (
  <VideoFeatureView props={props} look="default" />
);

export const Bobcat = (props: VideoFeatureProps): JSX.Element => (
  <VideoFeatureView props={props} look="split" />
);

export const BobcatSplit = (props: VideoFeatureProps): JSX.Element => (
  <VideoFeatureView props={props} look="split-dark" />
);

export const BobcatSplitDarkLeft = (props: VideoFeatureProps): JSX.Element => (
  <VideoFeatureView props={props} look="split-dark-left" />
);

export const BobcatBanner = (props: VideoFeatureProps): JSX.Element => (
  <VideoFeatureView props={props} look="banner" />
);
