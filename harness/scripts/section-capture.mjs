#!/usr/bin/env node
/**
 * Capture the prospect's page SECTION BY SECTION (Playwright): one screenshot per section plus measured styles, so the client variants are built
 * from numbers and crops instead of from a guess at one full-page screenshot.
 *
 *   node harness/scripts/section-capture.mjs --customer <customer> --url <prospect page> [--width 1440] [--selector "main > section"] [--out sections.json]
 *   node harness/scripts/section-capture.mjs --customer <customer> --url <DEMO page> --out sections.demo.json --compare sections.json     (gate, exit 4 on differences)
 *
 * Writes in <demo folder>: sections.json, sections/NN-<slug>.png (one crop per section), sections.md (one table the agent and the SE can read).
 * Per section: effective background colour + CSS background image, content width, top/bottom padding, the elements in visual order with their ROLE
 * (eyebrow | heading | text | button | link | image | field), heading / eyebrow / text / button styles (font, size, weight, case, colour, radius, padding),
 * inner "card" backgrounds, columns, which side the image is on, images (<img> and CSS background URLs), links, form controls.
 * The split into sections is a heuristic (the stack of full-width bands under <main>); if it is wrong pass --selector, and the SE can always drop
 * hand-made crops in <demo folder>/sections/ (same NN- prefix) which take priority as visual reference.
 * Header and nav are measured by header-styles.mjs; the footer IS captured here (last section, kind: footer).
 * Exit 0 ok · 3 no sections found · 4 --compare found differences.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { die, parseArgs, demoDir, safeWrite, readJson, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer, url = flags.url;
if (!customer || !url) die("need --customer and --url");
let chromium; try { ({ chromium } = await import("playwright")); } catch { die("Playwright is not installed: run node harness/scripts/deps-check.mjs --fix"); }
const demo = demoDir(customer), outName = String(flags.out ?? "sections.json"), width = Number(flags.width ?? 1440);
const isDemoRun = outName !== "sections.json";
const shotDir = join(demo, isDemoRun ? "sections-demo" : "sections");
mkdirSync(shotDir, { recursive: true });

const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
let result;
try {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 }).catch((e) => die(`Could not open ${url}: ${e.message.split("\n")[0]}`, 1));
  await page.waitForTimeout(2500);
  // trigger lazy content
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 700) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(120); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(400);

  // 1) mark the sections
  const found = await page.evaluate((sel) => {
    const vw = window.innerWidth;
    const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/;
    const kids = (el) => [...el.children].filter((k) => !SKIP.test(k.tagName) && vis(k));
    const band = (k) => { const r = k.getBoundingClientRect(); return r.height >= 60 && r.width >= vw * 0.7; };
    let list = [];
    if (sel) list = [...document.querySelectorAll(sel)].filter(vis);
    else {
      let root = document.body;
      for (let i = 0; i < 6; i++) {
        const ks = kids(root).filter((k) => !/^(HEADER|NAV)$/.test(k.tagName));
        const bands = ks.filter(band);
        if (bands.length >= 3) { list = bands; break; }
        const next = bands.length === 1 ? bands[0] : bands.find((b) => /^(MAIN)$/.test(b.tagName) || b.getAttribute("role") === "main") || bands.sort((a, b) => b.getBoundingClientRect().height - a.getBoundingClientRect().height)[0];
        if (!next) break; root = next;
      }
      // a <main> beside <footer>: the footer is a band of its own, expand <main> into its bands
      list = list.flatMap((el) => { if (/^(MAIN)$/.test(el.tagName) || el.getAttribute("role") === "main") { const inner = kids(el).filter(band); return inner.length >= 2 ? inner : [el]; } return [el]; });
    }
    // a band taller than ~1.5 screens is a wrapper around several sections (flat CMS pages): split it into its children, recursively
    if (!sel) {
      const split = (el, d) => { if (el.getBoundingClientRect().height <= 1300 || d > 5) return [el]; const ks = kids(el).filter((k) => k.getBoundingClientRect().height >= 40); return ks.length >= 2 ? ks.flatMap((k) => split(k, d + 1)) : ks.length === 1 ? split(ks[0], d + 1) : [el]; };
      list = list.flatMap((el) => (el.tagName === "FOOTER" || el.getAttribute("role") === "contentinfo" ? [el] : split(el, 0)));
    }
    // the footer sits beside <main>, outside the chain we descended: add it as the last section
    if (!sel) for (const f of document.querySelectorAll("footer, [role=contentinfo]")) if (vis(f) && !list.some((l) => l === f || l.contains(f) || f.contains(l)) && f.getBoundingClientRect().height >= 40) list.push(f);
    const out = [];
    list.forEach((el, i) => { el.setAttribute("data-hsec", String(i)); const r = el.getBoundingClientRect(); out.push({ i, top: Math.round(r.top + scrollY), height: Math.round(r.height), tag: el.tagName.toLowerCase(), isFooter: el.tagName === "FOOTER" || el.getAttribute("role") === "contentinfo" || !!el.closest("footer") }); });
    return out.filter((s) => s.height >= 40);
  }, flags.selector || null);
  if (!found.length) { console.error("No sections found. Pass --selector (for example \"main > section\")."); process.exitCode = 3; }

  // 2) measure + screenshot each
  const sections = [];
  for (const f of found) {
    const m = await page.evaluate((idx) => {
      const el = document.querySelector(`[data-hsec="${idx}"]`); const vw = window.innerWidth;
      const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
      const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const hex = (c) => { const p = typeof c === "string" ? parse(c) : c; if (!p) return null; return "#" + [p.r, p.g, p.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""); };
      const num = (v) => Math.round((parseFloat(v) || 0) * 10) / 10;
      const vis = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) !== 0; };
      const solid = (e) => { for (let n = e; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.05) return hex(c); } return "#ffffff"; };
      const ownBg = (e) => { const c = parse(getComputedStyle(e).backgroundColor); return c && c.a > 0.05 ? hex(c) : null; };
      const urlOf = (v) => { const m = String(v).match(/url\(\s*(["']?)(.*?)\1\s*\)/); if (!m) return null; try { return new URL(m[2], location.href).href; } catch { return m[2]; } };
      const sr = el.getBoundingClientRect(), secBg = solid(el);
      const all = [...el.querySelectorAll("*")].filter(vis);
      // background image: on the section or on a big descendant
      let bgImage = urlOf(getComputedStyle(el).backgroundImage), bgImages = bgImage ? [bgImage] : [];
      for (const d of all) { const u = urlOf(getComputedStyle(d).backgroundImage); if (u && !bgImages.includes(u)) { const r = d.getBoundingClientRect(); if (r.width * r.height >= sr.width * sr.height * 0.12) bgImages.push(u); } }
      if (!bgImage && bgImages.length) bgImage = bgImages[0];
      const sty = (e) => { const cs = getComputedStyle(e); return { fontFamily: (cs.fontFamily || "").split(",")[0].replace(/["']/g, "").trim(), fontSize: num(cs.fontSize), fontWeight: cs.fontWeight, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing === "normal" ? 0 : num(cs.letterSpacing), lineHeight: cs.lineHeight === "normal" ? null : num(cs.lineHeight), color: hex(cs.color), textAlign: cs.textAlign }; };
      const direct = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && clean(n.textContent));
      const els = [];
      for (const e of all) {
        const tag = e.tagName; const r = e.getBoundingClientRect(); let role = null;
        if (/^H[1-6]$/.test(tag)) role = "heading";
        else if (tag === "IMG" || tag === "PICTURE" || (tag === "SVG" && r.width > 60)) role = "image";
        else if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) role = "field";
        else if (tag === "BUTTON" || (tag === "A" && (ownBg(e) || parseFloat(getComputedStyle(e).borderTopWidth) > 0 || /btn|button|cta/i.test(e.className)))) role = "button";
        else if (tag === "A" && clean(e.textContent)) role = "link";
        else if (/^(P|LI|SPAN|DIV|LABEL|DT|DD|BLOCKQUOTE)$/.test(tag) && direct(e) && !e.closest("a,button,h1,h2,h3,h4,h5,h6")) role = "text";
        if (!role) continue;
        if (role === "text" || role === "link" || role === "button") { if (!clean(e.textContent)) continue; }
        if ((role === "link" || role === "text") && e.closest("button")) continue;
        els.push({ e, role, r });
      }
      // a card <img> inside <picture> etc: drop nested duplicates
      const items = els.filter((a) => !els.some((b) => b !== a && b.e.contains(a.e) && b.role === a.role && a.role === "image"));
      items.sort((a, b) => (Math.abs(a.r.top - b.r.top) < 12 ? a.r.left - b.r.left : a.r.top - b.r.top));
      const firstHeading = items.find((x) => x.role === "heading"), hSize = firstHeading ? num(getComputedStyle(firstHeading.e).fontSize) : null;
      // eyebrow = small uppercase / letter-spaced text that is not a link or button (above OR below the heading)
      for (const x of items) if (x.role === "text") { const cs = getComputedStyle(x.e), fs = num(cs.fontSize), t = clean(x.e.textContent); if (t.length <= 60 && ((cs.textTransform === "uppercase" || num(cs.letterSpacing) > 0.8 || t === t.toUpperCase()) && (!hSize || fs <= hSize * 0.85)) && fs <= 18) x.role = "eyebrow"; }
      const elements = items.slice(0, 30).map((x) => { const cs = getComputedStyle(x.e); const o = { role: x.role, text: clean(x.e.textContent).slice(0, 80), x: Math.round(x.r.left), y: Math.round(x.r.top - sr.top), w: Math.round(x.r.width), h: Math.round(x.r.height) };
        if (x.role !== "image") { Object.assign(o, sty(x.e)); }
        if (x.role === "button") Object.assign(o, { background: ownBg(x.e), borderRadius: num(cs.borderTopLeftRadius), paddingX: num(cs.paddingLeft), paddingY: num(cs.paddingTop), border: parseFloat(cs.borderTopWidth) > 0 ? { width: num(cs.borderTopWidth), color: hex(cs.borderTopColor) } : null });
        if (x.e.tagName === "A") o.href = x.e.getAttribute("href") || "";
        if (x.role === "image") { const im = x.e.tagName === "IMG" ? x.e : x.e.querySelector("img"); o.src = im ? (im.currentSrc || im.src) : null; o.alt = im ? im.alt : ""; }
        if (x.role === "field") { o.type = x.e.type || x.e.tagName.toLowerCase(); o.placeholder = x.e.placeholder || ""; o.background = ownBg(x.e); }
        return o; });
      const first = (role) => elements.find((x) => x.role === role);
      const content = items.filter((x) => x.role !== "image" || x.r.width < sr.width * 0.9);
      const cL = content.length ? Math.min(...content.map((x) => x.r.left)) : sr.left, cR = content.length ? Math.max(...content.map((x) => x.r.right)) : sr.right;
      const cT = content.length ? Math.min(...content.map((x) => x.r.top)) : sr.top, cB = content.length ? Math.max(...content.map((x) => x.r.bottom)) : sr.bottom;
      // inner cards: descendants with their own background that differs from the section background and cover a real area
      const cards = [];
      for (const d of all) { const b = ownBg(d); if (!b || b === secBg) continue; const r = d.getBoundingClientRect(); if (r.width * r.height < sr.width * sr.height * 0.04 || r.width > sr.width * 0.98 && r.height > sr.height * 0.9) continue; if (!d.querySelector("h1,h2,h3,h4,h5,h6,p,input,a")) continue; const cs = getComputedStyle(d); if (/^(A|BUTTON)$/.test(d.tagName)) continue; cards.push({ background: b, radius: num(cs.borderTopLeftRadius), border: parseFloat(cs.borderTopWidth) > 0 ? { width: num(cs.borderTopWidth), color: hex(cs.borderTopColor) } : null, w: Math.round(r.width), h: Math.round(r.height), childText: clean(d.textContent).slice(0, 40) }); }
      // columns: distinct left edges of the content blocks (rounded)
      const lefts = [...new Set(content.filter((x) => x.role !== "field").map((x) => Math.round(x.r.left / 60) * 60))];
      const imgs = items.filter((x) => x.role === "image" && x.r.width >= sr.width * 0.12);
      const bigBg = all.filter((d) => urlOf(getComputedStyle(d).backgroundImage) && d.getBoundingClientRect().width >= sr.width * 0.12 && d.getBoundingClientRect().width < sr.width * 0.9);
      const imgBoxes = [...imgs.map((x) => x.r), ...bigBg.map((d) => d.getBoundingClientRect())];
      const textBoxes = items.filter((x) => ["heading", "text", "eyebrow"].includes(x.role)).map((x) => x.r);
      let imageSide = "none";
      if (imgBoxes.length) { const ic = imgBoxes.reduce((s, r) => s + (r.left + r.right) / 2, 0) / imgBoxes.length, tc = textBoxes.length ? textBoxes.reduce((s, r) => s + (r.left + r.right) / 2, 0) / textBoxes.length : sr.left + sr.width / 2; imageSide = Math.abs(ic - tc) < sr.width * 0.08 ? "above-or-behind" : ic < tc ? "left" : "right"; }
      else if (bgImage) imageSide = "background";
      // text that cannot be read: colour (almost) equal to the background it sits on
      const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
      const lowContrast = [];
      for (const x of items) { if (x.role === "image") continue; const fg = parse(getComputedStyle(x.e).color), bgc = parse(x.role === "button" ? (ownBg(x.e) || solid(x.e)) : solid(x.e)) || parse(solid(x.e)); if (!fg || !bgc) continue; const a1 = L(fg), b1 = L(bgc), cr = (Math.max(a1, b1) + 0.05) / (Math.min(a1, b1) + 0.05); if (cr < 2.5 && clean(x.e.textContent || x.e.placeholder)) lowContrast.push({ text: clean(x.e.textContent).slice(0, 30), color: hex(fg), on: hex(bgc) }); }
      const form = el.querySelector("form"), fields = items.filter((x) => x.role === "field");
      const links = items.filter((x) => x.e.tagName === "A").slice(0, 12).map((x) => ({ text: clean(x.e.textContent).slice(0, 50), href: x.e.getAttribute("href") || "" }));
      const logoish = el.querySelector("footer img, img[alt*=logo i], img[src*=logo i]");
      return {
        background: secBg, backgroundImage: bgImage, backgroundImages: bgImages,
        contentLeft: Math.round(cL), contentRight: Math.round(cR), contentWidth: Math.round(cR - cL), fullWidth: (cR - cL) >= vw * 0.9,
        paddingTop: Math.max(0, Math.round(cT - sr.top)), paddingBottom: Math.max(0, Math.round(sr.bottom - cB)),
        order: elements.map((x) => x.role).filter((r, i, a) => r !== a[i - 1]).join(","),
        heading: first("heading") ? { text: first("heading").text, ...(({ role, text, x, y, w, h, ...s }) => s)(first("heading")) } : null,
        eyebrow: first("eyebrow") ? (({ role, x, y, w, h, ...s }) => s)(first("eyebrow")) : null,
        text: first("text") ? (({ role, x, y, w, h, text, ...s }) => s)(first("text")) : null,
        button: first("button") ? (({ role, x, y, w, h, ...s }) => s)(first("button")) : null,
        buttons: elements.filter((x) => x.role === "button").length, links: links, columns: lefts.length, imageSide,
        cards: cards.slice(0, 6), images: elements.filter((x) => x.role === "image").map((x) => ({ src: x.src, alt: x.alt, w: x.w, h: x.h })),
        form: form || fields.length ? { fields: fields.length, submit: !!(el.querySelector("button[type=submit], input[type=submit]") || elements.some((x) => x.role === "button" && /submit|send|request|go/i.test(x.text))), fieldBackground: fields[0] ? ownBg(fields[0].e) || solid(fields[0].e) : null } : null,
        hasLogo: !!logoish, lowContrast: lowContrast.slice(0, 4), elements,
      };
    }, f.i);
    const slug = ((m.heading?.text || f.tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section").slice(0, 32);
    const nn = String(f.i + 1).padStart(2, "0"), shot = `${nn}-${slug}.png`;
    try { await page.locator(`[data-hsec="${f.i}"]`).screenshot({ path: join(shotDir, shot), timeout: 15000 }); } catch { /* very tall or detached */ }
    sections.push({ index: f.i + 1, kind: f.isFooter ? "footer" : "section", top: f.top, height: f.height, screenshot: `${isDemoRun ? "sections-demo" : "sections"}/${shot}`, ...m });
  }
  result = { url, viewport: width, capturedAt: new Date().toISOString(), sections };
} finally { await browser.close(); }

