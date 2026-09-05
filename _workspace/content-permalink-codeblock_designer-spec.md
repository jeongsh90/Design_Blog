# 코드블록(글 상세 본문 `pre`) 비주얼 스펙 — Content 구역 부분 재실행

> 요청: "코드블럭 shadcn/ui에서 사용중인 코드블럭 그대로 구현" + 스크린샷(라이트 모드 / 둥근 카드 + 회색 헤더바(파일 아이콘 + `components.json`) + 오른쪽 복사 아이콘 / 줄번호 1~10 + JSON 구문강조 + 8번 줄 전체폭 하이라이트 + 왼쪽 세로 바)
>
> **범위:** 글 상세 본문의 **블록 `pre`만** 교체한다. 인라인 `[data-slot="post-single-body"] :not(pre) > code`(content.css 504~518행)는 **손대지 않는다**.
>
> **파일 경계(이 프로젝트 추출 규칙 — 두 번째 구역이 쓰기 시작하기 전에는 별도 파일로 뽑지 않는다):**
> | 파일 | 작업 |
> |---|---|
> | `dashboard-skin/components/content.css` | 520~541행 `pre` 블록 **교체** + 파일 끝에 코드블록 절 **추가** |
> | `dashboard-skin/components/content.js` | `initCodeBlocks()` 추가 + `init()`에 등록 |
> | `dashboard-skin/src/input.css` | `--code*` 토큰 4개 + `--radius-2xl` **추가**(§2·§3 근거) |
> | `dashboard-skin/tools/make-preview.mjs` | permalink `PROSE_SAMPLE`에 JSON 코드블록 2종 추가(§7) |
> | `content.css.md` / `content.js.md` / `input.css.md` | 설명·근거 기록(§10) |
> | 신규 CSS/JS 파일, `skin/`(1차 폴더), `skin.html` 치환자 | **금지** |
>
> 반응형은 이번 범위 밖(PC만).

---

## 1. shadcn 정본 구조 (오케스트레이터 WebFetch 실측 인용 — 추측 없음)

레지스트리에 `code-block` UI 컴포넌트는 **없다**. 정본은 shadcn 문서 사이트 v4(`apps/v4`)의 코드 렌더링 파이프라인이다.

### 1-1. `apps/v4/lib/highlight-code.ts`

- Shiki `codeToHtml`
- 테마: 라이트 `github-light` / 다크 `github-dark` (듀얼 테마 → span에 `--shiki-light` / `--shiki-dark` 인라인 변수)
- transformers가 심는 것:
  - `pre` class: `no-scrollbar min-w-0 overflow-x-auto overflow-y-auto overscroll-x-contain overscroll-y-auto px-4 py-3.5 outline-none has-[[data-highlighted-line]]:px-0 has-[[data-line-numbers]]:px-0 has-[[data-slot=tabs]]:p-0 !bg-transparent`
  - `code`: `data-line-numbers=""`
  - 각 줄: `data-line=""`

### 1-2. `apps/v4/app/globals.css` — 토큰

| 토큰 | 라이트(정본 oklch) | 다크(정본 oklch) |
|---|---|---|
| `--code` | `var(--surface)` = `oklch(0.98 0 0)` | `oklch(0.2 0 0)` |
| `--code-foreground` | `var(--surface-foreground)` = `var(--foreground)` | `oklch(0.708 0 0)` |
| `--code-highlight` | `oklch(0.96 0 0)` | `oklch(0.27 0 0)` |
| `--code-number` | `oklch(0.56 0 0)` | `oklch(0.72 0 0)` |

`@theme inline` 매핑: `--color-code`, `--color-code-foreground`, `--color-code-highlight`, `--color-code-number` — **이름 그대로 유지**한다.

### 1-3. `globals.css @layer components` — 선택자 (정본 그대로)

```css
[data-rehype-pretty-code-figure] {
  background-color: var(--color-code);
  color: var(--color-code-foreground);
  border-radius: var(--radius-2xl);
  border-width: 0px;
  overflow: hidden;
  font-size: var(--text-sm);
  margin-top: calc(var(--spacing) * 6);
}
[data-rehype-pretty-code-title] {
  border-bottom: color-mix(in oklab, var(--border) 30%, transparent);
  padding-block: calc(var(--spacing) * 2.5);
  padding-inline: calc(var(--spacing) * 4);
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-code-foreground);
}
[data-line-numbers] { display: grid; min-width: 100%; white-space: pre; counter-reset: line; }
[data-line-numbers] [data-line]::before {
  counter-increment: line;
  content: counter(line);
  display: inline-block;
  width: calc(var(--spacing) * 16);
  padding-right: calc(var(--spacing) * 6);
  text-align: right;
  color: var(--color-code-number);
  background-color: var(--color-code);
  position: sticky; left: 0;
}
[data-line] { padding-block: calc(var(--spacing) * 0.25); width: 100%; display: inline-block; }
[data-line] span { color: var(--shiki-light); }
.dark [data-line] span { color: var(--shiki-dark) !important; }
[data-highlighted-line] { background-color: var(--color-code-highlight); }
[data-highlighted-line]:after {
  position: absolute; top: 0; left: 0; width: 2px; height: 100%; content: "";
  background-color: color-mix(in oklab, var(--muted-foreground) 50%, transparent);
}
```

