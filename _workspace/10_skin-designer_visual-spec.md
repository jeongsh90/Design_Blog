# JQ.Minimal v1.1 → Design-system 리스킨 비주얼 스펙

- 작성: `tistory-skin-designer` (Phase 2)
- 대상 블로그: https://daitnu.tistory.com/
- 리스킨 원본: `D:\MyCloud\Design_Blog\daitnu-skin-v1.01`
- 토큰 출처: `D:\MyCloud\2026포트폴리오\Design-system\css\globals.css` (`:root` L20381‑20422 / `.dark` L20462‑20505)
- 타이포 규칙: `pretendard-typography` 스킬 스케일 (Design-system의 `--tracking-*`는 라틴 기준이라 **채택하지 않음** — 스킬 지침대로 한글 최적값 우선)
- 다음 담당: `tistory-skin-developer`

> **이 문서의 성격**: 새 스킨 설계서가 아니라 **재도색 지시서**다. 모든 항목은 "지금 이 선택자가 쓰는 이 값을 → 이 값으로" 형태다. 마크업 구조·티스토리 치환자·index.xml 옵션 체계는 원칙적으로 손대지 않는다. 구조 변경이 필요한 소수 항목은 §9에 따로 모았다.

---

## 0. 감사 요약 — 베이스 스킨 실측 정정

작업 전 `references/skin-requirements.md`에 적혀 있던 감사 요약 중 **3건이 실측과 달랐다.** 개발자가 잘못된 전제로 작업하지 않도록 먼저 정정한다.

| 기존 감사 주장 | 실측 결과 | 근거 |
|---|---|---|
| "`style.css`에 CSS 커스텀 프로퍼티가 **0개**, 다크모드를 선택자별 중복 선언으로 구현" | **틀림.** `:root`와 `.dark`에 **15개 토큰이 이미 정의돼 있고**, 스킨 전역이 `rgb(var(--color-jq-300) / <alpha>)` 형태로 이 토큰만 참조한다. `.dark ` 선택자 50회는 중복 선언이 아니라 토큰으로 표현 못 하는 예외(`dark:opacity-80`, `dark:invert` 등)다. | `style.css` (pretty L2027‑2058) |
| "`@font-face` 선언이 없어 Pretendard가 조용히 폴백된다 → 필수 버그 수정" | **틀림.** `skin.html` `<head>`에 orioncactus 공식 Pretendard 변수폰트 CDN이 이미 정상 로드 중이고 `font-family:Pretendard Variable`과 정확히 매칭된다. **폰트 로딩은 버그가 아니다.** (단 별개의 실제 버그가 있다 — 아래 참조) | `skin.html` L19 |
| "`'Noto Serif KR'` 사용처가 있으니 self-host 필요" | **틀림.** 해당 규칙은 티스토리 에디터가 본문에 인라인으로 박는 `style="font-family:'Noto Serif KR'"`를 **Pretendard로 강제 되돌리는 방어용 오버라이드**다. 세리프를 쓰는 곳은 없다. `NotoSerifKR.zip`은 불필요. | `style.css` (pretty L347‑349) |

**대신 실제로 발견된 폰트 버그 (별건):**
```css
body { font-family: --value(--font-sans); }   /* style.css pretty L2117 — 무효 선언 */
```
Tailwind v4 컴파일이 덜 된 산출물이 그대로 남았다. CSS 파서가 이 선언을 통째로 버리므로 **`<body>`는 Pretendard를 상속받지 못하고 브라우저 기본 한글 폰트(Windows=맑은 고딕)로 렌더링된다.** 명시적으로 Pretendard를 지정한 13개 선택자만 살아 있는 상태. 같은 버그가 Design-system 원본에도 있다(`globals.css` L106 `--font-sans:var(--font-sans)` — 자기 참조 순환). **이건 반드시 고친다.**

---

## 1. 폰트 로딩 방식 — ✅ 변경 없음 (현행 CDN 유지 확정)

**사용자 확정:** 현행 그대로 유지한다. Design-system self-host나 눈누 CDN으로 **바꾸지 않는다.**

```html
<!-- skin.html L19 — 그대로 둔다 -->
<link rel="stylesheet" as="style" crossorigin="anonymous"
  href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"/>
```
orioncactus 공식 Pretendard **변수 폰트**(100~900 무단계) + 한글 동적 서브셋. `<link rel="preconnect" href="https://cdn.jsdelivr.net">`(L17)도 이미 걸려 있다. **폰트 파일 추가·교체·`@font-face` 신규 선언 모두 불필요.**

**단, `font-family` 선언 자체는 고쳐야 한다** (§0의 별건 버그 — 폰트 *로딩*이 아니라 폰트 *적용* 문제):
```css
/* style.css pretty L2117 — 무효 선언 */
body { font-family: --value(--font-sans); }

/* → 이렇게 */
:root { --font-sans: 'Pretendard Variable', Pretendard, -apple-system, 'Apple SD Gothic Neo',
                     system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji'; }
body { font-family: var(--font-sans); }
```
스택의 첫 항목 `'Pretendard Variable'`은 위 CDN이 정의하는 이름과 정확히 일치하며, 스킨의 기존 13개 명시 선언과도 동일하다. `font-display`는 CDN CSS가 이미 처리한다.

---

## 2. 요구사항별 감사표

판정: **✅ 이미 충족** / **🔶 존재하지만 세부 다름** / **❌ 없음(신규 구현)**

### 2‑1. 전역 / 레이아웃

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 반응형 3단, 767px 이하 모바일 | ✅ | CSS 미디어쿼리 실측: `min-width:768px` 20회, `min-width:1024px` 4회. `script.js` L133 `_mobileBreakpoint = 767` | 브레이크포인트 자체는 정확히 일치. 다만 `640/480/600/1280/1440` 잔여 사용 7건은 §4에서 정리 |
| 모바일에서 헤더 메뉴 → 사이드바 이동 | ✅ | 헤더 `<nav class="md:flex ... hidden">` (L61) + 사이드바 안에 `<section class="flex md:hidden ... category-section">` Menu 블록 중복 배치(L128) + `#menu-toggle-btn class="md:hidden"` (L38) | 색/타이포만 |
| 오프캔버스 드로어 동작 | ✅ | `toggleSidebar()` / `closeSidebar()` — `-translate-x-full` ↔ `translate-x-0`, `#sidebar-overlay` 페이드, 열릴 때 `header-hide`(`top:-57px`) | 색/타이포만 |
| 스크롤 인디케이터 | 🔶 | `#scroll-progress` (skin.html L34), `document.addEventListener("scroll")` 에서 `style.width = %` (script.js L387‑395) | **두께가 1px**(래퍼 2px 안에 `h-[1px]`)로 사실상 안 보임 · 색이 `bg-jq-300`(뮤트 회색)이라 진행률로 안 읽힘 · scroll 핸들러에 rAF 스로틀 없음. §7‑7에서 재정의 |
| 테마설정 3-상태 + 시스템 감지 + 로컬 저장 | ✅ | `script.js` L356‑378, L405‑417: `localStorage.getItem("theme") \|\| "system"`, `matchMedia("(prefers-color-scheme: dark)")` + `change` 리스너, `.btn-theme[data-theme]` 3개(system/light/dark, skin.html L1116/1129/1152), `htmlEl.classList.toggle("dark", isDark)` | **요구사항을 완전히 충족.** 토큰 스위칭 방식도 Design-system과 동일(`.dark` 클래스). 색만 교체 |
| 하단 Top 버튼 | 🔶 | `#scroll-top-btn.btn-top` (skin.html L1164), `script.js` L382 클릭 → `scrollTo top` | **노출 조건이 전혀 없어 항상 떠 있다.** 스크롤 0에서도 보임. §7‑7에서 조건부 노출 추가 |
| 코드 하이라이팅 | ❌ | `style.css` 전체에 `hljs` / `.token` / `.language-` **0건**. `#article-editor pre code`는 배경 `rgb(40 44 52)` + 글자 `rgb(209 213 219)` **하드코딩 단색**이며 라이트/다크 구분도 없음 | **문법 강조 자체가 없다.** 신규 구현 필요 — §7‑8 |
| 이전 글 / 다음 글 | ✅ | `#prev-next-container.fade-target` + `#bottom-anchor` IntersectionObserver(threshold .05), 개별 닫기 버튼(`#post-prev-close`/`#post-next-close`) (script.js L164‑202) | PC 전용(`window.innerWidth < 767` 시 미동작)은 의도된 설계로 보임. 색/타이포만 |
| 코드 복사 버튼 | ✅(보너스) | `initialCodeBlock()` — `pre` 우상단 24px 히트영역 클릭 시 클립보드 복사 + `.my-checked` 피드백 | 요구사항엔 없었으나 이미 있음. 유지 |

### 2‑2. 헤더

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 프로필 사진 노출 | ✅ | `<s_if_var_header-image>` + `<img class="hidden md:flex w-6 h-6 rounded-full">` (L50‑52), index.xml `header-image` BOOL 기본 true | 24px 원형, 모바일 숨김(index.xml 설명과 일치). 크기만 §7‑1에서 조정 |
| 로고 높이 24px / 최대 가로 160px | ✅ | `<img class="h-6 max-h-6 max-w-40 header-logo">` (L54) = 24px / 160px **정확히 일치** | 세로형 로고 대응만 추가(§7‑1) |
| 티스토리 메뉴바/구독 자리 | ✅ | `#menu-toolbar` 컨테이너(L72) + `TistoryMenuToolbarAppend()`가 티스토리가 주입한 `#menubar_wrapper`를 여기로 이동(script.js L396‑404). `#btn-subscription`에 서브도메인 자동 주입(L360‑364) | 스킨 쪽 준비 완료. **관리자 설정 안내만 산출물에 포함**(§10) |

