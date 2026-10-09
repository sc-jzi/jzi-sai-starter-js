#!/usr/bin/env node
/**
 * Work out what a NEW (template-created) site needs before pages can be built — from the approved demo-plan.yaml and the
 * shared component manifest. Read-only except its two report files.
 *
 *   node harness/scripts/bootstrap-plan.mjs <customer>
 *
 * Writes industry-verticals/<customer>/docs/ai/demos/<customer>/bootstrap-plan.json and bootstrap-plan.md:
 *   components   each used component: rendering id (SHARED, already registered — reuse), folder template id, datasource folder name,
 *                headless-variant container + the variants the plan uses
 *   site items   what must exist INSIDE the new site: Data folder per component, Headless Variants container + Variant Definitions,
 *                Available Renderings entries
 * Shared definitions (templates, renderings, rendering parameters under Project/<renderingsRoot>) are NEVER created here.
 * Site-level item ids found in the manifest (main/main-website) belong to ANOTHER site and are never reused.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { die, demoDir, baseApp, customerApp, rootRel, ROOT } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const customer = process.argv[2]; if (!customer) die("usage: bootstrap-plan.mjs <customer>");
const demo = demoDir(customer), app = customerApp(customer, { mustExist: false });
const aiDir = (n) => [join(app, "docs/ai", n), join(baseApp(), "docs/ai", n)].find(existsSync);
const planP = join(demo, "demo-plan.yaml"); if (!existsSync(planP)) die(`${rootRel(planP)} not found`);
const manP = aiDir("manifests/sitecore-manifest.yaml"), anaP = [join(ROOT, ".cursor/skills/site-analyzer/SKILL.md")].find(existsSync);
if (!manP) die("sitecore-manifest.yaml not found in the customer copy or the base app");
const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);

const plan = parseYaml(readFileSync(planP, "utf8")), man = parseYaml(readFileSync(manP, "utf8"));
if (!arr(man.components).length) die(`${rootRel(manP)} has no components yet. Run /demo-inventory-base-site once (read-only discovery of the base site) to fill it, then re-run.`);
const byName = new Map(arr(man.components).map((c) => [c.name, c]));
// registry id -> manifest name (table in .cursor/skills/site-analyzer/SKILL.md); fallback PascalCase
const map = new Map();
if (anaP) for (const m of readFileSync(anaP, "utf8").matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|\s*`([A-Za-z0-9]+)`/gm)) map.set(m[1], m[2]);
const pascal = (id) => id.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("");

const used = new Map(); // manifestName -> {variants:Set, pages:Set}
const warnings = [];
for (const p of arr(plan.site?.pages)) for (const s of arr(p.sections)) {
  if (typeof s !== "object" || !s?.component) continue;
  const name = map.get(s.component) ?? pascal(s.component);
  if (!byName.has(name)) { warnings.push(`${p.path}: component "${s.component}" → "${name}" is not in the manifest (needs a create-* skill, not bootstrap)`); continue; }
  const u = used.get(name) ?? { variants: new Set(["Default"]), pages: new Set() };
  u.variants.add(s.variant || "Default"); u.pages.add(p.path); used.set(name, u);
}

const components = [];
for (const [name, u] of used) {
  const c = byName.get(name);
  const mv = arr(c.headlessVariants?.variants).map((v) => v.name);
  const unknown = [...u.variants].filter((v) => mv.length && !mv.includes(v));
  if (c.status !== "complete") warnings.push(`${name}: manifest status is "${c.status}" — not reusable yet`);
  if (unknown.length) warnings.push(`${name}: variants ${unknown.join(", ")} are not in the manifest/TSX (have ${mv.join(", ")})`);
  const ctxOnly = !c.templates?.datasource;
  components.push({
    name, kind: c.kind, status: c.status, contextOnly: ctxOnly,
    renderingId: c.rendering?.itemId ?? null, renderingPath: c.rendering?.path ?? null,
    folderTemplateId: c.templates?.folder?.itemId ?? null, folderTemplateName: c.templates?.folder?.name ?? null,
    datasourceFolderName: c.datasourceFolder?.name ?? null,
    headlessVariantContainer: (c.headlessVariants?.containerPath ?? "").split("/").pop() || name,
    variants: [...u.variants], pages: [...u.pages],
  });
}
const allRenderingIds = arr(man.components).filter((c) => c.status === "complete" && c.rendering?.itemId && c.rendering?.registeredInAvailableRenderings !== false).map((c) => c.rendering.itemId);

const out = {
  customer, generatedAt: new Date().toISOString(),
  sharedLayer: { renderingsRoot: man.project?.renderingsRoot, projectTemplatesRoot: man.project?.projectTemplatesRoot, note: "shared, already registered — reuse, never recreate" },
  siteLevelSteps: [
    "A. availableRenderings: every rendering id below must be listed in <site>/Presentation/Available Renderings/Page Content (CONCATENATE — never replace)",
    "B. dataRoot: <site>/Data exists (create with the Data folder template the probe finds if missing)",
    "C. for each component with a datasource: <site>/Data/<datasourceFolderName> as an instance of folderTemplateId",
    "D. for each component: <site>/Presentation/Headless Variants/<container> with one Variant Definition per variant (Default always)",
    "E. header / footer: a Header and a Footer partial design in <site>/Presentation/Partial Designs and a page design that uses them — NavigationHeader / SiteFooter cannot be added by API, so these are placed in Pages by hand once",
  ],
  availableRenderings: { ids: allRenderingIds, count: allRenderingIds.length },
  components, warnings,
};
mkdirSync(demo, { recursive: true });
writeFileSync(join(demo, "bootstrap-plan.json"), JSON.stringify(out, null, 2) + "\n");
let md = `# Site bootstrap plan — ${customer}\n\nSource: demo-plan.yaml + shared manifest. Shared definitions (templates, renderings, rendering parameters) are reused, not created.\n\n## Per component (items to create inside the NEW site)\n| Component | Kind | Rendering id (shared) | Data folder | Variants needed | Pages |\n|---|---|---|---|---|---|\n`;
for (const c of components) md += `| ${c.name} | ${c.kind}${c.contextOnly ? " (context-only)" : ""} | ${c.renderingId ?? "-"} | ${c.contextOnly ? "-" : c.datasourceFolderName} | ${c.variants.join(", ")} | ${c.pages.join(", ")} |\n`;
md += `\n## Site-level steps\n${out.siteLevelSteps.map((s) => `- ${s}`).join("\n")}\n\n## Available Renderings value to concatenate (${allRenderingIds.length} ids)\n\`\`\`\n${allRenderingIds.join("|")}\n\`\`\`\n`;
if (warnings.length) md += `\n## Warnings\n${warnings.map((w) => `- ${w}`).join("\n")}\n`;
writeFileSync(join(demo, "bootstrap-plan.md"), md);
console.log(`✔ ${components.length} component(s) planned; ${allRenderingIds.length} rendering id(s) for Available Renderings`);
warnings.forEach((w) => console.log(`⚠ ${w}`));
console.log(`(${rootRel(join(demo, "bootstrap-plan.md"))})`);
