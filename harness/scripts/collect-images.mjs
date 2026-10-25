#!/usr/bin/env node
/**
 * The ONE way images enter a demo: from the live captures, traced to where they belong.
 *
 *   node harness/scripts/collect-images.mjs <customer> [--dry-run]
 *
 * For every planned section of every mirrored page (demo-plan.yaml liveSection + sectionsFile; /Home uses sections.json) and the footer band,
 * takes the section's images (images[] and CSS backgroundImages from section-capture) and writes ONE manifest entry per image URL in
 * images/image-manifest.json:
 *   { src (the live URL), uses: [{ page, liveSection, sectionsFile }], localFileName (<page>-s<NN>-<k>.<ext>), localPath, alt, status: "downloaded" }
 * The manifest is MERGED by src: existing entries keep their upload state (uploadStatus, imageFieldXml, ...), files already on disk are not
 * downloaded again, entries without src (the logo, ...) are kept. Then: content-hub-upload.mjs (CH_ENABLED=true) or media-upload.mjs (false),
 * then attach-images.mjs, which uses `uses` to put each image into the component of that section.
 * Exit 0 all images present · 1 some downloads failed (listed; re-run retries them).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, parseArgs, readJson, rootRel, safeWrite, chromeBands } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: collect-images.mjs <customer> [--dry-run]");
const dry = !!flags["dry-run"], demo = demoDir(customer), dir = join(demo, "images"), manifestPath = join(dir, "image-manifest.json");
const plan = parseYaml(readFileSync(join(demo, "demo-plan.yaml"), "utf8"));
const pages = Array.isArray(plan?.site?.pages) ? plan.site.pages : [];

// what the plan builds: (capture file, live section) -> page
const wanted = new Map();   // src -> { alt, uses[] }
const slugOf = (p) => (String(p).replace(/^\/home\/?/i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "home");
const addBand = (band, page, file) => {
  if (!band) return;
  const srcs = [...(band.images ?? []).map((i) => ({ u: i.src, alt: i.alt })), ...(band.backgroundImages ?? []).map((b) => ({ u: b?.url ?? b, alt: "" }))];
  for (const { u, alt } of srcs) {
    const src = String(u ?? "").split("#")[0]; if (!/^https?:\/\//.test(src)) continue;
    if (!wanted.has(src)) wanted.set(src, { alt: alt || "", uses: [] });
    const w = wanted.get(src);
    if (!w.uses.some((x) => x.page === page && x.liveSection === band.index)) w.uses.push({ page, liveSection: band.index, sectionsFile: file });
    if (!w.alt && alt) w.alt = alt;
  }
};
for (const p of pages) {
  const file = p.sectionsFile ? String(p.sectionsFile) : /^\/home$/i.test(String(p.path)) ? "sections.json" : null;
  if (!file) continue;
  const cap = readJson(join(demo, file)); if (!cap) { console.log(`! ${p.path}: ${file} not captured yet (section-capture.mjs --out ${file})`); continue; }
  for (const s of p.sections ?? []) if (s?.liveSection != null) addBand(cap.sections?.find((x) => x.index === Number(s.liveSection)), p.path, file);
}
{ const home = readJson(join(demo, "sections.json")); if (home) addBand(chromeBands(home).footer, "(footer)", "sections.json"); }

// merge with the existing manifest by src
const old = readJson(manifestPath, []);
const entries = []; (function walk(o) { if (o && typeof o === "object") { if ("localFileName" in o || "localPath" in o || "src" in o) entries.push(o); else for (const v of Object.values(o)) walk(v); } })(old);
const bySrc = new Map(entries.filter((e) => e.src).map((e) => [String(e.src).split("#")[0], e]));
const extOf = (src, type) => (/png/.test(type) ? ".png" : /webp/.test(type) ? ".webp" : /svg/.test(type) ? ".svg" : /gif/.test(type) ? ".gif" : /jpe?g/.test(type) ? ".jpg" : (src.split("?")[0].match(/\.(png|jpe?g|webp|svg|gif)$/i)?.[0] ?? ".jpg").toLowerCase());
const counter = new Map();
let added = 0, downloaded = 0, failed = [];
if (!dry) mkdirSync(dir, { recursive: true });
for (const [src, w] of wanted) {
  let e = bySrc.get(src);
  if (!e) { e = { src }; entries.push(e); bySrc.set(src, e); added++; }
  e.uses = w.uses; if (!e.alt && w.alt) e.alt = w.alt;
  const have = [e.localPath, e.localFile, e.localFileName && join(dir, e.localFileName)].filter(Boolean).find((p) => existsSync(p));
  if (have) { e.localPath = have; if (!e.status) e.status = "downloaded"; continue; }
  if (dry) { console.log(`would download ${src.slice(0, 100)} (${w.uses.map((u) => `${u.page} #${u.liveSection}`).join(", ")})`); continue; }
  const first = w.uses[0], key = `${slugOf(first.page)}-s${String(first.liveSection).padStart(2, "0")}`;
  counter.set(key, (counter.get(key) ?? 0) + 1);
  try {
    const r = await fetch(src, { headers: { "User-Agent": "Mozilla/5.0 demo-harness" }, signal: AbortSignal.timeout(30000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer()), name = `${key}-${counter.get(key)}${extOf(src, r.headers.get("content-type") ?? "")}`;
    writeFileSync(join(dir, name), buf);
    Object.assign(e, { localFileName: name, localPath: join(dir, name), status: "downloaded", sizeBytes: buf.length, alt: e.alt || first.page });
    downloaded++;
  } catch (err) { e.status = "failed"; e.downloadError = err.message.slice(0, 160); failed.push(`${src.slice(0, 90)}: ${e.downloadError}`); }
}
if (!dry) safeWrite(customer, manifestPath, JSON.stringify(entries, null, 2) + "\n");
const used = [...wanted.values()].reduce((n, w) => n + w.uses.length, 0);
console.log(`${wanted.size} image(s) in ${used} planned section use(s): ${added} new in the manifest, ${dry ? "dry run" : `${downloaded} downloaded`}, ${failed.length} failed → ${rootRel(manifestPath)}`);
for (const f of failed) console.log(`✖ ${f}`);
process.exit(failed.length ? 1 : 0);
