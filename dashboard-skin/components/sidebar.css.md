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

## 16. [SPEC 2026-09-07] 'N' 신규글 배지(`[data-variant="new"]`)

"신규 등록글이 있을 시 우측에 'N' 표시" 요청 — 기존 카운트 배지(`sidebar-menu-badge`,
숫자 "0" 표시용, opacity 0.6 무채색)의 마크업/포지셔닝(절대 위치, 우측 정렬,
칩 여백 예약 로직)을 그대로 재사용하되 `[data-variant="new"]`를 얹어 색만
`--color-sidebar-primary`(강조색)로 바꿨다. **주의 — 이 배지는 실시간으로 자동
갱신되지 않는다.** 이 스킨은 카테고리 트리 자체를 정적으로 하드코딩한다
(`skin.html.md` 초기 결정 참고 — Tistory `[##_category_list_##]`가 고정 마크업이라
동적 루프를 못 씀), 그래서 "이 카테고리에 진짜 새 글이 있는가"를 Tistory가 실시간
알려주는 방법이 없다 — 신규 콘텐츠를 발행할 때 그 카테고리(지금은 Font)에 이 span을
수동으로 넣고, 화제성이 식으면 사람이 다시 빼는 편집 작업이다. 하위 메뉴 항목에도
배지를 달 수 있도록 `sidebar-menu-sub-item`용 여백 예약 규칙도 함께 추가.

