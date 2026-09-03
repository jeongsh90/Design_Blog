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
4. **우측 위젯 사이드바(RIGHT SIDEBAR) — 2026-09-03 요청, 진행중.** "화면 우측에 사이드메뉴영역 하나더 만들고 NOTICE, RECENT POSTS, POPULAR POSTS, TAGS, RECENT Comment 영역 넣어, 글은 5개까지만 보여지게" — 좌측 shadcn Sidebar와는 별개로, 전통적 블로그 사이드바 위젯 5종을 담는 우측 패널. **이건 shadcn 컴포넌트가 아니라 Tistory 자체 스킨 치환자/반복 태그 기능**이라 shadcn 소스가 아니라 Tistory 공식 스킨 가이드(`https://tistory.github.io/document-tistory-skin/`)를 WebFetch로 실측(2026-09-03, `tistory-skin-designer`가 스펙 작성 중 재확인해 2건 보정 — 아래는 최종 정본) — 5개 전부 이미 완성된 `<s_...>`/`[##_..._##]` 세트가 있어 새로 설계할 필요 없이 그대로 옮겨 쓰면 된다:
   - **모든 위젯 공통: `<s_sidebar_element>` 한 겹으로 감싼다**(각 위젯 최상단, 최초 조사에서 누락됐던 것을 스펙 작성 중 5개 문서 전수 재확인으로 보정 — `/sidebar/{recent_post|popular_post|recent_notice|recent_comment|random_tag|count}.html` 전부 이 래퍼로 시작한다). `<s_sidebar>`(복수형 바깥 래퍼)는 현행 공식 문서 어디에도 없음 — 기존 `skin.html` 푸터 방문자 수의 `<s_sidebar><s_sidebar_element>` 2겹은 구식 관례이니 새 위젯에 그대로 따라 하지 말 것(기존 푸터는 이번 구역 범위 밖이라 손대지 않음).
   - **공지사항(Notice)** (`/sidebar/recent_notice.html`): 조건부 그룹 `<s_rct_notice>`(공지가 하나도 없으면 통째로 안 나옴) 안에 반복 `<s_rct_notice_rep><li><a href="[##_notice_rep_link_##]">[##_notice_rep_title_##]</a></li></s_rct_notice_rep>`.
   - **최근 글(Recent Posts)** (`/sidebar/recent_post.html`): 반복 `<s_rctps_rep>...</s_rctps_rep>`, 치환자 `[##_rctps_rep_link_##]`/`_title_`/`_rp_cnt_`(댓글수)/`_date_`(yyyy.mm.dd HH:MM)/`_simple_date_`(yyyy.mm.dd)/`_category_`/`_category_link_`/`_author_`(팀블로그용) + 조건부 `<s_rctps_rep_thumbnail><img src="[##_rctps_rep_thumbnail_##]"></s_rctps_rep_thumbnail>`(대표이미지 있을 때만).
   - **인기글(Popular Posts)** (`/sidebar/popular_post.html`): 반복 래퍼만 `<s_rctps_popular_rep>...</s_rctps_popular_rep>`로 다르고, 안쪽 치환자 세트는 최근 글과 완전히 동일한 `rctps_rep_*`(위와 같은 이름 재사용 — 문서 예제 그대로 확인됨).
   - **최근 댓글(Recent Comments)** (`/sidebar/recent_comment.html`): 반복 `<s_rctrp_rep><li><a href="[##_rctrp_rep_link_##]">[##_rctrp_rep_desc_##]</a><span>[##_rctrp_rep_name_##]</span><span>[##_rctrp_rep_time_##]</span></li></s_rctrp_rep>`.
   - **태그(Tags) — [보정] 태그로그 페이지 태그와 다르다.** 최초 조사에서 인용했던 `<s_tag>`/`<s_tag_rep>`(`/contents/tag.html`)는 **태그로그 페이지 전용**이고, **사이드바 위젯은 `/sidebar/random_tag.html`의 `<s_random_tags>` 하나뿐**(그룹 래퍼 없음, 스펙 작성 중 실측으로 발견 — 최초 조사대로 구현했으면 사이드바 태그 위젯이 동작하지 않았을 것). 치환자는 동일: `[##_tag_link_##]`/`[##_tag_name_##]`/`[##_tag_class_##]`(빈도 기반 `cloud1`~`cloud5` 5단계 — 태그 클라우드 글자 크기용 클래스, 서버가 계산해 내려주는 등급).
   - **"5개까지만" 관련 중요 제약 — 이건 skin.html이 통제할 수 있는 값이 아니다.** 5개 문서 어디에도 반복 개수를 지정하는 스킨측 문법이 없다(정독 확인) — Tistory는 관리자 화면(꾸미기 > 사이드바 설정, 위젯별 "노출개수" 드롭다운)에서 블로거가 직접 설정한 개수만큼만 서버가 애초에 그 개수만큼 반복해서 내려준다. 즉 skin.html의 `<s_..._rep>` 블록은 **정확히 한 번**(항목 하나짜리 템플릿)만 적어야 하고, 실제 개수 제한은 사용자가 티스토리 관리자에서 직접 설정해야 한다 — developer는 마크업을 실제 반복 개수만큼 복붙해 넣지 않도록 주의(그러면 실사이트에서 배수로 반복돼 버그가 된다). 로컬 Playwright 검증만 이 5개 항목을 "실제로 보이는 것처럼" 확인해야 하므로, `make-preview.mjs`의 목업 생성기를 확장해 이 5개 반복 태그만 더미 데이터로 N번(5) 복제하는 로직이 필요하다(기존 로직은 `<s_...>` 마커를 딱 한 번만 벗기는 방식이라 이런 진짜 반복에는 안 맞음).
   - 상세 스펙(레이아웃 치수, Card 컴포넌트 재사용 판단, 색상 매핑, 라벨 표기 등 9건 확인사항)은 `_workspace/right-widgets_designer-spec.md` 참고.
   - **✅ 2026-09-03 구현·검증 완료** — 산출물: `dashboard-skin/components/{card,widgets}.css`(신규), `skin.html`·`src/input.css`(`--card`/`--card-foreground` 추가)·`tools/make-preview.mjs`·`README.md` 수정, 검증 스크린샷 `_workspace/right-widgets-shots/`. 스펙 §9의 확인 필요 9건은 오케스트레이터가 **스펙 저자 제안값 전부 그대로 채택**(한글 라벨 / 태그는 크기 고정+색·굵기 5단계 / 인기 글은 순위+썸네일 없음 / 접기 토글 없음 / 댓글 수 없음 / 기존 푸터 `<s_sidebar>`는 손대지 않음 / 전 페이지 공통 노출). JS는 만들지 않았다(순위는 CSS counter).
   - **스펙과 실제로 달라진 점 2건(둘 다 실측으로 드러난 것, 시각/구조 설계는 스펙 그대로):**
     a) **`widgets.css`에 `[data-slot="widgets"] > * { flex-shrink: 0 }` 1줄 추가.** 스펙 §2-2의 CSS만으로는 패널이 flex column이라 카드가 기본 `flex-shrink:1`로 눌려서, 총 높이가 뷰포트를 넘어도 `max-height`+`overflow-y:auto`가 발동하지 않고 카드들이 찌그러졌다(카드의 `overflow:hidden` 때문에 태그 chip이 한 줄만 남고 잘리는 것을 Playwright로 확인). 이 한 줄이 있어야 스펙 §2-4가 의도한 "패널만 따로 스크롤"이 실제로 성립한다.
     b) **`make-preview.mjs`가 HTML 주석을 자리표시자로 격리한 뒤 반복 확장을 수행한다.** `skin.html` 주석이 문서화를 위해 `<s_rctps_popular_rep>` 같은 태그 이름을 문자열 그대로 적고 있어서, 스펙 §7-2의 정규식이 "주석 속 여는 태그 ~ 진짜 닫는 태그"를 한 블록으로 잡아 카드 `<section>` 전체를 5장/12장으로 복제해 버렸다(실측 확인 후 수정). 스펙 §7-1의 처리 순서(0→1→2→3)와 §7-2의 non-greedy·조건부 썸네일 처리 원칙은 그대로 지켰다.
   - **content 구역에서 이어받을 것:** 본문 자리는 이제 `[data-slot="content-inner"]`(패딩·타이포 미정, `flex:1 1 auto`/`min-width:0`만 확정). `card.css`(Card + Badge outline)가 공용 프리미티브로 준비돼 있어 글 목록 카드에 그대로 재사용 가능. 아직 없는 토큰: `--secondary`/`--destructive`/`--popover`/`--sys-*`/색상군. "맨 위로" 버튼은 FAB 위(`bottom: calc(var(--spacing)*20)`)에 쌓되, 우측 패널 320px 위에 겹쳐 뜬다는 점을 함께 고려할 것. 반응형은 여전히 미착수 — 이 패널은 1280px 미만에서 본문을 심하게 압박한다(후보 정책은 스펙 §10).
   - **실사이트 미검증(계정 없음, 스펙 §9 Q9 그대로):** ① 위젯 5종이 관리자 설정과 무관하게 `skin.html` 위치 그대로 렌더되는지, ② `<s_sidebar_element>`가 관리자 사이드바 설정과 어떤 방식으로 연동되는지, ③ 티스토리 서버 주입 요소(관리 메뉴바·광고)가 sticky 패널과 겹치는지.
   - **✅ 2026-09-03 후속 수정 5건 — 카드 스타일 정리.** 요청: "카드 타이틀 sidebar-group-label의 여백 제외한 속성 동일하게 / 글은 한줄처리 넘어가는건 점점점 처리 / 카드 배경색 제거, 보더라인제거 / 리스트의 제목의 색상을 한단계 낮추고 hover시 한단계 올라가게 / 리스트 호버시 배경색 제거"(전부 `widgets.css` 스코프, `card.css` 원본은 그대로 둠 — content 구역이 배경·보더 있는 카드를 다시 쓸 수 있게).
     a) 카드 제목을 `sidebar-group-label`(sidebar.css 213~227행)과 글꼴/자간/opacity 0.7/줄바꿈 규칙 동일하게(height/padding 등 여백류는 제외). 색상만 `--color-sidebar-foreground`가 아니라 `--color-card-foreground`(라이트/다크 값이 서로 완전히 동일함을 input.css로 확인) — 위젯 구역이 이미 지키고 있는 "`--color-sidebar-*`를 밖으로 유출하지 않는다" 원칙 유지.
     b) 카드 배경(`--color-card`)과 링 섀도(보더 역할)를 투명/none으로 — 카드가 패널 배경에 완전히 스며듦.
     c) 항목 제목을 2줄 클램프에서 단일 행 말줄임으로. **실측 버그 발견·수정**: `<span>`은 기본 `display:inline`이라 `overflow`/`text-overflow`가 적용될 상자 자체가 없어 처음엔 그냥 줄바꿈만 됐다(사용자가 스크린샷으로 재현 지적) — `display:block` 추가로 해결.
     d) 항목 hover 배경(`--color-accent`) 제거 — 인터랙션 신호는 제목 색 변화만으로 전달.
     e) 항목 제목 기본 색상을 처음엔 `--color-muted-foreground`(하늘 hover는 `--color-card-foreground`)로 했다가, 사용자가 "현재 색상과 hover색상의 중간색으로(변수 생성), hover색은 유지" 요청 — `[data-slot="widgets"]`에 `--widget-title-color: color-mix(in oklab, var(--color-muted-foreground) 50%, var(--color-card-foreground) 50%)` 신규 토큰을 만들어 기본색으로 쓰고, hover는 그대로 `--color-card-foreground` 유지.
