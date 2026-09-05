# `content.js` — 설계 주석

소스: `dashboard-skin/components/content.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Content 구역 JS

════════════════════════════════════════════════════════════════
   Content 구역 JS
   ────────────────────────────────────────────────────────────────
   1) 페이징 "현재 페이지" 표시  [CONTENT SPEC §8-3, §13-4]
   2) 배경 격자 정사각형 + 반응형 칸 수
      - 칸 = 실측 폭 / N (정사각), N은 짝수(점 마커 교차점)
      - 목표 칸 ≈128px, 범위 ~100–180px
      - 캔버스가 너무 좁아 2칸×100px도 안 되면 카드는 정사각 2행을 씀
   ════════════════════════════════════════════════════════════════

---

## 2. 폭에 맞는 짝수 칸 수. min 보정 후 max를 올리되, min을 깨지 않는다.

폭에 맞는 짝수 칸 수. min 보정 후 max를 올리되, min을 깨지 않는다.

---

## 3. content-box 격자 폭 = content-grid 폭(패딩 안쪽)

content-box 격자 폭 = content-grid 폭(패딩 안쪽)

---

## 4. 배경이 content-inner에 있으므로 row도 inner에 둔다(상속).

배경이 content-inner에 있으므로 row도 inner에 둔다(상속).


## 5. [PROSE SPEC §4-9] 단일 글 본문의 <table>을 가로 스크롤 래퍼로 감싼다.

[PROSE SPEC §4-9] 단일 글 본문의 <table>을 가로 스크롤 래퍼로 감싼다.
     본문은 티스토리 서버가 내려주는 임의 HTML이라 마크업에 래퍼를 쓸 수
     없다 — Design-system이 실제로 쓰는 구조(typography-table-wrap)를
     JS로 동일하게 만든다. CSS 폴백도 함께 있다(JS 미실행 대비).

---

## 6. 스크롤 가능한 영역은 키보드로도 스크롤할 수 있어야 한다(WCAG 2.1.1)

스크롤 가능한 영역은 키보드로도 스크롤할 수 있어야 한다(WCAG 2.1.1)

---

## 7. [FOOTER SPEC §4-2] 글 태그 정규화.

[FOOTER SPEC §4-2] 글 태그 정규화.
     [##_tag_label_rep_##]는 태그 링크 묶음 전체를 통째로 내려주는 단일 치환자라
     (사이드바 <s_random_tags>와 달리) 태그 하나하나에 우리 마크업을 쓸 수 없다.
     서버 출력 형태가 문서에 명시돼 있지 않으므로(쉼표 구분 추정, Q7),
     "앵커만 남기고 나머지 노드는 전부 버린다"는 형태 비의존 방식으로 처리한다.

---

## 8. [FOOTER SPEC §3-3] 공감 — 서버 API가 없는 로컬 전용 장식 카운터.

[FOOTER SPEC §3-3] 공감 — 서버 API가 없는 로컬 전용 장식 카운터.
     실제 다른 방문자의 공감은 알 수 없으므로 숫자는 항상 0 또는 1이다.
     가짜 수치를 만들지 않는다.

---

## 9. [FOOTER SPEC §3-1] 공유 / 링크 복사.

[FOOTER SPEC §3-1] 공유 / 링크 복사.
     공유는 Web Share API가 있을 때만 노출한다(없으면 눌러도 아무 일이 없는
     버튼이 남는다). 복사는 Clipboard API → execCommand 순으로 폴백.

---

## 10. 구형 폴백 — 화면 밖 textarea + execCommand

구형 폴백 — 화면 밖 textarea + execCommand

---

## 11. [FOOTER SPEC §5-2 / Q10] 댓글 아바타 방어.

[FOOTER SPEC §5-2 / Q10] 댓글 아바타 방어.
     [##_rp_rep_logo_##]가 <img> 요소가 아니라 URL 문자열을 내려주는 경우,
     그대로 두면 댓글마다 주소가 텍스트로 노출된다. 요소 자식이 없고
     내용이 URL처럼 보일 때만 <img>로 승격한다.

---

## 12. [스펙 §9-2 대비 편차 — data: 스킴 추가]

[스펙 §9-2 대비 편차 — data: 스킴 추가]
         스펙 원문 정규식은 /^(https?:)?\/\//뿐이었다. 실사이트의 티스토리는
         http(s) URL만 내려주므로 그것으로 충분하지만, 목업은 "외부 URL 금지
         (오프라인 렌더)" 원칙 때문에 data:image/svg+xml URI를 쓴다 —
         그 결과 스펙 §10-3이 이 방어를 검증하려고 심어 둔 케이스가
         정작 "URL이 아님" 분기로 떨어져 §9-4 20번을 확인할 방법이 없었다.
         data:image/ 를 추가한다(순수 가산 — http(s) 동작은 그대로).

---

## 13. 남아 있는 텍스트 노드만 제거 — fallback(요소 자식)은 그대로 둔다

남아 있는 텍스트 노드만 제거 — fallback(요소 자식)은 그대로 둔다

---

## 14. [FOOTER SPEC §5-2]

[FOOTER SPEC §5-2]

---

## 15. 앵커가 없으면 손대지 않는다(폴백 유지)

앵커가 없으면 손대지 않는다(폴백 유지)

---

## 16. '#' 접두어는 CSS ::before가 붙인다 — 텍스트를 고치면 재실행 시 '##'가 된다

'#' 접두어는 CSS ::before가 붙인다 — 텍스트를 고치면 재실행 시 '##'가 된다

---

## 17. 앵커 사이의 구분자 텍스트 노드(", " 등)를 제거한다.

앵커 사이의 구분자 텍스트 노드(", " 등)를 제거한다.

---

## 18. 요소가 아닌 모든 노드 제거

요소가 아닌 모든 노드 제거

---

## 19. CSS 폴백을 비켜나게 하는 스위치

CSS 폴백을 비켜나게 하는 스위치

---

## 20. 이미 <img>면 그대로

이미 <img>면 그대로

---

## 21. URL이 아니면

URL이 아니면

---

## 22. [CODEBLOCK SPEC §6] `initCodeBlocks()` — 본문 `pre`를 정본 figure로 변환

`init()`에서 `initProseTables()` 바로 다음에 실행된다. 본문은 티스토리 서버가
내려주는 임의 HTML이라 마크업에 figure를 쓸 수 없다 — rehype-pretty-code가
빌드 타임에 만들어 주는 DOM을 런타임에 똑같이 조립한다(속성 이름은 정본 그대로,
`content.css.md` 158번 참고).

**`pre` 하나당 순서**
1. `pre[data-code-block="ready"]`면 skip(멱등 — `init()`이 두 번 불려도 figure가 중첩되지 않는다).
2. `code`가 없으면 `pre`의 내용을 새 `code`로 감싼다.
3. `code[data-line-numbers]`가 이미 있으면 **사전 강조 입력**으로 보고 줄 분할·재강조를 건너뛴다(목업의 오프라인 색 검증 샘플이 이 경로).
4. 원문 = `code.textContent`(`\r\n` → `\n`, 끝 개행 1개 제거). 이 문자열을 클로저에 보관해 복사에 쓴다 — 줄번호는 CSS `counter`라 복사 텍스트에 섞이지 않는다(정본 방식을 그대로 쓰는 이유).
5. 메타 파싱(§6-1) → 6. figure/figcaption/복사 버튼 조립 → 7. 줄 span 생성 → 8. `pre`에 `data-code-block="ready"` · `tabindex="0"` · `data-custom-scrollbar` → 9. 복사 핸들러 → 10. highlight.js 주입.

**메타 입력 관례(Q5=b 채택).** 언어 = `data-language` → `data-ke-language` →
`class`의 `language-x`/`lang-x`. 파일명 = `data-filename` → `title` → 첫 줄
지시자(`// filename: foo.json` · `# …` · `<!-- … -->`, 매칭되면 그 줄은 코드에서
제거) → 언어 라벨(`json` → `JSON`) → `code`. 하이라이트 행 = `data-highlight="8"`
또는 `"8,10-12"`(범위) → class 접미사 `{8}`. 티스토리 에디터에는 파일명 필드가
없어 사용자가 HTML을 직접 손대지 않고 쓸 수 있는 경로(첫 줄 주석)가 필요하다.

