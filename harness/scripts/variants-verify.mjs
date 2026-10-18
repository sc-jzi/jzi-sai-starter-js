#!/usr/bin/env node
/**
 * Static gate: every variant that a Variant Definition exists (or will exist) for must also exist IN THE CODE of the customer's app.
 * A variant that is selected in Sitecore but has no `export const <Name>` in the component file renders as an orange box
 * "Content SDK component is missing React implementation" (an earlier demo run: Features with the variant AcmeCorp).
 *
 *   node harness/scripts/variants-verify.mjs --customer <customer> [--fix] [--strict]
 *
 * Reads bootstrap-plan.json (demo folder): per component the variants it needs (Default, the plan's base variants, the client variant) and its React file.
 * Checks the TSX in industry-verticals/<customer>/ (never prospera):
 *   MISSING  the file has no export of that variant name           → with --fix an ALIAS is appended: `export const <Name> = Default;`
 *   ALIAS    the export exists but is only the harness alias        → the pixel-matching code is still owed (listed; --strict exits 4)
 *   OK       a real export
 * The alias is a SAFETY NET so nothing ever renders the error box. It is not a substitute for the pixel-matched variant
 * (sitecore-create-demo-variants), which replaces the alias line.
 * Exit 0 ok · 3 missing exports (without --fix) or no Default · 4 aliases remain (--strict only).
 * Also writes variants-verify.md in the demo folder.
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { die, parseArgs, demoDir, customerApp, safeWrite, readJson, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer; if (!customer) die("need --customer");
const app = customerApp(customer), demo = demoDir(customer), fix = !!flags.fix, strict = !!flags.strict;
const bp = readJson(join(demo, "bootstrap-plan.json")); if (!bp) die("bootstrap-plan.json missing: run node harness/scripts/bootstrap-plan.mjs <customer> first");
const ALIAS = /harness:variant-alias/;

const walk = (dir, out = []) => { for (const n of readdirSync(dir)) { if (["node_modules", ".next", ".git"].includes(n)) continue; const p = join(dir, n); const s = statSync(p); if (s.isDirectory()) walk(p, out); else if (/\.tsx$/.test(n)) out.push(p); } return out; };
let all = null;
const findFile = (c) => {
  if (c.reactFilePath) { const p = join(app, c.reactFilePath); if (existsSync(p)) return p; }
  all ??= walk(join(app, "src"));
  return all.find((f) => f.endsWith(`/${c.name}.tsx`) || f.endsWith(`\\${c.name}.tsx`)) ?? null;
};
const exportsName = (src, n) => new RegExp(`export\\s+(const|function|let|class)\\s+${n}\\b|export\\s*\\{[^}]*\\b(as\\s+)?${n}\\b[^}]*\\}`).test(src);
const aliasOnly = (src, n) => new RegExp(`//\\s*harness:variant-alias\\s+${n}\\b[^\\n]*\\n\\s*export const ${n}\\s*=\\s*Default\\s*;`).test(src);

const rows = []; let missing = 0, aliases = 0, noDefault = 0;
for (const c of bp.components ?? []) {
  const file = findFile(c);
  if (!file) { rows.push({ c: c.name, v: "(file)", status: "NOFILE", note: `no ${c.name}.tsx under src/ (manifest path ${c.reactFilePath ?? "-"})` }); missing++; continue; }
  let src = readFileSync(file, "utf8"), changed = false;
  if (!exportsName(src, "Default")) { rows.push({ c: c.name, v: "Default", status: "NODEFAULT", note: rootRel(file) }); noDefault++; continue; }
  for (const v of c.variants ?? []) {
    if (v === "Default") continue;
    if (!exportsName(src, v)) {
      if (fix) { src = src.replace(/\s*$/, "") + `\n\n// harness:variant-alias ${v} (safety net: replace with the pixel-matched variant, see sitecore-create-demo-variants)\nexport const ${v} = Default;\n`; changed = true; rows.push({ c: c.name, v, status: "ALIAS-ADDED", note: rootRel(file) }); aliases++; }
      else { rows.push({ c: c.name, v, status: "MISSING", note: rootRel(file) }); missing++; }
    } else if (aliasOnly(src, v)) { rows.push({ c: c.name, v, status: "ALIAS", note: rootRel(file) }); aliases++; }
    else rows.push({ c: c.name, v, status: "OK", note: "" });
  }
  if (changed) safeWrite(customer, file, src);
}

const bad = rows.filter((r) => r.status !== "OK");
let md = `# Variant code check — ${customer}\n\n| Component | Variant | Status | File / note |\n|---|---|---|---|\n` + rows.map((r) => `| ${r.c} | ${r.v} | ${r.status} | ${r.note} |`).join("\n") + "\n";
md += `\nMISSING = selected/declared in Sitecore but not exported by the code (renders the orange "missing React implementation" box). ALIAS(-ADDED) = harness safety net only, the pixel-matched code is still owed.\n`;
safeWrite(customer, join(demo, "variants-verify.md"), md);
for (const r of bad) console.log(`${r.status.padEnd(12)} ${r.c} / ${r.v}  ${r.note}`);
console.log(`${rows.length} variant(s) checked: ${rows.filter((r) => r.status === "OK").length} real, ${aliases} alias, ${missing} missing, ${noDefault} without Default (${rootRel(join(demo, "variants-verify.md"))})`);
if (missing || noDefault) process.exit(3);
if (strict && aliases) { console.log("Aliases remain: replace each with the pixel-matched variant (or list it in manual-tasks.md)."); process.exit(4); }
