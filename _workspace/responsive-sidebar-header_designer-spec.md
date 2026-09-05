# 반응형 대응 비주얼 스펙 — Sidebar + Header 구역

작성: 2026-09-05 / 작성자: tistory-skin-designer
대상 파일: `dashboard-skin/components/sidebar.{css,js}`, `dashboard-skin/components/header.css`, `dashboard-skin/skin.html`, `dashboard-skin/src/input.css`
**범위 밖(절대 건드리지 말 것):** `components/content.{css,js}` — Cursor가 병행 작업 중(요구사항 문서 §반응형 진행 상황).

---

## 0. 이 스펙의 실측 근거와 한계 (먼저 읽을 것)

| 근거 유형 | 상태 |
|---|---|
| shadcn 원본 소스 실측 | ✅ 완료 — 이 세션에서 WebFetch로 `sidebar.tsx` / `use-mobile.ts` / `sheet.tsx` / `blocks/sidebar-07/page.tsx` / `blocks/dashboard-01/.../site-header.tsx` 5개를 직접 조회(§2에 원문 인용) |
| 이 프로젝트 현재 코드 실측 | ✅ 완료 — 아래 모든 수치는 실제 CSS 파일의 행 번호와 함께 인용 |
| 브라우저 렌더링 실측(Playwright, 스크린샷) | ❌ **불가 — 이 서브에이전트 세션에 Bash/Playwright MCP 도구가 주어지지 않았다**(사용 가능 도구: Read/Write/Glob/Grep/WebSearch/WebFetch뿐). `bun run skin:build`·`skin:serve`를 실행할 수 없어 `_workspace/responsive-sidebar-header-shots/`를 만들지 못했다. |

따라서 §5의 헤더 폭 문제는 **CSS 값에서 산술로 유도한 예측**이며, "실측"이라고 쓰지 않았다. 구현 담당(tistory-skin-developer)이 반드시 §8의 체크리스트로 브라우저 실측해 확인·정정해야 한다. 예측이 틀렸다면 §5-3 개선안은 그대로 두어도 무해하다(shadcn 정본 자체가 같은 처리를 하므로 — §2-5).

---

## 1. 브레이크포인트 확정값

| 경계 | 값 | 출처(인용) |
|---|---|---|
| 모바일 / 태블릿 | **768px** (모바일 = `max-width: 767px`) | `references/skin-requirements.md` 35행 "반응형 3단: PC / 태블릿 / 모바일. 해상도 **767px 이하부터 모바일**로 전환 — 이 지점부터 사이드바가 접힌다." |
| 태블릿 / PC | **1024px** (태블릿 = `768px ~ max-width: 1023px`) | 같은 문서 75행 "태블릿 브레이크포인트의 정확한 px 값은 … 관례값(**768~1023px**)을 기본으로 제안" |
| 재사용 확정 | — | `references/dashboard-shadcn-requirements.md` 26행 "브레이크포인트는 daitnu-skin-v1.01 때 확정했던 **768px·1024px**를 그대로 재사용 확정 … 이미 content 구역이 자체적으로 써온 `max-width:1023px`/`639px`/`767px` 관례와도 일치한다." |

**content.css 관례와의 정합성 확인(실측):**

| 파일·행 | 미디어쿼리 | 판정 |
|---|---|---|
| `content.css:215` | `max-width: 1023px` (그리드 4열) | ✅ 태블릿/PC 경계 1024px와 일치 |
| `content.css:226` | `max-width: 767px` (content-inner 패딩 16px) | ✅ 모바일/태블릿 경계 768px와 일치 |
| `content.css:220`,`384` | `max-width: 639px` | ⚠️ 3번째 경계(=Tailwind `sm`). content 내부 그리드 전용 세부 분기이며 sidebar/header 정책과 충돌하지 않는다 — **sidebar/header에는 639px 분기를 만들지 않는다.** |
| `widgets.css:219` | `max-width: 1279px` (위젯 전체 숨김) | §6 참조 |
| `header.css:212` | `min-width: 40rem`(=640px, breadcrumb gap 6→10px) | shadcn Breadcrumb 정본이 갖고 있는 `sm:gap-2.5` 그대로 — 손대지 않는다 |

**결론:** sidebar/header가 새로 추가할 미디어쿼리는 **`max-width: 767px`(모바일) 하나뿐**이다. 태블릿(768~1023)은 §4-6의 "기본 상태" 처리 외에 별도 CSS 분기를 만들지 않는다.

---

## 2. shadcn 원본 구조 (2026-09-05 WebFetch 재실측, 원문 인용)

### 2-1. 상수 (`registry/new-york-v4/ui/sidebar.tsx`)
```
const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
```

### 2-2. 모바일 판정 (`hooks/use-mobile.ts`)
```
const mql = window.matchMedia(`(max-width: ${mobileBreakpoint - 1}px)`)
```
기본값 `mobileBreakpoint = 768` → **모바일 = `max-width: 767px`.** 우리 §1 경계와 정확히 동일하다(우연이 아니라 둘 다 동일한 관례값).

### 2-3. 상태 분기 (`SidebarProvider`)
```
const [openMobile, setOpenMobile] = React.useState(false)
const toggleSidebar = React.useCallback(() => {
  return isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open)
}, [isMobile, setOpen, setOpenMobile])
```
핵심 3가지:
1. 모바일 토글은 **`open`(쿠키에 저장되는 데스크톱 상태)을 건드리지 않는다** → 모바일에서 여닫아도 `sidebar_state` 쿠키에 쓰지 않는다.
2. `openMobile` 초기값은 **`false`(닫힘)**.
3. 트리거는 하나이고 분기는 내부에서 일어난다 → **마크업(`SidebarTrigger`)은 데스크톱/모바일 동일.**

