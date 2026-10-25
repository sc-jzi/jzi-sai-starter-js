#!/usr/bin/env node
/**
 * Click-to-accept for measurement differences: one page the SE can read without any tooling, and one question in chat.
 *
 *   node harness/scripts/looks-review.mjs <customer> [--open]
 *
 * Lists the SECTIONS whose measurement differences are still open after two fix attempts (build gaps such as a missing section, footer columns,
 * sample content, render errors or missing imagery are never offered: they must be built). Writes in the demo folder:
 *   looks-review.html   one numbered card per section: the prospect's section and the demo's side by side, and what differs; --open shows it
 *   looks-review.json   the same list, read by `run-gate.mjs accept`
 *   .awaiting-se        the run waits for the SE: the stop hook does not restart it until the answer is recorded
 * Then the agent asks ONE question (Accept all / Keep fixing / Accept some: type the numbers) and records the answer:
 *   node harness/scripts/run-gate.mjs accept <customer> all|none|1,3,5 --answer "<the SE's words>"
 * Exit 0 always (nothing to review is not an error).
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { demoDir, die, parseArgs, readJson, rootRel } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";
import { looksState } from "./_looks.mjs";

const { flags, pos } = parseArgs(process.argv.slice(2));
const customer = pos[0];
if (!customer) die("Usage: looks-review.mjs <customer> [--open]");
const demo = demoDir(customer);
const planObj = parseYaml(readFileSync(join(demo, "demo-plan.yaml"), "utf8"));
const manifest = readJson(join(demo, "images", "image-manifest.json"), []);
const tooLarge = new Set((Array.isArray(manifest) ? manifest : []).filter((i) => i.uploadStatus === "too-large").map((i) => String(i.src ?? "").split("?")[0]));
const { findings, problems } = looksState(customer, planObj, { tooLarge });
if (problems.length) console.log(`! ${problems.length} looks verdict(s) missing or stale: run node harness/scripts/looks-gates.mjs ${customer} first, so the page shows the current state.`);

// one review item per SECTION (both screenshots, all its differences): a person judges a section, not thirty numbers
const groups = new Map();
for (const f of findings.filter((x) => x.cls === "acceptable" && !x.accepted && x.attempts >= 2)) {
  const k = `${f.what}|${f.n ?? "header"}`;
  if (!groups.has(k)) groups.set(k, { what: f.what, ref: f.ref, label: f.label, section: f.n, title: f.diff, liveCrop: f.liveCrop, builtCrop: f.builtCrop, ids: [], diffs: [] });
  const g = groups.get(k); g.ids.push(f.id); g.diffs.push(f.diff);
}
const items = [...groups.values()].map((g, i) => ({ n: i + 1, ...g }));
const early = findings.filter((x) => x.cls === "acceptable" && !x.accepted && x.attempts < 2).length;
if (!items.length) { console.log(`Nothing to put to the SE${early ? ` (${early} difference(s) have had fewer than two fix attempts: fix them first)` : ""}.`); process.exit(0); }

const esc = (t) => String(t ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const page = (label) => (label === "header" ? "Header (every page)" : label === "sections" ? "Home page" : `Page: ${label.replace(/^sections-/, "")}`);
const sectionName = (it) => { if (it.section == null) return "header"; const m = String(it.title).match(/^#\d+\s*([^:]*)/); return `section ${it.section}${m && m[1].trim() ? `, "${m[1].trim()}"` : ""}`; };
// in words a non-technical reader understands; the technical line stays underneath for whoever fixes it
const raw = (d) => String(d).replace(/^#\d+\s*[^:]*:\s*/, "");
const NAMES = { heading: "heading", text: "text block", button: "button", link: "link", image: "image", eyebrow: "small label", field: "form field" };
const plain = (d) => {
  const t = raw(d); let m;
  if ((m = t.match(/^element order (.*) \(prospect (.*)\)$/))) {
    const count = (s) => s.split(",").filter(Boolean).reduce((o, r) => ((o[r] = (o[r] || 0) + 1), o), {});
    const a = count(m[1]), b = count(m[2]), parts = [];
    for (const r of new Set([...Object.keys(a), ...Object.keys(b)])) { const k = (b[r] || 0) - (a[r] || 0); if (k > 0) parts.push(`${k} ${NAMES[r] ?? r}${k > 1 ? "s" : ""} missing`); if (k < 0) parts.push(`${-k} extra ${NAMES[r] ?? r}${k < -1 ? "s" : ""}`); }
    return parts.length ? `Content differs: ${parts.join(", ")}` : "Same content, in a different order";
  }
  if ((m = t.match(/^(heading|eyebrow) size (\d+)px \(prospect (\d+)px\)$/))) return `${m[1] === "heading" ? "Heading" : "Small label"} is ${+m[2] < +m[3] ? "smaller" : "larger"} (${m[2]}px, the prospect's is ${m[3]}px)`;
  if ((m = t.match(/^(.*?) colou?r (#\w+) \(prospect (#\w+)\)$/))) return `${m[1][0].toUpperCase() + m[1].slice(1)} colour differs (demo ${m[2]}, the prospect's ${m[3]})`;
  if ((m = t.match(/^(background|button background|card background) (#\w+) \(prospect (#\w+)\)$/))) return `${m[1][0].toUpperCase() + m[1].slice(1)} colour differs (demo ${m[2]}, the prospect's ${m[3]})`;
  if ((m = t.match(/^content width (\d+)px \(prospect (\d+)px\)$/))) return `Content is ${+m[1] > +m[2] ? "wider" : "narrower"} (${m[1]}px, the prospect's is ${m[2]}px)`;
  if ((m = t.match(/^image side (.*) \(prospect (.*)\)$/))) return `Image position differs (demo: ${m[1]}, the prospect's: ${m[2]})`;
  if (/^inner card backgrounds missing$/.test(t)) return "The prospect's section has coloured cards; the demo's has none";
  if (/^inner card backgrounds present in the demo/.test(t)) return "The demo has coloured cards the prospect's section does not have";
  if (/^the demo shows a button the prospect's section does not have$/.test(t)) return "The demo shows a button the prospect's section does not have";
  if (/^the button is missing$/.test(t)) return "The prospect's button is missing";
  if (/^eyebrow (shown|missing)/.test(t)) return /missing/.test(t) ? "The small label above the heading is missing" : "The demo shows a small label the prospect does not have";
  return t;
};
// screenshots are embedded, so the page works wherever it is opened (a browser, a preview pane, forwarded to a colleague)
const img = (src, alt) => {
  const p = src ? join(demo, src) : null;
  if (!p || !existsSync(p)) return `<div class="none">no screenshot</div>`;
  const type = /\.jpe?g$/i.test(p) ? "image/jpeg" : "image/png";
  return `<img src="data:${type};base64,${readFileSync(p).toString("base64")}" alt="${esc(alt)}">`;
};
const cards = items.map((it) => `<section><h2><span class="n">${it.n}</span>${esc(page(it.label))} <small>${esc(sectionName(it))}</small></h2>
<ul class="diff">${it.diffs.map((d) => `<li>${esc(plain(d))}<br><span class="tech">${esc(raw(d))}</span></li>`).join("")}</ul>
<div class="pair"><figure><figcaption>Prospect's site</figcaption>${img(it.liveCrop, "prospect")}</figure><figure><figcaption>Demo</figcaption>${img(it.builtCrop, "demo")}</figure></div></section>`).join("\n");
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Sections to review: ${esc(customer)}</title>
<style>body{font:16px/1.45 system-ui,sans-serif;margin:24px auto;max-width:1400px;padding:0 16px;color:#222}h1{font-size:24px}section{border:1px solid #ddd;border-radius:8px;padding:16px;margin:16px 0}
h2{font-size:18px;margin:0 0 6px}small{color:#666;font-weight:normal}.n{display:inline-block;background:#222;color:#fff;border-radius:50%;width:28px;height:28px;text-align:center;line-height:28px;margin-right:8px}
.diff{background:#fff7e0;padding:6px 10px 6px 28px;border-radius:4px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px}figure{margin:0}figcaption{font-weight:600;margin-bottom:4px}
img{max-width:100%;border:1px solid #ccc}.none{padding:40px;text-align:center;color:#999;border:1px dashed #ccc}.tech{color:#888;font-size:12px;word-break:break-all}.how{background:#eef5ff;padding:12px 16px;border-radius:8px}</style></head><body>
<h1>${items.length} section(s) still differ from the prospect's site</h1>
<p class="how">The demo was fixed twice and these sections still differ. For each numbered section: is it close enough for the demo?
Answer in the chat: <b>Accept all</b>, <b>Keep fixing</b>, or <b>Accept some</b> and type the numbers (for example 1, 3).</p>
${cards}
</body></html>`;
const file = join(demo, "looks-review.html");
writeFileSync(file, html);
writeFileSync(join(demo, "looks-review.json"), JSON.stringify({ at: new Date().toISOString(), items: items.map(({ n, ids, what, ref, label, section, diffs }) => ({ n, ids, what, ref, label, section, diffs })) }, null, 2) + "\n");
writeFileSync(join(demo, ".awaiting-se"), JSON.stringify({ at: new Date().toISOString(), about: "looks-review", sections: items.length }) + "\n");
if (flags.open) {
  const [cmd, args] = process.platform === "win32" ? ["cmd", ["/c", "start", "", file]] : process.platform === "darwin" ? ["open", [file]] : ["xdg-open", [file]];
  spawnSync(cmd, args, { stdio: "ignore" });
}
console.log(`${items.length} section(s) for the SE (${items.reduce((s, i) => s + i.diffs.length, 0)} difference(s)) → ${rootRel(file)}${flags.open ? " (opened in the browser)" : ""}`);
for (const it of items) console.log(`  ${it.n}. ${page(it.label)} · ${sectionName(it)} (${it.diffs.length} difference(s))`);
console.log(`\nAsk the SE ONE question: "${items.length} section(s) still differ after two fix attempts; the page shows each one side by side. Accept them?" with the options`);
console.log("  Accept all  ·  Keep fixing  ·  Accept some (type the numbers)");
console.log(`Then record the answer: node harness/scripts/run-gate.mjs accept ${customer} all|none|<numbers> --answer "<the SE's words>"`);
