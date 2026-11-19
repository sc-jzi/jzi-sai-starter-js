#!/usr/bin/env node
/**
 * READ-ONLY. The page-local cleanup check (R5): `add_component_on_page` leaves a page-local datasource under `<page>/Data` for every component
 * it places. Once every component points at its item under the site's Data folder, the page `Data` folders are deleted WHOLE, one
 * `delete_content` per folder, all of them after ONE SE confirmation. This script decides whether that is safe and lists what to delete.
 *
 *   node harness/scripts/local-data-check.mjs <customer>
 *
 * Walks every page under /sitecore/content/<collection>/<site>/Home (site.json in the demo folder), lists each page's `Data` folder with its
 * items, and reads EVERY page's `__Final Renderings` and `__Renderings` (standard values included), personalization `<rls>` rule actions
 * included. A reference is LOCAL when it is `local:...`, the id of an item inside any page's Data folder, or a path into one.
 * One line per page; then the Data folder ids to delete (pages whose folder nothing references). Writes local-data-check.json in the demo folder.
 * Exit 0: nothing references page-local data (the folders listed may be deleted). Exit 1: a layout still references one (fix it first:
 * set_component_datasource to the item under <site>/Data; for a personalization rule, its action's DataSource). Exit 2: setup problem.
 */
import { join } from "node:path";
import { die, demoDir, readJson, safeWrite, authoringClient, rootRel } from "./_lib.mjs";

const customer = process.argv[2];
if (!customer || customer.startsWith("--")) die("Usage: local-data-check.mjs <customer>");
const demo = demoDir(customer), site = readJson(join(demo, "site.json"));
if (!site?.collection || !site?.siteName) die(`${rootRel(join(demo, "site.json"))} has no collection/siteName (demo-new-site writes it)`);
let gql = null;
try { gql = await authoringClient(); } catch (e) { die(`Authoring GraphQL: ${e.message}`); }
if (!gql) die("SITECORE_CM_HOST / SITECORE_AUTOMATION_CLIENT_ID / _SECRET missing in harness/.env.local (env-check.mjs)");

const G = (id) => String(id ?? "").replace(/[{}-]/g, "").toUpperCase();
const braced = (id) => { const g = G(id); return g.length === 32 ? `{${g.slice(0, 8)}-${g.slice(8, 12)}-${g.slice(12, 16)}-${g.slice(16, 20)}-${g.slice(20)}}` : String(id); };
const home = `/sitecore/content/${site.collection}/${site.siteName}/Home`;
const NODE = `itemId name path hasChildren(includeHiddenItems:true) fr: field(name:"__Final Renderings"){ value } sr: field(name:"__Renderings"){ value }`;
const node = async (where) => { const byPath = where.startsWith("/"); return (await gql(`query($w:${byPath ? "String" : "ID"}!){ item(where:{${byPath ? "path" : "itemId"}:$w,database:"master",language:"en"}){ ${NODE} children(includeHiddenItems:true){ nodes{ ${NODE} } } } }`, { w: where }))?.item ?? null; };

// 1. every page under Home (and Home itself), and every page's Data folder with all items inside it
const pages = [], folders = new Map();   // page path -> { id, path, items: [{ id, path }] }
const queue = [home];
while (queue.length) {
  const it = await node(queue.shift());
  if (!it) continue;
  pages.push({ id: it.itemId, path: it.path, fr: it.fr?.value ?? "", sr: it.sr?.value ?? "" });
  for (const ch of it.children?.nodes ?? []) {
    if (ch.name.toLowerCase() === "data") {
      const items = [], q = [ch.itemId];
      while (q.length) { const d = await node(q.shift()); for (const x of d?.children?.nodes ?? []) { items.push({ id: x.itemId, path: x.path }); if (x.hasChildren) q.push(x.itemId); } }
      folders.set(it.path, { id: ch.itemId, path: ch.path, items });
    } else if (ch.hasChildren || ch.fr?.value || ch.sr?.value) queue.push(ch.itemId);
  }
}

// 2. every datasource reference in every page layout, renderings AND personalization rule actions (<rls> ... DataSource="...")
const localIds = new Map(), localPaths = [];
for (const [page, f] of folders) { localIds.set(G(f.id), page); localPaths.push([f.path.toLowerCase(), page]); for (const x of f.items) localIds.set(G(x.id), page); }
const refs = [];   // { from, field, where, value, owner }
for (const p of pages) for (const [field, xml] of [["__Final Renderings", p.fr], ["__Renderings", p.sr]]) {
  for (const r of String(xml).matchAll(/<r\b[^>]*\suid="([^"]*)"[^>]*>|<action\b[^>]*>/g)) {
    const tag = r[0], uid = r[1] ?? (tag.match(/\suid="([^"]*)"/) ?? [])[1] ?? "?";
    for (const m of tag.matchAll(/\s(s:ds|DataSource|datasource)="([^"]*)"/g)) {
      const v = m[2].replace(/&amp;/g, "&").trim(); if (!v) continue;
      const owner = /^local:/i.test(v) ? p.path : localIds.get(G(v)) ?? localPaths.find(([fp]) => v.toLowerCase() === fp || v.toLowerCase().startsWith(fp + "/"))?.[1];
      if (owner) refs.push({ from: p.path, field, where: `${tag.startsWith("<action") ? "personalization action" : "rendering"} ${uid}`, value: v, owner });
    }
  }
}

// 3. one line per page, then the folders that may be deleted
const rel = (p) => p.slice(home.length - "/Home".length) || p;
const blocked = new Set(refs.map((r) => r.owner));
for (const p of pages) {
  const f = folders.get(p.path), out = refs.filter((r) => r.from === p.path);
  const own = f ? `Data ${braced(f.id)} (${f.items.length} item(s))${blocked.has(p.path) ? ", REFERENCED: keep" : ", not referenced: delete"}` : "no Data folder";
  console.log(`${out.length || blocked.has(p.path) ? "✖" : "✔"} ${rel(p.path)}: ${own}${out.length ? `; layout references page-local data: ${out.map((r) => `${r.field} ${r.where} → ${r.value}`).join("; ")}` : ""}`);
}
const deletable = [...folders].filter(([page]) => !blocked.has(page)).map(([page, f]) => ({ page: rel(page), id: braced(f.id), path: f.path, items: f.items.length }));
safeWrite(customer, join(demo, "local-data-check.json"), JSON.stringify({ at: new Date().toISOString(), pages: pages.length, folders: [...folders].map(([page, f]) => ({ page: rel(page), id: braced(f.id), items: f.items.length })), references: refs, deletable }, null, 2) + "\n");
console.log(`\n${pages.length} page(s), ${folders.size} page Data folder(s), ${refs.length} page-local reference(s).`);
if (deletable.length) console.log(`Delete with ONE delete_content per folder, after ONE SE confirmation for all ${deletable.length}:\n${deletable.map((d) => `  ${d.id}  ${d.page}/Data (${d.items} item(s))`).join("\n")}`);
if (refs.length) { console.log(`✖ ${refs.length} layout reference(s) still point at page-local data: re-point them (set_component_datasource to the item under <site>/Data; a personalization action's DataSource in __Final Renderings), then re-run.`); process.exit(1); }
console.log("✔ no page layout references page-local data");
