#!/usr/bin/env node
/**
 * Try to create the customer's EDITING HOST in SitecoreAI Deploy with the Sitecore CLI, so the SE only has to push the code.
 *
 *   node harness/scripts/editing-host.mjs --customer <customer> [--apply]
 *
 * Runs:  dotnet sitecore cloud editinghost create --name <customer> --cm-environment-id <SITECORE_ENVIRONMENT_ID> --json
 * (https://doc.sitecore.com/sai/en/developers/sitecoreai/sitecore-command-line-interface/sitecore-cli-command-reference/the-cli-cloud-command/the-cloud-editinghost-command.html)
 * - the name must equal the renderingHosts key in xmcloud.build.json (new-site.mjs adds <customer>)
 * - the CLI only works for environments created with --cm-only or with the Decoupled Deployments beta, and needs a CLI login
 * - the CLI has no repo/branch option: the editing host builds from the repo/branch the project is linked to. Check the first one by hand.
 * DRY RUN unless --apply. Failure is NOT fatal for the demo: the script prints the manual steps and exits 1 so the skill can list it as a manual task.
 * Result is recorded in site.json (editingHost).
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ENV, ROOT, die, parseArgs, customerApp, demoDir, safeWrite, readJson, rootRel } from "./_lib.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const customer = flags.customer; if (!customer) die("usage: editing-host.mjs --customer <customer> [--apply]");
customerApp(customer, { mustExist: false });
const siteP = join(demoDir(customer), "site.json"), rec = readJson(siteP);
if (!rec?.siteName) die(`${rootRel(siteP)} not found — create the site first.`);
if (rec.editingHost?.created) { console.log(`Editing host "${customer}" was already created (${rec.editingHost.at}). Nothing to do.`); process.exit(0); }
const buildP = join(ROOT, "xmcloud.build.json");
const build = existsSync(buildP) ? JSON.parse(readFileSync(buildP, "utf8")) : {};
if (!build.renderingHosts?.[customer]) die(`renderingHosts.${customer} is not in xmcloud.build.json — run new-site.mjs --apply first.`, 1);
const envId = ENV.SITECORE_ENVIRONMENT_ID;
const manual = `Manual fallback: SitecoreAI Deploy → your project → Editing hosts → Add editing host: name "${customer}" (= the xmcloud.build.json key), link the authoring environment, pick the repo and branch, save.`;
if (!envId) { console.error(`SITECORE_ENVIRONMENT_ID is not set in harness/.env.local (the authoring/CM environment id is needed).\n${manual}`); process.exit(1); }
const args = ["sitecore", "cloud", "editinghost", "create", "--name", customer, "--cm-environment-id", envId, "--json"];
console.log(`${flags.apply ? "RUN" : "DRY RUN"}: dotnet ${args.join(" ").replace(envId, "<environment id>")}`);
if (!flags.apply) { console.log("Nothing created. Re-run with --apply."); process.exit(0); }
const r = spawnSync("dotnet", args, { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.trim();
if (r.error || r.status !== 0) {
  console.error(`${r.error ? "dotnet is not installed or not on the PATH.\n" : ""}The Sitecore CLI could not create the editing host (exit ${r.status}).\n${out.slice(0, 1500)}\n\nIf it says you are not logged in, log in with the Sitecore CLI first (see the CLI docs), then re-run.\n${manual}`);
  process.exit(1);
}
safeWrite(customer, siteP, JSON.stringify({ ...rec, editingHost: { created: true, name: customer, at: new Date().toISOString() } }, null, 2) + "\n");
console.log(`✅ Editing host "${customer}" requested.\n${out.slice(0, 800)}\nIt deploys from the repo/branch the project is linked to: push the code, then check the first build in Deploy.`);
