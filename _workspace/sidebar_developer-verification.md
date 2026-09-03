# Sidebar 구현 · 검증 보고서 (Phase 3)

---

## [2026-09-02 후속] 접힘 상태 아이콘 정렬 어긋남 수정 — 검증

**요청:** "사이드메뉴 접혔을때 아이콘 정렬 안맞음" — 접힘 시 상단 브랜드 마크와 하단 방문자
아이콘은 가운데인데 아카이브의 Design(팔레트)·Ai(별)만 왼쪽으로 쏠리고 일부가 잘려 보임.

**원인:** 배지 자리를 예약하는 규칙

```css
[data-slot="sidebar-wrapper"] [data-slot="sidebar-menu-item"]:has(> [data-slot="sidebar-menu-badge"]) > [data-slot="sidebar-menu-button"] { padding-right: calc(var(--spacing) * 7); }
```

이 `:has` + 자식 결합자 조합이라 접힘 상태의 `[data-state="collapsed"] … { padding: 0 }`보다
특이성이 높다. 배지 자체는 접힘에서 `display:none`이지만 예약된 28px는 그대로 남아, 배지가
달린 Design/Ai 두 항목만 32px 버튼 안에서 아이콘이 왼쪽으로 밀렸다. 헤더 로고·푸터 통계는
배지가 없어 영향이 없었다 — 그래서 이 둘만 어긋나 보인 것.

**수정:** 예약 패딩을 **펼침 상태로만 한정**. 같은 구조의 `menu-action` 예약 패딩
(`padding-right: 32px`)도 동일한 잠재 버그라 함께 한정했다(현재 마크업엔 action이 없지만
추가되는 순간 같은 증상이 난다).

```css
[data-slot="sidebar-wrapper"]:not([data-state="collapsed"]) [data-slot="sidebar-menu-item"]:has(> [data-slot="sidebar-menu-badge"]) > [data-slot="sidebar-menu-button"] { … }
```

**바꾼 파일:** `dashboard-skin/components/sidebar.css` 단 하나(선택자 2곳 + 주석).
마크업·JS가 그대로라 `skin:build` 재빌드 불필요. `components/header.*`와 1차 `skin/`은 손대지 않았다.

**검증:** Playwright(Chromium 1228) · 1440×900 · `http://localhost:4321/` · 전부 PASS
`getBoundingClientRect()` 실측(단위 px, 포인터는 사이드바 밖으로 치워 hover 배제):

| 상태 | 요소 | left | right | width | **center X** | padding-right |
|------|------|------|-------|-------|--------------|----------------|
| 접힘 | 헤더 `sidebar-icon-box` | 7.5 | 39.5 | 32 | **23.5** | 0px |
| 접힘 | Design 버튼 / 아이콘 | 7.5 / 15.5 | 39.5 / 31.5 | 32 / 16 | **23.5** | 0px ✅(수정 전 28px) |
| 접힘 | Ai 버튼 / 아이콘 | 7.5 / 15.5 | 39.5 / 31.5 | 32 / 16 | **23.5** | 0px ✅ |
| 접힘 | 푸터(방문자) 버튼 / 아이콘 | 7.5 / 15.5 | 39.5 / 31.5 | 32 / 16 | **23.5** | 0px |
| 펼침 | Design / Ai 버튼 | 8 | 247 | 239 | 127.5 | **28px** (회귀 없음) ✅ |
| 펼침 | 푸터 버튼 | 8 | 247 | 239 | 127.5 | 8px |

- 네 아이콘의 중심 X가 **모두 23.5px로 완전 일치**(오차 0px).
- 잘림 없음 — 접힘 `sidebar-container`는 0~48px, 아이콘 버튼은 7.5~39.5px로 안쪽에 있다.
- 컨테이너 `cursor: auto` 확인(레일 제거 후 상태 유지).
- 헤더 트리거로 접힘→펼침→접힘 왕복 후 재측정해도 위 표와 동일(정렬 유지) ✅.
- 스크린샷: `_workspace/sidebar-shots/fix-collapsed.png`, `fix-expanded.png`.