### 2-4. 모바일 렌더 분기 (`Sidebar`)
```
<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
  <SheetContent
    data-sidebar="sidebar"
    data-slot="sidebar"
    data-mobile="true"
    className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
    style={{"--sidebar-width": SIDEBAR_WIDTH_MOBILE}}
    side={side}
```
데스크톱 트리는 `"hidden text-sidebar-foreground md:block"` — 즉 **모바일에서는 `sidebar-gap`/`sidebar-container` 트리 자체가 렌더되지 않고, 대신 Sheet가 뜬다.** 그리고 Sheet 안의 사이드바에는 `data-state="collapsed"`/`data-collapsible="icon"`이 **존재하지 않는다** → **모바일 드로어는 언제나 "펼침" 레이아웃**이다(아이콘 레일이 되는 일이 없다). 이 점이 §4-1 설계의 근거다.

`Sheet`(Radix Dialog) 실측(`ui/sheet.tsx`):
- Overlay: `"fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0"`
- Content 공통: `"fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500"`
- `side="left"`: `"inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm"`
  (단 Sidebar는 위 `w-(--sidebar-width)`로 폭을 덮어써 `w-3/4 sm:max-w-sm`은 무효화된다 → **실효 폭 = 18rem**)

### 2-5. 헤더의 반응형 처리 (shadcn 자체 블록 실측)
- `blocks/sidebar-07/page.tsx` — 브레드크럼 선행 항목과 구분자를 **md 미만에서 숨긴다**:
  ```jsx
  <BreadcrumbItem className="hidden md:block"> … </BreadcrumbItem>
  <BreadcrumbSeparator className="hidden md:block" />
  <BreadcrumbItem><BreadcrumbPage>Data Fetching</BreadcrumbPage></BreadcrumbItem>
  ```
- `blocks/dashboard-01/.../site-header.tsx` — 우측 보조 버튼은 `className="hidden sm:flex"`, 패딩은 `px-4 lg:px-6`, gap은 `gap-1 lg:gap-2`.

→ §5의 헤더 개선안은 **우리가 새로 발명한 규칙이 아니라 shadcn 정본이 자기 블록에서 쓰는 바로 그 처리**다.

---

## 3. 이 프로젝트 현재 구현 실측 (반응형 이전 상태)

### 3-1. Sidebar
| 항목 | 값 | 파일:행 |
|---|---|---|
| `--sidebar-width` | `calc(var(--spacing) * 64)` = 16rem = 256px | `sidebar.css:2` |
| `--sidebar-width-icon` | `calc(var(--spacing) * 12)` = 3rem = 48px | `sidebar.css:3` |
| `--sidebar-width-mobile` | `calc(var(--spacing) * 72)` = 18rem = 288px | `sidebar.css:5` — **선언만 돼 있고 어떤 규칙도 이 변수를 참조하지 않는다**(이번 스펙에서 첫 사용) |
| `sidebar-wrapper` | `position:relative; display:flex; width:100%; min-height:100svh` | `sidebar.css:8-12` |
| `sidebar-gap` | `width: var(--sidebar-width)` (접힘 시 icon 폭) — 고정 사이드바의 레이아웃 자리 확보용 | `sidebar.css:21-28, 48-51` |
| `sidebar-container` | `position:fixed; top/bottom/left:0; z-index:10; width:var(--sidebar-width); height:100svh; border-right:1px; overflow:hidden` | `sidebar.css:30-41` |
| 전환 | `transition-property: width, left, right; 200ms linear` | `sidebar.css:69-74` |
| reduced-motion | 위 전환 제거 | `sidebar.css:85-90` |
| 미디어쿼리 | **없음**(`prefers-reduced-motion` 외 0건) | grep 확인 |

**JS(`sidebar.js`) 현재 동작:** 쿠키 `sidebar_state` 읽어 `setSidebarState()`가 ① wrapper에 `data-state="expanded|collapsed"`, ② `[data-slot="sidebar"]`에 같은 `data-state` + `data-collapsible="" | "icon"`, ③ 모든 트리거에 `aria-expanded`를 세팅(42-58행). 토글 경로는 `sidebar-trigger` 클릭(80-86행)과 `Ctrl/Cmd+B`(91-102행) 둘뿐(레일은 2026-09-02에 제거됨). 문서 레벨 `keydown` 리스너가 **이미 하나 있다(91행)** — Escape 처리는 새 리스너를 만들지 않고 여기에 분기를 더한다.

**중요 — 접힘 상태의 내부 레이아웃 규칙이 전부 `[data-slot="sidebar-wrapper"][data-state="collapsed"]`를 기점으로 한다**(`sidebar.css:353-429`: 메뉴 버튼 32×32 정사각·`label`/`meta`/`chevron` `display:none`·group-label 숨김·서브메뉴 숨김, `:711-714` 검색폼 숨김, `:611-613` 배지 숨김, `:572-574` 액션 숨김). 즉 **wrapper의 `data-state`만 "expanded"로 유지하면 드로어 내부는 자동으로 펼침 레이아웃이 된다** — §2-4에서 확인한 shadcn 모바일 동작과 정확히 같은 결과를 얻는다. 이것이 §4-1 상태 모델의 핵심이다.

**툴팁 연동:** 사이드바 4개 항목 툴팁은 `bindTooltip({onlyWhenCollapsed:true})`가 매 hover마다 wrapper의 `data-state`를 확인해 접힘일 때만 연다(요구사항 문서 87행). wrapper가 모바일에서 "expanded"로 고정되면 **툴팁은 자동으로 비활성** — shadcn 원본의 `hidden={state !== "collapsed" || isMobile}` 중 `|| isMobile` 부분이 부작용 없이 재현된다. **추가 코드 불필요.**

