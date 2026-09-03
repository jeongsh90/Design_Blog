# 대시보드형 shadcn/ui 스킨 요구사항 (2차 — 현재 방향, 유일한 근거 문서)

사용자가 2026-09-01에 방향을 전환하며 전달한 요구사항. 1차 문서(`skin-requirements.md`, daitnu-skin-v1.01 리스킨)는 폐기됐다 — 이 문서가 이제 유일한 근거다.

## 핵심 방향 전환

- **"기존 잔재 속성들 모두 제거"** — daitnu-skin-v1.01을 베이스로 삼지 않는다. 처음부터 새로 만든다(greenfield). 단, Tistory 템플릿 태그 문법·index.xml 구조에 대한 지식은 `skin-requirements.md`에 남아 있으니 "Tistory 자체의 제약"을 확인할 땐 참고한다.
- **블로그를 "대시보드 느낌"으로 만든다.** 읽는 콘텐츠 중심의 전통적 블로그 UI가 아니라, 사이드바+헤더+콘텐츠 영역으로 구성된 앱형 대시보드 레이아웃을 지향한다.
- **기술 방식: Tailwind CSS + shadcn/ui.** shadcn/ui가 실제로 생성하는 컴포넌트와 "동일한 방식"으로 만든다 — 임의로 비슷하게 흉내 내는 게 아니라:
  - **모든 속성은 변수 처리** — 색상/치수를 하드코딩하지 않고 CSS 커스텀 프로퍼티로 정의(shadcn 최신 버전은 `oklch()` 색공간 사용)
  - **데이터 슬롯(`data-slot`)** — shadcn이 모든 프리미티브에 붙이는 `data-slot="컴포넌트명"` 속성을 스타일링·상태 훅으로 그대로 사용
  - **여백은 `calc(var(--spacing) * n)`** — Tailwind v4의 스페이싱 스케일 방식. `--spacing` 기본값은 `0.25rem`이고, 모든 padding/margin/gap 유틸리티가 이 변수의 배수로 계산된다

## 배포 방식 (중요 — 1차와 다름)

1차(daitnu-skin-v1.01 리스킨)는 "스킨 패키지 zip 등록"이었지만, 2차는 다르다:

- **경로:** 티스토리 관리자 → 꾸미기 → **스킨 편집 → HTML 편집 → 파일 업로드** (`https://daitnu.tistory.com/manage/design/skin/edit#/source/file`)
- 이 화면은 skin.html/style.css 외에 **임의의 추가 파일(CSS/JS/이미지 등)을 업로드**해 skin.html에서 상대경로로 참조할 수 있게 해주는 티스토리 스킨 편집기의 파일 관리 영역이다.
- 사용자가 원하는 파일 구성: **`tailwind.css`**(빌드된 Tailwind 산출물), **컴포넌트별 CSS 파일**, **컴포넌트별 JS 파일**을 이 화면에 개별 업로드.
- **Tailwind는 로컬에서 빌드해 정적 CSS로 업로드한다** — Tistory에 Node/빌드 파이프라인이 없으므로, 이 프로젝트(`D:\MyCloud\Design_Blog`) 안에 Tailwind v4 CLI(`@tailwindcss/cli`, bunx로 실행 가능 — `bun`/`node`/`npx` 로컬에 설치 확인됨)로 스킨 마크업을 스캔해 필요한 유틸리티만 담은 `tailwind.css`를 생성하는 로컬 빌드 절차가 필요하다. React/Next 런타임은 만들지 않는다 — 스캔 대상은 순수 HTML(skin.html) + 컴포넌트 조각들이다.

## 레이아웃 원칙

1. **전체 화면 100vw 사용** — 블로그 콘텐츠를 가운데 좁은 칼럼에 가두는 전통적 블로그 레이아웃이 아니라, 뷰포트 전체 폭을 쓰는 대시보드 레이아웃.
2. **PC 화면 먼저 구성 → 그다음 반응형.** 지금까지의 통상적 "모바일 퍼스트"와 반대다 — 데스크톱 완성도를 먼저 확정하고 태블릿/모바일 대응은 다음 단계로 미룬다. (참고: 이전 daitnu-skin-v1.01 리스킨 때 확정했던 브레이크포인트 768/1024는 폐기하지 않고 재사용 후보로 남겨두되, PC 작업이 끝나기 전까지는 적용하지 않는다.)

