#!/usr/bin/env node
/**
 * Decide which route /new-demo takes. Read-only.
 *
 *   node harness/scripts/demo-route.mjs [--customer <customer>] [--json]
 *
 *   resume      industry-verticals/<customer>/docs/ai/demos/<customer>/demo-progress.yaml exists  -> continue where it stopped
 *   transcript  at least one file waits in harness/inbox/                                          -> intake it, brief from the transcript
 *   interview   neither                                                                             -> brief from an SE interview (harness/templates/demo-interview.md)
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { HARNESS, parseArgs, demoDir, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const inbox = join(HARNESS, "inbox");
const waiting = existsSync(inbox) ? readdirSync(inbox).filter((f) => !/^(README\.md|\.gitkeep|\.gitignore)$/i.test(f) && statSync(join(inbox, f)).isFile())
  .map((f) => ({ file: f, kb: Math.round(statSync(join(inbox, f)).size / 1024), t: statSync(join(inbox, f)).mtimeMs })).sort((a, b) => b.t - a.t) : [];
let route = waiting.length ? "transcript" : "interview", progress = null;
if (flags.customer) {
  const p = join(demoDir(flags.customer), "demo-progress.yaml");
  if (existsSync(p)) { route = "resume"; progress = rootRel(p); }
}
const out = { route, customer: flags.customer ?? null, progress, inbox: waiting.map(({ file, kb }) => ({ file, kb })), newest: waiting[0]?.file ?? null };
if (flags.json) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`route: ${route}`);
  if (route === "resume") console.log(`state: ${progress}`);
  if (waiting.length) console.log(`inbox: ${waiting.map((w, i) => `${i === 0 ? "→ " : ""}${w.file} (${w.kb} KB)`).join(", ")}`);
  if (route === "transcript" && waiting.length > 1) console.log("note: several files are waiting; the newest is used. Confirm it belongs to this prospect.");
}
