// Shared helpers for harness scripts. Dependency-free.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

export const HARNESS = resolve(join(dirname(fileURLToPath(import.meta.url)), ".."));   // <repo>/harness
export const ROOT = resolve(join(HARNESS, ".."));                                        // <repo>
export const die = (m, c = 2) => { console.error(m); process.exit(c); };

const DEFAULTS = { BASE_APP_FOLDER: "prospera", SITECORE_AUTH_HOST: "https://auth.sitecorecloud.io", SITES_API_HOST: "https://xmapps-api.sitecorecloud.io", SITECORE_DEFAULT_LANGUAGE: "en", RENDERING_HOST_TEMPLATE: "basic-nextjs", CH_ENABLED: "false" };
/** harness/.env.local (git-ignored) over built-in defaults; real environment variables override both. Values are never printed. */
export function loadEnv() {
  const env = { ...DEFAULTS };
  const p = join(HARNESS, ".env.local");
  if (existsSync(p)) for (const line of readFileSync(p, "utf8").replace(/^﻿/, "").split(/\r?\n/)) {
    if (line.trim().startsWith("#")) continue;
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if (!m) continue;
    const v = m[2].replace(/^["']|["']$/g, ""); if (v !== "") env[m[1]] = v;
  }
  for (const [k, v] of Object.entries(process.env)) if (k in env && v) env[k] = v;
  return env;
}
export const ENV = loadEnv();
export const list = (v) => String(v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
export const BASE_APP = String(ENV.BASE_APP_FOLDER).toLowerCase();             // the app new demos are copied FROM (read-only)
export const PROTECTED_FOLDERS = new Set([BASE_APP, ...list(ENV.PROTECTED_FOLDERS)]);
export const PROTECTED_SITES = new Set(["prosperafinancial", "prospera", "main-website", ...list(ENV.PROTECTED_SITES)]);

/** <repo>/industry-verticals/<customer>. Refuses the base app and anything protected. */
export function customerApp(customer, { mustExist = true } = {}) {
  if (!customer || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(customer)) die("Customer must be a lower-case kebab name, e.g. acme-corp (it becomes the folder name under industry-verticals/)");
  if (PROTECTED_FOLDERS.has(customer.toLowerCase())) die(`"${customer}" is protected (the base app or listed in PROTECTED_FOLDERS). Pick another customer name.`, 1);
  const app = join(ROOT, "industry-verticals", customer);
  if (mustExist && !existsSync(app)) die(`industry-verticals/${customer} does not exist yet. Run intake (it creates the demo folder) or new-site first.`);
  return app;
}
/** industry-verticals/<customer>/docs/ai/demos/<customer> — everything the demo produces lives here. Created on demand. */
export const demoDir = (customer) => join(customerApp(customer, { mustExist: false }), "docs", "ai", "demos", customer);
export const baseApp = () => join(ROOT, "industry-verticals", BASE_APP);
/** Component registry: the customer's copy, else the base app's (read-only). */
export function registryPath(customer) {
  for (const base of [join(ROOT, "industry-verticals", customer), baseApp()]) {
    const p = join(base, "docs", "ai", "catalog", "component-registry.yaml"); if (existsSync(p)) return p;
  }
  die(`component-registry.yaml not found in the customer copy or industry-verticals/${BASE_APP}`);
}
export const rootRel = (abs) => abs.slice(ROOT.length + 1).replace(/\\/g, "/");

/** The ONLY way harness scripts write files: inside industry-verticals/<customer>/ (plus root xmcloud.build.json when allowed). */
export function safeWrite(customer, abs, content, { buildJson = false } = {}) {
  const target = resolve(abs), app = customerApp(customer, { mustExist: false });
  const ok = target === app || target.startsWith(app + sep) || (buildJson && target === join(ROOT, "xmcloud.build.json"));
  if (!ok) die(`Refusing to write outside industry-verticals/${customer}/: ${rootRel(target)}`, 1);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}
export const readJson = (p, fallback = null) => { try { return JSON.parse(readFileSync(p, "utf8").replace(/^﻿/, "")); } catch { return fallback; } };
export function parseArgs(argv) {
  const flags = {}, pos = [];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) { const k = a.slice(2); const n = argv[i + 1]; if (n !== undefined && !n.startsWith("--")) { flags[k] = n; i++; } else flags[k] = true; } else pos.push(a);
  }
  return { flags, pos };
}
