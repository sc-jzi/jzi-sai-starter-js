#!/usr/bin/env node
/**
 * Convert one RFP / Word / Excel / PDF / text file to plain text (stdout, or --out <file>).
 *   node harness/scripts/extract-text.mjs <file> [--out <file>]
 * Excel rows are printed as `R<row> | cell | cell` per sheet (all sheets, hidden ones marked) so a requirement can be cited as file / sheet / row.
 */
import { writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { die } from "./_lib.mjs";
import { extractText, missingLibs } from "./_materials.mjs";

const a = process.argv.slice(2), oi = a.indexOf("--out");
const file = a.find((x, i) => !x.startsWith("--") && i !== (oi >= 0 ? oi + 1 : -1));
if (!file) die("usage: extract-text.mjs <file> [--out <file>]");
const abs = resolve(file); if (!existsSync(abs)) die(`not found: ${abs}`);
const m = missingLibs(); if (m.length) die(`Missing in harness/node_modules: ${m.join(", ")}. Run: node harness/scripts/deps-check.mjs --fix`, 1);
const { text, note } = await extractText(abs);
if (note) console.error(`note: ${note}`);
if (oi >= 0) { writeFileSync(resolve(a[oi + 1]), text); console.error(`✔ ${text.length} characters → ${a[oi + 1]}`); } else process.stdout.write(text + "\n");
