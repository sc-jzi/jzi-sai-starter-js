#!/usr/bin/env node
/**
 * The base app's component reference: what each component is for, the Sitecore items behind it (rendering, datasource template and its
 * fields, child items of list components, rendering parameters), what it can show (images, links, rich text, video, a list) and what each
 * variant looks like on the base site. Generated, never edited by hand: re-run it when the base app or its site changes.
 *
 *   node harness/scripts/component-catalog.mjs [--base http://localhost:3000] [--no-shots]
 *
 * Reads: the base app's code (src/components), docs/ai/manifests/sitecore-manifest.yaml (rendering ids, Headless Variants),
 * docs/ai/catalog/component-registry.yaml (purpose), Sitecore over Authoring GraphQL (templates, fields), the base site over the app's
 * content endpoint (which page uses which component and variant). Screenshots need the base app running (npm run dev in the base app).
 * Writes, in the base app's docs/ai/catalog/: components.md (for people and agents), components.json (for scripts), components/*.png.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { die, parseArgs, baseApp, BASE_APP, readRegistry, authoringClient, rootRel } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const { flags } = parseArgs(process.argv.slice(2));
const base = String(flags.base && flags.base !== true ? flags.base : "http://localhost:3000").replace(/\/$/, "");
const app = baseApp(), catalog = join(app, "docs", "ai", "catalog"), shotDir = join(catalog, "components");
const manifest = parseYaml(readFileSync(join(app, "docs", "ai", "manifests", "sitecore-manifest.yaml"), "utf8"));
const registry = new Map([...readRegistry(BASE_APP).values()].map((e) => [e.name, e]));
// not sections: they come from the Header/Footer partial designs or the page type (component-registry.yaml says the same)
const CHROME = /^(Header|Footer|SiteFooter|Navigation|NavigationHeader|Eyebrow|Breadcrumb|ColumnSplitter|PageBackground|PartialDesignDynamicPlaceholder|SiteTheme|ThemeSwitcher|LanguageSwitcher)$/;
const STANDARD_TEMPLATE = "1930BBEB7805471AA3BE4858AC7CF696";
const TEMPLATES_ROOT = manifest.project?.projectTemplatesRoot ?? null;
const G = (id) => String(id ?? "").replace(/[{}-]/g, "").toUpperCase();
const kebab = (n) => String(n).replace(/([a-z0-9])([A-Z])/g, "$1-$2").replace(/([A-Z])([A-Z][a-z])/g, "$1-$2").toLowerCase();

const components = (manifest.components ?? []).filter((c) => c?.name && c?.react?.filePath && !CHROME.test(c.name));

/* ---- code: variants (named exports) and the field types the component reads ---- */
const FIELD_TYPE = /(\w+)\??\s*:\s*(ImageField|NextImageField|LinkField|RichTextField|TextField|Field<string>|Field<number>|Field<boolean>|Field<[^>]+>)/g;
const codeOf = (c) => {
  const p = join(app, c.react.filePath); if (!existsSync(p)) return { missing: true, variants: [], fields: [], video: false };
  const src = readFileSync(p, "utf8");
  const variants = [...src.matchAll(/^export\s+(?:const|function)\s+([A-Z]\w*)/gm)].map((m) => m[1]);
  const fields = [...new Map([...src.matchAll(FIELD_TYPE)].map((m) => [m[1], m[2]])).entries()].map(([name, type]) => ({ name, type }));
  return { src, variants, fields, video: /<video\b|<iframe\b|youtube|vimeo|ReactPlayer/i.test(src) };
};

