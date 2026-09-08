# `sidebar.css` — 설계 주석

소스: `dashboard-skin/components/sidebar.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [RESPONSIVE SPEC §4-2] 모바일(≤767px) 오프캔버스 드로어

─────────────────────────────────────────────────────────────
   [RESPONSIVE SPEC §4-2] 모바일(≤767px) 오프캔버스 드로어
   shadcn 원본의 <Sheet side="left"> 재현. Tistory엔 Radix Dialog가
   없으므로 동일한 슬라이드인 + 백드롭을 순수 CSS transition으로 구현.
   ─────────────────────────────────────────────────────────────

---

## 2. 백드롭은 모바일에서만 존재한다(기본 display:none).

백드롭은 모바일에서만 존재한다(기본 display:none).

---

## 3. shadcn SheetOverlay의 bg-black/50 리터럴을 토큰으로 승격.

shadcn SheetOverlay의 bg-black/50 리터럴을 토큰으로 승격.
       (원본이 이 한 곳만 토큰 없이 하드코딩하므로 값은 그대로 두고
        이 프로젝트의 "색은 변수로" 규칙만 지킨다)

---

## 4. (1) 레이아웃 자리 제거 — 사이드바가 문서 흐름에서 완전히 빠진다.

(1) 레이아웃 자리 제거 — 사이드바가 문서 흐름에서 완전히 빠진다.
         접힘 쿠키가 남아 있어도 0이 되도록 세 형태 모두 덮는다.

---

## 5. (1-b) [구현 추가] JS가 뜨기 전(FOUC 힌트) 규칙까지 덮는다.

(1-b) [구현 추가] JS가 뜨기 전(FOUC 힌트) 규칙까지 덮는다.
     sidebar.css:54-57의 html[data-sidebar-init="collapsed"] 규칙은
     위 세 선택자에 걸리지 않는 별개 계열(자손 결합자 + html 속성)이라
     명시적으로 무력화하지 않으면 첫 페인트에서 gap이 48px로 남는다.

---

## 6. (2) 드로어 본체 — 폭은 항상 18rem(접힘 쿠키와 무관), 기본은 화면 밖.

(2) 드로어 본체 — 폭은 항상 18rem(접힘 쿠키와 무관), 기본은 화면 밖.

---

## 7. shadcn SheetContent = z-50

shadcn SheetContent = z-50

---

## 8. shadcn SheetContent = shadow-lg

shadcn SheetContent = shadow-lg

---

## 9. 닫힘: data-[state=closed]:duration-300

닫힘: data-[state=closed]:duration-300

---

## 10. (3) 열림

(3) 열림

---

## 11. 열림: data-[state=open]:duration-500

열림: data-[state=open]:duration-500

---

## 12. (4) 백드롭

(4) 백드롭

---

## 13. header(9) 위, 드로어(50) 아래

header(9) 위, 드로어(50) 아래

---

## 14. Radix fade-in-0/fade-out-0 기본

Radix fade-in-0/fade-out-0 기본

---

## 15. [SPEC 2026-09-07] 하위 메뉴가 있는 1차 메뉴(Design) 아코디언화

"사이드메뉴에서 하위 메뉴가 있을 시 1차메뉴 클릭안되게 및 아코디언(디자인시스템
활용)" 요청 — shadcn Sidebar 원본에 이미 있던(포트 당시 그대로 가져왔지만 그때는
안 쓰였던) `[data-slot="collapsible"][data-state="open"] [data-slot="chevron"]`
회전 규칙을 실제로 배선했다. `[data-slot="collapsible"][data-state="closed"] >
[data-slot="sidebar-menu-sub"] { display: none; }` 규칙 하나만 추가하면 나머지는
전부 기존 CSS(버튼 리셋, 칩 여백)가 `<a>`든 `<button>`이든 태그 무관하게 이미
호환되도록 짜여 있어서 그대로 재사용됐다. 하위 메뉴가 없는 Ai는 그대로 `<a>` 링크로
남겨 클릭 시 바로 이동한다.

## 16. [SPEC 2026-09-07, 같은 날 §17로 대체됨] 'N' 신규글 배지(`[data-variant="new"]`)

"신규 등록글이 있을 시 우측에 'N' 표시" 요청 — 기존 카운트 배지(`sidebar-menu-badge`,
숫자 "0" 표시용, opacity 0.6 무채색)의 마크업/포지셔닝(절대 위치, 우측 정렬,
칩 여백 예약 로직)을 그대로 재사용하되 `[data-variant="new"]`를 얹어 색만
`--color-sidebar-primary`(강조색)로 바꿨다.

~~주의 — 이 배지는 실시간으로 자동 갱신되지 않는다. 이 스킨은 카테고리 트리
자체를 정적으로 하드코딩한다, 신규 콘텐츠를 발행할 때 사람이 수동으로 넣고
뺀다.~~ **→ 같은 날 카테고리 트리 자체를 실제 관리자 데이터와 연동하면서
이 제약이 사라졌다 — `category.js.md` §4 참고, Tistory가 자체적으로 내려주는
"새 글" 신호(`new_ico_5.gif`)로 완전 자동화됨.** 마크업/포지셔닝 서술은
§17로 대체.

## 17. [SPEC 2026-09-07 후속] 배지를 "N" 텍스트 칩 → 8×8px 도트로 축소

"N 부분 텍스트 제거 도트로만 표시 width:8px(변수), height:8px(변수)" 지시 —
`[data-variant="new"]`를 텍스트 칩(최소폭 18px, 텍스트 색상 대비 필요)에서
크기 고정 원형 도트(`width`/`height`: `calc(var(--spacing) * 2)` = 8px,
`border-radius: 999px`, 배경색만 `--color-sidebar-primary`)로 바꿨다 — 텍스트가
없으니 `color`/`font-*` 선언은 전부 무의미해져 제거. `top` 오프셋도 이 배지
전용으로 `calc(var(--spacing) * 3)`으로 재조정(공용 `sidebar-menu-badge`
베이스가 쓰는 `top: calc(var(--spacing) * 1.5)`는 옛 18px짜리 칩 기준이라
8px 도트를 그대로 두면 버튼 세로 중앙보다 위로 치우침 — 32px 높이 버튼
기준으로만 맞춘 값이라 28px 하위 메뉴 버튼에서는 2px 정도 어긋나지만, 원래
설계도 두 컨텍스트를 동시에 완벽히 맞추진 않았던 근사치 방식이라 그 관행을
그대로 따름). 도트 자체가 순수 장식이라 `category.js`가 심는 마크업도 텍스트
없이 `aria-hidden="true"`만 있는 빈 `<span>`이다. 배지 폭이 줄어든 만큼,
버튼/하위 버튼의 오른쪽 여백 예약도 `calc(var(--spacing) * 7)`(28px)에서
`calc(var(--spacing) * 4)`(16px)로 축소.

## 18. [SPEC 2026-09-07] 카테고리 폴더 아이콘 열림/닫힘 스왑 (`[data-slot="folder-icon"]`)

`category.js`가 자식이 있는 카테고리에 한해 닫힌/열린 폴더 SVG 두 개를 함께
심는다(`data-icon-state="closed"`/`"open"`) — 기존 쉐브런 회전 규칙과 정확히
같은 셀렉터 패턴(`[data-slot="collapsible"][data-state="..."] ...`)으로 한쪽만
`display:none` 처리해 토글한다. 배경/구현 이유는 `category.js.md` §6 참고.

## 19. [SPEC 2026-09-07] 카테고리 아코디언 — 접기/펼치기 트랜지션 + 단일 열림
("디자인시스템 아코디언이랑 똑같이" 1:1 이식)

"아코디언에 접기,펼치기 트랜지션 추가, 열린페이지 제외하고 다른 리스트
접히게끔 / 디자인시스템 아코디언이랑 똑같이 만들으라고" 요청 — 사용자가
직접 지정한 실제 Design-system 문서 사이트(`jeongsh90.github.io/
portfolio-2026/Design-system`)의 진짜 Accordion 컴포넌트(`components.css`
"── Accordion ──" 절, `components.js`의 `setAccordionItemState`/
`initAccordions`)를 Playwright + 실제 CSS/JS 소스 fetch로 실측해 그
**메커니즘을 그대로** 이식했다(추측 없이). 슬롯 이름은 이 프로젝트 사이드바가
이미 쓰던 `collapsible`/`sidebar-menu-sub` 체계를 그대로 유지 — 원본은
`accordion`/`accordion-item`/`accordion-content` 이름을 쓰지만, 그걸로
갈아엎으면 이미 이 슬롯에 걸려 있는 패딩 예약·배지 위치·활성표시 선택자를
전부 다시 손대야 해서(§17/§18/`category.js.md` §5 참고) 이름은 그대로 두고
동작 방식만 1:1로 가져왔다 — 이 편차는 의도적이며 여기 명시한다.

**핵심 기법(원본과 동일)**: `@keyframes accordion-down/up`이 `height: 0`과
`height: var(--accordion-content-height)` 사이를 오간다 — 이 CSS 커스텀
프로퍼티는 전역이 아니라 **JS가 토글 직전에 그 특정 엘리먼트에 인라인으로
설정**한다(`sidebar.js.md` §16의 `setCollapsibleState` 참고, 원본의
`content.style.setProperty('--accordion-content-height', inner.scrollHeight
+ 'px')`와 동일). CSS 자체는 실제 콘텐츠 높이를 알 방법이 없어서(고전적인
`height: auto` 트랜지션 불가 문제) 매 토글마다 JS가 `scrollHeight`를 재서
넣어주는 방식 — `grid-template-rows: 0fr/1fr` 트릭이 아니라 이 방식을 쓴
것도 원본 그대로다.

**2단 구조가 필요한 이유**: `[data-slot="sidebar-menu-sub"]`(기존 `<ul>`,
`border-left`·`padding`·`gap`을 이미 갖고 있음)에 직접 `height:0;
overflow:hidden`을 걸면, 이 프로젝트의 전역 리셋이 `box-sizing:border-box`라
`padding-block`이 있는 채로 `height:0`을 줘도 padding만큼은 여전히 렌더링돼
완전히 접히지 않는다(원본 Accordion도 정확히 같은 이유로 `accordion-content`
자체엔 padding을 안 주고 `accordion-content-inner`라는 별도 자식에 padding을
둔다). 그래서 새 래퍼 `<div data-slot="sidebar-menu-sub-wrap">`(패딩·보더
전혀 없음, 애니메이션 대상)를 하나 더 두고, 기존 `<ul data-slot=
"sidebar-menu-sub">`는 그 안에서 시각 스타일을 그대로 유지한다.

**단일 열림(원본의 `data-type="single"` + `data-collapsible`)**: 원본은
아코디언 루트(`[data-slot="accordion"]`) 하나에 속한 항목들끼리만 서로
닫는다. 이 사이드바엔 별도 아코디언 루트 엘리먼트가 없어서(카테고리 각각이
`<li>` 안에 독립된 `[data-slot="collapsible"]`), 대신 `sidebar.js`의
`initCollapsibleMenus`가 **가장 가까운 공통 조상 `[data-slot="sidebar-menu"]`
를 기준으로 묶어서** 그 안의 collapsible들끼리만 서로 닫는다(다른
`<ul data-slot="sidebar-menu">`— 예: 사이드바 푸터 — 에 나중에 별도
collapsible이 생겨도 서로 간섭하지 않도록 원본의 "루트 스코프" 개념을
DOM 구조로 재현). `data-collapsible`(열린 항목을 다시 눌러 전부 닫을 수
있음)도 항상 켜진 것으로 구현 — 기존에 있던 "Design을 접어서 다 감출 수
있다"는 동작을 유지하기 위해서다.

**초기 상태**: 원본의 `data-default-value`처럼, 하위 카테고리가 있는
항목 중 **첫 번째**만 `data-state="open"`으로 시작하고 나머지는
`data-state="closed"`로 시작한다(`category.js`의 `firstExpandableIndex`).
페이지 로드 시점엔 `animate=false`로 상태만 세팅하고 `--accordion-content-
height`는 건드리지 않는다 — 이 역시 원본과 동일(닫힌 항목은 애니메이션
키프레임의 `var(--accordion-content-height)`가 미설정이라 무효 처리돼도
기본 규칙의 `height:0`으로 이미 정지해 있어 시각적 문제가 없다는 것을
실제 원본 사이트에서 눈으로 재확인).

---

## 2026-09-08 수정 — 사이드바 방문자 위젯(Today/Total) 카드 2개 나열 → 리스트 행 형태로 재구성

기존엔 `sidebar-stat-card` 2개를 나란히(`sidebar-stat-row`가 flex row) 놓고
각 카드 안에서 라벨(`sidebar-stat-label`, `--text-xs`)을 값
(`sidebar-stat-value`, `--text-sm` + semibold)보다 작게 표시했다 — 오른쪽
`widgets` 아사이드의 위젯 목록(`widget-item`+`widget-title`, 항목 사이
`border-top` 구분선)과는 전혀 다른 시각 언어였다.

`sidebar-stat-row`를 카드 하나 단위에서 **리스트 행 하나** 단위로 재정의해
(`sidebar-stat-list`가 바깥 카드 테두리를 갖고 그 안에 `sidebar-stat-row`
두 개가 세로로 쌓임, 행 사이엔 `widget-item`과 동일한 패턴의
`border-top` 구분선), 각 행 안에서 라벨(왼쪽)과 값(오른쪽)을
`justify-content: space-between`으로 배치했다. 라벨은 `card.css`의
`[data-slot="card-title"]`를 그대로 재사용(다만 `widgets.css`가 그
아사이드 스코프에서 `--text-xs`로 축소해 쓰는 것과 동일한 폰트 크기·굵기를
사이드바 스코프에도 그대로 적용) — 값도 정확히 같은 `font` 축약(굵기·
크기·자간)을 쓰도록 맞춰 라벨/값 두 텍스트가 시각적으로 동일한 크기로
보이게 했다(요청: "폰트사이즈는 동일하게"). 접힘 상태(`data-footer-stat=
"collapsed"`)의 아이콘+툴팁 표시는 그대로 유지 — 이번 변경은 펼침 상태
(`data-footer-stat="expanded"`)에만 해당한다.

