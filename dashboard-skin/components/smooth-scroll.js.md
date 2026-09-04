# `smooth-scroll.js` — 설계 주석

소스: `dashboard-skin/components/smooth-scroll.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Smooth Scroll — Lenis + GSAP (공용, 특정 구역 소유 아님)

════════════════════════════════════════════════════════════════
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

   [대상 컨테이너 4곳, 원본과의 구조 차이]
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
     ④ 본문 캔버스 `[data-slot="content-inner"]` — ②와 동일한 방식.
        [2026-09-04, CONTENT SPEC §3-1 ①] content 구역이 `max-height:
        calc(100svh - var(--header-height))` + `overflow-y:auto`로 독립
        스크롤 컨테이너가 되면서 4번째 대상이 됐다. 마크업의
        `data-lenis-prevent`가 필수 — 없으면 문서 Lenis가 휠을 가로채
        이 영역 대신 문서가 스크롤된다(2026-09-03에 위젯 패널에서 실제로
        재현했던 버그와 동일).

   [2026-09-04 추가 책임] 커스텀 스크롤바의 자동 숨김(스크롤 중에만 노출)도
   이 파일이 담당한다 — 스크롤 활동 감지가 본질적으로 이 파일의 관심사(각
   컨테이너의 Lenis 인스턴스를 그대로 재사용)이고, 해당 구역들에 전용 JS가
   없다. 실제 1초 페이드는 CSS(components/scrollbar.css)가 하고, 여기서는
   data 속성만 토글한다.
   [2026-09-04 일반화] 대상이 위젯 패널 하나에서 둘(+content-inner)로 늘면서
   하드코딩을 `[data-custom-scrollbar]` 전체 순회로 바꿨다. 앞으로 세 번째
   컨테이너가 생겨도 이 파일은 손대지 않아도 된다(마크업에 속성만 붙이면 됨).
   ════════════════════════════════════════════════════════════════

---

## 2. 스무딩을 켤 수 있는 조건.

스무딩을 켤 수 있는 조건.
     - CDN 로드 실패 시 네이티브 스크롤로 안전하게 폴백
     - 모션 최소화 사용자에게는 스무딩을 켜지 않는다(sidebar.css 102~107행과 같은 취지)
     ※ 예전에는 여기서 곧바로 return 했지만, 아래 위젯 스크롤바 자동 숨김은
       Lenis 유무와 무관하게 동작해야 해서(그렇지 않으면 CDN 실패 시 스크롤바가
       영영 안 보인다) 조기 return 대신 플래그로 바꿨다.

---

## 3. 원본 lib/smooth-scroll.ts의 initSmoothScroll을 그대로 재현 —

원본 lib/smooth-scroll.ts의 initSmoothScroll을 그대로 재현 —
     Lenis 인스턴스 하나를 만들고 GSAP ticker에 물린다.

---

## 4. 커스텀 스크롤바 자동 숨김 (2026-09-04 요청)

════════════════════════════════════════════════════════════
     커스텀 스크롤바 자동 숨김 (2026-09-04 요청)
     대상: [data-custom-scrollbar]가 붙은 모든 컨테이너
           (현재 = 우측 위젯 패널 + 본문 캔버스 content-inner)
     ────────────────────────────────────────────────────────────
     "커스텀스크롤이 처음 안보이게하고 스크롤링을 하면 서서히
      나타나게(1초) 다시 스크롤링 동작을 안하면 서서히 사라지게(1초)"
      + idle 대기 3초.

     이 함수가 하는 일은 **딱 하나** — 스크롤 활동이 있으면
     `data-scrolling="true"`를 붙이고, 마지막 활동으로부터 3초가
     지나면 뗀다. 1초 페이드는 전부 CSS(components/scrollbar.css)가 한다
     (이 프로젝트의 "React state → data 속성 + CSS" 포팅 관례 그대로).

     [활동 감지를 두 경로로 거는 이유]
     ① 기존 Lenis 인스턴스의 on("scroll") — 새 인스턴스를 만들지 않고
        이미 이 패널에 붙어 있는 것을 그대로 재사용한다. 휠을 놓은 뒤
        감속이 끝날 때까지 계속 발화하므로, 3초 카운트다운이 "휠을 놓은
        순간"이 아니라 "감속이 실제로 멈춘 순간"부터 시작된다.
     ② 네이티브 scroll 이벤트 — Lenis가 없을 때(CDN 실패, 모션 최소화)와
        Lenis가 관여하지 않는 입력(키보드 PgUp/PgDn·스크롤바 드래그·터치)
        까지 덮는다. Lenis는 네이티브 scrollTop을 직접 움직이므로 ①이
        살아 있을 때도 이 이벤트는 정상적으로 함께 발화한다(중복 호출은
        타이머를 리셋할 뿐이라 무해).
     ※ 모션 최소화 사용자에게는 아예 걸지 않는다 — scrollbar.css의
       prefers-reduced-motion 블록이 스크롤바를 상시 노출로 고정하므로
       속성을 토글할 이유가 없다.

---

## 5. `if (lenis) lenis.on("scroll", onActivity)`

②

---

## 6. `}`

①

---

## 7. [엘리먼트, Lenis 인스턴스] 쌍. 아래 커스텀 스크롤바 순회가 각 컨테이너의

[엘리먼트, Lenis 인스턴스] 쌍. 아래 커스텀 스크롤바 순회가 각 컨테이너의
       Lenis를 다시 찾을 수 있게 여기서 모아 둔다(새 인스턴스를 만들지 않는다).
       Map 대신 배열 쌍을 쓰는 건 이 파일의 기존 ES5 스타일을 유지하기 위함.

---

## 8. ① 문서 스크롤 — wrapper/content 생략 = Lenis 기본값(window/documentElement)

① 문서 스크롤 — wrapper/content 생략 = Lenis 기본값(window/documentElement)

---

## 9. ② 좌측 사이드바 자체 스크롤

② 좌측 사이드바 자체 스크롤

---

## 10. ③ 우측 위젯 패널 자체 스크롤

③ 우측 위젯 패널 자체 스크롤

---

## 11. ④ 본문 캔버스 자체 스크롤 [2026-09-04, CONTENT SPEC §3-1]

④ 본문 캔버스 자체 스크롤 [2026-09-04, CONTENT SPEC §3-1]
         ②③과 완전히 동일한 방식 — 새 패턴을 발명하지 않는다.

---

## 12. 커스텀 스크롤바 자동 숨김 — 대상은 마크업이 정한다([data-custom-scrollbar]).

커스텀 스크롤바 자동 숨김 — 대상은 마크업이 정한다([data-custom-scrollbar]).
       위에서 만든 Lenis 인스턴스가 있으면 그대로 넘겨 재사용하고(감속이 실제로
       멈춘 순간부터 3초를 세기 위함), 없으면 네이티브 scroll 이벤트만으로 동작한다.
       ⚠ 하드코딩된 widgets 대신 전체 순회로 일반화했다 — 세 번째 컨테이너가
         생겨도 이 파일을 수정할 필요가 없다.

---

## 13. 모바일 네이티브 관성 유지(원본과 동일 — 이 스킨은 아직 PC 전용이지만 값은 그대로 맞춘다)

모바일 네이티브 관성 유지(원본과 동일 — 이 스킨은 아직 PC 전용이지만 값은 그대로 맞춘다)

