#!/usr/bin/env node
/**
 * validate-site-plan.mjs — the page tree and per-page sections in demo-plan.yaml must be buildable and tied to the story.
 *
 *   node harness/scripts/validate-site-plan.mjs <customer>
 *
 * Reads the customer's demo-plan.yaml (`story.moments`, `site.pages`) and its docs/ai/catalog/component-registry.yaml.
 * Writes site-plan.md beside the plan (the page-tree + per-page component tables for the approval screen).
 * Exit 1 if a REQUIRED rule fails. Dependency-free.
 *
 *  P1 exactly one /Home; every other page's parent is in the plan and listed before it
 *  P2 page names unique per parent, kebab-case; pageType is page | article | landing
 *  P3 every page has a purpose and proves >=1 valid moment (or is a navTarget with a reason)
 *  P4 every moment is proved by >=1 page; the WOW moment is on /Home or one click away
 *  P5 every section uses a component id from component-registry.yaml and one of its variants
 *  P6 header / footer are NOT sections (they come from the Page Design partials)
 *  P7 (page type "page") each page has 2-12 sections; (landing) none, content lives on the page template fields
 *  P8 every section says where its content comes from (transcript | site | illustrative)
 *  P9 (when nav.json exists) every top-level item of the prospect's header menu has a page; menu-only pages are `navTarget: true`
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, registryPath, rootRel } from "./_lib.mjs";

const client = process.argv[2];
if (!client) die("Usage: validate-site-plan.mjs <customer>");
const demo = demoDir(client);
const planPath = join(demo, "demo-plan.yaml");
if (!existsSync(planPath)) die(`${rootRel(planPath)} not found`);
const regPath = registryPath(client);

// ── YAML subset reader (same as validate-story.mjs) ──
function parseYaml(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, t: raw.trim() })).filter((l) => l.t && !l.t.startsWith("#"));
  let i = 0;
  const scalar = (v) => {
    v = v.trim();
    if (/^\{.*\}$/.test(v)) { // inline map { a: 1, b: "x, y" }
      const o = {}, inner = v.slice(1, -1); let depth = 0, q = null, cur = ""; const parts = [];
      for (const ch of inner) { if (q) { if (ch === q) q = null; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === "[" || ch === "{") depth++; if (ch === "]" || ch === "}") depth--; if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; } cur += ch; }
      if (cur.trim()) parts.push(cur);
      for (const p of parts) { const k = p.indexOf(":"); if (k > 0) o[p.slice(0, k).trim()] = scalar(p.slice(k + 1)); }
      return o;
    }
    if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map((x) => scalar(x)).filter((x) => x !== "");
    { const qm = v.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')\s+#.*$/); if (qm) v = qm[1]; }   // quoted value followed by a comment
    if (/^".*"$/.test(v)) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
    if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
    if (v === "true") return true; if (v === "false") return false; if (v === "null" || v === "~") return null;
    return v.replace(/\s+#.*$/, "");
  };
  function block() { if (i >= lines.length) return null; return lines[i].t.startsWith("- ") || lines[i].t === "-" ? list(lines[i].indent) : map(lines[i].indent); }
  function map(indent) {
    const o = {};
    while (i < lines.length && lines[i].indent === indent && !lines[i].t.startsWith("- ")) {
      const m = lines[i].t.match(/^([^:]+?):\s*(.*)$/); if (!m) { i++; continue; }
      i++;
      if (m[2] === "") o[m[1]] = i < lines.length && lines[i].indent > indent ? block() : (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("- ") ? list(indent) : null);
      else o[m[1]] = scalar(m[2]);
    }
    return o;
  }
  function list(indent) {
    const a = [];
    while (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("-")) {
      const rest = lines[i].t.replace(/^-\s*/, "");
      if (!rest) { i++; a.push(i < lines.length && lines[i].indent > indent ? block() : null); continue; }
      const m = rest.match(/^([^:"'\[{]+?):\s*(.*)$/);
      if (m) { const ci = indent + (lines[i].t.length - rest.length); lines[i] = { raw: lines[i].raw, indent: ci, t: rest }; a.push(map(ci)); }
      else { a.push(scalar(rest)); i++; }
    }
    return a;
  }
  return map(lines[0]?.indent ?? 0);
}