## 작업 진행 방식 — 구역(컴포넌트)별 순차 진행

사용자가 명시: **"일단 구역별 하나씩 만들어갈테니"** — 한 번에 전체 대시보드를 설계·구현하지 않는다. shadcn/ui 컴포넌트 하나씩(예: sidebar → header → content area → ...) 순서대로 요청받아 그때그때 만든다. 오케스트레이터는 이 요청 방식에 맞춰 **컴포넌트 단위 반복 루프**로 동작한다(`tistory-skin-orchestrator` SKILL.md의 "구역별 루프" 절 참고) — 매번 전체 스킨을 다시 설계하지 않고, 이미 완성된 구역은 그대로 둔 채 새 구역만 추가한다.

## shadcn/ui 컴포넌트를 "똑같이" 포팅하는 원칙

사용자가 각 구역마다 `bunx --bun shadcn@latest add <component>`를 언급하며 "**똑같이 만들어**"라고 요청한다 — 임의로 비슷한 걸 새로 디자인하는 게 아니라, **shadcn/ui의 실제 공식 컴포넌트 소스를 그대로 참고해 동일한 구조로 포팅**해야 한다는 뜻이다.

- React가 없는 환경(Tistory 정적 스킨)이라 shadcn의 `.tsx` 소스를 그대로 쓸 수 없다 — DOM 구조·클래스명·CSS 변수·`data-slot` 값·상태 전환 로직(React state → data attribute 토글)을 **1:1 대응**시켜 순수 HTML+CSS+바닐라 JS로 다시 짠다.
- 소스는 추측하지 않는다 — 매 컴포넌트 작업 시작 전에 WebFetch로 `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/{component}.tsx`(또는 공식 문서)를 실제로 읽어 최신 구조를 확인한다.

### Sidebar 컴포넌트 — 실측 레퍼런스 (2026-09-01 WebFetch로 확인)

첫 구역으로 요청받은 컴포넌트. `bunx --bun shadcn@latest add sidebar`가 실제로 설치하는 `sidebar.tsx` 실측 내용:

**export되는 하위 컴포넌트 (18개):** `SidebarProvider`, `Sidebar`, `SidebarTrigger`, `SidebarRail`, `SidebarInset`, `SidebarInput`, `SidebarHeader`, `SidebarFooter`, `SidebarSeparator`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `useSidebar`

**CSS 변수:**
- `--sidebar-width`(기본 16rem) / `--sidebar-width-icon`(3rem) / `--sidebar-width-mobile`(18rem, 모바일 Sheet 전용)
- `--sidebar-border`, `--sidebar-ring`, `--sidebar-accent`, `--spacing`(패딩 계산용)

**data-slot 값 (일부):** `sidebar-wrapper`, `sidebar`, `sidebar-gap`, `sidebar-container`, `sidebar-inner`, `sidebar-trigger`, `sidebar-rail`, `sidebar-inset`, `sidebar-input`, `sidebar-header`, `sidebar-footer`, `sidebar-separator`, `sidebar-content`, `sidebar-group`, `sidebar-group-label`, `sidebar-group-action`, `sidebar-group-content`, `sidebar-menu`, `sidebar-menu-item`, `sidebar-menu-button`, `sidebar-menu-action`, `sidebar-menu-badge`, `sidebar-menu-skeleton`, `sidebar-menu-sub`, `sidebar-menu-sub-item`, `sidebar-menu-sub-button`

**상태 data 속성:**
- `data-state="expanded"|"collapsed"`
- `data-collapsible="offcanvas"|"icon"|"none"`
- `data-variant="sidebar"|"floating"|"inset"`
- `data-side="left"|"right"`

