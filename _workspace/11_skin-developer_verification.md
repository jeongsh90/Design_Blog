# 리스킨 검증 보고서 — 무엇을 확인했고 무엇을 확인하지 못했나

- 작성: `tistory-skin-developer` (Phase 3)
- 산출물: `D:\MyCloud\Design_Blog\skin\` (skin.html / style.css / script.js / index.xml / README.md / preview*.jpg)
- 원본: `D:\MyCloud\Design_Blog\daitnu-skin-v1.01\` — **수정하지 않음**
- 스펙: `_workspace/10_skin-designer_visual-spec.md`

---

## 0. 검증 환경 (한계 먼저)

이 하네스는 **티스토리 계정에 접근할 수 없다.** 따라서 실제 서버 렌더링이 아니라,
`skin.html` 의 티스토리 치환자·조건 블록을 더미 데이터로 치환한 **로컬 미리보기**를 만들어 검증했다.

- 미리보기 생성기: `C:\Users\...\scratchpad\build-mockup.mjs` (일회성 도구, 배포물 아님)
- 미리보기 결과물: `_workspace/_preview/*.html` (7종) — 배포 산출물인 `skin/` 과 분리되어 있다
- 서빙: 로컬 HTTP 서버(127.0.0.1:8777) → 미리보기 HTML이 실제 `skin/style.css`, `skin/script.js` 를 그대로 링크
- 브라우저: Playwright(Chromium)

미리보기 7종:

| 파일 | body id | 목록 타입 | 썸네일 모양 | 대표이미지 |
|---|---|---|---|---|
| `index-list.html` | tt-body-index | 리스트형 | 둥근사각 | — |
| `index-card.html` | tt-body-index | 카드형 | 둥근사각 | — |
| `index-thumbnail.html` | tt-body-index | 썸네일형 | 둥근사각 | — |
| `index-card-circle.html` | tt-body-index | 카드형 | **원형** | — |
| `index-list-square.html` | tt-body-index | 리스트형 | **사각형** | — |
| `post-wide.html` | tt-body-page | — | 둥근사각 | **wide** |
| `post-default.html` | tt-body-page | — | 둥근사각 | **default** |

각 index 미리보기에는 커버 4종(banner / list / card-list / thumbnail-list)이 모두 들어 있어
배너 지그재그와 리스트 3종을 한 페이지에서 동시에 확인할 수 있다.
포스트 미리보기의 본문에는 **h2/h3/h4 25개**(TOC 19개 초과 스크롤 확인용)와 **코드 블록 2개**(js/css)를 넣었다.

---

## 1. ✅ 실제로 확인한 것

### 1-1. 뷰포트 × 테마 조합 렌더링

| 조합 | 확인 방법 | 결과 |
|---|---|---|
| PC 1440 × 라이트 (index-card) | 전체 페이지 스크린샷 | 배너 지그재그·카드 3열·리스트형·썸네일형·태그·푸터 정상 |
| PC 1440 × 다크 (index-card) | 전체 페이지 스크린샷 | 배경 #0a0a0a, 표면/전경 토큰 반전 정상 |
| PC 1440 × 라이트 (index-list) | 스크린샷 + 실측 | 리스트형 썸네일 168×168, 구분선이 본문 폭 끝까지 |
| PC 1440 × 라이트 (post-wide) | 스크린샷 | wide 대표이미지가 우측 뷰포트 끝까지 풀블리드, 좌측만 라운드 |
| PC 1440 × 라이트/다크 (코드 블록) | 스크린샷 2장 | 문법 강조 색이 테마별로 분리되어 정상 |
| 태블릿 820 × 다크 (배너) | 스크린샷 | 홀수=좌측 / 짝수=우측 지그재그, 그라디언트 방향 반전 |
| 태블릿 820 × 라이트 (post) | 스크린샷 | 사이드바 200px, 본문 flex, TOC 버튼 세로 중앙 |
| 모바일 390 × 라이트 (배너) | 스크린샷 | 전부 좌측 정렬(교차 끔), 4:3, 설명 1줄 클램프 |
| 모바일 390 × 다크 (post + TOC 열림) | 스크린샷 | TOC 패널 노출, 내부 스크롤바 표시 |
| 모바일 390 (사이드바 드로어) | 실제 클릭 | 드로어 슬라이드 인, 오버레이 딤, 헤더 숨김, MENU 섹션(Tag/Guestbook) 노출 |

스크린샷은 `_workspace/_preview/shots/` 에 남겨 두었다.

### 1-2. 반응형 수치 (getComputedStyle 실측)

| 항목 | 모바일 390 | 태블릿 820 | PC 1440 |
|---|---|---|---|
| 카드형 그리드 | 1열 | 2열 | 3열 |
| 썸네일형 그리드 | 1열 | 2열 | **4열**(1360에서 확인) / 1200에서 3열 확인 |
| 리스트형 방향 | column | row | row |
| 사이드바 폭 | 300px(드로어, `translateX(-300px)`) | 200px | 240px |
| 배너 높이 | 245px(4:3, max 260) | 280px | 340px |
| 배너 정렬 | 전부 flex-start | 홀수 start / 짝수 end | 홀수 start / 짝수 end |
| 배너 설명 클램프 | 1줄 | 2줄 | 2줄 |
| 헤더 높이 / body padding-top | 56px / 56px | 56px / 56px | 56px / 56px |
| `html` 루트 폰트 | **16px**(17px 오버라이드 제거 확인) | 16px | 16px |
| 헤더 nav / 햄버거 | nav `display:none`, 햄버거 `flex` | nav 노출 | nav 노출 |

### 1-3. 컬러 토큰 교체 (§3-3)

- 라이트: `body` 배경 `rgb(255,255,255)` / 글자 `rgb(23,23,23)`
- 다크: `body` 배경 `rgb(10,10,10)` / 글자 `rgb(212,212,212)`
- 액센트(Q2 파랑): 스크롤 인디케이터 바 `rgb(20,71,230)` (라이트) 실측 확인
- 다크 플로팅 칩 예외(§3-3): 테마 레일/Top 버튼 `rgb(42,42,42)`(jq-700) — 배경 #0a0a0a 위에서 떠 보임 확인
- 테마 버튼 선택 상태(§6 보강 3): 다크에서 선택된 버튼 배경 `rgb(10,10,10)`(jq-bg) — 레일과 대비되어 즉시 읽힘

### 1-4. 타이포그래피 (§5, 포스트 페이지 실측)

| 대상 | 실측값 | 스펙 |
|---|---|---|
| `body` | 14px / 21px(1.5) / 400 / -0.112px(-0.008em) | ✅ |
| `.title-h1` (@768+) | 36px / 45px(1.25) / 700 / -0.72px(-0.02em) | ✅ |
| 본문 `h2[data-ke-size]` | 30px / 39px(1.3) / 600 / -0.54px(-0.018em) | ✅ |
| 본문 `h3` | 24px / 32.4px(1.35) / 600 / -0.36px(-0.015em) | ✅ |
| 본문 `h4` | 20px / 28px(1.4) / 600 / -0.24px(-0.012em) | ✅ |
| 본문 `p` | 17px / 29.75px(1.75) / 400 / -0.17px(-0.01em) | ✅ |
| TOC `li a` | 14px / 19.6px(1.4) / 500 / -0.112px | ✅ |
| `.title-mono-sm` | 14px / 21px / 500 / **+1.12px(+0.08em)** | ✅ 의도적 예외(영문 모노 라벨) |
| `body` font-family | `"Pretendard Variable", Pretendard, …` | ✅ `--value(...)` 잔재 없음 |

### 1-5. 기능 동작 (실제 클릭/스크롤)

| 기능 | 확인 내용 |
|---|---|
| **테마 3-상태** | localStorage 삭제 후 로드 → `theme=system` 저장 + system 버튼 `data-selected=true`. dark 버튼 클릭 → `<html class="dark">`, `theme=dark` 저장, 선택 표시 이동. 재로드 시 유지 |
| **FOUC 제거** | `<head>` 인라인 스크립트가 파싱 시점에 `dark`/`js` 클래스를 붙이는 것 확인(`documentElement.className === "dark js"`) |
| **스크롤 인디케이터** | 1600px 스크롤 시 `width: 35.7%`, 트랙 `rgba(229,229,229,.4)`, 바 `rgb(20,71,230)` |
| **Top 버튼 노출 조건** | 스크롤 0 → `is-visible` 없음(비노출). 1600 → `is-visible` 부여(노출) |
| **TOC 자동 생성** | h2/h3/h4 25개 스캔 → `#posts-index-list li` 25개 생성, 들여쓰기(h3 20px / h4 32px) |
| **TOC 19개 기준** | 항목 1개 높이 실측 31.6px → `max-height: min(600px, 100vh-15rem)` = 600px 에 **19개가 정확히 들어감**(19×31.6−4 ≈ 596). 25개일 때 `scrollHeight 790 > clientHeight 600` 으로 내부 스크롤 발생 |
| **TOC 펼침/닫힘** | PC/모바일 모두 버튼 클릭 → 패널 슬라이드 인(스크린샷), 닫기 버튼 존재 |
| **코드 하이라이팅** | `window.hljs` 로드 확인, `code.className = "language-javascript hljs"` + 하위 `<span>` 29개/21개 생성. 라이트/다크 각각 스크린샷으로 색 분리 확인 |
| **코드 복사 버튼** | `pre` 우상단 아이콘 렌더 확인(하이라이팅이 먼저 실행되도록 순서 배치). ※ 실제 클립보드 쓰기까지는 미검증(아래 2절) |
| **이전/다음 글** | `#bottom-anchor` 진입 → `.visible` 부여, opacity 1, 카드 위치 좌 (24,780) / 우 (993,780) = 뷰포트 하단. 카드 배경 jq-700, radius 10px |
| **모바일 사이드바 드로어** | 햄버거 클릭 → 열림, 오버레이/헤더 숨김 정상 |
| **대표이미지 wide 폴백** | `.js` 있을 때 opacity 0(→ JS가 표시), `.js` 없을 때 opacity 1 — JS 실패 시에도 이미지가 보임을 실측 확인 |

### 1-6. 썸네일 모양 3종 × 목록 3종

| 옵션 | 리스트형 | 카드형 | 썸네일형 |
|---|---|---|---|
| `rounded-none` | radius 0 | radius 0 | radius 0 |
| `rounded-lg` | radius 8px(`--radius-md`) | radius 10px(`--radius-lg`) | radius 10px |
| `rounded-full` | radius 9999px, 168×168 | radius 9999px, **243×243(1:1 강제)** | radius 9999px, **248×248(1:1 강제)** |

원형 선택 시 3:2 / 3:4 가 타원이 되던 문제가 실제로 해소됨을 수치로 확인했다.

### 1-7. 가로 오버플로 전수 검사

`_workspace/_preview/_overflow-harness.html` 로 **7개 페이지 × 3개 뷰포트(390 / 820 / 1440) = 21조합**을
iframe 에 로드해 `documentElement.scrollWidth > clientWidth` 를 검사 → **21조합 전부 오버플로 없음**.
(검사 과정에서 실제 버그 3건을 발견해 수정했다 — README 4절 #11/#13/#14)

### 1-8. 파일 무결성

- `style.css`: 브라우저가 마지막 규칙(`footer a:hover`)까지 파싱 — 총 1,106개 규칙, 구문 오류 없음
- `script.js`: `node --check` 통과
- `index.xml`: XML 파서 통과, `<author><name>Jeeqong (based on torytis)</name>` 보존 확인
- 티스토리 치환자/조건 블록: `<s_*>` 태그 열림/닫힘 개수 균형 확인, `[##_..._##]` 는 배너 설명 1개 추가 외 **변경 없음**

---

## 2. ❌ 확인하지 못한 것 (실제 배포 후 재확인 필요)

| 항목 | 사유 |
|---|---|
| **티스토리 서버 렌더링 전반** | 치환자를 서버가 채운 실제 HTML을 볼 수 없다. 더미 치환은 근사일 뿐이다 |
| **메뉴바 주입(`#menubar_wrapper`)** | 티스토리가 런타임에 주입하는 요소라 로컬에 없음 — 콘솔에 `❌ menubar_wrapper 또는 toolbar를 찾을 수 없음` 경고가 계속 떴다(정상, 원본 스킨 동작 그대로) |
| **구독 버튼 실동작** | `data-blog-id` 자동 주입만 확인, 실제 구독 팝업은 티스토리 스크립트 소관 |
| **댓글 영역(`[##_comment_group_##]`) 스타일** | 티스토리가 통째로 주입하는 마크업 — `style.css` 의 `.tt-*` 규칙은 토큰 교체만 되었고 실물 확인 불가 |
| **광고 영역(`[##_revenue_list_*_##]`, `<s_ad_div>`)** | 서버 주입. 목업에서는 제외했다 |
| **보호글 / 공지 / 검색결과 없음 분기** | `<s_article_protected>` / `<s_notice_rep>` / `<s_list_empty>` 는 목업에서 제외 — 색 토큰만 바뀌었고 구조는 원본 그대로라 회귀 위험은 낮지만 눈으로 보지는 못했다 |
| **코드 복사 버튼의 실제 클립보드 쓰기** | `document.execCommand('copy')` 기반이라 헤드리스/파일 컨텍스트에서 신뢰할 수 있게 검증하기 어려움. 버튼 렌더·hover 히트영역·하이라이팅 이후 `textContent` 보존까지만 확인 |
| **실제 Pretendard 웹폰트 다운로드** | `font-family` 가 유효하게 적용되는 것과 CDN 링크 존재는 확인했으나, 네트워크 차단 환경에서의 폴백 모양은 확인하지 않았다 |
| **Safari / Firefox** | Chromium(Playwright)에서만 검증. `:has()`, `-webkit-line-clamp`, `backdrop-filter` 는 현행 Safari/Firefox 모두 지원하지만 실기기 확인은 못 했다 |
| **iOS 사파리 실기기** | 100vh 계열(TOC `calc(100vh - 15rem)`)이 iOS 주소창 동작에 따라 달라질 수 있다 |
| **1280px 정확히 경계** | 1360(4열) / 1200(3열)로 양쪽만 확인. 1280 정확값은 미확인 |

---

## 3. 스펙 대비 의도적 편차 (2건)

| # | 스펙 | 실제 구현 | 사유 |
|---|---|---|---|
| 1 | §7-8: highlight.js **테마 CSS 2개**를 CDN에서 받아 `.dark` 스코프로 분기 | **테마 CSS는 받지 않고** `style.css` 안에서 hljs 토큰 색을 직접 정의(라이트/다크 각각) | 외부 테마 CSS는 `:root` / `.hljs` 스코프로 작성돼 있어 `.dark` 로 감쌀 방법이 없다. 파일을 받아 수동으로 감싸면 원작 CSS를 복제·수정하는 셈이라, 스킨 토큰 체계로 직접 정의하는 쪽을 택했다. **결과(라이트/다크 분리 강조)는 스펙 의도와 동일**하고 요청 수도 1개 줄었다 |
| 2 | §7-9: `.fade-target` 진입 시 `translateY(10px) → 0` | 트랜스폼을 **`.post-nav`(카드)** 에 적용 | `.fade-target` 은 `position:fixed` 인 `#post-prev`/`#post-next` 의 조상이다. 조상에 transform 을 걸면 그것이 fixed 자손의 컨테이닝 블록이 되어 카드가 화면 하단이 아니라 엉뚱한 위치로 튄다(실제로 재현됨). 모션 결과는 동일 |

---

## 4. 확정 사항 반영 결과 (§8)

| # | 확정 내용 | 반영 |
|---|---|---|
| Q1 | 지그재그 + 그라디언트 강조 + 모바일 끔 + 좌측 시작 | ✅ 태블릿/PC 홀수=좌측·짝수=우측, 방향성 그라디언트, 모바일 전부 좌측 — 스크린샷/실측 확인 |
| Q2 | 액센트 파랑 (라이트 #1447e6 / 다크 #8ec5ff) | ✅ 토큰 교체, 스크롤바/TOC 활성 인디케이터/인라인 코드/링크 밑줄에 적용 |
| Q3 | 태블릿 768~1023px | ✅ 전 규칙 `md:`(768) / `lg:`(1024) 기준으로 통일, 배너의 640px(`sm:`) 잔재 제거 |
| Q4 | 1280px 미만 3열 / 1280px↑ 4열 (썸네일형) | ✅ 1200→3열, 1360→4열 실측 |
| Q5 | highlight.js 11 CDN 도입 | ✅ `initialCodeBlock()` 앞에 `initialHighlight()` 삽입. 테마 CSS만 자체 정의(위 3절 #1) |
| Q6 | 폰트 현행 유지 | ✅ `skin.html` 의 orioncactus CDN `<link>` 손대지 않음 |
| Q7 | 대표이미지 전역 설정 유지 | ✅ 글별 전환 설계 없음. 대신 default(16:9) / wide(21:9) 로 **비율은 실제로 분리** |

---

## 5. 손대지 않은 것 (명시)

티스토리 치환자(`[##_..._##]`), `<s_*>` 조건/반복 블록 구조, `index.xml` 의 `<author>` / `<license>`,
커버 아이템 4종 구성, `list-type` / `featured-img-type` 옵션 체계, 사이드바 오프캔버스 로직,
테마 3-상태 로직, TOC 생성 알고리즘, 이전/다음 글 IntersectionObserver, 코드 복사 로직,
푸터의 `Designed by Jeeqong` 표기.

**예외적으로 추가한 치환자는 1개뿐이다** — 배너 커버 아이템의 `[##_cover_item_summary_##]`
(요구사항 “제목 + **설명** 포함” 충족용, 같은 파일의 다른 커버 3종이 이미 쓰던 검증된 태그).
