#!/usr/bin/env node
/**
 * Upload demo images to Sitecore Content Hub (Upload API v2), approve them and create a PUBLIC LINK for each.
 * Self-contained: credentials come from harness/.env.local (CH_*), nothing is written into the prospect's app.
 *
 *   node harness/scripts/content-hub-upload.mjs <customer> [--images-dir <dir>] [--dry-run] [--force]
 *   node harness/scripts/content-hub-upload.mjs <customer> --file <path> --name logo [--alt "Acme logo"]   (one extra file, e.g. the logo)
 *
 * Reads/writes <demo folder>/images/image-manifest.json (entries from download-images.mjs: localPath | localFile, alt, field, ...).
 * Each uploaded entry gets: uploadStatus "uploaded", assetId, assetIdentifier, publicUrl, thumbnailUrl, width, height, imageFieldXml.
 * Use `imageFieldXml` verbatim as the value of an Image field (hero images, the Header datasource LogoImage, ...).
 * Resume-safe: entries already "uploaded" are skipped (use --force to redo). Last line of output for --file: `RESULT {json}`.
 *
 * Exit codes: 0 = all done (or CH disabled -> images-to-upload.md written), 3 = some uploads failed (manifest says which; the demo
 * continues, add the failures to manual-tasks.md), 2 = configuration/auth problem.
 */
import { readFileSync, writeFileSync, statSync, existsSync, copyFileSync, mkdirSync } from "node:fs";
import { join, basename, resolve, isAbsolute } from "node:path";
import { ENV, die, parseArgs, demoDir, safeWrite, rootRel } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: node harness/scripts/content-hub-upload.mjs <customer> [--images-dir <dir>] [--file <path> --name <n> --alt <t>] [--dry-run] [--force]");
const get = (k) => process.env[k] || ENV[k] || "";
const imagesDir = resolve(flags["images-dir"] || join(demoDir(customer), "images"));
const manifestPath = join(imagesDir, "image-manifest.json");
const dryRun = !!flags["dry-run"], force = !!flags.force;
const delay = Number(flags.delay ?? 300);

function readManifest() { try { const m = JSON.parse(readFileSync(manifestPath, "utf8").replace(/^﻿/, "")); return Array.isArray(m) ? m : []; } catch { return []; } }
function saveManifest(m) { safeWrite(customer, manifestPath, JSON.stringify(m, null, 2)); }

// ---- entries ---------------------------------------------------------------------------------------------------------------
const manifest = readManifest();
const resolveFile = (e) => {
  for (const c of [e.localPath, e.localFile]) {
    if (!c) continue;
    for (const p of isAbsolute(c) ? [c] : [resolve(c), join(imagesDir, c)]) if (existsSync(p)) return p;
  }
  return null;
};
let only = null;
if (flags.file) {
  const src = resolve(flags.file);
  if (!existsSync(src)) die(`--file not found: ${src}`);
  const name = String(flags.name && flags.name !== true ? flags.name : basename(src).replace(/\.[^.]+$/, "")).toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const ext = (basename(src).match(/\.[^.]+$/) || [""])[0].toLowerCase();
  const dest = join(imagesDir, name + ext);
  if (resolve(src) !== resolve(dest)) { mkdirSync(imagesDir, { recursive: true }); copyFileSync(src, dest); }
  let e = manifest.find((x) => x.localFileName === name + ext || x.field === name);
  if (!e) { e = { field: name, localFileName: name + ext }; manifest.push(e); }
  Object.assign(e, { localPath: dest, status: "downloaded", alt: flags.alt && flags.alt !== true ? flags.alt : e.alt || name });
  only = e;
}
const entries = only ? [only] : manifest.filter((e) => e.status === "downloaded" || (e.status === undefined && (e.localPath || e.localFile)));
const todo = entries.filter((e) => force || !(e.uploadStatus === "uploaded" && e.imageFieldXml));
const fileName = (e) => e.localFileName || basename(resolveFile(e) || e.localPath || e.localFile || "image");

