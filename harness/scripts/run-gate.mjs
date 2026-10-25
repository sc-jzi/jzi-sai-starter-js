#!/usr/bin/env node
/**
 * Run gate: the run is NOT finished until `check` exits 0. It re-derives facts (Sitecore, the app's content endpoint, the rendered pages,
 * the build) instead of trusting files the agent writes. It also owns manual-tasks.md's fixed parts, the approval record and the block log.
 *
 *   node harness/scripts/run-gate.mjs init    <customer>                start of the run (idempotent): manual-tasks.md skeleton, arms the stop hook for THIS run
 *   node harness/scripts/run-gate.mjs approve <customer> story|plan     ONLY right after the SE said yes at gate 1 (story) / gate 2 (plan): records a hash of
 *                                                                      what was approved and sets storyApproved / userApproved. Any later change fails the gate.
 *   node harness/scripts/run-gate.mjs block   <customer> "<what>" -- <command ...>        runs the command and logs the attempt (blocked-log.jsonl)
 *   node harness/scripts/run-gate.mjs block   <customer> "<what>" --mcp <tool> --error "<error text>"   logs a failed Marketer MCP call
 *        A "BLOCKED after 2 attempts" line in manual-tasks.md only counts when blocked-log.jsonl holds two different failed attempts for that <what>.
 *   node harness/scripts/run-gate.mjs check   <customer> [--fast]       Exit 0 = done (writes .run-complete), 4 = unfinished work. --fast (the stop hook): typecheck
 *                                                                      instead of the full build, cached link audit; it never marks the run complete.
 *   node harness/scripts/run-gate.mjs hook                              Cursor stop-hook entry (.cursor/hooks.json)
 *
 * Failures are printed in FIX ORDER (the agent does the first one): build → plan & approvals → partial designs → links → placement → measurements & images
 * → looks → variants & theme → manual tasks → progress. Checks:
 *   build       the app builds (build-check.mjs; full in `check`, typecheck in `check --fast`)
 *   plan        the approved story and plan are unchanged since approval (approvals.json), validate-site-plan passes, component-crops passes
 *   partials    Header and Footer partial designs exist in Sitecore on template {FD2059FD-...} (read from Sitecore, not from a file)
 *   links       link-audit.mjs: no General Link / Image field in the site holds a literal value (needs the Authoring client; no self-reported fallback)
 *   placement   every planned page's headless-main renderings, read from the app's content endpoint (preview context = master), match the plan;
 *               no header/footer renderings on a page
 *   images      every live image is in the manifest and uploaded (Content Hub, or the Media Library when CH_ENABLED=false); files over 50 MB are
 *               not uploaded but listed under "## Missing assets" and their sections are not failed for missing imagery
 *   looks       measurements exist; EVERY verdict (header, /Home, each mirrored page) exists, is stamped (url, reference hash, build fingerprint),
 *               did not compare the prospect's own site, and is current. Structural diffs (COLUMNS/LABELS/SAMPLE/RENDER/IMAGES, content width,
 *               missing sections) always fail; a measurement difference fails until fixed or, after 2 fix attempts, accepted by the SE (looks-review.mjs, accept)
 *   variants    variants-verify --strict; theme applied
 *   manual      manual-tasks.md defers no core work (BLOCKED lines only with logged attempts)
 *   progress    demo-progress.yaml has no pending / failed / in_progress / blocked phase
 */
import { existsSync, readFileSync, writeFileSync, readdirSync, mkdirSync, appendFileSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ENV, ROOT, die, demoDir, customerApp, readJson, readRegistry, chromeBands, topLabels, isAdBand, edgeRoute, routeOf, authoringClient,
  fileHash, textHash, sourceFingerprint, PARTIAL_DESIGN_TEMPLATE, PARTIAL_DESIGN_FOLDER } from "./_lib.mjs";
import { parseYaml } from "./_yaml.mjs";
import { looksState, diffId, ACCEPTED_FILE } from "./_looks.mjs";

const SELF = fileURLToPath(import.meta.url), win = process.platform === "win32";
const node = (script, args, timeout) => spawnSync(process.execPath, [join(ROOT, "harness/scripts", script), ...args], { encoding: "utf8", timeout, maxBuffer: 32 * 1024 * 1024 });
const timedOut = (r) => r.error?.code === "ETIMEDOUT" || r.signal === "SIGTERM";
const ACTIVE = join(ROOT, "harness", ".active-run.json");   // git-ignored: which run the stop hook may restart

/* ---- hook mode: Cursor "stop" hook (.cursor/hooks.json, timeout 120 s). Runs the FAST gate within 100 s. ----
 * stdin: { status, loop_count, ... }. stdout: {} (let the turn end) or { followup_message } (Cursor submits it as the next user message). */
