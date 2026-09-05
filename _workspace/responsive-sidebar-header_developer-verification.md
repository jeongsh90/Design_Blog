# 반응형(Sidebar 모바일 드로어 + Header) 구현 · 검증 보고서

- **작성:** tistory-skin-developer
- **일자:** 2026-09-05
- **스펙:** `_workspace/responsive-sidebar-header_designer-spec.md`
- **산출물:** `dashboard-skin/components/sidebar.css` · `sidebar.js` · `header.css` · `skin.html` · `src/input.css` · `tailwind.css`(재빌드)
- **범위 밖(손대지 않음):** `components/content.css` · `content.js` — Cursor 병행 작업 중이라 읽지도 않았다.
- **검증 환경:** `http://localhost:4321`(`bun run skin:serve`) 정적 서버 + 2종 브라우저 드라이버
  - Playwright MCP(Chromium) — 실제 클릭, `page.evaluate` 속성/치수 실측, 뷰포트 리사이즈
  - puppeteer-core + 로컬 Chrome — `prefers-reduced-motion` 미디어 에뮬레이션, 실제 마우스 휠, 라이트/다크 스크린샷
    (※ Playwright의 `chromium.launch()`가 이 환경(bun + Windows)에서 180초 이상 응답이 없어 실패했다. 이미 devDependency로 있던 `puppeteer-core`로 대체 — 브라우저 엔진은 동일한 Chromium 계열이다.)
- **스크린샷:** `_workspace/responsive-sidebar-header-shots/` (390/768/1024/1280 × light/dark, 390은 드로어 열림 포함 = 10장)

---

## 1. 확정된 결정사항 (스펙 §9 Q1~Q5)

오케스트레이터가 **전부 스펙 저자 제안값으로 확정**해 그대로 구현했다.

| # | 결정 | 구현 위치 |
|---|---|---|
| Q1 | 태블릿(768~1023) 쿠키 없을 때 기본값 = **접힘**(A+) | `skin.html` 인라인 스크립트 2곳 + `sidebar.js` `defaultExpanded()` |
| Q2 | 드로어 전환 속도 = **원본 그대로**(열림 500ms / 닫힘 300ms / 백드롭 150ms) | `sidebar.css` §4-2 (2)(3)(4) |
| Q3 | 포커스 트랩 = **부분 구현**(이동+복귀+`role="dialog" aria-modal="true"`, Tab 순환 가둠 미구현) | `sidebar.js` `setMobileOpen()` / `focusFirstInDrawer()` |
| Q4 | 실사이트 `#subscribe` 렌더 = **확인 불가** | §5에 미검증으로 명시 |
| Q5 | 사이드바 링크 클릭 시 명시적 닫기 = **불필요** | 코드 없음(전체 페이지 이동으로 자연 소멸) |

---

## 2. 무엇을 했나

| 파일 | 변경 |
|---|---|
| `src/input.css` | `--shadow-lg` 토큰 1개 추가 |
| `components/sidebar.css` | 파일 끝에 §4-2 블록(모바일 드로어 + 백드롭 + reduced-motion) 추가. **스펙에 없던 규칙 1개 추가**(§4 참조) |
| `components/sidebar.js` | `initSidebar()` 안에 §4-7 전부 — `mqlMobile`/`mqlTablet`, `setMobileOpen`, `focusFirstInDrawer`, `enterMobile`/`exitMobile`, `defaultExpanded`, `toggleSidebar` 분기, 백드롭 클릭 위임, Escape 분기 |
| `components/header.css` | 파일 끝에 §5-3 미디어쿼리(≤767px에서 `[data-crumb="blog"]`·`breadcrumb-separator` 숨김) |
| `skin.html` | 백드롭 `<div>` 1줄 + head/wrapper 인라인 스크립트 2곳에 §4-6 기본값 판정 |
| `tailwind.css` | `bun run skin:build` 재빌드 — `--shadow-lg:0 10px 15px -3px #0000001a, 0 4px 6px -4px #0000001a` 출력 확인 |
| `README.md` | **변경 없음** — 새 업로드 파일이 없다(백드롭은 마크업, 스타일은 sidebar.css, 동작은 sidebar.js) |

---

## 3. ★ 스펙 §5-1 예측 검증 — 실측 결과 예측과 다름 (정정)

