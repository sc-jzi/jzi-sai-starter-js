#!/usr/bin/env node
/**
 * Build / check Sitecore General Link field values. A link field must NEVER be a raw string such as "/brands": the layout service then
 * drops the whole datasource (isContentResolved: false, the component renders empty).
 *
 *   node harness/scripts/link-xml.mjs make --text "Details" --url https://example.com [--target _blank]      external link
 *   node harness/scripts/link-xml.mjs make --text "Brands" --id "{PAGE-GUID}"                                  internal link to a page of this site
 *   node harness/scripts/link-xml.mjs make --text "Details" --url "#"                                          anchor/no target yet
 *   node harness/scripts/link-xml.mjs make --text "Email us" --mailto info@example.com                         mailto link
 *   node harness/scripts/link-xml.mjs check "<value>"                                                          exit 0 = valid, 1 = literal value, internal without an id, ...
 *   (the whole site at once, read from Sitecore: link-audit.mjs)
 *
 * An internal link is linktype="internal" id="{GUID}": the id resolves it. linktype="internal" url="/path" WITHOUT an id is the same
 * failure as a raw path: the layout service drops the whole datasource. A url next to the id (Sitecore's link picker adds one) is fine. An external url is http(s), or the "#" placeholder.
 * mailto, media and anchor links are valid too. The rules live in _lib.mjs (linkError).
 */
import { parseArgs, die, linkError } from "./_lib.mjs";
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
const { flags, pos } = parseArgs(process.argv.slice(2));
if (pos[0] === "make") {
  const a = { text: esc(flags.text === true ? "" : flags.text), target: esc(flags.target === true ? "" : flags.target) };
  const base = `<link text="${a.text}" anchor="" class="" title="" target="${a.target}" querystring=""`;
  if (flags.id && flags.id !== true) process.stdout.write(`${base} linktype="internal" id="${String(flags.id).toUpperCase().replace(/^([^{])/, "{$1").replace(/([^}])$/, "$1}")}" />\n`);
  else if (flags.mailto && flags.mailto !== true) process.stdout.write(`${base} linktype="mailto" url="mailto:${esc(String(flags.mailto).replace(/^mailto:/i, ""))}" />
`);
  else if (flags.url !== undefined && /^\//.test(String(flags.url))) die(`"${flags.url}" is a path on this site: that is an internal link. Use make --id "{page guid}" (the page id from site-manifest.json / demo-progress.yaml), never --url with a path.`);
  else if (flags.url !== undefined) process.stdout.write(`${base} linktype="external" url="${esc(flags.url === true ? "#" : flags.url)}" />\n`);
  else die("make needs --id <page guid>, --url <url> or --mailto <address>");
} else if (pos[0] === "check") {
  const err = linkError((pos[1] ?? "").trim());
  if (err) { console.error(err); process.exit(1); }
  console.log("ok");
} else die("usage: link-xml.mjs make|check (see header)");
