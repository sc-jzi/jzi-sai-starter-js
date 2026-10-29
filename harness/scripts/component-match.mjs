#!/usr/bin/env node
/**
 * The shortlist per planned section: the base component variants closest in SHAPE to the live band, measured the same way on both sides
 * (_measure.mjs). Structure counts heavily (layout, repeated items, photo or icon, sliding, video, form), details lightly (buttons, headings).
 * It narrows the choice; the SE judges it on the plan-review page (plan-review.mjs).
 *
 *   node harness/scripts/component-match.mjs <customer> [--top 3]
 *
 * Reads demo-plan.yaml, the captures (sections*.json) and the base catalog (industry-verticals/<base>/docs/ai/catalog/components.json, written by
 * component-catalog.mjs with the base app running). Writes component-match.json + component-match.md in the demo folder: per section the live
 * shape, the closest variants (distance, what differs, field notes such as "fit: extend"), and where the planned component ranks.
 * Exit 0 · 1 when the catalog has no measured variants (re-run component-catalog.mjs).
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, rootRel, readJson, safeWrite, parseArgs, baseApp } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";
import { shapeOf, describeShape, catalogVariants, rankVariants, restructures } from "./_measure.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: component-match.mjs <customer> [--top 3]");
const top = Number(flags.top ?? 3);
const demo = demoDir(customer), planPath = join(demo, "demo-plan.yaml");
if (!existsSync(planPath)) die(`${rootRel(planPath)} not found`);
const plan = parseYaml(readFileSync(planPath, "utf8"));
const catalogDir = join(baseApp(), "docs", "ai", "catalog");
const variants = catalogVariants(readJson(join(catalogDir, "components.json")));
const measured = variants.filter((v) => v.shape);
if (!measured.length) die(`${rootRel(join(catalogDir, "components.json"))} has no measured variants: start the base app and run node harness/scripts/component-catalog.mjs`, 1);

const rows = [];
for (const p of Array.isArray(plan?.site?.pages) ? plan.site.pages : []) {
  const file = p.sectionsFile ? String(p.sectionsFile) : /^\/home$/i.test(String(p.path)) ? "sections.json" : null;
  if (!file) continue;
  const cap = readJson(join(demo, file)); if (!cap) continue;
  for (const s of Array.isArray(p.sections) ? p.sections : []) {
    if (s?.liveSection == null) continue;
    const band = cap.sections?.find((x) => x.index === Number(s.liveSection)); if (!band) continue;
    const live = shapeOf(band, cap.viewport ?? 1440), all = rankVariants(live, measured, 0);
    const isNew = s.fit === "new" || !!s.new, want = String(s.variant || "Default");
    const at = all.findIndex((v) => v.id === s.component && v.variant === want);
    const chosen = isNew ? { new: s.new?.name ?? s.component, spec: s.new ?? null }
      : at >= 0 ? { id: s.component, variant: want, name: all[at].name, rank: at + 1, distance: all[at].distance, why: all[at].why, notes: all[at].notes, restructures: restructures(live, all[at].shape), file: all[at].file }
      : { id: s.component, variant: want, rank: null, unmeasured: true };
    rows.push({ page: p.path, position: s.position, liveSection: Number(s.liveSection), crop: band.screenshot ?? "", heading: band.heading?.text ?? "",
      live, liveLooks: describeShape(live), chosen, fit: s.fit ?? "", fitReason: s.fitReason ?? "", look: s.look ?? "",
      shortlist: all.slice(0, top).map(({ id, name, variant, distance, fit, why, notes, file, looksLike }) => ({ id, name, variant, distance, fit, why, notes, file, looksLike })) });
  }
}
const unmeasured = [...new Set(variants.filter((v) => !v.shape).map((v) => `${v.name} ${v.variant}`))];
safeWrite(customer, join(demo, "component-match.json"), JSON.stringify({ at: new Date().toISOString(), top, rows, unmeasured }, null, 2) + "\n");

const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
const cand = (v) => `${v.name} ${v.variant} (${v.distance}${v.why.length ? `: ${v.why.slice(0, 3).join(", ")}` : ""})${v.notes.length ? ` · ${v.notes.join("; ")}` : ""}`;
const chosenTxt = (r) => r.chosen.new ? `${r.chosen.new} (new)` : r.chosen.unmeasured ? `${r.chosen.id} ${r.chosen.variant} (not measured)`
  : `${r.chosen.name} ${r.chosen.variant}: #${r.chosen.rank}, ${r.chosen.distance}${r.chosen.restructures.length ? ` · RESTRUCTURES: ${r.chosen.restructures.join("; ")}` : ""}`;
let md = `# Component match — ${customer}\n\nPer planned section: the live band's measured shape and the ${top} closest base variants (distance: 0 = same shape; structure counts heavily, buttons and headings lightly). Colours, fonts and spacing are look and are not compared. Screenshots side by side: \`plan-review.mjs\`.\n\n| Page | # | Live | Live shape | Planned (rank, distance) | Shortlist |\n|---|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${cell(r.page)} | ${r.position} | ${r.liveSection} ${cell(r.heading.slice(0, 30))} | ${cell(r.liveLooks)} | ${cell(chosenTxt(r))} | ${cell(r.shortlist.map(cand).join(" ⟂ "))} |\n`;
if (unmeasured.length) md += `\nNot measured (no showcase screenshot; matched on nothing): ${unmeasured.join(", ")}.\n`;
safeWrite(customer, join(demo, "component-match.md"), md);
console.log(`${rows.length} section(s) matched against ${measured.length} measured variant(s) → ${rootRel(join(demo, "component-match.md"))}`);
for (const r of rows) console.log(`  ${String(r.page).padEnd(24)} #${String(r.position).padEnd(2)} ${r.liveLooks.slice(0, 60).padEnd(60)} planned ${chosenTxt(r).slice(0, 70)}\n${" ".repeat(32)}→ ${r.shortlist.map((v) => `${v.name} ${v.variant} ${v.distance}`).join(" | ")}`);
