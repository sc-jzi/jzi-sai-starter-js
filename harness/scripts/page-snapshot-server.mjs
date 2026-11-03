#!/usr/bin/env node
/**
 * Receive page snapshots from the SE's OWN browser and serve them on 127.0.0.1, for prospect sites that block headless browsers
 * (bot protection / captcha). The measuring scripts (nav-extract, header-styles, section-capture, site-scraper, content-extractor) then run
 * against the local copy instead of the live site. Nothing automates the live site: a person opens it in their normal browser.
 *
 *   node harness/scripts/page-snapshot-server.mjs --customer <customer> [--port 8765]        (keep it running; run it in the background)
 *
 * The SE opens each prospect page in their own browser (Chrome/Edge), passes any captcha, opens DevTools → Console and pastes the snippet
 * from harness/reference/page-snapshot-snippet.js (the agent fills in the snapshot name). The snippet scrolls the page so lazy content loads,
 * embeds the page's woff2 web fonts, removes scripts, adds <base href> so CSS/images still load from the prospect's CDN, and navigates the tab
 * to http://127.0.0.1:<port>/receive#<name>|<gzip+base64 page>. The page's Content Security Policy usually blocks fetch() to localhost; a
 * top-level navigation with the data in the URL fragment is not blocked, and the fragment never leaves the browser. The receive page posts
 * it to its own origin. Saved as <demo folder>/snapshots/<name>.html, served at http://127.0.0.1:<port>/<name>.
 *
 * Measure: node harness/scripts/section-capture.mjs --customer <c> --url http://127.0.0.1:<port>/<name> [--selector ...] --out sections-<slug>.json
 */
import { createServer } from "node:http";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { die, parseArgs, demoDir, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer;
if (!customer) die("need --customer");
const port = Number(flags.port ?? 8765);
const dir = join(demoDir(customer), "snapshots");
mkdirSync(dir, { recursive: true });
const cors = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type", "access-control-allow-private-network": "true" };
const RECEIVE = `<!doctype html><meta charset="utf-8"><title>snapshot</title><body style="font:16px sans-serif;padding:24px">receiving...<script>
(async () => {
  const [name, b64] = decodeURIComponent(location.hash.slice(1)).split("|");
  history.replaceState(null, "", "/receive");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const html = await new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"))).text();
  const r = await fetch("/save?name=" + encodeURIComponent(name), { method: "POST", body: html });
  document.body.textContent = r.ok ? "Saved snapshot '" + name + "' (" + html.length + " characters). You can go back to the prospect's site." : "Save failed: " + r.status;
})().catch((e) => (document.body.textContent = "Snapshot failed: " + e));
</script>`;

createServer((req, res) => {
  const u = new URL(req.url, "http://127.0.0.1");
  if (req.method === "OPTIONS") { res.writeHead(204, cors); return res.end(); }
  if (u.pathname === "/receive") { res.writeHead(200, { ...cors, "content-type": "text/html; charset=utf-8" }); return res.end(RECEIVE); }
  const name = String(u.searchParams.get("name") || u.pathname.replace(/^\/+|\.html$/g, "")).replace(/[^a-z0-9-]/gi, "");
  if (req.method === "POST" && u.pathname === "/save") {
    let body = ""; req.setEncoding("utf8");
    req.on("data", (c) => (body += c));
    req.on("end", () => {
      if (!name || !body) { res.writeHead(400, cors); return res.end("missing name or body"); }
      writeFileSync(join(dir, `${name}.html`), body);
      console.log(`saved ${rootRel(join(dir, `${name}.html`))} (${body.length} chars)  →  http://127.0.0.1:${port}/${name}`);
      res.writeHead(200, cors); res.end("ok");
    });
    return;
  }
  const f = join(dir, `${name}.html`);
  if (!name || !existsSync(f)) { res.writeHead(404, cors); return res.end("not found"); }
  res.writeHead(200, { ...cors, "content-type": "text/html; charset=utf-8" }); res.end(readFileSync(f));
}).listen(port, "127.0.0.1", () => console.log(`page snapshot server for ${customer} on http://127.0.0.1:${port} (files in ${rootRel(dir)})`));
