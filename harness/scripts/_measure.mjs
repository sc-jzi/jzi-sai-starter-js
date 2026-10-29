/**
 * The one in-page measurement of a band (a page section or a single component), shared by section-capture.mjs (the prospect's pages and the
 * built demo) and component-catalog.mjs (each base component variant on its showcase page), so both sides of a comparison are measured alike.
 *
 *   await page.evaluate(measureBand, "<data-hsec value>")   the element carries data-hsec; returns background, padding, element order, styles,
 *                                                           cards, columns, imageSide, images, form, video, elements (x/y/w/h per role) ...
 * Runs in the browser: it may use only browser globals, never anything imported here.
 */
export function measureBand(idx) {
  const el = document.querySelector(`[data-hsec="${idx}"]`); const vw = window.innerWidth;
  const clean = (t) => (t || "").replace(/\s+/g, " ").trim();
  const parse = (c) => { const m = String(c).match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
  const hex = (c) => { const p = typeof c === "string" ? parse(c) : c; if (!p) return null; return "#" + [p.r, p.g, p.b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join(""); };
  const num = (v) => Math.round((parseFloat(v) || 0) * 10) / 10;
  const vis = (e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.display !== "none" && cs.visibility !== "hidden" && parseFloat(cs.opacity) !== 0; };
  const solid = (e) => { for (let n = e; n; n = n.parentElement) { const c = parse(getComputedStyle(n).backgroundColor); if (c && c.a > 0.05) return hex(c); } return "#ffffff"; };
  const ownBg = (e) => { const c = parse(getComputedStyle(e).backgroundColor); return c && c.a > 0.05 ? hex(c) : null; };
  const urlOf = (v) => { const m = String(v).match(/url\(\s*(["']?)(.*?)\1\s*\)/); if (!m) return null; try { return new URL(m[2], location.href).href; } catch { return m[2]; } };
  const sr = el.getBoundingClientRect(), secBg = solid(el);
  const all = [...el.querySelectorAll("*")].filter(vis);
  // background image: on the section or on a big descendant
  let bgImage = urlOf(getComputedStyle(el).backgroundImage), bgImages = bgImage ? [bgImage] : [];
  for (const d of all) { const u = urlOf(getComputedStyle(d).backgroundImage); if (u && !bgImages.includes(u)) { const r = d.getBoundingClientRect(); if (r.width * r.height >= sr.width * sr.height * 0.12) bgImages.push(u); } }
  if (!bgImage && bgImages.length) bgImage = bgImages[0];
  const sty = (e) => { const cs = getComputedStyle(e); return { fontFamily: (cs.fontFamily || "").split(",")[0].replace(/["']/g, "").trim(), fontSize: num(cs.fontSize), fontWeight: cs.fontWeight, textTransform: cs.textTransform, letterSpacing: cs.letterSpacing === "normal" ? 0 : num(cs.letterSpacing), lineHeight: cs.lineHeight === "normal" ? null : num(cs.lineHeight), color: hex(cs.color), textAlign: cs.textAlign }; };
  const direct = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && clean(n.textContent));
  const els = [];
  for (const e of all) {
    const tag = e.tagName; const r = e.getBoundingClientRect(); let role = null;
    if (/^H[1-6]$/.test(tag)) role = "heading";
    else if (tag === "IMG" || tag === "PICTURE" || (tag.toUpperCase() === "SVG" && r.width > 60)) role = "image";
    else if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) role = "field";
    else if (tag === "BUTTON" || (tag === "A" && (ownBg(e) || parseFloat(getComputedStyle(e).borderTopWidth) > 0 || /btn|button|cta/i.test(e.className)))) role = "button";
    else if (tag === "A" && clean(e.textContent)) role = "link";
    else if (/^(P|LI|SPAN|DIV|LABEL|DT|DD|BLOCKQUOTE)$/.test(tag) && direct(e) && !e.closest("a,button,h1,h2,h3,h4,h5,h6")) role = "text";
    if (!role) continue;
    if (role === "text" || role === "link" || role === "button") { if (!clean(e.textContent)) continue; }
    if ((role === "link" || role === "text") && e.closest("button")) continue;
    els.push({ e, role, r });
  }
  // a card <img> inside <picture> etc: drop nested duplicates
  const items = els.filter((a) => !els.some((b) => b !== a && b.e.contains(a.e) && b.role === a.role && a.role === "image"));
  items.sort((a, b) => (Math.abs(a.r.top - b.r.top) < 12 ? a.r.left - b.r.left : a.r.top - b.r.top));
  const firstHeading = items.find((x) => x.role === "heading"), hSize = firstHeading ? num(getComputedStyle(firstHeading.e).fontSize) : null;
  // eyebrow = small uppercase / letter-spaced text that is not a link or button (above OR below the heading)
  for (const x of items) if (x.role === "text") { const cs = getComputedStyle(x.e), fs = num(cs.fontSize), t = clean(x.e.textContent); if (t.length <= 60 && ((cs.textTransform === "uppercase" || num(cs.letterSpacing) > 0.8 || t === t.toUpperCase()) && (!hSize || fs <= hSize * 0.85)) && fs <= 18) x.role = "eyebrow"; }
  const elements = items.slice(0, 30).map((x) => { const cs = getComputedStyle(x.e); const o = { role: x.role, text: clean(x.e.textContent).slice(0, 80), x: Math.round(x.r.left), y: Math.round(x.r.top - sr.top), w: Math.round(x.r.width), h: Math.round(x.r.height) };
    if (x.role !== "image") { Object.assign(o, sty(x.e)); }
    if (x.role === "button") Object.assign(o, { background: ownBg(x.e), borderRadius: num(cs.borderTopLeftRadius), paddingX: num(cs.paddingLeft), paddingY: num(cs.paddingTop), border: parseFloat(cs.borderTopWidth) > 0 ? { width: num(cs.borderTopWidth), color: hex(cs.borderTopColor) } : null });
    if (x.e.tagName === "A") o.href = x.e.getAttribute("href") || "";
    if (x.role === "image") { const im = x.e.tagName === "IMG" ? x.e : x.e.querySelector("img"); o.src = im ? (im.currentSrc || im.src) : null; o.alt = im ? im.alt : ""; }
    if (x.role === "field") { o.type = x.e.type || x.e.tagName.toLowerCase(); o.placeholder = x.e.placeholder || ""; o.background = ownBg(x.e); }
    return o; });
  const first = (role) => elements.find((x) => x.role === role);
  const content = items.filter((x) => x.role !== "image" || x.r.width < sr.width * 0.9);
  const cL = content.length ? Math.min(...content.map((x) => x.r.left)) : sr.left, cR = content.length ? Math.max(...content.map((x) => x.r.right)) : sr.right;
  const cT = content.length ? Math.min(...content.map((x) => x.r.top)) : sr.top, cB = content.length ? Math.max(...content.map((x) => x.r.bottom)) : sr.bottom;
  // inner cards: descendants with their own background that differs from the section background and cover a real area
  const cards = [];
  for (const d of all) { const b = ownBg(d); if (!b || b === secBg) continue; const r = d.getBoundingClientRect(); if (r.width * r.height < sr.width * sr.height * 0.04 || r.width > sr.width * 0.98 && r.height > sr.height * 0.9) continue; if (!d.querySelector("h1,h2,h3,h4,h5,h6,p,input,a")) continue; const cs = getComputedStyle(d); if (/^(A|BUTTON)$/.test(d.tagName)) continue; cards.push({ background: b, radius: num(cs.borderTopLeftRadius), border: parseFloat(cs.borderTopWidth) > 0 ? { width: num(cs.borderTopWidth), color: hex(cs.borderTopColor) } : null, w: Math.round(r.width), h: Math.round(r.height), childText: clean(d.textContent).slice(0, 40) }); }
  // columns: distinct left edges of the content blocks (rounded)
  const lefts = [...new Set(content.filter((x) => x.role !== "field").map((x) => Math.round(x.r.left / 60) * 60))];
  const imgs = items.filter((x) => x.role === "image" && x.r.width >= sr.width * 0.12);
  const bigBg = all.filter((d) => urlOf(getComputedStyle(d).backgroundImage) && d.getBoundingClientRect().width >= sr.width * 0.12 && d.getBoundingClientRect().width < sr.width * 0.9);
  const imgBoxes = [...imgs.map((x) => x.r), ...bigBg.map((d) => d.getBoundingClientRect())];
  const textBoxes = items.filter((x) => ["heading", "text", "eyebrow"].includes(x.role)).map((x) => x.r);
  let imageSide = "none";
  if (imgBoxes.length) { const ic = imgBoxes.reduce((s, r) => s + (r.left + r.right) / 2, 0) / imgBoxes.length, tc = textBoxes.length ? textBoxes.reduce((s, r) => s + (r.left + r.right) / 2, 0) / textBoxes.length : sr.left + sr.width / 2; imageSide = Math.abs(ic - tc) < sr.width * 0.08 ? "above-or-behind" : ic < tc ? "left" : "right"; }
  else if (bgImage) imageSide = "background";
  // text that cannot be read: colour (almost) equal to the background it sits on
  const L = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const lowContrast = [];
  for (const x of items) { if (x.role === "image") continue; const fg = parse(getComputedStyle(x.e).color), bgc = parse(x.role === "button" ? (ownBg(x.e) || solid(x.e)) : solid(x.e)) || parse(solid(x.e)); if (!fg || !bgc) continue; const a1 = L(fg), b1 = L(bgc), cr = (Math.max(a1, b1) + 0.05) / (Math.min(a1, b1) + 0.05); if (cr < 2.5 && clean(x.e.textContent || x.e.placeholder)) lowContrast.push({ text: clean(x.e.textContent).slice(0, 30), color: hex(fg), on: hex(bgc) }); }
  const form = el.querySelector("form"), fields = items.filter((x) => x.role === "field");
  const links = items.filter((x) => x.e.tagName === "A").slice(0, 12).map((x) => ({ text: clean(x.e.textContent).slice(0, 50), href: x.e.getAttribute("href") || "" }));
  const logoish = el.querySelector("footer img, img[alt*=logo i], img[src*=logo i]");
  // ---- shape (additive keys for shapeOf; the --compare gate does not read them) ----
  const box = (e) => { const r = e.getBoundingClientRect(); return { w: Math.round(r.width), h: Math.round(r.height), x: Math.round(r.left), y: Math.round(r.top - sr.top) }; };
  // every picture whatever it is made of: <img>/<picture>, a <video> (poster or background video), an embed, a CSS background
  const media = [...el.querySelectorAll("img, picture, video, iframe")].filter(vis).filter((e) => !(e.tagName === "IMG" && e.parentElement?.tagName === "PICTURE"))
    .map((e) => ({ kind: /^(VIDEO|IFRAME)$/.test(e.tagName) ? "video" : "image", ...box(e) }));
  for (const d of [el, ...all]) if (urlOf(getComputedStyle(d).backgroundImage)) media.push({ kind: "background", ...box(d) });
  // repeated items: the largest group of siblings of the same kind (tag + first class) that each carry text and a heading, paragraph or picture.
  // Hidden siblings (a carousel's other slides) count toward `total`, not toward what is on screen.
  const sig = (e) => `${e.tagName}.${e.classList[0] ?? ""}`;
  const holds = (k) => clean(k.textContent) && k.querySelector("h1,h2,h3,h4,h5,h6,p,img,picture,video,[class*=title]");
  let rep = null;
  for (const p of [el, ...all]) {
    const groups = new Map();
    for (const k of p.children) { if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(k.tagName)) continue; const s = sig(k); if (!groups.has(s)) groups.set(s, []); groups.get(s).push(k); }
    for (const g of groups.values()) {
      const members = g.filter(holds); if (members.length < 2) continue;
      const shown = members.filter((k) => vis(k) && k.getBoundingClientRect().height >= 24);
      const onScreen = shown.filter((k) => { const r = k.getBoundingClientRect(); return r.left < sr.right - 4 && r.right > sr.left + 4; });
      const area = onScreen.reduce((s, k) => { const r = k.getBoundingClientRect(); return s + r.width * r.height; }, 0);
      if (!onScreen.length || (rep && area <= rep.area)) continue;
      // one row = items whose vertical extents overlap by more than half (cards in a row need not share a top edge)
      const tops = []; for (const k of onScreen) { const r = k.getBoundingClientRect(); if (!tops.some((x) => Math.min(x.bottom, r.bottom) - Math.max(x.top, r.top) > Math.min(x.bottom - x.top, r.height) / 2)) tops.push({ top: r.top, bottom: r.bottom }); }
      const mediaOf = (k) => { const ms = [...k.querySelectorAll("img, picture, video, svg")].filter(vis).map((m) => m.getBoundingClientRect()); for (const d of [k, ...k.querySelectorAll("*")]) if (urlOf(getComputedStyle(d).backgroundImage) && vis(d)) ms.push(d.getBoundingClientRect()); return ms.sort((a, b) => b.width * b.height - a.width * a.height)[0] ?? null; };
      const kinds = onScreen.map(mediaOf).map((m) => (!m ? null : m.width >= 120 && m.height >= 80 ? { k: "photo" } : Math.max(m.width, m.height) >= 12 && Math.max(m.width, m.height) <= 120 ? { k: "icon", s: Math.round(Math.max(m.width, m.height)) } : null));
      const photos = kinds.filter((x) => x?.k === "photo").length, icons = kinds.filter((x) => x?.k === "icon");
      const w0 = onScreen.map((k) => k.getBoundingClientRect().width);
      rep = { area, count: onScreen.length, total: members.length, hidden: members.length - shown.length, offscreen: shown.length - onScreen.length, rows: tops.length,
        cols: Math.ceil(onScreen.length / tops.length), itemW: Math.round(w0.reduce((s, x) => s + x, 0) / w0.length),
        media: photos * 2 >= onScreen.length ? "photo" : icons.length ? "icon" : "none", iconSize: icons.length ? Math.max(...icons.map((x) => x.s)) : null };
    }
  }
  const prevNext = [...el.querySelectorAll("button, a, [role=button]")].some((b) => /^(prev|previous|next|‹|›|<|>)$|previous slide|next slide/i.test(clean(b.getAttribute("aria-label") || b.textContent)));
  return {
    width: Math.round(sr.width), left: Math.round(sr.left), media, repeat: rep ? (({ area, ...r }) => r)(rep) : null,
    slider: !!rep && (rep.hidden > 0 || rep.offscreen > 0) || prevNext,
    background: secBg, backgroundImage: bgImage, backgroundImages: bgImages,
    contentLeft: Math.round(cL), contentRight: Math.round(cR), contentWidth: Math.round(cR - cL), fullWidth: (cR - cL) >= vw * 0.9, scroller: el.scrollWidth > el.clientWidth + 20 || (cR - cL) > vw * 1.05,
    paddingTop: Math.max(0, Math.round(cT - sr.top)), paddingBottom: Math.max(0, Math.round(sr.bottom - cB)),
    order: elements.map((x) => x.role).filter((r, i, a) => r !== a[i - 1]).join(","),
    heading: first("heading") ? { text: first("heading").text, ...(({ role, text, x, y, w, h, ...s }) => s)(first("heading")) } : null,
    eyebrow: first("eyebrow") ? (({ role, x, y, w, h, ...s }) => s)(first("eyebrow")) : null,
    text: first("text") ? (({ role, x, y, w, h, text, ...s }) => s)(first("text")) : null,
    button: first("button") ? (({ role, x, y, w, h, ...s }) => s)(first("button")) : null,
    buttons: elements.filter((x) => x.role === "button").length, links: links, columns: lefts.length, imageSide,
    cards: cards.slice(0, 6), images: elements.filter((x) => x.role === "image").map((x) => ({ src: x.src, alt: x.alt, w: x.w, h: x.h })),
    form: form || fields.length ? { fields: fields.length, submit: !!(el.querySelector("button[type=submit], input[type=submit]") || elements.some((x) => x.role === "button" && /submit|send|request|go/i.test(x.text))), fieldBackground: fields[0] ? ownBg(fields[0].e) || solid(fields[0].e) : null } : null,
    hasLogo: !!logoish, lowContrast: lowContrast.slice(0, 4), elements,
    adSlot: !!el.querySelector('iframe[src*="doubleclick"], iframe[id^="google_ads"], [id^="div-gpt-ad"], ins.adsbygoogle, [data-ad-slot], [class*="advert" i], [id*="advert" i]'),
    // a video is an embedded player, or a poster that opens one: a link to a video host or file, a play button (an element or an icon
    // image, e.g. alt "Play Video icon" / VideoPlayButton.svg over the poster), data-video* attributes
    video: [...el.querySelectorAll("video, iframe")].some((v) => v.tagName === "VIDEO" || /youtu|vimeo|wistia|brightcove|vidyard|video|player/i.test(v.getAttribute("src") || v.getAttribute("data-src") || ""))
      || [...el.querySelectorAll("img, svg")].some((i) => /(^|[^a-z])(play([^a-z]|$)|play-?(button|btn|icon|video)|video)/i.test(`${i.getAttribute("alt") || ""} ${i.getAttribute("aria-label") || ""} ${String(i.getAttribute("src") || "").split("?")[0].split("/").pop()}`))
      || [...el.querySelectorAll("a[href], [data-src], [data-href]")].some((a) => /youtu\.?be|vimeo\.com|wistia|vidyard|brightcove|\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute("href") || a.getAttribute("data-src") || a.getAttribute("data-href") || ""))
      || [...el.querySelectorAll("*")].some((d) => [...d.attributes].some((a) => /^data-(video|youtube|vimeo|wistia)/i.test(a.name))
        || /(^|[\s_-])(play|play-?(button|btn|icon|video)|video-?(play|trigger|button|modal|popup))([\s_-]|$)/i.test(typeof d.className === "string" ? d.className : d.getAttribute("class") || "")
        || /^play\b|play video/i.test(d.getAttribute("aria-label") || d.getAttribute("title") || "")),
  };
}

/* ---- shape: what a band IS (layout, repeated items, media, sliding, video, form), from measureBand's output. Read by component-catalog.mjs
 * (each variant), component-match.mjs (the shortlist per planned section) and plan-review.mjs. Colours, fonts and spacing are look, not shape. ---- */
const LAYOUTS = ["cover", "split", "stacked", "items", "list", "text"];
// the largest group of boxes of about the same size (within 10%)
const sameSize = (list) => {
  let best = [];
  for (const a of list) { const g = list.filter((b) => Math.abs(b.w - a.w) <= a.w * 0.1 && Math.abs(b.h - a.h) <= a.h * 0.1); if (g.length > best.length) best = g; }
  return best;
};
// boxes on one horizontal line (top edges within 12px), counted over every line that holds two or more
const inRows = (list) => {
  const rows = [];
  for (const e of [...list].sort((a, b) => a.y - b.y)) { const r = rows.find((x) => Math.abs(x.y - e.y) <= 12); if (r) r.n++; else rows.push({ y: e.y, n: 1 }); }
  const multi = rows.filter((r) => r.n >= 2);
  return { items: multi.reduce((s, r) => s + r.n, 0), rows: multi.length };
};
// repeated items: from measureBand's `repeat` (sibling groups, hidden slides included) when the capture has it; older captures only have the
// element boxes, so same-size pictures side by side or headings on one line stand in for it
const repeatOf = (b, vw, els, on) => {
  if (b.repeat !== undefined) {
    const r = b.repeat; if (!r || r.count < 2) return { items: 0, rows: 0, media: null, iconSize: null, stacked: false, slides: r ? r.hidden + r.offscreen : 0 };
    return { items: r.count, rows: r.rows, media: r.media, iconSize: r.iconSize, stacked: r.cols === 1 && r.itemW >= (b.width ?? vw) * 0.6, slides: r.hidden + r.offscreen };
  }
  const imgs = els.filter((e) => e.role === "image" && on(e));
  const repPhotos = sameSize(imgs.filter((e) => e.w >= 180 && e.h >= 120)), repIcons = sameSize(imgs.filter((e) => Math.max(e.w, e.h) <= 120));
  const headRows = inRows(els.filter((e) => e.role === "heading" && on(e)));
  const imgRows = inRows(repPhotos.length >= 2 ? repPhotos : repIcons.length >= 2 ? repIcons : []);
  const items = Math.max(repPhotos.length >= 2 ? repPhotos.length : 0, repIcons.length >= 2 ? repIcons.length : 0, headRows.items);
  return { items, rows: Math.max(imgRows.rows, headRows.rows, items >= 2 ? 1 : 0), media: items < 2 ? null : repPhotos.length >= 2 ? "photo" : repIcons.length >= 2 ? "icon" : "none",
    iconSize: items >= 2 && repPhotos.length < 2 && repIcons.length >= 2 ? Math.round(Math.max(repIcons[0].w, repIcons[0].h)) : null, stacked: false, slides: 0 };
};
export function shapeOf(b, vw = 1440) {
  if (!b) return null;
  const els = Array.isArray(b.elements) ? b.elements : [];
  const left = b.left ?? 0, width = b.width ?? vw, right = left + width;
  const on = (e) => e.x < right - 4 && e.x + e.w > left + 4;
  const heads = els.filter((e) => e.role === "heading" && on(e));
  // a slider keeps its other slides hidden, or beside the visible one past the right edge
  const offscreen = els.filter((e) => (e.role === "image" || e.role === "heading") && e.x >= right - 4).length;
  const rep = repeatOf(b, vw, els, on);
  // the main picture: the largest photo-sized one on screen (an <img>, a video poster, a CSS background), unless the pictures are the repeated items
  const pics = Array.isArray(b.media) ? b.media.filter(on) : els.filter((e) => e.role === "image" && on(e));
  const photos = pics.filter((e) => e.w >= 180 && e.h >= 120);
  const items = rep.items >= 2 ? rep.items : 0;
  const main = items && rep.media === "photo" ? null : [...photos].sort((x, y) => y.w * y.h - x.w * x.h)[0] ?? null;
  const bgCover = !!b.backgroundImage && ["background", "above-or-behind", "none"].includes(b.imageSide);
  const layout = items ? (rep.stacked ? "list" : "items")
    : (main && main.w >= width * 0.85) || (!main && bgCover) ? "cover"
    : main && ["left", "right"].includes(b.imageSide) ? "split"
    : main && Array.isArray(b.media) && (main.x + main.w / 2 < left + width * 0.4 || main.x + main.w / 2 > left + width * 0.6) ? "split"
    : main ? "stacked" : "text";
  const side = layout !== "split" ? null : ["left", "right"].includes(b.imageSide) ? b.imageSide : main.x + main.w / 2 < left + width / 2 ? "left" : "right";
  return {
    layout, imageSide: side, items, rows: items ? rep.rows : 0, itemMedia: items ? rep.media : null, iconSize: items ? rep.iconSize : null,
    mainImage: main ? { w: main.w, h: main.h } : null, photos: photos.length, slider: !!b.slider || rep.slides > 0 || offscreen > 0,
    video: !!b.video || pics.some((m) => m.kind === "video"), form: !!b.form,
    headings: heads.length, buttons: els.filter((e) => e.role === "button" && on(e) && !/^(prev|previous|next)$/i.test(e.text ?? "")).length, eyebrow: !!b.eyebrow,
  };
}
// in words, for the catalog and the plan-review page: what someone sees, not how it is coloured
export function describeShape(s) {
  if (!s) return "not measured";
  const n = (k, one, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
  const media = s.itemMedia === "photo" ? "a photo" : s.itemMedia === "icon" ? `a small icon (${s.iconSize}px)` : "text only";
  const body = {
    cover: "full-width photo with the text over it",
    split: `text beside one large photo (photo ${s.imageSide})`,
    stacked: "one photo with the text above or below it",
    items: `${s.rows > 1 ? `${s.rows} rows of` : "a row of"} ${s.items} items, each ${media}${s.itemMedia === "none" ? "" : " with text"}`,
    list: `a stacked list of ${s.items} full-width rows, each ${media}${s.itemMedia === "none" ? "" : " with text"}`,
    text: "text only",
  }[s.layout];
  const extra = [s.eyebrow ? "an eyebrow" : "", s.buttons ? n(s.buttons, "button") : "no button", s.slider ? "sliding" : "", s.video ? "a video" : "", s.form ? "a form" : ""].filter(Boolean);
  return `${body}; ${extra.join(", ")}`;
}
// distance between a live band and a component variant: STRUCTURE counts heavily (layout, repeated items, photo or icon, sliding, video, form),
// DETAILS lightly (buttons, headings, eyebrow). Mirroring (photo left or right) is look and costs nothing.
const NEAR = { "split|stacked": 3, "cover|split": 3, "cover|stacked": 3, "items|list": 3 };
export function shapeDistance(live, comp, { canPlayVideo = false } = {}) {
  const why = []; let d = 0;
  const cost = (v, what) => { if (v > 0) { d += v; why.push(what); } };
  if (live.layout !== comp.layout) cost(NEAR[[live.layout, comp.layout].sort((a, b) => LAYOUTS.indexOf(a) - LAYOUTS.indexOf(b)).join("|")] ?? 6, `layout ${comp.layout} (live ${live.layout})`);
  else if (live.layout === "items" || live.layout === "list") {
    if (live.itemMedia !== comp.itemMedia) cost(live.itemMedia === "none" || comp.itemMedia === "none" ? 2 : 3, `items show ${comp.itemMedia} (live ${live.itemMedia})`);
    if (Math.abs(live.items - comp.items) > 1) cost(0.5, `${comp.items} items in the sample (live ${live.items})`);
  }
  if (live.slider !== comp.slider) cost(5, comp.slider ? "slides (live is static)" : "static (live slides)");
  if (live.video && !comp.video && !canPlayVideo) cost(5, "plays no video");
  if (!live.video && comp.video) cost(1, "has a video");
  if (live.form !== comp.form) cost(5, comp.form ? "has a form" : "no form");
  cost(Math.min(1.5, 0.5 * Math.abs(Math.min(live.buttons, 3) - Math.min(comp.buttons, 3))), `${comp.buttons} button(s) (live ${live.buttons})`);
  if (live.layout !== "items" && live.layout !== "list") cost(Math.min(1, 0.3 * Math.abs(Math.min(live.headings, 4) - Math.min(comp.headings, 4))), `${comp.headings} heading(s) (live ${live.headings})`);
  if (live.eyebrow !== comp.eyebrow) cost(0.3, comp.eyebrow ? "has an eyebrow" : "no eyebrow");
  return { distance: Math.round(d * 10) / 10, why };
}
export const fitLabel = (d) => (d <= 2 ? "close" : d <= 6 ? "partial" : "far");

/* ---- shortlist: the base variants closest in shape to a live band. One function, so component-match, component-crops, validate-site-plan
 * (P17) and plan-review always agree. `catalog` is components.json from component-catalog.mjs. ---- */
export function catalogVariants(catalog) {
  return (catalog?.components ?? []).filter((c) => c.id).flatMap((c) => (c.shots ?? []).map((s) => ({
    id: c.id, name: c.name, variant: s.variant, kind: c.kind, canShow: c.canShow ?? {}, shape: s.shape ?? null, looksLike: s.looksLike ?? null, file: s.file ?? null,
  })));
}
// what a component lacks for this band even when the shape fits: more photos than Image fields (extend), a video it cannot play
export function fieldNotes(live, v) {
  const notes = [], imgs = Number(v.canShow?.images ?? 0);
  if (live.layout !== "items" && live.layout !== "list" && live.photos > imgs && imgs >= 1 && v.kind !== "list") notes.push(`the band shows ${live.photos} photos, ${v.name} has ${imgs} Image field(s): fit: extend`);
  if (live.video && !v.canShow?.video && !v.shape?.video) notes.push(`${v.name} cannot play a video`);
  return notes;
}
export function rankVariants(live, variants, top = 3) {
  const scored = variants.filter((v) => v.shape).map((v) => {
    const { distance, why } = shapeDistance(live, v.shape, { canPlayVideo: !!v.canShow?.video });
    return { ...v, distance, fit: fitLabel(distance), why, notes: fieldNotes(live, v) };
  }).sort((a, b) => a.distance - b.distance || a.name.localeCompare(b.name));
  return top ? scored.slice(0, top) : scored;
}
// a look may restyle (colours, fonts, spacing, mirroring the photo, putting it above instead of beside the text) but not restructure:
// another layout (a card row is not an image-and-text split), or sliding where the variant is static (and the other way round)
export function restructures(live, comp) {
  const out = [], pair = [live.layout, comp.layout].sort((a, b) => LAYOUTS.indexOf(a) - LAYOUTS.indexOf(b)).join("|");
  if (live.layout !== comp.layout && pair !== "split|stacked") out.push(`the variant is ${comp.layout}, the live band is ${live.layout}`);
  if (live.slider !== comp.slider) out.push(comp.slider ? "the variant slides, the live band is static" : "the live band slides, the variant is static");
  return out;
}