### 1-4. `copy-button.tsx` / `component-source.tsx`(ComponentCode) — 상태·구성

- 복사: Clipboard API → 실패 시 `textarea` + `document.execCommand("copy")` 폴백. 성공 시 아이콘을 체크로 바꾸고 **2초 후 복귀**. Button `ghost`.
- 구성: `figure` 안에 (title 있으면) `figcaption` = 언어 아이콘 + 파일명, 그 오른쪽에 복사 버튼, 그 아래에 강조된 HTML.

### 1-5. 정본 발췌에 없지만 **반드시 보강해야 하는 3줄** (이유 포함)

| 보강 | 이유 |
|---|---|
| `[data-highlighted-line] { position: relative; }` | 정본 `:after`가 `top:0;left:0;height:100%`로 **그 줄에** 붙으려면 그 줄이 containing block이어야 한다. `display:inline-block`만으로는 위치 기준이 생기지 않아 바가 figure/pre 전체 높이로 그려진다. |
| `[data-rehype-pretty-code-title] { border-bottom-width: 1px; border-bottom-style: solid; }` | 정본 발췌의 `border-bottom: color-mix(...)`는 색만 있는 축약형이라 그대로 쓰면 보더가 렌더되지 않는다(스크린샷에는 헤더 하단 구분선이 있음). |
| `[data-line] { min-height: calc(var(--leading-relaxed) * 1em); }` | 빈 줄(`[data-line]`에 텍스트 노드가 없는 줄)의 높이가 0으로 접혀 줄번호가 어긋난다. 정본은 Shiki가 개행 텍스트 노드를 함께 넣어주지만, 이 스킨의 폴백 경로(§6)는 순수 텍스트 분할이라 빈 줄이 실제로 발생한다. |

---

## 2. 색상 매핑 (이 프로젝트 형식 = hex, Design-system 팔레트)

정본 oklch를 sRGB로 변환한 뒤 Design-system neutral 스케일의 **같은 색**으로 치환했다(변환값과 팔레트값이 사실상 일치 — sidebar 구역에서 확정한 "hex 유지" 방침 그대로).

| shadcn 변수명 | 라이트 | 다크 | 정본 oklch → sRGB 변환값 | Design-system / 이 스킨 출처 |
|---|---|---|---|---|
| `--code` | `#fafafa` | `#171717` | `#f8f8f8` / `#161616` | globals.css 329행 `--color-neutral-50` / 338행 `--color-neutral-900` (= 이 스킨 `--sidebar` 라이트 · `--card` 다크와 동일 값) |
| `--code-foreground` | `#000000` | `#a1a1a1` | 라이트=정본이 `--foreground` 참조 / 다크 `#a1a1a1` | 라이트: 이 스킨 `input.css` 15행 `--foreground`(이 프로젝트는 순검정을 쓴다) · 다크: globals.css 333행 `--color-neutral-400` |
| `--code-highlight` | `#f5f5f5` | `#262626` | `#f2f2f2` / `#262626` | globals.css 330행 `--color-neutral-100` / 337행 `--color-neutral-800`. 라이트 변환값 `#f2f2f2`는 팔레트에 없어 한 단계 가까운 `#f5f5f5` 채택(`--code` `#fafafa`와 5/255 차 — 스크린샷의 하이라이트도 이 정도로 옅다) |
| `--code-number` | `#737373` | `#a1a1a1` | `#747474` / `#a4a4a4` | globals.css 334행 `--color-neutral-500` / 333행 `--color-neutral-400` (= 이 스킨 `--muted-foreground` 라이트/다크와 동일 값) |

### 2-1. 컴포넌트 로컬 변수 (content.css 상단 `[data-slot="content"]` 블록의 `--content-*` 관례를 따른다)

| 로컬 변수 | 라이트 | 다크 | 근거 |
|---|---|---|---|
| `--code-border` | `color-mix(in oklab, var(--color-border) 30%, transparent)` | `var(--color-border)` | 정본은 라이트/다크 모두 30% 혼합이지만, 이 스킨의 다크 `--border`는 이미 알파값(`#ffffff1a` = 흰색 10%)이라 30%를 다시 곱하면 3%로 사라진다. 다크만 100%로 쓴다. |
| `--code-header` | `color-mix(in oklab, var(--color-foreground) 4%, var(--color-code))` | 동일 식 | 스크린샷의 "헤더바는 연한 회색 / 본문은 밝음" 위계 재현(§8 Q2). 라이트 ≈ `#f0f0f0` on `#fafafa`, 다크 ≈ `#202020` on `#171717` — 두 테마에서 같은 방향(한 단계 밝기 차)으로 동작한다. |
| `--code-bar` | `color-mix(in oklab, var(--color-muted-foreground) 50%, transparent)` | 동일 식 | 정본 `[data-highlighted-line]:after` 값 그대로. |

