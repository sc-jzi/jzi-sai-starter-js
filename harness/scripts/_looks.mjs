// The looks gates, read ONE way: run-gate.mjs (pass/fail) and looks-review.mjs (the SE's click-to-accept page) both use this.
// A difference is either FIX (a build gap: never acceptable) or ACCEPTABLE (a measurement difference the SE may accept after two fix attempts).
import { existsSync } from "node:fs";
import { join } from "node:path";
import { demoDir, customerApp, readJson, chromeBands, isAdBand, fileHash, textHash, sourceFingerprint } from "./_lib.mjs";

// build gaps: a missing section, the footer's columns/labels, template sample content, a component that crashed, imagery not shown
export const FIX_ONLY = (d) => /^(COLUMNS|LABELS|SAMPLE|RENDER|IMAGES)\b/.test(d) || /not found in the demo/i.test(d);
export const diffId = (what, diff) => textHash(`${what}|${String(diff).trim()}`).slice(0, 10);
export const ACCEPTED_FILE = "accepted-differences.json";

/**
 * @returns {{ problems: {what:string,next:string}[], findings: object[], acceptedNow: object[] }}
 *   problems    verdicts missing, unstamped, stale, or compared against the prospect's own site
 *   findings    every in-scope difference: { id, what, label, ref, n, diff, cls: "fix"|"acceptable", attempts, accepted, liveCrop, builtCrop }
 *   acceptedNow the SE's acceptances that still apply (same difference, same reference measurement)
 */
export function looksState(customer, planObj, { tooLarge = new Set() } = {}) {
  const demo = demoDir(customer), app = customerApp(customer, { mustExist: false });
  const planPages = Array.isArray(planObj?.site?.pages) ? planObj.site.pages : [];
  const sourceUrl = String(planObj?.client?.sourceUrl ?? "");
  const liveHost = (() => { try { return new URL(sourceUrl).host.replace(/^www\./, ""); } catch { return ""; } })();
  const fp = sourceFingerprint(app);
  const dropped = new Set((planObj?.site?.droppedLiveSections ?? []).map(Number));
  const plannedBands = (file) => new Set(planPages.filter((p) => (p?.sectionsFile ? String(p.sectionsFile) === file : file === "sections.json" && /^\/home$/i.test(String(p?.path ?? ""))))
    .flatMap((p) => (Array.isArray(p.sections) ? p.sections : [])).map((x) => Number(x?.liveSection)).filter((n) => n > 0));
  const pageFiles = [...new Set(planPages.map((p) => p?.sectionsFile).filter(Boolean).map(String))];
  const verdicts = [["header-styles", "header-styles.json"], ["sections", "sections.json"], ...pageFiles.map((f) => [f.replace(/\.json$/, ""), f])];
  const acceptedAll = readJson(join(demo, ACCEPTED_FILE), { accepted: [] }).accepted ?? [];
  const refHashes = new Map(verdicts.map(([, ref]) => [ref, fileHash(join(demo, ref))]));
  const acceptedNow = acceptedAll.filter((a) => refHashes.get(a.ref) && a.refHash === refHashes.get(a.ref));
  const isAccepted = new Set(acceptedNow.map((a) => a.id));
  const rerun = `node harness/scripts/looks-gates.mjs ${customer} (the app must run: npm run dev in industry-verticals/${customer})`;
  const problems = [], findings = [];

  for (const [what, ref] of verdicts) {
    const v = `${what}.demo.verdict.json`, label = what === "header-styles" ? "header" : what;
    if (!existsSync(join(demo, v))) { problems.push({ what: `looks gate not run for ${label} (${v} missing)`, next: rerun }); continue; }
    const r = readJson(join(demo, v)); if (!r) { problems.push({ what: `${v} is unreadable`, next: rerun }); continue; }
    const host = (() => { try { return new URL(r.url).host.replace(/^www\./, ""); } catch { return ""; } })();
    if (!r.url || !r.refHash || !r.buildFingerprint) { problems.push({ what: `${label} verdict has no stamp (url, reference hash, build fingerprint): it was made by an older script or by hand`, next: rerun }); continue; }
    if (liveHost && host === liveHost) { problems.push({ what: `${label} verdict compared the prospect's own site (${r.url}), not the demo`, next: rerun }); continue; }
    if (r.refHash !== refHashes.get(ref)) { problems.push({ what: `${label} verdict is stale: ${ref} changed after the compare (measurements are never edited by hand; re-measure with the script if it was wrong)`, next: rerun }); continue; }
    if (fp && r.buildFingerprint !== fp) { problems.push({ what: `${label} verdict is stale: the app's code changed after the compare`, next: rerun }); continue; }

    const add = (diff, n, liveCrop, builtCrop) => {
      const id = diffId(what, diff), cls = FIX_ONLY(diff) ? "fix" : "acceptable";
      findings.push({ id, what, label, ref, n, diff, cls, attempts: r.attempts ?? 1, accepted: cls === "acceptable" && isAccepted.has(id), liveCrop, builtCrop, url: r.url });
    };
    if (what === "header-styles") { for (const d of r.diffs ?? []) add(d, null, "header-reference.png", "header-styles.demo.png"); continue; }

    // Scope: the bands this page's plan builds, plus the footer (built by the Footer partial, never droppable). The header band is the header gate's.
    const refCap = readJson(join(demo, ref)), demoCap = readJson(join(demo, `${what}.demo.json`)), bands = chromeBands(refCap), planned = plannedBands(ref);
    const bandOf = (n) => refCap?.sections?.find((x) => x.index === n);
    const inScope = (d) => {
      if (/^(SAMPLE|RENDER)\b/.test(d)) return true;
      const n = Number((String(d).match(/#(\d+)/) ?? [])[1]); if (!n) return true;
      if (/content width/i.test(d) && bandOf(n)?.scroller) return false;   // a carousel's width is its hidden slides
      // imagery that is too large for Experience Edge is listed under Missing assets, not failed
      if (/^IMAGES\b/.test(d)) { const srcs = (bandOf(n)?.images ?? []).map((i) => String(i.src ?? "").split("?")[0]); if (srcs.length && srcs.every((s) => tooLarge.has(s))) return false; }
      if (n === (r.footerIdx ?? bands.footerIdx)) return true;
      if (n === (r.headerIdx ?? bands.headerIdx)) return false;
      if (isAdBand(bandOf(n))) return false;   // advertisement slots are never built
      return planned.size ? planned.has(n) : !dropped.has(n);
    };
    // the built section a live one was compared with: recorded by section-capture (pairs); older verdicts: same heading, else same position
    const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    const builtFor = (n) => {
      if (r.pairs && r.pairs[n] != null) return r.pairs[n];
      const h = norm(bandOf(n)?.heading?.text);
      return (h && demoCap?.sections?.find((x) => norm(x.heading?.text) === h)?.index) ?? (demoCap?.sections?.find((x) => x.index === n) ? n : null);
    };
    for (const d of (r.diffs ?? []).filter(inScope)) {
      const n = Number((String(d).match(/#(\d+)/) ?? [])[1]) || null;
      const builtIdx = n != null ? builtFor(n) : null;
      add(d, n, n ? bandOf(n)?.screenshot ?? null : null, builtIdx != null ? demoCap?.sections?.find((x) => x.index === builtIdx)?.screenshot ?? null : null);
    }
  }
  return { problems, findings, acceptedNow };
}
