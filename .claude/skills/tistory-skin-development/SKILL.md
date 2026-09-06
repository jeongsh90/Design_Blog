---
name: tistory-skin-development
description: shadcn/ui 컴포넌트를 React 없이 순수 HTML/CSS/바닐라 JS로 포팅해 대시보드형 티스토리 스킨을 구역 단위로 구현하는 방법(로컬 Tailwind v4 빌드, data-slot/CSS 변수 1:1 포팅, 파일 업로드 배포, 로컬 검증)을 안내. tistory-skin-developer 에이전트가 사용. "sidebar 구현", "tailwind.css 빌드", "shadcn 컴포넌트 포팅", "data-slot 구현", "파일 업로드 준비" 요청 시 사용.
---

# 대시보드 shadcn 스킨 구현

## 원칙: shadcn 원본과 1:1 대응이 목표다

`references/dashboard-shadcn-requirements.md`의 실측 레퍼런스(CSS 변수/data-slot/상태 로직)와 `_workspace/{구역명}_designer-spec.md`(색상/치수)를 기반으로 구현한다. React 컴포넌트를 그대로 쓸 수 없을 뿐, **DOM 구조·클래스·`data-slot` 값·CSS 변수명은 최대한 그대로** 옮긴다 — "shadcn 느낌"이 아니라 "shadcn과 같은 마크업"이 목표다.

## 로컬 Tailwind CSS 빌드 파이프라인

Tistory는 Node/빌드 서버가 없다. 이 프로젝트(`D:\MyCloud\Design_Blog`) 로컬에서 Tailwind v4 CLI로 정적 CSS를 만든 뒤 그 결과물만 업로드한다.

1. 프로젝트 루트에 Tailwind 설정이 없으면 최초 1회 준비: `bunx --bun @tailwindcss/cli` 사용 가능 여부 확인(로컬에 bun/node/npx 설치돼 있음). `dashboard-skin/src/input.css`에 `@import "tailwindcss";` + `@theme inline { ... }`(shadcn 패턴 그대로) + 색상 변수 `:root`/`.dark` 블록을 둔다.
2. 스캔 대상은 `dashboard-skin/skin.html`(실제 마크업에 쓰는 유틸리티 클래스가 여기 다 있어야 Tailwind가 인식한다 — Tistory 템플릿 태그 `[##_..._##]` 안쪽은 무시되므로 문제 없음)과 `dashboard-skin/components/*.js`(JS로 클래스를 동적으로 붙이는 경우 대비).
3. 빌드 명령 예: `bunx --bun @tailwindcss/cli -i dashboard-skin/src/input.css -o dashboard-skin/tailwind.css --minify` — 구역을 추가할 때마다 마크업이 늘어나므로 **매번 재실행**해서 새 유틸리티 클래스를 반영한다.
4. 빌드된 `tailwind.css`가 실제로 필요한 클래스를 포함하는지 grep으로 확인(예: `sidebar-menu-button`이 쓰는 유틸리티가 빠짐없이 있는지)한 뒤 산출물로 확정한다.

## shadcn 컴포넌트 포팅 매뉴얼

1. **React state → data 속성 + 바닐라 JS.** `useState`로 관리되던 값(예: sidebar의 `open`)은 DOM의 `data-state` 속성으로 표현하고, 토글 함수는 그 속성을 직접 바꾸는 순수 JS 함수로 옮긴다. CSS는 `[data-state="collapsed"] .sidebar-menu-sub { display: none }`처럼 속성 선택자로 스타일링한다(shadcn이 Tailwind의 `group-data-[...]` 변형으로 하던 것과 같은 원리).
2. **React Context → 전역이 아니라 스코프 있는 JS 모듈.** `useSidebar()` 같은 훅은 사이드바 DOM 엘리먼트를 기준으로 상태를 읽고 쓰는 작은 함수 집합으로 옮긴다.
3. **쿠키/로컬스토리지.** shadcn이 쿠키를 쓰는 부분(`sidebar_state`)은 그대로 쿠키로 포팅한다(서버가 없는 정적 페이지라도 쿠키는 `document.cookie`로 클라이언트에서 읽고 쓰면 된다) — 임의로 localStorage로 바꾸지 않는다(스펙에 이유 없이 다르게 만들지 않는다는 원칙).
4. **Sheet(모바일 오프캔버스) 같은 shadcn 프리미티브 의존.** 해당 프리미티브가 없으므로, 그 프리미티브가 만드는 최종 DOM 결과(백드롭 + 슬라이드 패널 + `data-state`)를 직접 구현한다. transition은 Tailwind 유틸리티(`transition-transform`, `duration-200` 등 shadcn이 실제로 쓰는 값)를 그대로 가져온다.
5. **`data-slot`은 스타일링뿐 아니라 향후 QA/디버깅용 훅이기도 하다.** 절대 생략하지 않는다 — 모든 shadcn 하위 엘리먼트에 대응하는 `data-slot="..."`을 정확히 단다.

## 여백/색상 구현

- `_workspace/{구역명}_designer-spec.md`의 색상 매핑 표를 `:root`/`.dark`에 그대로 옮긴다. 값 형식(oklch 등)은 스펙에서 정한 대로 통일 — 한 파일 안에서 형식을 섞지 않는다.
- 여백은 스펙에 적힌 `calc(var(--spacing) * n)` 그대로 CSS에 쓰거나, 대응하는 Tailwind 유틸리티 클래스(`p-4`, `gap-2` 등 — 이것도 내부적으로 같은 calc 계산을 한다)로 마크업에 직접 적용한다.

## 파일 구성과 배포