### 2-2. `input.css`에 추가할 것 (실측 결과 **현재 없음**)

- `:root` / `.dark`에 `--code` · `--code-foreground` · `--code-highlight` · `--code-number` (§2 표의 hex).
- `@theme static`에 `--color-code` · `--color-code-foreground` · `--color-code-highlight` · `--color-code-number` (`var(--code*)` 매핑 — 정본 `@theme inline` 패턴 그대로, 이 스킨은 `@theme static`을 쓰므로 그쪽에 넣는다).
- **`--radius-2xl`: 프로젝트 전체(`input.css`·`tailwind.css`·`components/*`)에 존재하지 않음을 grep으로 확인했다.** 기존 스케일(`--radius-sm: radius*0.6` / `md: *0.8` / `lg: *1` / `xl: *1.4`)을 이어 `--radius-2xl: calc(var(--radius) * 1.6)`을 추가한다 → `0.625rem * 1.6 = 1rem`으로 Tailwind 기본 `--radius-2xl`(1rem)·정본 figure 라운드와 정확히 일치한다.
- 토큰 추가 후 **`bun run skin:build` 재빌드 필수**(그러지 않으면 `tailwind.css`에 `--color-code*`가 없어 전부 무효 선언이 된다).

---

## 3. 치수 / 여백 (PC, 1rem = 16px 기준)

| 항목 | 값 | 실제 px | 비고 |
|---|---|---|---|
| figure 라운드 | `var(--radius-2xl)` | 16px | 정본. `overflow: hidden`으로 코드가 모서리에서 잘림 |
| figure 상단 여백 | `calc(var(--spacing) * 6)` | 24px | 정본값과 이 스킨 프로즈 규칙(content.css 438행 `figure` 포함)이 이미 동일 — **새 margin 선언 불필요** |
| figure 보더 | `1px solid var(--code-border)` | 1px | 정본은 `border-width: 0`. §4-1 판정 참조 |
| figure 글자 크기 | `var(--text-sm)` | 14px | 정본 |
| 헤더 좌우 패딩 | `calc(var(--spacing) * 4)` | 16px | 정본 |
| 헤더 상하 패딩 | `calc(var(--spacing) * 1.25)` | 5px | 정본은 2.5(10px)지만 32px 복사 버튼이 flow에 들어오면 헤더가 52px로 커진다 → 패딩을 줄이고 아래 `min-height`로 정본 높이를 지킨다 |
| 헤더 최소 높이 | `calc(var(--spacing) * 10.5)` | 42px | 정본 계산치(10 + 21 + 10 + 1) 유지. 보더 포함 실측 박스 = 42~43px |
| 헤더 아이콘 배지 | `calc(var(--spacing) * 4)` 정사각 + `border-radius: calc(var(--spacing) * 999)` | 16px 원형 | 스크린샷의 "작은 원형 파일 아이콘" |
| 헤더 아이콘 글리프 | `calc(var(--spacing) * 2.5)` | 10px | lucide `file` |
| 아이콘 ↔ 파일명 간격 | `calc(var(--spacing) * 2)` | 8px | |
| 복사 버튼 | 기존 프리미티브 `data-size="icon-sm"` | 32px (svg 16px) | header.css 167~170행 재사용 — 새 사이즈 토큰 만들지 않는다 |
| `pre` 패딩(줄번호 있을 때) | `padding-inline: 0` / `padding-block: calc(var(--spacing) * 3.5)` | 0 / 14px | 정본 `has-[[data-line-numbers]]:px-0` + `py-3.5` |
| `pre` 패딩(줄번호 없음 = no-JS 폴백) | `calc(var(--spacing) * 4)` / `calc(var(--spacing) * 3.5)` | 16px / 14px | 정본 `px-4 py-3.5` |
| 줄번호 거터 폭 | `calc(var(--spacing) * 16)` | 64px | 정본. 그중 `padding-right: calc(var(--spacing) * 6)`(24px) → 숫자는 우측정렬 0~40px 구간, 코드 첫 글자 x = 64px |
| 줄 상하 패딩 | `calc(var(--spacing) * 0.25)` | 1px | 정본 |
| 줄 행간 | `var(--leading-relaxed)` | 22.75px (행 높이 ≈ 24.75px) | 정본 문서사이트는 더 좁지만, 이미 승인된 PROSE 스펙의 `pre` 행간을 계승한다(한글 주석이 섞인 코드 가독성) |
| 하이라이트 좌측 바 | `width: 2px; height: 100%` | 2px | 정본(px 리터럴 그대로 — 정본이 그렇다) |
| 탭 폭 | `tab-size: 2` | | 현행 유지 |

**10줄 JSON 샘플 총 높이(계산):** 헤더 43 + `py` 28 + 10 × 24.75 ≈ **318px**, 폭은 본문 measure(720px) 그대로.

---

## 4. Tistory / 바닐라 환경 제약으로 정본과 달라지는 부분

