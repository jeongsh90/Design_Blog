# 글 상세(permalink) 코드블록 — developer 검증 보고서

## 2026-09-05 부분 재실행 — Q1 A → B (highlight.js)

- **요청:** Shiki가 느려 highlight.js로 교체.
- **스펙:** Q1=**B** 확정. 헤더·줄번호·복사·하이라이트 행은 그대로.
- **CDN:** `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js` (HEAD 200, `x-jsd-version: 11.12.0`). github 테마 CSS는 로드하지 않음.
- **결과:** `bun run skin:verify:codeblock` **183/183 PASS · 실패 0**.
- **업로드:** `content.css`, `content.js`. `skin.html`·`tailwind.css` 변경 없음.
- **의도적 편차:** 토큰 색은 shadcn 문서의 `--shiki-*` 인라인이 아니라 스펙 §8-1 `.hljs-*` CSS. 줄 단위 `hljs.highlight()`라 블록 전체 강조보다 문법 맥락이 약할 수 있음(한 줄짜리 토큰은 정상).
- **미검증:** 티스토리 에디터 `data-ke-*`, 실사이트 CSP.

아래는 2026-09-04 최초 구현 보고서(Q1=A)다.

---

- **스펙:** `_workspace/content-permalink-codeblock_designer-spec.md` (전량 구현)
- **오케스트레이터 채택값:** Q1=A(Shiki CDN) · Q2=b(헤더 혼합 배경) · Q3=b(1px 보더) · Q4=a(mono) · Q5=b(관례 3종). §8-1 highlight.js 매핑은 **사용하지 않음**.
- **결과: 스펙 §9 체크리스트 14/14 PASS** (자동 assert 183건 · 실패 0건)
- **작업 범위:** `dashboard-skin/`만. 1차 `skin/`은 손대지 않음. **새 CSS/JS 파일 0개.**
- **PC(1440×900)만 검증.** 반응형은 스펙대로 착수하지 않음.

---

## 1. 변경 파일

| 파일 | 변경 |
|---|---|
| `dashboard-skin/src/input.css` | `:root`/`.dark`에 `--code` · `--code-foreground` · `--code-highlight` · `--code-number` 4개(hex), `:root`에 `--radius-2xl`, `@theme static`에 `--color-code*` 4개 매핑 (§2-2) |
| `dashboard-skin/components/content.css` | 520행대 `pre` 블록을 §5-1로 교체 + 파일 끝에 §5-2 · §1-3 정본 선택자 · §1-5 보강 3줄 append. 로컬 변수 3개는 `[data-slot="content"]` 스코프 |
| `dashboard-skin/components/content.js` | `initCodeBlocks()` 신설(§6 그대로), `init()`에서 `initProseTables()` 다음에 호출. Shiki 동적 `import()` 주입 포함 |
| `dashboard-skin/tools/make-preview.mjs` | permalink `PROSE_SAMPLE`에 코드블록 샘플 추가(§7 두 개 + Shiki 라이브 경로 검증용 1개 — §3 편차 참고) |
| `dashboard-skin/tools/verify-codeblock.mjs` | **신규**(검증 러너, 업로드 대상 아님). `verify-footer.mjs` 패턴 — Chromium spawn + puppeteer-core, CDP 9361 |
| `dashboard-skin/tailwind.css` | `bun run skin:build` 재생성(`--color-code*` 5개 토큰 출력 확인) |
| `package.json` | `skin:verify:codeblock` 스크립트 추가 |
| `dashboard-skin/README.md` | Content 구역 표에 코드블록 행 추가 + 파일 트리·검증 명령·Shiki CDN 주의 반영 |
| `content.css.md` / `content.js.md` / `input.css.md` | 설명 문서 갱신(소스에는 주석 0개 — §9-14) |
| `_workspace/content_mockup-permalink*.html`, `_workspace/codeblock-shots/*.png`, `_workspace/codeblock-verify-log.md` | 목업·스크린샷·검증 원본 로그(자동 생성물) |