**참고(버그 아님):** 중심이 24가 아니라 23.5인 것은 `sidebar-container`의 `border-right: 1px`가
콘텐츠 폭을 47px로 만들기 때문이다(32px 버튼이 31px 트랙에서 가운데 정렬 → 좌측 7.5px).
헤더·푸터·아카이브가 **모두 같은 값**이라 시각적으로 한 줄에 맞는다.

---

## [2026-09-02 후속] 사이드바 우측 레일 클릭 접힘 제거 — 검증

**요청:** "사이드메뉴 오른쪽 모서리 클릭 시 접히는 기능 제거"

**의도적 이탈:** shadcn `SidebarRail`(`data-slot="sidebar-rail"`)의 **클릭 토글을
사용자 요청으로 제거**했다. 히트영역 버튼만 남겨둘 이유가 없어 마크업에서 요소 자체를
삭제하고, 죽은 코드가 된 CSS 규칙(16px 히트영역 / `cursor:w-resize`·`e-resize` /
hover·focus 시 `::after` 세로선 강조 / 전환 애니메이션 대상 2곳)도 함께 정리했다.
사이드바 우측 경계선은 `sidebar-container`의 `border-right`로 계속 그려지지만
**장식일 뿐 클릭해도 아무 일도 일어나지 않는다.**

**바꾼 파일:** `dashboard-skin/skin.html`(rail 버튼 삭제) · `components/sidebar.js`
(rail 조회·click 리스너 삭제) · `components/sidebar.css`(§4-3(3) 블록 및 transition
선택자 2곳 정리) · `tailwind.css`(재빌드) · `README.md`(토글 경로 문구 수정) ·
`_workspace/sidebar_mockup-preview.html`·`sidebar_mockup-nojs.html`(재생성).
`components/header.*`와 1차 `skin/`은 건드리지 않았다.

**검증:** Playwright(Chromium 1228) · 1440×900 · `http://localhost:4321/` · 전부 PASS

| # | 확인 항목 | 결과 |
|---|-----------|------|
| 0 | `[data-slot="sidebar-rail"]` DOM 존재 개수 | **0개** ✅ |
| 1 | 펼침 상태에서 우측 경계(x=253~259, 5지점) 실제 마우스 클릭 | `expanded` → `expanded` (불변) ✅ |
| 2 | 헤더 `sidebar-trigger` 클릭 | `expanded → collapsed → expanded` ✅ |
| 3 | `Ctrl+B` | `expanded → collapsed → expanded` ✅ |
| 3b | 검색 입력 포커스 중 `Ctrl+B` (가로채지 않아야 함) | 상태 불변 ✅ |
| 4 | 경계 5지점의 `elementFromPoint` + `getComputedStyle().cursor` | 전부 `auto` — `w-resize`/`e-resize` 없음 ✅ |
| 5 | **접힘 상태**에서 우측 경계(x=48) 클릭 | `collapsed` → `collapsed` (불변) ✅ |
| 6 | 쿠키 `sidebar_state=false` 저장 → 새로고침 후 복원 | `collapsed`로 복원 ✅ |
| 7 | 페이지 JS 에러 | 없음 ✅ |

경계 지점의 실제 최상위 엘리먼트는 `sidebar-content`(x−3) / `sidebar-container`(x−1) /
`sidebar-inset`(x0, x+1, x+3)로, 예전에 그 자리를 덮고 있던 `z-index:20` 히트영역이
사라졌음을 좌표 단위로 확인했다. 스크린샷: `_workspace/sidebar-shots/rail-removed-expanded.png`.

**미검증(변함없음):** 티스토리 서버 렌더링(방문자수 치환자, 검색 실동작, 관리 메뉴바 충돌)은
계정이 없어 여전히 확인 못 했다. 모바일 뷰포트도 이번 수정 범위 밖(반응형 미구현 상태 유지).

