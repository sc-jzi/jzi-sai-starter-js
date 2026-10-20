#!/usr/bin/env node
/**
 * Measure the prospect's REAL header (eyebrow bar + logo bar + main menu) with Playwright: sizes, colours, fonts, spacing.
 * The numbers feed the client variants of Eyebrow / Header / Navigation (header-kit.mjs), so the demo header matches the prospect's
 * instead of the shared Default look (wrong colours, oversized menu, dim text on a dark bar).
 *
 *   node harness/scripts/header-styles.mjs --customer <customer> --url <prospect homepage> [--width 1440]
 *   node harness/scripts/header-styles.mjs --customer <customer> --url <DEMO site url> --out header-styles.demo.json --compare header-styles.json
 *       measures the BUILT demo header and compares it with the prospect's measurement (the "pixel gate": exit 4 when something is off, with the list).
 *
 * Reads <demo>/nav.json (from nav-extract.mjs) for the labels: `eyebrow`, `eyebrowExtras` (phone / cta) and `items` (main menu). Without nav.json it guesses
 * (first <nav> = main menu, no eyebrow). Override with --eyebrow "About Us,Contact Us" --main "Critical Power,Motive Power".
 * Writes <demo>/<--out, default header-styles.json> and the matching .png (the top band of the page; header-reference.png for the prospect, used for the before/after comparison).
 * Colours are #rrggbb, sizes are px numbers. A block is null when it was not found: say so in manual-tasks.md and measure it by eye from the screenshot.
 */
import { die, parseArgs, demoDir, safeWrite, rootRel, readJson } from "./_lib.mjs";
import { join } from "node:path";
import { mkdirSync, writeFileSync } from "node:fs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer, url = flags.url;
if (!customer || !url) die("need --customer and --url");
const width = Number(flags.width ?? 1440);
const outName = String(flags.out ?? "header-styles.json"), pngName = outName === "header-styles.json" ? "header-reference.png" : outName.replace(/\.json$/i, "") + ".png";
let chromium;
try { ({ chromium } = await import("playwright")); } catch { die("Playwright is not installed: run node harness/scripts/deps-check.mjs --fix"); }