스펙 §0이 밝힌 대로 §5-1은 브라우저 실측 없이 CSS 값에서 산술로 유도한 **예측**이었다.
`content_mockup-permalink.html`(블로그 제목 ≠ 글 제목)에서 **수정 전** 상태로 직접 재현해 확정했다.

**측정 조건:** 사이드바가 이미 모바일 레이아웃(=`sidebar-gap` 폭 0)인 상태를 만든 뒤 헤더만 격리해 측정.
(수정 전 원본 그대로 열면 사이드바가 256px를 그대로 차지해 헤더 문제가 사이드바 오버플로에 묻힌다 — 실제로 390px에서 `scrollWidth 398 > innerWidth 390`이었다.)

### 3-1. 고정 소비량 실측 vs 예측

| 항목 | 스펙 예측 | **실측** | 판정 |
|---|---|---|---|
| `구독하기` 버튼 폭 A | ≈80px | **74.0px** | 6px 과대예측 |
| `header-actions` 전체 | ≈120px | **114.0px** | 6px 과대예측 |
| `sidebar-trigger` | 28px | 28.0px | 일치 |
| `blog crumb` 상한 | 160px | 160.0px (긴 제목에서 실제로 상한에 닿음) | 일치 |
| separator | 14px | 14.0px | 일치 |

### 3-2. 임계 뷰포트 — **예측 386px → 실측 362px**

`blog crumb`이 160px 상한에 닿는 최악 조건(블로그 제목 = "다잇누 디자인 아카이브 블로그")에서:

| 뷰포트 | `page crumb`(현재 글 제목) 실폭 | `separator.right` vs `actions.x` | 판정 |
|---|---|---|---|
| 390 | **10.1px** | 232 vs 260 → 여유 28 | 겹침 없음. 단 글 제목이 사실상 안 보임 |
| 375 | **0px** | 232 vs 245 → 여유 13 | 겹침 없음. 글 제목 완전 소멸 |
| **360** | **0px** | **232 vs 230 → 2px 겹침** | **실제 겹침 발생** |

→ 정확한 임계값: `separator.right`(232, 상수) > `actions.x`(= 뷰포트 − 130) 이 되는 지점 = **뷰포트 362px 미만**.
스펙이 386px로 예측한 것보다 24px 낮다. 원인은 (a) 실제 A가 6px 작고, (b) `page crumb`이 0까지 눌리며 완충 역할을 해 물리적 겹침을 뒤로 미루기 때문.

### 3-3. 그래도 스펙 §5-3 수정은 필요했다 (결론 유지)

물리적 겹침 임계값은 낮아졌지만 **"현재 글 제목이 0~10px로 사실상 사라진다"는 실사용 실패는 375~390px 전 구간에서 이미 발생**하고 있었다. 즉 스펙의 처방(`blog crumb`+separator를 md 미만에서 숨김, shadcn `blocks/sidebar-07` 정본과 동일)은 임계값 수치와 무관하게 옳았다.

**추가 실측 — 실제 블로그 제목("다잇누", 36px)일 때:** `separator.right`가 108px에 그쳐 360px에서도 겹침이 없고 글 제목에 104px가 남는다. 즉 **현 블로그 제목으로는 겹침이 재현되지 않는다** — 겹침은 블로그 제목을 8~9자 이상으로 바꾸면 곧바로 나타나는 잠재 버그였다. 스펙이 "실측 시 반드시 permalink 목업으로"라고 지시한 것은 정확했고, 여기에 "긴 블로그 제목" 조건을 추가로 강제해야 재현된다는 점을 이 보고서에 남긴다.

### 3-4. 수정 후 실측

| 뷰포트 | `[data-crumb="blog"]` | separator | `page crumb` 실폭 | `page.right` vs `actions.x` | 가로 오버플로 |
|---|---|---|---|---|---|
| 390 | `display:none` | `display:none` | **196.0px** | 248 vs 260 (여유 12 = header-inner gap) | 0 |
| 375 | none | none | **181.0px** | 233 vs 245 (여유 12) | 0 |
| 360 | none | none | **166.0px** | 218 vs 230 (여유 12) | 0 |

세 뷰포트 모두 정확히 12px(= `header-inner`의 gap) 간격을 유지하며 겹침 0. 글 제목은 기존 `text-overflow: ellipsis`로 잘린다(`scrollWidth > clientWidth` 확인).

