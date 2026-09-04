# `smooth-scroll.css` — 설계 주석

소스: `dashboard-skin/components/smooth-scroll.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Smooth Scroll — 기본(네이티브) 스크롤바 제거

════════════════════════════════════════════════════════════════
   Smooth Scroll — 기본(네이티브) 스크롤바 제거
   ────────────────────────────────────────────────────────────────
   [2026-09-03 요청] "스크롤은 기본스크롤 제거하고 lenis제공 스크롤 처리"
   — D:\MyCloud\frontend\src\index.css 331~332행의 `.scrollbar-hidden`
   유틸리티(Tailwind 없이 그대로 옮김)와 동일한 규칙. 그 프로젝트는
   Lenis로 스무스 스크롤하는 컨테이너마다 이 클래스를 붙여 네이티브
   스크롤바를 숨긴다(CardsWorkspace/ContactsWorkspace/HomePage 위젯 등
   다수 실사용). smooth-scroll.js가 Lenis를 붙이는 3개 컨테이너와
   정확히 짝을 맞춘다.

   [주의] 스크롤 "기능" 자체는 그대로 네이티브다 — scrollTop이 실제로
   바뀌고 Lenis가 그 값을 부드럽게 애니메이션할 뿐이다(smooth-scroll.js
   머리말 참고: 이게 ScrollSmoother 대신 Lenis를 쓰는 이유이기도 하다 —
   position:sticky가 깨지지 않음). 여기서 없애는 건 스크롤 동작이 아니라
*스크롤바의 시각적 트랙/썸(막대)** 뿐이다 — 키보드/트랙패드 스크롤,
   스크린리더 등 접근성 동작에는 영향이 없다(scrollbar-width:none은
   스크롤 자체를 막지 않는, 순수 표시 속성).
   ════════════════════════════════════════════════════════════════

---

## 2. [2026-09-03 커스텀 스크롤바 교체] 위젯 패널은 기본 스크롤바를 숨기지 않고

[2026-09-03 커스텀 스크롤바 교체] 위젯 패널은 기본 스크롤바를 숨기지 않고
   widgets.css에서 정의하는 커스텀 스크롤바로 교체한다 — 문서·사이드바만 숨김.

---

## 3. Firefox

Firefox

---

## 4. 구 Edge/IE

구 Edge/IE

---

## 5. Chrome/Edge/Safari(Blink·WebKit)

Chrome/Edge/Safari(Blink·WebKit)

