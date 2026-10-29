#!/usr/bin/env node
/**
 * Capture the prospect's page SECTION BY SECTION (Playwright): one screenshot per section plus measured styles, so the client variants are built
 * from numbers and crops instead of from a guess at one full-page screenshot.
 *
 *   node harness/scripts/section-capture.mjs --customer <customer> --url <prospect page> [--width 1440] [--selector "main > section"] [--out sections.json]
 *   node harness/scripts/section-capture.mjs --customer <customer> --url <DEMO page> --out sections.demo.json --compare sections.json     (gate, exit 4 on differences)
 *   other mirrored pages: live  --url <live page> --out sections-<slug>.json ; built  --url <built page> --out sections-<slug>.demo.json --compare sections-<slug>.json (crops in sections-<slug>/ and sections-<slug>.demo/)
 *
 * Writes in <demo folder>: sections.json, sections/NN-<slug>.png (one crop per section), sections.md (one table the agent and the SE can read).
 * Per section: effective background colour + CSS background image, content width, top/bottom padding, the elements in visual order with their ROLE
 * (eyebrow | heading | text | button | link | image | field), heading / eyebrow / text / button styles (font, size, weight, case, colour, radius, padding),
 * inner "card" backgrounds, columns, which side the image is on, images (<img> and CSS background URLs), links, form controls.
 * The split into sections is a heuristic (the stack of full-width bands under <main>); if it is wrong pass --selector, and the SE can always drop
 * hand-made crops in <demo folder>/sections/ (same NN- prefix) which take priority as visual reference.
 * Header and nav are measured by header-styles.mjs (the header band is kind: header and skipped by --compare); the footer IS captured
 * here (kind: footer: a <footer>, a band named footer, or the last band carrying the copyright line) and is compared against the
 * built footer, column headings included. Carousels (scroller) are not width-checked: their width is the hidden slides.
 * Exit 0 ok · 3 no sections found · 4 --compare found differences.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { die, parseArgs, demoDir, safeWrite, readJson, rootRel, chromeBands, topLabels, isAdBand, verdictStamp } from "./_lib.mjs";
import { measureBand } from "./_measure.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer, url = flags.url;
if (!customer || !url) die("need --customer and --url");
let chromium; try { ({ chromium } = await import("playwright")); } catch { die("Playwright is not installed: run node harness/scripts/deps-check.mjs --fix"); }
const demo = demoDir(customer), outName = String(flags.out ?? "sections.json"), width = Number(flags.width ?? 1440);
const stem = outName.replace(/\.json$/, "");
const isDemoRun = outName !== "sections.json";
// crops go next to their own json so live references and built-page captures never mix: sections/ (home, live), sections-demo/ (home, built), <stem>/ (any other page, live or built)
const shotName = stem === "sections" ? "sections" : stem === "sections.demo" ? "sections-demo" : stem;
const shotDir = join(demo, shotName);
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
  // a BUILT demo page (--compare) is split per Sitecore component (top-level .component), so stacked components never merge into one band
  const found = await page.evaluate(({ sel, byComponent }) => {
    const vw = window.innerWidth;
    const vis = (el) => { const r = el.getBoundingClientRect(), cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden"; };
    const SKIP = /^(SCRIPT|STYLE|NOSCRIPT|LINK|TEMPLATE)$/;
    const kids = (el) => [...el.children].filter((k) => !SKIP.test(k.tagName) && vis(k));
    const band = (k) => { const r = k.getBoundingClientRect(); return r.height >= 60 && r.width >= vw * 0.7; };
    let list = [];
    const comps = byComponent ? [...document.querySelectorAll(".component")].filter((c) => !c.parentElement?.closest(".component") && vis(c) && c.getBoundingClientRect().height >= 40) : [];
    if (sel) list = [...document.querySelectorAll(sel)].filter(vis);
    else if (comps.length >= 3) list = comps;
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
    if (!sel && list !== comps) {
      const split = (el, d) => { if (el.getBoundingClientRect().height <= 1300 || d > 5) return [el]; const ks = kids(el).filter((k) => k.getBoundingClientRect().height >= 40); return ks.length >= 2 ? ks.flatMap((k) => split(k, d + 1)) : ks.length === 1 ? split(ks[0], d + 1) : [el]; };
      list = list.flatMap((el) => (el.tagName === "FOOTER" || el.getAttribute("role") === "contentinfo" ? [el] : split(el, 0)));
    }
    // the footer sits beside <main>, outside the chain we descended: add it as the last section
    if (!sel) for (const f of document.querySelectorAll("footer, [role=contentinfo]")) if (vis(f) && !list.some((l) => l === f || l.contains(f) || f.contains(l)) && f.getBoundingClientRect().height >= 40) list.push(f);
    const out = [];
    const named = (el, re) => re.test(`${el.id} ${typeof el.className === "string" ? el.className : ""}`);
    list.forEach((el, i) => { el.setAttribute("data-hsec", String(i)); const r = el.getBoundingClientRect(); out.push({ i, top: Math.round(r.top + scrollY), height: Math.round(r.height), tag: el.tagName.toLowerCase(),
      isFooter: el.tagName === "FOOTER" || el.getAttribute("role") === "contentinfo" || !!el.closest("footer") || !!el.querySelector("footer") || named(el, /footer/i),
      isHeader: named(el, /\bcomponent\b.*\b(eyebrow|header|navigation)\b/) || el.tagName === "HEADER" || el.getAttribute("role") === "banner" || !!el.closest("header") || (Math.round(r.top + scrollY) < 10 && (!!el.querySelector("nav, header") || named(el, /header|masthead/i))),
      copyright: /©|copyright/i.test(el.textContent || "") }); });
    const kept = out.filter((s) => s.height >= 40);
    // a footer built from <div>s: the last band carrying the copyright line is the footer. It is never a body section.
    if (kept.length > 1 && !kept.some((s) => s.isFooter)) { const last = kept.at(-1); if (last.copyright) last.isFooter = true; }
    return kept;
  }, { sel: flags.selector || null, byComponent: !!flags.compare });
  if (!found.length) { console.error("No sections found. Pass --selector (for example \"main > section\")."); process.exitCode = 3; }

  // 2) measure + screenshot each
  const sections = [];
  for (const f of found) {
    const m = await page.evaluate(measureBand, String(f.i));
    const slug = ((m.heading?.text || f.tag).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "section").slice(0, 32);
    const nn = String(f.i + 1).padStart(2, "0"), shot = `${nn}-${slug}.png`;
    try { await page.locator(`[data-hsec="${f.i}"]`).screenshot({ path: join(shotDir, shot), timeout: 15000 }); } catch { /* very tall or detached */ }
    sections.push({ index: f.i + 1, kind: f.isFooter ? "footer" : f.isHeader ? "header" : "section", top: f.top, height: f.height, screenshot: `${shotName}/${shot}`, ...m });
  }
  // components that crashed or have no React code: the build passes, the page still shows an error box instead of the component
  const renderErrors = await page.evaluate(() => {
    const t = document.body.innerText || "", out = [];
    for (const m of t.matchAll(/A rendering error occurred in component (\w+)[^\n]*\n?\s*(?:Error:\s*)?([^\n]{0,160})/g)) out.push({ component: m[1], error: m[2].trim() });
    for (const m of t.matchAll(/(\w+)[^\n]{0,40}missing React implementation/gi)) out.push({ component: m[1], error: "Content SDK component is missing React implementation" });
    return out;
  });
  result = { url, viewport: width, capturedAt: new Date().toISOString(), renderErrors, sections };
} finally { await browser.close(); }

