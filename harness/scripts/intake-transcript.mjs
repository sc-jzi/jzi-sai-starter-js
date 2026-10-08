#!/usr/bin/env node
/**
 * Bring a discovery-call transcript (e.g. a Gong export) into a demo without ever committing it.
 *
 *   node harness/scripts/intake-transcript.mjs --list                      what is waiting in harness/inbox/
 *   node harness/scripts/intake-transcript.mjs <customer>  take the newest file from harness/inbox/
 *   node harness/scripts/intake-transcript.mjs <customer> --file <p>   take a specific file (only read, not moved)
 *
 * Result: industry-verticals/<customer>/docs/ai/demos/<customer>/inputs/discovery-transcript.<ext> plus inputs/.gitignore ("*") so nothing in that
 * folder is committed. Files from the inbox are MOVED; files from elsewhere are copied. Contents are never printed.
 */
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, unlinkSync, writeFileSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { HARNESS, die, demoDir, rootRel } from "./_lib.mjs";

const INBOX = join(HARNESS, "inbox");
mkdirSync(INBOX, { recursive: true });
const args = process.argv.slice(2);
const fi = args.indexOf("--file");
const file = fi >= 0 ? args[fi + 1] : null;
const pos = args.filter((a, i) => !a.startsWith("--") && i !== fi + 1);
const waiting = () => readdirSync(INBOX).filter((f) => !/^(README\.md|\.gitkeep|\.gitignore)$/i.test(f) && statSync(join(INBOX, f)).isFile())
  .map((f) => ({ f, t: statSync(join(INBOX, f)).mtimeMs, kb: Math.round(statSync(join(INBOX, f)).size / 1024) })).sort((a, b) => b.t - a.t);

if (args.includes("--list")) {
  const w = waiting();
  if (!w.length) console.log("harness/inbox/ is empty. Drop the Gong .txt (or .vtt/.srt/.md/.docx/.pdf) there, or pass --file <path>.");
  else w.forEach((x, i) => console.log(`${i === 0 ? "→" : " "} ${x.f}  (${x.kb} KB)`));
  process.exit(0);
}
const client = pos[0];
if (!client) die("usage: intake-transcript.mjs <customer> [--file <path>]   |   --list");

let src, fromInbox = false;
if (file) { src = resolve(file); if (!existsSync(src) || !statSync(src).isFile()) die(`file not found: ${src}`); fromInbox = src.startsWith(INBOX); }
else { const w = waiting(); if (!w.length) die("Nothing in harness/inbox/. Drop the transcript there or pass --file <path>."); src = join(INBOX, w[0].f); fromInbox = true; }

const ext = extname(src).toLowerCase() || ".txt";
const dir = join(demoDir(client), "inputs");
mkdirSync(dir, { recursive: true });
const dest = join(dir, `discovery-transcript${ext}`);
copyFileSync(src, dest);
writeFileSync(join(dir, ".gitignore"), "*\n!.gitignore\n");
if (fromInbox) unlinkSync(src);
console.log(`✔ transcript stored: ${rootRel(dest)} (${Math.round(statSync(dest).size / 1024)} KB, git-ignored)`);
if (![".txt", ".md", ".vtt", ".srt"].includes(ext)) console.log(`note: ${ext} is not plain text. Ask the SE to export as .txt if the agent cannot read it.`);
