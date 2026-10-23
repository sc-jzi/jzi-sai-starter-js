import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const app = "c:/Projects/Demo/Harness/industry-verticals/ampp";
const plan = JSON.parse(
  readFileSync(join(app, "docs/ai/demos/ampp/bootstrap-plan.json"), "utf8")
);

const kebab = (name) =>
  name
    .replace(/^Ampp/, "")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase() || "ampp";

const exportsName = (src, n) =>
  new RegExp(
    `export\\s+(const|function|let|class)\\s+${n}\\b|export\\s*\\{[^}]*\\b(as\\s+)?${n}\\b[^}]*\\}`
  ).test(src);

for (const c of plan.components) {
  const file = join(app, c.reactFilePath);
  let src = readFileSync(file, "utf8");
  const sig = src.match(/export const Default = \(props:\s*([A-Za-z0-9_]+)\)/);
  const hoc = src.match(/export const Default = withDatasourceCheck\(\)<([A-Za-z0-9_]+)>/);
  const propsType = sig?.[1] || hoc?.[1];
  if (!propsType) {
    console.log("NO PROPS", c.name);
    continue;
  }
  const blocks = [];
  for (const v of c.variants) {
    if (v === "Default") continue;
    if (exportsName(src, v)) continue;
    const look = kebab(v);
    blocks.push(
      `export const ${v} = (props: ${propsType}): JSX.Element => {\n  return (\n    <section className="ampp-look ampp-look-${look}">\n      <Default {...props} />\n    </section>\n  );\n};`
    );
  }
  if (!blocks.length) {
    console.log("ok", c.name);
    continue;
  }
  src = src.replace(/\s*$/, "\n\n") + blocks.join("\n\n") + "\n";
  writeFileSync(file, src);
  console.log("added", c.name, blocks.length);
}
