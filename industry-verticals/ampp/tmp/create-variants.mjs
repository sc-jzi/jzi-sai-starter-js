import { readFileSync, writeFileSync } from "node:fs";
import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";

const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(JSON.stringify(j.errors || j).slice(0, 500));
  return j.data;
};
const dash = (g) => { const h = String(g).replace(/[{}-]/g, "").toLowerCase(); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
const HV = dash("16004f416ff944f5bb66bcd8a3e9b2c9");
const T_CONTAINER = dash("49c111d068674798a7241f103166e6e9");
const T_VARIANT = dash("4d50cdaec2d94de8b0808f992bfb1b55");
const plan = JSON.parse(readFileSync("c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp/bootstrap-plan.json", "utf8"));
const byPath = async (path) => (await gql(`query($path:String!){ item(where:{ path:$path, database:"master", language:"en" }) { itemId name children { nodes { itemId name } } } }`, { path })).item;
const create = async (name, templateId, parent) => (await gql(`mutation($name:String!,$templateId:ID!,$parent:ID!,$language:String!){ createItem(input:{ name:$name, templateId:$templateId, parent:$parent, language:$language }){ item { itemId name path } } }`, { name, templateId, parent, language: "en" })).createItem.item;

const variants = {};
const root = "/sitecore/content/AMPP/AMPP Demo/Presentation/Headless Variants";
for (const c of plan.components) {
  const cpath = `${root}/${c.headlessVariantContainer}`;
  let container = await byPath(cpath);
  if (!container) {
    container = await create(c.headlessVariantContainer, T_CONTAINER, HV);
    container.children = { nodes: [] };
    console.log("container", c.headlessVariantContainer, container.itemId);
  } else console.log("reuse", c.headlessVariantContainer);
  variants[c.name] = {};
  const have = new Map((container.children?.nodes ?? []).map((n) => [n.name, n.itemId]));
  for (const v of c.variants) {
    if (have.has(v)) { variants[c.name][v] = have.get(v); continue; }
    const item = await create(v, T_VARIANT, dash(container.itemId));
    variants[c.name][v] = item.itemId;
    console.log("  variant", c.name, v, item.itemId);
  }
}
const manifest = {
  siteRoot: "/sitecore/content/AMPP/AMPP Demo",
  siteId: "bf94e30c-f297-4881-9d07-013bbe0d0841",
  home: "ae74f0c6-e7a7-4497-b0df-fbe4e4bffac0",
  dataRoot: "9c1074e6-57b5-44f9-af36-a7c507932aa6",
  dataFolders: { Promos: "need-lookup" },
  variants,
  updatedAt: new Date().toISOString(),
};
writeFileSync("c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp/site-manifest.json", JSON.stringify(manifest, null, 2));
console.log("wrote site-manifest", Object.keys(variants).length, "components");