if (result) {
  safeWrite(customer, join(demo, outName), JSON.stringify(result, null, 2) + "\n");
  if (!isDemoRun) {
    const row = (s) => `| ${s.index} | ${s.kind} | ${(s.heading?.text || "(no heading)").slice(0, 40)} | ${s.background}${s.backgroundImage ? " + image" : ""} | ${s.order} | ${s.imageSide} | ${s.columns} | ${s.contentWidth}px | ${s.heading ? `${s.heading.fontSize}px ${s.heading.color}` : ""} | ${s.text ? `${s.text.fontSize}px ${s.text.color}` : ""} | ${s.button ? `${s.button.background || "none"} / ${s.button.color}` : ""} | ${s.cards.map((c) => c.background).join(" ")} |`;
    safeWrite(customer, join(demo, "sections.md"), `# Prospect sections — ${url}\n\nMeasured at ${width}px. One crop per section in \`sections/\`. Roles in order: eyebrow | heading | text | button | link | image | field.\n\n| # | kind | heading | background | element order | image | cols | content width | heading | text | button bg / text | inner cards |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${result.sections.map(row).join("\n")}\n`);
  }
  console.log(`✅ ${rootRel(join(demo, outName))}: ${result.sections.length} section(s), crops in ${rootRel(shotDir)}/`);
  for (const s of result.sections) console.log(`  ${String(s.index).padStart(2)} ${s.kind === "footer" ? "footer " : ""}${(s.heading?.text || "(no heading)").slice(0, 36).padEnd(36)} bg ${s.background}${s.backgroundImage ? "+img" : ""}  order ${s.order}  image ${s.imageSide}  cols ${s.columns}${s.form ? "  form" : ""}`);
}

