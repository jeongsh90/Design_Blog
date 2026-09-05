# 글 상세(permalink) 본문 프로즈 타이포그래피 비주얼 스펙
### `[data-slot="post-single-body"]` — Content 구역 후속 (PC / 100vw)

- **대상:** `dashboard-skin/components/content.css` 389~415행의 `post-single*` 최소 스타일 중 **`post-single-body` 안쪽 전용**
- **선행 스펙:** `_workspace/content_designer-spec.md` §9("단일 글 모드 — 최소 대응만")가 명시적으로 **다음 구역으로 미뤄 둔 부분**이다. 그 문서를 덮어쓰지 않고 이 파일이 이어붙인다.
- **근거 문서:** `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md` 3번 "Content(목록/본문)" — 진행중 항목
- **범위(정확히 이것만):** 본문 프로즈 타이포그래피 + `make-preview.mjs`의 permalink 목업 리치 콘텐츠 주입
- **범위 밖(손대지 않음):** TOC / 댓글 / 반응형 / `post-single` · `post-single-title` · `post-single-meta`(완성 상태 유지) / 목록(index) 화면 전체

> **치환자 재확인 불필요.** `[##_article_rep_desc_##]`는 오케스트레이터가 착수 전 Tistory 공식 문서(`contents/post.html`)로 재확인한 **정답**이다. 이 스펙은 치환자를 바꾸는 어떤 안도 검토하지 않는다.

---

## 0. 실측 출처 — 이번 세션은 Design-system 조회에 **성공**했다

`content_designer-spec.md` §0-1은 "`D:\MyCloud` 경로가 존재하지 않는다"며 Design-system 재실측을 포기했었다. **이번 세션에서는 정상 접근된다.** 그래서 이 스펙은 추정 없이 전부 실파일에서 읽었다.

### 0-1. Design-system — shadcn Typography 정본이 이미 바닐라 CSS로 포팅돼 있다 ★

`D:\MyCloud\2026포트폴리오\Design-system\css\typography.css` **289~494행**에 `[data-slot="typography-*"]` 세트가 통째로 있다. 이것은 shadcn/ui 공식 문서의 Typography 페이지(h1~h4 / p / blockquote / list / table / inline-code / lead / large / small / muted)를 그대로 옮긴 것이다.

**→ 이번 구역은 새로 디자인하지 않는다. 이 포트를 근거로 삼고, 마크업에 `data-slot`을 붙일 수 없는 환경 차이만큼만 셀렉터를 바꾼다.** (sidebar 구역이 `components.css`의 기존 Sidebar 포트를 이식 기반으로 삼았던 것과 동일한 판단.)

| 항목 | Design-system 실측 (typography.css) |
|---|---|
| h1 | 294~305행 · `--text-4xl` / `--leading-tight` / 800 / `--tracking-tight` / `text-wrap: balance` / `scroll-margin-top: calc(--spacing*20)` |
| h2 | 325~339행 · `--text-3xl` / `--leading-snug` / 600 / `--tracking-tight` · 컨텍스트 안 `margin-top: calc(--spacing*10)` = 40px |
| h3 | 341~354행 · `--text-2xl` / `--leading-snug` / 600 · `margin-top: calc(--spacing*8)` = 32px |
| h4 | 356~365행 · `--text-xl` / `--leading-snug` / 600 |
| p | 367~384행 · `--text-base` / `--leading-normal-lg`(1.75rem) / 400 · 문단 간 `margin-top: calc(--spacing*2)` = 8px |
| a | 386~391행 · 500 / `--color-primary` / `underline` / `text-underline-offset: calc(--spacing*1)` = 4px |
| blockquote | 393~404행 · `margin-top: calc(--spacing*6)` / `padding-left: calc(--spacing*6)` / `border-left: 2px solid var(--color-border)` / **italic** |
| ul | 406~421행 · `margin: calc(--spacing*6) 0` / `padding-left: calc(--spacing*6)` / `list-style-type: disc` / `li + li { margin-top: calc(--spacing*2) }` |
| table | 423~451행 · **래퍼 `div[data-slot="typography-table-wrap"]`(`overflow-y:auto`)** + `border-collapse: collapse` / th·td `padding: calc(--spacing*2) calc(--spacing*4)` + `1px solid var(--color-border)` / th 700 / **`tbody tr:nth-child(even)` = `--color-muted` (zebra)** |
| inline code | 453~465행 · `padding: calc(--spacing*0.8) calc(--spacing*1.2)` / `border-radius: var(--radius-md)` / `background: var(--color-muted)` / `--font-mono` / `--text-sm` / 600 |

### 0-2. 코드 전용 폰트 — **이미 있다. 새로 만들 필요 없다**

세 곳을 교차 실측했다.

| 출처 | 값 | 판정 |
|---|---|---|
| Design-system `reset.css` **169행** | `--font-mono: 'Pretendard', ui-sans-serif, system-ui, sans-serif` | ⚠ **가변폭 서체 별칭** — 이름만 mono다. 코드에 쓰면 안 된다 |
| Design-system `extra.css` **787 / 804행** (`[data-slot="editor-code-block"]`) | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` **리터럴** | ✅ Design-system 자신도 실제 코드 블록에서는 위 별칭을 **쓰지 않고** 이 리터럴 스택을 쓴다 |
| 이 프로젝트 `dashboard-skin/tailwind.css` **2행**(빌드 산출물, Tailwind v4 기본 테마) | `--font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace` | ✅ 이미 `:root`에 존재. Design-system 리터럴의 **상위 집합**(레거시 폴백 2개만 더 붙음) |

**결론:** 새 토큰을 만들지 않는다. `var(--font-mono)`를 그대로 쓰되, **`src/input.css`의 `@theme static`에 명시 선언한다**(§3-1). 이유: 지금 `tailwind.css`에 들어 있는 건 Tailwind 기본 테마의 tree-shaking 결과라 **재빌드 조건이 바뀌면 조용히 사라질 수 있고**, 그러면 `font-family: var(--font-mono)`가 무효가 되어 코드가 Pretendard로 렌더된다(눈에 잘 안 띄는 종류의 회귀). 값은 Design-system 리터럴을 채택한다(출처가 명확한 쪽).

또한 `pretendard-typography` 스킬 §"예외: 코드/텍스트 에디터 영역"이 **"코드는 모노스페이스를 쓰고 이 스킬의 `--font-sans`/`--text-*`를 적용하지 않는다 — 규칙 위반이 아니라 의도된 예외"**라고 명시하고 있다. 코드 블록에 한글 자간(`--tracking-base`)을 상속시키지 않는 §4-6의 처리는 이 조항의 직접 이행이다.

### 0-3. ★ 자간 — `content_designer-spec.md` **Q10이 이번에 해소됐다**

선행 스펙 §11-2는 "24px 이상용 자간 토큰을 지어낼 수 없으니 `--tracking-base`로 버틴다"고 적고 Q10으로 남겼다. **globals.css 413~420행 실측 결과 한글 전용 자간 스케일은 실제로 확장돼 있다:**

```
--tracking-xs:-0.006em;  --tracking-sm:-0.008em;  --tracking-base:-0.01em;
--tracking-lg:-0.01em;   --tracking-xl:-0.012em;  --tracking-2xl:-0.015em;
--tracking-3xl:-0.018em; --tracking-4xl:-0.02em;
```

그리고 이 값들은 `pretendard-typography` 스킬의 스케일 표와 **정확히 일치한다**(H4 20px = −0.012em → `--tracking-xl`, Lead 18px = −0.01em → `--tracking-lg`, H3 24px = −0.015em → `--tracking-2xl`). 즉 Design-system의 `--tracking-{size}`는 `--text-{size}`와 **짝을 이루도록 설계된 한글 스케일**이다. 이번 구역은 이 짝 규칙을 그대로 따른다.

> 라틴 기준값인 `--tracking-tight`(−0.025em)는 여전히 쓰지 않는다 — Design-system typography.css의 헤딩들이 이걸 쓰고 있지만, 그건 shadcn 원문을 그대로 옮긴 자리이고 같은 파일 안에 한글 스케일이 별도로 존재한다는 사실이 "헤딩에도 한글 스케일이 있다"는 증거다.

### 0-4. ⚠ Tailwind Preflight가 **모든 것을 이미 지워 놨다** — 이 구역의 최대 함정

`dashboard-skin/tailwind.css`(빌드 산출물) 2행 실측:

```css
@layer base{ *,:after,:before,::backdrop{ box-sizing:border-box; border:0 solid; margin:0; padding:0 }
             h1,h2,h3,h4,h5,h6{ font-size:inherit; font-weight:inherit }
             ol,ul,menu{ list-style:none }
             img,svg,video,canvas,audio,iframe,embed,object{ vertical-align:middle; display:block }
             img,video{ max-width:100%; height:auto } … }
