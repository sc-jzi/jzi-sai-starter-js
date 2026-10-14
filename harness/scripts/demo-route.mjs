#!/usr/bin/env node
/**
 * Decide which route /new-demo takes. Read-only.
 *
 *   node harness/scripts/demo-route.mjs [--customer <customer>] [--json]
 *
 *   resume      industry-verticals/<customer>/docs/ai/demos/<customer>/demo-progress.yaml exists  -> continue where it stopped
 *   rfp         a file named like an RFP/requirements/tender waits in harness/inbox/                       -> RFP-led brief (RFP requirements are the spine; a transcript, if any, adds the pains)
 *   transcript  a Gong-style transcript waits in harness/inbox/                                           -> intake it, brief from the transcript
 *   materials   other files wait in harness/inbox/ (brand guide, screenshots ...)                         -> read them, then interview for the rest
 *   interview   neither                                                                             -> brief from an SE interview (harness/templates/demo-interview.md)
 */
import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { HARNESS, parseArgs, demoDir, rootRel } from "./_lib.mjs";
import { classify } from "./_materials.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const inbox = join(HARNESS, "inbox");
const waiting = existsSync(inbox) ? readdirSync(inbox).filter((f) => !/^(README\.md|\.gitkeep|\.gitignore)$/i.test(f) && statSync(join(inbox, f)).isFile())
  .map((f) => ({ file: f, kind: classify(f), kb: Math.round(statSync(join(inbox, f)).size / 1024), t: statSync(join(inbox, f)).mtimeMs })).sort((a, b) => b.t - a.t) : [];
let route = waiting.some((w) => w.kind === "rfp") ? "rfp" : waiting.some((w) => w.kind === "transcript") ? "transcript" : waiting.length ? "materials" : "interview", progress = null;
if (flags.customer) {
  const p = join(demoDir(flags.customer), "demo-progress.yaml");
  if (existsSync(p)) { route = "resume"; progress = rootRel(p); }
}
const out = { route, customer: flags.customer ?? null, progress, inbox: waiting.map(({ file, kind, kb }) => ({ file, kind, kb })), newest: waiting[0]?.file ?? null };
if (flags.json) console.log(JSON.stringify(out, null, 2));
else {
  console.log(`route: ${route}`);
  if (route === "resume") console.log(`state: ${progress}`);
  if (waiting.length) console.log(`inbox: ${waiting.map((w) => `${w.file} [${w.kind}, ${w.kb} KB]`).join(", ")}`);
  if (waiting.length) console.log("note: kinds are guessed from file names. Everything in the inbox is taken for this demo; if it belongs to several prospects, tell the SE and use --file.");
}
