# Sidebar 비주얼 스펙 (PC / 100vw)

- **대상 구역:** 대시보드형 티스토리 스킨의 첫 구역 — Sidebar
- **근거 문서:** `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md` (shadcn 실측 레퍼런스)
- **색상 출처:** `D:\MyCloud\2026포트폴리오\Design-system\css\globals.css` (base `:root` / `.dark`, 실측 라인 20381–20503)
- **타이포:** `pretendard-typography` 스킬 스케일
- **범위:** PC 레이아웃만. 반응형(모바일 드로어)은 §7에 방향만 기록하고 이번 스펙에서 구현하지 않는다.

---

## 0. 작업 착수 시 발견한 사실 — Design-system에 **이미 바닐라 CSS 포트가 존재한다**

`Design-system/css/components.css` **368–789행**에 `[data-slot="sidebar-*"]` 셀렉터 기반의 **React 없는 shadcn Sidebar 포트가 이미 구현돼 있다.** 이 프로젝트가 하려는 일(“shadcn sidebar를 순수 HTML/CSS/바닐라 JS로 1:1 포팅”)이 같은 소스 안에서 이미 한 번 수행돼 있었다는 뜻이다.

- 토글 로직도 `Design-system/js/components.js` **28–57행**(`initDocSidebars`)에 있다 — `data-state`를 wrapper와 `[data-slot="sidebar"]` **양쪽에** 세팅하는 방식.
- 치수도 이미 요구사항이 원하는 형태로 쓰여 있다: `--sidebar-width: calc(var(--spacing) * 64)`, `--sidebar-width-icon: calc(var(--spacing) * 12)` (components.css 371–372행).

**따라서 developer는 이 포트를 “참고”가 아니라 실제 이식 기반(baseline)으로 삼는다.** 아래 스펙은 그 포트를 기준으로 (a) 색상 값 확정, (b) 누락 슬롯 보강, (c) Tistory 제약 대응을 얹는 구조로 작성했다.

**Design-system 포트에 없는 shadcn 슬롯 (developer가 신규 작성해야 함):**

| 누락 슬롯 | 필요 여부 | 사유 |
|---|---|---|
| `sidebar-trigger` | **필요** | 접기/펼치기 버튼. 포트에는 `[data-sidebar-trigger]` 훅만 있고 스타일이 없음 |
| `sidebar-rail` | **필요** | 사이드바 우측 경계의 클릭 핸들. 대시보드 관용구 |
| `sidebar-inset` | **필요** | 본문 영역 래퍼. 다음 구역(header/content)과 맞물림 |
| `sidebar-input` | **필요** | 검색 필드. `[data-slot="input"]`(components.css 1466행) 재사용 가능 |
| `sidebar-separator` | **필요** | `[data-slot="separator"]`(components.css 2596행) 재사용 가능 |
| `sidebar-menu-badge` | **필요** | 카테고리별 글 수 표기 |
| `sidebar-menu-skeleton` | 불필요 | 비동기 로딩이 없는 정적 스킨 |
| **전환 애니메이션** | **필요** | 포트에 `transition`이 **전혀 없어** 접힘이 끊긴 것처럼 튄다 (§4-3) |

---

## 1. shadcn 원본 구조 (레퍼런스 그대로 — 재설계하지 않음)

### 1-1. DOM 계층 (`data-slot` 트리)

```
[data-slot="sidebar-wrapper"]            ← 상태 보유자. --sidebar-width 정의
├─ [data-slot="sidebar"]                 ← data-state / data-collapsible / data-variant / data-side
│  ├─ [data-slot="sidebar-gap"]          ← 레이아웃 자리 확보용(투명). 폭만 담당
│  └─ [data-slot="sidebar-container"]    ← position:fixed, inset-y-0, 실제로 보이는 껍데기
│     └─ [data-slot="sidebar-inner"]     ← 배경색(--sidebar) 담당
│        ├─ [data-slot="sidebar-header"]
│        │  └─ [data-slot="sidebar-menu"] > [data-slot="sidebar-menu-item"]
│        │     └─ [data-slot="sidebar-menu-button"][data-size="lg"]
│        │        ├─ [data-slot="sidebar-icon-box"]   ← 브랜드 마크
│        │        └─ [data-slot="meta"] > [data-slot="title"] + [data-slot="desc"]
│        ├─ [data-slot="sidebar-content"]             ← flex:1, 스크롤 영역
│        │  └─ [data-slot="sidebar-group"] (반복)
│        │     ├─ [data-slot="sidebar-group-label"]
│        │     └─ [data-slot="sidebar-group-content"]
│        │        └─ [data-slot="sidebar-menu"]
│        │           └─ [data-slot="sidebar-menu-item"]
│        │              ├─ [data-slot="sidebar-menu-button"][data-active]
│        │              │  ├─ svg (아이콘)
│        │              │  └─ [data-slot="label"]
│        │              ├─ [data-slot="sidebar-menu-badge"]
│        │              └─ [data-slot="sidebar-menu-sub"] > …-sub-item > …-sub-button
│        └─ [data-slot="sidebar-footer"]
├─ [data-slot="sidebar-rail"]
└─ [data-slot="sidebar-inset"]           ← 본문(다음 구역)
```

### 1-2. 상태 속성 (원본 그대로 유지)

| 속성 | 값 | 이번 구역에서 쓰는 값 |
|---|---|---|
| `data-state` | `expanded` \| `collapsed` | 둘 다 |
| `data-collapsible` | `offcanvas` \| `icon` \| `none` | **`icon`** (PC 기본) |
| `data-variant` | `sidebar` \| `floating` \| `inset` | **`sidebar`** (§4-4 사유) |
| `data-side` | `left` \| `right` | **`left`** |
| `data-active` | `true` \| `false` | 현재 카테고리 표시 |
| `data-size` | `default` \| `sm` \| `lg` | `lg`=브랜드 행, `default`=일반 메뉴 |