### 3-2. Header
| 항목 | 값 | 파일:행 |
|---|---|---|
| `--header-height` | `calc(var(--spacing) * 14)` = 56px | `src/input.css:116` |
| `header` | `position:sticky; top:0; z-index:9; height:var(--header-height); border-bottom` | `header.css:260-273` |
| `header-inner` | `justify-content:space-between; gap:calc(var(--spacing)*3)`(12px); `padding: 0 calc(var(--spacing)*4)`(16px) | `header.css:275-284` |
| `header-start` | `gap:calc(var(--spacing)*2)`(8px); `min-width:0; flex:1 1 auto` | `header.css:286-292` |
| `header-actions` | `gap:calc(var(--spacing)*2)`(8px); **`flex-shrink:0`** | `header.css:298-303` |
| `sidebar-trigger` | 28×28 (`calc(var(--spacing)*7)`) | `sidebar.css:717-731` |
| breadcrumb-list | `flex-wrap:nowrap; min-width:0`; gap 6px(<640px) / 10px(≥640px) | `header.css:306-310, 198-216` |
| `[data-crumb="blog"]` | **`flex-shrink:0`; `max-width: calc(var(--spacing)*40)`(160px)** | `header.css:329-332` |
| separator svg | 14×14 (`calc(var(--spacing)*3.5)`) | `header.css:251-255` |
| 미디어쿼리 | `min-width:40rem` 1건(breadcrumb gap)뿐 | grep 확인 |

**현재 `header-actions` 실제 내용(실측, `skin.html:218-226`) — 요구사항 문서의 서술과 다르다:**
```
[구독하기]  (button, data-variant="default", data-size="sm", class="#subscribe")
[테마 토글] (button, data-variant="outline", data-size="icon-sm" = 32×32)
```
홈/태그/방명록/즐겨찾기 버튼과 우측 하단 테마 FAB(`[data-floating-theme-toggle]`)는 **현재 마크업에 존재하지 않는다**(skin.html 전체 grep 0건; `skin.html.md` 주석 아카이브에만 흔적이 남아 있음). 이번 스펙은 **현재 코드 기준**으로 작성했다.

버튼 치수(`header.css`): `data-size="sm"` = 높이 32px + `padding-inline: calc(var(--spacing)*3)`(12px)씩(`:118-124`), `data-size="icon-sm"` = 32×32(`:167-170`).

### 3-3. 레이아웃 컨테이너
```
sidebar-wrapper (flex)
├─ aside[sidebar]  ├─ div[sidebar-gap]        ← 문서 흐름에서 폭을 차지하는 "유령" 자리
│                  └─ div[sidebar-container]  ← position:fixed, 실제로 보이는 사이드바
└─ main[sidebar-inset]  (flex:1; min-width:0 — sidebar.css:752-759)
   ├─ header (sticky, z:9)
   └─ div[content] > div[content-layout] (flex, align-items:flex-start — widgets.css:8-14)
      ├─ div[content-inner]  (flex:1 1 auto; min-width:0; 자체 스크롤)
      └─ aside[widgets]      (sticky; 320px; max-width 1279px에서 display:none)
```
→ **모바일에서 `sidebar-gap`의 폭을 0으로 만들기만 하면** `sidebar-inset`이 뷰포트 전체를 차지한다. `content-layout`/`content-inner`는 손댈 필요가 없다(둘 다 `flex:1`/`min-width:0`이라 부모 폭 변화를 그대로 흡수한다). **content 구역 파일을 건드리지 않고 sidebar.css만으로 해결된다** — Cursor 작업과 충돌 0.

---

## 4. Sidebar 반응형 스펙

### 4-1. 상태 모델 (shadcn 1:1 대응표)

| 뷰포트 | shadcn | 이 스킨의 구현 | 지속성 |
|---|---|---|---|
| ≥1024px (PC) | `open` state + 쿠키 | 현행 그대로 — wrapper `data-state="expanded"\|"collapsed"` | 쿠키 `sidebar_state` |
| 768~1023px (태블릿) | 동일(md 이상은 전부 데스크톱) | 현행 그대로. **다만 "쿠키가 없을 때의 기본값"만 접힘으로**(§4-6) | 쿠키 |
| ≤767px (모바일) | `openMobile` state + `<Sheet>` | `[data-slot="sidebar"]`에 **`data-mobile-state="open"\|"closed"`** (기본 closed) + wrapper는 **항상 `data-state="expanded"`로 고정** | **저장 안 함**(shadcn `setOpenMobile`과 동일) |

**왜 `data-mobile-state`라는 새 속성인가 (원본과 달라지는 지점 1):**
shadcn은 Sheet가 별도 컴포넌트라 `data-slot="sidebar"`에 `data-mobile="true"` + Radix가 주는 `data-state="open|closed"`를 얹는다. 우리는 **같은 DOM 노드를 데스크톱/모바일이 공유**하는데, 그 노드의 `data-state`는 이미 `"expanded"|"collapsed"`(데스크톱 폭 규칙 `sidebar.css:26-28`이 소비)로 쓰이고 있다. 같은 속성에 `"open"|"closed"`를 덮어쓰면 값이 서로 다른 의미로 섞여 규칙을 읽기 어려워지므로, **열림 상태만 별도 속성으로 분리**했다. `data-mobile="true"`는 shadcn 그대로 병기한다(JS가 모바일 모드일 때 부여 — 디버깅/선택자 의도 표현용).

**왜 wrapper `data-state`를 "expanded"로 고정하는가:**
§3-1에서 확인했듯 접힘 레이아웃(아이콘 32px 정사각·라벨 숨김·검색폼 숨김·배지 숨김)이 전부 wrapper의 `data-state="collapsed"`에 매달려 있다. shadcn 모바일 Sheet에는 그 속성 자체가 없어 **항상 펼침 레이아웃**(§2-4). wrapper를 "expanded"로 고정하면 그 결과가 **규칙 한 줄도 새로 안 쓰고** 그대로 재현되고, 덤으로 툴팁 비활성(§3-1)까지 따라온다.

### 4-2. CSS — `sidebar.css` 끝에 추가할 블록 전문

