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