### 1-3. CSS 변수 (원본 이름 그대로, 값만 채움)

`--sidebar-width` · `--sidebar-width-icon` · `--sidebar-width-mobile` · `--sidebar` · `--sidebar-foreground` · `--sidebar-primary` · `--sidebar-primary-foreground` · `--sidebar-accent` · `--sidebar-accent-foreground` · `--sidebar-border` · `--sidebar-ring` · `--radius` · `--spacing`

`@theme inline` 매핑도 원본 패턴 그대로 유지한다 (Design-system globals.css 473–480행에 이미 동일하게 존재):

```css
--color-sidebar:                    var(--sidebar);
--color-sidebar-foreground:         var(--sidebar-foreground);
--color-sidebar-primary:            var(--sidebar-primary);
--color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
--color-sidebar-accent:             var(--sidebar-accent);
--color-sidebar-accent-foreground:  var(--sidebar-accent-foreground);
--color-sidebar-border:             var(--sidebar-border);
--color-sidebar-ring:               var(--sidebar-ring);
```

> CSS 파일 안에서는 **`var(--color-sidebar-*)` 쪽을 참조**한다(Design-system 포트가 그렇게 작성돼 있고 Tailwind 유틸리티도 이 네임스페이스를 소비한다). raw `--sidebar-*`는 테마 선언부에서만 쓴다.

---

## 2. 색상 형식 결정 — **hex 채택** (전 구역 공통, 이후 변경 금지)

### 2-1. 결정

**모든 색상 토큰은 hex(`#rrggbb` / 알파는 `#rrggbbaa`)로 선언한다.** oklch 리터럴을 쓰지 않는다.

### 2-2. 근거 (실측)

1. **Design-system의 base 선언 자체가 hex다.** `:root`/`.dark` 원본 선언이 hex이고, `lab()`은 `@supports (color: lab(0% 0 0))` 안의 **점진적 향상 레이어**일 뿐이다 — 즉 이 프로젝트의 “정본 표기”는 hex다. hex를 쓰면 소스와 문자 단위로 대조 가능하고 변환 드리프트가 0이다.
2. **변환해봤더니 shadcn 원본 oklch와 값이 정확히 일치한다.** 실제로 계산해 대조한 결과:

   | Design-system hex | 변환한 oklch | shadcn 원본 oklch | 일치 |
   |---|---|---|---|
   | `#fafafa` | `oklch(0.985 0 0)` | `oklch(0.985 0 0)` (`--sidebar`) | ✅ |
   | `#f5f5f5` | `oklch(0.97 0 0)` | `oklch(0.97 0 0)` (`--accent`) | ✅ |
   | `#e5e5e5` | `oklch(0.922 0 0)` | `oklch(0.922 0 0)` (`--border`) | ✅ |
   | `#171717` | `oklch(0.205 0 0)` | `oklch(0.205 0 0)` (`--sidebar` dark) | ✅ |
   | `#0a0a0a` | `oklch(0.145 0 0)` | `oklch(0.145 0 0)` (`--background` dark) | ✅ |

   두 소스는 **같은 팔레트를 다른 표기로 적은 것**이다. 따라서 hex를 쓰는 것은 shadcn 색상 체계에서 이탈하는 게 아니라 동일 값을 정본 표기로 적는 것이다. “shadcn과 동일한 방식”이라는 요구는 **oklch 리터럴이 아니라 변수화·`data-slot`·`calc(var(--spacing)*n)` 구조**로 충족된다.
3. **oklch의 실질 이점(지각 균등 보간)은 hex로도 그대로 얻는다.** Design-system 포트는 파생 상태를 `color-mix(in oklab, var(--color-primary) 90%, transparent)` 형태로 계산하는데, `color-mix(in oklab, …)`는 **입력 표기와 무관하게** oklab 공간에서 섞는다. 즉 hex 입력 + oklab 믹싱 조합이 이미 지각 균등하다.
4. **1차 리스킨 때의 rgb 삼중항 표기는 승계하지 않는다.** 그건 daitnu-skin-v1.01 스킨이 `rgb(var(--x) / <alpha>)` 패턴을 쓰던 데서 온 제약이었고, 그 베이스는 폐기됐다.

### 2-3. 부수 규칙

- `@supports (color: lab(...))` 향상 레이어는 **이식하지 않는다.** Tailwind 빌드 산출물의 부산물이고, hex만으로 sRGB 값이 이미 정확하다. 파일 크기와 대조 난이도만 늘린다.
- 알파가 필요한 값은 8자리 hex(`#ffffff1a`)로 적는다 — Design-system 원본이 쓰는 표기와 동일.

---

## 3. 색상 매핑

### 3-1. Sidebar 토큰 (본 구역)

| shadcn 변수명 | 라이트 | 다크 | Design-system 출처 | 판정 |
|---|---|---|---|---|
| `--sidebar` | `#fafafa` | `#171717` | `:root` 20407 / `.dark` 20487 | 그대로 |
| `--sidebar-foreground` | `#000000` | `#fafafa` | `:root` 20408 / `.dark` 20488 | 그대로 |
| `--sidebar-primary` | **`#1447e6`** | `#1447e6` | `.dark` 20489 (= `--color-blue-700`, globals 226) | **라이트만 변경** (§3-3-a) |
| `--sidebar-primary-foreground` | `#fafafa` | `#fafafa` | 20410 / 20490 | 그대로 |
| `--sidebar-accent` | `#f5f5f5` | `#262626` | 20411 / 20491 | 그대로 |
| `--sidebar-accent-foreground` | **`#1447e6`** | **`#8ec5ff`** | `--color-blue-700` / `--color-blue-300` | **양쪽 변경** (§3-3-b) |
| `--sidebar-border` | `#e5e5e5` | `#ffffff1a` | 20413 / 20493 | 그대로 |
| `--sidebar-ring` | `#a1a1a1` | `#525252` | 20414 / 20494 | 그대로 |

