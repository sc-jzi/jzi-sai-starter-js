#!/usr/bin/env node
/**
 * The per-component screenshot worklist for EVERY mirrored page: /Home (sections.json) and each page with a sectionsFile, same rules for all.
 * One row per planned section: the live crop it is built from, the measured shape, and what the plan builds it with.
 *
 *   node harness/scripts/component-crops.mjs <customer>
 *
 * Reads demo-plan.yaml (site.pages[].sections[].liveSection, sectionsFile) and the captures (sections-<slug>.json, crops in sections-<slug>/).
 * Writes component-crops.json + component-crops.md in the demo folder. Used by phase 5 (new components), phase 5.5 (variants) and
 * demo-build-pages step 4: open the crop, build or reuse, place, compare. Exit 1 when a planned section has no crop or a Rich Text
 * section's live band is more than prose (validate-site-plan P16).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, rootRel, readJson, safeWrite, chromeBands, notProse, baseApp } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";
import { shapeOf, describeShape, catalogVariants, rankVariants } from "./_measure.mjs";

const customer = process.argv[2];
if (!customer) die("Usage: component-crops.mjs <customer>");
const demo = demoDir(customer), planPath = join(demo, "demo-plan.yaml");
if (!existsSync(planPath)) die(`${rootRel(planPath)} not found`);
const plan = parseYaml(readFileSync(planPath, "utf8"));
const pages = Array.isArray(plan?.site?.pages) ? plan.site.pages : [];

const rows = [], problems = [];
// the 3 measured base variants closest in shape to each live band (the same shortlist as component-match.mjs and validate-site-plan P17)
const measured = catalogVariants(readJson(join(baseApp(), "docs", "ai", "catalog", "components.json"))).filter((v) => v.shape);
for (const p of pages) {
  const file = p.sectionsFile ? String(p.sectionsFile) : /^\/home$/i.test(String(p.path)) ? "sections.json" : null;
  if (!file) continue;   // story pages and title-only stubs have no live counterpart
  const cap = readJson(join(demo, file));
  if (!cap) { problems.push(`${p.path}: ${file} not captured (section-capture --out ${file})`); continue; }
  const { footerIdx } = chromeBands(cap);
  for (const s of Array.isArray(p.sections) ? p.sections : []) {
    if (s?.liveSection == null) continue;
    const band = cap.sections?.find((x) => x.index === Number(s.liveSection));
    const crop = band?.screenshot ? `${band.screenshot}` : "";
    if (!band || !crop || !existsSync(join(demo, crop))) problems.push(`${p.path} #${s.position}: no crop for live section ${s.liveSection} in ${file}`);
    if (band && band.index === footerIdx) problems.push(`${p.path} #${s.position}: live section ${s.liveSection} is the footer (built by the Footer partial, not a page section)`);
    const shape = notProse(band), live = band ? shapeOf(band, cap.viewport ?? 1440) : null;
    const shortlist = live && measured.length ? rankVariants(live, measured, 3).map((v) => ({ name: v.name, variant: v.variant, distance: v.distance, notes: v.notes, file: v.file })) : [];
    if (s.component === "rich-text" && shape.length) problems.push(`${p.path} #${s.position}: Rich Text for a band with ${shape.join(", ")}`);
    rows.push({
      page: p.path, position: s.position, liveSection: Number(s.liveSection), crop,
      heading: band?.heading?.text ?? "", shape: shape.join(", ") || "prose", looksLike: live ? describeShape(live) : "", shortlist,
      component: s.new?.name ? `${s.new.name} (new)` : s.extend ? `${s.component} (extended: ${(Array.isArray(s.extend.fields) ? s.extend.fields : []).map((f) => f?.name).filter(Boolean).join(", ")})` : String(s.component ?? ""), fit: s.fit ?? "", variant: s.variant ?? "Default", look: s.look ?? "",
    });
  }
}

safeWrite(customer, join(demo, "component-crops.json"), JSON.stringify({ at: new Date().toISOString(), rows, problems }, null, 2) + "\n");
const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
let md = `# Component crops — ${customer}\n\nOne row per planned section of every mirrored page. Build each from its crop: open it, then reuse the component (with the client variant or look) or build the \`fit: new\` one. Rich Text only where the shape is "prose". Shortlist: the measured base variants closest in shape (distance 0 = same shape; \`component-match.md\` says what differs, \`plan-review.mjs\` shows them side by side).\n\n| Page | # | Live | Crop | Heading | Measured shape | Component | Fit | Variant / look | Shortlist |\n|---|---|---|---|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.page)} | ${r.position} | ${r.liveSection} | [${cell(r.crop.split("/").pop())}](${encodeURI(r.crop)}) | ${cell(r.heading)} | ${cell(r.looksLike || r.shape)}${r.shape !== "prose" ? ` (${cell(r.shape)})` : ""} | ${cell(r.component)} | ${cell(r.fit)} | ${cell(r.variant)}${r.look ? ` / ${cell(r.look)}` : ""} | ${cell(r.shortlist.map((v) => `${v.name} ${v.variant} (${v.distance}${v.notes.length ? `; ${v.notes.join("; ")}` : ""})`).join(", "))} |\n`;
if (problems.length) md += `\n## Problems\n${problems.map((x) => `- ${x}`).join("\n")}\n`;
safeWrite(customer, join(demo, "component-crops.md"), md);
console.log(`${rows.length} planned section(s) on ${new Set(rows.map((r) => r.page)).size} mirrored page(s) → ${rootRel(join(demo, "component-crops.md"))}`);
for (const x of problems) console.log(`✖ ${x}`);
process.exit(problems.length ? 1 : 0);
