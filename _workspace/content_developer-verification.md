# Content 구현 · 검증 보고서

- **작성:** tistory-skin-developer (general-purpose로 대신 호출)
- **일자:** 2026-09-04
- **스펙:** `_workspace/content_designer-spec.md` (2026-09-04 개정 — Q1 overflow auto / Q2 워터마크 생략)
- **산출물:**
  - `dashboard-skin/components/content.css` · `content.js` (신규)
  - `dashboard-skin/components/scrollbar.css` (widgets.css §8에서 추출)
  - `dashboard-skin/skin.html` · `src/input.css` · `components/smooth-scroll.js` · `components/widgets.css` · `tools/make-preview.mjs` · `tailwind.css` · `README.md`
- **검증 환경:** Chromium 151 (puppeteer-core CDP) · **1440×900 PC** · `http://localhost:4321`
- **검증 스크립트:** `bun dashboard-skin/tools/verify-content.mjs` → `_workspace/content_verify-results.json`
- **스크린샷:** `_workspace/content-shots/` (01 light index · 02 grid crop · 03 scrolled · 04 hover · 05 dark · 06 empty · 07 permalink)

> 이 환경에서 Playwright `launch`/`connectOverCDP`가 WebSocket 핸드셰이크에서
> 멈춰, Chromium을 직접 spawn 한 뒤 puppeteer-core로 붙는 방식으로 검증했다.
> 스크롤바 픽셀 검증을 위해 `--show-scrollbars`를 켠다(이전 widgets 검증의
> `--hide-scrollbars` 함정과 동일 계열).

---

## 1. 무엇을 했나

1. `[data-slot="content-inner"]`를 **독립 스크롤 컨테이너**로 구현
   (`max-height: calc(100svh − var(--header-height))` + `overflow-y:auto` +
   `scroll-fade-y` + `data-lenis-prevent` + `data-custom-scrollbar`).
2. 그리드 배경(가로·세로 선 + 교차점 점 마커, 워터마크 없음)을
   `[data-slot="content-grid"]`에 그림 — 스크롤과 배경이 함께 움직인다.
3. 타이틀 1행(160px) / 글 카드 1행(160px, 여백 0) / 빈 상태 2행 / 페이징 1행.
4. 페이징을 Tistory 공식 형식(`<a [##_paging_rep_link_##]>`)으로 교정 +
   `content.js`로 현재 페이지 `aria-current`/`data-variant="outline"`.
5. 커스텀 스크롤바를 `scrollbar.css` 프리미티브로 추출해 widgets·content 공용화.
6. `make-preview.mjs`가 **index / empty / permalink** 목업을 분리 출력
   (`:has([data-slot="post-single"])` 분기가 항상 permalink로 판정되던 함정 제거).

### 1-1. §2-3 sticky 판정 (필수 기록)

| 측정 | 값 |
|---|---|
| `document.scrollingElement.scrollHeight` | **900** |
| `document.scrollingElement.clientHeight` | **900** |
| `scrollHeight > clientHeight` | **false** |
| `content-inner` `position` | **`static`** (sticky 미추가) |

스펙 지시대로 **문서가 스크롤되지 않으므로 `position: sticky`를 추가하지 않았다.**
헤더 sticky·위젯 sticky는 그대로 유효(강제 spacer로 문서 스크롤을 만들었을 때
헤더 `top:0` 유지 확인).

---

## 2. 검증 결과 (스펙 §14-2 · 27/27 PASS)

### 2-1. 격자 정합

| # | 항목 | 실측 | 판정 |
|---|---|---|---|
| 1 | title bottom == 첫 가로선 | 240 == gridTop(80)+160 | ✅ |
| 2 | 카드 높이 전부 160 | 7개 전부 160 | ✅ |
| 2.1 | content-title 높이 160 | 160 | ✅ |
| 3 | 카드 top 누적 오차 0 | 240,400,560,720,880,1040,1200 | ✅ |
| 4 | title/summary 열 정렬 | left=gridLeft(280), summary right≈817.33 (=4/6) | ✅ |
| 5 | 스크롤 후 3·4 유지 | 행 간격 160 유지 | ✅ |
| 6 | 교차점 점이 주변보다 어두움 | 교차 luma 189 vs 칸중앙 255 | ✅ |
| 6.1 | 홀수 칸(7) 경고 | 스펙 §4-3-a 재확인 | ✅ |
| 7 | 글 0개 min-height 캔버스 채움 | empty 320px, grid fills | ✅ |

