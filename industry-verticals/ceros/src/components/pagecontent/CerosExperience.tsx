import { JSX } from 'react';
import { Field, LinkField, Text } from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';

/**
 * CerosExperience: renders a published Ceros experience inside a Sitecore page.
 *
 * - Ceros Flex experiences publish a manifest next to their URL (`<url>/manifest.v1.json`). Its `ssr` delivery mode is
 *   documented as "the customer's server fetches this manifest, emits the rendered HTML inline in their page output, ships
 *   this script to hydrate". This server component does exactly that, so the experience's text is in the HTML the server
 *   sends (search and AI engines read it), and flex-ssr.js hydrates the interactions in the browser.
 * - A URL without a Flex manifest (a classic Ceros Studio experience on view.ceros.com) is rendered with Ceros's own embed code
 *   (from its oEmbed endpoint): full height, scrolled by the page, so there is one scroll bar.
 *
 * The editor only picks the experience (ExperienceUrl, a General Link) and names it (Title). Nothing is parsed out of a
 * field value: the link's href is used as the address of the experience.
 */

interface Fields {
  Title?: Field<string>;
  ExperienceUrl?: LinkField;
}

export type CerosExperienceProps = ComponentProps & {
  fields?: Fields;
};

type ManifestAsset = {
  type?: string;
  name?: string;
  src?: { type?: string; content?: string; url?: string };
};

type ManifestResource = { url: string; integrity?: string; module?: boolean };

type FlexManifest = {
  experience?: { title?: string };
  deliveryModes?: {
    ssr?: { styles?: ManifestResource[]; scripts?: ManifestResource[] };
  };
  assets?: ManifestAsset[];
};

const MANIFEST_FILE = 'manifest.v1.json';

async function loadFlexManifest(experienceUrl: string): Promise<FlexManifest | null> {
  const manifestUrl = `${experienceUrl.replace(/\/+$/, '')}/${MANIFEST_FILE}`;
  try {
    const res = await fetch(manifestUrl, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const type = res.headers.get('content-type') || '';
    if (!type.includes('json')) return null;
    const json = (await res.json()) as FlexManifest;
    return json?.deliveryModes?.ssr ? json : null;
  } catch {
    return null;
  }
}

/** Server-side rendered Ceros Flex experience (the manifest's `ssr` delivery mode). */
async function FlexSsr({ url, label }: { url: string; label: string }): Promise<JSX.Element | null> {
  const manifest = await loadFlexManifest(url);
  if (!manifest) return <StudioEmbed url={url} label={label} />;

  const ssr = manifest.deliveryModes?.ssr ?? {};
  const assets = manifest.assets ?? [];
  const markup = assets.find((a) => a.type === 'html-body' && a.src?.type === 'inline')?.src?.content ?? '';
  const inlineStyles = assets
    .filter((a) => a.type === 'style' && a.src?.type === 'inline' && a.src.content)
    .map((a) => a.src?.content as string)
    .join('\n');
  const webfonts = assets
    .filter((a) => a.type === 'webfont' && a.src?.type === 'external' && a.src.url)
    .map((a) => a.src?.url as string);
  const manifestUrl = `${url.replace(/\/+$/, '')}/${MANIFEST_FILE}`;
  const scopedStyles = inlineStyles ? `<style>@scope (.cmp-cerosflex__content) {\n${inlineStyles}\n}</style>` : '';

  return (
    <>
      {webfonts.map((href) => (
        <link key={href} rel="stylesheet" href={href} crossOrigin="anonymous" />
      ))}
      {(ssr.styles ?? []).map((s) => (
        <link key={s.url} rel="stylesheet" href={s.url} integrity={s.integrity} crossOrigin="anonymous" />
      ))}
      <div
        className="cmp-cerosflex__content ceros-experience__flex"
        data-flex-manifest-url={manifestUrl}
        data-flex-inject="1"
        aria-label={label || manifest.experience?.title}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: scopedStyles + markup }}
      />
      {(ssr.scripts ?? []).map((s) => (
        <script
          key={s.url}
          src={s.url}
          type={s.module ? 'module' : undefined}
          integrity={s.integrity}
          crossOrigin="anonymous"
          defer
        />
      ))}
    </>
  );
}

type CerosOembed = { html?: string; embedType?: string };

/** Ceros's public oEmbed endpoint returns the official embed code for a Studio experience. */
async function loadStudioEmbed(experienceUrl: string): Promise<string | null> {
  const oembedUrl = `https://view.ceros.com/oembed?format=json&url=${encodeURIComponent(experienceUrl)}`;
  try {
    const res = await fetch(oembedUrl, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = (await res.json()) as CerosOembed;
    // The scroll proxy is rendered once by the component; a <script> in injected HTML would not run anyway.
    const html = (json?.html || '').replace(/<script[\s\S]*?<\/script>/gi, '').trim();
    return html.includes('<iframe') ? html : null;
  } catch {
    return null;
  }
}

/**
 * Classic Ceros Studio experience, embedded the way Ceros's embed code does it: an aspect-ratio box sized to the whole
 * experience, an iframe that does not scroll itself (scrolling="no"), and Ceros's scroll proxy, which passes the page's
 * scroll position into the experience. The page is the only thing that scrolls (one scroll bar).
 * Without an oEmbed answer it falls back to a full-viewport iframe.
 */
async function StudioEmbed({ url, label }: { url: string; label: string }): Promise<JSX.Element> {
  const embedHtml = await loadStudioEmbed(url);
  return (
    <>
      {embedHtml ? (
        <div className="ceros-experience__studio" dangerouslySetInnerHTML={{ __html: embedHtml }} />
      ) : (
        <div className="ceros-experience__embed">
          <iframe
            src={url}
            title={label || 'Ceros experience'}
            className="ceros-experience__iframe ceros-experience"
            allow="fullscreen; autoplay; clipboard-write"
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
      <script src="https://view.ceros.com/scroll-proxy.min.js" data-ceros-origin-domains="view.ceros.com" async />
    </>
  );
}

const CerosExperienceBody = ({ props, modifier }: { props: CerosExperienceProps; modifier: string }): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  const sxaStyles = `${props.params?.styles || ''}`;
  const isEditing = !!props.page?.mode?.isEditing;
  const fields = props.fields;
  const href = fields?.ExperienceUrl?.value?.href || '';
  const label = (fields?.Title?.value as string) || '';

  if (!fields) {
    return (
      <div className={`component ceros-experience ${modifier} ${sxaStyles}`} id={id || undefined}>
        <div className="is-empty-hint">Ceros Experience: choose an experience from the Ceros Experiences library.</div>
      </div>
    );
  }

  return (
    <section
      className={`component ceros-experience ${modifier} ${sxaStyles}`}
      id={id || undefined}
      aria-label={label || undefined}
    >
      {isEditing && (
        <div className="ceros-experience__editor-label">
          Ceros experience: <Text field={fields.Title} tag="span" />
        </div>
      )}
      {href ? (
        <FlexSsr url={href} label={label} />
      ) : (
        isEditing && <div className="is-empty-hint">Set the experience URL (ExperienceUrl) on this item.</div>
      )}
    </section>
  );
};

/** Contained in the page grid. */
export const Default = (props: CerosExperienceProps): JSX.Element => (
  <CerosExperienceBody props={props} modifier="ceros-experience--contained" />
);

/** Ceros look: full bleed, no extra spacing, as on ceros.com. */
export const Ceros = (props: CerosExperienceProps): JSX.Element => (
  <CerosExperienceBody props={props} modifier="ceros-experience--full" />
);
