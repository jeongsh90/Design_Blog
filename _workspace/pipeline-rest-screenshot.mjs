import { chromium } from "playwright";
import { readFileSync, existsSync, writeFileSync } from "fs";

const need = JSON.parse(readFileSync("_workspace/pipeline-rest-need-thumbs.json", "utf8")).filter(
  (p) => !existsSync(`posts/2026-09-10-noonnu-font-${p.slug}/attachments/thumbnail.png`),
);

console.log("need", need.length);
const browser = await chromium.launch({
  headless: true,
  channel: "chrome",
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
let done = 0;
const fail = [];
for (const p of need) {
  try {
    await page.goto(`http://127.0.0.1:8811/thumb-${p.id}-${p.slug}.html`, {
      waitUntil: "domcontentloaded",
      timeout: 20000,
    });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(150);
    await page.screenshot({
      path: `posts/2026-09-10-noonnu-font-${p.slug}/attachments/thumbnail.png`,
      clip: { x: 0, y: 0, width: 1200, height: 630 },
    });
    done++;
    if (done % 25 === 0) console.log("done", done, "/", need.length);
  } catch (e) {
    fail.push({ id: p.id, slug: p.slug, err: String(e).slice(0, 160) });
    console.log("FAIL", p.id, e.message);
  }
}
await browser.close();
writeFileSync(
  "_workspace/pipeline-rest-thumb-result.json",
  JSON.stringify({ need: need.length, done, fail }, null, 2),
);
console.log(JSON.stringify({ done, fail: fail.length }, null, 2));
