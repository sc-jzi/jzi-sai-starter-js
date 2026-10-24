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
 *   6. looks gates were run on the built site: header-styles.demo.json, sections.demo.json, one per mirrored page.
 *      Each section verdict is scoped to the bands the plan builds on that page (liveSection) plus the FOOTER. The header band
 *      belongs to the header gate. The footer is built by the Footer partial and is ALWAYS compared: droppedLiveSections never hides it.
 *      A footer with fewer columns than the measured first row, missing those labels, still showing the Footer template sample, or a
 *      content-width miss on a built band is never waived by Looks leftovers.
 *   7. demo-progress.yaml has no pending / failed / in_progress / blocked phase
 *   8. placed-components.json lists the headless-main renderings, and they match demo-plan.yaml. A Looks leftovers bullet does not waive a mismatch.
 *      Header and footer renderings are never in it (they come from the partial designs, never from the page layout).
 *   9. site-manifest.json records the Header and Footer partial designs with the template id read back from Sitecore: {FD2059FD-...}.
 *  10. validate-site-plan.mjs still passes on the plan that was built (Rich Text only for prose, every live band built or dropped with a reason).
 *  11. component-crops.mjs passes: every planned section of every mirrored page (/Home included) has its live crop and a component of its shape.
 *  12. link-audit.mjs passes: no General Link / Image field anywhere in the site holds a literal value (Sitecore drops the datasource on it).
 *
 *   node harness/scripts/run-gate.mjs hook               Cursor stop-hook entry (see .cursor/hooks.json): restarts an approved, unfinished run automatically
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ENV, ROOT, die, demoDir, customerApp, readJson, registryPath, chromeBands, topLabels, PARTIAL_DESIGN_TEMPLATE, PARTIAL_DESIGN_FOLDER } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";


/* ---- hook mode: Cursor "stop" hook (.cursor/hooks.json). After approval, a run that is not finished is restarted automatically. ----
 * stdin: { status, loop_count, ... }. stdout: {} (let the turn end) or { followup_message } (Cursor submits it as the next user message). */