```css
/* ─────────────────────────────────────────────────────────────
   [RESPONSIVE SPEC §4-2] 모바일(≤767px) 오프캔버스 드로어
   shadcn 원본의 <Sheet side="left"> 재현. Tistory엔 Radix Dialog가
   없으므로 동일한 슬라이드인 + 백드롭을 순수 CSS transition으로 구현.
   ───────────────────────────────────────────────────────────── */

/* 백드롭은 모바일에서만 존재한다(기본 display:none). */
[data-slot="sidebar-backdrop"] {
  display: none;
}

@media (max-width: 767px) {
  [data-slot="sidebar-wrapper"] {
    /* shadcn SheetOverlay의 bg-black/50 리터럴을 토큰으로 승격.
       (원본이 이 한 곳만 토큰 없이 하드코딩하므로 값은 그대로 두고
        이 프로젝트의 "색은 변수로" 규칙만 지킨다) */
    --sidebar-backdrop: color-mix(in oklab, #000 50%, transparent);
  }

  /* (1) 레이아웃 자리 제거 — 사이드바가 문서 흐름에서 완전히 빠진다.
         접힘 쿠키가 남아 있어도 0이 되도록 세 형태 모두 덮는다. */
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"] > [data-slot="sidebar-gap"],
  [data-slot="sidebar-wrapper"][data-state="collapsed"] > [data-slot="sidebar"] > [data-slot="sidebar-gap"],
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"][data-state="collapsed"][data-collapsible="icon"] > [data-slot="sidebar-gap"] {
    width: 0;
  }

  /* (2) 드로어 본체 — 폭은 항상 18rem(접힘 쿠키와 무관), 기본은 화면 밖. */
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"] > [data-slot="sidebar-container"],
  [data-slot="sidebar-wrapper"][data-state="collapsed"] > [data-slot="sidebar"] > [data-slot="sidebar-container"],
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"][data-state="collapsed"][data-collapsible="icon"] > [data-slot="sidebar-container"] {
    width: var(--sidebar-width-mobile);
    z-index: 50;                      /* shadcn SheetContent = z-50 */
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);     /* shadcn SheetContent = shadow-lg */
    transition-property: transform;
    transition-duration: 300ms;       /* 닫힘: data-[state=closed]:duration-300 */
    transition-timing-function: var(--default-transition-timing-function);
  }

  /* (3) 열림 */
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"][data-mobile-state="open"] > [data-slot="sidebar-container"] {
    transform: translateX(0);
    transition-duration: 500ms;       /* 열림: data-[state=open]:duration-500 */
  }

  /* (4) 백드롭 */
  [data-slot="sidebar-backdrop"] {
    display: block;
    position: fixed;
    inset: 0;
    z-index: 40;                      /* header(9) 위, 드로어(50) 아래 */
    background-color: var(--sidebar-backdrop);
    opacity: 0;
    pointer-events: none;
    overscroll-behavior: contain;
    touch-action: none;
    transition-property: opacity;
    transition-duration: 150ms;       /* Radix fade-in-0/fade-out-0 기본 */
    transition-timing-function: var(--default-transition-timing-function);
  }

  [data-slot="sidebar-wrapper"]:has(> [data-slot="sidebar"][data-mobile-state="open"]) [data-slot="sidebar-backdrop"] {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (max-width: 767px) and (prefers-reduced-motion: reduce) {
  [data-slot="sidebar-wrapper"] > [data-slot="sidebar"] > [data-slot="sidebar-container"],
  [data-slot="sidebar-backdrop"] {
    transition: none;
  }
}
```

**특이성 확인(왜 이렇게 장황한 선택자인가):** 기존 폭 규칙 중 가장 강한 것이 `sidebar.css:26` = 속성 5개(0,5,0)다. 미디어쿼리는 특이성을 올려주지 않으므로, 같은 형태의 선택자를 그대로 나열해 **동일 특이성 + 나중 소스 순서**로 이기게 했다. (같은 파일 끝에 추가하므로 순서 조건 충족.)

**JS 실패/실행 전 상태:** 위 규칙은 어떤 JS 속성에도 의존하지 않고(열림 규칙만 `data-mobile-state="open"` 필요) 기본이 "닫힘"이므로, `sidebar.js`가 뜨기 전이나 실패해도 모바일 화면은 **콘텐츠 전체 폭 + 드로어 화면 밖**이라는 정상 상태로 보인다. (드로어를 열 수 없다는 점은 shadcn도 React 없이는 동일하다.)

### 4-3. 신규 토큰 1개

| 토큰 | 값 | 출처 | 반영 위치 |
|---|---|---|---|
| `--shadow-lg` | `0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` | **Design-system `css/globals.css:21162`**("Tailwind v4 기본값으로 전역 보완" 블록) — 추측이 아니라 실측 인용. shadcn `SheetContent`의 `shadow-lg`와 동일 값이다. | `src/input.css`의 `:root` + `@theme static` 두 곳(기존 `--shadow-xs`/`--shadow-md` 154·156행 옆) → `tailwind.css` 재빌드 필요 |

`--sidebar-backdrop`은 `[data-slot="sidebar-wrapper"]` 스코프 지역 변수라 `input.css`에 넣지 않는다(다른 구역이 쓰지 않음).

### 4-4. z-index 순서 (전 구역 실측 + 이번 추가분)

| z-index | 요소 | 파일:행 | 비고 |
|---|---|---|---|
| 1 | `[data-slot="widgets"]` | `widgets.css:35` | ≤1279px에선 `display:none` |
| 1 | `avatar-image` | `content.css:752` | 아바타 내부 |
| 9 | `[data-slot="header"]` | `header.css:272` | sticky |
| 10 | `sidebar-container` (데스크톱) | `sidebar.css:35` | 현행 유지 |
| **40** | **`sidebar-backdrop` (모바일 신규)** | 신규 | header(9)를 덮는다 = shadcn overlay가 화면 전체를 덮는 것과 동일 |
| 50 | `tooltip-content` | `tooltip.css:13` | 사이드바 툴팁은 드로어 내부(=50 스택 안)라 무관. 모바일에선 애초에 안 열림(§3-1) |
| 50 | `dropdown-menu-content` | `content.css:816` | **드로어(50)를 뚫지 않는다** — `content-inner`가 `container-type: inline-size`(`content.css:4`)라 layout containment로 **자체 스택 컨텍스트**를 만들고, 그 안의 50은 밖으로 나올 수 없다. |
| **50** | **`sidebar-container` (모바일)** | 신규 | shadcn `SheetContent` z-50 그대로 |

