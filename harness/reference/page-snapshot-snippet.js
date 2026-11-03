// Page snapshot for prospect sites that block headless browsers. Paste into the browser's DevTools Console ON THE PROSPECT'S PAGE, after any
// captcha is passed. Needs `node harness/scripts/page-snapshot-server.mjs --customer <customer>` running on this machine.
// The agent sets NAME (the snapshot name, e.g. "home" or "offers-compact-loaders") and PORT before handing it to the SE.
// What it does: scrolls the page so lazy sections load, embeds the page's woff2 web fonts (so measured text wraps like the live site),
// removes scripts and iframes, adds <base href> so styles and images still load, then opens http://127.0.0.1:PORT/receive with the page
// gzip+base64 in the URL fragment (a top-level navigation is not blocked by the page's CSP; the fragment is not sent over the network).
(async (NAME, PORT) => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  for (let pass = 0; pass < 3; pass++) {                       // lazy sections render on scroll; three passes catch late ones
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo(0, y); await wait(400); }
    await wait(1500);
  }
  window.scrollTo(0, 0); await wait(1000);
  let css = "";                                                  // web fonts: woff2 only, skip files over 1 MB (URL length)
  for (const ss of [...document.styleSheets]) {
    let rules; try { rules = ss.cssRules; } catch { continue; }
    for (const r of rules) {
      if (r.constructor.name !== "CSSFontFaceRule") continue;
      const m = [...r.style.getPropertyValue("src").matchAll(/url\(["']?([^"')]+)["']?\)\s*format\(["']?(\w+)/g)].find((x) => x[2] === "woff2");
      if (!m) continue;
      try {
        const buf = new Uint8Array(await (await fetch(new URL(m[1], ss.href || location.href).href)).arrayBuffer());
        if (buf.length > 1e6) continue;
        let b = ""; for (let k = 0; k < buf.length; k += 0x8000) b += String.fromCharCode.apply(null, buf.subarray(k, k + 0x8000));
        css += `@font-face{font-family:${r.style.getPropertyValue("font-family")};font-weight:${r.style.getPropertyValue("font-weight") || "normal"};font-style:${r.style.getPropertyValue("font-style") || "normal"};src:url(data:font/woff2;base64,${btoa(b)}) format("woff2");}\n`;
      } catch { /* a font the page cannot fetch is skipped */ }
    }
  }
  const doc = document.documentElement.cloneNode(true);
  doc.querySelectorAll("script, noscript, iframe").forEach((n) => n.remove());
  doc.querySelectorAll("meta[http-equiv]").forEach((n) => n.remove());
  const live = [...document.images];
  [...doc.querySelectorAll("img")].forEach((img, k) => { const l = live[k]; if (l && l.currentSrc) img.setAttribute("src", l.currentSrc); img.removeAttribute("loading"); img.removeAttribute("srcset"); });
  const head = doc.querySelector("head");
  const base = document.createElement("base"); base.href = location.href; head.prepend(base);
  if (css) { const st = document.createElement("style"); st.textContent = css; head.appendChild(st); }
  const html = `<!DOCTYPE html>\n<!-- snapshot of ${location.href} taken ${new Date().toISOString()} in the SE's browser -->\n` + doc.outerHTML;
  const gz = new Uint8Array(await new Response(new Blob([html]).stream().pipeThrough(new CompressionStream("gzip"))).arrayBuffer());
  let bin = ""; for (let k = 0; k < gz.length; k += 0x8000) bin += String.fromCharCode.apply(null, gz.subarray(k, k + 0x8000));
  console.log(`snapshot "${NAME}": ${html.length} chars, ${Math.round(bin.length / 1024)} KB compressed; sending to 127.0.0.1:${PORT}`);
  location.href = `http://127.0.0.1:${PORT}/receive#` + encodeURIComponent(NAME + "|" + btoa(bin));
})("NAME", 8765);
