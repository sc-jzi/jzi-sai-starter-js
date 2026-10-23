import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const gql = async (query, variables) => {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query, variables }) });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors).slice(0, 500));
  return j.data;
};
const fields = await gql(`{ __type(name:"PublishingStatus") { fields { name } } }`);
console.log("fields", fields.__type.fields.map(f => f.name).join(","));
const pub = await gql(`mutation { publishItem(input:{ rootItemPath:"/sitecore/content/AMPP/AMPP Demo", languages:["en"], sourceDatabase:"master", targetDatabases:"experienceedge", publishSubItems:true, publishRelatedItems:true, publishItemMode:SMART }) { operationId } }`);
console.log("op", pub.publishItem.operationId);