---

## (최초 구현 보고 — 2026-09-02)

- **작성:** tistory-skin-developer (general-purpose로 대신 호출됨)
- **일자:** 2026-09-02
- **스펙:** `_workspace/sidebar_designer-spec.md` (§8 확인사항 전부 확정 상태)
- **산출물:** `dashboard-skin/`
- **검증 환경:** Playwright(Chromium) · 1440×900 PC 뷰포트 · `http://localhost` 정적 서버
  (`file://`은 Chromium이 `document.cookie`를 막아 쿠키 검증이 불가능해 반드시 HTTP로 열었다)

---

## 1. 구현 방식 — 새로 짜지 않고 기존 포트를 이식했다

스펙 §0/§9의 지시대로 **`D:\MyCloud\2026포트폴리오\Design-system\css\components.css`
368–789행의 shadcn Sidebar 바닐라 포트를 그대로 가져와 기반(baseline)으로 삼았다.**
동작 로직도 `js/components.js` 28–57행(`initDocSidebars`)의 방식
— `data-state`를 wrapper와 `[data-slot="sidebar"]` **양쪽에** 세팅 — 을 그대로 승계했다.
마크업 구조는 `Design-system/pages/sidebar.html`의 데모를 따랐다.

`components/sidebar.css`의 변경분은 전부 `[SPEC …]` 주석으로 표시해 원본과 대조 가능하게 했다.

### 1-1. 스펙 §0 "누락 슬롯 7건" 처리 결과

| 슬롯 | 처리 |
|---|---|
| 전환 애니메이션 | ✅ 신규 (`width,left,right` / 200ms / linear + `prefers-reduced-motion` 예외) |
| `sidebar-trigger` | ✅ 신규 (ghost 버튼 규격 28×28, 마크업은 inset 뼈대에 임시 배치) |
| `sidebar-rail` | ✅ 신규 (16px 히트영역, hover 시 세로선, `tabindex="-1"`, 클릭 토글) |
| `sidebar-inset` | ✅ 신규 (`flex:1; min-width:0; background:--color-background`) |
| `sidebar-input` | ✅ 신규 (높이 32px로 메뉴 버튼과 리듬 일치, 접힘 시 숨김) |
| `sidebar-menu-badge` | ✅ 신규 (전경색 + `opacity:.6`, 활성 시 파랑 + `opacity:1`, 접힘 시 숨김) |
| `sidebar-separator` | ✅ 신규 (`--color-sidebar-border`, `margin-inline: 8px`) |
| `sidebar-menu-skeleton` | ⛔ 스펙대로 **미구현**(정적 스킨이라 불필요) |

### 1-2. 스펙 §3-3 "의도적 이탈 3건" 반영

전부 반영했고 실측으로 확인했다(§2-2 표).

1. 라이트 `--sidebar-primary`: `#171717` → **`#1447e6`**
2. `--sidebar-accent-foreground`: 라이트 **`#1447e6`** / 다크 **`#8ec5ff`**
3. hover의 `color` 선언 **제거** → hover는 배경만, active만 파랑

### 1-3. 스펙 §7 Tistory 제약 대응

