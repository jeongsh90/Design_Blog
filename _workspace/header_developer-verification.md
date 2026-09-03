# Header 구현 · 검증 보고서

- **작성:** tistory-skin-designer + tistory-skin-developer (범위가 좁아 스펙+구현을 한 턴에 진행, general-purpose로 대신 호출됨)
- **일자:** 2026-09-02
- **스펙:** `_workspace/header_designer-spec.md`
- **산출물:** `dashboard-skin/components/header.css` · `header.js` · `skin.html`(갱신) · `tailwind.css`(재빌드) · `README.md`(갱신)
- **검증 환경:** Playwright(Chromium) · **1440×900 PC 뷰포트** · `http://localhost:4321` 정적 서버
- **사용자 요청:** "헤더 우측 끝에 홈,태그,방명록 버튼 sm사이즈로 배치하고 디자인시스템에 적용된 헤더 동일하게"

---

## 1. 무엇을 했나

1. `D:\MyCloud\2026포트폴리오\Design-system\index.html` 292–319행의 헤더 마크업과
   `css/layout.css` 23–64행의 레이아웃을 **선언 단위로 그대로** 이식했다.
2. Button(`components.css` 796–1075행)·Breadcrumb(6412–6464행) 컴포넌트를 함께 포팅했다
   (헤더가 처음으로 쓰는 공용 프리미티브).
3. `header-actions`에 **홈 / 태그 / 방명록** 3개 버튼을 `data-size="sm"`으로 배치했다.
4. `skin-scaffold-header` / `-title` / `-body` 임시 슬롯 3개를 **전부 걷어냈다.**
5. `bun run skin:build` 재실행 → `tailwind.css` 32.5KB.

### 1-1. 3개 버튼 최종 형태

| 순서 | 요소 | 라벨 | 아이콘 | href | 실측 |
|---|---|---|---|---|---|
| 1 | `<a data-slot="button" data-variant="ghost" data-size="sm">` | 홈 | lucide `house` | `[##_blog_link_##]` | 56×32 |
| 2 | 〃 | 태그 | lucide `tag` | `[##_taglog_link_##]` | 68×32 |
| 3 | 〃 | 방명록 | lucide `message-square` | `[##_guestbook_link_##]` | 80×32 |
| 4 | `<button … data-size="icon" data-header-theme-toggle>` | (테마 전환) | `sun`/`moon` | — | PC에서 `display:none` |

**아이콘+텍스트로 갔다**(아이콘 전용 아님) — 사유는 스펙 §2-1. 요약: 사용자가 이름으로 지목했고,
폭이 충분하며(3개 합계 212px, 접힘 상태에서도 브레드크럼에 980px 남음), `tag`/`message-square`
아이콘만으로는 의미가 안 읽히고, **사이드바가 접히면 이 3개가 유일한 문자 내비게이션이 된다**
(접힘 스크린샷에서 실제로 확인).

**아이콘·링크는 사이드바 "둘러보기" 그룹의 것을 문자 그대로 재사용**했다 — 같은 목적지를
두 곳에서 다르게 가리키는 일이 없다.

---

## 2. 검증 결과 (전부 `page.evaluate`로 computed style / 속성 직접 확인)

### 2-1. 구조 · 슬롯

`[data-slot="sidebar-inset"]` 안에서 실제로 확인된 슬롯:

```
header, header-inner, header-start, sidebar-trigger,
breadcrumb, breadcrumb-list, breadcrumb-item, breadcrumb-link,
breadcrumb-separator, breadcrumb-page, header-actions, button, content
```

- `[data-slot^="skin-scaffold"]` 개수 = **0** (임시 슬롯 완전 제거 확인)
- Design-system 원본 슬롯명과 1:1 일치. 이름을 바꾸거나 합친 것 없음.

### 2-2. 치수 — 스펙 §5 대조

