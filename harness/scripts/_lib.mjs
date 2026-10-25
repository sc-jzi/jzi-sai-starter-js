// Shared helpers for harness scripts. Dependency-free.
import { existsSync, readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { parseYaml as _parseYaml } from "./_yaml.mjs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const HARNESS = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));   // <repo>/harness
export const ROOT = resolve(join(HARNESS, ".."));                                        // <repo>
export const die = (m, c = 2) => { console.error(m); process.exit(c); };

const DEFAULTS = { BASE_APP_FOLDER: "prospera", SITECORE_AUTH_HOST: "https://auth.sitecorecloud.io", SITES_API_HOST: "https://xmapps-api.sitecorecloud.io", SITECORE_DEFAULT_LANGUAGE: "en", RENDERING_HOST_TEMPLATE: "basic-nextjs", CH_ENABLED: "false" };
/** harness/.env.local (git-ignored) over built-in defaults; real environment variables override both. Values are never printed. */
export function loadEnv() {
  const env = { ...DEFAULTS };
  const p = join(HARNESS, ".env.local");
  if (existsSync(p)) for (const line of readFileSync(p, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    if (line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (!m) continue;
    const v = m[2].replace(/^["']|["']$/g, ""); if (v !== "") env[m[1]] = v;
  }
  // real environment variables win, including keys .env.local does not have (a shell-only secret)
  for (const [k, v] of Object.entries(process.env)) if (v && (k in env || /^(SITECORE_|CH_|SITES_API_|PROTECTED_|RENDERING_HOST_|BASE_APP_)/.test(k))) env[k] = v;
  return env;
}
export const ENV = loadEnv();
export const list = (v) => String(v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
export const BASE_APP = String(ENV.BASE_APP_FOLDER).toLowerCase();             // the app new demos are copied FROM (read-only)
export const PROTECTED_FOLDERS = new Set([BASE_APP, ...list(ENV.PROTECTED_FOLDERS)]);
export const PROTECTED_SITES = new Set(["prosperafinancial", "prospera", "main-website", ...list(ENV.PROTECTED_SITES)]);

/** <repo>/industry-verticals/<customer>. Refuses the base app and anything protected. */
export function customerApp(customer, { mustExist = true } = {}) {
  if (!customer || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(customer)) die("Customer must be a lower-case kebab name, e.g. acme-corp (it becomes the folder name under industry-verticals/)");
  if (PROTECTED_FOLDERS.has(customer.toLowerCase())) die(`"${customer}" is protected (the base app or listed in PROTECTED_FOLDERS). Pick another customer name.`, 1);
  const app = join(ROOT, "industry-verticals", customer);
  if (mustExist && !existsSync(app)) die(`industry-verticals/${customer} does not exist yet. Run intake (it creates the demo folder) or new-site first.`);
  return app;
}
/** industry-verticals/<customer>/docs/ai/demos/<customer> — everything the demo produces lives here. Created on demand. */
export const demoDir = (customer) => join(customerApp(customer, { mustExist: false }), "docs", "ai", "demos", customer);
export const baseApp = () => join(ROOT, "industry-verticals", BASE_APP);
/** Component registry: the customer's copy, else the base app's (read-only). */
export function registryPath(customer) {
  for (const base of [join(ROOT, "industry-verticals", customer), baseApp()]) {
    const p = join(base, "docs", "ai", "catalog", "component-registry.yaml"); if (existsSync(p)) return p;
  }
  die(`component-registry.yaml not found in the customer copy or industry-verticals/${BASE_APP}`);
}
export const rootRel = (abs) => abs.slice(ROOT.length + 1).replace(/\\/g, "/");

/** The ONLY way harness scripts write files: inside industry-verticals/<customer>/ (plus root xmcloud.build.json when allowed). */
export function safeWrite(customer, abs, content, { buildJson = false } = {}) {
  const target = resolve(abs), app = customerApp(customer, { mustExist: false });
  const ok = target === app || target.startsWith(app + sep) || (buildJson && target === join(ROOT, "xmcloud.build.json"));
  if (!ok) die(`Refusing to write outside industry-verticals/${customer}/: ${rootRel(target)}`, 1);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
export const readJson = (p, fallback = null) => { try { return JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")); } catch { return fallback; } };
export function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { const k = a.slice(2); const n = argv[i + 1]; if (n !== undefined && !n.startsWith("--")) { flags[k] = n; i++; } else flags[k] = true; } else pos.push(a);
  }
  return { flags, pos };
}

/* ---- Sitecore field values. A link or image field holding a literal ("/about-us", "https://x/a.jpg") makes the layout service drop the
 * WHOLE datasource: isContentResolved: false, and the component renders empty. Shared by link-xml.mjs, link-audit.mjs and the gate. ---- */
const xmlAttr = (xml, name) => { const m = xml.match(new RegExp(`\\b${name}="([^"]*)"`)); return m ? m[1] : null; };
const GUID = /^\{[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}\}$/;
// "" = a valid General Link value (or empty). Otherwise the reason, with the fix.
export function linkError(raw) {
  const v = String(raw ?? "").trim();
  if (v === "") return "";
  if (!/^<link\s[^>]*(\/>|>\s*<\/link>)$/.test(v)) return `literal value "${v.slice(0, 80)}" instead of link XML — use link-xml.mjs make`;
  const linktype = xmlAttr(v, "linktype"), id = xmlAttr(v, "id"), url = xmlAttr(v, "url");
  switch (linktype) {
    case "internal":
      // The id is what resolves the link. Sitecore's own link picker also writes url="/<collection>/<site>/Home/..." next to it: that is fine
      // (checked on a live site: a hero with such links resolves). A url WITHOUT an id is the failure that drops the datasource.
      if (!id || !GUID.test(id)) return `internal link without id="{GUID}"${url ? ` (only url="${url}": this drops the datasource)` : ""} — use link-xml.mjs make --id`;
      return "";
    case "media":
      return id && GUID.test(id) ? "" : `media link without id="{GUID}"`;
    case "external":
      if (!url) return "external link without a url — use link-xml.mjs make --url";
      return url === "#" || /^https?:\/\//i.test(url) ? "" : `external url "${url}" is not http(s) or "#" — a site path is an internal link: use link-xml.mjs make --id`;
    case "mailto":
      return /^mailto:\S+@\S+/i.test(url ?? "") ? "" : `mailto link needs url="mailto:<address>" — use link-xml.mjs make --mailto`;
    case "anchor":
      return xmlAttr(v, "anchor") ? "" : `anchor link needs anchor="<name>"`;
    default:
      return `linktype "${linktype ?? ""}" is not internal | external | media | mailto | anchor — use link-xml.mjs make`;
  }
}
// "" = a valid Image field value (or empty). A bare URL or path is the same failure as a literal link.
export function imageError(raw) {
  const v = String(raw ?? "").trim();
  if (v === "") return "";
  // <image mediaid=.../> (media library) or <Image src=... dam-id=... /> (Content Hub)
  return /^<image\s[\s\S]*(\/>|<\/image>)$/i.test(v) ? "" : `literal value "${v.slice(0, 80)}" instead of image XML — use the imageFieldXml from images/image-manifest.json`;
}
// Authoring GraphQL (CM) with the automation client from harness/.env.local. null when the host or client is not configured.
export async function authoringClient() {
  const cm = String(ENV.SITECORE_CM_HOST || "").replace(/\/+$/, ""), id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
  if (!cm || !id || !secret || !ENV.SITECORE_AUTH_HOST) return null;
  const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }), signal: AbortSignal.timeout(30000) });
  if (!tr.ok) throw new Error(`token request failed: HTTP ${tr.status}`);
  const jwt = (await tr.json()).access_token, url = `${cm}/sitecore/api/authoring/graphql/v1/`;
  const client = async (query, variables) => {
    const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }), signal: AbortSignal.timeout(60000) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok || j.errors) throw new Error(`GraphQL ${r.status}: ${JSON.stringify(j.errors || j).slice(0, 600)}`);
    return j.data;
  };
  client.token = jwt;   // the same bearer token authorises media uploads to a presigned URL (media-upload.mjs)
  return client;
}