if (result) {
  safeWrite(customer, join(demo, outName), JSON.stringify(result, null, 2) + "\n");
  if (!isDemoRun) {
    const row = (s) => `| ${s.index} | ${s.kind} | ${(s.heading?.text || "(no heading)").slice(0, 40)} | ${s.background}${s.backgroundImage ? " + image" : ""} | ${s.order} | ${s.imageSide} | ${s.columns} | ${s.contentWidth}px | ${s.heading ? `${s.heading.fontSize}px ${s.heading.color}` : ""} | ${s.text ? `${s.text.fontSize}px ${s.text.color}` : ""} | ${s.button ? `${s.button.background || "none"} / ${s.button.color}` : ""} | ${s.cards.map((c) => c.background).join(" ")} |`;
    safeWrite(customer, join(demo, "sections.md"), `# Prospect sections — ${url}\n\nMeasured at ${width}px. One crop per section in \`sections/\`. Roles in order: eyebrow | heading | text | button | link | image | field.\n\n| # | kind | heading | background | element order | image | cols | content width | heading | text | button bg / text | inner cards |\n|---|---|---|---|---|---|---|---|---|---|---|---|\n${result.sections.map(row).join("\n")}\n`);
  }
  console.log(`✅ ${rootRel(join(demo, outName))}: ${result.sections.length} section(s), crops in ${rootRel(shotDir)}/`);
  for (const s of result.sections) console.log(`  ${String(s.index).padStart(2)} ${s.kind !== "section" ? s.kind + " " : ""}${(s.heading?.text || "(no heading)").slice(0, 36).padEnd(36)} bg ${s.background}${s.backgroundImage ? "+img" : ""}  order ${s.order}  image ${s.imageSide}  cols ${s.columns}${s.form ? "  form" : ""}${s.video ? "  video" : ""}`);
}

