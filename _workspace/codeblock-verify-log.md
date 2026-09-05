# [CODEBLOCK SPEC §9] 검증 원본 로그 (자동 생성)

총 assert 183건 · 실패 0건

## 실패 목록

없음


## 항목별 요약

| # | light | dark | assert |
|---|---|---|---|
| 1 | PASS | PASS | 16 |
| 2 | PASS | PASS | 24 |
| 3 | PASS | PASS | 24 |
| 5 | PASS | PASS | 8 |
| 6 | PASS | PASS | 4 |
| 7 | PASS | PASS | 18 |
| 8 | PASS | PASS | 10 |
| 9 | PASS | PASS | 14 |
| B | PASS | PASS | 8 |
| 4 | PASS | PASS | 18 |
| 13 | PASS | — | 2 |
| 30 | PASS | PASS | 2 |
| 11 | PASS | — | 5 |
| 12 | PASS | — | 9 |
| 10 | PASS | PASS | 20 |
| 14 | PASS | — | 1 |

## 전체 assert

PASS #1 [light] [data-line]::before width 64px — actual="64px" expected="64px"
PASS #1 [light] [data-line]::before padding-right 24px — actual="24px" expected="24px"
PASS #1 [light] 거터 색 === --color-code-number — actual="rgb(115, 115, 115)" expected="rgb(115, 115, 115)"
PASS #1 [light] 거터 배경 === --color-code — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #1 [light] 거터 position sticky — actual="sticky" expected="sticky"
PASS #1 [light] pre padding-inline 0 (줄번호 있음) — actual="0px/0px" expected="0px/0px"
PASS #1 [light] pre padding-block 14px — actual="14px/14px" expected="14px/14px"
PASS #1 [light] 코드 첫 글자 x === pre.left + 64 — actual=64 expected≈64 (±0.6)
PASS #2 [light] figcaption 박스 높이 42~43px — h=43
PASS #2 [light] 헤더 하단 보더 1px solid — actual="1px/solid" expected="1px/solid"
PASS #2 [light] 파일명 mono 폰트 — ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
PASS #2 [light] 헤더 좌우 패딩 16px — actual="16px/16px" expected="16px/16px"
PASS #2 [light] 아이콘 배지 16×16 — actual="16x16" expected="16x16"
PASS #2 [light] 아이콘 배지 원형 — actual="3996px" expected="3996px"
PASS #2 [light] 아이콘 글리프 10×10 — actual="10x10" expected="10x10"
PASS #2 [light] 복사 버튼 32×32 — actual="32x32" expected="32x32"
PASS #2 [light] 복사 아이콘 16×16 — actual="16x16" expected="16x16"
PASS #2 [light] 복사 버튼이 헤더 오른쪽 끝(패딩 16px 안쪽) — gap=16
PASS #2 [light] 헤더 배경(--code-header)이 figure 배경과 다름(Q2=b) — cap=oklab(0.945694 0.0000429726 0.00001894) fig=rgb(250, 250, 250)
PASS #2 [light] 파일명 렌더 = components.json — actual=true expected=true
PASS #3 [light] figure border-radius 16px — actual="16px" expected="16px"
PASS #3 [light] figure overflow hidden — actual="hidden" expected="hidden"
PASS #3 [light] figure 보더 1px (Q3=b) — actual="1px" expected="1px"
PASS #3 [light] figure margin-top 24px — actual="24px" expected="24px"
PASS #3 [light] figure font-size 14px — actual="14px" expected="14px"
PASS #3 [light] figure 배경 === --color-code — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #3 [light] figure 안 pre margin-top 0 — actual="0px" expected="0px"
PASS #3 [light] figure 안 pre 보더 0 — actual="0px" expected="0px"
PASS #3 [light] figure 안 pre 배경 투명 — actual="rgba(0, 0, 0, 0)" expected="rgba(0, 0, 0, 0)"
PASS #3 [light] figure data-slot=code-block — actual=true expected=true
PASS #3 [light] figure 3개(plain/json/js) — actual=3 expected=3
PASS #3 [light] data-code-pending 잔여 0 — actual=0 expected=0
PASS #5 [light] --color-code — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #5 [light] --color-code-highlight — actual="rgb(245, 245, 245)" expected="rgb(245, 245, 245)"
PASS #5 [light] --color-code-number — actual="rgb(115, 115, 115)" expected="rgb(115, 115, 115)"
PASS #5 [light] --color-code-foreground — actual="rgb(0, 0, 0)" expected="rgb(0, 0, 0)"
PASS #6 [light] 사전강조 .hljs-attr 색 === §8-1 — actual="rgb(5, 80, 174)" expected="rgb(5, 80, 174)"
PASS #6 [light] .hljs-attr 토큰이 존재 — rgb(5, 80, 174)
PASS #7 [light] JSON 샘플 10줄 — actual=10 expected=10
PASS #7 [light] 하이라이트 행 = 7번째 — actual=7 expected=7
PASS #7 [light] 하이라이트 행 배경 === --color-code-highlight — actual="rgb(245, 245, 245)" expected="rgb(245, 245, 245)"
PASS #7 [light] 다른 행 배경 투명 — actual="rgba(0, 0, 0, 0)" expected="rgba(0, 0, 0, 0)"
PASS #7 [light] 하이라이트 행 position relative(§1-5 보강) — actual="relative" expected="relative"
PASS #7 [light] :after 폭 2px — actual="2px" expected="2px"
PASS #7 [light] :after 높이 === 그 행 높이(figure 전체 아님) — actual=24.75 expected≈24.75 (±0.6)
PASS #7 [light] :after 색 === --code-bar — actual="oklab(0.555523 0.0000253916 0.0000110865 / 0.5)" expected="oklab(0.555523 0.0000253916 0.0000110865 / 0.5)"
PASS #7 [light] 빈 줄 대비 min-height 보강(§1-5) — 22.75px
PASS #8 [light] 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #8 [light] 긴 줄은 pre 안에서만 스크롤 — scrollW=1654 clientW=804
PASS #8 [light] pre tabindex=0(키보드 스크롤) — actual="0" expected="0"
PASS #8 [light] pre data-custom-scrollbar — actual=true expected=true
PASS #8 [light] 가로 스크롤 후 줄번호 sticky 고정(코드만 밀림) — {"scrollLeft":0,"preLeft":281,"lineLeft":281,"textLeftAfter":345}
PASS #9 [light] 인라인 code display inline — actual="inline" expected="inline"
PASS #9 [light] 인라인 code padding 0.8/1.2 spacing — actual="3.2px 4.8px" expected="3.2px 4.8px"
PASS #9 [light] 인라인 code radius --radius-md(8px) — actual="8px" expected="8px"
PASS #9 [light] 인라인 code 배경 === --color-muted — actual="rgb(245, 245, 245)" expected="rgb(245, 245, 245)"
PASS #9 [light] 인라인 code weight 600 — actual="600" expected="600"
PASS #9 [light] 인라인 code size 14px — actual="14px" expected="14px"
PASS #9 [light] 본문 p 16px / 26px(변화 없음) — actual="16px/26px" expected="16px/26px"
PASS #B [light] language-js 블록 6줄 — actual=6 expected=6
PASS #B [light] highlight.js가 .hljs-* 클래스를 실제로 심음 — colored spans=16
PASS #B [light] 재강조 후에도 하이라이트 행 유지(3번째) — actual="1/3" expected="1/3"
PASS #B [light] 첫 줄 filename 지시자는 코드에서 제거됨 — "function initCodeBlocks() {"
PASS #4 [light] 클릭 후 data-copied — actual="true" expected="true"
PASS #4 [light] idle 아이콘 숨김 — actual="none" expected="none"
PASS #4 [light] done(체크) 아이콘 표시(inline-flex → 블록화된 flex) — display=flex
PASS #4 [light] sr-only 상태 문구 — actual="코드를 복사했습니다" expected="코드를 복사했습니다"
PASS #4 [light] 클립보드 텍스트 === 원문(줄번호 미포함·개행 보존) — actual="{\n  \"$schema\": \"https://ui.shadcn.com/schema.json\",\n  \"style\": \"new-york\",\n  \"tailwind\": {\n    \"css\": \"src/app/globals.css\",\n    \"baseColor\": \"neutral\",\n    \"cssVariables\": true\n  },\n  \"aliases\": { \"components\": \"@/components\", \"utils\": \"@/lib/utils\" }\n}" expected="{\n  \"$schema\": \"https://ui.shadcn.com/schema.json\",\n  \"style\": \"new-york\",\n  \"tailwind\": {\n    \"css\": \"src/app/globals.css\",\n    \"baseColor\": \"neutral\",\n    \"cssVariables\": true\n  },\n  \"aliases\": { \"components\": \"@/components\", \"utils\": \"@/lib/utils\" }\n}"
PASS #4 [light] 클립보드에 줄번호 없음 — {
  "$schema": "https:/
