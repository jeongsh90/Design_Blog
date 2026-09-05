# 글 상세(permalink) 하단 기능 4종 — 구현·검증 보고서

> 작성: `tistory-skin-developer` · 2026-09-04
> 구현 정본: `_workspace/content-permalink-footer_designer-spec.md`
> 대상: `dashboard-skin/` (1차 `skin/` 폴더는 건드리지 않음 — 확인: `git diff --numstat`에 `skin/` 항목 0건)

---

## 1. 바꾼 파일 목록

| 파일 | 변경 | 추가/삭제 행 (git numstat) |
|---|---|---|
| `dashboard-skin/components/content.css` | 끝(670행)에 **§11 블록 append** | **+383 / −0** |
| `dashboard-skin/components/content.js` | 함수 4개 + `init()` 호출 4줄 | **+160 / −0** |
| `dashboard-skin/skin.html` | `<s_permalink_article_rep>` 안에 푸터 4블록 삽입 | **+275 / −0** |
| `dashboard-skin/tools/make-preview.mjs` | §10 목업 치환자 + `PERMALINK_REPEATS` | **+131 / −0** |
| `dashboard-skin/tailwind.css` | 재빌드(`bun run skin:build`) | +1 / −1 (minify 1행 파일) |
| `dashboard-skin/README.md` | 구역 상태표·파일트리 3줄 갱신 | +6 / −4 |
| `dashboard-skin/tools/verify-footer.mjs` | **신규** — §9-4 30항 자동 검증 | 신규 1,016행 |
| `dashboard-skin/src/input.css` | **변경 없음**(지시대로) | — |

**삭제 행이 전부 0이라는 것이 "기존 코드 미변경"의 직접 증거다.**
`content.css`는 1053행이 되었고 그중 383행이 신규이므로 **1~670행은 한 글자도 바뀌지 않았다.**
`content.js`의 기존 4함수(`initPaginationActiveState`/`initSquareGrid`/`initViewToggle`/`initProseTables`)도 동일하게 무변경이다.

**새 CSS/JS 파일 0개** — `comments.css`를 만들지 않았고, Button은 `header.css`, Badge는 `card.css`, 관련글 목록은 `widgets.css`의 `widget-*` 슬롯을 그대로 재사용했다(`widgets.css`도 무변경).
`verify-footer.mjs`는 스킨 산출물이 아니라 검증 도구이며 `tools/verify-content.mjs` 선례를 따랐다 — **업로드 대상이 아니다.**

### 업로드해야 할 파일 (새 파일 0개)

```
dashboard-skin/components/content.css
dashboard-skin/components/content.js
dashboard-skin/tailwind.css
dashboard-skin/skin.html   ← HTML 탭에 붙여넣기
```

---

## 2. skin.html에 넣은 4블록

`post-single-body` 다음 · `</article>` 앞에 `<footer data-slot="post-footer">` 하나로 감쌌다(스펙 §1-1 — `post-single` **안쪽**이라 720px max-width와 좌측선을 본문과 공유하고, `post-single-body`의 **형제**라 §10 프로즈 자손 셀렉터가 상속되지 않는다).

| 블록 | 최상위 `data-slot` | 티스토리 태그 | 하위 주요 슬롯 |
|---|---|---|---|
| ① 액션 바 | `post-actions` | (없음) + `<s_ad_div>` | `post-like` / `post-share` / `post-copy` / `post-status`(sr-only) / `post-admin` |
| ② 관련글 | `post-related` | `<s_article_related>` + **`<s_article_related_rep>`** | `post-footer-title` / `widget-list` / `widget-item` / `widget-link` / `widget-body` / `widget-title` / `post-related-date` |
| ③ 태그 | `post-tags` | `<s_tag_label>` | `post-footer-title` / `post-tag-list`(JS가 `data-tags="normalized"` 부여) / `badge` |
| ④ 댓글 | `post-comments` | `<s_rp>` / `s_rp_container` / `s_rp_rep` / `s_rp2_container` / `s_rp2_rep` / `s_rp_input_form` / `s_rp_member` / `s_rp_guest` | `post-comments-count` / `comment-list` / `comment-item` / `avatar`(+`avatar-image`/`avatar-fallback`) / `comment-body` / `comment-actions` / `comment-replies` / `comment-form` / `textarea` / `input` / `comment-secret` / `button` |

