import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error(JSON.stringify(j.errors || j).slice(0, 600));
  return j.data;
};
const Q = `query($path:String!){ item(where:{ path:$path, database:"master", language:"en" }) { itemId name template { name templateId } children { nodes { itemId name template { name templateId } } } } }`;
for (const path of [
  "/sitecore/content/AMPP/AMPP Demo/Presentation/Headless Variants",
  "/sitecore/content/AMPP/AMPP Demo/Presentation/Available Renderings",
  "/sitecore/content/AMPP/AMPP Demo/Presentation/Partial Designs",
  "/sitecore/content/AMPP/AMPP Demo/Presentation/Page Designs",
  "/sitecore/content/AMPP/AMPP Demo/Data/Navigation Filters",
  "/sitecore/content/Financial/ProsperaFinancial/Presentation/Headless Variants/Promo CTA",
]) {
  const it = (await gql(Q, { path })).item;
  console.log("\n==", path.split("/").slice(-2).join("/"), it?.itemId);
  for (const c of it?.children?.nodes ?? []) console.log(" -", c.name, c.template?.name, c.template?.templateId);
}
