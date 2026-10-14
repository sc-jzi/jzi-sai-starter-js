#!/usr/bin/env node
/**
 * Bring everything the SE has for a demo into it without ever committing it: Gong transcripts, RFP documents (Excel, Word, PDF),
 * and supporting material (brand guidelines, product sheets, screenshots, logos).
 *
 *   node harness/scripts/intake-materials.mjs --list                       what waits in harness/inbox/ and what each file looks like
 *   node harness/scripts/intake-materials.mjs <customer>                   take EVERYTHING from harness/inbox/ (moved)
 *   node harness/scripts/intake-materials.mjs <customer> --file <p> [--file <p2> ...]    take specific files (copied; inbox files moved)
 *   node harness/scripts/intake-materials.mjs <customer> --none            nothing to take: just create the demo folder (brief comes from an SE interview)
 *
 * Result in industry-verticals/<customer>/docs/ai/demos/<customer>/inputs/ (everything there is git-ignored):
 *   <original files>          the originals
 *   extracted/<name>.txt      plain text of every Excel/Word/PDF/text file (Excel rows as `R<row> | cell | cell`)
 *   index.json                [{ file, kind: transcript|rfp|image|supporting (a GUESS from the name; confirm by reading), ext, kb, extracted, note }]
 * Contents are never printed.
 */
import { readdirSync, statSync, existsSync, mkdirSync, copyFileSync, unlinkSync, writeFileSync, readFileSync } from "node:fs";
import { join, extname, resolve, basename } from "node:path";
import { HARNESS, die, demoDir, rootRel } from "./_lib.mjs";
import { classify, extractText, missingLibs, DOC_EXT, TEXT_EXT } from "./_materials.mjs";

const INBOX = join(HARNESS, "inbox");
mkdirSync(INBOX, { recursive: true });
const args = process.argv.slice(2);
const files = args.flatMap((a, i) => (a === "--file" && args[i + 1] ? [args[i + 1]] : []));
const pos = args.filter((a, i) => !a.startsWith("--") && args[i - 1] !== "--file");
const waiting = () => readdirSync(INBOX).filter((f) => !/^(README\.md|\.gitkeep|\.gitignore)$/i.test(f) && statSync(join(INBOX, f)).isFile())
  .map((f) => ({ f, t: statSync(join(INBOX, f)).mtimeMs, kb: Math.round(statSync(join(INBOX, f)).size / 1024), kind: classify(f) })).sort((a, b) => b.t - a.t);

if (args.includes("--list")) {
  const w = waiting();
  if (!w.length) console.log("harness/inbox/ is empty. Drop the transcript, RFP files (.xlsx/.docx/.pdf) and supporting material there, or pass --file <path>.");
  else w.forEach((x) => console.log(`${x.kind.padEnd(10)} ${x.f}  (${x.kb} KB)`));
  process.exit(0);
}
const client = pos[0];
if (!client) die("usage: intake-materials.mjs <customer> [--file <path> ...]   |   --none   |   --list");
const inputs = join(demoDir(client), "inputs");
mkdirSync(inputs, { recursive: true });
writeFileSync(join(inputs, ".gitignore"), "*\n!.gitignore\n");
if (args.includes("--none")) {
  console.log(`✔ nothing to take: demo folder ready (${rootRel(demoDir(client))}). Build the brief from the SE interview (harness/templates/demo-interview.md).`);
  process.exit(0);
}

const sources = files.length ? files.map((p) => { const s = resolve(p); if (!existsSync(s) || !statSync(s).isFile()) die(`file not found: ${s}`); return { src: s, inbox: s.startsWith(INBOX) }; })
  : waiting().map((w) => ({ src: join(INBOX, w.f), inbox: true }));
if (!sources.length) die("Nothing in harness/inbox/. Drop the files there or pass --file <path>.");

const libs = missingLibs();
const needsLibs = sources.some((s) => DOC_EXT.has(extname(s.src).toLowerCase()));
if (needsLibs && libs.length) die(`Cannot read Excel/Word/PDF yet (missing in harness/node_modules: ${libs.join(", ")}). Run: node harness/scripts/deps-check.mjs --fix, then repeat.`, 1);

mkdirSync(join(inputs, "extracted"), { recursive: true });
const indexPath = join(inputs, "index.json");
const index = existsSync(indexPath) ? JSON.parse(readFileSync(indexPath, "utf8")) : [];
for (const { src, inbox } of sources) {
  const name = basename(src).replace(/[^A-Za-z0-9._ -]/g, "_");
  const dest = join(inputs, name);
  copyFileSync(src, dest);
  const ext = extname(name).toLowerCase();
  let extracted = null, note;
  if (DOC_EXT.has(ext) || TEXT_EXT.has(ext)) {
    try { const r = await extractText(dest); note = r.note; extracted = `extracted/${name}.txt`; writeFileSync(join(inputs, extracted), r.text); }
    catch (e) { note = `could not convert: ${String(e.message).split("\n")[0]}. Open the original.`; }
  } else note = "not converted; open the original (images can be viewed directly)";
  if (inbox) unlinkSync(src);
  const entry = { file: name, kind: classify(name), ext, kb: Math.round(statSync(dest).size / 1024), extracted, ...(note ? { note } : {}) };
  const at = index.findIndex((e) => e.file === name); if (at >= 0) index[at] = entry; else index.push(entry);
  console.log(`✔ ${entry.kind.padEnd(10)} ${name} (${entry.kb} KB)${extracted ? ` → ${rootRel(join(inputs, extracted))}` : ""}${note ? `  [${note}]` : ""}`);
}
writeFileSync(indexPath, JSON.stringify(index, null, 2) + "\n");
console.log(`index: ${rootRel(indexPath)} (git-ignored). "kind" is a guess from the file name: read the content and confirm.`);
