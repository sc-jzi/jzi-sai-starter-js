#!/usr/bin/env node
/**
 * SitecoreAI Sites API helper — create a NEW site (and a new collection when needed). Never copies or renames anything.
 * Docs: https://api-docs.sitecore.com/sai/sites-api
 *
 *   node harness/scripts/sites-api.mjs auth-check
 *   node harness/scripts/sites-api.mjs collections
 *   node harness/scripts/sites-api.mjs templates
 *   node harness/scripts/sites-api.mjs sites [--collection-id <id>]
 *   node harness/scripts/sites-api.mjs create-site --customer <customer> --site-name "<Name>" --template-id <id> \
 *        (--collection-id <id> | --collection-name "<new collection>") [--language en] [--languages en,fr] [--apply]
 *
 * Credentials come from harness/.env.local (SITECORE_AUTOMATION_CLIENT_ID / _SECRET, optional SITECORE_ENVIRONMENT_ID); never printed.
 * create-site is a DRY RUN unless --apply. It refuses when a site with that name already exists. On success it writes
 * industry-verticals/<customer>/docs/ai/demos/<customer>/site.json (collection, site name, ids) which later steps read.
 */
import { ENV, ROOT, die, parseArgs, customerApp, demoDir, safeWrite, rootRel, PROTECTED_SITES } from "./_lib.mjs";
import { join } from "node:path";

const { flags, pos } = parseArgs(process.argv.slice(2));
const cmd = pos[0];
const AUTH = `${ENV.SITECORE_AUTH_HOST}/oauth/token`, BASE = ENV.SITES_API_HOST, ENV_ID = ENV.SITECORE_ENVIRONMENT_ID;