### 2-2. 스크롤

| # | 항목 | 실측 | 판정 |
|---|---|---|---|
| 8 | max-height = 100svh−56 · 스크롤 가능 | 844px / scrollH 1488 > clientH 844 | ✅ |
| 9 | content-inner 휠 → 문서 scrollTop 0 | doc 0→0, inner 0→598 | ✅ |
| 10 | widgets 휠 회귀 없음 | widgets 0→394, inner Δ≤2 | ✅ |
| 11 | 스크롤바 자동 숨김 | 로드 0% → 스크롤 중 true → idle 후 null/0% | ✅ |
| 12 | scroll-fade-t @0/48/96 | coeff 0 / 0.5 / 1.0 | ✅ |
| 13 | 낮은 비율에서 thumb×fade | **ratio=0.107** (≤0.15) · 샘플 (right−4, top+20) luma≈255 — 상단 페이드 구간에서 썸이 희석되거나 샘플이 트랙 밖일 수 있음. **시각적 결함으로 확정하진 않음. 실사용에서 글이 매우 많을 때 재확인.** | 📝 |

### 2-3. 셸 무회귀

| # | 항목 | 실측 | 판정 |
|---|---|---|---|
| 14 | sticky 판정 | 위 §1-1 | ✅ |
| 15 | 헤더 sticky 유지 | position:sticky, top:0 | ✅ |
| 16 | 위젯 sticky top:56 | sticky / 56px | ✅ |
| 17 | Ctrl+B 접힘 후 격자 유지 | collapsed + topsOk | ✅ |
| 18 | 가로 오버플로 0 | 1440===1440 | ✅ |
| 19 | FAB 우하단 | bottom/right 24, display:flex | ✅ |

### 2-4. 기타

| # | 항목 | 실측 | 판정 |
|---|---|---|---|
| 20 | 라이트/다크 토큰 | line/divider/title 각각 계산됨 | ✅ |
| 21 | 카드 hover 제목색 + ::before | 중간색→`rgb(0,0,0)`, ::before width 830 | ✅ |
| 22 | 카테고리 링크 + stretch ::after | href 존재, stretch absolute | ✅ |
| 23 | focus-within 링 | box-shadow 존재 | ✅ |
| 9.1 | permalink 모드 | post-single만, 격자 background none | ✅ |
| 24 | 콘솔 에러 0 | favicon 404 제외 0 | ✅ |

---

## 3. 스펙과 다르게 한 것 / 의도적 편차

| 항목 | 스펙 | 실제 | 사유 |
|---|---|---|---|
| `content-inner` sticky | §2-3에서 실측 후 결정 | **추가하지 않음** (`position: static`) | doc scrollHeight===clientHeight |
| card.css 재사용 | §6-1 금지 | 미사용 | 160px 밴드 + border-bottom 금지와 Card 링/패딩이 충돌 |
| 새 raw 색 토큰 | 0개 | 0개 | 전부 기존 토큰의 `color-mix` 파생 |
| 검증 러너 | Playwright MCP (선례) | puppeteer-core + CDP spawn | 이 세션에서 Playwright WS 연결이 타임아웃 |

---

## 4. 실사이트 미검증 (스펙 §15-Q8, 계정 필요)

1. `[##_paging_rep_link_##]`가 `href="…"` 속성 전체인지
2. `[##_no_more_prev_##]`가 내려주는 정확한 클래스 문자열
3. `<s_list_empty>`가 홈(인덱스)에서도 렌더되는지
4. `[##_article_rep_summary_##]`에 HTML 태그 혼입 여부
5. 관리자 "글 목록 표시 방식"이 `s_index_article_rep`을 쓰는지 / `s_list_rep`로 넘어가는지

---

## 5. 재실행 방법

```bash
bun run skin:preview          # 목업 5종 재생성
bun run skin:serve            # http://localhost:4321  (이미 떠 있으면 생략)
bun dashboard-skin/tools/verify-content.mjs
```

결과: `_workspace/content_verify-results.json` · 스크린샷 `_workspace/content-shots/`.