| 항목 | 실측 | 스펙 | 판정 |
|---|---|---|---|
| `header` 높이 | **56px** | 56 | ✅ |
| `sidebar-header` 높이 | **56px** | 56 | ✅ |
| **두 높이 일치 여부** | `true` | Q3 확정 | ✅ |
| `header` border-bottom | `1px rgb(229,229,229)`(`--border`) | 1px `--color-border` | ✅ |
| `header` 배경 | `rgb(255,255,255)` / 다크 `rgb(10,10,10)` | `--color-background` | ✅ |
| `header-inner` padding | 16px / 16px | `*4` | ✅ |
| `header-inner` gap · justify | 12px · `space-between` | `*3` · space-between | ✅ |
| `header-start` gap · flex · min-width | 8px · `1 1 auto` · 0 | `*2` · `1 1 auto` · 0 | ✅ |
| `header-actions` gap · flex-shrink | 4px · 0 | `*1` · 0 | ✅ |
| `sidebar-trigger` | 28×28 | 28 (shadcn `size-7`) | ✅ |
| 버튼 `sm` 높이 | **32px** | `*8` = 32 | ✅ |
| 버튼 `sm` padding-inline(아이콘 동반) | 10px | `*2.5` | ✅ |
| 버튼 `sm` gap | 6px | `*1.5` | ✅ |
| 버튼 radius | 8px | `--radius-md` | ✅ |
| 버튼 타이포 | 14px / 500 / `-0.112px`(= `-0.008em`) | Label 14/500 `--tracking-sm` | ✅ |
| `a[data-slot="button"]` 밑줄 | `none` | 원본 규칙 | ✅ |
| 브레드크럼 | 14px / 400 / gap 10px(≥40rem) / 구분자 아이콘 14px | Small 14/400 · `*2.5` · `*3.5` | ✅ |

### 2-3. 색상 — 라이트 / 다크 실측

| 대상 | 라이트 | 다크 | 참조 토큰 | 판정 |
|---|---|---|---|---|
| 헤더 배경 | `#ffffff` | `#0a0a0a` | `--color-background` | ✅ |
| 헤더 하단선 | `#e5e5e5` | `rgba(255,255,255,.1)` | `--color-border` | ✅ |
| 버튼 글자(기본) | `rgb(0,0,0)` | `rgb(250,250,250)` | `--color-foreground` 상속 | ✅ |
| 버튼 ghost hover 배경 | `rgb(245,245,245)` | `oklab(… /0.5)`(accent 50% 믹스) | `--color-accent` | ✅ 원본 다크 규칙까지 동일 |
| 버튼 ghost hover 글자 | `rgb(23,23,23)` | `rgb(250,250,250)` | `--color-accent-foreground` | ✅ |
| 상위 크럼 | `rgb(115,115,115)` | `rgb(161,161,161)` | `--color-muted-foreground` | ✅ |
| 현재 페이지 크럼 | `rgb(0,0,0)` | `rgb(250,250,250)` | `--color-foreground` | ✅ |
| 포커스 링 | `border-color: --ring` + `0 0 0 3px ring/50%` | 동일 | `--color-ring` | ✅ |

**새로 선언한 색상 변수 0개** — `src/input.css`가 sidebar 구역에서 만들어 둔 토큰만 재사용했다.

### 2-4. 동작 — 실제 클릭 / 키보드

