/* ════════════════════════════════════════════════════════════════
   Smooth Scroll — Lenis + GSAP (공용, 특정 구역 소유 아님)
   ────────────────────────────────────────────────────────────────
   요청: "모든스크롤은 부드러운스크롤링되게끔 gsap.js적용", 이어서
   "D:\MyCloud에 적용된 모든 영역 스크롤참고해서 다시적용" — 사용자가
   가리킨 참고 구현: D:\MyCloud\frontend\src\lib\smooth-scroll.ts +
   components\SmoothScrollArea.tsx(React 버전, 이미 그 프로젝트 19개
   페이지·26곳에서 실사용 중, 한 화면에 동시 인스턴스 여러 개도 검증됨
   — AccountsPage/CardsWorkspace/RecordingsWorkspace 등).
   이 스킨은 React가 없는 정적 Tistory 환경이라 그 파일을 그대로 옮길
   수는 없지만, **핵심 설정(Lenis 옵션 값·GSAP ticker 연동 방식)은
   완전히 동일하게** 바닐라로 재현한다.

   [이전 시도와 다른 점] 처음엔 GSAP core만으로 wheel 이벤트를 직접
   가로채 scrollTop을 트윈하는 방식을 직접 짰었다(관성·터치·리사이즈
   등 여러 엣지케이스를 전부 손수 처리해야 함). 참고 프로젝트가 이미
   그 문제를 다 풀어놓은 **Lenis**(전용 스무스 스크롤 라이브러리)를
   쓰고 있어, 그 구현을 그대로 채택한다 — "같은 스크롤" 요청에도
   부합하고, 직접 짠 코드보다 검증된 라이브러리를 쓰는 게 더 안전하다.

   [왜 여전히 GSAP ScrollSmoother가 아닌가] Lenis는 ScrollSmoother와
   달리 transform으로 콘텐츠를 밀어 스크롤을 흉내내지 않는다 —
   wrapper의 **네이티브 scrollTop을 직접, 부드럽게** 움직인다. 그래서
   이 스킨의 헤더/우측 위젯 패널이 쓰는 `position:sticky`가 아무
   문제 없이 그대로 동작한다(원본 참고 프로젝트의 lib/smooth-scroll.ts
   주석에도 "Lenis는 wrapper의 overflow-y-auto/scrollTop을 그대로
   쓰고 애니메이션만 부드럽게 하므로 getBoundingClientRect() 기반
   좌표 계산은 항상 정확하다"고 명시돼 있다 — 우리 sticky도 같은
   전제로 동작한다).

   [GSAP ticker 연동] 원본과 동일하게 Lenis 자체의 requestAnimationFrame
   루프 대신 `gsap.ticker`가 Lenis를 구동한다(`gsap.ticker.add(raf)`,
   `raf`가 `lenis.raf(time*1000)` 호출) — GSAP과 Lenis가 하나의 프레임
   루프를 공유해 나중에 이 스킨에 스크롤 트리거 애니메이션이 추가돼도
   어긋나지 않는다. ScrollTrigger도 원본과 동일하게 등록해 Lenis
   scroll 이벤트마다 `ScrollTrigger.update()`를 호출한다(현재는 이
   스킨에 ScrollTrigger 기반 애니메이션이 없어 당장 시각적 효과는
   없지만, 원본과 배선을 동일하게 맞춰 나중에 그대로 쓸 수 있게 한다).

   [대상 컨테이너 3곳, 원본과의 구조 차이]
   원본(React SPA)은 항상 "wrapper(overflow-y-auto div) + 그 안의
   content(자연 높이 div)" 2단 구조를 새로 만들어 씌우지만(각 페이지가
   SmoothScrollArea로 감쌈), 이 스킨은 기존 마크업을 다시 짜지 않고
   이미 있는 요소에 그대로 붙인다:
     ① 문서 스크롤 — wrapper/content를 지정하지 않으면 Lenis 기본값이
        정확히 이 스킨의 모델(헤더 sticky + 문서 자체가 스크롤)과
        일치한다(Lenis 공식 동작: 인자 없으면 window/documentElement).
     ② 좌측 사이드바 `[data-slot="sidebar-content"]` — wrapper와
        content를 **같은 엘리먼트**로 지정한다. Lenis는 `content`의
        scrollHeight로 스크롤 가능 범위를 계산하는데, 이 값은 그
        엘리먼트가 wrapper 역할(overflow:auto)을 겸하고 있어도 항상
        "잘리기 전 총 콘텐츠 높이"를 정확히 반환하므로(표준 DOM
        동작) 별도 내부 wrapper div를 새로 만들 필요가 없다.
     ③ 우측 위젯 패널 `[data-slot="widgets"]` — ②와 동일한 방식.
   ════════════════════════════════════════════════════════════════ */
(function () {
  "use strict";

  if (typeof window.gsap === "undefined" || typeof window.Lenis === "undefined") {
    return; /* CDN 로드 실패 시 네이티브 스크롤로 안전하게 폴백 */
  }

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return; /* sidebar.css 102~107행과 같은 취지 — 이 사용자에게는 스무딩을 켜지 않는다 */
  }

  if (window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);
  }

  /* 원본 lib/smooth-scroll.ts의 initSmoothScroll을 그대로 재현 —
     Lenis 인스턴스 하나를 만들고 GSAP ticker에 물린다. */
  function initSmoothScroll(options) {
    var lenis = new window.Lenis(
      Object.assign(
        {
          smoothWheel: true,
          syncTouch: false, // 모바일 네이티브 관성 유지(원본과 동일 — 이 스킨은 아직 PC 전용이지만 값은 그대로 맞춘다)
        },
        options
      )
    );

    function onScroll() {
      if (window.ScrollTrigger) window.ScrollTrigger.update();
    }
    lenis.on("scroll", onScroll);

    function raf(time) {
      lenis.raf(time * 1000);
    }
    window.gsap.ticker.add(raf);
    window.gsap.ticker.lagSmoothing(0);

    return lenis;
  }

  function init() {
    /* ① 문서 스크롤 — wrapper/content 생략 = Lenis 기본값(window/documentElement) */
    initSmoothScroll();

    /* ② 좌측 사이드바 자체 스크롤 */
    var sidebarContent = document.querySelector('[data-slot="sidebar-content"]');
    if (sidebarContent) {
      initSmoothScroll({ wrapper: sidebarContent, content: sidebarContent });
    }

    /* ③ 우측 위젯 패널 자체 스크롤 */
    var widgets = document.querySelector('[data-slot="widgets"]');
    if (widgets) {
      initSmoothScroll({ wrapper: widgets, content: widgets });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
