# `tistory-overrides.css` — 설계 주석

소스: `dashboard-skin/components/tistory-overrides.css`

티스토리가 페이지에 직접 주입하는 마크업(`.menu_toolbar`/`.tt_box_namecard`/
`.fileblock` 등, 우리가 만든 게 아니라 어느 컴포넌트도 소유하지 않는 범용
마크업)의 다크모드 대응 규칙만 모아두는 파일이다. 원래 `style.css.md`에
있던 "2026-09-06 갱신" 항목이 이 파일로 옮겨왔다 — 자세한 배경(같은 선택자로
다른 값이 두 곳에 있어 상쇄되던 충돌, 각 규칙의 이유)은 그 히스토리를 그대로
참고.

`bun run skin:build:style`(`tools/build-style.mjs`)가 이 파일을 다른
컴포넌트 CSS들 뒤, 항상 맨 마지막에 이어붙여 루트 `style.css`를 만든다 —
그래서 이 파일의 규칙이 항상 최종 오버라이드로 적용된다.