### 4-5. 마크업 변경 — `skin.html` (딱 1줄 추가)

`</aside>`(현재 183행) **직전**, 즉 `[data-slot="sidebar-container"]`의 닫는 `</div>` 바로 다음에 삽입:

```html
      <!-- [RESPONSIVE SPEC §4-5] 모바일 오프캔버스 백드롭.
           shadcn <SheetOverlay>에 대응. Radix는 Portal로 body 끝에 그리지만
           Tistory 스킨엔 Portal이 없으므로 사이드바 자신의 마지막 자식으로 둔다
           (position:fixed라 flex 레이아웃에는 참여하지 않는다).
           PC/태블릿에서는 display:none이라 존재 자체가 무해하다. -->
      <div data-slot="sidebar-backdrop" data-sidebar-close aria-hidden="true"></div>
```

- 새 업로드 파일 없음(백드롭은 마크업, 스타일은 `sidebar.css`, 동작은 `sidebar.js`) → **README.md의 업로드 파일 목록 변경 없음.**
- `make-preview.mjs` 변경 없음(치환자/반복 태그와 무관한 순수 HTML).
- `tailwind.css`는 §4-3 토큰 추가 때문에 **재빌드해야 한다**(`class=` 변경은 0건이지만 `@theme static` 토큰이 출력에 실린다 — 프로즈 스펙 §7-1 때 확인된 선례).

### 4-6. 태블릿(768~1023px) 정책 — 권고

**shadcn 정본:** md(768) 이상은 전부 데스크톱. 태블릿 전용 중간 단계는 **없다**(§2-2, §2-4).

**이 프로젝트에서의 실제 폭 계산**(브라우저 실측 아님 — CSS 값 산술):

| 뷰포트 | 사이드바 | content-inner 외곽 | 패딩(`content.css:35` 24px×2) 제외 실사용 | ≤1023 그리드 4열 시 1열 폭 | thumb 뷰 2열 시 카드 폭 |
|---|---|---|---|---|---|
| 768 | 펼침 256 | 512 | **464** | 116 | ~232 |
| 768 | 접힘 48 | 720 | **672** | 168 | ~336 |
| 1023 | 펼침 256 | 767 | **719** | 180 | ~360 |
| 1023 | 접힘 48 | 975 | **927** | 232 | ~464 |

(위젯 패널은 1279px 이하에서 숨겨지므로 이 구간에선 계산에 들어가지 않는다 — `widgets.css:219`.)

**권고 = "A+" : shadcn 동작(고정 사이드바 + 트리거로 펼침/접힘)을 그대로 유지하되, 쿠키가 아직 없는 첫 방문에 한해 태블릿에서는 기본값을 "접힘"으로 한다.**

- 근거: 768px에서 펼침이면 카드 1장이 232px까지 눌린다(같은 화면을 접힘으로 두면 336px). 반면 **접힘을 CSS로 강제하면(안 B) 트리거가 눌러도 아무 일이 없는 죽은 버튼이 되어 shadcn의 상태 모델 자체가 깨진다.**
- 그래서 바꾸는 것은 **"기능"이 아니라 "기본값" 하나뿐**이다. 사용자가 태블릿에서 펼치면 쿠키에 저장되고 그 선택이 그대로 존중된다.
- 구현: `skin.html` head의 FOUC 인라인 스크립트(37-41행)와 wrapper 인라인 스크립트(57-66행)에서 **쿠키가 없을 때만** `window.matchMedia("(max-width: 1023px)").matches`면 `collapsed`로 시작. 쿠키가 있으면 지금처럼 쿠키가 이긴다.
- **이것은 shadcn 정본에서의 의도적 이탈이므로 §7에 사유와 함께 기록했다. 오케스트레이터가 "정본 그대로(A)"를 택하면 이 항목만 빼면 되고 나머지 스펙은 영향 없다.**

태블릿 전용 **CSS 미디어쿼리는 추가하지 않는다.**

### 4-7. `sidebar.js` 변경 스펙

기존 구조를 헐지 않고 `initSidebar()` 안에 다음을 더한다.

```
① 모바일 판정 (shadcn useIsMobile 1:1)
   var mqlMobile = window.matchMedia("(max-width: 767px)");

② setMobileOpen(open)
   - sidebar.setAttribute("data-mobile-state", open ? "open" : "closed")
   - triggers().forEach(t => t.setAttribute("aria-expanded", open))
   - 쿠키에 쓰지 않는다            ← shadcn setOpenMobile과 동일(§2-3)
   - 열릴 때: 드로어 첫 포커스 가능 요소로 focus 이동, 직전 포커스 요소를 기억
   - 닫힐 때: 기억해 둔 트리거로 focus 복귀

③ enterMobile() / exitMobile()   ← mqlMobile change 리스너에서 호출
   enterMobile:
     - sidebar.setAttribute("data-mobile", "true")     ← shadcn data-mobile="true"
     - wrapper.setAttribute("data-state", "expanded")  ← 드로어는 항상 펼침 레이아웃(§4-1)
     - sidebar.setAttribute("data-collapsible", "")
     - setMobileOpen(false)                            ← 초기값 닫힘(§2-3)
     - 쿠키는 그대로 둔다(데스크톱 복귀 시 복원해야 하므로)
   exitMobile:
     - data-mobile / data-mobile-state 제거
     - 쿠키를 다시 읽어 setSidebarState(saved !== "false", false) 로 복원

④ 기존 toggleSidebar()에 분기 추가 (shadcn toggleSidebar와 1:1)
   if (mqlMobile.matches) setMobileOpen(현재 닫힘); else 기존 동작;
   → sidebar-trigger 클릭·Ctrl/Cmd+B 두 경로 모두 자동으로 모바일 분기를 탄다
     (둘 다 toggleSidebar()를 호출하므로 새 배선 불필요)

⑤ 닫기 경로
   - 백드롭 클릭: [data-sidebar-close] 클릭 → setMobileOpen(false)
   - Escape: 기존 document keydown 리스너(sidebar.js:91)에 분기 하나 추가.
     새 리스너를 만들지 않는다. content.js:677의 Escape는 드롭다운 전용이라 충돌 없음
     (열려 있는 드롭다운이 없으면 closeAllDropdownMenus()는 무해한 no-op).
   - 사이드바 내부 링크 클릭: 별도 처리 불필요 — Tistory는 SPA가 아니라
     전체 페이지 이동이 일어나므로 드로어가 자연히 사라진다.
```