| 항목 | 구현 |
|---|---|
| §7-1 상태 보유자 | `[data-slot="sidebar-wrapper"]`의 `data-state`. wrapper + `[data-slot="sidebar"]` 동시 세팅, `data-collapsible`은 `""`/`"icon"` |
| §7-2 쿠키 + FOUC | 쿠키 `sidebar_state`(7일, `path=/`, samesite=lax) + `<head>` 인라인 힌트 스크립트 + **wrapper 여는 태그 직후 동기 스크립트**(아래 §3-1) |
| §7-3 카테고리 | **A안(정적 하드코딩)** — 라이브 블로그 실측값(`Design`/`Logo`/`Font`/`Figma`, `Ai`)을 직접 기재 |
| §7-6 툴팁 | `data-tooltip` + `::after`, `[data-state="collapsed"]`에서만 노출 |
| §7-7 아이콘 | lucide 인라인 `<svg>` (`stroke="currentColor"`, `stroke-width="2"`, `fill="none"`) |
| §7-8 Ctrl+B | `(metaKey||ctrlKey) && key==='b'` + `preventDefault()`, 입력 필드 포커스 중엔 무시 |
| §7-9 셀렉터 기반 | 사이드바 스타일은 전부 `sidebar.css`의 `[data-slot]` 셀렉터. `tailwind.css`는 토큰/리셋/보조 유틸만 |
| §7-4/§7-5 반응형 | **이번 범위 밖.** `--sidebar-width-mobile`(288px) 변수만 선언해 둠 |

---

## 2. 검증 결과 (전부 `page.evaluate`로 속성/computed style 직접 확인)

### 2-1. data-slot 파싱 결과 — 스펙 §1-1 트리와 대조

렌더된 DOM에서 실제로 확인된 슬롯(중복 제거, 등장 순서):

```
sidebar-wrapper, sidebar, sidebar-gap, sidebar-container, sidebar-inner,
sidebar-header, sidebar-menu, sidebar-menu-item, sidebar-menu-button,
sidebar-icon-box, meta, title, desc, sidebar-content, sidebar-group,
sidebar-group-content, sidebar-search-form, sidebar-search-icon, sidebar-input,
sidebar-group-label, label, sidebar-separator, sidebar-menu-badge,
sidebar-menu-sub, sidebar-menu-sub-item, sidebar-menu-sub-button,
sidebar-footer, sidebar-rail, sidebar-inset, sidebar-trigger,
skin-scaffold-header, skin-scaffold-title, skin-scaffold-body
```

- 상태 속성 실측: `data-variant="sidebar"` · `data-side="left"` ·
  `data-state="expanded"↔"collapsed"` · `data-collapsible=""↔"icon"` — 스펙 §1-2와 일치.
- CSS만 있고 이번 마크업엔 쓰지 않은 슬롯: `sidebar-menu-action`, `sidebar-group-action`,
  `sidebar-avatar` (다음 구역 대비).
- `skin-scaffold-*`는 shadcn 슬롯이 아니라 **다음 구역 자리표시용**으로 붙인 이름이다
  (header 구역을 만들 때 걷어낸다).

### 2-2. 색상 — 스펙 §3 표와 computed style 대조

| 토큰 | 라이트 실측 | 다크 실측 | 스펙 §3-1/§3-2 | 판정 |
|---|---|---|---|---|
| `--sidebar` | `#fafafa` | `#171717` | 동일 | ✅ |
| `--sidebar-foreground` | `#000000` | `#fafafa` | 동일 | ✅ |
| `--sidebar-primary` | `#1447e6` | `#1447e6` | 동일 | ✅ |
| `--sidebar-primary-foreground` | `#fafafa` | `#fafafa` | 동일 | ✅ |
| `--sidebar-accent` | `#f5f5f5` | `#262626` | 동일 | ✅ |
| `--sidebar-accent-foreground` | `#1447e6` | `#8ec5ff` | 동일 | ✅ |
| `--sidebar-border` | `#e5e5e5` | `#ffffff1a` | 동일 | ✅ |
| `--sidebar-ring` | `#a1a1a1` | `#525252` | 동일 | ✅ |
| `--background` / `--foreground` | `#ffffff` / `#000000` | `#0a0a0a` / `#fafafa` | 동일 | ✅ |
| `--muted-foreground` | `#737373` | `#a1a1a1` | 동일 | ✅ |
| `--border` / `--input` / `--ring` | `#e5e5e5` / `#e5e5e5` / `#a1a1a1` | `#ffffff1a` / `#ffffff26` / `#737373` | 동일 | ✅ |
| `--radius` | `.625rem` | 동일 | 동일 | ✅ |

