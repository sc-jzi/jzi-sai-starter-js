import { ENV } from "file:///C:/Projects/Demo/Harness/harness/scripts/_lib.mjs";
const id = ENV.SITECORE_AUTOMATION_CLIENT_ID, secret = ENV.SITECORE_AUTOMATION_CLIENT_SECRET;
const tr = await fetch(`${ENV.SITECORE_AUTH_HOST}/oauth/token`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ client_id: id, client_secret: secret, grant_type: "client_credentials", audience: "https://api.sitecorecloud.io" }) });
const jwt = (await tr.json()).access_token;
const envId = ENV.SITECORE_ENVIRONMENT_ID;
const r = await fetch(`https://xmclouddeploy-api.sitecorecloud.io/api/environments/v2/${envId}`, { headers: { Authorization: `Bearer ${jwt}` } });
const j = await r.json();
console.log("host", j.host);
console.log("name", j.name);
console.log("status", j.provisioningStatus);
const eh = j.editingHostEnvironmentDetails;
console.log("editing keys", eh && typeof eh === "object" ? Object.keys(eh).join(",") : typeof eh);
if (eh && typeof eh === "object") {
  const walk = (o, p) => {
    if (!o || typeof o !== "object") return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === "string" && /host|url|name/i.test(k)) console.log(p + k, v);
      else if (v && typeof v === "object") walk(v, p + k + ".");
    }
  };
  walk(eh, "");
}
