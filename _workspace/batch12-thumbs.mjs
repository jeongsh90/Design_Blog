import { chromium } from "playwright";
import { readFileSync, copyFileSync, mkdirSync } from "fs";

const prepared = JSON.parse(readFileSync("_workspace/batch12-prepared.json", "utf8"));
const browser = await chromium.launch({
  executablePath: "C:\\Users\\user\\AppData\\Local\\Temp\\cursor-sandbox-cache\\e55820ec87c377a198867a43310a454a\\playwright\\chromium-1234\\chrome-win64\\chrome.exe",
  headless: true,
  timeout: 60000,
  args: ["--disable-gpu", "--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
page.setDefaultTimeout(20000);

for (const p of prepared) {
  const htmlName = `thumb-${p.id}-${p.slug}.html`;
  const url = `http://127.0.0.1:8811/${htmlName}`;
  await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
  await page.waitForTimeout(900);
  const tmp = `_workspace/noonnu-thumbs/${htmlName.replace(".html", ".png")}`;
  await page.screenshot({ path: tmp, clip: { x: 0, y: 0, width: 1200, height: 630 } });
  mkdirSync(`${p.postFolder}attachments`, { recursive: true });
  copyFileSync(tmp, `${p.postFolder}attachments/thumbnail.png`);
  const buf = readFileSync(tmp);
  const w = buf.readUInt32BE(16);
  const h = buf.readUInt32BE(20);
  if (w !== 1200 || h !== 630) throw new Error(`bad size ${p.id} ${w}x${h}`);
  console.log("ok", p.id, p.name, w, h);
}

await browser.close();
console.log("all thumbs done", prepared.length);
