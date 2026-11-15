#!/usr/bin/env node
/**
 * Does this Sitecore environment have the base app's shared component layer? Every demo reuses those renderings and templates; an environment
 * without them cannot host a demo (it would need every component registered anew, a different job). Checked in T0, before any question about
 * collections or plans, and again by `sites-api.mjs create-site --apply`, so no site is created in an environment that cannot host it.
 *
 *   node harness/scripts/shared-layer-check.mjs
 *
 * Reads renderingsRoot and projectTemplatesRoot from the base app's docs/ai/config/project.yaml and looks both up on master through
 * Authoring GraphQL (SITECORE_CM_HOST + the automation client in harness/.env.local), with their child counts.
 * Exit 0 present · 1 missing (prints what) · 3 could not check (no CM host / client, or the call failed: check with the Marketer MCP instead).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { authoringClient, baseApp, BASE_APP, ENV } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

/** { status: "present" | "missing" | "unchecked", roots: [{ name, path, found, children }], message } */
export async function sharedLayerStatus() {
  let cfg = {};
  try { cfg = parseYaml(readFileSync(join(baseApp(), "docs", "ai", "config", "project.yaml"), "utf8")) ?? {}; } catch { /* below */ }
  const roots = [["renderingsRoot", cfg.renderingsRoot], ["projectTemplatesRoot", cfg.projectTemplatesRoot]].filter(([, p]) => p).map(([name, path]) => ({ name, path: String(path) }));
  if (!roots.length) return { status: "unchecked", roots, message: `industry-verticals/${BASE_APP}/docs/ai/config/project.yaml has no renderingsRoot / projectTemplatesRoot` };
  let gql = null;
  try { gql = await authoringClient(); } catch (e) { return { status: "unchecked", roots, message: `Authoring GraphQL: ${e.message.slice(0, 160)}` }; }
  if (!gql) return { status: "unchecked", roots, message: "no Authoring GraphQL client (SITECORE_CM_HOST + automation client in harness/.env.local)" };
  try {
    for (const r of roots) {
      const it = (await gql(`query($p:String!){ item(where:{ path:$p, database:"master" }){ itemId children{ nodes{ itemId } } } }`, { p: r.path }))?.item;
      r.found = !!it; r.children = it?.children?.nodes?.length ?? 0;
    }
  } catch (e) { return { status: "unchecked", roots, message: `Authoring GraphQL: ${e.message.slice(0, 160)}` }; }
  const bad = roots.filter((r) => !r.found || r.children === 0);
  const env = String(ENV.SITECORE_CM_HOST || "").replace(/^https?:\/\//, "").replace(/\/.*$/, "");
  return bad.length
    ? { status: "missing", roots, message: `The ${BASE_APP} shared component layer is not in this environment (${env}): ${bad.map((r) => `${r.path} ${r.found ? "is empty" : "not found"}`).join("; ")}. Demos reuse those renderings and templates, so a site here would have no components. Point harness/.env.local (SITECORE_CM_HOST, SITECORE_ENVIRONMENT_ID, the automation client) and the Marketer MCP at an environment that has them.` }
    : { status: "present", roots, message: `shared layer present in ${env}: ${roots.map((r) => `${r.path} (${r.children} children)`).join(", ")}` };
}

if (process.argv[1] && process.argv[1].endsWith("shared-layer-check.mjs")) {
  const s = await sharedLayerStatus();
  console.log(`${s.status === "present" ? "✅" : s.status === "missing" ? "❌" : "·"} ${s.message}`);
  process.exitCode = s.status === "present" ? 0 : s.status === "missing" ? 1 : 3;   // exitCode, not exit(): Windows crashes on exit() after a fetch
}
