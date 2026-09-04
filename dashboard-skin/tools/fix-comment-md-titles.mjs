/**
 * *.css.md / *.js.md / skin.html.md 섹션 제목을 본문 첫 의미 줄로 정리
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { resolve, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skinRoot = resolve(here, "..");

function meaningfulTitle(body) {
  const lines = body.split("\n").map((l) =>
    l
      .replace(/^[\s═─\-*=#]+/, "")
      .replace(/[\s═─\-*=#]+$/, "")
      .trim(),
  );
  const hit = lines.find((l) => l.length > 2 && !/^\/\*/.test(l));
  return hit ? hit.slice(0, 90) : null;
}

function fixMd(abs) {
  const raw = readFileSync(abs, "utf8");
  const parts = raw.split(/\n## /);
  if (parts.length < 2) return false;

  const head = parts[0];
  const sections = parts.slice(1).map((sec) => {
    const nl = sec.indexOf("\n");
    const oldTitle = nl === -1 ? sec : sec.slice(0, nl);
    const body = nl === -1 ? "" : sec.slice(nl + 1);
    /* body ends with ---\n optionally */
    const bodyCore = body.replace(/\n---\n?\s*$/, "").trim();
    const numMatch = oldTitle.match(/^(\d+)\./);
    const num = numMatch ? numMatch[1] : "?";
    const better = meaningfulTitle(bodyCore);
    const title = better ? `${num}. ${better}` : oldTitle;
    return `## ${title}\n\n${bodyCore}\n\n---\n`;
  });

  const out = (head.trimEnd() + "\n\n" + sections.join("\n")).replace(/\n---\n\s*$/, "\n");
  if (out !== raw) {
    writeFileSync(abs, out, "utf8");
    return true;
  }
  return false;
}

const dirs = [join(skinRoot, "components"), join(skinRoot, "src"), skinRoot];
let n = 0;
for (const dir of dirs) {
  for (const name of readdirSync(dir)) {
    if (!name.endsWith(".md")) continue;
    if (!/\.(css|js|html)\.md$/.test(name)) continue;
    if (fixMd(join(dir, name))) {
      console.log("fixed titles:", name);
      n++;
    }
  }
}
console.log("done,", n, "files");
