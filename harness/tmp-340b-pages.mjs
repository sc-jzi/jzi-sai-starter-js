import { chromium } from "playwright";

const slug = process.argv[2];
const host = process.argv[3] || "http://localhost:3020";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
page.on("console", (m) => { if (m.type() === "error") console.log("CONSOLE:", m.text().slice(0, 400)); });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message.slice(0, 400)));
await page.goto(`${host}/${slug}`, { waitUntil: "networkidle", timeout: 120000 }).catch(() => {});
await page.waitForTimeout(2500);
const tag = host.includes("localhost") ? "local" : "live";
const out = `${process.env.TEMP}\\pvp-verify\\pages\\${slug}-${tag}.png`;
await page.screenshot({ path: out, fullPage: true });
const info = await page.evaluate(() => ({
  height: document.documentElement.scrollHeight,
  errors: [...document.querySelectorAll("nextjs-portal, .no-data-fallback")].length,
  sections: [...document.querySelectorAll("main .component, #content .component")]
    .filter((e) => !e.parentElement.closest(".component"))
    .map((e) => `${Math.round(e.getBoundingClientRect().top + scrollY)} ${Math.round(e.getBoundingClientRect().height)} ${e.className.slice(0, 90)}`),
}));
console.log(out);
console.log(JSON.stringify(info, null, 1));
await browser.close();
