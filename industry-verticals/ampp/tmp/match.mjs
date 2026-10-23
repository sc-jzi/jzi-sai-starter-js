import { readFileSync } from "node:fs";
const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
const norm = (t) => String(t || "").toLowerCase().replace(/[^a-z0-9]/g, "");
function sim(refName, demoName) {
  const ref = JSON.parse(readFileSync(demo + "/" + refName, "utf8"));
  const got = JSON.parse(readFileSync(demo + "/" + demoName, "utf8"));
  const used = new Set();
  console.log("\n" + refName);
  for (const R of ref.sections) {
    const byH = got.sections.find((d) => !used.has(d.index) && R.heading?.text && norm(d.heading?.text) === norm(R.heading.text));
    const byI = got.sections.find((d) => !used.has(d.index) && d.index === R.index && d.kind === R.kind);
    const D = byH || byI;
    if (!D) { console.log("MISS", R.index, R.kind, (R.heading?.text || "").slice(0, 40)); continue; }
    used.add(D.index);
    console.log((byH ? "HEAD" : "IDX "), R.index, "->", D.index, (D.heading?.text || D.kind).slice(0, 40));
  }
}
sim("sections-education.json", "sections-education.demo.json");
sim("sections-membership.json", "sections-membership.demo.json");
sim("sections.json", "sections.demo.json");
sim("sections-events.json", "sections-events.demo.json");
