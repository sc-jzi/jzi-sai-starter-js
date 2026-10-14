#!/usr/bin/env node
/**
 * Build / check Sitecore General Link field values. A link field must NEVER be a raw string such as "/brands": the layout service then
 * drops the whole datasource (isContentResolved: false, the component renders empty).
 *
 *   node harness/scripts/link-xml.mjs make --text "Details" --url https://example.com [--target _blank]      external link
 *   node harness/scripts/link-xml.mjs make --text "Brands" --id "{PAGE-GUID}"                                  internal link to a page of this site
 *   node harness/scripts/link-xml.mjs make --text "Details" --url "#"                                          anchor/no target yet
 *   node harness/scripts/link-xml.mjs check "<value>"                                                          exit 0 = valid link XML (or empty), 1 = raw string
 */
import { parseArgs, die } from "./_lib.mjs";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const { flags, pos } = parseArgs(process.argv.slice(2));
if (pos[0] === "make") {
  const a = { text: esc(flags.text === true ? "" : flags.text), target: esc(flags.target === true ? "" : flags.target) };
  const base = `<link text="${a.text}" anchor="" class="" title="" target="${a.target}" querystring=""`;
  if (flags.id && flags.id !== true) process.stdout.write(`${base} linktype="internal" id="${String(flags.id).toUpperCase().replace(/^([^{])/, "{$1").replace(/([^}])$/, "$1}")}" />\n`);
  else if (flags.url !== undefined) process.stdout.write(`${base} linktype="external" url="${esc(flags.url === true ? "#" : flags.url)}" />\n`);
  else die("make needs --url <url> or --id <page guid>");
} else if (pos[0] === "check") {
  const v = (pos[1] ?? "").trim();
  if (v === "" || /^<link\s[^>]*\/>$/.test(v)) { console.log("ok"); } else { console.error(`NOT a link field value: ${v.slice(0, 80)} — use link-xml.mjs make`); process.exit(1); }
} else die("usage: link-xml.mjs make|check (see header)");