```

**따라서 티스토리 에디터가 내려준 본문 HTML은 지금 이 스킨에서 다음 상태다:**

| 요소 | 현재 실제 렌더 | 필요 조치 |
|---|---|---|
| `<h2>`~`<h6>` | **본문과 완전히 똑같은 14px/400** (font-size·weight가 inherit로 리셋됨) | 크기·굵기를 전부 다시 세운다 |
| `<ul>`/`<ol>` | **불릿·번호가 아예 안 보임** (`list-style:none`) + 들여쓰기 0 | `list-style-type` + `padding-left` 복원 |
| 모든 블록 | **문단 사이 여백 0** (`margin:0`) — 글이 한 덩어리로 붙어 보임 | 수직 리듬 전면 재구축 |
| `<blockquote>`/`<pre>`/`<table>` | 테두리 없음(`border:0 solid`), 여백 없음, 배경 없음 | 전부 명시 |
| `<img>` | `display:block; max-width:100%; height:auto`는 **이미 preflight가 해줬다** | 현행 `post-single-body img` 규칙 2줄은 **중복**(무해하나 정리 가능) |
| `<a>` | `color:inherit; text-decoration:inherit` — **링크가 본문과 구분되지 않음** | 색 + 밑줄 명시 |

→ 사용자가 "상세페이지 내용 볼 수 있게"라고 말한 체감 증상(스타일 없는 텍스트 덩어리)의 **직접 원인이 이것**이다. 치환자 문제가 아니다.

---

## 1. 왜 자손 태그 셀렉터인가 (구조 결정)

`[##_article_rep_desc_##]`는 **사용자가 티스토리 에디터로 쓴 원본 HTML이 통째로** 삽입되는 자리다. 그 안의 `<p>`/`<h2>`에 우리가 `data-slot`을 붙일 방법이 **서버·클라이언트 어느 쪽에도 없다**(서버는 순수 HTML만 내려주고, JS로 붙이면 FOUC가 생긴다).

**결정: `[data-slot="post-single-body"] <태그>` 자손 셀렉터로만 스타일링한다.**

- `skin.html`은 **한 글자도 바꾸지 않는다.** 현재 마크업(305~311행)이 그대로 정답이다.
- 새 `data-slot` 값은 **딱 하나** 생긴다 — `prose-table-wrap`(§4-9, JS가 주입하는 표 래퍼). 이건 Design-system의 `[data-slot="typography-table-wrap"]`을 이름만 이 구역 관례로 바꿔 이식한 것이다.
- **자식 결합자(`>`)를 쓰지 않고 자손 결합자만 쓴다** — 티스토리가 본문을 한 겹 더 감싸 내려줄 가능성이 있어(§7-Q8) 직계 자식 가정은 위험하다. 수직 리듬도 `:is()` 자손 셀렉터로 짠다(§4-2).

**파일 위치 결정:** 새 `prose.css`를 만들지 않고 **`components/content.css` 끝(415행 뒤)에 `§10 프로즈` 섹션으로 이어붙인다.** 근거 — ① `post-single-body`는 content 구역 소유다, ② 이 프로젝트의 추출 규칙은 "**두 번째 구역이 쓰기 시작하면** 프리미티브로 뽑는다"(tooltip/scrollbar 선례)이고 지금 사용처는 한 곳뿐이다, ③ 파일이 늘면 `skin.html`의 `<link>`·`make-preview.mjs`의 경로 치환 목록·`README.md` 업로드 목록이 함께 늘어 회귀 면적이 커진다. → 나중에 댓글 구역이 같은 프로즈 규칙을 요구하면 그때 `prose.css`로 추출한다(§7-Q9).

---

## 2. 타이포 스케일 — h1~h6 배정

### 2-1. 배정표 (기존 토큰만 사용, 신규 크기 토큰 0개)

`post-single-title`(글 제목 h1)이 **`--text-2xl` 24px / 600 / `--leading-snug`로 이미 확정·구현**돼 있고 이번 범위에서 손대지 않는다. 본문 헤딩은 반드시 그 아래에 위계가 잡혀야 하므로 24px 미만에서 시작한다.

| 요소 | font-size | line-height | weight | letter-spacing | = px | 근거 |
|---|---|---|---|---|---|---|
| (h1 = `post-single-title`, 범위 밖) | `--text-2xl` | `--leading-snug` | 600 | `--tracking-base` | 24 / 1.375 | 현행 유지 |
| **본문 `h1`·`h2`** | `--text-xl` | `--leading-snug` | 600 | **`--tracking-xl`** | 20 / 1.375 | 스킬 H4행(20px·1.4·−0.012em)과 일치. `--text-{size}`↔`--tracking-{size}` 짝 규칙(§0-3) |
| **`h3`** | `--text-lg` | `--leading-snug` | 600 | **`--tracking-lg`** | 18 / 1.375 | 스킬 Lead행(18px·−0.01em) |
| **`h4`** | `--text-base` | `--leading-snug` | 600 | `--tracking-base` | 16 / 1.375 | 본문과 같은 크기, 굵기로만 구분 |
| **`h5`** | `--text-sm` | `--leading-normal` | 600 | `--tracking-sm` | 14 / 1.5 | 스킬 원칙②("작을수록 행간을 상대적으로 넉넉하게") |
| **`h6`** | `--text-sm` | `--leading-normal` | 600 | `--tracking-sm` | 14 / 1.5 | h5와 크기가 같고 **색으로만** 구분 → `--color-muted-foreground` |

**본문 `h1`을 h2와 동일 처리하는 이유:** 글 제목이 이미 `<h1>`이라 본문 안의 `<h1>`은 문서 개요상 오류지만, 필자가 실수로 넣을 수 있다. preflight 때문에 그냥 두면 **본문 크기 그대로** 렌더돼 제목으로 보이지 않는다 — 방어적으로 h2와 같은 규칙에 넣는다(위계를 h1 위로 올리지는 않는다).

**굵기를 전부 600으로 통일한 이유:** `pretendard-typography`는 제목에 700(Bold)을 허용하지만, 이 프로젝트는 셸 전체가 400/500/600만 쓰고 `content_designer-spec.md` §11-1이 **"700(`--font-weight-bold`)은 추가하지 않는다"**를 명시적으로 확정했다. `--font-weight-bold` 토큰 자체가 `input.css`에 없다. → **Design-system typography.css가 h2에 600, table th에 700을 쓰는 것 중 700만 600으로 낮춰 이식한다**(의도적 편차, §6-1).

**h2가 20px인 것이 좁게 느껴질 수 있다** → 대안(글 제목을 30px로 올리고 h2를 24px로)은 `post-single-title` 수정이 필요해 이번 범위 밖이다. §7-Q5에 제안만 남긴다.

### 2-2. 본문 기본값 — 현행 유지 + 3가지 보강

현행(content.css 406~411행)의 `--text-base` / `--leading-relaxed` / `--tracking-base` / `word-break: keep-all`는 **그대로 유지한다.**

| 판단 | 결론 | 근거 |
|---|---|---|
| `--leading-relaxed`(1.625) 유지? | **유지** | 스킬 표의 Body는 1.5지만 그건 "UI 본문"이다. 장문 읽기 본문은 한 단계 넉넉해야 한다. 실제로 Design-system typography-p는 `--leading-normal-lg`(1.75rem = 16px 기준 **1.75**)로 우리보다 더 넉넉하다 — 1.625는 그 사이의 보수적 값이고 이미 선행 스펙 §11-1에서 확정·구현된 값이다(§7-Q10에 대안 기록) |
| `--tracking-base`(−0.01em) 유지? | **유지** | 스킬 Body행(−0.01em)과 정확히 일치 |
| `word-break: keep-all` 유지? | **유지** | 스킬 "한글 본문·리드 문구에 적용" 규칙. **단 `pre`/`code`에서는 반드시 해제**(§4-6) |
| 보강 ① `color` | `--color-foreground` **명시** | 지금은 `body`에서 상속되는데, 티스토리 본문이 자체 `color`를 갖는 조상 아래 놓일 여지를 없앤다 |
| 보강 ② `font-family` | `--font-sans` **명시** | 같은 이유 |
| 보강 ③ `overflow-wrap: break-word` | **추가** | `keep-all`은 어절을 안 끊으므로 **공백 없는 긴 URL 한 줄이 본문 폭을 밀어** 가로 오버플로를 만든다. 이 한 줄이 그걸 막는다(한글 어절 줄바꿈에는 영향 없음 — 넘칠 때만 발동) |

---

## 3. 색상 매핑

### 3-1. `src/input.css` `@theme static`에 추가할 전역 토큰 — 4개

| 토큰 | 값 | 실측 출처 | 용도 |
|---|---|---|---|
| `--tracking-lg` | `-0.01em` | Design-system `globals.css` **416행** | h3 |
| `--tracking-xl` | `-0.012em` | 같은 파일 **417행** | h1·h2 |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` | Design-system `extra.css` **787·804행**(리터럴) | 인라인/블록 코드. §0-2 참조 — Tailwind 기본값에도 있지만 **명시 선언으로 고정**한다 |
| `--link` + `--color-link` | 라이트 `#1447e6` / 다크 `#8ec5ff` | **이 프로젝트 `input.css` 자신** — 32행 `--sidebar-primary`(라이트), 63행 `--sidebar-accent-foreground`(다크) | 본문 링크 |

**왜 `--link`라는 새 색 토큰이 필요한가 (기존 토큰으로 안 되는 이유 — 필수 기록):**

1. `--color-primary`를 그대로 쓰는 것(= Design-system typography-link 원문)은 **다크에서 실패한다.** 우리 팔레트의 다크 `--primary`는 `#e5e5e5`이고 `--foreground`는 `#fafafa`다 → **링크가 주변 본문보다 오히려 어두워진다.** 링크는 본문보다 두드러져야 하므로 이 값은 쓸 수 없다.
2. `--sidebar-primary` / `--sidebar-accent-foreground`를 직접 참조하는 것은 **이 프로젝트가 명시적으로 금지한 관례**다 — right-widgets 구역이 "`--color-sidebar-*`를 밖으로 유출하지 않는다"를 확정했고(2026-09-03 a항) 그 뒤로 지켜져 왔다.
3. 따라서 새 이름이 필요하다. **다만 값은 새로 만들지 않는다** — 위 두 값은 이 스킨이 이미 "액센트 파랑(라이트)" / "다크에서의 파랑 텍스트"로 확정해 쓰고 있는 실측값을 **그대로 재사용**한 것이다. 색을 발명한 게 아니다.
4. 이름을 `--prose-link`가 아니라 `--link`로 두는 이유: 댓글 구역도 곧 링크를 쓴다(작성자 홈페이지, 답글 등). 구역 스코프 변수(`--widget-title-color` / `--content-item-title-color` 선례)로 두면 그때 정의를 복사하게 된다.

```css
/* :root 에 */   --link: #1447e6;
/* .dark 에 */   --link: #8ec5ff;
/* @theme static 에 */   --color-link: var(--link);
```

### 3-2. 이 구역이 쓰는 색 — 전량 매핑표

| 대상 | 속성 | 토큰 | 라이트 유효값 | 다크 유효값 | 출처/근거 |
|---|---|---|---|---|---|
| 본문 텍스트 | `color` | `--color-foreground` | `#000000` | `#fafafa` | 기존 |
| h1~h5 | `color` | `--color-foreground` | `#000000` | `#fafafa` | DS typography 그대로 |
| **h6** | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | h5와 크기가 같아 **색이 유일한 위계 축** |
| **링크** | `color` | **`--color-link`** | `#1447e6` | `#8ec5ff` | §3-1. 대비 6.78:1(L) / 11.95:1(D) — 둘 다 AA↑ |
| 링크 밑줄(기본) | `text-decoration-color` | `color-mix(in oklab, var(--color-link) 40%, transparent)` | — | — | 기본은 옅게, hover에서 또렷하게 |
| 링크 밑줄(hover) | `text-decoration-color` | `currentColor` | — | — | |
| 링크 포커스 링 | `outline` | `--color-ring` | `#a1a1a1` | `#737373` | 셸 공통 |
| **인라인 코드 배경** | `background-color` | `--color-muted` | `#f5f5f5` | `#262626` | DS typography-inline-code(458행) 그대로 |
| **코드 블록 배경** | `background-color` | `--color-muted` | `#f5f5f5` | `#262626` | 인라인 코드와 **같은 표면**으로 통일(§7-Q2에 대안) |
| 코드 블록 테두리 | `border-color` | `--color-border` | `#e5e5e5` | `#ffffff1a` | 라이트에서 `#f5f5f5`가 `#ffffff` 위에 뜨도록 |
| 코드 텍스트 | `color` | `--color-foreground` | `#000000` | `#fafafa` | 구문 강조 없음(§7-Q3) |
| **인용 좌측선** | `border-left-color` | **`--content-divider`** | ≈`#d6d6d6` | ≈`#313131` | ★ `[data-slot="content-inner"]`에 **이미 선언돼 상속되는** 변수(content.css 16행). "콘텐츠 경계선은 장식 격자선보다 진해야 한다"는 그 변수의 원래 취지와 정확히 같은 용도 |
| **`hr`** | `border-top-color` | `--content-divider` | ≈`#d6d6d6` | ≈`#313131` | 위와 동일 |
| 표 테두리 | `border-color` | `--color-border` | `#e5e5e5` | `#ffffff1a` | DS typography-table(441행) 그대로. 선이 격자처럼 촘촘하므로 인용선보다 옅어야 한다 |
| 표 zebra(짝수 행) | `background-color` | `--color-muted` | `#f5f5f5` | `#262626` | DS(449~451행) 그대로 |
| figcaption | `color` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 보조 정보 축 |
| 목록 마커 | `::marker { color }` | `--color-muted-foreground` | `#737373` | `#a1a1a1` | 마커가 본문 텍스트만큼 진하면 시선을 뺏는다 |

**새 raw 색 토큰은 `--link` 하나뿐이며, 그 값도 기존 팔레트 재사용이다.** `--secondary` / `--destructive` / `--popover` / `--sys-*`는 이 구역에도 필요 없다.

### 3-3. 대비 검증 (WCAG 2.1)

| 조합 | 비율 | 판정 |
|---|---|---|
| 링크 `#1447e6` on `#ffffff` | **6.78 : 1** | AA ✅ (AAA는 대형 텍스트에 한해) |
| 링크 `#8ec5ff` on `#0a0a0a` | **11.95 : 1** | AAA ✅ |
| h6 / figcaption `#737373` on `#ffffff` | 4.54 : 1 | AA ✅ (선행 스펙 §10-5 실측표 재인용) |
| h6 / figcaption `#a1a1a1` on `#0a0a0a` | 8.05 : 1 | AAA ✅ |
| 코드 `#000000` on `#f5f5f5` | ≈ 19.6 : 1 | AAA ✅ |
| 코드 `#fafafa` on `#262626` | ≈ 13.1 : 1 | AAA ✅ |
| zebra 행 위 본문 | 위와 동일 | AAA ✅ |
| 인용선 / hr / 표 테두리 | — | **대상 아님** — 순수 장식(WCAG 1.4.11은 UI 컴포넌트·의미 있는 그래픽만) |

---

## 4. 확정 CSS — `components/content.css` 415행 뒤에 이어붙인다

> 여백은 **전부 `calc(var(--spacing) * n)`**. 리터럴 px/rem은 한 곳도 없다.

### 4-1. 컨테이너(기존 406~415행 교체)

```css
/* ══════════════════════════════════════════════════════════════
   §10. 단일 글 본문 프로즈 (permalink)
   ──────────────────────────────────────────────────────────────
   [##_article_rep_desc_##]는 티스토리 에디터가 만든 임의 HTML이
   통째로 들어오는 자리다. 우리가 그 안쪽 태그에 data-slot을 붙일
   방법이 없으므로 **자손 태그 셀렉터**로만 스타일링한다.
   자식 결합자(>)는 쓰지 않는다 — 티스토리가 본문을 한 겹 더 감싸
   내려줄 수 있어(확인 필요 Q8) 직계 자식 가정은 위험하다.

   ★ Tailwind Preflight가 margin/padding/list-style/헤딩 크기·굵기를
     전부 리셋해 둔 상태다. 아래 규칙은 "장식"이 아니라 "복원"이다.
   ══════════════════════════════════════════════════════════════ */

[data-slot="post-single-body"] {
  color: var(--color-foreground);
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-relaxed);
  letter-spacing: var(--tracking-base);
  word-break: keep-all;
  /* keep-all은 어절을 끊지 않으므로, 공백 없는 긴 URL 한 줄이 본문 폭을
     밀어낼 수 있다. 넘칠 때만 발동하는 안전장치. */
  overflow-wrap: break-word;
}
```

### 4-2. 수직 리듬 (여백)

```css
/* 모든 블록의 아래 여백은 0으로 두고 위 여백만 준다 —
   인접 형제 마진 상쇄를 계산에서 아예 제거하기 위해서다. */
[data-slot="post-single-body"] :is(h1,h2,h3,h4,h5,h6,p,ul,ol,dl,blockquote,pre,figure,table,hr,img,iframe,video) {
  margin-bottom: 0;
}

[data-slot="post-single-body"] :is(p,ul,ol,dl)                        { margin-top: calc(var(--spacing) * 4);  } /* 16px */
[data-slot="post-single-body"] :is(blockquote,pre,figure,img,iframe,video),
[data-slot="post-single-body"] [data-slot="prose-table-wrap"],
[data-slot="post-single-body"] table                                   { margin-top: calc(var(--spacing) * 6);  } /* 24px */
[data-slot="post-single-body"] :is(h5,h6)                              { margin-top: calc(var(--spacing) * 6);  } /* 24px */
[data-slot="post-single-body"] h4                                      { margin-top: calc(var(--spacing) * 8);  } /* 32px */
[data-slot="post-single-body"] h3                                      { margin-top: calc(var(--spacing) * 10); } /* 40px */
[data-slot="post-single-body"] :is(h1,h2)                              { margin-top: calc(var(--spacing) * 12); } /* 48px */
[data-slot="post-single-body"] hr,
[data-slot="post-single-body"] hr + *                                  { margin-top: calc(var(--spacing) * 10); } /* 40px, 위아래 대칭 */

/* 제목 바로 다음 요소는 제목에 붙어야 한 덩어리로 읽힌다 */
[data-slot="post-single-body"] :is(h1,h2,h3,h4,h5,h6) + * { margin-top: calc(var(--spacing) * 3); } /* 12px */

/* 첫 요소는 위 여백 없음. 두 번째 줄은 티스토리가 본문을 한 겹 감쌌을
   경우(Q8)를 대비한 방어 — 감싸지 않았다면 아무 것도 매치하지 않는다. */
[data-slot="post-single-body"] > :first-child,
[data-slot="post-single-body"] > :first-child > :first-child,
[data-slot="post-single-body"] :is(li,blockquote,figure,td,th) > :first-child { margin-top: 0; }
```

**Design-system 대비 편차(의도적):** DS는 `p+p` 8px / h2 40px / h3 32px다. 이 스펙은 **16 / 48 / 40px**로 한 단계씩 키웠다. 근거 — DS의 값은 **컴포넌트 스펙 데모 페이지**(문단이 한두 줄짜리 샘플)용이고, 실제 장문 한글 본문의 실질 기준은 UA 기본 `<p>` 여백 `1em`(=16px)이다. 문단 간격을 키운 만큼 제목 간격도 비례해 키우지 않으면 위계가 무너진다.

### 4-3. 헤딩

```css
[data-slot="post-single-body"] :is(h1,h2,h3,h4,h5,h6) {
  font-family: var(--font-sans);
  font-weight: var(--font-weight-semibold);   /* 전 단계 600 통일 — 700 토큰은 이 프로젝트에 없다 */
  color: var(--color-foreground);
  word-break: keep-all;
  /* 앵커 이동(#id) 시 제목이 상단 페이드에 가려지지 않게.
     content-inner의 scroll-fade-y 마스크가 상단 최대 40px이므로 48px. */
  scroll-margin-top: calc(var(--spacing) * 12);
}

[data-slot="post-single-body"] :is(h1,h2) { font-size: var(--text-xl);   line-height: var(--leading-snug);   letter-spacing: var(--tracking-xl);   }
[data-slot="post-single-body"] h3         { font-size: var(--text-lg);   line-height: var(--leading-snug);   letter-spacing: var(--tracking-lg);   }
[data-slot="post-single-body"] h4         { font-size: var(--text-base); line-height: var(--leading-snug);   letter-spacing: var(--tracking-base); }
[data-slot="post-single-body"] :is(h5,h6) { font-size: var(--text-sm);   line-height: var(--leading-normal); letter-spacing: var(--tracking-sm);   }
[data-slot="post-single-body"] h6         { color: var(--color-muted-foreground); }
```

### 4-4. 문단 / 강조

```css
[data-slot="post-single-body"] p { font-size: inherit; line-height: inherit; letter-spacing: inherit; }

[data-slot="post-single-body"] :is(strong,b) {
  font-weight: var(--font-weight-semibold);   /* 600 — 700 토큰 없음 */
  color: var(--color-foreground);
}

/* em은 이탤릭을 유지한다. 필자가 명시한 인라인 강조는 이것 말고 표현
   채널이 없기 때문. 반면 blockquote는 좌측선·들여쓰기라는 별도 채널이
   있으므로 이탤릭을 쓰지 않는다(§4-7). Pretendard에는 이탤릭 자족이
   없어 브라우저 합성 기울임이 적용된다는 점은 양쪽 모두 동일하다. */
[data-slot="post-single-body"] :is(em,i) { font-style: italic; }
```

### 4-5. 링크

```css
[data-slot="post-single-body"] a {
  color: var(--color-link);
  font-weight: var(--font-weight-medium);                    /* DS typography-link(387행) 그대로 */
  text-decoration-line: underline;
  text-decoration-thickness: 1px;
  text-decoration-color: color-mix(in oklab, var(--color-link) 40%, transparent);
  text-underline-offset: calc(var(--spacing) * 1);           /* 4px — DS 390행 그대로 */
  transition-property: color, text-decoration-color;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}
[data-slot="post-single-body"] a:hover { text-decoration-color: currentColor; }
[data-slot="post-single-body"] a:focus-visible {
  outline: calc(var(--spacing) * 0.5) solid var(--color-ring);
  outline-offset: calc(var(--spacing) * 0.5);
  border-radius: var(--radius-sm);
}
/* 제목 안의 링크는 제목 크기·굵기를 유지한다 */
[data-slot="post-single-body"] :is(h1,h2,h3,h4,h5,h6) a { font-weight: inherit; }
```

### 4-6. 코드 — 인라인 / 블록

```css
/* ── 인라인 코드 (pre 바깥의 code) ── */
[data-slot="post-single-body"] :not(pre) > code {
  display: inline;
  padding: calc(var(--spacing) * 0.8) calc(var(--spacing) * 1.2);   /* DS 456행 그대로 */
  border-radius: var(--radius-md);
  background-color: var(--color-muted);
  color: var(--color-foreground);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-semibold);                          /* DS 462행 = shadcn 원문 */
  line-height: var(--leading-normal);
  /* ★ 한글 자간(-0.01em)이 상속되면 모노스페이스의 등폭이 깨진다.
     0 자간은 토큰이 아니라 CSS 키워드로 쓴다 — --tracking-normal 같은
     새 토큰을 추가할 이유가 없다. */
  letter-spacing: normal;
  word-break: normal;          /* keep-all 해제 */
  overflow-wrap: anywhere;     /* 긴 식별자가 본문 폭을 밀지 않게 */
}

/* ── 블록 코드 ── */
[data-slot="post-single-body"] pre {
  max-width: 100%;
  padding: calc(var(--spacing) * 4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background-color: var(--color-muted);
  color: var(--color-foreground);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-relaxed);
  letter-spacing: normal;      /* ★ 인라인과 같은 이유 */
  /* ★ 코드에는 한글 줄바꿈 규칙을 적용하지 않는다.
     white-space:pre로 아예 줄바꿈하지 않고 가로 스크롤한다. */
  white-space: pre;
  word-break: normal;
  overflow-wrap: normal;
  tab-size: 2;                 /* DS extra.css 796행 그대로 */
  overflow-x: auto;            /* 긴 줄이 본문 폭을 밀지 않게 — 필수 */
  overflow-y: hidden;          /* 가로 스크롤바 때문에 세로가 딸려 나오는 것 방지 */
  -webkit-overflow-scrolling: touch;
}

/* pre 안의 code는 인라인 코드 장식을 전부 벗는다 */
[data-slot="post-single-body"] pre code {
  display: block;
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font: inherit;
  color: inherit;
  letter-spacing: inherit;
  white-space: inherit;
  word-break: inherit;
}
```

### 4-7. 인용

```css
[data-slot="post-single-body"] blockquote {
  padding-left: calc(var(--spacing) * 6);                                  /* 24px — DS 395행 */
  border-left: calc(var(--spacing) * 0.5) solid var(--content-divider);    /* 2px */
  color: var(--color-foreground);
  /* ★ DS(401행)의 font-style: italic을 의도적으로 제거한다 —
     Pretendard에는 이탤릭 자족이 없어 브라우저가 기울임을 합성하는데,
     한글 자소는 합성 기울임에서 획이 뭉개져 문단 단위로는 가독성이
     크게 떨어진다. 인용은 좌측선+들여쓰기라는 별도 채널이 이미 있다.
     반면 인라인 <em>은 다른 채널이 없어 이탤릭을 유지한다(§4-4). */
}
```

`--content-divider`는 `[data-slot="content-inner"]`(content.css 16행)에 선언돼 있고 `post-single-body`는 그 자손이므로 **상속으로 그대로 쓸 수 있다.** 새 변수를 만들지 않는다.

### 4-8. 목록

```css
[data-slot="post-single-body"] :is(ul,ol) {
  padding-left: calc(var(--spacing) * 6);   /* 24px — DS 408행 그대로 */
  list-style-position: outside;
}
[data-slot="post-single-body"] ul       { list-style-type: disc; }         /* preflight의 list-style:none 복원 */
[data-slot="post-single-body"] ol       { list-style-type: decimal; }
[data-slot="post-single-body"] ul ul    { list-style-type: circle; }       /* 명시 지정 때문에 브라우저 기본 중첩 규칙이 안 먹으므로 직접 준다 */
[data-slot="post-single-body"] ul ul ul { list-style-type: square; }
[data-slot="post-single-body"] ol ol    { list-style-type: lower-alpha; }
[data-slot="post-single-body"] ol ol ol { list-style-type: lower-roman; }

[data-slot="post-single-body"] li            { margin-top: 0; }
[data-slot="post-single-body"] li + li       { margin-top: calc(var(--spacing) * 1); }   /* 8px — DS 413행 */
[data-slot="post-single-body"] li > :is(ul,ol) { margin-top: calc(var(--spacing) * 2); } /* 중첩 목록은 부모 항목에 붙는다(16px→8px) */
[data-slot="post-single-body"] li::marker    { color: var(--color-muted-foreground); }
```

### 4-9. 표 — 가로 스크롤 처리 (★ 이 구역 유일한 JS)

**판단:** CSS만으로는 요소를 감쌀 수 없다. 두 방법을 비교했다.

| 방법 | 결과 | 판정 |
|---|---|---|
| A. `table { display: block; overflow-x: auto }` | 스크롤은 되지만 `<table>`이 블록 상자가 되면서 내부에 익명 테이블 상자가 생겨 **`width:100%`가 무력화**된다 — 좁은 표가 본문 폭을 채우지 않고 내용 폭으로 쪼그라든다 | 폴백으로만 |
| **B. JS로 래퍼 div 주입** | Design-system이 실제로 쓰는 구조(`[data-slot="typography-table-wrap"]`, 423~427행)와 **동일**. 표는 정상 테이블 레이아웃 유지 | **채택** |

**B가 "새 설계"가 아닌 이유:** Design-system 정본이 이미 래퍼 div를 전제로 만들어져 있다. 우리는 그 마크업을 **작성할 수 없을 뿐**이라 JS로 같은 구조를 만든다 — `sidebar.js`의 `initActiveState()`, `content.js`의 `initPaginationActiveState()`가 전부 같은 성격(서버 마크업으로 불가능한 것을 JS가 보완)이다.

```css
[data-slot="prose-table-wrap"] {
  max-width: 100%;
  overflow-x: auto;
  /* DS(426행)는 overflow-y:auto로 적혀 있으나 가로로 넘치는 표를 담는
     래퍼이므로 x가 맞다 — 의도적 정정. */
}
[data-slot="prose-table-wrap"]:focus-visible {
  outline: calc(var(--spacing) * 0.5) solid var(--color-ring);
  outline-offset: calc(var(--spacing) * 0.5);
}

/* JS가 못 돌았을 때의 폴백. JS가 감싸면 data-prose-table="wrapped"가
   붙어 이 규칙이 자동으로 비켜난다. */
[data-slot="post-single-body"] table:not([data-prose-table="wrapped"]) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
}

[data-slot="post-single-body"] table {
  width: 100%;
  border-collapse: collapse;
  color: var(--color-foreground);
  /* DS(434행)는 --text-base(16px)지만 본문 폭이 720px로 좁아 4~5열 표가
     곧바로 넘친다. 대시보드 톤에도 14px가 맞다 — 의도적 편차. */
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-sm);
}
[data-slot="post-single-body"] :is(th,td) {
  padding: calc(var(--spacing) * 2) calc(var(--spacing) * 4);   /* 8px 16px — DS 440행 */
  border: 1px solid var(--color-border);
  text-align: left;
  vertical-align: top;
  word-break: keep-all;
}
[data-slot="post-single-body"] th { font-weight: var(--font-weight-semibold); }  /* DS는 700, 이 프로젝트는 600 */
[data-slot="post-single-body"] tbody tr:nth-child(even) { background-color: var(--color-muted); }  /* zebra — DS 449행 그대로 */
```

```js
/* components/content.js 에 추가 */
function initProseTables() {
  var body = document.querySelector('[data-slot="post-single-body"]');
  if (!body) return;

  Array.prototype.forEach.call(body.querySelectorAll("table"), function (table) {
    if (table.getAttribute("data-prose-table") === "wrapped") return;

    var wrap = document.createElement("div");
    wrap.setAttribute("data-slot", "prose-table-wrap");
    /* 스크롤 가능한 영역은 키보드로도 스크롤할 수 있어야 한다(WCAG 2.1.1) */
    wrap.setAttribute("tabindex", "0");

    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
    table.setAttribute("data-prose-table", "wrapped");
  });
}
/* init()에 initProseTables(); 한 줄 추가 */
```

### 4-10. 이미지 / figure

```css
[data-slot="post-single-body"] img {
  /* max-width:100%; height:auto; display:block 은 preflight가 이미 처리했다.
     현재 content.css 412~415행의 img 규칙은 그래서 중복이다 — 이 블록으로
     대체하면서 정리한다. */
  border-radius: var(--radius-md);   /* DS extra.css 762행이 에디터 이미지에 쓰는 값과 동일 */
  margin-inline: auto;               /* 본문 폭보다 좁은 이미지는 가운데 정렬 */
}
[data-slot="post-single-body"] figure img { margin-top: 0; }  /* 티스토리가 img를 span으로 한 겹 감싸도 안전하게 */

[data-slot="post-single-body"] figcaption {
  margin-top: calc(var(--spacing) * 2);
  font-size: var(--text-sm);
  line-height: var(--leading-normal);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
  text-align: center;
  word-break: keep-all;
}
```

**중앙 정렬 판단:** 이미지 자체는 `margin-inline: auto`로 가운데, **캡션도 가운데**(캡션이 이미지보다 짧을 때 왼쪽에 붙으면 이미지와 분리돼 보인다). 본문 텍스트는 계속 왼쪽 정렬이다 — 이 구역에서 가운데 정렬은 이미지/캡션이 유일한 예외다(빈 상태 문구가 유일한 예외였던 선행 스펙 §7과 같은 성격).

### 4-11. hr / 임베드

```css
[data-slot="post-single-body"] hr {
  height: 0;
  border: 0;                                        /* preflight가 border:0 solid로 둔 것을 명시 */
  border-top: 1px solid var(--content-divider);
}

/* 유튜브 등 임베드 — 목록 요청 범위 밖이지만 본문에 실제로 자주 들어오고,
   놔두면 가로 오버플로를 만든다. 최소 방어만 한다. */
[data-slot="post-single-body"] :is(iframe,video,embed,object) {
  max-width: 100%;
  border-radius: var(--radius-md);
}
```

---

## 5. 치수 / 여백 요약표

| 항목 | 값 | = px |
|---|---|---|
| 본문 최대 폭(`post-single`, 기존) | `calc(var(--spacing) * 180)` | 720 |
| 문단·목록 위 여백 | `calc(var(--spacing) * 4)` | 16 |
| 인용·코드·figure·이미지·표·h5·h6 위 여백 | `calc(var(--spacing) * 6)` | 24 |
| h4 위 여백 | `calc(var(--spacing) * 8)` | 32 |
| h3 위 여백 | `calc(var(--spacing) * 10)` | 40 |
| h1·h2 위 여백 | `calc(var(--spacing) * 12)` | 48 |
| `hr` 위·아래 여백 | `calc(var(--spacing) * 10)` | 40 |
| 제목 직후 요소 위 여백 | `calc(var(--spacing) * 3)` | 12 |
| 목록 들여쓰기 | `calc(var(--spacing) * 6)` | 24 |
| 목록 항목 간격 | `calc(var(--spacing) * 2)` | 8 |
| 인용 좌측 패딩 / 선 두께 | `calc(var(--spacing) * 6)` / `calc(var(--spacing) * 0.5)` | 24 / 2 |
| 코드 블록 패딩 / radius | `calc(var(--spacing) * 4)` / `var(--radius-lg)` | 16 / 10 |
| 인라인 코드 패딩 / radius | `calc(var(--spacing) * 0.8) calc(var(--spacing) * 1.2)` / `var(--radius-md)` | 3.2 4.8 / 8 |
| 표 셀 패딩 | `calc(var(--spacing) * 2) calc(var(--spacing) * 4)` | 8 16 |
| 이미지 radius | `var(--radius-md)` | 8 |
| 헤딩 `scroll-margin-top` | `calc(var(--spacing) * 12)` | 48 (상단 페이드 40px보다 큼) |
| 링크 밑줄 오프셋 | `calc(var(--spacing) * 1)` | 4 |
| 포커스 링 / 오프셋 | `calc(var(--spacing) * 0.5)` | 2 / 2 |

---

## 6. Tistory / 바닐라 환경 제약으로 Design-system 원본과 달라지는 부분

| # | Design-system 원본 | 이 스킨 | 이유 |
|---|---|---|---|
| 1 | `[data-slot="typography-p"]` 등 **슬롯 셀렉터** | `[data-slot="post-single-body"] p` **자손 태그 셀렉터** | 본문은 서버가 내려주는 임의 HTML이라 우리가 `data-slot`을 붙일 수 없다. **환경 제약(불가피)** |
| 2 | `div[data-slot="typography-table-wrap"]`를 **마크업에** 작성 | 동일 구조를 **JS로 주입**(`prose-table-wrap`) + CSS 폴백 | 위와 같은 이유. 구조는 원본과 동일하다 |
| 3 | h1 `--text-4xl`/800, h2 `--text-3xl`, h3 `--text-2xl`, h4 `--text-xl` | h2 `--text-xl` … h6 `--text-sm`, 전부 600 | 글 제목(h1)이 이미 24px로 확정돼 있어 본문 헤딩은 그 아래에 들어가야 한다. 700 토큰은 이 프로젝트에 없다(§2-1) |
| 4 | 헤딩 자간 `--tracking-tight`(−0.025em) | `--tracking-xl/-lg/-base/-sm` | −0.025em은 라틴 기준값. 같은 globals.css에 **한글 전용 대형 자간 스케일**이 따로 있다(§0-3) |
| 5 | blockquote `font-style: italic` | **italic 제거** | Pretendard에 이탤릭 자족이 없어 합성 기울임이 적용되고, 한글은 문단 단위 합성 이탤릭에서 가독성이 크게 떨어진다 |
| 6 | table `--text-base`(16px), th 700 | `--text-sm`(14px), th 600 | 본문 폭 720px에서 4~5열 표가 곧바로 넘친다 / 700 토큰 없음 |
| 7 | table-wrap `overflow-y: auto` | `overflow-x: auto` | 가로로 넘치는 표를 담는 래퍼이므로 원본이 오타로 보인다 — 의도적 정정 |
| 8 | `--font-mono`(= Pretendard 별칭, reset.css 169행) | `ui-monospace, …` 리터럴 | 별칭을 그대로 쓰면 코드가 가변폭으로 렌더된다. **Design-system 자신도 실제 코드 블록에서는 이 별칭을 쓰지 않는다**(extra.css 787/804행) |
| 9 | (해당 없음) | 링크 `--color-link` 신규 토큰 | `--color-primary` 그대로 쓰면 다크에서 링크가 본문보다 어두워진다(§3-1) |
| 10 | (해당 없음) | `overflow-wrap: break-word` / `letter-spacing: normal` 리셋 | 한글 `keep-all`과 모노스페이스가 임의 사용자 콘텐츠와 만나며 생기는 문제. Design-system은 통제된 데모 콘텐츠만 다뤄 겪지 않는 상황 |

---

## 7. developer 인계

### 7-1. 파일별 변경 목록

| 파일 | 변경 |
|---|---|
| **`components/content.css`** | **415행 뒤에 §10 프로즈 블록 추가**(§4-1~4-11). 기존 406~415행의 `post-single-body` 5줄 + `img` 4줄은 §4-1 / §4-10으로 **대체**(중복 제거). 그 외 1~405행은 **한 줄도 건드리지 않는다** |
| **`components/content.js`** | `initProseTables()` 추가 + `init()`에 호출 1줄(§4-9) |
| **`src/input.css`** | `:root`에 `--link: #1447e6`, `.dark`에 `--link: #8ec5ff`, `@theme static`에 `--color-link: var(--link)` / `--tracking-lg` / `--tracking-xl` / `--font-mono` (§3-1) |
| **`tools/make-preview.mjs`** | permalink 목업 데이터를 리치 HTML로 교체(§8) |
| `skin.html` | **변경 없음** ★ (자손 태그 셀렉터라 마크업 수정 불필요) |
| `tailwind.css` | `class=` 변경이 0건이므로 재빌드해도 산출물이 동일할 가능성이 높다 — **재빌드 후 md5를 비교해 결과를 검증 문서에 기록**할 것(선행 구역들도 같은 방식으로 기록해 왔다) |
| `README.md` | 업로드 파일 목록 **변경 없음**(새 파일 0개) |

### 7-2. Playwright 검증 체크리스트

> `_workspace/content_mockup-permalink.html`(§8 적용 후) 기준. 라이트/다크 각각 수행.

**Preflight 복원 확인 — 이 구역의 핵심**
1. `h2`~`h6`의 `getComputedStyle().fontSize`가 각각 **20 / 18 / 16 / 14 / 14px**, `fontWeight` 전부 **600**.
2. `h6`의 `color`가 `--color-muted-foreground` 계산값과 정확히 일치(h5와 다름).
3. `ul`의 `listStyleType === "disc"`, 중첩 `ul ul`은 `"circle"`, `ol ol`은 `"lower-alpha"`. **불릿이 실제로 렌더되는지 스크린샷으로도 확인**(preflight가 지웠던 것).
4. `ul`/`ol`의 `paddingLeft === "24px"`.

**수직 리듬**
5. 연속한 두 `<p>`의 `getBoundingClientRect()` 간격이 정확히 **16px**.
6. `h2`의 `marginTop === "48px"`, 그 **바로 다음** 요소의 `marginTop === "12px"`.
7. `post-single-body`의 **첫 자식** `marginTop === "0px"`.
8. `hr` 위/아래 간격이 **둘 다 40px**(대칭).

**코드**
9. `pre`와 인라인 `code`의 `fontFamily`가 `ui-monospace…`로 시작(**Pretendard가 아님**).
10. `pre`·`code`의 `letterSpacing === "normal"`(한글 자간 −0.01em이 상속되지 않았는지).
11. **긴 줄이 있는 `pre`에서 `scrollWidth > clientWidth`**(가로 스크롤 발생) **이면서 `document.scrollingElement`와 `content-inner`의 가로 오버플로는 0**(본문 폭을 밀지 않았는지). ★ 이 항목이 §4-6의 존재 이유다.
12. `pre` 안 `code`의 배경이 `transparent`(인라인 코드 알약이 이중으로 그려지지 않는지).

**표**
13. JS 실행 후 모든 `table`이 `[data-slot="prose-table-wrap"]` 안에 있고 `data-prose-table="wrapped"`가 붙었는지.
14. 래퍼의 `scrollWidth > clientWidth`(넓은 표가 실제로 가로 스크롤) + **본문/문서 가로 오버플로 0**.
15. `content.js`를 제거한 사본에서 폴백(`table { display:block; overflow-x:auto }`)이 발동해 여전히 오버플로가 0인지.
16. zebra: `tbody tr:nth-child(even)`의 배경이 `--color-muted` 계산값과 일치, 홀수 행은 투명.
17. 래퍼에 Tab 포커스가 들어가고(`tabindex=0`) 포커스 링이 보이는지.

**링크 / 인용 / 이미지**
18. 링크 색이 라이트 `#1447e6` / 다크 `#8ec5ff`로 계산되고, hover에서 `textDecorationColor`가 `currentColor`로 바뀌는지.
19. 링크 Tab 포커스 링.
20. `blockquote`의 `fontStyle === "normal"`(이탤릭이 아님) + `borderLeftWidth === "2px"` + 색이 `--content-divider` 계산값.
21. **`--content-divider`가 `post-single-body`까지 상속되는지** `getComputedStyle(body).getPropertyValue("--content-divider")`로 직접 확인(빈 문자열이면 §4-7/§4-11이 조용히 무효가 된다 — **반드시 실측**).
22. 넓은 이미지가 본문 폭(720px)으로 축소되고 radius 8px, 좁은 이미지(96px THUMB)는 **늘어나지 않고** 가운데 정렬.
23. `figcaption`이 가운데 정렬 + muted 색.

**회귀 — 이번엔 목록 화면을 안 건드렸으므로 "안 바뀌었음"의 증명**
24. `sidebar_mockup-preview.html`(index)에서 격자 배경·카드 높이 정합이 **이전과 동일**(선행 검증 §14-2의 1~4번을 그대로 재실행).
25. permalink 화면에서 격자 배경이 여전히 꺼져 있고(`backgroundImage === "none"`) 타이틀영역이 `display:none`.
26. 긴 본문에서 **문서가 아니라 `content-inner`가 스크롤**되는지 + 커스텀 스크롤바 3초 idle 페이드 정상(⚠ `ignoreDefaultArgs:["--hide-scrollbars"]` 필수).
27. `scroll-fade-y` 상하 페이드 정상 + **헤딩 앵커 이동 시 제목이 페이드에 가리지 않는지**(`scroll-margin-top: 48px` 실효 확인).
28. 가로 오버플로 0(`document.scrollingElement.scrollWidth === window.innerWidth`), 콘솔 에러 0.

---

## 8. `make-preview.mjs` 목업 데이터 — 그대로 복붙할 완성본

### 8-1. 적용 방법 (3단계)

1. **`THUMB` 상수 바로 아래(73~78행 뒤)** 에 §8-2의 `PROSE_IMAGE` + `PROSE_SAMPLE` + 대입 1줄을 추가한다.
   → `SUBSTITUTIONS`(34행)는 `THUMB`보다 **위**에 있어 그 안에서 참조할 수 없다. 그래서 객체 리터럴을 고치는 대신 `SUBSTITUTIONS.article_rep_desc = PROSE_SAMPLE;` 한 줄로 나중에 덮어쓴다(파일 순서를 재배치하지 않는 최소 변경).
2. **54행 `article_rep_desc: "본문 영역은 다음 구역에서 구현합니다.",` 는 그대로 둔다**(1의 대입이 덮어쓴다). `article_rep_summary`(53행)는 **건드리지 않는다** — 목록 화면 요약 더미로 계속 쓰인다.
3. **391~405행의 permalink 출력에서 `.replace("본문 영역은 다음 구역에서 구현합니다.", …)` 후처리를 통째로 제거**하고 `render(raw, { mode: "permalink" })` 결과를 그대로 쓴다. (이제 desc 자체가 리치 HTML이라 그 후처리는 불필요하고, 남겨두면 첫 일치 지점을 잘못 건드릴 수 있다.)

```js
writeFileSync(
  resolve(root, "_workspace", "content_mockup-permalink.html"),
  render(raw, { mode: "permalink" }),
  "utf8"
);
```

**파이프라인 안전성 확인(스펙 저자 검토):** `PROSE_SAMPLE`은 render()의 1)`</?s_…>` 제거, 2)`[##_…_##]` 치환, 3)`./images/` 경로 치환, 4)`@@SKIN_COMMENT_n@@` 복원 **어느 정규식에도 걸리지 않는다**(해당 패턴을 한 글자도 포함하지 않음). 문자열은 **템플릿 리터럴(백틱)** 로 쓴다 — HTML 안에 작은따옴표·큰따옴표가 모두 나오기 때문이며, 내부에 백틱과 `${`는 없다.