**소스 주석 규칙 준수.** `content.css` · `content.js` · `input.css` · `skin.html` ·
`make-preview.mjs`에 새 주석을 0개 넣었고, 이를 §9-14 정적 검사로 자동 확인한다
(문자열 안의 `//`(Shiki URL)를 오탐하지 않도록 줄머리 주석과 블록 주석 구분자만 센다).
인라인 `:not(pre) > code` 규칙은 건드리지 않았다(§9-9 회귀 검증 통과).

---

## 2. 스펙 §9 체크리스트 결과

실행: `bun run skin:verify:codeblock` (서버 `http://localhost:4321` 필요).
원본 로그는 `_workspace/codeblock-verify-log.md`, 스크린샷은 `_workspace/codeblock-shots/`.

| # | 항목 | light | dark | assert | 실측 요지 |
|---|---|---|---|---|---|
| 1 | 줄번호 거터 | PASS | PASS | 16 | `::before` width 64px · padding-right 24px · 색 `--color-code-number` · 배경 `--color-code` · `position: sticky` · 코드 첫 글자 x = `pre.left + 64`(±0.6) · 줄번호 있는 `pre`의 `padding-inline: 0` |
| 2 | 헤더 | PASS | PASS | 24 | figcaption 높이 43px(42~43 범위) · 아이콘 배지 16×16 원형 · 복사 버튼 32×32 · 하단 보더 1px · 파일명 mono · **헤더 배경 ≠ figure 배경**(Q2=b 유효) · 복사 버튼 우측 여백 16px |
| 3 | figure | PASS | PASS | 24 | `border-radius: 16px` · `overflow: hidden` · `margin-top: 24px` · 보더 1px · `font-size: 14px` · 배경 `--color-code` |
| 4 | 복사 | PASS | PASS | 18 | 클릭 → `data-copied="true"`, idle 아이콘 `display:none`/done 표시 · 1.55초 시점 아직 유지(1600ms 아님 = 2000ms 확인) · 2000ms 후 속성 제거·아이콘 원복 · **클립보드 텍스트가 원문과 정확히 일치**(줄번호 미포함, 개행 보존) |
| 5 | 토큰 | PASS | PASS | 8 | computed `--color-code`/`-highlight`/`-number`가 라이트 `#fafafa`/`#f5f5f5`/`#737373`, 다크 `#171717`/`#262626`/`#a1a1a1` |
| 6 | 강조 색 | PASS | PASS | 4 | 사전강조 샘플 토큰 span의 computed `color`가 라이트=`--shiki-light`, 다크=`--shiki-dark`와 일치(다크 `!important`가 이김) · 두 값이 실제로 다름 |
| 7 | 하이라이트 행 | PASS | PASS | 18 | 그 행만 배경 `--code-highlight`, 다른 행 투명 · `:after` 바 폭 2px, **높이 = 그 행 높이**(figure 전체 아님 — §1-5 `position: relative` 보강 유효) · 빈 줄 `min-height` 보강 적용 |
| 8 | 가로 오버플로 | PASS | PASS | 10 | `document.documentElement.scrollWidth === clientWidth`(1440) · `pre.scrollWidth(1654) > clientWidth(804)`로 **`pre`만** 스크롤 · `tabindex="0"`·`data-custom-scrollbar` 부여 · 가로 스크롤 후 줄번호 sticky 고정(코드만 밀림) |
| 9 | 인라인 code 회귀 | PASS | PASS | 14 | `:not(pre) > code` 배경/패딩/라운드/폰트 수정 전과 동일 · 문단 행간 변화 0 |
| 10 | no-JS | PASS | PASS | 20 | `content_mockup-permalink-nojs.html`에서 figure 0개(폴백 경로)인데도 `pre`가 카드로 렌더 — 배경 `--code` · radius 16px · 보더 1px · padding 14/16 · 긴 줄은 `pre` 안에서만 스크롤 · 문서 가로 오버플로 0 · 콘솔 에러 0 |
| 11 | 멱등성 | PASS | — | 5 | `content.js` 재주입으로 `initCodeBlocks()` 2회차 실행 → figure 3개·줄 19개·복사 버튼 3개 **불변**, figure 중첩 0, 예외 0 |
| 12 | CDN 차단 | PASS | — | 9 | Shiki CDN 요청 abort 상태에서 figure 3개 그대로 · 줄 6개 폴백 유지 · 강조 span 0(색만 빠짐) · 헤더·복사 버튼·줄번호 거터(64px) 정상 · `data-code-pending` 정리됨 · **미처리 예외 0** |
| 13 | 다크 토글 | PASS | — | 2 | 토글 후 **추가 네트워크 요청 0건**(재강조 없음), 색만 바뀜 — `defaultColor: false` 이중 테마가 의도대로 동작 |
| 14 | 주석 | PASS | — | 1 | 새로 추가·수정한 CSS/JS/HTML 주석 0개 |
| A | (추가) Shiki 라이브 | PASS | PASS | 8 | 실제 CDN 강조 경로 — `--shiki-light` 인라인 변수 주입 확인 · 첫 줄 filename 지시자가 코드에서 제거됨 |
| 30 | (추가) 콘솔 | PASS | PASS | 2 | 정상 로드 시 콘솔/네트워크 에러 0(favicon 제외) |

