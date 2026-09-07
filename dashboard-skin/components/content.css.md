# `content.css` — 설계 주석

소스: `dashboard-skin/components/content.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [SPEC 2026-09-05] Dropdown Menu — post-actions의 "더보기(⋯)" 관리자 메뉴 전용으로 이식한

[SPEC 2026-09-05] Dropdown Menu — post-actions의 "더보기(⋯)" 관리자 메뉴 전용으로 이식한
   공용 프리미티브(Design-system css/components.css 4719행~ 그대로, 색상 토큰만 매핑).
   현재 이 스킨에서 유일한 소비처라 content.css에 두었다 — header.css의 Button/Breadcrumb과
   같은 선례(추후 다른 구역도 dropdown-menu가 필요해지면 공용 파일로 분리).

---

## 2. [SPEC 2026-09-05] 레퍼런스 스크린샷("다른 글" 목록이 배경색 있는 카드로 페이지와 구분됨)

[SPEC 2026-09-05] 레퍼런스 스크린샷("다른 글" 목록이 배경색 있는 카드로 페이지와 구분됨)
   대응 — Design-system Card 컴포넌트(card.css)와 동일한 배경/모서리/외곽선 처리를 이식하고,
   `[data-slot="post-footer"] > *`가 물려주는 위쪽 구분선(border-top)·수직 전용 패딩은
   이 섹션에서만 취소했다(카드 자신의 배경·모서리가 이미 경계 역할을 하므로 그 위에
   직선 divider가 겹치면 둥근 모서리 위로 선이 튀어나와 보임). 위쪽 간격은 margin-top으로 대체.

---

## 3. [PREVNEXT 요청] "이전/다음글 기능 넣어"

── [PREVNEXT 요청] "이전/다음글 기능 넣어" ──────────────────────────
   <s_article_prev>/<s_article_next>는 서로 독립된 조건 그룹이다(글이
   맨 처음/맨 끝이면 그 쪽이 통째로 빠진다) — 카드 2장짜리 grid에서
   한쪽만 있거나 둘 다 없는 경우까지 :has()로 방어한다.

---

## 4. 실사이트에서 글이 맨 처음이면서 동시에 맨 끝(포스트 1개짜리 블로그)이면

실사이트에서 글이 맨 처음이면서 동시에 맨 끝(포스트 1개짜리 블로그)이면
   양쪽 조건 그룹이 전부 빠져 이 nav가 완전히 비게 된다 — 그때만 숨긴다.

---

## 5. 한쪽만 있으면(가장 최신 글=다음글 없음 / 가장 오래된 글=이전글 없음)

한쪽만 있으면(가장 최신 글=다음글 없음 / 가장 오래된 글=이전글 없음)
   그 카드 하나가 전체 폭을 쓴다.

---

## 6. "다음 글" 카드는 화살표·정렬을 오른쪽으로 미러링한다 —

"다음 글" 카드는 화살표·정렬을 오른쪽으로 미러링한다 —
   책장을 넘기듯 이전은 왼쪽 바깥, 다음은 오른쪽 바깥을 향한다.

---

## 7. [SPEC 2026-09-06] `.font-preview-card` — 폰트 소개 글의 실사용 미리보기 카드

폰트 아카이브 글(예: 눈누 폰트 소개 시리즈)에서 그 폰트가 실제로 라이브 렌더링된
샘플 문장을 본문에 보여줄 때 쓰는 공용 카드. `@font-face`(폰트마다 다른 웹폰트
CDN URL이라 이것만 글마다 인라인 `<style>`로 따로 넣는다)와 이 클래스(카드 배경/
테두리/여백/글자 크기, 모든 글이 동일)를 분리했다 — 카드 스타일까지 매 글 인라인으로
반복하면 1,000편이 넘는 시리즈에서 유지보수가 불가능해진다.

**배경/글자색은 라이트·다크 토큰이 아니라 고정값이다**(`#0a0a0a` 배경 + 흰색 텍스트,
페이지 테마와 무관하게 항상 동일) — 처음엔 `--color-card`/`--color-card-foreground`
토큰으로 테마에 따라 자동으로 뒤집히게 만들었었는데, 사용자가 실제 라이트모드
스크린샷에서 "텍스트색 흰색 고정"을 요청해 카드 자체를 코드블록처럼 페이지 테마와
독립된 고정 다크 카드로 확정했다.

사용법: `<div class="font-preview-card"><p class="font-preview-text" style="font-family:'{그 글의 실제 font-family}'">{샘플 문장}</p></div>`