// The rendered layout of a page from the app's content endpoint, with the app's own context id (industry-verticals/<app>/.env.local).
// That context is the preview context: it serves master, so no publish is needed while building (publishing is for the deployed Vercel site).
// Returns the route ({ placeholders: { "headless-main": [...] } }), null when the page is not served, undefined when the app env is not configured.
export async function edgeRoute(customer, route, { site, language } = {}) {
  let env = {};
  try { env = Object.fromEntries(readFileSync(join(customerApp(customer, { mustExist: false }), ".env.local"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])); } catch { /* no app env */ }
  const ctx = env.SITECORE_EDGE_CONTEXT_ID || env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || ENV.SITECORE_EDGE_CONTEXT_ID;
  const siteName = site || env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
  if (!ctx || !siteName) return undefined;
  const r = await fetch(`https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=${encodeURIComponent(ctx)}`, { method: "POST", headers: { "Content-Type": "application/json" },
    signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ query: `{ layout(site: ${JSON.stringify(siteName)}, routePath: ${JSON.stringify(route)}, language: ${JSON.stringify(language || env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en")}) { item { rendered } } }` }) });
  if (!r.ok) throw new Error(`Edge HTTP ${r.status}`);
  return (await r.json())?.data?.layout?.item?.rendered?.sitecore?.route ?? null;
}
// plan path (/Home/x) -> site route (/x)
export const routeOf = (planPath) => String(planPath).replace(/^\/home/i, "") || "/";

