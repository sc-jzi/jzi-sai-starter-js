import { readFileSync } from "node:fs";
const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
for (const f of ["sections.json","sections-education.json","sections-membership.json","sections-events.json","sections-events.demo.json"]) {
  const j = JSON.parse(readFileSync(demo+"/"+f,"utf8"));
  console.log("\n== "+f+" ==");
  for (const s of j.sections) console.log(String(s.index).padStart(2), s.kind, (s.heading?.text||"(none)").slice(0,70), "h="+s.height, "bg="+s.background);
}
