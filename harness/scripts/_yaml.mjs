// Tiny YAML-subset reader (maps, block lists, inline [a,b] and {a: b}, quoted scalars). Dependency-free.
export function parseYaml(text) {
  const lines = text.replace(/^﻿/, "").split(/\r?\n/).map((raw) => ({ raw, indent: raw.match(/^ */)[0].length, t: raw.trim() })).filter((l) => l.t && !l.t.startsWith("#"));
  let i = 0;
  const scalar = (v) => {
    v = v.trim();
    if (/^\{.*\}$/.test(v)) { // inline map { a: 1, b: "x, y" }
      const o = {}, inner = v.slice(1, -1); let depth = 0, q = null, cur = ""; const parts = [];
      for (const ch of inner) { if (q) { if (ch === q) q = null; cur += ch; continue; } if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; } if (ch === "[") depth++; if (ch === "]") depth--; if (ch === "," && depth === 0) { parts.push(cur); cur = ""; continue; } cur += ch; }
      if (cur.trim()) parts.push(cur);
      for (const p of parts) { const k = p.indexOf(":"); if (k > 0) o[p.slice(0, k).trim()] = scalar(p.slice(k + 1)); }
      return o;
    }
    if (/^\[.*\]$/.test(v)) return v.slice(1, -1).split(",").map((x) => scalar(x)).filter((x) => x !== "");
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
      if (m) { const ci = indent + (lines[i].t.length - rest.length); lines[i] = { raw: lines[i].raw, indent: ci, t: rest }; a.push(map(ci)); }
      else { a.push(scalar(rest)); i++; }
    }
    return a;
  }
  return map(lines[0]?.indent ?? 0);
}