// ---- disabled / dry-run ----------------------------------------------------------------------------------------------------
function writeManualList(reason) {
  const lines = [`# Images to upload to Content Hub manually`, ``, `Reason: ${reason}`, ``, `Upload each file, create a public link, then set the image fields (see the manifest for which field each belongs to).`, ``];
  for (const e of entries) lines.push(`- ${fileName(e)} — ${e.field || ""}${e.alt ? ` (alt: ${e.alt})` : ""}${e.src ? ` — source: ${e.src}` : ""}`);
  safeWrite(customer, join(demoDir(customer), "images-to-upload.md"), lines.join("\n") + "\n");
  console.log(`Wrote ${rootRel(join(demoDir(customer), "images-to-upload.md"))} (${entries.length} images).`);
}
if (String(get("CH_ENABLED")).toLowerCase() !== "true") {
  console.log("CH_ENABLED is not true in harness/.env.local — nothing uploaded. Images will be left as source URLs; list written for a manual upload.");
  writeManualList("CH_ENABLED is not true"); if (only) saveManifest(manifest); process.exit(0);
}
const host = get("CH_HOST").replace(/\/+$/, "");
if (!host || !((get("CH_USER") && get("CH_PASSWORD")) || get("CH_TOKEN"))) die("Content Hub is enabled but CH_HOST and (CH_USER + CH_PASSWORD, or CH_TOKEN) are not all set in harness/.env.local");
console.log(`Content Hub upload: ${todo.length} to upload, ${entries.length - todo.length} already done (${host})`);
for (const e of todo) { const p = resolveFile(e); console.log(`  ${fileName(e)} ${p ? `(${(statSync(p).size / 1024).toFixed(1)} KB)` : "— FILE MISSING"}`); }
if (dryRun) { console.log("DRY RUN — nothing uploaded."); process.exit(0); }
if (!todo.length) { if (only) saveManifest(manifest); if (only) console.log("RESULT " + JSON.stringify(slim(only))); process.exit(0); }

// ---- auth ------------------------------------------------------------------------------------------------------------------
let authH = {};
async function login() {
  if (get("CH_TOKEN")) { const t = get("CH_TOKEN"); authH = t.startsWith("Bearer ") ? { Authorization: t } : { "X-Auth-Token": t }; return; }
  const user = get("CH_USER"), pass = get("CH_PASSWORD"), cid = get("CH_CLIENT_ID"), sec = get("CH_CLIENT_SECRET");
  const method = (get("CH_AUTH_METHOD") || "simple").toLowerCase();
  if (method === "oauth" || (cid && sec && method !== "simple")) {
    const r = await fetch(`${host}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `grant_type=password&client_id=${encodeURIComponent(cid)}&client_secret=${encodeURIComponent(sec)}&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}` });
    if (!r.ok) die(`Content Hub OAuth failed: HTTP ${r.status}. Check CH_CLIENT_ID/CH_CLIENT_SECRET/CH_USER/CH_PASSWORD in harness/.env.local`);
    authH = { Authorization: `Bearer ${(await r.json()).access_token}` };
  } else {
    const r = await fetch(`${host}/api/authenticate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_name: user, password: pass }) });
    if (!r.ok) die(`Content Hub login failed: HTTP ${r.status}. Check CH_USER/CH_PASSWORD (CH_AUTH_METHOD=simple) in harness/.env.local`);
    authH = { "X-Auth-Token": (await r.json()).token };
  }
}
const call = async (method, url, body, extra = {}) => {
  const r = await fetch(url, { method, redirect: "manual", headers: { ...authH, ...(body && typeof body === "string" ? { "Content-Type": "application/json" } : {}), ...extra }, body });
  const raw = await r.text(); let json = null; try { json = JSON.parse(raw); } catch { /* not json */ }
  return { status: r.status, location: r.headers.get("location"), json, raw };
};
try { await login(); } catch (err) { die(`Content Hub login error: ${err.message}`); }