---

## 8. [SPEC 2026-09-06] 목록형/썸네일형 토글 제거 — 항상 썸네일형 고정

`[data-slot="content-view-toggle"]` 규칙 삭제 — `skin.html`에서 토글 버튼 마크업 자체를
없애고 `data-view`를 `"thumb"`로 하드코딩했다(`content.js.md` §2026-09-06 참고).
`[data-view="thumb"]`로 스코프된 기존 규칙들은 그대로 두되, 이제 조건부가 아니라
항상 적용되는 유일한 레이아웃이 됐다.

**이 변경이 유발한 실제 회귀(같은 날 발견·수정)**: `[data-slot="post-list"]`는
글 목록(list)일 때도, 단일 글 상세(permalink, `s_permalink_article_rep`)일 때도
똑같이 쓰이는 컨테이너다(`s_article_rep` 반복 태그 하나가 상황에 따라 둘 중
하나만 채운다). 예전엔 `initViewToggle`이 `post-single`이 있으면 아예 실행을
건너뛰어(`if (inner.querySelector('[data-slot="post-single"]')) return;`) 단일
글 페이지의 `data-view`가 사실상 항상 초기값 `"list"`로 남아 문제가 없었는데,
토글을 없애고 `data-view="thumb"`를 무조건 고정하면서 **단일 글 페이지에서도
`post-list`가 3열 그리드가 돼**, 글 본문(`post-single`)이 그리드의 첫 칸(전체
폭의 1/3)에만 눌려 렌더링되는 실제 버그가 났다(실사이트 스크린샷으로 확인 —
대표이미지와 `.font-preview-card` 카드가 폭의 1/3에만 꽉 차 있었음). 3열 그리드
규칙에 `:not(:has([data-slot="post-single"]))`를 추가해 단일 글 페이지에서는
`post-list`가 그리드가 되지 않도록(기본 block 레이아웃으로 돌아가도록) 수정.

## 9. [SPEC 2026-09-07] 같은 패턴의 2차 회귀 — 단일 글 대표이미지가 그리드카드
비율(5:4)로 잘려 나오던 버그

"썸네일이 또 중앙이 아니야" 제보(본고딕/본명조 글) — 실사이트를 직접 열어
`getComputedStyle`/`getBoundingClientRect`로 실측한 결과, 텍스트 위치 자체는
문제가 아니었다. 원인은 §8과 **완전히 같은 패턴**의 명세 충돌: `[data-slot=
"post-thumb"]`이라는 이름이 목록카드용(`post-item-inner` 안)과 단일 글 상세용
(`post-single` 안) 양쪽에 그대로 재사용되는데, 그리드카드 전용 규칙
`[data-slot="content-inner"][data-view="thumb"] [data-slot="post-thumb"]`(속성
선택자 3개, 명시도 0-3-0, `aspect-ratio: 5/4`)이 단일 글 전용 규칙 `[data-slot=
"post-single"] [data-slot="post-thumb"]`(속성 선택자 2개, 명시도 0-2-0, `aspect-
ratio: 16/9`)보다 명시도가 높아 **소스 순서와 무관하게 항상 이겼다** — §8은
`post-list`(컨테이너)에 난 회귀였고 이번은 `post-thumb`(이미지 박스) 자체에
난 회귀라는 차이만 있을 뿐, "`data-view=\"thumb\"`가 상시 켜지면서 목록 전용
규칙이 상세 페이지까지 침범한다"는 근본 원인은 동일하다. 대표이미지가 원본
1200×630(약 1.9:1)인데 5:4(1.25:1) 박스에 `object-fit:cover`로 우겨넣어지며
가로를 크게 잘라내(약 30%) 실제보다 훨씬 좁게 크롭됐고, 제목이 길수록(괄호
포함 영문 표기 등) 크롭 창 밖으로 밀려나 보이는 게 "중앙이 아니다"로 보인
것 — 텍스트 자체를 다시 그릴 필요는 없었다.

**수정**: 단일 글 규칙의 선택자에 `[data-slot="content-inner"]`를 한 겹 더
씌워 명시도를 3(그리드카드 규칙과 동점)으로 맞췄다 — 동점이면 소스 순서상
더 뒤에 있는 규칙(이 규칙이 §def 339번 규칙보다 파일 안에서 뒤에 옴)이
이기므로 이걸로 충분하다. `order: initial`도 함께 명시해 혹시 모를 flex
`order` 상속을 원천 차단.

