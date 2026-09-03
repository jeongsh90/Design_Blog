# Header 비주얼 스펙 (PC / 100vw)

- **대상 구역:** 대시보드형 티스토리 스킨의 두 번째 구역 — Header
- **근거 문서:** `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md`
- **이식 원본:** `D:\MyCloud\2026포트폴리오\Design-system\index.html` 291–319행(마크업) + `css\layout.css` 23–60행(레이아웃) + `css\components.css` 796–1075행(Button) · 6412–6464행(Breadcrumb)
- **승계:** `_workspace/sidebar_designer-spec.md` — 색상 형식(**hex**), `--color-*` 매핑 방식, `calc(var(--spacing)*n)` 여백 규칙, 56px 높이(§8-Q3)
- **사용자 요청:** "헤더 우측 끝에 홈,태그,방명록 버튼 sm사이즈로 배치하고 디자인시스템에 적용된 헤더 동일하게"
- **범위:** PC 레이아웃만. 반응형은 §6-4에 원본 규칙만 기록하고 적용하지 않는다.

---

## 1. 이식 구조 — Design-system 원본 그대로

### 1-1. 마크업 (index.html 292–319행 인용)

```html
<header data-slot="header">
  <div data-slot="header-inner">
    <div data-slot="header-start">
      <button … data-sidebar-trigger>…</button>
      <nav data-slot="breadcrumb" aria-label="breadcrumb">
        <ol data-slot="breadcrumb-list">
          <li data-slot="breadcrumb-item">…</li>
          <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true">…</li>
          <li data-slot="breadcrumb-item"><span data-slot="breadcrumb-page" …></span></li>
        </ol>
      </nav>
    </div>
    <div data-slot="header-actions">
      <button data-theme-toggle data-slot="button" data-variant="ghost" data-size="icon" data-header-theme-toggle>…</button>
    </div>
  </div>
</header>
```

`data-slot` 목록: `header` · `header-inner` · `header-start` · `header-actions` · `breadcrumb` · `breadcrumb-list` · `breadcrumb-item` · `breadcrumb-separator` · `breadcrumb-link` · `breadcrumb-page` · `button` — **이름을 하나도 바꾸지 않는다.**

### 1-2. 레이아웃 (layout.css 23–60행 인용, 값 그대로)

| 대상 | 선언 | px |
|---|---|---|
| `header` | `display:flex; flex-shrink:0; align-items:center` | — |
| `header` 높이 | `height: calc(var(--spacing) * 14)` | **56** |
| `header` 경계 | `border-bottom: 1px solid var(--color-border)` | 1 |
| `header` 배경 | `background-color: var(--color-background)` | — |
| `header-inner` | `justify-content: space-between; gap: calc(var(--spacing)*3)` | gap 12 |
| `header-inner` 패딩 | `padding: 0 calc(var(--spacing) * 4)` | 16 |
| `header-inner` 글자 | `font-size: var(--text-sm)` | 14 |
| `header-start` | `gap: calc(var(--spacing)*2); min-width:0; flex:1 1 auto` | gap 8 |
| `header-actions` | `gap: calc(var(--spacing)*1); flex-shrink:0` | gap 4 |
| `[data-header-theme-toggle]` | `display: none`(PC 기본값) | — |

**높이 56px는 `sidebar-header`(`calc(var(--spacing)*14)`)와 정확히 같은 식이다** — sidebar 스펙 §8-Q3 확정 사항이 원본과 자동으로 일치한다(우연이 아니라 같은 디자인 시스템에서 나온 값).

### 1-3. Button 컴포넌트 (components.css 796–1075행)

`data-slot="button"` + `data-variant` + `data-size` 조합. 이번 구역이 실제로 쓰는 것:

| 축 | 값 | 선언 |
|---|---|---|
| 기본 | — | `h: calc(var(--spacing)*9)`(36) · `padding-inline: *4` · `radius-md` · `font: medium/--text-sm/1` · `tracking-sm` · `gap: *2` · `border:1px solid transparent` |
| `data-size="sm"` | **이번 요청** | `h: calc(var(--spacing)*8)`(**32**) · `gap: *1.5`(6) · `padding-inline: *3`(12) → 아이콘이 있으면 `*2.5`(10) |
| `data-variant="ghost"` | | 기본 투명, `:hover` → `--color-accent` / `--color-accent-foreground` (다크는 accent 50% 믹스) |
| `> svg` | | `calc(var(--spacing)*4)` = 16×16 |
| `:focus-visible` | | `border-color: --color-ring` + `box-shadow: 0 0 0 3px color-mix(ring 50%)` |
| `:active` | | `translate: 0 1px` |
| `a[data-slot="button"]` | | `text-decoration: none` |

---

## 2. 이번 요청의 핵심 — `header-actions` 3개 버튼 확정안

| 순서 | 라벨 | 아이콘 (lucide) | 링크 | 마크업 |
|---|---|---|---|---|
| 1 | 홈 | `house` | `[##_blog_link_##]` | `<a data-slot="button" data-variant="ghost" data-size="sm">` |
| 2 | 태그 | `tag` | `[##_taglog_link_##]` | 동일 |
| 3 | 방명록 | `message-square` | `[##_guestbook_link_##]` | 동일 |
| 4 | (테마 전환) | `sun`/`moon` | — | `<button data-slot="button" data-variant="ghost" data-size="icon" data-header-theme-toggle>` |

### 2-1. 아이콘 + 텍스트로 간다 (아이콘 전용 아님) — 사유

1. 사용자가 **"홈,태그,방명록"이라고 이름으로 지목**했다. 라벨을 지우면 요청한 대상이 화면에서 사라진다.
2. **폭이 충분하다.** 실측 계산: `홈` 56 + `태그` 70 + `방명록` 84 + gap 4×2 + 테마토글(PC 숨김) = **218px**. 사이드바 접힘(48px) 상태의 헤더 가용폭이 1280px 뷰포트에서 1232 − 패딩 32 = 1200px이므로, 브레드크럼에 980px가 남는다. 사이드바 펼침(256px)이어도 992px 가용 → 브레드크럼 774px. **접힘/펼침 어느 쪽에서도 압박이 없다.**
3. **아이콘만 3개는 의미가 안 읽힌다.** `tag`와 `message-square`는 블로그 맥락에서 서로 구분되지 않고, 툴팁 프리미티브가 없는 환경(sidebar 스펙 §7-6)에서 헤더에 또 CSS 툴팁을 얹는 건 비용만 늘린다.
4. 사이드바가 접히면 "둘러보기"의 홈/태그/방명록 라벨이 전부 사라진다 — **그때 헤더의 텍스트 버튼이 유일한 문자 내비게이션이 된다.** 접힘 상태와 조화되기는커녕, 접힘 상태에서 오히려 더 필요하다.

### 2-2. 아이콘·링크는 사이드바 "둘러보기"와 **같은 것을 재사용**한다

`skin.html` 사이드바 둘러보기 그룹(111·117·123행)의 인라인 lucide `<svg>` path와 `[##_blog_link_##]` / `[##_taglog_link_##]` / `[##_guestbook_link_##]` 치환자를 **문자 그대로 복사**한다. 같은 목적지를 두 곳에서 다른 아이콘/다른 경로로 가리키는 일이 생기지 않는다.

### 2-3. 배치 순서: 홈 → 태그 → 방명록 → 테마 토글

Design-system의 `header-actions`에는 테마 토글 하나뿐이라 "여러 개일 때의 순서"에 대한 원본 관례가 없다. 판단 근거:

- 사용자가 부른 순서("홈,태그,방명록")를 그대로 보존한다 — 사이드바 둘러보기 순서와도 동일하다.
- 테마 토글은 **내비게이션이 아니라 환경 설정**이다. 성격이 다른 컨트롤을 가장 바깥(우측 끝)에 두는 것이 Design-system이 그 자리에 테마 토글만 둔 의도와 어긋나지 않는다.

### 2-4. 헤더 버튼에는 **활성(현재 위치) 표시를 하지 않는다**

사이드바가 이미 `data-active` + 파랑으로 "지금 어디"를 담당한다(sidebar 스펙 §3-3-b — 그 표시를 살리려고 액센트 색까지 도입했다). 같은 신호를 헤더에서 한 번 더 하면 사이드바의 신호가 약해진다. 헤더 3개 버튼은 **어디서든 같은 모습인 고정 바로가기**로 둔다.

### 2-5. `data-variant="ghost"` 선택

Design-system `header-actions`가 ghost를 쓴다(index.html 313행). 헤더는 콘텐츠의 액자이지 주인공이 아니므로 테두리/채움이 있는 변형(outline/default)은 시선을 뺏는다. hover에서만 `--color-accent` 배경이 들어온다.

---

## 3. `header-start` 구성 — 브레드크럼을 **넣는다**

### 3-1. 결정과 사유

| 판단 | 사유 |
|---|---|
| **넣는다** | (1) 안 넣으면 `header-start`는 28px 트리거 버튼 하나만 남고 좌측이 통째로 빈다 — 56px 바가 이유 없이 비어 보인다. (2) 지금 임시 슬롯 `skin-scaffold-title`이 `[##_page_title_##]`를 보여주고 있는데, 이걸 걷어내면서 대체물이 없으면 **현재 페이지가 무엇인지 화면에서 사라진다.** (3) Design-system 원본 구조에 이미 있는 자리다 — 넣는 쪽이 "동일하게"에 부합한다. |

### 3-2. 무엇을 담을까 — 티스토리 제약이 답을 좁힌다

스킨 최상위 스코프에서 서버가 확실히 채워 주는 값은 **`[##_title_##]`(블로그 제목)** 과 **`[##_page_title_##]`(현재 페이지 제목)** 둘뿐이다. 카테고리명(`[##_article_rep_category_##]`)은 `<s_article_rep>` 안에서만 유효해 헤더에서 쓸 수 없다.

→ **2단 브레드크럼: `[##_title_##]`(홈 링크) / `[##_page_title_##]`(현재 페이지).**

| 페이지 | 표시 |
|---|---|
| 홈 | `다잇누` (뒤 항목이 같은 값이므로 앞 항목 숨김 — §3-3) |
| 카테고리 | `다잇누 / Design` |
| 글 | `다잇누 / 글 제목` |
| 방명록 | `다잇누 / 방명록` |

### 3-3. 중복 크럼 숨김 — Design-system과 **같은 방식**

Design-system은 `#header-breadcrumb-group` + `#header-breadcrumb-sep`를 `style="display:none"`으로 두고 JS(`dashboard.js` 110–117행)가 값이 있을 때만 편다. 같은 패턴을 뒤집어 쓴다 — **두 크럼의 텍스트가 같으면(=홈)** 앞 항목과 구분자를 `display:none`으로 접는다(`header.js`).

- JS가 실패해도 `다잇누 / 다잇누`로 보일 뿐 레이아웃은 멀쩡하다(안전한 열화).
- `[##_body_id_##]`(`tt-body-index` 등)로 CSS만으로 처리하는 대안도 있으나, **그 값이 실제로 무엇인지 아직 미검증**(sidebar 검증 §4-5)이라 채택하지 않는다.

### 3-4. 트리거는 기존 `sidebar-trigger`를 **그대로 옮기기만 한다**

