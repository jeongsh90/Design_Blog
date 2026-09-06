# 배포용 폴더 — 이 안의 파일만 그대로 업로드하면 된다

이 폴더는 `dashboard-skin/`(작업 소스)에서 **최종 업로드 대상 파일만 뽑아 평면으로 복사**해 둔
스냅샷이다. 개발용 파일(`tools/`, `*.css.md`/`*.js.md` 주석 문서, `_workspace/` 검증 자료,
`src/input.css` 등)은 여기 없다 — 그런 건 소스에만 있으면 되고 업로드 대상이 아니다.

**주의:** 이 폴더는 스킨을 고칠 때마다 손으로 다시 채워야 하는 스냅샷이다(자동 동기화 아님).
다음 배포 전에는 아래 "갱신 방법"대로 다시 복사해서 최신 상태로 맞출 것.

---

## 스킨을 새로 등록할 때

지금 적용된 스킨이 JQ.Minimal이면, HTML만 고쳐도 스킨 편집 화면의 이름·제작자·저작권은
바뀌지 않는다. **DAITNU로 새로 등록**한다.

**검증된 방법 — 관리자 → 꾸미기 → 스킨 → "스킨 등록"**(`/manage/design/skin/add`, zip
직접 업로드가 아니라 개별 파일 다중 선택 방식): 아래 **20개 전부**를 이 화면의 "추가"로
올린다(`DAITNU-v1.0.0.zip`은 참고용 아카이브일 뿐, 이 등록 화면이 zip을 직접 받아
풀어주는지는 확인되지 않았다 — 검증된 건 개별 파일 다중 선택뿐).

```
index.xml, skin.html, style.css,
preview256.jpg, preview560.jpg, preview1600.jpg,
images/{tailwind.css, tooltip.{css,js}, scrollbar.css, smooth-scroll.{css,js},
        card.css, sidebar.{css,js}, header.{css,js}, widgets.css, content.{css,js}}
```

**preview 3장을 절대 빠뜨리지 말 것** — 등록 화면 안내문은 "index.xml, skin.html,
style.css 등"만 언급하지만, 정작 **스킨 보관함 목록의 썸네일은 이 3장으로 그려진다**
(2026-09-06 실측: 이걸 빼먹고 등록했다가 회색 기본 아이콘만 뜨는 걸 뒤늦게 발견해
재등록했다). 스킨명에 이미 저장된 것과 같은 이름(DAITNU)을 입력하면 "같은 이름의 저장된
스킨이 있습니다. 덮어씌우겠습니까?" 확인창이 뜨는데, **수락하면 새 항목이 추가되는 게
아니라 기존 걸 덮어쓴다**(중복 안 생김 — 안전하게 재등록해도 됨).

**다중 파일 업로드 시 알아둘 것(2026-09-05/06 실측):** 여러 파일을 한 번에 선택하면
그중 `skin.html`(가장 큰 파일)만 조용히 누락되는 현상을 두 차례 재현했다(원인 미상) —
업로드 직후 "파일목록"에 20개가 다 보이는지 반드시 눈으로 확인하고, 빠졌으면 `skin.html`
하나만 다시 올릴 것.