### 4-1. 판정표

| # | 정본 | 이 스킨 | 이유 |
|---|---|---|---|
| 1 | 빌드 타임 Shiki(`codeToHtml`)로 서버에서 강조 | **클라이언트에서 강조** | 티스토리는 정적 파일 업로드만 가능하고 빌드 파이프라인이 없다. 본문은 `[##_article_rep_desc_##]`로 임의 HTML이 그대로 꽂힌다 → 강조는 런타임 밖에 방법이 없다(엔진 선택은 §8 Q1). |
| 2 | rehype-pretty-code가 `figure`/`figcaption`/`[data-line]`을 만들어 준다 | **content.js가 DOM으로 동일 구조를 조립** | 서버 렌더가 없다. **속성 이름은 정본 그대로**(`data-rehype-pretty-code-figure`, `data-rehype-pretty-code-title`, `data-line-numbers`, `data-line`, `data-highlighted-line`) 써서 §1-3 CSS를 한 글자도 바꾸지 않고 재사용한다. |
| 3 | `border-width: 0px` | `1px solid var(--code-border)` | 라이트에서 figure 배경 `#fafafa`가 본문 배경 `#ffffff`와 5/255 차이라 경계가 사라진다. 스크린샷에도 얇은 보더가 있다. |
| 4 | `no-scrollbar`(스크롤바 완전 숨김) | `data-custom-scrollbar` 부여 | 이 프로젝트에는 "스크롤 중에만 얇은 썸을 보여주는" 공용 관례(`components/scrollbar.css`)가 이미 있다. 정지 상태 외형은 정본과 같고(썸 opacity 0%) 스크롤 어포던스만 유지된다. `content.js`가 `smooth-scroll.js`보다 먼저 로드되므로(skin.html 705·706행) 속성만 붙여두면 자동 연동된다. |
| 5 | 복사 버튼이 figure 기준 absolute | `figcaption` 안 flow 배치(`justify-content: space-between`) | absolute를 쓰면 figure에 `position: relative`가 필요하고, 같은 스택에서 `[data-highlighted-line]:after`의 위치 기준과 헷갈릴 수 있다. flow 배치는 탭 순서도 자연스럽다(헤더 → 코드). 헤더 높이는 §3의 `min-height`로 정본과 동일하게 고정한다. |
| 6 | `figcaption`에 언어별 브랜드 아이콘 | lucide `file` 글리프 1종 + 원형 배지 | 문서사이트의 언어 아이콘 세트를 재배포할 수 없다. 스크린샷의 "작은 원형 아이콘" 인상은 유지한다. |
| 7 | 하이라이트 행이 거터까지 물들지 않음(`::before`에 `--color-code` 배경) | **정본 유지** | 거터 배경은 가로 스크롤 시 숫자 뒤로 코드가 비치지 않게 하는 장치다. 스크린샷도 세로 바는 맨 왼쪽에 있고 숫자 칸은 본문 톤이다. |
| 8 | 에디터가 남긴 기존 강조 마크업 | **폐기 후 재강조** | 티스토리 에디터가 붙이는 `hljs-*` span과 Shiki 출력이 섞이면 색 규칙이 두 벌이 된다. `textContent`로 원문을 복원해 한 엔진으로만 강조한다(§6-2). 단 목업의 사전강조 샘플(`code[data-line-numbers]`가 이미 있는 경우)은 건너뛴다. |
| 9 | `2000ms` 후 복사 아이콘 복귀 | **`2000ms` 유지** | 정본값. 기존 링크복사(`[data-post-copy]`, content.js 220행)의 `1600ms`는 **건드리지 않는다**(다른 구역, 회귀 방지). 두 값이 다른 사실은 `content.js.md`에 적는다. |
| 10 | 파일명은 MDX meta에서 옴 | 치환자가 없어 **관례 파싱** | §6-1·§8 Q5. |

### 4-2. 티스토리 입력 HTML 형태 (developer가 실제 게시글로 확인할 것)

- `<pre><code class="language-json">…</code></pre>` — 마크다운/외부 에디터 붙여넣기
- `<pre class="language-json"><code>…` — 언어가 `pre`에 붙는 변형
- 티스토리 에디터 코드블록: `data-ke-type="codeblock"` / `data-ke-language="…"` 계열 속성이 붙는 것으로 알려져 있으나 **이 프로젝트에서 실측한 바 없음** → `initCodeBlocks()`는 이 속성을 "있으면 쓰고 없으면 무시"하는 선택지로만 읽고, 실제 값은 developer가 게시글 하나로 확인해 `content.js.md`에 기록한다.
- `<pre>`만 (언어 없음) → 강조 없이 헤더 라벨 `code`.

### 4-3. 인라인 module 주입이 막힐 경우 (CSP 폴백)

Shiki는 ESM이라 `content.js`(클래식 스크립트)가 `type="module"` 스크립트를 주입해 로드한다. 티스토리가 인라인 스크립트를 막으면 이 주입이 실패하는데, 그때도 §6의 폴백(헤더·줄번호·복사)은 그대로 동작하므로 **색만 빠진다**. 색이 꼭 필요하면 `skin.html` 맨 아래에 `<script type="module">` 한 줄을 직접 추가하는 것으로 대체한다(**치환자 영역은 건드리지 않는다**).