let plan;
try { plan = parseYaml(readFileSync(planPath, "utf8")); } catch (e) { die(`Could not read demo-plan.yaml: ${e.message}`); }
const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const has = (v) => v != null && String(v).trim() !== "" && !/^(tbd|todo)$/i.test(String(v).trim());
const moments = arr(plan.story?.moments), pages = arr(plan.site?.pages);
const momentIds = new Set(moments.map((m) => m.id));

// registry: id -> variants[]
const reg = new Map();
for (const blk of readFileSync(regPath, "utf8").split(/\n  - id:\s*/).slice(1)) {
  const id = blk.split(/\r?\n/)[0].trim();
  const v = (blk.match(/^\s*variants:\s*\[([^\]]*)\]/m) ?? [])[1];
  reg.set(id, v ? v.split(",").map((x) => x.trim()).filter(Boolean) : []);
}
const CHROME = new Set(["navigation-header", "footer", "announcement-bar-nav"]);

const newComps = [];   // sections / chrome entries that specify a NEW component
const results = []; const add = (id, level, ok, detail = "") => results.push({ id, level, ok, detail });
const norm = (p) => String(p ?? "").replace(/\/+$/, "") || "/";
const paths = pages.map((p) => norm(p.path));

// P1
const homes = pages.filter((p) => norm(p.path).toLowerCase() === "/home");
const p1 = [];
if (homes.length !== 1) p1.push(`need exactly one /Home page (found ${homes.length})`);
pages.forEach((p, idx) => {
  const path = norm(p.path); if (path.toLowerCase() === "/home") return;
  const parent = path.slice(0, path.lastIndexOf("/")) || "/Home";
  const pi = paths.findIndex((x) => x.toLowerCase() === parent.toLowerCase());
  if (!path.toLowerCase().startsWith("/home/")) p1.push(`${path}: must be under /Home (e.g. /Home/products)`);
  else if (pi < 0) p1.push(`${path}: parent ${parent} is not in the plan`);
  else if (pi > idx) p1.push(`${path}: listed before its parent ${parent}`);
});
add("P1 one /Home; every page's parent is in the plan and listed first", "required", pages.length > 0 && p1.length === 0, p1.join("; ") || `${pages.length} page(s)`);

// P2
const p2 = []; const seen = new Set();
for (const p of pages) {
  const path = norm(p.path), name = path.split("/").pop();
  if (seen.has(path.toLowerCase())) p2.push(`${path}: duplicate`); seen.add(path.toLowerCase());
  if (path.toLowerCase() !== "/home" && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(name)) p2.push(`${path}: name must be lower-case kebab`);
  if (!["page", "article", "landing"].includes(p.pageType)) p2.push(`${path}: pageType must be page|article|landing`);
}
add("P2 unique kebab-case names; pageType page|article|landing", "required", p2.length === 0, p2.join("; "));

// P3
const p3 = [];
for (const p of pages) {
  const prov = arr(p.proves), bad = prov.filter((m) => !momentIds.has(m));
  if (!has(p.purpose)) p3.push(`${norm(p.path)}: no purpose`);
  if (bad.length) p3.push(`${norm(p.path)}: unknown moment ${bad.join(",")}`);
  if (!prov.length && !(p.navTarget === true && has(p.navReason))) p3.push(`${norm(p.path)}: proves no moment (add one, or navTarget: true with navReason)`);
}
for (const p of pages) if (p.navGroup !== undefined && !["main", "eyebrow", "none"].includes(p.navGroup)) p3.push(`${norm(p.path)}: navGroup must be main | eyebrow | none`);
for (const p of pages) if (p.navGroup === "main" && norm(p.path).split("/").filter(Boolean).length !== 2) p3.push(`${norm(p.path)}: navGroup: main is only for pages directly under /Home (top level of the main menu); deeper pages are none`);
add("P3 every page has a purpose and proves a moment (or is a justified nav target)", "required", p3.length === 0, p3.join("; "));