### 2‑3. 리스트

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 썸네일 3종(사각/원형/둥근사각) | 🔶 | index.xml `list-template-radius` SELECT — 값 `rounded-none` / `rounded-full` / `rounded-lg`. 마크업은 `.list-thumb ... [##_var_list-template-radius_##]` (L378/952/995/1038) | **버그: `<default>rectangle</default>` 인데 옵션의 `value`는 `rounded-none`이다.** default가 어떤 value와도 일치하지 않아 초기 선택이 비거나 클래스가 `rectangle`로 나갈 수 있다 → `rounded-none`으로 수정. 또한 **원형(`rounded-full`)은 3:2·3:4 비율 썸네일에 적용되면 타원이 된다** — §7‑4에서 처리 |
| 리스트형 / 카드형 / 썸네일형 3종 | ✅ | index.xml `list-type` SELECT 3종 + CSS `.list-type-default` / `.list-type-card` / `.list-type-thumbnail` 전용 규칙 블록(pretty L2178‑2339) | 색/타이포만 |
| 리스트형 모바일 1칼럼 세로 스택 | ✅ | `.list-type-default .list-link { flex-direction: column }` → `@media(min-width:768px){ flex-direction: row }` (L2188‑2195) | 그대로 |
| 카드형·썸네일형 PC 3 / 태블릿 2 / 모바일 1 | ✅ | 두 타입 모두 `grid-template-columns: repeat(1,...)` → `@768 repeat(2,...)` → `@1024 repeat(3,...)` (L2248‑2261, L2298‑2311) | **요구사항과 정확히 일치.** gap만 §7‑4에서 조정 |
| 카드형 3:2 / 썸네일형 3:4 | ✅ | `.list-type-card .list-thumb { aspect-ratio: 3/2 }` (L2284) · `.list-type-thumbnail .list-thumb { aspect-ratio: 3/4 }` (L2324) | 그대로 |

### 2‑4. 커버 (홈 배너)

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 와이드 배너 형태 | ✅ | `<s_cover name="banner">`, `<img class="w-full h-[250px] object-cover">` (L911) | 높이가 **전 해상도 250px 고정** — 디바이스별 대응 없음. §7‑3 |
| 여러 항목 세로 스택 | ✅ | `<ul class="banner-list w-full flex flex-col">` (L905) | 그대로 |
| **텍스트 좌/우 교차 노출** | ✅ | `.banner-list li:nth-child(2n) a .inner { align-items: flex-start }` / `li:nth-child(odd) a .inner { align-items: flex-end }` (pretty L2174‑2177). `.inner`가 `flex-col`이므로 `align-items`는 **가로 정렬**을 제어 → 홀수=우측, 짝수=좌측 | **1차 해석이 맞았고 이미 구현돼 있다.** 다만 (a) 홀수 항목이 먼저 **우측**부터 시작한다 (b) `sm:max-w-[60%]`라 640px 미만에서는 100% 폭이라 교차가 시각적으로 사라진다. §7‑3 + §8‑Q1 |
| **제목 + 설명 포함** | 🔶 | 배너 마크업에 `[##_cover_item_title_##]`만 있고 **`[##_cover_item_summary_##]`가 없다** (L914). 대신 "READ MORE" 버튼만 있음 | **설명 텍스트가 빠져 있다.** 마크업 1줄 추가 필요 — §7‑3, §9‑1 |
| 디바이스별 배너 미리보기 | 🔶 | 반응형 값이 `md:mt-16`, `md:text-3xl`, `sm:max-w-[60%]` 뿐 | PC/태블릿/모바일 3단 치수 확정 — §7‑3 |

### 2‑5. 본문

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 대표이미지 default / wide 2종 | 🔶 | index.xml `featured-img-type` SELECT(default/wide, 기본 wide, 라벨 "높이 192px"). CSS `.post-featured { height: 12rem }` = **두 타입 공통 192px 고정**. `.wide`만 `@768 { opacity: 0 }` 후 JS `resizePostFeatured()`가 뷰포트 우측 끝까지 폭을 늘리고 `.img-show`로 나타냄 | **두 타입의 "비율"이 실제로는 동일하다** — 차이는 높이/비율이 아니라 *우측 풀블리드 여부*뿐. 요구사항의 "기본 비율 / 와이드 비율"과 어긋남 → §7‑5에서 비율 분리 · **`.wide`가 `opacity:0`으로 시작해 JS 실패 시 이미지가 영영 안 보이는 취약점**도 함께 수정 |

### 2‑6. TOC

| 요구사항 | 판정 | 실측 근거 | 차이 / 할 일 |
|---|---|---|---|
| 본문 제목 스캔 자동 생성 | ✅ | `initPostsIndex()` — `#article-editor .contents_style` 안의 `h2, h3, h4` 수집, 템플릿 `li` 복제, IntersectionObserver로 `.active` 하이라이트 (script.js L276‑355) | `h1`은 제외(의도된 설계 — 티스토리 본문에서 h1은 글 제목). 들여쓰기 `pl-0/pl-3/pl-6` |
| 플로팅 버튼, 우측 배치, 클릭 펼침/닫힘 | ✅ | `#post-index-btn` (`fixed top-20 md:top-80 right-6`) / `#post-index` (`fixed w-48 right-0`, `translate-x-full` ↔ `translate-x-0`) · 포스트 페이지에서만 노출(`#tt-body-page #post-index-btn { display:flex }`) | 위치/크기 §7‑6 |
| **19개까지 노출, 초과 시 내부 스크롤** | 🔶 | `max-h-[500px] overflow-y-auto no-scrollbar` (skin.html L881) — **내부 스크롤 자체는 이미 있다.** 다만 항목 1개 높이 = `text-sm/4`(14px/16px) + `py-1`(8px) = **24px**, `gap-1` 4px → 19개 = 19×24 + 18×4 = **528px > 500px** | **19개를 못 채우고 17~18개에서 잘린다.** 게다가 `md:top-80`(=320px)에서 시작하므로 500px 패널만 해도 하단이 820px — 노트북(≈900px 뷰포트)에서 이미 빠듯. §7‑6에서 위치·max-height 동시 재설계 |

---

## 3. 컬러 토큰 — 라이트 / 다크

### 3‑1. 교체 방식

베이스 스킨은 **이미** `:root` + `.dark` 15개 토큰 구조를 갖고 있고, 스킨 전역이 `rgb(var(--color-jq-N) / <alpha>)`로 이 토큰만 참조한다. 따라서 **재도색의 본체는 이 두 블록의 값 15×2개를 바꾸는 것**이다. 개별 선택자를 찾아다닐 필요가 없다.

> **형식 주의:** 이 스킨은 `rgb(var(--token) / <alpha>)` 패턴을 쓰므로 토큰 값은 **반드시 공백 구분 RGB 3개 숫자**여야 한다(`#f5f5f5` 같은 hex를 넣으면 `rgb()`가 무효가 되어 그 규칙 전체가 죽는다). Design-system은 hex로 정의돼 있으므로 **변환해서 넣는다.** 아래 표에 변환값을 이미 적어 두었다.

### 3‑2. 토큰 의미 (베이스 스킨 실사용에서 도출)

이 스킬의 `jq` 스케일은 색상 램프가 아니라 **강조도(foreground) + 표면고도(surface) 혼합 스케일**이며, 라이트/다크에서 역할이 뒤집힌다.

- `100`(가장 강한 본문/제목) → `200`(보조) → `300`(뮤트/메타) → `400`(서브틀) = **전경**
- `500`(호버/상승 표면) · `600`(강한 경계) · `700`(패널/칩 표면) · `800`(깊은 표면) · `900`(가장 깊은 표면) = **배경**
- `on-surface` = 최대 대비 전경(호버 종착점), `jq-bg` = 페이지 배경, `jq-line` = 헤어라인, `jq-default` = body 기본 텍스트, `primary` = 단일 액센트

### 3‑3. 교체표