**합계: 스펙 항목 14/14 PASS · 자동 assert 183/183 PASS · 실패 0.**
(`A`·`30`은 스펙 표에 없는 자체 추가 검증이라 14 계산에 포함하지 않았다.)

---

## 3. 의도적 편차 (스펙과 다르게 한 것)

| # | 스펙 | 실제 | 사유 |
|---|---|---|---|
| D1 | §7 목업 샘플 **2개**(사전강조 JSON + 기존 긴 `pre`) | **3개** — `class="language-js"` plain `pre`를 하나 더 추가 | 스펙의 두 샘플로는 **Shiki 라이브 경로를 검증할 수 없다.** 사전강조 샘플은 §6에서 재강조를 건너뛰고, 기존 긴 `pre`는 언어가 없어 skip되는 것이 정상이기 때문. 세 번째 샘플이 언어 감지 → CDN import → 이중 테마 변수 주입 → 첫 줄 filename 지시자 제거까지를 실제로 태운다(체크 `A`). 목업 전용이며 스킨 코드에는 영향 없음. |
| D2 | §5-3 충돌 표에 없음 | `… > pre > code[data-line-numbers] { display: grid }` **1줄 추가** | 기존 `pre code { display: block }`(content.css 543행, 특정성 (0,1,2))가 정본 `[data-line-numbers] { display: grid }`((0,1,0))를 이겨 **줄번호 grid가 통째로 무효화**되는 것을 실측으로 발견. 정본 선택자를 고쳐 쓰지 않기 위해 더 구체적인 선택자 1줄만 추가해 되돌렸다. |
| D3 | `--code-border`는 라이트·다크 공통(`--border` 30% 혼합) | `.dark [data-slot="content"]`에서 `var(--color-border)`로 재선언 | 이 스킨의 다크 `--border`는 이미 알파값(`#ffffff1a` ≈ 10%)이라 30%를 다시 곱하면 3%가 되어 보더가 사라진다. 정본은 다크 `--border`가 불투명이라는 전제. |
| D4 | 라이트 `--code-highlight` 정본 변환값 `#f2f2f2` | `#f5f5f5` | Design-system neutral 스케일에 `#f2f2f2`가 없다. 한 단계 가까운 neutral-100을 채택(sidebar 구역에서 확정한 "hex 유지 + 팔레트 스냅" 방침). |
| D5 | §9-4 "done 아이콘 `inline-flex`" | 표시 여부(`display !== "none"`)만 검증 | CSS 사양상 **flex 컨테이너의 자식은 `inline-flex`가 `flex`로 블록화**된다(복사 버튼이 `inline-flex`라 내부 아이콘의 computed display는 항상 `flex`). 시각 결과는 스펙과 동일하고, 이 프로젝트에서 같은 이유로 단서를 단 선례가 있다. |
| D6 | — | `--radius-2xl` 신설 | 프로젝트에 없던 값이다. 정본 figure가 이 라운드를 쓰므로 기존 스케일 관례(`calc(var(--radius) * n)`)에 맞춰 `* 1.6`(= 1rem)으로 추가했다. Tailwind 기본 `--radius-2xl`과 같은 값. |