**접근성(원본과 달라지는 지점 2):** Radix Dialog는 완전한 포커스 트랩 + 배경 `aria-hidden` + 스크롤 락을 제공한다. 바닐라로 전부 재현하려면 상당한 코드가 필요하므로 이번 범위에서는 **부분 구현**한다 — ① 열릴 때 드로어 안으로 포커스 이동, ② 닫힐 때 트리거로 포커스 복귀, ③ `sidebar-container`에 열림 동안 `role="dialog" aria-modal="true"` 부여, ④ 백드롭이 `position:fixed; inset:0`이라 포인터 조작은 물리적으로 차단됨. **Tab 순환 가둠은 구현하지 않는다**(미구현임을 명시). 스크롤 락도 불필요하다 — 이 스킨은 문서가 스크롤되지 않고 `content-inner`가 스크롤러인데, 백드롭이 그 조상이 아니라서 백드롭 위 스크롤/터치가 아래로 새지 않는다(`overscroll-behavior: contain; touch-action: none`로 이중 방어).

---

## 5. Header 반응형 스펙

### 5-1. 폭 산술 (CSS 값 기반 유도 — 브라우저 실측 아님)

고정 소비량:
```
header-inner 좌우 패딩      16 + 16      = 32   (header.css:282)
header-start ↔ actions gap  12           = 12   (header.css:279)
sidebar-trigger             28           = 28   (sidebar.css:722-723)
trigger ↔ breadcrumb gap    8            =  8   (header.css:289)
header-actions              구독하기 A + 8 + 32 = A + 40   (flex-shrink:0 — 절대 안 줄어듦)
```
`구독하기` 버튼 폭 A: `data-size="sm"` → 좌우 패딩 12+12 + 텍스트. Pretendard 14px 한글 4자 ≈ 56px(자간 `--tracking-sm: -0.008em` ≈ -0.45px) → **A ≈ 80px**, 따라서 **header-actions ≈ 120px**.

브레드크럼에 남는 폭:
```
남은폭 = 뷰포트 - 32 - 12 - 120 - 28 - 8 = 뷰포트 - 200
```
브레드크럼이 요구하는 최소 폭(현행 2단):
```
blog crumb  최대 160 (flex-shrink:0! — 절대 안 줄어듦, header.css:329-332)
separator    14                          (header.css:253-255)
gap 6 × 2    12                          (header.css:202, <640px)
────────────────────────────────────
합계        186  + page crumb(0까지 눌림)
```

| 뷰포트 | 남은폭 | 판정 |
|---|---|---|
| 1280 (PC) | 1080 | 여유 |
| 1024 | 824 | 여유 |
| 768 (태블릿 하한) | 568 | 여유(gap이 10px이 되어 최소 194 필요, 그래도 넉넉) |
| **390 (iPhone 12~15)** | **190** | blog crumb 계열이 186을 먹고 **현재 글 제목에 남는 폭 ≈ 4px → 사실상 소멸** |
| **375 (iPhone SE/mini)** | **175** | **186 > 175 → 브레드크럼이 자기 상자를 넘침.** `blog crumb`는 `flex-shrink:0`이고 breadcrumb-list에 `overflow:hidden`이 없어 **구독하기 버튼 쪽으로 텍스트가 밀려 겹칠 수 있다** |
| **360 (Galaxy S 계열)** | **160** | 위와 동일, 26px 초과 |

**⚠️ 예측 결론: 약 386px 미만에서 헤더 좌측 브레드크럼이 우측 액션과 충돌한다.** 390px에서도 여유가 4px뿐이라 실측 A값이 84px만 돼도 곧바로 깨진다. 국내 사용자 다수가 360~390px라 실사용 영향이 크다.
(단, `header.js:19-23`이 "현재 글 제목 == 블로그 제목"일 때 blog crumb을 숨기므로 **인덱스 페이지에서는 문제가 드러나지 않는다** — 글 상세/카테고리 페이지에서만 재현된다. 실측 시 반드시 permalink 목업으로 확인할 것.)

### 5-2. 추가 리스크(실사이트 미검증)
`구독하기` 버튼은 `class="#subscribe"`(Tistory 플랫폼 훅)라 **실사이트에서 티스토리가 내부 텍스트/아이콘을 바꿔치기할 가능성**이 있다(예: 아이콘 추가, "구독중" 표기). 그러면 A가 커져 위 임계값이 더 나빠진다. 계정이 없어 확인 불가 — Q4에 올린다.

### 5-3. 개선 스펙 (`header.css` 끝에 추가)

