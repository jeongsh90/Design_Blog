# `style.css` — 설계 주석

소스: `dashboard-skin/style.css`

티스토리 스킨 zip/등록에 필요한 루트 CSS 슬롯이다.

이 스킨 자체의 컴포넌트 스타일(사이드바/헤더/콘텐츠 등)은 계속 HTML 편집 파일
업로드로 `./images/`에 올라가는 `tailwind.css`와 `components/*.css`가 담당한다 —
그쪽에는 규칙을 쌓지 않는다는 원칙은 유지.

## 2026-09-06 갱신 — 티스토리 자체 주입 마크업 다크모드 오버라이드는 여기로 모은다

`.menu_toolbar`(관리메뉴 아이콘)/`.tt_box_namecard`(이름카드 위젯)/`.fileblock`
(첨부파일 카드)처럼 우리가 만든 게 아니라 **티스토리가 페이지에 직접 주입하는
마크업**의 다크모드 대응 규칙은 header.css/content.css 등 컴포넌트 파일에 흩어
두지 않고 이 파일에 모은다 — 어느 컴포넌트가 "소유"한 게 아니라 페이지 어디에나
나타날 수 있는 범용 오버라이드이기 때문. 실제로 header.css와 티스토리 관리자
"스킨 편집 > CSS" 탭(이 파일의 실제 편집 화면)에 같은 선택자로 서로 다른 값
(`filter: invert(1)` vs `filter: inherit`)이 동시에 존재해 서로 상쇄되는 충돌이
있었다 — 한 곳에만 두기로 하면서 해결.

- `.dark [data-slot="header-actions"] .menu_toolbar:not(.toolbar_rb)`:
  래스터 스프라이트 아이콘이라 색 토큰으로 재색칠 불가 → `filter: invert(1)`.
- `.dark .tt_box_namecard`: 배경/이름/설명 텍스트를 각각 `--color-card`/
  `--color-foreground`/`--color-muted-foreground`로 명시 재정의(티스토리 자체
  CSS가 이 값들을 인라인 수준 특이도로 걸어둬 `!important` 필요).
- `.dark .fileblock`: 배경/테두리/파일명/용량 텍스트도 같은 방식으로 토큰
  재정의. 폴더 아이콘·다운로드 화살표만 래스터 그래픽이라 `filter: invert(1)`
  예외 유지.