/* ---- section captures (section-capture.mjs output), shared by the gate, the validators and variants-verify ---- */
export const PARTIAL_DESIGN_TEMPLATE = "{FD2059FD-6043-4DFE-8C04-E2437CE87634}";   // a real Partial Design
export const PARTIAL_DESIGN_FOLDER = "{C3CEB23C-D66D-4EF5-99E0-D45F60C02583}";     // the Partial Designs FOLDER template: holds no layout
// The header band and the footer band of a capture. Older captures marked every band "section": then the header is the
// first band when it starts at the top of the page, and the footer is the last band. The footer is built by the Footer partial.
export function chromeBands(capture) {
  const s = Array.isArray(capture?.sections) ? capture.sections : [];
  const header = s.find((x) => x.kind === "header") ?? (s[0] && Number(s[0].top) < 10 && s.length > 1 ? s[0] : null);
  const footer = s.find((x) => x.kind === "footer") ?? (s.length > 1 ? s.at(-1) : null);
  return { headerIdx: header?.index ?? null, footerIdx: footer?.index ?? null, header, footer };
}
// The labels on the top row of a band (a footer's column headings): links and headings sharing the top edge, left to right.
export function topLabels(section) {
  const els = (section?.elements ?? []).filter((e) => (e.role === "link" || e.role === "heading") && e.text && e.y != null);
  if (els.length < 3) return [];
  const top = Math.min(...els.map((e) => e.y));
  const row = els.filter((e) => e.y - top <= 30).sort((a, b) => a.x - b.x);
  const kept = [];
  for (const e of row) if (!kept.length || Math.abs(e.x - kept[kept.length - 1].x) >= 40) kept.push(e);
  return kept.map((e) => String(e.text));
}
// An advertisement slot: no heading, and nothing but "Advertisement" / "Sponsored" labels, an ad-network slot or a bare image.
// Never built, never compared, never needs a place in the plan (validate-site-plan, run-gate and section-capture skip it).
export function isAdBand(section) {
  if (!section || section.heading || section.form || section.buttons) return false;
  const els = section.elements ?? [];
  const labels = els.filter((e) => e.role !== "image").map((e) => String(e.text ?? "").trim()).filter(Boolean);
  const onlyAdLabels = labels.length > 0 && labels.every((t) => /^(advertisement|advertising|sponsored( content)?|ad|ads)$/i.test(t));
  return onlyAdLabels || (!!section.adSlot && labels.length <= 1);
}
// Why a live band is more than prose. Empty = a heading and paragraphs only, the one shape Rich Text may carry.
export function notProse(section) {
  if (!section) return [];
  const n = (role) => (section.elements ?? []).filter((e) => e.role === role).length;
  const why = [];
  if (n("image") || (section.images ?? []).length) why.push(`${Math.max(n("image"), (section.images ?? []).length)} image(s)`);
  if (section.backgroundImage) why.push("a background image");
  if (n("button") || section.buttons) why.push(`${Math.max(n("button"), section.buttons || 0)} button(s)`);
  if (section.form || n("field")) why.push("a form");
  if ((section.cards ?? []).length) why.push(`${section.cards.length} card(s)`);
  if ((section.columns ?? 1) > 2) why.push(`${section.columns} columns`);
  if (n("heading") > 2) why.push(`${n("heading")} headings (a repeated item: list, accordion, cards)`);
  if (n("link") > 3) why.push(`${n("link")} links (a link list)`);
  if (section.scroller) why.push("a carousel/scroller");
  if (section.video) why.push("a video");
  return why;
}

/* ---- provenance: what a verdict or approval was computed from ---- */
export const fileHash = (p) => { try { return createHash("sha1").update(readFileSync(p)).digest("hex"); } catch { return null; } };
export const textHash = (t) => createHash("sha1").update(String(t)).digest("hex");
// What an app build depends on: src/ plus the configs. Same hash = same code (build-check records it; verdicts are stamped with it).
export function sourceFingerprint(dir) {
  if (!existsSync(dir)) return null;
  const h = createHash("sha1");
  const walk = (d) => { for (const e of readdirSync(d, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) { const p = join(d, e.name); if (e.isDirectory()) walk(p); else { h.update(p.slice(dir.length)); h.update(readFileSync(p)); } } };
  if (existsSync(join(dir, "src"))) walk(join(dir, "src"));
  for (const f of readdirSync(dir).sort()) if (/^(package\.json|tsconfig\.json|sitecore\.(cli\.)?config\.ts|next\.config\.[cm]?[jt]s)$/.test(f)) { h.update(f); h.update(readFileSync(join(dir, f))); }
  return h.digest("hex");
}
// The stamp every looks verdict carries, so the gate can tell what was compared, against what, and with which code
export const verdictStamp = (customer, url, refFile) => ({ url, refHash: fileHash(join(demoDir(customer), refFile)), buildFingerprint: sourceFingerprint(customerApp(customer, { mustExist: false })) });

/* ---- the component registry, read ONE way: Map(id -> { name, variants[], ...entry }) ---- */
export function readRegistry(customer) {
  const y = _parseYaml(readFileSync(registryPath(customer), "utf8"));
  const list = Array.isArray(y?.components) ? y.components : Object.values(y ?? {}).find(Array.isArray) ?? [];
  return new Map(list.filter((e) => e && e.id).map((e) => [String(e.id), { ...e, name: String(e.name ?? ""), variants: Array.isArray(e.variants) ? e.variants.map(String) : e.variants ? [String(e.variants)] : [] }]));
}
