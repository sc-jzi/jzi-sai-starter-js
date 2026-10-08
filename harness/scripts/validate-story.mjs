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
 */
import { existsSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { die, demoDir, rootRel } from "./_lib.mjs";

const client = process.argv[2];
if (!client) die("Usage: validate-story.mjs <customer>");
const slug = client;
const demo = demoDir(client);
const bpPath = join(demo, "demo-plan.yaml");
if (!existsSync(bpPath)) die(`${rootRel(bpPath)} not found`);
const safeWrite = (_s, p, t) => { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, t); };

// ── YAML subset: maps, block lists (of scalars or maps), inline [a, b] lists, quoted/plain scalars ──
function parseYaml(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, t: raw.trim() })).filter((l) => l.t && !l.t.startsWith("#"));
  let i = 0;
  const scalar = (v) => {
    v = v.trim();
    if (/^\{.*\}$/.test(v)) { // inline map { a: 1, b: "x, y" }
      const o = {}, inner = v.slice(1, -1); let depth = 0, q = null, cur = ""; const parts = [];
      for (const ch of inner) { if (q) { if (ch === q) q = null; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === "[") depth++; if (ch === "]") depth--; if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; } cur += ch; }
      if (cur.trim()) parts.push(cur);
      for (const p of parts) { const k = p.indexOf(":"); if (k > 0) o[p.slice(0, k).trim()] = scalar(p.slice(k + 1)); }
      return o;
    }
    if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map((x) => scalar(x)).filter((x) => x !== "");
    if (/^".*"$/.test(v)) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
    if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
    if (v === "true") return true; if (v === "false") return false; if (v === "null" || v === "~") return null;
    return v.replace(/\s+#.*$/, "");
  };
  function block(indent) {
    if (i >= lines.length) return null;
    if (lines[i].t.startsWith("- ") || lines[i].t === "-") return list(lines[i].indent);
    return map(lines[i].indent);
  }
  function map(indent) {
    const o = {};
    while (i < lines.length && lines[i].indent === indent && !lines[i].t.startsWith("- ")) {
      const m = lines[i].t.match(/^([^:]+?):\s*(.*)$/); if (!m) { i++; continue; }
      i++;
      if (m[2] === "" ) { o[m[1]] = i < lines.length && lines[i].indent > indent ? block() : (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("- ") ? list(indent) : null); }
      else o[m[1]] = scalar(m[2]);
    }
    return o;
  }
  function list(indent) {
    const a = [];
    while (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("-")) {
      const rest = lines[i].t.replace(/^-\s*/, "");
      if (!rest) { i++; a.push(i < lines.length && lines[i].indent > indent ? block() : null); continue; }
      const m = rest.match(/^([^:"'\[{]+?):\s*(.*)$/);
      if (m) { // item is a map starting on the dash line
        const childIndent = indent + (lines[i].t.length - rest.length);
        lines[i] = { raw: lines[i].raw, indent: childIndent, t: rest };
        a.push(map(childIndent));
      } else { a.push(scalar(rest)); i++; }
    }
    return a;
  }
  return map(lines[0]?.indent ?? 0);
}

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
  if (!["stated", "inferred"].includes(c.evidenceType)) why.push("evidenceType");
  const owners = arr(c.owners); if (!owners.length || owners.some((o) => !audIds.has(o))) why.push("owners (valid audience ids)");
  if (why.length) s3.push(`${c.id ?? "?"}: ${why.join(", ")}`);
}
add("S3 every critical business issue has owners, a reason/source, evidence, stated|inferred", "required", cbis.length >= 2 && s3.length === 0, cbis.length < 2 ? "need at least 2 critical business issues (Chain of Pain)" : s3.join("; ") || `${cbis.length} CBIs`);

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
const allInferred = cbis.length > 0 && cbis.every((c) => c.evidenceType === "inferred");
add("S9 3–6 moments; CBIs are not all merely inferred", "recommended", moments.length >= 3 && moments.length <= 6 && !allInferred, `${moments.length} moments${allInferred ? "; every CBI is inferred — confirm with the presenter" : ""}`);

// ── approval-screen table ──
const cell = (v) => String(v ?? "").replace(/\|/g, "\\|").replace(/\s+/g, " ").trim();
let md = `# Story plan — ${slug}\n\nShow this on the approval screen. Method: harness/reference/demo-method.md\n\n`;
md += `## Situation slide\n${cell(story.situation)}\n\n## Chain of Pain\n| CBI | Critical business issue | Felt by | Why / source | Evidence | Basis | Impact |\n|---|---|---|---|---|---|---|\n`;
for (const c of cbis) md += `| ${cell(c.id)} | ${cell(c.issue)} | ${arr(c.owners).map((o) => cell(aud.find((a) => a.id === o)?.name ?? o)).join("; ")} | ${cell(c.reason)} | ${cell(c.evidence)} | ${cell(c.evidenceType)} | ${cell(c.impact ?? c.metric ?? "not given")} |\n`;
md += `\n## Audience (AAA)\n| Audience | Annoyance | Afterward |\n|---|---|---|\n`;
for (const a of aud) md += `| ${cell(a.name)} | ${cell(a.annoyance)} | ${cell(a.afterward)} |\n`;
md += `\n## Message map\n- Before: ${cell(mm.before)}\n- Required capabilities: ${arr(mm.requiredCapabilities).map(cell).join("; ")}\n- After: ${cell(mm.after)}\n- Metrics: ${arr(mm.metrics).map(cell).join("; ") || "not given"}\n- Differentiators: ${arr(mm.differentiators).map(cell).join("; ") || "not given"}\n- Proof points: ${arr(mm.proofPoints).map(cell).join("; ") || "none yet"}\n- Why now: ${cell(mm.whyNow) || "not given"}\n`;
md += `\n## Demo flow (last thing first)\n| # | Moment | CBI | Audience | Annoyance → Afterward | Capability | Must be visible | Check-in |\n|---|---|---|---|---|---|---|---|\n`;
for (const m of moments) md += `| ${cell(m.id)}${m.wow ? " (WOW)" : ""} | ${cell(m.title)} | ${arr(m.cbi).join(", ")} | ${arr(m.audience).join(", ")} | ${cell(m.annoyance)} → ${cell(m.afterward)} | ${cell(m.capability)} | ${cell(m.mustSee)} | ${cell(m.checkIn)} |\n`;
md += `\n## Recap\n${cell(story.recap)}\n`;
try { safeWrite(slug, join(demo, "story-plan.md"), md); } catch { /* report only */ }

let failed = 0;
for (const r of results) { if (!r.ok && r.level === "required") failed++; console.log(`${r.ok ? "✅" : r.level === "required" ? "❌" : "⚠️"} ${r.id}${r.detail ? ` — ${r.detail}` : ""}`); }
console.log(failed ? `\n✖ ${failed} story rule(s) failed. Fix demo-brief.md / demo-plan.yaml per harness/reference/demo-method.md before presenting the plan.` : "\n✔ story follows the method");
console.log(`(approval-screen tables: ${rootRel(join(demo, "story-plan.md"))})`);
process.exit(failed ? 1 : 0);
