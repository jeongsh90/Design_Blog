# `header.css` — 설계 주석

소스: `dashboard-skin/components/header.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Header — Design-system 헤더의 바닐라 이식

════════════════════════════════════════════════════════════════
   Header — Design-system 헤더의 바닐라 이식
   ────────────────────────────────────────────────────────────────
   이식 원본: D:\MyCloud\2026포트폴리오\Design-system
              css/layout.css      23–78행  (header / header-inner / header-start / header-actions)
              css/components.css  796–1075행 (Button)
              css/components.css  6412–6464행 (Breadcrumb)
   스펙:      _workspace/header_designer-spec.md
   원본과 달라진 부분은 전부 `[SPEC …]` 주석으로 표시했다.
   ════════════════════════════════════════════════════════════════

---

## 2. 공용 프리미티브 ── Button

════════════════════════════════════════════════════════════════
   ── 공용 프리미티브 ── Button
   [SPEC §6-6] 헤더 전용이 아니지만 sidebar 구역이 sidebar-input/separator
   포트를 별도 파일로 빼지 않은 선례를 따라 여기에 둔다(업로드 파일 수도 줄인다).
   다른 구역이 본격적으로 쓰기 시작하면 button.css로 추출한다.
   [SPEC §6-5] src/input.css에 토큰이 없는 변형(secondary/destructive/soft/
   data-color)은 이식하지 않는다 — 없는 변수를 참조하면 조용히 무색이 된다.
   ════════════════════════════════════════════════════════════════

---

## 3. [SPEC §6-7] 원본은 <i data-lucide>를 쓰고 우리는 인라인 <svg>를 쓴다.

[SPEC §6-7] 원본은 <i data-lucide>를 쓰고 우리는 인라인 <svg>를 쓴다.
   원본 선택자가 이미 둘 다 받으므로 그대로 유지한다.

---

## 4. variant

── variant ──

---

## 5. size

── size ──

---

## 6. ★ 이번 요청("sm사이즈") — 32px

★ 이번 요청("sm사이즈") — 32px

---

## 7. [SPEC §6-5] 원본의 aria-invalid / destructive / soft / data-color 규칙은

[SPEC §6-5] 원본의 aria-invalid / destructive / soft / data-color 규칙은
   --destructive · --sys-* 토큰이 아직 없어 이식하지 않는다(무색이 될 뿐이다).
   해당 토큰을 도입하는 구역에서 함께 추가한다.

---

## 8. 공용 프리미티브 ── Breadcrumb  (components.css 6412–6464행)

════════════════════════════════════════════════════════════════
   ── 공용 프리미티브 ── Breadcrumb  (components.css 6412–6464행)
   ════════════════════════════════════════════════════════════════

---

## 9. separator는 <li> 직계 — role="presentation" aria-hidden="true"

separator는 <li> 직계 — role="presentation" aria-hidden="true"

---

## 10. [2026-09-03] Tooltip 프리미티브는 sidebar 구역도 쓰게 되면서

[2026-09-03] Tooltip 프리미티브는 sidebar 구역도 쓰게 되면서
   `tooltip.css`(같은 폴더)로 추출했다 — 헤더 우측 4개 버튼(홈/태그/
   방명록/즐겨찾기)이 여기서 그 클래스를 쓴다.

---

## 11. Header 레이아웃 ──  (layout.css 23–64행)

════════════════════════════════════════════════════════════════
   ── Header 레이아웃 ──  (layout.css 23–64행)
   [SPEC §6-1] 원본 조상 `.app-shell > [data-slot="main"]`은 Design-system
   문서 사이트 전용 셸이다(layout.css 머리말이 외부 사용 금지를 명시).
   우리 스킨은 sidebar 구역에서 확정한 shadcn 정본 슬롯
   `[data-slot="sidebar-inset"]`을 그 자리에 쓴다 — 선언 내용은 그대로다.
   ════════════════════════════════════════════════════════════════

---

## 12. [2026-09-04, CONTENT SPEC §2-4] 리터럴 calc(var(--spacing)*14)를 전역 토큰

[2026-09-04, CONTENT SPEC §2-4] 리터럴 calc(var(--spacing)*14)를 전역 토큰
     --header-height(src/input.css @theme static, 값 동일 56px)로 교체.
     content-inner의 max-height: calc(100svh - var(--header-height))가 이 헤더
     높이와 반드시 같은 값을 써야 해서 단일 출처로 묶었다.

---

## 13. 56px — sidebar-header와 동일 (sidebar 스펙 §8-Q3)

56px — sidebar-header와 동일 (sidebar 스펙 §8-Q3)

---

## 14. [SPEC §6-2] 원본은 [data-slot="main"]에 height:100vh를 주고 본문을

[SPEC §6-2] 원본은 [data-slot="main"]에 height:100vh를 주고 본문을
     내부 스크롤로 굴리지만, 티스토리는 서버가 주입하는 요소(관리 메뉴바·
     광고 컨테이너)와 긴 글의 앵커 이동 때문에 그 모델이 깨진다.
     → 헤더만 sticky로 고정하고 스크롤 모델은 content 구역에 맡긴다.
     z-index는 sidebar-container(10)보다 낮게 둬서 사이드바가
     헤더 위로 겹치지 않게 한다.

---

## 15. [SPEC §6-4, 2026-09-02 갱신] 원래는 원본 layout.css 62–64행을 따라 PC에서

[SPEC §6-4, 2026-09-02 갱신] 원래는 원본 layout.css 62–64행을 따라 PC에서
   숨기고 사이드바 푸터 토글만 보이게 했으나, 사용자 요청으로 사이드바 푸터의
   테마 토글이 제거됐다 — 이제 이 헤더 토글이 PC에서도 유일한 테마 전환 수단이라
   항상 노출한다(Design-system 원본의 모바일 노출 값 inline-flex를 그대로 사용).

---

## 16. [2026-09-02] 즐겨찾기 — 채워진 상태만 별을 solid로 바꾼다(테두리는 항상 유지).

[2026-09-02] 즐겨찾기 — 채워진 상태만 별을 solid로 바꾼다(테두리는 항상 유지).

---

## 17. [2026-09-02 요청] 테마 토글 — 헤더 밖 화면 우측 하단 고정(FAB).

[2026-09-02 요청] 테마 토글 — 헤더 밖 화면 우측 하단 고정(FAB).
   기존 outline/icon 버튼 스타일(테두리·36px·hover) 위에 위치·둥근 모서리·
   그림자만 덧씌운다 — 색상/hover 로직은 새로 만들지 않고 그대로 상속받는다.

---

## 18. [SPEC §6-3] 브레드크럼 줄바꿈 금지 — 헤더 스코프 안에서만.

[SPEC §6-3] 브레드크럼 줄바꿈 금지 — 헤더 스코프 안에서만.
   원본 크럼은 짧은 내비 라벨이지만 우리는 [##_page_title_##](글 제목 전체)이
   들어와서, 원본의 flex-wrap:wrap / word-break:break-word를 그대로 두면
   56px 헤더가 두 줄로 터진다. 컴포넌트 기본 선언은 건드리지 않는다.

---

## 19. 블로그 제목 크럼은 글 제목보다 먼저 줄어들지 않게 한다

블로그 제목 크럼은 글 제목보다 먼저 줄어들지 않게 한다

---

## 20. 160px

160px

