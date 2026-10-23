import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const url of ["http://localhost:3000/education", "http://localhost:3000/membership", "http://localhost:3000/events", "http://localhost:3000/"]) {
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(600);
  const rows = await page.evaluate(() => {
    const root = document.querySelector(".prod-mode");
    const top = [...root.children].map(k => k.tagName + "#" + k.id + " " + Math.round(k.getBoundingClientRect().height));
    const kids = [...document.querySelectorAll("#content > *")].map(k => Math.round(k.getBoundingClientRect().height) + " " + String(k.className).slice(0,40) + " | " + (k.innerText||"").replace(/\s+/g," ").slice(0,42));
    return { top, kids };
  });
  console.log("\n==", url);
  console.log("top", rows.top.join(" | "));
  console.log(rows.kids.join("\n"));
}
await browser.close();