// ---- image size (no deps) --------------------------------------------------------------------------------------------------
function dims(p) {
  try {
    const b = readFileSync(p);
    if (b[0] === 0xff && b[1] === 0xd8) { let o = 2; while (o < b.length && b[o] === 0xff) { const m = b[o + 1], l = b.readUInt16BE(o + 2); if ((m >= 0xc0 && m <= 0xc3) || (m >= 0xc5 && m <= 0xc7) || (m >= 0xc9 && m <= 0xcb) || (m >= 0xcd && m <= 0xcf)) return { width: b.readUInt16BE(o + 7), height: b.readUInt16BE(o + 5) }; o += 2 + l; } }
    if (b[0] === 0x89 && b[1] === 0x50) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
    if (b.toString("ascii", 0, 4) === "GIF8") return { width: b.readUInt16LE(6), height: b.readUInt16LE(8) };
    if (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP") { const k = b.toString("ascii", 12, 16); if (k === "VP8X") return { width: 1 + b.readUIntLE(24, 3), height: 1 + b.readUIntLE(27, 3) }; }
    const s = b.toString("utf8", 0, 3000);
    if (/<svg/i.test(s)) {
      const vb = s.match(/viewBox=["']\s*[-\d.]+[\s,]+[-\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)/);
      if (vb) return { width: Math.round(+vb[1]), height: Math.round(+vb[2]) };
      const w = s.match(/\swidth=["']([\d.]+)/), h = s.match(/\sheight=["']([\d.]+)/);
      if (w && h) return { width: Math.round(+w[1]), height: Math.round(+h[1]) };
    }
  } catch { /* ignore */ }
  return null;
}
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
function slim(e) { const { field, localFileName, alt, uploadStatus, assetId, assetIdentifier, publicUrl, width, height, imageFieldXml, uploadError } = e; return { field, localFileName, alt, uploadStatus, assetId, assetIdentifier, publicUrl, width, height, imageFieldXml, uploadError }; }

// ---- upload loop -----------------------------------------------------------------------------------------------------------
const uploadConfig = get("CH_UPLOAD_CONFIG") || "AssetUploadConfiguration";
let ok = 0, failed = 0;
for (const e of todo) {
  const p = resolveFile(e), name = fileName(e);
  if (!p) { e.uploadStatus = "failed"; e.uploadError = "file not found"; failed++; console.error(`  FAIL ${name}: file not found`); continue; }
  try {
    const size = statSync(p).size;
    const s1 = await call("POST", `${host}/api/v2.0/upload`, JSON.stringify({ file_name: name, file_size: size, upload_configuration: { name: uploadConfig }, action: { name: "NewAsset" } }));
    if (![200, 201].includes(s1.status) || !s1.location) throw new Error(`step 1 (request upload) HTTP ${s1.status} ${s1.raw.slice(0, 160)}`);
    const upId = s1.json?.upload_identifier, fileId = s1.json?.file_identifier;
    const fd = new FormData(); fd.append("file", new Blob([readFileSync(p)], { type: "application/octet-stream" }), name);
    const s2 = await call("POST", s1.location.startsWith("http") ? s1.location : host + s1.location, fd);
    if (s2.status !== 200) throw new Error(`step 2 (send file) HTTP ${s2.status} ${s2.raw.slice(0, 160)}`);
    const s3 = await call("POST", `${host}/api/v2.0/upload/finalize`, JSON.stringify({ upload_identifier: upId, file_identifier: fileId }));
    if (![200, 201].includes(s3.status) || !s3.json?.asset_id) throw new Error(`step 3 (finalize) HTTP ${s3.status} ${s3.raw.slice(0, 160)}`);
    const assetId = s3.json.asset_id, assetIdentifier = s3.json.asset_identifier;
    const ap = await call("POST", `${host}/api/entities/${assetId}/lifecycle/approve`);
    e.approved = ap.status === 200; if (!e.approved) console.log(`    WARN approve HTTP ${ap.status} — approve ${name} manually if it does not render`);
    const clean = name.replace(/\.[^.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-");
    const pl = await call("POST", `${host}/api/entities`, JSON.stringify({ entitydefinition: { href: `${host}/api/entitydefinitions/M.PublicLink` }, properties: { Resource: "downloadOriginal", RelativeUrl: `${assetId}-${clean}` }, relations: { AssetToPublicLink: { parents: [{ href: `${host}/api/entities/${assetId}` }] } } }));
    let publicUrl = "";
    if (pl.status === 201 && pl.location) {
      const ent = await call("GET", pl.location.startsWith("http") ? pl.location : host + pl.location);
      const rel = ent.json?.properties?.RelativeUrl, v = ent.json?.properties?.VersionHash;
      if (rel) publicUrl = `${host}/api/public/content/${rel}${v ? "?v=" + v : ""}`;
    }
    if (!publicUrl) { e.publicLinkError = `public link HTTP ${pl.status}`; throw new Error(`public link not created (HTTP ${pl.status} ${pl.raw.slice(0, 160)}) — the asset is in Content Hub (${assetIdentifier}) but has no public URL`); }
    const d = dims(p), thumb = `${host}/api/gateway/${assetId}/thumbnail`;
    Object.assign(e, { uploadStatus: "uploaded", uploadError: undefined, assetId, assetIdentifier, publicUrl, thumbnailUrl: thumb, width: d?.width ?? null, height: d?.height ?? null,
      imageFieldXml: `<Image src="${publicUrl}" dam-id="${assetIdentifier}"${d ? ` width="${d.width}" height="${d.height}"` : ""} alt="${esc(e.alt || name)}" dam-content-type="Image" thumbnailsrc="${thumb}" />` });
    ok++; console.log(`  OK   ${name} -> ${assetIdentifier}`);
  } catch (err) { e.uploadStatus = "failed"; e.uploadError = err.message; failed++; console.error(`  FAIL ${name}: ${err.message}`); }
  saveManifest(manifest);                       // after every file: a crash never loses finished uploads
  if (delay > 0) await new Promise((r) => setTimeout(r, delay));
}
saveManifest(manifest);
console.log(`Uploaded ${ok}/${todo.length}${failed ? `, failed ${failed} (see uploadError in ${rootRel(manifestPath)})` : ""}.`);
if (only) console.log("RESULT " + JSON.stringify(slim(only)));
process.exit(failed ? 3 : 0);
