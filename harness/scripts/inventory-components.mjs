#!/usr/bin/env node
/**
 * Code-side inventory of the BASE app's components (read-only). Output feeds the /demo-inventory-base-site skill,
 * which then pairs each component with its Sitecore rendering/template ids (via Marketer MCP) and writes the manifest.
 *
 *   node harness/scripts/inventory-components.mjs [appDir]      (default: industry-verticals/prospera)
 *
 * Reads <app>/.sitecore/component-map.ts and each registered component file. Writes NOTHING in the app; prints JSON to stdout
 * (or to the file given with --out).
 *   name       key in the component map (== Sitecore rendering component name)
 *   file       src/components/... path
 *   folder     pagecontent | pagestructure | navigation | utilities | ...
 *   variants   named exports that are React components (Default, plus any others) — these are the headless variants
 *   fields     field names + SDK types from the `Fields` interface (or inline props.fields type)
 *   client     true when the file starts with 'use client'
 *   placeholders  literal <Placeholder name="..."> usages
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const args = process.argv.slice(2);
const outIdx = args.indexOf("--out");
const out = outIdx >= 0 ? args.splice(outIdx, 2)[1] : null;
const root = resolve(import.meta.dirname, "..", "..");
const app = resolve(args[0] ?? join(root, "industry-verticals/prospera"));
const mapP = join(app, ".sitecore/component-map.ts");
if (!existsSync(mapP)) { console.error(`not found: ${mapP}`); process.exit(1); }

const map = readFileSync(mapP, "utf8");
const imports = new Map(); // identifier -> path
for (const m of map.matchAll(/import\s+\*\s+as\s+(\w+)\s+from\s+'([^']+)'/g)) imports.set(m[1], m[2]);
const registered = [...map.matchAll(/\[\s*'([A-Za-z0-9]+)'\s*,\s*\{\s*\.\.\.(\w+)/g)].map((m) => ({ name: m[1], id: m[2] }));

const resolveFile = (p) => {
  const rel = p.replace(/^src\//, "src/");
  for (const ext of [".tsx", ".ts"]) { const f = join(app, rel + ext); if (existsSync(f)) return [rel + ext, f]; }
  return [null, null];
};

const components = [];
for (const { name, id } of registered) {
  const imp = imports.get(id); if (!imp) continue;
  const [rel, abs] = resolveFile(imp);
  const folder = imp.split("/")[2] ?? null;
  const entry = { name, file: rel, folder, sitecoreRendering: folder !== "non-sitecore" && name !== "SiteTheme", variants: [], fields: {}, client: false, placeholders: [] };
  if (abs) {
    const src = readFileSync(abs, "utf8");
    entry.client = /^\s*(['"])use client\1/.test(src);
    entry.variants = [...src.matchAll(/export\s+(?:const|function)\s+([A-Z]\w*)\s*[=(:]/g)].map((m) => m[1])
      .filter((v) => !/Props$/.test(v));
    const fi = src.match(/interface\s+Fields\s*\{([\s\S]*?)\n\}/) ?? src.match(/fields\s*:\s*\{([\s\S]*?)\n\s*\}\s*;/);
    if (fi) for (const f of fi[1].matchAll(/^\s*(\w+)\??\s*:\s*([^;\n]+)/gm)) entry.fields[f[1]] = f[2].trim();
    entry.placeholders = [...new Set([...src.matchAll(/<Placeholder[^>]*\bname=["'{`]+([^"'}`]+)/g)].map((m) => m[1]))];
  } else entry.warning = `source not found for ${imp}`;
  components.push(entry);
}
const result = { app: app.replace(root, "").replace(/\\/g, "/").replace(/^\//, ""), count: components.length, components };
const json = JSON.stringify(result, null, 2);
if (out) { writeFileSync(out, json); console.error(`wrote ${out} (${components.length} components)`); } else console.log(json);