### 3-2. 사이드바가 함께 참조하는 전역 토큰

| 변수 | 라이트 | 다크 | 용도 |
|---|---|---|---|
| `--background` | `#ffffff` | `#0a0a0a` | `sidebar-inset` 본문 바탕 |
| `--foreground` | `#000000` | `#fafafa` | 본문 텍스트 |
| `--muted-foreground` | `#737373` | `#a1a1a1` | 브랜드 부제(`desc`), 배지 숫자 |
| `--border` | `#e5e5e5` | `#ffffff1a` | rail/구분선 |
| `--input` | `#e5e5e5` | `#ffffff26` | 검색 필드 테두리 |
| `--ring` | `#a1a1a1` | `#737373` | 검색 필드 포커스 |
| `--radius` | `.625rem` | 동일 | shadcn 기본값과 **일치**. 파생: `--radius-md = calc(var(--radius)*.8)` = 8px, `--radius-lg = var(--radius)` = 10px |

### 3-3. Design-system 원본에서 **의도적으로 벗어난 값 3건** (전부 사유 명시)

**(a) 라이트 `--sidebar-primary`: `#171717` → `#1447e6`**

- 이 변수는 **브랜드 마크(`sidebar-icon-box`)의 채움 배경**이다 (components.css 689행: `background-color: var(--color-sidebar-primary)`).
- Design-system 원본은 **라이트 `#171717`(무채색), 다크 `#1447e6`(파랑)** 로 서로 다르다 — 소스 자체의 불일치다.
- 사용자가 이전 라운드에서 **“액센트 = Design-system 안의 파랑”을 명시적으로 확정**했다(1차 스펙 §8-Q2). 이 결정은 폐기된 JQ 베이스가 아니라 *색상 정체성*에 대한 답이므로 방향 전환과 무관하게 유효하다.
- 라이트에서 무채색 검정 사각형을 브랜드 마크로 쓰면 “검정 네모”일 뿐 브랜드로 읽히지 않는다. 파랑으로 통일하면 라이트/다크가 같은 정체성을 갖는다.
- 대비: `#fafafa` on `#1447e6` = **6.55:1** (WCAG AA 통과, 라이트·다크 공통).

**(b) `--sidebar-accent-foreground`: 무채색 → 파랑 (`#1447e6` / `#8ec5ff`)**

- 이 변수는 **활성 메뉴 항목의 글자·아이콘 색**이다.
- shadcn 원본은 활성 상태를 `bg-sidebar-accent + text-sidebar-accent-foreground + font-medium`로만 표시한다. Design-system 원본 값(`#171717` / `#fafafa`)은 기본 전경색과 거의 같아서, **활성 표시가 “배경이 아주 옅게 깔린다” 수준**에 그친다. 카테고리 내비게이션에서 “지금 어디 있는지”가 즉시 안 읽히는 건 대시보드로서 실제 결함이다.
- 값만 파랑으로 바꾸면 **변수명·선언 구조를 하나도 건드리지 않고** 활성 상태가 명확해진다.
- **다크에서 `#1447e6`(blue-700)를 글자색으로 쓰면 안 된다** — 실측 대비 `#1447e6` on `#171717` = **2.62:1 (심각한 실패)**. 그래서 다크는 `#8ec5ff`(blue-300)를 쓴다.
  - `#1447e6` on `#f5f5f5` (라이트 활성) = **6.27:1** ✅
  - `#8ec5ff` on `#262626` (다크 활성) = **8.35:1** ✅
- 이 파랑 두 값(`#1447e6` / `#8ec5ff`)은 1차 라운드에서 사용자가 확정한 액센트 쌍과 **정확히 동일**하다.

**(c) hover에서 `color` 변경 선언 제거** — 구조 변경 1건

- Design-system 포트(components.css 581–585행)와 shadcn 원본은 hover에도 `color: var(--color-sidebar-accent-foreground)`를 준다.
- (b)로 accent-foreground가 파랑이 된 이상, 이 선언을 그대로 두면 **hover와 active가 완전히 같은 모습**이 되어 (b)의 목적이 무효화된다.
- 따라서 hover는 **배경만** 바뀌고 글자색은 `--sidebar-foreground`를 유지한다. active만 파랑.
- 원본 대비 손실은 없다: 원본에서도 hover의 accent-foreground(`#171717`)와 기본 foreground(`#000`)는 육안 구분이 불가능한 값이라, 이 선언은 원래도 시각적으로 아무 일도 하지 않았다.

```css
/* 확정 규칙 */
[data-slot="sidebar-menu-button"]:hover {
  background-color: var(--color-sidebar-accent);
  /* color 변경 없음 — active와 구분하기 위해 의도적으로 제거 */
}
[data-slot="sidebar-menu-button"][data-active="true"] {
  background-color: var(--color-sidebar-accent);
  color: var(--color-sidebar-accent-foreground);   /* 파랑 */
  font-weight: var(--font-weight-medium);
}
```

### 3-4. 대비 검증표 (실측, WCAG 2.1)

