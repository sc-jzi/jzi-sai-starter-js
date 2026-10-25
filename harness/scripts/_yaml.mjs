// The ONE YAML-subset reader of the harness (maps, block lists, inline [a, b] and {a: b}, quoted scalars, trailing comments). Dependency-free.
// Every script imports this: three private copies used to read the same plan differently.
const splitTop = (inner) => {   // split on commas that are not inside quotes, [] or {}
  const parts = []; let depth = 0, q = null, cur = "";
  for (const ch of inner) {
    if (q) { if (ch === q) q = null; cur += ch; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === "[" || ch === "{") depth++;
    if (ch === "]" || ch === "}") depth--;
    if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; }
    cur += ch;
  }
  parts.push(cur);
  return parts;
};

export function parseYaml(text) {
  const lines = String(text).replace(/^﻿/, "").split(/\r?\n/).map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, t: raw.trim() })).filter((l) => l.t && !l.t.startsWith("#"));
  let i = 0;
  const scalar = (v) => {
    v = v.trim();
    { const c = v.match(/^([\[{].*[\]}])\s+#.*$/); if (c) v = c[1]; }                                // inline list / map followed by a comment
    if (/^\{.*\}$/.test(v)) { const o = {}; for (const p of splitTop(v.slice(1, -1))) { const k = p.indexOf(":"); if (k > 0) o[p.slice(0, k).trim()] = scalar(p.slice(k + 1)); } return o; }
    if (/^\[.*\]$/.test(v)) return splitTop(v.slice(1, -1)).map((x) => scalar(x)).filter((x) => x !== "");
    { const qm = v.match(/^("(?:[^"\\]|\\.)*"|'(?:[^']|'')*')\s+#.*$/); if (qm) v = qm[1]; }            // quoted value followed by a comment
    if (/^".*"$/.test(v)) { try { return JSON.parse(v); } catch { return v.slice(1, -1); } }
    if (/^'.*'$/.test(v)) return v.slice(1, -1).replace(/''/g, "'");
    if (v === "true") return true; if (v === "false") return false; if (v === "null" || v === "~") return null;
    return v.replace(/\s+#.*$/, "");
  };
  function block() { if (i >= lines.length) return null; return lines[i].t.startsWith("- ") || lines[i].t === "-" ? list(lines[i].indent) : map(lines[i].indent); }
  function map(indent) {
    const o = {};
    while (i < lines.length && lines[i].indent === indent && !lines[i].t.startsWith("- ")) {
      const m = lines[i].t.match(/^([^:]+?):\s*(.*)$/); if (!m) { i++; continue; }
      i++;
      if (m[2] === "") o[m[1]] = i < lines.length && lines[i].indent > indent ? block() : (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("- ") ? list(indent) : null);
      else o[m[1]] = scalar(m[2]);
    }
    return o;
  }
  function list(indent) {
    const a = [];
    while (i < lines.length && lines[i].indent === indent && lines[i].t.startsWith("-")) {
      const rest = lines[i].t.replace(/^-\s*/, "");
      if (!rest) { i++; a.push(i < lines.length && lines[i].indent > indent ? block() : null); continue; }
      const m = rest.match(/^([^:"'\[{]+?):\s*(.*)$/);
      // `- /Home/x (click: Y)` is a scalar, not a map: a key never starts with / or contains ( or spaces before the colon of a sentence
      if (m && !/[\/(]/.test(m[1]) && !/\s/.test(m[1].trim())) { const ci = indent + (lines[i].t.length - rest.length); lines[i] = { raw: lines[i].raw, indent: ci, t: rest }; a.push(map(ci)); }
      else { a.push(scalar(rest)); i++; }
    }
    return a;
  }
  return map(lines[0]?.indent ?? 0);
}
