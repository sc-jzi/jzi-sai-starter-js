import { readFileSync } from "node:fs";
const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
for (const f of ["sections.json","sections-education.json","sections-membership.json","sections-events.json"]) {
  const data = JSON.parse(readFileSync(demo + "/" + f, "utf8"));
  console.log("\n" + f);
  for (const s of data.sections) console.log(s.index, s.kind, (s.heading?.text || "").slice(0, 80));
}
