import { readFileSync, writeFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { parseYaml } from "file:///C:/Projects/Demo/Harness/harness/scripts/_yaml.mjs";
import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";

const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
const plan = parseYaml(readFileSync(demo + "/demo-plan.yaml", "utf8"));
const manifest = JSON.parse(readFileSync(demo + "/site-manifest.json", "utf8"));
const images = JSON.parse(readFileSync(demo + "/images/image-manifest.json", "utf8"));
const bp = JSON.parse(readFileSync(demo + "/bootstrap-plan.json", "utf8"));

const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const gqlUrl = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(gqlUrl, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(JSON.stringify(j.errors || j).slice(0, 500));
  return j.data;
};
const dash = (g) => { const h = String(g).replace(/[{}-]/g, "").toLowerCase(); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
const brace = (g) => `{${dash(g).toUpperCase()}}`;
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const byPath = async (path) => (await gql(`query($path:String!){ item(where:{ path:$path, database:"master", language:"en" }) { itemId name path version } }`, { path })).item;
const create = async (name, templateId, parent, fields) => (await gql(
  `mutation($name:String!,$templateId:ID!,$parent:ID!,$language:String!,$fields:[FieldValueInput]){ createItem(input:{ name:$name, templateId:$templateId, parent:$parent, language:$language, fields:$fields }){ item { itemId name path } } }`,
  { name, templateId: dash(templateId), parent: dash(parent), language: "en", fields: fields ?? [] }
)).createItem.item;
const ensure = async (path, name, templateId, parent, fields) => {
  const hit = await byPath(path);
  if (hit) return hit;
  return create(name, templateId, parent, fields);
};
const setFields = async (itemId, fields) => {
  const it = (await gql(`query($id:ID!){ item(where:{ itemId:$id, database:"master", language:"en" }) { version } }`, { id: dash(itemId) })).item;
  await gql(`mutation($id:ID!,$ver:Int,$fields:[FieldValueInput]){ updateItem(input:{ itemId:$id, database:"master", language:"en", version:$ver, fields:$fields }){ item { itemId } } }`, { id: dash(itemId), ver: it.version, fields });
};
const setLayout = async (itemId, xml) => setFields(itemId, [{ name: "__Renderings", value: xml }]);

const DEVICE = "{FE5D7FDF-89C0-4D99-9AA3-B5FBD009C9F3}";
const rendering = ({ renderingId, ph, ds, variantId, dyn }) => {
  const par = [variantId ? `FieldNames=${encodeURIComponent(brace(variantId))}` : null, dyn ? `DynamicPlaceholderId=${dyn}` : null].filter(Boolean).join("&").replace(/&/g, "&amp;");
  return `<r uid="{${randomUUID().toUpperCase()}}" s:id="${brace(renderingId)}" s:ph="${ph}"${ds ? ` s:ds="${brace(ds)}"` : ""} s:par="${par}" />`;
};
const layout = (rs) => `<r xmlns:p="p" xmlns:s="s" p:p="1"><d id="${DEVICE}">${rs.join("")}</d></r>`;

const ROOT = "/sitecore/content/AMPP/AMPP Demo";
const compByName = Object.fromEntries(bp.components.map((c) => [c.name, c]));
const COMP = { "promo-cta": "PromoCta", "four-column-cta": "FourColumnCta", "two-column-cta": "TwoColumnCta", "three-column-cta": "ThreeColumnCta", "article-list": "ArticleList", "testimonials": "Testimonials", "heading-cta": "HeadingCta", "features": "Features" };
const TPL = {};
for (const [key, path] of Object.entries({
  promo: "/sitecore/templates/Project/Financial/Components/Promo CTA",
  four: "/sitecore/templates/Project/Financial/Components/Four Column CTA",
  two: "/sitecore/templates/Project/Financial/Components/Two Column CTA",
  three: "/sitecore/templates/Project/Financial/Components/Three Column CTA",
  heading: "/sitecore/templates/Project/Financial/Components/Heading CTA",
  features: "/sitecore/templates/Project/Financial/Components/Features",
  header: "/sitecore/templates/Project/Financial/Components/Header",
  footer: "/sitecore/templates/Project/Financial/Components/Footer",
  partial: null,
})) { if (path) TPL[key] = (await byPath(path)).itemId; }
const T_PARTIAL = dash("fd2059fd60434dfe8c04e2437ce87634");
const T_DESIGN = dash("1105b8f81e00426bbf1fc840742d827b");
const T_PAGE = dash("33f3a00557f64671b7afbfaa3b5a81f4");
const T_DATA = dash("a29d272e9d48453c9e9db47585fa7f20");
const promos = await byPath(ROOT + "/Data/Promos");
const logo = images.find((e) => e.localFileName === "AMPP-logo.png");
const linkXml = (text, href) => `<link text="${esc(text || "Learn more")}" linktype="external" url="${esc(href || "https://ampp.org/")}" anchor="" target="" />`;

const sectionFiles = {};
function sectionOf(file, index) {
  if (!file) return null;
  sectionFiles[file] ??= JSON.parse(readFileSync(demo + "/" + file, "utf8"));
  return (sectionFiles[file].sections || []).find((s) => s.index === index) || null;
}
function plain(section, note) {
  const els = (section?.elements || []).filter((e) => e.text && e.text.trim().length > 1 && !/skip /i.test(e.text));
  const texts = [...new Set(els.map((e) => e.text.trim()))];
  return { texts, heading: texts[0] || note || "", body: texts.slice(1, 4).join(" ") || note || "" };
}
function imageXml(section) {
  const src = section?.images?.[0]?.src || section?.backgroundImages?.[0]?.url || section?.backgroundImages?.[0];
  if (!src) return "";
  const hit = images.find((e) => e.src === src || (e.src && src.startsWith(e.src)));
  return hit?.imageFieldXml || "";
}

const partialParent = (await byPath(ROOT + "/Presentation/Partial Designs")).itemId;
const designParent = (await byPath(ROOT + "/Presentation/Page Designs")).itemId;

const headerPartial = await ensure(ROOT + "/Presentation/Partial Designs/Header", "Header", T_PARTIAL, partialParent);
const headerData = await ensure(headerPartial.path + "/Data", "Data", T_DATA, headerPartial.itemId);
const headerItem = await ensure(headerData.path + "/Header", "Header", TPL.header, headerData.itemId, [{ name: "LogoImage", value: logo.imageFieldXml }]);
if (logo?.imageFieldXml) await setFields(headerItem.itemId, [{ name: "LogoImage", value: logo.imageFieldXml }]);

const footerPartial = await ensure(ROOT + "/Presentation/Partial Designs/Footer", "Footer", T_PARTIAL, partialParent);
const footerData = await ensure(footerPartial.path + "/Data", "Data", T_DATA, footerPartial.itemId);
const footerItem = await ensure(footerData.path + "/Footer", "Footer", TPL.footer, footerData.itemId, [
  { name: "Title1", value: "AMPP" },
  { name: "Copyright", value: "© AMPP" },
  { name: "Image1", value: logo.imageFieldXml },
]);

const eyebrow = manifest.variants.Eyebrow.Ampp;
const headerVar = manifest.variants.Header.Ampp;
const navVar = manifest.variants.Navigation.Ampp;
const footerVar = manifest.variants.Footer.Ampp;
const homeId = dash("ae74f0c6e7a74497b0dffbe4e4bffac0");
await setLayout(headerPartial.itemId, layout([
  rendering({ renderingId: compByName.Eyebrow.renderingId, ph: "headless-header", variantId: eyebrow, dyn: "2" }),
  rendering({ renderingId: "{5558C08C-3DC9-4F6E-B492-F4316C712826}", ph: "/headless-header/eyebrow-left-0-2", dyn: "4" }),
  rendering({ renderingId: "{0F8E13AA-7CBE-4D00-AE30-4F0BC26870F6}", ph: "/headless-header/eyebrow-right-0-2", dyn: "5" }),
  rendering({ renderingId: compByName.Header.renderingId, ph: "headless-header", variantId: headerVar, ds: headerItem.itemId, dyn: "1" }),
  rendering({ renderingId: compByName.Navigation.renderingId, ph: "/headless-header/header-right-0-1", variantId: navVar, ds: homeId, dyn: "3" }),
]));
await setLayout(footerPartial.itemId, layout([
  rendering({ renderingId: compByName.Footer.renderingId, ph: "headless-footer", variantId: footerVar, ds: footerItem.itemId, dyn: "1" }),
]));
console.log("partials", headerPartial.itemId, footerPartial.itemId);

const pageDesign = await ensure(ROOT + "/Presentation/Page Designs/Page", "Page", T_DESIGN, designParent, [
  { name: "PartialDesigns", value: `${brace(headerPartial.itemId)}|${brace(footerPartial.itemId)}` },
]);
await setFields(pageDesign.itemId, [{ name: "PartialDesigns", value: `${brace(headerPartial.itemId)}|${brace(footerPartial.itemId)}` }]);
const configured = await gql(`mutation($site:String!,$template:ID!,$design:ID!){ configurePageDesigns(input:{ siteName:$site, database:"master", mapping:[{ templateId:$template, pageDesignId:$design }] }) { __typename } }`, { site: "AMPP Demo", template: T_PAGE, design: dash(pageDesign.itemId) }).catch((e) => e.message);
console.log("page design", pageDesign.itemId, typeof configured === "string" ? configured : "ok");

const pages = (plan.site?.pages || []).slice().sort((a, b) => a.path.split("/").length - b.path.split("/").length);
const pageIds = { "/Home": homeId };
let n = 0;
for (const page of pages) {
  const parts = page.path.split("/").filter(Boolean);
  const name = parts[parts.length - 1];
  const parentPath = page.path === "/Home" ? ROOT : ROOT + page.path.split("/").slice(0, -1).join("/");
  const parentId = page.path === "/Home" ? (await byPath(ROOT)).itemId : pageIds[page.path.split("/").slice(0, -1).join("/")];
  let item = page.path === "/Home" ? await byPath(ROOT + "/Home") : await ensure(ROOT + page.path, name, T_PAGE, parentId);
  pageIds[page.path] = item.itemId;
  await setFields(item.itemId, [{ name: "__Display name", value: page.displayName || name }, { name: "Title", value: page.displayName || name }]);
  const file = page.sectionsFile || (page.path === "/Home" ? "sections.json" : null);
  const rs = [];
  let dyn = 10;
  for (const section of page.sections || []) {
    const cname = COMP[section.component];
    const comp = compByName[cname];
    if (!comp) { console.log("skip component", section.component); continue; }
    const look = "Ampp" + (section.look || "");
    const variantId = manifest.variants[cname]?.[look] || manifest.variants[cname]?.Ampp || manifest.variants[cname]?.Default;
    const live = sectionOf(file, section.liveSection);
    const copy = plain(live, section.note || page.displayName);
    const img = imageXml(live);
    let ds = null;
    const base = `${page.path.replace(/\//g, "-")}-${section.position}`.replace(/^-/, "");
    if (cname === "PromoCta") {
      ds = await ensure(`${promos.path}/${base}`, base, TPL.promo, promos.itemId, [
        { name: "Title", value: copy.heading },
        { name: "Text", value: copy.body },
        { name: "Image", value: img },
        { name: "Link", value: linkXml(copy.texts.find((t) => t.length < 40) || "Learn more", page.liveUrl || "https://ampp.org/") },
      ]);
    } else if (cname === "HeadingCta") {
      ds = await ensure(`${promos.path}/${base}`, base, TPL.heading, promos.itemId, [
        { name: "Heading", value: page.displayName || copy.heading },
        { name: "Text", value: copy.body },
      ]);
    } else if (cname === "FourColumnCta" || cname === "TwoColumnCta") {
      const count = cname === "FourColumnCta" ? 4 : 2;
      const fields = [];
      for (let i = 1; i <= count; i++) fields.push({ name: `Title${i}`, value: copy.texts[i - 1] || copy.heading }, { name: `Text${i}`, value: copy.texts[i] || "" }, { name: `Image${i}`, value: i === 1 ? img : "" });
      ds = await ensure(`${promos.path}/${base}`, base, cname === "FourColumnCta" ? TPL.four : TPL.two, promos.itemId, fields);
    } else if (cname === "ThreeColumnCta") {
      const fields = [];
      for (let i = 1; i <= 3; i++) fields.push({ name: `Text${i}`, value: copy.texts[i - 1] || copy.heading }, { name: `SubText${i}`, value: copy.texts[i + 2] || "" }, { name: `Image${i}`, value: i === 1 ? img : "" });
      ds = await ensure(`${promos.path}/${base}`, base, TPL.three, promos.itemId, fields);
    } else if (cname === "Features") {
      ds = await ensure(`${promos.path}/${base}`, base, TPL.features, promos.itemId, [
        { name: "Eyebrow", value: copy.heading },
        { name: "Text", value: copy.body },
        { name: "Title1", value: copy.texts[1] || "" },
        { name: "Text1", value: copy.texts[2] || "" },
        { name: "Title2", value: copy.texts[3] || "" },
        { name: "Text2", value: copy.texts[4] || "" },
      ]);
    }
    rs.push(rendering({ renderingId: comp.renderingId, ph: "headless-main", ds: ds?.itemId, variantId, dyn: String(dyn++) }));
  }
  if (page.path !== "/Home" || rs.length) await setLayout(item.itemId, layout(rs));
  n++;
  console.log("page", page.path, rs.length);
}
console.log("pages", n);

try {
  const pub = await gql(`mutation { publishItem(input:{ rootItemPath:"${ROOT}", languages:["en"], sourceDatabase:"master", targetDatabases:"experienceedge", publishSubItems:true, publishRelatedItems:true, publishItemMode:SMART }) { __typename } }`);
  console.log("publish", JSON.stringify(pub).slice(0, 300));
} catch (e) {
  console.log("publish error", e.message);
}
writeFileSync(demo + "/site-manifest.json", JSON.stringify({ ...manifest, partialDesigns: { Header: headerPartial.itemId, Footer: footerPartial.itemId }, pageDesigns: { Page: pageDesign.itemId }, pages: pageIds, updatedAt: new Date().toISOString() }, null, 2));
console.log("done");
