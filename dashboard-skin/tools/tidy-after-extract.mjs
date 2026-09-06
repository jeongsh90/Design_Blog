/**
 * 이미 주석이 빠진 CSS/JS의 잔여 공백 정리 + skin.html HTML 주석 → .md
 * 실행: bun dashboard-skin/tools/tidy-after-extract.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parseExistingSections, mergeSections, renderMarkdown } from "./md-merge.mjs";

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

/* [2026-09-06 재발 방지] extract-comments.mjs와 같은 이유로 md-merge.mjs를 쓴다 —
   HTML에 새 주석이 없는 상태(이미 한 번 정리됨)에서 재실행하면 기존에 쌓아 둔
   skin.html.md 문서를 지워버리던 버그가 실제로 있었다. */
const mdPath = htmlPath + ".md";
const existingSections = parseExistingSections(mdPath);
const newSections = htmlComments.map((body, idx) => {
  const first = body
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  const title = first ? first.slice(0, 80) : String(idx + 1);
  return { title, body: body.trim() };
});
const allSections = mergeSections(existingSections, newSections);
const addedCount = allSections.length - existingSections.length;

writeFileSync(mdPath, renderMarkdown("skin.html", "skin.html", allSections), "utf8");
console.log(`skin.html: ${addedCount} new comments (+${existingSections.length} kept) → skin.html.md`);