---

## 5. CSS 구현 스펙 (content.css)

> 아래는 **읽기용 스펙**이다. 실제 소스에는 주석을 넣지 않는다(§10).

### 5-1. 520~541행 `pre` 블록 — 교체

no-JS / JS 실패 시에도 코드블록이 "정본 카드"로 보이도록 **base가 figure 없이도 성립**해야 한다.

```css
[data-slot="post-single-body"] pre {
  max-width: 100%;
  min-width: 0;
  padding: calc(var(--spacing) * 3.5) calc(var(--spacing) * 4);
  border: 1px solid var(--code-border);
  border-radius: var(--radius-2xl);
  background-color: var(--color-code);
  color: var(--color-code-foreground);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-relaxed);
  letter-spacing: normal;
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
  tab-size: 2;
  overflow-x: auto;
  overflow-y: hidden;
  outline: none;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
[data-slot="post-single-body"] pre:focus-visible {
  outline: calc(var(--spacing) * 0.5) solid var(--color-ring);
  outline-offset: calc(var(--spacing) * 0.5);
}
```

`pre code` 블록(543행~)은 현행 유지.

### 5-2. 파일 끝에 추가할 코드블록 절

```css
[data-slot="post-single-body"] [data-rehype-pretty-code-figure] {
  background-color: var(--color-code);
  color: var(--color-code-foreground);
  border: 1px solid var(--code-border);
  border-radius: var(--radius-2xl);
  overflow: hidden;
  font-size: var(--text-sm);
}

[data-slot="post-single-body"] [data-rehype-pretty-code-figure] > [data-rehype-pretty-code-title] {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 2);
  margin-top: 0;
  padding-block: calc(var(--spacing) * 1.25);
  padding-inline: calc(var(--spacing) * 4);
  min-height: calc(var(--spacing) * 10.5);
  border-bottom: 1px solid var(--code-border);
  background-color: var(--code-header);
  color: var(--color-code-foreground);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  letter-spacing: normal;
  text-align: left;
  word-break: normal;
}

[data-slot="code-block-name"] { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
[data-slot="code-block-icon"] {
  display: inline-flex; align-items: center; justify-content: center; flex: none;
  width: calc(var(--spacing) * 4); height: calc(var(--spacing) * 4);
  border-radius: calc(var(--spacing) * 999);
  background-color: color-mix(in oklab, var(--color-code-foreground) 12%, transparent);
  color: var(--color-code-foreground);
}
[data-slot="code-block-icon"] > svg { width: calc(var(--spacing) * 2.5); height: calc(var(--spacing) * 2.5); }
[data-code-copy] { margin-left: auto; flex: none; }
[data-code-copy] > [data-copy-when="done"] { display: none; }
[data-code-copy][data-copied="true"] > [data-copy-when="idle"] { display: none; }
[data-code-copy][data-copied="true"] > [data-copy-when="done"] { display: inline-flex; }

[data-slot="post-single-body"] [data-rehype-pretty-code-figure] > pre {
  margin-top: 0;
  border: 0;
  border-radius: 0;
  background-color: transparent;
  overflow-y: auto;
}
[data-slot="post-single-body"] [data-rehype-pretty-code-figure] > pre:has([data-line-numbers]),
[data-slot="post-single-body"] [data-rehype-pretty-code-figure] > pre:has([data-highlighted-line]) {
  padding-inline: 0;
}
```

이어서 §1-3 정본 블록을 **그대로**(`[data-line-numbers]`, `[data-line]`, `[data-line] span`, `.dark [data-line] span`, `[data-highlighted-line]`, `:after`) + §1-5 보강 3줄. `--muted-foreground`/`--border` 직접 참조는 이 프로젝트 관례상 `--color-*` 형태로 쓰고, 바 색은 `--code-bar`로 뽑는다.

### 5-3. 기존 프로즈 규칙과의 충돌 (반드시 덮어써야 하는 것)

| 기존 규칙 | 충돌 | 처리 |
|---|---|---|
| `figcaption`(content.css 630~638행): `margin-top: 2`, `text-align: center`, `color: --color-muted-foreground`, `word-break: keep-all` | 코드 헤더가 가운데 정렬 + 흐린 색으로 렌더 | §5-2에서 4개 속성 전부 재선언(선택자 특정성 `(0,2,1)` > `(0,1,1)`, 파일 뒤쪽에 배치) |
| `:is(blockquote,pre,figure,…) { margin-top: 6 }`(438행) | figure 안의 `pre`에도 24px가 붙어 헤더와 코드가 벌어짐 | `> pre { margin-top: 0 }` |
| `figure > :first-child { margin-top: 0 }`(453행) | 우리 figcaption에 유리하게 작동 | 그대로 두고 명시 재선언 |
| `[data-slot="post-body"] … pre/figure { display:none }`(273행) | 목록 요약 화면 | 변환은 `post-single-body`에서만 하므로 영향 없음 |

