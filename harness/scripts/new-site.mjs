#!/usr/bin/env node
/**
 * Create the LOCAL half of a new demo: an independent copy of the base app (industry-verticals/<BASE_APP_FOLDER>, default prospera)
 * as industry-verticals/<customer>. The Sitecore half (collection + NEW site) is created first by sites-api.mjs, which writes
 * industry-verticals/<customer>/docs/ai/demos/<customer>/site.json.
 *
 *   node harness/scripts/new-site.mjs <customer> [--apply]
 *
 * DRY RUN unless --apply. The base app is only READ. Writes (nothing else — enforced by _lib.safeWrite):
 *   industry-verticals/<customer>/**   copy of the base app, package name, .env.local, docs/ai/config/project.yaml (site + collection)
 *   xmcloud.build.json                 ONE addition: renderingHosts.<customer>  (the only shared file touched)
 */
import { cpSync, readdirSync, statSync, existsSync, readFileSync } from "node:fs";
import { join, sep } from "node:path";
import { ENV, ROOT, BASE_APP, die, parseArgs, customerApp, demoDir, baseApp, safeWrite, readJson, rootRel } from "./_lib.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0], apply = !!flags.apply;
if (!customer) die("usage: new-site.mjs <customer> [--apply]");
const dst = customerApp(customer, { mustExist: false }), src = baseApp();
if (!existsSync(src)) die(`base app not found: industry-verticals/${BASE_APP}`);
const site = readJson(join(demoDir(customer), "site.json"));
if (!site?.siteName) die(`No site.json for "${customer}". Create the Sitecore site first: node harness/scripts/sites-api.mjs create-site --customer ${customer} …`, 1);
if (existsSync(dst)) { const extra = readdirSync(dst).filter((e) => e !== "docs"); if (extra.length) die(`industry-verticals/${customer} already has app files (${extra.slice(0, 4).join(", ")}…) — refusing to overwrite`, 1); }
const buildFile = join(ROOT, "xmcloud.build.json");
if (!existsSync(buildFile)) die("xmcloud.build.json not found at repo root");
const build = readFileSync(buildFile, "utf8"), parsed = JSON.parse(build);
if (parsed.renderingHosts?.[customer]) die(`renderingHosts.${customer} already exists in xmcloud.build.json`, 1);
const tpl = parsed.renderingHosts?.[ENV.RENDERING_HOST_TEMPLATE];
if (!tpl) die(`renderingHosts.${ENV.RENDERING_HOST_TEMPLATE} not found in xmcloud.build.json (set RENDERING_HOST_TEMPLATE in harness/.env.local to an existing host to clone settings from)`);
const EOL = build.includes("\r\n") ? "\r\n" : "\n";
const block = JSON.stringify({ ...tpl, path: `./industry-verticals/${customer}`, enabled: true }, null, 2).split("\n").map((l, i) => (i === 0 ? l : "    " + l)).join(EOL);
const marker = /\r?\n  \},\r?\n  "postActions"/;
if (!marker.test(build)) die("could not locate the end of renderingHosts in xmcloud.build.json; add the entry by hand");
const patched = build.replace(marker, `,${EOL}    "${customer}": ${block}${EOL}  },${EOL}  "postActions"`); JSON.parse(patched);