---

## 4. 스펙과 다르게 구현한 것 (2건, 전부 사유 명시)

### 4-1. `sidebar.css` §4-2에 규칙 1개 추가 — FOUC 힌트 계열 무력화 (필수였음)

스펙 §4-2의 (1)/(2)는 "접힘 쿠키가 남아 있어도 0이 되도록 세 형태 모두 덮는다"고 했지만, 실제 파일에는 **네 번째 계열**이 있었다:

```css
/* sidebar.css:54-57 (기존) */
html[data-sidebar-init="collapsed"] [data-slot="sidebar-wrapper"]:not([data-state]) [data-slot="sidebar-gap"],
html[data-sidebar-init="collapsed"] [data-slot="sidebar-wrapper"]:not([data-state]) [data-slot="sidebar-container"] { width: var(--sidebar-width-icon); }
```

`html` 속성 + 자손 결합자라 스펙이 나열한 세 선택자 어디에도 걸리지 않는다. 그대로 두면 **JS가 뜨기 전 첫 페인트에서 모바일인데도 gap이 48px로 남아** 콘텐츠가 밀린다. §4-2 블록 안에 이 계열을 명시적으로 0/드로어 폭으로 덮는 규칙을 추가했다(주석 `(1-b)`).

**실측 검증:** `sidebar_mockup-nojs.html`(sidebar.js를 뺀 사본) 390px + 쿠키 `sidebar_state=false` → `htmlInitHint: "collapsed"`인데도 `gapW: 0`, `containerX: -288`, `insetW: 390`, 가로 오버플로 0. 이 규칙이 없으면 재현됐을 상태다.

### 4-2. `--shadow-lg`를 `:root`가 아니라 `@theme static`에만 추가

스펙 §4-3은 "`:root` + `@theme static` **두 곳**(기존 `--shadow-xs`/`--shadow-md` 154·156행 옆)"이라고 했으나, 실제 `input.css`에는 **`:root`에 shadow 토큰이 하나도 없다** — `--shadow-xs`/`--shadow-md` 둘 다 `@theme static`에만 있다. 빌드 산출물 `tailwind.css`에 `--shadow-md`가 정확히 1회만 등장하는 것으로 `@theme static`이 `:root`로 그대로 방출됨을 확인했다. 기존 형제 토큰과 동일한 자리 한 곳에만 두어 파일 관례를 지켰다(값은 스펙 인용 그대로).

### 4-3. `skin.html` wrapper 인라인 스크립트에 모바일 분기 추가 (스펙 §4-6 확장)

스펙 §4-6은 인라인 스크립트에 "쿠키 없을 때 태블릿이면 collapsed"만 지시했다. 그대로 두면 **쿠키가 `false`인 채 모바일에 진입한 첫 페인트에서 wrapper가 `data-state="collapsed"`로 찍혀** §4-1의 "드로어는 언제나 펼침 레이아웃" 가정이 JS 실행 전까지 깨진다(라벨/검색폼이 숨은 채로 한 프레임 그려질 수 있다). wrapper 스크립트에 `matchMedia("(max-width: 767px)")` 분기를 넣어 모바일이면 접힘 판정 자체를 건너뛰도록 했다 — `sidebar.js` `enterMobile()`이 내리는 결론을 첫 파싱 시점에 미리 확정하는 것이라 로직 중복이 아니라 FOUC 방지다.

---

## 5. 스펙 §8 체크리스트 20개 — 실측 결과

모든 값은 `page.evaluate`로 computed style / `getBoundingClientRect()` / DOM 속성을 직접 읽은 것이다. 스크린샷만으로 판정한 항목은 없다.

### Header

| # | 항목 | 결과 | 근거 |
|---|---|---|---|
| 1 | 수정 전 360/375/390 겹침·임계 뷰포트 확정, A값 정정 | ✅ **예측 386px → 실측 362px**, A = 74px(예측 80) | §3 전문 |
| 2 | 수정 후 360/375/390 겹침 0 + 가로 오버플로 0 | ✅ 세 뷰포트 모두 여유 12px, `scrollWidth − innerWidth = 0` | §3-4 |
| 3 | 인덱스(글 제목 == 블로그 제목)에서 `header.js` 인라인 숨김과 CSS 숨김이 겹쳐도 회귀 없음 | ✅ 둘 다 computed `display:none`, 겹침 −166px(여유), 오버플로 0 | 360px에서 `header.js`와 동일한 인라인 숨김을 직접 적용해 대조 |
| 4 | 768/1024/1280에서 브레드크럼 2단 유지 | ✅ `blogCrumb`/`sepCrumb` 모두 `flex` | 768/1023/1024/1280 각각 확인 |

