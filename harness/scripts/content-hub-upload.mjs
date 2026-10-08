#!/usr/bin/env node
/**
 * Run the existing Content Hub uploader for one demo using the credentials in harness/.env.local.
 *   node harness/scripts/content-hub-upload.mjs <customer> [--images-dir <dir>]
 * It writes the customer copy's docs/ai/config/credentials.local.yaml (git-ignored) from env, runs the customer's
 * own docs/ai/scripts/upload-to-content-hub.mjs, and leaves image-manifest.json where that script puts it.
 * Does nothing (exit 0) when CH_ENABLED is not "true".
 */
import { spawnSync } from "node:child_process";
import { existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { ENV, die, customerApp, demoDir, rootRel } from "./_lib.mjs";

const customer = process.argv[2];
const app = customerApp(customer);
if (String(ENV.CH_ENABLED).toLowerCase() !== "true") { console.log("CH_ENABLED is not true in harness/.env.local — skipping upload. Write images-to-upload.md for a manual upload instead."); process.exit(0); }
for (const k of ["CH_HOST", "CH_USER", "CH_PASSWORD"]) if (!ENV[k]) die(`${k} missing in harness/.env.local`);
const q = (v) => JSON.stringify(String(v ?? ""));
const cred = join(app, "docs/ai/config/credentials.local.yaml");
mkdirSync(dirname(cred), { recursive: true });
writeFileSync(cred, `# generated from harness/.env.local — do not edit, do not commit\ncontentHub:\n  host: ${q(ENV.CH_HOST)}\n  authMethod: ${q(ENV.CH_AUTH_METHOD || "simple")}\n  user: ${q(ENV.CH_USER)}\n  password: ${q(ENV.CH_PASSWORD)}\n  clientId: ${q(ENV.CH_CLIENT_ID)}\n  clientSecret: ${q(ENV.CH_CLIENT_SECRET)}\n  token: ""\n  uploadConfig: ${q(ENV.CH_UPLOAD_CONFIG || "AssetUploadConfiguration")}\n`);
const script = join(app, "docs/ai/scripts/upload-to-content-hub.mjs");
if (!existsSync(script)) die(`${rootRel(script)} not found in the customer copy`);
const i = process.argv.indexOf("--images-dir");
const imagesDir = i > 0 ? process.argv[i + 1] : join(demoDir(customer), "images");
const r = spawnSync(process.execPath, [script, "--images-dir", imagesDir], { cwd: app, stdio: "inherit" });
process.exit(r.status ?? 1);
