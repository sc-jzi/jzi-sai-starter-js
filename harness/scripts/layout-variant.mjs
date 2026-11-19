#!/usr/bin/env node
/**
 * Set the headless VARIANT (rendering parameter FieldNames), the datasource (s:ds) or other rendering parameters of PLACED components in
 * layout XML, without touching anything else (other renderings, other s:par keys, personalization <rls> rule blocks).
 * See .skills/sitecore-reference/references/placeholders-and-variants.md section 3.
 *
 *  1. Batch (the standard route after placement): one process, one Authoring login, many items:
 *       node harness/scripts/layout-variant.mjs apply --plan <json file> --customer <c> [--language en] [--dry-run] [--always-write] [--show]
 *     The plan is a JSON array (or { "items": [...] }) of entries
 *       { "item": "{page or partial design id}" | "/sitecore/content/...", "uid": "{rendering uid}" | "renderingId": "{GUID}" [, "ph": "headless-main"],
 *         "variant"?: "{variant definition id}", "ds"?: "{datasource id}", "params"?: { "Key": "Value" } | ["Key=Value"] }
 *     Entries of the same item are grouped: per item ONE read, the patches, guard-customer sitecore-path (R21), a backup, ONE write and ONE
 *     read-back that checks every entry (FieldNames / s:ds / params on the right rendering), the rendering count and that every <rls>
 *     personalization block is byte-identical. A failure on one entry fails the whole item (nothing written for it); the others go on.
 *     One summary line per item; exit 1 lists the failed items. An item whose layout already holds the values is not written
 *     (--always-write writes it anyway, e.g. to test the route). --dry-run reads and patches only (no guard needed, nothing written);
 *     --show prints each changed <r> tag before/after.
 *  2. Pure XML patch (no network), e.g. for one write through the MCP (update_fields_on_item):
 *       node harness/scripts/layout-variant.mjs patch --xml-file <file|-> --variant "{GUID}" (--uid "{GUID}" | --rendering-id "{GUID}" [--ph "/headless-header"]) [--ds "{GUID}"] [--param Key=Value ...]
 *     prints the patched XML on stdout; exits 1 (nothing printed) when the rendering is not found or is ambiguous.
 *  3. One item (same as a plan of one entry): apply --item "{id}" --variant "{GUID}" (--uid ... | --rendering-id ... [--ph ...]) [--ds ...] [--param K=V ...] [--customer <c>] [--dry-run]
 *  4. Plain field write (display names): set-field --item "{id}" --field "__Display name" --value "Contact Us" [--value-file <path>] [--language en] [--dry-run]
 *     prints OK when the read-back matches (exit 1 otherwise).
 * Routes 1, 3 and 4 need SITECORE_CM_HOST + the automation client in harness/.env.local; the layout fields are STANDARD fields, so every read
 * uses ownFields:false. Backups (real writes only): <demo folder>/layout-backups/ with --customer, else harness/.layout-backups/.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ENV, HARNESS, parseArgs, die, demoDir, authoringClient } from "./_lib.mjs";

const norm = (g) => String(g ?? "").trim().replace(/[{}]/g, "").toLowerCase();
const braced = (g) => `{${norm(g).toUpperCase()}}`;
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name.replace(":", "\\:")}="([^"]*)"`)); return m ? m[1] : null; };
const isGuid = (s) => /^\{?[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}?$/i.test(String(s ?? "").trim());
const LAYOUT_FIELDS = ["__Final Renderings", "__Renderings"];   // versioned delta first (what Pages writes), then the shared layout
const rlsBlocks = (xml) => String(xml ?? "").match(/<rls\b[\s\S]*?<\/rls>/g) ?? [];
const rTags = (xml) => [...String(xml ?? "").matchAll(/<r\b[^>]*?\/?>/g)].filter((m) => attr(m[0], "uid") !== null);
const dec = (v) => { try { return decodeURIComponent(String(v).replace(/\+/g, " ")); } catch { return String(v); } };

function matchTags(xml, { uid, renderingId, ph }) {
  return rTags(xml).filter((m) => (uid ? norm(attr(m[0], "uid")) === norm(uid) : norm(attr(m[0], "s:id")) === norm(renderingId) && (!ph || attr(m[0], "s:ph") === ph)));
}
// [key, value] pairs of s:par; a bare key (no "=", as Sitecore writes empty parameters: "Styles&amp;CSSStyles") has value null and is written back bare
const parPairs = (tag) => { const raw = attr(tag, "s:par"); return raw ? raw.replace(/&amp;/g, "&").split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return i < 0 ? [p, null] : [p.slice(0, i), p.slice(i + 1)]; }) : []; };

/** Patch the s:par (and s:ds) of one <r .../> entry. Returns the new XML or throws. */
export function patchVariant(xml, { variant, uid, renderingId, ph, ds, params = [] }) {
  const hits = matchTags(xml, { uid, renderingId, ph });
  if (hits.length !== 1) throw new Error(hits.length ? `${hits.length} renderings match; pass --uid or --ph to pick one` : "rendering not found in this layout field");
  const m = hits[0], tag = m[0];
  const raw = attr(tag, "s:par");
  const pairs = parPairs(tag);
  const set = (k, v) => { const e = pairs.find((p) => p[0] === k); if (e) e[1] = v; else pairs.push([k, v]); };
  if (variant) set("FieldNames", encodeURIComponent(braced(variant)));
  for (const kv of params) { const i = kv.indexOf("="); set(kv.slice(0, i), encodeURIComponent(kv.slice(i + 1))); }
  const par = pairs.map(([k, v]) => (v === null ? k : `${k}=${v}`)).join("&").replace(/&/g, "&amp;");
  const newTag = raw !== null ? tag.replace(/(\ss:par=")[^"]*(")/, (_, a, b) => a + par + b) : tag.replace(/\s?\/?>$/, (e) => ` s:par="${par}"${e.trim() === "/>" || e.endsWith("/>") ? " />" : ">"}`);
  let out = newTag;
  if (ds) out = /\ss:ds="/.test(out) ? out.replace(/(\ss:ds=")[^"]*(")/, (_, a, b) => a + braced(ds) + b) : out.replace(/(\ss:id="[^"]*")/, `$1 s:ds="${braced(ds)}"`);
  return xml.slice(0, m.index) + out + xml.slice(m.index + tag.length);
}

/** What is wrong with one entry in this XML (empty = the rendering holds the wanted variant / datasource / params). */
export function checkEntry(xml, e) {
  const hits = matchTags(xml, e);
  if (hits.length !== 1) return [hits.length ? `${hits.length} renderings match` : "rendering not found"];
  const tag = hits[0][0], pars = new Map(parPairs(tag).map(([k, v]) => [k, dec(v ?? "")])), bad = [];
  if (e.variant && norm(pars.get("FieldNames")) !== norm(e.variant)) bad.push(`FieldNames=${pars.get("FieldNames") ?? "(none)"}`);
  if (e.ds && norm(attr(tag, "s:ds")) !== norm(e.ds)) bad.push(`s:ds=${attr(tag, "s:ds") ?? "(none)"}`);
  for (const kv of e.params ?? []) { const i = kv.indexOf("="), k = kv.slice(0, i), v = kv.slice(i + 1); if (pars.get(k) !== v) bad.push(`${k}=${pars.get(k) ?? "(none)"}`); }
  return bad;
}

const label = (e) => (e.uid ? `uid ${braced(e.uid)}` : `rendering ${braced(e.renderingId)}${e.ph ? ` in ${e.ph}` : ""}`);
function normEntry(e, i) {
  const where = `entry ${i + 1}`;
  if (!e || typeof e !== "object") throw new Error(`${where}: not an object`);
  if (!e.item) throw new Error(`${where}: "item" (id or path) is required`);
  if (!e.uid && !e.renderingId) throw new Error(`${where}: "uid" or "renderingId" is required`);
  const params = Array.isArray(e.params) ? e.params.map(String) : e.params && typeof e.params === "object" ? Object.entries(e.params).map(([k, v]) => `${k}=${v}`) : [];
  if (params.some((kv) => kv.indexOf("=") < 1)) throw new Error(`${where}: params must be { "Key": "Value" } or ["Key=Value"]`);
  if (!e.variant && !e.ds && !params.length) throw new Error(`${where}: nothing to set (variant, ds or params)`);
  for (const k of ["variant", "ds", "uid", "renderingId"]) if (e[k] && !isGuid(e[k])) throw new Error(`${where}: ${k} "${e[k]}" is not a GUID`);
  return { item: String(e.item).trim(), uid: e.uid, renderingId: e.renderingId, ph: e.ph, variant: e.variant, ds: e.ds, params };
}

async function main() {
  const { flags, pos } = parseArgs(process.argv.slice(2));
  const cmd = pos[0];
  const multi = (name) => { const out = []; const a = process.argv.slice(2); a.forEach((x, i) => { if (x === `--${name}` && a[i + 1]) out.push(a[i + 1]); }); return out; };
  const opts = { variant: flags.variant, ds: flags.ds, uid: flags.uid, renderingId: flags["rendering-id"], ph: flags.ph, params: multi("param") };
  const planFile = flags.plan && flags.plan !== true ? String(flags.plan) : null;
  if (cmd !== "set-field" && !planFile && !opts.uid && !opts.renderingId) die("Pass --uid or --rendering-id (or apply --plan <json file>)");
  if (cmd === "patch") {
    const src = flags["xml-file"]; if (!src) die("--xml-file <file|-> required");
    const xml = src === "-" ? readFileSync(0, "utf8") : readFileSync(src, "utf8");
    try { process.stdout.write(patchVariant(xml, opts)); } catch (e) { die(e.message, 1); }
    return;
  }
  if (cmd !== "apply" && cmd !== "set-field") die("Usage: layout-variant.mjs apply --plan <json>|apply|patch|set-field (see header of this file)");
  const lang = flags.language && flags.language !== true ? flags.language : ENV.SITECORE_DEFAULT_LANGUAGE || "en";
  const dry = !!flags["dry-run"], customer = flags.customer && flags.customer !== true ? String(flags.customer) : null;
  const cm = String(ENV.SITECORE_CM_HOST || "").replace(/\/+$/, "");
  if (!cm) die("SITECORE_CM_HOST is not set in harness/.env.local (the CM host of the environment, e.g. https://xmc-xxxx.sitecorecloud.io). Without it, write the layout through the MCP: get_content_item_by_id, layout-variant.mjs patch, update_fields_on_item, read back (placeholders-and-variants.md section 3).");
  // the shared Authoring client (_lib.mjs): one login for the whole run, timeouts on every call
  let client = null;
  try { client = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`, 1); }
  if (!client) die("SITECORE_AUTOMATION_CLIENT_ID/SECRET missing in harness/.env.local");
  const gql = (query, variables) => client(query, variables);
  const SEL = `itemId path version fields(ownFields:false){ nodes{ name value containsStandardValue } }`;
  const read = async (ref) => (isGuid(ref)
    ? await gql(`query($id:ID!,$lang:String!){ item(where:{itemId:$id,database:"master",language:$lang}){ ${SEL} } }`, { id: braced(ref), lang })
    : await gql(`query($p:String!,$lang:String!){ item(where:{path:$p,database:"master",language:$lang}){ ${SEL} } }`, { p: ref, lang }))?.item ?? null;
  // one updateItem for all changed fields of an item (field names/values as variables, no input type names needed)
  const update = (id, ver, fields) => gql(`mutation($id:ID!,$lang:String!,$ver:Int${fields.map((_, i) => `,$n${i}:String!,$v${i}:String!`).join("")}){ updateItem(input:{itemId:$id,database:"master",language:$lang,version:$ver,fields:[${fields.map((_, i) => `{name:$n${i},value:$v${i}}`).join(",")}]}){ item{ itemId } } }`,
    Object.assign({ id, lang, ver }, ...fields.map((f, i) => ({ [`n${i}`]: f.name, [`v${i}`]: f.value }))));

  if (cmd === "set-field") {   // plain field write (e.g. "__Display name") on the item's latest version in --language
    const item = flags.item; if (!item) die("--item required");
    const fname = flags.field;
    const fval = flags["value-file"] ? readFileSync(flags["value-file"], "utf8") : flags.value;
    if (!fname || fval === undefined || fval === true) die("set-field needs --field <name> and --value <text> or --value-file <path>");
    const it = await read(String(item)).catch((e) => die(e.message, 1)); if (!it) die(`item not found in language "${lang}"`);
    if (dry) { console.log(`DRY RUN — would set "${fname}" = "${fval}" on ${item} (${lang}, v${it.version})`); return; }
    await update(it.itemId, it.version, [{ name: fname, value: String(fval) }]).catch((e) => die(e.message, 1));
    const back = await read(it.itemId).catch((e) => die(e.message, 1));
    const got = back?.fields?.nodes?.find((f) => f.name.toLowerCase() === String(fname).toLowerCase())?.value;
    console.log(got === String(fval) ? `OK: "${fname}" = "${got}" (${lang})` : `WRITTEN but read-back shows "${got ?? "(empty)"}": check the language/version of the item`);
    process.exit(got === String(fval) ? 0 : 1);
  }

  // apply: a plan file, or one entry from the flags
  let entries;
  try {
    const rawPlan = planFile ? JSON.parse(readFileSync(planFile, "utf8").replace(/^﻿/, "")) : [{ item: flags.item, ...opts }];
    const list = Array.isArray(rawPlan) ? rawPlan : Array.isArray(rawPlan?.items) ? rawPlan.items : null;
    if (!list || !list.length) throw new Error("the plan must be a non-empty JSON array (or { \"items\": [...] })");
    entries = list.map(normEntry);
  } catch (e) { die(`plan: ${e.message}`); }
  if (!dry && !customer) die("--customer <c> is required for writes: every item path is checked with guard-customer sitecore-path (R21) and backed up in the demo folder");
  const groups = new Map();
  for (const e of entries) { const k = isGuid(e.item) ? norm(e.item) : e.item.toLowerCase(); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(e); }
  const backupDir = customer ? join(demoDir(customer), "layout-backups") : join(HARNESS, ".layout-backups");
  const failed = [];
  let okCount = 0;
  for (const [, list] of groups) {
    const ref = list[0].item;
    const fail = (msg) => { failed.push(`${ref}: ${msg}`); console.log(`✖ ${ref}: ${msg}`); };
    try {
      const it = await read(ref);
      if (!it) { fail(`item not found in language "${lang}"`); continue; }
      const fromStdValues = new Set(it.fields.nodes.filter((f) => f.containsStandardValue).map((f) => f.name));
      const before = Object.fromEntries(LAYOUT_FIELDS.map((n) => [n, it.fields.nodes.find((f) => f.name === n)?.value ?? ""]));
      const after = { ...before }, problems = [], touched = new Set();
      for (const e of list) {
        const field = LAYOUT_FIELDS.find((n) => after[n] && matchTags(after[n], e).length);
        if (!field) { problems.push(`${label(e)} not found in ${LAYOUT_FIELDS.join(" / ")}`); continue; }
        try { after[field] = patchVariant(after[field], e); touched.add(field); } catch (err) { problems.push(`${label(e)}: ${err.message}`); }
      }
      // nothing but the patched s:par / s:ds may change: same renderings, personalization rules byte-identical
      for (const n of touched) {
        if (rTags(after[n]).length !== rTags(before[n]).length) problems.push(`${n}: rendering count changed`);
        if (rlsBlocks(after[n]).join("\n") !== rlsBlocks(before[n]).join("\n")) problems.push(`${n}: a personalization <rls> block would change`);
      }
      if (problems.length) { fail(`${problems.join("; ")} (nothing written)`); continue; }
      const changed = [...touched].filter((n) => after[n] !== before[n] || flags["always-write"]);
      if (flags.show) for (const n of changed) { const b = rTags(before[n]).map((m) => m[0]), a = rTags(after[n]).map((m) => m[0]); a.forEach((t, i) => { if (t !== b[i]) console.log(`    ${n}\n      - ${b[i]}\n      + ${t}`); }); }
      const inherited = changed.filter((n) => fromStdValues.has(n));
      const what = `${list.length} rendering(s) in ${[...touched].join(" + ")}${inherited.length ? ` (${inherited.join(", ")} inherited from standard values: the write stores it on the item)` : ""}`;
      if (dry) { console.log(`DRY ${it.path}: ${what}; ${changed.length ? `would write ${changed.join(" + ")}` : "already set, nothing to write"}`); okCount++; continue; }
      if (!changed.length) {
        const bad = list.flatMap((e) => checkEntry(before[LAYOUT_FIELDS.find((n) => matchTags(before[n], e).length)], e).map((x) => `${label(e)} ${x}`));
        if (bad.length) { fail(`not set: ${bad.join("; ")}`); continue; }
        console.log(`✔ ${it.path}: ${what}; already set, not written`); okCount++; continue;
      }
      const g = spawnSync(process.execPath, [join(HARNESS, "scripts", "guard-customer.mjs"), "sitecore-path", customer, it.path], { encoding: "utf8" });
      if (g.status !== 0) { fail(`guard-customer refused: ${(g.stdout + g.stderr).trim().split("\n").pop()}`); continue; }
      mkdirSync(backupDir, { recursive: true });
      const backups = changed.map((n) => { const p = join(backupDir, `layout-backup-${norm(it.itemId)}${n === "__Renderings" ? "-shared" : ""}.xml`); writeFileSync(p, before[n]); return p; });
      await update(it.itemId, it.version, changed.map((n) => ({ name: n, value: after[n] })));
      const back = await read(it.itemId);
      const got = Object.fromEntries(LAYOUT_FIELDS.map((n) => [n, back?.fields?.nodes?.find((f) => f.name === n)?.value ?? ""]));
      const bad = [];
      for (const e of list) { const n = LAYOUT_FIELDS.find((f) => matchTags(after[f], e).length); bad.push(...checkEntry(got[n], e).map((x) => `${label(e)} ${x}`)); }
      for (const n of changed) {
        if (rTags(got[n]).length !== rTags(before[n]).length) bad.push(`${n}: ${rTags(got[n]).length} renderings read back, ${rTags(before[n]).length} before`);
        if (rlsBlocks(got[n]).length !== rlsBlocks(before[n]).length) bad.push(`${n}: ${rlsBlocks(got[n]).length} personalization blocks read back, ${rlsBlocks(before[n]).length} before`);
      }
      if (bad.length) { fail(`WRITTEN but the read-back disagrees: ${bad.join("; ")}; restore from ${backups.join(", ")}`); continue; }
      console.log(`✔ ${it.path}: ${what}; written and read back (backup ${backups.map((p) => p.split(/[\\/]/).pop()).join(", ")})`); okCount++;
    } catch (e) { fail(String(e.message).slice(0, 300)); }
  }
  console.log(`${dry ? "DRY RUN: " : ""}${okCount} item(s) OK, ${failed.length} failed (${entries.length} entr${entries.length === 1 ? "y" : "ies"}, ${groups.size} item(s), one login)`);
  if (failed.length) { console.log(`Failed items:\n${failed.map((f) => `  - ${f}`).join("\n")}`); process.exit(1); }
}
import { fileURLToPath } from "node:url";
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => die(e.message, 1));