/* ---- Sitecore: rendering item, datasource template fields (with base templates), child item templates, rendering parameters ---- */
let gql = null; try { gql = await authoringClient(); } catch (e) { console.log(`! no Authoring GraphQL (${e.message.slice(0, 80)}): templates and fields are left out`); }
const itemCache = new Map();
const item = async (where) => {
  const k = JSON.stringify(where); if (itemCache.has(k)) return itemCache.get(k);
  const arg = where.id ? `itemId:${JSON.stringify(where.id)}` : `path:${JSON.stringify(where.path)}`;
  const r = await gql(`query { item(where:{ ${arg}, database:"master" }) { itemId name path template { name templateId } fields(ownFields:false){ nodes{ name value } }
    children { nodes { itemId name template { name templateId } field(name:"Type"){ value } children { nodes { name template { name } field(name:"Type"){ value } } } } } } }`).catch(() => null);
  const it = r?.item ?? null; itemCache.set(k, it); return it;
};
const fieldVal = (it, name) => it?.fields?.nodes?.find((f) => f.name === name)?.value ?? "";
// a datasource template can be a branch: its first child is an item of the real template
const resolveTemplate = async (ref) => {
  if (!ref) return null;
  let t = await item(/^[{]?[0-9a-f-]{32,36}[}]?$/i.test(ref) ? { id: ref } : { path: ref });
  if (t && /\/Branches\//i.test(t.path)) { const first = t.children?.nodes?.[0]; t = first ? await item({ id: first.template.templateId }) : null; }
  // a branch that does not exist in this environment: the project's component template of the same name
  if (!t && /\/Branches\//i.test(ref) && TEMPLATES_ROOT) t = await item({ path: `${TEMPLATES_ROOT}/Components/${String(ref).split("/").pop()}` });
  return t && t.template?.name === "Template" ? t : null;
};
const singular = (n) => String(n).replace(/ies$/, "y").replace(/s$/, "");
const templateFields = async (t, seen = new Set()) => {
  if (!t || seen.has(G(t.itemId))) return []; seen.add(G(t.itemId));
  const own = (t.children?.nodes ?? []).filter((s) => s.template?.name === "Template section")
    .flatMap((s) => (s.children?.nodes ?? []).filter((f) => f.template?.name === "Template field").map((f) => ({ name: f.name, type: f.field?.value || "?", section: s.name, from: t.name })));
  const bases = fieldVal(t, "__Base template").split("|").map(G).filter((id) => id && id !== STANDARD_TEMPLATE);
  const inherited = [];
  for (const b of bases) inherited.push(...(await templateFields(await item({ id: `{${b.replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")}}` }), seen)));
  return [...own, ...inherited.filter((f) => !own.some((o) => o.name === f.name))];
};
// the items a list holds: the insert options on the template's standard values; for a component whose code loops over child items and
// whose template has none, the sibling template named "<name> Item" or the singular name (Carousel Item, Question, Testimonial)
const childTemplates = async (t, listByCode) => {
  const sv = (t?.children?.nodes ?? []).find((c) => c.name === "__Standard Values");
  const ids = sv ? fieldVal(await item({ id: sv.itemId }), "__Masters").split("|").filter(Boolean) : [];
  const out = [];
  for (const id of ids) { const ct = await resolveTemplate(id); if (ct && G(ct.itemId) !== G(t.itemId)) out.push({ name: ct.name, path: ct.path, id: ct.itemId, fields: await templateFields(ct) }); }
  if (!out.length && listByCode) {
    const folder = t.path.slice(0, t.path.lastIndexOf("/"));
    for (const n of [`${t.name} Item`, singular(t.name)].filter((n) => n !== t.name)) {
      const ct = await item({ path: `${folder}/${n}` });
      if (ct?.template?.name === "Template") { out.push({ name: ct.name, path: ct.path, id: ct.itemId, fields: await templateFields(ct) }); break; }
    }
  }
  return out;
};
const sitecoreOf = async (c, listByCode) => {
  if (!gql || !c.rendering?.itemId) return null;
  const r = await item({ id: c.rendering.itemId }); if (!r) return { renderingMissing: true };
  const dsRef = fieldVal(r, "Datasource Template"), ds = await resolveTemplate(dsRef);
  const params = await resolveTemplate(fieldVal(r, "Parameters Template"));
  const paramFields = params ? (await templateFields(params)).filter((f) => !/^(Styles|GridParameters|FieldNames|DynamicPlaceholderId|RenderingIdentifier|CSSStyles|Placeholder|Caching|Personalization)$/i.test(f.name) && !/Standard Rendering Parameters|Base Rendering Parameters|Grid/i.test(f.from)) : [];
  return {
    rendering: { path: r.path, id: r.itemId, datasourceLocation: fieldVal(r, "Datasource Location"), componentQuery: Boolean(fieldVal(r, "ComponentQuery").trim()) },
    datasource: ds ? { name: ds.name, path: ds.path, id: ds.itemId, fields: await templateFields(ds) } : null,
    datasourceRef: dsRef, children: ds ? await childTemplates(ds, listByCode) : [], params: paramFields.map((f) => f.name),
  };
};

/* ---- the base site: which page uses which component and variant ---- */
// the base app's own content endpoint (its .env.local): the base app is not a customer, so edgeRoute() (customer apps only) is not used
const env = (() => { try { return Object.fromEntries(readFileSync(join(app, ".env.local"), "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).trim().replace(/^["']|["']$/g, "")])); } catch { return {}; } })();
const edgeCtx = env.SITECORE_EDGE_CONTEXT_ID || env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID, edgeSite = env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
const layoutOf = async (route) => {
  if (!edgeCtx || !edgeSite) return null;
  const r = await fetch(`https://edge-platform.sitecorecloud.io/v1/content/api/graphql/v1?sitecoreContextId=${encodeURIComponent(edgeCtx)}`, { method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(30000),
    body: JSON.stringify({ query: `{ layout(site: ${JSON.stringify(edgeSite)}, routePath: ${JSON.stringify(route)}, language: ${JSON.stringify(env.NEXT_PUBLIC_DEFAULT_LANGUAGE || "en")}) { item { rendered } } }` }) });
  return r.ok ? (await r.json())?.data?.layout?.item?.rendered?.sitecore?.route ?? null : null;
};
if (!edgeCtx || !edgeSite) console.log(`! ${rootRel(app)}/.env.local has no content context id or site name: no usage and no screenshots`);
// Headless Variant definitions, read live: the container carries the rendering ITEM name (the manifest can be behind or point at an older,
// misnamed container, which is used only when the right one does not exist)
const variantName = new Map();   // Headless Variant item id -> variant name
const definitions = new Map();   // component -> defined variant names
for (const c of components) {
  const root = manifest.project?.headlessVariantsRoot;
  const live = gql && root && c.rendering?.name ? (await item({ path: `${root}/${c.rendering.name}` })) ?? (c.headlessVariants?.containerPath ? await item({ path: c.headlessVariants.containerPath }) : null) : null;
  const defs = live ? live.children.nodes.map((v) => ({ name: v.name, itemId: v.itemId })) : (c.headlessVariants?.variants ?? []);
  definitions.set(c.name, defs.map((v) => v.name));
  for (const v of defs) variantName.set(G(v.itemId), v.name);
}
const usage = new Map();   // component -> [{ route, variant, nth }]
if (gql) {
  const site = manifest.project ?? {};
  const root = `/sitecore/content/${site.siteCollection}/${site.siteName}`;
  if (!site.siteCollection || !site.siteName) die("sitecore-manifest.yaml has no project.siteCollection / project.siteName");
  const pages = [];
  const walk = async (path, route, depth) => {
    const it = await item({ path }); if (!it) return;
    pages.push(route);
    if (depth >= 3 || pages.length > 250) return;
    for (const ch of it.children?.nodes ?? []) if (!/^(Data|__Standard Values)$/i.test(ch.name) && !/folder/i.test(ch.template?.name ?? "")) await walk(`${path}/${ch.name}`, `${route === "/" ? "" : route}/${ch.name}`, depth + 1);
  };
  await walk(`${root}/Home`, "/", 0);
  for (let i = 0; i < pages.length; i += 6) {
    const batch = pages.slice(i, i + 6);
    const layouts = await Promise.all(batch.map((r) => layoutOf(r).catch(() => null)));
    batch.forEach((route, k) => {
      const lay = layouts[k]; if (!lay) return;
      const seen = new Map();
      const visit = (list) => { for (const comp of list ?? []) {
        const n = comp.componentName; if (n) {
          const nth = (seen.get(n) ?? 0); seen.set(n, nth + 1);
          const v = variantName.get(G(comp.params?.FieldNames)) ?? (comp.params?.FieldNames ? String(comp.params.FieldNames) : "Default");
          if (!usage.has(n)) usage.set(n, []); usage.get(n).push({ route, variant: v, nth });
        }
        for (const sub of Object.values(comp.placeholders ?? {})) visit(sub);
      } };
      for (const ph of Object.values(lay.placeholders ?? {})) visit(ph);
    });
  }
  console.log(`base site: ${pages.length} item(s) read, ${[...usage.values()].reduce((s, u) => s + u.length, 0)} placed component(s)`);
}

