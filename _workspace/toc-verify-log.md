# [TOC SPEC §6] 검증 원본 로그 (자동 생성)

총 assert 52건 · 실패 0건

## 실패 목록

없음


## 항목별 요약

| # | light | dark | assert |
|---|---|---|---|
| 1 | PASS | PASS | 10 |
| 2 | PASS | PASS | 4 |
| 3 | PASS | PASS | 12 |
| 4 | PASS | PASS | 6 |
| 5 | PASS | PASS | 8 |
| 6 | PASS | — | 9 |
| 7 | PASS | — | 2 |
| 9 | PASS | — | 1 |

## 전체 assert

PASS #1 [light] page-nav 존재 — actual=true expected=true
PASS #1 [light] 항목 있으면 hidden 제거 — actual=false expected=false
PASS #1 [light] display flex — actual="flex" expected="flex"
PASS #1 [light] 링크 수 = h2–h4 수 — actual=7 expected=7
PASS #1 [light] h2–h4 1개 이상 — count=7
PASS #2 [light] 각 href에 heading id 대응 — actual=true expected=true
PASS #2 [light] h5는 목차에 없음 — actual=false expected=false
PASS #3 [light] nav 폭 192px — actual=192 expected≈192 (±1)
PASS #3 [light] position sticky — actual="sticky" expected="sticky"
PASS #3 [light] 라벨 On This Page — actual="On This Page" expected="On This Page"
PASS #3 [light] 라벨 uppercase — actual="uppercase" expected="uppercase"
PASS #3 [light] layout flex — actual="flex" expected="flex"
PASS #3 [light] depth 3 padding-left 28px — actual="28px" expected="28px"
PASS #4 [light] 클릭 후 content-inner 스크롤 — before=0 after=800
PASS #4 [light] 클릭한 항목 data-active — actual="#h3-하위-절-제목" expected="#h3-하위-절-제목"
PASS #4 [light] sticky: 스크롤 중에도 nav가 inner 상단에 붙음 — navTopInInner=24
PASS #5 [light] 위젯 폭 320px — actual=320 expected≈320 (±1)
PASS #5 [light] 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #5 [light] 본문이 inner보다 길어 스크롤 가능 — scrollH=5684 clientH=844
PASS #5 [light] 콘솔 에러 0 — none
PASS #1 [dark] page-nav 존재 — actual=true expected=true
PASS #1 [dark] 항목 있으면 hidden 제거 — actual=false expected=false
PASS #1 [dark] display flex — actual="flex" expected="flex"
PASS #1 [dark] 링크 수 = h2–h4 수 — actual=7 expected=7
PASS #1 [dark] h2–h4 1개 이상 — count=7
PASS #2 [dark] 각 href에 heading id 대응 — actual=true expected=true
PASS #2 [dark] h5는 목차에 없음 — actual=false expected=false
PASS #3 [dark] nav 폭 192px — actual=192 expected≈192 (±1)
PASS #3 [dark] position sticky — actual="sticky" expected="sticky"
PASS #3 [dark] 라벨 On This Page — actual="On This Page" expected="On This Page"
PASS #3 [dark] 라벨 uppercase — actual="uppercase" expected="uppercase"
PASS #3 [dark] layout flex — actual="flex" expected="flex"
PASS #3 [dark] depth 3 padding-left 28px — actual="28px" expected="28px"
PASS #4 [dark] 클릭 후 content-inner 스크롤 — before=0 after=799
PASS #4 [dark] 클릭한 항목 data-active — actual="#h3-하위-절-제목" expected="#h3-하위-절-제목"
PASS #4 [dark] sticky: 스크롤 중에도 nav가 inner 상단에 붙음 — navTopInInner=24
PASS #5 [dark] 위젯 폭 320px — actual=320 expected≈320 (±1)
PASS #5 [dark] 문서 가로 오버플로 0 — actual=1440 expected=1440
PASS #5 [dark] 본문이 inner보다 길어 스크롤 가능 — scrollH=5684 clientH=844
PASS #5 [dark] 콘솔 에러 0 — none
PASS #6 [light] nojs: content.js 미로드 — actual=false expected=false
PASS #6 [light] nojs: nav 존재 — actual=true expected=true
PASS #6 [light] nojs: hidden 유지 — actual=true expected=true
PASS #6 [light] nojs: display none — actual="none" expected="none"
PASS #6 [light] nojs: 링크 0 — actual=0 expected=0
PASS #6 [light] nojs: layout 비flex(기사 중앙 유지) — actual="block" expected="block"
PASS #6 [light] nojs: 기사 폭 > 0 — w=806
PASS #6 [light] nojs: 가로 오버플로 0 — actual=1440 expected=1440
PASS #6 [light] nojs: 콘솔 에러 0 — none
PASS #7 [light] 목록 목업에 page-nav 없음 — actual=false expected=false
PASS #7 [light] 목록 목업에 post-single 없음 — actual=false expected=false
PASS #9 [light] 새로 추가한 CSS/JS/HTML에 주석 0개 — none