목록(`s_index_article_rep`)에는 넣지 않았다 — 체크리스트 27번에서 인덱스 목업의 `post-footer` 계열이 **0개**임을 실측 확인했다.

---

## 3. 완료 보고 항목 실측값

| 항목 | 실측 결과 |
|---|---|
| 관련글 반복 확장 | **5개** (`s_article_related_rep`가 실제로 확장됨 — 스펙 §0-1 정정 반영 확인) |
| 태그 JS 정규화 후 badge 개수 | **5개** (앵커 5개 전부 `data-slot="badge"` + `data-variant="outline"`, 컨테이너 텍스트 노드 **0개** = 쉼표 제거됨, `::before`가 `#` 렌더) |
| 댓글 수 | **최상위 3개 + 대댓글 1개** (2번째 댓글에만 대댓글) |
| 대댓글 들여쓰기 | `comment-replies` `margin-left: 44px` = 부모 아바타 32 + gap 12. **부모 본문 left = 324px · 대댓글 아바타 left = 324px(정확히 일치) · 대댓글 본문 left = 360px**(자기 아바타 24 + gap 12만큼 추가 들여쓰기) |
| 공감 토글 localStorage | **유지됨** — 클릭 → `aria-pressed="true"`·카운트 `0→1`·하트 `fill` 채움, **새로고침 후에도** `aria-pressed="true"`·`1` 유지. 재클릭 → `0`·`false` |
| 공유 버튼 | `navigator.share` **있으면** `hidden` 제거·노출 / **삭제한 컨텍스트에선** `hidden` 유지 + 링크 복사 버튼만 남음(양쪽 다 실측) |
| 링크 복사 | `data-copied="true"` + 체크 아이콘 + sr-only "링크를 복사했습니다" → **1.6초 뒤 원복** |
| §9-4 PASS 개수 | **30/30 항목 PASS** (라이트·다크, 총 **280 assert · 실패 0**) |

### 대댓글 들여쓰기에 대한 주의 (스펙 문구 vs 기하)

스펙 18번은 "대댓글 **본문** 좌측선이 부모 **본문** 좌측선과 정확히 일치"라고 썼지만, 같은 항목이 함께 요구한 **들여쓰기 44px(=부모 아바타 32+gap 12)** 와 **대댓글 아바타 24px(`data-size="sm"`)** 를 동시에 만족하는 기하는 "**대댓글 블록(아바타)의 좌측선** = 부모 본문 좌측선"이다(324px 정확 일치). 대댓글 본문은 자기 아바타+gap만큼 더 들어간다(360px).
스펙의 두 수치를 그대로 구현한 결과이므로 **구현 이탈이 아니라 스펙 문구가 느슨한 경우**로 판단해 수치대로 구현했다. 스크린샷상으로도 대댓글이 부모 본문 시작선에서 시작해 자연스럽게 읽힌다. 문구 쪽 의도가 정말 "본문끼리 정렬"이었다면 대댓글 아바타를 숨기거나 들여쓰기를 20px로 줄여야 하므로 **설계자 확인이 필요한 1건**으로 남긴다.

---

## 4. 스펙과 달라진 점

### 4-1. 새로 생긴 편차 — **1건**

| # | 스펙 | 구현 | 이유 |
|---|---|---|---|
| N1 | `initCommentAvatars()`의 URL 판별 정규식 `/^(https?:)?\/\//` | `/^(https?:)?\/\/|^data:image\//` (**`data:image/` 추가**) | 스펙 §10-3은 이 방어가 동작하는지 보려고 3번째 댓글에 "URL 문자열" 케이스를 심어 뒀는데, 목업은 "외부 URL 금지(오프라인 렌더)" 원칙 때문에 그 값이 `data:image/svg+xml` URI다 → 원본 정규식으로는 그 케이스가 "URL 아님" 분기로 떨어져 **체크리스트 20번을 검증할 방법이 아예 없었다.** 순수 가산 변경이며 실사이트가 내려주는 http(s) URL 동작은 그대로다. 코드에 사유 주석을 남겼다 |

그 외 `content.css` §11 CSS·`content.js` 4함수·`skin.html` 마크업·`make-preview.mjs` 목업은 **스펙 전문 그대로**다(§11-0→§11-5 순서, `s_rp2_rep`가 `s_rp_rep`보다 배열에서 먼저 오는 순서 제약 포함).