5. **전체 스무스 스크롤(GSAP) — 2026-09-03 요청, 진행중.** "모든스크롤은 부드러운스크롤링되게끔 gsap.js적용" — 이 항목은 새 시각 구역이 아니라 **셸 전체의 스크롤 동작**을 바꾸는 요청이라, Phase 2(비주얼 스펙/색상 매핑)를 건너뛰고 오케스트레이터가 직접 기술 방향을 정한 뒤 developer에게 바로 위임한다(대상 컴포넌트가 없어 designer의 "shadcn 실측+색상 매핑" 역할이 성립하지 않음).
   - **이 블로그에 실제로 독립 스크롤되는 컨테이너가 3곳 있다**(전부 이미 확정된 구역): ① 문서/메인 스크롤(`window`/`document.scrollingElement`), ② 좌측 사이드바 `[data-slot="sidebar-content"]`(`overflow-y:auto`, sidebar.css 182~190행 — 카테고리가 많아지면 자체 스크롤), ③ 우측 위젯 패널 `[data-slot="widgets"]`(`overflow-y:auto`, widgets.css — 위젯 5개가 항상 이미 넘침). "모든 스크롤"은 이 3곳 전부를 뜻한다.
   - **GSAP `ScrollSmoother`(공식 스무스 스크롤 플러그인, 2024년부터 전 플러그인 무료화 확인)를 채택하지 않기로 결정.** ScrollSmoother는 `#smooth-wrapper`/`#smooth-content` 두 겹으로 페이지 전체를 감싸고 `transform`으로 콘텐츠를 밀어 스크롤을 흉내내는 방식이라(공식 문서 재확인: "position:fixed 요소는 wrapper 밖에 둬야 한다"), 네이티브 스크롤이 실제로 발생하지 않는다 — 이 스킨의 핵심 동작인 헤더 `position:sticky`(56px 고정)와 우측 위젯 패널 `position:sticky`가 **네이티브 스크롤 이벤트에 의존**하므로 ScrollSmoother 아래에서는 둘 다 깨진다(GSAP 커뮤니티의 통상적 해법은 sticky를 전부 `ScrollTrigger.pin()`으로 바꾸는 것인데, 이미 검증 완료된 두 구역의 포지셔닝 모델을 통째로 재구축해야 해 리스크가 크다). 게다가 ScrollSmoother는 페이지에 스크롤 컨테이너가 하나(문서 전체)라고 가정하는 설계라, 이미 자체 스크롤되는 사이드바/위젯 패널 2곳과 근본적으로 상성이 나쁘다.
   - **대신 채택: GSAP core만으로 직접 만드는 휠-스무딩.** 컨테이너별로 `wheel` 이벤트를 가로채 목표 스크롤 위치를 누적하고, `gsap.to(container, { scrollTop: target, duration, ease })`(GSAP가 임의 DOM 프로퍼티를 트윈할 수 있어 `scrollTop`을 플러그인 없이 직접 애니메이션 — `window` 자체가 아니라 `document.scrollingElement`/각 패널 엘리먼트를 대상으로 하면 ScrollToPlugin도 필요 없다)로 부드럽게 따라가게 한다. **네이티브 스크롤 위치 자체가 실제로 변하므로** `position:sticky`가 그대로 정상 동작한다 — 이게 ScrollSmoother 대신 이 방식을 고른 핵심 이유다. 마우스 휠 입력만 스무딩 대상으로 하고(이 프로젝트가 지금까지 "PC 먼저" 원칙을 반복 확인해 온 것과 같은 맥락) 키보드(방향키/Space/PgUp·PgDn)·터치는 네이티브 스크롤을 그대로 둔다 — 스코프를 좁힌 것이지 누락이 아님을 보고 시 명시할 것. `prefers-reduced-motion: reduce`에서는 스무딩을 끄고 즉시 이동(이 프로젝트의 기존 관례 — sidebar.css 102~107행에 동일 미디어쿼리로 transition을 끄는 선례가 이미 있음).
   - **CDN:** `https://cdnjs.cloudflare.com/ajax/libs/gsap/<정확한 최신 안정 버전 고정>/gsap.min.js` 하나만(코어) — ScrollTrigger/ScrollToPlugin 등 추가 플러그인 불필요.
   - **파일:** 신규 `dashboard-skin/components/smooth-scroll.js`(공용 프리미티브 — 특정 구역 소유가 아니라 셸 전체 동작이므로 header.js/sidebar.js/widgets.js 어디에도 넣지 않는다) + `skin.html`에 GSAP CDN `<script>` + 이 파일 `<script>` 추가. CSS 변경 없음(새 CSS 파일 불필요).
   - developer가 반드시 Playwright로 확인할 것: (a) 문서 스크롤 중 헤더가 56px에서 계속 고정, (b) 우측 위젯 패널이 계속 sticky, (c) 위젯 패널 위에서 휠을 돌리면 문서가 아니라 그 패널만 스크롤(이벤트 스코프가 실제로 컨테이너별로 분리돼 있는지), (d) 좌측 사이드바도 동일하게 확인, (e) `prefers-reduced-motion: reduce`에서 스무딩 비활성, (f) 세 컨테이너 모두 실제 마우스 휠 입력(합성 이벤트가 아니라 CDP 기반 `mouse.wheel`)으로 easing이 걸리는지, 순간이동이 아닌지.
   - **✅ 2026-09-03 구현·검증 완료(오케스트레이터가 직접 구현).** `tistory-skin-developer` 서브에이전트를 2회 시도했으나 둘 다 파일 변경 전 API 500 오류로 중단돼(재시도 무의미하다고 판단), 오케스트레이터가 위 기술 방향을 그대로 직접 구현했다. 산출물: `dashboard-skin/components/smooth-scroll.js`(신규, 공용) 하나, `skin.html`(GSAP CDN `<script>` 3.15.0 + `smooth-scroll.js` 로드 추가), `tools/make-preview.mjs`(경로 치환 정규식에 `smooth-scroll` 추가), `README.md`(업로드 파일 10개로 갱신 + "셸 전체 동작" 표 신설 + GSAP는 CDN 참조라 업로드 대상 아니라는 점 명시). CSS 변경 없음.
     - **구현 세부(스펙에 없던 판단 2건)**: ① `wheel` 핸들러에서 `event.stopPropagation()`을 반드시 호출 — 안 하면 위젯 패널/사이드바 위에서 휠을 돌려도 이벤트가 `window`까지 버블링돼 문서까지 함께 스크롤되는 버그가 실측 확인됨(핸들러가 목표값을 컨테이너별로 독립 관리해도, 이벤트 자체를 막지 않으면 상위 리스너도 같이 발동하기 때문). ② `event.deltaMode`가 1(line, Firefox 기본)/2(page)일 때 값을 대략 px로 환산 — 그대로 더하면 스크롤이 거의 안 움직이는 것처럼 보인다(크롬/엣지는 대체로 0=px라 문제 없었지만 방어적으로 처리).
     - **Playwright 실측(체크리스트 a~f 전부)**: CDP `page.mouse.wheel()`로 실제 휠 입력 시뮬레이션 — 문서 스크롤이 `[160,284,401,467,526,557,580,591,597,600,600]`(600 목표, 60ms 간격 12프레임)처럼 감속 곡선을 그리며 도달(순간이동 아님) 확인. 위젯 패널 휠 스크롤 중 문서 `scrollTop`은 12프레임 내내 0으로 유지(패널만 독립적으로 움직임) 확인. 문서를 1200px 스크롤한 뒤에도 헤더(`top:0~56`)와 위젯 패널(`top:56`)이 그대로 sticky 유지 확인. `prefers-reduced-motion:reduce`에서는 휠 60ms 뒤 이미 목표값에 도달(이징 없이 네이티브 즉시 이동) 확인. 좌측 사이드바는 현재 콘텐츠가 짧아 실제 오버플로가 없어 시각적 easing 재현은 못 했지만, 그 위에서 휠을 돌려도 문서로 이벤트가 새지 않음(stopPropagation 정상 동작)은 확인.
     - **스코프 밖(요구사항 문서에 이미 기록된 대로 그대로 유지)**: 키보드/터치 스크롤은 네이티브, 좌측 사이드바 실제 오버플로 상태의 육안 재현(콘텐츠가 늘어나는 content/comment 구역 이후 재확인 권장).
   - **✅ 2026-09-03 후속 수정 — GSAP core 휠-스무딩을 걷어내고 Lenis + GSAP로 전면 교체.** 사용자 요청: "D:\MyCloud에 적용된 모든 영역 스크롤참고해서 다시적용, D:\MyCloud에도 같은 스크롤 들어가있으니" — `D:\MyCloud\frontend\src\lib\smooth-scroll.ts` + `components\SmoothScrollArea.tsx`(그 프로젝트가 19개 파일·26곳에서 이미 실사용 중이고, 한 화면에 동시 인스턴스 여러 개도 검증된 패턴 — AccountsPage/CardsWorkspace/RecordingsWorkspace 등)를 실측해 그대로 재현했다. 핵심: **Lenis**(전용 스무스 스크롤 라이브러리, `smoothWheel:true`/`syncTouch:false`) + `gsap.ticker.add(raf)`로 Lenis의 RAF 루프를 GSAP ticker에 태우고 `lenis.on("scroll", ScrollTrigger.update)`로 동기화 — 이전 시도(직접 짠 wheel 트윈)가 풀어야 했던 관성/엣지케이스를 검증된 라이브러리로 대체한 것. Lenis도 ScrollSmoother와 달리 transform이 아니라 네이티브 scrollTop을 직접 움직이므로 `position:sticky`는 여전히 정상 동작(원본 프로젝트 주석에도 동일 근거 명시). CDN 추가: GSAP ScrollTrigger 플러그인(`.../3.15.0/ScrollTrigger.min.js`) + Lenis(`https://cdn.jsdelivr.net/npm/lenis@1.3.25/dist/lenis.min.js`, 참고 프로젝트 package.json과 동일 버전). 컨테이너별 인스턴스: ① 문서 — wrapper/content 생략(Lenis 기본값이 window/documentElement라 우리 "헤더 sticky + 문서 스크롤" 모델과 정확히 일치), ②③ 사이드바-content/위젯 패널 — `wrapper`와 `content`를 **같은 엘리먼트**로 지정(원본처럼 별도 content 래퍼 div를 새로 만들지 않아도 `scrollHeight`가 정확히 계산됨을 Lenis 소스로 확인). **실측으로 발견한 버그(스펙에 없던 것)**: 문서 Lenis가 하나 더 있는 상태에서 사이드바/위젯 패널 위에서 휠을 돌리면, 두 컨테이너 자체는 안 움직이고 대신 **문서가 대신 스크롤되는** 버그를 Playwright로 재현(중첩 Lenis의 알려진 함정) — `D:\MyCloud`의 `FilePreview.tsx`가 정확히 같은 버그를 이미 겪고 고쳐둔 해법(`data-lenis-prevent` 속성, Lenis 공식 문서에도 있는 패턴)을 그대로 적용해(`[data-slot="sidebar-content"]`/`[data-slot="widgets"]`에 추가) 해결 — 부모 Lenis가 그 요소 위에서는 휠을 완전히 무시하고 자식 Lenis만 반응한다. Playwright(CDP `mouse.wheel`)로 3곳 모두 감속 곡선 재확인, 위젯 패널 스크롤 중 문서 `scrollTop` 불변, 사이드바 위 휠이 더 이상 문서로 새지 않음, 1800px 스크롤 후에도 헤더/위젯 패널 sticky 유지 전부 재검증.
   - **✅ 2026-09-03 후속 수정 — 네이티브 스크롤바 숨김.** "스크롤은 기본스크롤 제거하고 lenis제공 스크롤 처리" — `D:\MyCloud\frontend\src\index.css`의 `.scrollbar-hidden`(`scrollbar-width:none; -ms-overflow-style:none;` + `::-webkit-scrollbar{display:none}`)을 신규 `dashboard-skin/components/smooth-scroll.css`로 그대로 옮겨, Lenis가 붙은 3개 컨테이너(`html`/`[data-slot="sidebar-content"]`/`[data-slot="widgets"]`)에 적용했다 — smooth-scroll.js가 Lenis를 붙이는 대상과 정확히 짝을 맞춤. 스크롤 "기능"은 그대로 네이티브(scrollTop이 실제로 바뀜, Lenis가 애니메이션만 담당)라 이 변경은 순수 시각적 트랙/썸 제거일 뿐 — 접근성(키보드/스크린리더)엔 영향 없음. `skin.html`에 `<link>` 추가(로드 순서: `tailwind → tooltip → smooth-scroll → card → sidebar → header → widgets`). Playwright로 `getComputedStyle().scrollbarWidth === "none"`(html·widgets 둘 다), 스크롤바 숨김 후에도 휠 스크롤이 여전히 감속 곡선을 그리며 정상 동작, 위젯 패널 독립 스크롤 유지, 가로 오버플로 0 전부 재확인.
6. (이후 구역은 사용자 요청에 따라 여기에 추가)