PASS #4 [light] 1.55초 시점에는 아직 유지(1600ms 아님) — actual="true" expected="true"
PASS #4 [light] 2000ms 후 원복 — copied=null done=none
PASS #4 [light] 언어 없는 블록도 원문 그대로 복사 — actual="/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */\nconst spec = { area: \"post-single-body\", tokens: [\"--text-base\", \"--leading-relaxed\", \"--tracking-base\"] };\ndocument.querySelector('[data-slot=\"post-single-body\"]').querySelectorAll(\"table\").forEach((table) => wrapWith(table, \"prose-table-wrap\")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다" expected="/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */\nconst spec = { area: \"post-single-body\", tokens: [\"--text-base\", \"--leading-relaxed\", \"--tracking-base\"] };\ndocument.querySelector('[data-slot=\"post-single-body\"]').querySelectorAll(\"table\").forEach((table) => wrapWith(table, \"prose-table-wrap\")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다"
PASS #13 [light] 다크 토글 후 추가 네트워크 요청 0 — actual=0 expected=0
PASS #13 [light] 색만 바뀜(다크 값 적용) — {"color":"rgb(121, 192, 255)"}
PASS #30 [light] 콘솔/네트워크 에러 0 — none
PASS #1 [dark] [data-line]::before width 64px — actual="64px" expected="64px"
PASS #1 [dark] [data-line]::before padding-right 24px — actual="24px" expected="24px"
PASS #1 [dark] 거터 색 === --color-code-number — actual="rgb(161, 161, 161)" expected="rgb(161, 161, 161)"
PASS #1 [dark] 거터 배경 === --color-code — actual="rgb(23, 23, 23)" expected="rgb(23, 23, 23)"
PASS #1 [dark] 거터 position sticky — actual="sticky" expected="sticky"
PASS #1 [dark] pre padding-inline 0 (줄번호 있음) — actual="0px/0px" expected="0px/0px"
PASS #1 [dark] pre padding-block 14px — actual="14px/14px" expected="14px/14px"
PASS #1 [dark] 코드 첫 글자 x === pre.left + 64 — actual=64 expected≈64 (±0.6)
PASS #2 [dark] figcaption 박스 높이 42~43px — h=43
PASS #2 [dark] 헤더 하단 보더 1px solid — actual="1px/solid" expected="1px/solid"
PASS #2 [dark] 파일명 mono 폰트 — ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace
PASS #2 [dark] 헤더 좌우 패딩 16px — actual="16px/16px" expected="16px/16px"
PASS #2 [dark] 아이콘 배지 16×16 — actual="16x16" expected="16x16"
PASS #2 [dark] 아이콘 배지 원형 — actual="3996px" expected="3996px"
PASS #2 [dark] 아이콘 글리프 10×10 — actual="10x10" expected="10x10"
PASS #2 [dark] 복사 버튼 32×32 — actual="32x32" expected="32x32"
PASS #2 [dark] 복사 아이콘 16×16 — actual="16x16" expected="16x16"
PASS #2 [dark] 복사 버튼이 헤더 오른쪽 끝(패딩 16px 안쪽) — gap=16
PASS #2 [dark] 헤더 배경(--code-header)이 figure 배경과 다름(Q2=b) — cap=oklab(0.235844 0.0000107312 0.00000472307) fig=rgb(23, 23, 23)
PASS #2 [dark] 파일명 렌더 = components.json — actual=true expected=true
PASS #3 [dark] figure border-radius 16px — actual="16px" expected="16px"
PASS #3 [dark] figure overflow hidden — actual="hidden" expected="hidden"
PASS #3 [dark] figure 보더 1px (Q3=b) — actual="1px" expected="1px"
PASS #3 [dark] figure margin-top 24px — actual="24px" expected="24px"
PASS #3 [dark] figure font-size 14px — actual="14px" expected="14px"
PASS #3 [dark] figure 배경 === --color-code — actual="rgb(23, 23, 23)" expected="rgb(23, 23, 23)"
PASS #3 [dark] figure 안 pre margin-top 0 — actual="0px" expected="0px"
PASS #3 [dark] figure 안 pre 보더 0 — actual="0px" expected="0px"
PASS #3 [dark] figure 안 pre 배경 투명 — actual="rgba(0, 0, 0, 0)" expected="rgba(0, 0, 0, 0)"
PASS #3 [dark] figure data-slot=code-block — actual=true expected=true
PASS #3 [dark] figure 3개(plain/json/js) — actual=3 expected=3
PASS #3 [dark] data-code-pending 잔여 0 — actual=0 expected=0
PASS #5 [dark] --color-code — actual="rgb(23, 23, 23)" expected="rgb(23, 23, 23)"
PASS #5 [dark] --color-code-highlight — actual="rgb(38, 38, 38)" expected="rgb(38, 38, 38)"
PASS #5 [dark] --color-code-number — actual="rgb(161, 161, 161)" expected="rgb(161, 161, 161)"
PASS #5 [dark] --color-code-foreground — actual="rgb(161, 161, 161)" expected="rgb(161, 161, 161)"
PASS #6 [dark] 사전강조 .hljs-attr 색 === §8-1 — actual="rgb(121, 192, 255)" expected="rgb(121, 192, 255)"
PASS #6 [dark] .hljs-attr 토큰이 존재 — rgb(121, 192, 255)
PASS #7 [dark] JSON 샘플 10줄 — actual=10 expected=10
PASS #7 [dark] 하이라이트 행 = 7번째 — actual=7 expected=7
PASS #7 [dark] 하이라이트 행 배경 === --color-code-highlight — actual="rgb(38, 38, 38)" expected="rgb(38, 38, 38)"
PASS #7 [dark] 다른 행 배경 투명 — actual="rgba(0, 0, 0, 0)" expected="rgba(0, 0, 0, 0)"
PASS #7 [dark] 하이라이트 행 position relative(§1-5 보강) — actual="relative" expected="relative"
PASS #7 [dark] :after 폭 2px — actual="2px" expected="2px"
PASS #7 [dark] :after 높이 === 그 행 높이(figure 전체 아님) — actual=24.75 expected≈24.75 (±0.6)
PASS #7 [dark] :after 색 === --code-bar — actual="oklab(0.708995 0.0000324249 0.0000141263 / 0.5)" expected="oklab(0.708995 0.0000324249 0.0000141263 / 0.5)"
PASS #7 [dark] 빈 줄 대비 min-height 보강(§1-5) — 22.75px
PASS #8 [dark] 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #8 [dark] 긴 줄은 pre 안에서만 스크롤 — scrollW=1654 clientW=804
PASS #8 [dark] pre tabindex=0(키보드 스크롤) — actual="0" expected="0"
PASS #8 [dark] pre data-custom-scrollbar — actual=true expected=true
PASS #8 [dark] 가로 스크롤 후 줄번호 sticky 고정(코드만 밀림) — {"scrollLeft":0,"preLeft":281,"lineLeft":281,"textLeftAfter":345}
PASS #9 [dark] 인라인 code display inline — actual="inline" expected="inline"
PASS #9 [dark] 인라인 code padding 0.8/1.2 spacing — actual="3.2px 4.8px" expected="3.2px 4.8px"
PASS #9 [dark] 인라인 code radius --radius-md(8px) — actual="8px" expected="8px"
PASS #9 [dark] 인라인 code 배경 === --color-muted — actual="rgb(38, 38, 38)" expected="rgb(38, 38, 38)"
PASS #9 [dark] 인라인 code weight 600 — actual="600" expected="600"
PASS #9 [dark] 인라인 code size 14px — actual="14px" expected="14px"
PASS #9 [dark] 본문 p 16px / 26px(변화 없음) — actual="16px/26px" expected="16px/26px"
PASS #B [dark] language-js 블록 6줄 — actual=6 expected=6
PASS #B [dark] highlight.js가 .hljs-* 클래스를 실제로 심음 — colored spans=16
PASS #B [dark] 재강조 후에도 하이라이트 행 유지(3번째) — actual="1/3" expected="1/3"
PASS #B [dark] 첫 줄 filename 지시자는 코드에서 제거됨 — "function initCodeBlocks() {"
PASS #4 [dark] 클릭 후 data-copied — actual="true" expected="true"
PASS #4 [dark] idle 아이콘 숨김 — actual="none" expected="none"
PASS #4 [dark] done(체크) 아이콘 표시(inline-flex → 블록화된 flex) — display=flex
PASS #4 [dark] sr-only 상태 문구 — actual="코드를 복사했습니다" expected="코드를 복사했습니다"
PASS #4 [dark] 클립보드 텍스트 === 원문(줄번호 미포함·개행 보존) — actual="{\n  \"$schema\": \"https://ui.shadcn.com/schema.json\",\n  \"style\": \"new-york\",\n  \"tailwind\": {\n    \"css\": \"src/app/globals.css\",\n    \"baseColor\": \"neutral\",\n    \"cssVariables\": true\n  },\n  \"aliases\": { \"components\": \"@/components\", \"utils\": \"@/lib/utils\" }\n}" expected="{\n  \"$schema\": \"https://ui.shadcn.com/schema.json\",\n  \"style\": \"new-york\",\n  \"tailwind\": {\n    \"css\": \"src/app/globals.css\",\n    \"baseColor\": \"neutral\",\n    \"cssVariables\": true\n  },\n  \"aliases\": { \"components\": \"@/components\", \"utils\": \"@/lib/utils\" }\n}"
PASS #4 [dark] 클립보드에 줄번호 없음 — {
  "$schema": "https:/
