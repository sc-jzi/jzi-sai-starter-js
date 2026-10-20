#!/usr/bin/env node
/**
 * Run gate: the run is NOT finished until this exits 0. Also owns manual-tasks.md so Cursor never rewrites its fixed parts.
 *
 *   node harness/scripts/run-gate.mjs init  <customer>   start of the run (idempotent): creates manual-tasks.md with the fixed "Always" section
 *   node harness/scripts/run-gate.mjs check <customer>   before ANY hand-over / end of turn after approval. Exit 0 = done, 4 = unfinished work
 *
 * What it checks (only things a script can see on disk; the Sitecore side is verified with the MCP, see the skills):
 *   1. manual-tasks.md contains no deferred CORE work (partial/page designs, templates, datasources, variants, theme, images, navigation flags, display names).
 *      A line is accepted only when it quotes the error of two attempts: `... BLOCKED after 2 attempts: "<error>"`.
 *   2. variants-verify --strict passes (every variant selected in Sitecore is real code, no alias left)
 *   3. the theme is applied in the app (site-<customer> in _colors.scss and site-theme.ts)
 *   4. measurements exist when the prospect has a URL: header-styles.json, nav.json, sections.json + crops
 *   5. images: downloaded, and (CH_ENABLED=true) every one uploaded with a public link
 *   6. looks gates were run on the built site: header-styles.demo.json, sections.demo.json
 *   7. demo-progress.yaml has no pending / failed / in_progress phase
 *
 *   node harness/scripts/run-gate.mjs hook               Cursor stop-hook entry (see .cursor/hooks.json): restarts an approved, unfinished run automatically
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ENV, ROOT, die, demoDir, customerApp, readJson } from "./_lib.mjs";


/* ---- hook mode: Cursor "stop" hook (.cursor/hooks.json). After approval, a run that is not finished is restarted automatically. ----
 * stdin: { status, loop_count, ... }. stdout: {} (let the turn end) or { followup_message } (Cursor submits it as the next user message). */
if (process.argv[2] === "hook") {
  const out = (o) => { process.stdout.write(JSON.stringify(o)); process.exit(0); };
  let input = {}; try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { /* no stdin */ }
  if (input.status && input.status !== "completed") out({});   // the SE pressed stop, or an error: never fight them
  const vroot = join(ROOT, "industry-verticals");
  let best = null;
  for (const c of existsSync(vroot) ? readdirSync(vroot) : []) {
    if (c === ENV.BASE_APP_FOLDER) continue;
    const d = join(vroot, c, "docs", "ai", "demos", c), plan = join(d, "demo-plan.yaml");
    if (!existsSync(plan) || !/^userApproved:\s*true/m.test(readFileSync(plan, "utf8"))) continue;
    if (existsSync(join(d, ".run-complete"))) continue;
    const t = Math.max(...["demo-plan.yaml", "demo-progress.yaml", "manual-tasks.md"].map((f) => { try { return statSync(join(d, f)).mtimeMs; } catch { return 0; } }));
    if (!best || t > best.t) best = { c, t, d };
  }
  if (!best) out({});   // no approved, unfinished demo: nothing to do
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), "check", best.c], { encoding: "utf8" });
  if (r.status === 0) { writeFileSync(join(best.d, ".run-complete"), new Date().toISOString()); out({}); }
  out({ followup_message: `The demo run for "${best.c}" is NOT finished (automatic restart ${Number(input.loop_count ?? 0) + 1}). Do not summarise or hand over. Run \`node harness/scripts/run-gate.mjs check ${best.c}\`, do the first failing item now, and keep going until it exits 0. If it needs a decision only the SE can make, ask that one question.\n\n${r.stdout.trim().slice(0, 1500)}` });
}

const [cmd, customer] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!["init", "check"].includes(cmd) || !customer) die("usage: run-gate.mjs <init|check> <customer>");
const demo = demoDir(customer), app = customerApp(customer, { mustExist: false });
const mt = join(demo, "manual-tasks.md");
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };

