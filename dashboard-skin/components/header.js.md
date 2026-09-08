# `header.js` — 설계 주석

소스: `dashboard-skin/components/header.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 2026-09-08 추가 — `initCategoryBreadcrumb`: 카테고리 페이지 브레드크럼 계층 분해

카테고리 목록 페이지(`/category/{1차}/{2차}`)에서 헤더 브레드크럼이 `[##_page_title_##]`를 그대로 찍었더니 "다잇누 > 'Design/Font' 카테고리의 글 목록"처럼 티스토리가 만든 원문 문자열이 통째로 두 번째 세그먼트에 박혀 나왔다(따옴표·"카테고리의 글 목록" 접미사까지 그대로). `[##_page_title_##]`는 티스토리가 페이지 종류별로 이미 완성된 문자열을 내려주는 불투명한 값이라, 카테고리 경로만 따로 뽑아주는 전용 템플릿 태그가 없다.

대신 URL 자체가 `/category/Design/Font`처럼 계층을 그대로 담고 있다는 점을 이용해, `window.location.pathname`을 `/category/` 뒤로 잘라 `/`로 분리한 뒤 세그먼트마다 브레드크럼 `<li>`를 새로 만들어(마지막 세그먼트만 현재 페이지 `span`, 나머지는 그 depth까지의 `/category/...` 링크) 기존 `[data-slot="breadcrumb-page"]` 하나짜리 `<li>`를 통째로 교체한다. 기존 정적 구분선(`[data-slot="breadcrumb-separator"]`)을 세그먼트 사이마다 `cloneNode`해 재사용해 CSS는 그대로 적용된다. 카테고리 페이지가 아니면(post/tag/search 등) `initCategoryBreadcrumb()`가 `false`를 반환하고, 기존 `initHeaderBreadcrumb()`(동일 값이면 접기)가 그대로 동작한다 — 두 함수는 배타적으로만 실행된다.
