# Content(글 목록) 비주얼 스펙 — `[data-slot="content-inner"]` (PC / 100vw)

- **대상 구역:** 요구사항 문서 3번 "Content(목록/본문)" — `dashboard-skin/skin.html`의 `[data-slot="content-inner"]` 안쪽 전체
- **근거 문서:** `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md`
- **형식 준거:** `_workspace/sidebar_designer-spec.md`(§2 색상 형식 = hex 확정, §3 매핑표 형식), `_workspace/right-widgets_designer-spec.md`(§ 확인 필요 형식)
- **범위:** PC 레이아웃만. 반응형은 §15-Q9에 방향만 기록한다.
- **성격:** 이 구역은 **shadcn 정본 컴포넌트 포팅이 아니다.** 사용자가 제시한 그리드 배경 스크린샷을 이 프로젝트 톤으로 재해석하는 커스텀 디자인이다. 따라서 "shadcn 원본 구조 인용" 대신 **Tistory 공식 치환자 실측**(§0-2)과 **기존 프리미티브 재사용 판정**(§6-1)이 그 자리를 대신한다.

> **2026-09-04 개정 이력** — 사용자 결정으로 두 곳이 확정되어 반영했다.
> - **Q1 → "해당 부분에 overflow auto"**: 초판 §2의 "셸 전체를 뷰포트에 잠그는 A안"(`body`/`sidebar.css` 수정)을 **폐기**하고, 우측 위젯 패널이 이미 검증해 둔 **컨테이너 자체 `max-height`(svh) + `overflow-y:auto`** 방식으로 교체했다. **셸 파일은 하나도 건드리지 않는다.** → §2 전면 교체, §3 / §13-6 / §14 / §15-Q1 연동 수정.
> - **Q2 → 워터마크 생략 확정**: 격자선 + 교차점 점 마커만 채택. 관련 마크업·CSS·색상 토큰·타이포·접근성 항목을 전부 정리했다. → §4-5 / §10-2 / §11-1 / §12-1 / §15-Q2.

---

## 0. 실측 출처와 조회 실패 고지

### 0-1. ⚠ Design-system(`D:\MyCloud\2026포트폴리오\Design-system`) 조회 실패

이 세션의 실행 환경에서 **`D:\MyCloud` 경로가 존재하지 않는다**(`Glob`/`Grep` 모두 "Directory does not exist"). 따라서 이번 스펙은 Design-system을 직접 재실측하지 못했다.

**그럼에도 이 스펙이 "추측 금지" 원칙을 지킬 수 있는 이유 — 색상은 새 raw 토큰이 하나도 필요 없기 때문이다.** §10 매핑표의 모든 값은 이미 `dashboard-skin/src/input.css`에 실측·확정돼 들어 있는 토큰(`--color-border`, `--color-muted-foreground`, `--color-foreground`, `--color-muted`, `--color-accent`, `--color-background`)이거나 그것들의 `color-mix()` 파생값이다. 요구사항 문서가 "아직 없다"고 적어둔 `--secondary` / `--destructive` / `--popover` / `--sys-*` **어느 것도 이 구역에 필요하지 않다**(§10-4에 사유).

**실측이 필요했던 단 하나의 외부 값**(큰 제목용 `--text-2xl`)은 Design-system 대신 **이 프로젝트 안에 실제로 설치된 Tailwind v4 패키지**에서 직접 읽었다:

| 값 | 출처(실측) |
|---|---|
| `--text-lg: 1.125rem` | `node_modules/tailwindcss/theme.css` **353행** |
| `--text-xl: 1.25rem` | 같은 파일 **355행** |
| `--text-2xl: 1.5rem` | 같은 파일 **357행** |
| `--leading-relaxed: 1.625` | 같은 파일 **394행** |

기존 `--text-xs/sm/base`(0.75 / 0.875 / 1rem)가 이 파일의 값과 문자 단위로 일치하므로(같은 Tailwind v4 기본 스케일), 같은 파일에서 이어받는 것이 Design-system을 재실측하는 것과 동일한 결과를 준다. → 다만 **자간 토큰만은 확장하지 않는다**(§11-2 사유).

### 0-2. Tistory 공식 스킨 가이드 실측 (2026-09-04 WebFetch)

이번 구역은 shadcn이 아니라 Tistory 치환자가 근거다. 아래는 이번에 **실제로 읽어 확인한** 내용이며, 그 결과 **현재 `skin.html` 마크업에서 오류/누락을 발견**했다.

**(a) `list/list.html` — `<s_list>`는 "빈 상태 래퍼"가 아니다**

현재 skin.html은 `<s_list>` 안에 `<s_list_empty>`만 넣어 두어 사실상 "빈 상태 전용 블록"처럼 쓰고 있지만, 공식 문서상 `<s_list>`는 **검색/카테고리/태그 목록 페이지의 목록 블록 전체**다. 공식 예제 원문:

```html
<s_list>
  <div class="searchList [##_list_style_##]">
    <div <s_list_image>style="background-image:url('[##_list_image_##]')"</s_list_image>>
      <h3>'[##_list_conform_##]'에 해당되는 글 [##_list_count_##]건</h3>
      <p>[##_list_description_##]</p>
    </div>
    <ol>
      <s_list_rep>
        <li>
          <span class="date">[##_list_rep_regdate_##]</span>
          <a href="[##_list_rep_link_##]">[##_list_rep_title_##]</a>
          <span class="cnt">[##_list_rep_rp_cnt_##]</span>
          <s_list_rep_thumbnail><img src="[##_list_rep_thumbnail_##]"></s_list_rep_thumbnail>
        </li>
      </s_list_rep>
    </ol>
  </div>
</s_list>
```

- 하위 블록: `<s_list>` / `<s_list_image>` / `<s_list_empty>` / `<s_list_rep>` / `<s_list_rep_thumbnail>`
- 목록 레벨 치환자: `[##_list_conform_##]`(검색어·카테고리명) / `[##_list_count_##]`(총 글 수) / `[##_list_description_##]` / `[##_list_style_##]` / `[##_list_image_##]`
- 항목 레벨: `[##_list_rep_link_##]` / `_title_` / `_title_text_` / `_regdate_` / `_category_` / `_category_link_` / `_rp_cnt_` / `_author_` / `_summary_` / `_thumbnail_` / `_thumbnail_url_`

→ **이번 스펙은 `<s_list_rep>` 계열을 채택하지 않는다**(§13-1에 사유). `<s_list>`는 지금처럼 **빈 상태 전달 통로로만** 유지한다. 다만 "`<s_list>` = 빈 상태"라는 오해가 코드에 남지 않도록 developer는 skin.html에 주석으로 이 사실을 남긴다.

**(b) `contents/post.html` — 현재 마크업이 놓치고 있는 치환자 3종**

`<s_article_rep>` / `<s_index_article_rep>`("인덱스 페이지일 때만") / `<s_permalink_article_rep>`("permalink 페이지일 때만") 구조는 현재 마크업과 일치한다 ✅. 추가로 확인된 것:

- `<s_article_rep_thumbnail>` — 대표 이미지가 있을 때만 렌더되는 **조건부 블록**, `[##_article_rep_thumbnail_url_##]` / `[##_article_rep_thumbnail_raw_url_##]`
- `<s_rp_count>` + `[##_article_rep_rp_cnt_##]` — 댓글 수
- `[##_article_rep_category_link_##]` — 카테고리 링크 URL (현재는 `[##_article_rep_category_##]` 텍스트만 쓰고 링크를 안 걸고 있음)

**(c) `list/paging.html` — 현재 페이징 마크업이 공식 형식과 다르다 ⚠**

공식 예제 원문:

```html
<s_paging>
  <div class="paging">
    <a [##_prev_page_##] class="[##_no_more_prev_##]">◀ PREV </a>
    <span class="numbox">
      <s_paging_rep>
        <a [##_paging_rep_link_##] class="num">[[##_paging_rep_link_num_##]]</a>
      </s_paging_rep>
    </span>
    <a [##_next_page_##] class="[##_no_more_next_##]">NEXT ▶</a>
  </div>
</s_paging>
```

- **`[##_paging_rep_link_##]`는 `href` 값이 아니라 `href="…"` 속성 전체를 내려준다** — 공식 예제가 `<a [##_paging_rep_link_##]>`로 쓴다. 현재 skin.html의 `<a href="[##_paging_rep_link_##]">`는 이 형식과 다르다. → developer는 공식 형식으로 교체하고 실사이트에서 확인할 것(§15-Q8).
- `[##_prev_page_##]` / `[##_next_page_##]`(이전·다음 링크 속성), `[##_no_more_prev_##]` / `[##_no_more_next_##]`(더 이상 없을 때 부여되는 **클래스명**)가 있다 — 현재 마크업엔 이전/다음이 아예 없다.
- **"현재 페이지"를 표시하는 치환자·조건 블록이 없다.** → 서버 마크업만으로는 현재 페이지 강조가 불가능하다. 대응은 §8-3.

**(d) `common/global.html` — `[##_page_title_##]` = "현재 페이지 제목"** ✅ (§5-1에서 채택 근거로 사용)

---

## 1. 현재 마크업 → 확정 마크업

### 1-1. 현재 (스타일 없음, placeholder)

```html
<div data-slot="content-inner">
  [##_revenue_list_upper_##]
  <s_list><s_list_empty><p>글이 없습니다.</p></s_list_empty></s_list>
  <s_article_rep>
    <s_index_article_rep><article>…</article></s_index_article_rep>
    <s_permalink_article_rep><article>…</article></s_permalink_article_rep>
  </s_article_rep>
  <s_paging><nav><s_paging_rep>…</s_paging_rep></nav></s_paging>
  [##_revenue_list_lower_##]
</div>
```

### 1-2. 확정 구조

```
[data-slot="content-inner"]            ← 독립 스크롤 컨테이너
                                         width:100% + max-height(svh) + overflow-y:auto + padding
├ [##_revenue_list_upper_##]           ★ 그리드 래퍼 '바깥'
├ [data-slot="content-grid"]           ← 그리드 배경을 그리는 유일한 요소. position:relative
│  ├ [data-slot="content-title"]       ← 타이틀영역. 높이 = 정확히 1 그리드 행
│  │   ├ [data-slot="content-title-text"]  (h1)
│  │   └ [data-slot="content-title-desc"]  (p)
│  ├ <s_list><s_list_empty>
│  │   └ [data-slot="post-empty"]      ← 빈 상태. 높이 = 정확히 2 그리드 행
│  ├ [data-slot="post-list"]
│  │   └ <s_article_rep>
│  │      ├ <s_index_article_rep> → [data-slot="post-item"]   ← 높이 = 정확히 1 그리드 행
│  │      │     ├ [data-slot="post-meta"]    (카테고리 · 날짜)
│  │      │     ├ [data-slot="post-title"]   (h2 > a, 스트레치 링크)
│  │      │     └ [data-slot="post-summary"]
│  │      └ <s_permalink_article_rep> → [data-slot="post-single"]
│  └ <s_paging> → [data-slot="pagination"]   ← 높이 = 정확히 1 그리드 행
└ [##_revenue_list_lower_##]           ★ 그리드 래퍼 '바깥'
```

**★ 광고 치환자 2개를 그리드 래퍼 바깥에 두는 이유 (필수):** `[##_revenue_list_*_##]`가 내려주는 광고는 높이를 우리가 통제할 수 없다. 그리드 래퍼 **안**에 있으면 임의 높이가 끼어들어 그 아래 모든 카드 경계가 배경 가로선에서 어긋난다(§4-2의 정합 전제가 깨짐). 밖에 두면 광고가 어떤 높이든 그리드 리듬에 영향이 없다.

**왜 그리드 배경을 `content-inner`가 아니라 안쪽 래퍼(`content-grid`)가 그리는가 (필수):** `content-inner`는 스크롤 컨테이너다. 스크롤 컨테이너에 배경을 그리면 기본값 `background-attachment: scroll`이 배경을 **엘리먼트 박스에 고정**해 콘텐츠만 스크롤되고 격자는 제자리에 남는다 → 스크롤한 순간 가로선과 카드 경계가 어긋난다. `background-attachment: local`로 우회할 수도 있지만, `local`에서 배경 위치영역이 패딩 박스인지 스크롤 오버플로 영역인지가 구현별로 갈리고 `background-size`의 `%` 해석이 함께 흔들린다. **스크롤되는 내용물 자신(`content-grid`)에 평범한 배경을 그리면 이 모호함이 통째로 사라진다** — 배경이 콘텐츠와 같은 박스에 붙어 항상 함께 움직인다.