| 시나리오 | 결과 |
|---|---|
| 헤더로 옮긴 `sidebar-trigger` 클릭(펼침→접힘) | wrapper·sidebar `data-state="collapsed"`, `data-collapsible="icon"`, gap 48px, `aria-expanded="false"`, 쿠키 `sidebar_state=false` ✅ (JS 수정 없이 그대로 동작) |
| 접힘 상태 헤더 | `x:48 w:1392`로 즉시 확장, `header-actions`는 여전히 우측 끝(우변 = 뷰포트−16px) ✅ |
| 다시 클릭(접힘→펼침) | 정상 복귀 ✅ |
| 태그 버튼 hover (라이트) | 배경 `#f5f5f5` + 글자 `#171717` ✅ |
| 방명록 버튼 hover (다크) | accent 50% oklab 믹스 + 글자 `#fafafa` ✅ (원본 `.dark … ghost:hover` 규칙과 동일) |
| 테마 토글(사이드바 푸터) | `.dark` + `localStorage.theme="dark"`, 헤더 전체가 다크 토큰으로 전환 ✅ |
| 헤더 테마 토글 표시 | PC에서 `display:none`, 사이드바 토글은 `flex` ✅ (원본 의도대로 동시 노출 없음) |
| Tab 포커스 순서 | `sidebar-trigger` → 브레드크럼 링크 → **홈** → … (DOM 순서 그대로) ✅ |
| 홈 버튼 `:focus-visible` | `border-color: --ring` + `box-shadow 0 0 0 3px ring/50%` ✅ |
| 스크롤(600px) | 헤더 `top: 0` 고정 유지, 사이드바도 `top: 0` — 밑선이 같이 유지됨 ✅ |
| `sidebar-rail` 히트영역 | 헤더 세로 범위(y=28)에서도 `elementFromPoint` → `sidebar-rail` ✅ (헤더 z-index 9 < 레일 20) |

### 2-5. 브레드크럼 (`header.js`)

| 상황 | 결과 |
|---|---|
| `[##_page_title_##]` ≠ `[##_title_##]` (목업: `홈` vs `다잇누`) | `다잇누 › 홈` 2단 표시 ✅ |
| `[##_page_title_##]` == `[##_title_##]` (홈 시나리오 재현) | 앞 크럼·구분자 `display:none` → `다잇누` 1단 ✅ |
| 아주 긴 글 제목 (약 90자) | `scrollWidth 1096 > clientWidth 807` = **말줄임 적용**, 헤더 높이 **56px 유지**, 문서 가로 오버플로 **0**, 버튼 위치 불변 ✅ |
| 상위 크럼 축소 방지 | `flex-shrink:0` + `max-width:160px` — 글 제목이 길어도 블로그 제목이 먼저 줄지 않음 ✅ |

> 긴 제목 시나리오는 실제 티스토리 데이터가 없어 `page.evaluate`로 `breadcrumb-page`의
> 텍스트를 교체해 재현했다(CSS 말줄임·레이아웃 붕괴 여부를 보는 목적이므로 유효).

### 2-6. 빌드

`bun run skin:build` (`@tailwindcss/cli` v4.3.3, `--minify`) → **32.5KB**.
`.sr-only` · `--color-accent-foreground` · `--radius-md` · `--tracking-sm` · `--shadow-xs` ·
`--color-muted-foreground` 가 산출물에 존재함을 확인(헤더 CSS가 순수 CSS에서 참조하는 값들).

---

## 3. 원본과 다르게 만든 것 (전부 사유)