---

## 6. JS 변환 알고리즘 (content.js)

`init()`에 `initCodeBlocks()`를 `initProseTables()` 다음에 추가한다. 파일의 기존 스타일(ES5, `var`, IIFE, `Array.prototype.forEach.call`)을 유지한다.

### 6-1. 메타 추출 규칙

| 항목 | 우선순위 |
|---|---|
| 언어 | `pre[data-language]` → `pre[data-ke-language]` → `code`/`pre`의 `class`에서 `language-x` 또는 `lang-x` → 없으면 `""` |
| 파일명 | `pre[data-filename]` → `pre[title]` → 첫 줄 지시자 `// filename: foo.json` · `# filename: foo.py` · `<!-- filename: foo.html -->`(매칭되면 그 줄은 코드에서 제거) → 언어 라벨(`json`→`JSON`, `ts`→`TS` …) → `code` |
| 하이라이트 행 | `pre[data-highlight="8"]` 또는 `"8,10-12"`(범위 지원) → class 접미사 `{8}`(rehype-pretty-code meta 관례) → 없으면 없음 |

### 6-2. 변환 순서 (`pre` 하나당)

1. `[data-slot="post-single-body"] pre`를 순회. `pre.getAttribute("data-code-block") === "ready"`면 **skip**(멱등 — init이 두 번 불려도 figure가 중첩되지 않는다).
2. `code` 확보(없으면 `pre`의 내용을 새 `code`로 감싼다).
3. 사전강조 판별: `code.hasAttribute("data-line-numbers")` → 이미 `[data-line]` 구조 → **줄 분할·강조 단계를 건너뛰고** 4~6·8~9만 수행.
4. 원문 확보: `raw = code.textContent`, `\r\n` → `\n` 정규화, 끝의 개행 1개 제거. 이 문자열을 클로저에 보관해 **복사에 사용**(줄번호는 CSS `counter`라 복사 텍스트에 섞이지 않는다 — 이게 정본 방식을 그대로 쓰는 이유다).
5. §6-1로 언어/파일명/하이라이트 행 파싱.
6. figure 조립:
   - `figure` 생성 → `data-rehype-pretty-code-figure=""`, `data-slot="code-block"`, `data-language="{lang}"`.
   - `pre` 앞에 삽입하고 `pre`를 그 안으로 이동.
   - `figcaption` 생성 → `data-rehype-pretty-code-title=""`; 자식 = `span[data-slot="code-block-icon"]`(lucide `file`) + `span[data-slot="code-block-name"]`(파일명) + 복사 버튼. figure의 첫 자식으로 삽입.
   - 복사 버튼: `button[type="button"][data-slot="button"][data-variant="ghost"][data-size="icon-sm"][data-code-copy][aria-label="코드 복사"]`, 자식 svg 2개 — `data-copy-when="idle"`(lucide `copy`: `<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>`) / `data-copy-when="done"`(lucide `check`: `<path d="M20 6 9 17l-5-5"/>` — skin.html 367행과 같은 패스). `stroke-width="2"`, `stroke-linecap/linejoin="round"`, `fill="none"`, `stroke="currentColor"`, `aria-hidden="true"` — 기존 아이콘 관례 그대로.
7. 줄 구성(3에서 건너뛰지 않은 경우): `code`를 비우고 `data-line-numbers=""` 설정 → `raw.split("\n")` 각 줄마다 `span[data-line=""]` 생성(텍스트는 `textContent`로 삽입 — 이스케이프 걱정 없음), 하이라이트 대상 줄에는 `data-highlighted-line=""` 추가.
8. `pre` 속성: `data-code-block="ready"`, `tabindex="0"`(가로 스크롤 키보드 접근 — `prose-table-wrap` 선례), `data-custom-scrollbar`.
9. 복사 핸들러: `navigator.clipboard.writeText(raw)` → 실패/미지원 시 `textarea`+`execCommand("copy")` 폴백(기존 `initPostShare` 코드와 동일 형태). 성공 시 `data-copied="true"` + `[data-post-status]`가 있으면 `"코드를 복사했습니다"`, **2000ms** 후 속성 제거. 연속 클릭 대비 `clearTimeout`.
10. 강조 단계(**Q1=B, 2026-09-05**): 변환된 figure를 모아두고 **한 번만** 클래식 스크립트를 주입한다. ESM/Shiki는 쓰지 않는다.
    - URL(오케스트레이터 HEAD 실측 200, `x-jsd-version: 11.12.0`): `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js`
    - `script[data-code-hljs]`로 중복 방지. pending figure가 없으면 주입하지 않는다. github 테마 CSS 파일은 로드하지 않는다(색은 §8-1을 `content.css`에 직접).
    - `onload` 후 각 `[data-line]`의 `textContent`를 `hljs.highlight(text, { language, ignoreIllegals: true }).value`로 바꿔 넣는다(줄 구조를 깨지 않으려고 블록 전체가 아니라 **줄 단위**). `hljs.getLanguage(lang)`이 없으면 그 블록은 건너뛴다.
    - 로드/하이라이트 실패 시 **색만 빠진다** → §6-2의 7번 폴백 그대로(헤더·줄번호·복사·하이라이트 행은 살아 있음). `data-code-pending`은 에러 시에도 제거한다.
