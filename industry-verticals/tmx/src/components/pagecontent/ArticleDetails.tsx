"use client";

import { JSX, useEffect, useState } from "react";
import {
  DateField,
  Field,
  ImageField,
  Placeholder,
  Text,
  RichText,
  RichTextField,
  NextImage,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import { ComponentProps } from "lib/component-props";
import { ParallaxBackgroundImage } from "components/non-sitecore/ParallaxBackgroundImage";
import Head from "next/head";
import NextLink from "next/link";

interface Fields {
  Title: Field<string>;
  Excerpt: Field<string>;
  Content: RichTextField;
  Thumbnail: ImageField;
  BackgroundImage: ImageField;
  Name: Field<string>;
  Photo: ImageField;
  Position: Field<string>;
  PublicationDate?: Field<string>;
}

export type PageBackgroundProps = ComponentProps & {
  fields: Fields;
};

export const Default = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta
          property="og:image"
          content={props.fields?.Thumbnail?.value?.src}
        />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component article-details page-background spaced-top col-12 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <ParallaxBackgroundImage
          BackgroundImage={props.fields.BackgroundImage}
        />

        <div className="container">
          <Placeholder name="page-navigation" rendering={props.rendering} />
        </div>

        <div>
          <div className="background-content component-spaced container rounded-corners">
            <div className="p-3 p-sm-5">
              <div className="article-content">
                <div className="row row-gap-4 gx-5">
                  <div className="col-12 col-lg-6">
                    <NextImage
                      field={props.fields.Thumbnail}
                      className="article-img img-fluid"
                      width={600}
                      height={400}
                    />
                  </div>
                  <div className="col-12 col-lg-6">
                    <div className="row">
                      <Placeholder
                        name="article-meta"
                        rendering={props.rendering}
                      />
                    </div>
                    <h1 className="article-title">
                      <Text field={props.fields.Title} />
                    </h1>
                    <p className="article-excerpt">
                      <Text field={props.fields.Excerpt} />
                    </p>
                  </div>
                </div>
                <div className="article-content-body mt-5">
                  <RichText field={props.fields.Content} />
                </div>
              </div>
              <div className="row">
                <Placeholder
                  name="background-page-content"
                  rendering={props.rendering}
                />
              </div>
            </div>
          </div>
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};

export const Simple = (props: PageBackgroundProps): JSX.Element => {
  const id = props.params?.RenderingIdentifier;
  return (
    <>
      <Head>
        <meta property="og:description" content={props.fields?.Excerpt.value} />
        <meta property="og:name" content={props.fields?.Title?.value} />
        <meta property="og:title" content={props.fields?.Title?.value} />
        <meta
          property="og:image"
          content={props.fields?.Thumbnail?.value?.src}
        />
        <meta property="og:type" content="article" />
      </Head>
      <div
        className={`component simple-article-details mt-4 ${props.params?.styles?.trimEnd()}`}
        id={id ? id : undefined}
      >
        <div className="container container-wide">
          <h1 className="article-title display-1 fw-bold">
            <Text field={props.fields.Title} />
          </h1>
        </div>
        <div className="container container-widest-fluid">
          <NextImage
            field={props.fields.Thumbnail}
            className="article-img img-fluid"
            width={1650}
            height={750}
          />
        </div>
        <div className="container">
          <div className="article-content">
            <div className="row">
              <div className="col-12 col-lg-6 mx-auto">
                <p className="article-excerpt fs-5">
                  <Text field={props.fields.Excerpt} />
                </p>
                <div className="article-content-body rich-text mt-5">
                  <RichText field={props.fields.Content} />
                </div>
                <div className="row article-meta-row">
                  <Placeholder
                    name="article-meta"
                    rendering={props.rendering}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-5">
            <Placeholder
              name="background-page-content"
              rendering={props.rendering}
            />
          </div>
        </div>
        <div className="row">
          <Placeholder name="page-content" rendering={props.rendering} />
        </div>
      </div>
    </>
  );
};

type RouteCrumb = { title: string; url: string };

/** The page's trail from Home down to the page (the route item's ancestors, via /api/content-search?crumbs=<route item id>). */
const useRouteCrumbs = (itemId?: string, lang?: string): RouteCrumb[] => {
  const [crumbs, setCrumbs] = useState<RouteCrumb[]>([]);
  useEffect(() => {
    if (!itemId) return;
    let alive = true;
    const qs = `crumbs=${encodeURIComponent(itemId)}${lang ? `&lang=${encodeURIComponent(lang)}` : ""}`;
    fetch(`/api/content-search?${qs}`)
      .then((r) => (r.ok ? r.json() : { crumbs: [] }))
      .then((d: { crumbs?: RouteCrumb[] }) => {
        if (alive) setCrumbs(Array.isArray(d?.crumbs) ? d.crumbs : []);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [itemId, lang]);
  return crumbs;
};

const formatDate = (date: Date | null): string =>
  date
    ? date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        timeZone: "UTC",
      })
    : "";

// Sitecore returns 0001-01-01 for an empty Date field.
const hasDate = (field?: Field<string>): boolean =>
  !!field?.value && new Date(field.value).getUTCFullYear() > 1;

const FONT_STEPS = [0.85, 1, 1.15, 1.3];

const PrintIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="16"
    height="16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6 2h12v5H6z" />
    <path d="M4 8h16a2 2 0 0 1 2 2v7h-4v-4H6v4H2v-7a2 2 0 0 1 2-2zm14 3.2a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" />
    <path d="M7 14h10v8H7z" />
  </svg>
);

