"use client";

import { JSX, useEffect, useState } from "react";
import {
  Field,
  LinkField,
  Link,
  Text,
  useSitecore,
} from "@sitecore-content-sdk/nextjs";
import NextLink from "next/link";
import { ComponentProps } from "lib/component-props";

interface LinkPanelItem {
  id: string;
  link?: { jsonValue?: LinkField };
}

interface LinkPanelFields {
  data?: {
    datasource?: {
      id?: string;
      title?: { jsonValue?: Field<string> };
      children?: { results?: LinkPanelItem[] };
    };
  };
}

export type LinkPanelProps = ComponentProps & { fields: LinkPanelFields };

const FONT_STEPS = [0.85, 1, 1.15, 1.3];

const LinkPanelEmpty = (): JSX.Element => (
  <div className="component link-panel">
    <div className="component-content">
      <span className="is-empty-hint">Link Panel</span>
    </div>
  </div>
);

const isExternal = (field?: LinkField): boolean => {
  const v = field?.value;
  if (!v) return false;
  return v.linktype === "external" || v.target === "_blank";
};

const ExternalIcon = (): JSX.Element => (
  <svg
    className="link-panel-external"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    width="14"
    height="14"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <path d="M15 3h6v6" />
    <path d="M10 14 21 3" />
  </svg>
);

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

const RouteBreadcrumb = ({ crumbs }: { crumbs: RouteCrumb[] }): JSX.Element => (
  <nav className="link-panel-crumbs" aria-label="Breadcrumb">
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
);

const useItems = (fields?: LinkPanelFields) => {
  const datasource = fields?.data?.datasource;
  const items = (datasource?.children?.results ?? []).filter(Boolean);
  return { datasource, items };
};

export const Default = ({ fields, params }: LinkPanelProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const { datasource, items } = useItems(fields);
  if (!datasource) return <LinkPanelEmpty />;

  return (
    <div
      className={`component link-panel ${params?.styles || ""}`}
      id={params?.RenderingIdentifier || undefined}
    >
      <div className="container">
        {(isEditing || datasource.title?.jsonValue?.value) && (
          <h2 className="link-panel-title">
            <Text field={datasource.title?.jsonValue} />
          </h2>
        )}
        <ul className="link-panel-list">
          {items.map((item) =>
            isEditing || item.link?.jsonValue?.value?.href ? (
              <li key={item.id}>
                <Link field={item.link?.jsonValue as LinkField} />
              </li>
            ) : null,
          )}
        </ul>
      </div>
    </div>
  );
};

export const Tmx = ({ fields, params }: LinkPanelProps): JSX.Element => {
  const { page } = useSitecore();
  const isEditing = page.mode.isEditing;
  const { datasource, items } = useItems(fields);
  const [step, setStep] = useState(1);
  const crumbs = useRouteCrumbs(
    page.layout?.sitecore?.route?.itemId,
    page.locale,
  );
  if (!datasource) return <LinkPanelEmpty />;

  const scale = FONT_STEPS[step];

  // tmx.com: a full-width grey page band; inside it the 1280px band holds the page's breadcrumb trail and the white panel.
  // The text-size and print controls are icons (letters drawn in CSS), as on tmx.com.
  return (
    <div className="link-panel-page link-panel-page--tmx">
      <div
        className={`component link-panel link-panel--tmx ${params?.styles || ""}`}
        id={params?.RenderingIdentifier || undefined}
      >
        <RouteBreadcrumb crumbs={crumbs} />
        <div
          className="link-panel-card"
          style={{ ["--link-panel-scale" as string]: scale }}
        >
          <div className="link-panel-head">
            {(isEditing || datasource.title?.jsonValue?.value) && (
              <h2 className="link-panel-title">
                <Text field={datasource.title?.jsonValue} />
              </h2>
            )}
            <div className="link-panel-tools">
              <button
                type="button"
                className="link-panel-tool link-panel-tool--smaller"
                aria-label="Decrease text size"
                title="Decrease text size"
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                disabled={step === 0}
              />
              <button
                type="button"
                className="link-panel-tool link-panel-tool--larger"
                aria-label="Increase text size"
                title="Increase text size"
                onClick={() =>
                  setStep((s) => Math.min(FONT_STEPS.length - 1, s + 1))
                }
                disabled={step === FONT_STEPS.length - 1}
              />
              <button
                type="button"
                className="link-panel-tool link-panel-tool--print"
                aria-label="Print this page"
                title="Print this page"
                onClick={() => typeof window !== "undefined" && window.print()}
              >
                <PrintIcon />
              </button>
            </div>
          </div>
          <ul className="link-panel-list">
            {items.map((item) => {
              const field = item.link?.jsonValue;
              if (!isEditing && !field?.value?.href) return null;
              return (
                <li key={item.id}>
                  <h3 className="link-panel-item">
                    <Link
                      field={field as LinkField}
                      className="link-panel-link"
                    />
                    {isExternal(field) && <ExternalIcon />}
                  </h3>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
};