| # | 항목 | 원본 | 이 스킨 | 사유 |
|---|---|---|---|---|
| 1 | 헤더의 조상 슬롯 | `.app-shell > [data-slot="main"]` | `[data-slot="sidebar-inset"]` | `layout.css` 머리말이 "이 문서 사이트 전용 ✗ 외부 프로젝트 사용 금지"라고 명시. shadcn 정본은 `SidebarInset`이고 sidebar 구역에서 이미 확정했다 (스펙 §6-1) |
| 2 | 스크롤 모델 | `main{height:100vh}` + 본문 내부 스크롤 | 헤더 `position:sticky; top:0; z-index:9` + 문서 스크롤 | 티스토리가 주입하는 관리 메뉴바·광고 컨테이너와 긴 글의 앵커 이동이 내부 스크롤 컨테이너와 어긋난다. **본문 스크롤 방식을 헤더가 강제하지 않게** 했다 (§6-2) |
| 3 | 사이드바 트리거 | `data-slot="button" data-size="icon"`(36px) + `data-sidebar-trigger` | `data-slot="sidebar-trigger"`(28px) | **shadcn 원본 `SidebarTrigger`가 `size-7`(28px)이고 `data-slot="sidebar-trigger"`로 슬롯을 덮어쓴다** — 우리 쪽이 shadcn 1:1 원칙에 더 정확하다. 시각 언어(ghost hover/radius/16px 아이콘)는 동일 (§3-4) |
| 4 | 브레드크럼 줄바꿈 | `flex-wrap:wrap; word-break:break-word` | 헤더 스코프에서만 `nowrap` + 말줄임 | 원본 크럼은 짧은 내비 라벨이지만 우리는 **글 제목 전체**가 들어온다. 그대로면 56px 헤더가 두 줄로 터진다(§6-3, 실측으로 재현·수정 확인) |
| 5 | 브레드크럼 내용 | 사이드바 활성 그룹 + 페이지명 (JS가 채움) | `[##_title_##]` / `[##_page_title_##]` (서버가 채움) | 티스토리 최상위 스코프에서 확실한 값은 이 둘뿐. 카테고리명은 `<s_article_rep>` 안에서만 유효해 헤더에서 못 쓴다 (§3-2) |
| 6 | 크럼 접기 방향 | 값이 **있을 때 편다** | 값이 **같을 때 접는다** | 서버가 이미 두 값을 채워 내려주므로, JS가 실패해도 `다잇누 / 다잇누`로 보일 뿐 레이아웃은 멀쩡하다(안전한 열화) (§3-3) |
| 7 | 아이콘 | `<i data-lucide>` + CDN 스크립트 | 인라인 `<svg>` | 티스토리 스킨에 외부 JS 의존을 새로 들이지 않는다. sidebar 스펙 §7-7과 동일 방침. CSS는 원본 선택자(`> svg, > i`)를 그대로 둬 둘 다 받는다 |
| 8 | Button 변형 범위 | secondary/destructive/soft/`data-color` 포함 | default/outline/ghost/link + 전 사이즈만 | `--secondary`·`--destructive`·`--sys-*` 토큰이 `src/input.css`에 아직 없다. 없는 변수를 참조하면 조용히 무색이 되므로 **해당 토큰을 도입하는 구역에서 함께 추가**한다 (§6-5) |
| 9 | Button·Breadcrumb CSS 위치 | 각각 독립 컴포넌트 | `header.css` 안 `── 공용 프리미티브 ──` 섹션 | sidebar 구역이 `sidebar-input`/`separator` 포트를 별도 파일로 빼지 않은 선례 + 티스토리 업로드 파일 수 절약. 다른 구역이 쓰기 시작하면 `button.css`로 추출 (§6-6) |

### 스펙에 없던 결정 2건

- **헤더 3개 버튼에 활성(현재 위치) 표시를 하지 않았다.** 사이드바가 이미 `data-active` + 파랑으로
  그 신호를 담당한다(sidebar 스펙 §3-3-b에서 액센트 색까지 도입해 만든 표시). 헤더에서 한 번 더 하면
  사이드바 신호가 약해진다 — 3개 버튼은 어디서든 같은 모습인 **고정 바로가기**로 뒀다.
- **사이드바 푸터 테마 토글에 `data-sidebar-theme-toggle` 속성을 추가했다**(속성만, 시각 변화 0).
  반응형 구역에서 Design-system 원본의 `@media (max-width:48rem)` 블록 하나만 붙이면
  "헤더 토글 켜고 사이드바 토글 끄기"가 바로 동작하도록 훅을 미리 맞춰 둔 것이다.

---

## 4. 티스토리 템플릿 태그 처리

| 태그 | 어디에 | 비고 |
|---|---|---|
| `[##_blog_link_##]` | 브레드크럼 1단 링크, 홈 버튼 | 사이드바와 동일 |
| `[##_title_##]` | 브레드크럼 1단 텍스트 | 〃 |
| `[##_page_title_##]` | `breadcrumb-page` | **임시 슬롯 `skin-scaffold-title`이 하던 역할을 승계** |
| `[##_taglog_link_##]` | 태그 버튼 | 사이드바와 동일 |
| `[##_guestbook_link_##]` | 방명록 버튼 | 〃 |