const ALWAYS = `## Always (every demo)
- [ ] Add site thumbnail
- [ ] Add partial thumbnails
- [ ] Update layout icons (only if a NEW component was created, rather than new variants)
`;
const SKELETON = `# Manual tasks — ${customer}

${ALWAYS}
## Open (only what the tools could not do)
Core build work is never listed here: partial designs, page designs, templates, datasources, variants, theme, images, navigation flags and display names are BUILT by the run.
A line belongs here only with the exact error of two different attempts: \`- [ ] <what> — BLOCKED after 2 attempts: "<error text>"\`.

## Needs a person
(editing host, anything that needs a login or a device the tools cannot reach)

## Assumptions
Only decisions that the prospect's site, the transcript and the SE did not make. Never a statement about what the demo is or mirrors.
`;

if (cmd === "init") {
  mkdirSync(demo, { recursive: true });
  const cur = read(mt);
  if (!cur) writeFileSync(mt, SKELETON);
  else if (!/^## Always \(every demo\)/m.test(cur)) writeFileSync(mt, cur.replace(/\s*$/, "\n\n") + ALWAYS);
  console.log(`✔ ${mt.slice(ROOT.length + 1).replace(/\\/g, "/")} ready (fixed "Always" section in place)`);
  process.exit(0);
}

const fails = [];
const fail = (what, next) => fails.push({ what, next });

// 1. deferred core work
const CORE = /(partial design|page design|header and footer|derived (page )?template|templates? (under|were|was|not)|datasource|data source|variant|theme|photograph|image|navigation filter|main navigation|display name|not (created|written|applied|uploaded|added|set) yet|not yet (created|written|applied|uploaded))/i;
let section = "";
for (const line of read(mt).split(/\r?\n/)) {
  const h = line.match(/^##\s+(.*)/); if (h) { section = h[1].toLowerCase(); continue; }
  if (!/^\s*[-*]\s*(\[.\]\s*)?\S/.test(line) || section.startsWith("always") || section.startsWith("assumptions")) continue;
  if (CORE.test(line) && !/BLOCKED after 2 attempts:\s*["“].+/.test(line)) fail(`manual-tasks.md defers core work: "${line.trim().slice(0, 110)}"`, "BUILD it now (do not reword the line). Only if two different routes failed, quote both errors: BLOCKED after 2 attempts: \"<error>\".");
}
if (!/^## Always \(every demo\)/m.test(read(mt))) fail("manual-tasks.md has no fixed \"Always\" section", `run: node harness/scripts/run-gate.mjs init ${customer}`);

// 2. variants
if (existsSync(join(demo, "bootstrap-plan.json"))) {
  const r = spawnSync(process.execPath, [join(ROOT, "harness/scripts/variants-verify.mjs"), "--customer", customer, "--strict"], { encoding: "utf8" });
  if (r.status !== 0) fail("variants-verify --strict does not pass (variant code missing or only an alias)", "Phase 5.5: write the real variant code for EVERY component (sitecore-create-demo-variants), then re-run variants-verify --strict.");
} else fail("bootstrap-plan.json missing", `node harness/scripts/bootstrap-plan.mjs ${customer}`);

// 3. theme
const colors = read(join(app, "src/assets/sass/abstracts/vars/_colors.scss")), siteTheme = read(join(app, "src/lib/site-theme.ts"));
if (!colors.includes(`site-${customer}`) || !siteTheme.includes(customer)) fail(`theme not applied (site-${customer} missing in _colors.scss and/or site-theme.ts)`, "Phase 1+4: apply theme/theme.yaml to the app (sitecore-extract-theme / sitecore-build-demo phase 4).");

// 4 + 5 + 6. measurements, images, looks gates
const plan = read(join(demo, "demo-plan.yaml"));
const url = (plan.match(/^\s*sourceUrl:\s*"?(https?:\/\/[^"\s#]+)/m) ?? [])[1];
if (url && !/example\.com/.test(url)) {
  for (const f of ["header-styles.json", "nav.json", "sections.json"]) if (!existsSync(join(demo, f))) fail(`measurement missing: ${f}`, `Phase T3a: node harness/scripts/${f === "nav.json" ? "nav-extract.mjs" : f === "header-styles.json" ? "header-styles.mjs" : "section-capture.mjs"} --customer ${customer} --url ${url}`);
  const crops = existsSync(join(demo, "sections")) ? readdirSync(join(demo, "sections")).filter((x) => /\.(png|jpe?g)$/i.test(x)) : [];
  if (!crops.length) fail("no section crops in sections/", `node harness/scripts/section-capture.mjs --customer ${customer} --url ${url}`);
  const lookWaived = /BLOCKED after 2 attempts:.*(looks gate|rendering host|screenshot)/i.test(read(mt));
  if (!lookWaived) for (const f of ["header-styles.demo.json", "sections.demo.json"]) if (!existsSync(join(demo, f))) fail(`looks gate not run on the built site: ${f}`, "sitecore-create-demo-variants step 7 items 3 and 3b (needs the built page URL: rendering host or preview).");
  for (const [v, what] of [["header-styles.demo.verdict.json", "header"], ["sections.demo.verdict.json", "sections"]]) {
    const r = readJson(join(demo, v)); if (!r || lookWaived) continue;
    if (!r.pass && (r.attempts ?? 1) < 2) fail(`${what} looks gate failed (${(r.diffs ?? []).length} difference(s): ${(r.diffs ?? []).slice(0, 2).join("; ").slice(0, 160)})`, `Fix the SCSS/variant/measurement cause (never hand-edit the reference JSON to match), rebuild, re-run the ${what} compare once more; leftovers after that second run go to manual-tasks.md.`);
  }
  const man = readJson(join(demo, "images", "image-manifest.json"));
  if (!man) fail("images not downloaded (images/image-manifest.json missing)", `node harness/scripts/download-images.mjs ... from content-map.yaml (images come from sections.json images[] / backgroundImages)`);
  else if (String(ENV.CH_ENABLED).toLowerCase() === "true") {
    const items = []; (function walk(o) { if (o && typeof o === "object") { if ("uploadStatus" in o) items.push(o); for (const v of Object.values(o)) walk(v); } })(man);
    const bad = items.filter((i) => i.uploadStatus !== "uploaded" || !(i.publicUrl || i.imageFieldXml));
    if (!items.length || bad.length) fail(`Content Hub: ${items.length ? bad.length + " of " + items.length + " images not uploaded with a public link" : "no image uploaded"}`, `node harness/scripts/content-hub-upload.mjs ${customer} (retry), then attach each image's imageFieldXml to its datasource.`);
  }
}

// 7. progress
const prog = read(join(demo, "demo-progress.yaml"));
const open = [...prog.matchAll(/^\s*([A-Za-z0-9_]+):\s*\n?\s*status:\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started)"?/gim)].map((m) => `${m[1]}=${m[2]}`)
  .concat([...prog.matchAll(/^\s*(phase[A-Za-z0-9_.]*):\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started)"?\s*$/gim)].map((m) => `${m[1]}=${m[2]}`));
if (open.length) fail(`demo-progress.yaml has unfinished phases: ${open.slice(0, 6).join(", ")}`, "Do the first unfinished phase now.");

if (!fails.length) { console.log("✔ run gate passed: nothing the scripts can see is unfinished. Now hand over."); process.exit(0); }
console.log(`❌ RUN NOT FINISHED: ${fails.length} open item(s). Do NOT hand over, summarise or end the turn. Work through them in order and re-run this check.\n`);
fails.forEach((f, i) => console.log(`${i + 1}. ${f.what}\n   → ${f.next}`));
process.exit(4);
