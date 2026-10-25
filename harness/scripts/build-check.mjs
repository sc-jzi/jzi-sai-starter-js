#!/usr/bin/env node
/**
 * Build check: an app under industry-verticals/ must build before it is committed or handed over.
 *
 *   node harness/scripts/build-check.mjs <customer>            npm run build in that app (the same build a deploy runs)
 *   node harness/scripts/build-check.mjs <customer> --if-changed   skip when the last recorded build of the same source passed (run-gate uses this)
 *   node harness/scripts/build-check.mjs --staged              every app with staged changes (the git pre-commit hook, .githooks/pre-commit)
 *   add --quick                                                 tsc --noEmit only (seconds instead of minutes; not a full build)
 *
 * The result is recorded in industry-verticals/<app>/.build-check.json (git-ignored) with a fingerprint of the app's source
 * (src/, package.json, the Next/Sitecore configs). A different fingerprint means the code changed and the next check builds again.
 * Exit 0 = every checked app builds · 1 = a build or typecheck failed · 2 = usage / app not installed.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, die, parseArgs, rootRel, sourceFingerprint } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const quick = !!flags.quick;
const win = process.platform === "win32";

// the apps to check
let apps;
if (flags.staged) {
  // what can change an app's build: source and config. Not docs, assets, or files the build generates itself (untracking those must not trigger builds).
  const r = spawnSync("git", ["diff", "--cached", "--name-status", "--diff-filter=ACMRD"], { cwd: ROOT, encoding: "utf8" });
  const GENERATED = /^(next-env\.d\.ts|.*\.tsbuildinfo|\.sitecore\/.*)$/;
  const touched = r.stdout.split(/\r?\n/).filter(Boolean).map((l) => l.split("\t")).map(([st, ...p]) => ({ st, f: p.at(-1) ?? "" }))
    .map(({ st, f }) => ({ st, m: f.match(/^industry-verticals\/([^/]+)\/(.+)$/) })).filter(({ m }) => m)
    .filter(({ st, m: [, , rest] }) => !GENERATED.test(rest) && !(st === "D" && !/^src\//.test(rest)))
    .map(({ m }) => m)
    .filter(([, , rest]) => !/^docs\//.test(rest) && !/\.(md|png|jpe?g|gif|svg|webp|txt|ya?ml|json)$/i.test(rest) || /^(package\.json|tsconfig\.json)$/.test(rest));
  apps = [...new Set(touched.map(([, app]) => app))];
  if (!apps.length) { console.log("build-check: no app code staged, nothing to build"); process.exit(0); }
} else {
  if (!pos[0]) die("Usage: build-check.mjs <customer> [--if-changed] [--quick] | --staged [--quick]");
  apps = [pos[0]];
}

const run = (cmd, args, cwd) => spawnSync(cmd, args, { cwd, encoding: "utf8", shell: win, env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" }, maxBuffer: 64 * 1024 * 1024 });
// the lines that say what broke: TypeScript errors, Next "Failed to compile" / "Type error" blocks, module-not-found
const errorsOf = (out) => out.split(/\r?\n/).filter((l) => /error TS\d+|Type error|Failed to compile|Module not found|Error:|ERR!|Build error/i.test(l)).map((l) => l.trim()).filter((l, i, a) => l && a.indexOf(l) === i).slice(0, 15);

let failed = 0;
for (const app of apps) {
  const dir = join(ROOT, "industry-verticals", app);
  if (!existsSync(join(dir, "package.json"))) { console.log(`✖ ${app}: no package.json`); failed++; continue; }
  if (!existsSync(join(dir, "node_modules"))) { console.log(`✖ ${app}: dependencies not installed — run npm install in industry-verticals/${app}`); process.exitCode = 2; continue; }
  const record = join(dir, ".build-check.json"), fp = sourceFingerprint(dir);
  const prev = (() => { try { return JSON.parse(readFileSync(record, "utf8")); } catch { return null; } })();
  if (flags["if-changed"] && prev?.ok && prev.fingerprint === fp && (prev.mode === "full" || quick)) { console.log(`✔ ${app}: builds (recorded ${prev.at}, source unchanged)`); continue; }

  const t = Date.now();
  console.log(`… ${app}: ${quick ? "tsc --noEmit" : "npm run build"} (this can take a few minutes)`);
  const r = quick ? run("npx", ["tsc", "--noEmit", "-p", "."], dir) : run("npm", ["run", "build"], dir);
  const out = `${r.stdout ?? ""}\n${r.stderr ?? ""}`, ok = r.status === 0;
  const errors = ok ? [] : errorsOf(out);
  if (!ok && !errors.length) errors.push(...out.trim().split(/\r?\n/).slice(-12));
  writeFileSync(record, JSON.stringify({ app, ok, mode: quick ? "quick" : "full", fingerprint: fp, at: new Date().toISOString(), seconds: Math.round((Date.now() - t) / 1000), errors }, null, 2) + "\n");
  if (ok) console.log(`✔ ${app}: ${quick ? "typechecks" : "builds"} (${Math.round((Date.now() - t) / 1000)}s)`);
  else { failed++; console.log(`✖ ${app}: ${quick ? "typecheck" : "build"} FAILED\n  ${errors.join("\n  ")}\n  (full log: cd ${rootRel(dir)} && ${quick ? "npx tsc --noEmit" : "npm run build"})`); }
}
if (failed) console.log(`\n${failed} app(s) do not build. Fix them before committing or handing over.`);
process.exit(failed ? 1 : 0);