```
dashboard-skin/
├── skin.html              ← Tistory 템플릿 태그 + 구역별 마크업 누적
├── tailwind.css            ← 로컬 빌드 산출물 (매 구역 추가 시 재빌드)
├── components/
│   ├── sidebar.css         ← 이 구역 전용 스타일(색상 변수, data-state 선택자 등)
│   └── sidebar.js          ← 이 구역 전용 동작(토글, 쿠키, 키보드 단축키)
└── README.md                ← 업로드 순서 + skin.html 참조 방법
```

`skin.html`에서는 상대경로로 참조: `<link rel="stylesheet" href="./tailwind.css">`, `<link rel="stylesheet" href="./components/sidebar.css">`, `<script src="./components/sidebar.js"></script>`. 업로드는 티스토리 관리자 → 꾸미기 → **스킨 편집 → HTML 편집 → 파일 업로드**(`/manage/design/skin/edit#/source/file`)에서 각 파일을 올린 뒤 skin.html의 HTML 편집 탭에서 마크업을 반영한다.

## 로컬 검증 (Tistory 계정 없이)

검증은 에이전트가 끝낸다. "브라우저에서 확인해 주세요"로 넘기지 않는다. Claude Code가 Playwright MCP를 등록해 두고 클릭·스크린샷까지 하던 것과 같은 수준이다.

1. `bun run skin:preview`로 목업을 갱신한다. `http://localhost:4321`이 응답하지 않으면 `bun run skin:serve`를 띄운다.
2. Playwright MCP(`browser_navigate` / `browser_click` / `browser_take_screenshot` / `browser_evaluate` 등)가 세션에 있으면 그걸 쓴다. Cursor는 프로젝트 `.cursor/mcp.json`의 `@playwright/mcp`다. MCP가 안 보이면 사용자에게 설정 화면을 안내하기 전에, 아래 3~4로 검증을 먼저 끝낸다.
3. 브라우저 바이너리가 없으면 `bunx playwright install chromium`을 실행한다. 샌드박스 캐시에만 있고 `%USERPROFILE%\AppData\Local\ms-playwright`에는 없으면 그 경로로 다시 설치한다. 그래도 없으면 시스템 Chrome을 `PLAYWRIGHT_CHROME_PATH`로 쓴다(Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`).
4. MCP가 없거나 픽셀 assert가 필요하면 기존 러너를 돌린다: `bun run skin:verify:content` / `skin:verify:prose` / `skin:verify:codeblock`, 또는 `dashboard-skin/tools/verify-*.mjs`. 이 스크립트는 Playwright `launch`가 이 환경에서 멈추는 경우가 있어 Chromium을 spawn한 뒤 puppeteer-core로 CDP에 붙는다.
5. **PC 뷰포트 기준**(반응형 단계는 별도 요청)으로 실제 클릭/키보드(`Ctrl+B`)와 `page.evaluate`로 `data-slot`/`data-state`를 읽는다. 스크린샷만으로 끝내지 않는다.
6. 실패하면 고치고 다시 검증한 뒤에만 보고한다. 티스토리 서버 전용 항목만 "배포 후 재확인"으로 남긴다.

## 손대지 않는 것 (여전히 유효)

Tistory 템플릿 태그(`[##_..._##]`, `<s_*>` 조건 블록)는 여전히 유지해야 하는 대상이다 — 대시보드로 방향이 바뀌어도 Tistory가 실제 글/카테고리 데이터를 넣어주는 자리이므로 임의로 손대지 않는다. 필요하면 `references/skin-requirements.md`(1차 문서)에서 태그 문법을 참고한다.

## 주석은 짝 `.md`에 둔다

업로드하는 스킨 소스에 주석이 있으면 HTML 편집 산출물이 지저분해지고, 주석 안에 `<s_*>` 태그 이름을 적으면 `make-preview.mjs` 정규식이 주석~닫는 태그를 한 블록으로 잡아 마크업을 복제해 버린다(실측). 그래서 주석은 소스가 아니라 짝 문서에 둔다.

**어디에:** `dashboard-skin/skin.html` → `dashboard-skin/skin.html.md`. `components/header.css` → `components/header.css.md`. `src/input.css` → `src/input.css.md`. JS도 같다. 파일이 없으면 같은 디렉터리에 만든다.

**무엇을:** `<!-- -->`, `/* */`, `//` 설명. 왜 이렇게 짰는지, Tistory 함정, 스펙 이탈 사유.

**형식:** 기존 `header.css.md`처럼 제목 + 소스 경로 + 번호 절. 새 메모는 맨 아래에 절을 추가한다. 소스 한 줄을 "설명해 두려고" 주석을 달지 말고, 그 문장을 `.md`에 쓴다.

**하지 않는 것:** `[SPEC …]` 표식을 CSS/JS 안에 남기지 않는다. 원본 대조는 `.md`나 `_workspace/*_developer-verification.md`로 한다.

**예외 (지우지 말 것):**
- 코드가 주석 문법을 *매칭*하는 경우 — 예: `content.js`의 `CODE_FILENAME_RE`가 `//`·`<!--`를 찾는 것
- 빌드기가 넣은 `tailwind.css` 라이선스 한 줄
- `_workspace/` 목업 상단의 "자동 생성 파일" 안내, 본문 샘플 안의 가짜 주석

이미 소스에 주석이 생겼으면 `bun dashboard-skin/tools/extract-comments.mjs` 후 필요 시 `tidy-after-extract.mjs`로 옮긴다. 새 코드를 쓸 때는 추출 도구에 의존하지 말고 처음부터 `.md`에 적는다.
