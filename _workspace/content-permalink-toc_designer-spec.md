# 글 상세(permalink) TOC — 비주얼 스펙

> **철회 (2026-09-05).** 구현 직후 사용자가 TOC가 필요 없다고 해 스킨에서 제거했다. 아래는 당시 스펙 기록이다.

- **정본:** shadcn 문서 v4 `docs-toc.tsx` + 페이지 우측 sticky 레일. 레지스트리 `toc` 없음.
- **토큰/`data-slot`:** Design-system `page-nav` (`dashboard.css` 261–338행).
- **PC 1440만.** dropdown 변형·반응형은 범위 밖.
- **소스 주석 금지.** 설명은 `content.css.md` / `content.js.md` / `skin.html.md`.

오케스트레이터 채택: **Q1 Design-system 트랙 / Q2 "On This Page" / Q3 h2–h4 / Q4 TOC 12rem 고정·기사 max 240 유지 / Q5 content-inner sticky.**

---

## 1. 마크업 (`skin.html`)

`<s_permalink_article_rep>` 안:

```
<div data-slot="post-single-layout">
  <article data-slot="post-single">…기존 전부…</article>
  <nav data-slot="page-nav" hidden>
    <p data-slot="page-nav-label">On This Page</p>
    <ul data-slot="page-nav-list"></ul>
  </nav>
</div>
```

항목은 JS가 `<li><a href="#id" data-depth="2|3|4">`로 채운다. 항목 0개면 `hidden` 유지(정본 `if (!toc?.length) return null`).

---

## 2. 색/치수

| 항목 | 값 | 출처 |
|---|---|---|
| TOC 폭 | `calc(var(--spacing)*48)` = 12rem = 192px | Design-system page-nav |
| 레이아웃 gap | `calc(var(--spacing)*8)` = 32px | 본문과 간격 |
| sticky top | `0` (스크롤 루트 = content-inner) | Q5 |
| max-height | `calc(var(--content-viewport-height) - var(--spacing)*12)` | inner 패딩 24×2 |
| 라벨 | `text-xs` / medium / `tracking-sm` / uppercase / `--color-foreground` | Design-system |
| 링크 기본 | `--color-muted-foreground` | 양쪽 정본 |
| 링크 hover | `--color-foreground` + 좌측바 30% mix | Design-system |
| 링크 active | `--color-foreground` + medium + 좌측바 solid foreground | Design-system |
| 좌측 트랙 | 리스트 `border-left: 1px solid var(--color-border)` | Design-system |
| 항목 좌측바 | `2px` transparent → hover/active | Design-system |
| depth 3/4 | `padding-left` +`*4` / +`*6` (정본 `pl-4`/`pl-6`) | shadcn docs-toc |
| 기사 | 기존 `max-width: calc(var(--spacing)*240)` 유지. 레이아웃 안에서는 `margin: 0` | Q4 |

1440에서 content-inner 가용 ≈816px → 기사 ≈592 + gap 32 + TOC 192.

---

## 3. JS (`initPostToc`, `initCodeBlocks` 다음)

1. `[data-slot="post-single-body"]`의 `h2,h3,h4`만. 빈 텍스트 건너뜀. `pre`/`code` 안 제목 없음(에디터 관례).
2. id: 이미 있으면 재사용. 없으면 slug(소문자, 공백→`-`, `[^\w가-힣-]` 제거, 충돌 시 `-2`). `id` + `scroll-margin-top: calc(var(--spacing)*4)`.
3. 목록 채운 뒤 `hidden` 제거. 0개면 그대로 숨김.
4. `IntersectionObserver({ root: content-inner, rootMargin: "0% 0% -80% 0%" })` — 정본 그대로. intersecting이면 그 id만 `data-active="true"`.
5. 클릭: `preventDefault`, `content-inner` 스크롤(Lenis `.__skinLenis.scrollTo(y)` 있으면 그것, 없으면 `scrollTo`). hash는 `history.replaceState`.
6. 멱등: `nav[data-toc="ready"]`면 skip.

`smooth-scroll.js`가 `content-inner.__skinLenis`에 인스턴스를 붙인다(클릭 시점에는 content.js보다 늦게 로드되므로 존재).

---

## 4. 정본과 다른 점

| 정본 | 이 스킨 | 이유 |
|---|---|---|
| 문서 window 스크롤 + observer 기본 root | `content-inner` | 이 셸의 스크롤 모델 |
| `xl:flex`로 숨김 | PC 단계에서 항상 시도, 항목 없으면 `hidden` | 반응형 이전 |
| dropdown variant | 없음 | PC first |
| 플로팅 버튼(1차 스킨) | 없음 | 대시보드 방향 폐기 |
| 새 파일 | `content.css`/`content.js`/`skin.html`만 | 콘텐츠 구역 append |

---

## 5. 목업

`PROSE_SAMPLE`의 기존 h2–h6면 충분. h2–h4만 목차에 오른다.

---

## 6. developer 체크리스트

| # | 판정 |
|---|---|
| 1 | permalink에 `[data-slot="page-nav"]` 있고 hidden이 아님. 링크 수 = body `h2,h3,h4` 수 |
| 2 | 각 `a[href="#id"]`에 대응하는 heading `id` 존재 |
| 3 | nav 폭 192px, sticky, 라벨 "On This Page" |
| 4 | 첫 `data-depth="3"` 클릭 후 content-inner `scrollTop` > 0, 해당 항목 `data-active="true"` |
| 5 | 가로 오버플로 0, 위젯 320px 유지 |
| 6 | no-JS: nav `hidden`, 레이아웃 붕괴 없음 |
| 7 | 목록(index) 목업에 page-nav 없음(permalink 블록 미렌더) |
| 8 | 라이트/다크 스크린샷 |
| 9 | 새 소스 주석 0 |
