/**
 * CSS/JS 블록 주석을 동반 .md로 옮기고 소스에서 제거한다.
 * 실행: bun dashboard-skin/tools/extract-comments.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skinRoot = resolve(here, "..");

const TARGETS = [
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

/** CSS/JS 공통: 문자열·템플릿 리터럴 밖의 블록 주석만 추출 */
function extractBlockComments(source) {
  const comments = [];
  let cleaned = "";
  let i = 0;
  const n = source.length;

  while (i < n) {
    const c = source[i];
    const c2 = source[i + 1];

    /* 문자열 */
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      cleaned += c;
      i++;
      while (i < n) {
        const ch = source[i];
        cleaned += ch;
        if (ch === "\\" && quote !== "`") {
          i++;
          if (i < n) {
            cleaned += source[i];
            i++;
          }
          continue;
        }
        if (quote === "`" && ch === "\\" && i + 1 < n) {
          cleaned += source[i + 1];
          i += 2;
          continue;
        }
        if (ch === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    /* 라인 주석 // (JS만 — CSS url(//…) 은 거의 없음, // 단독은 JS) */
    if (c === "/" && c2 === "/") {
      /* CSS에서는 // 주석 비표준. 파일 확장으로 아래에서 분기하지 않고
         여기선 블록만 처리. JS 라인 주석은 별도 패스. */
    }

    /* 블록 주석 */
    if (c === "/" && c2 === "*") {
      const start = i;
      i += 2;
      let body = "";
      while (i < n - 1) {
        if (source[i] === "*" && source[i + 1] === "/") {
          i += 2;
          break;
        }
        body += source[i];
        i++;
      }
      /* 직후 코드 스니펫(앵커용) */
      let j = i;
      while (j < n && /[\s\n\r]/.test(source[j])) j++;
      let anchor = "";
      while (j < n && source[j] !== "{" && source[j] !== ";" && source[j] !== "\n" && anchor.length < 120) {
        anchor += source[j];
        j++;
      }
      anchor = anchor.trim();
      comments.push({ body: body.replace(/^\n/, "").replace(/\n$/, ""), anchor, index: start });
      /* 주석 자리에 공백 한 줄만 남기지 않음 — 앞뒤 개행은 정리 단계에서 */
      continue;
    }

    cleaned += c;
    i++;
  }

  return { comments, cleaned };
}

/** JS // 라인 주석 (문자열 밖) */
function extractLineComments(source) {
  const comments = [];
  let cleaned = "";
  let i = 0;
  const n = source.length;

  while (i < n) {
    const c = source[i];
    const c2 = source[i + 1];

    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      cleaned += c;
      i++;
      while (i < n) {
        const ch = source[i];
        cleaned += ch;
        if (ch === "\\" && i + 1 < n) {
          cleaned += source[i + 1];
          i += 2;
          continue;
        }
        if (ch === quote) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }

    if (c === "/" && c2 === "*") {
      /* 이미 블록 제거 후라면 없어야 함 — 안전하게 통과 */
      cleaned += c;
      i++;
      continue;
    }

    if (c === "/" && c2 === "/") {
      i += 2;
      let body = "";
      while (i < n && source[i] !== "\n") {
        body += source[i];
        i++;
      }
      comments.push({ body: body.trim(), anchor: "", index: i });
      continue;
    }

    cleaned += c;
    i++;
  }

  return { comments, cleaned };
}

function tidyWhitespace(code) {
  return (
    code
      /* 연속 빈 줄 최대 1개 */
      .replace(/\n{3,}/g, "\n\n")
      /* 파일 선두·말미 */
      .replace(/^\s+/, "")
      .replace(/\s+$/, "\n")
  );
}

function toMarkdown(relPath, comments) {
  const lines = [
    `# \`${basename(relPath)}\` — 설계 주석`,
    "",
    `소스: \`dashboard-skin/${relPath.replace(/\\/g, "/")}\``,
    "",
    "이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.",
    "",
  ];

  if (!comments.length) {
    lines.push("_(주석 없음)_", "");
    return lines.join("\n");
  }

  comments.forEach((c, idx) => {
    const title = c.anchor
      ? `${idx + 1}. \`${c.anchor.slice(0, 80)}${c.anchor.length > 80 ? "…" : ""}\``
      : `${idx + 1}.`;
    lines.push(`## ${title}`, "");
    const body = c.body
      .split("\n")
      .map((l) => l.replace(/^\s*\*\s?/, "").replace(/^\s*\/\*+\s?/, "").trimEnd())
      .join("\n")
      .replace(/^\n+/, "")
      .replace(/\n+$/, "");
    lines.push(body, "", "---", "");
  });

  return lines.join("\n").replace(/\n---\n\s*$/, "\n");
}

let totalComments = 0;

for (const rel of TARGETS) {
  const abs = resolve(skinRoot, rel);
  if (!existsSync(abs)) {
    console.warn("skip missing:", rel);
    continue;
  }
  const original = readFileSync(abs, "utf8");
  const isJs = /\.(js|mjs)$/.test(rel);

  let { comments, cleaned } = extractBlockComments(original);
  if (isJs) {
    const linePass = extractLineComments(cleaned);
    comments = comments.concat(linePass.comments);
    cleaned = linePass.cleaned;
  }

  cleaned = tidyWhitespace(cleaned);
  const mdPath = abs + ".md";
  const md = toMarkdown(rel, comments);

  writeFileSync(abs, cleaned, "utf8");
  writeFileSync(mdPath, md, "utf8");

  totalComments += comments.length;
  console.log(
    `${rel}: ${comments.length} comments → ${relative(skinRoot, mdPath)} (${original.length}→${cleaned.length} bytes)`,
  );
}

console.log(`done. ${totalComments} comments extracted.`);