| 조합 | 비율 | 판정 |
|---|---|---|
| 메뉴 텍스트 `#000000` on `#fafafa` (L) | 20.12 | AAA |
| 메뉴 텍스트 `#fafafa` on `#171717` (D) | 17.18 | AAA |
| 부제/배지 `#737373` on `#fafafa` (L) | 4.54 | AA (14px 이상 필요 — 배지 12px는 §5-2 대응) |
| 부제/배지 `#a1a1a1` on `#171717` (D) | 6.94 | AA |
| 활성 `#1447e6` on `#f5f5f5` (L) | 6.27 | AA |
| 활성 `#8ec5ff` on `#262626` (D) | 8.35 | AAA |
| 브랜드 마크 `#fafafa` on `#1447e6` | 6.55 | AA |
| ~~`#1447e6` on `#171717` (D)~~ | 2.62 | **불가 — 채택하지 않음** |

### 3-5. 다크 모드 전환 방식

Design-system과 동일하게 **`<html>`의 `.dark` 클래스 토글**을 쓴다 (`Design-system/js/components.js` 1803–1825행 실측: `documentElement.classList.toggle('dark', dark)` + `localStorage.setItem('theme', …)`). 스킨의 테마 토글 버튼은 `sidebar-footer`에 둔다.

---

## 4. 치수 / 여백

### 4-1. 사이드바 폭 — **`calc(var(--spacing) * 64)` = 16rem = 256px 확정**

**결정: shadcn 기본값 16rem을 그대로 쓴다. 조정하지 않는다.**

근거:
1. **두 근거가 같은 값을 가리킨다.** shadcn 원본 `--sidebar-width: 16rem`과 Design-system 포트 `calc(var(--spacing) * 64)`(= 64 × 0.25rem = 16rem)가 완전히 일치한다. 어느 쪽을 따라도 같은 값이므로 이탈할 이유가 없다.
2. **한글 카테고리명 길이를 실측 계산해도 충분하다.**

   ```
   256px(container) − 1px(border-right)                     = 255
   − sidebar-group padding-inline 8×2                       = 239
   − sidebar-menu-button padding 8×2                        = 223
   − 아이콘 16px + gap 8px                                   = 199  ← 라벨 가용폭
   − (배지가 있을 때) 배지 ~22px + gap 8px                    = 169
   ```
   Pretendard 14px 한글 평균 자폭 ≈ 14px 기준 → **배지 없음 14자 / 배지 있음 12자**까지 말줄임 없이 들어간다.
   예정 라벨 검증: `디자인 자료 아카이브`(10자) ✅ · `프론트엔드 퍼블리싱`(10자) ✅ · `AI 프롬프트 아카이브`(11자 상당) ✅ — 전부 배지 포함 상태로도 통과.
3. **100vw 대시보드 레이아웃에서 본문 폭이 적정하다.**

   | 뷰포트 | 사이드바(+border) | `sidebar-inset` 가용폭 | 카드 그리드(패딩 24×2, gap 24) |
   |---|---|---|---|
   | 1280px | 257 | 1023 | 3열 × 317px |
   | 1440px | 257 | 1183 | 3열 × 370px |
   | 1920px | 257 | 1663 | 4열 × 385px |
   | 1440px (접힘) | 49 | 1391 | 4열 × 311px |

   16rem보다 넓히면 1280px에서 3열 카드가 300px 아래로 떨어져 썸네일 비율이 무너진다. 좁히면 위 2번의 라벨 여유가 사라진다.

**이탈 조건(에스컬레이션):** 카테고리명이 **15자 이상**으로 확정되면 말줄임 처리 대신 `calc(var(--spacing) * 72)`(18rem)로 넓힌다. 폭 변경은 이 변수 한 줄만 고치면 되므로 나중에도 저렴하다. → §8-Q1

### 4-2. 치수 / 여백 전체표

모든 값은 `--spacing: 0.25rem` 기준. 임의 px 없음(1px 헤어라인 제외).

