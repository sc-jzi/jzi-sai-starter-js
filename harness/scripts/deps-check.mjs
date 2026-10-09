#!/usr/bin/env node
/**
 * Check (and with --fix install) what the harness needs on this machine.
 *
 *   node harness/scripts/deps-check.mjs [--customer <customer>] [--fix]
 *
 *   Node >= 20, git                       required (no automatic fix)
 *   Playwright + Chromium  (harness/)     required for the theme scrape, content extraction and the site thumbnail
 *                                         fix: npm install (in harness/) + npx playwright install chromium
 *   node_modules of industry-verticals/<customer>   (only once the app copy exists)
 *                                         fix: npm install (in the customer app — never in the base app)
 *   dotnet + Sitecore CLI                 optional, only for the editing host (otherwise it becomes a manual task)
 * Exit 0 = everything required is in place, 1 = something required is missing (after the fix, when --fix).
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HARNESS, ROOT, parseArgs, customerApp, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const fix = !!flags.fix, win = process.platform === "win32";
const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, stdio: "inherit", shell: win });
const quiet = (cmd, args, cwd = ROOT) => spawnSync(cmd, args, { cwd, encoding: "utf8", shell: win });
let bad = 0;
const row = (ok, label, detail, required = true) => { console.log(`${ok ? "✅" : required ? "❌" : "·"} ${label.padEnd(30)} ${detail}`); if (!ok && required) bad++; };

const major = Number(process.versions.node.split(".")[0]);
row(major >= 20, "Node.js >= 20", `found ${process.versions.node}`);
const git = quiet("git", ["--version"]); row(git.status === 0, "git", git.status === 0 ? git.stdout.trim() : "not found (the isolation guard needs it)");

async function playwrightState() {
  if (!existsSync(join(HARNESS, "node_modules", "playwright"))) return { ok: false, why: "not installed in harness/" };
  try { const { chromium } = await import("playwright"); return existsSync(chromium.executablePath()) ? { ok: true, why: "installed" } : { ok: false, why: "package present, Chromium browser missing" }; }
  catch (e) { return { ok: false, why: `cannot load: ${String(e.message).split("\n")[0]}` }; }
}
let pw = await playwrightState();
if (!pw.ok && fix) {
  console.log("→ installing Playwright into harness/ …");
  if (!existsSync(join(HARNESS, "node_modules", "playwright"))) run("npm", ["install"], HARNESS);
  run("npx", ["playwright", "install", "chromium"], HARNESS);
  pw = await playwrightState();
}
row(pw.ok, "Playwright + Chromium", pw.ok ? pw.why : `${pw.why}${fix ? "" : "  (fix: node harness/scripts/deps-check.mjs --fix)"}`);

if (flags.customer) {
  const app = customerApp(flags.customer, { mustExist: false });
  if (!existsSync(join(app, "package.json"))) console.log(`· customer app packages        industry-verticals/${flags.customer} has no app copy yet (created by new-site.mjs) — check again after that`);
  else {
    let has = existsSync(join(app, "node_modules"));
    if (!has && fix) { console.log(`→ npm install in ${rootRel(app)} (a few minutes the first time) …`); run("npm", ["install"], app); has = existsSync(join(app, "node_modules")); }
    row(has, "customer app packages", has ? `${rootRel(app)}/node_modules present` : `run: npm install in ${rootRel(app)}  (or add --fix)`);
  }
}
const dn = quiet("dotnet", ["sitecore", "--version"]);
row(dn.status === 0, "dotnet sitecore (CLI)", dn.status === 0 ? `available ${String(dn.stdout).trim().split("\n").pop()}` : "not available — the editing host becomes a manual task (run `dotnet tool restore` at the repo root)", false);
process.exit(bad ? 1 : 0);