PASS #4 [dark] 1.55초 시점에는 아직 유지(1600ms 아님) — actual="true" expected="true"
PASS #4 [dark] 2000ms 후 원복 — copied=null done=none
PASS #4 [dark] 언어 없는 블록도 원문 그대로 복사 — actual="/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */\nconst spec = { area: \"post-single-body\", tokens: [\"--text-base\", \"--leading-relaxed\", \"--tracking-base\"] };\ndocument.querySelector('[data-slot=\"post-single-body\"]').querySelectorAll(\"table\").forEach((table) => wrapWith(table, \"prose-table-wrap\")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다" expected="/* 코드에는 한글 줄바꿈 규칙(keep-all)과 한글 자간(-0.01em)을 적용하지 않는다 */\nconst spec = { area: \"post-single-body\", tokens: [\"--text-base\", \"--leading-relaxed\", \"--tracking-base\"] };\ndocument.querySelector('[data-slot=\"post-single-body\"]').querySelectorAll(\"table\").forEach((table) => wrapWith(table, \"prose-table-wrap\")); // 이 줄은 가로 스크롤을 발생시키려고 의도적으로 아주 길게 작성한 것이다"
PASS #30 [dark] 콘솔/네트워크 에러 0 — none
PASS #11 [light] 재실행 후 figure 개수 불변 — actual="3" expected="3"
PASS #11 [light] 재실행 후 줄 개수 불변 — actual="19" expected="19"
PASS #11 [light] 재실행 후 복사 버튼 개수 불변 — actual="3" expected="3"
PASS #11 [light] figure 중첩 0 — actual=0 expected=0
PASS #11 [light] 재실행 중 예외 0 — none
PASS #12 [light] CDN 차단: figure 3개 그대로 — actual=3 expected=3
PASS #12 [light] CDN 차단: 줄 6개 폴백 유지 — actual=6 expected=6
PASS #12 [light] CDN 차단: 색만 없음(강조 span 0) — actual=0 expected=0
PASS #12 [light] CDN 차단: 하이라이트 행 유지 — actual=1 expected=1
PASS #12 [light] CDN 차단: 헤더·복사 버튼 유지 — actual="true/true" expected="true/true"
PASS #12 [light] CDN 차단: 줄번호 거터 유지 — actual="64px" expected="64px"
PASS #12 [light] CDN 차단: data-code-pending 정리됨 — actual=0 expected=0
PASS #12 [light] CDN 차단: 미처리 예외(pageerror) 0 — none
PASS #12 [light] [관측] CDN 차단 시 브라우저 네트워크 로그 — Failed to load resource: net::ERR_FAILED ;; Failed to load resource: net::ERR_FAILED ;; Failed to load resource: net::ERR_FAILED
PASS #10 [light] nojs: content.js 미로드 — actual=false expected=false
PASS #10 [light] nojs: figure 0개(폴백 경로) — actual=0 expected=0
PASS #10 [light] nojs: pre 배경 === --color-code — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #10 [light] nojs: pre radius 16px — actual="16px" expected="16px"
PASS #10 [light] nojs: pre 보더 1px — actual="1px" expected="1px"
PASS #10 [light] nojs: pre padding 14px/16px — actual="14px/16px" expected="14px/16px"
PASS #10 [light] nojs: 긴 줄이 pre 안에서만 스크롤 — scrollW=1606 clientW=804
PASS #10 [light] nojs: 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #10 [light] nojs: pre가 본문 폭을 넘지 않음 — pre=1086 body=1086
PASS #10 [light] nojs: 콘솔 에러 0 — none
PASS #10 [dark] nojs: content.js 미로드 — actual=false expected=false
PASS #10 [dark] nojs: figure 0개(폴백 경로) — actual=0 expected=0
PASS #10 [dark] nojs: pre 배경 === --color-code — actual="rgb(23, 23, 23)" expected="rgb(23, 23, 23)"
PASS #10 [dark] nojs: pre radius 16px — actual="16px" expected="16px"
PASS #10 [dark] nojs: pre 보더 1px — actual="1px" expected="1px"
PASS #10 [dark] nojs: pre padding 14px/16px — actual="14px/16px" expected="14px/16px"
PASS #10 [dark] nojs: 긴 줄이 pre 안에서만 스크롤 — scrollW=1606 clientW=804
PASS #10 [dark] nojs: 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #10 [dark] nojs: pre가 본문 폭을 넘지 않음 — pre=1086 body=1086
PASS #10 [dark] nojs: 콘솔 에러 0 — none
PASS #14 [light] 새로 추가한 CSS/JS에 주석 0개 — none