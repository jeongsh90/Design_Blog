# dashboard-skin — 대시보드형 shadcn/ui 티스토리 스킨

`daitnu.tistory.com`을 대시보드 레이아웃으로 만드는 2차 스킨. shadcn/ui 컴포넌트를
React 없이 순수 HTML/CSS/바닐라 JS로 1:1 포팅하며, **구역(컴포넌트) 단위로 하나씩** 쌓아간다.

> 1차 리스킨 산출물인 루트의 `skin/`(daitnu-skin-v1.01 기반)과는 **완전히 별개 폴더**다. 서로 덮어쓰지 않는다.

---

## ⚠ 현재 진행 상황 — 아직 완성된 스킨이 아니다

| 구역 | 상태 |
|---|---|
| **Sidebar** | ✅ 완료 (PC 100vw 레이아웃 / 접힘 시 4개 항목 hover 툴팁 / 펼침 시 방문자 수 카드 2장) |
| **Header** | ✅ 완료 (PC / 56px / 홈·태그·방명록·즐겨찾기 `icon-sm` 아이콘 버튼 + hover 툴팁) |
| **우측 위젯 사이드바** | ✅ 완료 (PC / 320px sticky 패널 / 공지·최근 글·인기 글·태그·최근 댓글 5장, JS 없음) |
| Content (목록/본문) | ⬜ 미착수 — 다음 구역 |
| 댓글 / 방명록 / 검색결과 / 커버 | ⬜ 미착수 |
| 반응형(태블릿·모바일) | ⬜ 미착수 — sidebar 스펙 §7-4/§7-5 · header 스펙 §6-4에 방향만 기록됨 |

**셸 전체 동작(특정 구역 소유 아님):**
| 기능 | 상태 |
|---|---|
| **스무스 스크롤(Lenis + GSAP)** | ✅ 완료 — 문서/좌측 사이드바/우측 위젯 패널 3곳 전부 독립 스무스 스크롤(`components/smooth-scroll.js`). `D:\MyCloud\frontend`가 실사용 중인 조합(Lenis + GSAP ticker 연동)을 그대로 재현(사용자가 "같은 스크롤 들어가있으니 참고해서" 요청). `position:sticky`를 깨뜨리는 GSAP ScrollSmoother는 채택하지 않음(사유는 파일 머리말 참고). 좌측 사이드바·우측 위젯 패널은 `data-lenis-prevent`로 문서 Lenis에게서 분리(D:\MyCloud FilePreview.tsx 선례 — 없으면 중첩 스크롤 시 안쪽 대신 바깥 문서가 움직인다). `prefers-reduced-motion: reduce`에서 자동 비활성. |

`skin.html`의 `[data-slot="content-inner"]` 안쪽(글 목록/본문)은 **다음 구역에서 만들 자리를
잡아두기 위한 최소 뼈대**다(의도적으로 스타일 없음). 지금 이 상태로 실제 블로그에 적용하면
사이드바·헤더·우측 위젯만 대시보드고 본문은 브라우저 기본 스타일로 보인다 —
**지금 단계에서 실사용 배포를 권하지 않는다.**

> 임시 슬롯 `skin-scaffold-header` / `-title` / `-body`는 Header 구역에서 **전부 걷어냈다.**

---

## 파일 구성

```
dashboard-skin/
├── skin.html                 ← 티스토리 스킨 본체 (템플릿 태그 + 구역별 마크업 누적)
├── tailwind.css              ← 로컬 빌드 산출물 (구역 추가할 때마다 재빌드)
├── src/
│   └── input.css             ← Tailwind v4 엔트리 (색상 토큰 / @theme / 다크 변형)
├── components/
│   ├── tooltip.css           ← 공용 프리미티브 Tooltip (sidebar·header 둘 다 사용)
│   ├── tooltip.js            ← Tooltip 동작 (hover/focus 열기, 뷰포트 경계 보정)
│   ├── card.css              ← 공용 프리미티브 Card + Badge(outline) — 우측 위젯·향후 글 목록
│   ├── sidebar.css           ← Sidebar 구역 스타일 ([data-slot] 셀렉터 기반)
│   ├── sidebar.js            ← Sidebar 구역 동작 (토글 / 쿠키 / Ctrl+B / 테마 / 활성표시)
│   ├── header.css            ← Header 구역 + 공용 프리미티브(Button / Breadcrumb)
│   ├── header.js             ← Header 구역 동작 (브레드크럼 중복 크럼 접기 / 즐겨찾기 토글)
│   └── widgets.css           ← 우측 위젯 구역 (본문/패널 2단 레이아웃 + 위젯 5종) — JS 없음
├── tools/
│   ├── make-preview.mjs      ← 티스토리 치환자를 더미로 바꾼 로컬 목업 생성 (+위젯 반복 확장)
│   └── serve.mjs             ← 로컬 검증용 정적 서버 (쿠키 검증에 필요)
└── README.md
```