**동작 로직 (바닐라 JS로 포팅 필요):**
- 쿠키 `sidebar_state`(7일, `path=/`)로 펼침/축소 상태 저장·복원 — React useState 대신 쿠키 읽기 + `data-state` 속성 토글로 구현
- 키보드 단축키 `Cmd+B`/`Ctrl+B`로 토글(`event.metaKey || event.ctrlKey`, `event.key === 'b'`)
- 데스크톱(`md:` 이상)은 고정 사이드바(`data-slot="sidebar-gap"`로 레이아웃 여백 확보 + `sidebar-container`가 `fixed inset-y-0`), 모바일은 Sheet(오프캔버스 드로어)로 전환 — Tistory 환경엔 shadcn `Sheet`가 없으므로 동일한 슬라이드인 애니메이션+백드롭을 바닐라 CSS transition으로 재현
- `icon` collapsible 모드일 때 gap 너비가 `calc(3rem + 1rem)`(floating/inset) 또는 `3rem`(기본)으로 계산됨
- 축소 시(`group-data-[collapsible=icon]`) `SidebarMenuSub` 완전 숨김, `SidebarGroupLabel` 마진/투명도 변화, 액션 버튼들 숨김
- `SidebarMenuButton`에 `tooltip` prop을 주면 축소 상태에서만 툴팁 노출(`hidden={state !== "collapsed" || isMobile}`)
- 접근성: `aria-label="Toggle Sidebar"`, `sr-only` 텍스트, `focus-visible:ring-2`, Rail은 `tabIndex={-1}`

**shadcn 전역 색상 토큰 (globals.css 실측, oklch 색공간):**
- `:root`(라이트): `--background: oklch(1 0 0)`, `--foreground: oklch(0% 0 0)`, `--primary: oklch(0% 0 0)`, `--secondary`/`--accent: oklch(0.97 0 0)`, `--destructive: oklch(0.577 0.245 27.325)`, `--border: oklch(0.922 0 0)`, `--sidebar: oklch(0.985 0 0)`
- `.dark`: 동일 변수명에 어두운 oklch 값
- `--radius: 0.625rem`, 파생값은 `@theme inline`에서 `--radius-sm: calc(var(--radius) * 0.6)` 등으로 계산
- `@theme inline` 블록이 `--color-background: var(--background)`처럼 raw 토큰을 Tailwind 유틸리티가 소비하는 `--color-*` 네임스페이스로 매핑 — 이 패턴을 그대로 따른다

**색상 값 자체는 이 프로젝트의 소스를 우선한다:** 위 shadcn 기본값은 구조·명명 규칙 참고용이고, 실제 색상 값은 `D:\MyCloud\2026포트폴리오\Design-system`(oklch가 아니라 기존 hsl/hex 기반일 수 있음 — 변환 필요)에서 가져온다. `--sidebar-foreground`/`--sidebar-primary`/`--sidebar-primary-foreground`/`--sidebar-accent-foreground` 등 sidebar 전용 변수도 shadcn 명명 규칙 그대로 만들되 값은 Design-system 팔레트에서 매핑한다.

## 다음 구역 대기열

