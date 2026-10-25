#!/usr/bin/env node
/**
 * Attach the uploaded imagery to the components that should show it, also after the run.
 * Uploading to Content Hub is not attaching: an Image field left empty renders nothing (section-capture reports it as IMAGES).
 *
 *   node harness/scripts/attach-images.mjs <customer>            dry run: prints the proposal, writes attach-images.md, changes nothing
 *   node harness/scripts/attach-images.mjs <customer> --apply    writes each proposed Image field (Authoring GraphQL, master) and reads it back
 *   add --page /Home/membership                                  one page only
 *
 * The chain it rebuilds, per planned section with a liveSection:
 *   live images of that band (sections*.json images[] + backgroundImages, in capture order)
 *   → their upload in images/image-manifest.json (matched by the live URL, `src`) → imageFieldXml
 *   → the placed component (Edge layout of the page, headless-main, aligned to the plan by component name)
 *   → its datasource item and child items (Authoring GraphQL) → their EMPTY Image fields, in field then child order.
 * Live image n goes to empty field n. Filled fields are never overwritten. Sections whose component has no Image field are
 * listed (the component cannot show the prospect's imagery: a component choice problem, not an attach problem).
 * Afterwards (localhost reads master through the preview context: no publish needed): re-run the section compares (looks-gates.mjs); run-gate.mjs fails on IMAGES until every section shows its imagery.
 * Exit 0 nothing left to attach (or applied cleanly) · 1 something could not be attached · 3 no Authoring client / Edge context.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, parseArgs, readJson, rootRel, safeWrite, ENV, authoringClient, customerApp, imageError, readRegistry, fileHash } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: attach-images.mjs <customer> [--apply] [--page /Home/x]");
const apply = !!flags.apply, onlyPage = flags.page && flags.page !== true ? String(flags.page).toLowerCase() : null;
const demo = demoDir(customer), lang = ENV.SITECORE_DEFAULT_LANGUAGE || "en";
const plan = parseYaml(readFileSync(join(demo, "demo-plan.yaml"), "utf8"));
const manifest = readJson(join(demo, "images", "image-manifest.json"), []);
const site = readJson(join(demo, "site.json"))?.siteName || plan?.site?.siteName;

// Edge (what the page really renders) with the app's own context id
const appEnv = (() => { try { return Object.fromEntries(readFileSync(join(customerApp(customer), ".env.local"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim()])); } catch { return {}; } })();
const ctx = appEnv.SITECORE_EDGE_CONTEXT_ID || appEnv.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || ENV.SITECORE_EDGE_CONTEXT_ID;
if (!ctx || !site) die("No Edge context id (customer app .env.local) or site name (site.json)", 3);
const edge = async (route) => {
  const r = await fetch(`https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=${encodeURIComponent(ctx)}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: `{ layout(site: ${JSON.stringify(site)}, routePath: ${JSON.stringify(route)}, language: ${JSON.stringify(lang)}) { item { rendered } } }` }) });
  return (await r.json())?.data?.layout?.item?.rendered?.sitecore?.route ?? null;
};
let gql; try { gql = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`, 1); }
if (!gql) die("No Authoring GraphQL client (SITECORE_CM_HOST + automation client in harness/.env.local)", 3);

// registry id -> rendering componentName (same lookup as run-gate check 8)
const names = new Map([...readRegistry(customer)].map(([id, e]) => [id, e.name]));
const planned = (s) => (s?.new?.name ? String(s.new.name) : names.get(s?.component) || String(s?.component || ""));
const byUrl = new Map(manifest.filter((m) => m.src && m.imageFieldXml).map((m) => [String(m.src).split("?")[0], m]));
const ITEM = `query($id:ID!,$lang:String!){ item(where:{itemId:$id,database:"master",language:$lang}){ itemId path version fields(ownFields:false){ nodes{ name value templateField{ type } } }
  children(first:100){ nodes{ itemId path version fields(ownFields:false){ nodes{ name value templateField{ type } } } } } } }`;
// Image fields a visitor sees: not standard (__) fields, not SEO / social / metadata images (Open Graph, thumbnails, favicons) inherited from base templates
// which image a field value is: Content Hub dam-id, Media Library id, or src
const ident = (v) => { const s = String(v ?? ""); return (s.match(/dam-id="([^"]+)"/i)?.[1] ?? s.match(/mediaid="([^"]+)"/i)?.[1]?.replace(/[{}-]/g, "") ?? s.match(/src="([^"?]+)/i)?.[1] ?? "").toLowerCase(); };
// the same picture can be uploaded twice under different names: compare the downloaded files too
const fileHashOfIdent = new Map(manifest.filter((m) => m.imageFieldXml).map((m) => { const p = [m.localPath, m.localFile, m.localFileName && join(demo, "images", m.localFileName)].filter(Boolean).find((x) => existsSync(x)); return [ident(m.imageFieldXml), p ? fileHash(p) : null]; }));
// a Media Library image outside this site's own media folder (another site's mockups: the template samples new items inherit) → its path, else null
const siteInfo = readJson(join(demo, "site.json")) ?? {};
const OWN_MEDIA = `/sitecore/media library/project/${siteInfo.collection ?? ""}/${siteInfo.siteName ?? ""}`.toLowerCase();
const mediaPaths = new Map();
const isForeign = async (v) => {
  const id = String(v ?? "").match(/mediaid="([^"]+)"/i)?.[1]; if (!id) return null;
  if (!mediaPaths.has(id)) mediaPaths.set(id, (await gql(`query($id:ID!){ item(where:{itemId:$id,database:"master"}){ path } }`, { id }).catch(() => null))?.item?.path ?? "(missing media item)");
  const p = mediaPaths.get(id);
  return p.toLowerCase().startsWith(OWN_MEDIA + "/") ? null : p;
};
const SEO_IMAGE = /^(base)?og[A-Z_]|opengraph|meta|seo|social|twitter|thumbnail|favicon/i;
const imageFields = (it) => (it?.fields?.nodes ?? []).filter((f) => !f.name.startsWith("__") && !SEO_IMAGE.test(f.name) && /^image$/i.test(f.templateField?.type ?? "")).sort((a, b) => a.name.localeCompare(b.name, "en", { numeric: true }));

const rows = [], problems = [];
for (const p of plan.site.pages ?? []) {
  const file = p.sectionsFile ? String(p.sectionsFile) : /^\/home$/i.test(p.path) ? "sections.json" : null;
  if (!file || (onlyPage && String(p.path).toLowerCase() !== onlyPage)) continue;
  const cap = readJson(join(demo, file));
  const route = await edge(String(p.path).replace(/^\/home/i, "") || "/");
  if (!route) { problems.push(`${p.path}: no Edge layout (not published?)`); continue; }
  // A page design injects its body partial (the Event Hero) as PartialDesignDynamicPlaceholder. Count the components inside it.
  const expand = (list) => (list ?? []).flatMap((c) => (c.componentName === "PartialDesignDynamicPlaceholder" ? Object.values(c.placeholders ?? {}).flatMap(expand) : c.componentName ? [c] : []));
  const comps = expand(route.placeholders?.["headless-main"]);
  let ci = 0;
  for (const s of p.sections ?? []) {
    const want = planned(s);
    const at = comps.findIndex((c, i) => i >= ci && c.componentName === want);
    const comp = at >= 0 ? comps[at] : null; if (at >= 0) ci = at + 1;
    const band = s.liveSection != null ? cap?.sections?.find((x) => x.index === Number(s.liveSection)) : null;
    const urls = band ? [...(band.images ?? []).map((i) => i.src), ...(band.backgroundImages ?? []).map((b) => b?.url ?? b)].map((u) => String(u ?? "").split("?")[0]).filter((u) => /^https?:/.test(u)) : [];
    // sections WITHOUT live imagery are checked too: a template sample image there must be removed
    const where = `${p.path} #${s.position} ${want}`;
    if (!comp) { if (urls.length) problems.push(`${where}: the planned component is not on the page`); continue; }
    // no datasource: the component renders the page's own fields (e.g. BlogArticle), so the page item is the target. Its children are pages, never slots.
    const target = comp.dataSource || route.itemId;
    if (!target) { problems.push(`${where}: placed without a datasource and the page id is unknown`); continue; }
    const ds = (await gql(ITEM, { id: target, lang })).item;
    // Parent fields come from new.fields. Child items (logo, card, split row) use new.children, which is where Image usually lives.
    const declaredNames = (list) => (Array.isArray(list) ? new Set(list.map((x) => String(x?.name ?? x).toLowerCase())) : null);
    const parentDeclared = declaredNames(s.new?.fields);
    const childDeclared = declaredNames(s.new?.children) ?? parentDeclared;
    const items = comp.dataSource ? [ds, ...(ds?.children?.nodes ?? [])] : [ds];
    const slots = items.flatMap((it, i) => imageFields(it).filter((f) => {
      const declared = comp.dataSource && i > 0 ? childDeclared : parentDeclared;
      return !declared || declared.has(f.name.toLowerCase());
    }).map((f) => ({ it, f })));
    if (!slots.length) { if (urls.length) problems.push(`${where}: ${comp.componentName} has no Image field, it cannot show the ${urls.length} live image(s): pick a component with images (or fit: new)`); continue; }
    // What each slot holds: empty, one of this section's live images, or FOREIGN (a Media Library item outside this site's own media:
    // the template sample images new items inherit, e.g. another site's mockups). Content Hub links and the site's own media are kept.
    for (const sl of slots) { sl.ident = ident(sl.f.value); sl.foreign = await isForeign(sl.f.value); }
    const label = (sl) => `${sl.it.path.split("/").pop()} · ${sl.f.name}`;
    // small live images (icons, logos) prefer icon/logo fields; photos prefer the other image fields
    const sizeOf = new Map((band?.images ?? []).map((i) => [String(i.src ?? "").split("?")[0], i]));
    const expected = urls.map((u) => ({ u, m: byUrl.get(u), small: (sizeOf.get(u)?.w ?? 999) <= 120 && (sizeOf.get(u)?.h ?? 999) <= 120 }));
    for (const { u, m } of expected) if (!m) rows.push({ where, image: u.split("/").pop(), field: "-", action: "NOT UPLOADED (not in image-manifest.json)" });
    // in place = the same asset, or the same file uploaded under another name
    const holds = (sl, m) => sl.ident && (sl.ident === ident(m.imageFieldXml) || (fileHashOfIdent.get(sl.ident) && fileHashOfIdent.get(sl.ident) === fileHashOfIdent.get(ident(m.imageFieldXml))));
    const inPlace = (m) => slots.find((sl) => holds(sl, m));
    for (const { m } of expected.filter(({ m }) => m && inPlace(m))) rows.push({ where, image: m.localFileName, field: label(inPlace(m)), action: "already in place" });
    const todo = expected.filter(({ m }) => m && !inPlace(m));
    // missing live images go into empty or foreign slots; foreign slots left over are cleared
    const free = slots.filter((sl) => !String(sl.f.value ?? "").trim() || sl.foreign);
    const iconish = (sl) => /icon|logo/i.test(sl.f.name);
    const taken = new Set();
    for (const { m, small } of todo) {
      const pool = free.filter((sl) => !taken.has(sl));
      const sl = pool.find((x) => iconish(x) === small) ?? pool[0];
      if (!sl) { rows.push({ where, image: m.localFileName, field: "-", action: "no free Image field (every field holds this site's own images)" }); continue; }
      taken.add(sl);
      rows.push({ where, image: m.localFileName, field: label(sl), action: apply ? "write" : "would write", replaces: sl.foreign ?? null, itemId: sl.it.itemId, version: sl.it.version, name: sl.f.name, value: m.imageFieldXml });
    }
    for (const sl of free.filter((x) => !taken.has(x) && x.foreign)) rows.push({ where, image: `(sample: ${sl.foreign.split("/").slice(-2).join("/")})`, field: label(sl), action: apply ? "clear" : "would clear", itemId: sl.it.itemId, version: sl.it.version, name: sl.f.name, value: "" });
  }
}

let written = 0, failed = 0;
if (apply) for (const r of rows.filter((x) => x.action === "write" || x.action === "clear")) {
  if (imageError(r.value)) { r.action = `refused: ${imageError(r.value)}`; failed++; continue; }
  const clearing = r.action === "clear";
  try {
    await gql(`mutation($id:ID!,$lang:String!,$ver:Int,$name:String!,$value:String!){ updateItem(input:{itemId:$id,database:"master",language:$lang,version:$ver,fields:[{name:$name,value:$value}]}){ item{ itemId } } }`, { id: r.itemId, lang, ver: r.version, name: r.name, value: r.value });
    const back = (await gql(ITEM, { id: r.itemId, lang })).item?.fields?.nodes?.find((f) => f.name === r.name)?.value;
    if ((back ?? "") === r.value) { r.action = clearing ? "sample cleared, read back" : "written, read back"; written++; } else { r.action = "WRITTEN but read-back differs"; failed++; }
  } catch (e) { r.action = `FAILED: ${e.message.slice(0, 120)}`; failed++; }
}

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|");
let md = `# Attach images — ${customer} (${apply ? "applied" : "dry run"})\n\n| Section | Image | Field (item · field) | Action |\n|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.where)} | ${cell(r.image)} | ${cell(r.field)} | ${cell(r.action)} |\n`;
if (problems.length) md += `\n## Cannot attach\n${problems.map((x) => `- ${x}`).join("\n")}\n`;
const report = join(demo, onlyPage ? `attach-images-${onlyPage.split("/").pop() || "home"}.md` : "attach-images.md");   // a one-page run never overwrites the full report
safeWrite(customer, report, md);
const count = (rx) => rows.filter((r) => rx.test(r.action)).length;
const todo = count(/^(would write|would clear|write|clear)$/);
console.log(`${count(/./) - count(/clear/)} live image(s) on planned sections: ${count(/already in place/)} already in place, ${apply ? `${written} written or cleared, ${failed} failed` : `${count(/would write/)} would be written, ${count(/would clear/)} sample image(s) would be cleared`}, ${problems.length} section(s) cannot take images → ${rootRel(report)}`);
for (const x of problems) console.log(`✖ ${x}`);
if (!apply && todo) console.log(`Dry run: nothing changed. Review ${rootRel(report)}, then: node harness/scripts/attach-images.mjs ${customer} --apply (then node harness/scripts/looks-gates.mjs ${customer}).`);
process.exit(failed || problems.length ? 1 : 0);