**재발 방지 원칙(향후 같은 클래스 버그를 막기 위한 점검 습관)**: `data-slot`
이름 하나를 목록뷰/상세뷰 양쪽에서 재사용하는 곳(현재는 `post-thumb`가
유일 — `post-body`/`post-summary`/`post-title`은 상세뷰에서 `post-single-*`로
이름 자체가 다르다)은, 그 이름을 `[data-view="thumb"]`처럼 컨테이너 전역
스코프로 건드리는 규칙을 새로 추가할 때마다 "이 규칙이 상세 페이지에도 걸리는
이름인가?"를 먼저 확인한다 — `grep -n '"post-thumb"'`로 목록/상세 두 데이터슬롯
모두가 걸리는지 눈으로 대조한 뒤, 걸린다면 `:has()`로 상세/목록을 구분해
명시도를 맞추거나 `:not(:has(...))`로 배제한다.

## 10. [SPEC 2026-09-07] `.contents_style` — 티스토리 자체 플랫폼 CSS가 본문
`word-break: keep-all`을 덮어쓰던 문제

"content.css에 .contents_style때문에 적용안됨" 제보로 실사이트 DOM을 직접
열어 확인 — 티스토리는 저장된 글 본문을 그대로 `[##_article_rep_desc_##]`
자리에 꽂는 게 아니라, 그 바깥을 `<div class="tt_article_useless_p_margin
contents_style">`로 한 번 더 감싼다(이 프로젝트가 작성한 마크업이 아니라
티스토리 렌더러가 저장 시점에 자동으로 씌우는 래퍼 — `skin.html`/`components/`
어디에도 이 클래스가 없는 이유). 이 wrapper는 우리 스킨과 별개로 티스토리
플랫폼 자체 스타일시트(`tistory_admin/userblog/.../static/style/content.css`,
우리 프로젝트의 동명 파일과는 완전히 다른 파일 — 실제로 fetch해 원문 확인)를
싣고 있고, 그 507번째 줄 근처에 `.contents_style { word-break: break-word; }`
/ `.contents_style table td { word-break: break-word; }`가 박혀 있다.

`word-break`는 상속 속성이라 `[data-slot="post-single-body"]`(§본문 컨테이너)
에 건 `keep-all`이 원래는 자손까지 내려가야 하지만, 이 wrapper 자신에게
**직접** `break-word`가 선언돼 있으면 상속값보다 그 직접 선언이 항상 이긴다
— 그래서 컨테이너 규칙은 살아있는데도 실제 본문 텍스트는 계속 break-word로
렌더되고 있었다. `.contents_style`은 로드 순서상 우리 `style.css`보다 먼저
오지만(티스토리 자체 리소스가 head 상단에 먼저 걸림), 순서가 어느 쪽이든
명시도로 이기면 그만이라 순서 자체는 손대지 않았다.

**수정**: `[data-slot="post-single-body"] .contents_style`(속성선택자+클래스,
명시도 0-2-0)로 티스토리의 `.contents_style`(클래스 단독, 명시도 0-1-0)보다
한 단 높여 덮어썼다. 표 셀도 같은 이유로 `.contents_style table td`(명시도
0-1-2)가 있어 `[data-slot="post-single-body"] .contents_style table td`
(명시도 0-2-2)로 함께 덮었다. `pre`/`code`는 원래도 자기 자신에 직접
`word-break: normal`을 선언해 두고 있어(상속이 아니라 직접 선언이라) 이번
wrapper 규칙과 무관하게 그대로 유지된다.

## 11. [SPEC 2026-09-07] `.tt_article_useless_p_margin p` — 티스토리 자체
`!important`가 문단 세로 리듬을 전부 뭉개던 문제

§10 wrapper(`.contents_style`)를 감싸는 바깥 div가 실제로는 두 클래스를
같이 갖고 있다: `class="tt_article_useless_p_margin contents_style"`.
"가독성이 안좋아보임" 제보로 실사이트 `<p>`의 `getComputedStyle`을 직접
찍어보니 모든 문단이 `margin-top: 0px` / `margin-bottom: 0px` — 우리가
`:is(p,ul,ol,dl) { margin-top: calc(var(--spacing) * 4) }`로 준 문단 사이
여백이 전혀 적용되지 않고 있었다. 원인은 티스토리 자체 CSS(§10과 같은
`tistory_admin/userblog/.../static/style/uselessPMargin.css`)의

```css
.tt_article_useless_p_margin p {
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}
```