11. 다크 전환: 토큰 색은 `.hljs-*` 클래스의 라이트/다크 CSS라 **재강조 호출이 없다**.

---

## 7. 목업 지시 (`tools/make-preview.mjs`)

오프라인 원칙(외부 URL 금지, `data:image` 선례)을 지킨다. CDN이 없는 로컬 목업에서도 색·줄번호·하이라이트를 검증할 수 있도록 `PROSE_SAMPLE`의 `<h3>코드 블록</h3>` 절에 **두 개**를 둔다.

1. **사전강조 JSON 샘플**(스크린샷 재현 — 오프라인 색 검증용): `<pre data-filename="components.json" data-highlight="7"><code data-line-numbers>` 안에 `<span data-line>` 10줄을 직접 작성하고, 토큰마다 `class="hljs-attr"` / `hljs-string` / `hljs-literal`을 넣는다(§6-2의 3번 경로를 태워 JS가 재강조를 건너뛰게 한다). 내용은 `components.json` 느낌:
   ```
   1 {
   2   "$schema": "https://ui.shadcn.com/schema.json",
   3   "style": "new-york",
   4   "tailwind": {
   5     "css": "src/app/globals.css",
   6     "baseColor": "neutral",
   7     "cssVariables": true
   8   },
   9   "aliases": { "components": "@/components", "utils": "@/lib/utils" }
   10 }
   ```
   7번 줄(`"cssVariables": true`)에 `data-highlighted-line` → 스크린샷의 "한 줄 전체폭 하이라이트 + 좌측 세로 바" 재현.
2. **기존 긴-줄 plain `pre`는 유지**(현행 166~171행). 언어·파일명이 없는 입력 경로(헤더 라벨 `code`) + 본문 폭 720px를 넘는 줄의 가로 스크롤 회귀를 같은 화면에서 함께 검증한다.

`content_mockup-permalink-nojs.html`(content.js 제거 사본)에도 그대로 실려 §9의 no-JS 항목을 검증한다.

---

## 8. 확인 필요 (제안값 = 스펙 저자가 채택을 권하는 값)

| # | 쟁점 | 선택지 | **제안** |
|---|---|---|---|
| Q1 | 구문강조 엔진 | (A) Shiki 4.4.3 CDN ESM 듀얼테마 — 정본과 100% 동일(정본 CSS가 소비하는 `--shiki-light`/`--shiki-dark`를 유일하게 만들어 주는 방식) / (B) highlight.js 11.12.0 CDN + `github`·`github-dark` 테마를 우리가 CSS로 매핑(가볍지만 §1-3의 `[data-line] span` 규칙이 무의미해지고 토큰 색표를 우리가 관리해야 함) | **B (2026-09-05 사용자 확정)**. 최초 제안은 A였으나 런타임 Shiki ESM(하이라이터+테마 2개+문법)이 너무 느려 사용자가 highlight.js로 교체를 지시. 헤더·줄번호·복사·하이라이트 행 크롬은 유지하고 토큰 색만 §8-1 표로 매핑한다. 다크 전환은 클래스 색 CSS라 재강조 없음. |
| Q2 | 헤더바 배경 | (a) 정본 그대로 figure 단색 + 하단 보더만 / (b) 헤더만 `--code-header`(foreground 4% 혼합)로 한 단계 | **(b)**. 스크린샷의 "회색 헤더바 / 밝은 본문"이 사용자가 지목한 기준 화면이고, 정본 단색은 라이트에서 헤더·본문 위계가 사라진다. 정본 대비 변경은 이 한 줄뿐. |
| Q3 | figure 보더 | (a) 정본 `border-width: 0` / (b) `1px solid var(--code-border)` | **(b)**. 라이트에서 `#fafafa` on `#ffffff`는 경계가 안 보이고, 스크린샷에도 얇은 보더가 있다. |
| Q4 | 파일명 폰트 | (a) 정본 `var(--font-mono)` / (b) 스크린샷 인상대로 `var(--font-sans)` | **(a)**. "구조·토큰은 정본 그대로"가 이 프로젝트의 상위 원칙이고, 파일명은 경로 문자열이라 모노가 의미상도 맞다. |
| Q5 | 파일명·하이라이트 입력 관례 지원 범위 | (a) `data-filename`/`data-highlight`만 / (b) + `class="language-x"` 언어 라벨 폴백 + 첫 줄 `// filename:` 지시자 | **(b)**. 티스토리 에디터에는 파일명 필드가 없어 사용자가 HTML을 직접 손대지 않고도 쓸 수 있는 경로(첫 줄 주석)가 하나는 필요하다. 아무 것도 없으면 언어 라벨 → `code`로 내려가므로 헤더는 **항상** 그려진다(스크린샷도 항상 헤더가 있다). |

