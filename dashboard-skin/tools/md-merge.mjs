/**
 * 주석 짝 .md 파일에 공용으로 쓰는 "누적 병합" 헬퍼.
 * [2026-09-06] extract-comments.mjs와 tidy-after-extract.mjs가 각자 이 로직을
 * 복붙해 갖고 있다가 어긋나는 걸 막기 위해 공용화했다 — 두 도구 모두
 * "재실행해도 기존 문서를 절대 지우지 않고, 새로 찾은 것만 뒤에 이어붙인다"는
 * 계약을 지켜야 한다(과거 이 계약이 없어 실제로 문서가 통째로 날아간 적 있음).
 */
import { readFileSync, existsSync } from "node:fs";

/** 기존 .md에서 "## 제목\n\n본문\n\n---" 섹션들을 {title, body}[]로 복원한다. */
export function parseExistingSections(mdPath) {
  if (!existsSync(mdPath)) return [];
  const raw = readFileSync(mdPath, "utf8");
  const parts = raw.split(/\n## /);
  if (parts.length < 2) return [];
  return parts
    .slice(1)
    .map((sec) => {
      const nl = sec.indexOf("\n");
      const rawTitle = nl === -1 ? sec : sec.slice(0, nl);
      const body = (nl === -1 ? "" : sec.slice(nl + 1)).replace(/\n---\n?\s*$/, "").trim();
      const title = rawTitle.replace(/^\d+\.\s*/, "");
      return { title, body };
    })
    .filter((s) => s.body.length > 0);
}

/** existing + new를 병합한다 — new 중 이미 있는 본문과 정확히 같은 것은 건너뛴다. */
export function mergeSections(existingSections, newSections) {
  const existingBodies = new Set(existingSections.map((s) => s.body));
  const uniqueNew = newSections.filter((s) => !existingBodies.has(s.body));
  return existingSections.concat(uniqueNew);
}

/** {title, body}[] → 이 프로젝트의 표준 .md 포맷 문자열. */
export function renderMarkdown(relPath, fileBasename, sections) {
  const lines = [
    `# \`${fileBasename}\` — 설계 주석`,
    "",
    `소스: \`dashboard-skin/${relPath}\``,
    "",
    "이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.",
    "",
  ];

  if (!sections.length) {
    lines.push("_(주석 없음)_", "");
    return lines.join("\n");
  }

  sections.forEach((s, idx) => {
    const title = s.title ? `${idx + 1}. ${s.title}` : `${idx + 1}.`;
    lines.push(`## ${title}`, "");
    lines.push(s.body, "", "---", "");
  });

  return lines.join("\n").replace(/\n---\n\s*$/, "\n");
}
