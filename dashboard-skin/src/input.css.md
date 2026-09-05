# `input.css` — 설계 주석

소스: `dashboard-skin/src/input.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [SPEC 2026-09-05] post-actions "더보기" dropdown-menu 전용 신규 토큰.

[SPEC 2026-09-05] post-actions "더보기" dropdown-menu 전용 신규 토큰.
     Design-system globals.css의 --card/--card-foreground(#ffffff/#000000)와
     정확히 짝을 이루는 프리셋 블록(20383행~)에서 그대로 옮김.

---

## 2. [PROSE SPEC §3-1] 본문 링크. --color-primary를 그대로 쓰면 다크에서

[PROSE SPEC §3-1] 본문 링크. --color-primary를 그대로 쓰면 다크에서
     링크(#e5e5e5)가 본문(#fafafa)보다 어두워지고, --sidebar-* 직접 참조는
     이 프로젝트가 금지한 관례다. 값 자체는 위 팔레트의 재사용이다
     (라이트 = --sidebar-primary 32행 / 다크 = --sidebar-accent-foreground 63행).

---

## 3. [SPEC 2026-09-05] 같은 프리셋의 다크 짝(20419행~) — --card/--card-foreground

[SPEC 2026-09-05] 같은 프리셋의 다크 짝(20419행~) — --card/--card-foreground
     (#171717/#fafafa)와 정확히 일치하는 블록이라 여기서 옮겨왔다.

---

## 4. [PROSE SPEC §3-1] 대비 11.95:1 on #0a0a0a — AAA

[PROSE SPEC §3-1] 대비 11.95:1 on #0a0a0a — AAA

---

## 5. [PROSE SPEC §0-2/§3-1] 코드 전용 스택. Tailwind 기본 테마에도 같은 값이

[PROSE SPEC §0-2/§3-1] 코드 전용 스택. Tailwind 기본 테마에도 같은 값이
     있지만 tree-shaking 결과라 재빌드 조건이 바뀌면 조용히 사라질 수 있고,
     그러면 코드가 Pretendard(가변폭)로 렌더된다 — 명시 선언으로 고정한다.
     값은 Design-system extra.css 787·804행의 리터럴 스택.

---

## 6. [PROSE SPEC §0-3/§3-1] Design-system globals.css 416·417행 —

[PROSE SPEC §0-3/§3-1] Design-system globals.css 416·417행 —
     --text-{size}와 짝을 이루는 한글 전용 자간 스케일. 본문 h3 / h1·h2용.

---

## 7. [RESPONSIVE SPEC §4-3] 모바일 오프캔버스 드로어(sidebar.css §4-2)가 쓰는

[RESPONSIVE SPEC §4-3] 모바일 오프캔버스 드로어(sidebar.css §4-2)가 쓰는
     그림자. shadcn <SheetContent>의 `shadow-lg`와 같은 값이며, 출처는
     Design-system css/globals.css 21162행("Tailwind v4 기본값으로 전역 보완").
     ※ 스펙은 ":root와 @theme static 두 곳"에 넣으라고 했으나, 실측 결과
        --shadow-xs/--shadow-md도 :root에는 없고 @theme static에만 있다
        (@theme static이 출력 CSS의 :root로 그대로 방출된다 — tailwind.css에
        --shadow-md가 1회만 등장하는 것으로 확인). 기존 형제 토큰과 같은 자리
        한 곳에만 둔다.

---

## 8. [SPEC 2026-09-05] dropdown-menu(더보기) 전용

[SPEC 2026-09-05] dropdown-menu(더보기) 전용

---

## 9. [PROSE SPEC §3-1] 본문 링크 (댓글 구역도 곧 쓸 수 있게 구역 스코프가 아닌 전역 토큰)

[PROSE SPEC §3-1] 본문 링크 (댓글 구역도 곧 쓸 수 있게 구역 스코프가 아닌 전역 토큰)

