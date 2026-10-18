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

const pascalName = (n) => String(n || "").replace(/&/g, " ").split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join("");
const clientVariant = plan.site?.variantName || pascalName(plan.client?.name || customer);   // every component gets this variant (pixel-matching, always)
const newPending = new Map();   // NEW components from the plan (sections `new:` and site.chrome) that are not in the manifest yet
const used = new Map(); // manifestName -> {variants:Set, pages:Set}
const warnings = [];
for (const p of arr(plan.site?.pages)) for (const s of arr(p.sections)) {
  if (typeof s !== "object" || !s?.component) continue;
  const name = s.new?.name ?? map.get(s.component) ?? pascal(s.component);
  if (!byName.has(name) && s.new) { newPending.set(name, { name, kind: s.new.kind, cms: s.new.cms !== false, where: p.path }); continue; }
  if (!byName.has(name)) { warnings.push(`${p.path}: component "${s.component}" → "${name}" is not in the manifest (needs a create-* skill, not bootstrap)`); continue; }
  const u = used.get(name) ?? { variants: new Set(["Default"]), pages: new Set() };
  u.variants.add(s.variant || "Default"); u.pages.add(p.path); used.set(name, u);
  u.base = new Set([...(u.base ?? []), s.variant || "Default"]);
  if (s.look) { u.looks = new Set([...(u.looks ?? []), clientVariant + String(s.look)]); }   // one client variant per distinct look (ImageLeft/ImageRight)
}

for (const f of arr(plan.site?.chrome)) if (f?.delivery === "new" && f.new?.name) {
  if (byName.has(f.new.name)) { const u = used.get(f.new.name) ?? { variants: new Set(["Default"]), pages: new Set() }; u.pages.add("(header area)"); used.set(f.new.name, u); }
  else newPending.set(f.new.name, { name: f.new.name, kind: f.new.kind, cms: f.new.cms === true, where: "(header area)" });
}
if (newPending.size) warnings.push(`${newPending.size} NEW component(s) still to build in phase 5: ${[...newPending.keys()].join(", ")}. Build them (sitecore-component-router -> create-*), add them to the customer's manifest, then RE-RUN this script so their Data folders, Headless Variants containers (named like the rendering item), client variants and Available Renderings ids are included.`);
const components = [];
for (const [name, u] of used) {
  const c = byName.get(name);
  const mv = arr(c.headlessVariants?.variants).map((v) => v.name);
  const unknown = [...u.variants].filter((v) => mv.length && !mv.includes(v));
  u.variants.add(clientVariant); for (const l of u.looks ?? []) u.variants.add(l);   // created by Variant Definition in the site; the code is written by sitecore-create-demo-variants (phase 5.5)
  if (c.status !== "complete") warnings.push(`${name}: manifest status is "${c.status}" — not reusable yet`);
  if (unknown.length) warnings.push(`${name}: variants ${unknown.join(", ")} are not in the manifest/TSX (have ${mv.join(", ")})`);
  const ctxOnly = !c.templates?.datasource;
  components.push({
    name, kind: c.kind, status: c.status, contextOnly: ctxOnly,
    renderingId: c.rendering?.itemId ?? null, renderingPath: c.rendering?.path ?? null,
    folderTemplateId: c.templates?.folder?.itemId ?? null, folderTemplateName: c.templates?.folder?.name ?? null,
    datasourceFolderName: c.datasourceFolder?.name ?? null,
    headlessVariantContainer: c.rendering?.name || (c.headlessVariants?.containerPath ?? "").split("/").pop() || name,   // = the rendering ITEM name (spaces included): Sitecore matches the container by it
    reactFilePath: c.react?.filePath ?? null,
    variants: [...u.variants], pages: [...u.pages],
  });
}
// Header-area components are never in the page sections but always needed (partial designs): plan them from the manifest by name.
for (const name of ["Eyebrow", "Header", "Navigation", "SiteFooter", "Footer"]) {
  const c = byName.get(name); if (!c || components.some((x) => x.name === name)) continue;
  const mv = arr(c.headlessVariants?.variants).map((v) => v.name);
  if (name === "Footer" && byName.has("SiteFooter")) continue;
  components.push({
    name, kind: c.kind, status: c.status, contextOnly: !c.templates?.datasource, headerArea: true,
    renderingId: c.rendering?.itemId ?? null, renderingPath: c.rendering?.path ?? null,
    folderTemplateId: c.templates?.folder?.itemId ?? null, folderTemplateName: c.templates?.folder?.name ?? null,
    datasourceFolderName: null,   // header-area datasources live in the partial design's own Data folder (Header/Footer) or are Home (Navigation): no site Data folder
    headlessVariantContainer: c.rendering?.name || (c.headlessVariants?.containerPath ?? "").split("/").pop() || name,   // = the rendering ITEM name (spaces included): Sitecore matches the container by it
    reactFilePath: c.react?.filePath ?? null,
    variants: [...new Set(["Default", ...mv, clientVariant])], pages: ["(partial designs)"],
  });
  if (c.status !== "complete") warnings.push(`${name}: manifest status is "${c.status}" — not reusable yet`);
}
const allRenderingIds = arr(man.components).filter((c) => c.status === "complete" && c.rendering?.itemId && c.rendering?.registeredInAvailableRenderings !== false).map((c) => c.rendering.itemId);

