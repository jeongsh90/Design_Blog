/* ════════════════════════════════════════════════════════════════
   Smooth Scroll — GSAP 휠 스무딩 (공용, 특정 구역 소유 아님)
   ────────────────────────────────────────────────────────────────
   요청: "모든스크롤은 부드러운스크롤링되게끔 gsap.js적용"
   근거/결정 과정: dashboard-shadcn-requirements.md §다음 구역 대기열 5번

   [왜 GSAP ScrollSmoother가 아닌가]
   ScrollSmoother는 #smooth-wrapper/#smooth-content 두 겹으로 페이지를
   감싸 transform으로 콘텐츠를 미는 방식이라 네이티브 스크롤이 실제로는
   일어나지 않는다 — 이 스킨의 헤더(position:sticky, 56px 고정)와 우측
   위젯 패널(position:sticky)이 전부 네이티브 스크롤 이벤트에 의존하므로
   ScrollSmoother 아래에서는 둘 다 깨진다. 이미 검증 완료된 두 구역의
   포지셔닝 모델을 통째로 ScrollTrigger.pin()으로 재구축하는 것은
   리스크가 크다고 판단해 채택하지 않았다. 게다가 ScrollSmoother는
   스크롤 컨테이너가 문서 하나뿐이라고 가정하는데, 이 스킨은 이미
   독립적으로 스크롤되는 컨테이너가 3곳(문서/좌측 사이드바/우측 위젯
   패널)이라 근본적으로 상성이 나쁘다.

   [채택한 방식]
   컨테이너별로 wheel 이벤트를 가로채 목표 스크롤 위치를 누적하고,
   gsap.to(container, { scrollTop: target, ... })로 부드럽게 따라가게
   한다. scrollTop은 GSAP가 플러그인 없이 트윈할 수 있는 일반 DOM
   프로퍼티라 ScrollToPlugin도 필요 없다. 네이티브 스크롤 위치 자체가
   실제로 바뀌므로 position:sticky는 아무 문제 없이 그대로 동작한다 —
   이게 이 방식을 고른 핵심 이유다.

   [스코프] 마우스 휠만 스무딩 대상이다. 키보드(방향키/Space/PgUp·Dn)와
   터치는 네이티브 스크롤을 그대로 둔다 — 이 프로젝트가 지금까지
   반복해 온 "PC 먼저" 범위와 같은 맥락의 의도적 축소이지 누락이 아니다.
   `prefers-reduced-motion: reduce`에서는 스무딩 자체를 바인딩하지 않고
   네이티브 휠 스크롤을 그대로 둔다(sidebar.css 102~107행의 동일 취지
   선례를 JS에서 따른 것).
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (typeof window.gsap === "undefined") return; /* CDN 로드 실패 시 네이티브 스크롤로 안전하게 폴백 */

  var REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (REDUCED_MOTION) return;

  var DURATION = 0.9;
  var EASE = "power3.out";

  /**
   * 컨테이너 하나에 휠 스무딩을 바인딩한다.
   * @param {Element} el - scrollTop을 가진 스크롤 컨테이너(document.scrollingElement 포함)
   * @param {Element} [listenEl] - wheel 리스너를 붙일 엘리먼트(기본 el 자신).
   *   문서 스크롤은 el(document.scrollingElement)에 직접 wheel이 안 붙으므로 window를 넘긴다.
   */
  function bindWheelSmoothing(el, listenEl) {
    if (!el) return;
    listenEl = listenEl || el;

    /* 진행 중인 트윈이 가리키는 "논리적 목표값" — 실제 el.scrollTop(트윈 도중의
       중간값)이 아니라 이 값을 기준으로 다음 휠 입력을 더해야 관성이 자연스럽게
       이어진다(매 이벤트마다 현재 위치에서 다시 시작하면 빠르게 휠질할 때 뚝뚝 끊긴다). */
    var target = el.scrollTop;
    var tween = null;

    function clamp(v) {
      var max = el.scrollHeight - el.clientHeight;
      if (max < 0) max = 0;
      if (v < 0) return 0;
      if (v > max) return max;
      return v;
    }

    listenEl.addEventListener(
      "wheel",
      function (event) {
        /* deltaMode 0(px) 기준. 트랙패드/휠 모두 대체로 px 단위로 들어온다 —
           이 프로젝트 범위(PC 데스크톱)에서 line/page 모드는 무시해도 실사용에
           문제 없다고 판단(모바일/반응형은 이번 스코프 밖). */
        /* deltaMode: 0=px(대부분의 크롬/엣지 마우스·트랙패드), 1=line(파이어폭스
           기본), 2=page. line/page 모드를 그대로 더하면(값이 1~수십 단위라)
           스크롤이 거의 안 움직이는 것처럼 느껴진다 — 대략적인 px로 환산한다. */
        var deltaY = event.deltaY;
        if (event.deltaMode === 1) deltaY *= 16; /* 대략 한 줄 = 16px */
        else if (event.deltaMode === 2) deltaY *= el.clientHeight;

        target = clamp(target + deltaY);
        event.preventDefault();
        /* [중요] 버블링 차단 — 위젯 패널/사이드바 위에서 휠을 돌렸을 때
           이 리스너가 이벤트를 여기서 완전히 소비하지 않으면, 이벤트가
           window까지 버블링돼 문서 스크롤 리스너까지 같이 발동한다
           (패널만 스크롤돼야 하는데 페이지 전체가 함께 움직이는 버그).
           document.scrollingElement에 대한 리스너는 window 자체에 걸려
           있어 더 바깥이 없으므로 이 호출은 그쪽에선 아무 효과가 없다. */
        event.stopPropagation();

        tween = window.gsap.to(el, {
          scrollTop: target,
          duration: DURATION,
          ease: EASE,
          overwrite: true, /* 새 휠 입력이 들어오면 진행 중이던 트윈을 갱신 — 목표만 바뀌고 모션은 끊기지 않는다 */
        });
      },
      { passive: false }
    );

    /* 사용자가 스크롤바를 직접 드래그하거나 키보드로 스크롤한 경우
       target이 실제 위치와 어긋나지 않도록 동기화한다(다음 휠 입력이
       엉뚱한 지점에서 다시 튀는 것을 방지). 트윈이 실행 중일 때는
       스크롤 이벤트가 트윈 자신이 만든 것이므로 건드리지 않는다.
       [주의] 리스너는 반드시 listenEl에 붙인다 — 문서 스크롤(el=
       document.scrollingElement)의 scroll 이벤트는 브라우저마다
       documentElement에서 안정적으로 잡히지 않아, 표준적으로 신뢰 가능한
       window(=listenEl)에서 들어야 한다. 일반 컨테이너는 listenEl===el이라
       차이가 없다. */
    listenEl.addEventListener("scroll", function () {
      if (!tween || !tween.isActive()) {
        target = el.scrollTop;
      }
    });
  }

  function init() {
    bindWheelSmoothing(document.scrollingElement, window);

    var sidebarContent = document.querySelector('[data-slot="sidebar-content"]');
    if (sidebarContent) bindWheelSmoothing(sidebarContent);

    var widgets = document.querySelector('[data-slot="widgets"]');
    if (widgets) bindWheelSmoothing(widgets);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
