#!/usr/bin/env node
/**
 * Do Content Hub images actually render in this environment? A Content Hub image field (`<Image src=... dam-id=... />`) only reaches the app when
 * the environment's Sitecore Connect for Content Hub (DAM connector) is enabled; without it the content endpoint returns the field EMPTY
 * (`value: {}`), so every image of the demo stays blank while Sitecore itself shows the value. Checked once, right after the logo is written
 * (demo-site-bootstrap), before the bulk upload: content-hub-upload.mjs refuses a bulk upload until this check has passed.
 *
 *   node harness/scripts/ch-render-check.mjs <customer> [--route /]
 *
 * Reads the rendered route from the app's content endpoint (the app's preview context: master, no publish needed), and for every component with
 * a datasource compares each image-shaped field with the field's raw value on master (Authoring GraphQL). A raw Content Hub value whose rendered
 * value has a src = renders; a raw Content Hub value rendered empty = dropped.
 * Writes images/ch-render-check.json { ok, checkedAt, route, rendered[], dropped[] }.
 * Exit 0 renders · 2 dropped (Content Hub images do not render here) · 3 inconclusive (no Content Hub image on the route yet, or the app / CM
 * host is not configured).
 */
import { join } from "node:path";
import { authoringClient, demoDir, die, edgeRoute, parseArgs, safeWrite, ENV } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: ch-render-check.mjs <customer> [--route /]");
const route = flags.route && flags.route !== true ? String(flags.route) : "/";
const lang = ENV.SITECORE_DEFAULT_LANGUAGE || "en";
const isCh = (raw) => /<image\b[^>]*\b(dam-id|stylelabs-content-id)\s*=/i.test(String(raw ?? ""));

/** Pure part (exported for tests): image-shaped fields of every component with a datasource. */
export function imageFieldsOf(routeJson) {
  const out = [];
  (function walk(ph) {
    for (const arr of Object.values(ph ?? {})) for (const c of Array.isArray(arr) ? arr : []) {
      const ds = String(c?.dataSource ?? "");
      if (/^\{?[0-9a-f-]{36}\}?$/i.test(ds)) for (const [name, f] of Object.entries(c.fields ?? {})) {
        const v = f?.value;
        if (v && typeof v === "object" && !Array.isArray(v) && ("src" in v || Object.keys(v).length === 0)) out.push({ component: c.componentName, dataSource: ds, field: name, src: v.src ? String(v.src) : "" });
      }
      walk(c?.placeholders);
    }
  })(routeJson?.placeholders);
  return out;
}
/** rendered / dropped split, given the raw master value per "dataSource|field" */
export function classify(fields, rawOf) {
  const rendered = [], dropped = [];
  for (const f of fields) { if (!isCh(rawOf(f))) continue; (f.src ? rendered : dropped).push(f); }
  return { rendered, dropped };
}

if (process.argv[1] && process.argv[1].endsWith("ch-render-check.mjs")) {
  const out = (code, msg, extra = {}) => {
    safeWrite(customer, join(demoDir(customer), "images", "ch-render-check.json"), JSON.stringify({ ok: code === 0 ? true : code === 2 ? false : null, checkedAt: new Date().toISOString(), route, ...extra }, null, 2) + "\n");
    console.log(msg); process.exitCode = code;   // exitCode, not exit(): Windows crashes on exit() after a fetch
  };
  let r;
  try { r = await edgeRoute(customer, route); } catch (e) { r = undefined; console.log(`! content endpoint: ${e.message}`); }
  if (r === undefined) out(3, `· inconclusive: the app's .env.local has no context id / site name, or the content endpoint failed (industry-verticals/${customer}/.env.local)`);
  else if (r === null) out(3, `· inconclusive: route ${route} is not served for this site yet`);
  else {
    const fields = imageFieldsOf(r);
    let gql = null; try { gql = await authoringClient(); } catch { /* below */ }
    if (!gql) out(3, "· inconclusive: no Authoring GraphQL client (SITECORE_CM_HOST + automation client in harness/.env.local) to read the raw values");
    else {
      const raw = new Map();
      for (const f of fields) {
        const k = `${f.dataSource}|${f.field}`; if (raw.has(k)) continue;
        const v = (await gql(`query($id:ID!,$f:String!,$l:String!){ item(where:{ itemId:$id, database:"master", language:$l }){ field(name:$f){ value } } }`, { id: f.dataSource, f: f.field, l: lang }).catch(() => null))?.item?.field?.value;
        raw.set(k, v ?? "");
      }
      const { rendered, dropped } = classify(fields, (f) => raw.get(`${f.dataSource}|${f.field}`));
      const list = (xs) => xs.map((x) => `${x.component}.${x.field}`).join(", ");
      if (rendered.length) out(0, `✅ Content Hub images render here (${list(rendered)})${dropped.length ? `; but empty: ${list(dropped)} (check those values)` : ""}`, { rendered, dropped });
      else if (dropped.length) out(2, `❌ Content Hub images do NOT render in this environment: ${list(dropped)} hold a Content Hub value on master but reach the app empty. The environment's DAM connector (Sitecore Connect for Content Hub) is most likely not enabled. Use the Media Library for this demo (media-upload.mjs --force), or enable the connector and run this check again.`, { rendered, dropped });
      else out(3, `· inconclusive: no Content Hub image on ${route} yet (write the logo into the Header first)`, { rendered, dropped });
    }
  }
}