---

## 2. 스크롤 모델 — 위젯 패널과 동일한 "독립 스크롤 컨테이너" (셸 무변경) ✅ 2026-09-04 확정

### 2-1. 채택 방식

요청의 `커스텀스크롤`은 "content-inner가 자기 스크롤을 갖는다"는 뜻이다. 그런데 이 스킨에는 **그것을 이미 성립시켜 검증까지 끝낸 패턴이 있다** — 우측 위젯 패널이다(`widgets.css` 54~83행).

```css
[data-slot="widgets"] {
  --widgets-top: calc(var(--spacing) * 14);          /* 56px = 헤더 높이 */
  position: sticky;
  top: var(--widgets-top);
  max-height: calc(100svh - var(--widgets-top));
  overflow-y: auto;
}
```

**이 패턴을 그대로 가져온다.**

```css
[data-slot="content-inner"] {
  max-height: calc(100svh - var(--header-height));   /* 100svh − 56px */
  overflow-y: auto;
  /* position: sticky; top: var(--header-height);  ← §2-3의 실측 결과에 따라 필요할 때만 */
}
```

### 2-2. 왜 이것이 "셸 전체를 뷰포트에 잠그는 방식"보다 나은가

초판은 `height: 100%`를 리터럴로 살리려고 `body`를 flex column으로 만들고 `sidebar-wrapper`/`sidebar-inset`의 높이 체인을 재구성하는 A안을 제시했었다. 그 방식은 **부모 체인의 높이가 확정돼야 `height: 100%`가 유효해진다**는 CSS 제약 때문에 셸 파일 3개(`input.css` / `sidebar.css` ×2곳)를 고쳐야 했고, 그 대가로 헤더·위젯 패널의 `position: sticky`가 무의미해지고 티스토리 관리 메뉴바 주입에 대한 방어 로직까지 새로 필요했다.

**`max-height`를 뷰포트 단위(`svh`)로 주면 그 문제 자체가 발생하지 않는다.** `svh`는 부모가 아니라 뷰포트를 기준으로 하므로, `content-layout` / `sidebar-inset` / `sidebar-wrapper` / `body` 어느 것도 높이가 확정될 필요가 없다. `overflow-y: auto`와 짝지어지는 순간 이 요소는 **스스로 완결된 스크롤 컨테이너**가 된다.

그 결과:

- **셸 파일(`body`, `sidebar-wrapper`, `sidebar-inset`)을 하나도 건드리지 않는다.** 이미 검증이 끝난 두 구역(sidebar/header)의 레이아웃 모델을 되짚을 이유가 사라진다.
- **헤더와 위젯 패널의 `position: sticky`가 지금 그대로 유효하게 계속 동작한다.** 초판이 감수하려 했던 "무의미해지지만 무해" 같은 타협이 필요 없다.
- **content-inner와 widgets가 각자 독립적으로 자기 높이를 `svh` 기준으로 제한하므로, `content-layout`이 뷰포트를 넘어서는 상황 자체가 구조적으로 발생하지 않는다** — 두 자식 모두 `max-height: 100svh − 56px` 이하이고 부모는 `align-items: flex-start`라 둘 중 큰 쪽 높이를 따르므로, `content-layout ≤ 100svh − 56` → `sidebar-inset ≤ 56 + (100svh − 56) = 100svh`가 된다. 즉 문서 레벨 스크롤이 애초에 생기지 않는다.
- **`height: 100%`(요청 문언)의 의도는 그대로 달성된다.** "본문 영역이 뷰포트 높이를 채우고 그 안에서 스크롤된다"가 요청의 실질이며, `max-height: calc(100svh − 56px)`가 정확히 그것이다. 리터럴 `height: 100%`는 **부모 높이가 불확정이라 조용히 `auto`로 계산되어 아무 일도 하지 않으므로** 오히려 쓰면 안 되는 선언이다(§3에 재기술).

### 2-3. `position: sticky`가 필요한가 — **developer가 실측해서 판정**

위 계산대로라면 문서 스크롤이 없으므로 sticky는 불필요하다. 다만 다음 두 경우에 문서가 조금 스크롤될 수 있다:

- 티스토리가 로그인한 소유자에게 **관리 메뉴바를 body에 주입**할 때(sidebar 구역 2026-09-03 작업에서 확인된 사실)
- `[##_revenue_list_upper_##]` 광고가 `content-inner` **안**에 들어 있으므로 문서 높이엔 영향이 없지만, 티스토리가 셸 바깥에 별도 광고 컨테이너를 주입할 때

그때 `content-inner`가 화면 위로 밀려 올라가는 것을 막으려면 위젯 패널과 똑같이 `position: sticky; top: var(--header-height)`를 주면 된다.

→ **developer 지시:** Playwright로 `document.scrollingElement.scrollHeight > window.innerHeight`인지 먼저 확인하고, **참일 때만** sticky를 추가한다. 거짓이면 추가하지 않는다(불필요한 스택 컨텍스트/포지셔닝을 만들지 않는다). 판정 결과를 검증 문서에 반드시 기록할 것.

### 2-4. `--widgets-top` 재사용 판단 — **`--header-height`로 승격한다**

★ **그냥 `var(--widgets-top)`을 쓰면 동작하지 않는다.** 이 변수는 `[data-slot="widgets"] { … }` **안에서 선언된 스코프 변수**라(widgets.css 56행) 그 요소와 그 자손에게만 상속된다. `content-inner`는 위젯 패널의 **형제**이므로 `var(--widgets-top)`이 정의되지 않은 상태가 되고, `max-height: calc(100svh - var(--widgets-top))`는 **guaranteed-invalid** 로 계산돼 선언이 통째로 무시된다 → `max-height: none` → 스크롤 컨테이너가 성립하지 않는다. **조용히 실패하는 종류의 버그**라 반드시 짚어야 한다.

**결정: `src/input.css`의 `@theme static`에 `--header-height: calc(var(--spacing) * 14)`를 신설한다.**

- 56px은 이미 **세 곳**이 각자 적고 있는 셸 상수다 — `sidebar-header` 높이(sidebar.css), 헤더 높이(header.css 296행), `--widgets-top`(widgets.css 56행). 여기에 네 번째로 복붙하면 드리프트가 생긴다. 이 값은 sidebar 스펙 §8-Q3에서 "사이드바 브랜드 행과 본문 헤더의 밑선이 한 줄로 맞아야 한다"는 이유로 **의도적으로 묶어 확정한 값**이므로, 단일 토큰으로 올리는 것이 원래 의도에 부합한다.
- 이것은 §2-2에서 폐기한 "셸 레이아웃 변경"이 아니다. **레이아웃 선언은 한 줄도 바뀌지 않고 토큰 하나만 추가**되며, `--text-2xl` 등을 추가하느라 어차피 `@theme static`은 손대게 된다.
- 기존 파일 정리는 **선택 사항**(동작 동일): `widgets.css` 56행 `--widgets-top: calc(var(--spacing)*14)` → `var(--header-height)`, `header.css` 296행 `height` → `var(--header-height)`. 회귀 위험을 피하고 싶으면 그대로 둬도 무방하며, 그 경우에도 content 구역은 새 토큰만 쓴다.

### 2-5. 이 방식에서도 그대로 유지되는 결론

| | 결론 |
|---|---|
| 스크롤 주체 | 문서(html) + 사이드바 + 위젯 패널 + **content-inner** (4개, 각자 독립) |
| 헤더 `sticky` | **그대로 유효** ✅ |
| 위젯 패널 `sticky` + `max-height` | **그대로 유효, 무변경** ✅ |
| 커스텀 스크롤바 / `scroll-fade-y` / Lenis | **위젯 패널과 완전히 동일하게 적용**(§3-1) — 초판 결론 그대로 |
| 셸 파일 수정 | **없음** (`--header-height` 토큰 1개 추가 제외) |

---

## 3. `content-inner` 컨테이너 스펙

```css
[data-slot="content-inner"] {
  /* 뷰포트 기준 높이 — 자식(content-grid)도 이 값을 상속받아 쓴다 */
  --content-viewport-height: calc(100svh - var(--header-height));   /* = 100svh − 56px */

  /* ── 요청 문언 ── */
  width: 100%;

  /* ── 독립 스크롤 컨테이너 (§2) ── */
  max-height: var(--content-viewport-height);
  overflow-y: auto;
  overflow-x: hidden;   /* widgets.css 76~81행과 동일한 이유 — 한쪽만 auto면 나머지도 auto가 된다 */

  /* ── 기존 폭 계약 유지 (widgets.css 41~44행) ── */
  flex: 1 1 auto;
  min-width: 0;

  /* ── 패딩 ── */
  padding: calc(var(--spacing) * 6);   /* 24px */
}
```

- **`height: 100%`를 쓰지 않는 이유(요청 문언과 다른 유일한 지점):** 부모(`content-layout`)의 높이가 확정돼 있지 않아 `height: 100%`는 CSS 규칙상 `auto`로 계산된다 — **선언해도 아무 일도 일어나지 않고**, 그것을 유효하게 만들려면 셸 파일 3곳을 고쳐야 한다(§2-2에서 폐기한 A안). 요청의 실질("본문이 뷰포트 높이를 채우고 그 안에서 스크롤된다")은 `max-height: calc(100svh − 56px)` + `overflow-y: auto`가 정확히 달성한다. **`width: 100%`는 요청 문언 그대로 유지한다.**
- **`width: 100%`가 안전한 이유:** flex 아이템에서 `width`는 flex 기준 크기가 되고, 이어서 `flex-shrink: 1`이 남는 공간에 맞춰 줄인다. 형제인 위젯 패널은 `flex-shrink: 0`(widgets.css 72행)이라 절대 줄지 않으므로, content-inner가 정확히 `(가용폭 − 320px)`로 수렴한다. 요청 문언을 리터럴로 지켜도 레이아웃이 깨지지 않는다.
- **패딩 24px 근거:** 헤더 내부 패딩 16px(`header.css` 318행)·위젯 패널 패딩 16px보다 한 단계 넓게 잡아 "본문 캔버스"라는 위계를 만든다. 우측 하단 FAB의 화면 여백(24px, `sidebar` 2026-09-02 b항)과 같은 값이라 셸 전체의 바깥 여백 리듬이 24px로 통일된다.
- **FAB(테마 토글) 회피 패딩은 불필요하다.** FAB는 화면 우측 하단 = **위젯 패널 위**에 뜨고 그 패널이 이미 `padding-bottom: 64px`로 회피 중이다. 단 §15-Q9의 반응형에서 위젯 패널을 숨기면 그때는 content-inner가 FAB와 겹치므로 그 시점에 재검토할 것.
- **PC 실측 폭(그리드 칸 폭 계산의 근거):**

  | 뷰포트 | 사이드바(+border) | 위젯 패널 | content-inner 폭 | 패딩 뺀 그리드 폭 | 6칸 기준 1칸 |
  |---|---|---|---|---|---|
  | 1280 | 257 | 320 | 703 | 655 | 109.2px |
  | 1440 | 257 | 320 | 863 | 815 | 135.8px |
  | 1920 | 257 | 320 | 1343 | 1295 | 215.8px |
  | 1440(사이드바 접힘) | 49 | 320 | 1071 | 1023 | 170.5px |

### 3-1. 커스텀 스크롤 — **위젯 패널과 완전히 동일한 처리(새로 설계하지 않는다)**

요구사항 문서 4번 항목에 이미 완성·검증된 3층 구성을 **그대로** 가져온다:

| 층 | 무엇 | 이번 구역에서 할 일 |
|---|---|---|
| ① Lenis 스무스 스크롤 | `smooth-scroll.js`의 `initSmoothScroll({wrapper: el, content: el})` | **인스턴스 1개 추가**(4번째 컨테이너). 마크업에 `data-lenis-prevent` 필수 — 없으면 문서 Lenis가 휠을 가로채 이 영역 대신 문서가 스크롤된다(2026-09-03에 위젯 패널에서 실제로 재현된 버그) |
| ② `scroll-fade-y` 상하 페이드 | `src/input.css`의 shadcn 공식 유틸리티(정의 완료, JS 없음) | **`skin.html`에 `class="scroll-fade-y"`를 리터럴 문자열로** 추가. JS로 붙이면 Tailwind CLI의 `@source` 스캔이 못 찾아 유틸리티가 생성되지 않는다(2026-09-04에 기록된 함정) |
| ③ 3초 idle 커스텀 스크롤바 페이드 | `widgets.css` §8 + `smooth-scroll.js`의 `initScrollbarAutoHide` | **CSS를 공용 파일로 추출**(아래) + JS 대상 확대 |

**③ 추출 권고 — `components/scrollbar.css` 신규.** `widgets.css` §8(370~417행)은 전부 `[data-slot="widgets"]` 스코프다. 이 구역이 같은 것을 쓰기 시작하는 순간, 이 프로젝트가 이미 두 번 적용한 규칙("다른 구역이 쓰기 시작하면 프리미티브로 추출한다" — Button/Breadcrumb → `tooltip.css` 추출 선례)에 정확히 해당한다.

- 셀렉터를 `[data-slot="widgets"]` → **`[data-custom-scrollbar]`** boolean 속성으로 교체한다. `data-slot` 값에 넣지 않는 이유는 sidebar 2026-09-03 작업에서 확정된 관례와 같다(`data-lenis-prevent`, `data-floating-theme-toggle`, `data-sidebar-header-action`이 전부 이 형태).
- 값·전환·`prefers-reduced-motion` 블록은 **한 글자도 바꾸지 않는다**(thumb 라이트 `#d4d4d4` / 다크 `#3f3f46`, 트랙 transparent, `scrollbar-color` transition 1s, `--scrollbar-thumb-opacity` 0%↔100%).
- `smooth-scroll.js`의 `initScrollbarAutoHide(widgets, widgetsLenis)` 하드코딩을 **`[data-custom-scrollbar]` 전체 순회**로 일반화한다(각 요소의 Lenis 인스턴스를 함께 넘긴다).
- `smooth-scroll.css`(네이티브 스크롤바 숨김)는 **손대지 않는다** — 대상이 `html`과 `[data-slot="sidebar-content"]`뿐이라 content-inner는 자동으로 커스텀 스크롤바 쪽으로 간다 ✅.

**알아둘 부작용 1건(수용):** `scroll-fade-y`의 마스크는 엘리먼트 전체에 걸리므로 **그리드 배경도 상·하단에서 함께 페이드된다.** 이것은 결함이 아니라 오히려 의도에 맞는다(격자가 스크롤 가장자리에서 사라지는 편이 잘린 선보다 낫다). 위젯 패널에서도 같은 성격의 부작용을 이미 수용한 바 있다.

**주의 — 재확인이 필요한 기록 1건:** 요구사항 문서 4번에 "콘텐츠가 훨씬 길어져 `clientHeight/scrollHeight` 비율이 0.15 이하로 떨어지면 스크롤바 썸 상단 몇 px이 `scroll-fade`에 걸릴 수 있어 **content 구역 이후 재확인 필요**"라고 적혀 있다. 글 목록은 위젯 패널보다 훨씬 길어질 수 있으므로 developer가 이번에 반드시 실측할 것(§14-2).

---

## 4. 그리드 배경 시스템

### 4-1. 재해석 원칙 (레퍼런스를 그대로 베끼지 않는다)

| 레퍼런스(스크린샷) | 이 프로젝트 |
|---|---|
| 다크 전용, 거의 검정 배경 | **라이트/다크 양쪽에서 동작** — 선·점 색을 전부 `--color-border` / `--color-muted-foreground` 파생으로 매핑(§10) |
| 화면 전체를 덮는 히어로 배경 | `content-inner`의 **본문 캔버스 안**(패딩 24px 안쪽)으로 한정. 사이드바·헤더·위젯 패널에는 침범하지 않는다 |
| 세로 7~8칸 / 가로 3~4칸 | 세로 **6칸**(§4-2 근거) / 가로는 칸 수가 아니라 **고정 행 높이 160px의 무한 반복**(글 개수만큼 늘어나야 하므로) |
| `[AslanX]` / `NARNIA LABS` 워터마크 | **채택하지 않는다 — 생략 확정**(§4-5, 사용자 결정 2026-09-04) |
| 큰 히어로 헤드라인 2줄 | 목록 페이지의 **타이틀영역**으로 축소 재해석(§5) — 히어로가 아니라 대시보드 페이지 제목 |
| 격자가 순수 장식 | 격자가 **레이아웃의 실제 기준**이 된다 — 카드 경계가 가로선 위에, 카드 내부 요소가 세로선 위에 정확히 얹힌다(요청 "리스트는 배경그리드의 그리드영역에 맞게 배치") |

### 4-2. 기하 — 왜 %-컬럼 + 고정 px 행인가

```css
[data-slot="content-inner"] {
  --content-grid-columns: 6;                       /* ★ 반드시 짝수 (§4-3 경고) */
  --content-grid-row: calc(var(--spacing) * 40);   /* 160px */
  --content-grid-dot-r: calc(var(--spacing) * 0.375); /* 1.5px */
}
```

**세로선은 퍼센트(1/6), 가로선은 고정 px인 이유:**

- **세로 — 반드시 퍼센트여야 한다.** 요청의 "리스트는 배경그리드의 그리드영역에 맞게 배치"를 만족하려면 카드의 좌/우 경계와 내부 컬럼 경계가 배경 세로선과 **정확히** 일치해야 한다. 고정 px 칸(예: 96px)을 쓰면 캔버스 폭이 96의 배수가 아닐 때 오른쪽 끝이 항상 어긋난다(캔버스 폭은 뷰포트에 따라 655/815/1295…로 임의값). 반면 `background-size: calc(100% / 6)`는 CSS Grid의 `repeat(6, minmax(0,1fr))`와 **정의상 동일한 분할**이므로 어떤 폭에서도 오차 0이다.
- **가로 — 반드시 고정 px여야 한다.** 행은 글 개수만큼 무한히 반복돼야 하므로 퍼센트가 성립하지 않는다. 고정 160px로 두고 **타이틀영역·카드·빈 상태·페이징의 높이를 전부 이 값의 정수배로 고정**하면 몇 개가 오든 모든 경계가 가로선 위에 얹힌다.

**칸 수 6 근거:** 레퍼런스는 화면 전체에 7~8칸이지만 이 캔버스는 화면의 약 55%(1280px에서 703/1280)다. 비례하면 4~5칸이고, 카드 내부를 컬럼 단위로 나누려면 최소 6칸이 필요하다(§6-4에서 제목 5칸 / 요약 4칸 배치). 실측 칸 폭은 1280px에서 109px, 1920px에서 216px로 둘 다 격자로 읽히는 범위다.

**행 높이 160px 근거(계산):** 카드 최악 케이스(제목 2줄 + 요약 2줄) 내부 높이 =
`메타 12×1.5=18` + `gap 6` + `제목 16×1.375×2=44` + `gap 6` + `요약 14×1.5×2=42` = **116px**
→ 160px 안에서 위아래 22px씩 남는다. 128px(=`*32`)이면 6px씩만 남아 답답하고, 192px(=`*48`)이면 1080p 뷰포트(가시 캔버스 976px)에 카드가 4장밖에 안 들어온다. **160px에서는 타이틀 1행 + 카드 5행 = 960px로 976px 안에 정확히 들어온다.**

### 4-3. 순수 CSS 구현 (이미지 에셋 0개)

```css
[data-slot="content-grid"] {
  position: relative;

  /* ★ 캔버스를 가득 채운다. 퍼센트(min-height:100%)를 쓰지 않는 이유는 아래 (d) */
  min-height: calc(var(--content-viewport-height) - var(--spacing) * 12);

  background-image:
    /* ③ 교차점 점 마커 — 선 위에 그려져야 하므로 반드시 첫 레이어 */
    radial-gradient(circle at center,
      var(--content-grid-dot) 0 var(--content-grid-dot-r),
      transparent var(--content-grid-dot-r)),
    /* ② 가로선 */
    linear-gradient(to bottom, var(--content-grid-line) 0 1px, transparent 1px),
    /* ① 세로선 */
    linear-gradient(to right,  var(--content-grid-line) 0 1px, transparent 1px);

  background-size:
    calc(100% / var(--content-grid-columns)) var(--content-grid-row),
    100% var(--content-grid-row),
    calc(100% / var(--content-grid-columns)) 100%;

  background-position:
    50% calc(var(--content-grid-row) / -2),   /* ★ §4-3-a */
    0 0,
    0 0;

  background-repeat: repeat;
}
```

**★ (a) `background-position: 50%`가 정확히 "반 칸 어긋내기"가 되는 이유 — 그리고 칸 수가 반드시 짝수여야 하는 이유**

점 마커는 **칸의 중심**이 아니라 **칸의 모서리(=선의 교차점)**에 와야 한다. `radial-gradient`는 타일 중심에 원을 그리므로 레이어 전체를 가로·세로로 정확히 반 칸씩 밀어야 한다.

- 세로(y): 타일 높이가 고정 px이므로 `calc(var(--content-grid-row) / -2)`로 곧바로 해결된다.
- 가로(x): 칸 폭이 퍼센트라 `calc()`로 절반을 만들 수 없다. 대신 CSS의 `background-position` 퍼센트가 **(위치영역 폭 − 타일 폭)** 기준이라는 성질을 쓴다.
  `50%` → 오프셋 = `(W − W/N) / 2` = `W(N−1)/(2N)`. 타일 폭 `W/N`으로 나누면 `(N−1)/2`.
  **N이 짝수면 `(N−1)/2`의 소수부가 정확히 0.5** → 타일 반 칸 어긋남 ✅. **N이 홀수면 정수** → 어긋남 0이라 점이 칸 한가운데 찍힌다 ❌.
  N=6일 때: 오프셋 `5W/12`를 타일 폭 `2W/12`로 나눈 나머지 = `W/12` = 정확히 반 칸 ✅.

> ⚠ **`--content-grid-columns`를 홀수로 바꾸면 점 마커가 조용히 칸 중앙으로 이동한다.** developer는 CSS에 이 경고 주석을 반드시 남길 것. 홀수 칸이 필요해지면 대안은 "타일 네 모서리에 각각 1/4원을 그리는 4개 레이어"(`circle at 0 0` / `100% 0` / `0 100%` / `100% 100%`)로, 칸 수와 무관하게 성립하지만 레이어가 6개로 늘어난다.

**(b) 가장자리 마커는 절반만 보인다.** y=0 행의 점은 아래 절반만, 좌우 끝 점은 안쪽 절반만 그려진다(배경은 자기 박스 밖으로 못 나간다). 레퍼런스에서도 화면 가장자리 마커는 잘려 있으므로 **의도된 모습으로 간주**한다.

**(c) 이미지 에셋 0개 확인.** 3개 레이어 전부 CSS 그라디언트다. SVG data URI도, `.png`도 쓰지 않는다 — 이 프로젝트의 기존 관례(sidebar 스펙 §7-7 "티스토리 파일 업로드가 `.svg`를 허용하는지 미검증이라 채택하지 않는다")를 그대로 지킨다.

**★ (d) `min-height`에 퍼센트를 쓰면 안 된다(§2 방식의 필연적 귀결).** `content-inner`는 이제 `height`가 아니라 `max-height`만 갖는다 — 즉 **높이가 콘텐츠에 따라 결정되는 불확정 상태**다. 이런 부모에 대한 자식의 `min-height: 100%`는 CSS 규칙상 `0`으로 계산되어 **조용히 무효화된다**. 그래서 뷰포트 기준으로 직접 계산한다: `var(--content-viewport-height)`(= `100svh − 56px`)에서 `content-inner`의 상하 패딩 24×2 = `calc(var(--spacing) * 12)`를 뺀 값. 이 한 줄이 있어야 **글이 0개거나 몇 개뿐일 때도 격자가 캔버스를 가득 채운다**(§7 빈 상태의 전제).

### 4-4. 선/점이 "그리드 영역"이 되는 방법 — 콘텐츠 쪽 계약