### Sidebar 모바일 드로어

| # | 항목 | 결과 | 실측값 |
|---|---|---|---|
| 5 | 최초 로드 시 드로어 화면 밖, gap 0, inset 전체 폭 | ✅ | `transform: matrix(1,0,0,1,-288,0)`, `gapW 0`, `insetW 390`, 오버플로 0 |
| 6 | 트리거 클릭 → 288px 슬라이드인 + 백드롭 fade-in + `aria-expanded="true"` | ✅ | `containerX 0 / w 288`, `transition-duration 0.5s`, 백드롭 `opacity 1` `pointer-events auto`, `aria-expanded "true"` |
| 7 | **쿠키 `false`로 모바일 진입해도 드로어 내부가 펼침 레이아웃** | ✅ | 메뉴버튼 **271×32**(접힘이면 32×32), 검색폼·라벨·group-label·배지·서브메뉴 전부 visible, `wrapperState "expanded"` |
| 8 | 백드롭 클릭 / Escape로 닫힘 + 포커스 트리거 복귀 | ✅ | 백드롭: (340,400) 히트테스트 = `sidebar-backdrop` → 클릭 시 `closed`, `containerX -288`, `duration 0.3s`, `role`/`aria-modal` 제거, `document.activeElement === sidebar-trigger`. Escape: `open → closed` + 포커스 복귀, 닫힌 상태에서 Escape는 무해한 no-op |
| 9 | 헤더가 백드롭에 덮이는지 / 드로어는 백드롭 위인지 | ✅ | `elementFromPoint(340,28)` = `sidebar-backdrop`, **구독하기 버튼 정중앙도 `sidebar-backdrop`**, `(140,200)` = `sidebar-menu-button`. z: header 9 < backdrop 40 < drawer 50 |
| 10 | 모바일 조작이 `sidebar_state` 쿠키를 바꾸지 않음 | ✅ | 쿠키 없음 상태에서 열기/닫기/Ctrl+B 전부 `document.cookie === ""` 유지. 쿠키 `false` 상태에서도 `"sidebar_state=false"` 그대로 |
| 11 | 모바일에서 툴팁이 열리지 않음 | ✅ | mouseenter/mouseover/pointerenter + focus 후 800ms 대기 → `data-state "closed"`, computed `display: none` |
| 12 | 390→1024→360 리사이즈 시 모드 전환 | ✅ | →1024: `data-mobile` 제거, 쿠키(`false`) 복원해 `collapsed`, `containerW 48`, `transform none`, **아이콘 중심 x=23.5**. →360: `data-mobile "true"`, `data-mobile-state "closed"`, `gapW 0` |
| 13 | 드로어 내부 스크롤 정상 + 백드롭 위 스크롤이 뒤로 새지 않음 | ✅ | 390×320(내용이 실제로 넘치는 높이)에서 **실제 마우스 휠**: 드로어 위 휠 → `drawer 0→94`, `content 0` 유지. 백드롭 위 휠(600px) → `content 0` 유지, `window.scrollY 0`. **대조군**: 드로어를 닫고 같은 지점에서 같은 휠 → `content 0→596` (콘텐츠가 실제로 스크롤 가능함을 증명 = 위 결과가 무의미한 통과가 아님). 백드롭 `overscroll-behavior: contain`, `touch-action: none` 확인 |
| 14 | `prefers-reduced-motion: reduce`에서 즉시 전환 | ✅ | 에뮬레이션 ON: `transition-property: none`, `duration 0s` → 열기 후 **2프레임 만에** `containerX 0`, 백드롭 `opacity 1`. **대조군**(no-preference): `duration 0.3s`, 2프레임 시점 `containerX -287.3`(아직 이동 중) → 800ms 뒤 0 |
| 15 | 라이트/다크 각각 390/768/1024/1280 스크린샷 | ✅ | 10장 저장. 전 조합 `hOverflow 0`, `dark` 클래스 정상 토글 |
| 16 | 콘솔 에러 0 | ✅ | 여러 뷰포트/페이지 순회 후 실패 요청은 **`404 http://localhost:4321/favicon.ico` 단 1건**(기존 알려진 항목). `pageerror` 0건 |