### 4-2. 스펙 §8에 이미 적힌 의도적 편차 — 재인용 12건

| # | 원본 | 이 스킨 | 이유(스펙 §8) |
|---|---|---|---|
| 1 | shadcn Badge를 마크업에 작성 | JS가 앵커에 `data-slot="badge"` 부여 + CSS 폴백 | `[##_tag_label_rep_##]`가 단일 치환자라 개별 마크업 자리가 없음 (환경 제약) |
| 2 | (shadcn엔 없음) | 공감 = localStorage 장식 카운터 | 서버 API·치환자 부재. 가짜 수치 만들지 않음 |
| 3 | (shadcn엔 없음) | 공유 = Web Share API + 클립보드 폴백 | 같은 이유. 미지원 브라우저에선 버튼 숨김 |
| 4 | shadcn DropdownMenu(Radix) | ⋯ 메뉴 미구현, `<s_ad_div>` 인라인 버튼 대체 | Popover 프리미티브·`--popover` 토큰 부재 + 데이터 소스 부재 (Q1) |
| 5 | React `onClick={handler}` | `onclick="[##_rp_rep_onclick_delete_##]"` 문자열 주입 | 서버가 JS 코드 문자열을 내려줌. 바닐라 정상 경로 |
| 6 | Radix Avatar(이미지 실패 감지 → fallback 전환) | fallback을 깔고 이미지가 덮는 CSS 레이어 | Radix 런타임 없음. 결과는 동일 |
| 7 | `<input type="submit">` | `<button type="button" onclick=…>` | 감싸는 `<form>`이 없어 submit 의미 없음 + 아이콘+텍스트 필요 |
| 8 | `aria-invalid:border-destructive` | 생략 | `--destructive` 토큰 부재 |
| 9 | 스크린샷의 빨간 하트 | 무채색 하트(활성 시 `currentColor` 채움) | 새 색 토큰 만들지 않음 (Q3) |
| 10 | 스크린샷의 테두리 있는 카드 | 카드 없이 구분선만 | 우측 위젯 구역이 이미 "카드 배경·보더 제거"로 확정 |
| 11 | `field-sizing-content` | 유지 + `min-height` 폴백 | Chrome 123+/Edge만 지원 → `rows="3"`+`min-height`로 동작 |
| 12 | textarea·제출이 `<s_rp_member>` **밖** | **안** | 작성이 막힌 상태에서 입력창만 남는 것 방지. **Q8에 따라 되돌릴 수 있음**(태그 2개 이동) |

---

## 5. §9-4 체크리스트 30항 결과 (라이트/다크)

`_workspace/content_mockup-permalink.html` 기준 · 실행: `bun dashboard-skin/tools/verify-footer.mjs`
**전체 280 assert · 실패 0 · 30/30 PASS**
상세 로그(assert 한 줄씩 실측값 포함): `_workspace/footer-verify-log.md`

