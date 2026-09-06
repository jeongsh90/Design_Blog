# `widgets.css` — 설계 주석

소스: `dashboard-skin/components/widgets.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

_(주석 없음)_

## 2026-09-06 버그 수정 — 파일 끝 `@media` 블록에 닫는 `}` 누락

파일 맨 끝 `@media (max-width: 1279px) { ... }`의 닫는 중괄호가 원래 없었다. 이 파일이
독립된 `<link>`로 로드되던 때는 브라우저가 EOF에서 알아서 복구해 무해했지만(실제로
회귀 없이 동작해 왔음), `style.css` 통합 빌드로 이 파일 뒤에 `content.css`/
`tistory-overrides.css`가 이어붙게 되면서 문제가 됐다 — 하나의 스타일시트 안에서는
그 닫히지 않은 블록이 끝까지 이어져 뒤따라오는 두 파일의 규칙을 전부 삼켜버려(구문상
그 `@media` 블록 안에 들어간 것처럼 처리됨) `.fileblock`/`.tt_box_namecard`/
`.menu_toolbar` 다크모드 오버라이드가 통째로 무효화되는 실제 버그로 나타났다(브라우저
콘솔에 에러가 안 뜨는 종류의 실패라 `document.styleSheets`로도 못 잡고, 전체 파일의
`{`/`}` 개수를 세어보고서야 발견). `}` 하나 추가로 해결.

## 2026-09-06 신규, 2026-09-07 대체 — 위젯 영역 하단 "소개" 메뉴

`skin.html.md` §9 참고. 처음엔(2026-09-06) 기존 위젯 카드(`data-slot="card"`)와
시각적으로 구분되는 가벼운 하단 내비게이션 한 줄로(`[data-slot="widgets-footer"]`,
얇은 구분선(`border-top`)) 만들었으나, 사용자가 "다른 섹션과 마찬가지로 데이터슬롯
카드로 구분"을 요청해 2026-09-07 다른 위젯 5개와 완전히 같은 `data-slot="card"`
구조로 교체 — `[data-slot="widgets-footer"]` 전용 규칙은 삭제(더 이상 참조되는
곳이 없어 죽은 코드), 카드 사이 간격은 `[data-slot="widgets"]`가 이미 자식마다
주는 공통 `gap`으로 자동 해결(별도 `border-top` 불필요). 링크 자체는 전용
클래스를 새로 만들지 않고 `header.css`의 공용 Button 프리미티브
(`[data-slot="button"][data-variant="link"]`)를 계속 재사용 — shadcn 정본의
link variant(밑줄 없는 기본, 호버 시 밑줄, 색은 `--color-primary`) 그대로.