| 토큰 | 역할 | **라이트 (현행 → 신규)** | **다크 (현행 → 신규)** | Design-system 출처 |
|---|---|---|---|---|
| `--color-jq-bg` | 페이지 배경 | `255 255 255` → **`255 255 255`** (#fff) | `33 35 38` → **`10 10 10`** (#0a0a0a) | `--background` |
| `--color-surface` | 기본 표면 | `255 255 255` → **`255 255 255`** | `0 0 0` → **`23 23 23`** (#171717) | `--card` |
| `--color-on-surface` | 최대 대비 전경 | `23 25 27` → **`0 0 0`** (#000) | `255 255 255` → **`250 250 250`** (#fafafa) | `--foreground` |
| `--color-jq-default` | body 기본 텍스트 | `31 41 55` → **`23 23 23`** (#171717) | `209 213 219` → **`212 212 212`** (#d4d4d4) | `--secondary-foreground` |
| `--color-jq-100` | 강한 전경(제목/링크) | `23 25 27` → **`23 23 23`** (#171717) | `229 231 235` → **`229 229 229`** (#e5e5e5) | 라이트 `--secondary-foreground` / 다크 `--primary` |
| `--color-jq-200` | 보조 전경 | `26 28 30` → **`64 64 64`** (#404040) | `209 213 219` → **`212 212 212`** (#d4d4d4) | neutral‑700 / neutral‑300 |
| `--color-jq-300` | 뮤트 전경(메타/캡션) | `107 114 128` → **`115 115 115`** (#737373) | `156 163 175` → **`161 161 161`** (#a1a1a1) | `--muted-foreground` |
| `--color-jq-400` | 서브틀 전경 | `156 163 175` → **`161 161 161`** (#a1a1a1) | `107 114 128` → **`115 115 115`** (#737373) | `--ring` |
| `--color-jq-500` | 호버/상승 표면 | `244 244 244` → **`245 245 245`** (#f5f5f5) | `67 72 83` → **`64 64 64`** (#404040) | 라이트 `--muted`/`--accent` / 다크 `--accent` |
| `--color-jq-600` | 강한 경계·선택 표면 | `209 213 219` → **`212 212 212`** (#d4d4d4) | `46 52 65` → **`38 38 38`** (#262626) | neutral‑300 / `--secondary` |
| `--color-jq-700` | 패널/칩 표면 | `232 232 235` → **`237 237 237`** (#ededed) | `48 51 59` → **`42 42 42`** (#2a2a2a) | neutral‑200 근사 / `--secondary` 상단 |
| `--color-jq-800` | 깊은 표면 | `231 231 231` → **`233 233 233`** (#e9e9e9) | `26 28 30` → **`23 23 23`** (#171717) | `--card` (dark) |
| `--color-jq-900` | 가장 깊은 표면 | `226 226 228` → **`229 229 229`** (#e5e5e5) | `23 25 27` → **`22 22 22`** (#161616) | `--border` / `--surface` (dark) |
| `--color-jq-line` | 헤어라인 | `226 226 228` → **`229 229 229`** (#e5e5e5) | `83 91 110` → **`38 38 38`** (#262626) | `--border` (다크의 `#ffffff1a`를 #0a0a0a 위에 합성한 불투명값) |
| `--color-primary` | 단일 액센트 | `125 211 252` → **`20 71 230`** (#1447e6) | `125 211 252` → **`142 197 255`** (#8ec5ff) | `--sidebar-primary`(dark) / `--chart-1`(blue‑300) — §8‑Q2 확인 필요 |

**명도 순서 보존 검증** (베이스 스킨의 상대 관계를 그대로 유지했는지):
- 라이트 표면: 현행 `500(244) > 700(232) > 800(231) > 900(226) > 600(209)` → 신규 `500(245) > 700(237) > 800(233) > 900(229) > 600(212)` ✅ 동일 순서
- 다크 표면: 현행 `500 > 700 > 600 > 800 > 900` → 신규 `500(#404040) > 700(#2a2a2a) > 600(#262626) > 800(#171717) > 900(#161616)` ✅ 동일 순서

**의도적 예외 1건 — 다크 플로팅 칩:** 베이스는 다크에서 `jq-900`(#17191b)이 `jq-bg`(#212326)보다 *어두워* 플로팅 컨트롤(`.btn-top`, 테마 버튼 레일 `dark:bg-jq-900`)이 "파인" 것처럼 보였다. 신규 다크 배경은 #0a0a0a로 훨씬 어두워지므로 같은 관계를 유지하면 칩이 사라진다. `jq-900`을 배경보다 **밝게**(#161616) 두어 칩이 떠 보이게 뒤집었다. 이건 값 교체가 아니라 관계 전환이므로 명시해 둔다.

### 3‑4. 하드코딩 색 정리 (토큰화 대상)

토큰을 안 거치고 박혀 있는 색들. 재도색 시 함께 처리한다.

| 위치 | 현재 | 교체 |
|---|---|---|
| `#article-editor pre code` (pretty L627/630) | `background: rgb(40 44 52)` / `color: rgb(209 213 219)` — 라이트/다크 동일 | §7‑8 코드블록 토큰으로 |
| `#article-editor code` 인라인 (L385) | `color: rgb(231 73 146)` (핑크) | `rgb(var(--color-primary))`, 배경은 `rgb(var(--color-jq-700) / .9)` 유지 |
| 배너 오버레이 (skin.html L913/915) | `bg-black/40`, `bg-black/50`, `hover:bg-black/70` | §7‑3 그라디언트로 교체 |
| `::selection` (pretty L2066) | `rgb(var(--color-primary) / .8)` + `color:#fffffff2` | 글자색을 `rgb(var(--color-primary-foreground))` 대응값으로 |

---

## 4. 브레이크포인트 확정

| 단계 | 범위 | Tailwind 접두사 | 근거 |
|---|---|---|---|
| **모바일** | `~ 767px` | (기본) | 요구사항 명시. `script.js` `_mobileBreakpoint = 767`과 일치 |
| **태블릿** | `768px ~ 1023px` | `md:` | **관례값 — 사용자 미지정 항목.** 베이스 스킨의 실제 `md`(768) 경계와 일치하므로 이 값을 채택하면 추가 작업이 0이다. §8‑Q3 |
| **PC** | `1024px ~` | `lg:` | 리스트 3열 전환점(`min-width:1024px`)과 일치 |

**콘텐츠 최대 폭:** `max-w-screen-xl` = **1280px** (본문 래퍼 + 푸터, skin.html L79/L1177). 유지.

**정리 대상 잔여 브레이크포인트:**
- `min-width: 640px` 4건 — 배너 `sm:max-w-[60%]` 등. **768px로 통일**(§7‑3)해 3단 체계를 깨지 않게 한다.
- `min-width: 480px` 1건 / `max-width: 600px` 2건 / `min-width: 1280px` 1건 / `min-width: 1440px` 1건 — 티스토리 댓글·광고 영역 등 주변부. 시각 회귀가 없는지만 확인하고 그대로 둔다.

**⚠️ 루트 폰트 크기 이슈:**
```css
html { font-size: 16px }
@media (max-width: 767px) { html { font-size: 17px } }   /* pretty L2061‑2064 */
```
모바일에서 루트가 17px이라 **모든 rem 값이 6.25% 부풀어 오른다.** 아래 §5 타이포 스케일은 16px 기준 px 의도를 갖고 설계했으므로 이 오버라이드와 충돌한다. **`html { font-size: 16px }`로 통일하고 모바일 오버라이드를 제거**한다. 모바일에서 본문이 작게 느껴지면 rem을 부풀리는 대신 §5의 *본문 전용* 크기만 키운다(전역 확대는 헤더·버튼·TOC까지 같이 커져 레이아웃이 깨진다).

---

## 5. 타이포그래피 스케일

### 5‑1. 원칙

`pretendard-typography` 스킬 스케일을 **그대로** 따른다. Design-system의 `--tracking-tight:-0.025em` / `--tracking-normal:0em` / `--tracking-wide:.025em`는 라틴 기준이라 **채택하지 않는다**(스킬 §토큰 추출 절차 2항의 지시). 굵기는 **400/500/600/700 4단계만** 사용한다.

토큰은 새로 만들지 말고 베이스 스킨의 `:root`에 `pretendard-typography`의 `--text-*` / `--leading-*` / `--tracking-*` 세트를 **추가**한 뒤, 아래 클래스들이 그 변수를 참조하게 한다.

### 5‑2. 스킨 클래스 ↔ 스케일 매핑

| 스킨 선택자 | 현재 값 (실측) | **신규 값** | 스케일 |
|---|---|---|---|
| `body` | `font-family: --value(--font-sans)` **(무효)**, 400, `text-sm` | `font-family: var(--font-sans)`, 400, 0.875rem / 1.5 / **-0.008em** | Small (UI 셸 기준) |
| `.title-h1` | 1.625rem/2rem, **-0.05em**, weight 미지정 → `@768` 2rem/2.5rem | 모바일 **1.75rem / 1.25 / 700 / -0.02em** · `@768` **2.25rem / 1.25 / 700 / -0.02em** | H1 |
| `.title-h2` | 1.5rem/2rem, 500, -0.025em → `@768` 1.625rem/2rem | 모바일 **1.5rem / 1.3 / 600 / -0.018em** · `@768` **1.875rem / 1.3 / 600 / -0.018em** | H2 |
| `.title-h3` | 1.5rem/2rem, -0.025em, weight 미지정 | **1.5rem / 1.35 / 600 / -0.015em** | H3 |
| `.title-h4` | 1rem/1.75rem, **-0.05em** | **1.25rem / 1.4 / 600 / -0.012em** | H4 |
| `.title-mono-sm` | mono, .875rem/1.5rem, 500, uppercase, **+0.1em** | mono, 0.875rem / 1.5 / 500, uppercase, **+0.08em** — **양수 자간 유지** | ⬇ 예외 |
| `.title-mono-xs` | mono, .75rem/1.5rem, 500, uppercase, **+0.1em** | mono, 0.75rem / 1.5 / 500, uppercase, **+0.08em** — **양수 자간 유지** | ⬇ 예외 |
| `.list-type-default .title` | 1.25rem/1.5rem **-0.05em** → `@768` 1.5rem/2rem | 모바일 **1.25rem / 1.4 / 600 / -0.012em** · `@768` **1.5rem / 1.35 / 600 / -0.015em** | H4 → H3 |
| `.list-type-card .title` | 1.125rem/1.75rem, **0em** | **1.125rem / 1.4 / 600 / -0.012em** | H4 축소 |
| `.list-type-thumbnail .title` | 1rem/1.5rem, **0em** | **1rem / 1.4 / 600 / -0.01em** | Body/600 |
| `.list-box .desc` (카테고리·날짜) | `text-sm/4` = 0.875rem / **1rem** | **0.875rem / 1.5 / 400 / -0.008em** | Small |
| `.list-box .summary` | 0.9375rem / 1.5rem | **1rem / 1.5 / 400 / -0.01em** (`line-clamp-3` 유지) | Body |
| 배너 `.title` | `text-2xl/tight` → `md:text-3xl/tight`, 600, **tracking-tighter(-0.05em)** | 모바일 **1.5rem / 1.3 / 600 / -0.018em** · `@768` **1.875rem / 1.3 / 600 / -0.018em** | H2 |
| 배너 설명 *(신규)* | — | **1rem / 1.6 / 400 / -0.01em**, `line-clamp-2` | Lead 축소 |
| `#tt-body-page h2[data-ke-size]` | 1.625rem/2rem, 600, -0.025em | **1.875rem / 1.3 / 600 / -0.018em** | H2 |
| `#tt-body-page h3[data-ke-size]` | 1.375rem/1.75rem, 600, -0.025em | **1.5rem / 1.35 / 600 / -0.015em** | H3 |
| `#tt-body-page h4[data-ke-size]` | 1.25rem/1.75rem, **500** | **1.25rem / 1.4 / 600 / -0.012em** | H4 |
| 본문 문단 `#article-editor p` | 크기 미지정(상속), `margin-bottom: 1rem` | **1.0625rem(17px) / 1.75 / 400 / -0.01em**, `margin-bottom: 1.25rem` | ⬇ 예외 |
| TOC `li a` | `text-sm/4` = 0.875rem / 1rem | **0.875rem / 1.4 / 500 / -0.008em** | Label |
| 버튼류(`.btn-top`, READ MORE, more) | `text-base` / `text-xs` 혼재 | **0.875rem / 1.4 / 500 / -0.008em** | Label |

### 5‑3. 의도적 예외 3건 (규칙 위반 아님 — 명시적 허용)

1. **`.title-mono-*` 의 양수 자간 + uppercase.** `pretendard-typography` 원칙 1은 *"영문 라벨·태그 등 예외 제외"*를 명시한다. 이 두 클래스는 `VISITOR`, `Menu`, 카테고리명 같은 **모노스페이스 영문 라벨 전용**이며 한글 본문에 쓰이지 않는다. 자간을 죽이면 이 스킨의 시각적 서명이 사라진다. `+0.1em → +0.08em`으로만 완화하고 유지한다.
2. **본문 문단 행간 1.75.** 스킬 본문 기준은 1.5지만 그건 *UI 텍스트* 기준이다. 이 블로그는 장문 읽기 화면(Read 모드)이므로 행간을 1.75로 넉넉하게 둔다. 크기도 17px로 UI(14px)보다 크게 분리한다.
3. **`word-break: keep-all`** 을 본문 문단·요약문·배너 설명·리드 문구에 적용해 한글 어절 단위 줄바꿈을 보장한다(스킬 적용 규칙).

### 5‑4. 검증 체크리스트 (qa-inspector 인계)

- [ ] `body`의 `font-family`가 유효한 선언이며 실제로 Pretendard로 렌더링된다 (개발자도구 Computed에서 확인 — `--value(...)` 잔재 없음)
- [ ] 헤딩류(`.title-h1~h4`, 본문 h2~h4)에 양수 자간이 없다
- [ ] `-0.05em` 이하의 과도한 음수 자간이 남아 있지 않다 (현행 `.title-h1`, `.title-h4`, `list-type-default .title`, 배너 `tracking-tighter` 4곳이 대상)
- [ ] 굵기가 400/500/600/700 외 값을 쓰지 않는다
- [ ] `html`의 모바일 17px 오버라이드가 제거됐다
- [ ] 다크모드에서 크기/굵기/자간이 라이트와 동일하고 **색만** 다르다

---

## 6. 테마 — 기본값 결정 로직

베이스 구현(`script.js` L356‑378, 405‑417)이 요구사항을 이미 충족한다. **로직은 손대지 않고** 아래만 확인·보강한다.

```
1. localStorage["theme"] 읽기 → 없으면 "system"
2. "system"  → matchMedia("(prefers-color-scheme: dark)").matches 로 결정
   "light"   → 강제 라이트
   "dark"    → 강제 다크
3. document.documentElement.classList.toggle("dark", isDark)
4. localStorage["theme"] = 선택값  (재방문 유지)
5. OS 설정 변경 시: userTheme === "system" 일 때만 재적용
```

**보강 1 — FOUC 제거.** `<html class="dark">`가 마크업에 **하드코딩**돼 있고(skin.html L2) `script.js`는 `DOMContentLoaded`에서야 보정한다. 라이트 사용자는 **첫 페인트가 다크로 깜빡인다.** `<head>` 안쪽, `style.css` 링크 **직후**에 인라인 동기 스크립트를 넣어 파싱 시점에 클래스를 결정한다:
```html
<script>(function(){try{var t=localStorage.getItem('theme')||'system';
var d=t==='dark'||(t==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);
document.documentElement.classList.toggle('dark',d);}catch(e){}})();</script>
```
그리고 `<html>`의 하드코딩 `class="dark"`는 제거한다.

**보강 2 — `color-scheme`.** `:root { color-scheme: light }` / `.dark { color-scheme: dark }`를 추가해 스크롤바·폼 컨트롤·`::selection` 기본값이 테마를 따라가게 한다.

**보강 3 — 테마 버튼 상태 표시.** 현재 `.btn-theme[data-selected=true] { color: on-surface }` 뿐이라 선택 상태가 약하다. 선택된 버튼에 `background: rgb(var(--color-jq-bg))` + `--radius-full` 필(pill)을 주어 3개 중 어느 것이 활성인지 즉시 읽히게 한다.

---

## 7. 컴포넌트별 상세 스펙

각 항목 = **적용 선택자 → 바꿀 값**. 선택자는 실측 확인된 것만 적었다.

### 7‑1. 헤더 — `#header`

| 속성 | 현재 | 신규 |
|---|---|---|
| 높이 | `h-[57px]` (+ `body { padding-top: 57px }`) | **`h-14`(56px)** 로 통일, `body { padding-top: 56px }`. 57은 1px 경계 포함 잔재 |
| 배경 | `bg-jq-bg` / `md:backdrop-blur md:bg-jq-bg/50` | `bg-[rgb(var(--color-jq-bg)/.72)]` + `backdrop-blur-md` **전 해상도 적용**(모바일에서도 반투명이 자연스럽다) |
| 하단 경계 | `dark:border-b-jq-line/20` — **다크에만 있음** | 라이트/다크 **모두** `border-bottom: 1px solid rgb(var(--color-jq-line))`. 라이트에서 경계가 없어 스크롤 시 콘텐츠가 헤더로 흘러드는 문제 해결 |
| 좌우 패딩 | `px-6` | `px-6` 유지 · `lg:px-8` 추가 |
| 프로필 사진 | `w-6 h-6 rounded-full`, `hidden md:flex` | **`size-7`(28px)** 로 확대, `rounded-full`, `border: 1px solid rgb(var(--color-jq-line))`. 모바일 숨김 유지(index.xml 설명과 일치) |
| 로고 | `h-6 max-h-6 max-w-40` | **유지**(24px / 160px 요구사항 정확 일치) + `object-fit: contain; object-position: left center` 추가 → **세로형 로고**가 들어와도 24px 높이에 맞춰 축소되고 좌측 정렬을 유지한다 |
| 로고 다크 반전 | `.header-logo` (index.xml 안내: "투명 png 검은 로고면 테마에 맞춰 반전") | `.dark .header-logo { filter: invert(1) }` 가 실제로 걸려 있는지 확인 후, 없으면 추가 |
| 블로그명(로고 미설정 시) | `text-[20px] font-medium tracking-tight` | **1.125rem / 1.4 / 600 / -0.012em**, 색 `rgb(var(--color-jq-100))` |
| 헤더 nav 링크 | `.link-strong-hover-undeline` | Label 스케일. 기본 `jq-300`, hover `on-surface` + `text-decoration: underline; text-underline-offset: 6px; text-decoration-color: rgb(var(--color-primary))` |
| 햄버거 `#menu-toggle-btn` | `md:hidden size-[28px]` | `size-9`(36px) — 터치 타겟 확대. 아이콘은 `size-5` 유지 |
| 구독 버튼 `#btn-subscription` | `hidden md:flex` | 배경 `rgb(var(--color-jq-100))`, 글자 `rgb(var(--color-jq-bg))`, `border-radius: var(--radius-md)`, `h-8 px-3`, Label 스케일. hover 시 `opacity:.88` |

### 7‑2. 사이드바 — `#sidebar`

| 속성 | 현재 | 신규 |
|---|---|---|
| 폭 | 모바일 `w-[288px]` · `md:w-1/5 lg:w-1/5` | 모바일 `w-[300px]` · **태블릿 `md:w-[200px]`(고정)** · **PC `lg:w-[240px]`(고정)**. `w-1/5`는 1280px에서 256px, 768px에서 154px로 태블릿에서 지나치게 좁아진다 |
| 본문과의 간격 | `gap-14`(56px) | 태블릿 `md:gap-10`(40px) · PC `lg:gap-14` 유지 |
| 모바일 배경 | `bg-jq-bg md:bg-transparent` | 유지 + 모바일 시 우측 `border-right: 1px solid rgb(var(--color-jq-line))` 및 `box-shadow: 0 0 40px rgb(0 0 0 / .28)` |
| 오버레이 `#sidebar-overlay` | 클래스 토글만 | `background: rgb(0 0 0 / .5)` + `backdrop-filter: blur(2px)`, `transition: opacity .3s` |
| 섹션 제목 `.sidebar-section__title` | `.title-mono-xs` | 유지(§5‑3 예외 1). 색 `rgb(var(--color-jq-400))` |
| 섹션 간 간격 | `gap-9`(36px) | `gap-8`(32px) |
| 검색 입력 `.search__input` | `bg-jq-500` focus 시 유지 | 배경 `rgb(var(--color-jq-500))`, `border: 1px solid transparent`, focus 시 `border-color: rgb(var(--color-jq-600))` + `outline: 2px solid rgb(var(--color-primary) / .35); outline-offset: 1px`. `border-radius: var(--radius-md)`, 높이 40px |
| 카테고리 `.tt_category .link_tit` | `link_tit` | Label 스케일, 기본 `jq-300`, hover `jq-100` + `background: rgb(var(--color-jq-500))`, `border-radius: var(--radius-sm)`, `padding: 6px 8px`, `margin-inline: -8px` |
| 방문자 수치 | `font-bold text-base` | `font-variant-numeric: tabular-nums`, 0.9375rem / 600 / `jq-100`. 라벨은 Caption / `jq-400` |

### 7‑3. 커버 배너 — `.banner-list` / `.banner-box`

**교차 정렬은 이미 동작하므로 로직을 새로 만들지 않는다.** 아래는 그 위에 얹는 치수·색·타이포 스펙이다.

| 속성 | 현재 | 신규 |
|---|---|---|
| **높이 (모바일 ~767)** | `h-[250px]` 고정 | **`aspect-ratio: 4/3; max-height: 260px`** |
| **높이 (태블릿 768~1023)** | 동일 250px | **`height: 280px`** |
| **높이 (PC 1024~)** | 동일 250px | **`height: 340px`** |
| 항목 간 간격 | 없음(`flex-col`, gap 0 — 배너가 서로 붙어 있다) | **`gap: 12px`** (모바일 `gap: 10px`) |
| 모서리 | 없음(직각) | **`border-radius: var(--radius-lg)`** (0.625rem) + `overflow: hidden` — `.banner-box > a`에 적용 |
| 오버레이 | `bg-black/40`, hover `backdrop-blur-sm` | **단색 → 방향성 그라디언트로 교체.** 홀수(우측 정렬) `linear-gradient(270deg, rgb(0 0 0 / .72) 0%, rgb(0 0 0 / .45) 45%, rgb(0 0 0 / .12) 100%)`, 짝수(좌측 정렬) `90deg` 로 좌우 반전. **텍스트가 있는 쪽만 어둡게** 해 교차 배치가 시각적으로 읽히게 만든다(현행 균일 40% 딤은 좌우 교대가 눈에 안 띈다) |
| hover | `group-hover:backdrop-blur-sm` | 그라디언트 불투명도 +0.1 · 이미지 `transform: scale(1.04)` (`transition: transform .5s cubic-bezier(.2,.6,.2,1)`) · `backdrop-blur` 제거(모바일 GPU 부담) |
| 제목 | `text-2xl/tight md:text-3xl/tight`, 600, `tracking-tighter`, `text-jq-500 dark:text-jq-100`, `mt-10 md:mt-16`, `max-w-full sm:max-w-[60%]`, `line-clamp-2` | §5‑2 배너 스케일. 색 **`#fff` 고정**(오버레이 위에 얹히므로 테마 무관 — 현행 `text-jq-500 dark:text-jq-100`은 라이트에서 #f5f5f5, 다크에서 #e5e5e5로 사실상 둘 다 흰색이라 토큰만 낭비된다). `text-shadow: 0 1px 3px rgb(0 0 0 / .35)`. 폭 **`max-w-full md:max-w-[58%]`** (640 → 768로 상향, §4 3단 체계와 통일) |
| **설명 (신규)** | **없음** | `[##_cover_item_summary_##]` 를 제목 아래 **`margin-top: 10px`** 에 추가. 1rem / 1.6 / 400 / -0.01em, `color: rgb(255 255 255 / .82)`, `line-clamp-2`, `word-break: keep-all`, 폭은 제목과 동일. **모바일(~767)에서는 `line-clamp-1`** (260px 높이에 제목 2줄 + 설명 2줄 + 버튼은 과밀) |
| READ MORE 버튼 | `w-28`, `bg-black/50` hover `bg-black/70`, `text-xs`, 600, `rounded-md` | Label 스케일 · `background: rgb(255 255 255 / .14)` + `backdrop-filter: blur(8px)` + `border: 1px solid rgb(255 255 255 / .28)` · hover `background: rgb(255 255 255 / .96); color: rgb(var(--color-jq-100))` · 화살표 아이콘 hover 시 `translateX(3px)` |
| 텍스트 블록 패딩 | `p-6 md:p-8` | 모바일 `p-5` · 태블릿 `p-7` · PC `p-9` |
| 상단 여백 | `mt-10 md:mt-16` (제목을 아래로 밀어 내리는 값) | **제거하고 `justify-content: center` 로 교체** — 고정 mt는 높이가 3단으로 달라지면 깨진다 |
| **모바일 교차 정렬** | `sm:max-w-[60%]`(640) 때문에 640 미만은 100% 폭 = 교차 무의미 | **~767px에서는 교차를 끄고 전부 좌측 정렬.** 360px 폭에서 우측 정렬은 "일관성 없음"으로 읽히지 교차로 읽히지 않는다. `@media(min-width:768px)` 안으로 `nth-child` 규칙을 옮긴다 |
| 시작 방향 | 홀수 = **우측** (`nth-child(odd) → flex-end`) | **좌측부터 시작**으로 뒤집기 권장 → `nth-child(odd) { align-items: flex-start }` / `nth-child(2n) { align-items: flex-end }`. §8‑Q1 확인 |

> **index.xml 동기화:** 커버 아이템 설명문 `"...(height:250px)"` 은 실제 높이와 어긋나게 되므로 `"와이드 배너형태로 제목과 설명을 포함한 컨텐츠입니다. (PC 340px / 태블릿 280px / 모바일 4:3)"` 로 갱신한다. **`<author>` 블록(Jeeqong)은 라이선스상 절대 수정·삭제하지 않는다.**

### 7‑4. 리스트 3종 × 썸네일 3종

공통 선택자 접두: `#tt-body-search, #tt-body-tag, #tt-body-index, #tt-body-category` (4개 body id에 동일 규칙이 반복 선언돼 있다 — 재도색 시 4개 모두 같이 수정해야 한다).

#### 공통

| 속성 | 현재 | 신규 |
|---|---|---|
| `.list-thumb` 배경 | 없음 | `background: rgb(var(--color-jq-500))` — 썸네일 없는 글에서 빈 영역이 아니라 플레이스홀더로 읽히게 |
| `.list-thumb` 다크 처리 | `dark:opacity-80 group-hover:opacity-100` | 유지 |
| `.list-thumb img` hover | 없음 | `transform: scale(1.05)`, `transition: transform .45s cubic-bezier(.2,.6,.2,1)`, 부모 `overflow:hidden`(이미 있음) |
| `.title` hover | `group-hover:text-on-surface` | 유지 + `text-decoration: underline; text-underline-offset: 4px; text-decoration-thickness: 1px; text-decoration-color: rgb(var(--color-jq-400))` |
| `.title` 줄 처리 | **3종 모두** `whitespace-nowrap overflow-hidden text-ellipsis` = **1줄 강제 말줄임** | 리스트형은 폭이 넓으므로 **1줄 유지**. **카드형·썸네일형만 2줄로 완화** — 그리드 칼럼(PC 약 350px / 태블릿 약 300px)에서 한글 제목은 1줄에 15~18자밖에 못 담아 대부분 `…`로 잘린다(목업에서 실측 확인). `white-space: normal; display:-webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; word-break: keep-all` |
| `.desc` 구분자 `·` | 평문 span | `color: rgb(var(--color-jq-400))`, 좌우 `margin: 0 6px` |
| `.summary` | `text-jq-200/80 dark:text-jq-300` | `color: rgb(var(--color-jq-300))` **라이트/다크 공통**(토큰이 이미 뒤집히므로 `dark:` 분기 불필요 — 분기 제거가 곧 토큰화의 목적) |

#### 리스트형 `.list-type-default`

| 속성 | 현재 | 신규 |
|---|---|---|
| 항목 간격 | `margin-bottom: 2rem` / `@768 3rem` | 모바일 `28px` · 태블릿·PC `40px` |
| 항목 구분선 | 없음 | `border-bottom: 1px solid rgb(var(--color-jq-line))` + `padding-bottom: 28px/40px`, `:last-child { border: 0 }` — 텍스트 위주 목록에서 항목 경계가 필요 |
| 방향 | `column` → `@768 row`, gap `1rem`/`1.5rem` | 유지 (요구사항 "모바일 1칼럼" 충족) |
| 썸네일 | 모바일 `w-full min-h-8rem` · `@768 aspect-ratio:1/1; width:10rem; height:10rem; height:auto` **(선언 충돌)** | 모바일 `width:100%; aspect-ratio: 16/9` · `@768 width:168px; height:168px; aspect-ratio:1/1` — **중복 `height` 선언 제거** |
| 제목 | §5‑2 | |

#### 카드형 `.list-type-card`

| 속성 | 현재 | 신규 |
|---|---|---|
| 그리드 | `1 → @768 2 → @1024 3` | **유지**(요구사항 정확 일치) |
| gap | `column-gap: 1.5rem; row-gap: 2.25rem` | `column-gap: 24px` · `row-gap: 40px` (`@1024` `column-gap: 28px`) |
| 썸네일 비율 | `aspect-ratio: 3/2` | **유지**(index.xml 설명과 일치) |
| 카드 방향 | `flex-col`, gap `1rem` | 유지, gap `14px` |
| 제목 | 1.125rem/1.75rem, 0em | §5‑2 |
| 요약 | `line-clamp-3` | 카드형은 높이가 균일해야 하므로 **`line-clamp-2`** 로 축소 |

#### 썸네일형 `.list-type-thumbnail`

| 속성 | 현재 | 신규 |
|---|---|---|
| 그리드 | `1 → @768 2 → @1024 3` | **유지**. 3:4 세로 썸네일이라 PC에서 3열은 다소 큼 → **`@1280 4열`** 추가 권장 (§8‑Q4) |
| 썸네일 비율 | `aspect-ratio: 3/4` | **유지** |
| gap | `column-gap:1.5rem; row-gap:2.25rem` | `column-gap: 20px` · `row-gap: 32px` |
| 요약 | `display: none` (pretty L2338) | **유지**(썸네일형은 이미지 중심) |
| 제목 | 1rem/1.5rem, 0em | §5‑2 |

#### 썸네일 모양 3종 `[##_var_list-template-radius_##]`

| 옵션 | 클래스 | 신규 |
|---|---|---|
| 사각형 | `rounded-none` | `border-radius: 0` |
| 둥근사각형 | `rounded-lg` | `border-radius: var(--radius-lg)` = **0.625rem** (Design-system `--radius`). 리스트형 정사각 썸네일에는 `var(--radius-md)` = 0.5rem |
| 원형 | `rounded-full` | `border-radius: 9999px` |

> **⚠️ 실측 버그 2건**
> 1. `index.xml` `list-template-radius` 의 `<default>rectangle</default>` 은 옵션 배열의 `name`이지 `value`가 아니다. 다른 SELECT(`list-type`, `featured-img-type`)는 전부 `value`를 default로 쓴다. → **`<default>rounded-none</default>`** 으로 수정.
> 2. **원형 + 3:2/3:4 = 타원.** `rounded-full`이 카드형(3:2)·썸네일형(3:4)에 적용되면 원이 아니라 찌그러진 타원이 나온다. 대응: 원형이 선택됐을 때만 카드형/썸네일형 썸네일을 `aspect-ratio: 1/1`로 강제한다 —
> ```css
> .list-type-card  .list-thumb.rounded-full,
> .list-type-thumbnail .list-thumb.rounded-full { aspect-ratio: 1 / 1; width: 100%; }
> ```
> 리스트형은 이미 `1/1`이라 문제없다.

### 7‑5. 본문 대표이미지 — `.post-featured` / `.post-featured-img`

현행: 두 타입 모두 `height: 12rem`(192px) 고정이며, 차이는 `.wide`가 JS로 뷰포트 우측 끝까지 폭을 늘리는 것뿐이다. 요구사항의 "default(기본 비율) / wide(와이드 비율)"에 맞게 **비율을 실제로 분리**한다.

| 속성 | 현재 | 신규 |
|---|---|---|
| `.post-featured` 공통 | `height: 12rem; width: 100%` | `height: auto` (아래 타입별 `aspect-ratio`가 높이를 만든다) |
| `.post-featured-img` 공통 | `position:absolute; inset:0; background-size:cover; background-position:center` | 유지 |
| **default** (모바일) | — | `aspect-ratio: 16/9`, `border-radius: var(--radius-lg)`, `overflow:hidden` |
| **default** (`@768`) | — | `aspect-ratio: 16/9`, `max-height: 420px`, `border-radius: var(--radius-lg)` |
| **wide** (모바일) | `.wide` 스타일 미적용(모바일에선 JS가 인라인 스타일 해제) | `aspect-ratio: 16/9`, `border-radius: var(--radius-md)` — **모바일에서는 default와 동일 취급** |
| **wide** (`@768`) | `opacity:0` → JS가 `width`/`right` 인라인 설정 후 `.img-show`로 `opacity:1` | `aspect-ratio: 21/9`, `min-height: 260px`, `max-height: 460px`, `border-radius: var(--radius-lg) 0 0 var(--radius-lg)` (우측은 뷰포트 밖으로 흘러나가므로 각지게) |
| **취약점 수정** | `.wide { opacity:0 }` 이 CSS에 박혀 있어 **JS가 실패하면 데스크톱에서 대표이미지가 영영 안 보인다** | `opacity:0`을 CSS에서 빼고, `script.js` 초기화 시작 시 `document.documentElement.classList.add('js')` 를 추가한 뒤 **`.js .post-featured-img.wide { opacity: 0 }`** 로 조건화. JS 미실행 시 이미지는 컨테이너 폭 그대로 정상 노출된다 |
| 로딩 전환 | `transition: opacity .1s` | `transition: opacity .28s ease` — 0.1s는 깜빡임으로 읽힌다 |
| 카테고리 라벨 `.title-mono-sm-link` | mono, uppercase | 유지(§5‑3 예외 1), 색 `jq-300` → hover `jq-100` |
| 글 제목 `.title-h1` | §5‑2 | `margin-top: 20px` |

> **index.xml 동기화:** `featured-img-type` 라벨 `"대표이미지 (높이 192px)"` → `"대표이미지 (default 16:9 / wide 21:9)"`.

### 7‑6. TOC — `#post-index-btn` / `#post-index`

**요구사항 "19개 노출" 계산 재검토:**
- 신규 항목 높이 = `0.875rem × 1.4`(19.6px) + `py-1`(8px) = **27.6px**, `gap-1` = 4px
- 19개 = `19 × 27.6 + 18 × 4` = **596.4px** (현행 `max-h-[500px]`으로는 17개까지만 들어간다)
- 패널 총 높이 = 596 + 닫기 줄(24) + `py-3`(24) + `mb-1`(4) ≈ **648px**
- 현행 `md:top-80`(320px)에서 시작하면 하단이 **968px** → 1080p 노트북 뷰포트(≈900px)를 넘는다

→ **고정 `top-80`을 버리고 뷰포트 중앙 고정 + 뷰포트 연동 max-height로 바꾼다.** 19개는 "충분히 큰 화면에서의 최대 노출량"이고, 짧은 화면에서는 더 일찍 스크롤된다.

| 속성 | 현재 | 신규 |
|---|---|---|
| 버튼 `#post-index-btn` 위치 | `fixed top-20 md:top-80 right-6` | 모바일 `fixed top-20 right-4` · `@768 fixed top-1/2 -translate-y-1/2 right-5` |
| 버튼 배경 | `bg-jq-700 hover:bg-jq-500` | `background: rgb(var(--color-jq-700))`, `border: 1px solid rgb(var(--color-jq-line))`, hover `background: rgb(var(--color-jq-500))`, `border-radius: var(--radius-md)` |
| 버튼 그림자 | `shadow-md` | `box-shadow: 0 4px 16px rgb(0 0 0 / .10)` · 다크 `0 4px 16px rgb(0 0 0 / .45)` |
| 버튼 라벨 | `font-mono text-xs/4 uppercase tracking-tight` 세로 3줄 "Table / Of / Contents" | **유지**(이 스킨의 시각적 서명). `letter-spacing: +0.06em`(§5‑3 예외 1), 색 `jq-300` → hover `jq-100` |
| 패널 `#post-index` 위치 | `fixed w-48 top-20 md:top-80 right-0` | 모바일 `fixed top-20 right-0 w-[240px]` · `@768 fixed top-1/2 -translate-y-1/2 right-0 w-[248px]` |
| 패널 표면 | `.inner { bg-jq-500 dark:bg-jq-700 }` | `background: rgb(var(--color-jq-700))` **라이트/다크 공통**(토큰이 뒤집히므로 `dark:` 분기 제거), `border: 1px solid rgb(var(--color-jq-line))`, `border-radius: var(--radius-lg)`, `box-shadow: 0 8px 32px rgb(0 0 0 / .12)` / 다크 `.5` |
| 패널 여백 | `mr-6 py-3 px-5` | `margin-right: 20px; padding: 12px 16px 14px` |
| **스크롤 영역 max-height** | `max-h-[500px]` | **`max-height: min(600px, calc(100vh - 15rem))`** — 큰 화면에서 19개 전부, 짧은 화면에서 그만큼만 |
| 스크롤바 | `no-scrollbar`(완전 숨김) | **숨김 해제.** 스크롤 가능함을 알 방법이 없어진다 → `scrollbar-width: thin; scrollbar-color: rgb(var(--color-jq-400)) transparent` + webkit 4px 트랙 |
| 항목 `li` | `text-sm/4 py-1`, 들여쓰기 `pl-0/pl-3/pl-6` | §5‑2 Label 스케일, `padding: 4px 0`, 들여쓰기 `0 / 12px / 24px` 유지 |
| 항목 색 | `text-jq-300`, `.active` → `text-jq-100 font-medium` | 기본 `jq-300` · hover `jq-200` · `.active` `jq-100` + `font-weight: 600` + **좌측 2px `rgb(var(--color-primary))` 인디케이터** (`border-left`, 비활성은 `transparent`) — 현재 굵기 변화만으로는 활성 항목이 잘 안 읽힌다 |
| 빈 상태 `#no-posts-index` | `text-jq-300 min-h-20` | Small 스케일, `jq-400`, 세로·가로 중앙 정렬 |
| 본문 여백 확보 | `@768 { #tt-body-page #content, footer { padding-right: 6rem } }` | **유지**(TOC 버튼과 본문 충돌 방지). PC(`@1024`)는 `7rem`으로 소폭 확대 |

**충돌 검토:** TOC 패널이 세로 중앙(`top-1/2`)으로 오면, 우하단 플로팅 스택(`bottom-6 md:bottom-16 right-6`)과 세로로 겹칠 수 있다. `max-height: calc(100vh - 15rem)`은 상하 각 7.5rem(120px)을 비우므로 `bottom-16`(64px) + 버튼 높이(≈100px) = 164px와는 여유가 부족하다 → 플로팅 스택을 **`md:bottom-6`** 으로 낮추고 TOC를 `calc(100vh - 15rem)`로 두면 최소 40px 간격이 확보된다.

### 7‑7. 스크롤 인디케이터 / Top 버튼

#### 스크롤 인디케이터 `#scroll-progress`

| 속성 | 현재 | 신규 |
|---|---|---|
| 래퍼 | `fixed top-[56px] left-0 right-0 h-[2px]` | `fixed top-14 left-0 right-0 h-[3px]` + `background: rgb(var(--color-jq-line) / .4)` (트랙이 보여야 진행률로 읽힌다) |
| 바 | `w-0 h-[1px] bg-jq-300` | `height: 3px`, `background: rgb(var(--color-primary))`, `transition: width .12s linear`, `border-radius: 0 2px 2px 0` |
| 헤더 숨김 시 | `.header-hide #scroll-progress` 규칙 존재 | 유지 |
| JS | `document.addEventListener("scroll", ...)` 매 이벤트 DOM write | `requestAnimationFrame` 스로틀 + `docHeight <= 0` 가드(짧은 글에서 `NaN`/`Infinity` 방지) |
| 접근성 | 없음 | 래퍼에 `role="progressbar" aria-hidden="true"` (장식 요소) |

#### Top 버튼 `#scroll-top-btn.btn-top`

| 속성 | 현재 | 신규 |
|---|---|---|
| **노출 조건** | **없음 — 항상 표시** | `window.scrollY > 400` 일 때만. `.btn-top { opacity:0; transform: translateY(8px); pointer-events:none; transition: opacity .25s, transform .25s }` + `.btn-top.is-visible { opacity:1; transform:none; pointer-events:auto }`. 토글은 스크롤 인디케이터와 **같은 rAF 콜백 안에서** 처리 |
| 크기 | `size-10`(40px) `rounded-full` | 유지 |
| 배경 | `bg-jq-500` / 다크 `bg-jq-900` / hover `bg-jq-700` | `background: rgb(var(--color-jq-700))` **공통**, hover `rgb(var(--color-jq-500))`, `border: 1px solid rgb(var(--color-jq-line))`, `box-shadow: 0 4px 16px rgb(0 0 0 / .12)` / 다크 `.45` |
| 아이콘 | `size-4` | `size-[18px]`, 색 `jq-200` → hover `jq-100` |
| 텍스트 | `text-base` | Label 스케일 (실제 텍스트는 `sr-only`) |

#### 플로팅 스택 컨테이너 (테마 버튼 + Top 버튼)

| 속성 | 현재 | 신규 |
|---|---|---|
| 위치 | `fixed z-30 bottom-6 md:bottom-16 right-6 flex flex-col gap-4 md:gap-2` | `fixed z-30 bottom-5 right-5 flex flex-col gap-3` — **`md:bottom-16` 제거**(§7‑6 TOC 충돌 회피) |
| 테마 레일 | `rounded-full p-1 bg-jq-500 dark:bg-jq-900` | `background: rgb(var(--color-jq-700))` **공통**, `border: 1px solid rgb(var(--color-jq-line))`, `border-radius: 9999px`, `padding: 4px`, `box-shadow` Top 버튼과 동일 |
| `.btn-theme` | `data-selected=true` 시 색만 변화 | `size-8 rounded-full`, 기본 `color: rgb(var(--color-jq-400))`, hover `jq-200`, **`[data-selected=true]` → `background: rgb(var(--color-jq-bg)); color: rgb(var(--color-jq-100)); box-shadow: 0 1px 3px rgb(0 0 0 / .12)`** (§6 보강 3) |

### 7‑8. 코드 블록 / 하이라이팅 — ❌ 신규

현행은 `#article-editor pre code`에 **단색 하드코딩**(`bg rgb(40 44 52)` = One Dark 배경, `color rgb(209 213 219)`)만 있고 문법 강조가 없다. 라이트 모드에서도 어두운 블록이 그대로 나온다.

**토큰 추가** (Design-system `--code*` 계열을 그대로 도입):

```css
:root { --color-code-bg: 248 248 248; --color-code-fg: 23 23 23;  --color-code-line: 229 229 229; }
.dark { --color-code-bg:  22  22  22; --color-code-fg: 212 212 212; --color-code-line: 38 38 38; }
```
(라이트 = Design-system `--surface #f8f8f8` / 다크 = `--surface #161616`, 전경은 `--surface-foreground`)

| 속성 | 현재 | 신규 |
|---|---|---|
| `pre code` 배경 | `rgb(40 44 52)` 고정 | `rgb(var(--color-code-bg))` + `border: 1px solid rgb(var(--color-code-line))` |
| `pre code` 전경 | `rgb(209 213 219)` 고정 | `rgb(var(--color-code-fg))` |
| 폰트 | `--font-mono` (ui-monospace 스택) | `font-family: var(--font-mono); font-size: 0.875rem; line-height: 1.7; letter-spacing: 0` — **모노스페이스는 `pretendard-typography` 적용 제외 영역**(스킬 §예외) |
| 패딩 / 모서리 | `padding: 1.25rem; border-radius: .375rem` | `padding: 18px 20px; border-radius: var(--radius-lg)`, `overflow-x: auto`, `tab-size: 2` |
| 복사 버튼 | `:after` 마스크 아이콘, 우상단 24px 히트영역 | 유지. 색 `rgb(var(--color-jq-400))` → `.my-active` 시 `jq-100` → `.my-checked` 시 `rgb(var(--color-primary))` |
| **문법 강조** | **없음** | **highlight.js 11 CDN 도입** — `<head>`에 CSS 2개(라이트/다크 테마)를 `media` 없이 넣고 `.dark` 스코프로 분기, `</body>` 직전에 `highlight.min.js` + 자주 쓰는 언어팩. 초기화는 `hljs.highlightElement()` 를 `#article-editor pre code` 각각에 적용. **`initialCodeBlock()`(복사 버튼) 보다 먼저** 실행해야 `code.textContent` 복사가 원문 그대로 유지된다 |
| 인라인 `code` | `bg jq-700/.9`, `color rgb(231 73 146)` 핑크 하드코딩 | 배경 `rgb(var(--color-jq-700))`, 글자 `rgb(var(--color-primary))`, `border: 1px solid rgb(var(--color-jq-line))`, `border-radius: var(--radius-sm)`, `font-size: .9em` |

> **판단 필요:** highlight.js CDN 도입 여부는 외부 의존이 하나 늘어나는 결정이다. 대안은 (a) 강조 없이 라이트/다크 대응만 하는 것 (b) 티스토리 관리자에서 제공하는 코드블록 기능에 의존. §8‑Q5.

### 7‑9. 이전 글 / 다음 글 — `#prev-next-container`

| 속성 | 현재 | 신규 |
|---|---|---|
| 노출 | `.fade-target { position:fixed; z-index:50; opacity:0 }` → `.visible { opacity:1 }`, PC 전용 | 유지 |
| 카드 표면 | (실측: 개별 스타일은 주변 유틸 의존) | `background: rgb(var(--color-jq-700))`, `border: 1px solid rgb(var(--color-jq-line))`, `border-radius: var(--radius-lg)`, `box-shadow: 0 8px 28px rgb(0 0 0 / .12)` / 다크 `.5` |
| 라벨(PREV/NEXT) | — | `.title-mono-xs` 재사용, `jq-400` |
| 제목 | — | Label 스케일, `jq-100`, `line-clamp: 2` |
| 전환 | `transition: opacity .4s ease` | `opacity .35s ease, transform .35s cubic-bezier(.2,.6,.2,1)` + 진입 시 `translateY(10px) → 0` |

### 7‑10. 푸터 — `<footer>`

| 속성 | 현재 | 신규 |
|---|---|---|
| 여백 | `pl-6 pr-6 py-16 md:pr-32` | 유지 |
| 상단 경계 | 없음 | `border-top: 1px solid rgb(var(--color-jq-line))`, `margin-top: 64px` |
| 텍스트 | `text-sm`, `text-jq-300` | Small 스케일, `jq-400`. 블로그명은 `jq-300` |
| 좌측 컬럼 폭 | `w-2/4` | 모바일 `w-full` · `md:w-1/2` — 현행 `w-2/4`는 모바일에서도 50%라 문구가 심하게 접힌다 |
| SNS 아이콘 | — | `size-9`, `color: jq-400` → hover `jq-100` + `background: rgb(var(--color-jq-500))`, `border-radius: var(--radius-md)` |
| **저작권 표시** | `Designed by Jeeqong` (skin.html L1188‑1190) | **절대 제거하지 않는다** (라이선스 조건). 색만 조정 |

---

## 8. 모호 항목 — 사용자 확인 완료 (2026-09-01)

| # | 항목 | 1차 해석 | ✅ 확정 결과 |
|---|---|---|---|
| **Q1** | 커버 배너 "텍스트 교차노출" | 좌/우 지그재그(이미 구현됨) + 그라디언트 강조 + 모바일 끔 + 좌측 시작으로 뒤집기 | **1차 해석대로 진행("지그재그 + 개선" 선택).** 자동전환 슬라이드 아님. developer는 §7‑3대로 그라디언트 추가·모바일 지그재그 끔·시작 방향 좌측 반전을 구현 |
| **Q2** | 액센트 색 | Design-system 안의 파랑(라이트 #1447e6 / 다크 #8ec5ff) | **파랑 채택 확정.** §3‑3 교체표의 accent 토큰 값 그대로 진행 |
| **Q3** | 태블릿 브레이크포인트 | 768~1023px | 이견 없어 **그대로 확정** |
| **Q4** | 썸네일형 PC 열 수 | 1280px↑ 4열 추가 제안 | 이견 없어 **제안대로 확정**(1280px 미만 3열 / 1280px↑ 4열) |
| **Q5** | 코드 문법 강조 | highlight.js 11 CDN 도입 | **도입 확정.** §7‑8대로 라이트/다크 테마 2종 + 언어팩 CDN, script.js `initialCodeBlock()` 앞에 초기화 삽입(§9 항목6) |
| ~~Q6~~ | 폰트 로딩 방식 | — | ✅ 기존 확정 — 현행 orioncactus CDN 변수폰트 유지, 변경 없음 |
| **Q7** | 대표이미지 타입 글별 전환 | 전역 설정 유지 | **전역 설정 유지로 확정.** 글별 전환 규약은 이번 범위에서 설계하지 않음 — §9 변경 목록에서 이 항목 관련 마크업 신규 작업 없음 |

**→ 전부 확정. developer는 위 결과대로 Phase 3(리스킨 구현)을 진행한다. 더 이상 확인 대기 항목 없음.**

---

## 9. 마크업·JS 변경이 필요한 항목 (재도색 범위를 넘는 것)

리스킨은 원칙적으로 CSS만 바꾸지만, 아래는 **요구사항 충족을 위해 불가피**하다. developer가 임의 판단하지 않도록 여기 모아 둔다.

| # | 파일 | 변경 | 사유 |
|---|---|---|---|
| 1 | `skin.html` | 배너 제목 아래 `[##_cover_item_summary_##]` div **1줄 추가** | 요구사항 "제목 + **설명** 포함" — 현재 마크업에 설명이 아예 없다 |
| 2 | `skin.html` | `<html class="dark">` 의 하드코딩 `dark` 제거 + `<head>`에 테마 결정 인라인 스크립트 추가 | 라이트 사용자에게 첫 페인트가 다크로 깜빡이는 FOUC (§6 보강 1) |
| 3 | `skin.html` | `<meta viewport>` 에서 `maximum-scale=1.0, user-scalable=no` 제거 | 핀치 줌 차단은 접근성 위반(WCAG 1.4.4). 저시력 사용자가 확대할 수 없다 |
| 4 | `script.js` | 초기화 시작 시 `document.documentElement.classList.add('js')` | `.wide` 대표이미지가 JS 실패 시 영구히 안 보이는 문제 (§7‑5) |
| 5 | `script.js` | scroll 핸들러를 rAF 스로틀로 감싸고, 그 안에서 Top 버튼 `.is-visible` 토글 추가 | Top 버튼 노출 조건 신규 (§7‑7) + 스크롤 성능 |
| 6 | `script.js` | (Q5가 (a)일 때) highlight.js 초기화를 `initialCodeBlock()` **앞에** 삽입 | 문법 강조 신규 (§7‑8) |
| 7 | `index.xml` | `list-template-radius` 의 `<default>rectangle</default>` → `<default>rounded-none</default>` | default 값이 어떤 option value와도 일치하지 않는 실측 버그 (§7‑4) |
| 8 | `index.xml` | 커버 `banner` 설명문의 `height:250px` 및 `featured-img-type` 라벨의 `높이 192px` 문구 갱신 | 실제 치수와 어긋나게 되므로 (§7‑3, §7‑5) |
| 9 | `style.css` | `body { font-family: --value(--font-sans) }` → 유효한 선언으로 수정 | 무효 선언이라 body가 Pretendard를 못 받는 실제 버그 (§0) |
| 10 | `style.css` | `@media(max-width:767px){ html{font-size:17px} }` 제거 | rem 스케일 6.25% 왜곡 (§4) |

**손대지 않는 것 (명시):** 티스토리 치환자(`[##_..._##]`), `<s_*>` 조건 태그 구조, `index.xml` 의 `<author>`/`<license>` 블록, 커버 아이템 4종 구성, `list-type`/`featured-img-type` 옵션 체계, 사이드바 오프캔버스 로직, 테마 3‑상태 로직, TOC 생성 알고리즘, 이전/다음 글 IntersectionObserver, 코드 복사 로직.

---

## 10. 티스토리 관리자 설정 안내 (스킨 코드로 해결 불가)

아래는 스킨이 자리만 마련해 두고, **사용자가 관리자에서 직접 켜야** 하는 항목이다.

| 항목 | 스킨 준비 상태 | 사용자 조치 |
|---|---|---|
| 블로그 메뉴바 | `#menu-toolbar` 컨테이너 + `TistoryMenuToolbarAppend()` 가 `#menubar_wrapper`를 여기로 이동 — **준비 완료** | 관리자 → **꾸미기 → 메뉴 설정**(`/manage/menu`) 에서 메뉴 노출 ON |
| 구독 버튼 | `#btn-subscription` + 서브도메인 자동 주입 — **준비 완료** | 관리자 → **관리 → 블로그**(`/manage/setting`) 에서 구독 기능 ON |
| 커버(홈 배너) 구성 | 커버 아이템 4종(`banner`/`list`/`card-list`/`thumbnail-list`) 정의 완료 | 관리자 → **꾸미기 → 스킨 편집 → 커버 편집**에서 `banner` 아이템을 **여러 개 추가**해야 좌/우 교차가 보인다(1개만 두면 교차 확인 불가) |
| 목록 타입 / 썸네일 모양 | index.xml SELECT 옵션 | 관리자 → **꾸미기 → 스킨 편집 → 사이드바(설정)** 에서 선택 |
| 대표이미지 타입 | index.xml SELECT (기본 `wide`) | 글마다 바꾸려면 스킨 설정이 아니라 **글별 대표이미지 지정** 필요 — 현재 옵션은 **블로그 전역 1개 설정**이다. ⚠️ 요구사항 *"글마다 어느 타입을 쓸지 선택 가능"* 과 어긋난다 (§8 추가 확인 대상) |

> **⚠️ 추가 발견:** 요구사항은 대표이미지 타입을 *"글마다"* 선택 가능하길 원했으나, `featured-img-type`은 `<variablegroup name="본문">` 의 전역 SELECT이므로 **블로그 전체에 하나만 적용**된다. 글별로 바꾸려면 글 본문에 특정 클래스를 심고 CSS로 분기하는 별도 설계가 필요하다(치환자로는 글별 스킨 변수를 받을 수 없다). 이 간극은 designer 권한 밖의 기능 설계이므로 **Q7로 사용자 확인이 필요**하다.

---

## 11. 산출물

- 이 문서: `_workspace/10_skin-designer_visual-spec.md`
- 시각 목업: `_workspace/10_mockup.html` — 실제 Pretendard(§1 ①안 CDN)를 링크한 정적 목업. 라이트/다크 토글, PC/태블릿/모바일 3단 프레임, 커버 배너 교차 정렬, 리스트 3종, TOC 패널, 스크롤 인디케이터·Top 버튼을 위 스펙 값 그대로 구현했다. 브라우저로 바로 열면 된다.
