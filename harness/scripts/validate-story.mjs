#!/usr/bin/env node
/**
 * validate-story.mjs — the demo story must follow harness/reference/demo-method.md
 * (Chain of Pain, AAA, Command of the Message, do the last thing first).
 *
 *   node harness/scripts/validate-story.mjs <customer>
 *
 * Reads industry-verticals/<customer>/docs/ai/demos/<customer>/demo-plan.yaml `story:`; writes story-plan.md beside it
 * (the tables the approval screen must show). Exit 1 if a REQUIRED rule fails. Dependency-free.
 *
 *  S1 situation slide  S2 AAA complete  S3 CBIs have owners/reason/evidence  S4 moments complete
 *  S5 every CBI answered  S6 moment 1 = last thing first (wow) answering c1  S7 message map  S8 recap  S9 3-6 moments
 *  S10 show the result first, then how it is built: every moment has `show` (what the visitor sees on the site) and `reveal`
 *      (the Sitecore screen that made it: Pages, Personalize, Content Hub, ...), and a talk track
 *  S11 every moment has a clickPath: the pages the SE clicks through, in order, starting at /Home, each step "<path> (click: <what>)"
 *  S12 a personalization / behaviour moment has the visit that triggers it on its clickPath (>= 2 steps) and names the trigger
 * This file is the STORY GATE (demo-from-transcript T2b): it runs, and the SE approves the story, before any site plan or theme.
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { die, demoDir, rootRel } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";

const client = process.argv[2];
if (!client) die("Usage: validate-story.mjs <customer>");
const slug = client;
const demo = demoDir(client);
const bpPath = join(demo, "demo-plan.yaml");
if (!existsSync(bpPath)) die(`${rootRel(bpPath)} not found`);
const safeWrite = (_s, p, t) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, t); };



let bp;
try { bp = parseYaml(readFileSync(bpPath, "utf8")); } catch (e) { die(`Could not read demo-plan.yaml: ${e.message}`); }
const story = bp.story ?? {};
const arr = (v) => (Array.isArray(v) ? v : v == null || v === "" ? [] : [v]);
const aud = arr(story.audiences), cbis = arr(story.chainOfPain), moments = arr(story.moments), mm = story.messageMap ?? {};
const audIds = new Set(aud.map((a) => a.id)), cbiIds = new Set(cbis.map((c) => c.id));
const results = []; const add = (id, level, ok, detail = "") => results.push({ id, level, ok, detail });
const has = (v) => v != null && String(v).trim() !== "" && !/^(not given|tbd|todo)$/i.test(String(v).trim());

add("S1 situation slide present", "required", has(story.situation) && String(story.situation).split(/\s+/).length >= 12, has(story.situation) ? "" : "story.situation is empty (2–4 sentences saying back what we understood)");

const s2 = aud.filter((a) => !has(a.annoyance) || !has(a.afterward)).map((a) => a.id ?? "?");
add("S2 every audience has an annoyance and an afterward (AAA)", "required", aud.length > 0 && s2.length === 0, aud.length ? (s2.length ? `incomplete: ${s2.join(", ")}` : `${aud.length} audience(s)`) : "no story.audiences");

const s3 = [];
for (const c of cbis) {
  const why = [];
  if (!has(c.issue)) why.push("issue"); if (!has(c.reason)) why.push("reason/source"); if (!has(c.evidence)) why.push("evidence");
  if (!["stated", "inferred", "rfp"].includes(c.evidenceType)) why.push("evidenceType");
  const owners = arr(c.owners); if (!owners.length || owners.some((o) => !audIds.has(o))) why.push("owners (valid audience ids)");
  if (why.length) s3.push(`${c.id ?? "?"}: ${why.join(", ")}`);
}
add("S3 every critical business issue has owners, a reason/source, evidence, stated|inferred|rfp", "required", cbis.length >= 2 && s3.length === 0, cbis.length < 2 ? "need at least 2 critical business issues (Chain of Pain)" : s3.join("; ") || `${cbis.length} CBIs`);

const s4 = [];
for (const m of moments) {
  const why = [];
  const mc = arr(m.cbi), ma = arr(m.audience);
  if (!mc.length || mc.some((c) => !cbiIds.has(c))) why.push("cbi"); if (!ma.length || ma.some((a) => !audIds.has(a))) why.push("audience");
  if (!has(m.mustSee)) why.push("mustSee"); if (!has(m.checkIn)) why.push("checkIn"); if (!has(m.annoyance) || !has(m.afterward)) why.push("annoyance/afterward");
  if (why.length) s4.push(`${m.id}: ${why.join(", ")}`);
}
add("S4 every moment names a CBI + audience, annoyance→afterward, what must be visible, a check-in question", "required", moments.length > 0 && s4.length === 0, s4.join("; "));

const answered = new Set(moments.flatMap((m) => arr(m.cbi))), served = new Set(moments.flatMap((m) => arr(m.audience)));
const lostC = [...cbiIds].filter((c) => !answered.has(c)), lostA = [...audIds].filter((a) => !served.has(a));
add("S5 every CBI is answered by a moment", "required", lostC.length === 0, lostC.length ? `not answered: ${lostC.join(", ")} (add a moment, or remove the CBI and say why)` : "");
add("S5b every audience member gets at least one moment", "recommended", lostA.length === 0, lostA.length ? `no moment for: ${lostA.join(", ")}` : "");

const wows = moments.filter((m) => m.wow === true);
const top = cbis[0]?.id;
add("S6 moment 1 is the last thing first (wow:true, only one) and answers the top CBI", "required", wows.length === 1 && moments[0]?.wow === true && arr(moments[0]?.cbi).includes(top), `wow moments: ${wows.map((m) => m.id).join(", ") || "none"}; first moment ${moments[0]?.id ?? "-"} answers ${arr(moments[0]?.cbi).join(", ") || "-"}; top CBI ${top ?? "-"}`);

const mmBad = ["before", "after"].filter((k) => !has(mm[k])); if (!arr(mm.requiredCapabilities).length) mmBad.push("requiredCapabilities");
add("S7 message map: before, required capabilities, after", "required", mmBad.length === 0, mmBad.length ? `missing: ${mmBad.join(", ")}` : "");
const soft = [["metrics", arr(mm.metrics).length], ["differentiators", arr(mm.differentiators).length], ["proofPoints", arr(mm.proofPoints).length]].filter(([, n]) => !n).map(([k]) => k);
add("S7b message map: metrics, differentiators, proof points (write 'not given' if the transcript has none)", "recommended", soft.length === 0, soft.length ? `empty: ${soft.join(", ")}` : "");
add("S8 recap present", "required", has(story.recap), has(story.recap) ? "" : "story.recap is empty (for each CBI: what we showed that solves it)");
const s10 = moments.filter((m) => !has(m.show) || !has(m.reveal) || !has(m.talkTrack)).map((m) => `${m.id}: ${["show", "reveal", "talkTrack"].filter((k) => !has(m[k])).join(", ")}`);
add("S10 every moment shows the result on the site first (show), then how it was built (reveal), with a talk track", "required", moments.length > 0 && s10.length === 0, s10.join("; "));
const step = (x) => String(x ?? "").split(/\s+[(|]/)[0].trim();
const s11 = [];
for (const m of moments) {
  const cp = arr(m.clickPath);
  if (!cp.length) { s11.push(`${m.id}: no clickPath`); continue; }
  if (!/^\/home$/i.test(step(cp[0]))) s11.push(`${m.id}: clickPath starts at ${step(cp[0]) || "?"}, not /Home`);
  const bad = cp.filter((x) => !/^\/home(\/[a-z0-9-]+)*$/i.test(step(x)));
  if (bad.length) s11.push(`${m.id}: not a page path: ${bad.map(step).join(", ")}`);
  if (cp.slice(1).some((x) => !/\((click|visit|open|scroll|select|search|submit)[:\s]/i.test(String(x)))) s11.push(`${m.id}: every step after /Home says what is clicked, e.g. "/Home/membership (click: Membership in the header)"`);
}
add("S11 every moment has a clickPath from /Home, each step naming what the SE clicks", "required", moments.length > 0 && s11.length === 0, s11.slice(0, 4).join("; "));
const PERSO = /personali[sz]|persona\b|behaviou?r|recommend|tailor|segment|a\/b|experiment/i;
const s12 = moments.filter((m) => PERSO.test(`${m.capability} ${m.title} ${m.show}`)).filter((m) => arr(m.clickPath).length < 2 || !has(m.trigger)).map((m) => m.id);
add("S12 a personalization moment shows the trigger (the visit or signal) on its clickPath before the changed page, and names it in trigger", "required", s12.length === 0, s12.length ? `${s12.join(", ")}: add trigger and the page visit that fires it to clickPath` : "");

const allInferred = cbis.length > 0 && cbis.every((c) => c.evidenceType === "inferred");
add("S9 3–6 moments; CBIs are not all merely inferred", "recommended", moments.length >= 3 && moments.length <= 6 && !allInferred, `${moments.length} moments${allInferred ? "; every CBI is inferred — confirm with the presenter" : ""}`);

// ── approval-screen table ──
const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
let md = `# Story plan — ${slug}\n\nShow this on the approval screen. Method: harness/reference/demo-method.md\n\n`;
md += `## Situation slide\n${cell(story.situation)}\n\n## Chain of Pain\n| CBI | Critical business issue | Felt by | Why / source | Evidence | Basis | Impact |\n|---|---|---|---|---|---|---|\n`;
for (const c of cbis) md += `| ${cell(c.id)}${c.name ? ` ${cell(c.name)}` : ""} | ${cell(c.issue)} | ${arr(c.owners).map((o) => cell(aud.find((a) => a.id === o)?.name ?? o)).join("; ")} | ${cell(c.reason)} | ${cell(c.evidence)} | ${cell(c.evidenceType)} | ${cell(c.impact ?? c.metric ?? "not given")} |\n`;
md += `\n## Audience (AAA)\n| Audience | Annoyance | Afterward |\n|---|---|---|\n`;
for (const a of aud) md += `| ${cell(a.name)} | ${cell(a.annoyance)} | ${cell(a.afterward)} |\n`;
md += `\n## Message map\n- Before: ${cell(mm.before)}\n- Required capabilities: ${arr(mm.requiredCapabilities).map(cell).join("; ")}\n- After: ${cell(mm.after)}\n- Metrics: ${arr(mm.metrics).map(cell).join("; ") || "not given"}\n- Differentiators: ${arr(mm.differentiators).map(cell).join("; ") || "not given"}\n- Proof points: ${arr(mm.proofPoints).map(cell).join("; ") || "none yet"}\n- Why now: ${cell(mm.whyNow) || "not given"}\n`;
md += `\n## Demo flow (last thing first)\n| # | Moment | CBI | Audience | Annoyance → Afterward | Capability | Must be visible | Check-in |\n|---|---|---|---|---|---|---|---|\n`;
for (const m of moments) md += `| ${cell(m.id)}${m.wow ? " (WOW)" : ""} | ${cell(m.title)} | ${arr(m.cbi).map((id) => [id, cbis.find((c) => c.id === id)?.name].filter(Boolean).join(" ")).join(", ")} | ${arr(m.audience).join(", ")} | ${cell(m.annoyance)} → ${cell(m.afterward)} | ${cell(m.capability)} | ${cell(m.mustSee)} | ${cell(m.checkIn)} |\n`;
md += `\n## Click path and show → reveal, per moment\n`;
for (const m of moments) {
  md += `\n### ${cell(m.id)}${m.wow ? " (WOW, last thing first)" : ""}: ${cell(m.title)}\n`;
  md += `- **Show first (front end):** ${cell(m.show)}\n- **Then reveal (how it is built):** ${cell(m.reveal)}\n`;
  if (has(m.trigger)) md += `- **Trigger:** ${cell(m.trigger)}\n`;
  md += `- **Talk track:** ${cell(m.talkTrack)}\n- **Click path:**\n`;
  arr(m.clickPath).forEach((x, i) => { md += `  ${i + 1}. ${cell(x)}\n`; });
  md += `- **Check-in:** ${cell(m.checkIn)}\n`;
}
md += `\n## Recap\n${cell(story.recap)}\n`;
try { safeWrite(slug, join(demo, "story-plan.md"), md); } catch { /* report only */ }

let failed = 0;
for (const r of results) { if (!r.ok && r.level === "required") failed++; console.log(`${r.ok ? "✅" : r.level === "required" ? "❌" : "⚠️"} ${r.id}${r.detail ? ` — ${r.detail}` : ""}`); }
console.log(failed ? `\n✖ ${failed} story rule(s) failed. Fix demo-brief.md / demo-plan.yaml per harness/reference/demo-method.md before presenting the plan.` : "\n✔ story follows the method");
console.log(`(approval-screen tables: ${rootRel(join(demo, "story-plan.md"))})`);
process.exit(failed ? 1 : 0);