렌더 결과 실측:
- `sidebar-inner` 배경 = `rgb(250,250,250)` / 다크 `rgb(23,23,23)` ✅
- `sidebar-icon-box` 배경 = `rgb(20,71,230)` = `#1447e6`, 전경 `rgb(250,250,250)` ✅
- 활성 메뉴 글자 = `rgb(20,71,230)` / 다크 `rgb(142,197,255)` = `#8ec5ff` ✅
- `sidebar-container` 우측 경계 = 다크에서 `rgba(255,255,255,0.1)` ✅

### 2-3. 치수 / 타이포 — 스펙 §4-2 / §5-1 대조

| 항목 | 실측 | 스펙 | 판정 |
|---|---|---|---|
| `sidebar-gap` / `container` 폭 (펼침) | 256px | 256 | ✅ |
| 동 (접힘) | 48px | 48 | ✅ |
| `sidebar-menu-button` 높이 | 32px | 32 | ✅ |
| 접힘 시 메뉴 버튼 | 32×32px | 32×32 | ✅ |
| `sidebar-icon-box` | 32×32px, radius 10px | 32×32, radius-lg | ✅ |
| `sidebar-menu-button` radius | 8px | radius-md(8) | ✅ |
| `sidebar-group-label` | 12px / 500 / `-0.072px`(=`-0.006em`) / 높이 32px / `text-transform:none` / `opacity:.7` | Caption 12/500, `--tracking-xs` | ✅ |
| `sidebar-menu-badge` | 20px 높이, min-width 20px, `opacity:.6` | 20/20/.6 | ✅ |
| 배지(활성 항목) | 색 `#1447e6`, `opacity:1` | §4-3(6) | ✅ |
| `sidebar-separator` | 1px, `#e5e5e5`, `margin-left 8px` | §4-3(7) | ✅ |
| `sidebar-input` | 높이 32px, radius 8px, border `#e5e5e5` | §4-3(5) | ✅ |
| `sidebar-menu-sub-button` | 높이 28px, 14px | 28 / Small 14 | ✅ |
| `sidebar-menu-sub` | `margin: 2px 14px`, `border-left #e5e5e5` | 2/14 | ✅ |
| `sidebar-rail` | `position:absolute`, `left:256px`(접힘 48px), 16px, `cursor:w-resize`→`e-resize` | §4-3(3) | ✅ |
| 포커스 링 | `2px solid rgb(161,161,161)`, offset 2px | §4-2 | ✅ |
| 폰트 | `"Pretendard Variable", Pretendard, …` (body/메뉴 버튼 모두) | §5-1 | ✅ |
| 전환 | gap/container `width,left,right` 0.2s linear · 버튼 `background-color,color` 0.15s cubic-bezier(.4,0,.2,1) | §4-3(1) | ✅ |

### 2-4. 동작 — 실제 클릭/키보드

| 시나리오 | 결과 |
|---|---|
| `sidebar-trigger` 클릭 (펼침→접힘) | wrapper/sidebar `data-state="collapsed"`, `data-collapsible="icon"`, gap·container 48px, `aria-expanded="false"`, 쿠키 `sidebar_state=false` ✅ |
| 접힘 시 숨김 대상 | `label` / `sidebar-group-label` / `sidebar-menu-badge` / `sidebar-menu-sub` / 검색 그룹 전부 `display:none` ✅ |
| `sidebar-rail` 클릭 | 토글 동작 + 쿠키 갱신, `tabIndex === -1` ✅ |
| `Ctrl+B` | `collapsed → expanded`, 쿠키 `sidebar_state=true` ✅ |
| 검색 입력 포커스 중 `Ctrl+B` | **가로채지 않음** — 상태 그대로 `expanded` ✅ (§7-8) |
| 새로고침 후 복원 | 쿠키 `sidebar_state=false` 상태에서 재진입 → `collapsed`, gap 48px ✅ |
| hover vs active 구분 | hover: 배경 `#f5f5f5` + 글자 `#000` / active: 배경 `#f5f5f5` + 글자 `#1447e6` + weight 500 → **다름** ✅ (§3-3-c) |
| 접힘 상태 툴팁 | `::after` content `"Design"`, 배경 `#000`, 글자 `#fafafa`, `left:39px`, `z-index:50` — 48px 사이드바 **바깥**에 정상 노출(스크린샷 확인) ✅ |
| Tab 포커스 이동 | 3번째 Tab에서 `sidebar-menu-button`(홈), `:focus-visible` 매치, 링 정상 ✅ |
| 테마 토글 | `.dark` 클래스 + `localStorage.theme="dark"`, 아이콘·라벨이 CSS(`[data-theme-when]`)로 전환 ✅ |
| 검색 제출 | `/search/%ED%8F%B0%ED%8A%B8%20%EC%B6%94%EC%B2%9C`(= `/search/폰트 추천`)로 이동 ✅ |

