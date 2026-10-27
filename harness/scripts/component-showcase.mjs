#!/usr/bin/env node
/**
 * The base site's component showcase: /Home/components, one page per component, every variant with a Headless Variant definition placed
 * once, on the template's own sample content (standard values). It exists so component-catalog.mjs can screenshot every component and
 * variant, also the ones no other base-site page uses. Hidden from the main navigation. Re-run it after a component or variant is added.
 *
 *   node harness/scripts/component-showcase.mjs            dry run: what would be created or changed
 *   node harness/scripts/component-showcase.mjs --apply    create / update it (Authoring GraphQL), then read every page back
 *
 * Writes ONLY under <base site>/Home/components, plus the missing Headless Variant definitions (one per variant the code exports, in a
 * container named like the rendering item) under <base site>/Presentation/Headless Variants. Existing items are never changed or deleted
 * there. (R5/R21 exception approved by the SE for this script, outside demo runs.)
 * Components that read the page itself (no datasource template: article/author/project details and lists) are not placed: they have
 * nothing to show on an empty page; their screenshots come from the base site's own pages.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { die, parseArgs, baseApp, authoringClient } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const apply = !!flags.apply;
const manifest = parseYaml(readFileSync(join(baseApp(), "docs", "ai", "manifests", "sitecore-manifest.yaml"), "utf8"));
const P = manifest.project ?? {};
if (!P.siteCollection || !P.siteName) die("sitecore-manifest.yaml has no project.siteCollection / project.siteName");
const SITE = `/sitecore/content/${P.siteCollection}/${P.siteName}`, ROOT_PAGE = `${SITE}/Home/components`;
const CHROME = /^(Header|Footer|SiteFooter|Navigation|NavigationHeader|Eyebrow|Breadcrumb|ColumnSplitter|PageBackground|PartialDesignDynamicPlaceholder|SiteTheme|ThemeSwitcher|LanguageSwitcher)$/;
const guid = (id) => `{${String(id).replace(/[{}-]/g, "").toUpperCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")}}`;
const kebab = (n) => String(n).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();
const xmlAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const gql = await authoringClient();
const get = async (path) => (await gql(`query($p:String!){ item(where:{ path:$p, database:"master", language:"en" }){ itemId name path template{ templateId } version
  fields(ownFields:false){ nodes{ name value } } children{ nodes{ itemId name } } } }`, { p: path }))?.item ?? null;
const fv = (it, n) => it?.fields?.nodes?.find((f) => f.name === n)?.value ?? "";
const create = async (name, templateId, parentId, fields = []) => {
  if (!apply) { console.log(`  + would create ${name}`); return { itemId: null, name }; }
  const r = await gql(`mutation($n:String!,$t:ID!,$p:ID!,$f:[FieldValueInput]){ createItem(input:{ name:$n, templateId:$t, parent:$p, language:"en", fields:$f }){ item{ itemId path } } }`,
    { n: name, t: guid(templateId), p: guid(parentId), f: fields });
  return r.createItem.item;
};
const update = async (itemId, fields) => {
  if (!apply) { console.log(`  ~ would set ${fields.map((f) => f.name).join(", ")}`); return; }
  await gql(`mutation($id:ID!,$f:[FieldValueInput]!){ updateItem(input:{ itemId:$id, database:"master", language:"en", fields:$f }){ item{ itemId } } }`, { id: guid(itemId), f: fields });
};
const ensure = async (path, name, templateId, parentId, fields = []) => (await get(path)) ?? (await create(name, templateId, parentId, fields));

// the page template, the page data folder template, the body placeholder and the navigation filter: copied from an existing content page
const home = await get(`${SITE}/Home`); if (!home) die(`${SITE}/Home not found`);
let sample = null;
for (const ch of home.children.nodes) { const it = await get(`${SITE}/Home/${ch.name}`); if (/headless-main/.test(fv(it, "__Renderings")) && /local:\/Data\//.test(fv(it, "__Renderings"))) { sample = it; break; } }
if (!sample) die("no content page under Home with components on local datasources to copy the page shape from");
const PAGE_TEMPLATE = sample.template.templateId;
const sampleData = await get(`${sample.path}/Data`); if (!sampleData) die(`${sample.path}/Data not found`);
const DATA_TEMPLATE = sampleData.template.templateId;
const PH = (fv(sample, "__Renderings").match(/s:ph="([^"]*headless-main[^"]*)"/) ?? [])[1] ?? "headless-main";
const NAV_FILTER = fv(sample, "NavigationFilter");
// one picture the base site already uses (the first image field on the sample page's datasources)
const SAMPLE_IMAGE = await (async () => {
  for (const ch of sampleData.children.nodes) { const v = (await get(`${sampleData.path}/${ch.name}`))?.fields?.nodes?.find((f) => /^<image\b[^>]*mediaid=/i.test(f.value))?.value; if (v) return v; }
  return null;
})();
// the Image fields of a template, its base templates included
const imageFields = async (templateId, seen = new Set()) => {
  const id = guid(templateId); if (seen.has(id) || id === "{1930BBEB-7805-471A-A3BE-4858AC7CF696}") return []; seen.add(id);
  const t = (await gql(`query($id:ID!){ item(where:{ itemId:$id, database:"master" }){ field(name:"__Base template"){ value } children{ nodes{ template{ name } children{ nodes{ name template{ name } field(name:"Type"){ value } } } } } } }`, { id }))?.item;
  if (!t) return [];
  const own = t.children.nodes.filter((s) => s.template.name === "Template section").flatMap((s) => s.children.nodes.filter((f) => f.template.name === "Template field" && f.field?.value === "Image").map((f) => f.name));
  const bases = String(t.field?.value ?? "").split("|").filter(Boolean);
  for (const b of bases) own.push(...(await imageFields(b, seen)));
  return [...new Set(own)];
};
console.log(`page template ${guid(PAGE_TEMPLATE)}, data folder template ${guid(DATA_TEMPLATE)}, body placeholder ${PH}${NAV_FILTER ? ", navigation filter copied" : ""}`);

// what to place: every component with a datasource template, each variant that has a Headless Variant definition
const rendering = async (id) => (await gql(`query($id:ID!){ item(where:{ itemId:$id, database:"master" }){ itemId fields(ownFields:false){ nodes{ name value } } } }`, { id }))?.item ?? null;
const templateItem = async (ref) => {
  if (!ref) return null;
  let t = /^[{]?[0-9a-f-]{32,36}[}]?$/i.test(ref) ? (await gql(`query($id:ID!){ item(where:{ itemId:$id, database:"master" }){ itemId name path template{ name } } }`, { id: ref }))?.item : await get(ref);
  if (!t && /\/Branches\//i.test(ref) && P.projectTemplatesRoot) t = await get(`${P.projectTemplatesRoot}/Components/${ref.split("/").pop()}`);
  return t;
};
const childTemplate = async (t) => {
  const sv = await get(`${t.path}/__Standard Values`);
  const first = fv(sv, "__Masters").split("|").filter(Boolean).find((id) => guid(id) !== guid(t.itemId));
  if (first) return first;
  const folder = t.path.slice(0, t.path.lastIndexOf("/"));
  for (const n of [`${t.name} Item`, t.name.replace(/ies$/, "y").replace(/s$/, "")].filter((n) => n !== t.name)) { const c = await get(`${folder}/${n}`); if (c) return c.itemId; }
  return null;
};

// every variant the code exports gets a Headless Variant definition (a container named like the rendering item, one empty Variant
// Definition per variant), so it can be selected on a page: here, and in Pages
const VARIANTS_FOLDER = "{49C111D0-6867-4798-A724-1F103166E6E9}", VARIANT_DEFINITION = "{4D50CDAE-C2D9-4DE8-B080-8F992BFB1B55}";
if (P.headlessVariantsRoot) {
  const vroot = await get(P.headlessVariantsRoot); if (!vroot) die(`${P.headlessVariantsRoot} not found`);
  let added = 0;
  for (const c of manifest.components ?? []) {
    if (!c?.name || CHROME.test(c.name) || !c.rendering?.name || !c.react?.filePath) continue;
    let src = ""; try { src = readFileSync(join(baseApp(), c.react.filePath), "utf8"); } catch { continue; }
    const code = [...src.matchAll(/^export\s+(?:const|function)\s+([A-Z]\w*)/gm)].map((m) => m[1]);
    if (!code.length) continue;
    const cpath = `${P.headlessVariantsRoot}/${c.rendering.name}`;
    const container = (await get(cpath)) ?? (await create(c.rendering.name, VARIANTS_FOLDER, vroot.itemId));
    const have = new Set(((container.itemId ? await get(cpath) : null)?.children?.nodes ?? []).map((v) => v.name));
    for (const v of code.filter((v) => !have.has(v))) { if (apply) await create(v, VARIANT_DEFINITION, container.itemId); else console.log(`  + would define ${c.rendering.name} / ${v}`); added++; }
    if (apply && code.some((v) => !have.has(v))) {
      const back = new Set(((await get(cpath))?.children?.nodes ?? []).map((v) => v.name));
      const missing = code.filter((v) => !back.has(v)); if (missing.length) die(`${cpath}: read back without ${missing.join(", ")}`);
    }
  }
  console.log(`${added} variant definition(s) ${apply ? "created and read back" : "to create"} under ${P.headlessVariantsRoot}`);
}

const plan = [];
for (const c of manifest.components ?? []) {
  if (!c?.name || CHROME.test(c.name) || !c.rendering?.itemId) continue;
  const r = await rendering(c.rendering.itemId); if (!r) { console.log(`- ${c.name}: rendering not found, skipped`); continue; }
  const ds = await templateItem(fv(r, "Datasource Template"));
  if (!ds) { console.log(`- ${c.name}: no datasource template (reads the page), not placed`); continue; }
  const src = (() => { try { return readFileSync(join(baseApp(), c.react.filePath), "utf8"); } catch { return ""; } })();
  // a list component: its code loops over something and its template has a child item template (insert options or "<name> Item")
  const list = /\.map\(|\.forEach\(/.test(src) && !!(await childTemplate(ds));
  // the variants that can be selected are the Headless Variant definitions in Sitecore (read live; the manifest can be behind)
  // the container carries the rendering ITEM name (the manifest can point at an older, misnamed one)
  const container = (P.headlessVariantsRoot && c.rendering?.name ? await get(`${P.headlessVariantsRoot}/${c.rendering.name}`) : null)
    ?? (c.headlessVariants?.containerPath ? await get(c.headlessVariants.containerPath) : null);
  const variants = container ? container.children.nodes.map((v) => ({ name: v.name, itemId: v.itemId })) : (c.headlessVariants?.variants ?? []).filter((v) => v.itemId);
  plan.push({ c, renderingId: r.itemId, ds, list, variants: variants.length ? variants : [{ name: "Default", itemId: null }] });
}
console.log(`${plan.length} component page(s) under ${ROOT_PAGE}${apply ? "" : " (dry run: add --apply to write)"}`);

const root = await ensure(ROOT_PAGE, "components", PAGE_TEMPLATE, home.itemId, [{ name: "Title", value: "Components" }, ...(NAV_FILTER ? [{ name: "NavigationFilter", value: NAV_FILTER }] : [])]);
const done = [];
for (const p of plan) {
  const slug = kebab(p.c.name), pagePath = `${ROOT_PAGE}/${slug}`;
  console.log(`${p.c.name} → /components/${slug} (${p.variants.map((v) => v.name).join(", ")})`);
  const page = await ensure(pagePath, slug, PAGE_TEMPLATE, root.itemId, [{ name: "Title", value: p.c.name }, ...(NAV_FILTER ? [{ name: "NavigationFilter", value: NAV_FILTER }] : [])]);
  if (!apply) continue;
  const data = await ensure(`${pagePath}/Data`, "Data", DATA_TEMPLATE, page.itemId);
  const dsItem = await ensure(`${pagePath}/Data/${p.c.name}`, p.c.name, p.ds.itemId, data.itemId);
  const ct = p.list ? await childTemplate(p.ds) : null;
  if (p.list) {   // a list needs items to show: three on the child template's sample content
    const have = (await get(dsItem.path ?? `${pagePath}/Data/${p.c.name}`))?.children?.nodes ?? [];
    if (ct) for (let i = have.length + 1; i <= 3; i++) await create(`Item ${i}`, ct, dsItem.itemId);
    else console.log(`  ! ${p.c.name}: no child item template found; the list stays empty`);
  }
  // the templates' sample images are empty or broken: every Image field gets one picture the base site already uses, so a screenshot
  // shows where a component puts its images
  if (SAMPLE_IMAGE) {
    const dsImages = await imageFields(p.ds.itemId), childImages = ct ? await imageFields(ct) : [];
    if (dsImages.length) await update(dsItem.itemId, dsImages.map((name) => ({ name, value: SAMPLE_IMAGE })));
    if (childImages.length) for (const ch of (await get(`${pagePath}/Data/${p.c.name}`))?.children?.nodes ?? []) await update(ch.itemId, childImages.map((name) => ({ name, value: SAMPLE_IMAGE })));
  }
  // one rendering per variant, in order, all on the same sample item
  let prev = null, n = 0;
  const rs = p.variants.map((v) => {
    const uid = `{${randomUUID().toUpperCase()}}`; n++;
    const par = `${v.itemId ? `FieldNames=${encodeURIComponent(guid(v.itemId))}&` : ""}DynamicPlaceholderId=${n}`;
    const order = prev ? `p:after="r[@uid='${prev}']"` : `p:before="*"`; prev = uid;
    return `<r uid="${uid}" ${order} s:ds="local:/Data/${xmlAttr(p.c.name)}" s:id="${guid(p.renderingId)}" s:par="${xmlAttr(par)}" s:ph="${xmlAttr(PH)}" />`;
  });
  await update(page.itemId, [{ name: "__Renderings", value: `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}">${rs.join("")}</d></r>` }]);
  const back = await get(pagePath);
  const placed = (fv(back, "__Renderings").match(/<r uid=/g) ?? []).length;
  if (placed !== p.variants.length) die(`${pagePath}: read back ${placed} rendering(s), wrote ${p.variants.length}`);
  done.push(slug);
}
if (apply) console.log(`✔ ${done.length} component page(s) written and read back under ${ROOT_PAGE}. Next: node harness/scripts/component-catalog.mjs (with the base app running).`);
