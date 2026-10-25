#!/usr/bin/env node
/**
 * Upload the demo's images to the Sitecore MEDIA LIBRARY (the route when CH_ENABLED=false; with Content Hub use content-hub-upload.mjs).
 *
 *   node harness/scripts/media-upload.mjs <customer> [--dry-run]
 *
 * Reads images/image-manifest.json (written by the download step; each entry keeps its live URL as `src` and its file as localPath/localFileName).
 * For every entry not yet uploaded:
 *   - a file over 50 MB is NOT uploaded: Experience Edge cannot publish it. The entry gets uploadStatus "too-large" and a line under
 *     "## Missing assets" in manual-tasks.md (file, size, live URL, the page/section it belongs to when the captures say so). The run carries on;
 *     run-gate.mjs does not fail a section for imagery that is listed there.
 *   - otherwise: Authoring GraphQL uploadMedia (item under /sitecore/media library/Project/<collection>/<site>/demo-images/) → POST the file to the
 *     presigned URL → the entry gets uploadStatus "uploaded", mediaItemId and imageFieldXml `<image mediaid="{id}" />` (attach-images.mjs uses it).
 * Never overwrites an existing media item and never uploads an entry twice (resume-safe). The manifest is merged in place, not rewritten.
 * Exit 0 every entry uploaded or listed as too large · 1 some uploads failed (retry) · 3 no Authoring client / site.json · 2 usage.
 */
import { existsSync, readFileSync, statSync, readdirSync } from "node:fs";
import { join, basename } from "node:path";
import { die, demoDir, parseArgs, readJson, rootRel, safeWrite, ENV, authoringClient } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: media-upload.mjs <customer> [--dry-run]");
const dry = !!flags["dry-run"], demo = demoDir(customer), lang = ENV.SITECORE_DEFAULT_LANGUAGE || "en";
const MAX = 50 * 1024 * 1024;   // Experience Edge cannot publish media larger than 50 MB
if (String(ENV.CH_ENABLED).toLowerCase() === "true" && !flags.force) die("CH_ENABLED=true: images go to Content Hub (content-hub-upload.mjs). Pass --force to use the Media Library anyway.", 2);
const manifestPath = join(demo, "images", "image-manifest.json");
const manifest = readJson(manifestPath);
if (!manifest) die(`${rootRel(manifestPath)} not found: download the images first`, 2);
const site = readJson(join(demo, "site.json"));
if (!site?.collection || !site?.siteName) die("site.json (collection, siteName) not found: the site is created first", 3);

