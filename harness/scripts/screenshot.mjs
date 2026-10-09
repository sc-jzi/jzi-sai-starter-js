#!/usr/bin/env node
/**
 * Screenshot a page (the customer's homepage) with Playwright, for the Sites API thumbnail.
 *
 *   node harness/scripts/screenshot.mjs --customer <customer> --url <homepage url> [--out <file>] [--width 1440] [--height 900] [--wait 2500]
 *
 * Writes industry-verticals/<customer>/docs/ai/demos/<customer>/thumbnail.png unless --out is given (--out must also stay inside the customer folder).
 * Captures the top of the page (viewport only, not full page) so it reads well as a small card thumbnail.
 * Then: node harness/scripts/sites-api.mjs upload-thumbnail --customer <customer> --file <that png> --apply
 *
 * Needs Playwright once:  npm install --no-save playwright   &&   npx playwright install chromium
 */
import { die, parseArgs, demoDir, safeWrite, rootRel } from "./_lib.mjs";
import { join, resolve } from "node:path";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer, url = flags.url;
if (!customer || !url) die("need --customer and --url (the homepage: local dev server, e.g. http://localhost:3000/, or the live/preview URL)");
if (!/^https?:\/\//i.test(url)) die("--url must start with http:// or https://");
const out = resolve(flags.out ?? join(demoDir(customer), "thumbnail.png"));
const width = Number(flags.width ?? 1440), height = Number(flags.height ?? 900), wait = Number(flags.wait ?? 2500);

let chromium;
try { ({ chromium } = await import("playwright")); }
catch { die("Playwright is not installed. Run once from the repo root:\n  npm install --no-save playwright\n  npx playwright install chromium"); }

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
  const res = await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch((e) => die(`Could not open ${url}: ${e.message.split("\n")[0]}\nIs the dev server running / the site published?`, 1));
  if (res && res.status() >= 400) die(`${url} answered ${res.status()} — nothing to screenshot yet.`, 1);
  await page.waitForTimeout(wait);                                    // let fonts, hero images and animations settle
  await page.addStyleTag({ content: "*{caret-color:transparent!important}" }).catch(() => {});
  const png = await page.screenshot({ type: "png" });
  safeWrite(customer, out, png);
  console.log(`✅ ${rootRel(out)} (${width}x${height}, ${Math.round(png.length / 1024)} KB)`);
} finally { await browser.close(); }