### 8-1. Q1에서 (B)를 고를 경우에만 필요한 매핑 (**미실측 — 채택 시 developer가 `github-light`/`github-dark` 테마 JSON으로 재확인**)

| hljs 클래스 | 라이트 | 다크 |
|---|---|---|
| `.hljs-attr` / `.hljs-attribute` | `#0550ae` | `#79c0ff` |
| `.hljs-string` | `#0a3069` | `#a5d6ff` |
| `.hljs-number` / `.hljs-literal` | `#0550ae` | `#79c0ff` |
| `.hljs-keyword` | `#cf222e` | `#ff7b72` |
| `.hljs-comment` | `#6e7781` | `#8b949e` |
| `.hljs-title.function_` | `#8250df` | `#d2a8ff` |
| `.hljs-variable` / `.hljs-params` | `#953800` | `#ffa657` |
| 기본 텍스트 | `var(--color-code-foreground)` | `var(--color-code-foreground)` |

---

## 9. developer 체크리스트 (Playwright 실측)

| # | 항목 | 판정 기준 |
|---|---|---|
| 1 | 줄번호 거터 | `[data-line]::before` 계산 폭 **64px**, `padding-right` **24px**, 코드 첫 글자 x = `pre` 좌측 + 64px(`padding-inline: 0` 적용됨) |
| 2 | 헤더 | 박스 높이 **42~43px**, 아이콘 배지 16×16 원형, 복사 버튼 32×32, 하단 보더 1px, 파일명 `components.json`이 mono로 렌더 |
| 3 | figure | `border-radius` 16px, `overflow: hidden`(모서리에서 코드가 잘림), 상단 여백 24px, 보더 1px |
| 4 | 복사 | 클릭 → `data-copied="true"` 존재 + idle svg `display:none` / done `inline-flex`, **2000ms** 후 속성 제거, 클립보드 텍스트가 원문과 정확히 일치(줄번호 미포함, 개행 보존) |
| 5 | 토큰 | computed `--color-code`/`--color-code-highlight`/`--color-code-number`가 라이트 `#fafafa`/`#f5f5f5`/`#737373`, 다크 `#171717`/`#262626`/`#a1a1a1` |
| 6 | 강조 색 | 사전강조 샘플의 `.hljs-attr`(또는 `.hljs-string`) computed `color`가 라이트/다크에서 §8-1 표와 일치 |
| 7 | 하이라이트 행 | 그 행만 배경 = `--code-highlight`, `:after` 바 폭 2px·높이 = 행 높이(전체 figure 높이가 아님 — §1-5 보강 확인), 다른 행 배경 투명 |
| 8 | 가로 오버플로 | `document.documentElement.scrollWidth === clientWidth`(긴 줄 있어도 0건), `pre.scrollWidth > pre.clientWidth`이며 `pre`만 스크롤, 가로 스크롤 후에도 줄번호가 `position: sticky`로 좌측 고정 |
| 9 | 인라인 code 회귀 | `:not(pre) > code`의 배경/패딩/라운드/폰트가 수정 전과 동일, 문단 행간 변화 0 |
| 10 | no-JS | `content_mockup-permalink-nojs.html`에서 `pre`가 figure 없이도 카드로 렌더(bg `--code`, radius 16px, padding 16/14, 보더 1px) + 가로 스크롤 동작 + 레이아웃 붕괴 없음 |
| 11 | 멱등성 | `initCodeBlocks()` 2회 실행 시 figure 중첩 0, `[data-rehype-pretty-code-figure]` 개수 불변 |
| 12 | CDN 차단 | 네트워크 오프라인/차단 상태에서 콘솔 에러 없이 폴백(헤더·줄번호·하이라이트 행·복사 정상, 색만 무채색) |
| 13 | 다크 토글 | 토글 후 추가 네트워크 요청 0(재강조 없음), 색만 바뀜 |
| 14 | 주석 | 새로 추가·수정된 CSS/JS/HTML에 `/* */`·`//` 주석 0개 |

---

## 10. 주석 / 문서화 규칙 (developer 필독)

- **소스(`content.css`, `content.js`, `skin.html`, `input.css`)에는 주석을 넣지 않는다.** 기존 파일에 남아 있는 `[PROSE SPEC …]` 주석은 이번 작업에서 건드리지 않되, **새로 쓰는 코드에는 주석을 달지 않는다**.
- 설명·근거·의도적 편차는 짝 문서에만 적는다: `content.css.md`(§5의 선택자별 근거, §5-3 충돌 처리), `content.js.md`(§6 알고리즘, Shiki CDN 최종 URL·버전, 복사 2000ms vs 링크복사 1600ms 차이, 티스토리 에디터 속성 실측 결과), `input.css.md`(§2-2 토큰 4개 + `--radius-2xl` 신설 근거).
- 토큰 추가 후 `bun run skin:build` → `make-preview.mjs` 재생성 → §9 실측.