### 2-5. 활성 표시 (카테고리 URL별)

로컬 서버가 확장자 없는 경로를 목업으로 폴백하도록 해서 실제 URL로 확인했다.

| URL | 활성으로 표시된 항목 | 개수 |
|---|---|---|
| `/` | 홈 (`sidebar-menu-button`) | 1 |
| `/category/Design` | Design (`sidebar-menu-button`) + 배지 파랑/opacity 1 | 1 |
| `/category/Design/Font` | Font (`sidebar-menu-sub-button`, 파랑 + weight 500) | 1 |

항상 **가장 길게 일치하는 하나만** 활성이 된다(부모·자식 동시 활성 없음).

### 2-6. FOUC — 결정적 증거

`sidebar.js`(지연 로드 스크립트)를 **아예 제거한** 사본을 쿠키 `sidebar_state=false` 상태로 로드했다.
결과: `data-sidebar-init="collapsed"`(head 힌트) + wrapper `data-state="collapsed"`(직후 동기 스크립트)만으로
**gap/container 48px · 라벨 `display:none` · 메뉴 버튼 32px** — 즉 **접힌 최종 모습이 파싱 단계에서
이미 확정**된다. 지연 로드되는 어떤 자산도 기다리지 않으므로 폭 점프가 구조적으로 발생할 수 없다.

### 2-7. 빌드 산출물

- `bun run skin:build` (`@tailwindcss/cli` v4.3.3, `--minify`) → `dashboard-skin/tailwind.css` 33KB
- `@theme static`으로 선언해 **트리셰이킹과 무관하게** 모든 토큰이 출력됨을 확인:
  `--spacing` `--radius(-sm/md/lg/xl)` `--text-*` `--leading-*` `--tracking-xs/sm/base`
  `--font-weight-*` `--font-sans` `--default-transition-*` `--shadow-xs` `--color-*` 전부 존재.
- minify 전/후 모두 렌더링 회귀 없음을 재측정으로 확인.

---

## 3. 스펙과 다르게 만든 것 / 스펙에 없던 결정 (전부 사유 명시)

### 3-1. FOUC 방지 스크립트를 **2겹**으로 했다 (스펙 §7-2 확장)

스펙이 지정한 `<head>` 인라인 스크립트 + `html[data-sidebar-init]` CSS는 그대로 구현했지만,
**그것만으로는 폭만 접히고 내부(라벨·그룹 라벨·아이콘 정렬)는 펼친 모습으로 한 프레임 그려진다.**
접힘 표현 규칙들이 전부 `[data-state="collapsed"]`를 조건으로 하는데, 그 속성은 `sidebar.js`가
`DOMContentLoaded` 이후에나 붙이기 때문이다.

