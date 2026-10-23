import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const op = "ce2a971f-9423-4cec-a566-45eef10e00e6;sitecoresaa3a91-jziscaiverte9ee-dev06a5-6d666d9f9c-dwk5g";
for (let i = 0; i < 40; i++) {
  const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query: `query($id:String!){ publishingStatus(publishingOperationId:$id) { isDone isFailed state processed } }`, variables: { id: op } }) });
  const j = await r.json();
  const s = j.data?.publishingStatus;
  console.log(i, JSON.stringify(s || j.errors)?.slice(0, 200));
  if (s?.isDone || s?.isFailed) break;
  await new Promise((r) => setTimeout(r, 5000));
}
