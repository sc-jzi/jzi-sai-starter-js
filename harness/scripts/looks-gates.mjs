#!/usr/bin/env node
/**
 * Run every looks gate of a demo against the running app in one go: the header compare, and the section compare of /Home and of
 * every mirrored page (each page with a sectionsFile). Writes the same *.demo.json / *.demo.verdict.json files run-gate.mjs reads.
 *
 *   node harness/scripts/looks-gates.mjs <customer> [--base http://localhost:3000]
 *
 * The app must be running (npm run dev in industry-verticals/<customer>). Exit 0 every page matches · 4 differences (see each line).
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, die, demoDir, parseArgs, routeOf } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: looks-gates.mjs <customer> [--base http://localhost:3000]");
const base = String(flags.base && flags.base !== true ? flags.base : "http://localhost:3000").replace(/\/$/, "");
const plan = parseYaml(readFileSync(join(demoDir(customer), "demo-plan.yaml"), "utf8"));

let failed = 0;
const run = (label, script, args) => {
  const t = Date.now();
  const r = spawnSync(process.execPath, [join(ROOT, "harness/scripts", script), "--customer", customer, ...args], { cwd: ROOT, encoding: "utf8", timeout: 240000 });
  const summary = `${r.stdout ?? ""}${r.stderr ?? ""}`.split(/\r?\n/).find((l) => /✔|✖|Could not|No sections/.test(l)) ?? "";
  if (r.status !== 0) failed++;
  console.log(`${r.status === 0 ? "✔" : "✖"} ${label.padEnd(60)} ${Math.round((Date.now() - t) / 1000)}s  ${summary.trim().slice(0, 90)}`);
};
run("header", "header-styles.mjs", ["--url", `${base}/`, "--out", "header-styles.demo.json", "--compare", "header-styles.json"]);
run("/Home", "section-capture.mjs", ["--url", `${base}/`, "--out", "sections.demo.json", "--compare", "sections.json"]);
for (const p of plan?.site?.pages ?? []) {
  if (!p.sectionsFile) continue;
  const f = String(p.sectionsFile);
  run(p.path, "section-capture.mjs", ["--url", base + routeOf(p.path), "--out", f.replace(/\.json$/, ".demo.json"), "--compare", f]);
}
console.log(failed ? `\n${failed} page(s) differ from the prospect's. Details: the *.demo.verdict.json files; run-gate.mjs check ${customer} says which ones block.` : "\n✔ every page matches the prospect's within tolerance");
process.exit(failed ? 4 : 0);
