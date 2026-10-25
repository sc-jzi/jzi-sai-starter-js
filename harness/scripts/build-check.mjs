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
 * A build blocked by another `next build` of the same app waits 60s and retries once; a code error shows the real lines (full output in <app>/.build-check.log).
 * Exit 0 = every checked app builds · 1 = a build or typecheck failed (or another build kept the app busy) · 2 = usage / app not installed.
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

// fixed commands only (npm run build / npx tsc): on Windows they need a shell, and passed as ONE string (Node 24 deprecates shell + args)
const run = (cmd, args, cwd) => { const opts = { cwd, encoding: "utf8", env: { ...process.env, CI: "1", NEXT_TELEMETRY_DISABLED: "1" }, maxBuffer: 64 * 1024 * 1024 }; return win ? spawnSync([cmd, ...args].join(" "), { ...opts, shell: true }) : spawnSync(cmd, args, opts); };
// The lines that say what broke, each with the few lines that explain it: Next's "⨯" lines, TypeScript errors, "Failed to compile" /
// "Type error" blocks, module-not-found, thrown errors. npm's own wrapper line ("ERROR: \"next:build\" exited with 1") is dropped when
// something better exists; with nothing recognisable, the last meaningful lines are shown.
const NOISE = /^(>|npm (warn|notice)|\s*$|Writing (metadata|into)|\[Codegen\]|Registering Content SDK component|Creating an optimized|▲ Next\.js)/;
const WRAPPER = /^(ERROR: ".*" exited with \d+\.?|npm (ERR!|error) .*(code|errno|command failed|lifecycle|A complete log)|npm error (code|path|workspace|location|command))/i;
const KEY = /^⨯|error TS\d+|Type error|Failed to compile|Module not found|Build error|Export encountered|Error occurred prerendering|^\s*Error:|\bError: |is not (a function|defined)|Cannot find module/i;
function errorsOf(raw) {
  const lines = raw.replace(/\u001b\[[0-9;]*m/g, "").split(/\r?\n/), picked = [];   // colour codes out
  lines.forEach((l, i) => {
    if (!KEY.test(l) || WRAPPER.test(l.trim())) return;
    if (i > 0 && /^\.?\/?[\w./@-]+\.(tsx?|jsx?|mjs|scss|css):\d+(:\d+)?$/.test(lines[i - 1].trim())) picked.push(lines[i - 1].trim());   // where: ./src/x.tsx:2:30
    picked.push(l.trim());
    // what follows: indented detail, and the code frame (lines like "  2 | import ..." and the "^" marker) after one blank line
    let blank = 0;
    for (const next of lines.slice(i + 1, i + 12)) {
      if (!next.trim()) { if (++blank > 1) break; continue; }
      if (KEY.test(next)) break;
      if (/^\s*(>?\s*\d+\s*\||\|)/.test(next) || /^\s+(at |\S)/.test(next)) picked.push(`  ${next.trimEnd()}`); else break;
    }
  });
  const uniq = picked.filter((l, k, a) => a.indexOf(l) === k).slice(0, 20);
  return uniq.length ? uniq : lines.map((l) => l.trim()).filter((l) => l && !NOISE.test(l)).slice(-15);
}
// another `next build` (Cursor, a terminal, the pre-commit hook) holds the app's .next folder
const COLLISION = /Another next build process is already running|Unable to acquire lock|EBUSY[^\n]*\.next/i;

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
  const build = () => { const r = quick ? run("npx", ["tsc", "--noEmit", "-p", "."], dir) : run("npm", ["run", "build"], dir); return { r, out: `${r.stdout ?? ""}\n${r.stderr ?? ""}` }; };
  let { r, out } = build(), collided = false;
  if (r.status !== 0 && !quick && COLLISION.test(out)) {
    // not a code problem: another build is running in this app. Wait for it, then try once more.
    collided = true;
    console.log(`… ${app}: another build of this app is running (Cursor, a terminal or another commit); waiting 60s, then one retry`);
    await new Promise((res) => setTimeout(res, 60000));
    ({ r, out } = build());
  }
  const ok = r.status === 0, log = join(dir, ".build-check.log");
  writeFileSync(log, out);   // the full output, for when the summary is not enough (git-ignored)
  const stillColliding = !ok && COLLISION.test(out);
  const errors = ok ? [] : stillColliding ? ["Another build of this app is still running after a 60s wait. Not a code error: wait for it to finish (or stop it), then run this again."] : errorsOf(out);
  // a build blocked by another build says nothing about the code: it is not recorded (an earlier good record stays)
  if (!stillColliding) writeFileSync(record, JSON.stringify({ app, ok, mode: quick ? "quick" : "full", fingerprint: fp, at: new Date().toISOString(), seconds: Math.round((Date.now() - t) / 1000), retriedAfterCollision: collided, errors }, null, 2) + "\n");
  const secs = Math.round((Date.now() - t) / 1000);
  if (ok) console.log(`✔ ${app}: ${quick ? "typechecks" : "builds"} (${secs}s${collided ? ", after waiting for another build" : ""})`);
  else if (stillColliding) { failed++; console.log(`✖ ${app}: could not build: ${errors[0]}`); }
  else { failed++; console.log(`✖ ${app}: ${quick ? "typecheck" : "build"} FAILED\n  ${errors.join("\n  ")}\n  (full output: ${rootRel(log)})`); }
}
if (failed) console.log(`\n${failed} app(s) do not build. Fix them before committing or handing over.`);
process.exit(failed ? 1 : 0);
