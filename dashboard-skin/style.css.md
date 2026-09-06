# `style.css` — 설계 주석

소스: `dashboard-skin/style.css` (2026-09-06부터 **생성 파일** — 직접 손으로 고치지 않는다)

## 2026-09-06 갱신 — 컴포넌트 CSS 전부를 여기로 통합(빌드 산출물화)

기존엔 `tailwind.css` 외에 `tooltip.css`/`scrollbar.css`/`smooth-scroll.css`/
`card.css`/`sidebar.css`/`header.css`/`widgets.css`/`content.css` 8개를 각각
`<link>`으로 걸고 티스토리 파일 업로드로 하나씩 올렸다. 업로드할 CSS 파일 수를
줄이기 위해(테일윈드 제외 전부) 이 파일 하나로 합치기로 함 — `skin.html`도
이제 `tailwind.css` + `style.css` 두 개의 `<link>`만 가진다.

**편집은 여전히 `dashboard-skin/components/*.css` 각 파일에서 한다** — 사이드바를
고칠 땐 `sidebar.css`를, 헤더를 고칠 땐 `header.css`를 그대로 연다. 이 루트
`style.css`는 그 파일들을 이어붙인 **빌드 산출물**이라 직접 고치면 다음
`bun run skin:build`(또는 `skin:build:style`)에서 덮어써진다 — `tailwind.css`가
`src/input.css`의 산출물인 것과 똑같은 관계.

`tools/build-style.mjs`가 아래 순서(기존 `<link>` 순서 그대로, 나중 것이 우선
적용)로 이어붙인다:

```
tooltip.css → scrollbar.css → smooth-scroll.css → card.css → sidebar.css →
header.css → widgets.css → content.css → tistory-overrides.css
```

`tistory-overrides.css`(티스토리 자체 주입 마크업 다크모드 대응, 자세한 내용은
그 파일의 짝 `.md` 참고)는 항상 맨 마지막에 와서 최종 오버라이드 역할을 한다.

JS는 그대로 5개 파일(`tooltip.js`/`sidebar.js`/`header.js`/`content.js`/
`smooth-scroll.js`) 개별 업로드 유지 — 이번 통합은 CSS에만 해당.

## 2026-09-06 이전 갱신 — style.css는 자동으로 로드되지 않는다(실측)

`style.css`는 티스토리가 자동으로 페이지에 삽입해주지 않는다 — `skin.html`에
`<link>`로 직접 걸어야 실제로 로드된다(실측: skin.html이 참조하지 않던 시절엔
"CSS" 탭에서 파일을 고쳐도 어떤 페이지에도 반영되지 않는 죽은 파일이었다).
그래서 `skin.html`의 `tailwind.css` 바로 다음 줄에 `<link rel="stylesheet"
href="./style.css" />`를 두고 있다.
