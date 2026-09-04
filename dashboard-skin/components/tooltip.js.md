# `tooltip.js` — 설계 주석

소스: `dashboard-skin/components/tooltip.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Tooltip — 공용 프리미티브 동작

════════════════════════════════════════════════════════════════
   Tooltip — 공용 프리미티브 동작
   ────────────────────────────────────────────────────────────────
   기반: D:\MyCloud\2026포트폴리오\Design-system\js\components.js
         1510–1567행 (closeAllTooltips / initTooltips)
   CSS: tooltip.css (같은 폴더)

   [2026-09-03] 헤더 우측 아이콘 버튼(홈/태그/방명록/즐겨찾기)이 텍스트를
   잃으면서 처음 도입했고("hover시 툴팁", "툴팁은 디자인시스템 참고"
   요청), 곧이어 "접힌 사이드메뉴도 툴팁으로 적용" 요청으로 header.js에
   있던 이 로직을 두 구역이 함께 쓰는 독립 파일로 옮겼다.

   두 가지 마크업 패턴을 지원한다 — bindTooltip() 자체는 어느 쪽이든
   trigger/content 두 요소만 받는다:
     A) 원본 그대로의 래퍼 구조 — 헤더 4개 버튼.
        <div data-slot="tooltip"><span data-slot="tooltip-trigger">…
        </span><div data-slot="tooltip-content">…</div></div>
     B) [원본에 없음, 2026-09-03 추가] 래퍼 없이 형제로 배치 — sidebar
        메뉴 버튼. sidebar.css의 배지·활성 표시 규칙(예:
        `[data-slot="sidebar-menu-item"]:has(> …) > [data-slot="sidebar-
        menu-button"]`)이 버튼을 menu-item의 "직계 자식"으로 요구해서,
        헤더처럼 `<div data-slot="tooltip">`로 감싸면 그 직계 관계가
        깨진다 — 대신 트리거를 `[data-tooltip]`로 표시하고 tooltip-content를
        같은 부모 밑 형제로 두어 DOM 구조를 그대로 보존한다(menu-item은
        sidebar.css에서 이미 position:relative라 새 포지셔닝 컨텍스트도
        필요 없다). 접혔을 때만 의미가 있으므로 sidebar-wrapper가
        collapsed일 때만 연다.

   원본과 다른 점: root 파라미터로 동적 삽입 영역을 다시 스캔하는 기능은
   이 스킨에 아직 그런 영역(콤보박스 등)이 없어 이식하지 않았다 — 페이지
   로드 시 document 전체를 한 번만 스캔한다. 나머지 로직(열림 지연·
   hover/focus 동시 지원·Escape 닫기·다른 툴팁 자동 닫힘)은 그대로다.
   ════════════════════════════════════════════════════════════════

---

## 2. [2026-09-03 추가] 뷰포트 가장자리 최소 여백(px)

[2026-09-03 추가] 뷰포트 가장자리 최소 여백(px)

---

## 3. [2026-09-03 추가, 원본에 없음] 열린 직후 실제 위치를 재보고, 기본

[2026-09-03 추가, 원본에 없음] 열린 직후 실제 위치를 재보고, 기본
     중심 정렬(tooltip.css 쪽 data-align 미지정 규칙)이 뷰포트를 벗어나면
     data-align으로 전환한다 — 헤더 맨 오른쪽 즐겨찾기 버튼처럼 트리거가
     가장자리에 붙어 있을 때 body 가로 스크롤이 생기던 문제(실측 확인)를
     근본 해결. side="left"/"right"(sidebar)에는 해당 CSS 변형이 없어
     data-align을 붙여도 효과가 없다 — 안전하게 무시된다.

---

## 4. trigger/content 한 쌍에 hover·focus 동작을 바인딩한다.

trigger/content 한 쌍에 hover·focus 동작을 바인딩한다.
options.delayContainer — data-delay-duration/data-side-offset을 읽어올 요소
  (패턴 A는 `[data-slot="tooltip"]` 래퍼, 패턴 B는 trigger 자신).
options.boundaryContainer — focusout 시 "밖으로 나갔는지" 판정할 요소.
options.onlyWhenCollapsed — true면 sidebar-wrapper가 collapsed일 때만 연다.

---

## 5. 패턴 A — 래퍼 구조 (헤더 우측 4개 버튼).

패턴 A — 래퍼 구조 (헤더 우측 4개 버튼).

---

## 6. 패턴 B — 래퍼 없는 형제 구조 (접힌 sidebar 메뉴 버튼).

패턴 B — 래퍼 없는 형제 구조 (접힌 sidebar 메뉴 버튼).