// ---- gate: the built demo vs the prospect's measurement
if (flags.compare && result) {
  const ref = readJson(join(demo, String(flags.compare)));
  if (!ref) die(`${flags.compare} not found in the demo folder`);
  const lum = (h) => { const m = /^#?([0-9a-f]{6})$/i.exec(h || ""); if (!m) return null; return [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16)); };
  const far = (a, b, t) => { const A = lum(a), B = lum(b); if (!A || !B) return a !== b; return Math.max(...A.map((v, i) => Math.abs(v - B[i]))) > t; };
  const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const refBands = chromeBands(ref), demoBands = chromeBands(result);
  const bad = [];
  const used = new Set(demoBands.headerIdx != null ? [demoBands.headerIdx] : []);
  const pairs = {};   // live section index -> the built section it was compared with (the review page shows both crops)
  let lastPaired = demoBands.headerIdx ?? -1;   // pairing by shape only looks forward from the last paired built band
  // One band against its built counterpart. COLUMNS / LABELS (the footer's column headings) are checked on the footer only.
  const compareBand = (R, D, nm, isFooter) => {
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
    if (R.video && !D.video) bad.push(`${nm}: the video is missing`);
    // imagery: uploaded to Content Hub is not enough, the built section must SHOW it (an image field left empty renders nothing)
    const shown = (s) => (s.images ?? []).length + (s.backgroundImage ? 1 : 0);
    if (shown(R) && !shown(D)) bad.push(`IMAGES ${nm}: the prospect's section shows ${shown(R)} image(s), the built one shows none (image field empty or not attached)`);
    // a carousel's image count includes cloned slides, so the "fewer than half" rule skips carousels
    else if (!R.scroller && shown(R) >= 3 && shown(D) < Math.ceil(shown(R) / 2)) bad.push(`IMAGES ${nm}: the built section shows ${shown(D)} of the prospect's ${shown(R)} images`);
    if (D.lowContrast?.length && !(R.lowContrast?.length)) bad.push(`${nm}: unreadable text (colour ~ background): ${D.lowContrast.map((c) => `"${c.text}" ${c.color} on ${c.on}`).join("; ")}`);
    if (R.eyebrow && D.eyebrow && far(D.eyebrow.color, R.eyebrow.color, 40)) bad.push(`${nm}: eyebrow colour ${D.eyebrow.color} (prospect ${R.eyebrow.color})`);
    if ((R.cards.length === 0) !== (D.cards.length === 0)) bad.push(`${nm}: inner card backgrounds ${D.cards.length ? "present in the demo (" + D.cards.map((c) => c.background).join(" ") + ") but not on the prospect's site" : "missing"}`);
    else if (R.cards[0] && D.cards[0] && far(D.cards[0].background, R.cards[0].background, 20)) bad.push(`${nm}: card background ${D.cards[0].background} (prospect ${R.cards[0].background})`);
    // a carousel/scroller (or a band wider than the viewport) has no meaningful content width: its width is the hidden slides
    if (R.contentWidth && !R.scroller && Math.abs(D.contentWidth - R.contentWidth) > R.contentWidth * 0.2) bad.push(`${nm}: content width ${D.contentWidth}px (prospect ${R.contentWidth}px)`);
    if (!isFooter) return;
    const wantLabels = topLabels(R), gotLabels = topLabels(D);
    if (wantLabels.length >= 3 && wantLabels.length !== gotLabels.length) bad.push(`COLUMNS ${nm}: ${gotLabels.length} columns (prospect ${wantLabels.length}: ${wantLabels.join(", ")})`);
    const have = JSON.stringify(D.elements ?? []).toLowerCase();
    const missingLabels = wantLabels.filter((t) => !have.includes(String(t).toLowerCase()));
    if (missingLabels.length) bad.push(`LABELS ${nm}: missing ${missingLabels.join(", ")}`);
  };
  for (const R of ref.sections) {
    if (R.index === refBands.headerIdx) continue;   // the header band is measured by header-styles.mjs --compare
    if (isAdBand(R)) continue;                      // an ad slot is never built and never compared
    if (R.index === refBands.footerIdx) {           // footer against footer, whatever its headings say
      const D = demoBands.footer && !used.has(demoBands.footerIdx) ? demoBands.footer : null;
      if (!D) { bad.push(`#${R.index} footer: not found in the demo`); continue; }
      used.add(D.index); pairs[R.index] = D.index; compareBand(R, D, `#${R.index} footer`, true); continue;
    }
    // several built bands with the same heading (a title component above the component that repeats it): take the one most like the live band
    const likeR = (d) => Math.abs((d.elements ?? []).length - (R.elements ?? []).length) + Math.abs((d.images ?? []).length - (R.images ?? []).length);
    // a band with several headings (tiles, cards) may report a different one as its main heading: then match on any of its headings
    const headingsOf = (d) => new Set([d.heading?.text, ...(d.elements ?? []).filter((e) => e.role === "heading").map((e) => e.text)].filter(Boolean).map(norm));
    const open = result.sections.filter((d) => !used.has(d.index) && d.index !== demoBands.footerIdx);
    let D = (R.heading?.text && (open.filter((d) => norm(d.heading?.text) === norm(R.heading.text)).sort((a, b) => likeR(a) - likeR(b))[0]
      ?? open.filter((d) => headingsOf(d).has(norm(R.heading.text))).sort((a, b) => likeR(a) - likeR(b))[0]))
      ?? (R.heading?.text ? null : open.find((d) => d.index === R.index && d.kind === R.kind));
    // a titled band whose heading text is not found: pair it by position and shape instead, so a section is found by what it IS, not by
    // a heading written in to be matched. Only the next unpaired built band after the last pair, only when it has the same make-up
    // (kind, imagery, cards, a similar number of elements) and its heading is not another live band's heading.
    let headingDiff = null;
    if (!D && R.heading?.text) {
      const liveHeadings = new Set(ref.sections.filter((x) => x !== R).flatMap((x) => [...headingsOf(x)]));
      const shaped = (d) => d.kind === R.kind && !!(d.images ?? []).length === !!(R.images ?? []).length && !!(d.cards ?? []).length === !!(R.cards ?? []).length
        && Math.abs((d.elements ?? []).length - (R.elements ?? []).length) <= Math.max(2, (R.elements ?? []).length * 0.5);
      const cand = open.filter((d) => d.index > lastPaired).sort((a, b) => a.index - b.index)[0];
      if (cand && shaped(cand) && ![...headingsOf(cand)].some((h) => liveHeadings.has(h))) { D = cand; headingDiff = cand.heading?.text ?? ""; }
    }
    const nm = `#${R.index} ${(R.heading?.text || R.kind).slice(0, 30)}`;
    if (!D) { bad.push(`${nm}: not found in the demo`); continue; }
    used.add(D.index); pairs[R.index] = D.index; lastPaired = Math.max(lastPaired, D.index);
    if (headingDiff != null) bad.push(`${nm}: heading ${headingDiff ? `"${headingDiff.slice(0, 40)}"` : "missing"} (prospect "${R.heading.text.slice(0, 40)}")`);
    compareBand(R, D, nm, false);
  }
  for (const poison of ["Why PLAY! finance", "Copyright © Sitecore"]) if (JSON.stringify(result).includes(poison)) bad.push(`SAMPLE footer still shows the template sample "${poison}"`);
  for (const e of result.renderErrors ?? []) bad.push(`RENDER ${e.component}: the page shows a rendering error instead of the component (${e.error})`);
  {   // read by run-gate.mjs: the stamp says WHAT was compared (url), against WHICH reference (refHash), with WHICH code (buildFingerprint)
    const vp = join(demo, outName.replace(/\.json$/, ".verdict.json")), prev = readJson(vp, {}), stamp = verdictStamp(customer, url, String(flags.compare));
    // attempts count FIXES: a re-run on unchanged code is the same attempt, so re-running can never unlock the Looks-leftovers waiver
    const attempts = !prev.countsFixes ? 1 : (prev.attempts || 0) + (prev.buildFingerprint === stamp.buildFingerprint ? 0 : 1);   // older verdicts counted re-runs: start fresh
    safeWrite(customer, vp, JSON.stringify({ pass: bad.length === 0, attempts, countsFixes: true, ...stamp, headerIdx: refBands.headerIdx, footerIdx: refBands.footerIdx, pairs, diffs: bad, at: new Date().toISOString() }, null, 2) + "\n");
  }
  if (bad.length) { console.log(`✖ ${bad.length} difference(s) between the demo and the prospect's sections:\n  - ${bad.join("\n  - ")}`); process.exitCode = 4; } else console.log("✔ every section matches the prospect's within tolerance");
}
