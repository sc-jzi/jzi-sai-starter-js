// Shared helpers for demo inputs (transcripts, RFPs, supporting material). Extraction libs are loaded lazily from harness/node_modules.
import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { extname, join } from "node:path";
import { HARNESS } from "./_lib.mjs";

const req = createRequire(join(HARNESS, "package.json"));
export const TEXT_EXT = new Set([".txt", ".md", ".csv", ".tsv", ".vtt", ".srt", ".json", ".yaml", ".yml"]);
export const DOC_EXT = new Set([".xlsx", ".xlsm", ".xls", ".docx", ".pdf"]);

/** Best-guess kind from the file name only. Cursor confirms by reading the content. */
export function classify(name) {
  const n = name.toLowerCase(), ext = extname(n);
  if (/(transcript|gong|discovery|call[-_ ]?(notes|recording)?|meeting)/.test(n) && [".txt", ".vtt", ".srt", ".md", ".docx", ".pdf"].includes(ext)) return "transcript";
  if (/(rfp|rfi|rfq|itt|tender|requirement|questionnaire|scorecard|scoring|scenario|demo[-_ ]?(script|req))/.test(n)) return "rfp";
  if ([".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif"].includes(ext)) return "image";
  return "supporting";
}

export function missingLibs() {
  return ["xlsx", "mammoth", "pdf-parse"].filter((m) => { try { req.resolve(m); return false; } catch { return true; } });
}

const decode = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const strip = (s) => decode(s.replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim();
function htmlToText(html) {
  return decode(html
    .replace(/<table[^>]*>([\s\S]*?)<\/table>/gi, (_, t) => "\n" + [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) => "| " + [...r[1].matchAll(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi)].map((c) => strip(c[1])).join(" | ") + " |").join("\n") + "\n")
    .replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_, n, t) => `\n${"#".repeat(Number(n))} ${strip(t)}\n`)
    .replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_, t) => `\n- ${strip(t)}`)
    .replace(/<\/p>|<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")).replace(/\n{3,}/g, "\n\n").trim();
}

/** Returns { text, note } for one file. Spreadsheet rows keep their row number (R<n>) so requirements can be cited as file / sheet / row. */
export async function extractText(abs) {
  const ext = extname(abs).toLowerCase();
  if (TEXT_EXT.has(ext)) return { text: readFileSync(abs, "utf8").replace(/^﻿/, "") };
  if (ext === ".xlsx" || ext === ".xlsm" || ext === ".xls") {
    const XLSX = req("xlsx");
    const wb = XLSX.readFile(abs, { cellDates: true });
    const hidden = new Map((wb.Workbook?.Sheets ?? []).map((s, i) => [wb.SheetNames[i], s.Hidden]));
    const out = [];
    for (const name of wb.SheetNames) {
      const ws = wb.Sheets[name]; if (!ws || !ws["!ref"]) continue;
      const r0 = XLSX.utils.decode_range(ws["!ref"]).s.r;
      const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: "", blankrows: true });
      out.push(`## Sheet: ${name}${hidden.get(name) ? " (hidden)" : ""}  — ${rows.length} rows`);
      rows.forEach((row, i) => {
        const cells = row.map((c) => String(c ?? "").replace(/\s*\n\s*/g, " ⏎ ").trim());
        if (cells.every((c) => c === "")) return;
        while (cells.length && cells[cells.length - 1] === "") cells.pop();
        out.push(`R${i + 1 + r0} | ${cells.join(" | ")}`);
      });
      out.push("");
    }
    return { text: out.join("\n") };
  }
  if (ext === ".docx") {
    const mammoth = req("mammoth");
    const { value } = await mammoth.convertToHtml({ path: abs });
    return { text: htmlToText(value) };
  }
  if (ext === ".pdf") {
    const { PDFParse } = req("pdf-parse");
    const parser = new PDFParse({ data: readFileSync(abs) });
    try {
      const r = await parser.getText();
      const text = r.pages.map((p) => `--- page ${p.num} ---\n${p.text.trim()}`).join("\n\n");
      return { text, note: r.pages.every((p) => p.text.trim().length < 20) ? "no text layer found (scanned PDF?): open the PDF itself and read it visually" : undefined };
    } finally { await parser.destroy(); }
  }
  return { text: "", note: `${ext || "this file type"} is not converted. Open the original file directly.` };
}