/* ---- screenshots: one per component and variant, from the first page that shows it ---- */
const shots = new Map();   // `${name}|${variant}` -> file
let imagesGreyed = 0;
if (!flags["no-shots"] && usage.size) {
  let chromium; try { ({ chromium } = await import("playwright")); } catch { die("Playwright is not installed: run node harness/scripts/deps-check.mjs --fix"); }
  const up = await fetch(base + "/").then((r) => r.status).catch(() => 0);
  if (up !== 200) console.log(`! ${base}/ answers ${up || "nothing"}: start the base app (npm run dev in ${rootRel(app)}) for screenshots; writing the reference without them`);
  else {
    mkdirSync(shotDir, { recursive: true });
    for (const f of readdirSync(shotDir)) if (f.endsWith(".png")) unlinkSync(join(shotDir, f));   // every run starts from the current base site
    const browser = await chromium.launch(), page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    // an image the environment cannot serve (the base site's media host may answer 404) is drawn as a plain grey box, so the screenshot
    // shows where the component puts its images instead of a broken-image icon
    const GREY = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGO4cO4CAAVqAq0NLkaFAAAAAElFTkSuQmCC", "base64");
    let greyed = 0;
    await page.route("**/*", async (route) => {
      if (route.request().resourceType() !== "image") return route.continue();
      const res = await route.fetch().catch(() => null);
      if (res && res.status() < 400) return route.fulfill({ response: res });
      greyed++; return route.fulfill({ status: 200, contentType: "image/png", body: GREY });
    });
    const want = [];
    // the showcase pages (/components/..., component-showcase.mjs) show each component alone on sample content: prefer them
    const showcaseFirst = (list) => [...list].sort((a, b) => Number(!a.route.startsWith("/components/")) - Number(!b.route.startsWith("/components/")));
    for (const c of components) { const done = new Set(); for (const u of showcaseFirst(usage.get(c.name) ?? [])) if (!done.has(u.variant)) { done.add(u.variant); want.push({ c, ...u }); } }
    want.sort((a, b) => a.route.localeCompare(b.route));   // one page load per route
    let current = null;
    for (const w of want) {
      try {
        if (current !== w.route) { await page.goto(base + w.route, { waitUntil: "networkidle", timeout: 60000 }); current = w.route; await page.waitForTimeout(800); }
        const k = kebab(w.c.react.componentMapKey ?? w.c.name);
        const els = await page.$$(`[class~="component"][class~="${k}"], [class~="${k}"]`);
        const el = els.filter((e, i) => els.indexOf(e) === i)[w.nth] ?? els[0];
        if (!el) continue;
        await el.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
        const box = await el.boundingBox(); if (!box || box.height < 10) continue;
        const file = `${w.c.name}--${w.variant}.png`.replace(/[^A-Za-z0-9.-]+/g, "-");
        await el.screenshot({ path: join(shotDir, file), animations: "disabled" });
        shots.set(`${w.c.name}|${w.variant}`, { file, route: w.route });
      } catch (e) { console.log(`  ! ${w.c.name} ${w.variant} on ${w.route}: ${e.message.split("\n")[0].slice(0, 100)}`); }
    }
    await browser.close();
    imagesGreyed = greyed;
    if (greyed) console.log(`  ${greyed} image request(s) failed in this environment: drawn as grey boxes`);
  }
}

