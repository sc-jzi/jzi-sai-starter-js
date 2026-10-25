#!/usr/bin/env node
/**
 * Set the headless VARIANT (rendering parameter FieldNames) of one component in layout XML, without touching anything else.
 * Used when the Marketer MCP has no argument for it (see .skills/sitecore-reference/references/placeholders-and-variants.md).
 *
 *  1. Pure XML patch (no network) — for the MCP route (read the item's layout field, patch, write it back with update_fields_on_item):
 *       node harness/scripts/layout-variant.mjs patch --xml-file <file> --variant "{GUID}" (--uid "{GUID}" | --rendering-id "{GUID}" [--ph "/headless-header"])  [--ds "{GUID}"] [--param Key=Value ...]
 *     prints the patched XML on stdout; exits 1 (nothing printed) when the rendering is not found or is ambiguous.
 *     --xml-file - reads stdin. Other s:par parameters (DynamicPlaceholderId, ...) are preserved.
 *  2. Authoring GraphQL route — reads the field, patches it, writes it back (needs SITECORE_CM_HOST + the automation client in harness/.env.local; the layout fields are STANDARD fields, so every field read uses ownFields:false):
 *       node harness/scripts/layout-variant.mjs apply --item "{partial or page item id}" --variant "{GUID}" (--uid ... | --rendering-id ... [--ph ...]) [--language en] [--dry-run]
 *  3. Plain field write (display names; same auth as 2):
 *       node harness/scripts/layout-variant.mjs set-field --item "{id}" --field "__Display name" --value "Contact Us" [--value-file <path>] [--language en] [--dry-run]
 *     prints OK when the read-back matches (exit 1 otherwise).
 *     (apply) Looks at "__Final Renderings" and "__Renderings", patches whichever contains the rendering, saves the original (real writes only) under <demo folder>/layout-backups/ with --customer <c>, else harness/.layout-backups/, as layout-backup-<item>.xml first.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { ENV, HARNESS, parseArgs, die, demoDir, authoringClient } from "./_lib.mjs";

const norm = (g) => String(g ?? "").trim().replace(/[{}]/g, "").toLowerCase();
const braced = (g) => `{${norm(g).toUpperCase()}}`;
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name.replace(":", "\\:")}="([^"]*)"`)); return m ? m[1] : null; };

/** Patch the s:par of one <r .../> entry. Returns { xml } or throws. */
export function patchVariant(xml, { variant, uid, renderingId, ph, ds, params = [] }) {
  const tags = [...xml.matchAll(/<r\b[^>]*?\/?>/g)].filter((m) => attr(m[0], "uid") !== null);
  const hits = tags.filter((m) => {
    if (uid) return norm(attr(m[0], "uid")) === norm(uid);
    return norm(attr(m[0], "s:id")) === norm(renderingId) && (!ph || attr(m[0], "s:ph") === ph);
  });
  if (hits.length !== 1) throw new Error(hits.length ? `${hits.length} renderings match; pass --uid or --ph to pick one` : "rendering not found in this layout field");
  const m = hits[0], tag = m[0];
  const raw = attr(tag, "s:par");
  const pairs = raw ? raw.replace(/&amp;/g, "&").split("&").filter(Boolean).map((p) => { const i = p.indexOf("="); return i < 0 ? [p, ""] : [p.slice(0, i), p.slice(i + 1)]; }) : [];
  const set = (k, v) => { const e = pairs.find((p) => p[0] === k); if (e) e[1] = v; else pairs.push([k, v]); };
  if (variant) set("FieldNames", encodeURIComponent(braced(variant)));
  for (const kv of params) { const i = kv.indexOf("="); set(kv.slice(0, i), encodeURIComponent(kv.slice(i + 1))); }
  const par = pairs.map(([k, v]) => `${k}=${v}`).join("&").replace(/&/g, "&amp;");
  const newTag = raw !== null ? tag.replace(/(\ss:par=")[^"]*(")/, (_, a, b) => a + par + b) : tag.replace(/\s?\/?>$/, (e) => ` s:par="${par}"${e.trim() === "/>" || e.endsWith("/>") ? " />" : ">"}`);
  let out = newTag;
  if (ds) out = /\ss:ds="/.test(out) ? out.replace(/(\ss:ds=")[^"]*(")/, (_, a, b) => a + braced(ds) + b) : out.replace(/(\ss:id="[^"]*")/, `$1 s:ds="${braced(ds)}"`);
  return xml.slice(0, m.index) + out + xml.slice(m.index + tag.length);
}

async function main() {
  const { flags, pos } = parseArgs(process.argv.slice(2));
  const cmd = pos[0];
  const multi = (name) => { const out = []; const a = process.argv.slice(2); a.forEach((x, i) => { if (x === `--${name}` && a[i + 1]) out.push(a[i + 1]); }); return out; };
  const opts = { variant: flags.variant, ds: flags.ds, uid: flags.uid, renderingId: flags["rendering-id"], ph: flags.ph, params: multi("param") };
  if (cmd !== "set-field" && !opts.uid && !opts.renderingId) die("Pass --uid or --rendering-id");
  if (cmd === "patch") {
    const src = flags["xml-file"]; if (!src) die("--xml-file <file|-> required");
    const xml = src === "-" ? readFileSync(0, "utf8") : readFileSync(src, "utf8");
    try { process.stdout.write(patchVariant(xml, opts)); } catch (e) { die(e.message, 1); }
    return;
  }
  if (cmd !== "apply" && cmd !== "set-field") die("Usage: layout-variant.mjs patch|apply|set-field (see header of this file)");
  const item = flags.item, lang = flags.language && flags.language !== true ? flags.language : ENV.SITECORE_DEFAULT_LANGUAGE || "en";
  const cm = String(ENV.SITECORE_CM_HOST || "").replace(/\/+$/, "");
  if (!item) die("--item required");
  if (!cm) die("SITECORE_CM_HOST is not set in harness/.env.local (the CM host of the environment, e.g. https://xmc-xxxx.sitecorecloud.io). This script is the LAST route: do the same change through the MCP (get_content_item_by_id, layout-variant.mjs patch, update_fields_on_item, read back), which needs no CM host. See placeholders-and-variants.md section 3, Bulk rule.");
  // the shared Authoring client (_lib.mjs): one login, timeouts on every call
  let client = null;
  try { client = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`, 1); }
  if (!client) die("SITECORE_AUTOMATION_CLIENT_ID/SECRET missing in harness/.env.local");
  const gql = async (query, variables) => { try { return await client(query, variables); } catch (e) { die(e.message, 1); } };
  const data = await gql(`query($id:ID!,$lang:String!){ item(where:{itemId:$id,database:"master",language:$lang}){ itemId version fields(ownFields:false){ nodes{ name value } } } }`, { id: norm(item).toUpperCase(), lang });
  const it = data.item; if (!it) die(`item not found in language "${lang}"`);
  if (cmd === "set-field") {   // plain field write (e.g. "__Display name") on the item's latest version in --language
    const fname = flags.field;
    const fval = flags["value-file"] ? readFileSync(flags["value-file"], "utf8") : flags.value;
    if (!fname || fval === undefined || fval === true) die("set-field needs --field <name> and --value <text> or --value-file <path>");
    if (flags["dry-run"]) { console.log(`DRY RUN — would set "${fname}" = "${fval}" on ${item} (${lang}, v${it.version})`); return; }
    await gql(`mutation($id:ID!,$lang:String!,$ver:Int,$name:String!,$value:String!){ updateItem(input:{itemId:$id,database:"master",language:$lang,version:$ver,fields:[{name:$name,value:$value}]}){ item{ itemId } } }`, { id: norm(item).toUpperCase(), lang, ver: it.version, name: fname, value: String(fval) });
    const back = await gql(`query($id:ID!,$lang:String!){ item(where:{itemId:$id,database:"master",language:$lang}){ fields(ownFields:false){ nodes{ name value } } } }`, { id: norm(item).toUpperCase(), lang });
    const got = back.item?.fields?.nodes?.find((f) => f.name.toLowerCase() === String(fname).toLowerCase())?.value;
    console.log(got === String(fval) ? `OK: "${fname}" = "${got}" (${lang})` : `WRITTEN but read-back shows "${got ?? "(empty)"}": check the language/version of the item`);
    process.exit(got === String(fval) ? 0 : 1);
  }
  const fields = it.fields.nodes.filter((f) => /^__(Final )?Renderings$/.test(f.name) && f.value);
  let done = null;
  for (const f of fields) { try { done = { name: f.name, before: f.value, after: patchVariant(f.value, opts) }; break; } catch { /* try next field */ } }
  if (!done) die(`rendering not found in ${fields.map((f) => f.name).join(" / ") || "any layout field"} of the item`, 1);
  if (flags["dry-run"]) { console.log(`DRY RUN — would update ${done.name}\n` + done.after); return; }
  // the backup goes into the demo folder (--customer) or the git-ignored harness/.layout-backups/, never into the current directory
  const backupDir = flags.customer && flags.customer !== true ? join(demoDir(String(flags.customer)), "layout-backups") : join(HARNESS, ".layout-backups");
  mkdirSync(backupDir, { recursive: true });
  const backup = join(backupDir, `layout-backup-${norm(item)}.xml`);
  writeFileSync(backup, done.before);
  await gql(`mutation($id:ID!,$lang:String!,$ver:Int,$name:String!,$value:String!){ updateItem(input:{itemId:$id,database:"master",language:$lang,version:$ver,fields:[{name:$name,value:$value}]}){ item{ itemId } } }`, { id: norm(item).toUpperCase(), lang, ver: it.version, name: done.name, value: done.after });
  console.log(`Updated ${done.name} of ${item}; original saved to ${backup}. Re-read it (get_components_on_page) to confirm the variant.`);
}
import { fileURLToPath } from "node:url";
if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main().catch((e) => die(e.message, 1));
