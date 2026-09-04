# `scrollbar.css` — 설계 주석

소스: `dashboard-skin/components/scrollbar.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Custom Scrollbar — 공용 프리미티브 (특정 구역 소유 아님)

════════════════════════════════════════════════════════════════
   Custom Scrollbar — 공용 프리미티브 (특정 구역 소유 아님)
   ────────────────────────────────────────────────────────────────
   [2026-09-04] `widgets.css` §8(370~444행)을 **값 한 글자도 바꾸지 않고**
   여기로 옮긴 것이다. 셀렉터만 `[data-slot="widgets"]` →
   `[data-custom-scrollbar]`(boolean 속성)로 교체했다.

   추출 사유: 이 프로젝트가 이미 두 번 적용한 규칙 —
   "다른 구역이 쓰기 시작하면 프리미티브로 추출한다"
   (Button/Breadcrumb → header.css 안 공용 블록, Tooltip → tooltip.css).
   content 구역의 `[data-slot="content-inner"]`가 두 번째 사용처가 되면서
   지금이 추출 시점이 됐다. [CONTENT SPEC §3-1, §14-1]

   왜 `data-slot` 값이 아니라 별도 boolean 속성인가:
   sidebar 2026-09-03 작업에서 확정된 관례 그대로다 — `data-lenis-prevent`,
   `data-floating-theme-toggle`, `data-sidebar-header-action`이 전부 이 형태.
   `data-slot` 값에 두 단어를 섞으면 다른 속성 선택자가 정확히 일치하지
   않아 프리미티브 스타일이 조용히 빠진다.

   현재 사용처(둘 다 `data-lenis-prevent` + `class="scroll-fade-y"` 동반):
     - `[data-slot="widgets"]`        우측 위젯 패널
     - `[data-slot="content-inner"]`  본문 캔버스

   ────────────────────────────────────────────────────────────────
   [원문 주석 그대로 유지 — 2026-09-03/04 실측 근거]

   "위젯영역 커스텀 스크롤바 표시 (기본 스크롤x)" —
   smooth-scroll.css에서 대상을 숨김에서 제외하고, Design-system
   globals.css 21120~21150행과 동일한 방식으로 얇은 pill형 커스텀
   스크롤바를 적용한다.

   색상 토큰: Design-system globals.css 21121~21128행과 동일
     라이트 --scrollbar-thumb: #d4d4d4 (neutral-300)
     다크   --scrollbar-thumb: #3f3f46 (zinc-700)
   트랙은 transparent — 두 사용처 모두 이미 --color-background라
   트랙을 칠하면 패딩 공간이 떠 보인다.

   Lenis와 공존: Lenis는 네이티브 scrollTop을 직접 움직이므로
   CSS 커스텀 스크롤바는 실제 스크롤 위치를 기반으로 thumb 위치를
   정확하게 그린다(transform 방식의 ScrollSmoother와 달리 문제 없음).

   ────────────────────────────────────────────────────────────────
   스크롤 중에만 노출 — 페이드 인/아웃 [2026-09-04 요청]
   요청: "커스텀스크롤이 처음 안보이게하고 스크롤링을 하면 서서히
   나타나게(오퍼시티 처리 / 1초) 다시 스크롤링 동작을 안하면 서서히
   사라지게(오퍼시티 처리/1초)" + idle 대기 3초.

   타임라인
     로드 직후            : 완전히 안 보임(알파 0)
     스크롤 활동 발생     : 1초에 걸쳐 알파 0 → 1
     활동 정지 후 3초 경과: 1초에 걸쳐 알파 1 → 0
     3초 카운트다운 중 재스크롤 → 리셋(계속 보임)
   상태 토글은 이 프로젝트 관례대로 data 속성 하나
   (`[data-custom-scrollbar][data-scrolling="true"]`)로 하고,
   실제 토글은 smooth-scroll.js가 한다(3초 타이머도 거기).

   ★ 왜 opacity가 아니라 "색의 알파"인가 — Chromium 151 실측 근거
   ① 실제 렌더링 경로는 ::-webkit-scrollbar*가 아니라 **표준
      scrollbar-color**다. scrollbar-width/scrollbar-color가 지정된
      순간 Chromium은 표준 경로로 그리고 ::-webkit-scrollbar* 규칙을
      통째로 무시한다 — scrollbar-color:red + webkit thumb:blue를
      동시에 준 뒤 스크롤바 픽셀을 읽으면 red가 나온다(blue가 아니라).
      scrollbar-width/color를 auto로 되돌려야만 blue가 나타난다.
   ② 스크롤바는 엘리먼트가 아니라 컨테이너 자신의 장식이므로 컨테이너에
      opacity를 걸 수 없다(콘텐츠까지 같이 사라진다). 대신
*scrollbar-color 자체에 transition**을 걸 수 있고, 실제로
      Chromium이 색을 보간한다(실측: 알파 0→0.28→0.58→0.90→1.0,
      픽셀 254→241→229→214→212로 함께 변함).
   ③ ::-webkit-scrollbar-thumb에 opacity를 걸면 **아무 반응이 없고**
      (opacity:0인데 썸이 그대로 보임), background-color 알파는
      값이 바뀌긴 하지만 transition이 붙지 않아 **즉시 점프**한다.
      그래서 webkit 경로는 페이드가 불가능하다.
   → 결론: 알파를 담은 --scrollbar-thumb-opacity 하나만 토글하고,
     페이드는 scrollbar-color의 transition이 담당한다.
   ════════════════════════════════════════════════════════════════

---

## 2. 색상 토큰 + 표준 스크롤바(Chromium 121+/Firefox) — 대상 스코프에서만

색상 토큰 + 표준 스크롤바(Chromium 121+/Firefox) — 대상 스코프에서만
   덮어쓴다(전역 오염 없음). scrollbar-width:thin = 시스템 정의 얇은 스크롤바,
   thumb/track 색은 scrollbar-color가 결정한다.

---

## 3. 0% = 완전 투명(기본값 — 페이지 로드 직후 스크롤 이력이 없는 상태),

0% = 완전 투명(기본값 — 페이지 로드 직후 스크롤 이력이 없는 상태),
     100% = 불투명. JS는 이 값을 직접 만지지 않고 data-scrolling만 토글한다.

---

## 4. color-mix(..., transparent)는 임의 색에 알파를 입히는 표준 관용구다

color-mix(..., transparent)는 임의 색에 알파를 입히는 표준 관용구다
     (#d4d4d4 → rgba(212,212,212,alpha)). 이 프로젝트가 이미 여러 곳에서
     쓰는 color-mix 관용구와 같은 계열이라 새 문법을 들이지 않는다.

---

## 5. 페이드 본체. 프로젝트 관례대로 property/duration/timing 3분할로 적고,

페이드 본체. 프로젝트 관례대로 property/duration/timing 3분할로 적고,
     duration만 요청값 1s로 둔다(--default-transition-duration은 0.15s라
     여기에는 맞지 않는다). timing-function은 전역 토큰 그대로.

---

## 6. 스크롤 중(그리고 정지 후 3초 동안) — smooth-scroll.js가 붙였다 뗀다

스크롤 중(그리고 정지 후 3초 동안) — smooth-scroll.js가 붙였다 뗀다

---

## 7. [접근성] 모션 최소화 사용자에게는 자동 숨김/페이드를 아예 적용하지 않고

[접근성] 모션 최소화 사용자에게는 자동 숨김/페이드를 아예 적용하지 않고
   이전 동작(상시 노출)을 유지한다. smooth-scroll.js의 Lenis도 같은 조건에서
   비활성되므로(그 파일의 reducedMotion 분기) 여기서 상시 노출로 고정해야
   스크롤바가 영영 안 보이는 사태를 구조적으로 막을 수 있다. sidebar.css
   102~107행과 같은 취지의 미디어쿼리다. data-scrolling 두 상태를 모두
   열거해 JS가 무엇을 붙이든 결과가 같도록 한다(특이성 동률 + 뒤에 오므로
   항상 이김).

---

## 8. Webkit 폴백 — 6px 너비, pill 형 thumb.

Webkit 폴백 — 6px 너비, pill 형 thumb.
   ⚠ 위 실측(①)대로 최신 Chromium/Edge에서는 이 규칙들이 **전혀 쓰이지
   않는다**(scrollbar-color가 이긴다). scrollbar-color를 모르는 구버전
   WebKit(구 Safari 등)만 여기로 온다. 그 엔진에서는 실측(③)대로 페이드가
   붙지 않아 **즉시 나타났다 즉시 사라진다** — 보임/숨김 타이밍은 동일하고
   1초 페이드 연출만 생략되는 점진적 저하다. 삭제하지 않는 이유는 그 엔진에서
   스크롤바가 아예 시스템 기본 모양으로 돌아가버리기 때문.

---

## 9. Design-system 21150행과 동일 공식(80% 어둡게)에 현재 알파를 그대로 얹는다

Design-system 21150행과 동일 공식(80% 어둡게)에 현재 알파를 그대로 얹는다