→ `sidebar-wrapper` **여는 태그 바로 다음**에 동기 인라인 스크립트를 하나 더 두어
wrapper의 `data-state`를 즉시 심었다(그 시점엔 자식 `<aside>`가 아직 파싱 전이라
"내부가 펼쳐진 모습"이 애초에 존재할 수 없다). 이를 위해 CSS에 **wrapper 레벨 폭 규칙**
(`[data-slot="sidebar-wrapper"][data-state="collapsed"] > … > sidebar-gap/-container`)을
추가했고, 포트 원본의 sidebar 레벨 규칙은 그대로 남겨두었다.

### 3-2. 활성 표시(`data-active`)에 JS를 썼다 (A안의 "JS 무의존"에서 벗어남)

A안(정적 하드코딩)에서는 "지금 어느 카테고리인가"를 마크업만으로 알 방법이 없다
(`[##_body_id_##]`도 페이지 종류만 알려준다). 활성 표시가 **항상 홈에 고정**되면
스펙 §3-3(b)에서 파랑까지 도입해 만든 활성 상태가 무의미해진다.

→ `sidebar.js`의 `initActiveState()`가 `location.pathname`과 각 링크 경로를 비교해
가장 길게 일치하는 하나에만 `data-active="true"` + `aria-current="page"`를 붙인다(약 25줄).
마크업에는 홈이 정적 기본값으로 `data-active="true"`를 갖고 있고 JS가 이를 교정한다.

### 3-3. 검색을 `<s_search>` 치환자 대신 자체 폼으로 만들었다

`[##_search_text_##]`는 서버가 `<input>` 마크업을 직접 생성해 `data-slot`을 붙일 수 없다
(§7-3 카테고리와 같은 제약). 그래서 자체 `<form>` + `data-slot="sidebar-input"`을 쓰고,
제출 시 `/search/{키워드}`로 이동시킨다. **실제 티스토리에서의 동작은 서버 배포 후 재확인 필요.**

### 3-4. `sidebar-group-label`의 자간을 포트와 다르게 했다

포트(components.css 466행)는 `--tracking-sm`이지만 스펙 §5-1 표는 Caption 12/500 →
`--tracking-xs`로 지정한다. **스펙을 따랐다.**

### 3-5. 접힘 상태에서 `overflow: visible`을 열었다

CSS 툴팁(`::after`)이 `sidebar-container`의 `overflow:hidden`에 잘리기 때문이다
(Radix Portal이 없어 DOM 밖으로 빼낼 수 없다). **접힘 상태에 한해서만** container/inner/
content/menu-button의 overflow를 열었다. 펼침 상태의 원본 동작(라벨 말줄임 등)은 그대로다.

### 3-6. `--sidebar-accent-foreground` 다크값 — 소스와 1 단위 차이

스펙 §3-1은 `#8ec5ff`(blue-300)로 명시했으나, Design-system `globals.css` 222행의 실제
`--color-blue-300`은 **`#90c5ff`**다. 스펙이 명시한 hex(대비 계산도 이 값 기준)를 따라
`#8ec5ff`로 선언했다. 육안·대비 차이는 사실상 없으나(둘 다 8.3:1대) 값의 출처가
"Design-system 토큰"이 아니라 "스펙 표의 리터럴"이라는 점을 기록해 둔다.

### 3-7. `sidebar-group-action` 스타일을 추가했다 (스펙 §0 누락표에 없던 항목)

shadcn 원본에는 있는데 포트에도 스펙 누락표에도 없었다. 다음 구역에서 바로 쓸 수 있도록
`menu-action`과 같은 규격으로 **스타일만** 만들어 뒀다(이번 마크업에서는 미사용).

### 3-8. 배지 숫자가 전부 `0`이다

라이브 블로그 실측 결과 현재 발행 글이 0편이다(카테고리 `Design`/`Ai` 모두 0).
꾸며낸 숫자를 넣지 않고 실측값을 그대로 뒀다. 글이 쌓이면 손으로 갱신해야 한다(A안의 비용).

### 3-9. 서브메뉴는 접이식(collapsible)이 아니라 항상 펼침이다