| 항목 | 값 | px | 출처 / 비고 |
|---|---|---|---|
| `--sidebar-width` | `calc(var(--spacing) * 64)` | 256 | shadcn 16rem 동일 |
| `--sidebar-width-icon` | `calc(var(--spacing) * 12)` | 48 | shadcn 3rem 동일 |
| `--sidebar-width-mobile` | `calc(var(--spacing) * 72)` | 288 | shadcn 18rem 동일. **다음 단계용, 이번엔 선언만** |
| `sidebar-container` 높이 | `100svh` | — | `vh`가 아닌 `svh` (모바일 주소창 대응, 포트 399행) |
| `sidebar-container` 우측 경계 | `1px solid var(--color-sidebar-border)` | 1 | 헤어라인은 spacing 스케일 예외 |
| `sidebar-header` 높이 | `calc(var(--spacing) * 14)` | **56** | 포트 428행. **다음 구역 header와 반드시 동일해야 함 → §8-Q3** |
| `sidebar-header` padding | `padding-inline: calc(var(--spacing)*2)` / `padding-block: 0` | 8 / 0 | 높이 고정이므로 세로 패딩 0 + `justify-content: center` |
| `sidebar-header/footer` gap | `calc(var(--spacing) * 2)` | 8 | |
| `sidebar-footer` padding | `calc(var(--spacing) * 2)` | 8 | |
| `sidebar-content` gap | `calc(var(--spacing) * 2)` | 8 | 그룹 사이 간격 |
| `sidebar-group` padding | `calc(var(--spacing) * 2)` | 8 | |
| `sidebar-group` gap | `calc(var(--spacing) * 2)` | 8 | |
| `sidebar-group-label` 높이 | `calc(var(--spacing) * 8)` | 32 | |
| `sidebar-group-label` padding-inline | `calc(var(--spacing) * 2)` | 8 | 메뉴 버튼 텍스트와 좌측 정렬 일치 |
| `sidebar-menu` gap | `calc(var(--spacing) * 1)` | 4 | |
| `sidebar-menu-button` 높이 (default) | `calc(var(--spacing) * 8)` | 32 | |
| `sidebar-menu-button` 높이 (`lg`) | `calc(var(--spacing) * 12)` | 48 | 브랜드 행 |
| `sidebar-menu-button` 높이 (`sm`) | `calc(var(--spacing) * 7)` | 28 | |
| `sidebar-menu-button` padding | `calc(var(--spacing) * 2)` | 8 | |
| `sidebar-menu-button` gap | `calc(var(--spacing) * 2)` | 8 | 아이콘↔라벨 |
| 메뉴 아이콘 | `calc(var(--spacing) * 4)` | 16×16 | `sm`일 때 `*3.5` = 14 |
| `sidebar-icon-box` | `calc(var(--spacing) * 8)` | 32×32 | `border-radius: var(--radius-lg)` (10) |
| `sidebar-menu-button` radius | `var(--radius-md)` | 8 | |
| 포커스 링 | `outline: calc(var(--spacing)*0.5) solid var(--color-sidebar-ring)` / `outline-offset: calc(var(--spacing)*0.5)` | 2 / 2 | 포트 587–590행 |
| `sidebar-menu-sub` margin | `calc(var(--spacing)*0.5) calc(var(--spacing)*3.5)` | 2 / 14 | 좌측 세로선이 부모 아이콘 중심에 정렬 |
| `sidebar-menu-sub` padding | `calc(var(--spacing)*0.5) calc(var(--spacing)*2.5)` | 2 / 10 | `border-left: 1px solid var(--color-sidebar-border)` |
| `sidebar-menu-sub-button` 높이 | `calc(var(--spacing) * 7)` | 28 | |
| `sidebar-menu-action` | `calc(var(--spacing) * 5)` | 20×20 | `top: calc(var(--spacing)*1.5)`, `right: calc(var(--spacing)*1)` |
| **접힘 시** 아이콘 버튼 | `--sidebar-icon-size: calc(var(--spacing) * 8)` | 32×32 | 48px 폭 − 좌우 8px 패딩 = 32 정확히 일치 |

### 4-3. 신규 스펙 — Design-system 포트에 없는 항목

**(1) 전환 애니메이션 (누락 — 반드시 추가)**
포트에는 `transition` 선언이 하나도 없어 접기/펼치기가 프레임 없이 튄다. shadcn 원본은 `transition-[width,left,right] duration-200 ease-linear`.

```css
[data-slot="sidebar-gap"],
[data-slot="sidebar-container"] {
  transition-property: width, left, right;
  transition-duration: 200ms;
  transition-timing-function: linear;   /* shadcn 원본이 ease-linear */
}
[data-slot="sidebar-menu-button"],
[data-slot="sidebar-menu-sub-button"] {
  transition-property: background-color, color;
  transition-duration: var(--default-transition-duration);  /* .15s */
  transition-timing-function: var(--default-transition-timing-function);
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="sidebar-gap"], [data-slot="sidebar-container"] { transition: none; }
}
```

**(2) `sidebar-trigger`** — `[data-slot="button"][data-variant="ghost"]` 기반, `calc(var(--spacing)*7)` = 28×28, radius-md, 아이콘 16px, `aria-label="사이드바 토글"` + `sr-only` 텍스트. 위치는 다음 구역(header) 좌측 끝. 이번 구역에서는 **스타일만 정의**하고 배치는 header 구역에서 확정.

**(3) `sidebar-rail`**
```
position: absolute; inset-block: 0;
left: var(--sidebar-width);   /* data-side=left */
width: calc(var(--spacing) * 4);   /* 16px 히트영역 */
transform: translateX(-50%);
cursor: w-resize;  /* collapsed 상태에선 e-resize */
tabindex="-1"  (shadcn 원본 그대로)
```
`:hover`에서 `after` 의사요소로 `1px` 세로선을 `var(--color-sidebar-border)` → `var(--color-sidebar-accent-foreground)`로. 접힘 상태에서는 `left: var(--sidebar-width-icon)`.

**(4) `sidebar-inset`** — `flex: 1; min-width: 0; background-color: var(--color-background);` (본문 구역과의 접합부이므로 상세는 다음 구역에서)

**(5) `sidebar-input`** — `[data-slot="input"]` 재사용 + 높이만 `calc(var(--spacing)*8)`(32)로 낮춰 메뉴 버튼과 리듬을 맞춘다(기본 input은 36px). 배치는 첫 `sidebar-group` 안. **접힘 시 `display: none`.**

**(6) `sidebar-menu-badge`**
```
position: absolute; right: calc(var(--spacing) * 1);
min-width: calc(var(--spacing) * 5);   /* 20px */
height: calc(var(--spacing) * 5);
padding-inline: calc(var(--spacing) * 1.5);
border-radius: var(--radius-md);
font: var(--font-weight-medium) var(--text-xs)/1 var(--font-sans);
letter-spacing: var(--tracking-xs);
color: var(--color-sidebar-foreground);
opacity: .6;              /* 숫자를 라벨보다 뒤로 */
pointer-events: none;
```
활성 항목에서는 `opacity: 1; color: var(--color-sidebar-accent-foreground);`. **접힘 시 `display: none`.**

**(7) `sidebar-separator`** — `[data-slot="separator"]` 재사용하되 사이드바 안에서는 `background-color: var(--color-sidebar-border)`, `margin-inline: calc(var(--spacing) * 2)`.

