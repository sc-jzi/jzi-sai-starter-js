#!/usr/bin/env node
/**
 * Read every item of the demo's site from Sitecore (Authoring GraphQL, master, read-only) and check every General Link and Image field.
 * A link or image field holding a literal value ("/about-us", "https://x/a.jpg", linktype="internal" url="/about-us") makes the
 * layout service drop the WHOLE datasource: isContentResolved: false, and the component renders empty. This finds every one of them,
 * pages, partial-design datasources and the site's Data tree included, whatever wrote them.
 *
 *   node harness/scripts/link-audit.mjs <customer> [--language en]
 *
 * It also checks that the site's content is authorable (R26): every field has a type (an empty Type is Single-Line Text), a field named like
 * an image (…Image, …Poster, …Logo, …Icon) is an Image field and one named like a link (…Link, …Cta, …Button, …Url) a General Link, and no
 * field holds image or link XML (<image …>, <link …>) unless it is that type. Rich Text fields are never checked for markup: HTML is their value.
 *
 * Root: site-manifest.json → siteRoot (or siteId). Writes link-audit.json in the demo folder (read by run-gate.mjs).
 * For a literal path that matches a page of the site it prints the fix: link-xml.mjs make --id "{page id}".
 * Fixes are written through the Marketer MCP (update_fields_on_item) and read back; then run this again.
 * Exit 0 clean · 1 bad fields found · 2 the audit could not complete (auth/network error, unreadable items) · 3 no Authoring GraphQL client configured (SITECORE_CM_HOST + automation client in harness/.env.local).
 */
import { join } from "node:path";
import { die, demoDir, parseArgs, readJson, rootRel, safeWrite, ENV, authoringClient, linkError, imageError } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: link-audit.mjs <customer> [--language en]");
const demo = demoDir(customer), lang = flags.language && flags.language !== true ? flags.language : ENV.SITECORE_DEFAULT_LANGUAGE || "en";
const sm = readJson(join(demo, "site-manifest.json"));
const root = sm?.siteId || sm?.siteRoot;
if (!root) die("site-manifest.json has no siteRoot / siteId yet (demo-site-bootstrap step 6)");