const ChevronIcon = (): JSX.Element => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 10 16"
    width="9"
    height="14"
    aria-hidden="true"
  >
    <path d="M2 2l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" />
  </svg>
);

/*
 * Tmx: tmx.com press release page (sections-dividend-declaration.json #2): a full-width #efefef page band; inside it the 1280px band
 * holds the page's breadcrumb trail (route ancestors), the white article panel (title 25px 600 #000, A-/A+/print icons, date,
 * body = the Content rich text) and, on the right, the "Newsroom" box: its heading is the page's top-level section (from the route),
 * its two links are fixed chrome of the newsroom design (the planned Market Notices and Media Contacts pages).
 * Press releases on tmx.com carry no byline or lead photo, so this look renders neither the article-meta placeholder nor the Thumbnail.
 */
export const Tmx = (props: PageBackgroundProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = !!page?.mode?.isEditing;
  const [step, setStep] = useState(1);
  const crumbs = useRouteCrumbs(
    page?.layout?.sitecore?.route?.itemId,
    page?.locale,
  );
  const id = props.params?.RenderingIdentifier;
  const fields = props.fields;
  const date = fields?.PublicationDate;
  // the section the page sits in (Home > <section> > ... > page): heads the sidebar box
  const section = crumbs.length > 2 ? crumbs[1] : null;

  return (
    <div className="article-page article-page--tmx">
      <div
        className={`component article-details article-details--tmx ${props.params?.styles?.trimEnd() || ""}`}
        id={id ? id : undefined}
      >
        <nav className="article-crumbs" aria-label="Breadcrumb">
          {crumbs.length > 1 && (
            <ol>
              {crumbs.map((c, i) =>
                i < crumbs.length - 1 ? (
                  <li key={c.url + i}>
                    <NextLink href={c.url}>{c.title}</NextLink>
                  </li>
                ) : (
                  <li key={c.url + i} aria-current="page">
                    <span>{c.title}</span>
                  </li>
                ),
              )}
            </ol>
          )}
        </nav>
        <div className="article-layout">
          <article
            className="article-panel"
            style={{ ["--article-scale" as string]: FONT_STEPS[step] }}
          >
            <div className="article-head">
              {(isEditing || fields?.Title?.value) && (
                <h1 className="article-title">
                  <Text field={fields?.Title} />
                </h1>
              )}
              <div className="article-tools">
                <button
                  type="button"
                  className="article-tool article-tool--smaller"
                  aria-label="Decrease text size"
                  title="Decrease text size"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                />
                <button
                  type="button"
                  className="article-tool article-tool--larger"
                  aria-label="Increase text size"
                  title="Increase text size"
                  onClick={() =>
                    setStep((s) => Math.min(FONT_STEPS.length - 1, s + 1))
                  }
                  disabled={step === FONT_STEPS.length - 1}
                />
                <button
                  type="button"
                  className="article-tool article-tool--print"
                  aria-label="Print this page"
                  title="Print this page"
                  onClick={() =>
                    typeof window !== "undefined" && window.print()
                  }
                >
                  <PrintIcon />
                </button>
              </div>
            </div>
            {date && (isEditing || hasDate(date)) && (
              <DateField
                field={date}
                tag="p"
                className="article-date"
                render={formatDate}
              />
            )}
            {(isEditing || fields?.Content?.value) && (
              <RichText field={fields?.Content} className="article-body" />
            )}
            <div className="row">
              <Placeholder
                name="background-page-content"
                rendering={props.rendering}
              />
            </div>
          </article>
          <aside className="article-sidebar">
            <div className="article-sidebar-box">
              {section && (
                <h2 className="article-sidebar-title">
                  <NextLink href={section.url}>
                    {section.title}
                    <ChevronIcon />
                  </NextLink>
                </h2>
              )}
              <ul className="article-sidebar-list">
                <li>
                  <NextLink href="/newsroom/tsx-and-tsxv-market-notices">
                    TSX &amp; TSXV Market Notices
                  </NextLink>
                </li>
                <li>
                  <NextLink href="/newsroom/media-contacts">
                    Media inquiries
                  </NextLink>
                </li>
              </ul>
            </div>
          </aside>
        </div>
        <Placeholder name="page-content" rendering={props.rendering} />
      </div>
    </div>
  );
};