`Design`의 하위(Logo/Font/Figma)는 펼침 상태에서 항상 보이고 접힘 상태에서만 숨는다
(포트 원본 동작). shadcn의 Collapsible 디스클로저는 링크 이동과 토글이 한 요소에서 충돌하고,
항목이 3개뿐이라 이득이 없어 채택하지 않았다. 포트의 `chevron` 회전 규칙은 그대로 남겨 뒀다.

---

## 4. 확인하지 못한 것 (반드시 실제 배포 후 재확인)

티스토리 계정이 없어 **서버 렌더링을 거치는 것은 전부 미검증**이다.

1. **`[##_count_today_##]` / `[##_count_total_##]`** — `<s_sidebar><s_sidebar_element>`를
   `<li>` 안에 중첩해서 넣었다. 티스토리가 이 위치에서도 치환해 주는지 확인 필요.
2. **`/search/{키워드}` 검색 URL** — 표준 패턴이지만 실블로그에서 미확인.
3. **`[##_revenue_list_upper_##]` / `[##_revenue_list_lower_##]`** 광고 컨테이너가
   레이아웃을 깨지 않는지.
4. **티스토리 관리 메뉴바(로그인 시 상단 주입)** 와 `position:fixed` 사이드바의 충돌 여부.
5. **`[##_body_id_##]`** 가 실제로 어떤 값으로 오는지 (활성 표시 로직은 pathname만 쓰므로
   영향은 없지만, 다음 구역에서 페이지 종류 분기에 쓸 수 있다).
6. **스킨 HTML 검사** — 티스토리 저장 시 필수 치환자 누락 검사에 걸리는지.
   현재 최소 세트(`<s_t3>`, `<s_list>`, `<s_article_rep>`, `<s_index_article_rep>`,
   `<s_permalink_article_rep>`, `<s_paging>`)만 넣었고, 댓글(`<s_rp>`)·방명록·커버 블록은
   **다음 구역에서 추가할 예정이라 아직 없다.**

**로컬에서 검증했으나 범위 밖인 것:** 반응형(태블릿/모바일). PC 1440×900만 확인했다.

---

## 5. 다음 구역(header)에 넘기는 것

1. **헤더 높이는 56px로 고정**해야 한다 (스펙 §8-Q3 확정, `sidebar-header`와 밑선 정렬).
2. **`sidebar-trigger`는 이미 스타일이 완성돼 있다** — 지금은 `skin-scaffold-header`에
   임시로 놓여 있으니, 진짜 헤더를 만들 때 그 좌측 끝으로 옮기기만 하면 된다.
3. **`skin-scaffold-*` 세 슬롯은 임시 이름이다** — header/content 구역을 만들 때 걷어낸다.
4. `sidebar-inset`은 `flex:1; min-width:0; flex-direction:column`으로 잡혀 있어
   그 안에 헤더(고정 높이) + 본문(스크롤)을 바로 쌓을 수 있다.
5. `sidebar-menu-action` / `sidebar-group-action` / `sidebar-avatar` 스타일이 이미 준비돼 있다.
6. **마크업을 늘렸으면 `bun run skin:build`를 반드시 다시 실행**한다(Tailwind 스캔 대상 갱신).
7. 반응형 착수 시: `--sidebar-width-mobile`(288px)은 선언돼 있고, 스펙 §7-4/§7-5에
   Sheet 드로어 + `matchMedia` 방향이 적혀 있다.

---

## 6. 참고 스크린샷

`_workspace/sidebar-shots/`

| 파일 | 내용 |
|---|---|
| `sidebar-light-expanded.png` | 라이트 · 펼침 (256px) |
| `sidebar-light-collapsed.png` | 라이트 · 접힘 (48px) |
| `sidebar-collapsed-tooltip.png` | 접힘 상태에서 `Design` 툴팁이 사이드바 밖으로 노출 |
| `sidebar-dark-expanded.png` | 다크 · 펼침 |

> 본문(`sidebar-inset`)이 스타일 없이 보이는 것은 정상이다 — 다음 구역 범위다.