const nav = readJson(join(demoDir(customer), "nav.json"), {}) || {};
const csv = (v) => String(v).split(",").map((s) => s.trim()).filter(Boolean);
const args = {
  eyebrow: flags.eyebrow ? csv(flags.eyebrow) : (nav.eyebrow || []).map((e) => e.label),
  main: flags.main ? csv(flags.main) : (nav.items || []).filter((i) => !i.utility).map((i) => i.label),
  cta: (nav.eyebrowExtras || []).filter((e) => e.kind === "cta").map((e) => e.label),
  phone: (nav.eyebrowExtras || []).filter((e) => e.kind === "phone").map((e) => e.label),
};

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
try {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => die(`Could not open ${url}: ${e.message.split("\n")[0]}`, 1));
  await page.waitForTimeout(3000);
  const res = await page.evaluate((a) => {
    const vw = window.innerWidth;
    const clean = (t) => (t || "").replace(/\s+/g, " ").trim().toLowerCase();
    const num = (v) => Math.round((parseFloat(v) || 0) * 100) / 100;
    const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
    const hex = (c) => { const p = typeof c === "string" ? parse(c) : c; if (!p) return null; return "#" + [p.r, p.g, p.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""); };
    const visible = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && r.bottom > 0; };
    const lum = (p) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(p.r) + 0.7152 * f(p.g) + 0.0722 * f(p.b); };
    const contrast = (a1, b1) => { const A = parse(a1), B = parse(b1); if (!A || !B) return null; const x = lum(A), y = lum(B); return Math.round(((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)) * 100) / 100; };
    const solidBg = (el) => { for (let n = el; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.05) return { el: n, color: getComputedStyle(n).backgroundColor }; } return { el: null, color: "rgb(255, 255, 255)" }; };
    const text = (cs) => ({ fontFamily: (cs.fontFamily || "").split(",")[0].replace(/["']/g, "").trim(), fontSize: num(cs.fontSize), fontWeight: cs.fontWeight, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing === "normal" ? 0 : num(cs.letterSpacing), lineHeight: cs.lineHeight === "normal" ? null : num(cs.lineHeight), color: hex(cs.color) });
    const anchors = [...document.querySelectorAll("a[href], button")].filter(visible);
    const byLabel = (label) => anchors.filter((x) => clean(x.textContent) === clean(label)).sort((p, q) => p.getBoundingClientRect().top - q.getBoundingClientRect().top)[0];
    const gaps = (els) => { const rs = els.map((e) => e.getBoundingClientRect()).sort((p, q) => p.left - q.left); const g = []; for (let i = 1; i < rs.length; i++) if (rs[i].left >= rs[i - 1].right - 1 && Math.abs(rs[i].top - rs[i - 1].top) < 30) g.push(rs[i].left - rs[i - 1].right); g.sort((p, q) => p - q); return g.length ? Math.round(g[Math.floor(g.length / 2)]) : null; };
    const commonBand = (els) => { let n = els[0]; while (n && !els.every((e) => n.contains(e))) n = n.parentElement; return n; };
    const out = { viewport: vw };

    // ---- eyebrow bar
    const eb = a.eyebrow.map(byLabel).filter(Boolean);
    if (eb.length >= 1) {
      const bg = solidBg(eb[0]); let band = bg.el;
      while (band && band.getBoundingClientRect().width < vw * 0.9 && band.parentElement) band = band.parentElement;
      let bandBg = band ? solidBg(band) : bg; let br = band ? band.getBoundingClientRect() : eb[0].getBoundingClientRect();
      if (!band || br.height > 150) {   // the only full-width ancestor is a page wrapper (utility links share the header row): the bar is the links' own row
        const lr0 = eb.map((e) => e.getBoundingClientRect()), top0 = Math.min(...lr0.map((r) => r.top)), bot0 = Math.max(...lr0.map((r) => r.bottom)), pad = Math.min(top0, 14);
        br = { top: Math.max(0, top0 - pad), height: bot0 + pad - Math.max(0, top0 - pad), bottom: bot0 + pad, width: vw }; bandBg = solidBg(document.body);
      }
      const cs = getComputedStyle(eb[0]);
      const phoneEl = (a.phone.map(byLabel).filter(Boolean)[0]) || anchors.find((x) => /^tel:/i.test(x.getAttribute("href") || "") && x.getBoundingClientRect().top < br.bottom + 4);
      const ctaEl = a.cta.map(byLabel).filter(Boolean)[0];
      const searchEl = anchors.find((x) => /search/i.test((x.getAttribute("aria-label") || "") + " " + x.className + " " + (x.getAttribute("title") || "")) && x.getBoundingClientRect().top < br.bottom + 4);
      const ccs = ctaEl ? getComputedStyle(ctaEl) : null, ps = phoneEl ? getComputedStyle(phoneEl) : null;
      const rs = eb.map((e) => e.getBoundingClientRect());
      const right = Math.max(...rs.map((r) => r.right)), left = Math.min(...rs.map((r) => r.left));
      out.eyebrow = {
        bar: { background: hex(bandBg.color), height: Math.round(br.height), top: Math.round(br.top) },
        links: { ...text(cs), gap: gaps(eb), contrastOnBar: contrast(cs.color, bandBg.color), count: eb.length, groupLeft: Math.round(left), groupRight: Math.round(right) },
        phone: phoneEl ? { ...text(ps), label: (phoneEl.textContent || "").trim(), href: phoneEl.getAttribute("href") } : null,
        search: searchEl ? (() => { const r = searchEl.getBoundingClientRect(), s = searchEl.querySelector("svg"); return { size: Math.round(Math.max(r.width, r.height)), color: hex(getComputedStyle(s || searchEl).color) }; })() : null,
        cta: ctaEl ? { label: (ctaEl.textContent || "").trim(), href: ctaEl.getAttribute("href"), ...text(ccs), background: hex(ccs.backgroundColor), borderRadius: num(ccs.borderTopLeftRadius), paddingX: num(ccs.paddingLeft), paddingY: num(ccs.paddingTop), height: Math.round(ctaEl.getBoundingClientRect().height), border: ccs.borderTopWidth !== "0px" ? { width: num(ccs.borderTopWidth), color: hex(ccs.borderTopColor) } : null } : null,
      };
    } else out.eyebrow = null;

    // ---- main menu + logo bar
    let mm = a.main.map(byLabel).filter(Boolean);
    if (!mm.length) { const n = document.querySelector("header nav, nav"); if (n) mm = [...n.querySelectorAll("a[href]")].filter(visible).slice(0, 8); }
    if (mm.length) {
      const top = mm.filter((m) => !(out.eyebrow && m.getBoundingClientRect().bottom <= out.eyebrow.bar.top + out.eyebrow.bar.height + 2));
      const links = top.length ? top : mm;
      const cs = getComputedStyle(links[0]);
      let hdr = commonBand(links); let candidate = hdr;
      for (let n = hdr; n && n !== document.body; n = n.parentElement) { const r = n.getBoundingClientRect(); if (r.width >= vw * 0.9) { candidate = n; break; } }
      // The header ends where the <header>/banner ends; when the only full-width ancestor is a page wrapper (> 300px) it ends below the lowest of the logo and menu links.
      const hEl = document.querySelector("header, [role=banner]"), hElR = hEl ? hEl.getBoundingClientRect() : null;
      if (candidate.getBoundingClientRect().height > 300) candidate = hEl && hElR.height <= 300 && hEl.contains(links[0]) ? hEl : hdr;
      const lowest = Math.max(...links.map((l) => l.getBoundingClientRect().bottom));
      const limit = Math.round(hElR && hElR.height <= 300 && hElR.bottom > lowest ? hElR.bottom : Math.min(420, lowest + 16));
      const hb = solidBg(candidate), hr = candidate.getBoundingClientRect();
      const ebBottom = out.eyebrow ? out.eyebrow.bar.top + out.eyebrow.bar.height : 0;
      const bandTop = Math.max(hr.top, ebBottom);
      const logoEl = [...candidate.querySelectorAll("img, svg")].filter(visible).filter((x) => x.getBoundingClientRect().left < vw * 0.4 && x.getBoundingClientRect().width > 40).sort((p, q) => p.getBoundingClientRect().left - q.getBoundingClientRect().left)[0];
      const lr = logoEl ? logoEl.getBoundingClientRect() : null;
      const hcs = getComputedStyle(candidate);
      // Colour bands down the left edge: the logo row and the menu row are often stacked in ONE <header> with different backgrounds and heights.
      const bandsAt = []; { let cur = null; for (let y = 0; y < limit; y += 2) { const els = document.elementsFromPoint(6, y + 1); const c = els.length ? solidBg(els[0]).color : "rgb(255, 255, 255)"; if (cur && cur.color === c) cur.bottom = y + 2; else { cur = { top: y, bottom: y + 2, color: c }; bandsAt.push(cur); } } }
      const bandOf = (yc) => bandsAt.find((b) => yc >= b.top && yc < b.bottom);
      // The logo as DISPLAYED: many sites hide the <img> and paint another file as a CSS background (::before) — e.g. a white logo on a coloured band.
      const urlOf = (v) => { const m = String(v).match(/^url\(\s*(["']?)(.*)\1\s*\)$/); if (!m) return null; try { return new URL(m[2], location.href).href; } catch { return m[2]; } };
      let logoInfo = null, logoRect = null;
      for (const a of [...new Set([...candidate.querySelectorAll("a"), ...document.querySelectorAll("header a")])]) {
        const r = a.getBoundingClientRect(); if (r.width <= 0 || r.height <= 0 || r.left > vw * 0.4 || r.top > 300) continue;
        const img = a.querySelector("img"), imgSrc = img ? (img.currentSrc || img.src) : null;
        const imgHidden = img ? (() => { const st = getComputedStyle(img), ir = img.getBoundingClientRect(); return st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity) === 0 || ir.width < 2 || ir.height < 2; })() : false;
        const css = ["::before", "::after"].map((pp) => urlOf(getComputedStyle(a, pp).backgroundImage)).find(Boolean) || urlOf(getComputedStyle(a).backgroundImage);
        if (!imgSrc && !css) continue;
        const shown = css && (!imgSrc || imgHidden) ? css : imgSrc;
        logoInfo = { url: shown, source: shown === css ? "css-background" : "img", imgSrc, cssBackground: css || null, differs: !!(imgSrc && css && imgSrc !== css) };
        logoRect = r; break;
      }
      const lg = lr || logoRect;
      const hasChevron = links.some((l) => l.querySelector("svg, i, [class*=chevron], [class*=arrow], [class*=caret]") || /after|before/.test("") || (l.parentElement && l.parentElement.querySelector(":scope > svg, :scope > i, :scope > button[aria-expanded]")) || getComputedStyle(l, "::after").content !== "none" && getComputedStyle(l, "::after").content !== "normal");
      const rs = links.map((l) => l.getBoundingClientRect());
      out.header = {
        band: { background: hex(hb.color), height: Math.round(Math.min(hr.bottom, hr.top + hr.height) - bandTop), borderBottom: hcs.borderBottomWidth !== "0px" ? { width: num(hcs.borderBottomWidth), color: hex(hcs.borderBottomColor) } : null, boxShadow: hcs.boxShadow !== "none" ? hcs.boxShadow : null },
        logo: lg ? { width: Math.round(lg.width), height: Math.round(lg.height), left: Math.round(lg.left), ...(logoInfo || {}) } : null,
        nav: { ...text(cs), gap: gaps(links), hasChevron, count: links.length, groupLeft: Math.round(Math.min(...rs.map((r) => r.left))), groupRight: Math.round(Math.max(...rs.map((r) => r.right))), contrastOnBand: contrast(cs.color, hb.color), paddingX: num(cs.paddingLeft), paddingY: num(cs.paddingTop) },
      };
      { const lb = lg ? bandOf(lg.top + lg.height / 2) : null, mb = bandOf(rs[0].top + rs[0].height / 2);
        if (lb && lb.bottom - lb.top >= 20) { out.header.band.height = lb.bottom - lb.top; out.header.band.background = hex(lb.color); }
        if (lb && mb && mb !== lb) out.header.menuBand = { background: hex(mb.color), height: mb.bottom - mb.top };
        out.header.bands = bandsAt.filter((b) => b.bottom - b.top >= 6).map((b) => ({ top: b.top, height: b.bottom - b.top, background: hex(b.color) })); }
      out.clipHeight = Math.min(400, Math.round(Math.max(hr.bottom, out.eyebrow ? out.eyebrow.bar.top + out.eyebrow.bar.height : 0)) + 10);
    } else out.header = null;
    return out;
  }, args);
  const demo = demoDir(customer);
  const clip = { x: 0, y: 0, width, height: Math.max(120, res.clipHeight || 200) };
  mkdirSync(demo, { recursive: true });
  const png = await page.screenshot({ clip, type: "png" });
  safeWrite(customer, join(demo, pngName), png);
  const outJson = { url, measuredAt: new Date().toISOString(), width, labels: args, ...res };
  safeWrite(customer, join(demo, outName), JSON.stringify(outJson, null, 2) + "\n");
  const e = res.eyebrow, h = res.header;
  console.log(`✅ ${rootRel(join(demo, outName))} (+ ${pngName})`);
  console.log(e ? `Eyebrow bar: bg ${e.bar.background}, height ${e.bar.height}px; links ${e.links.fontSize}px/${e.links.fontWeight} ${e.links.textTransform} ${e.links.color} (contrast ${e.links.contrastOnBar}), gap ${e.links.gap}px; phone ${e.phone ? "yes" : "no"}, search ${e.search ? "yes" : "no"}, CTA ${e.cta ? `"${e.cta.label}" ${e.cta.background}` : "no"}` : "Eyebrow bar: NOT FOUND (no eyebrow links located)");
  if (h?.logo?.url) console.log(`Logo as displayed: ${h.logo.source} ${h.logo.url}${h.logo.differs ? `\n⚠ the page's <img> points to a DIFFERENT file (${h.logo.imgSrc}); the site paints ${h.logo.cssBackground} instead. Use the displayed one, and list "logo differs: <img> vs CSS" in manual-tasks.md` : ""}`);
  console.log(h ? `Header band: bg ${h.band.background}, height ${h.band.height}px; logo ${h.logo ? `${h.logo.width}x${h.logo.height}` : "not found"}; nav links ${h.nav.fontSize}px/${h.nav.fontWeight} ${h.nav.textTransform} ${h.nav.color}, gap ${h.nav.gap}px, chevron ${h.nav.hasChevron}` : "Header band: NOT FOUND (no main-menu links located)");
  if (!e && !h) process.exitCode = 3;
  if (flags.compare) {
    const ref = readJson(join(demo, String(flags.compare)));
    if (!ref) die(`--compare: ${flags.compare} not found in the demo folder`);
    const bad = [], chk = (name, a, b, tol, kind = "num") => {
      if (a == null && b == null) return;
      if (a == null || b == null) { bad.push(`${name}: ${a == null ? "missing in the demo" : "not on the prospect"} (prospect ${b ?? "-"}, demo ${a ?? "-"})`); return; }
      const ok = kind === "color" ? (() => { const p = (x) => [1, 3, 5].map((i) => parseInt(x.slice(i, i + 2), 16)); const d = p(a).map((v, i) => Math.abs(v - p(b)[i])); return Math.max(...d) <= tol; })() : kind === "eq" ? String(a).toLowerCase() === String(b).toLowerCase() : Math.abs(a - b) <= tol;
      if (!ok) bad.push(`${name}: prospect ${b}, demo ${a}`);
    };
    const R = ref, D = res;
    if (R.eyebrow) {
      if (!D.eyebrow) bad.push("eyebrow bar: not found in the demo");
      else {
        chk("eyebrow bar background", D.eyebrow.bar.background, R.eyebrow.bar.background, 12, "color");
        chk("eyebrow bar height", D.eyebrow.bar.height, R.eyebrow.bar.height, 8);
        chk("eyebrow link size", D.eyebrow.links.fontSize, R.eyebrow.links.fontSize, 1);
        chk("eyebrow link weight", D.eyebrow.links.fontWeight, R.eyebrow.links.fontWeight, 0, "eq");
        chk("eyebrow link case", D.eyebrow.links.textTransform, R.eyebrow.links.textTransform, 0, "eq");
        chk("eyebrow link colour", D.eyebrow.links.color, R.eyebrow.links.color, 16, "color");
        chk("eyebrow link gap", D.eyebrow.links.gap, R.eyebrow.links.gap, 10);
        if (D.eyebrow.links.contrastOnBar != null && D.eyebrow.links.contrastOnBar < 4.5) bad.push(`eyebrow links are hard to read: contrast ${D.eyebrow.links.contrastOnBar}:1 between ${D.eyebrow.links.color} and the bar ${D.eyebrow.bar.background} (need 4.5:1)`);
        if (R.eyebrow.phone) chk("eyebrow phone", D.eyebrow.phone && 1, 1, 0);
        if (R.eyebrow.search) chk("eyebrow search icon", D.eyebrow.search && 1, 1, 0);
        if (R.eyebrow.cta) { chk("CTA present", D.eyebrow.cta && 1, 1, 0); if (D.eyebrow.cta) { chk("CTA background", D.eyebrow.cta.background, R.eyebrow.cta.background, 16, "color"); chk("CTA text colour", D.eyebrow.cta.color, R.eyebrow.cta.color, 16, "color"); chk("CTA radius", D.eyebrow.cta.borderRadius, R.eyebrow.cta.borderRadius, 3); } }
      }
    }
    if (R.header) {
      if (!D.header) bad.push("header band / main menu: not found in the demo");
      else {
        chk("header background", D.header.band.background, R.header.band.background, 12, "color");
        chk("header band height", D.header.band.height, R.header.band.height, 12);
        if (R.header.logo) chk("logo width", D.header.logo && D.header.logo.width, R.header.logo.width, Math.round(R.header.logo.width * 0.15));
        chk("menu link size", D.header.nav.fontSize, R.header.nav.fontSize, 1.5);
        chk("menu link weight", D.header.nav.fontWeight, R.header.nav.fontWeight, 0, "eq");
        chk("menu link case", D.header.nav.textTransform, R.header.nav.textTransform, 0, "eq");
        chk("menu link colour", D.header.nav.color, R.header.nav.color, 24, "color");
        chk("menu link gap", D.header.nav.gap, R.header.nav.gap, 14);
        if (D.header.nav.contrastOnBand != null && D.header.nav.contrastOnBand < 4.5) bad.push(`menu links are hard to read: contrast ${D.header.nav.contrastOnBand}:1`);
        chk("menu item count (top level only)", D.header.nav.count, R.header.nav.count, 1);
      }
    }
    { const vp = join(demo, outName.replace(/\.json$/, ".verdict.json")), prev = readJson(vp, {}); safeWrite(customer, vp, JSON.stringify({ pass: bad.length === 0, attempts: (prev.attempts || 0) + 1, diffs: bad, at: new Date().toISOString() }, null, 2) + "\n"); }   // read by run-gate.mjs
    if (bad.length) { console.log(`✖ header differs from the prospect's in ${bad.length} place(s):\n  - ${bad.join("\n  - ")}`); process.exitCode = 4; } else console.log("✔ header matches the prospect's measurements within tolerance");
  }
} finally { await browser.close(); }
