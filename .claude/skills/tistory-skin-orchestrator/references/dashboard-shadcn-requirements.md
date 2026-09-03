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
2. **Header** — ✅ 완료(스펙 `_workspace/header_designer-spec.md`, 검증 `_workspace/header_developer-verification.md`). `Design-system/index.html`(292~319행) + `css/layout.css`(23~64행) 구조를 그대로 이식(`header`/`header-inner`/`header-start`/`header-actions`, 56px, `border-bottom`). `header-start`에 `sidebar-trigger`(28px, shadcn `size-7` 유지) + 2단 브레드크럼(`[##_title_##]`/`[##_page_title_##]`). Button·Breadcrumb 컴포넌트가 `components/header.css`에 함께 포팅됨(공용 프리미티브 — 다른 구역이 쓰기 시작하면 `button.css`로 추출). `skin-scaffold-*` 임시 슬롯 3개 전부 제거.
   - **2026-09-02 후속 수정 4건(소규모라 designer/developer 분리 없이 진행):**
     a) 사이드바 푸터의 다크/라이트 토글 버튼 제거(방문자 수 통계는 유지) + 헤더 우측 끝에 `data-variant="default"` 즐겨찾기 버튼 신규 추가(별 아이콘, 클릭 시 `localStorage`(`dashboard-skin:favorites`)에 현재 경로 저장/해제 — 즐겨찾기 "목록"을 모아보는 화면은 아직 없음, content 구역 이후 과제).
     b) 테마 토글을 헤더 밖으로 빼서 **화면 우측 하단 고정(FAB)**으로 재배치 — `[data-floating-theme-toggle]`, `position:fixed; right/bottom: calc(var(--spacing)*6); border-radius:9999px; box-shadow:var(--shadow-md)`(신규 토큰, `src/input.css`). 사이드바 푸터·헤더 양쪽에 있던 테마 토글은 이제 이 FAB 하나로 통합됨.
     c) 사이드바 "둘러보기"(홈/태그/방명록) 그룹 전체 제거 — 헤더 우측 버튼 3개와 완전히 중복이라 정리. 검색 바로 아래 구분선만 남기고 아카이브로 이어짐. `initActiveState()`(sidebar.js)는 DOM을 매번 다시 훑는 방식이라 손댈 필요 없이 그대로 정상 동작.
     d) **사이드바 우측 레일 클릭 접힘 제거(2026-09-02)** — shadcn `SidebarRail`(`data-slot="sidebar-rail"`, 우측 경계의 16px 히트영역 + `cursor:w-resize`/hover 세로선)을 마크업·CSS·JS에서 전부 삭제. 사용자가 "사이드메뉴 오른쪽 모서리 클릭 시 접히는 기능 제거"를 요청 — shadcn 정본에서 의도적으로 이탈한 지점이다. 남은 토글 경로는 `sidebar-trigger` 클릭과 `Ctrl`/`Cmd`+`B` 두 가지뿐이며, 우측 경계선은 `sidebar-container`의 `border-right` 장식으로만 남는다. (`header.css` 300행 주석의 z-index 설명에 나오는 "sidebar-rail(20)"은 이제 존재하지 않는 요소를 가리키는 낡은 문구 — 헤더 `z-index:9`는 `sidebar-container`(10)보다 낮으면 되므로 동작에는 영향 없음.)
     e) **접힘 시 배지 예약 패딩으로 아이콘이 왼쪽으로 밀리던 버그 수정(2026-09-02)** — `:has(> [data-slot="sidebar-menu-badge"]) > [data-slot="sidebar-menu-button"] { padding-right: 28px }`가 접힘 상태의 `padding: 0`보다 특이성이 높아, 배지가 달린 Design/Ai만 접혔을 때 오른쪽 패딩이 남아 아이콘이 왼쪽으로 쏠리고 잘렸다(헤더 로고·푸터 통계는 배지가 없어 정상). 두 예약 패딩 규칙(badge / menu-action)을 `[data-slot="sidebar-wrapper"]:not([data-state="collapsed"])`로 한정 — 접힘에서 네 아이콘 모두 중심 X 23.5px로 일치, 펼침의 28px 예약은 그대로. **교훈: 접힘 전용 리셋(`padding:0` 등)을 무력화할 수 있는 `:has`/자식 결합자 규칙은 반드시 펼침으로 한정할 것.**
   - **content 구역에서 이어받을 것:** `[data-slot="content"]`가 무스타일로 자리만 잡혀 있음, 헤더가 sticky라 본문 스크롤 모델은 자유, Button/Breadcrumb 재사용 가능, `--secondary`/`--destructive`/`--sys-*` 토큰은 아직 없음. **"맨 위로" 버튼을 만들 때는 우측 하단 테마 토글 FAB와 겹치지 않게 그 위(예: `bottom: calc(var(--spacing)*20)`)에 세로로 쌓을 것** — 코드 주석에 이미 자리를 언급해 둠.
3. **Content(목록/본문)** — 미착수, 다음 후보.
4. (이후 구역은 사용자 요청에 따라 여기에 추가)