**카테고리 브레드크럼은 넣지 않았다.** `[##_article_rep_category_##]`는 `<s_article_rep>` 블록
안에서만 치환되어 헤더(그 블록 바깥)에서는 쓸 수 없다 — 넣으려면 사이드바 활성 링크에서
역산하는 JS가 추가로 필요하다(스펙 §8-Q2, 요청 시 확장 가능).

---

## 5. 확인하지 못한 것 / 확인 필요

티스토리 계정이 없어 **서버 렌더링을 거치는 것은 이번에도 전부 미검증**이다.

1. **`[##_page_title_##]`가 각 페이지에서 실제로 무엇으로 치환되는지** — 특히 홈에서
   블로그 제목과 같은 값인지. 다르면 브레드크럼이 `다잇누 / 홈`처럼 2단으로 남는다
   (고장은 아니지만 의도한 1단 표시가 아니다). **배포 후 확인 필요.**
2. `[##_taglog_link_##]` / `[##_guestbook_link_##]`가 실제로 반환하는 경로
   (목업은 `/tag`, `/guestbook`으로 가정).
3. 티스토리가 로그인 시 상단에 주입하는 **관리 메뉴바**가 `position:sticky` 헤더와 겹치는지.
   (sidebar 구역의 미확인 항목 4번과 같은 사안 — 헤더가 생기면서 영향 범위가 커졌다.)
4. 광고 컨테이너 `[##_revenue_list_upper_##]`가 헤더 바로 아래에서 레이아웃을 밀어내는지.

**범위 밖:** 반응형(태블릿/모바일). PC 1440×900만 확인했다.
헤더 테마 토글의 ≤48rem 노출 규칙은 **의도적으로 넣지 않았다**(스펙 §6-4).

---

## 6. 참고 스크린샷 — `_workspace/header-shots/`

| 파일 | 내용 |
|---|---|
| `header-light-expanded.png` | 라이트 · 사이드바 펼침 |
| `header-light-collapsed.png` | 라이트 · 사이드바 접힘 (헤더 3버튼이 유일한 문자 내비게이션이 되는 상태) |
| `header-light-expanded-hover.png` | 라이트 · `태그` 버튼 hover |
| `header-dark-expanded-hover.png` | 다크 · `방명록` 버튼 hover |
| `header-long-title-ellipsis.png` | 긴 글 제목이 들어온 헤더(한 줄 유지) |

> 본문(`[data-slot="content"]`)이 스타일 없이 보이는 것은 정상이다 — 다음 구역 범위다.

---

## 7. 다음 구역(content)에 넘기는 것

1. `[data-slot="content"]`는 **의도적으로 무스타일**이다. `sidebar-inset`이
   `flex:1; min-width:0; flex-direction:column`이고 헤더가 56px 고정 + sticky이므로,
   그 아래에 바로 본문 레이아웃을 쌓으면 된다.
2. **스크롤 모델이 열려 있다** — 헤더가 sticky라서 content가 문서 스크롤을 쓰든 자체
   스크롤 컨테이너를 두든 자유다.
3. **Button 컴포넌트를 이미 쓸 수 있다**(`header.css`). 페이지네이션·더보기 등에 그대로 쓰되,
   `secondary`/`destructive` 변형이 필요하면 `src/input.css`에 토큰을 먼저 추가할 것.
4. **Breadcrumb 컴포넌트도 준비돼 있다** — 본문 상단에 카테고리 경로를 쓰고 싶다면
   `<s_article_rep>` 안에서는 `[##_article_rep_category_##]`가 유효하다.
5. 마크업을 늘렸으면 **`bun run skin:build`를 반드시 재실행**한다.
6. 로컬 검증: `bun run skin:preview` → `bun run skin:serve`(포트 4321) →
   `http://localhost:4321/`. `make-preview.mjs`는 `sidebar|header` 두 컴포넌트의
   `./images/` 경로를 로컬로 되돌리므로, **새 컴포넌트 파일을 추가하면 그 정규식에 이름을 추가**해야 한다.