배경만으로는 정합이 성립하지 않는다. `content-grid`의 **모든 직계 블록**이 아래 두 계약을 지켜야 한다.

1. **높이는 `var(--content-grid-row)`의 정수배로 고정한다.**
2. **경계선은 `border-bottom`이 아니라 `box-shadow: inset 0 -1px 0 …`으로 그린다.**
   `border-bottom: 1px`은 요소 높이를 1px 늘려(border-box가 아닌 한) 그 아래 모든 경계를 1px씩 누적 이동시킨다 — 100개 글이면 100px이 어긋난다. `inset box-shadow`는 레이아웃 높이에 전혀 영향을 주지 않으면서 같은 1px 선을 그린다. **이 구역에서 `border-bottom`은 금지한다.**

| 블록 | 높이 | 정수배 |
|---|---|---|
| `content-title` | `var(--content-grid-row)` | ×1 |
| `post-item` (글 1개) | `var(--content-grid-row)` | ×1 |
| `post-empty` | `calc(var(--content-grid-row) * 2)` | ×2 |
| `pagination` | `var(--content-grid-row)` | ×1 |
| `post-single` | (정수배 아님 — §9에서 배경을 끈다) | — |

### 4-5. 워터마크 텍스트 — ✅ **생략 확정** (사용자 결정 2026-09-04, Q2)

**격자선 + 교차점 점 마커만 채택한다. 반복 워터마크 텍스트는 넣지 않는다.**

**근거 4가지**

1. **실제 콘텐츠와 경쟁한다.** 레퍼런스는 텍스트가 헤드라인 2줄뿐인 히어로 화면이라 워터마크가 빈 칸을 채우는 역할을 했다. 이 화면은 글 제목·요약·메타가 격자 위에 빽빽이 놓이는 **목록**이라, 같은 격자 칸에 장식 텍스트가 겹치면 읽기를 방해한다.
2. **순수 CSS로 "반복 배치"를 못 한다.** `background-image`로 텍스트를 반복하려면 SVG data URI가 필요한데, 그 안의 `<text>`는 외부 CDN 폰트(Pretendard)를 로드하지 못해 **시스템 폰트로 렌더된다** — 셸 전체가 Pretendard로 통일된 이 스킨에서 톤이 어긋난다. 결국 실제 DOM 요소를 몇 개 놓는 방식이 될 수밖에 없는데, 그건 "반복 워터마크"가 아니라 "고정 위치 라벨 3개"라 레퍼런스의 성격을 재현하지도 못한다.
3. **점 마커가 이미 같은 일을 한다.** "그리드 시스템 자체를 시각적으로 노출한다"는 레퍼런스의 핵심 신호는 교차점 마커다. 워터마크가 없어도 그 성격은 그대로 전달된다.
4. **접근성/유지보수 비용이 0이 된다.** DOM 노드 3개, `aria-hidden` 관리, 스크롤 시 위치 계산, 카드와의 z-index 충돌이 전부 사라진다.

**이 결정으로 함께 정리된 것:** `[data-grid-watermark]` 마크업·CSS·색상 토큰(`--content-grid-watermark`)·`content-grid`의 `isolation: isolate`(워터마크를 뒤로 보내기 위해 필요했던 것) — 전부 스펙에서 제거했다. 단, `post-item`의 `isolation: isolate`는 **별개 목적**(hover 배경 `::before`를 콘텐츠 뒤로 보내기, §6-5)이므로 그대로 유지한다.

**나중에 되살릴 경우를 위한 기록:** 문구는 무관한 브랜드명이 아니라 이 블로그 정체성에서 가져와야 한다 — `[DAITNU]` 또는 3축을 쓰는 `[DESIGN]` / `[CODE]` / `[AI]`. 대문자 라틴 + 양수 자간(0.05em)은 **영문 전용 예외**로만 허용되며(선례: `right-widgets_designer-spec.md` §에 실측 인용된 Design-system `dashboard.css` 3980~3986행 `.ms-cmd-panel-title`), 한글에는 절대 적용하지 않는다. 배치는 `content-grid`를 기준으로 `left: calc(100% / var(--content-grid-columns) * k)` / `top: calc(var(--content-grid-row) * m)` 좌표계를 쓰고, 반드시 `aria-hidden="true"` + `pointer-events: none` + `user-select: none` + `z-index: -1`을 함께 준다.

---

## 5. 타이틀영역

### 5-1. 치환자 — **`[##_page_title_##]` 재사용 확정**

| 후보 | 판정 | 근거 |
|---|---|---|
| **`[##_page_title_##]`** | **채택** | ① 공식 문서에 "현재 페이지 제목"으로 실측 확인됨(§0-2-d) — 홈/카테고리/태그/검색/아카이브 어디서든 **지금 보고 있는 컨텍스트**를 그대로 반영한다. ② 이 프로젝트가 이미 `<title>`과 헤더 브레드크럼에서 검증한 치환자라 새 리스크가 0이다. ③ 정적 텍스트와 달리 **이중 관리가 없다** — 카테고리가 늘어도 스킨을 고칠 일이 없다. |
| 정적 텍스트("최신 글") | 기각 | 카테고리·태그·검색 페이지에서 전부 "최신 글"로 뜬다 — 명백한 오정보. |
| `[##_list_conform_##]` / `[##_list_count_##]` | 조건부 대안 | "'X'에 해당되는 글 N건"을 만들 수 있어 매력적이지만, **`<s_list>` 블록 안에서만 유효**하고 그 블록은 목록형 페이지에서만 렌더된다 → 홈에서 타이틀영역이 통째로 사라진다. §15-Q3에 부제 대안으로만 남긴다. |

**헤더 브레드크럼과의 중복:** 헤더에도 `[##_page_title_##]`이 있다(작은 크럼). 같은 문자열이 화면에 두 번 나오는 셈이지만, 역할이 다르다 — 헤더 크럼은 **셸 어디에 있는지**(항상 보임, sticky), 타이틀영역은 **이 캔버스가 무엇인지**(스크롤하면 사라짐). 대시보드 UI의 통상 구성이며 shadcn 대시보드 예제도 같은 구조다. 그래도 거슬린다면 헤더의 page 크럼만 제거하는 선택지를 §15-Q3에 남긴다.

### 5-2. 마크업 / 스타일

```html
<header data-slot="content-title">
  <h1 data-slot="content-title-text">[##_page_title_##]</h1>
  <p  data-slot="content-title-desc">[##_desc_##]</p>
</header>
```

```css
[data-slot="content-title"] {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: calc(var(--spacing) * 2);                     /* 8px */
  height: var(--content-grid-row);                   /* 160px — 정확히 1행 */
  padding: 0;                                        /* ★ 좌우 패딩 0 (§5-3) */
  box-shadow: inset 0 -1px 0 var(--content-divider); /* border-bottom 금지 (§4-4) */
}
[data-slot="content-title-text"] {
  margin: 0;
  font: var(--font-weight-semibold) var(--text-2xl)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-base);
  color: var(--color-foreground);
  word-break: keep-all;
}
[data-slot="content-title-desc"] {
  margin: 0;
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
  word-break: keep-all;
}
```

### 5-3. ★ 어느 세로선에 정렬되는가 — **가장 왼쪽 세로선(1번 칸의 시작선)**

`content-grid`의 왼쪽 경계 = 배경 세로선 #1이 그려지는 자리다. 타이틀영역의 `padding-inline: 0`이 곧 "헤드라인이 그 선 위에서 시작한다"를 의미한다 — 레퍼런스에서 헤드라인이 격자 세로선에 딱 붙어 시작하는 것과 동일하다. **리스트 카드도 같은 선에서 시작하므로(§6-4) 타이틀과 글 제목의 왼쪽 끝이 한 줄로 정렬된다.**

높이가 정확히 1행이므로 타이틀영역의 아래 경계선은 배경 가로선 #2와 완전히 겹친다 — 별도의 "타이틀/리스트 구분선"을 새로 그리는 게 아니라 **격자선 하나를 진하게 만드는 것**이 구분 방식이다(§10의 `--content-divider`).

**타이틀↔리스트 간격 = 0.** 요청의 "타이틀영역, 리스트영역 구분"은 여백이 아니라 **선**으로 한다. 여백을 주면 그만큼 아래 모든 카드가 격자에서 어긋난다(§4-4).

---

## 6. 리스트영역 (글 목록)

### 6-1. ★ `card.css` 재사용 판정 — **재사용하지 않는다** (요구사항 문서의 기존 메모를 뒤집는 결정)

요구사항 문서 4번 항목엔 "`card.css`(Card + Badge outline)가 공용 프리미티브로 준비돼 있어 **글 목록 카드에 그대로 재사용 가능**"이라고 적혀 있다. **이번 요청이 들어오면서 그 전제가 무너졌다** — 그 메모는 "여백·라운드·배경이 있는 일반 카드"를 가정한 것이고, 이번 요청은 그 셋을 전부 부정한다.

| Card 원본 선언 (`card.css` 30~43행) | 이 구역이 필요한 값 | 충돌 |
|---|---|---|
| `display: flex; flex-direction: column` | `display: grid` + 6칸 컬럼 | ★ 정면 충돌 — "그리드영역에 맞게 배치"의 핵심 |
| `gap: var(--card-spacing)`(16px) | 행 간 6px, 열 간 0 | 충돌 |
| `padding-block: var(--card-spacing)`(16px) | 0 (높이를 `var(--content-grid-row)`로 고정해야 함) | ★ 패딩이 높이에 더해져 격자 정합이 깨진다 |
| `border-radius: var(--radius-xl)`(14px) | 0 | ★ **요청 "리스트사이 여백없음"과 양립 불가** — 라운드 코너는 맞붙여 타일링할 수 없다 |
| `background-color: var(--color-card)` | 투명(격자가 비쳐야 함) | 충돌 |
| `box-shadow: 0 0 0 1px …`(링 보더) | `inset 0 -1px 0`(아래쪽 1줄만) | 충돌 |
| `overflow: hidden` | 무해하나 불필요 | — |

8개 선언 중 **7개를 덮어써야** 한다. 그건 재사용이 아니라 "프리미티브를 무력화한 뒤 새로 쓰는 것"이고, 위젯 구역이 이미 배경·보더 2개를 벗겨낸 데 이어 또 벗겨내면 `card.css`는 실사용처마다 다른 껍데기가 된다.

**단, 다음은 재사용한다:**

- **Badge(`[data-slot="badge"][data-variant="outline"]`)** — 카테고리 칩을 칩 모양으로 쓸 경우(§15-Q5).
- **Button(`header.css`)** — 페이징 전체(§8).
- `card.css` 원본은 **한 글자도 고치지 않는다** — 다른 구역(예: 향후 관련 글 카드)이 그대로 쓸 수 있게 둔다.

### 6-2. 마크업 (확정)

```html
<div data-slot="post-list">
  <s_article_rep>
    <s_index_article_rep>
      <article data-slot="post-item">
        <p data-slot="post-meta">
          <a href="[##_article_rep_category_link_##]" data-slot="post-category">[##_article_rep_category_##]</a>
          <span aria-hidden="true">·</span>
          <span data-slot="post-date">[##_article_rep_simple_date_##]</span>
        </p>
        <h2 data-slot="post-title">
          <a href="[##_article_rep_link_##]">[##_article_rep_title_##]</a>
        </h2>
        <p data-slot="post-summary">[##_article_rep_summary_##]</p>
      </article>
    </s_index_article_rep>
    <s_permalink_article_rep>…(§9)…</s_permalink_article_rep>
  </s_article_rep>
</div>
```

**현재 마크업에서 바뀌는 점과 사유**