## 빌드

Tistory에는 빌드 서버가 없다. **Tailwind는 반드시 로컬에서 정적 CSS로 빌드해 업로드**한다.

```bash
bun install                 # 최초 1회 (tailwindcss, @tailwindcss/cli)
bun run skin:build          # → dashboard-skin/tailwind.css (minified)
```

`skin.html`과 `components/*.js`를 스캔하므로 **구역을 추가할 때마다 반드시 재실행**한다
(`src/input.css`의 `@source` 지시자가 스캔 대상을 고정해 둔다).

## 로컬 검증

```bash
bun run skin:preview        # _workspace/sidebar_mockup-preview.html 생성
bun run skin:serve          # http://localhost:4321/
```

- `file://`에서는 Chromium이 `document.cookie`를 막아 **쿠키 복원 검증이 불가능**하다.
  반드시 위 서버(http://localhost)로 열 것.
- `serve.mjs`는 확장자 없는 경로(`/category/Design` 등)를 목업으로 폴백시킨다 —
  카테고리 URL에서 활성 표시가 붙는지 확인하기 위한 장치다.

---

## 티스토리 업로드 방법

관리자 → 꾸미기 → **스킨 편집 → html 편집** → 우측 **파일 업로드** 탭
(`https://daitnu.tistory.com/manage/design/skin/edit#/source/file`)

1. **파일 업로드** 탭에서 다음 10개를 올린다.
   - `dashboard-skin/tailwind.css`
   - `dashboard-skin/components/tooltip.css`
   - `dashboard-skin/components/tooltip.js`
   - `dashboard-skin/components/card.css`
   - `dashboard-skin/components/sidebar.css`
   - `dashboard-skin/components/sidebar.js`
   - `dashboard-skin/components/header.css`
   - `dashboard-skin/components/header.js`
   - `dashboard-skin/components/widgets.css`
   - `dashboard-skin/components/smooth-scroll.js`
2. **HTML** 탭에 `dashboard-skin/skin.html`의 내용을 통째로 붙여넣는다.
3. 저장 → 미리보기로 확인 후 적용.

> **경로 규칙:** 티스토리는 업로드한 파일을 전부 `./images/` 아래에 평면으로 서빙한다.
> 그래서 `skin.html`은 `./images/tailwind.css`, `./images/tooltip.css`, `./images/tooltip.js`,
> `./images/card.css`, `./images/sidebar.css`, `./images/sidebar.js`, `./images/header.css`,
> `./images/header.js`, `./images/widgets.css`, `./images/smooth-scroll.js`를 참조한다
> (로컬 저장소에서는 `components/` 하위에 있지만 업로드하면 같은 폴더가 된다).
> `make-preview.mjs`가 이 경로 차이를 목업 생성 시 자동으로 보정한다.
>
> **CSS 로드 순서를 지킬 것:** `tailwind → tooltip → card → sidebar → header → widgets`.
> 프리미티브(tooltip/card)가 먼저, 그것을 쓰는 구역 스타일이 나중이다.
>
> **GSAP·Lenis는 업로드 파일이 아니다.** `smooth-scroll.js`가 의존하는
> GSAP core·ScrollTrigger·Lenis는 `skin.html`의 HTML 탭 안에 CDN
> `<script>` 3줄로 이미 포함돼 있다(파일 업로드 목록에는 없음) — HTML
> 탭 내용을 통째로 붙여넣으면(2번) 자동으로 함께 로드된다.
> `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js`,
> `.../3.15.0/ScrollTrigger.min.js`,
> `https://cdn.jsdelivr.net/npm/lenis@1.3.25/dist/lenis.min.js`(D:\MyCloud
> frontend의 package.json과 동일 버전). 스크립트 순서: `GSAP → ScrollTrigger
> → Lenis → tooltip.js → sidebar.js → header.js → smooth-scroll.js`(세
> 전역이 다른 구역 JS보다 먼저 와야 함).

### ⚠ 업로드 후 반드시 해야 하는 관리자 설정 — "글은 5개까지만"

우측 위젯의 **노출 개수는 스킨 코드로 통제할 수 없다.** 티스토리 공식 문서 어디에도 반복
개수를 지정하는 스킨측 문법이 없고, 서버가 관리자 설정값만큼만 반복해 내려준다.

→ **꾸미기 > 사이드바 설정**에서 공지사항 / 최근 글 / 인기 글 / 태그 / 최근 댓글 각 위젯의
**노출 개수를 5로 설정**해야 요청("글은 5개까지만")이 실제로 충족된다.

그래서 `skin.html`의 `<s_..._rep>` 블록은 **항목 1개짜리 템플릿으로 딱 한 번만** 들어 있다.
**절대 복붙해서 늘리지 말 것** — 실사이트에서 (설정 개수 × 복붙 수)로 곱해져 렌더된다.

---

## 이 구역에서 알아둘 것

### 카테고리는 **정적 하드코딩**이다 (스펙 §8-Q2 = A안 확정)

티스토리의 `[##_category_list_##]`는 서버가 `<ul class="tt_category">` 고정 마크업을
생성하므로 `data-slot`을 붙일 수 없다. shadcn 구조를 보존하기 위해 카테고리를
`skin.html`에 직접 적었다(2026-09-02 실측: `Design`(Logo/Font/Figma) · `Ai`).

**→ 카테고리를 추가·이름변경하거나 글 수가 바뀌면 `skin.html`의 "아카이브" 블록과
`sidebar-menu-badge` 숫자를 손으로 고치고 다시 업로드해야 한다.** A안을 고른 대가다.

### 사이드바 상태

- 쿠키 `sidebar_state`(7일, `path=/`) — shadcn 원본과 동일한 이름/수명.
- `Ctrl`/`Cmd` + `B`로 토글. 입력 필드에 포커스가 있으면 가로채지 않는다.
- 토글 경로는 **헤더의 `sidebar-trigger` 클릭**과 **`Ctrl`/`Cmd`+`B`** 두 가지뿐이다.
  shadcn의 `SidebarRail`(사이드바 우측 경계를 클릭하면 접히는 16px 히트영역 핸들)은
  사용자 요청으로 마크업·CSS·JS에서 전부 제거했다 — 우측 경계선은 `sidebar-container`의
  `border-right`만 남은 장식이며 클릭해도 아무 일도 일어나지 않는다.
- **FOUC 방지 스크립트 2개를 절대 지우지 말 것** — `<head>`의 인라인 스크립트와
  `sidebar-wrapper` 여는 태그 바로 다음의 인라인 스크립트. 둘 중 하나라도 없으면
  새로고침할 때마다 사이드바가 펼침 → 접힘으로 튄다.

### 헤더 (Header 구역)

- 구조는 `D:\MyCloud\2026포트폴리오\Design-system`의 헤더를 그대로 이식했다 —
  `header` / `header-inner` / `header-start` / `header-actions`, 높이 `calc(var(--spacing)*14)`(**56px**,
  `sidebar-header`와 동일), `border-bottom: 1px solid var(--color-border)`.
- **우측 끝:** 홈 / 태그 / 방명록 (`data-slot="button" data-variant="ghost" data-size="sm"`, 32px)
  + 테마 전환(`data-header-theme-toggle`). 아이콘·링크는 사이드바 "둘러보기" 그룹과 같은 것을 쓴다.
- **좌측:** 사이드바 토글(`sidebar-trigger`, 28px — shadcn 원본 `size-7` 유지) + 브레드크럼
  `[##_title_##] / [##_page_title_##]`. 홈처럼 두 값이 같아지면 `header.js`가 앞 크럼과 구분자를 접는다.
- 헤더 테마 토글은 **PC에서 `display:none`이다**(Design-system 원본 규칙 — 사이드바 푸터 토글과
  둘이 동시에 보이지 않게 하려는 의도). 반응형 구역에서 ≤48rem 미디어쿼리 한 블록만 추가하면
  헤더 토글이 켜지고 사이드바 토글이 꺼진다(양쪽에 `data-header-theme-toggle` /
  `data-sidebar-theme-toggle` 훅을 이미 붙여 뒀다).
- 헤더는 `position: sticky; top:0; z-index:9`다. Design-system 원본의 `height:100vh` + 본문 내부
  스크롤 모델은 티스토리(관리 메뉴바·광고 주입, 긴 글 앵커 이동)와 맞지 않아 채택하지 않았다 —
  **본문 스크롤 방식은 content 구역이 자유롭게 정하면 된다.**
- **Button / Breadcrumb 컴포넌트가 `header.css` 안에 들어 있다.** 헤더 전용이 아니라 공용
  프리미티브이므로, 다른 구역에서 본격적으로 쓰기 시작하면 `button.css`로 분리할 것.
  `--secondary` / `--destructive` / `--sys-*` 토큰이 아직 없어 그 변형들은 이식하지 않았다.

### 우측 위젯 사이드바 (Right Widgets 구역)

- `[data-slot="content"]` 안에 `content-layout`(flex row) / `content-inner`(본문) 두 겹을 끼우고,
  그 두 번째 자식으로 `<aside data-slot="widgets">`를 뒀다. **`content` 슬롯 이름은 그대로**다 —
  content 구역이 이어받을 자리는 이제 `content-inner`.
- 폭 **320px** 고정, `position: sticky; top: 56px`(헤더 높이), 패널 자체 `overflow-y:auto`.
  1440px 기준 본문 폭은 펼침 864px / 접힘 1072px.
- **JS가 없다.** 인기 글 순위(01~05)는 CSS counter, 반복은 서버, 접기 토글은 만들지 않았다.
- **위젯 5종은 shadcn이 아니라 Tistory 치환자 기능**이다. `skin.html`의 `<s_rct_notice>`,
  `<s_rctps_rep>`, `<s_rctps_popular_rep>`, `<s_random_tags>`, `<s_rctrp_rep>` 문자열을
  **한 글자도 바꾸지 말 것** — 서버는 정확히 이 문자열만 찾는다(바꾸면 그 블록이 화면에
  그대로 노출되거나 통째로 사라진다). 사이드바 위젯의 태그는 태그로그 페이지의
  `<s_tag>`/`<s_tag_rep>`가 아니라 `<s_random_tags>`다.
- 카드/뱃지는 `card.css`(Design-system Card·Badge 포팅)를 쓴다. `--card`/`--card-foreground`
  토큰을 `src/input.css`에 새로 추가했다.
- **패널 자식에 `flex-shrink: 0`이 반드시 있어야 한다**(`widgets.css`) — 없으면 카드가
  눌려 내용이 잘리고 패널 스크롤이 발동하지 않는다(실측으로 확인한 버그).
- 우측 하단 테마 토글 FAB와 겹치지 않도록 패널 `padding-bottom: 64px`.

### 다크 모드

`<html>`의 `.dark` 클래스 + `localStorage.theme` (Design-system과 동일 방식).
토글 버튼은 사이드바 푸터에 있다. `<head>` 인라인 스크립트가 첫 페인트 전에 적용한다.

### 서버 배포 후 재확인이 필요한 것 (로컬에서 검증 불가)

- `<s_sidebar><s_sidebar_element>` 안에 넣은 방문자 수(`[##_count_today_##]` /
  `[##_count_total_##]`)가 실제로 치환되는지.
- 검색 폼이 이동하는 `/search/{키워드}` URL이 실제 블로그에서 동작하는지.
- 티스토리가 자동 주입하는 요소(관리 메뉴바, 광고 `[##_revenue_list_*_##]` 등)가
  사이드바 레이아웃 / sticky 우측 패널과 충돌하지 않는지.
- 우측 위젯 5종이 관리자 사이드바 설정과 무관하게 `skin.html`에 적은 위치 그대로 렌더되는지.
- `<s_sidebar_element>`가 관리자 사이드바 설정과 정확히 어떤 방식으로 연동되는지
  (기존 푸터 방문자 수의 `<s_sidebar>` 2겹 관례를 정리해도 되는지도 이때 함께 판단).