// P4
const proved = new Set(pages.flatMap((p) => arr(p.proves)));
const lost = [...momentIds].filter((m) => !proved.has(m));
const wow = moments.find((m) => m.wow === true);
let wowOk = true, wowDetail = "";
if (wow) {
  const wp = pages.filter((p) => arr(p.proves).includes(wow.id)).map((p) => norm(p.path));
  wowOk = wp.some((x) => x.toLowerCase() === "/home" || x.split("/").length <= 3);
  wowDetail = wowOk ? `WOW ${wow.id} on ${wp.join(", ")}` : `WOW moment ${wow.id} is only on ${wp.join(", ") || "no page"} — put it on /Home or one click from it`;
}
add("P4 every moment is proved by a page; the WOW moment is on /Home or one click away", "required", lost.length === 0 && wowOk, [lost.length ? `no page proves: ${lost.join(", ")}` : "", wowDetail].filter(Boolean).join("; "));

// P5-P8
const p5 = [], p6 = [], p7 = [], p8 = [];
for (const p of pages) {
  const path = norm(p.path), secs = arr(p.sections);
  for (const s of secs) {
    if (typeof s !== "object" || s == null) { p5.push(`${path}: a section is not a map (position/component/variant/contentSource)`); continue; }
    const c = s.component;
    if (CHROME.has(c)) { p6.push(`${path}: ${c}`); continue; }
    if (s.fit === "new" || s.new) {   // a NEW component: needs a spec instead of a registry id
      const n = s.new ?? {}, at = `${path} #${s.position ?? "?"}`;
      if (!/^[A-Z][A-Za-z0-9]+$/.test(n.name ?? "")) p5.push(`${at}: new component needs new.name (PascalCase, describes the function)`);
      else if (!["simple", "list", "context"].includes(n.kind)) p5.push(`${at}: new.kind must be simple | list | context`);
      else if (!arr(n.fields).length && !has(n.behaviour)) p5.push(`${at}: new component needs new.fields and/or new.behaviour`);
      else if (!has(s.fitReason)) p5.push(`${at}: new component needs fitReason (what is missing in the registry)`);
      else newComps.push({ name: n.name, kind: n.kind, cms: n.cms !== false, where: path, placement: n.placement ?? "body", reason: s.fitReason, behaviour: n.behaviour });
      if (!["transcript", "site", "illustrative"].includes(s.contentSource)) p8.push(`${at}: contentSource`);
      continue;
    }
    if (!reg.has(c)) { p5.push(`${path} #${s.position ?? "?"}: unknown component "${c}": a typo, or a NEW component? If the registry cannot do it set fit: new plus a new: spec (site-analyzer, step 4)`); continue; }
    if (s.look != null && !/^[A-Z][A-Za-z0-9]*$/.test(String(s.look))) p5.push(`${path} #${s.position ?? "?"}: look "${s.look}" must be PascalCase alphanumeric (ImageLeft)`);
    const v = s.variant || "Default";
    if (reg.get(c).length && !reg.get(c).includes(v)) p5.push(`${path} #${s.position ?? "?"}: ${c} has no variant "${v}" (has ${reg.get(c).join(", ")})`);
    if (!["transcript", "site", "illustrative"].includes(s.contentSource)) p8.push(`${path} #${s.position ?? "?"}: contentSource`);
  }
  if (p.pageType === "page" && p.navTarget === true && secs.length > 2) p7.push(`${path}: navigation page should have at most 2 sections`);
  else if (p.pageType === "page" && p.navTarget !== true && (secs.length < 2 || secs.length > 12)) p7.push(`${path}: ${secs.length} sections`);
  if (p.pageType === "landing" && secs.length) p7.push(`${path}: landing pages use template fields, not sections`);
}
add("P5 every section is a registry component with a real variant, or a fully specified NEW component", "required", p5.length === 0, p5.slice(0, 6).join("; "));
add("P6 header / footer are not sections (they come from the Page Design partials)", "required", p6.length === 0, p6.join("; ") + (p6.length ? " — remove them; the Page Design already renders them" : ""));
add("P7 page sections: 2-12 per page (landing: none)", "recommended", p7.length === 0, p7.join("; "));
// P9: information architecture mirrors the prospect's header menu (nav.json from nav-extract.mjs)
const navP = join(demo, "nav.json");
if (existsSync(navP)) {
  let nav = null; try { nav = JSON.parse(readFileSync(navP, "utf8")); } catch { /* ignore */ }
  const slug = (t) => String(t).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const have = new Set(pages.flatMap((p) => [slug(p.displayName ?? ""), norm(p.path).split("/").pop()]));
  const miss = (nav?.items ?? []).filter((i) => !i.utility && !/^https?:\/\//i.test(i.href || "") ).filter((i) => !have.has(slug(i.label))).map((i) => i.label);
  add("P9 every top-level item of the prospect's header menu has a page (navigation pages are fine)", "recommended", miss.length === 0, miss.length ? `no page for: ${miss.slice(0, 12).join(", ")}` : `${(nav?.items ?? []).length} menu items checked`);
}
add("P8 every section names its content source (transcript | site | illustrative)", "required", p8.length === 0, p8.slice(0, 6).join("; "));
// P10: the fit check was done (reuse | variant | new) for every section; variants say why
const p10 = [];
for (const p of pages) for (const s of arr(p.sections)) {
  if (typeof s !== "object" || s == null || CHROME.has(s.component)) continue;
  if (!["reuse", "variant", "new"].includes(s.fit)) p10.push(`${norm(p.path)} #${s.position ?? "?"}: no fit (reuse | variant | new)`);
  else if (s.fit === "variant" && !has(s.fitReason)) p10.push(`${norm(p.path)} #${s.position ?? "?"}: fit: variant needs fitReason (what differs)`);
}
add("P10 every section went through the fit check (reuse | variant | new)", "recommended", p10.length === 0, p10.slice(0, 6).join("; "));
// P15: every moment lists its clickPath (ordered page paths the SE clicks through, including intermediate/landing pages); each page must be in the plan.
// Pages on a clickPath are visited pages: P14 then requires them to mirror their live page.
const onPath = new Set(), p15 = [];
for (const m of moments) {
  const cp = arr(m.clickPath).map((x) => norm(String(x).split(/\s+[(|]/)[0].trim()).toLowerCase());
  if (!cp.length) { p15.push(`${m.id}: no clickPath (list every page the SE clicks through, in order, starting at /Home)`); continue; }
  for (const x of cp) { onPath.add(x); if (!paths.some((q) => q.toLowerCase() === x)) p15.push(`${m.id}: clickPath page ${x} is not in site.pages`); }
}
add("P15 every moment has a clickPath whose pages all exist in the plan", "required", p15.length === 0, p15.slice(0, 4).join("; "));
// P14: a menu page (navTarget) exists so the menu matches. If the demo NAVIGATES to it (a moment proves something there: proves not empty, or visit: true) it MIRRORS its live page
// (liveUrl + sectionsFile, then P12 applies). Otherwise it is a title-only stub: its section carries its own look (e.g. PageTitle) so no empty-field placeholders show.
const p14 = [];
{
  const srcUrl14 = String(plan.client?.sourceUrl ?? ""), real14 = /^https?:\/\//.test(srcUrl14) && !/example\.com/.test(srcUrl14);
  for (const p of pages) if (real14 && p.navTarget === true) {
    const visited = p.visit === true || arr(p.proves).length > 0 || onPath.has(norm(p.path).toLowerCase());
    if (visited) { if (!has(p.liveUrl) && p.titleOnly !== true) p14.push(`${norm(p.path)}: the demo navigates here, so it needs liveUrl (from nav.json) + sectionsFile, or titleOnly: true + titleOnlyReason`); }
    else for (const s of arr(p.sections)) if (typeof s === "object" && s && !CHROME.has(s.component) && !has(s.look)) p14.push(`${norm(p.path)} #${s.position ?? "?"}: a menu-only stub needs look (e.g. PageTitle)`);
    if (p.titleOnly === true && !has(p.titleOnlyReason)) p14.push(`${norm(p.path)}: titleOnly needs titleOnlyReason`);
  }
}
add("P14 pages the demo navigates to mirror their live page; menu-only pages are title-only stubs with a look", "required", p14.length === 0, p14.slice(0, 4).join("; "));
// P12: a page that exists on the prospect's live site MIRRORS it. Every section maps to a measured live section (liveSection = # in sections.md) or is explicitly ADDED with a reason.
// P13: the measurements exist (header-styles.json, nav.json, sections.json + crops) when the prospect has a URL
{
  const srcUrl = String(plan.client?.sourceUrl ?? ""), real = /^https?:\/\//.test(srcUrl) && !/example\.com/.test(srcUrl);
  let live = null; try { live = JSON.parse(readFileSync(join(demo, "sections.json"), "utf8")); } catch { /* not captured yet */ }
  const idxOf = (f) => { let j = null; try { j = JSON.parse(readFileSync(join(demo, f), "utf8")); } catch { /* not captured */ } return new Set(arr(j?.sections).filter((x) => x.kind !== "footer").map((x) => x.index)); };
  const liveIdx = new Set(arr(live?.sections).filter((x) => x.kind !== "footer").map((x) => x.index)), p12 = [], covered = new Set(), added = [];
  for (const p of pages) {
    const mirrored = has(p.liveUrl) || (real && norm(p.path).toLowerCase() === "/home");
    if (!mirrored) continue;
    // other mirrored pages are captured to their own file: section-capture --out sections-<slug>.json, named in `sectionsFile` on the page
    const pIdx = has(p.sectionsFile) ? idxOf(String(p.sectionsFile)) : liveIdx;
    if (has(p.sectionsFile) && !pIdx.size) p12.push(`${norm(p.path)}: sectionsFile ${p.sectionsFile} is missing or empty: run section-capture --url <live page url> --out ${p.sectionsFile}`);
    for (const s of arr(p.sections)) {
      if (typeof s !== "object" || s == null || CHROME.has(s.component)) continue;
      const at = `${norm(p.path)} #${s.position ?? "?"}`;
      if (s.added === true) { if (!has(s.addedReason)) p12.push(`${at}: added: true needs addedReason`); else added.push(at); continue; }
      if (s.liveSection == null) p12.push(`${at}: mirrored page, so a section needs liveSection (# from sections.md) or added: true + addedReason`);
      else if (pIdx.size && !pIdx.has(Number(s.liveSection))) p12.push(`${at}: liveSection ${s.liveSection} is not in ${p.sectionsFile || "sections.json"}`);
      else if (!has(p.sectionsFile)) covered.add(Number(s.liveSection));
      if (s.contentSource === "illustrative") p12.push(`${at}: a mirrored section uses the live copy (contentSource: site), not illustrative text`);
    }
  }
  add("P12 pages that exist on the prospect's site mirror it (every section = a live section, or explicitly added with a reason)", real ? "required" : "recommended", p12.length === 0, p12.slice(0, 6).join("; "));
  const missing = [...liveIdx].filter((i) => !covered.has(i));
  if (live && real) add("P12b every live homepage section is in the plan (or consciously dropped)", "recommended", missing.length === 0, missing.length ? `live sections not planned: ${missing.join(", ")}` : `${liveIdx.size} live sections covered, ${added.length} added`);
  const need = ["header-styles.json", "nav.json", "sections.json"].filter((f) => !existsSync(join(demo, f)));
  if (real) add("P13 prospect measurements exist (header-styles, nav, sections + crops: Phase T3a)", "required", need.length === 0, need.length ? `missing ${need.join(", ")}: run Phase T3a` : "ok");
}
// P11: header-area features (site.chrome): eyebrow, search, language, login ... each with a delivery
const chrome = arr(plan.site?.chrome), p11 = [];
for (const f of chrome) {
  if (typeof f !== "object" || f == null || !has(f.feature)) { p11.push("a site.chrome entry has no feature name"); continue; }
  if (!["reuse", "hardcoded-variant", "new", "not-built"].includes(f.delivery)) { p11.push(`${f.feature}: delivery must be reuse | hardcoded-variant | new | not-built`); continue; }
  if (f.delivery === "new") {
    const n = f.new ?? {};
    if (!/^[A-Z][A-Za-z0-9]+$/.test(n.name ?? "") || !["simple", "list", "context"].includes(n.kind) || !(arr(n.fields).length || has(n.behaviour)) || !has(f.fitReason)) p11.push(`${f.feature}: delivery new needs fitReason and new: {name, kind, fields|behaviour, placement}`);
    else if (!["eyebrow-left", "eyebrow-right", "header-right", "footer"].includes(n.placement)) p11.push(`${f.feature}: new.placement must be eyebrow-left | eyebrow-right | header-right | footer`);
    else newComps.push({ name: n.name, kind: n.kind, cms: n.cms === true, where: "(header area)", placement: n.placement, reason: f.fitReason, behaviour: n.behaviour });
  }
  if (f.delivery === "reuse" && !has(f.component)) p11.push(`${f.feature}: delivery reuse needs component`);
  if (f.delivery === "not-built" && !has(f.fitReason)) p11.push(`${f.feature}: not-built needs fitReason (the gate shows it)`);
}
add("P11 site.chrome: every header-area feature has a delivery (reuse | hardcoded-variant | new | not-built)", "required", p11.length === 0, p11.slice(0, 6).join("; "));
if (existsSync(join(demo, "nav.json")) && !chrome.length) add("P11b site.chrome is filled from the prospect's header (eyebrow, search, language, login, ...)", "recommended", false, "site.chrome is empty: list every header-area feature (site-analyzer, step 4)");

// ── approval-screen tables ──
const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
let md = `# Site plan — ${client}\n\nShow this on the approval screen. Source: ${rootRel(planPath)}\n\n## Page tree\n| Path | Display name | Type | Purpose | Proves moment | Why this page |\n|---|---|---|---|---|---|\n`;
for (const p of pages) md += `| ${cell(p.path)} | ${cell(p.displayName ?? "")} | ${cell(p.pageType)} | ${cell(p.purpose)} | ${arr(p.proves).join(", ") || "(navigation page)"} | ${cell(p.why ?? p.navReason ?? "")} |\n`;
md += `\n## Page by page\n`;
let nonDefault = 0;
for (const p of pages) {
  if (p.navTarget === true) continue;   // navigation pages are listed in the tree only
  md += `\n### ${cell(p.path)} — ${cell(p.purpose)}\n`;
  if (p.pageType === "landing") { md += `Landing page: content is filled in the page's template fields.\n`; continue; }
  md += `| # | Component | Variant | Content from | Note |\n|---|---|---|---|---|\n`;
  for (const s of arr(p.sections)) { if ((s.variant || "Default") !== "Default") nonDefault++; md += `| ${cell(s.position)} | ${cell(s.component)} | ${cell(s.variant || "Default")} | ${cell(s.contentSource)} | ${cell(s.note)} |\n`; }
}
if (newComps.length) {
  md += `\n## New components (not in the library: built for this demo)\n| Name | Kind | Editable in CMS | Where | Why new | Behaviour |\n|---|---|---|---|---|---|\n`;
  for (const n of newComps) md += `| ${cell(n.name)} | ${n.kind} | ${n.cms ? "yes" : "no (hardcoded)"} | ${cell(n.where)} (${n.placement}) | ${cell(n.reason)} | ${cell(n.behaviour ?? "")} |\n`;
}
if (chrome.length) {
  md += `\n## Header area\n| Feature | Delivery | Note |\n|---|---|---|\n`;
  for (const f of chrome) md += `| ${cell(f.feature)} | ${cell(f.delivery)}${f.component ? ` (${cell(f.component)})` : ""}${f.new?.name ? ` (new ${cell(f.new.name)})` : ""} | ${cell(f.fitReason ?? f.note ?? "")} |\n`;
  md += `\nHardcoded or not built elements are not editable in the CMS: say so at the gate.\n`;
}
md += `\n## Manual work to expect\n- Only the fixed "Always" lines (thumbnails, layout icons) and what a person alone can do (editing host login). Variants, partial designs, page designs, datasources, theme and images are built by the run.\n- Navigation pages (menu items no moment needs) are created as placeholders; nothing pauses the build for checks\n`;
try { mkdirSync(demo, { recursive: true }); writeFileSync(join(demo, "site-plan.md"), md); } catch { /* report only */ }

let failed = 0;
for (const r of results) { if (!r.ok && r.level === "required") failed++; console.log(`${r.ok ? "✅" : r.level === "required" ? "❌" : "⚠️"} ${r.id}${r.detail ? ` — ${r.detail}` : ""}`); }
console.log(failed ? `\n✖ ${failed} site-plan rule(s) failed. Fix demo-plan.yaml (site.pages) before presenting the plan.` : "\n✔ site plan is buildable and tied to the story");
console.log(`(approval-screen tables: ${rootRel(join(demo, "site-plan.md"))})`);
process.exit(failed ? 1 : 0);