### 태블릿

| # | 항목 | 결과 | 실측값 |
|---|---|---|---|
| 17 | 768/1023에서 고정 사이드바 유지 + 트리거 정상 토글 | ✅ | 768: `data-mobile null`, 백드롭 `display:none`, 토글 시 48↔256 + 쿠키 `true`/`false` 기록. 1023: 동일, 위젯 `none` |
| 18 | 쿠키 삭제 후 768 첫 진입 = 접힘 / 1280 첫 진입 = 펼침 | ✅ | 768: `collapsed`, `gapW 48`. 1023: `collapsed`. **1280: `expanded`, `gapW 256`** |

### 회귀

| # | 항목 | 결과 | 실측값 |
|---|---|---|---|
| 19 | 1280 이상에서 sidebar/header 무회귀 (특히 접힘 아이콘 중심 x=23.5) | ✅ | 접힘 시 아이콘 중심 **`[23.5, 23.5, 23.5, 23.5]`**(header·Design·Ai·footer 4개 전부). 헤더 56px, 트리거 28×28, gap/container 256↔48, `box-shadow: none`, `z-index: 10`, `transform: none`(모바일 규칙 미침투), 위젯 `flex`, 오버플로 0 |
| 20 | 1279 이하 위젯 숨김 유지 | ✅ | 1279 `none` / 1280 `flex` |

### 경계값 추가 확인 (체크리스트 외)

| 뷰포트 | 모드 | 실측 |
|---|---|---|
| **767** | 모바일 | `data-mobile "true"`, `gapW 0`, `containerW 288`, `blogCrumb none`, 백드롭 `block` |
| **768** | 태블릿 | `data-mobile null`, `gapW 48`, `transform none`, `role null`, `blogCrumb flex`, 백드롭 `none` |

경계가 정확히 767/768에서 갈린다 = shadcn `use-mobile.ts`의 `mobileBreakpoint - 1` 판정과 동일.

---

## 6. 미검증 · 알려진 한계

| # | 항목 | 사유 |
|---|---|---|
| 1 | **Q4 — 실사이트 `#subscribe` 버튼의 실제 렌더** | 티스토리 계정이 없어 확인 불가. 로컬 목업에서는 74px지만, 티스토리가 아이콘을 붙이거나 "구독중"으로 바꾸면 `header-actions`가 커진다. §5-3 수정으로 브레드크럼에 166~196px 여유가 생겨 상당한 증가까지는 안전하지만 **실사이트 배포 후 재측정 필요.** |
| 2 | **Tab 순환 가둠(full focus trap)** | Q3 결정에 따라 **의도적 미구현.** 드로어가 열린 상태에서 Tab을 계속 누르면 백드롭 뒤 헤더/본문 요소로 포커스가 빠져나간다(포인터는 백드롭이 물리적으로 차단하지만 키보드는 아니다). 스펙 §7 #4의 "부분 구현" 그대로다. |
| 3 | **실제 터치 제스처(스와이프로 열기/닫기)** | 스펙 범위 밖(shadcn Sheet도 스와이프를 제공하지 않는다). 검증도 하지 않았다. |
| 4 | **실기기 iOS Safari** | `100svh`·`svh` 단위와 `:has()` 지원은 데스크톱 Chromium에서만 확인. 백드롭 열림 규칙이 `:has()`에 의존하므로(`sidebar.css` §4-2 마지막) `:has()` 미지원 브라우저에서는 백드롭이 안 보인다 — 드로어 자체와 닫기(트리거/Escape)는 정상 동작하지만 백드롭 클릭 닫기가 무력해진다. iOS 15.4+/Chrome 105+에서 지원되므로 실사용 영향은 낮다고 판단했으나 **실기기 미검증.** |
| 5 | **티스토리 서버 렌더링 전반** | 관리 메뉴바 주입 시 헤더 sticky 위치, `[##_count_today_##]` 등 치환자 실제 값 길이, 광고 블록(`[##_revenue_list_upper_##]`)이 모바일 폭에 미치는 영향 — 전부 계정 없이는 확인 불가. |
| 6 | **키보드 입력이 합성 이벤트** | Playwright MCP 세트에 키 입력 도구가 없어 Ctrl+B / Escape는 `dispatchEvent(new KeyboardEvent(...))`로 검증했다(신뢰 이벤트 아님). 두 리스너 모두 `document` keydown에 달려 있고 `isTrusted`를 보지 않으므로 동작은 동일하지만, **브라우저 기본 동작과의 상호작용(예: Escape가 다른 것을 먼저 소비하는 경우)은 미검증.** 트리거 클릭·백드롭 영역 히트테스트·마우스 휠은 전부 실제 입력으로 검증했다. |
| 7 | **1280 이상 픽셀 단위 diff** | 변경 전 스크린샷이 없어 이미지 diff는 못 했다. 대신 치수·z-index·transform·box-shadow 등 수치를 직접 읽어 대조했고(§5 19번), 새 CSS가 전부 `@media (max-width: 767px)` 안에 있다는 점(예외: 백드롭의 `display:none` 기본값 — 신규 엘리먼트 전용, `--shadow-lg` — 데스크톱 미사용)을 근거로 무회귀로 판정했다. |

