#!/usr/bin/env node
/**
 * Isolation of the SHARED harness (R18): nothing specific to one prospect may live in anything shared by every demo (harness/, .skills/, .cursor/,
 * .claude/, CLAUDE.md, the READMEs, .githooks/): no scripts, datasource dumps, notes, readmes or examples that name a prospect, point at its website,
 * or carry ids of its Sitecore site. Prospect material lives only in industry-verticals/<customer>/.
 *
 * The markers of each prospect come from its own (git-ignored) demo files, read by this script only:
 *   folder name · client name and kebab (demo-plan.yaml) · website domain (sourceUrl) · Sitecore site name and site/collection ids (site.json)
 *   · Home / site / data-root ids (site-manifest.json). The base app is never a prospect.
 *
 *   node harness/scripts/name-check.mjs              every tracked or new (not git-ignored) shared file   (run-gate.mjs)
 *   node harness/scripts/name-check.mjs --staged     only staged files                                   (.githooks/pre-commit)
 *
 * One-off scripts for a demo go in industry-verticals/<customer>/docs/ai/demos/<customer>/tmp/ (git-ignored) and import the harness helpers with
 *   import { ENV, authoringClient } from "../../../../../../../harness/scripts/_lib.mjs";
 * Exit 0 clean · 1 prospect-specific content found (each hit printed with the fix).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { ROOT, BASE_APP, parseArgs, readJson } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const SHARED = ["harness", ".skills", ".cursor", ".claude", "CLAUDE.md", "README-DEMO-HARNESS.md", ".githooks"];

// markers per prospect
const words = new Map(), ids = new Map();   // marker -> customer
const G = (v) => String(v ?? "").replace(/[{}-]/g, "").toLowerCase();
for (const d of readdirSync(join(ROOT, "industry-verticals"), { withFileTypes: true })) {
  if (!d.isDirectory() || d.name.toLowerCase() === BASE_APP) continue;
  const c = d.name, demo = join(ROOT, "industry-verticals", c, "docs", "ai", "demos", c);
  const addWord = (w) => { const t = String(w ?? "").trim(); if (t.length >= 3 && !/^(home|site|demo|data|page)$/i.test(t)) words.set(t.toLowerCase(), c); };
  addWord(c);
  let plan = null; try { plan = parseYaml(readFileSync(join(demo, "demo-plan.yaml"), "utf8")); } catch { /* no plan yet */ }
  addWord(plan?.client?.name); addWord(plan?.client?.kebab);
  try { addWord(new URL(String(plan?.client?.sourceUrl ?? "")).host.replace(/^www\./, "")); } catch { /* no url */ }
  const site = readJson(join(demo, "site.json")), man = readJson(join(demo, "site-manifest.json"));
  addWord(site?.siteName);
  for (const id of [site?.siteId, site?.collectionId, man?.siteId, man?.home, man?.dataRoot]) if (/^[{]?[0-9a-f-]{32,36}[}]?$/i.test(String(id ?? ""))) ids.set(G(id), c);
}
if (!words.size) process.exit(0);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const wordRx = new RegExp(`(^|[^a-z0-9])(${[...words.keys()].sort((a, b) => b.length - a.length).map(esc).join("|")})(?=$|[^a-z0-9])`, "i");
const guidRx = /\{?[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}\}?/gi;

const git = (args) => spawnSync("git", args, { cwd: ROOT, encoding: "utf8" }).stdout.split(/\r?\n/).filter(Boolean);
const files = (flags.staged ? git(["diff", "--cached", "--name-only", "--diff-filter=ACMR", "--", ...SHARED]) : git(["ls-files", "-co", "--exclude-standard", "--", ...SHARED]))
  .filter((f) => !/(^|\/)node_modules\//.test(f) && !/^harness\/inbox\//.test(f));

const hits = [];
for (const f of files) {
  const abs = join(ROOT, f);
  const fm = f.replace(/\\/g, "/").match(wordRx);
  if (fm) { hits.push({ f, where: "file name", text: fm[2], who: words.get(fm[2].toLowerCase()) }); continue; }
  if (!existsSync(abs) || statSync(abs).size > 2 * 1024 * 1024 || /\.(png|jpe?g|gif|webp|ico|pdf|zip|woff2?)$/i.test(f)) continue;
  readFileSync(abs, "utf8").split(/\r?\n/).forEach((l, i) => {
    const m = l.match(wordRx);
    if (m) hits.push({ f, where: `line ${i + 1}`, text: m[2], who: words.get(m[2].toLowerCase()), line: l.trim().slice(0, 100) });
    for (const g of l.match(guidRx) ?? []) if (ids.has(G(g))) hits.push({ f, where: `line ${i + 1}`, text: g, who: ids.get(G(g)), line: "a Sitecore id of this prospect's site" });
  });
}
if (!hits.length) { console.log(`✔ nothing prospect-specific in the shared harness (${files.length} file(s) checked, ${words.size + ids.size} marker(s))`); process.exit(0); }
console.log(`✖ ${hits.length} prospect-specific item(s) in the shared harness (prospect material belongs in industry-verticals/<customer>/ only):`);
for (const h of hits.slice(0, 40)) console.log(`  ${h.f} (${h.where}): "${h.text}" [${h.who}]${h.line ? `  ${h.line}` : ""}`);
console.log("  Fix: a one-off script, dump or note → industry-verticals/<customer>/docs/ai/demos/<customer>/tmp/ (scripts import ../../../../../../../harness/scripts/_lib.mjs);\n  a lesson for every demo → write it without the prospect (\"an earlier demo run\").");
process.exit(1);