// ---- gate: the built demo vs the prospect's measurement
if (flags.compare && result) {
  const ref = readJson(join(demo, String(flags.compare)));
  if (!ref) die(`${flags.compare} not found in the demo folder`);
  const lum = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return null; return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)); };
  const far = (a, b, t) => { const A = lum(a), B = lum(b); if (!A || !B) return a !== b; return Math.max(...A.map((v, i) => Math.abs(v - B[i]))) > t; };
  const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const bad = [];
  const used = new Set();
  for (const R of ref.sections) {
    const D = result.sections.find((d) => !used.has(d.index) && R.heading?.text && norm(d.heading?.text) === norm(R.heading.text)) ?? result.sections.find((d) => !used.has(d.index) && d.index === R.index && d.kind === R.kind);
    const nm = `#${R.index} ${(R.heading?.text || R.kind).slice(0, 30)}`;
    if (!D) { bad.push(`${nm}: not found in the demo`); continue; }
    used.add(D.index);
    if (far(D.background, R.background, 20)) bad.push(`${nm}: background ${D.background} (prospect ${R.background})`);
    if (R.heading && D.heading && far(D.heading.color, R.heading.color, 30)) bad.push(`${nm}: heading colour ${D.heading.color} (prospect ${R.heading.color})`);
    if (R.heading && D.heading && Math.abs(D.heading.fontSize - R.heading.fontSize) > Math.max(3, R.heading.fontSize * 0.15)) bad.push(`${nm}: heading size ${D.heading.fontSize}px (prospect ${R.heading.fontSize}px)`);
    if (R.text && D.text && far(D.text.color, R.text.color, 30)) bad.push(`${nm}: text colour ${D.text.color} (prospect ${R.text.color})`);
    if (R.button && D.button && far(D.button.background, R.button.background, 30)) bad.push(`${nm}: button background ${D.button.background} (prospect ${R.button.background})`);
    if (R.button && !D.button) bad.push(`${nm}: the button is missing`);
    if (!R.button && D.button) bad.push(`${nm}: the demo shows a button the prospect's section does not have`);
    if (R.imageSide !== D.imageSide && !(R.imageSide === "none" && D.imageSide === "none")) bad.push(`${nm}: image side ${D.imageSide} (prospect ${R.imageSide})`);
    if (R.order !== D.order) bad.push(`${nm}: element order ${D.order} (prospect ${R.order})`);
    if (!!R.eyebrow !== !!D.eyebrow) bad.push(`${nm}: eyebrow ${D.eyebrow ? "shown but the prospect has none" : "missing"}`);
    if (R.form && D.form && R.form.submit && !D.form.submit) bad.push(`${nm}: form has no submit button`);
    if (D.lowContrast?.length && !(R.lowContrast?.length)) bad.push(`${nm}: unreadable text (colour ~ background): ${D.lowContrast.map((c) => `"${c.text}" ${c.color} on ${c.on}`).join("; ")}`);
    if (R.eyebrow && D.eyebrow && far(D.eyebrow.color, R.eyebrow.color, 40)) bad.push(`${nm}: eyebrow colour ${D.eyebrow.color} (prospect ${R.eyebrow.color})`);
    if ((R.cards.length === 0) !== (D.cards.length === 0)) bad.push(`${nm}: inner card backgrounds ${D.cards.length ? "present in the demo (" + D.cards.map((c) => c.background).join(" ") + ") but not on the prospect's site" : "missing"}`);
    else if (R.cards[0] && D.cards[0] && far(D.cards[0].background, R.cards[0].background, 20)) bad.push(`${nm}: card background ${D.cards[0].background} (prospect ${R.cards[0].background})`);
    if (R.contentWidth && Math.abs(D.contentWidth - R.contentWidth) > R.contentWidth * 0.2) bad.push(`${nm}: content width ${D.contentWidth}px (prospect ${R.contentWidth}px)`);
  }
    { const vp = join(demo, outName.replace(/\.json$/, ".verdict.json")), prev = readJson(vp, {}); safeWrite(customer, vp, JSON.stringify({ pass: bad.length === 0, attempts: (prev.attempts || 0) + 1, diffs: bad, at: new Date().toISOString() }, null, 2) + "\n"); }   // read by run-gate.mjs
  if (bad.length) { console.log(`✖ ${bad.length} difference(s) between the demo and the prospect's sections:\n  - ${bad.join("\n  - ")}`); process.exitCode = 4; } else console.log("✔ every section matches the prospect's within tolerance");
}