- 현재 `skin-scaffold-header`에 있는 `<button data-slot="sidebar-trigger">`를 `header-start`의 첫 자식으로 이동. 스타일(`sidebar.css` 671–702행)·JS 바인딩(`sidebar.js` 79–97행)은 손대지 않는다.
- **원본과 다른 점 1건:** Design-system은 이 자리에 `data-slot="button" data-size="icon"`(36×36)을 쓰고 `data-sidebar-trigger`를 훅으로 붙였다. 우리는 `data-slot="sidebar-trigger"`(28×28)를 유지한다.
  - 사유: **shadcn 원본 `SidebarTrigger`가 `variant="ghost" size="icon" className="size-7"`(28px)이고 `data-slot="sidebar-trigger"`로 슬롯을 덮어쓴다.** 즉 우리 쪽이 shadcn 1:1 원칙(요구사항 §"똑같이 포팅")에 더 정확하다. Design-system은 그 슬롯을 생략하고 36px로 키운 변형이다.
  - 시각 언어는 동일하다(ghost hover = `--color-accent`, `radius-md`, 아이콘 16px). 56px 헤더 안에서 28 vs 36은 세로 중앙 정렬로 흡수된다.

---

## 4. 색상 매핑 — **새 토큰 0개, 전부 재사용**

`src/input.css`에 이미 선언된 토큰만 쓴다. 이번 구역이 추가하는 색상 변수는 **없다.**

| 사용처 | 참조 변수 | 라이트 | 다크 | 비고 |
|---|---|---|---|---|
| `header` 배경 | `--color-background` | `#ffffff` | `#0a0a0a` | sidebar 스펙 §3-2 |
| `header` 하단선 | `--color-border` | `#e5e5e5` | `#ffffff1a` | 〃 |
| 버튼 글자 | `color: inherit` → `--color-foreground` | `#000000` | `#fafafa` | 〃 |
| ghost hover 배경 | `--color-accent` | `#f5f5f5` | `#404040`(50% 믹스) | 〃 |
| ghost hover 글자 | `--color-accent-foreground` | `#171717` | `#fafafa` | 〃 |
| 포커스 링 | `--color-ring` | `#a1a1a1` | `#737373` | 〃 |
| 브레드크럼 상위 크럼 | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 〃 |
| 브레드크럼 현재 페이지 | `--color-foreground` | `#000000` | `#fafafa` | 〃 |
| 버튼 radius | `--radius-md` | 8px | 8px | 〃 |

**대비 (WCAG 2.1, 실측):**

| 조합 | 비율 | 판정 |
|---|---|---|
| 버튼 글자 `#000000` on `#ffffff` (L) | 21.00 | AAA |
| 버튼 글자 `#fafafa` on `#0a0a0a` (D) | 19.05 | AAA |
| hover `#171717` on `#f5f5f5` (L) | 16.35 | AAA |
| 상위 크럼 `#737373` on `#ffffff` (L) | 4.74 | AA (14px) |
| 상위 크럼 `#a1a1a1` on `#0a0a0a` (D) | 9.16 | AAA |

---

## 5. 치수 / 여백 (전부 `calc(var(--spacing)*n)`)

| 항목 | 값 | px |
|---|---|---|
| `header` 높이 | `calc(var(--spacing) * 14)` | **56** (= `sidebar-header`) |
| `header` 하단선 | `1px solid` | 1 (헤어라인 예외) |
| `header-inner` padding-inline | `calc(var(--spacing) * 4)` | 16 |
| `header-inner` gap | `calc(var(--spacing) * 3)` | 12 |
| `header-start` gap | `calc(var(--spacing) * 2)` | 8 |
| `header-actions` gap | `calc(var(--spacing) * 1)` | 4 |
| `sidebar-trigger` | `calc(var(--spacing) * 7)` | 28×28 (기존) |
| 버튼 `sm` 높이 | `calc(var(--spacing) * 8)` | 32 |
| 버튼 `sm` padding-inline (아이콘 동반) | `calc(var(--spacing) * 2.5)` | 10 |
| 버튼 `sm` gap | `calc(var(--spacing) * 1.5)` | 6 |
| 버튼 아이콘 | `calc(var(--spacing) * 4)` | 16 |
| 브레드크럼 gap | `calc(var(--spacing) * 1.5)` → 640px↑ `* 2.5` | 6 → 10 |
| 브레드크럼 구분자 아이콘 | `calc(var(--spacing) * 3.5)` | 14 |

