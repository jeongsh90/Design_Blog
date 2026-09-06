import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const componentsDir = resolve(root, "components");
const outPath = resolve(root, "style.css");

const ORDER = [
  "tooltip.css",
  "scrollbar.css",
  "smooth-scroll.css",
  "card.css",
  "sidebar.css",
  "header.css",
  "widgets.css",
  "content.css",
  "tistory-overrides.css",
];

const parts = ORDER.map((name) => {
  const text = readFileSync(resolve(componentsDir, name), "utf8");
  return text.replace(/\r\n/g, "\n").replace(/\n+$/, "");
});

const output = '@charset "utf-8";\n\n' + parts.join("\n\n") + "\n";

writeFileSync(outPath, output, "utf8");

console.log(`wrote ${outPath} (${ORDER.length} files, ${output.length} bytes)`);