### 8-2. 추가할 코드 (전문)

```js
/* ── [PROSE SPEC §8] 단일 글 본문 목업 ─────────────────────────────
   실사이트에서 [##_article_rep_desc_##]는 티스토리 에디터가 만든 임의
   리치 HTML을 통째로 내려준다. 로컬에서 프로즈 타이포그래피를 눈으로
   확인할 방법이 없었으므로(이전엔 문자열 한 줄), 스타일링 대상 요소가
   전부 최소 한 번씩 등장하는 샘플을 여기서 만든다.
   외부 URL 금지 — 오프라인에서도 그대로 렌더돼야 한다. */
const PROSE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675">' +
      '<rect width="1200" height="675" fill="#d4d4d4"/>' +
      '<rect x="72" y="72" width="1056" height="531" fill="#a3a3a3"/></svg>'
  );

const PROSE_SAMPLE = [
  `<p>이 글은 본문 프로즈 타이포그래피를 실제로 확인하기 위한 목업이다. 한 문장 안에 <strong>굵게</strong>와 <em>기울임</em>, 그리고 <a href="/301">본문 링크</a>를 함께 섞어 각 요소가 서로를 밀어내지 않는지 본다.</p>`,
  `<p>두 번째 문단은 문단 사이 여백(16px)이 실제로 적용되는지 확인한다. 한글 본문은 <code>word-break: keep-all</code>로 어절 단위 줄바꿈이 유지되어야 하고, 문장 중간의 인라인 코드가 행간을 밀어 올리지 않아야 한다. 아주 긴 주소(https://daitnu.tistory.com/manage/design/skin/edit#/source/file)도 본문 폭을 넘기지 않고 끊겨야 한다.</p>`,

  `<h2>h2 — 섹션 제목</h2>`,
  `<p>h2 바로 아래 문단은 제목에 붙어(12px) 한 덩어리로 읽혀야 한다. 제목 위 여백은 48px이다.</p>`,

  `<h3>h3 — 하위 절 제목</h3>`,
  `<p>제목 계층은 크기와 자간으로만 구분되고 굵기는 h2~h6 전부 600으로 통일돼 있다.</p>`,

  `<h4>h4 — 문단 제목</h4>`,
  `<p>h4는 본문과 같은 16px이지만 굵기로 구분된다.</p>`,

  `<h5>h5 — 더 낮은 단계</h5>`,
  `<h6>h6 — 가장 낮은 단계(흐린 색으로만 구분된다)</h6>`,
  `<p>h5와 h6는 크기가 같고 색이 다르다.</p>`,

  `<blockquote><p>인용문은 좌측 세로선과 들여쓰기로 구분한다. Pretendard에는 이탤릭 자족이 없어 문단 단위 합성 기울임을 쓰지 않는다 — 인라인 강조에만 이탤릭을 남겼다.</p></blockquote>`,

  `<h3>목록</h3>`,
  `<ul>`,
  `<li>순서 없는 목록의 첫 항목</li>`,
  `<li>두 번째 항목 — 아래에 중첩 목록이 붙는다`,
  `<ul><li>중첩되면 마커가 circle로 바뀐다</li><li>중첩 항목 사이 간격은 8px</li></ul>`,
  `</li>`,
  `<li>세 번째 항목</li>`,
  `</ul>`,
  `<ol>`,
  `<li>순서 있는 목록</li>`,
  `<li>두 번째<ol><li>중첩은 lower-alpha</li><li>두 번째 중첩</li></ol></li>`,
  `<li>세 번째</li>`,
  `</ol>`,

  `<h3>코드 블록</h3>`,
  `<p>아래 블록에는 본문 폭(720px)보다 훨씬 긴 줄이 하나 들어 있다 — 그 줄이 본문을 밀지 않고 <code>pre</code> 안에서만 가로로 스크롤되어야 한다.</p>`,
  `<pre><code>/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */
const spec = { area: "post-single-body", tokens: ["--text-base", "--leading-relaxed", "--tracking-base"] };
document.querySelector('[data-slot="post-single-body"]').querySelectorAll("table").forEach((table) =&gt; wrapWith(table, "prose-table-wrap")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다
</code></pre>`,

  `<h3>이미지</h3>`,
  `<figure>`,
  `<img src="${PROSE_IMAGE}" alt="샘플 이미지" />`,
  `<figcaption>figcaption — 캡션은 가운데 정렬 + 흐린 색이며 이미지에 8px 붙는다</figcaption>`,
  `</figure>`,
  `<p>아래는 캡션 없는 단독 이미지(원본 96px)다. 본문 폭에 맞춰 <em>늘어나면 안 되고</em>, 가운데 정렬되어야 한다.</p>`,
  `<img src="${THUMB}" alt="작은 이미지" />`,

  `<h3>표</h3>`,
  `<table>`,
  `<thead><tr><th>토큰</th><th>값</th><th>적용 요소</th><th>실측 출처</th><th>비고</th></tr></thead>`,
  `<tbody>`,
  `<tr><td>--text-xl</td><td>1.25rem</td><td>h1 · h2</td><td>Design-system globals.css 379행</td><td>본문 헤딩 스케일 최상단</td></tr>`,
  `<tr><td>--tracking-xl</td><td>-0.012em</td><td>h1 · h2</td><td>Design-system globals.css 417행</td><td>한글 전용 자간 스케일</td></tr>`,
  `<tr><td>--font-mono</td><td>ui-monospace, …</td><td>code · pre</td><td>Design-system extra.css 787행</td><td>reset.css의 Pretendard 별칭은 쓰지 않는다</td></tr>`,
  `<tr><td>--color-link</td><td>#1447e6 / #8ec5ff</td><td>a</td><td>dashboard-skin src/input.css 32 · 63행</td><td>라이트 / 다크</td></tr>`,
  `<tr><td>--content-divider</td><td>foreground 16% 혼합</td><td>blockquote · hr</td><td>dashboard-skin content.css 16행</td><td>content-inner에서 상속</td></tr>`,
  `</tbody>`,
  `</table>`,

  `<hr />`,
  `<p>hr 위아래 여백은 40px로 대칭이다. 이 문단이 본문의 마지막이며, 아래로는 다음 구역(TOC · 댓글)이 들어올 자리가 남는다.</p>`,
].join("\n");