const out = {
  customer, generatedAt: new Date().toISOString(),
  sharedLayer: { renderingsRoot: man.project?.renderingsRoot, projectTemplatesRoot: man.project?.projectTemplatesRoot, note: "shared, already registered — reuse, never recreate" },
  siteLevelSteps: [
    "A. availableRenderings: every rendering id below must be listed in <site>/Presentation/Available Renderings/Page Content (CONCATENATE — never replace)",
    "B. dataRoot: <site>/Data exists (create with the Data folder template the probe finds if missing)",
    "C. for each component with a datasource: <site>/Data/<datasourceFolderName> as an instance of folderTemplateId",
    "D. for each component: <site>/Presentation/Headless Variants/<container> (container = headlessVariantContainer = the RENDERING ITEM name with spaces, e.g. `Four Column CTA`, never the PascalCase component name; reuse existing containers) with one Variant Definition per variant (Default always, and the client variant `" + clientVariant + "` for EVERY component incl. Header, Eyebrow and SiteFooter; its code comes from phase 5.5)",
    "E. derived page templates: for each page type in the plan, a new template under /sitecore/templates/Project/<collection>/Pages whose Base template is the shared one",
    "F. Header and Footer partial designs in <site>/Presentation/Partial Designs. Header design = Eyebrow [client variant; ThemeSwitcher at eyebrow-left-0-<id>, LanguageSwitcher at eyebrow-right-0-<id>; the eyebrow links/phone/search/CTA are HARDCODED in the client Eyebrow variant, no Navigation inside it] above Header [client variant, datasource = the design's own Data/Header item with the logo] containing Navigation at header-right-0-<id> [client variant, datasource = Home, top level only]. Footer design = SiteFooter [client variant]. The client variants of Eyebrow/Header/Navigation are generated BEFORE placement by header-styles.mjs + header-kit.mjs (demo-site-bootstrap step 5). Datasource/variant/params on partial-design renderings: the ladder in placeholders-and-variants.md (a 'no datasource template' message is not an answer: go to layout XML). Plus a derived Header component template under /sitecore/templates/Project/<collection>/Components (try via the MCP; manual task only for what is refused)",
    "F2. Navigation Filters: find the site's filter items (Main Navigation, ...). No Eyebrow filter (the eyebrow is hardcoded). Main Navigation is visible ONLY for navGroup: main pages directly under Home; every other page gets Main Navigation ticked. The Navigation rendering must also carry the filter/levels rendering parameters (layout-variant.mjs patch --param), otherwise the filter is ignored (see demo-site-bootstrap step 5b)",
    "H. NEW components (newComponents above, from `new:` specs): built in phase 5 with the create-* skills; afterwards re-run bootstrap-plan.mjs and do steps A-D for them (Available Renderings, Data folder, container named like the rendering item, Default + client variant); header-area ones are then placed in the partial design placeholder named in their spec (demo-build-pages step 0)",
    "G. Page Designs for Page and Article that use those partials, mapped to the derived templates (Template To Design)",
  ],
  newComponents: [...newPending.values()],
  availableRenderings: { ids: allRenderingIds, count: allRenderingIds.length },
  components, warnings,
};
mkdirSync(demo, { recursive: true });
writeFileSync(join(demo, "bootstrap-plan.json"), JSON.stringify(out, null, 2) + "\n");
let md = `# Site bootstrap plan — ${customer}\n\nSource: demo-plan.yaml + shared manifest. Shared definitions (templates, renderings, rendering parameters) are reused, not created.\n\n## Per component (items to create inside the NEW site)\n| Component | Kind | Rendering id (shared) | Data folder | Variants needed | Pages |\n|---|---|---|---|---|---|\n`;
for (const c of components) md += c.headerArea ? `| ${c.name} (header area) | ${c.kind}${c.contextOnly ? " (context-only)" : ""} | ${c.renderingId ?? "-"} | - | ${c.variants.join(", ")} | ${c.pages.join(", ")} |\n` : `| ${c.name} | ${c.kind}${c.contextOnly ? " (context-only)" : ""} | ${c.renderingId ?? "-"} | ${c.contextOnly ? "-" : c.datasourceFolderName} | ${c.variants.join(", ")} | ${c.pages.join(", ")} |\n`;
md += `\n## Site-level steps\n${out.siteLevelSteps.map((s) => `- ${s}`).join("\n")}\n\n## Available Renderings value to concatenate (${allRenderingIds.length} ids)\n\`\`\`\n${allRenderingIds.join("|")}\n\`\`\`\n`;
if (warnings.length) md += `\n## Warnings\n${warnings.map((w) => `- ${w}`).join("\n")}\n`;
writeFileSync(join(demo, "bootstrap-plan.md"), md);
console.log(`✔ ${components.length} component(s) planned; ${allRenderingIds.length} rendering id(s) for Available Renderings`);
warnings.forEach((w) => console.log(`⚠ ${w}`));
console.log(`(${rootRel(join(demo, "bootstrap-plan.md"))})`);