`!important`는 명시도·소스 순서와 무관하게 일반 선언(인라인 `style=""`
속성 포함)을 전부 이긴다 — 그래서 이 규칙은 `p` 태그 하나에만 걸리는데도
(`ul`/`ol`/`blockquote`/`pre`/`h1~h6`는 영향 없음) 본문 텍스트의 대부분을
차지하는 문단 간격을 통째로 없애버렸다. `!important` 없는 일반 CSS로는
절대 못 이기므로, 우리 쪽도 `!important`를 건 규칙만 이 값을 되돌릴 수
있다(두 `!important`가 부딪히면 그다음엔 명시도 → 소스 순서로 승부).

**수정**: `:is(p,ul,ol,dl)`의 `margin-top`, `:is(h1~h6) + *`의 이어지는
`margin-top`, `> :first-child`류의 `margin-top: 0` 세 규칙에 `!important`를
추가했다(margin-bottom은 이미 값이 0으로 같아 손대지 않음 — 다르게
바꿀 계획이 생기면 그때 같이 `!important`를 붙인다). `.contents_style p`처럼
클래스를 더 특정해 명시도를 올리는 방식도 가능했지만, 이 값들은 원래도
`[data-slot="post-single-body"]` 스코프 밖에서 쓰일 일이 없어 굳이 선택자를
늘리지 않고 `!important`만 추가하는 쪽을 택했다.

**부작용— 인라인 스타일로 문단 여백을 준 곳은 이 수정으로도 못 이긴다**:
`!important`는 인라인 `style=""`보다도 강해서, 개별 글 본문(예: Ruflo
글의 카드 레이아웃)에서 `<p style="margin:...">`로 준 값은 스킨을 고쳐도
여전히 티스토리 규칙에 밀린다 — 그런 글은 마진이 필요한 요소를 `<p>`
대신 `<div>`로 쓰는 방법으로 개별 대응해야 한다(`.tt_article_useless_p_margin
p` 선택자가 태그를 `p`로 못 박고 있어 `div`는 애초에 안 걸림).

## 12. [SPEC 2026-09-07] `post-list` 그리드 열 수 반응형이 항상 3열로
고정돼 있던 버그 — §9와 같은 명시도 계열 회귀의 세 번째 사례

"반응형때 리스트 1열" 제보로 실측: 모바일(390px)에서도 글 목록 카드가
3열(108px짜리)로 눌려 있었다. 태블릿 2열(≤1023px)·모바일 1열(≤639px)
전환 규칙 자체는 이미 있었다(§371~381) — 문제는 이 override들이 기본
3열 규칙보다 명시도가 낮았던 것.

```css
/* 기본(§318) — :not(:has(...))가 명시도를 하나 더 얹는다 */
[data-slot="content-inner"][data-view="thumb"] [data-slot="post-list"]:not(:has([data-slot="post-single"])) {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

/* override(수정 전) — :not(:has(...))가 없어 명시도가 더 낮다 */
@media (max-width: 639px) {
  [data-slot="content-inner"][data-view="thumb"] [data-slot="post-list"] {
    grid-template-columns: minmax(0, 1fr);
  }
}
```

미디어 쿼리는 캐스케이드 순서에 아무 영향을 주지 않는다 — 매치되기만
하면 그 안의 규칙은 명시도·소스 순서 경쟁에 그대로 들어간다. 여기선
`:not(:has([data-slot="post-single"]))`(속성 선택자 1개 취급, §9와 동일한
계산)만큼 기본 규칙이 더 높아서, 뷰포트가 아무리 좁아져도 override가
한 번도 이긴 적이 없었다 — 태블릿·모바일 규칙 자체가 처음부터 죽어있던
셈. `!important`나 소스 순서 재배치가 아니라, override 두 곳에 똑같이
`:not(:has([data-slot="post-single"]))`를 붙여 명시도를 맞추는 쪽을
택했다(§9의 교훈과 동일 — 명시도를 억지로 낮추기보다 회귀가 난 쪽을
맞춰준다). 명시도가 같아지면 소스 순서(미디어 쿼리 블록이 기본 규칙보다
뒤에 온다)가 정상적으로 개입해 좁은 뷰포트에서 override가 이긴다.

**교훈**: 기본 규칙에 `:not(:has(...))` 같은 명시도를 더하는 선택자를
쓸 때는, 그 선택자를 좁히는 모든 반응형/상태 override에도 동일한
접미사를 붙여야 한다 — 안 그러면 미디어 쿼리 자체는 정확히 매치되는데
규칙만 조용히 죽어있는, 콘솔에 아무 에러도 안 남는 버그가 생긴다.