### 4-4. `data-variant="sidebar"` 선택 사유

`floating` / `inset`은 사이드바를 카드처럼 띄우고 본문에 라운드 여백을 만든다. 티스토리는 본문 높이가 글 길이에 따라 크게 요동치고(목록 페이지 vs 긴 글) `inset` 변형은 그때 바깥 여백이 어색하게 늘어난다. **폭 전체를 쓰는 `sidebar` 변형이 100vw 요구사항과 가장 잘 맞고, 접힘 폭 계산도 `calc(3rem + 1rem)` 예외 없이 `3rem` 단순식으로 끝난다.**

---

## 5. 타이포그래피 (`pretendard-typography` 준수)

### 5-1. 매핑

| 요소 | 스케일 | 선언 | 자간 |
|---|---|---|---|
| `sidebar-group-label` | Caption 12/500 | `var(--font-weight-medium) var(--text-xs)/var(--leading-normal)` | `var(--tracking-xs)` = **-0.006em** |
| `sidebar-menu-button` 라벨 | Small 14/400 | `var(--font-weight-normal) var(--text-sm)/var(--leading-normal)` | `var(--tracking-sm)` = **-0.008em** |
| `sidebar-menu-button[data-active]` | Label 14/500 | `font-weight: var(--font-weight-medium)` | 동일 |
| 브랜드 `title` | Label 14/500 | `var(--font-weight-medium) var(--text-sm)/var(--leading-snug)` | `var(--tracking-sm)` |
| 브랜드 `desc` | Caption 12/400 | `var(--font-weight-normal) var(--text-xs)/var(--leading-normal)` | `var(--tracking-xs)` |
| `sidebar-menu-sub-button` | Small 14/400 | `var(--text-sm)/var(--leading-normal)` | `var(--tracking-sm)` |
| `sidebar-menu-badge` | Caption 12/500 | `var(--font-weight-medium) var(--text-xs)/1` | `var(--tracking-xs)` |

**Design-system의 `--tracking-*` 토큰은 `pretendard-typography` 스케일과 값이 그대로 일치한다** (`--tracking-xs: -0.006em`, `--tracking-sm: -0.008em`, `--tracking-base: -0.01em` — globals.css 실측). 새 토큰을 만들 필요 없이 그대로 쓴다. 양수 자간은 어디에도 쓰지 않는다.

- 폰트: `--font-sans: 'Pretendard', ui-sans-serif, system-ui, sans-serif` (Design-system reset.css 168행과 동일). 로딩은 **기존 확정대로 orioncactus 변수 폰트 CDN 유지** — 폰트 작업은 하지 않는다.
- 굵기는 400/500만 쓴다(사이드바에 600·700 불필요).
- `sidebar-group-label`은 **대문자 변환·양수 자간을 쓰지 않는다.** 한글 라벨(`아카이브`, `둘러보기`)에 `uppercase`/`tracking-wide`는 규칙 위반이며 한글엔 효과도 없다. 위계는 크기(12px) + `opacity: .7`(포트 468행)로만 만든다.

### 5-2. 배지 대비 보완

라이트 배지 색 `#737373`은 12px에서 4.54:1로 소형 텍스트 기준이 빠듯하다. **배지는 `--sidebar-foreground`(`#000`/`#fafafa`) + `opacity: .6`** 으로 구성한다 — 합성 결과가 `#737373`과 거의 같은 밝기지만 다크에서도 한 줄로 동작하고, 활성 시 `opacity: 1`로 자연스럽게 살아난다.

### 5-3. 줄바꿈

메뉴 라벨은 `white-space: nowrap; overflow: hidden; text-overflow: ellipsis`(포트 524–530행 그대로). 사이드바는 한 줄 고정이므로 `word-break: keep-all`은 적용하지 않는다 — 그 규칙은 본문/리드 문구용이다.

---

## 6. 상태 · 인터랙션 규칙 (확정)

| 상태 | 배경 | 전경 | 굵기 | 비고 |
|---|---|---|---|---|
| 기본 | `transparent` | `--color-sidebar-foreground` | 400 | |
| `:hover` | `--color-sidebar-accent` | **변경 없음** | 400 | §3-3-c |
| `:focus-visible` | 변경 없음 | 변경 없음 | — | `outline: 2px solid var(--color-sidebar-ring)`, offset 2 |
| `[data-active="true"]` | `--color-sidebar-accent` | `--color-sidebar-accent-foreground` (파랑) | 500 | 아이콘도 `currentColor`로 같이 파랑 |
| `[data-active] :hover` | `--color-sidebar-accent` | 파랑 유지 | 500 | 활성 위 hover는 변화 없음(이미 강조 상태) |
| `[data-state="open"]` (접이식) | `--color-sidebar-accent` | 변경 없음 | 400 | `chevron` 90° 회전(포트 562–564행) |
| `[data-muted="true"]` | — | — | — | `opacity: .7` (포트 598행) |

- **아이콘은 반드시 `stroke="currentColor"`.** 활성 시 텍스트와 함께 파랑이 되려면 색을 하드코딩하면 안 된다.
- 접힘 상태에서 숨김: `label`, `meta`, `chevron`, `sidebar-menu-sub`, `sidebar-menu-action`, `sidebar-group-label`, `sidebar-input`, `sidebar-menu-badge`.
- 접힘 상태 툴팁: shadcn은 `SidebarMenuButton`의 `tooltip` prop을 `state === "collapsed"`일 때만 노출한다. → §7-6.

---

## 7. Tistory / 바닐라 JS 환경 제약으로 원본과 달라지는 부분

