# `input.css` — 설계 주석

소스: `dashboard-skin/src/input.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. dashboard-skin / Tailwind v4 엔트리

────────────────────────────────────────────────────────────────
   dashboard-skin / Tailwind v4 엔트리
   빌드: bunx --bun @tailwindcss/cli -i dashboard-skin/src/input.css \
                                     -o dashboard-skin/tailwind.css --minify
   스캔 대상: dashboard-skin/skin.html, dashboard-skin/components/*.js
   ────────────────────────────────────────────────────────────────
   근거: _workspace/sidebar_designer-spec.md
     §2  색상 형식 = hex 확정 (oklch 리터럴 사용 안 함)
     §3  색상 매핑표 (§3-3 의도적 이탈 3건 포함)
     §1-3 --color-* 매핑은 shadcn/Design-system 패턴 그대로
   ────────────────────────────────────────────────────────────────

---

## 2. 스캔 소스 명시 — CLI가 CSS 파일 위치(dashboard-skin/src) 기준으로 훑는다

스캔 소스 명시 — CLI가 CSS 파일 위치(dashboard-skin/src) 기준으로 훑는다

---

## 3. shadcn 다크 변형: <html class="dark"> 토글 (Design-system js/components.js 1803–1825행과 동일 방식)

shadcn 다크 변형: <html class="dark"> 토글 (Design-system js/components.js 1803–1825행과 동일 방식)

---

## 4. raw 색상 토큰 (hex)

── raw 색상 토큰 (hex) ─────────────────────────────────────────
   출처: D:\MyCloud\2026포트폴리오\Design-system\css\globals.css
         :root(20381–20422) / .dark(20461–20503)
   @supports (color: lab(...)) 향상 레이어는 스펙 §2-3에 따라 이식하지 않는다.
   ────────────────────────────────────────────────────────────────

---

## 5. [RIGHT-WIDGETS SPEC §4-1] Card 컴포넌트가 요구하는 토큰.

[RIGHT-WIDGETS SPEC §4-1] Card 컴포넌트가 요구하는 토큰.
     Design-system globals.css 20385–20386행 값 그대로.

---

## 6. §3-3(a) 의도적 이탈 — Design-system 라이트 원본은 #171717(무채색).

§3-3(a) 의도적 이탈 — Design-system 라이트 원본은 #171717(무채색).
     브랜드 마크가 라이트에서 "검정 네모"로 읽히지 않도록 확정 액센트(파랑)로 통일.
     대비 #fafafa on #1447e6 = 6.55:1 (AA)

---

## 7. §3-3(b) 의도적 이탈 — 원본 #171717은 기본 전경색과 사실상 동일해

§3-3(b) 의도적 이탈 — 원본 #171717은 기본 전경색과 사실상 동일해
     활성 메뉴가 구분되지 않는다. 대비 #1447e6 on #f5f5f5 = 6.27:1 (AA)

---

## 8. [RIGHT-WIDGETS SPEC §4-1] Design-system globals.css 20465–20466행 값 그대로.

[RIGHT-WIDGETS SPEC §4-1] Design-system globals.css 20465–20466행 값 그대로.

---

## 9. §3-3(b) — 다크에서 #1447e6를 글자색으로 쓰면 2.62:1로 실패한다.

§3-3(b) — 다크에서 #1447e6를 글자색으로 쓰면 2.62:1로 실패한다.
     blue-300 계열 #8ec5ff on #262626 = 8.35:1 (AAA)

---

## 10. 테마 토큰

── 테마 토큰 ───────────────────────────────────────────────────
   `static` = 실제 유틸리티 사용 여부와 무관하게 모든 변수를 출력한다.
   components/sidebar.css 가 순수 CSS(스캔 대상 아님)에서 var(--color-*)를
   직접 참조하므로, tree-shaking 되면 사이드바 전체가 무색이 된다.
   `inline`을 쓰지 않는 이유도 동일 — inline이면 --color-* 변수 자체가
   출력되지 않고 유틸리티에 값만 박힌다.
   (Design-system globals.css 465–484행의 컴파일 결과와 같은 형태)
   ────────────────────────────────────────────────────────────────

---

## 11. [CONTENT SPEC §2-4 / §10-3] 셸 상수 56px의 단일 출처.

[CONTENT SPEC §2-4 / §10-3] 셸 상수 56px의 단일 출처.
     이 값은 지금까지 세 곳이 각자 복붙해 두고 있었다 —
       sidebar-header 높이(sidebar.css) / 헤더 높이(header.css 296행) /
       --widgets-top(widgets.css 56행).
     content-inner가 네 번째 사용처(max-height: 100svh − 56px)가 되면서
     드리프트를 막기 위해 토큰으로 승격했다. sidebar 스펙 §8-Q3에서
     "사이드바 브랜드 행과 본문 헤더의 밑선이 한 줄로 맞아야 한다"는
     이유로 의도적으로 묶어 확정한 값이라, 단일 토큰이 원래 의도에 맞는다.
     ⚠ content-inner는 widgets의 형제라 --widgets-top(=[data-slot="widgets"]
       스코프 변수)을 var()로 읽을 수 없다 — 읽으면 guaranteed-invalid가 되어
       max-height 선언이 통째로 무시되고 스크롤 컨테이너가 조용히 성립하지
       않는다. 그래서 반드시 이 전역 토큰을 쓴다.

---

## 12. [CONTENT SPEC §0-1 / §10-3] Design-system(D:\MyCloud) 조회가 불가한

[CONTENT SPEC §0-1 / §10-3] Design-system(D:\MyCloud) 조회가 불가한
     환경이라, 이 프로젝트에 실제로 설치된 Tailwind v4 패키지에서 직접 읽었다:
       node_modules/tailwindcss/theme.css 353행 --text-lg: 1.125rem
                                          355행 --text-xl: 1.25rem
                                          357행 --text-2xl: 1.5rem
     기존 xs/sm/base가 이 파일의 값과 문자 단위로 일치하므로(같은 v4 기본
     스케일) 같은 파일에서 이어받는 것이 안전하다. lg/xl은 §15-Q3의 예비 옵션.
     ⚠ 자간 토큰은 함께 확장하지 않는다 — --tracking-*는 Tailwind 기본값이
       아니라 Design-system의 한글 전용 스케일이라 지어낼 수 없다(§11-2).

---

## 13. [CONTENT SPEC §10-3] node_modules/tailwindcss/theme.css 394행. 단일 글 본문용.

[CONTENT SPEC §10-3] node_modules/tailwindcss/theme.css 394행. 단일 글 본문용.

---

## 14. pretendard-typography 스케일과 값이 일치 (globals.css 413–415행 실측)

pretendard-typography 스케일과 값이 일치 (globals.css 413–415행 실측)

---

## 15. [2026-09-02, 우측하단 고정 테마 토글용] --shadow-xs와 같은 소프트 섀도 계열로

[2026-09-02, 우측하단 고정 테마 토글용] --shadow-xs와 같은 소프트 섀도 계열로
     확장. Design-system globals.css 안쪽의 브루탈리스트 오프셋 섀도(4px 4px 0px)는
     별개 테마 프리셋이라 이 프로젝트가 이미 택한 소프트 스타일과 맞지 않아 쓰지 않는다.

---

## 16. [RIGHT-WIDGETS SPEC §4-1]

[RIGHT-WIDGETS SPEC §4-1]

---

## 17. shadcn `scroll-fade` 유틸리티  [2026-09-04 요청 — 우측 위젯 패널]

════════════════════════════════════════════════════════════════
   shadcn `scroll-fade` 유틸리티  [2026-09-04 요청 — 우측 위젯 패널]
   ────────────────────────────────────────────────────────────────
   출처: npm `shadcn@4.20.1` / `dist/tailwind.css` 97~236행을 실제로
         내려받아 확인한 원문 그대로(추측 아님). 2026-06 "Components for
         Chat Interfaces" 릴리스로 shadcn 코어에 편입돼 `shadcn init` 시
         기본 포함되는 순수 CSS 유틸리티다.
         (사용자가 언급한 `@ncdai/scroll-fade-effect`의 현재 정본)

   동작: JS 전혀 없음. `animation-timeline: scroll(self y)`(CSS 스크롤
         기반 애니메이션)가 스크롤 진행도를 그대로 읽어 --scroll-fade-t/-b
         길이를 키우고, 그 길이만큼 mask-image가 위/아래 가장자리를
         투명하게 지운다. 맨 위에서는 위쪽이 0px(페이드 없음), 조금이라도
         스크롤하면 96px 구간에 걸쳐 최대치까지 자란다. 아래쪽은 반대로
         바닥에 닿으면 0px이 된다 — "넘어가는 방향에만 페이드"가
         커스텀 로직 없이 유틸리티 정의 자체로 성립한다.

   원본에서 옮기지 '않은' 것(이번 요청이 위/아래 전용이라 불필요):
     `scroll-fade`(단독, -y와 정의가 완전히 동일한 중복), `-x`, `-t`, `-b`,
     `-l`, `-r`, `-s`, `-e`, `-none`, 그리고 그것들만 쓰는
     `@property --scroll-fade-s/-e`, `@keyframes ...-reveal-s/-e`,
     크기 조절 유틸 중 s-·e- 두 종류.
   옮긴 것은 아래 그대로: --scroll-fade-t/-b/-mask, reveal-t/-b,
     scroll-fade-y, 그리고 크기 조절 유틸 3종(무접미사·t-·b-).
   ⚠ 이 주석 안에 별표+슬래시 조합을 쓰면 CSS 주석이 그 자리에서 끝나
     뒤 내용이 코드로 파싱된다(실제로 한 번 겪음) — 유틸리티 이름을
     적을 때 `-*` 뒤에 슬래시를 붙이지 말 것.
   ════════════════════════════════════════════════════════════════

---

## 18. `inline`은 shadcn 원문 그대로. 이 블록에는 색상 토큰이 없고 @keyframes만

`inline`은 shadcn 원문 그대로. 이 블록에는 색상 토큰이 없고 @keyframes만
   있어, 앞의 `@theme static`(--color-* 출력 강제)과 목적이 겹치지 않는다.

---

## 19. 문서 바탕

── 문서 바탕 ───────────────────────────────────────────────────

