/**
 * 이미 주석이 빠진 CSS/JS의 잔여 공백 정리 + skin.html HTML 주석 → .md
 * 실행: bun dashboard-skin/tools/tidy-after-extract.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skinRoot = resolve(here, "..");

const CODE_TARGETS = [
  "components/content.css",
  "components/content.js",
  "components/widgets.css",
  "components/header.css",
  "components/header.js",
  "components/sidebar.css",
  "components/sidebar.js",
  "components/scrollbar.css",
  "components/card.css",
  "components/tooltip.css",
  "components/tooltip.js",
  "components/smooth-scroll.css",
  "components/smooth-scroll.js",
  "src/input.css",
];

function tidyCode(src) {
  return src
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\{\n\n+/g, "{\n")
    .replace(/\n\n+\}/g, "\n}")
    .replace(/^\s+/, "")
    .replace(/\s+$/, "\n");
}

for (const rel of CODE_TARGETS) {
  const abs = resolve(skinRoot, rel);
  if (!existsSync(abs)) continue;
  const before = readFileSync(abs, "utf8");
  const after = tidyCode(before);
  if (after !== before) {
    writeFileSync(abs, after, "utf8");
    console.log("tidied", rel, before.length, "→", after.length);
  }
}

/* ── skin.html HTML comments ── */
const htmlPath = resolve(skinRoot, "skin.html");
const html = readFileSync(htmlPath, "utf8");
const htmlComments = [];
const htmlClean = html.replace(/<!--([\s\S]*?)-->/g, (_, body) => {
  const trimmed = body.replace(/^\n/, "").replace(/\n$/, "");
  htmlComments.push(trimmed);
  return "";
});

const htmlTidied = htmlClean
  .replace(/[ \t]+$/gm, "")
  .replace(/\n{3,}/g, "\n\n")
  .replace(/^\s+/, "")
  .replace(/\s+$/, "\n");

writeFileSync(htmlPath, htmlTidied, "utf8");

const mdLines = [
  "# `skin.html` — 설계 주석",
  "",
  "소스: `dashboard-skin/skin.html`",
  "",
  "이 파일의 HTML 주석을 소스에서 분리해 보관한다.",
  "",
];

htmlComments.forEach((body, idx) => {
  const first = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  const title = first ? first.slice(0, 80) : String(idx + 1);
  mdLines.push(`## ${idx + 1}. ${title}`, "", body.trim(), "", "---", "");
});

writeFileSync(htmlPath + ".md", mdLines.join("\n").replace(/\n---\n\s*$/, "\n"), "utf8");
console.log(`skin.html: ${htmlComments.length} comments → skin.html.md`);
