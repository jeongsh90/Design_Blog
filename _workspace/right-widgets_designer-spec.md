# 우측 위젯 사이드바(RIGHT WIDGETS) 비주얼 스펙

- **요청 원문:** "화면 우측에 사이드메뉴영역 하나더 만들고 NOTICE, RECENT POSTS, POPULAR POSTS, TAGS, RECENT Comment 영역 넣어, 글은 5개까지만 보여지게" (2026-09-03)
- **근거 문서:** `.claude/skills/tistory-skin-orchestrator/references/dashboard-shadcn-requirements.md` §다음 구역 대기열 4번
- **선행 구역:** Sidebar(완료) / Header(완료). 이 구역은 `sidebar-inset` 안, `<header>` 아래에 들어간다.
- **범위:** PC(100vw) 레이아웃만. 반응형은 다음 단계(요구사항 문서 §레이아웃 원칙 2).

---

## 0. 이 구역의 성격 — shadcn 포팅이 아니다

좌측 Sidebar/Header와 달리 이 구역에는 **대응하는 shadcn 컴포넌트가 없다.** 5개 위젯은 전부 **Tistory 서버가 렌더링하는 스킨 치환자 기능**이다. 따라서 이 구역의 "1:1 대응" 원칙은 다음과 같이 치환된다:

| 다른 구역 | 이번 구역 |
|---|---|
| shadcn `.tsx` 소스의 `data-slot`/클래스/상태 로직을 그대로 옮긴다 | **Tistory 공식 문서의 `<s_...>` / `[##_..._##]` 태그 문자열과 중첩 구조를 그대로 옮긴다** |
| 색상만 Design-system에서 채운다 | 동일 (색상·치수만 Design-system) |

**절대 금지:** `s_rctps_rep` → `s_recent_posts` 같은 "읽기 쉬운 이름"으로의 창작. 티스토리 서버는 정확히 이 문자열만 찾는다. 태그 이름을 한 글자라도 바꾸면 그 블록은 **치환되지 않고 화면에 그대로 노출**되거나 통째로 사라진다.

담을 컴포넌트 자체는 Design-system의 **Card**(shadcn Card 포트)를 원본 구조 그대로 쓴다 — 여기서만 "그대로 포팅" 원칙이 적용된다(§3).

---

## 1. Tistory 실측 레퍼런스 (2026-09-03 WebFetch 재확인 — 요구사항 문서 보정 2건 포함)

요구사항 문서 §4에 이미 기록된 내용을 재확인하면서 **실측으로 2건을 보정**했다. 아래가 최종 정본이다.

### 1-1. 보정 ① — `<s_sidebar_element>` 래퍼가 위젯마다 필수

요구사항 문서에는 이 래퍼가 빠져 있었다. 공식 문서 5개 페이지(`/sidebar/recent_post.html`, `/popular_post.html`, `/recent_notice.html`, `/recent_comment.html`, `/random_tag.html`, 대조군 `/count.html`) **전부**가 예제 최상단을 `<s_sidebar_element>`로 감싸고 있다.

- 각 위젯을 **하나씩** `<s_sidebar_element>`로 감싼다(5개 위젯 = 5개 래퍼).
- **`<s_sidebar>`(복수형 바깥 래퍼)는 현행 공식 문서 어디에도 없다.** 우리 `skin.html` 푸터 방문자 수는 `<s_sidebar><s_sidebar_element>` 2겹으로 돼 있는데(구식 관례), 이번 위젯에는 **`<s_sidebar_element>` 한 겹만** 쓴다. 기존 푸터는 이번 구역 범위 밖이라 손대지 않는다(→ §9 Q7).

### 1-2. 보정 ② — 사이드바 태그 위젯의 반복 태그는 `<s_random_tags>`

요구사항 문서는 `/contents/tag.html`(태그로그 **페이지**)의 `<s_tag>` / `<s_tag_rep>`를 인용했는데, **사이드바 위젯은 다른 태그를 쓴다** — `/sidebar/random_tag.html`의 `<s_random_tags>` 하나뿐이다(그룹 래퍼 없음). 치환자 3종(`tag_link`/`tag_class`/`tag_name`)은 동일하다.

### 1-3. 위젯별 정본 태그 세트

| # | 위젯 | 그룹(조건) 태그 | 반복 태그 | 치환자 |
|---|---|---|---|---|
| 1 | 공지 | `<s_rct_notice>` (공지 0건이면 통째로 미출력) | `<s_rct_notice_rep>` | `[##_notice_rep_link_##]` `[##_notice_rep_title_##]` |
| 2 | 최근 글 | — | `<s_rctps_rep>` | `[##_rctps_rep_link_##]` `_title_` `_rp_cnt_` `_date_` `_simple_date_` `_category_` `_category_link_` `_author_` + 조건부 `<s_rctps_rep_thumbnail>` → `[##_rctps_rep_thumbnail_##]` |
| 3 | 인기 글 | — | `<s_rctps_popular_rep>` | **안쪽 치환자 이름은 최근 글과 완전히 동일한 `rctps_rep_*`** (조건부 썸네일 블록도 `<s_rctps_rep_thumbnail>` 그대로) |
| 4 | 태그 | — | `<s_random_tags>` | `[##_tag_link_##]` `[##_tag_class_##]`(`cloud1`~`cloud5`) `[##_tag_name_##]` |
| 5 | 최근 댓글 | — | `<s_rctrp_rep>` | `[##_rctrp_rep_link_##]` `_desc_` `_name_` `_time_` |

### 1-4. "5개까지만" — skin.html이 통제할 수 없다 (재확인)

5개 문서 어디에도 반복 개수를 지정하는 스킨측 문법이 **없다**. 개수는 티스토리 관리자(꾸미기 > 사이드바 설정)의 위젯별 노출 개수로 결정되고, 서버가 **애초에 그 개수만큼만** 반복해 내려준다.

> **developer 필독:** `<s_..._rep>` 블록은 **정확히 한 번**(항목 1개짜리 템플릿)만 적는다. 5번 복붙하면 실사이트에서 **5×N개**로 곱해져 렌더된다. 로컬에서 5개로 보이게 하는 건 `make-preview.mjs`의 몫이다(§7).
>
> **사용자 액션 필요:** 관리자에서 5개 위젯의 노출 개수를 각각 5로 설정해야 요청("5개까지만")이 실제로 충족된다(→ §9 Q4).

---

## 2. 레이아웃

### 2-1. DOM 배치 — `sidebar-inset` 안, 헤더 **아래**

헤더 안이 아니라 헤더 아래 콘텐츠 영역에 둔다. 근거: 헤더는 56px 고정 높이의 단일 행(`header-inner`가 `space-between`)으로 이미 확정됐고, 위젯은 세로로 긴 패널이라 물리적으로 들어갈 수 없다.

구조는 **Design-system `layout.css` 90~119행의 `content` → `content-layout` → `content-inner` 3단을 그대로** 쓴다(원본 데모 `index.html` 321~324행과 동일한 슬롯 이름). 우측 패널은 `content-layout`의 두 번째 자식으로 들어간다:

```html
<main data-slot="sidebar-inset">
  <header data-slot="header"> … 확정됨, 변경 없음 … </header>

  <div data-slot="content">                <!-- 기존 슬롯 그대로 유지 -->
    <div data-slot="content-layout">       <!-- 신규: flex row -->
      <div data-slot="content-inner">      <!-- 신규: 본문(글 목록/본문) 자리 — content 구역이 채운다 -->
        [##_revenue_list_upper_##] … <s_list>/<s_article_rep>/<s_paging> … 
      </div>

      <aside data-slot="widgets" aria-label="블로그 위젯">   <!-- ★ 이번 구역 -->
        … 위젯 5개 …
      </aside>
    </div>
  </div>
</main>
```

- 기존 `[data-slot="content"]` **슬롯 이름을 유지**하는 것이 중요하다 — content 구역이 이어받을 자리이고, header 스펙이 "content 구역에서 이어받을 것"으로 이미 지목해 둔 이름이다. 안쪽에 `content-layout`/`content-inner` 두 겹만 새로 끼워 넣는다.
- 현재 `content` 안에 있는 `<s_list>` / `<s_article_rep>` / `<s_paging>` 스캐폴드는 **그대로 `content-inner` 안으로 옮기기만** 한다(무스타일 유지 — content 구역 범위).

### 2-2. 치수·배치 규칙

| 항목 | 값 | px | 비고 |
|---|---|---|---|
| `--widgets-width` | `calc(var(--spacing) * 80)` | 320 | §2-3 근거 |
| `--widgets-top` | `calc(var(--spacing) * 14)` | 56 | 헤더 높이와 동일(sticky 오프셋) |
| 패널 padding | `calc(var(--spacing) * 4)` | 16 | |
| 패널 padding-bottom | `calc(var(--spacing) * 16)` | 64 | FAB 회피(§2-5) |
| 카드 사이 gap | `calc(var(--spacing) * 4)` | 16 | |
| 패널 border-left | `1px solid var(--color-border)` | 1 | `.ms-toc-panel`(dashboard.css 3975행) 선례 |
| `content-layout` gap | `0` | 0 | 구분은 border-left가 담당 |

```css
[data-slot="content"] {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
}

[data-slot="content-layout"] {
  display: flex;
  flex: 1;
  align-items: flex-start;   /* ★ 필수 — stretch면 sticky가 무력화된다(§2-4) */
  min-height: 0;
}

[data-slot="content-inner"] {
  flex: 1 1 auto;
  min-width: 0;              /* 긴 제목/코드블록이 패널을 밀지 못하게 */
}

[data-slot="widgets"] {
  --widgets-width: calc(var(--spacing) * 80);
  --widgets-top: calc(var(--spacing) * 14);

  position: sticky;
  top: var(--widgets-top);
  align-self: flex-start;
  z-index: 1;                /* 헤더(9)·사이드바(10)보다 낮게 */

  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  gap: calc(var(--spacing) * 4);
  width: var(--widgets-width);
  max-height: calc(100svh - var(--widgets-top));
  overflow-y: auto;
  padding: calc(var(--spacing) * 4);
  padding-bottom: calc(var(--spacing) * 16);
  border-left: 1px solid var(--color-border);
  background-color: var(--color-background);
}
```

### 2-3. 폭을 320px로 정한 근거 (좌측 256px과 다르게 잡은 이유)

가용 폭을 역산했다: `320 − 32(패널 padding) = 288`(카드 폭) → `− 24`(카드 `data-size="sm"`의 좌우 padding 12×2) = `264` → `− 48`(썸네일) `− 12`(간격) = **제목 가용폭 204px**. 14px 한글 기준 줄당 약 14자 × 2줄 = 28자로, 실제 글 제목이 말줄임 없이 대부분 들어간다.

- 288px(`spacing*72`)로 잡으면 제목 가용폭이 172px(줄당 12자)로 떨어져 2줄로도 부족한 제목이 잦아진다.
- 좌측 256px과 굳이 대칭을 맞추지 않는 이유: 좌측은 아이콘+한 줄 라벨, 우측은 썸네일+2줄 제목+메타의 **카드 콘텐츠**라 요구 폭 자체가 다르다. 1440px 기준 본문은 `1440 − 256 − 321 = 863px`로 여전히 최대 영역을 차지해 위계는 유지된다(사이드바 접힘 시 1071px).
- **대안(기록):** 본문이 좁게 느껴지면 `spacing*72`(288)로 한 단계 줄인다 — 이때 썸네일을 40px로 함께 줄여야 제목 폭이 유지된다.

### 2-4. 스크롤 모델 — sticky + 패널 자체 스크롤

- 문서 전체 스크롤 모델은 header 스펙 §6-2에서 이미 확정됐다(헤더 sticky, 본문은 문서 스크롤). **`content-layout`에 `overflow-y:auto`를 주지 않는다** — Design-system 원본(layout.css 103~105행)은 `height:100vh` 내부 스크롤 셸이라 그 선언이 있지만, 우리는 의도적으로 이탈한 상태다. 그대로 복사하면 sticky와 문서 스크롤이 동시에 깨진다.
- 패널은 `position:sticky; top:56px`으로 본문이 스크롤돼도 계속 보인다(대시보드 느낌의 핵심). 위젯 총 높이가 뷰포트보다 크면 `max-height` + `overflow-y:auto`로 패널만 따로 스크롤된다.
- `align-items:flex-start`가 없으면 flex 기본 `stretch`로 패널이 행 전체 높이가 되어 sticky가 아무 효과도 내지 못한다 — 실측 시 반드시 확인할 항목.

### 2-5. 우측 하단 테마 토글 FAB와의 충돌 (실측 예측 — 반드시 처리)

`[data-floating-theme-toggle]`은 `position:fixed; right/bottom: calc(var(--spacing)*6); z-index:40; 36px`이다. 화면 오른쪽 아래 24~60px 구간을 점유하므로 **폭 320px짜리 우측 패널의 하단 오른쪽 모서리와 반드시 겹친다.**

- 처리: 패널 `padding-bottom: calc(var(--spacing) * 16)`(64px) — FAB 상단(60px)보다 4px 여유. 마지막 카드 내용이 FAB에 가리지 않는다.
- z-index는 그대로 둔다(FAB 40 > 패널 1) — FAB가 위에 떠 있는 것이 의도된 동작이다.
- 패널 자체 스크롤바가 FAB 아래를 지나가지만, 스크롤바는 `overflow-y:auto`의 오른쪽 끝(패널 안쪽)이고 FAB는 뷰포트 오른쪽 끝이라 실제 조작 간섭은 없다 — Playwright 스크린샷으로 확인할 것.

---

## 3. 위젯 공통 카드 — Design-system **Card를 원본 그대로 쓴다** (지난 사이드바 통계 카드와 반대 결론)

### 3-1. 판정 근거