### 6-1. 기존 `skin:verify:content` 회귀 실행 결과 (참고 — 실패분은 전부 이번 작업과 무관)

데스크톱 회귀를 한 번 더 보려고 기존 도구를 돌렸다. **두 가지 사전 문제**를 먼저 짚어 둔다.

1. **도구가 이 환경에서 그냥은 실행되지 않는다.** `verify-*.mjs`가 `chromium-1234` 경로를 하드코딩했는데 실제 설치본은 `chromium-1228`뿐이다(같은 이유로 `playwright.chromium.launch()`도 실패한다). `PLAYWRIGHT_CHROME_PATH` 환경변수 override가 이미 있어 그걸로 우회했다 — **도구 파일은 수정하지 않았다.**
   ```
   PLAYWRIGHT_CHROME_PATH="…/ms-playwright/chromium-1228/chrome-win64/chrome.exe" bun run skin:verify:content
   ```
2. **결과:** `#1 #2 #3 #6 #6.1 #8 #9 #10 #11 #12` PASS / `#2.1 #4 #5` FAIL, `#13`에서 예외 중단.

FAIL·예외는 **전부 content 구역(Cursor 담당)** 항목이고 이번 작업과 무관함을 확인했다:
- `#13` 예외(`post-title a`가 null)는 **HEAD 커밋 시점의 `skin.html`에도 이미** `<h2 data-slot="post-title">`가 `<a>` 없이 들어 있어 재현된다(`git show HEAD:…`로 확인) — 내 변경 이전부터 있던 도구/마크업 불일치다.
- `#2.1 #4 #5`는 content 그리드 정렬 항목이고, 지금 `content.css`에는 내가 만들지 않은 미커밋 변경(`post-related`의 `margin-top`→`margin-bottom`)이 들어와 있다(`git diff`로 확인 — Cursor 병행 작업분).
- 내 변경이 영향을 줄 수 있는 항목인 **`#8`(content-inner 스크롤) `#9`(휠이 content-inner만 스크롤) `#10`(위젯 휠) `#11`(스크롤바 자동 숨김) `#12`(scroll-fade)는 전부 PASS** — 데스크톱 회귀 없음의 추가 근거다.

---

## 7. shadcn 원본 대비 의도적 이탈 (스펙 §7 그대로 + 이번에 확정된 것)

스펙 §7의 8개 항목을 그대로 따랐다. 구현 중 새로 추가된 이탈은 §4의 3건(FOUC 규칙 추가 / `--shadow-lg` 배치 / wrapper 스크립트 모바일 분기)뿐이며, **셋 다 "React가 없어서 첫 페인트를 서버 마크업으로 확정해야 한다"는 동일한 근본 제약**에서 나온 것이다. `data-slot` 값·CSS 변수명·전환 지속시간(500/300/150ms)·z-index(50/40)·폭(18rem)은 전부 원본 리터럴 그대로다.

새로 도입한 비-shadcn 속성은 `data-mobile-state` 하나이며(사유: 스펙 §4-1 — 같은 노드의 `data-state`가 이미 `expanded|collapsed`로 점유됨), shadcn 원본의 `data-mobile="true"`는 그대로 병기했다.
