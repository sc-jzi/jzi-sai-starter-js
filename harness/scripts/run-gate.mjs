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
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { ENV, ROOT, die, demoDir, customerApp, readJson } from "./_lib.mjs";

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
  for (const f of ["header-styles.demo.json", "sections.demo.json"]) if (!existsSync(join(demo, f))) fail(`looks gate not run on the built site: ${f}`, "sitecore-create-demo-variants step 7 items 3 and 3b (needs the built page URL: rendering host or preview).");
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