저장 → 스킨 보관함에서 방금 저장한 항목을 열어 "적용"("스킨을 변경하면 홈 커버, 사이드바
설정이 초기화 될 수 있습니다" 확인창 수락) → 스킨 편집 화면에 이름 **DAITNU**, 제작자
**jeongsanghoon@naver.com**, 저작권 **제작자 소유**가 보이면 된 것이다.

`index.xml`을 바꾸면 티스토리가 **스킨 설정을 초기화**한다. 단 `<default>` 블록에 위젯
노출 개수를 5로 박아 둬서, 재등록·재적용 후에도 **사이드바 설정이 자동으로 5로 맞춰짐을
실측 확인**(수동 조정 불필요) — 혹시 다른 값으로 보이면 그때만 손으로 맞춘다.

---

## 업로드 순서 (딱 2단계)

관리자 → 꾸미기 → **스킨 편집 → html 편집**
(`https://daitnu.tistory.com/manage/design/skin/edit#/source/file`)

### 1) 우측 **파일 업로드** 탭 — `skin.html`을 뺀 나머지 14개를 전부 올린다

```
tailwind.css
tooltip.css
tooltip.js
scrollbar.css
smooth-scroll.css
smooth-scroll.js
card.css
sidebar.css
sidebar.js
header.css
header.js
widgets.css
content.css
content.js
```

파일명 그대로 올리면 된다(경로 없음 — 티스토리가 전부 `./images/` 아래 평면으로 서빙한다).
이미 같은 이름의 파일이 있으면 **덮어쓰기**로 올린다.

### 2) **HTML** 탭 — `skin.html` 내용을 통째로 복사해 붙여넣는다

이 폴더의 `skin.html`을 열어 전체 선택 → 복사 → 티스토리 HTML 탭에 붙여넣기 → 저장.

### 3) 저장 → 미리보기로 확인 → 적용

---

## 업로드 후 반드시 해야 하는 관리자 설정

우측 위젯(공지사항/최근 글/인기 글/태그/최근 댓글)의 **노출 개수는 스킨 코드로 통제할 수
없다** — **꾸미기 > 사이드바 설정**에서 각 위젯의 노출 개수를 원하는 값(기본 설계는 5)으로
직접 설정해야 한다. `skin.html`의 반복 블록은 항목 1개짜리 템플릿이 딱 한 번만 있고, 실제
개수는 이 관리자 설정값을 서버가 그대로 곱해서 렌더한다.

---

## CDN 의존성 (업로드 파일 아님 — `skin.html` 안에 이미 포함됨)

`skin.html`의 HTML 탭 내용에 아래 CDN `<script>`가 이미 들어 있다. 파일 업로드 목록에는
없지만 2)번에서 HTML을 통째로 붙여넣으면 자동으로 함께 로드된다.

- `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/gsap.min.js`
- `https://cdnjs.cloudflare.com/ajax/libs/gsap/3.15.0/ScrollTrigger.min.js`
- `https://cdn.jsdelivr.net/npm/lenis@1.3.25/dist/lenis.min.js`
- (코드블록이 있는 글에서만 필요 시 동적 로드) `https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.12.0/build/highlight.min.js`

## 로드 순서 (참고용 — `skin.html`에 이미 이 순서로 박혀 있다)

```
CSS:  tailwind → tooltip → scrollbar → smooth-scroll → card → sidebar → header → widgets → content
JS:   GSAP → ScrollTrigger → Lenis → tooltip → sidebar → header → content → smooth-scroll
```

---

## 갱신 방법 (다음 배포 전 이 폴더를 최신으로 맞추는 법)

`dashboard-skin/` 루트에서:

```bash
bun run skin:build   # tailwind.css 재빌드 먼저
```

그다음 아래 14개 파일 + `skin.html` + `index.xml` + `style.css`를 이 `deploy/` 폴더로
**덮어쓰기 복사**한다(경로만 `components/`·루트에서 여기로, 파일명은 그대로).
미리보기 jpg는 직접 교체한 뒤에만 건드린다. zip을 다시 만들 때는 루트 3개 + 미리보기 3장 +
`images/`에 14개 CSS/JS를 넣어 `DAITNU-v1.0.0.zip`으로 묶는다.

```
tailwind.css, components/tooltip.{css,js}, components/scrollbar.css,
components/smooth-scroll.{css,js}, components/card.css,
components/sidebar.{css,js}, components/header.{css,js},
components/widgets.css, components/content.{css,js},
skin.html, index.xml, style.css
```

---

## 현재 스킨 진행 상황 (2026-09-05 기준)

완료: Sidebar(PC+모바일 드로어) · Header(PC+모바일 브레드크럼) · 우측 위젯 패널 · Content
목록/본문 · 글 상세 하단(공감·공유·더보기/관련글 카드/태그/댓글) · 이전·다음 글 ·
코드블록(highlight.js) · 반응형 1차(사이드바·헤더).

미착수: 방명록/검색결과/커버 페이지, Content 구역 반응형(별도 진행 중), 티스토리 실사이트
전용 항목들(구독 버튼 실렌더, 관리 메뉴바 충돌 등 — 계정 접근이 없어 로컬에서 검증 불가,
자세한 목록은 `dashboard-skin/README.md`의 "서버 배포 후 재확인이 필요한 것" 절 참고).

상세 이력은 `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md`에
전부 기록돼 있다.