if (process.argv[2] === "hook") {
  const out = (o) => { process.stdout.write(JSON.stringify(o)); process.exit(0); };
  let input = {}; try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { /* no stdin */ }
  if (input.status && input.status !== "completed") out({});   // the SE pressed stop, or an error: never fight them
  // Only the run that `init` started (harness/.active-run.json) is ever restarted. Other approved but unfinished demos are never touched.
  let active = null; try { active = JSON.parse(readFileSync(join(ROOT, "harness", ".active-run.json"), "utf8")); } catch { /* none */ }
  if (!active?.customer || Date.now() - Date.parse(active.startedAt || 0) > 24 * 3600 * 1000) out({});   // no active run, or abandoned for a day
  const d = join(ROOT, "industry-verticals", active.customer, "docs", "ai", "demos", active.customer), plan = join(d, "demo-plan.yaml");
  if (!existsSync(plan) || !/^userApproved:\s*true/m.test(readFileSync(plan, "utf8")) || existsSync(join(d, ".run-complete"))) out({});
  // a run that stopped for the SE (Marketer MCP not connected, see demo-from-transcript T0) waits for /resume-demo: never auto-restart it
  try { if (/^\s*blockedOn:\s*"?\w/m.test(readFileSync(join(d, "demo-progress.yaml"), "utf8"))) out({}); } catch { /* no progress yet */ }
  const best = { c: active.customer, d };
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
  writeFileSync(join(ROOT, "harness", ".active-run.json"), JSON.stringify({ customer, startedAt: new Date().toISOString() }));   // the stop hook only restarts THIS run
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
  if (r.status !== 0) fail("variants-verify --strict does not pass (variant code missing, only an alias, or the footer has fewer columns than measured)", "Phase 5.5: write the real variant. A footer with fewer title fields than the measured first row is not a variant: build a component with one column per heading. Then re-run variants-verify --strict.");
} else fail("bootstrap-plan.json missing", `node harness/scripts/bootstrap-plan.mjs ${customer}`);

// 3. theme
const colors = read(join(app, "src/assets/sass/abstracts/vars/_colors.scss")), siteTheme = read(join(app, "src/lib/site-theme.ts"));
if (!colors.includes(`site-${customer}`) || !siteTheme.includes(customer)) fail(`theme not applied (site-${customer} missing in _colors.scss and/or site-theme.ts)`, "Phase 1+4: apply theme/theme.yaml to the app (sitecore-extract-theme / sitecore-build-demo phase 4).");

// 4 + 5 + 6. measurements, images, looks gates
const plan = read(join(demo, "demo-plan.yaml"));
let planObj = null;
try { planObj = plan ? parseYaml(plan) : null; } catch { planObj = null; }
const planPages = Array.isArray(planObj?.site?.pages) ? planObj.site.pages : [];
// the live band numbers the plan builds from one capture file (sections.json = /Home; other mirrored pages name their sectionsFile)
const plannedBands = (file) => new Set(planPages.filter((p) => (p?.sectionsFile ? String(p.sectionsFile) === file : file === "sections.json" && /^\/home$/i.test(String(p?.path ?? ""))))
  .flatMap((p) => (Array.isArray(p.sections) ? p.sections : [])).map((x) => Number(x?.liveSection)).filter((n) => n > 0));
const url = (plan.match(/^\s*sourceUrl:\s*"?(https?:\/\/[^"\s#]+)/m) ?? [])[1];
if (url && !/example\.com/.test(url)) {
  for (const f of ["header-styles.json", "nav.json", "sections.json"]) if (!existsSync(join(demo, f))) fail(`measurement missing: ${f}`, `Phase T3a: node harness/scripts/${f === "nav.json" ? "nav-extract.mjs" : f === "header-styles.json" ? "header-styles.mjs" : "section-capture.mjs"} --customer ${customer} --url ${url}`);
  const crops = existsSync(join(demo, "sections")) ? readdirSync(join(demo, "sections")).filter((x) => /\.(png|jpe?g)$/i.test(x)) : [];
  if (!crops.length) fail("no section crops in sections/", `node harness/scripts/section-capture.mjs --customer ${customer} --url ${url}`);
  const lookWaived = /BLOCKED after 2 attempts:.*(looks gate|rendering host|screenshot)/i.test(read(mt));
  if (!lookWaived) for (const f of ["header-styles.demo.json", "sections.demo.json"]) if (!existsSync(join(demo, f))) fail(`looks gate not run on the built site: ${f}`, "sitecore-create-demo-variants step 7 items 3 and 3b (needs the built page URL: rendering host or preview).");
  const dropped = new Set([...plan.matchAll(/^\s*droppedLiveSections:\s*\[([^\]]*)\]/gm)].flatMap((m) => m[1].split(",").map((x) => Number(x.trim()))));
  // every mirrored page (Home + each page with a sectionsFile) needs its own built-vs-live comparison
  const pageFiles = [...new Set([...plan.matchAll(/^\s*sectionsFile:\s*"?([\w.-]+\.json)/gm)].map((m) => m[1]))];
  const verdicts = [["header-styles.demo.verdict.json", "header"], ["sections.demo.verdict.json", "sections"], ...pageFiles.map((f) => [f.replace(/\.json$/, ".demo.verdict.json"), f.replace(/\.json$/, "")])];
  for (const [v, what] of verdicts) {
    if (!existsSync(join(demo, v))) { if (!lookWaived && pageFiles.some((f) => f.replace(/\.json$/, ".demo.verdict.json") === v)) fail(`looks gate not run for the mirrored page ${what}`, `node harness/scripts/section-capture.mjs --customer ${customer} --url <the BUILT page url> --out ${what}.demo.json --compare ${what}.json (then fix, one more pass)`); continue; }
    const r = readJson(join(demo, v)); if (!r) continue;
    // Scope: the bands this page's plan builds, plus the footer (built by the Footer partial, never droppable). The header band is the header gate's.
    // An earlier run listed the footer in droppedLiveSections and this filter then threw away "footer 600px (prospect 1140px)": never again.
    const refCap = what === "header" ? null : readJson(join(demo, `${what}.json`)), bands = chromeBands(refCap);
    const planned = what === "header" ? new Set() : plannedBands(`${what}.json`);
    const inScope = (d) => {
      if (what === "header" || /^SAMPLE\b/.test(d)) return true;
      const n = Number((String(d).match(/#(\d+)/) ?? [])[1]); if (!n) return true;
      if (/content width/i.test(d) && refCap?.sections?.find((x) => x.index === n)?.scroller) return false;   // a carousel's width is its hidden slides
      if (n === (r.footerIdx ?? bands.footerIdx)) return true;
      if (n === (r.headerIdx ?? bands.headerIdx)) return false;
      return planned.size ? planned.has(n) : !dropped.has(n);
    };
    const diffs = (r.diffs ?? []).filter(inScope);
    const structural = diffs.filter((d) => /^(COLUMNS|LABELS|SAMPLE)\b/.test(d) || /content width/i.test(d) || /not found in the demo/i.test(d));
    const soft = diffs.filter((d) => !structural.includes(d));
    if (structural.length) {
      const shown = structural.filter((d) => /content width/i.test(d)).concat(structural.filter((d) => !/content width/i.test(d))).slice(0, 8);
      fail(`${what} looks gate: the built page does not match the prospect's columns, labels, or content width (${shown.join("; ").slice(0, 500)})`, "Fix the component (or build the fit: new one) until the band matches, then re-run the compare. Never waived by Looks leftovers. The footer is always in scope: it is built by the Footer partial, and a 600px footer against a 1140px measurement is this failure.");
    }
    else if (lookWaived) continue;
    else if (soft.length && (r.attempts ?? 1) < 2) fail(`${what} looks gate failed (${soft.length} difference(s): ${soft.slice(0, 2).join("; ").slice(0, 160)})`, `Fix the SCSS/variant/measurement cause (never hand-edit the reference JSON to match), rebuild, re-run the ${what} compare once more.`);
    else if (soft.length && !/^##\s+Looks leftovers[\s\S]*?^\s*[-*]\s+\S/m.test(read(mt))) fail(`${what} looks gate still shows ${soft.length} difference(s) after ${r.attempts} runs and manual-tasks.md has no "Looks leftovers" list`, "Add a section `## Looks leftovers` to manual-tasks.md with one bullet per remaining difference (what differs, why it could not be matched).");
  }
  // every image the live site shows in the mirrored sections must be downloaded (and, below, uploaded)
  {
    const want = new Map();
    for (const f of readdirSync(demo).filter((x) => /^sections.*\.json$/.test(x) && !/\.demo\./.test(x))) {
      for (const sct of readJson(join(demo, f))?.sections ?? []) for (const im of [...(sct.images ?? []).map((x) => x.src), ...(sct.backgroundImages ?? [])]) {
        const u = String(im?.url ?? im ?? ""); if (!/^https?:/.test(u)) continue;
        let b = u.split("?")[0].split("/").pop(); try { b = decodeURIComponent(b); } catch { /* keep */ }
        want.set(b.toLowerCase().replace(/\.[a-z0-9]+$/, ""), u);
      }
    }
    const have = JSON.stringify(readJson(join(demo, "images", "image-manifest.json")) ?? []).toLowerCase().replace(/%20/g, " ");
    const absent = [...want].filter(([k]) => !have.includes(k.replace(/%20/g, " "))).map(([, u]) => u);
    if (absent.length) fail(`${absent.length} image(s) of the live sections are not in images/image-manifest.json (e.g. ${absent[0].slice(0, 90)})`, `Download every image of sections*.json (images[] and backgroundImages), then node harness/scripts/content-hub-upload.mjs ${customer} and attach each image to its datasource.`);
  }
  const man = readJson(join(demo, "images", "image-manifest.json"));
  if (!man) fail("images not downloaded (images/image-manifest.json missing)", `node harness/scripts/download-images.mjs ... from content-map.yaml (images come from sections.json images[] / backgroundImages)`);
  else if (String(ENV.CH_ENABLED).toLowerCase() === "true") {
    const items = []; (function walk(o) { if (o && typeof o === "object") { if ("uploadStatus" in o) items.push(o); for (const v of Object.values(o)) walk(v); } })(man);
    const bad = items.filter((i) => i.uploadStatus !== "uploaded" || !(i.publicUrl || i.imageFieldXml));
    if (!items.length || bad.length) fail(`Content Hub: ${items.length ? bad.length + " of " + items.length + " images not uploaded with a public link" : "no image uploaded"}`, `node harness/scripts/content-hub-upload.mjs ${customer} (retry), then attach each image's imageFieldXml to its datasource.`);
  }
}

// 6b. Footer shape and sample content, from the captures already on disk. Not waived by Looks leftovers.
{
  const live = readJson(join(demo, "sections.json"));
  const built = readJson(join(demo, "sections.demo.json"));
  if (live && built) {
    const want = topLabels(chromeBands(live).footer);
    const have = JSON.stringify(chromeBands(built).footer?.elements ?? []).toLowerCase();
    const missing = want.filter((t) => !have.includes(t.toLowerCase()));
    if (missing.length) fail(`footer is missing the prospect's columns (${missing.slice(0, 6).join(", ")})`, "The measured first row is the column headings. A variant with fewer title fields cannot hold them: build a component with one column per heading and fill it. A Looks leftovers bullet does not waive this.");
    for (const poison of ["Why PLAY! finance", "Copyright © Sitecore"]) if (JSON.stringify(built).includes(poison)) fail(`footer still shows the Footer template sample "${poison}"`, "Fill the footer datasource from the measured footer and read it back. A field still equal to the template standard value is not content.");
  }
}

const CHROME_RENDERINGS = /^(Eyebrow|Header|Navigation|NavigationHeader|SiteFooter|Footer)$/;
// 8. placed renderings match the plan. Not waived by Looks leftovers.
{
  const pages = planPages;
  const names = new Map();
  for (const blk of read(registryPath(customer)).split(/\n  - id:\s*/).slice(1)) {
    const id = blk.split(/\r?\n/)[0].trim();
    const name = (blk.match(/^\s*name:\s*"([^"]+)"/m) ?? [])[1];
    if (id && name) names.set(id, name);
  }
  const planned = (s) => (s?.new?.name ? String(s.new.name) : names.get(s?.component) || String(s?.component || ""));
  const withSections = pages.filter((p) => Array.isArray(p?.sections) && p.sections.length);
  if (withSections.length) {
    const placed = readJson(join(demo, "placed-components.json"));
    if (!placed) fail("placed-components.json missing", "demo-build-pages step 7: write it from get_components_on_page. Keys are plan paths (/Home). Values are the componentName list from headless-main only, in plan order. Do not substitute Rich Text for a planned component.");
    else for (const p of withSections) {
      const want = p.sections.map(planned).filter(Boolean);
      const got = placed[p.path];
      if (!Array.isArray(got)) fail(`${p.path} has no entry in placed-components.json`, `Record the headless-main componentName list for ${p.path}. The plan is ${want.join(", ")}.`);
      else if (got.some((n) => CHROME_RENDERINGS.test(n))) fail(`${p.path} has header/footer renderings in its own layout (${got.filter((n) => CHROME_RENDERINGS.test(n)).join(", ")})`, "Remove them from the page. Header and footer come only from the Header and Footer partial designs (template {FD2059FD-6043-4DFE-8C04-E2437CE87634}) via the Page Design. If the page shows no header, fix the partial and the Page Design mapping, never the page.");
      else if (got.join("|") !== want.join("|")) fail(`${p.path} renderings are ${got.join(", ") || "(none)"}; the plan is ${want.join(", ")}`, "Place the planned component, or build the one marked fit: new. Do not substitute Rich Text or put the layout in a Text field as HTML. Rewrite placed-components.json after the page matches. A Looks leftovers bullet does not waive this.");
    }
  }
}

// 9. Header and Footer are real partial designs, recorded with the template id READ BACK from Sitecore (not the id that was asked for)
{
  const sm = readJson(join(demo, "site-manifest.json"));
  if (sm) for (const part of ["Header", "Footer"]) {
    const e = sm.partialDesigns?.[part];
    const tpl = String(e?.templateId ?? "").trim().toUpperCase().replace(/^\{?/, "{").replace(/\}?$/, "}");
    if (!e) fail(`site-manifest.json has no ${part} partial design`, `demo-site-bootstrap step 5: create ${part} under <site>/Presentation/Partial Designs with template ${PARTIAL_DESIGN_TEMPLATE}, fill it, record it.`);
    else if (typeof e !== "object" || !e.templateId) fail(`site-manifest.json records the ${part} partial without its template id`, `Read the item back (get_content_item_by_id) and record partialDesigns.${part} = { id, templateId } from the read-back. It must be ${PARTIAL_DESIGN_TEMPLATE}.`);
    else if (tpl === PARTIAL_DESIGN_FOLDER) fail(`the ${part} "partial design" is a Partial Designs FOLDER (${PARTIAL_DESIGN_FOLDER}): it holds no layout and the Page Design cannot merge it`, `Create ${part} again with template ${PARTIAL_DESIGN_TEMPLATE}, move the renderings onto it, point the Page Designs at it, delete the folder item.`);
    else if (tpl !== PARTIAL_DESIGN_TEMPLATE) fail(`the ${part} partial design has template ${e.templateId}, not ${PARTIAL_DESIGN_TEMPLATE}`, `Create ${part} again with template ${PARTIAL_DESIGN_TEMPLATE}.`);
  }
}

// 10. the plan that was built still passes the plan rules (Rich Text only for prose, every live band built or dropped with a reason)
if (planObj) {
  const r = spawnSync(process.execPath, [join(ROOT, "harness/scripts/validate-site-plan.mjs"), customer], { encoding: "utf8" });
  if (r.status !== 0) fail(`validate-site-plan.mjs fails on the built plan: ${(r.stdout.match(/^❌.*$/gm) ?? []).slice(0, 3).join(" | ").slice(0, 400)}`, "Fix demo-plan.yaml (a band that is more than prose gets its own component: reuse or fit: new, never Rich Text), rebuild the affected sections, re-run.");
}

// 11. every mirrored section has its live crop and was planned with a component of its shape (component-crops.mjs, all pages, not only Home)
if (planPages.some((p) => p?.sectionsFile || /^\/home$/i.test(String(p?.path ?? "")))) {
  const r = spawnSync(process.execPath, [join(ROOT, "harness/scripts/component-crops.mjs"), customer], { encoding: "utf8" });
  if (r.status !== 0) fail(`component-crops: ${(r.stdout.match(/^✖.*$/gm) ?? []).slice(0, 3).join(" | ").slice(0, 400)}`, "Capture the missing page (section-capture --out sections-<slug>.json), and give every non-prose band its own component (reuse or fit: new). Then rebuild that section from its crop.");
}

// 12. no literal link / image values anywhere in the site (Sitecore drops the whole datasource: the component renders empty).
// Read from Sitecore itself (link-audit.mjs). Without an Authoring GraphQL client, the MCP sweep of demo-build-pages step 6 writes link-audit.json.
if (existsSync(join(demo, "site-manifest.json"))) {
  const r = spawnSync(process.execPath, [join(ROOT, "harness/scripts/link-audit.mjs"), customer], { encoding: "utf8" });
  const audit = readJson(join(demo, "link-audit.json"));
  if (r.status === 1) fail(`link-audit: ${(audit?.bad ?? []).length} link/image field(s) hold a literal value, so their components render empty (${(audit?.bad ?? []).slice(0, 2).map((b) => `${b.path.split("/").slice(-2).join("/")} · ${b.field}`).join("; ")})`, `Write each fix printed by node harness/scripts/link-audit.mjs ${customer} with update_fields_on_item (internal link = link-xml.mjs make --id, never a path), read back, re-run the audit.`);
  else if (r.status === 3 && !(audit?.source === "mcp" && Array.isArray(audit.bad) && !audit.bad.length && audit.linkFields > 0)) fail("link-audit not possible (no Authoring GraphQL client) and no clean MCP sweep recorded", "demo-build-pages step 6: read every datasource under <site>/Data and the partial designs' Data with the MCP, check each link field with link-xml.mjs check, fix, then write link-audit.json { source: \"mcp\", items, linkFields, bad: [] }.");
  else if (r.status !== 0 && r.status !== 3) fail(`link-audit could not run: ${(r.stderr || r.stdout).trim().slice(0, 200)}`, `node harness/scripts/link-audit.mjs ${customer}`);
}

// 7. progress
const prog = read(join(demo, "demo-progress.yaml"));
const open = [...prog.matchAll(/^\s*([A-Za-z0-9_]+):\s*\{?\s*\n?\s*status:\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started|blocked)"?/gim)].map((m) => `${m[1]}=${m[2]}`)
  .concat([...prog.matchAll(/^\s*(phase[A-Za-z0-9_.]*):\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started|blocked)"?\s*$/gim)].map((m) => `${m[1]}=${m[2]}`));
if (open.length) fail(`demo-progress.yaml has unfinished phases: ${open.slice(0, 6).join(", ")}`, "Do the first unfinished phase now.");

if (!fails.length) { console.log("✔ run gate passed: nothing the scripts can see is unfinished. Now hand over."); process.exit(0); }
console.log(`❌ RUN NOT FINISHED: ${fails.length} open item(s). Do NOT hand over, summarise or end the turn. Work through them in order and re-run this check.\n`);
fails.forEach((f, i) => console.log(`${i + 1}. ${f.what}\n   → ${f.next}`));
process.exit(4);
