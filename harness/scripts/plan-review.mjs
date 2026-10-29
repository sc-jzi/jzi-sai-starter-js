#!/usr/bin/env node
/**
 * Gate 2's picture of the plan: one page, one row per planned section of every mirrored page, BEFORE anything is built. The SE approves the
 * plan with it open: a wrong component next to the live band is obvious in seconds, even when every check passed.
 *
 *   node harness/scripts/plan-review.mjs <customer> [--open]
 *
 * Per row: the live crop · the chosen variant's screenshot (a new component shows its spec instead) · the other shortlisted variants ·
 * fit, fitReason, the measured shapes and flags (off the shortlist, a look that restructures, field notes). Shortlist = _measure.mjs, the same
 * one component-match.mjs, component-crops.mjs and validate-site-plan P17 use. Screenshots are linked from the demo folder and the base
 * catalog (open the page on this machine). Writes plan-review.html in the demo folder. Exit 0 always.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { spawnSync } from "node:child_process";
import { die, demoDir, parseArgs, readJson, rootRel, baseApp } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";
import { shapeOf, describeShape, catalogVariants, rankVariants, restructures } from "./_measure.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: plan-review.mjs <customer> [--open]");
const demo = demoDir(customer), planPath = join(demo, "demo-plan.yaml");
if (!existsSync(planPath)) die(`${rootRel(planPath)} not found`);
const plan = parseYaml(readFileSync(planPath, "utf8"));
const shotDir = join(baseApp(), "docs", "ai", "catalog", "components");
const measured = catalogVariants(readJson(join(baseApp(), "docs", "ai", "catalog", "components.json"))).filter((v) => v.shape);
if (!measured.length) console.log("! the base catalog has no measured variants (component-catalog.mjs with the base app running): the page shows no shortlist");

const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const href = (abs) => encodeURI(relative(demo, abs).replace(/\\/g, "/"));
const img = (abs, alt) => (abs && existsSync(abs) ? `<a href="${href(abs)}" target="_blank"><img src="${href(abs)}" alt="${esc(alt)}" loading="lazy"></a>` : `<div class="none">no screenshot</div>`);
const variantFig = (v, cls = "") => `<figure class="${cls}"><figcaption>${esc(v.name)} <b>${esc(v.variant)}</b> <span class="d ${v.fit}">${v.distance}</span></figcaption>${img(v.file ? join(shotDir, v.file) : null, `${v.name} ${v.variant}`)}<div class="looks">${esc(v.looksLike ?? "")}</div>${v.why.length ? `<div class="why">differs: ${esc(v.why.join(", "))}</div>` : ""}${v.notes.map((n) => `<div class="note">${esc(n)}</div>`).join("")}</figure>`;
const spec = (s) => { const n = s.new ?? {}; const list = (x) => (Array.isArray(x) ? x.map((f) => (typeof f === "object" ? `${f.name ?? ""}${f.type ? ` (${f.type})` : ""}` : f)).join(", ") : x ?? ""); return `<figure class="spec"><figcaption>NEW: <b>${esc(n.name ?? s.component)}</b> (${esc(n.kind ?? "")})</figcaption><dl>${n.fields ? `<dt>Fields</dt><dd>${esc(list(n.fields))}</dd>` : ""}${n.children ? `<dt>Items</dt><dd>${esc(list(n.children))}</dd>` : ""}${n.behaviour ? `<dt>Behaviour</dt><dd>${esc(n.behaviour)}</dd>` : ""}</dl></figure>`; };

let n = 0, flagged = 0;
const sectionsHtml = [];
for (const p of Array.isArray(plan?.site?.pages) ? plan.site.pages : []) {
  const file = p.sectionsFile ? String(p.sectionsFile) : /^\/home$/i.test(String(p.path)) ? "sections.json" : null;
  const cap = file ? readJson(join(demo, file)) : null;
  const secs = (Array.isArray(p.sections) ? p.sections : []).filter((s) => s && typeof s === "object");
  if (!cap || !secs.length) continue;   // story pages and title-only stubs: listed in site-plan.md, nothing to compare
  const rows = [];
  for (const s of secs) {
    n++;
    const band = s.liveSection != null ? cap.sections?.find((x) => x.index === Number(s.liveSection)) : null;
    const live = band ? shapeOf(band, cap.viewport ?? 1440) : null;
    const all = live && measured.length ? rankVariants(live, measured, 0) : [], short = all.slice(0, 3);
    const isNew = s.fit === "new" || !!s.new, want = String(s.variant || "Default");
    const chosen = isNew ? null : all.find((v) => v.id === s.component && v.variant === want) ?? null;
    const flags_ = [];
    if (chosen && !short.includes(chosen)) flags_.push(`off the shortlist: ranks #${all.indexOf(chosen) + 1} of ${all.length}`);
    if (chosen && live) for (const r of restructures(live, chosen.shape)) flags_.push(`a look cannot restructure: ${r}${s.shapeReason ? ` (shapeReason: ${s.shapeReason})` : ""}`);
    if (!isNew && !chosen && live) flags_.push(`${s.component} ${want} has no measurement: compare by eye`);
    if (flags_.length) flagged++;
    const others = short.filter((v) => v !== chosen);
    rows.push(`<tr class="${flags_.length ? "flag" : ""}"><td class="num">${esc(s.position)}</td>
<td><figure><figcaption>${band ? `Live #${band.index} ${esc((band.heading?.text ?? "").slice(0, 50))}` : `Added: ${esc(s.addedReason ?? "")}`}</figcaption>${band ? img(join(demo, band.screenshot ?? ""), "live") : `<div class="none">not on the live site</div>`}${live ? `<div class="looks">${esc(describeShape(live))}</div>` : ""}</figure></td>
<td>${isNew ? spec(s) : chosen ? variantFig(chosen, "chosen") : `<figure class="chosen"><figcaption>${esc(s.component)} <b>${esc(want)}</b></figcaption><div class="none">not measured</div></figure>`}${s.look ? `<div class="look">look: <b>${esc(s.look)}</b></div>` : ""}</td>
<td class="others">${others.map((v) => variantFig(v, "small")).join("") || "<div class=\"none\">—</div>"}</td>
<td><div class="fit">${esc(s.fit ?? "")}</div><div>${esc(s.fitReason ?? s.note ?? "")}</div>${flags_.map((f) => `<div class="warn">${esc(f)}</div>`).join("")}</td></tr>`);
  }
  sectionsHtml.push(`<h2>${esc(p.displayName ?? p.path)} <small>${esc(p.path)}${p.liveUrl ? ` · <a href="${esc(p.liveUrl)}" target="_blank">live page</a>` : ""}</small></h2>
<table><thead><tr><th>#</th><th>Live section</th><th>Chosen</th><th>Other shortlisted variants</th><th>Fit and reason</th></tr></thead><tbody>${rows.join("\n")}</tbody></table>`);
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Plan review: ${esc(customer)}</title>
<style>body{font:15px/1.4 system-ui,sans-serif;margin:24px auto;max-width:1800px;padding:0 16px;color:#222}h1{font-size:24px}h2{font-size:19px;margin:32px 0 8px}small{color:#666;font-weight:normal}
table{border-collapse:collapse;width:100%}th,td{border-top:1px solid #ddd;padding:10px 8px;vertical-align:top;text-align:left}th{font-size:13px;color:#555}td:nth-child(2),td:nth-child(3){width:28%}td.others{width:26%}
td.num{font-weight:700;width:24px}tr.flag{background:#fff4f0}figure{margin:0 0 8px}figcaption{font-weight:600;margin-bottom:4px;font-size:14px}img{max-width:100%;max-height:340px;border:1px solid #ccc;display:block}
figure.small img{max-height:150px}figure.chosen{outline:2px solid #2a7;outline-offset:4px}.spec{background:#eef5ff;padding:8px 10px;border-radius:6px}.spec dt{font-weight:600}.spec dd{margin:0 0 6px}
.looks{color:#555;font-size:13px;margin-top:4px}.why{color:#a60;font-size:12px}.note{color:#06c;font-size:12px}.warn{color:#b00;font-weight:600;margin-top:6px}.fit{font-weight:700;text-transform:uppercase;font-size:12px;color:#555}
.look{font-size:13px}.d{display:inline-block;border-radius:10px;padding:0 7px;font-size:12px;color:#fff;background:#999}.d.close{background:#2a7}.d.partial{background:#d90}.d.far{background:#c33}.none{padding:24px;text-align:center;color:#999;border:1px dashed #ccc}.how{background:#eef5ff;padding:12px 16px;border-radius:8px}</style></head><body>
<h1>Plan review: ${n} section(s), ${flagged} flagged</h1>
<p class="how">One row per planned section: the prospect's section, the component the plan builds it with, and the other base variants closest in measured
shape (the number is the distance: <span class="d close">0–2</span> close, <span class="d partial">2–6</span> partial, <span class="d far">6+</span> far; colours and fonts are not compared, the client variant restyles them).
A component may be restyled but not restructured: a row of cards never becomes an image beside text. Red rows need a look.</p>
${sectionsHtml.join("\n")}
</body></html>`;
const out = join(demo, "plan-review.html");
writeFileSync(out, html);
if (flags.open) {
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", out]] : process.platform === "darwin" ? ["open", [out]] : ["xdg-open", [out]];
  spawnSync(cmd, args, { stdio: "ignore" });
}
console.log(`${n} section(s), ${flagged} flagged → ${rootRel(out)}${flags.open ? " (opened in the browser)" : ""}`);
