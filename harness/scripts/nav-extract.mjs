#!/usr/bin/env node
/**
 * Read the prospect's header navigation (labels, links, dropdown hierarchy) with Playwright, so the demo site gets the same information architecture.
 *
 *   node harness/scripts/nav-extract.mjs --customer <customer> --url <prospect homepage> [--width 1440] [--hover] [--root "<css selector of the MAIN menu>"]
 *   When the result is wrong (utility links picked as the main menu, a mega menu cut off) re-run with --root, e.g. --root "ul.navbar-nav". Never hand-edit nav.json.
 *
 * Writes industry-verticals/<customer>/docs/ai/demos/<customer>/nav.json:  { url, source, items: [{ label, href, children: [...] }] }
 * Looks at <header> / <nav> / [role=navigation] (the one nearest the top of the page with the most links), follows nested lists, and with --hover also
 * hovers each top-level item so dropdowns that only exist after hover are read. The MAIN menu (`items`, includes Login/Success Stories etc.) is kept apart from the small utility bar above it (`eyebrow`: About us, Join our team, Locations, Contact us ...; `eyebrowExtras`: phone number and CTA button, which are not pages). Search/language controls are flagged `utility: true`.
 * Output also: eyebrow: [{ label, href }], eyebrowExtras: [{ label, href, kind: phone|cta }]. Check all three against the homepage screenshot.
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
  const read = () => page.evaluate((rootSel) => {
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
    const visible = (el) => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none"; };
    // Labels that belong to a small "utility / eyebrow" bar above the main menu, not to the main menu itself.
    const EYEBROW = /^(about( us)?|join our team|careers?|jobs?|locations?|find a (store|location)|contact( us)?|investors?|news|newsroom|press|blog|support|help|partners?|customer service|request a (quote|demo)|get a quote|get started|subscribe|donate|shop|store|sign ?up)$/i;
    const SKIP = /^(search|language|en|fr|menu|close|cart|toggle.*)$/i;      // controls, not pages (Login is a page and stays in the menu)
    const cands = [...document.querySelectorAll(rootSel || "header nav, nav, [role=navigation], header, ul")]
      .filter((n) => visible(n) && n.querySelectorAll("a[href]").length >= 2 && n.getBoundingClientRect().top < 400)
      .filter((n, i, all) => !all.some((o) => o !== n && n.contains(o) && o.querySelectorAll("a[href]").length === n.querySelectorAll("a[href]").length));   // keep the innermost of equal containers
    const info = cands.map((n) => {
      const links = [...n.querySelectorAll("a[href]")].filter(visible);
      const labels = links.map((a) => clean(a.textContent)).filter(Boolean);
      const util = labels.length ? labels.filter((l) => EYEBROW.test(l) || /^\+?[\d(][\d\s().-]{6,}$/.test(l)).length / labels.length : 0;
      const nested = n.querySelectorAll("li li, ul ul").length > 0;
      const sizes = links.map((a) => parseFloat(getComputedStyle(a).fontSize) || 14);
      const font = sizes.reduce((x, y) => x + y, 0) / (sizes.length || 1);
      return { n, top: n.getBoundingClientRect().top, count: labels.length, util, nested, font, score: labels.length + (nested ? 10 : 0) + (font >= 15 ? 4 : 0) - (util >= 0.5 ? 40 : 0) };
    });
    info.sort((a, b) => b.score - a.score);
    const mainInfo = info[0];
    if (!mainInfo) return { source: "none", items: [], eyebrow: [] };
    const root = mainInfo.n;
    const UTIL = SKIP;
    const anchor = (li) => [...li.children].find((c) => c.tagName === "A") || li.querySelector(":scope > * > a, :scope > a") || li.querySelector("a");
    const walk = (ul) => [...ul.children].filter((li) => li.tagName === "LI").map((li) => {
      const a = anchor(li), sub = [...li.children].flatMap((c) => (c.tagName === "UL" || c.tagName === "OL") ? [c] : [...c.querySelectorAll(":scope > ul, :scope > ol")]);
      const item = { label: clean(a?.textContent) || clean(li.firstChild?.textContent), href: a?.getAttribute("href") || "", children: sub.flatMap((u) => walk(u)) };
      if (UTIL.test(item.label)) item.utility = true;
      return item;
    }).filter((i) => i.label);
    let res;
    const top = root.matches("ul, ol") ? root : [...root.querySelectorAll("ul, ol")].find((u) => !u.closest("li ul, li ol") && u.querySelectorAll("a").length >= 2);
    if (top) res = { source: "nested lists", items: walk(top) };
    else {
      const seen = new Set(), items = [];
      for (const a of root.querySelectorAll("a[href]")) { const l = clean(a.textContent); if (l && !seen.has(l)) { seen.add(l); items.push({ label: l, href: a.getAttribute("href"), children: [], ...(UTIL.test(l) ? { utility: true } : {}) }); } }
      res = { source: "flat links (no list structure found)", items };
    }
    // Eyebrow / utility bar: visible links sitting ABOVE the main menu (or in a candidate classified as utility), outside the main menu element.
    const mainTop = mainInfo.top + 2, seen = new Set(), eyebrow = [], extras = [];
    for (const a of document.querySelectorAll("a[href]")) {
      if (root.contains(a) || !visible(a)) continue;
      const r = a.getBoundingClientRect(); const label = clean(a.textContent), href = a.getAttribute("href") || "";
      const inUtilCand = info.some((c) => c !== mainInfo && c.util >= 0.4 && c.n.contains(a));
      if (!label && !/^tel:/i.test(href)) continue;
      if (!(r.bottom <= mainTop + 4 && r.top < 260) && !inUtilCand) continue;
      if (SKIP.test(label) || seen.has(label + href)) continue;
      seen.add(label + href);
      const bg = getComputedStyle(a).backgroundColor, btn = /btn|button|cta/i.test(a.className) || (bg && !/rgba?\(0, 0, 0, 0\)|transparent|rgb\(255, 255, 255\)/.test(bg) && r.height > 24);
      if (/^tel:/i.test(href) || /^\+?[\d(][\d\s().-]{6,}$/.test(label)) extras.push({ label, href, kind: "phone" });
      else if (btn) extras.push({ label, href, kind: "cta" });
      else if (r.width < 600) eyebrow.push({ label, href });
    }
    return { ...res, eyebrow, eyebrowExtras: extras };
  }, typeof flags.root === "string" ? flags.root : "");
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
  console.log(`Eyebrow / utility bar: ${(res.eyebrow || []).map((e) => e.label).join(" | ") || "(none found)"}${(res.eyebrowExtras || []).length ? `   [not pages: ${res.eyebrowExtras.map((e) => `${e.kind}: ${e.label}`).join("; ")}]` : ""}`);
  console.log("Main menu:");
  const show = (xs, d = 0) => xs.forEach((x) => { console.log(`${"  ".repeat(d)}- ${x.label}${x.href ? `  → ${x.href}` : ""}${x.utility ? "  [utility]" : ""}`); show(x.children, d + 1); }); show(res.items);
} finally { await browser.close(); }