```css
/* ─────────────────────────────────────────────────────────────
   [RESPONSIVE SPEC §5-3] 모바일(≤767px) 헤더
   shadcn 정본이 자기 블록에서 쓰는 처리를 그대로 따른다:
   blocks/sidebar-07/page.tsx —
     <BreadcrumbItem className="hidden md:block"> / <BreadcrumbSeparator className="hidden md:block" />
   즉 선행 크럼(블로그 제목)과 구분자는 md(768) 미만에서 숨기고
   현재 페이지 크럼만 남긴다.
   ───────────────────────────────────────────────────────────── */
@media (max-width: 767px) {
  [data-slot="header"] [data-crumb="blog"],
  [data-slot="header"] [data-slot="breadcrumb-separator"] {
    display: none;
  }
}
```

- 이것만으로 브레드크럼 가용폭이 190 → **190px 전부가 현재 글 제목**으로 돌아가고, 제목은 기존 `text-overflow: ellipsis`(`header.css:320-326`)로 자연스럽게 잘린다. 360px에서도 160px 확보 → 충돌 소멸.
- **`header.js`는 수정하지 않는다.** 지금도 인덱스 페이지에서 blog crumb에 인라인 `display:none`을 넣는데(19-23행), CSS의 `display:none`과 결과가 같아 충돌하지 않는다. 인라인 스타일이 미디어쿼리보다 우선하지만 **양쪽 다 숨김**이므로 무해하다.
- **`header-actions`는 변경하지 않는다** — 현재 구성이 "구독하기(주 CTA) + 테마 토글" 둘뿐이라 shadcn `hidden sm:flex`로 숨길 만한 *보조* 버튼이 없다. 둘 다 모바일에서 오히려 더 필요한 기능이다.
- **`header-inner` 패딩(16px)도 변경하지 않는다** — `content.css:226-228`이 ≤767px에서 content-inner 패딩을 16px로 낮추므로, 헤더 16px과 본문 16px의 좌측 정렬선이 정확히 맞는다(shadcn `px-4 lg:px-6`의 모바일 값도 16px로 동일).
- 헤더 높이 56px, sticky, z-index 9 전부 **현행 유지**.

### 5-4. 태블릿(768~1023) 헤더
남은폭 568px로 여유가 충분하다 → **변경 불필요.** shadcn의 md 임계값과 정확히 같은 지점에서 브레드크럼 2단이 유지된다.

---

## 6. Right-widgets 정합성 판정

**현행 유지.** `widgets.css:219` `@media (max-width: 1279px) { display: none }`은 이번 정책과 모순되지 않는다 — 1280px는 768/1024와 경쟁하는 "3단 경계"가 아니라 **320px 패널을 얹을 수 있는 최소 폭**이라는 별개 기준이며, 결과적으로 태블릿·모바일에서는 위젯이 이미 사라져 §4·§5의 폭 계산에 아무 영향을 주지 않는다(§4-6 표에서 확인). 모바일 드로어가 열릴 때도 위젯은 이미 `display:none`이라 z-index 경합 대상조차 아니다. **별도 스펙 불필요.**

---

## 7. Tistory / 바닐라 환경 제약으로 shadcn 원본과 달라지는 부분

| # | 원본 | 이 스킨 | 사유 |
|---|---|---|---|
| 1 | 모바일에서 데스크톱 트리(`sidebar-gap`/`sidebar-container`)를 **언마운트**하고 `<Sheet>`를 별도로 렌더 | 같은 DOM을 유지한 채 미디어쿼리로 **모드 전환** | React가 없어 조건부 언마운트가 불가능. Tistory는 서버가 skin.html을 한 번 그리고 끝이므로 두 트리를 모두 마크업에 둘 수도 없다(중복 콘텐츠·중복 id) |
| 2 | Radix가 주는 `data-state="open\|closed"` | **`data-mobile-state="open\|closed"`** 신설 (`data-mobile="true"`는 원본 그대로 병기) | #1 때문에 같은 노드의 `data-state`가 이미 `"expanded\|collapsed"`로 점유돼 있음(§4-1) |
| 3 | `<SheetOverlay>` (Portal → body 끝) | `[data-slot="sidebar-backdrop"]`을 `<aside data-slot="sidebar">`의 마지막 자식으로 정적 배치 | Portal이 없음. `position:fixed`라 시각 결과는 동일하고, z-index(백드롭 40 < 드로어 50)로 순서를 명시해 DOM 순서 의존을 없앰 |
| 4 | Radix Dialog의 포커스 트랩 / 배경 `aria-hidden` / 스크롤 락 | 포커스 이동·복귀 + `role="dialog" aria-modal="true"`만. **Tab 순환 가둠 미구현** | 바닐라로 전부 재현하려면 별도 유틸이 필요. 이번 범위를 넘어서므로 **미구현임을 명시**(부분 구현). 스크롤 락은 이 스킨 구조상 불필요(§4-7) |
| 5 | `animate-in/out` 유틸리티(keyframes) | `transition: transform` / `transition: opacity` | Tailwind animate 플러그인을 쓰지 않는 정적 CSS 환경. **지속시간(열림 500ms / 닫힘 300ms / 백드롭 150ms)과 이징은 원본 값 그대로** |
| 6 | md 이상은 태블릿 구분 없이 동일 | 태블릿(768~1023)에서 **쿠키가 없을 때의 기본값만** 접힘 | 이 스킨은 shadcn 데모와 달리 본문이 카드 그리드라 768px 펼침 시 카드가 232px까지 눌린다(§4-6 계산). **기능이 아니라 기본값만 바꾼 것**이며 트리거·쿠키 동작은 정본 그대로 — 오케스트레이터 판단으로 되돌릴 수 있는 단일 항목 |
| 7 | `shadow-lg` 유틸리티 | `--shadow-lg` 토큰 신설 후 `var()` | 이 프로젝트는 색·그림자를 전부 변수로 관리. 값은 Design-system `globals.css:21162`에서 실측 인용(추측 없음), shadcn `shadow-lg`와 동일 값 |
| 8 | `useIsMobile()` (matchMedia + React state) | `window.matchMedia("(max-width: 767px)")` + `change` 리스너 | 훅이 없을 뿐 판정식·임계값은 완전히 동일(§2-2) |

---

