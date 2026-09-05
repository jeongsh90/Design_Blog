# 글 상세 TOC — developer 검증

> **철회 (2026-09-05).** 당시 52/52 PASS였으나 같은 날 스킨에서 TOC를 제거했다. `verify-toc.mjs`도 삭제됨.

- **스펙:** `_workspace/content-permalink-toc_designer-spec.md`
- **날짜:** 2026-09-05
- **러너:** `bun run skin:verify:toc` → 52/52 PASS, 실패 0
- **스크린샷:** `_workspace/toc-shots/` (`toc-light.png` / `toc-dark.png` / `toc-nojs-light.png`)
- **원본 로그:** `_workspace/toc-verify-log.md`

## 1. 산출물

| 파일 | 역할 |
|---|---|
| `dashboard-skin/skin.html` | `post-single-layout` + `page-nav`(hidden) |
| `dashboard-skin/components/content.css` | layout flex + Design-system page-nav |
| `dashboard-skin/components/content.js` | `initPostToc` |
| `dashboard-skin/components/smooth-scroll.js` | `contentInner.__skinLenis` |
| `dashboard-skin/tools/verify-toc.mjs` | 검증(업로드 아님) |

`src/input.css` / `tailwind.css` / `widgets.css` 변경 없음. 새 CSS/JS 파일 0개.

## 2. 스펙 채택

Q1 Design-system 트랙 / Q2 "On This Page" / Q3 h2–h4 / Q4 TOC 12rem / Q5 content-inner sticky.

## 3. 실측과 달랐던 점

Observer 콜백은 **변경된 entry만** 준다. 첫 구현은 그 배치에서 맨 위 노드만 active로 써서, h3 클릭 직후 h4가 교차 목록에만 들어오면 활성이 h4로 넘어갔다. intersecting id를 맵에 유지하고 문서 순서 첫 항목을 쓰도록 고침(검증 4번 라이트/다크 재통과).

no-JS에서 저자 `display:flex`가 `[hidden]`을 이기지 않게 `page-nav { display:none }` / `:not([hidden]) { display:flex }`로 분기. flex 아이템 stretch가 sticky를 죽이므로 layout은 `align-items:flex-start`.

## 4. 체크리스트

| # | 결과 |
|---|---|
| 1 슬롯·링크 7= h2–h4 7 | PASS |
| 2 href↔id, h5 제외 | PASS |
| 3 192px sticky, 라벨 uppercase | PASS |
| 4 클릭 스크롤 + active + sticky 유지 | PASS |
| 5 가로 오버플로 0, 위젯 320 | PASS |
| 6 no-JS hidden / 기사 중앙 | PASS |
| 7 목록 목업에 nav 없음 | PASS |
| 8 라이트/다크 샷 | PASS |
| 9 신규 슬라이스 주석 0 | PASS |

## 5. 업로드

`content.css` · `content.js` · `skin.html` · `smooth-scroll.js`

## 6. 미검증

티스토리 실사이트(에디터 제목에 수동 id, CSP). 반응형 dropdown 없음(범위 밖).