| # | 항목 | light | dark | assert |
|---|---|---|---|---|
| 1 | `post-footer`가 `post-single` 안 + 좌우 경계가 본문과 일치 | PASS | PASS | 12 |
| 2 | 4블록 padding 32px/32px + `border-top` 1px `--content-divider` | PASS | PASS | 32 |
| 3 | 프로즈 규칙 미유출(`<p>` margin-top≠16px, 링크 색 출처 §11-5) | PASS | PASS | 10 |
| 4 | 공감 클릭 → `aria-pressed`·0→1·하트 fill + **새로고침 후 유지** | PASS | PASS | 22 |
| 5 | 재클릭 → 0 · `aria-pressed="false"` | PASS | PASS | 8 |
| 6 | `navigator.share` 삭제 시 `hidden` 유지 / stub 시 `hidden` 제거 (**양쪽 다**) | PASS | PASS | 5 |
| 7 | 링크 복사 → `data-copied` + 체크 아이콘 + 1.6초 원복 + 상태 문구 | PASS | PASS | 10 |
| 8 | `<s_ad_div>` 블록이 목업에서 보임 (목업 한정) | PASS | PASS | 6 |
| 9 | 관련글 **5개** 렌더(반복 블록 확장) | PASS | PASS | 6 |
| 10 | `widget-title` color === `--content-item-title-color` (§6-2 재선언) | PASS | PASS | 2 |
| 11 | hover 시 제목 색 → `--color-card-foreground` | PASS | PASS | 2 |
| 12 | 긴 제목 한 줄 말줄임 + 날짜 안 밀림 | PASS | PASS | 10 |
| 13 | 항목 사이 `border-top` === `--color-border` | PASS | PASS | 4 |
| 14 | `data-tags="normalized"` + 전 앵커 badge/outline + 텍스트 노드 0 | PASS | PASS | 16 |
| 15 | `::before`가 `#` 렌더 (+ opacity 0.5) | PASS | PASS | 4 |
| 16 | **nojs 사본**에서 태그 폴백 + 콘솔 에러 0 | PASS | PASS | 16 |
| 17 | 태그 wrap + 가로 오버플로 0 | PASS | PASS | 4 |
| 18 | 댓글 3 + 대댓글 1 · 들여쓰기 44px 실측 | PASS | PASS | 24 |
| 19 | 아바타: 이미지가 fallback을 덮음(z-index) / 없으면 fallback | PASS | PASS | 6 |
| 20 | URL 문자열 케이스가 `<img>`로 승격 | PASS | PASS | 6 |
| 21 | 댓글 액션 opacity 0 → hover/포커스 1 · **Tab 도달 가능**(`:focus-within`) | PASS | PASS | 10 |
| 22 | 댓글 본문 링크 색 === `--color-link` | PASS | PASS | 2 |
| 23 | 게스트 입력 3칸 정확히 3등분(±1px) | PASS | PASS | 12 |
| 24 | textarea 포커스 → border `--color-ring` + 3px ring | PASS | PASS | 4 |
| 25 | 비밀글 라벨 클릭 → checked + 자물쇠 교체 + `--color-accent` · **Tab→Space도** | PASS | PASS | 20 |
| 26 | 제출 버튼 primary 배경 + `onclick` 문자열 유지 | PASS | PASS | 8 |
| 27 | **인덱스 목업에 `post-footer` 없음** | PASS | (해당없음) | 3 |
| 28 | permalink 격자 배경 `none` · 목록 타이틀 `display:none` | PASS | PASS | 4 |
| 29 | 문서가 아니라 `content-inner`가 스크롤 + 커스텀 스크롤바 · `scroll-fade-y` | PASS | PASS | 6 |
| 30 | 가로 오버플로 0 · 콘솔 에러 0 · 스크린샷 | PASS | PASS | 4 |
| — | (추가) nojs에서 아바타 URL이 텍스트로 남음 = JS 승격 없음을 반대로 확인 (Q10) | PASS | PASS | 2 |

**27번의 dark가 "해당없음"인 이유:** 인덱스 목업에 permalink 전용 블록이 새지 않았는지 보는 **정적 구조 회귀 검사**라 테마와 무관하다 — 라이트에서 1회만 수행했다(격자 배경 유지·목록 타이틀 노출·콘솔 에러 0까지 함께 확인).

### 5-1. 검증 하네스에서 고친 것 (스킨 버그 아님 — 관측 환경 문제)

처음 실행에서 38 assert가 실패했는데 **전부 헤드리스 관측 환경 문제였고 스킨 코드 문제는 1건(§4-1 N1)뿐이었다.** 잘못된 실패를 "스킨 수정"으로 덮지 않기 위해 원인을 하나씩 실측으로 확정했다.