SUBSTITUTIONS.article_rep_desc = PROSE_SAMPLE;
```

### 8-3. 이 목업이 커버하는 검증 항목

| 요소 | 등장 | 검증 목적 |
|---|---|---|
| h2 / h3 ×3 / h4 / h5 / h6 | ✅ 전 단계 | 크기·굵기·색 위계, 제목 위/아래 여백 |
| p ×9 | ✅ | 문단 간 16px, 제목 직후 12px |
| a | ✅ 1개 + 본문 속 긴 URL 1개 | 링크 색/밑줄/hover, `overflow-wrap` |
| strong / em | ✅ 한 문장에 함께 | 600 굵기, 합성 이탤릭 |
| 인라인 code | ✅ 2곳 | 알약 배경, 자간 리셋, 행간 영향 없음 |
| pre > code | ✅ **720px 초과 긴 줄 포함** | `overflow-x` 가로 스크롤, 본문 폭 불변 |
| blockquote | ✅ | 좌측선, italic 아님 |
| ul(중첩) / ol(중첩) | ✅ | 마커 복원, 중첩 마커, 8px 간격 |
| img | ✅ 넓은 것(1200px) + 좁은 것(96px) | 축소 / **비확대** / 가운데 정렬 / radius |
| figure + figcaption | ✅ | 캡션 스타일, `figure > :first-child` 여백 0 |
| table 5열 | ✅ 긴 셀 포함 | 래퍼 주입, 가로 스크롤, zebra, th 굵기 |
| hr | ✅ | 색·대칭 여백 |

---

## 9. 확인 필요 (사용자 결정 사항)

| # | 항목 | 스펙 저자 제안 | 근거 / 대안 |
|---|---|---|---|
| **Q1** | **본문 링크 색** | **신규 `--link` 토큰**(라이트 `#1447e6` / 다크 `#8ec5ff`) | Design-system 원문(`--color-primary`)을 그대로 쓰면 **다크에서 링크(`#e5e5e5`)가 본문(`#fafafa`)보다 어두워진다.** 값은 이 스킨이 이미 쓰는 파랑을 재사용했다(발명 아님). **대안:** ①원문 그대로 `--color-primary`(다크 문제 감수) ②밑줄만으로 구분하고 색은 본문색 유지(가장 절제된 안) |
| **Q2** | **코드 블록 배경** | **`--color-muted`(테마 추종)** — 라이트 `#f5f5f5` / 다크 `#262626` + `--color-border` 테두리 | 인라인 코드와 **같은 표면**이 되어 두 코드 표현이 한 계열로 읽힌다. **대안:** Design-system `[data-slot="editor-code-block"]`(extra.css 765~806행)의 **고정 다크**(`#0d1117` 배경 / `#c9d1d9` 텍스트) — 라이트 테마에서도 코드만 검게 남는 흔한 블로그 스타일이지만, 이 스킨이 지켜온 "모든 색은 테마 토큰" 원칙에서 벗어난다 |
| **Q3** | **구문 강조(syntax highlighting)** | **이번 범위 밖 — 도입하지 않음** | 색 없는 단색 코드. 원하면 후속으로 highlight.js를 붙일 수 있고(1차 리스킨에서 이미 한 번 도입한 이력 있음), 그때 Q2의 고정 다크 안과 함께 결정하는 편이 낫다. **다만 티스토리 에디터 코드블록이 자체 클래스/인라인 스타일을 함께 내려줄 가능성이 있어 실사이트 확인이 선행돼야 한다(Q8)** |
| **Q4** | **표 헤더 강조 방식** | **Design-system 그대로** — th 배경 없음 + 굵기 600 + **짝수 행 zebra** | DS(449행)를 그대로 이식. **대안:** th에 `--color-muted` 배경을 주고 zebra를 빼는 안(헤더가 더 또렷하지만, 지금은 zebra와 배경색이 같아 둘을 동시에 쓸 수 없다) |
| **Q5** | **본문 h2가 20px인 것** | **20px 유지**(범위 준수) | 글 제목(h1)이 24px로 확정돼 있어 그 아래여야 한다. **대안(범위 밖):** `post-single-title`을 30px(`--text-3xl` + `--tracking-3xl` 토큰 추가 필요)로 올리고 본문 h2를 24px로 — 제목 위계가 더 시원해지지만 **완성 상태인 `post-single-title`을 수정해야 한다** |
| **Q6** | **인용문 이탤릭** | **blockquote는 제거 / 인라인 `em`은 유지** | Pretendard에 이탤릭 자족이 없어 합성 기울임이 적용된다. 문단 단위는 가독성 손실이 크고(대체 채널: 좌측선·들여쓰기 있음), 인라인은 대체 채널이 없다. **대안:** 둘 다 유지 / 둘 다 제거 |
| **Q7** | **표 가로 스크롤 구현** | **JS 래퍼 주입 + CSS 폴백 병행** | Design-system이 실제로 래퍼 div 구조를 쓴다(423행). CSS-only(`display:block`)는 `width:100%`가 무력화돼 좁은 표가 쪼그라든다. **대안:** JS 없이 CSS-only만(코드는 3줄로 줄지만 좁은 표 레이아웃을 포기) |
| **Q8** | **실사이트에서만 확인 가능(계정 필요)** | — | ① 티스토리가 본문을 감싸는 래퍼 요소/클래스가 실제로 있는지(있다면 §4-2의 `:first-child` 방어 규칙이 실제로 필요해진다) ② 에디터 **코드블록**이 내려주는 마크업(`<pre><code>` 형태인지, 자체 클래스·인라인 스타일이 붙는지) ③ **이미지**가 `<figure>`/`<span>` 등으로 감싸져 오는지(§4-10의 `figure img { margin-top: 0 }`가 그 대비다) ④ 인용/표에 에디터 고유 속성이 붙어 우리 규칙과 충돌하는지. **네 가지 모두 "붙어도 우리 셀렉터는 자손 태그 기준이라 계속 매치된다"가 설계 전제**이지만, 에디터가 **인라인 스타일**을 함께 내려주면 그것만은 우리 규칙을 이긴다 — 실사이트 확인 후 필요 시 해당 속성만 개별 대응 |
| **Q9** | **프로즈 CSS를 어디에 둘까** | **`content.css` 끝에 §10으로 추가**(새 파일 없음) | 사용처가 한 곳뿐이고, 파일이 늘면 `skin.html` `<link>` / `make-preview.mjs` 경로 치환 / `README.md` 업로드 목록이 함께 늘어난다. **대안:** 지금 바로 `components/prose.css`로 분리(댓글 구역이 같은 규칙을 쓸 것이 확실하다면 이쪽이 낫다) |
| **Q10** | **본문 행간 1.625** | **유지** | Design-system typography-p는 오히려 더 넉넉하다(`--leading-normal-lg` = 1.75rem = **1.75**). 스킬 표의 Body 1.5는 UI 본문 기준. **대안:** 장문 가독성을 더 우선한다면 `--leading-normal-lg`(1.75)를 토큰으로 들여와 교체 |

**→ Q1·Q2·Q4·Q6·Q7·Q9가 시각/구조에 실제 영향이 있는 항목이다. 나머지는 제안값으로 진행해도 무방하며, Q8은 실사이트 배포 후 확인한다.**