**타이포(`pretendard-typography` 준수):** 버튼 = Label 14/500 `--tracking-sm`(-0.008em) / 브레드크럼 = Small 14/400 `--tracking-sm`. 대문자 변환·양수 자간 없음.

---

## 6. 원본과 달라지는 부분 (전부 사유 명시)

### 6-1. 셀렉터 조상: `[data-slot="main"]` → `[data-slot="sidebar-inset"]`

Design-system 문서 사이트는 `.app-shell > [data-slot="main"]`이라는 **자체 셸**을 쓴다(layout.css 머리말: "이 문서 사이트 전용 ✗ 외부 프로젝트 사용 금지"). 우리 스킨은 sidebar 구역에서 이미 shadcn 정본인 `[data-slot="sidebar-inset"]`을 그 역할로 확정했다(sidebar 스펙 §4-3(4), `flex:1; min-width:0; flex-direction:column`). shadcn 공식 dashboard 블록도 헤더를 `SidebarInset` 안에 넣는다 → **`sidebar-inset`이 정본이고, layout.css의 선언 내용만 그 아래로 옮긴다.**

### 6-2. `height:100vh` + 내부 스크롤 → **sticky 헤더 + 문서 스크롤**

layout.css 20행은 `[data-slot="main"]`에 `height:100vh`를 주고 본문을 `overflow-y:auto`로 굴린다. 블로그에 그대로 쓰면:
- 티스토리가 주입하는 요소(관리 메뉴바·광고 컨테이너)가 뷰포트 밖으로 밀려 계산이 깨진다.
- 긴 글에서 브라우저 기본 스크롤 복원·앵커 이동이 내부 컨테이너와 어긋난다.

→ `header`에 `position: sticky; top: 0`만 준다. 사이드바는 이미 `position:fixed`라 함께 고정되고, 56px 밑선이 스크롤 중에도 유지된다. **본문 스크롤 모델을 헤더가 강제하지 않는다**(content 구역이 자유롭게 결정).

`z-index: 9` — `sidebar-container`(10)·`sidebar-rail`(20)보다 낮게. 레일의 히트 영역이 헤더에 가려지면 안 된다.

### 6-3. 브레드크럼 줄바꿈 금지 (원본은 `flex-wrap: wrap; word-break: break-word`)

원본의 크럼은 짧은 내비 라벨이라 넘칠 일이 없지만, 우리 `[##_page_title_##]`에는 **글 제목 전체**가 들어온다. 원본 그대로면 56px 헤더가 두 줄로 터진다. → `header` 안에서만 `flex-wrap: nowrap` + 현재 페이지 크럼에 `overflow:hidden; text-overflow:ellipsis; white-space:nowrap`. 브레드크럼 컴포넌트 자체의 기본 선언은 건드리지 않고 `[data-slot="header"]` 스코프 안에서만 덮는다.

### 6-4. 헤더 테마 토글은 **DOM에 두되 PC에서 숨긴다** (원본 그대로)

layout.css 62–64행이 `[data-header-theme-toggle] { display: none }`이고, 66–78행 `@media (max-width: 48rem)`에서만 헤더 토글이 나타나고 사이드바 토글이 숨는다. **PC에서 토글이 두 개 보이지 않게 하려는 원본의 의도**다.