사용자가 다음 요청을 줄 때마다 이 섹션에 추가한다. 현재:
1. **Sidebar** — ✅ 완료(`dashboard-skin/`, 스펙 `_workspace/sidebar_designer-spec.md`, 검증 `_workspace/sidebar_developer-verification.md`). PC 뷰포트만, 반응형은 미구현. header 구역에서 이어받을 것: 헤더 높이 56px 고정, `sidebar-trigger`는 완성 상태로 `skin-scaffold-header`에 임시 배치돼 있음(옮기기만 하면 됨), `skin-scaffold-*` 임시 슬롯 3개는 header 작업 때 걷어낼 것.
   - **2026-09-03 후속 수정 — 접힘 상태 4개 항목(브랜드 로고/Design/Ai/방문자 수) 툴팁을 자체 CSS `::after`에서 Tooltip 프리미티브로 교체.** "접힌 사이드메뉴도 툴팁으로 적용" 요청 — 헤더 우측 4개 버튼에 먼저 도입했던 실제 Tooltip 컴포넌트를 재사용한다. 여기서 헤더/사이드바 두 구역이 같은 프리미티브를 쓰게 되어 Tooltip CSS/JS를 `header.css`/`header.js`에서 독립 파일(`components/tooltip.css`, `components/tooltip.js`)로 추출했다(Button/Breadcrumb에 이미 있던 "다른 구역이 쓰기 시작하면 추출한다" 원칙 적용) — `skin.html`이 두 파일을 로드하는 첫 번째 스타일시트/스크립트로 올려둔다. 마크업은 헤더와 다른 패턴이다: 헤더는 shadcn 원본 그대로 `[data-slot="tooltip"]` 래퍼 안에 트리거+콘텐츠를 넣지만, sidebar.css의 배지·활성 표시 규칙(`[data-slot="sidebar-menu-item"]:has(> …) > [data-slot="sidebar-menu-button"]`류)이 버튼을 menu-item의 **직계 자식**으로 요구해서 감싸면 그 관계가 깨진다 — 대신 래퍼 없이 `data-tooltip` 속성으로 트리거를 표시하고 `[data-slot="tooltip-content"]`를 형제로 두는 두 번째 패턴을 `tooltip.js`의 `initTooltips()`에 추가했다(menu-item은 이미 `position:relative`라 새 포지셔닝 컨텍스트도 필요 없음). 접힘 상태에서만 열리도록 `bindTooltip({onlyWhenCollapsed:true})`가 `sidebar-wrapper`의 `data-state`를 매 hover마다 확인 — 펼침에서는 라벨이 이미 보이므로 열리지 않는다(shadcn 원본의 `hidden={state !== "collapsed"}`와 동일한 의도, CSS가 아니라 JS로 판정). side="right" 고정이라 헤더 쪽에 추가했던 `data-align` 뷰포트 경계 보정은 필요 없다(sidebar는 화면 왼쪽 가장자리에서 오른쪽으로만 열림). 기존 `[data-tooltip]::after` 규칙과, 그것을 위해 열어뒀던 `sidebar-menu-button` 자신의 `overflow:visible`은 더 이상 필요 없어 제거(container/inner/content 3개 조상의 overflow:visible 오버라이드는 tooltip-content가 여전히 그 안에 있어 유지). Playwright로 4개 항목 hover(브랜드/Design/Ai/방문자 수) + 펼침 상태에서는 열리지 않음 + 헤더 4개 버튼 회귀 없음까지 확인.
   - **2026-09-03 추가 수정 — 헤더 4개 버튼과 sidebar 4개 항목의 툴팁 등장 속도 불일치.** 사용자가 스크린샷으로 지적("사이드메뉴 툴팁과 헤더 툴팁 등장속도가 다른데?") — 헤더 툴팁 래퍼(`[data-slot="tooltip"]`)엔 `data-delay-duration="300"`이 있었는데 sidebar의 패턴 B(래퍼 없음)는 그 속성을 읽을 대상 자체가 없어 항상 지연 0(즉시)이었다. "사이드메뉴 툴팁 기준으로 맞춰" 요청에 따라 헤더 4개의 `data-delay-duration="300"`을 제거해 둘 다 지연 0으로 통일 — `performance.now()` 기반 실측으로 hover 후 `data-state="open"`까지 헤더 0.3ms/sidebar 0.2ms(사실상 동시)임을 확인.
   - **2026-09-03 추가 수정 — 푸터 방문자 수를 펼침 상태에서 카드 2장(Today/Total) 1행으로 재구성, 접힘 상태는 그대로 유지.** "카드형태로 1행으로 나열, 접힌상태에서는 현재상태 유지" 요청 — 접힘(아이콘+hover tooltip)과 펼침(카드) 두 표현이 완전히 다른 마크업이라(shadcn 원본의 `tooltip` prop처럼 라벨 하나만 접었다 폈다 하는 정도가 아님) `<li data-footer-stat="collapsed">`(기존 그대로, 라벨 span만 제거 — 접힘에서 어차피 안 보이던 것)와 `<li data-footer-stat="expanded">`(신규 `sidebar-stat-row`/`sidebar-stat-card` 2장) 두 개를 나란히 두고 `sidebar-wrapper`의 `data-state`로 정확히 하나만 보이게 하는 CSS 스위치를 추가했다. 카드 자체는 Design-system Card(`components.css` 6278행, bg-card/radius-xl/링 섀도)를 그대로 쓰기엔 사이드바 16rem 폭에 과해서, 배경·보더·radius "언어"만 sidebar 전용 토큰(`--color-sidebar-accent`/`-border`)으로 축소 재구성한 미니 카드로 만들었다(Card 컴포넌트 자체를 포팅하지 않음 — 이 프로젝트의 "그대로 포팅" 원칙은 shadcn 정본 컴포넌트에 한하고, 이 스탯 카드는 원래 shadcn sidebar 스펙에 없는 이 프로젝트 전용 확장이라 무리해서 전체 Card를 끌어올 이유가 없다고 판단). Playwright로 펼침(카드 2장 1행)·접힘(아이콘+hover tooltip, 이전과 동일)·라이트다크·가로 오버플로 0 전부 확인.
