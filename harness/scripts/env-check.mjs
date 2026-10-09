#!/usr/bin/env node
/** node harness/scripts/env-check.mjs — which harness settings are set (values are never printed). Exit 1 if a REQUIRED one is missing. */
import { existsSync } from "node:fs";
import { join } from "node:path";
import { HARNESS, ENV, PROTECTED_FOLDERS, BASE_APP, baseApp } from "./_lib.mjs";
const rows = [
  ["SITECORE_AUTOMATION_CLIENT_ID", "required", "automation client (Sites API: create collection/site)"],
  ["SITECORE_AUTOMATION_CLIENT_SECRET", "required", "automation client secret"],
  ["SITECORE_EDGE_CONTEXT_ID", "recommended", "copied into each demo app's .env.local"],
  ["SITECORE_EDITING_SECRET", "recommended", "copied into each demo app's .env.local"],
  ["SITECORE_ENVIRONMENT_ID", "recommended", "authoring (CM) environment id: pins the Sites API and creates the editing host"],
  ["CH_HOST", "ifCH", "Content Hub host"], ["CH_USER", "ifCH", "Content Hub user"], ["CH_PASSWORD", "ifCH", "Content Hub password"],
];
const chOn = String(ENV.CH_ENABLED).toLowerCase() === "true";
let miss = 0;
console.log(existsSync(join(HARNESS, ".env.local")) ? "harness/.env.local found" : "⚠️  harness/.env.local NOT found — copy harness/env.example to harness/.env.local and fill it in");
for (const [k, lvl, why] of rows) {
  const set = !!ENV[k];
  const need = lvl === "required" || (lvl === "ifCH" && chOn);
  if (need && !set) miss++;
  console.log(`${set ? "✅" : need ? "❌" : "·"} ${k.padEnd(34)} ${set ? "set" : "not set"}  — ${why}`);
}
console.log(`${existsSync(baseApp()) ? "✅" : "❌"} base app industry-verticals/${BASE_APP} ${existsSync(baseApp()) ? "found (read-only)" : "NOT FOUND"}`);
if (!existsSync(baseApp())) miss++;
console.log(`protected folders: ${[...PROTECTED_FOLDERS].join(", ")}`);
console.log(`Content Hub upload: ${chOn ? "ON" : "OFF (images-to-upload.md will be written instead)"}`);
process.exit(miss ? 1 : 0);