## 8. 구현자(tistory-skin-developer)가 Playwright로 실측 확인할 것

이 스펙은 브라우저 실측을 하지 못했다(§0). 아래는 **반드시** `bun run skin:build && bun run skin:preview && bun run skin:serve`(4321) 후 확인하고 결과를 검증 문서에 남길 것. 스크린샷은 `_workspace/responsive-sidebar-header-shots/`에.

**Header (가장 중요 — §5-1 예측 검증)**
1. **수정 전** 목업(permalink, 블로그 제목 ≠ 글 제목)에서 360/375/390px 각각의 `[data-crumb="blog"]`·`[data-slot="breadcrumb-page"]`·`[data-slot="header-actions"]`의 `getBoundingClientRect()`를 찍어 **실제 겹침 여부와 임계 뷰포트**를 확정(예측: ~386px). `header-actions`의 실제 폭 A도 실측해 §5-1 표를 정정할 것.
2. 수정 후 360/375/390에서 겹침 0, `document.scrollingElement.scrollWidth === window.innerWidth`(가로 오버플로 0).
3. 인덱스 목업(글 제목 == 블로그 제목)에서 `header.js` 인라인 숨김과 CSS 숨김이 겹쳐도 회귀 없음.
4. 768/1024/1280에서 브레드크럼 2단이 그대로 보임(회귀 없음).

**Sidebar 모바일 드로어**
5. 390px: 최초 로드 시 드로어가 화면 밖(`translateX(-100%)`), `sidebar-gap` 폭 0, `sidebar-inset`이 뷰포트 전체 폭.
6. 트리거 클릭 → 288px 드로어 슬라이드인 + 백드롭 fade-in, `aria-expanded="true"`.
7. **쿠키가 `false`(접힘) 상태로 모바일 진입해도** 드로어 내부가 **펼침 레이아웃**(라벨/검색폼/배지가 보이고 아이콘 32px 정사각이 아님)인지 — §4-1의 핵심 가정 검증.
8. 백드롭 클릭 / Escape 각각으로 닫힘, 포커스가 트리거로 복귀.
9. 드로어 열린 상태에서 **헤더가 백드롭에 덮이는지**(z-index 40 > 9), 드로어는 백드롭 위인지.
10. 모바일에서 여닫아도 `document.cookie`의 `sidebar_state`가 **변하지 않는지**(§2-3).
11. 모바일에서 사이드바 항목 hover/focus 시 **툴팁이 열리지 않는지**(§3-1 가정 검증).
12. 뷰포트를 390 → 1024 → 390으로 리사이즈하며 `matchMedia` 리스너가 모드를 정확히 갈아타는지(데스크톱 복귀 시 쿠키 상태 복원, 모바일 복귀 시 닫힘 초기화).
13. 드로어 내부 `sidebar-content` 스크롤이 Lenis로 정상 동작하고 백드롭 위 스크롤이 뒤로 새지 않는지.
14. `prefers-reduced-motion: reduce`에서 슬라이드/페이드 없이 즉시 전환.
15. 라이트/다크 각각 스크린샷(390 / 768 / 1024 / 1280).
16. 콘솔 에러 0(목업 서버 `favicon.ico` 404는 기존 알려진 항목).

**태블릿**
17. 768/1023px에서 사이드바가 **고정 사이드바**로 남고(드로어 아님) 트리거가 펼침/접힘을 정상 토글하는지.
18. 쿠키 삭제 후 768px 첫 진입 시 접힘으로 시작(§4-6 채택 시), 1280px 첫 진입 시 펼침으로 시작.

**회귀**
19. 1280px 이상에서 sidebar/header 모두 변경 전과 픽셀 동일(특히 접힘 아이콘 중심 x=23.5 — 과거 2회 회귀했던 지점).
20. `widgets.css:219` 그대로 1279px 이하 위젯 숨김 유지.

---

## 9. 확인 필요 (오케스트레이터/사용자 판단)

| # | 질문 | 스펙 저자 제안 |
|---|---|---|
| Q1 | 태블릿(768~1023) 기본값을 접힘으로 바꿀 것인가(§4-6 A+), 아니면 shadcn 정본 그대로 쿠키 없으면 펼침(A)인가? | **A+ 채택 권고.** 768px 펼침 시 카드가 232px까지 눌리는 반면(§4-6 표), 바꾸는 것은 기본값 하나뿐이고 트리거·쿠키 동작은 정본 그대로다 |
| Q2 | 드로어 전환 속도를 shadcn Sheet 그대로(열림 500ms / 닫힘 300ms)로 할 것인가? 이 스킨의 다른 전환은 200ms linear(사이드바 폭)·150ms(기본)라 상대적으로 느리게 느껴질 수 있다 | **원본 값 그대로 채택 권고**(500/300). 오프캔버스는 이동 거리가 288px로 커서 200ms면 튕기듯 보인다. 느리다고 판단되면 300/300으로 낮추는 1줄 변경 |
| Q3 | 포커스 트랩 완전 구현(Tab 순환 가둠)을 이번 범위에 넣을 것인가? | **미구현 유지 권고**(§7 #4). 포커스 이동/복귀 + `aria-modal` + 백드롭 차단으로 실사용 문제는 없고, 완전 트랩은 별도 유틸이 필요해 범위가 커진다 |
| Q4 | `구독하기` 버튼(`class="#subscribe"`)을 티스토리가 실사이트에서 어떻게 렌더하는가(텍스트/아이콘 치환 여부)? | **계정이 없어 확인 불가.** §5-3 수정으로 브레드크럼 여유가 190px 생기므로 A가 다소 커져도 안전하지만, 실사이트 확인 시 재측정 권고 |
| Q5 | 모바일에서 사이드바 링크 클릭 시 드로어를 명시적으로 닫을 것인가? | **불필요 판정.** Tistory는 전체 페이지 이동이라 자연히 사라진다(shadcn도 Sheet를 자동으로 닫지 않는다) |
