import { readFileSync } from "node:fs";
const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
const plan = readFileSync(demo + "/demo-plan.yaml", "utf8");
const dropped = new Set([...plan.matchAll(/^\s*droppedLiveSections:\s*\[([^\]]*)\]/gm)].flatMap(m => m[1].split(",").map(x => Number(x.trim()))));
console.log("dropped", [...dropped].join(","));
for (const f of ["header-styles.demo.verdict.json","sections.demo.verdict.json","sections-education.demo.verdict.json","sections-membership.demo.verdict.json","sections-events.demo.verdict.json"]) {
  const r = JSON.parse(readFileSync(demo + "/" + f, "utf8"));
  const diffs = (r.diffs || []).filter(d => !dropped.has(Number((String(d).match(/^#(\d+)/) || [])[1])));
  const missing = diffs.filter(d => /not found in the demo/i.test(d));
  console.log("\n" + f, "attempts", r.attempts, "kept", diffs.length, "missing", missing.length);
  for (const d of diffs) console.log(" - " + d);
}
