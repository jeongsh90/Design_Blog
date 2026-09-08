# `content.js` — 설계 주석

소스: `dashboard-skin/components/content.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [SPEC 2026-09-05] Dropdown Menu 동작 — Design-system js/components.js의

[SPEC 2026-09-05] Dropdown Menu 동작 — Design-system js/components.js의
     initDropdownMenus/closeAllDropdownMenus를 이식(다른 메뉴 타입(select/popover 등)은
     이 스킨에 아직 없어 그 부분은 생략). post-actions의 "더보기(⋯)" 메뉴 하나에 쓰인다.

---

## 2026-09-06 제거 — `initViewToggle`(목록형/썸네일형 전환)

글 목록을 항상 썸네일형(그리드)으로 고정하기로 하면서(폰트 아카이브 시리즈처럼
썸네일 이미지가 핵심인 콘텐츠에는 목록형이 어울리지 않는다는 사용자 판단) 토글
버튼(`skin.html`의 `[data-slot="content-view-toggle"]`)과 이 함수를 통째로
제거했다. `[data-slot="content-inner"]`의 `data-view`는 이제 항상 `"thumb"`로
하드코딩(`skin.html`), `content.css`의 `[data-view="thumb"]` 스코프 규칙은 그대로
살아있어(더 이상 조건부가 아니라 항상 적용되는 상태) 계속 유효하다.

## 3. .test(text)) {

.test(text)) {

---

## 2026-09-08 수정 — `initPaginationActiveState` 첫 진입 시 활성표시 누락 버그

카테고리 목록 페이지에 처음 진입(쿼리스트링 없는 `/category/Design/Font`)했을 때 페이지네이션의 "1"/"2" 버튼 어느 쪽도 활성(outline) 표시가 되지 않던 버그. 실제 라이브 사이트에서 `[##_paging_rep_link_##]`가 렌더링한 1페이지 링크의 href는 `?page=1`을 항상 포함하는데(`/category/Design/Font?page=1`), 첫 진입 시 브라우저 주소창의 `window.location.search`는 비어 있다(`""`, `?page=` 없음) — 기존 코드는 `link.pathname + link.search === here`로 문자열을 통째로 비교했기 때문에 `.../Font?page=1` !== `.../Font`가 되어 페이지 1조차 자기 자신과 매치되지 못했다.

수정: 경로(pathname)와 `page` 쿼리 파라미터를 따로 뽑아 비교하고, `page` 파라미터가 아예 없으면 `"1"`로 간주(`URLSearchParams(...).get("page") || "1"`)하도록 변경 — 이제 쿼리스트링 유무와 무관하게 "현재 몇 페이지인지"를 항상 정확히 판정한다.