2. **Header** — ✅ 완료(스펙 `_workspace/header_designer-spec.md`, 검증 `_workspace/header_developer-verification.md`). `Design-system/index.html`(292~319행) + `css/layout.css`(23~64행) 구조를 그대로 이식(`header`/`header-inner`/`header-start`/`header-actions`, 56px, `border-bottom`). `header-start`에 `sidebar-trigger`(28px, shadcn `size-7` 유지) + 2단 브레드크럼(`[##_title_##]`/`[##_page_title_##]`). Button·Breadcrumb 컴포넌트가 `components/header.css`에 함께 포팅됨(공용 프리미티브 — 다른 구역이 쓰기 시작하면 `button.css`로 추출). `skin-scaffold-*` 임시 슬롯 3개 전부 제거.
   - **2026-09-02 후속 수정 4건(소규모라 designer/developer 분리 없이 진행):**
     a) 사이드바 푸터의 다크/라이트 토글 버튼 제거(방문자 수 통계는 유지) + 헤더 우측 끝에 `data-variant="default"` 즐겨찾기 버튼 신규 추가(별 아이콘, 클릭 시 `localStorage`(`dashboard-skin:favorites`)에 현재 경로 저장/해제 — 즐겨찾기 "목록"을 모아보는 화면은 아직 없음, content 구역 이후 과제).
     b) 테마 토글을 헤더 밖으로 빼서 **화면 우측 하단 고정(FAB)**으로 재배치 — `[data-floating-theme-toggle]`, `position:fixed; right/bottom: calc(var(--spacing)*6); border-radius:9999px; box-shadow:var(--shadow-md)`(신규 토큰, `src/input.css`). 사이드바 푸터·헤더 양쪽에 있던 테마 토글은 이제 이 FAB 하나로 통합됨.
     c) 사이드바 "둘러보기"(홈/태그/방명록) 그룹 전체 제거 — 헤더 우측 버튼 3개와 완전히 중복이라 정리. 검색 바로 아래 구분선만 남기고 아카이브로 이어짐. `initActiveState()`(sidebar.js)는 DOM을 매번 다시 훑는 방식이라 손댈 필요 없이 그대로 정상 동작.
     d) **사이드바 우측 레일 클릭 접힘 제거(2026-09-02)** — shadcn `SidebarRail`(`data-slot="sidebar-rail"`, 우측 경계의 16px 히트영역 + `cursor:w-resize`/hover 세로선)을 마크업·CSS·JS에서 전부 삭제. 사용자가 "사이드메뉴 오른쪽 모서리 클릭 시 접히는 기능 제거"를 요청 — shadcn 정본에서 의도적으로 이탈한 지점이다. 남은 토글 경로는 `sidebar-trigger` 클릭과 `Ctrl`/`Cmd`+`B` 두 가지뿐이며, 우측 경계선은 `sidebar-container`의 `border-right` 장식으로만 남는다. (`header.css` 300행 주석의 z-index 설명에 나오는 "sidebar-rail(20)"은 이제 존재하지 않는 요소를 가리키는 낡은 문구 — 헤더 `z-index:9`는 `sidebar-container`(10)보다 낮으면 되므로 동작에는 영향 없음.)
     e) **접힘 시 배지 예약 패딩으로 아이콘이 왼쪽으로 밀리던 버그 수정(2026-09-02)** — `:has(> [data-slot="sidebar-menu-badge"]) > [data-slot="sidebar-menu-button"] { padding-right: 28px }`가 접힘 상태의 `padding: 0`보다 특이성이 높아, 배지가 달린 Design/Ai만 접혔을 때 오른쪽 패딩이 남아 아이콘이 왼쪽으로 쏠리고 잘렸다(헤더 로고·푸터 통계는 배지가 없어 정상). 두 예약 패딩 규칙(badge / menu-action)을 `[data-slot="sidebar-wrapper"]:not([data-state="collapsed"])`로 한정 — 접힘에서 네 아이콘 모두 중심 X 23.5px로 일치, 펼침의 28px 예약은 그대로. **교훈: 접힘 전용 리셋(`padding:0` 등)을 무력화할 수 있는 `:has`/자식 결합자 규칙은 반드시 펼침으로 한정할 것.**
     f) **헤더 우측 4개(홈/태그/방명록/즐겨찾기) 아이콘 전용 버튼 + hover 툴팁(2026-09-03)** — 사용자 요청("텍스트제거 아이콘버튼으로", "hover시 툴팁", "툴팁은 디자인시스템 참고")으로 `<span>` 라벨을 떼고 `data-size="sm"`(텍스트)→`"icon-sm"`(32px, 이전과 동일 풋프린트)로 교체, `aria-label`로 접근성 보강. Tooltip 프리미티브(`components.css` 3380~3486행, `pages/tooltip.html` 마크업)를 처음엔 `header.css`/`header.js`에 포팅(공용 프리미티브로 Button·Breadcrumb 옆에 추가) — 이후 sidebar 구역이 같은 프리미티브를 쓰게 되면서 `components/tooltip.css`/`tooltip.js` 독립 파일로 옮겨졌다(아래 Sidebar 항목의 2026-09-03 후속 수정 참고). 원본과 다른 점 — 실측으로 발견한 버그(즐겨찾기 버튼이 화면 맨 오른쪽에 붙어 있어 원본의 항상-중심-정렬이 툴팁을 뷰포트 밖으로 밀어 body 가로 스크롤을 만듦)를 고치려고 원본에 없는 `data-align="start"/"end"` 뷰포트 경계 보정을 추가(`tooltip.js`의 `fitToViewport()`가 열릴 때마다 겹침을 측정해 필요할 때만 부여, 화살표도 함께 이동). Playwright로 4개 버튼 hover/focus 툴팁, 라이트·다크, `scrollWidth === innerWidth`(가로 오버플로 0) 전부 실측 확인.
   - **content 구역에서 이어받을 것:** `[data-slot="content"]`가 무스타일로 자리만 잡혀 있음, 헤더가 sticky라 본문 스크롤 모델은 자유, Button/Breadcrumb 재사용 가능, `--secondary`/`--destructive`/`--sys-*` 토큰은 아직 없음. **"맨 위로" 버튼을 만들 때는 우측 하단 테마 토글 FAB와 겹치지 않게 그 위(예: `bottom: calc(var(--spacing)*20)`)에 세로로 쌓을 것** — 코드 주석에 이미 자리를 언급해 둠.
3. **Content(목록/본문)** — 미착수, 다음 후보.
4. (이후 구역은 사용자 요청에 따라 여기에 추가)