1. **표시 순서를 `메타 → 제목 → 요약`으로 바꾼다**(현재는 제목 → 메타 → 요약). 메타가 제목과 요약 사이에 끼면 제목-본문의 연결이 끊긴다. 레퍼런스의 "작은 좌표 라벨 위, 큰 헤드라인 아래" 리듬과도 맞는다. **DOM 순서 자체를 바꾸면 되며**(`order` 속성 불필요) `<s_index_article_rep>` 안쪽 순서는 서버가 제약하지 않는다.
2. **`<a>`가 `<h2>` 바깥이 아니라 안쪽으로 들어간다.** 현재 `<a><h2>…</h2></a>`는 블록 제목을 링크가 감싸는 형태라 스크린리더가 제목과 링크의 관계를 덜 명확히 전달한다. `<h2><a>…</a></h2>`가 표준이며, 행 전체 클릭은 §6-5의 스트레치 링크로 해결한다.
3. **카테고리를 링크로 만든다** — `[##_article_rep_category_link_##]`(§0-2-b에서 실측 확인). 사이드바 카테고리 메뉴와 목록 카드가 같은 목적지로 이어져 대시보드 내비게이션이 일관된다.
4. `<time>`을 쓰지 않고 `<span>`을 쓴다 — `[##_article_rep_simple_date_##]`는 `yyyy.mm.dd` 표시 문자열이라 `<time>`이 요구하는 기계 판독 형식이 아니고, 연/월/일 치환자는 0 패딩 보장이 없어 유효한 `datetime` 값을 조립할 수 없다. **잘못된 `<time>`은 없는 것만 못하다.**

> ⚠ `<s_index_article_rep>` 블록은 **skin.html에 정확히 한 번**만 적는다. 서버가 글 개수만큼 반복한다(우측 위젯 구역에서 확정된 동일 원칙). 로컬 목업에서 여러 개로 보이게 하는 것은 `tools/make-preview.mjs`의 몫(§14-1).

### 6-3. "리스트사이 여백없음"의 구체적 실현

```css
[data-slot="post-list"] {
  display: flex;
  flex-direction: column;
  gap: 0;              /* ★ 요청 문언 — 카드 사이 여백 0 */
}
[data-slot="post-item"] {
  height: var(--content-grid-row);                    /* 160px 고정 = 격자 1행 */
  box-shadow: inset 0 -1px 0 var(--content-divider);  /* 구분선. border 금지(§4-4) */
}
```

- **여백 대신 선으로 구분한다.** `gap: 0` + 각 카드의 `inset 0 -1px 0`. 카드 높이가 정확히 격자 1행이므로 **그 구분선은 배경 가로선과 픽셀 단위로 겹친다** — 즉 "카드 경계 = 격자 가로선"이 되어 요청의 "리스트는 배경그리드의 그리드영역에 맞게 배치"가 세로 방향에서도 성립한다.
- 마지막 카드의 아래 선도 그대로 둔다(그 자리에 어차피 배경 가로선이 있어 지우면 오히려 한 줄만 옅어져 어색하다).

### 6-4. "그리드영역에 맞게 배치" — 카드 내부 컬럼 정렬

```css
[data-slot="post-item"] {
  position: relative;
  isolation: isolate;                                  /* hover ::before를 콘텐츠 뒤로 보내기 위한 스택 컨텍스트 */
  display: grid;
  grid-template-columns: repeat(var(--content-grid-columns), minmax(0, 1fr));
  grid-template-rows: auto auto auto;                  /* 메타 / 제목 / 요약 */
  align-content: center;
  row-gap: calc(var(--spacing) * 1.5);                 /* 6px */
  column-gap: 0;                                       /* ★ 칸 자체가 여백이다 */
  padding: 0;                                          /* ★ 좌우 0 — 텍스트가 세로선에서 시작 */
}

[data-slot="post-meta"]    { grid-column: 1 / -2; }    /* 1~5칸 */
[data-slot="post-title"]   { grid-column: 1 / -2; }    /* 1~5칸 */
[data-slot="post-summary"] { grid-column: 1 / -3; }    /* 1~4칸 — 오른쪽 2칸을 의도적으로 비운다 */
```

- `repeat(6, minmax(0,1fr))`는 배경 `calc(100% / 6)`과 **정의상 동일한 분할**이라 오차가 0이다. 따라서 각 요소의 왼쪽 끝·오른쪽 끝이 세로 격자선 위에 정확히 얹힌다.
- `minmax(0, 1fr)`(그냥 `1fr`이 아니라)이 필요한 이유: `1fr`의 최소 크기는 `auto`라 긴 제목이 칸을 밀어내 컬럼 폭이 배경과 어긋난다. `minmax(0, …)`가 그것을 막는다.
- **요약을 1칸 더 좁게 두는 이유:** 오른쪽에 2칸의 빈 격자가 남아 "격자가 레이아웃 기준"임이 시각적으로 드러난다(레퍼런스의 여백 리듬). 동시에 §15-Q4의 썸네일을 나중에 그 자리에 넣을 수 있다.
- `padding-inline: 0`이므로 텍스트가 격자선에 붙는다 — 레퍼런스의 헤드라인 정렬과 동일하고, 타이틀영역(§5-3)과도 같은 축이다. hover 배경이 텍스트에 바짝 붙어 답답해지는 문제는 §6-5의 블리드 배경이 해결한다.

### 6-5. 타이포 / 색상 / 상태

```css
[data-slot="post-meta"] {
  margin: 0;
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 1.5);                     /* 6px */
  font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  color: var(--color-muted-foreground);
}
[data-slot="post-category"] {
  position: relative;   /* ★ 스트레치 링크 위로 올려 클릭 가능하게 */
  z-index: 2;
  color: inherit;
  text-decoration: none;
}
[data-slot="post-category"]:hover { color: var(--color-foreground); }

[data-slot="post-title"] {
  margin: 0;
  font: var(--font-weight-medium) var(--text-base)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-base);
  color: var(--content-item-title-color);
  /* 2줄 클램프 */
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: keep-all;
  transition-property: color;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}
[data-slot="post-title"] > a { color: inherit; text-decoration: none; }

/* 행 전체를 클릭 영역으로 — 스트레치 링크 */
[data-slot="post-title"] > a::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
}

[data-slot="post-summary"] {
  margin: 0;
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
  word-break: keep-all;
}

/* hover 배경 — 텍스트가 격자선에 붙어 있으므로 배경만 좌우 12px 바깥으로 흘린다 */
[data-slot="post-item"]::before {
  content: "";
  position: absolute;
  inset-block: 0;
  inset-inline: calc(var(--spacing) * -3);             /* -12px */
  z-index: -1;                                        /* isolation:isolate 덕에 콘텐츠 뒤 */
  background-color: transparent;
  pointer-events: none;
  transition-property: background-color;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}
[data-slot="post-item"]:hover::before { background-color: var(--content-row-hover); }
[data-slot="post-item"]:hover [data-slot="post-title"] { color: var(--color-foreground); }

/* 키보드 포커스 — 스트레치 링크라 포커스 링을 행에 그린다 */
[data-slot="post-item"]:focus-within {
  outline: calc(var(--spacing) * 0.5) solid var(--color-ring);
  outline-offset: calc(var(--spacing) * 0.5);
}
```

**상태 표**

| 상태 | 제목 색 | 행 배경 | 근거 |
|---|---|---|---|
| 기본 | `--content-item-title-color`(중간색) | 투명 | 위젯 구역이 확정한 `--widget-title-color` 패턴과 동일한 사고(2026-09-03 e항) |
| `:hover` | `--color-foreground` | `--content-row-hover` | 160px짜리 큰 행이라 색 변화만으로는 신호가 약하다 — 위젯의 작은 항목과 다른 판단(§15-Q6) |
| `:focus-within` | 변화 없음 | 변화 없음 | 링만. sidebar 스펙 §4-2와 같은 `outline 2 / offset 2` |
| 방문함(`:visited`) | 처리 안 함 | — | 색으로 방문 여부를 표시하면 목록의 명도가 들쭉날쭉해져 격자 리듬이 깨진다 |

**말줄임 처리 시 반드시 지킬 것(위젯 구역에서 실측된 함정):** `-webkit-line-clamp`는 `display: -webkit-box`가 있어야 동작한다. 인라인 요소(`<span>`)에 `overflow`/`text-overflow`만 주면 아무 일도 일어나지 않는다 — 2026-09-03 위젯 항목 c에서 실제로 겪은 버그다.

**⚠ `[##_article_rep_summary_##]`는 HTML을 포함할 수 있다.** 티스토리 요약은 본문에서 추출되며 태그가 섞여 나올 수 있다. developer는 `[data-slot="post-summary"] :is(img, iframe, video, figure) { display: none }` 및 `[data-slot="post-summary"] * { font: inherit; color: inherit; }` 같은 정규화 규칙을 함께 넣어 격자 높이가 깨지지 않게 할 것. → 실사이트 검증 항목(§15-Q8).

---

## 7. 빈 상태 (`<s_list_empty>`)

```html
<s_list>
  <s_list_empty>
    <div data-slot="post-empty">
      <p data-slot="post-empty-text">아직 글이 없습니다.</p>
    </div>
  </s_list_empty>
</s_list>
```

```css
[data-slot="post-empty"] {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(var(--content-grid-row) * 2);          /* 320px — 정확히 2행 */
  box-shadow: inset 0 -1px 0 var(--content-divider);
  text-align: center;
}
[data-slot="post-empty-text"] {
  margin: 0;
  font: var(--font-weight-normal) var(--text-sm)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-muted-foreground);
  word-break: keep-all;
}
```

**설계 판단:**

- **아이콘·일러스트를 넣지 않는다.** 이 화면의 주인공은 격자 자체다. 글이 0개일 때야말로 격자가 온전히 드러나는 유일한 순간이므로, 중앙에 짧은 한 줄만 두고 나머지를 비워 격자가 보이게 하는 것이 이 구역의 가장 좋은 빈 상태다.
- **2행(320px)인 이유:** 1행이면 타이틀영역 바로 아래에 붙어 "제목의 부제"처럼 읽힌다. 2행이면 독립된 영역으로 읽히면서도 격자 정수배 계약(§4-4)을 지킨다. 그 아래 남은 캔버스도 §4-3-(d)의 `min-height` 덕에 격자로 채워진다.
- 문구는 `글이 없습니다.` → **`아직 글이 없습니다.`** 로 다듬는다(부정형 단정보다 상태 서술이 부드럽다). 중앙 정렬은 이 구역에서 유일한 예외다 — 나머지는 전부 왼쪽 격자선 정렬.

**⚠ 실사이트 미검증:** `<s_list_empty>`가 **홈(인덱스) 페이지**에서도 렌더되는지는 확인하지 못했다. 공식 문서상 `<s_list>` 계열은 검색/카테고리/태그 목록 페이지의 블록이므로, 홈에 글이 0개일 때 이 블록이 안 나올 가능성이 있다(현재 로컬 목업은 나온다). → §15-Q8.

---

## 8. 페이징 (`<s_paging>`)

### 8-1. 마크업 — 공식 형식으로 교체 + Button 프리미티브 재사용

```html
<s_paging>
  <nav data-slot="pagination" aria-label="페이지 이동">
    <a [##_prev_page_##] class="[##_no_more_prev_##]"
       data-slot="button" data-variant="ghost" data-size="icon-sm" aria-label="이전 페이지">
      <svg …lucide chevron-left…></svg>
    </a>
    <s_paging_rep>
      <a [##_paging_rep_link_##] data-pagination-link
         data-slot="button" data-variant="ghost" data-size="icon-sm">[##_paging_rep_link_num_##]</a>
    </s_paging_rep>
    <a [##_next_page_##] class="[##_no_more_next_##]"
       data-slot="button" data-variant="ghost" data-size="icon-sm" aria-label="다음 페이지">
      <svg …lucide chevron-right…></svg>
    </a>
  </nav>
</s_paging>
```

- `[##_prev_page_##]` / `[##_paging_rep_link_##]` / `[##_next_page_##]`는 **`href="…"` 속성 전체를 내려주므로 `href=` 없이 그대로 둔다**(§0-2-c 공식 예제 형식). 현재 skin.html의 `href="[##_paging_rep_link_##]"`는 교체 대상이다.
- Button 프리미티브 재사용 확인: `data-variant="ghost"`(header.css 95행) / `data-size="icon-sm"`(187행, 32px) 둘 다 이미 존재한다 ✅. 헤더 아이콘 버튼과 같은 32px이라 셸 전체의 버튼 리듬이 유지된다.
- `<s_paging_rep>`도 **정확히 한 번**만 적는다(서버가 페이지 수만큼 반복).

### 8-2. 스타일

