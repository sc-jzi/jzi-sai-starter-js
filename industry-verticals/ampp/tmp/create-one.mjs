import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (!r.ok || j.errors) { console.log(JSON.stringify(j.errors || j).slice(0, 900)); return null; }
  return j.data;
};
const dash = (g) => { const h = g.replace(/[{}-]/g, ""); return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`; };
const parent = dash("16004f416ff944f5bb66bcd8a3e9b2c9");
const template = dash("49c111d068674798a7241f103166e6e9");
const mut = `mutation($name:String!,$templateId:ID!,$parent:ID!,$language:String!){ createItem(input:{ name:$name, templateId:$templateId, parent:$parent, language:$language }){ item { itemId name path } } }`;
const created = await gql(mut, { name: "Promo CTA", templateId: template, parent, language: "en" });
console.log("create", JSON.stringify(created)?.slice(0, 400));
const back = await gql(`query { item(where:{ path:"/sitecore/content/AMPP/AMPP Demo/Presentation/Headless Variants/Promo CTA", database:"master", language:"en" }) { itemId name } }`);
console.log("read", JSON.stringify(back));
