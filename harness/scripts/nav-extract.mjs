#!/usr/bin/env node
/**
 * Read the prospect's header navigation (labels, links, dropdown hierarchy) with Playwright, so the demo site gets the same information architecture.
 *
 *   node harness/scripts/nav-extract.mjs --customer <customer> --url <prospect homepage> [--width 1440] [--hover]
 *
 * Writes industry-verticals/<customer>/docs/ai/demos/<customer>/nav.json:  { url, source, items: [{ label, href, children: [...] }] }
 * Looks at <header> / <nav> / [role=navigation] (the one nearest the top of the page with the most links), follows nested lists, and with --hover also
 * hovers each top-level item so dropdowns that only exist after hover are read. Utility links (login, search, language) are flagged `utility: true`.
 * Mega menus and JS-only menus can come out flat or incomplete: compare with the homepage screenshot and fix the tree by hand.
 */
import { die, parseArgs, demoDir, safeWrite, rootRel } from "./_lib.mjs";
import { join } from "node:path";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer, url = flags.url;
if (!customer || !url) die("need --customer and --url");
let chromium;
try { ({ chromium } = await import("playwright")); } catch { die("Playwright is not installed: run node harness/scripts/deps-check.mjs --fix"); }

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width: Number(flags.width ?? 1440), height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => die(`Could not open ${url}: ${e.message.split("\n")[0]}`, 1));
  await page.waitForTimeout(2500);
  const read = () => page.evaluate(() => {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const navs = [...document.querySelectorAll("header nav, nav, [role=navigation], header")].filter((n) => n.querySelectorAll("a[href]").length >= 3);
    navs.sort((a, b) => (a.getBoundingClientRect().top - b.getBoundingClientRect().top) || (b.querySelectorAll("a").length - a.querySelectorAll("a").length));
    const root = navs.find((n) => n.matches("nav, [role=navigation]")) || navs[0];
    if (!root) return { source: "none", items: [] };
    const UTIL = /^(log ?in|sign ?in|search|contact|language|en|fr|menu|close|cart|my account|register)$/i;
    const anchor = (li) => [...li.children].find((c) => c.tagName === "A") || li.querySelector(":scope > * > a, :scope > a") || li.querySelector("a");
    const walk = (ul) => [...ul.children].filter((li) => li.tagName === "LI").map((li) => {
      const a = anchor(li), sub = [...li.children].flatMap((c) => (c.tagName === "UL" || c.tagName === "OL") ? [c] : [...c.querySelectorAll(":scope > ul, :scope > ol")]);
      const item = { label: clean(a?.textContent) || clean(li.firstChild?.textContent), href: a?.getAttribute("href") || "", children: sub.flatMap((u) => walk(u)) };
      if (UTIL.test(item.label)) item.utility = true;
      return item;
    }).filter((i) => i.label);
    const top = [...root.querySelectorAll("ul, ol")].find((u) => !u.closest("li ul, li ol") && u.querySelectorAll("a").length >= 3);
    if (top) return { source: "nested lists", items: walk(top) };
    const seen = new Set(), items = [];
    for (const a of root.querySelectorAll("a[href]")) { const l = clean(a.textContent); if (l && !seen.has(l)) { seen.add(l); items.push({ label: l, href: a.getAttribute("href"), children: [], ...(UTIL.test(l) ? { utility: true } : {}) }); } }
    return { source: "flat links (no list structure found)", items };
  });
  let res = await read();
  if (flags.hover && res.items.length) {
    for (const it of res.items.filter((i) => !i.children.length && !i.utility)) {
      const loc = page.getByRole("link", { name: it.label, exact: true }).first();
      await loc.hover({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(400);
    }
    const again = await read(); if (JSON.stringify(again.items).length > JSON.stringify(res.items).length) res = { ...again, source: `${again.source} + hover` };
  }
  const out = { url, ...res };
  safeWrite(customer, join(demoDir(customer), "nav.json"), JSON.stringify(out, null, 2) + "\n");
  const count = (xs) => xs.reduce((n, x) => n + 1 + count(x.children), 0);
  console.log(`✅ ${rootRel(join(demoDir(customer), "nav.json"))}: ${res.items.length} top-level items, ${count(res.items)} in total (${res.source}).`);
  const show = (xs, d = 0) => xs.forEach((x) => { console.log(`${"  ".repeat(d)}- ${x.label}${x.href ? `  → ${x.href}` : ""}${x.utility ? "  [utility]" : ""}`); show(x.children, d + 1); }); show(res.items);
} finally { await browser.close(); }