| 판단 재료 | 실측 | 결론 |
|---|---|---|
| Card 컴포넌트 실측 | `components.css` 6278~6410행 + 1714~1757행(footer). 슬롯: `card` / `card-header` / `card-title` / `card-description` / `card-action` / `card-content` / `card-footer` / `card-edge-panel` | 구조 완비 |
| 데모 마크업 | `pages/card.html` 13~35행(기본), 56~67행(`data-size="sm"`) | 그대로 따라 쓸 수 있음 |
| 폭 적합성 | `data-size="sm"`은 `--card-spacing`을 16→12px로 줄인다. 카드 폭 288px에서 내부 264px 확보 | **적합** |
| 필요한 토큰 | `--color-card` / `--color-card-foreground` / `--radius-xl` / `--color-muted` / `--color-border` | `--card`·`--card-foreground`만 신규 추가 필요(§4) |
| 쓰지 않는 변형 | `data-layout="image"`(`--color-black` 필요), `card-edge-panel`, `card-footer`, `card-action`, `card-description` | 이식 대상에서 제외 |

**지난 사이드바 푸터 통계 카드와 결론이 다른 이유:** 그때는 16rem 사이드바 안 32px 높이 자리에 얹는 장식이라 Card 전체가 과했고, `--sidebar-*` 네임스페이스 안이었다. 이번 위젯은 제목+본문 목록을 가진 **진짜 카드 콘텐츠**이고 폭도 288px로 넉넉하다. `data-size="sm"`이라는 **원본 컴포넌트 자신의 변형**으로 충분히 대응되므로, 축소 사본을 새로 만들 이유가 없다.

### 3-2. 공통 마크업 뼈대

```html
<s_sidebar_element>
  <section data-slot="card" data-size="sm" data-widget="{notice|recent|popular|tags|comments}">
    <div data-slot="card-header">
      <h2 data-slot="card-title">{제목}</h2>
    </div>
    <div data-slot="card-content">
      … 위젯별 목록 …
    </div>
  </section>
</s_sidebar_element>
```

- 래퍼를 새로 만들지 않는다(`widget-card` 같은 신규 슬롯 없음) — `data-slot="card"`가 곧 위젯 카드이고, 위젯별 미세 차이는 **`data-widget` 속성 훅**으로만 분기한다(shadcn의 `data-variant`/`data-size` 관례와 동일한 방식).
- `<div>`가 아니라 `<section>` + `<h2>`를 쓴다 — 블로그 문서 구조상 실제 제목이므로 접근성상 heading이 맞다. 대신 `<h2>` 기본 마진이 카드 그리드를 깨뜨리므로 **위젯 스코프 안에서만** 리셋한다(컴포넌트 원본은 건드리지 않는다):
  ```css
  [data-slot="widgets"] [data-slot="card-title"] { margin: 0; }
  ```

### 3-3. 제목 라벨 표기 — 한글로 제안 (§9 Q1에서 확인 필요)

요청 원문의 "NOTICE, RECENT POSTS, POPULAR POSTS, TAGS, RECENT Comment" 표기를 **라벨 문자열 지정이 아니라 영역 지시로 해석**한다. 근거:

1. `RECENT Comment`만 대소문자 규칙이 깨져 있다 — 표기를 설계한 문장이 아니라 영역을 나열한 문장으로 읽힌다.
2. 이 프로젝트의 표기 관례는 **한글 우선**이다: 사이드바 그룹 라벨 "아카이브", 헤더 툴팁 "홈/태그/방명록/즐겨찾기", 검색 placeholder "검색", `aria-label` 전부 한글. 영문은 `Design`/`Ai`(카테고리 고유명)와 `Today`/`Total`(짧은 수치 라벨)뿐이다.
3. `pretendard-typography` 규칙: 전부 대문자 + 양수 자간(ALL CAPS 라벨의 통상 처리)은 이 스킬이 원칙적으로 금지한다. sidebar.css 227행에도 "한글 라벨이므로 uppercase / 양수 자간을 쓰지 않는다"는 확정 주석이 이미 있다.
4. Tistory 공식 문서 예제 `<h3>`도 "최근에 올라온 글", "이 블로그 인기글", "최근에 달린 댓글" 등 한글이다.

**제안 라벨:** `공지사항` / `최근 글` / `인기 글` / `태그` / `최근 댓글` (요청 순서 그대로 배치).

**사용자가 영문 표기를 원할 경우의 대안:** ALL CAPS가 아니라 Title Case(`Notice` / `Recent Posts` / …)를 쓴다. 굳이 대문자 영문을 원하면 Design-system `dashboard.css` 3980~3986행의 `.ms-cmd-panel-title`(영문 마이크로 라벨 전용: `--text-xs` / semibold / uppercase / `letter-spacing:0.05em`) 선례를 따르되, 이는 **영문 전용 예외**로 스펙에 명시해야 한다.

---

## 4. 색상 매핑

형식은 이전 구역과 동일하게 **hex**(요구사항 문서 §Sidebar, sidebar 스펙 §2 확정). 출처는 `Design-system/css/globals.css`의 활성 테마 블록(`:root` 20381~20422행 / `.dark` 20461~20503행) — `dashboard-skin/src/input.css`가 이미 쓰고 있는 그 블록이다.

### 4-1. 신규로 추가해야 하는 토큰 (2개)

Card 컴포넌트가 `--color-card` / `--color-card-foreground`를 요구하는데 `input.css`에 아직 없다. **Design-system 원본 값을 그대로** 가져온다(창작 아님).

| shadcn 변수명 | 라이트 | 다크 | Design-system 출처 |
|---|---|---|---|
| `--card` | `#ffffff` | `#171717` | globals.css 20385 / 20465행 |
| `--card-foreground` | `#000000` | `#fafafa` | globals.css 20386 / 20466행 |

```css
/* src/input.css — :root 블록에 추가 */
  --card: #ffffff;
  --card-foreground: #000000;

/* src/input.css — .dark 블록에 추가 */
  --card: #171717;
  --card-foreground: #fafafa;

/* src/input.css — @theme static 블록의 --color-* 매핑에 추가 */
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
```

### 4-2. 이번 구역이 쓰는 전체 토큰

| 변수 | 라이트 | 다크 | 쓰이는 곳 |
|---|---|---|---|
| `--color-background` | `#ffffff` | `#0a0a0a` | 패널 배경 |
| `--color-card` | `#ffffff` | `#171717` | 카드 배경 |
| `--color-card-foreground` | `#000000` | `#fafafa` | 카드 제목·항목 제목 |
| `--color-foreground` | `#000000` | `#fafafa` | 카드 링 섀도 계산(10% mix), hover 제목 |
| `--color-muted-foreground` | `#737373` | `#a1a1a1` | 메타(날짜/카테고리/작성자), 순위 숫자 |
| `--color-muted` | `#f5f5f5` | `#262626` | 썸네일 로딩 중 바탕 |
| `--color-accent` | `#f5f5f5` | `#404040` | 항목 hover 배경, 태그 chip hover |
| `--color-accent-foreground` | `#171717` | `#fafafa` | hover 시 제목 |
| `--color-border` | `#e5e5e5` | `#ffffff1a` | 패널 border-left, 항목 구분선, 태그 chip 테두리 |
| `--color-input` | `#e5e5e5` | `#ffffff26` | 다크에서 태그 chip 배경/테두리(Badge outline 원본 규칙) |
| `--color-ring` | `#a1a1a1` | `#737373` | focus-visible |