if (process.argv[2] === "hook") {
  const out = (o) => { process.stdout.write(JSON.stringify(o)); process.exit(0); };
  let input = {}; try { input = JSON.parse(readFileSync(0, "utf8") || "{}"); } catch { /* no stdin */ }
  if (input.status && input.status !== "completed") out({});   // the SE pressed stop, or an error: never fight them
  // Only the run that `init` started is ever restarted. Other approved but unfinished demos are never touched.
  let active = null; try { active = JSON.parse(readFileSync(ACTIVE, "utf8")); } catch { /* none */ }
  if (!active?.customer || Date.now() - Date.parse(active.startedAt || 0) > 24 * 3600 * 1000) out({});   // no active run, or abandoned for a day
  const d = join(ROOT, "industry-verticals", active.customer, "docs", "ai", "demos", active.customer), plan = join(d, "demo-plan.yaml");
  if (!existsSync(plan) || !/^userApproved:\s*true/m.test(readFileSync(plan, "utf8")) || existsSync(join(d, ".run-complete"))) out({});
  // the SE is deciding on measurement differences (looks-review.mjs): wait for the answer, do not restart
  if (existsSync(join(d, ".awaiting-se"))) out({});
  // a run that stopped for the SE (Marketer MCP not connected, see demo-from-transcript T0) waits for /resume-demo: never auto-restart it
  try { if (/^\s*blockedOn:\s*"?marketer-mcp-auth/m.test(readFileSync(join(d, "demo-progress.yaml"), "utf8"))) out({}); } catch { /* no progress yet */ }
  const c = active.customer, n = Number(input.loop_count ?? 0) + 1;
  const r = spawnSync(process.execPath, [SELF, "check", c, "--fast"], { encoding: "utf8", timeout: 100000 });
  if (timedOut(r)) out({ followup_message: `The demo run for "${c}" is NOT finished (automatic restart ${n}). The fast gate did not finish within the hook's time. Run \`node harness/scripts/run-gate.mjs check ${c}\` yourself (it can take minutes), do the first failing item, and keep going until it exits 0.` });
  if (r.status === 0) out({ followup_message: `The fast gate passes for "${c}" (automatic restart ${n}). Now run the FULL gate: \`node harness/scripts/run-gate.mjs check ${c}\` (full build). When it exits 0 it marks the run complete; then hand over. If it fails, do the first failing item.` });
  out({ followup_message: `The demo run for "${c}" is NOT finished (automatic restart ${n}). Do not summarise or hand over. Do the FIRST item below now, then run \`node harness/scripts/run-gate.mjs check ${c}\` again; keep going until it exits 0. If an item needs a decision only the SE can make, ask that one question.\n\n${(r.stdout || "").trim().slice(0, 1500)}` });
}

const args = process.argv.slice(2), flagged = (f) => args.includes(f);
const [cmd, customer, third] = args.filter((a) => !a.startsWith("--"));
if (!["init", "check", "approve", "block", "accept"].includes(cmd) || !customer) die("usage: run-gate.mjs <init|check|approve|block> <customer> ... (see the header)");
const demo = demoDir(customer), app = customerApp(customer, { mustExist: false });
const mt = join(demo, "manual-tasks.md"), planFile = join(demo, "demo-plan.yaml"), approvalsFile = join(demo, "approvals.json"), blockLog = join(demo, "blocked-log.jsonl");
const read = (p) => { try { return readFileSync(p, "utf8"); } catch { return ""; } };
const planText = read(planFile);
let planObj = null; try { planObj = planText ? parseYaml(planText) : null; } catch { planObj = null; }

// what an approval pins: the story; the site plan plus the live URL it mirrors (deleting sourceUrl would switch the visual gates off)
const stable = (v) => (Array.isArray(v) ? `[${v.map(stable).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(",")}}` : JSON.stringify(v ?? null));
const storyHash = () => textHash(stable(planObj?.story ?? null));
const planHash = () => textHash(stable({ site: planObj?.site ?? null, sourceUrl: planObj?.client?.sourceUrl ?? null }));

/* ---- init ---- */
const ALWAYS = `## Always (every demo)
- [ ] Add site thumbnail
- [ ] Add partial thumbnails
- [ ] Update layout icons (only if a NEW component was created, rather than new variants)
`;
const SKELETON = `# Manual tasks — ${customer}

${ALWAYS}
## Open (only what the tools could not do)
Core build work is never listed here: partial designs, page designs, templates, datasources, variants, theme, images, navigation flags and display names are BUILT by the run.
A line belongs here only as \`- [ ] <what> — BLOCKED after 2 attempts: "<error text>"\`, and only after both attempts were logged with \`run-gate.mjs block\`.

## Needs a person
(editing host, anything that needs a login or a device the tools cannot reach)

## Missing assets
(written by the upload scripts: files too large for Experience Edge, with where they belong)

## Assumptions
Only decisions that the prospect's site, the transcript and the SE did not make. Never a statement about what the demo is or mirrors.
`;
if (cmd === "init") {
  mkdirSync(demo, { recursive: true });
  const cur = read(mt);
  if (!cur) writeFileSync(mt, SKELETON);
  else if (!/^## Always \(every demo\)/m.test(cur)) writeFileSync(mt, cur.replace(/\s*$/, "\n\n") + ALWAYS);
  writeFileSync(ACTIVE, JSON.stringify({ customer, startedAt: new Date().toISOString() }));   // the stop hook only restarts THIS run
  console.log(`✔ ${mt.slice(ROOT.length + 1).replace(/\\/g, "/")} ready (fixed "Always" section in place); stop hook armed for ${customer}`);
  process.exit(0);
}

/* ---- approve: pin what the SE approved ---- */
if (cmd === "approve") {
  if (!["story", "plan"].includes(third)) die("usage: run-gate.mjs approve <customer> story|plan");
  if (!planObj) die("demo-plan.yaml missing or unreadable");
  const ap = readJson(approvalsFile, {}), now = new Date().toISOString();
  if (third === "plan" && (!ap.story || ap.story.hash !== storyHash())) die("The story is not approved in its current form: show it to the SE (story gate), then `approve <customer> story` first.", 1);
  ap[third] = { hash: third === "story" ? storyHash() : planHash(), at: now };
  writeFileSync(approvalsFile, JSON.stringify(ap, null, 2) + "\n");
  // the flags are written by this script, never by hand
  const set = (t, key, val) => (new RegExp(`^${key}:.*$`, "m").test(t) ? t.replace(new RegExp(`^${key}:.*$`, "m"), `${key}: ${val}`) : `${key}: ${val}\n${t}`);
  let t = read(planFile);
  if (third === "story") t = set(set(t, "storyApprovedAt", `"${now}"`), "storyApproved", "true");
  else t = set(set(t, "approvedAt", `"${now}"`), "userApproved", "true");
  writeFileSync(planFile, t);
  console.log(`✔ ${third} approval recorded (${now}). Any later change to the ${third} fails the gate until the SE approves it again.`);
  process.exit(0);
}

/* ---- accept: record the SE's answer to the looks review (looks-review.mjs wrote the numbered list) ---- */
if (cmd === "accept") {
  const pick = third, answerAt = args.indexOf("--answer"), answer = answerAt >= 0 ? args[answerAt + 1] : null;
  if (!pick || !answer) die(`usage: run-gate.mjs accept <customer> all|none|<numbers, e.g. 1,3> --answer "<the SE's words>"`);
  const review = readJson(join(demo, "looks-review.json"));
  if (!review?.items?.length) die("no looks-review.json: run node harness/scripts/looks-review.mjs <customer> and ask the SE first", 1);
  const nums = pick === "all" ? review.items.map((i) => i.n) : pick === "none" ? [] : String(pick).split(/[^0-9]+/).filter(Boolean).map(Number);
  const unknown = nums.filter((n) => !review.items.some((i) => i.n === n));
  if (unknown.length) die(`no item ${unknown.join(", ")} in the review (it has 1-${review.items.length})`, 1);
  const file = join(demo, ACCEPTED_FILE), cur = readJson(file, { accepted: [] }), now = new Date().toISOString();
  for (const it of review.items.filter((i) => nums.includes(i.n))) {
    // one item is one section: accepting it accepts each of its differences, pinned to the measurement it came from
    it.ids.forEach((id, k) => { if (!cur.accepted.some((a) => a.id === id)) cur.accepted.push({ id, what: it.what, ref: it.ref, refHash: fileHash(join(demo, it.ref)), page: it.label, diff: it.diffs[k], answer, acceptedAt: now }); });
  }
  writeFileSync(file, JSON.stringify(cur, null, 2) + "\n");
  try { unlinkSync(join(demo, ".awaiting-se")); } catch { /* not waiting */ }
  console.log(`✔ ${nums.length} of ${review.items.length} section(s) accepted by the SE${nums.length < review.items.length ? "; the others stay open: keep fixing them" : ""}. They are listed in the hand-over.`);
  process.exit(0);
}

/* ---- block: log one failed attempt ---- */
if (cmd === "block") {
  const what = third; if (!what) die('usage: run-gate.mjs block <customer> "<what>" -- <command ...>  |  --mcp <tool> --error "<text>"');
  let entry;
  const dd = args.indexOf("--");
  if (dd >= 0) {
    const [c0, ...rest] = args.slice(dd + 1); if (!c0) die("nothing to run after --");
    const r = spawnSync(c0, rest, { encoding: "utf8", shell: win, timeout: 300000 });
    entry = { what, kind: "command", attempt: [c0, ...rest].join(" "), exit: r.status, error: `${r.stderr || ""}${r.stdout || ""}`.trim().slice(-400) };
    if (r.status === 0) { console.log("The command succeeded: nothing is blocked. Carry on with the build."); process.exit(0); }
  } else {
    const tool = args[args.indexOf("--mcp") + 1], error = args[args.indexOf("--error") + 1];
    if (!args.includes("--mcp") || !tool || !args.includes("--error") || !error) die('usage: run-gate.mjs block <customer> "<what>" --mcp <tool> --error "<exact error text>"');
    entry = { what, kind: "mcp", attempt: tool, exit: null, error: error.slice(0, 400) };
  }
  appendFileSync(blockLog, JSON.stringify({ ...entry, at: new Date().toISOString() }) + "\n");
  const n = new Set(read(blockLog).split(/\r?\n/).filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter((e) => e && e.what.toLowerCase() === what.toLowerCase()).map((e) => e.attempt)).size;
  console.log(`logged attempt ${n} for "${what}"${n >= 2 ? `: two different attempts failed, a manual-tasks line "… ${what} … BLOCKED after 2 attempts: \\"<error>\\"" is now accepted` : ": try a DIFFERENT route next"}`);
  process.exit(0);
}

/* ---- check ---- */
const fast = flagged("--fast");
const STAGES = ["build", "plan", "partials", "links", "placement", "content", "images", "looks", "variants", "manual", "progress"];
const fails = [];
let stage = "build";
const fail = (what, next) => fails.push({ stage, what, next });

// logged attempts: "<what>" -> distinct failed attempts
const blocked = new Map();
for (const l of read(blockLog).split(/\r?\n/).filter(Boolean)) { try { const e = JSON.parse(l); if (e?.what) { const k = e.what.toLowerCase(); blocked.set(k, (blocked.get(k) ?? new Set()).add(e.attempt)); } } catch { /* skip */ } }
const loggedBlock = (text) => [...blocked].some(([what, attempts]) => attempts.size >= 2 && String(text).toLowerCase().includes(what));
const mtText = read(mt);
const sourceUrl = String(planObj?.client?.sourceUrl ?? (planText.match(/^\s*sourceUrl:\s*"?(https?:\/\/[^"\s#]+)/m) ?? [])[1] ?? "");
const hasLive = /^https?:\/\//.test(sourceUrl) && !/example\.com/.test(sourceUrl);
const lookWaived = [...blocked].some(([what, attempts]) => attempts.size >= 2 && /looks gate|rendering host|screenshot/.test(what));
const planPages = Array.isArray(planObj?.site?.pages) ? planObj.site.pages : [];
let names = new Map();
try { names = new Map([...readRegistry(customer)].map(([id, e]) => [id, e.name])); } catch { /* reported by validate-site-plan */ }
const plannedName = (s) => (s?.new?.name ? String(s.new.name) : names.get(s?.component) || String(s?.component || ""));
const manifest = readJson(join(demo, "images", "image-manifest.json"));
const manifestItems = []; (function walk(o) { if (o && typeof o === "object") { if ("uploadStatus" in o || "localFileName" in o) manifestItems.push(o); for (const v of Object.values(o)) walk(v); } })(manifest);
const tooLarge = new Set(manifestItems.filter((i) => i.uploadStatus === "too-large").map((i) => String(i.src ?? "").split("?")[0]));

// build
stage = "build";
if (existsSync(join(app, "package.json"))) {
  const r = node("build-check.mjs", [customer, "--if-changed", ...(fast ? ["--quick"] : [])], fast ? 80000 : 900000);
  if (timedOut(r)) fail(`build-check did not finish (${fast ? "typecheck" : "full build"} timed out)`, `node harness/scripts/build-check.mjs ${customer}`);
  else if (r.status === 2) fail("the app's dependencies are not installed", `npm install in industry-verticals/${customer}`);
  else if (r.status !== 0) fail(`the app does not ${fast ? "typecheck" : "build"}: ${(r.stdout.match(/^\s{2}\S.*$/gm) ?? []).slice(0, 3).map((l) => l.trim()).join(" | ").slice(0, 400) || r.stdout.trim().slice(-300)}`, `Fix the errors, then node harness/scripts/build-check.mjs ${customer}. Never commit or hand over an app that does not build (the pre-commit hook refuses it too).`);
}

// plan: approvals pinned, plan rules, crops
stage = "plan";
if (planObj) {
  const ap = readJson(approvalsFile, {});
  if (planObj.userApproved === true || planObj.storyApproved === true) {
    if (!ap.story) fail("the story approval is not recorded (approvals.json)", `After the SE approved the story (gate 1): node harness/scripts/run-gate.mjs approve ${customer} story. Never set storyApproved by hand.`);
    else if (ap.story.hash !== storyHash()) fail("the story changed after the SE approved it", `Show the SE what changed (story gate); after their yes: node harness/scripts/run-gate.mjs approve ${customer} story`);
  }
  if (planObj.userApproved === true) {
    if (!ap.plan) fail("the plan approval is not recorded (approvals.json)", `After the SE approved the plan (gate 2): node harness/scripts/run-gate.mjs approve ${customer} plan. Never set userApproved by hand.`);
    else if (ap.plan.hash !== planHash()) fail("the plan changed after the SE approved it (sections, components, droppedLiveSections or sourceUrl)", `Show the SE what changed and why; after their yes: node harness/scripts/run-gate.mjs approve ${customer} plan. Never change the plan to make a check pass.`);
    if (ap.story && ap.plan && ap.story.at > ap.plan.at) fail("the plan was approved before the story", `Approve the story first (gate 1), then show the plan again (gate 2).`);
  }
  const v = node("validate-site-plan.mjs", [customer], 60000);
  if (v.status !== 0) fail(`validate-site-plan.mjs fails: ${(v.stdout.match(/^❌.*$/gm) ?? []).slice(0, 3).join(" | ").slice(0, 400)}`, "Fix demo-plan.yaml (a band that is more than prose gets its own component: reuse or fit: new, never Rich Text) WITH the SE (it changes the approved plan), rebuild the affected sections, re-run.");
  if (planPages.some((p) => p?.sectionsFile || /^\/home$/i.test(String(p?.path ?? "")))) {
    const r = node("component-crops.mjs", [customer], 60000);
    if (r.status !== 0) fail(`component-crops: ${(r.stdout.match(/^✖.*$/gm) ?? []).slice(0, 3).join(" | ").slice(0, 400)}`, "Capture the missing page (section-capture --out sections-<slug>.json), and give every non-prose band its own component (reuse or fit: new). Then rebuild that section from its crop.");
  }
}

// partial designs, read from Sitecore
stage = "partials";
const site = readJson(join(demo, "site.json"));
let gql = null, gqlError = null;
if (site) { try { gql = await authoringClient(); } catch (e) { gqlError = e.message; } }
if (site && !gql) fail(`no Authoring GraphQL access (${gqlError ?? "SITECORE_CM_HOST / SITECORE_AUTOMATION_CLIENT_ID / _SECRET missing in harness/.env.local"})`, "node harness/scripts/env-check.mjs: the gate reads partial designs and link fields from Sitecore itself; it has no self-reported fallback.");
if (site && gql) {
  // What renders header and footer is what each Page Design references in its PartialDesigns field: read those items, not names on disk
  const path = `/sitecore/content/${site.collection}/${site.siteName}/Presentation/Page Designs`;
  const g = (id) => `{${String(id ?? "").replace(/[{}-]/g, "").toUpperCase().replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, "$1-$2-$3-$4-$5")}}`;
  try {
    const d = await gql(`query($p:String!){ item(where:{path:$p,database:"master"}){ children{ nodes{ name fields(ownFields:false){ nodes{ name value } } } } } }`, { p: path });
    const designs = d?.item?.children?.nodes ?? [];
    if (!d?.item || !designs.length) fail(`no Page Designs under ${path}`, "demo-site-bootstrap step 5: create the Page Designs listing the Header and Footer partial designs, and map them to the page templates.");
    const cache = new Map();
    const partial = async (id) => { if (!cache.has(id)) cache.set(id, (await gql(`query($id:ID!){ item(where:{itemId:$id,database:"master"}){ name path template{ templateId } } }`, { id }))?.item ?? null); return cache.get(id); };
    for (const pd of designs) {
      const ids = String(pd.fields.nodes.find((f) => f.name === "PartialDesigns")?.value ?? "").split("|").map((x) => x.trim()).filter(Boolean);
      const items = (await Promise.all(ids.map(partial))).map((it, i) => ({ id: ids[i], it, tpl: it ? g(it.template?.templateId) : null }));
      for (const x of items) {
        if (!x.it) fail(`Page Design ${pd.name} references ${x.id}, which does not exist`, "Remove the reference or point it at the real partial design.");
        else if (x.tpl === PARTIAL_DESIGN_FOLDER) fail(`Page Design ${pd.name} references "${x.it.name}", a Partial Designs FOLDER (${PARTIAL_DESIGN_FOLDER}): it holds no layout`, `Point it at a partial design on ${PARTIAL_DESIGN_TEMPLATE}.`);
        else if (x.tpl !== PARTIAL_DESIGN_TEMPLATE) fail(`Page Design ${pd.name} references "${x.it.name}" on template ${x.tpl}, not a partial design (${PARTIAL_DESIGN_TEMPLATE})`, `Point it at a partial design on ${PARTIAL_DESIGN_TEMPLATE}.`);
      }
      for (const part of ["header", "footer"]) if (!items.some((x) => x.tpl === PARTIAL_DESIGN_TEMPLATE && new RegExp(part, "i").test(x.it?.name ?? ""))) fail(`Page Design ${pd.name} has no ${part} partial design (PartialDesigns lists ${items.map((x) => x.it?.name ?? x.id).join(", ") || "nothing"})`, `demo-site-bootstrap step 5: create the ${part} partial design on ${PARTIAL_DESIGN_TEMPLATE} and add it to every Page Design. Never copy the ${part} onto the pages.`);
    }
  } catch (e) { fail(`Page Designs / partial designs could not be read: ${e.message.slice(0, 160)}`, "Check the Authoring client and the CM host, then re-run."); }
}

// links (no self-reported fallback; the fast gate reuses a recent clean audit)
stage = "links";
if (site) {
  const prev = readJson(join(demo, "link-audit.json"));
  const fresh = fast && prev && Array.isArray(prev.bad) && !prev.bad.length && !(prev.unreadable ?? []).length && Date.now() - Date.parse(prev.at || 0) < 20 * 60 * 1000;
  if (!fresh) {
    const r = node("link-audit.mjs", [customer], 90000), audit = readJson(join(demo, "link-audit.json"));
    if (timedOut(r)) fail("link-audit did not finish in time", `node harness/scripts/link-audit.mjs ${customer}`);
    else if (r.status === 1) fail(`link-audit: ${(audit?.bad ?? []).length} link/image field(s) hold a literal value, so their components render empty (${(audit?.bad ?? []).slice(0, 2).map((b) => `${b.path.split("/").slice(-2).join("/")} · ${b.field}`).join("; ")})`, `Write each fix printed by node harness/scripts/link-audit.mjs ${customer} with update_fields_on_item (internal link = link-xml.mjs make --id, never a path), read back, re-run the audit.`);
    else if (r.status === 3) fail("link-audit needs the Authoring GraphQL client (SITECORE_CM_HOST + automation client in harness/.env.local)", "node harness/scripts/env-check.mjs; there is no self-reported fallback.");
    else if (r.status !== 0) fail(`link-audit could not complete: ${(r.stderr || r.stdout).trim().split(/\r?\n/).pop()?.slice(0, 200)}`, `node harness/scripts/link-audit.mjs ${customer}`);
  }
}

// placement, read from the app's content endpoint (the preview context in the app's .env.local serves master: no publish needed)
const CHROME_RENDERINGS = /^(Eyebrow|Header|Navigation|NavigationHeader|SiteFooter|Footer)$/;
stage = "placement";
const pageRoutes = new Map();   // plan path -> served route, reused by the content checks
{
  const withSections = planPages.filter((p) => Array.isArray(p?.sections) && p.sections.length);
  if (withSections.length && site) {
    let routes = null;
    try { routes = await Promise.all(withSections.map((p) => edgeRoute(customer, routeOf(p.path)))); } catch (e) { fail(`the app's content endpoint could not be reached: ${e.message.slice(0, 120)}`, "Check the network and the context id in the app's .env.local, then re-run."); }
    if (routes && routes.some((r) => r === undefined)) fail(`the app's .env.local has no content context id or site name (SITECORE_EDGE_CONTEXT_ID, NEXT_PUBLIC_DEFAULT_SITE_NAME)`, `demo-new-site: write industry-verticals/${customer}/.env.local. The gate reads placements from the app's content endpoint; it has no file fallback.`);
    else if (routes) withSections.forEach((p, i) => {
      const r = routes[i], want = p.sections.map(plannedName).filter(Boolean);
      if (r) pageRoutes.set(p.path, r);
      if (r === null) { fail(`${p.path} is not served by the app's content endpoint`, "Create the page (or fix its name/path); check the site name and context id in the app's .env.local."); return; }
      // PartialDesignDynamicPlaceholder is how a page design injects a partial (e.g. an Event Hero) into the body: count what it contains, in place
      const expand = (list) => (list ?? []).flatMap((c) => (c.componentName === "PartialDesignDynamicPlaceholder" ? Object.values(c.placeholders ?? {}).flatMap(expand) : c.componentName ? [c.componentName] : []));
      const got = expand(r.placeholders?.["headless-main"]);
      if (got.some((n) => CHROME_RENDERINGS.test(n))) fail(`${p.path} has header/footer renderings in its own layout (${got.filter((n) => CHROME_RENDERINGS.test(n)).join(", ")})`, "Remove them from the page. Header and footer come only from the Header and Footer partial designs (template {FD2059FD-6043-4DFE-8C04-E2437CE87634}) via the Page Design. If the page shows no header, fix the partial and the Page Design mapping, never the page.");
      else if (got.join("|") !== want.join("|")) fail(`${p.path} renderings are ${got.join(", ") || "(none)"}; the plan is ${want.join(", ")}`, "Place the planned component, or build the one marked fit: new. Do not substitute Rich Text or put the layout in a Text field as HTML. Nothing in manual-tasks.md waives this.");
    });
  }
}

// content rules that used to be prose only, read from Sitecore: display names, navigation flags, no page-local Data, datasources under the site's Data
stage = "content";
if (site && gql && planPages.length) {
  const sitePath = `/sitecore/content/${site.collection}/${site.siteName}`;
  const G = (id) => String(id ?? "").replace(/[{}-]/g, "").toUpperCase();
  const listFail = (items, what, next) => { if (items.length) fail(`${what}: ${items.slice(0, 4).join("; ")}${items.length > 4 ? ` (+${items.length - 4} more)` : ""}`, next); };
  try {
    const mainNav = (await gql(`query($p:String!){ item(where:{path:$p,database:"master"}){ itemId } }`, { p: "/sitecore/system/Settings/Foundation/Experience Accelerator/Navigation/Navigation Filters/Main Navigation" }))?.item?.itemId;
    const items = await Promise.all(planPages.map((p) => gql(`query($p:String!){ item(where:{path:$p,database:"master",language:"en"}){ displayName fields(ownFields:false){ nodes{ name value } } children{ nodes{ name children{ nodes{ itemId } } } } } }`, { p: sitePath + p.path }).then((d) => d?.item ?? null).catch(() => null)));
    const titleCase = (n) => String(n).split("-").map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w)).join(" ");
    const names = [], nav = [], local = [];
    planPages.forEach((p, i) => {
      const it = items[i]; if (!it) return;   // a missing page is reported by placement
      // display name: the plan's displayName, else the mechanical Title Case of the item name (what-is-corrosion -> What Is Corrosion)
      const want = p.displayName ? String(p.displayName) : titleCase(String(p.path).split("/").pop());
      if (String(it.displayName) !== want) names.push(`${p.path} "${it.displayName}" (plan "${want}")`);
      // navigation: only navGroup main pages directly under /Home are visible in the main navigation; every other page has Main Navigation ticked
      if (mainNav) {
        const ticked = String(it.fields.nodes.find((f) => f.name === "NavigationFilter")?.value ?? "").split("|").map(G).includes(G(mainNav));
        const visible = p.navGroup === "main" && String(p.path).split("/").filter(Boolean).length === 2;
        if (visible === ticked) nav.push(`${p.path} is ${ticked ? "hidden from" : "shown in"} the main navigation (navGroup ${p.navGroup ?? "none"})`);
      }
      const data = it.children.nodes.find((c) => c.name.toLowerCase() === "data");
      if (data?.children?.nodes?.length) local.push(`${p.path}/Data (${data.children.nodes.length} item(s))`);
    });
    listFail(names, "display names differ from the plan", "Set __Display name in en (update_fields_on_item) to the plan's displayName, read it back.");
    listFail(nav, "navigation flags are wrong", "NavigationFilter: tick Main Navigation on every page except navGroup: main pages directly under Home (demo-site-bootstrap step 5b).");
    listFail(local, "pages hold page-local datasource items", "Move each item under <site>/Data/<component folder> (create it there, set_component_datasource), then delete the page's Data folder once get_content_references shows 0.");
    // every datasource a page renders lives under the site's Data (or a partial design's own Data)
    const dsIds = new Map();
    const walk = (list, path) => { for (const c of list ?? []) { if (c.dataSource) dsIds.set(String(c.dataSource), `${path} ${c.componentName}`); for (const sub of Object.values(c.placeholders ?? {})) walk(sub, path); } };
    for (const [path, r] of pageRoutes) for (const list of Object.values(r.placeholders ?? {})) walk(list, path);
    const outside = [];
    await Promise.all([...dsIds].map(async ([id, where]) => {
      if (/^local:/i.test(id)) { outside.push(`${where} uses a page-local datasource (${id})`); return; }
      const it = (await gql(`query($id:ID!){ item(where:{itemId:$id,database:"master"}){ path } }`, { id }).catch(() => null))?.item;
      const pth = String(it?.path ?? "").toLowerCase(), root = sitePath.toLowerCase();
      // allowed: the site's Data, a partial design's own Data (Presentation), and Home itself (Navigation's datasource is the navigation root)
      if (it && !pth.startsWith(`${root}/data/`) && !pth.startsWith(`${root}/presentation/`) && pth !== `${root}/home`) outside.push(`${where} → ${it.path}`);
    }));
    listFail(outside, "datasources outside the site's Data folder", "Recreate the item under <site>/Data/<component folder> (create_content_item), point the component at it (set_component_datasource), read back.");
  } catch (e) { fail(`content checks could not read Sitecore: ${e.message.slice(0, 160)}`, "Check the Authoring client and the CM host, then re-run."); }
}

// measurements and images
stage = "images";
if (hasLive) {
  for (const f of ["header-styles.json", "nav.json", "sections.json"]) if (!existsSync(join(demo, f))) fail(`measurement missing: ${f}`, `Phase T3a: node harness/scripts/${f === "nav.json" ? "nav-extract.mjs" : f === "header-styles.json" ? "header-styles.mjs" : "section-capture.mjs"} --customer ${customer} --url ${sourceUrl}`);
  const crops = existsSync(join(demo, "sections")) ? readdirSync(join(demo, "sections")).filter((x) => /\.(png|jpe?g)$/i.test(x)) : [];
  if (!crops.length) fail("no section crops in sections/", `node harness/scripts/section-capture.mjs --customer ${customer} --url ${sourceUrl}`);
  const want = new Map();
  for (const f of readdirSync(demo).filter((x) => /^sections.*\.json$/.test(x) && !/\.demo\./.test(x))) {
    for (const sct of readJson(join(demo, f))?.sections ?? []) for (const im of [...(sct.images ?? []).map((x) => x.src), ...(sct.backgroundImages ?? [])]) {
      const u = String(im?.url ?? im ?? ""); if (!/^https?:/.test(u)) continue;
      let b = u.split("?")[0].split("/").pop(); try { b = decodeURIComponent(b); } catch { /* keep */ }
      want.set(b.toLowerCase().replace(/\.[a-z0-9]+$/, ""), u);
    }
  }
  const have = JSON.stringify(manifest ?? []).toLowerCase().replace(/%20/g, " ");
  const absent = [...want].filter(([k]) => !have.includes(k.replace(/%20/g, " "))).map(([, u]) => u);
  if (!manifest) fail("images not collected (images/image-manifest.json missing)", `node harness/scripts/collect-images.mjs ${customer} (every image of every planned section, traced to its page and section)`);
  else if (absent.length) fail(`${absent.length} image(s) of the live sections are not in images/image-manifest.json (e.g. ${absent[0].slice(0, 90)})`, `node harness/scripts/collect-images.mjs ${customer}, upload (content-hub-upload.mjs / media-upload.mjs), then node harness/scripts/attach-images.mjs ${customer} and write each proposed field with the MCP (uploaded is not attached).`);
  if (manifest) {
    const ch = String(ENV.CH_ENABLED).toLowerCase() === "true";
    const notUp = manifestItems.filter((i) => i.uploadStatus !== "too-large" && !(i.uploadStatus === "uploaded" && i.imageFieldXml));
    if (!manifestItems.length || notUp.length) fail(`${ch ? "Content Hub" : "Media Library"}: ${manifestItems.length ? `${notUp.length} of ${manifestItems.length} images not uploaded` : "no image uploaded"}`, `node harness/scripts/${ch ? "content-hub-upload.mjs" : "media-upload.mjs"} ${customer} (retries; files over 50 MB are listed under "## Missing assets" instead), then attach-images.mjs ${customer} --apply.`);
  }
}

// looks: every verdict required, stamped, current (_looks.mjs). Build gaps always fail; a measurement difference fails until it is fixed or,
// after two fix attempts, accepted by the SE through the review page (looks-review.mjs → run-gate.mjs accept). Nothing the agent writes waives it.
stage = "looks";
const looks = hasLive ? looksState(customer, planObj, { tooLarge }) : { problems: [], findings: [], acceptedNow: [] };
if (hasLive) {
  const rerun = `node harness/scripts/looks-gates.mjs ${customer} (the app must run: npm run dev in industry-verticals/${customer})`;
  if (!lookWaived) for (const p of looks.problems) fail(p.what, p.next);
  const byPage = new Map();
  for (const f of looks.findings) { if (!byPage.has(f.label)) byPage.set(f.label, []); byPage.get(f.label).push(f); }
  for (const [label, fs] of byPage) {
    const fix = fs.filter((f) => f.cls === "fix"), open = fs.filter((f) => f.cls === "acceptable" && !f.accepted), attempts = Math.max(...fs.map((f) => f.attempts));
    if (fix.length) fail(`${label} looks gate: the built page does not match the prospect's (${fix.slice(0, 6).map((f) => f.diff).join("; ").slice(0, 500)})`, "Build it: fix the component (or build the fit: new one) until the band matches, then re-run the compares. These are build gaps: the SE cannot accept them.");
    if (!open.length || lookWaived) continue;
    if (attempts < 2) fail(`${label} looks gate: ${open.length} measurement difference(s) (${open.slice(0, 2).map((f) => f.diff).join("; ").slice(0, 160)})`, `Fix the SCSS/variant cause (never the measurement JSON), then ${rerun}. A re-run without a code change does not count as an attempt.`);
    else fail(`${label} looks gate: ${open.length} measurement difference(s) still open after ${attempts} fix attempts`, `Fix them, or let the SE decide: node harness/scripts/looks-review.mjs ${customer} opens the side-by-side page; ask the SE ONE question (accept all / keep fixing / accept some by number) and record the answer with node harness/scripts/run-gate.mjs accept ${customer} <all|numbers> --answer "<the SE's words>".`);
  }
  // footer shape and sample content, from the Home capture
  const live = readJson(join(demo, "sections.json")), built = readJson(join(demo, "sections.demo.json"));
  if (live && built) {
    const wantLabels = topLabels(chromeBands(live).footer), haveLabels = JSON.stringify(chromeBands(built).footer?.elements ?? []).toLowerCase();
    const missing = wantLabels.filter((t) => !haveLabels.includes(t.toLowerCase()));
    if (missing.length) fail(`footer is missing the prospect's columns (${missing.slice(0, 6).join(", ")})`, "The measured first row is the column headings. A variant with fewer title fields cannot hold them: build a component with one column per heading and fill it. The SE cannot accept this.");
    for (const poison of ["Why PLAY! finance", "Copyright © Sitecore"]) if (JSON.stringify(built).includes(poison)) fail(`footer still shows the Footer template sample "${poison}"`, "Fill the footer datasource from the measured footer and read it back. A field still equal to the template standard value is not content.");
  }
}

// variants and theme
stage = "variants";
if (existsSync(join(demo, "bootstrap-plan.json"))) {
  const r = node("variants-verify.mjs", ["--customer", customer, "--strict"], 60000);
  if (r.status !== 0) fail("variants-verify --strict does not pass (variant code missing, only an alias, or the footer has fewer columns than measured)", "Phase 5.5: write the real variant. A footer with fewer title fields than the measured first row is not a variant: build a component with one column per heading. Then re-run variants-verify --strict.");
} else if (planObj?.userApproved === true) fail("bootstrap-plan.json missing", `node harness/scripts/bootstrap-plan.mjs ${customer}`);
{
  const colors = read(join(app, "src/assets/sass/abstracts/vars/_colors.scss")), siteTheme = read(join(app, "src/lib/site-theme.ts"));
  if (existsSync(app) && (!colors.includes(`site-${customer}`) || !siteTheme.includes(customer))) fail(`theme not applied (site-${customer} missing in _colors.scss and/or site-theme.ts)`, "Phase 1+4: apply theme/theme.yaml to the app (sitecore-extract-theme / sitecore-build-demo phase 4).");
}

// manual tasks: no deferred core work; BLOCKED only with logged attempts
stage = "manual";
{
  const CORE = /(partial design|page design|header and footer|derived (page )?template|templates? (under|were|was|not)|datasource|data source|variant|theme|photograph|image|navigation filter|main navigation|display name|not (created|written|applied|uploaded|added|set) yet|not yet (created|written|applied|uploaded))/i;
  const EXEMPT = /^(always|assumptions|looks leftovers|missing assets|info)/;
  let section = "";
  for (const line of mtText.split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)/); if (h) { section = h[1].toLowerCase(); continue; }
    if (!/^\s*[-*]\s*(\[.\]\s*)?\S/.test(line) || EXEMPT.test(section)) continue;
    if (!CORE.test(line)) continue;
    if (!/BLOCKED after 2 attempts:\s*["“].+/.test(line)) fail(`manual-tasks.md defers core work: "${line.trim().slice(0, 110)}"`, "BUILD it now (do not reword the line). Only after two different logged attempts failed (run-gate.mjs block) may it be listed as BLOCKED after 2 attempts.");
    else if (!loggedBlock(line)) fail(`manual-tasks.md has a BLOCKED line without two logged attempts: "${line.trim().slice(0, 90)}"`, `Log each attempt with node harness/scripts/run-gate.mjs block ${customer} "<what>" -- <command> (or --mcp <tool> --error "<text>"); the line must contain that <what>.`);
  }
  if (!/^## Always \(every demo\)/m.test(mtText)) fail("manual-tasks.md has no fixed \"Always\" section", `run: node harness/scripts/run-gate.mjs init ${customer}`);
  // the shared harness stays free of prospect names: one-off scripts belong in the demo's tmp/ folder
  const nc = node("name-check.mjs", [], 30000);
  if (nc.status === 1) fail(`prospect-specific content in the shared harness: ${(nc.stdout.match(/^  \S.*\((file name|line \d+)\).*$/gm) ?? []).slice(0, 3).map((l) => l.trim().split(" (")[0]).join(", ")}`, `Move one-off scripts to industry-verticals/${customer}/docs/ai/demos/${customer}/tmp/ (import ../../../../../../../harness/scripts/_lib.mjs); write lessons for every demo without the prospect (name, website, site ids). node harness/scripts/name-check.mjs lists them all.`);
}

// progress
stage = "progress";
{
  const prog = read(join(demo, "demo-progress.yaml"));
  const open = [...prog.matchAll(/^\s*([A-Za-z0-9_]+):\s*\{?\s*\n?\s*status:\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started|blocked)"?/gim)].map((m) => `${m[1]}=${m[2]}`)
    .concat([...prog.matchAll(/^\s*(phase[A-Za-z0-9_.]*):\s*"?(pending|failed|in[_-]?progress|deferred|not[_-]?started|blocked)"?\s*$/gim)].map((m) => `${m[1]}=${m[2]}`));
  if (open.length) fail(`demo-progress.yaml has unfinished phases: ${open.slice(0, 6).join(", ")}`, "Do the first unfinished phase now.");
}

if (!fails.length) {
  if (fast) { console.log("✔ fast gate passed. Run the full gate (node harness/scripts/run-gate.mjs check " + customer + ") before handing over."); process.exit(0); }
  let active = null; try { active = JSON.parse(readFileSync(ACTIVE, "utf8")); } catch { /* none */ }
  if (active?.customer === customer) writeFileSync(join(demo, ".run-complete"), new Date().toISOString());
  console.log("✔ run gate passed: nothing the scripts can see is unfinished. Now hand over.");
  if (looks.acceptedNow.length) {   // the hand-over lists what the SE accepted, in the SE's own words
    console.log(`\nAccepted by the SE (list these in the hand-over under "Accepted by you"):`);
    for (const a of looks.acceptedNow) console.log(`  - ${a.page === "header" ? "Header" : a.page === "sections" ? "Home" : a.page.replace(/^sections-/, "")}: ${String(a.diff).replace(/^#\d+\s*/, "")}  (${a.acceptedAt.slice(0, 10)}: "${a.answer}")`);
  }
  process.exit(0);
}
// a red gate means the run is not complete, whatever an earlier (weaker) gate once wrote: the stop hook must restart it again
if (existsSync(join(demo, ".run-complete"))) { try { unlinkSync(join(demo, ".run-complete")); } catch { /* best effort */ } }
fails.sort((a, b) => STAGES.indexOf(a.stage) - STAGES.indexOf(b.stage));   // fix order: build first, progress last
console.log(`❌ RUN NOT FINISHED${fast ? " (fast gate)" : ""}: ${fails.length} open item(s). Do NOT hand over, summarise or end the turn. Do them IN THIS ORDER and re-run this check.\n`);
fails.forEach((f, i) => console.log(`${i + 1}. [${f.stage}] ${f.what}\n   → ${f.next}`));
process.exit(4);