/* ---- write ---- */
const rows = [];
for (const c of components) {
  const code = codeOf(c), reg = registry.get(c.name);
  const sc = await sitecoreOf(c, reg?.kind === "list" || /\.items\??\.(map|forEach)\(|children\??\.(map|forEach)\(/.test(code.src ?? ""));
  const dsFields = sc?.datasource?.fields ?? [], childFields = (sc?.children ?? []).flatMap((t) => t.fields);
  // what the code renders counts, not what the template could hold: a template field the code never reads shows nothing
  const readByCode = (f) => new RegExp(`\\b${f.name.replace(/[^\w]/g, "")}\\b`).test(code.src ?? "");
  const notRendered = [...new Set([...dsFields, ...childFields].filter((f) => !readByCode(f)).map((f) => f.name))];
  const types = [...dsFields, ...childFields].filter(readByCode).map((f) => f.type);
  const count = (re) => types.filter((t) => re.test(t)).length;
  const kind = sc?.datasource ? ((sc.children ?? []).length || sc.rendering?.componentQuery ? "list" : "simple") : c.kind === "context-only" || !sc ? "context" : "simple";
  rows.push({
    name: c.name, id: reg?.id ?? null, category: reg?.category ?? c.category ?? "", purpose: (reg?.visualKeywords ?? []).join("; "), file: c.react.filePath, kind,
    variants: code.variants, variantDefinitions: definitions.get(c.name) ?? [],
    rendering: sc?.rendering ?? (c.rendering ? { path: c.rendering.path, id: c.rendering.itemId } : null),
    datasource: sc?.datasource ? { name: sc.datasource.name, path: sc.datasource.path, id: sc.datasource.id } : null,
    fields: dsFields, children: (sc?.children ?? []).map((t) => ({ name: t.name, path: t.path, id: t.id, fields: t.fields })), params: sc?.params ?? [],
    codeFields: code.fields, notRendered,
    canShow: { images: count(/^Image$/i), links: count(/General Link|^Link$/i), richText: count(/Rich Text/i), video: code.video, listOfItems: kind === "list" },
    usedOn: [...new Set((usage.get(c.name) ?? []).map((u) => u.route).filter((r) => !r.startsWith("/components")))].slice(0, 5),
    shots: code.variants.map((v) => ({ variant: v, ...(shots.get(`${c.name}|${v}`) ?? {}) })),
    notes: c.notes ?? [],
  });
}
rows.sort((a, b) => (a.category || "~").localeCompare(b.category || "~") || a.name.localeCompare(b.name));
writeFileSync(join(catalog, "components.json"), JSON.stringify({ generatedAt: new Date().toISOString(), components: rows }, null, 2) + "\n");

const yes = (b) => (b ? "yes" : "no");
const md = [`# ${BASE_APP} components: what each one is, holds and looks like`, "",
  `Generated by \`node harness/scripts/component-catalog.mjs\` on ${new Date().toISOString().slice(0, 10)} from the code, Sitecore and the base site. Do not edit by hand: re-run it.`,
  "Use it to choose (or swap, R1) the component for a section: a section with pictures needs Image fields, a video needs a component that plays one, several cards need a list.", "",
  "| Component | Category | Kind | Images | Links | Rich text | Video | Variants (screenshot) |", "|---|---|---|---|---|---|---|---|",
  ...rows.map((r) => `| [${r.name}](#${r.name.toLowerCase()}) | ${r.category} | ${r.kind} | ${r.canShow.images} | ${r.canShow.links} | ${r.canShow.richText} | ${yes(r.canShow.video)} | ${r.shots.map((s) => (s.file ? `${s.variant} ✓` : s.variant)).join(", ")} |`),
  "", "Kind: **simple** = one datasource item · **list** = a datasource item with child items · **context** = reads the page (no datasource).",
  "Screenshots come from the showcase pages under `/components/` (`component-showcase.mjs`: each component alone, on its template's sample text) where one exists, else from the first base-site page that uses the component and variant." +
  (imagesGreyed ? " **Grey boxes are images**: the base site's media host did not serve them when the screenshots were taken." : ""), ""];
for (const r of rows) {
  md.push(`## ${r.name}`, "", r.purpose ? `${r.purpose[0].toUpperCase()}${r.purpose.slice(1)}.` : "", "");
  md.push("| | |", "|---|---|", `| Kind | ${r.kind}${r.id ? ` (registry id \`${r.id}\`)` : ""} |`, `| Code | \`${r.file}\` |`);
  if (r.rendering) md.push(`| Rendering | \`${r.rendering.path}\` \`${r.rendering.id}\` |`);
  md.push(`| Datasource template | ${r.datasource ? `\`${r.datasource.path}\` \`${r.datasource.id}\`` : "none (reads the page or its children)"} |`);
  if (r.rendering?.datasourceLocation) md.push(`| Datasource location | ${r.rendering.datasourceLocation.split("|").map((q) => `\`${q}\``).join(" or ")} |`);
  md.push(`| Can show | ${r.canShow.images} image field(s), ${r.canShow.links} link field(s), ${r.canShow.richText} rich text field(s)${r.canShow.video ? ", video" : ""}${r.canShow.listOfItems ? ", a list of child items" : ""} |`);
  if (r.usedOn.length) md.push(`| On the base site | ${r.usedOn.map((u) => `\`${u}\``).join(", ")} |`);
  md.push("");
  if (r.fields.length) md.push("**Fields**", "", "| Field | Type | From |", "|---|---|---|", ...r.fields.map((f) => `| ${f.name} | ${f.type} | ${f.from}${f.section ? ` / ${f.section}` : ""} |`), "");
  else if (r.codeFields.length) md.push(`**Fields read by the code** (no datasource template): ${r.codeFields.map((f) => `${f.name} (${f.type})`).join(", ")}`, "");
  for (const ch of r.children) md.push(`**Child items: ${ch.name}** (\`${ch.path}\`)`, "", "| Field | Type |", "|---|---|", ...ch.fields.map((f) => `| ${f.name} | ${f.type} |`), "");
  if (r.notRendered.length) md.push(`**Template fields the code does not render** (filling them shows nothing): ${r.notRendered.join(", ")}`, "");
  if (r.params.length) md.push(`**Rendering parameters** (layout options, never visitor text): ${r.params.join(", ")}`, "");
  const noDef = r.variants.filter((v) => !r.variantDefinitions.includes(v)), noCode = r.variantDefinitions.filter((v) => !r.variants.includes(v));
  md.push("**Variants**", "");
  for (const s of r.shots) md.push(s.file ? `*${s.variant}* (from \`${s.route}\`)\n\n![${r.name} ${s.variant}](components/${s.file})\n` : `*${s.variant}*: not placed on the base site, no screenshot\n`);
  if (noDef.length) md.push(`Code variants without a Headless Variant definition in Sitecore: ${noDef.join(", ")}.`, "");
  if (noCode.length) md.push(`Headless Variant definitions without code: ${noCode.join(", ")}.`, "");
  if (r.notes.length) md.push(`Notes: ${r.notes.join(" ")}`, "");
}
writeFileSync(join(catalog, "components.md"), md.join("\n") + "\n");
const withShots = rows.reduce((s, r) => s + r.shots.filter((x) => x.file).length, 0), allVariants = rows.reduce((s, r) => s + r.shots.length, 0);
console.log(`✔ ${rootRel(join(catalog, "components.md"))}: ${rows.length} component(s), ${withShots} of ${allVariants} variant(s) with a screenshot; components.json written`);
