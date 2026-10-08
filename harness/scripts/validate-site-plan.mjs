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
      for (const ch of inner) { if (q) { if (ch === q) q = null; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === "[") depth++; if (ch === "]") depth--; if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; } cur += ch; }
      if (cur.trim()) parts.push(cur);
      for (const p of parts) { const k = p.indexOf(":"); if (k > 0) o[p.slice(0, k).trim()] = scalar(p.slice(k + 1)); }
      return o;
    }
    if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map((x) => scalar(x)).filter((x) => x !== "");
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
    if (!reg.has(c)) { p5.push(`${path} #${s.position ?? "?"}: unknown component "${c}"`); continue; }
    const v = s.variant || "Default";
    if (reg.get(c).length && !reg.get(c).includes(v)) p5.push(`${path} #${s.position ?? "?"}: ${c} has no variant "${v}" (has ${reg.get(c).join(", ")})`);
    if (!["transcript", "site", "illustrative"].includes(s.contentSource)) p8.push(`${path} #${s.position ?? "?"}: contentSource`);
  }
  if (p.pageType === "page" && (secs.length < 2 || secs.length > 12)) p7.push(`${path}: ${secs.length} sections`);
  if (p.pageType === "landing" && secs.length) p7.push(`${path}: landing pages use template fields, not sections`);
}
add("P5 every section is a registry component with a real variant", "required", p5.length === 0, p5.slice(0, 6).join("; "));
add("P6 header / footer are not sections (they come from the Page Design partials)", "required", p6.length === 0, p6.join("; ") + (p6.length ? " — remove them; the Page Design already renders them" : ""));
add("P7 page sections: 2-12 per page (landing: none)", "recommended", p7.length === 0, p7.join("; "));
add("P8 every section names its content source (transcript | site | illustrative)", "required", p8.length === 0, p8.slice(0, 6).join("; "));

// ── approval-screen tables ──
const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
let md = `# Site plan — ${client}\n\nShow this on the approval screen. Source: ${rootRel(planPath)}\n\n## Page tree\n| Path | Type | Purpose | Proves moment | Why this page |\n|---|---|---|---|---|\n`;
for (const p of pages) md += `| ${cell(p.path)} | ${cell(p.pageType)} | ${cell(p.purpose)} | ${arr(p.proves).join(", ") || "(nav target)"} | ${cell(p.why ?? p.navReason ?? "")} |\n`;
md += `\n## Page by page\n`;
let nonDefault = 0;
for (const p of pages) {
  md += `\n### ${cell(p.path)} — ${cell(p.purpose)}\n`;
  if (p.pageType === "landing") { md += `Landing page: content is filled in the page's template fields.\n`; continue; }
  md += `| # | Component | Variant | Content from | Note |\n|---|---|---|---|---|\n`;
  for (const s of arr(p.sections)) { if ((s.variant || "Default") !== "Default") nonDefault++; md += `| ${cell(s.position)} | ${cell(s.component)} | ${cell(s.variant || "Default")} | ${cell(s.contentSource)} | ${cell(s.note)} |\n`; }
}
md += `\n## Manual work to expect\n- Variants to set by hand in Pages (Agent API cannot set them): ${nonDefault}\n- Header/footer: inherited from the site's Page Design (no manual step if the duplicated site already renders them)\n- First sub-page is created alone and checked in Pages before the rest are created\n`;
try { mkdirSync(demo, { recursive: true }); writeFileSync(join(demo, "site-plan.md"), md); } catch { /* report only */ }

let failed = 0;
for (const r of results) { if (!r.ok && r.level === "required") failed++; console.log(`${r.ok ? "✅" : r.level === "required" ? "❌" : "⚠️"} ${r.id}${r.detail ? ` — ${r.detail}` : ""}`); }
console.log(failed ? `\n✖ ${failed} site-plan rule(s) failed. Fix demo-plan.yaml (site.pages) before presenting the plan.` : "\n✔ site plan is buildable and tied to the story");
console.log(`(approval-screen tables: ${rootRel(join(demo, "site-plan.md"))})`);
process.exit(failed ? 1 : 0);
