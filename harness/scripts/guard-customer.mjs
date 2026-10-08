#!/usr/bin/env node
/**
 * Isolation guard — proves a demo run changed nothing outside its own customer folder.
 * The master copy industry-verticals/prospera (and every other industry-verticals/* app) must never change.
 *
 *   node harness/scripts/guard-customer.mjs snapshot <customer>                  BEFORE any work
 *   node harness/scripts/guard-customer.mjs check <customer> [--allow-build-json]  AFTER every phase (setup: allow root xmcloud.build.json)
 *   node harness/scripts/guard-customer.mjs sitecore-path <customer> "<item path>" before EVERY MCP / Sites API write
 *
 * <customer> = folder name under industry-verticals/. Refuses prospera / PROTECTED_FOLDERS (harness/.env.local).
 * Exit 0 = safe, 1 = violation, 2 = cannot verify (treat as NOT safe).
 */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { ROOT, die, customerApp, rootRel, PROTECTED_SITES } from "./_lib.mjs";

const argv = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [cmd, customer, arg] = argv;
if (!cmd || !customer) die("usage: guard-customer.mjs <snapshot|check|sitecore-path> <customer> [path] [--allow-build-json]");
const APP = customerApp(customer, { mustExist: false });
const REL_APP = rootRel(APP);
const git = (a) => spawnSync("git", a, { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 });
if (git(["rev-parse", "--is-inside-work-tree"]).stdout.trim() !== "true") die("Not a git repository, so isolation cannot be verified. Treat as NOT safe.");
const baselinePath = join(APP, "docs", "ai", "demos", ".guard-baseline.json");
const sha = (rel) => { try { return createHash("sha1").update(readFileSync(join(ROOT, rel))).digest("hex"); } catch { return "deleted"; } };
function dirty() {
  const out = git(["status", "--porcelain=v1", "-z", "--untracked-files=all"]).stdout.split("\0").filter(Boolean);
  const paths = [];
  for (let i = 0; i < out.length; i++) { paths.push(out[i].slice(3)); if (out[i][0] === "R" || out[i][0] === "C") i++; }
  return paths;
}
const allowBuildJson = process.argv.includes("--allow-build-json");

if (cmd === "snapshot") {
  const snap = Object.fromEntries(dirty().map((p) => [p, sha(p)]));
  mkdirSync(dirname(baselinePath), { recursive: true });
  writeFileSync(baselinePath, JSON.stringify({ at: new Date().toISOString(), folder: REL_APP, files: snap }, null, 2));
  console.log(`✔ snapshot saved (${Object.keys(snap).length} already-dirty file(s) recorded). Writable: ${REL_APP}/**${allowBuildJson ? " + xmcloud.build.json" : ""}`);
  process.exit(0);
}
if (cmd === "check") {
  if (!existsSync(baselinePath)) die("No snapshot yet. Run `guard-customer.mjs snapshot <customer>` BEFORE starting work.");
  const base = JSON.parse(readFileSync(baselinePath, "utf8")).files;
  const bad = dirty().filter((p) => base[p] !== sha(p)).filter((p) => !(p.startsWith(REL_APP + "/") || (allowBuildJson && p === "xmcloud.build.json")));
  if (bad.length) {
    console.log(`❌ ${bad.length} file(s) changed outside ${REL_APP}/:`);
    bad.slice(0, 30).forEach((p) => console.log("   " + p + (p.startsWith("industry-verticals/prospera/") ? "   ← MASTER COPY" : "")));
    console.log("\nStop. Revert these (git checkout -- <path> / delete the new file) before continuing. Never edit the master Prospera.");
    process.exit(1);
  }
  console.log(`✔ nothing outside ${REL_APP}/ changed since the snapshot`);
  process.exit(0);
}
if (cmd === "sitecore-path") {
  const p = (arg ?? "").replace(/\\/g, "/");
  const pj = join(APP, "docs/ai/config/project.yaml");
  const proj = existsSync(pj) ? readFileSync(pj, "utf8") : "";
  const coll = (proj.match(/^siteCollection:\s*"?([^"\n]+)"?/m) ?? [])[1]?.trim(), site = (proj.match(/^siteName:\s*"?([^"\n]+)"?/m) ?? [])[1]?.trim();
  if (!coll || !site) die(`${rootRel(pj)} has no siteCollection/siteName for this demo.`);
  if (PROTECTED_SITES.has(site.toLowerCase())) die(`project.yaml siteName "${site}" is a protected/master site. Point it at the duplicated demo site first.`, 1);
  const roots = [`/sitecore/content/${coll}/${site}`, `/sitecore/media library/project/${coll}/${site}`].map((r) => r.toLowerCase());
  const lp = p.toLowerCase(), ok = roots.some((r) => lp === r || lp.startsWith(r + "/"));
  console.log(ok ? `✔ ${p} is inside ${coll}/${site}` : `❌ ${p} is OUTSIDE ${roots[0]}. Do not write there.`);
  process.exit(ok ? 0 : 1);
}
die("usage: guard-customer.mjs <snapshot|check|sitecore-path> <customer>");