```css
[data-slot="pagination"] {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: calc(var(--spacing) * 1);                      /* 4px */
  height: var(--content-grid-row);                    /* 160px — 격자 1행 유지 */
}
/* 더 이상 이전/다음이 없을 때 서버가 부여하는 클래스 */
[data-slot="pagination"] .no_more_prev,
[data-slot="pagination"] .no_more_next {
  opacity: .4;
  pointer-events: none;
}
```

**160px 밴드가 과하지 않은가?** 격자 정수배 계약(§4-4)을 지키면 리스트 아래로도 가로선이 흐트러지지 않는다. 버튼 32px을 중앙에 두면 위아래 64px씩 여백이 생기는데, 이는 "목록이 끝났다"는 종료 신호로 기능한다. 절반(80px)으로 줄이면 그 아래 경계가 격자선을 벗어나지만 아래에 광고 슬롯밖에 없어 실질 피해는 작다 → §15-Q7.

**서버가 내려주는 클래스명 미검증:** `[##_no_more_prev_##]`가 정확히 `no_more_prev`라는 문자열을 내려주는지는 공식 문서에 명시돼 있지 않다(설명만 "없을 때 부여되는 클래스"). developer는 실사이트에서 확인하고, 그 전까지 `[class*="no_more"]` 같은 방어적 셀렉터를 병기할 것 → §15-Q8.

### 8-3. ★ 현재 페이지 강조 — 서버 마크업으로는 불가능, JS로 보완

§0-2-c 실측대로 `<s_paging_rep>`에는 "현재 페이지" 표식이 **없다**. 대응:

```js
/* components/content.js (신규) — sidebar.js의 initActiveState()와 같은 방식 */
document.querySelectorAll('[data-pagination-link]').forEach(function (a) {
  if (a.pathname + a.search === location.pathname + location.search) {
    a.setAttribute('aria-current', 'page');
    a.setAttribute('data-variant', 'outline');   /* ghost → outline 으로 격상 */
  }
});
```

- **선례가 있다:** `sidebar.js`의 `initActiveState()`가 이미 `location`과 링크 href를 비교해 활성 카테고리를 표시한다. 같은 관례를 그대로 따르는 것이라 새 패턴이 아니다.
- 강조는 `data-variant`를 `ghost` → `outline`으로 바꾸는 것만으로 끝난다(Button 프리미티브가 이미 그 스타일을 갖고 있음) — 새 CSS 0줄.
- 채택 여부는 §15-Q7. 미채택 시 페이징은 CSS만으로 완결되고 `content.js`는 만들지 않는다.

---

## 9. 단일 글 모드 (`<s_permalink_article_rep>`) — 최소 대응만

이번 스펙의 설계 대상이 아니다(요청의 "리스트영역"은 `s_index_article_rep`). **깨지지 않는 최소 레이아웃만** 정의한다.

```html
<s_permalink_article_rep>
  <article data-slot="post-single">
    <h1 data-slot="post-single-title">[##_article_rep_title_##]</h1>
    <p  data-slot="post-single-meta">[##_article_rep_category_##] · [##_article_rep_date_##]</p>
    <div data-slot="post-single-body">[##_article_rep_desc_##]</div>
  </article>
</s_permalink_article_rep>
```

```css
/* ★ 단일 글 페이지에서는 격자 배경과 타이틀영역을 끈다 */
[data-slot="content-grid"]:has([data-slot="post-single"]) { background-image: none; }
[data-slot="content-grid"]:has([data-slot="post-single"]) [data-slot="content-title"] { display: none; }

[data-slot="post-single"]        { max-width: calc(var(--spacing) * 180); padding-block: calc(var(--spacing) * 10); }
[data-slot="post-single-title"]  { margin: 0 0 calc(var(--spacing)*2); font: var(--font-weight-semibold) var(--text-2xl)/var(--leading-snug) var(--font-sans); letter-spacing: var(--tracking-base); word-break: keep-all; }
[data-slot="post-single-meta"]   { margin: 0 0 calc(var(--spacing)*8); font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans); letter-spacing: var(--tracking-xs); color: var(--color-muted-foreground); }
[data-slot="post-single-body"]   { font-size: var(--text-base); line-height: var(--leading-relaxed); letter-spacing: var(--tracking-base); word-break: keep-all; }
[data-slot="post-single-body"] img { max-width: 100%; height: auto; }
```

**격자를 끄는 이유(설계 판단):** 단일 글은 본문 길이가 임의라 §4-4의 "높이 = 행의 정수배" 계약을 지킬 수 없고, 지키지 못한 격자 위에 긴 본문을 얹으면 선이 문단 한가운데를 가로질러 가독성을 해친다. **격자는 "목록의 레이아웃 기준"으로서만 의미가 있으므로, 목록이 아닌 화면에서는 끈다.** 타이틀영역도 함께 끈다 — `[##_page_title_##]`이 단일 글에서는 글 제목이 되어 바로 아래 `<h1>`과 중복되기 때문이다.

`:has()` 기반 판정을 쓰는 이유: 서버가 인덱스 페이지에서 `<s_permalink_article_rep>` 블록을 통째로 제거하므로, **그 요소의 존재 여부 자체가 가장 정확한 페이지 타입 신호**다. `[##_body_id_##]`가 내려주는 정확한 id 문자열은 실측하지 못했으므로(공식 문서에 "페이지 타입에 따라 부여된다"만 명시) 추측해서 쓰지 않는다.

**긴 글에서의 스크롤:** `content-inner`가 `max-height: calc(100svh − 56px)` + `overflow-y: auto`이므로 **긴 본문도 이 컨테이너 안에서 스크롤된다**(문서 스크롤이 아니라). 커스텀 스크롤바와 상하 페이드가 그대로 적용되어 목록 화면과 스크롤 경험이 일관된다 ✅. 본문 스타일 전체(인용/코드/표/댓글)는 **다음 구역**의 몫이다.

---

## 10. 색상 매핑

### 10-1. 형식 — hex 유지

`sidebar_designer-spec.md` §2에서 전 구역 공통으로 확정한 **hex 표기**를 그대로 따른다. 파생값은 이 프로젝트가 이미 여러 곳에서 쓰는 `color-mix(in oklab, …)` 관용구로 만든다(`widgets.css` `--widget-title-color`, `card.css` 링 섀도, `header.css` hover 선례).

### 10-2. 구역 전용 변수 (`[data-slot="content-inner"]` 스코프)

| 신규 변수 | 정의 | 라이트 유효값 | 다크 유효값 | 근거 |
|---|---|---|---|---|
| `--content-viewport-height` | `calc(100svh - var(--header-height))` | — | — | §2 스크롤 모델의 기준 높이. `content-grid`의 `min-height`(§4-3-d)에도 상속돼 쓰인다 |
| `--content-grid-line` | `var(--color-border)` | `#e5e5e5` | `#ffffff1a`(위 `#0a0a0a` → 약 `#262626`) | 격자선은 셸의 다른 헤어라인(헤더 하단, 사이드바 우측)과 **같은 선**이어야 한다. 새 값을 만들면 화면에 굵기가 같고 색만 다른 선이 두 종류 생긴다 |
| `--content-grid-dot` | `color-mix(in oklab, var(--color-muted-foreground) 35%, transparent)` | `rgba(115,115,115,.35)` → 흰 배경 위 약 `#b9b9b9` | `rgba(161,161,161,.35)` → 약 `#414141` | 마커는 선보다 한 단계 진해야 "교차점"으로 읽힌다. `--color-muted-foreground`는 이 스킨에서 이미 "보조 정보" 축의 색이라 장식에 적합 |
| `--content-divider` | `color-mix(in oklab, var(--color-foreground) 16%, transparent)` | `rgba(0,0,0,.16)` → 약 `#d6d6d6` | `rgba(250,250,250,.16)` → 약 `#313131` | **콘텐츠 경계선은 장식 격자선보다 진해야 한다.** 이 한 단계 차이가 "격자는 배경, 카드 경계는 구조"라는 위계를 만든다 (라이트 `#d6d6d6` vs 격자 `#e5e5e5`, 다크 `#313131` vs 격자 `#262626`) |
| `--content-row-hover` | `var(--color-muted)` | `#f5f5f5` | `#262626` | ★ `--color-accent`를 쓰지 않은 이유: 다크 `--accent`는 `#404040`이라 160px 밴드에 깔면 너무 밝게 튄다. `--muted`는 라이트 `#f5f5f5` / 다크 `#262626`으로, **사이드바 hover(`--sidebar-accent`)와 값이 정확히 동일**해 셸 전체의 hover 톤이 통일된다 |
| `--content-item-title-color` | `color-mix(in oklab, var(--color-muted-foreground) 50%, var(--color-foreground) 50%)` | 약 `#3b3b3b` | 약 `#d0d0d0` | 위젯 구역이 사용자 요청으로 확정한 `--widget-title-color`와 **완전히 같은 사고**(기본은 중간색, hover에 진한색). 값 정의를 복사하지 않고 각 구역 스코프에 두는 것도 그 선례 그대로 |

> 워터마크용 `--content-grid-watermark`는 §4-5(생략 확정)에 따라 **정의하지 않는다.**
>
> 위 "유효값"은 알파 합성 결과의 근사치다. `color-mix(in oklab, …)`는 브라우저가 계산하므로 **CSS에는 hex가 아니라 위 정의식을 그대로 적는다**(라이트/다크 전환에 자동으로 따라가야 하므로). developer는 Playwright의 `getComputedStyle`로 실제 계산값을 한 번 실측해 기록할 것.

### 10-3. `src/input.css`에 추가할 전역 토큰 (`@theme static`)

| 토큰 | 값 | 출처(실측) | 용도 |
|---|---|---|---|
| **`--header-height`** | `calc(var(--spacing) * 14)` (= 56px) | 이 프로젝트가 이미 세 곳에 복붙해 둔 셸 상수(sidebar.css / header.css 296행 / widgets.css 56행) | §2-4의 승격. `content-inner`의 `max-height` 계산 |
| `--text-lg` | `1.125rem` | `node_modules/tailwindcss/theme.css` 353행 | 예비(§15-Q3의 큰 제목 옵션) |
| `--text-xl` | `1.25rem` | 같은 파일 355행 | 예비 |
| `--text-2xl` | `1.5rem` | 같은 파일 357행 | 타이틀영역 h1, 단일 글 h1 |
| `--leading-relaxed` | `1.625` | 같은 파일 394행 | 단일 글 본문 |

**색상 raw 토큰 추가는 0건이다.** 새 `--secondary` / `--destructive` / `--popover` / `--sys-*`가 필요 없다.
**셸 레이아웃 선언 변경도 0건이다** — `@theme static`에 토큰만 추가하며 `@layer base`의 `body` 규칙은 손대지 않는다(§2-2).

### 10-4. 왜 `--secondary` / `--destructive` / `--popover`가 필요 없는가

요구사항 문서가 "아직 없다"고 표시해 둔 토큰들이지만 이 구역에는 쓸 자리가 없다.

- `--secondary`: 보조 버튼 변형용. 이 구역의 유일한 버튼군(페이징)은 `ghost` + `outline` 2개로 충분하고 둘 다 이미 존재한다.
- `--destructive`: 파괴적 액션(삭제 등)이 없다. 블로그 목록에는 존재할 수 없는 개념이다.
- `--popover`: 팝오버/드롭다운이 없다. 툴팁은 이미 `tooltip.css`가 자체 색을 갖고 있다.

→ **없는 토큰을 이번에 추측으로 만들어 넣지 않는다.** Design-system 조회가 불가한 상황(§0-1)에서 이 결정은 특히 중요하다. 실제로 필요해지는 구역(예: 댓글의 삭제 버튼)에서 Design-system을 실측해 추가할 것.

### 10-5. 대비 검증 (WCAG 2.1)

| 조합 | 비율 | 판정 |
|---|---|---|
| 타이틀 h1 `#000000` on `#ffffff` (L) | 21.0 | AAA |
| 타이틀 h1 `#fafafa` on `#0a0a0a` (D) | 19.3 | AAA |
| 부제/요약/메타 `#737373` on `#ffffff` (L) | **4.54** | AA (일반 텍스트 기준 4.5 통과) |
| 부제/요약/메타 `#a1a1a1` on `#0a0a0a` (D) | 8.05 | AAA |
| 글 제목 기본(중간색) | **≥ 4.54 보장** | AA — 아래 논증 |
| 글 제목 hover `--color-foreground` | 21.0 / 19.3 | AAA |
| hover 배경 위 제목 `#3b3b3b` on `#f5f5f5` (L) | ≈ 10.3 | AAA |
| 격자선 / 점 마커 | — | **대상 아님** — 순수 장식(배경 이미지). WCAG 1.4.11(비텍스트 대비 3:1)은 "UI 컴포넌트·의미 있는 그래픽"에만 적용되며 순수 장식은 명시적으로 제외된다 |