async function token() {
  const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
  if (!id || !secret) die("Set SITECORE_AUTOMATION_CLIENT_ID and SITECORE_AUTOMATION_CLIENT_SECRET in harness/.env.local (copy harness/env.example). Create the automation client in SitecoreAI Deploy → Credentials → Environment.");
  const r = await fetch(AUTH, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
  if (!r.ok) die(`Auth failed (${r.status}). Check the automation client id/secret.`);
  return (await r.json()).access_token;
}
let jwt;
async function api(method, path, body) {
  jwt ??= await token();
  const url = `${BASE}${path}${ENV_ID ? `${path.includes("?") ? "&" : "?"}environmentId=${encodeURIComponent(ENV_ID)}` : ""}`;
  const go = () => fetch(url, { method, headers: { Authorization: `Bearer ${jwt}`, "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  let r = await go();
  if (r.status === 401) { jwt = await token(); r = await go(); }
  const text = await r.text(); let data; try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!r.ok) die(`${method} ${path} → ${r.status}: ${typeof data === "string" ? data : JSON.stringify(data)}`);
  return data;
}
const items = (d) => (Array.isArray(d) ? d : d?.items ?? d?.data ?? d?.sites ?? d?.collections ?? []);
const nameOf = (x) => x?.name ?? x?.siteName ?? x?.systemName;
const idOf = (x) => x?.id ?? x?.siteId ?? x?.collectionId;
const norm = (s) => String(s).toLowerCase().replace(/[-{}]/g, "");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function waitJob(handle) {
  for (let i = 0; i < 60; i++) {
    const j = await api("GET", `/api/v1/jobs/${encodeURIComponent(handle)}/status`);
    process.stdout.write(`  job ${j.status}\r`);
    if (j.status === "Completed") { console.log("  job Completed   "); return j; }
    if (j.status === "Failed") die(`Job failed: ${JSON.stringify(j)}`, 1);
    await sleep(Math.min(15000, 4000 + i * 1000));
  }
  die("Timed out waiting for the job (check SitecoreAI > Channels).", 1);
}

switch (cmd) {
  case "auth-check": console.log(`✅ Authenticated. ${items(await api("GET", "/api/v1/sites")).length} site(s) visible.`); break;
  case "collections": for (const c of items(await api("GET", "/api/v1/collections"))) console.log(`${idOf(c)}  ${nameOf(c)}${c.displayName ? `  (${c.displayName})` : ""}`); break;
  case "templates": for (const t of items(await api("GET", "/api/v1/sites/templates"))) console.log(`${t.id}  ${t.name}${t.enabled === false ? " [disabled]" : ""}${t.description ? ` — ${t.description}` : ""}`); break;
  case "sites": for (const s of items(await api("GET", flags["collection-id"] ? `/api/v1/collections/${flags["collection-id"]}/sites` : "/api/v1/sites"))) console.log(`${idOf(s)}  ${nameOf(s)}${s.collectionName ? `  [${s.collectionName}]` : ""}`); break;
  case "create-site": {
    const customer = flags.customer, siteName = flags["site-name"], templateId = flags["template-id"] || ENV.SITE_TEMPLATE_ID;
    if (!customer || !siteName || !templateId) die("need --customer, --site-name and --template-id (or SITE_TEMPLATE_ID in harness/.env.local)");
    if (!flags["collection-id"] === !flags["collection-name"]) die("give exactly one of --collection-id (existing) or --collection-name (create new)");
    customerApp(customer, { mustExist: false });
    if (PROTECTED_SITES.has(String(siteName).toLowerCase())) die(`"${siteName}" is a protected site name.`, 1);
    if (!/^(?![\s-])[a-zA-Z0-9_\s-]{1,100}(?<!\s)$/.test(siteName)) die("site name may contain letters, digits, spaces, _ and - only (max 100; no leading '-' or trailing space)");
    const language = String(flags.language ?? ENV.SITECORE_DEFAULT_LANGUAGE), languages = flags.languages ? String(flags.languages).split(",") : [language];
    if (items(await api("GET", "/api/v1/sites")).some((s) => String(nameOf(s)).toLowerCase() === siteName.toLowerCase())) die(`A site named "${siteName}" already exists — refusing to create or touch it. Choose another name.`, 1);
    const cols = items(await api("GET", "/api/v1/collections")); let note;
    if (flags["collection-id"]) { const c = cols.find((x) => norm(idOf(x)) === norm(flags["collection-id"])); if (!c) die("collection-id not found in this environment", 1); note = `existing collection "${nameOf(c)}"`; }
    else { if (cols.some((x) => String(nameOf(x)).toLowerCase() === String(flags["collection-name"]).toLowerCase())) die(`Collection "${flags["collection-name"]}" already exists — use --collection-id instead.`, 1); note = `NEW collection "${flags["collection-name"]}"`; }
    const body = { siteName, displayName: String(flags["display-name"] ?? siteName), templateId, language, languages,
      ...(flags["collection-id"] ? { collectionId: flags["collection-id"] } : { collectionName: flags["collection-name"], collectionDisplayName: String(flags["collection-name"]) }) };
    console.log(`${flags.apply ? "CREATE" : "DRY RUN"} — NEW site "${siteName}" in ${note}, template ${templateId}, languages ${languages.join(",")}`);
    if (!flags.apply) { console.log(JSON.stringify(body, null, 2)); console.log("\nNothing created. Re-run with --apply."); break; }
    const res = await api("POST", "/api/v1/sites", body);
    console.log(`Submitted (handle ${res?.handle ?? "n/a"}) — SitecoreAI can take up to ~2 minutes…`);
    if (res?.handle) await waitJob(res.handle);
    const after = items(await api("GET", "/api/v1/sites")).find((s) => String(nameOf(s)).toLowerCase() === siteName.toLowerCase());
    const cols2 = items(await api("GET", "/api/v1/collections"));
    const col = flags["collection-id"] ? cols2.find((x) => norm(idOf(x)) === norm(flags["collection-id"])) : cols2.find((x) => String(nameOf(x)).toLowerCase() === String(flags["collection-name"]).toLowerCase());
    const record = { customer, siteName, siteId: idOf(after) ?? null, collection: nameOf(col) ?? String(flags["collection-name"] ?? ""), collectionId: idOf(col) ?? flags["collection-id"] ?? null,
      collectionIsNew: !flags["collection-id"], templateId, languages, jobHandle: res?.handle ?? null, createdAt: new Date().toISOString() };
    if (!after) console.log("⚠ Site not visible in the list yet — check SitecoreAI > Channels, then re-run `sites`.");
    safeWrite(customer, join(demoDir(customer), "site.json"), JSON.stringify(record, null, 2) + "\n");
    console.log(`✅ Created. Saved ${rootRel(join(demoDir(customer), "site.json"))}`); console.log(JSON.stringify(record, null, 2));
    break;
  }
  default: die("usage: sites-api.mjs <auth-check|collections|templates|sites|create-site> …");
}