### 7-1. React Context(`SidebarProvider` / `useSidebar`) → DOM 속성이 상태 보유자

React가 없으므로 상태를 담을 곳이 없다. **`[data-slot="sidebar-wrapper"]` 엘리먼트 자체가 상태 저장소**가 되고, `data-state`를 **wrapper와 `[data-slot="sidebar"]` 양쪽에 동시에** 세팅한다(Design-system 포트의 CSS 셀렉터가 두 위치를 모두 참조하므로 한쪽만 바꾸면 절반이 안 먹는다 — components.js 37–42행 방식 그대로).

```js
function setSidebarState(expanded) {
  var state = expanded ? 'expanded' : 'collapsed';
  wrapper.setAttribute('data-state', state);
  sidebar.setAttribute('data-state', state);
  sidebar.setAttribute('data-collapsible', expanded ? '' : 'icon');
}
```

### 7-2. 쿠키 `sidebar_state` — 유지하되 **초기 렌더 깜빡임을 반드시 막아야 한다**

- **쿠키를 그대로 쓴다** (`sidebar_state`, `max-age=604800`, `path=/`). shadcn 1:1 대응 원칙이고 localStorage로 바꿀 실익이 없다.
- **문제:** shadcn/Next는 SSR 단계에서 쿠키를 읽어 첫 HTML부터 접힌 상태로 내려준다. Tistory는 그 서버 렌더 단계를 우리가 제어할 수 없어, **펼침 상태로 그려진 뒤 스크립트가 접는 “폭 점프”가 반드시 발생한다.**
- **해결:** `<head>` 안 **인라인 동기 스크립트**로 `document.documentElement`에 상태를 먼저 심는다. wrapper는 아직 파싱 전이라 접근 불가하므로 `<html>`을 대신 쓴다.

```html
<script>
(function(){try{
  var m = document.cookie.match(/(?:^|; )sidebar_state=([^;]*)/);
  if (m && m[1] === 'false') document.documentElement.setAttribute('data-sidebar-init','collapsed');
}catch(e){}})();
</script>
```
CSS는 이 초기 힌트도 함께 받는다:
```css
html[data-sidebar-init="collapsed"] [data-slot="sidebar-wrapper"]:not([data-state]) [data-slot="sidebar-gap"],
html[data-sidebar-init="collapsed"] [data-slot="sidebar-wrapper"]:not([data-state]) [data-slot="sidebar-container"] {
  width: var(--sidebar-width-icon);
}
```
스크립트가 실제 `data-state`를 세팅한 순간부터는 `:not([data-state])`가 풀려 정상 규칙이 이긴다.
> 다크모드도 동일한 이유로 같은 인라인 스크립트에서 `.dark`를 함께 심는다(Design-system은 `localStorage.theme`을 쓴다).

### 7-3. `[##_category_list_##]` — **가장 큰 제약. 마크업을 우리가 못 만든다**

- 티스토리 카테고리 트리는 `<s_sidebar><s_sidebar_element>` 블록 안의 `[##_category_list_##]` 치환자로만 나온다(베이스 스킨 `skin.html` 실측). 서버가 `<ul class="tt_category">…<li>…` 형태로 **고정 마크업을 생성**하므로, 여기에 `data-slot="sidebar-menu-button"`을 직접 붙일 수 없다.
- 즉 **shadcn 구조를 그대로 유지하면 티스토리 자동 카테고리를 못 쓰고, 자동 카테고리를 쓰면 shadcn 구조가 깨진다.** 셋 중 하나를 골라야 한다:

| 안 | 방식 | 장점 | 단점 |
|---|---|---|---|
| **A. 정적 하드코딩** | 카테고리 링크를 skin.html에 직접 작성 | shadcn 구조 100% 보존, JS 불필요, 깜빡임 없음 | 카테고리 추가/이름변경 때마다 스킨 재업로드 |
| **B. DOM 재작성** | `[##_category_list_##]` 출력 후 JS로 `data-slot` 부여 | 자동 동기화 | 렌더 후 재배치라 깜빡임, 티스토리 마크업 변경 시 파손 |
| **C. 하이브리드(권장)** | 치환자를 `hidden`으로 출력해두고 JS가 그걸 **데이터 소스로 읽어** shadcn 구조 메뉴를 생성 | 자동 동기화 + 구조 보존 | JS 의존, 미세한 초기 지연 |

→ **§8-Q2 사용자 확인 필요.** 개인 블로그이고 3축(디자인/코드/AI)이 잘 안 바뀐다면 **A가 가장 견고하다**는 것이 설계자 의견이다.

### 7-4. Sheet(Radix Dialog Portal) → 바닐라 CSS 드로어 *(다음 단계, 방향만)*

`--sidebar-width-mobile`(288px) 폭의 `position: fixed` 패널 + 백드롭, `transform: translateX(-100%) → 0`, `transition: transform 200ms ease-linear`. Portal이 없으므로 `sidebar-wrapper`의 마지막 자식으로 두고 `z-index`로 올린다. 포커스 트랩·`Escape` 닫기·`inert`는 직접 구현해야 한다. **이번 스펙 범위 밖.**

### 7-5. `useIsMobile` → `matchMedia` *(다음 단계, 방향만)*

`window.matchMedia('(max-width: 767px)')` + `change` 리스너. 브레이크포인트 768/1024는 1차 라운드에서 확정된 값을 재사용 후보로 남겨둔다.

### 7-6. Tooltip 프리미티브 없음 → `title` 속성이 아닌 CSS 툴팁

