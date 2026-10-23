import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 400));
  return j.data;
};
const it = (await gql(`query { item(where:{ path:"/sitecore/content/Financial/ProsperaFinancial/Presentation/Page Designs/Default", database:"master", language:"en" }) { fields(ownFields:false) { nodes { name value } } } }`)).item;
for (const f of it.fields.nodes) if (f.value && /partial|design|template/i.test(f.name)) console.log(f.name, f.value.slice(0, 400));
const map = (await gql(`query { item(where:{ path:"/sitecore/content/Financial/ProsperaFinancial/Presentation/Page Designs", database:"master", language:"en" }) { fields(ownFields:false) { nodes { name value } } } }`)).item;
for (const f of map.fields.nodes) if (f.value && /template|design/i.test(f.name)) console.log("FOLDER", f.name, f.value.slice(0, 500));
