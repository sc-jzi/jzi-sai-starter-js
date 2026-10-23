import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync("c:/Projects/Demo/Harness/industry-verticals/ampp/.env.local","utf8").split(/\r?\n/).filter(l => l && !l.startsWith("#") && l.includes("=")).map(l => { const i = l.indexOf("="); return [l.slice(0,i).trim(), l.slice(i+1).trim()]; }));
const host = (env.NEXT_PUBLIC_SITECORE_EDGE_PLATFORM_HOSTNAME || "https://edge-platform.sitecorecloud.io").replace(/\/+$/, "");
const ctx = env.SITECORE_EDGE_CONTEXT_ID || env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID;
const site = env.NEXT_PUBLIC_DEFAULT_SITE_NAME;
async function count(route) {
  const query = `query { layout(site: "${site}", routePath: "${route}", language: "en") { item { rendered } } }`;
  const r = await fetch(`${host}/v1/content/api/graphql/v1`, { method: "POST", headers: { "Content-Type": "application/json", "x-sitecore-contextid": ctx }, body: JSON.stringify({ query }) });
  const j = await r.json();
  const rendered = j.data?.layout?.item?.rendered;
  const text = JSON.stringify(rendered || {});
  const names = [...text.matchAll(/"componentName":"([^"]+)"/g)].map(m => m[1]);
  console.log(route, rendered ? names.join(",") : "NO ROUTE");
}
for (const route of ["/", "/education", "/membership", "/events"]) await count(route);