**글 제목 기본색이 AA를 넘는다는 논증(정확한 hex 계산 없이 성립):** `--content-item-title-color`는 `--color-muted-foreground`와 `--color-foreground`를 oklab에서 50:50으로 섞은 값이다. oklab 보간은 명도(L)를 단조롭게 잇기 때문에 결과의 상대 휘도는 **두 끝값 사이**에 놓인다. 두 끝값의 배경 대비는 각각 4.54:1(muted)과 21.0:1(foreground)이고, 배경이 고정된 상태에서 대비는 휘도의 단조 함수이므로 **결과 대비는 반드시 4.54:1 이상**이다. 다크도 동일하게 8.05 ~ 19.3 사이 → AA 이상 보장 ✅. (기존 값 4.54 / 21.0 / 8.05는 `sidebar_designer-spec.md` §3-4의 실측표에서 가져왔다.)

---

## 11. 타이포그래피 (`pretendard-typography` 준수)

### 11-1. 매핑표

| 요소 | 토큰 조합 | = px/굵기 | 스케일 |
|---|---|---|---|
| 타이틀 h1 | `--font-weight-semibold` `--text-2xl`/`--leading-snug` `--tracking-base` | 24 / 1.375 / 600 / −0.01em | H2급 |
| 타이틀 부제 | `--font-weight-normal` `--text-sm`/`--leading-normal` `--tracking-sm` | 14 / 1.5 / 400 / −0.008em | Small |
| 글 제목 | `--font-weight-medium` `--text-base`/`--leading-snug` `--tracking-base` | 16 / 1.375 / 500 / −0.01em | Body/Label 상단 |
| 글 요약 | `--font-weight-normal` `--text-sm`/`--leading-normal` `--tracking-sm` | 14 / 1.5 / 400 / −0.008em | Small |
| 글 메타 | `--font-weight-normal` `--text-xs`/`--leading-normal` `--tracking-xs` | 12 / 1.5 / 400 / −0.006em | Caption 400 변형 (선례: `right-widgets` 스펙 §, sidebar.css 163행) |
| 빈 상태 | `--font-weight-normal` `--text-sm`/`--leading-normal` `--tracking-sm` | 14 / 1.5 / 400 | Small |
| 페이징 숫자 | Button `icon-sm` 원본 값 그대로 | 32px 버튼 | — |
| 단일 글 본문 | `--text-base`/`--leading-relaxed` `--tracking-base` | 16 / 1.625 / 400 | Body |

- 굵기는 400 / 500 / 600만 쓴다. 700(`--font-weight-bold`)은 추가하지 않는다 — 24px semibold로 충분한 위계가 나오고, 셸 전체가 400/500/600으로만 구성돼 있다.
- **이 구역에는 양수 자간이 한 곳도 없다.** 워터마크(라틴 대문자, 유일한 예외 후보)가 §4-5에서 생략 확정됐으므로, `pretendard-typography`의 "한글에 양수 자간·대문자 변환 금지" 원칙이 예외 없이 적용된다.
- **`word-break: keep-all`을 타이틀·글 제목·요약·빈 상태에 적용한다.** sidebar 스펙 §5-3은 "사이드바는 한 줄 고정이라 적용하지 않는다, 그 규칙은 본문/리드 문구용"이라고 적었다 — **이 구역이 바로 그 '본문/리드'다.** 한글이 어절 중간에서 끊기지 않아야 2줄 클램프가 자연스럽다.

### 11-2. ⚠ 자간 토큰을 확장하지 않는 이유

`--tracking-xs/-sm/-base`(−0.006 / −0.008 / −0.01em)는 Tailwind 기본값이 아니라 **Design-system의 한글 전용 스케일**이다(sidebar 스펙 §5-1에서 globals.css 413~415행 실측 확인). 24px 이상에는 더 좁은 값(`--tracking-lg` 등)이 어울리지만, **Design-system을 조회할 수 없는 지금 그 값을 지어내면 이 프로젝트가 지켜온 "추측 금지" 원칙을 정면으로 어긴다.** Tailwind 기본 `--tracking-tight`(−0.025em)를 끌어오는 것도 라틴 기준 값이라 한글 스케일과 계열이 다르다.

→ **24px 제목에도 기존 `--tracking-base`(−0.01em)를 쓴다.** 이미 실측된 값이고 방향(더 좁게)도 맞으며, 24px에서 −0.01em = −0.24px로 시각적으로 충분히 조여 보인다. Design-system 접근이 복구되면 대형 자간 토큰이 있는지 확인해 교체할 것 → §15-Q10.

---

## 12. 접근성 / 성능

### 12-1. 접근성

| 항목 | 처리 |
|---|---|
| 격자선 / 점 마커 | `background-image`라 접근성 트리에 아예 없다 — 추가 조치 불필요 ✅ (워터마크 텍스트를 생략했으므로 `aria-hidden` 관리 대상 자체가 존재하지 않는다, §4-5) |
| 스트레치 링크 | 링크 텍스트는 글 제목 하나뿐이라 접근 가능한 이름이 명확하다. `::after`는 이름에 기여하지 않는다 ✅ |
| 카테고리 링크 | 스트레치 링크에 덮이지 않도록 `z-index: 2`. 덮이면 마우스로 클릭 불가(키보드로는 도달하나 시각적 인과가 깨진다) |
| 키보드 포커스 | `:focus-within` 아웃라인을 **행 전체**에 그린다 — 스트레치 링크 구조에서는 링크 자신에 링을 그리면 제목 텍스트에만 얇게 붙어 잘 안 보인다 |
| 제목 계층 | 목록의 글 제목 = `<h2>`, 페이지 제목 = `<h1>`(타이틀영역), 단일 글 제목 = `<h1>`. **한 페이지에 `<h1>`이 둘이 되지 않도록** 단일 글 페이지에서는 타이틀영역을 숨긴다(§9) |
| 페이징 | `<nav aria-label="페이지 이동">`, 이전/다음 아이콘 버튼에 `aria-label`, 현재 페이지에 `aria-current="page"`(§8-3 채택 시) |
| 스크롤 컨테이너 | `overflow-y: auto`인 요소는 브라우저가 자동으로 키보드 포커스를 받게 한다(Chromium의 keyboard-focusable scrollers) — 키보드만 쓰는 사용자도 이 영역을 스크롤할 수 있다 ✅ |
| `prefers-reduced-motion` | 격자에는 애니메이션이 없어 무관. 스크롤 페이드/스크롤바 페이드는 기존 규칙(`widgets.css` 412행, `smooth-scroll.js` 65행)이 그대로 상속된다 |
| 메타 구분점 `·` | `aria-hidden="true"` — 스크린리더가 "가운뎃점"을 읽지 않게 |

### 12-2. 성능

- **이미지 요청 0건.** 격자는 CSS 그라디언트 3레이어뿐이다. HTTP 요청도, 티스토리 파일 업로드 항목도 늘지 않는다.
- **`will-change` / `transform` 승격을 쓰지 않는다.** 배경은 스크롤 컨테이너 안 일반 요소에 붙은 평범한 페인트이며, 레이어로 승격시키면 긴 목록에서 텍스처 메모리만 커진다.
- **세로선 레이어의 타일이 `100%` 높이라 목록이 길어질수록 타일 하나가 커진다.** 실측상 문제가 되는 크기는 아니지만(단색 그라디언트), 글이 수백 개인 페이지에서 스크롤 프레임을 developer가 한 번 확인할 것(§14-2).
- **`:has()` 사용 2곳**(§9). 셀렉터 매칭 비용이 있으나 `content-grid` 하나에만 걸리고, 이 프로젝트는 이미 `sidebar.css`에서 `:has()`를 여러 곳에 쓰고 있다.
- 반복 요소당 CSS 규칙 수가 적고(카드 1개당 5개 셀렉터) JS는 §8-3의 몇 줄뿐이다.

---

## 13. Tistory / 바닐라 환경 제약으로 원본과 달라지는 부분

### 13-1. `<s_list_rep>` 계열을 쓰지 않는다

§0-2-a에서 확인한 대로 티스토리에는 목록을 그리는 경로가 **둘**이다: `<s_list_rep>`(목록형)과 `<s_index_article_rep>`(블로그형). 둘 중 무엇이 실제로 렌더되는지는 **스킨이 아니라 티스토리 관리자 설정(글 목록 표시 방식)이 정한다.** 이번 스펙은 사용자가 지목한 현재 마크업(`s_index_article_rep`)을 기준으로 하고, `<s_list>`는 빈 상태 통로로만 남긴다. 두 경로를 모두 지원하려면 카드 스타일을 두 벌 작성해야 하므로 **필요해질 때 추가한다** → §15-Q8.

### 13-2. 반복은 서버가 한다 — 마크업은 항상 1개

`<s_index_article_rep>` / `<s_paging_rep>` 둘 다 skin.html에 **정확히 한 번**만 적는다. 우측 위젯 구역에서 확정된 원칙과 동일하며, 복붙하면 실사이트에서 배수로 곱해진다. 로컬 미리보기용 반복은 `tools/make-preview.mjs`가 담당한다(§14-1).

### 13-3. 광고 슬롯은 통제 불가 → 그리드 밖으로

§1-2의 ★ 참고. React가 아니라 Tistory 서버가 삽입하는 임의 높이 블록이므로 격자 정합 영역 밖에 둔다.

### 13-4. "현재 페이지" 상태가 서버 마크업에 없다 → JS 보완

§8-3. shadcn Pagination의 `isActive` prop에 해당하는 것을 서버가 주지 않으므로 `location` 비교로 대체한다.

### 13-5. 페이지 타입 분기를 `[##_body_id_##]`가 아니라 `:has()`로

§9. `[##_body_id_##]`가 내려주는 정확한 id 문자열을 실측하지 못했으므로 추측하지 않는다. `<s_permalink_article_rep>` 블록의 **존재 여부** 자체가 서버가 이미 판정해 준 결과이므로 더 정확하다.

### 13-6. `height: 100%` 대신 `max-height`(svh) — 셸을 못 건드리는 환경이 아니라, 건드릴 필요가 없어서

§2 참고. React SPA라면 루트에서 앱 셸 높이를 한 번에 확정하는 것이 자연스럽지만, 이 스킨은 **이미 검증이 끝난 두 구역(sidebar/header)의 레이아웃 모델을 되짚지 않는 것**이 훨씬 안전하다. 뷰포트 단위 `max-height`는 부모 높이 확정을 요구하지 않으므로 셸을 그대로 둔 채 독립 스크롤 컨테이너를 만들 수 있다 — 우측 위젯 패널에서 이미 같은 방식이 실사용·검증됐다. 그 결과 티스토리가 관리 메뉴바를 주입해도 셸 높이 계산이 어긋날 여지가 없다(주입 요소는 문서 스크롤로 자연스럽게 흡수되고, 필요하면 §2-3의 sticky로 대응).

---

## 14. developer 인계

### 14-1. 파일별 변경 목록