| 증상 | 실제 원인 | 조치 |
|---|---|---|
| 4·5번 공감이 새로고침 후 초기화 | `evaluateOnNewDocument`로 `localStorage.clear()`를 걸어 **reload 때도** 지워짐 → 지속성 자체를 관측 불가 | 테마 루프 시작에 해당 키만 1회 삭제 |
| 7번 복사 실패("복사에 실패했습니다") | `overridePermissions("clipboard-write")`가 성공을 반환하고도 실제 권한은 `denied` → `writeText`가 `NotAllowedError` | 브라우저 레벨 CDP `Browser.grantPermissions(clipboardReadWrite)` |
| 21·24번 포커스 스타일 미적용 | `focus()` **직후 같은 태스크**에서 `getComputedStyle`을 읽어 **전이 시작값**(opacity 0 / 기존 border)을 관측. `transition-property`에 `border-color`·`opacity`가 있음 | 포커스와 관측을 분리하고 전이(150ms) 종료 대기 |
| 21·24번 (2차) `:focus-within`/`:focus-visible` 미매칭 | 헤드리스는 `bringToFront()`만으론 **문서 포커스**가 없음 | CDP `Emulation.setFocusEmulationEnabled` |
| 6번 "share 미지원" 가정 실패 | 이 Chromium은 `navigator.share`를 **실제로 갖고 있다** | 기본 루프는 "있음" 케이스로 정정하고, **`Navigator.prototype.share`를 제거한 별도 페이지**로 미지원 케이스를 따로 검증(접근자라 인스턴스 delete로는 안 지워짐) |
| 25번 자물쇠 `display` 불일치 | `inline-flex`를 준 아이콘이 flex 아이템이라 **블록화**되어 computed가 `flex`/`block`으로 나옴(CSS 정상) | "표시/숨김"만 판정하도록 정정 |
| 29번 스크롤바 6px 아님 | `scrollbar.css`가 표준 `scrollbar-width: thin`을 쓰고, Chromium은 그럴 때 `::-webkit-scrollbar{width:6px}`를 무시하고 자기 thin 폭(**10px**)을 씀 | 이번 작업 무관 구역이므로 **회귀 확인**으로 정정(거터>0 + `thin` + 커스텀 색 유지) |

증거는 일회성 진단 스크립트로 직접 확정했고(예: 전이 종료 후 border가 `rgb(161,161,161)` = `--color-ring` `#a1a1a1`, box-shadow가 `0 0 0 3px`, `comment-actions` opacity `0→1`, 클립보드 `perm: granted`/`write: ok`), 확인 후 진단 스크립트는 삭제했다.

---

## 6. tailwind.css md5 전후

| | md5 | 크기 |
|---|---|---|
| 전 (커밋 `a0b0cf7`의 버전) | `25458015860F09B26F143D69671889B9` | 35,431 B |
| 후 (`bun run skin:build`) | `2BC15DFA8898A4F79BDF133FB0F71B30` | 39,301 B |

`.sr-only`는 전후 모두 존재한다(액션 바 상태 문구·푸터 제목 접근성 텍스트가 사용).

### 6-1. 발견 — 재빌드 결과에 **쓰이지 않는 유틸리티 20종(+3,870 B)** 이 들어왔다

새로 생긴 클래스 셀렉터는 251종 → 271종이고, 늘어난 20종은 전부 **마크업이 쓰지 않는** 것들이다:
`aspect-square, bg-muted, bg-transparent, border-input, disabled, field-sizing-content, file, h-9, min-h-16, outline-none, placeholder, resize, ring-, ring-ring, selection, select-none, shadow-xs, shrink-0, size-full, text-muted-foreground`

`skin.html`의 실제 `class=` 값은 `sr-only` / `scroll-fade-y` / `#subscribe` / 치환자 4종뿐이므로 출처를 추적했고, **두 경로가 확인됐다.**

1. `@source "../components"` → **`content.css` 안의 주석 텍스트**가 후보로 수집됨. §11-0을 shadcn 정본과 대조 가능하게 하려고 값 옆에 원본 클래스명을 적어 둔 주석(`/* shadcn border-input */`, `/* 36px — shadcn h-9 */` 등)이 그대로 유틸리티로 생성됐다. (`border-input`·`h-9`·`shadow-xs`·`bg-muted`·`min-h-16`·`aspect-square` 등)
2. **Tailwind v4의 자동 소스 탐지**가 `@source`와 **별개로 여전히 동작**해 `_workspace/*.md`(설계 스펙 문서)까지 스캔함. `size-full`·`field-sizing-content`·`select-none`은 **`components/` 어디에도 없고 스펙 md에만 있다** — 즉 업로드되는 CSS가 저장소에 어떤 마크다운이 있는지에 따라 달라진다.

둘 다 **시각·동작에는 영향이 없다**(아무 요소도 이 클래스를 쓰지 않음). 다만 업로드 산출물에 약 3.9KB 사문(死文)이 들어가고, 문서 파일이 산출물을 흔든다는 점은 파이프라인 문제다.
해결은 `src/input.css`에 `@source not "../../_workspace"` 같은 한 줄을 넣는 것인데, **이번 작업 지시가 `src/input.css`를 "변경 없음"으로 명시**했으므로 손대지 않았다. **오케스트레이터 판단 필요 1건**으로 올린다(선행 구역의 251종 중에도 같은 경로로 들어온 것이 있을 수 있다).

---

## 7. 실사이트(티스토리 계정) 미검증 — Q6~Q10