**⚠ 티스토리 에디터 코드블록 속성은 아직 실측하지 못했다.** `data-ke-type` /
`data-ke-language` 계열이 붙는다고 알려져 있어 "있으면 쓰고 없으면 무시"로만
읽는다. 실제 값은 계정으로 게시글 하나를 올려 확인한 뒤 여기에 적어야 한다.

**복사 2000ms vs 링크복사 1600ms.** 코드 복사는 정본 `copy-button.tsx`의
2000ms를 그대로 쓴다. 같은 화면의 링크 복사(`[data-post-copy]`, FOOTER 구역)는
1600ms 그대로 두었다 — 다른 구역이라 회귀를 만들지 않기 위해 건드리지 않았다.
두 값이 다른 것은 의도된 것이다.

## 23. [CODEBLOCK SPEC §6-2 10번] highlight.js CDN 주입 (Q1=B, 2026-09-05)

`injectHighlightJs()`가 클래식 `<script src>`를 **한 번만** 만들어
`document.body`에 붙인다(`script[data-code-hljs]`로 중복 방지, 변환된 figure가
하나도 없으면 아예 주입하지 않는다).

- **최종 URL(실측 확인): `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js`** — HEAD 200, `x-jsd-version: 11.12.0`. github 테마 CSS는 로드하지 않는다.
- 호출: 줄 단위 `hljs.highlight(line.textContent, { language, ignoreIllegals: true }).value`를 그 `[data-line]`의 innerHTML로 넣는다. 블록 전체 `highlightElement`는 `[data-line]` 구조를 깨므로 쓰지 않는다. `js` 등 별칭은 `HLJS_LANG`으로 `javascript`에 매핑한 뒤 `getLanguage`로 확인한다.
- CDN이 막히면(티스토리 CSP 포함) 색만 빠지고 §6의 폴백(헤더·줄번호·하이라이트 행·복사)은 그대로 살아 있다. `data-code-pending`은 `error`에서도 제거한다.
- 다크 전환은 `.hljs-*` CSS라 재강조·추가 네트워크가 없다.

---
