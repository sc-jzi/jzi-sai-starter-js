import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const demo = "c:/Projects/Demo/Harness/industry-verticals/ampp/docs/ai/demos/ampp";
const imagesDir = join(demo, "images");
mkdirSync(imagesDir, { recursive: true });

const want = new Map();
for (const f of readdirSync(demo).filter((x) => /^sections.*\.json$/.test(x) && !/\.demo\./.test(x))) {
  const data = JSON.parse(readFileSync(join(demo, f), "utf8"));
  for (const sct of data.sections ?? []) {
    for (const im of [...(sct.images ?? []).map((x) => x.src), ...(sct.backgroundImages ?? [])]) {
      const u = String(im?.url ?? im ?? "");
      if (!/^https?:/.test(u)) continue;
      let b = u.split("?")[0].split("/").pop();
      try { b = decodeURIComponent(b); } catch { /* keep */ }
      const stem = b.toLowerCase().replace(/\.[a-z0-9]+$/, "");
      if (!want.has(stem)) want.set(stem, { url: u, file: b });
    }
  }
}

const manifest = [];
let i = 0;
for (const [stem, { url, file }] of want) {
  const safe = file.replace(/[<>:"|?*]/g, "-");
  const dest = join(imagesDir, safe);
  if (!existsSync(dest)) {
    const res = await fetch(url);
    if (!res.ok) {
      console.log("FAIL", res.status, url);
      continue;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buf);
    console.log("ok", safe, buf.length);
  } else {
    console.log("have", safe);
  }
  manifest.push({
    field: `section-image-${++i}`,
    src: url,
    localFileName: safe,
    localPath: dest,
    status: "downloaded",
    alt: stem,
  });
}
writeFileSync(join(imagesDir, "image-manifest.json"), JSON.stringify(manifest, null, 2));
console.log("manifest", manifest.length, "of", want.size);