const SKIP = new Set(["node_modules", ".next", ".turbo", ".vercel", "coverage", "dist", "out", "package-cache"]);
const skipFile = (n) => n === ".env" || n === ".env.local" || (n.startsWith(".env.") && n.endsWith(".local")) || n === "credentials.local.yaml" || n === "user.json" || n === ".guard-baseline.json";
const plan = [
  `READ industry-verticals/${BASE_APP} (never modified) → COPY to industry-verticals/${customer} (skipping ${[...SKIP].join(", ")}, other demos' docs/ai/demos, local .env files, credentials)`,
  `set package.json name → "${customer}"`,
  `create .env.local from .env.remote.example: NEXT_PUBLIC_DEFAULT_SITE_NAME="${site.siteName}"; Edge context ids / editing secret from harness/.env.local when set (git-ignored; values never printed)`,
  `set docs/ai/config/project.yaml siteCollection="${site.collection}" siteName="${site.siteName}"`,
  `add renderingHosts.${customer} to xmcloud.build.json (cloned from "${ENV.RENDERING_HOST_TEMPLATE}", path ./industry-verticals/${customer}); nothing else in it changes`,
];
console.log(`${apply ? "APPLY" : "DRY RUN"} — local app for "${customer}" (site "${site.siteName}", collection "${site.collection}")\n`); plan.forEach((p, i) => console.log(`  ${i + 1}. ${p}`));
if (apply) {
  cpSync(src, dst, { recursive: true, filter: (p) => {
    const parts = p.slice(src.length).split(sep).filter(Boolean);
    if (parts.some((x) => SKIP.has(x)) || skipFile(parts[parts.length - 1] ?? "")) return false;
    return !(parts[0] === "docs" && parts[1] === "ai" && parts[2] === "demos");
  } });
  const pkgPath = join(dst, "package.json"), pkg = JSON.parse(readFileSync(pkgPath, "utf8")); pkg.name = customer;
  safeWrite(customer, pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  const ex = join(dst, ".env.remote.example"); let env = existsSync(ex) ? readFileSync(ex, "utf8") : ""; const nl = env.includes("\r\n") ? "\r\n" : "\n";
  const setVar = (k, v) => { if (!v) return; const re = new RegExp(`^${k}=[^\\r\\n]*$`, "m"); env = re.test(env) ? env.replace(re, () => `${k}=${v}`) : `${env}${env && !env.endsWith("\n") ? nl : ""}${k}=${v}${nl}`; };
  setVar("NEXT_PUBLIC_DEFAULT_SITE_NAME", site.siteName); setVar("NEXT_PUBLIC_DEFAULT_LANGUAGE", ENV.SITECORE_DEFAULT_LANGUAGE);
  setVar("SITECORE_EDGE_CONTEXT_ID", ENV.SITECORE_EDGE_CONTEXT_ID); setVar("NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID", ENV.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || ENV.SITECORE_EDGE_CONTEXT_ID);
  setVar("SITECORE_EDITING_SECRET", ENV.SITECORE_EDITING_SECRET); setVar("SITECORE_AUTH_CLIENT_ID", ENV.SITECORE_AUTH_CLIENT_ID); setVar("SITECORE_AUTH_CLIENT_SECRET", ENV.SITECORE_AUTH_CLIENT_SECRET); setVar("SITECORE_RENDERINGHOST_NAME", customer);
  safeWrite(customer, join(dst, ".env.local"), env);
  const empty = ["SITECORE_EDGE_CONTEXT_ID", "NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID", "SITECORE_EDITING_SECRET"].filter((k) => { const m = env.match(new RegExp(`^${k}=([^\\r\\n]*)$`, "m")); return !m || !m[1].trim(); });

  const pj = join(dst, "docs/ai/config/project.yaml"); let y = existsSync(pj) ? readFileSync(pj, "utf8") : "";
  const put = (k, v) => { const re = new RegExp(`^${k}:.*$`, "m"); y = re.test(y) ? y.replace(re, `${k}: "${v}"`) : `${y}${y && !y.endsWith("\n") ? "\n" : ""}${k}: "${v}"\n`; };
  put("siteCollection", site.collection); put("siteName", site.siteName);
  safeWrite(customer, pj, y);
  safeWrite(customer, buildFile, patched, { buildJson: true });
  console.log(`\n.env.local: ${empty.length ? `STILL EMPTY: ${empty.join(", ")} (add them to harness/.env.local and re-run, or fill industry-verticals/${customer}/.env.local)` : "filled from harness/.env.local"}`);
}
console.log(`
STILL TO DO BY A PERSON (cannot be automated here)
  [ ] Edge context ids + editing secret in industry-verticals/${customer}/.env.local if they were empty
  [ ] npm install in industry-verticals/${customer}
  [ ] Rendering host / editing host for "${customer}" in SitecoreAI Deploy (or: dotnet sitecore cloud editinghost create — see harness/skills/sitecore-new-site.md)
  [ ] Add this site's publish item ids to xmcloud.build.json postActions if your environment needs them
`);
if (!apply) console.log("Dry run only. Re-run with --apply to write.");