let gql;
try { gql = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`, 2); }   // a client/auth failure is not a finding about the site
if (!gql) die("No Authoring GraphQL client (SITECORE_CM_HOST and SITECORE_AUTOMATION_CLIENT_ID/SECRET in harness/.env.local). Do the MCP sweep instead: demo-build-pages step 6.", 3);

const LINK = /^general link/i, IMAGE = /^image$/i;
const Q = `query($where:ItemQueryInput!){ item(where:$where){ itemId path template{ name } children{ nodes{ itemId path hasChildren } } fields(ownFields:true){ nodes{ name value templateField{ type } } } } }`;
const where = (r) => ({ ...(/^\//.test(r) ? { path: r } : { itemId: r }), database: "master", language: lang });
const fetchItem = async (r) => (await gql(Q, { where: where(r) })).item;

// R26: field type against field name and value; one finding per template field (not per item)
const IMAGE_NAME = /(image|img|poster|photo|picture|logo|icon|thumbnail|background|bg)\d*$/i, LINK_NAME = /(link|cta|button|btn|url)\d*$/i;
const RICH = /^rich text$/i;
const typeError = (name, type, value) => {
  const v = String(value ?? "").trim();
  if (!type) return "the field has no type (Sitecore treats it as Single-Line Text)";
  if (IMAGE_NAME.test(name) && !IMAGE.test(type)) return `named like an image but its type is ${type}: make it an Image field`;
  if (LINK_NAME.test(name) && !LINK.test(type)) return `named like a link but its type is ${type}: make it a General Link field`;
  if (RICH.test(type)) return "";
  if (/^<image\b/i.test(v) && !IMAGE.test(type)) return `holds image XML but its type is ${type}: make it an Image field`;
  if (/^<link\b/i.test(v) && !LINK.test(type)) return `holds link XML but its type is ${type}: make it a General Link field`;
  return "";
};
const wrongType = new Map();   // "template · field" -> { template, field, type, error, items, example }
const bad = [], pages = new Map();   // site-relative page path (lower case, from Home) -> item id
let items = 0, linkFields = 0, imageFields = 0, homePath = null;
const queue = [root], unreadable = [];
let inFlight = 0;
const worker = async () => {
  // keep waiting while other workers are still reading items whose children will be queued
  while (queue.length || inFlight) {
    if (!queue.length) { await new Promise((r) => setTimeout(r, 40)); continue; }
    const r = queue.shift();
    inFlight++;
    let it; try { it = await fetchItem(r); } catch (e) { unreadable.push({ path: String(r), error: e.message.slice(0, 160) }); inFlight--; continue; }
    inFlight--;
    if (!it) continue;
    items++;
    if (!homePath && /\/home$/i.test(it.path)) homePath = it.path.toLowerCase();
    if (homePath && it.path.toLowerCase().startsWith(homePath) && !/\/data(\/|$)/i.test(it.path.slice(homePath.length))) pages.set(it.path.toLowerCase().slice(homePath.length) || "/", it.itemId);
    for (const f of it.fields?.nodes ?? []) {
      const type = f.templateField?.type ?? "";
      const err = LINK.test(type) ? (linkFields++, linkError(f.value)) : IMAGE.test(type) ? (imageFields++, imageError(f.value)) : "";
      if (err) bad.push({ path: it.path, itemId: it.itemId, field: f.name, type, value: String(f.value).slice(0, 200), error: err });
      const terr = typeError(f.name, type, f.value), key = `${it.template?.name} · ${f.name}`;
      if (terr) { if (!wrongType.has(key)) wrongType.set(key, { template: it.template?.name ?? "?", field: f.name, type, error: terr, items: 0, example: it.path }); wrongType.get(key).items++; }
    }
    for (const c of it.children?.nodes ?? []) if (!/\/Presentation\/Headless Variants\//i.test(c.path)) queue.push(c.itemId);
  }
};
await Promise.all(Array.from({ length: 6 }, worker));

// a literal site path, or an internal link carrying only a url: say which page it means
const guid = (id) => `{${String(id).replace(/[{}]/g, "").replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5").toUpperCase()}}`;
for (const b of bad) {
  const v = b.value.trim(), path = (/^\//.test(v) ? v : (v.match(/\burl="(\/[^"]*)"/) ?? [])[1]) ?? null;
  if (!path) continue;
  const key = path.toLowerCase().replace(/[?#].*$/, "").replace(/\/+$/, "").replace(/^\/home(?=\/|$)/, "") || "/";
  const id = pages.get(key);
  const text = (v.match(/\btext="([^"]*)"/) ?? [])[1] ?? "";
  b.fix = id ? `node harness/scripts/link-xml.mjs make --text "${text}" --id "${guid(id)}"` : `no page ${path} in the site: link the planned page with make --id, or clear the field`;
}

const wrong = [...wrongType.values()];
const out = { at: new Date().toISOString(), source: "authoring-graphql", root, language: lang, items, linkFields, imageFields, bad, wrongType: wrong, unreadable };
safeWrite(customer, join(demo, "link-audit.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`${items} item(s), ${linkFields} link field(s), ${imageFields} image field(s) checked → ${rootRel(join(demo, "link-audit.json"))}`);
for (const b of bad) console.log(`✖ ${b.path} · ${b.field}: ${b.error}${b.fix ? `\n    fix: ${b.fix}` : ""}`);
if (!bad.length) console.log("✔ every link and image field holds valid XML");
for (const w of wrong) console.log(`✖ template ${w.template} · field ${w.field}: ${w.error} (${w.items} item(s), e.g. ${w.example})`);
if (wrong.length) console.log("  fix the template field's Type (R26), then re-write the values as that type; never parse the value in code");
else console.log("✔ every field has a type that fits its name and value");
if (unreadable.length) console.log(`! ${unreadable.length} item(s) could not be read: the audit is incomplete (exit 2)`);
// Let open GraphQL sockets close. process.exit() here aborts on Windows (UV_HANDLE_CLOSING) and the gate treats that as "could not complete".
process.exitCode = bad.length || wrong.length ? 1 : unreadable.length ? 2 : 0;
