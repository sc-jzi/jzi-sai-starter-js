/**
 * One-off scrape of Suffolk County homepage carousel + key images.
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import https from 'https';
import http from 'http';

const OUT = join(import.meta.dirname || '.', '');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`${res.statusCode} ${url}`));
      }
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => {
        writeFileSync(dest, Buffer.concat(chunks));
        resolve(dest);
      });
    });
    req.on('error', reject);
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto('https://suffolkcountyny.gov/', { waitUntil: 'networkidle', timeout: 60000 });
await page.waitForTimeout(4000);

const dump = await page.evaluate(() => {
  const carouselSelectors = [
    '.carousel',
    '[class*="carousel" i]',
    '[class*="slider" i]',
    '[class*="rotator" i]',
    '[id*="Banner" i]',
    '[id*="banner" i]',
    '[class*="flexslider" i]',
    '[class*="nivo" i]',
    '[class*="swiper" i]',
    '[data-ride="carousel"]',
    '.DNNModuleContent',
  ];

  const mods = [];
  for (const sel of carouselSelectors) {
    document.querySelectorAll(sel).forEach((el) => {
      const text = (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 800);
      const imgs = [...el.querySelectorAll('img')].map((img) => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
      }));
      const links = [...el.querySelectorAll('a')].slice(0, 12).map((a) => ({
        text: (a.innerText || '').trim().slice(0, 120),
        href: a.href,
      }));
      mods.push({
        sel,
        id: el.id,
        className: (el.className || '').toString().slice(0, 200),
        text,
        imgs,
        links,
      });
    });
  }

  const allImgs = [...document.querySelectorAll('img')]
    .map((img) => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight,
    }))
    .filter((i) => i.src && i.w >= 200);

  const titles = [...document.querySelectorAll('h1,h2,h3,h4,.slide-title,[class*="caption"]')]
    .map((el) => (el.innerText || '').trim())
    .filter(Boolean)
    .slice(0, 80);

  return { mods: mods.slice(0, 40), allImgs: allImgs.slice(0, 80), titles };
});

const slides = [];
for (let i = 0; i < 10; i++) {
  const snap = await page.evaluate(() => {
    const visible = [...document.querySelectorAll('*')].filter((el) => {
      const r = el.getBoundingClientRect();
      const st = getComputedStyle(el);
      return r.width > 400 && r.height > 180 && st.opacity !== '0' && st.display !== 'none';
    });
    const banner = visible.find((el) => {
      const t = (el.innerText || '').toLowerCase();
      return (
        t.includes('stop bullying') ||
        t.includes('emergency preparedness') ||
        t.includes('police reform') ||
        t.includes('hazard mitigation') ||
        t.includes('build a kit') ||
        t.includes('get started')
      );
    });
    const el = banner || document.querySelector('[class*="carousel" i], [class*="slider" i], [id*="Banner" i]');
    if (!el) return null;
    const img = el.querySelector('img');
    let bg = '';
    try {
      const m = getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/);
      bg = m ? m[1] : '';
    } catch {}
    return {
      text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 500),
      img: img ? img.currentSrc || img.src : '',
      alt: img ? img.alt : '',
      bg,
      className: (el.className || '').toString().slice(0, 160),
    };
  });
  if (snap) slides.push({ index: i, ...snap });

  const next = page.locator(
    '.carousel-control-next, .carousel-control-next-icon, [aria-label="Next"], .flex-next, .nivo-nextNav, a.next, button.next, [class*="slick-next"]'
  ).first();
  if (await next.count()) {
    await next.click({ force: true }).catch(() => {});
    await page.waitForTimeout(1200);
  } else {
    break;
  }
}

writeFileSync(join(OUT, 'carousel-dump.json'), JSON.stringify({ dump, slides }, null, 2));
console.log('Wrote carousel-dump.json');
console.log('slides', slides.length);
console.log(JSON.stringify(slides, null, 2).slice(0, 4000));
console.log('--- titles ---');
console.log(dump.titles.join('\n'));
console.log('--- imgs ---');
dump.allImgs.slice(0, 30).forEach((i) => console.log(i.w, i.h, i.alt, i.src));

await browser.close();