- 이번 구역은 PC만 다루므로 **`display:none` 기본 규칙까지만 이식**하고 미디어쿼리는 넣지 않는다.
- 다만 다음(반응형) 구역이 미디어쿼리 한 블록만 추가하면 되도록, 사이드바 푸터 토글에 원본과 같은 `data-sidebar-theme-toggle` 속성을 붙여 둔다(속성만 추가 — 시각 변화 0).
- 버튼은 `sidebar.js`의 `[data-theme-toggle]` 바인딩을 그대로 받으므로 별도 배선이 없다.

### 6-5. Button 컴포넌트는 **토큰이 있는 변형만** 이식

`src/input.css`에 `--secondary` / `--destructive` / `--sys-*` 토큰이 아직 없다(sidebar 구역이 필요한 것만 선언했다). 없는 변수를 참조하는 CSS는 조용히 무색이 되므로 **`default` / `outline` / `ghost` / `link` 변형과 `xs·sm·default·lg·icon·icon-xs·icon-sm·icon-lg` 크기만** 이식한다. 나머지는 해당 토큰을 도입하는 구역에서 함께 추가한다.

### 6-6. Button·Breadcrumb CSS의 위치 — `header.css` 안

둘 다 헤더 전용이 아닌 공용 프리미티브지만, sidebar 구역이 `sidebar-input`/`sidebar-separator` 포트를 별도 파일로 빼지 않고 `sidebar.css` 안에 둔 선례를 따른다(티스토리 파일 업로드 개수를 늘리지 않는 실익도 있다). `header.css` 안에서 `── 공용 프리미티브 ──` 섹션으로 분리 표기하고, 다른 구역이 본격적으로 쓰기 시작하면 그때 `button.css`로 추출한다.

### 6-7. lucide-react 없음 → 인라인 SVG (sidebar 스펙 §7-7과 동일)

Design-system 원본은 `<i data-lucide="…">` + CDN 스크립트로 아이콘을 만든다. 티스토리 스킨에 외부 JS 의존을 새로 들이지 않기 위해 sidebar와 동일하게 **인라인 `<svg>`**(`stroke="currentColor"`, `stroke-width="2"`, `fill="none"`)로 넣는다. CSS는 `> svg, > i` 양쪽을 다 받도록 원본 선택자를 그대로 유지한다.

---

## 7. 임시 슬롯 정리

| 슬롯 | 처리 |
|---|---|
| `skin-scaffold-header` | **삭제** → 진짜 `<header data-slot="header">`로 교체 |
| `skin-scaffold-title` | **삭제** → `breadcrumb-page`(`[##_page_title_##]`)가 역할 승계 |
| `skin-scaffold-body` | **삭제** → `<div data-slot="content">`로 개명(Design-system index.html 321행과 같은 이름). **스타일은 주지 않는다** — content 구역의 몫이다 |

---

## 8. 확인 필요 (사용자 결정 / 서버 배포 후)

| # | 항목 | 상태 |
|---|---|---|
| Q1 | 헤더 3버튼을 아이콘+텍스트로 확정 (§2-1) | 설계자 판단으로 진행. 아이콘만 원하면 `<span>` 라벨만 지우면 되고 CSS 변경 불필요 |
| Q2 | 브레드크럼 1단 = 블로그 제목 (§3-2) | 카테고리명을 넣고 싶다면 티스토리 제약상 **사이드바 활성 링크에서 역산**하는 JS가 추가로 필요 — 요청 시 확장 |
| Q3 | `[##_page_title_##]`가 각 페이지에서 실제로 무엇으로 치환되는지 | **서버 배포 후 확인 필요.** 홈에서 블로그 제목과 다른 값이면 §3-3 중복 숨김이 동작하지 않고 `다잇누 / 홈`처럼 2단으로 남는다(고장은 아님) |
| Q4 | 헤더 테마 토글 PC 숨김 (§6-4) | 원본 규칙 그대로. PC에서도 보이길 원하면 사이드바 푸터 토글을 빼는 쪽이 맞다(둘 다 보이는 건 원본이 피한 상태) |
