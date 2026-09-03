/* ════════════════════════════════════════════════════════════════
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
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  var EDGE_MARGIN = 8; /* [2026-09-03 추가] 뷰포트 가장자리 최소 여백(px) */

  function closeAllTooltips(exceptContent) {
    document.querySelectorAll('[data-slot="tooltip-content"][data-state="open"]').forEach(function (content) {
      if (content === exceptContent) return;
      content.setAttribute("data-state", "closed");
    });
  }

  /* [2026-09-03 추가, 원본에 없음] 열린 직후 실제 위치를 재보고, 기본
     중심 정렬(tooltip.css 쪽 data-align 미지정 규칙)이 뷰포트를 벗어나면
     data-align으로 전환한다 — 헤더 맨 오른쪽 즐겨찾기 버튼처럼 트리거가
     가장자리에 붙어 있을 때 body 가로 스크롤이 생기던 문제(실측 확인)를
     근본 해결. side="left"/"right"(sidebar)에는 해당 CSS 변형이 없어
     data-align을 붙여도 효과가 없다 — 안전하게 무시된다. */
  function fitToViewport(content) {
    content.removeAttribute("data-align");
    var rect = content.getBoundingClientRect();
    if (rect.right > window.innerWidth - EDGE_MARGIN) {
      content.setAttribute("data-align", "end");
    } else if (rect.left < EDGE_MARGIN) {
      content.setAttribute("data-align", "start");
    }
  }

  /**
   * trigger/content 한 쌍에 hover·focus 동작을 바인딩한다.
   * options.delayContainer — data-delay-duration/data-side-offset을 읽어올 요소
   *   (패턴 A는 `[data-slot="tooltip"]` 래퍼, 패턴 B는 trigger 자신).
   * options.boundaryContainer — focusout 시 "밖으로 나갔는지" 판정할 요소.
   * options.onlyWhenCollapsed — true면 sidebar-wrapper가 collapsed일 때만 연다.
   */
  function bindTooltip(trigger, content, options) {
    options = options || {};
    var delayContainer = options.delayContainer || trigger;
    var boundaryContainer = options.boundaryContainer || trigger.parentElement;

    var delay = parseInt(delayContainer.getAttribute("data-delay-duration") || "0", 10);
    var sideOffset = delayContainer.getAttribute("data-side-offset") || content.getAttribute("data-side-offset") || "0";
    content.style.setProperty("--tooltip-side-offset", sideOffset + "px");

    if (!content.getAttribute("data-side")) {
      content.setAttribute("data-side", "top");
    }

    if (!content.querySelector('[data-slot="tooltip-arrow"]')) {
      var arrow = document.createElement("span");
      arrow.setAttribute("data-slot", "tooltip-arrow");
      arrow.setAttribute("aria-hidden", "true");
      content.appendChild(arrow);
    }

    var showTimer = null;

    function collapsedOk() {
      if (!options.onlyWhenCollapsed) return true;
      var wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
      return !wrapper || wrapper.getAttribute("data-state") === "collapsed";
    }

    function show() {
      if (!collapsedOk()) return;
      clearTimeout(showTimer);
      showTimer = setTimeout(function () {
        closeAllTooltips(content);
        content.setAttribute("data-state", "open");
        requestAnimationFrame(function () {
          fitToViewport(content);
        });
      }, delay);
    }

    function hide() {
      clearTimeout(showTimer);
      content.setAttribute("data-state", "closed");
    }

    trigger.addEventListener("mouseenter", show);
    trigger.addEventListener("mouseleave", hide);
    trigger.addEventListener("focusin", show);
    trigger.addEventListener("focusout", function (event) {
      if (!boundaryContainer || !boundaryContainer.contains(event.relatedTarget)) hide();
    });

    trigger.addEventListener("keydown", function (event) {
      if (event.key === "Escape") hide();
    });
  }

  function initTooltips() {
    /* 패턴 A — 래퍼 구조 (헤더 우측 4개 버튼). */
    document.querySelectorAll('[data-slot="tooltip"]').forEach(function (tooltip) {
      if (tooltip.dataset.tooltipBound === "true") return;
      tooltip.dataset.tooltipBound = "true";

      var trigger = tooltip.querySelector('[data-slot="tooltip-trigger"]');
      var content = tooltip.querySelector('[data-slot="tooltip-content"]');
      if (!trigger || !content) return;

      bindTooltip(trigger, content, { delayContainer: tooltip, boundaryContainer: tooltip });
    });

    /* 패턴 B — 래퍼 없는 형제 구조 (접힌 sidebar 메뉴 버튼). */
    document.querySelectorAll('[data-slot="sidebar-menu-button"][data-tooltip]').forEach(function (trigger) {
      if (trigger.dataset.tooltipBound === "true") return;
      trigger.dataset.tooltipBound = "true";

      var host = trigger.parentElement;
      var content = host && host.querySelector(':scope > [data-slot="tooltip-content"]');
      if (!content) return;

      bindTooltip(trigger, content, { boundaryContainer: host, onlyWhenCollapsed: true });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTooltips);
  } else {
    initTooltips();
  }
})();