### 4-3. 패널 배경을 `--color-sidebar`로 하지 않은 이유 (기록)

좌측 사이드바와 짝을 이루도록 `--color-sidebar`(`#fafafa` / `#171717`)를 쓰는 안을 먼저 검토했으나 기각했다:

1. **다크에서 `--sidebar`(#171717)와 `--card`(#171717)가 완전히 동일한 값이다.** 패널 위에 카드를 얹으면 경계가 사라져 카드가 통째로 안 보인다.
2. `--sidebar-*`는 shadcn에서 Sidebar 컴포넌트에 스코프된 네임스페이스다. 다른 영역에서 쓰면 토큰 계약이 깨진다(이 프로젝트가 지금까지 지켜온 원칙).
3. Design-system 자신의 우측 패널 선례(`dashboard.css` 3966~3978행 `.ms-toc-panel`)가 정확히 `background-color: var(--color-background)` + `border-left: 1px solid var(--color-border)` + `overflow-y:auto`다.

라이트에서 패널(#fff)과 카드(#fff)가 같은 흰색이 되지만, Card 원본의 링 섀도(`0 0 0 1px` foreground 10% = `rgba(0,0,0,.1)`)가 경계를 만든다 — shadcn 라이트 대시보드의 정상적인 외형이다.

### 4-4. 대비 실측

| 조합 | 대비 | 판정 |
|---|---|---|
| 항목 제목 `#000` on `#ffffff` (라이트 카드) | 21:1 | AAA |
| 항목 제목 `#fafafa` on `#171717` (다크 카드) | 17.4:1 | AAA |
| 메타 `#737373` on `#ffffff` | 4.74:1 | AA (12px 본문 기준 4.5 통과 — **여유가 크지 않으니 메타 색을 더 흐리게 바꾸지 말 것**) |
| 메타 `#a1a1a1` on `#171717` | 7.08:1 | AAA |

### 4-5. 액센트(파랑)를 쓰지 않는다

`--sidebar-primary: #1447e6`(확정 파랑)은 **좌측 사이드바가 독점**한다. 우측 패널은 무채색 위계(제목 = card-foreground, 메타 = muted-foreground)만으로 구성한다. 이유: (a) `--sidebar-*` 네임스페이스를 밖으로 유출하지 않기 위해, (b) 본문(글)이 시선의 주인공이어야 하는데 좌·우 양쪽이 동시에 채색되면 화면에 액센트가 3곳이 되어 위계가 무너진다. 태그 chip도 `data-color` 없는 순수 `outline` 변형만 쓴다.

---

## 5. 위젯별 상세 마크업 매핑

공통 리스트 프리미티브를 먼저 정의하고(§5-1), 위젯 5개가 이를 공유한다. 배치 순서는 **요청 순서 그대로**: 공지 → 최근 글 → 인기 글 → 태그 → 최근 댓글.

### 5-1. 공통 리스트 슬롯

| 슬롯 | 용도 |
|---|---|
| `widget-list` | `<ul>` — 목록 컨테이너(마진/패딩/불릿 리셋) |
| `widget-item` | `<li>` — 항목. 두 번째부터 위쪽 구분선 |
| `widget-link` | `<a>` — 행 전체를 덮는 링크(flex row) |
| `widget-thumb` | `<img>` — 대표이미지(있을 때만) |
| `widget-rank` | `<span>` — 인기글 순위(CSS counter, 마크업엔 숫자 없음) |
| `widget-body` | 제목+메타 세로 스택 |
| `widget-title` | 제목/댓글 본문 — 2줄 클램프 |
| `widget-meta` | 메타 한 줄(카테고리·날짜·작성자) |
| `widget-dot` | 메타 구분점 `·` (`aria-hidden`) |
| `widget-tags` | 태그 chip을 감싸는 flex-wrap 컨테이너 |

```css
[data-slot="widget-list"] { margin: 0; padding: 0; list-style: none; }

[data-slot="widget-item"] + [data-slot="widget-item"] {
  border-top: 1px solid var(--color-border);   /* Card 원본의 accordion-item 구분선 관용구와 동일 */
}

[data-slot="widget-link"] {
  display: flex;
  align-items: flex-start;
  gap: calc(var(--spacing) * 3);
  padding-block: calc(var(--spacing) * 2.5);
  padding-inline: calc(var(--spacing) * 2);
  margin-inline: calc(var(--spacing) * -2);    /* hover 배경이 카드 안쪽 여백까지 자연스럽게 번지도록 */
  border-radius: var(--radius-md);
  color: inherit;
  text-decoration: none;
  transition-property: background-color, color;
  transition-duration: var(--default-transition-duration);
  transition-timing-function: var(--default-transition-timing-function);
}

[data-slot="widget-link"]:hover { background-color: var(--color-accent); }
[data-slot="widget-link"]:hover [data-slot="widget-title"] { color: var(--color-accent-foreground); }

[data-slot="widget-link"]:focus-visible {          /* breadcrumb-link(header.css 258행)와 동일 규격 */
  outline: calc(var(--spacing) * 0.5) solid var(--color-ring);
  outline-offset: calc(var(--spacing) * 0.5);
}

[data-slot="widget-title"] {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  overflow: hidden;
  font: var(--font-weight-medium) var(--text-sm)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-sm);
  color: var(--color-card-foreground);
  word-break: keep-all;          /* pretendard 규칙: 한글 어절 단위 줄바꿈 */
  overflow-wrap: anywhere;       /* 긴 영문/URL 제목이 폭을 밀지 않도록 */
}

[data-slot="widget-meta"] {
  display: flex;
  align-items: center;
  gap: calc(var(--spacing) * 1);
  margin-top: calc(var(--spacing) * 1);
  overflow: hidden;
  font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  color: var(--color-muted-foreground);
  white-space: nowrap;
  text-overflow: ellipsis;
}

[data-slot="widget-thumb"] {
  flex-shrink: 0;
  width: calc(var(--spacing) * 12);    /* 48px */
  height: calc(var(--spacing) * 12);
  object-fit: cover;
  border-radius: var(--radius-md);
  background-color: var(--color-muted);   /* 로딩 전/깨진 이미지 바탕 */
}

[data-slot="widget-body"] { min-width: 0; flex: 1 1 auto; }
```

**썸네일 유/무가 같은 목록에 섞여도 자연스럽게 보이게 하는 규칙:** `widget-link`는 `align-items:flex-start`이고 `widget-body`가 `flex:1`이므로, `<img>`가 없으면 본문이 자동으로 행 전체 폭을 쓴다(빈 자리를 남기는 placeholder 박스를 넣지 않는다). 두 형태를 섞어 렌더한 상태로 반드시 실측할 것(§7에서 홀수 인덱스만 썸네일을 주는 이유).

### 5-2. 공지사항

```html
<s_sidebar_element>
  <s_rct_notice>
    <section data-slot="card" data-size="sm" data-widget="notice">
      <div data-slot="card-header"><h2 data-slot="card-title">공지사항</h2></div>
      <div data-slot="card-content">
        <ul data-slot="widget-list">
          <s_rct_notice_rep>
            <li data-slot="widget-item">
              <a href="[##_notice_rep_link_##]" data-slot="widget-link">
                <span data-slot="widget-body">
                  <span data-slot="widget-title">[##_notice_rep_title_##]</span>
                </span>
              </a>
            </li>
          </s_rct_notice_rep>
        </ul>
      </div>
    </section>
  </s_rct_notice>
</s_sidebar_element>
```

`<s_rct_notice>`는 **카드 바깥·`s_sidebar_element` 안쪽**에 둔다 — 공지가 0건이면 카드째로 사라져야 하기 때문이다(제목만 덩그러니 남으면 안 된다).

### 5-3. 최근 글

```html
<s_sidebar_element>
  <section data-slot="card" data-size="sm" data-widget="recent">
    <div data-slot="card-header"><h2 data-slot="card-title">최근 글</h2></div>
    <div data-slot="card-content">
      <ul data-slot="widget-list">
        <s_rctps_rep>
          <li data-slot="widget-item">
            <a href="[##_rctps_rep_link_##]" data-slot="widget-link">
              <s_rctps_rep_thumbnail>
                <img data-slot="widget-thumb" src="[##_rctps_rep_thumbnail_##]" alt="" loading="lazy" />
              </s_rctps_rep_thumbnail>
              <span data-slot="widget-body">
                <span data-slot="widget-title">[##_rctps_rep_title_##]</span>
                <span data-slot="widget-meta">
                  <span>[##_rctps_rep_category_##]</span>
                  <span data-slot="widget-dot" aria-hidden="true">·</span>
                  <span>[##_rctps_rep_simple_date_##]</span>
                </span>
              </span>
            </a>
          </li>
        </s_rctps_rep>
      </ul>
    </div>
  </section>
</s_sidebar_element>
```

**의도적으로 쓰지 않는 치환자와 그 이유:**

- `[##_rctps_rep_category_link_##]` — 공식 문서 예제는 카테고리를 **별도 `<a>`**로 감싸지만, 우리는 행 전체를 하나의 링크로 만든다. `<a>` 안에 `<a>`는 HTML 사양상 무효이고 브라우저가 DOM을 강제 교정해 레이아웃이 깨진다. → 카테고리는 링크 없는 텍스트로만 표기.
- `[##_rctps_rep_rp_cnt_##]`(댓글 수) — 댓글이 없으면 `0`이 그대로 찍혀 메타 줄에 잡음이 되는데, 티스토리에는 "0일 때 숨김" 조건 태그가 없다. 댓글 정보는 5번 위젯(최근 댓글)이 이미 담당한다. → 생략(§9 Q6에 재확인 항목으로 남김).
- `[##_rctps_rep_date_##]`(시분 포함) — 320px 폭 메타 한 줄에 과하다. `_simple_date_`(yyyy.mm.dd) 사용.
- `[##_rctps_rep_author_##]` — 팀블로그 전용. 이 블로그는 1인 운영.

### 5-4. 인기 글 — 최근 글과의 시각 구분

**반복 태그만 `<s_rctps_popular_rep>`로 다르고 안쪽 치환자는 최근 글과 완전히 동일하다**(문서 실측). 그래서 시각적으로 구분하지 않으면 사용자가 같은 목록이 두 번 나온 것으로 오인한다. 구분 장치 2개:

1. **썸네일을 쓰지 않는다** — `<s_rctps_rep_thumbnail>` 블록 자체를 넣지 않는다(최근 글 = 이미지 있는 카드형 / 인기 글 = 텍스트 랭킹형).
2. **순위 번호(01~05)** — CSS counter로 그린다. 서버가 반복 렌더하므로 JS 없이 자동으로 매겨진다.

```html
<s_sidebar_element>
  <section data-slot="card" data-size="sm" data-widget="popular">
    <div data-slot="card-header"><h2 data-slot="card-title">인기 글</h2></div>
    <div data-slot="card-content">
      <ul data-slot="widget-list">
        <s_rctps_popular_rep>
          <li data-slot="widget-item">
            <a href="[##_rctps_rep_link_##]" data-slot="widget-link">
              <span data-slot="widget-rank" aria-hidden="true"></span>
              <span data-slot="widget-body">
                <span data-slot="widget-title">[##_rctps_rep_title_##]</span>
                <span data-slot="widget-meta"><span>[##_rctps_rep_category_##]</span></span>
              </span>
            </a>
          </li>
        </s_rctps_popular_rep>
      </ul>
    </div>
  </section>
</s_sidebar_element>
```

```css
[data-widget="popular"] [data-slot="widget-list"] { counter-reset: widget-rank; }

[data-slot="widget-rank"] {
  flex-shrink: 0;
  width: calc(var(--spacing) * 5);          /* 20px — 01~05 tabular 폭 */
  padding-top: calc(var(--spacing) * 0.5);  /* 제목 첫 줄 baseline 정렬 */
  font: var(--font-weight-semibold) var(--text-xs)/var(--leading-snug) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  font-variant-numeric: tabular-nums;
  color: var(--color-muted-foreground);
}

[data-slot="widget-rank"]::before {
  counter-increment: widget-rank;
  content: counter(widget-rank, decimal-leading-zero);
}
```

### 5-5. 태그

```html
<s_sidebar_element>
  <section data-slot="card" data-size="sm" data-widget="tags">
    <div data-slot="card-header"><h2 data-slot="card-title">태그</h2></div>
    <div data-slot="card-content">
      <div data-slot="widget-tags">
        <s_random_tags>
          <a href="[##_tag_link_##]" data-slot="badge" data-variant="outline" class="[##_tag_class_##]">[##_tag_name_##]</a>
        </s_random_tags>
      </div>
    </div>
  </section>
</s_sidebar_element>
```

- chip은 **Design-system Badge**(`components.css` 7948~7977행 + `outline` 변형 8142~8160행)를 그대로 포팅해 쓴다 — outline 변형이 참조하는 토큰(`--color-border`/`--color-background`/`--color-foreground`/`--color-accent`/`--color-input`)이 전부 이미 정의돼 있어 추가 토큰이 필요 없다. `data-color`(blue/green/…) 변형은 색상군 토큰이 없으므로 이식하지 않는다(Button 이식 때와 동일한 원칙).
- `[##_tag_class_##]`는 `class` 속성으로 들어간다(문서 정본 그대로). 우리 스타일링은 `data-slot`이 담당하므로 충돌하지 않는다.

```css
[data-slot="widget-tags"] {
  display: flex;
  flex-wrap: wrap;
  gap: calc(var(--spacing) * 1.5);
}

/* cloud1~cloud5 — 크기가 아니라 강조도(색/굵기)로 5단계 (§9 Q2) */
[data-slot="widget-tags"] .cloud1 { color: var(--color-muted-foreground); opacity: 0.7; }
[data-slot="widget-tags"] .cloud2 { color: var(--color-muted-foreground); opacity: 0.85; }
[data-slot="widget-tags"] .cloud3 { color: var(--color-muted-foreground); opacity: 1; }
[data-slot="widget-tags"] .cloud4 { color: var(--color-foreground); }
[data-slot="widget-tags"] .cloud5 { color: var(--color-foreground); font-weight: var(--font-weight-semibold); }
```

### 5-6. 최근 댓글

```html
<s_sidebar_element>
  <section data-slot="card" data-size="sm" data-widget="comments">
    <div data-slot="card-header"><h2 data-slot="card-title">최근 댓글</h2></div>
    <div data-slot="card-content">
      <ul data-slot="widget-list">
        <s_rctrp_rep>
          <li data-slot="widget-item">
            <a href="[##_rctrp_rep_link_##]" data-slot="widget-link">
              <span data-slot="widget-body">
                <span data-slot="widget-title">[##_rctrp_rep_desc_##]</span>
                <span data-slot="widget-meta">
                  <span>[##_rctrp_rep_name_##]</span>
                  <span data-slot="widget-dot" aria-hidden="true">·</span>
                  <span>[##_rctrp_rep_time_##]</span>
                </span>
              </span>
            </a>
          </li>
        </s_rctrp_rep>
      </ul>
    </div>
  </section>
</s_sidebar_element>
```

댓글 본문은 제목이 아니므로 `widget-title`의 굵기를 낮춘다:

```css
[data-widget="comments"] [data-slot="widget-title"] {
  font-weight: var(--font-weight-normal);
  line-height: var(--leading-normal);
}
```

### 5-7. 항목 0건일 때 (공지 외 4개 위젯)

`<s_rct_notice>` 같은 조건 그룹이 있는 건 공지뿐이다. 나머지 4개는 **데이터가 0건이어도 카드와 제목이 남고 목록만 비어** 렌더된다(티스토리에 `s_..._empty` 류 태그 없음 — 문서 실측). 새 블로그 초기에 반드시 마주치는 상태이므로 폴백을 넣는다:

```css
[data-slot="widget-list"]:not(:has(> li))::after,
[data-slot="widget-tags"]:not(:has(> a))::after {
  content: "아직 없습니다";
  display: block;
  padding-block: calc(var(--spacing) * 2);
  font: var(--font-weight-normal) var(--text-xs)/var(--leading-normal) var(--font-sans);
  letter-spacing: var(--tracking-xs);
  color: var(--color-muted-foreground);
}
```

`:empty`가 아니라 `:not(:has(> li))`를 쓰는 이유: 서버 출력에는 공백/줄바꿈 텍스트 노드가 남아 `:empty`가 매칭되지 않는다. `:has`는 이 프로젝트가 이미 sidebar.css 전반에서 쓰고 있다.

---

## 6. 타이포그래피 (pretendard-typography 대조)

| 요소 | 토큰 조합 | = 스케일 | 확인 |
|---|---|---|---|
| 카드 제목 | `--font-weight-medium` `--text-base`/`--leading-snug` `--tracking-base` | 16 / 1.375 / 500 / −0.01em | Body~H4 사이. Card 컴포넌트 원본 값 그대로 |
| 항목 제목 | `--font-weight-medium` `--text-sm`/`--leading-snug` `--tracking-sm` | 14 / 1.375 / 500 / −0.008em | **Label** (14/1.4/500/−0.008em)과 일치 |
| 댓글 본문 | `--font-weight-normal` `--text-sm`/`--leading-normal` `--tracking-sm` | 14 / 1.5 / 400 / −0.008em | **Small**과 일치 |
| 메타 | `--font-weight-normal` `--text-xs`/`--leading-normal` `--tracking-xs` | 12 / 1.5 / 400 / −0.006em | Caption(12/1.4/500)의 **400 변형** — 선례: sidebar.css 163행 `sidebar-stat-label`, 209행 group-label 계열이 이미 xs+normal/medium을 혼용 |
| 순위 숫자 | `--font-weight-semibold` `--text-xs` + `tabular-nums` | 12 / 600 | 선례: sidebar.css 173행 `sidebar-stat-value` |
| 태그 chip | Badge 원본(`--font-weight-medium` `--text-xs`/`--leading-normal` `--tracking-xs`) | 12 / 500 / −0.006em | **Caption**과 일치 |

- 양수 자간·uppercase 없음 ✔
- 굵기는 400/500/600 세 값만 사용 ✔
- 임의 px/rem 없음(전부 토큰) ✔
- 한글 제목에 `word-break: keep-all` 적용 ✔

---

## 7. "5개" 로컬 검증 — `make-preview.mjs` 확장 지시

현재 생성기는 `<s_...>` 마커를 **한 번 벗기기만** 한다(45행 `html.replace(/<\/?s_[a-z_0-9]+>/g, "")`). 이번 위젯은 진짜 반복 블록이라 그대로 두면 각 위젯이 **1개 항목**으로만 보여 "5개" 요구를 검증할 수 없다.

### 7-1. 처리 순서 (중요)

새 확장 단계는 **반드시 기존 1)·2) 단계보다 앞**에 온다:

```
0) [신규] 반복 블록 확장 — 항목별 더미 값을 그 자리에서 직접 주입
1) (기존) 남은 <s_*> 마커 제거      ← s_sidebar_element / s_rct_notice / 남긴 s_rctps_rep_thumbnail 이 여기서 사라진다
2) (기존) 남은 [##_..._##] → 전역 더미
3) (기존) ./images/ 경로 치환
```

0단계에서 항목별 값을 이미 **리터럴로 박아 넣기 때문에** 2단계(키 하나당 값 하나인 전역 테이블)와 충돌하지 않는다. 이 순서가 아니면 5개 항목이 전부 같은 제목이 된다.

### 7-2. 구현 스케치

```js
const THUMB =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96">' +
    '<rect width="96" height="96" fill="#d4d4d4"/></svg>'
  );   // 외부 URL 금지 — 오프라인에서도 그대로 렌더돼야 한다

const REPEATS = [
  {
    tag: "s_rct_notice_rep",
    count: 3,                            // 공지는 5개까지 갈 일이 드물다 — 3개로 실제 상황 재현
    item: (i) => ({
      notice_rep_link: `/notice/${i + 1}`,
      notice_rep_title: [
        "블로그 운영 원칙과 자료 이용 안내",
        "댓글·방명록 이용 안내",
        "폰트 라이선스 관련 공지",
      ][i],
    }),
  },
  {
    tag: "s_rctps_rep",
    count: 5,
    // 썸네일 있는 항목/없는 항목이 반드시 섞이게 한다 (§5-1 정렬 검증용)
    conditional: { tag: "s_rctps_rep_thumbnail", when: (i) => i % 2 === 0 },
    item: (i) => ({
      rctps_rep_link: `/${101 + i}`,
      rctps_rep_title: [
        "Pretendard 자간·행간을 실제로 어디까지 좁혀야 하나",
        "shadcn/ui 사이드바를 바닐라 CSS로 1:1 포팅하기",
        "로고 리디자인 전후 비교",
        "티스토리 스킨에서 Tailwind v4를 쓰는 법",
        "AI 프롬프트 아카이브를 시작하며",
      ][i],
      rctps_rep_category: ["Design", "Design", "Design", "Ai", "Ai"][i],
      rctps_rep_category_link: "/category/Design",
      rctps_rep_simple_date: `2026.09.0${i + 1}`,
      rctps_rep_date: `2026.09.0${i + 1} 21:0${i}`,
      rctps_rep_rp_cnt: String([3, 0, 12, 5, 1][i]),
      rctps_rep_thumbnail: THUMB,
    }),
  },
  {
    tag: "s_rctps_popular_rep",
    count: 5,
    conditional: { tag: "s_rctps_rep_thumbnail", when: () => false },  // 인기글은 썸네일 미사용(§5-4)
    item: (i) => ({ /* 위와 같은 rctps_rep_* 키, 다른 제목/카테고리 */ }),
  },
  {
    tag: "s_rctrp_rep",
    count: 5,
    item: (i) => ({
      rctrp_rep_link: `/${101 + i}#comment`,
      rctrp_rep_desc: [
        "이 스킨 정말 깔끔하네요. 혹시 배포 계획도 있으신가요?",
        "자간 값 참고해서 저도 적용해봤습니다 감사합니다",
        "폰트 CDN 링크가 궁금합니다",
        "두 번째 이미지가 안 보여요",
        "잘 보고 갑니다",
      ][i],
      rctrp_rep_name: ["김디자", "무명", "publisher", "지나가던 개발자", "이웃"][i],
      rctrp_rep_time: `2026.09.0${i + 1} 1${i}:0${i}`,
    }),
  },
  {
    tag: "s_random_tags",
    count: 12,   // 태그는 실제로 여러 개가 wrap 되는 모습을 봐야 한다
    item: (i) => ({
      tag_name: ["Pretendard","shadcn","Tailwind","타이포그래피","로고","Figma","프롬프트","스킨","CSS","다크모드","아카이브","디자인시스템"][i],
      tag_link: `/tag/${i}`,
      tag_class: `cloud${[5,4,4,3,3,3,2,2,2,1,1,1][i]}`,   // 5단계가 전부 등장하도록
    }),
  },
];

