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
 * The play button is drawn here; a click swaps the poster for the player. In editing mode the player is shown
 * (without autoplay) and the VideoLink and Poster fields sit in a collapsed "Video settings" block on it.
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
      src: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?rel=0`,
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

/** Pages only: the VideoLink and Poster fields, collapsed over the player. */
const VideoSettings = ({ fields }: { fields: Fields }): JSX.Element => (
  <details className="video-feature__settings">
    <summary>Video settings</summary>
    <div className="video-feature__settings-body">
      <div>
        Video link (YouTube or .mp4): <Link field={fields.VideoLink as LinkField} />
      </div>
      <div>Poster (shown before the video plays):</div>
      <NextImage field={fields.Poster} width={320} height={180} className="video-feature__settings-poster" />
    </div>
  </details>
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

  const posterSrc = fields.Poster?.value?.src as string | undefined;

  // Pages: the player itself (no autoplay), with the fields in a collapsed block on it.
  if (isEditing && source) {
    return (
      <div className="video-feature__media is-editing">
        {source.kind === 'youtube' ? (
          <iframe
            className="video-feature__video"
            src={source.src}
            title={fields.Title?.value || 'Video'}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="video-feature__video"
            src={source.src}
            controls
            muted={look === 'banner'}
            playsInline
            preload="metadata"
            poster={posterSrc}
          />
        )}
        <VideoSettings fields={fields} />
      </div>
    );
  }

  // Split looks: a file video shows the browser's own player, as on the live bands; so does a YouTube video
  // without a poster (there is nothing to put the play button on).
  if (look !== 'banner' && source && (source.kind === 'file' || !hasPoster)) {
    return (
      <div className="video-feature__media">
        {source.kind === 'youtube' ? (
          <iframe
            className="video-feature__video"
            src={source.src}
            title={fields.Title?.value || 'Video'}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            className="video-feature__video"
            src={source.src}
            controls
            playsInline
            preload="metadata"
            poster={posterSrc}
          />
        )}
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
            src={`${source.src}&autoplay=1`}
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

  if (isEditing) {
    return (
      <div className="video-feature__media is-editing">
        <span className="video-feature__empty">Add a video link under Video settings</span>
        <VideoSettings fields={fields} />
      </div>
    );
  }

  return (
    <div className="video-feature__media">
      {hasPoster && (
        <NextImage
          field={fields.Poster}
          width={1280}
          height={720}
          className="video-feature__poster"
        />
      )}
      {source && <PlayButton onClick={() => setPlaying(true)} />}
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