로컬 목업으로는 원리적으로 확인할 수 없다. **배포 후 재확인 필요.**

| # | 확인할 것 | 현재 가정 | 틀렸을 때의 영향/대응 |
|---|---|---|---|
| **Q6** | 티스토리가 **자체 공감/공유 UI를 서버에서 주입**하는가 | 미검증(주입 안 함으로 가정) | 주입되면 우리 액션 바와 **중복 노출**. 관리 메뉴바 선례가 있어 가능성이 낮지 않다 → 중복 시 우리 액션 바에서 해당 버튼만 제거 |
| **Q7** | `[##_tag_label_rep_##]`의 **실제 출력 형태** | "쉼표 구분 앵커 나열"로 추정 | §4-2 구현은 형태 비의존이라 대부분 동작하지만, 앵커가 아니라 `<span>`/평문이면 **badge가 안 붙고 폴백 스타일로 남는다**(읽기는 가능). nojs 폴백 경로는 실측 PASS |
| **Q8** | `<s_rp_member>`의 정확한 의미 | "댓글 작성 영역 전체 그룹, 안쪽 `s_rp_guest`가 비로그인 전용" | 틀려서 비로그인에서 `s_rp_member`가 통째로 사라지면 **비로그인 댓글 작성이 막힌다** → textarea·제출을 `s_rp_member` 밖으로 이동(태그 2개, 1분 작업) |
| **Q9** | `[##_rp_rep_class_##]`가 내려주는 값 | 미검증 — 값 유지하되 **어떤 스타일도 걸지 않음** | 값을 모른 채 스타일을 걸면 조용히 틀리므로 의도적으로 비워 뒀다. 값 확인되면 규칙 한 줄 추가 |
| **Q10** | `[##_rp_rep_logo_##]`가 `<img>` 요소인가 URL 문자열인가 | `<img>` 요소로 추정 | **둘 다 대응하는 방어가 이미 있다**(`initCommentAvatars`). 목업에서 `<img>`/빈 값/URL 문자열 3케이스를 모두 렌더해 PASS |

### 그 밖에 서버 렌더링이라 확인 못 한 것

- 관리자 전용 `<s_ad_div>`(수정·비공개·삭제) 버튼이 **실제로 관리자에게만** 나오는지 — 목업에선 항상 보이게 두고 확인했다.
- `onclick="[##_rp_rep_onclick_delete_##]"` / `..._reply_##]`가 내려주는 **실제 JS 코드 문자열**의 동작(목업은 `return false;`로 대체).
- `[##_rp_input_comment_##]` 등 `name` 속성 치환자가 실제 폼 전송에서 동작하는지(감싸는 `<form>`을 서버가 제공하는지 포함).
- 댓글 수 `[##_article_rep_rp_cnt_##]`·관련글 목록의 실제 개수/정렬.
- 티스토리 관리 메뉴바가 액션 바 상단과 겹치는지.

---

## 8. 스크린샷

| 파일 | 내용 |
|---|---|
| `_workspace/footer-shots/footer-light.png` | 라이트 — 액션 바 + 관련글 5건 + 태그 5개 + 댓글 상단 |
| `_workspace/footer-shots/footer-dark.png` | 다크 — 동일 구간 |
| `_workspace/footer-shots/footer-comments-light.png` | 라이트 — 댓글 3 + 대댓글 1 + 작성폼 전체 |
| `_workspace/footer-shots/footer-comments-dark.png` | 다크 — 동일 |
| `_workspace/footer-shots/footer-nojs-tags-light.png` | `content.js` 없는 사본의 태그 폴백(16번) |

## 9. 재현 방법

```powershell
cd d:\MyCloud\Design_Blog
bun run skin:build        # tailwind.css 재빌드
bun run skin:preview      # 목업 재생성 (index / empty / permalink / permalink-nojs / widgets)
bun run skin:serve        # http://localhost:4321
bun dashboard-skin/tools/verify-footer.mjs   # §9-4 30항 · 280 assert · 라이트+다크
```

검증 스크립트는 `--show-scrollbars`로 브라우저를 직접 띄운다(스펙 §9-4 29번이 요구한 `--hide-scrollbars` 배제와 같은 의도). 실패가 있으면 `_workspace/footer-verify-log.md`에 assert별 실측값이 남고 종료 코드가 1이 된다.