function expandRepeats(html, repeats) {
  for (const { tag, count, item, conditional } of repeats) {
    const block = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g");
    html = html.replace(block, (_, tpl) => {
      let out = "";
      for (let i = 0; i < count; i++) {
        let one = tpl;
        if (conditional) {
          const cond = new RegExp(`<${conditional.tag}>([\\s\\S]*?)</${conditional.tag}>`, "g");
          one = conditional.when(i) ? one.replace(cond, "$1") : one.replace(cond, "");
        }
        const values = item(i);
        one = one.replace(/\[##_([a-z_0-9]+)_##\]/g, (whole, key) =>
          key in values ? values[key] : whole);
        out += one;
      }
      return out;
    });
  }
  return html;
}
```

**주의점 3가지**
1. 정규식은 **non-greedy**(`[\s\S]*?`)여야 한다. greedy면 최근 글 블록의 여는 태그부터 인기 글 블록의 닫는 태그까지 한 덩어리로 먹는다.
2. `s_rctps_popular_rep` 블록의 치환자 키는 최근 글과 **동일한 `rctps_rep_*`**다(서버 동작 그대로). 블록 단위로 확장하므로 서로 간섭하지 않는다 — 두 블록에 서로 다른 제목 배열을 주는 것을 잊지 말 것(같으면 §5-4 시각 구분 검증이 무의미해진다).
3. 조건부 썸네일 블록은 **확장 안에서** 처리해야 한다. 1단계(전역 마커 제거)에 맡기면 모든 항목에 썸네일이 생겨 "썸네일 없는 항목" 케이스를 볼 수 없다.

### 7-3. 추가 산출물 — 빈 상태 사본

`REPEATS`의 `count`를 전부 0으로 돌리고 `<s_rct_notice> … </s_rct_notice>` 블록을 통째로 제거한 사본을 `_workspace/right-widgets_mockup-empty.html`로 함께 생성한다. §5-7 폴백("아직 없습니다")과 공지 카드 자체가 사라지는 동작을 검증하는 유일한 방법이다(신규 블로그의 실제 초기 상태이기도 하다).

기존 출력 파일명(`sidebar_mockup-preview.html` / `sidebar_mockup-nojs.html`)은 **그대로 둔다** — 이름은 낡았지만(실제로는 스킨 전체 프리뷰) 기존 검증 문서들이 이 경로를 참조하고 있어 개명 비용이 이득보다 크다.

### 7-4. Playwright 실측 체크리스트

- [ ] 위젯 카드 5장이 요청 순서대로 렌더 / 각 목록 항목 수 = 5(공지 3, 태그 12)
- [ ] 최근 글에서 썸네일 있는 행·없는 행의 제목 시작 X좌표가 각각 일관되고 세로 정렬이 흐트러지지 않음
- [ ] 인기 글 순위가 `01`~`05`로 매겨짐(CSS counter, JS 없음)
- [ ] 태그 chip이 여러 줄로 wrap되고 cloud1~5가 시각적으로 구분됨
- [ ] 라이트/다크 양쪽에서 카드 경계가 보임(특히 **라이트: 흰 카드 on 흰 패널**, **다크: #171717 카드 on #0a0a0a**)
- [ ] 본문을 아래로 스크롤해도 패널이 `top:56px`에 고정되고 헤더 아래로 파고들지 않음
- [ ] 위젯 총 높이 > 뷰포트일 때 패널만 따로 스크롤되고 문서 스크롤과 충돌하지 않음
- [ ] `document.documentElement.scrollWidth === window.innerWidth` (가로 오버플로 0)
- [ ] 우측 하단 테마 토글 FAB가 마지막 카드 내용을 가리지 않음
- [ ] 사이드바 접힘/펼침 전환 시 패널 폭 320px 불변, 본문 폭만 변함
- [ ] 항목 hover 배경/제목 색 변화, Tab 이동 시 focus-visible 링
- [ ] 빈 상태 사본에서 공지 카드가 사라지고 나머지 4장에 "아직 없습니다"가 뜸

---

## 8. 파일 구성 / 신규·수정 목록

| 파일 | 작업 | 내용 |
|---|---|---|
| `dashboard-skin/components/card.css` | **신규** | Design-system Card 포팅(§3-1의 "쓰지 않는 변형" 제외). Button/Breadcrumb처럼 header.css에 끼워 넣지 않고 처음부터 독립 파일로 만든다 — content 구역이 확실히 다시 쓸 공용 프리미티브이고, Tooltip 때 겪은 "나중에 추출" 비용을 미리 없앤다. Badge도 여기 함께 둔다(태그 chip 전용이지만 같은 성격의 프리미티브). |
| `dashboard-skin/components/widgets.css` | **신규** | 패널 레이아웃(§2-2) + `content-layout`/`content-inner` + 리스트 프리미티브(§5-1) + 위젯별 분기(§5-4~5-7) |
| `dashboard-skin/skin.html` | 수정 | `content` 안에 `content-layout`/`content-inner` 2겹 삽입 + `<aside data-slot="widgets">` 5개 위젯 + `<link>` 2줄 추가 |
| `dashboard-skin/src/input.css` | 수정 | `--card`/`--card-foreground` raw 토큰 + `--color-card`/`--color-card-foreground` 매핑(§4-1) |
| `dashboard-skin/tools/make-preview.mjs` | 수정 | §7 반복 확장 + 빈 상태 사본 |
| `dashboard-skin/README.md` | 수정 | 업로드 파일 목록에 `card.css`/`widgets.css` 추가 |

**JS는 필요 없다.** 순위는 CSS counter, 상태 토글 없음, 반복은 서버가 처리. `widgets.js`를 만들지 말 것(§9 Q5에서 접기 토글을 도입하기로 결정되면 그때 sidebar.js의 쿠키 패턴을 그대로 따른다).

스타일시트 로드 순서(`skin.html`): `tailwind.css` → `tooltip.css` → **`card.css`** → `sidebar.css` → `header.css` → **`widgets.css`**. 프리미티브를 먼저, 그것을 쓰는 구역 스타일을 나중에 둔다(현행 관례와 동일).

---

## 9. 확인 필요 — 판단 근거와 제안값

| # | 항목 | 스펙 저자 제안 | 근거 / 대안 |
|---|---|---|---|
| **Q1** | 위젯 제목을 요청 원문대로 영문 대문자(`NOTICE`, `RECENT POSTS`…)로 쓸 것인가 | **한글 — 공지사항 / 최근 글 / 인기 글 / 태그 / 최근 댓글** | §3-3에 근거 4가지. 영문을 원하면 ALL CAPS 대신 Title Case를 권함(대문자+양수 자간은 `pretendard-typography` 원칙 위반, sidebar.css 227행에 동일 취지 확정 주석 존재). |
| **Q2** | 태그 `cloud1`~`cloud5` 5단계를 **글자 크기**로 차등할 것인가 | **크기 고정(12px) + 색/굵기 5단계**(§5-5) | 진짜 태그 클라우드처럼 크기를 5단계로 벌리려면 12/13/14/16/18px 같은 임의 값이 필요한데, 이 프로젝트의 텍스트 토큰은 `--text-xs/sm/base` 3개뿐이고 "임의 px 금지"가 원칙이다. 또한 320px 폭에서 크기가 뒤섞이면 chip 높이가 들쭉날쭉해져 대시보드 정연함이 깨진다. **대안:** `--text-xs`(cloud1~3) / `--text-sm`(cloud4~5) 2단계까지는 토큰 안에서 가능. |
| **Q3** | 인기 글과 최근 글의 시각 구분 방식 | **인기 글 = 순위 숫자 01~05 + 썸네일 없음 / 최근 글 = 썸네일 + 카테고리·날짜** | 두 위젯의 치환자가 서버상 완전히 동일해 그대로 두면 같은 목록이 두 번 나온 것으로 보인다. **대안:** 인기 글에도 썸네일을 넣고 순위 배지만 얹기(더 화려하지만 패널이 이미지로 무거워짐). |
| **Q4** | "5개까지만" 실제 적용 | **사용자가 티스토리 관리자(꾸미기 > 사이드바 설정)에서 위젯별 노출 개수를 5로 설정해야 함** | §1-4. 스킨 코드로는 통제 불가(문서 실측). 스킨은 항목 1개짜리 템플릿만 담는다. 관리자 화면의 실제 옵션 명칭/최대값은 계정 접근 후 확인 필요. |
| **Q5** | 우측 패널을 접을 수 있게 할 것인가 | **이번 구역에서는 만들지 않음(항상 노출)** | 요청에 없다. 필요해지면 sidebar의 쿠키(`sidebar_state`) + `data-state` 토글 패턴을 그대로 복제하고 헤더에 두 번째 trigger를 둔다 — 그때 비로소 `widgets.js`가 생긴다. |
| **Q6** | 최근 글 메타에 댓글 수를 넣을 것인가 | **넣지 않음** | §5-3. 댓글 0건이면 `0`이 그대로 찍히는데 조건 태그가 없다. **대안:** 넣되 아이콘+숫자로 우측 정렬(0도 그대로 노출됨을 감수). |
| **Q7** | 기존 푸터 방문자 수의 `<s_sidebar>` 바깥 래퍼 | **이번 구역에서는 손대지 않음 / 실계정 검증 후 판단** | 현행 공식 문서에는 `<s_sidebar>`가 존재하지 않는다(대조군 `/sidebar/count.html`도 `<s_sidebar_element>` 한 겹). 로컬 프리뷰는 모든 `<s_*>`를 벗겨내 차이가 안 보이므로, 실사이트에서 방문자 수가 정상 출력되는지 확인한 뒤 정리하는 것이 안전하다. |
| **Q8** | 글 상세(permalink) 페이지에서도 우측 패널을 보일 것인가 | **보인다(전 페이지 공통)** | 요청이 "화면 우측에 사이드메뉴영역 하나 더"이므로 셸의 일부로 해석. 본문 가독폭을 더 확보하고 싶으면 `body[id="tt-body-page"]` 등 body id로 숨기는 분기가 가능하지만, 이는 content 구역에서 본문 폭 정책과 함께 결정하는 것이 맞다. |
| **Q9** | 실사이트 미검증 항목(계정 없음) | — | ① 위젯 5종이 관리자 설정과 무관하게 skin.html 위치 그대로 렌더되는지, ② `<s_sidebar_element>`가 관리자 사이드바 설정과 어떤 방식으로 연동되는지, ③ 티스토리 서버 주입 요소(관리 메뉴바·광고)가 sticky 패널과 겹치는지 — 전부 실계정 업로드 후 확인 필요. 이전 구역들과 동일한 성격의 미검증 항목이다. |

---

## 10. 다음 구역(content)이 이어받을 것

- `[data-slot="content-inner"]`가 본문 자리다. **패딩은 이 스펙에서 정하지 않았다** — 글 목록/본문 타이포그래피와 함께 content 구역이 정한다(`min-width:0`과 `flex:1 1 auto`만 확정).
- `card.css`(Card + Badge)가 공용 프리미티브로 준비돼 있다 — 글 목록 카드에 그대로 재사용할 것.
- `--card`/`--card-foreground` 토큰이 추가됐다. 아직 없는 토큰: `--secondary` / `--destructive` / `--popover` / `--sys-*` / 색상군(blue-·green-…).
- "맨 위로" 버튼은 여전히 우측 하단 FAB **위**(`bottom: calc(var(--spacing)*20)`)에 쌓을 자리로 예약돼 있다. 우측 위젯 패널이 320px을 차지하므로, 그 버튼도 패널 위에 겹쳐 뜨게 된다는 점을 함께 고려할 것.
- 반응형(미착수): 이 패널은 `1280px` 미만에서 본문을 심하게 압박한다. 후보 정책 — `1280px` 미만에서 패널을 숨기고 본문 하단으로 내리거나(전통 블로그 배치), 좌측 사이드바를 아이콘 모드로 자동 전환. PC 작업 완료 후 결정.