// every manifest entry, wherever it sits in the structure (array, or grouped by field)
const entries = []; (function walk(o) { if (o && typeof o === "object") { if ("localFileName" in o || "localPath" in o) entries.push(o); else for (const v of Object.values(o)) walk(v); } })(manifest);
const fileOf = (e) => [e.localPath, e.localFile, e.localFileName && join(demo, "images", e.localFileName)].filter(Boolean).find((p) => existsSync(p));
// where an image belongs, from the captures (for the Missing assets line)
const whereOf = new Map();
for (const f of readdirSync(demo).filter((x) => /^sections.*\.json$/.test(x) && !/\.demo\./.test(x))) {
  for (const s of readJson(join(demo, f))?.sections ?? []) for (const im of [...(s.images ?? []).map((x) => x.src), ...(s.backgroundImages ?? []).map((b) => b?.url ?? b)]) {
    const u = String(im ?? "").split("?")[0]; if (u && !whereOf.has(u)) whereOf.set(u, `${f} section ${s.index}${s.heading?.text ? ` "${s.heading.text.slice(0, 40)}"` : ""}`);
  }
}
const slug = (t) => String(t).toLowerCase().replace(/\.[a-z0-9]+$/, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "image";

let gql = null;
if (!dry) { try { gql = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`, 3); } if (!gql) die("No Authoring GraphQL client (SITECORE_CM_HOST + automation client in harness/.env.local): node harness/scripts/env-check.mjs", 3); }
const folder = `Project/${site.collection}/${site.siteName}/demo-images`;

const todo = entries.filter((e) => e.uploadStatus !== "uploaded" && e.uploadStatus !== "too-large");
const missing = [], tooLarge = [], failed = [];
let uploaded = 0;
const queue = [...todo];
const worker = async () => {
  while (queue.length) {
    const e = queue.shift(), file = fileOf(e);
    if (!file) { missing.push(e.localFileName ?? e.src ?? "?"); continue; }
    const size = statSync(file).size;
    if (size > MAX) { Object.assign(e, { uploadStatus: "too-large", sizeBytes: size }); tooLarge.push({ e, size }); continue; }
    const name = `${slug(e.localFileName ?? basename(file))}`, itemPath = `${folder}/${name}`;
    if (dry) { console.log(`would upload ${basename(file)} (${(size / 1048576).toFixed(1)} MB) → /sitecore/media library/${itemPath}`); continue; }
    try {
      const up = await gql(`mutation($i:UploadMediaInput!){ uploadMedia(input:$i){ presignedUploadUrl } }`, { i: { itemPath, alt: String(e.alt ?? name).slice(0, 200), language: lang, overwriteExisting: false } });
      const form = new FormData();
      form.append("file", new Blob([readFileSync(file)]), basename(file));
      const r = await fetch(up.uploadMedia.presignedUploadUrl, { method: "POST", headers: { Authorization: `Bearer ${gql.token}` }, body: form, signal: AbortSignal.timeout(180000) });
      const j = await r.json().catch(() => ({}));
      const id = j.Id ?? j.id;
      if (!r.ok || !id) throw new Error(`upload HTTP ${r.status}: ${JSON.stringify(j).slice(0, 160)}`);
      const guid = `{${String(id).replace(/[{}]/g, "").toUpperCase()}}`;
      Object.assign(e, { uploadStatus: "uploaded", mediaItemId: guid, mediaPath: `/sitecore/media library/${itemPath}`, imageFieldXml: `<image mediaid="${guid}" />`, uploadedAt: new Date().toISOString() });
      uploaded++;
    } catch (err) { e.uploadStatus = "failed"; e.uploadError = err.message.slice(0, 200); failed.push(`${basename(file)}: ${e.uploadError}`); }
  }
};
await Promise.all(Array.from({ length: 4 }, worker));

if (!dry) {
  safeWrite(customer, manifestPath, JSON.stringify(manifest, null, 2) + "\n");   // merged in place: entries keep their other fields
  if (tooLarge.length) {
    // one line per file under "## Missing assets": the SE replaces or hosts it elsewhere; the run carries on
    const mt = join(demo, "manual-tasks.md");
    let text = existsSync(mt) ? readFileSync(mt, "utf8") : `# Manual tasks — ${customer}\n`;
    if (!/^## Missing assets/m.test(text)) text = text.replace(/\s*$/, "\n\n## Missing assets\n");
    for (const { e, size } of tooLarge) {
      const line = `- [ ] ${e.localFileName ?? basename(fileOf(e) ?? "")} (${(size / 1048576).toFixed(1)} MB) is too large for Experience Edge (50 MB) and was not uploaded. Live: ${e.src ?? "?"}${whereOf.get(String(e.src ?? "").split("?")[0]) ? ` · belongs to ${whereOf.get(String(e.src).split("?")[0])}` : ""}. Provide a smaller file, or host it elsewhere and link it.`;
      if (!text.includes(line.slice(0, 60))) text = text.replace(/^## Missing assets\n/m, `## Missing assets\n${line}\n`);
    }
    safeWrite(customer, mt, text);
  }
}
console.log(`${entries.length} image(s) in the manifest: ${dry ? `${todo.length} to upload` : `${uploaded} uploaded now`}, ${entries.filter((e) => e.uploadStatus === "uploaded").length} uploaded in total, ${tooLarge.length} too large (${dry ? "would be listed" : "listed"} under Missing assets), ${missing.length} file(s) missing on disk, ${failed.length} failed`);
for (const m of missing) console.log(`✖ file missing on disk: ${m} (download it again)`);
for (const f of failed) console.log(`✖ ${f}`);
process.exit(failed.length || missing.length ? 1 : 0);