### 편차가 아닌 관측 사항

- **클립보드 CRLF.** Windows Chromium은 `navigator.clipboard.readText()`가 개행을 `\r\n`으로 정규화해 돌려준다. 복사되는 문자열 자체는 원문 그대로이므로 **검증 스크립트 쪽에서만** `\r\n → \n` 정규화 후 비교했다(구현 변경 아님).
- **CDN 차단 시 브라우저 로그.** 요청을 abort시키면 브라우저 네트워크 계층이 `Failed to load resource: net::ERR_FAILED`를 3건 남긴다. **JS로 억제할 수 없는 로그**이며 미처리 예외(pageerror)는 0이다 — §9-12의 "콘솔 에러 없이"는 우리 코드가 던지는 에러 기준으로 판정했다.
- **복사 지연 2000ms vs 링크복사 1600ms.** 스펙 §8-9대로 코드 복사만 정본 2000ms를 쓰고, 기존 `[data-post-copy]`의 1600ms는 회귀 방지를 위해 건드리지 않았다.

---

## 4. Shiki CDN 최종 URL

```
https://cdn.jsdelivr.net/npm/shiki@4.4.3/+esm
```

- 실측 확인: **HTTP 200 · 33,898 bytes · `application/javascript; charset=utf-8`**. 스펙이 developer 확인 항목으로 남겨둔 URL이 404 없이 그대로 유효했다(대체 URL 불필요).
- 호출: `codeToHtml(raw, { lang, themes: { light: "github-light", dark: "github-dark" }, defaultColor: false })`.
- 로드 방식: `content.js`가 `type="module"` 스크립트를 **필요할 때 한 번만** `document.body`에 주입한다. 본문에 변환된 코드블록이 하나도 없으면 요청 자체가 발생하지 않는다.
- 실패 시: `try/catch`로 감싸 색만 빠지고 나머지 기능은 유지(§9-12 통과).

---

## 5. 업로드 파일 (티스토리 스킨편집 > HTML편집 > 파일 업로드)

이번 구역에서 **다시 올려야 하는 파일 3개:**

| 파일 | 사유 |
|---|---|
| `dashboard-skin/components/content.css` | §5-1 교체 + 코드블록 절 append |
| `dashboard-skin/components/content.js` | `initCodeBlocks()` 신설 |
| `dashboard-skin/tailwind.css` | `--color-code*` 4개 + `--radius-2xl` 반영 재빌드 |

- **`src/input.css`는 업로드 대상이 아니다** — Tailwind 빌드 입력일 뿐이며 `tailwind.css`에 결과가 들어간다.
- **`skin.html`은 이번 구역에서 다시 올릴 필요가 없다** — 치환자·스크립트 태그 변경이 없다(Shiki는 `content.js`가 런타임에 주입하므로 HTML에 `<script>` 추가가 없다).
- 새 업로드 파일이 늘지 않았다(총 14개 유지).

---

## 6. 검증하지 못한 것 (실서버 확인 필요)

1. **티스토리 에디터가 코드블록에 실제로 붙이는 속성.** `data-ke-type` / `data-ke-language` 계열이라고 알려져 있어 "있으면 쓰고 없으면 무시"로만 읽었다. 계정이 없어 실측 불가 — 게시글 하나를 올려 확인한 뒤 `content.js.md` 22번에 값을 적어야 한다.
2. **티스토리의 jsdelivr CSP 허용 여부.** 막히면 §9-12 폴백(색만 빠짐)이 그대로 적용된다. 배포 후 실제 글에서 강조가 나오는지 한 번 확인할 것.
3. **에디터가 남긴 기존 `hljs-*` 마크업과의 실제 조우.** §6-2대로 `textContent`로 원문을 복원해 재강조하도록 구현했으나, 실제 에디터 출력으로 재현하지는 못했다(목업 입력으로만 검증).
4. **반응형.** PC 1440×900만 검증했다. 좁은 뷰포트에서 헤더(파일명 말줄임)·거터 64px의 거동은 반응형 구역에서 다룬다.