접힘 상태에서만 라벨을 툴팁으로 보여야 한다. `title` 속성은 지연이 길고 스타일링이 불가하며 펼침 상태에서도 뜬다. → `data-tooltip="라벨"` 속성 + `::after` 의사요소, `[data-state="collapsed"]` 조건에서만 렌더. `aria-label`은 항상 별도로 유지(접근성은 툴팁과 무관하게 보장).

### 7-7. lucide-react 없음 → 인라인 SVG

번들러가 없으므로 아이콘은 skin.html에 **인라인 `<svg>`** 로 직접 넣는다(`width/height`는 CSS가 `calc(var(--spacing)*4)`로 덮으므로 속성값은 형식상). `stroke="currentColor"`, `stroke-width="2"`, `fill="none"` — lucide 기본 규격 유지. `<symbol>` + `<use>` 스프라이트는 티스토리 파일 업로드가 `.svg`를 허용하는지 미검증이라 **1차에서는 채택하지 않는다.**

### 7-8. `Cmd/Ctrl + B` 단축키 — `preventDefault()` 필수

Firefox의 `Ctrl+B`(북마크 사이드바)와 충돌한다. shadcn 원본과 동일하게 `(e.metaKey || e.ctrlKey) && e.key === 'b'`에서 반드시 `e.preventDefault()`. 단, **입력 필드(검색) 포커스 중에는 가로채지 않는다** — `e.target`이 `input`/`textarea`면 무시(원본에 없는 보강이나, 검색 필드를 사이드바 안에 두는 우리 구성에서는 필요).

### 7-9. Tailwind 유틸리티 vs 컴포넌트 CSS

빌드된 `tailwind.css`는 스킨 마크업을 스캔해 생성되므로, **사이드바 내부 스타일은 유틸리티 클래스 나열이 아니라 `sidebar.css`의 `[data-slot]` 셀렉터로 작성한다**(Design-system 포트와 동일 방식). 이유: 티스토리가 `[##_category_list_##]` 등으로 생성하는 마크업에는 우리가 클래스를 못 붙이므로 셀렉터 기반이 유일하게 일관된다. `tailwind.css`는 레이아웃/유틸 보조용으로만 둔다.

---

## 8. 확인 필요 (사용자 결정 사항) — ✅ 전부 확정 (2026-09-01)

| # | 항목 | 설계자 제안 | 판단 근거 | 결정 |
|---|---|---|---|---|
| **Q1** | 사이드바 폭 16rem 확정? | **16rem 유지** | 예정 카테고리명 전부 배지 포함 12자 이내로 통과(§4-1). 15자 이상 라벨이 생기면 18rem으로 상향 | **✅ 16rem 확정**(이견 없어 제안대로) |
| **Q2** | 카테고리 메뉴를 **A 정적 / B DOM재작성 / C 하이브리드** 중 무엇으로? | **A(정적)** | 3축 카테고리가 잘 안 바뀌는 개인 블로그. 구조 보존 + 깜빡임 0 + JS 무의존 | **✅ A(정적 하드코딩) 확정.** 사용자 답변: "Design-system이 shadcn로 만든 것이니 그 파일을 보고 적용" — Design-system의 기존 포트에는 애초에 티스토리 카테고리 치환자에 대한 대응이 없고(범용 shadcn 포트일 뿐 Tistory 인식 없음), 그 포트의 마크업을 그대로 쓸 수 있는 유일한 선택지가 A다(B/C는 포트에 없는 JS 재작성 로직을 새로 얹어야 해서 "그 파일을 보고 적용"과 어긋남). 즉 A가 "기존 구현을 그대로 따른다"는 사용자 지시에 가장 부합 |
| **Q3** | `sidebar-header` 높이 56px를 다음 구역(header)의 높이로 고정할까? | **56px 고정** | 사이드바 브랜드 행과 본문 헤더의 밑선이 한 줄로 맞아야 대시보드로 읽힌다 | **✅ 56px 확정**(이견 없어 제안대로) |
| **Q4** | 사이드바 푸터에 무엇을 둘까? | 테마 토글 + 방문자 수 | 프로필/계정 메뉴가 없는 블로그이므로 shadcn의 user-card 자리를 이 둘로 대체 | **✅ 제안대로 확정**(이견 없음) |
| **Q5** | 활성 표시를 **파랑 글자만**으로 할지, **좌측 2px 인디케이터 바**를 추가할지 | **파랑 글자만** | 변수 값만 바꿔 해결되어 shadcn 구조 이탈이 0 | **✅ 파랑 글자만 확정**(이견 없어 제안대로) |

**→ 전부 확정. developer는 Phase 3(구현)을 진행한다.**

---

## 9. developer 인계 요약

1. **`Design-system/css/components.css` 368–789행을 그대로 복사해 `sidebar.css`의 기반으로 삼는다.** 새로 짜지 않는다.
2. `:root` / `.dark`에 §3-1·§3-2 표의 **hex** 값을 선언하고, §1-3의 `--color-sidebar-*` 매핑을 함께 둔다.
3. §3-3의 **의도적 이탈 3건**(라이트 `--sidebar-primary`, 양 테마 `--sidebar-accent-foreground`, hover의 `color` 선언 제거)을 반영한다.
4. §4-3의 **누락 7항목**(전환 애니메이션 / trigger / rail / inset / input / menu-badge / separator)을 신규 작성한다.
5. §7-2의 **`<head>` 인라인 스크립트**를 빠뜨리지 않는다 — 없으면 새로고침마다 사이드바가 튄다.
6. §8 Q1~Q5 답을 받기 전에는 각 항목의 “설계자 제안”값으로 진행하되, Q2만은 **답을 받고 시작**한다(선택에 따라 마크업 구조 자체가 달라짐).
