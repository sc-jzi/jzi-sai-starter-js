import { readFileSync } from "node:fs";
import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const url = `${String(ENV.SITECORE_CM_HOST).replace(/\/+$/, "")}/sitecore/api/authoring/graphql/v1/`;
const r = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` }, body: JSON.stringify({ query: `query { item(where:{ path:"/sitecore/content/AMPP/AMPP Demo/Settings/Site Grouping/AMPP Demo", database:"master", language:"en" }) { fields(ownFields:false) { nodes { name value } } } }` }) });
const j = await r.json();
for (const f of j.data.item.fields.nodes) if (f.value && /site|host|start|root|language|name|target/i.test(f.name)) console.log(f.name, String(f.value).slice(0, 200));

const env = Object.fromEntries(readFileSync("c:/Projects/Demo/Harness/industry-verticals/ampp/.env.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i), l.slice(i+1)]; }));
const host = (env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME || env.SITECORE_EDGE_PLATFORM_HOSTNAME || "https://edge-platform.sitecorecloud.io").replace(/\/+$/, "");
const ctx = env.SITECORE_EDGE_CONTEXT_ID || env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
console.log("edge host set", !!host, "ctx set", !!ctx, "site", env.NEXT_PUBLIC_DEFAULT_SITE_NAME);
const layout = `${host}/layout/render/jss?item=/&sc_lang=en&sc_site=${encodeURIComponent(env.NEXT_PUBLIC_DEFAULT_SITE_NAME || "AMPP Demo")}&sc_apikey=${encodeURIComponent(ctx)}`;
const lr = await fetch(layout);
const text = await lr.text();
console.log("layout", lr.status, text.slice(0, 400));
