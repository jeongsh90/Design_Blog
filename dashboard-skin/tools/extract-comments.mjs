/**
 * CSS/JS 블록 주석을 동반 .md로 옮기고 소스에서 제거한다.
 * 실행: bun dashboard-skin/tools/extract-comments.mjs
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve, dirname, basename, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { parseExistingSections, mergeSections, renderMarkdown } from "./md-merge.mjs";

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

/* 정규식 리터럴 뒤에 // 라인 주석 오탐 방지(2026-09-05 실측 버그 — content.js의
   /^(https?:)?\/\/|^data:image\// 같은 패턴에서 이스케이프된 "\/" 바로 뒤에 정규식을
   닫는 "/"가 와서 우연히 "//"로 보이면 그 지점부터 줄 끝까지(정규식 나머지 + .test(...)
   호출부까지) 통째로 지워버렸다 — 노드 --check로 실제 재현·확인됨, 두 번 재발). JS
   전체 파서 없이 "이 위치에서 정규식이 시작될 수 있는가"를 판별하는 표준 휴리스틱만
   추가해 정규식 리터럴 전체를 건너뛴다. */
const REGEX_PRECEDING_PUNCT = new Set([
  "(", ",", "=", ":", "[", "!", "&", "|", "?", "{", "}", ";",
  "+", "-", "*", "/", "%", "^", "~", "<", ">",
]);
const REGEX_PRECEDING_KEYWORDS = new Set([
  "return", "typeof", "instanceof", "in", "of", "new", "delete",
  "void", "throw", "case", "do", "else", "yield", "await",
]);

function regexCanStartHere(cleaned) {
  let j = cleaned.length - 1;
  while (j >= 0 && /\s/.test(cleaned[j])) j--;
  if (j < 0) return true; // 파일 맨 앞
  const ch = cleaned[j];
  if (REGEX_PRECEDING_PUNCT.has(ch)) return true;
  let k = j;
  while (k >= 0 && /[A-Za-z0-9_$]/.test(cleaned[k])) k--;
  const word = cleaned.slice(k + 1, j + 1);
  return REGEX_PRECEDING_KEYWORDS.has(word);
}

/** JS // 라인 주석 (문자열·정규식 리터럴 밖) */
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

    if (c === "/" && c2 !== "/" && c2 !== "*" && regexCanStartHere(cleaned)) {
      /* 정규식 리터럴 통째로 복사 — 문자 클래스([...]) 안의 "/"는 닫는 delimiter가
         아니고, "\"로 이스케이프된 문자는 항상 다음 문자와 한 쌍으로 그대로 둔다. */
      let j = i + 1;
      let inClass = false;
      while (j < n) {
        const ch = source[j];
        if (ch === "\\" && j + 1 < n) {
          j += 2;
          continue;
        }
        if (ch === "[") inClass = true;
        else if (ch === "]") inClass = false;
        else if (ch === "/" && !inClass) {
          j++;
          break;
        } else if (ch === "\n") {
          break; // 정규식은 리터럴 개행을 못 담는다 — 여기서 포기하고 평문 취급
        }
        j++;
      }
      while (j < n && /[a-z]/i.test(source[j])) j++; // 플래그(g/i/m/...)
      cleaned += source.slice(i, j);
      i = j;
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

/* [2026-09-06 재발 방지] 이 파일은 재실행이 전제인 도구다("신규 주석 추가 후 재실행" —
   README에 명시된 사용법). 그런데 원래 구현은 매번 .md를 그 실행에서 찾은 comments만으로
   완전히 새로 써서, 소스가 이미 한 번 정리돼 새 주석이 0건인 상태에서 다시 돌리면(정확히
   이런 일이 실제로 벌어졌다 — 이미 문서화된 내용이 있는 채로 재실행) 그동안 쌓아 둔 문서를
   통째로 "_(주석 없음)_"으로 지워버렸다. `md-merge.mjs`의 공용 병합 로직으로 기존 .md의
   섹션을 먼저 읽어 보존하고, 새로 찾은 것 중 이미 있는 본문과 겹치지 않는 것만 뒤에
   이어 붙인다 — 몇 번을 다시 돌려도 누적만 되고 유실되지 않는다(같은 소스에 새 주석이
   없으면 파일이 바이트 단위로 그대로 — 진짜 무해한 재실행). */
function formatNewSection(c) {
  const title = c.anchor
    ? `\`${c.anchor.slice(0, 80)}${c.anchor.length > 80 ? "…" : ""}\``
    : "";
  const body = c.body
    .split("\n")
    .map((l) => l.replace(/^\s*\*\s?/, "").replace(/^\s*\/\*+\s?/, "").trimEnd())
    .join("\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "");
  return { title, body };
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

  const existingSections = parseExistingSections(mdPath);
  const newSections = comments.map(formatNewSection);
  const allSections = mergeSections(existingSections, newSections);
  const addedCount = allSections.length - existingSections.length;

  const md = renderMarkdown(rel.replace(/\\/g, "/"), basename(rel), allSections);

  writeFileSync(abs, cleaned, "utf8");
  writeFileSync(mdPath, md, "utf8");

  totalComments += addedCount;
  console.log(
    `${rel}: ${addedCount} new comments (+${existingSections.length} kept) → ${relative(skinRoot, mdPath)} (${original.length}→${cleaned.length} bytes)`,
  );
}

console.log(`done. ${totalComments} comments extracted.`);