| 파일 | 변경 |
|---|---|
| **`components/content.css`** (신규) | §3~§9의 모든 규칙. 로드 순서: `tailwind → tooltip → scrollbar → smooth-scroll → card → sidebar → header → widgets → **content**`(구역 스타일 중 마지막) |
| **`components/scrollbar.css`** (신규) | `widgets.css` §8(370~417행)을 **값 변경 없이** 옮기고 셀렉터만 `[data-slot="widgets"]` → `[data-custom-scrollbar]`로 교체. 프리미티브이므로 구역 CSS보다 먼저 로드 |
| `components/widgets.css` | §8 블록 제거(위로 이동). `<aside>`에 `data-custom-scrollbar` 추가되므로 **동작은 완전히 동일해야 한다 — 회귀 확인 필수**. (선택) 56행 `--widgets-top`을 `var(--header-height)`로 교체 — 값 동일, 안 해도 무방 |
| **`components/content.js`** (신규, §15-Q7 채택 시에만) | 현재 페이지 `aria-current` 부여 8줄 |
| `components/smooth-scroll.js` | ① content-inner Lenis 인스턴스 추가, ② `initScrollbarAutoHide` 대상을 `[data-custom-scrollbar]` 전체 순회로 일반화(각자의 Lenis 인스턴스를 매핑해 전달) |
| `src/input.css` | `@theme static`에 **`--header-height`**, `--text-lg/-xl/-2xl`, `--leading-relaxed` 추가 (§10-3). **`@layer base`의 `body` 규칙은 손대지 않는다** |
| `skin.html` | `content-inner` 안쪽 전체 교체(§1-2). `class="scroll-fade-y"` **리터럴** + `data-lenis-prevent` + `data-custom-scrollbar` 3종 속성. `<aside data-slot="widgets">`에도 `data-custom-scrollbar` 추가. `content.css`(+`scrollbar.css`, `content.js`) `<link>`/`<script>` 추가 |
| `tailwind.css` | 재빌드. `class=` 변경이 있으므로(`scroll-fade-y` 추가) md5가 바뀔 수 있다 |
| `tools/make-preview.mjs` | ① `<s_index_article_rep>`를 더미 글 N개(예: 7 — 스크롤이 실제로 생기도록)로 확장, ② `<s_paging_rep>`을 5개로 확장, ③ **index / permalink 두 종류의 미리보기 출력** — 현재 방식은 마커만 벗기므로 두 블록이 동시에 렌더돼 §9의 `:has()` 분기가 항상 permalink로 판정된다 ⚠, ④ 신규 파일 경로 치환 목록에 `content`/`scrollbar` 추가 |
| `README.md` | 업로드 파일 목록 갱신(+2~3개) |

> **셸 파일은 수정하지 않는다.** 초판에 있던 `sidebar.css`(`sidebar-wrapper`/`sidebar-inset`) 수정과 `input.css`의 `body` flex column 변경은 **전부 폐기**됐다(§2-2). `input.css`는 `@theme static`에 토큰을 추가할 뿐이다.

### 14-2. Playwright 검증 체크리스트

**격자 정합(이 구역의 핵심)**
1. `content-title`의 하단 경계 y좌표 = 배경 첫 가로선 y좌표(오차 0px). 배경선 위치는 `--content-grid-row` 값으로 계산해 대조.
2. 카드 N개의 `getBoundingClientRect().height`가 전부 정확히 160.
3. 카드 K번째의 top = `타이틀 160 + (K−1)×160`(오차 0). **글 10개 이상에서 누적 오차가 0인지** — `border-bottom`을 잘못 쓰면 여기서 드러난다.
4. `post-title`/`post-summary`의 left = `content-grid`의 left(오차 0), `post-summary`의 right = `content-grid.left + 폭×4/6`(오차 <0.5px).
5. **스크롤 후에도 3·4가 유지되는지** — 배경이 콘텐츠와 함께 움직이는지 확인(§1-2의 핵심 근거).
6. 점 마커가 교차점에 있는지: 스크린샷 픽셀 샘플링으로 (칸폭×k, 행×m) 좌표의 픽셀이 주변보다 어두운지 확인. **칸 수를 7(홀수)로 바꿨을 때 어긋나는 것도 한 번 재현**해 §4-3-a의 경고가 실재함을 기록.
7. **글이 0개인 목업에서 `content-grid`가 캔버스를 가득 채우는지** — §4-3-(d)의 `min-height`가 실제로 먹는지(퍼센트였다면 0이 됐을 자리).

**스크롤**
8. `content-inner`의 `getComputedStyle().maxHeight`가 `100svh − 56px`로 계산되고, `scrollHeight > clientHeight`일 때 실제로 스크롤되는지.
9. content-inner 위에서 CDP `mouse.wheel` → content-inner만 스크롤되고 문서 `scrollTop`은 0 유지(`data-lenis-prevent` 검증).
10. 위젯 패널 위 휠 → 위젯만 스크롤(회귀 없음). 좌측 사이드바도 회귀 없음.
11. 커스텀 스크롤바: 로드 직후 알파 0 → 스크롤 시 ~1초 페이드인 → 정지 후 3.0초에 페이드아웃 시작 → ~1초 페이드아웃. **위젯 패널과 content-inner 양쪽에서 각각.**
    ⚠ **`ignoreDefaultArgs:["--hide-scrollbars"]` 없이는 전부 무의미하다**(2026-09-04에 기록된 함정).
12. `scroll-fade-y`: `--scroll-fade-t`가 scrollTop 0/48/96에서 0/약0.5/1.0으로 추종.
13. **요구사항 문서의 미해결 숙제:** `clientHeight/scrollHeight`가 0.15 이하가 되도록 글을 많이 넣은 뒤, 스크롤바 썸 상단이 `scroll-fade` 마스크에 걸리는지 픽셀로 확인하고 결과를 기록.

**셸 — 무회귀 확인 (이번엔 셸을 안 고쳤으므로 "바뀌지 않았음"을 증명하는 것이 목표)**
14. **★ §2-3 판정:** `document.scrollingElement.scrollHeight > window.innerHeight` 여부를 측정한다. **거짓이면 `content-inner`에 `position: sticky`를 추가하지 않는다.** 참이면 `sticky; top: var(--header-height)`를 추가하고 다시 측정. **판정 결과와 근거 수치를 검증 문서에 반드시 기록할 것.**
15. 헤더 `position: sticky`가 **여전히 유효**한지 — 문서를 스크롤할 수 있는 상황을 만든 뒤 헤더가 `top: 0`에 머무는지(초판 A안이었다면 무의미해졌을 동작이 그대로 살아 있어야 한다).
16. 위젯 패널이 `top: 56`에 sticky로 머물고 높이·내부 스크롤·페이드가 **이전과 완전히 동일**한지(회귀 0).
17. 좌측 사이드바 접힘/펼침(Ctrl+B) 후에도 1~4번 정합이 유지(칸 폭이 %라 자동으로 맞아야 함).
18. 가로 오버플로 0(`scrollWidth === innerWidth`).
19. FAB가 우측 하단에 정상 표시되고 위젯 패널과 겹치지 않음.

**기타**
20. 라이트/다크 각각 스크린샷 + 격자선·점·구분선의 실제 계산색(`getComputedStyle`) 기록.
21. 카드 hover: 배경이 좌우 12px 바깥까지 뻗는지, 제목 색이 바뀌는지.
22. 카테고리 링크가 **마우스로 클릭 가능**한지(스트레치 링크에 안 덮이는지) + 나머지 영역 클릭 시 글로 이동하는지.
23. Tab 이동 시 행 전체에 포커스 링.
24. 콘솔 에러 0.

---

## 15. 확인 필요 (사용자 결정 사항)

| # | 항목 | 결정 / 제안 | 근거 |
|---|---|---|---|
| **Q1** | **content-inner의 스크롤 모델** | ✅ **확정 — "해당 부분에 overflow auto"**(2026-09-04). `max-height: calc(100svh - var(--header-height))` + `overflow-y: auto`. **셸 파일 무변경.** | 우측 위젯 패널이 이미 검증한 패턴 재사용. 뷰포트 단위라 부모 높이 확정이 필요 없어, 초판 A안이 요구하던 `body`/`sidebar.css` 수정과 그에 따른 sticky 희생·관리 메뉴바 방어가 전부 불필요해졌다. **`position: sticky` 추가 여부만 developer가 실측 판정**(§2-3). `--widgets-top` 대신 `--header-height` 토큰을 신설하는 이유는 §2-4(스코프 변수라 형제에게 상속되지 않아 조용히 실패한다) |
| **Q2** | **워터마크 텍스트 포함 여부** | ✅ **확정 — 생략**(2026-09-04). 격자선 + 교차점 점 마커만. | §4-5에 근거 4가지. 관련 마크업/CSS/토큰/접근성 항목을 전부 정리했다. 되살릴 경우의 문구·배치 규칙은 §4-5 말미에 기록해 뒀다 |
| **Q3** | **타이틀영역 구성** | **h1 = `[##_page_title_##]`, 부제 = `[##_desc_##]`** | §5-1에 근거. 대안 ①부제를 `'[##_list_conform_##]'에 해당되는 글 [##_list_count_##]건`으로(목록형 페이지에서만 나옴, 홈에서 사라짐) ②헤더 브레드크럼의 page 크럼을 제거해 중복 해소 ③h1 크기를 24px(`--text-2xl`) → 30px로 키우기(레퍼런스 히어로에 더 가까움, 단 `--text-3xl` 토큰 추가 필요) |
| **Q4** | **글 목록에 썸네일을 넣을 것인가** | **넣지 않는다(이번 범위)** | `<s_article_rep_thumbnail>` + `[##_article_rep_thumbnail_url_##]`가 실재함을 확인했다(§0-2-b). 넣는다면 §6-4의 비워둔 오른쪽 2칸 중 마지막 1칸에 `grid-column: -2 / -1; grid-row: 1 / -1; aspect-ratio: 16/10; object-fit: cover; border-radius: var(--radius-md)`로 배치하면 격자 정합이 유지된다. 다만 **대표 이미지가 없는 글에서는 블록이 통째로 사라져 행마다 레이아웃이 달라 보이는** 부작용이 있다 |
| **Q5** | 카테고리를 텍스트로 둘 것인가 **Badge(outline) 칩**으로 만들 것인가 | **텍스트** | 칩으로 만들면 메타 행 높이가 12px → 22px로 늘어 §4-2의 160px 계산이 다시 필요하고, 목록 전체에 칩이 반복되면 시선이 카테고리로 쏠린다. 칩을 원하면 `card.css`의 Badge outline을 그대로 재사용 가능(추가 CSS 0줄) |
| **Q6** | 카드 hover 표현 | **옅은 배경 + 제목 색 상승** | 위젯 구역은 "hover 배경 제거, 제목 색 변화만"으로 확정했지만(2026-09-03 d항) 그건 32px짜리 작은 항목이었다. 160px 행에서는 색 변화만으로는 어느 행에 있는지 알기 어렵다. **위젯과 완전히 통일하고 싶다면** 배경을 빼고 제목 색 변화만 남기면 된다(§6-5에서 `::before` 블록만 제거) |
| **Q7** | 페이징 — ①현재 페이지 강조를 JS로 구현할까 ②밴드 높이 160px가 과한가 | **①구현한다 ②160px 유지** | ①`sidebar.js`의 `initActiveState()` 선례와 동일하고 CSS 추가가 0줄(`data-variant`만 교체). 미채택 시 `content.js` 자체를 안 만든다. ②80px로 줄이면 아래 경계가 격자선을 벗어나지만 그 아래엔 광고 슬롯뿐이라 실질 피해는 작다 |
| **Q8** | **실사이트에서만 확인 가능한 5건** (계정 필요, 로컬로는 검증 불가) | — | ① `[##_paging_rep_link_##]`의 `href=` 포함 형식(§0-2-c) ② `[##_no_more_prev_##]`가 내려주는 정확한 클래스 문자열(§8-2) ③ `<s_list_empty>`가 홈에서도 렌더되는가(§7) ④ `[##_article_rep_summary_##]`에 HTML 태그가 섞여 나오는가(§6-5) ⑤ 관리자 "글 목록 표시 방식" 설정이 `s_index_article_rep`을 실제로 렌더하는가, 아니면 `s_list_rep`로 넘어가는가(§13-1) |
| **Q9** | 반응형 정책 | **이번 범위 밖** | 요구사항 문서의 "PC 먼저" 원칙 유지. 다만 이 구역은 1280px 미만에서 위젯 패널(320px)에 심하게 눌린다 — 그때 패널을 접으면 content-inner가 FAB와 겹치므로(§3) 함께 재검토할 것 |
| **Q10** | 24px 이상 제목의 자간 | **기존 `--tracking-base`(−0.01em) 사용** | §11-2. Design-system 조회가 복구되면 대형 자간 토큰 유무를 실측해 교체할지 결정 |

**→ Q1·Q2 확정 완료. developer는 Phase 3(구현)을 진행할 수 있다.** Q3~Q7은 설계자 제안값으로 진행하고, Q8은 실사이트 배포 후 확인한다.
