# `skin.html` — 설계 주석

소스: `dashboard-skin/skin.html`

이 파일의 HTML 주석을 소스에서 분리해 보관한다.

## 1. Pretendard 변수 폰트 — 기존 확정대로 orioncactus 공식 CDN 유지

Pretendard 변수 폰트 — 기존 확정대로 orioncactus 공식 CDN 유지

---

## 2. 로컬에서 빌드한 Tailwind v4 산출물 → 티스토리 [스킨 편집 → HTML 편집 → 파일 업로드]로 올린다

로컬에서 빌드한 Tailwind v4 산출물 → 티스토리 [스킨 편집 → HTML 편집 → 파일 업로드]로 올린다

---

## 3. [2026-09-03] Tooltip은 sidebar·header 둘 다 쓰는 공용 프리미티브라 먼저 로드한다.

[2026-09-03] Tooltip은 sidebar·header 둘 다 쓰는 공용 프리미티브라 먼저 로드한다.

---

## 4. [2026-09-04 CONTENT SPEC §3-1] 커스텀 스크롤바(스크롤 중에만 보이는 얇은 pill)는

[2026-09-04 CONTENT SPEC §3-1] 커스텀 스크롤바(스크롤 중에만 보이는 얇은 pill)는
     이제 우측 위젯 패널과 본문 캔버스(content-inner) 두 곳이 쓰는 공용 프리미티브라
     widgets.css §8에서 components/scrollbar.css로 추출했다(값 무변경, 셀렉터만
     [data-slot="widgets"] → [data-custom-scrollbar]). 프리미티브이므로 구역
     스타일보다 먼저 로드한다 — Tooltip을 추출했을 때와 같은 관례.

---

## 5. [2026-09-03 요청] "기본스크롤 제거하고 lenis제공 스크롤 처리" — smooth-scroll.js가

[2026-09-03 요청] "기본스크롤 제거하고 lenis제공 스크롤 처리" — smooth-scroll.js가
     Lenis를 붙이는 html/sidebar-content/widgets 3곳의 네이티브 스크롤바를 숨긴다
     (D:\MyCloud frontend의 .scrollbar-hidden과 동일 규칙).

---

## 6. [2026-09-03 RIGHT-WIDGETS SPEC §8] Card/Badge도 공용 프리미티브다 —

[2026-09-03 RIGHT-WIDGETS SPEC §8] Card/Badge도 공용 프리미티브다 —
     구역 스타일(sidebar/header/widgets)보다 먼저 로드한다.

---

## 7. [2026-09-04 CONTENT SPEC §14-1] 구역 스타일 중 마지막에 로드한다.

[2026-09-04 CONTENT SPEC §14-1] 구역 스타일 중 마지막에 로드한다.

---

## 8. [SPEC §7-2] FOUC 방지 인라인 동기 스크립트.

[SPEC §7-2] FOUC 방지 인라인 동기 스크립트.
  티스토리는 SSR 단계를 우리가 제어할 수 없어, 스크립트가 늦게 돌면
  "펼침으로 그려졌다가 접히는" 폭 점프가 반드시 발생한다.
  이 시점엔 wrapper가 아직 파싱 전이므로 <html>에 힌트만 먼저 심는다.
  다크모드도 같은 이유로 여기서 함께 적용한다(Design-system은 localStorage.theme).

---

## 9. [SPEC §7-2 보강] wrapper 여는 태그 바로 다음의 동기 스크립트.

[SPEC §7-2 보강] wrapper 여는 태그 바로 다음의 동기 스크립트.
  이 시점에 wrapper 엘리먼트는 존재하지만 자식(<aside>)은 아직 파싱 전이라,
  여기서 data-state를 심으면 사이드바 내부가 단 한 프레임도 펼친 모습으로
  그려지지 않는다. <head> 힌트는 그대로 두고(폭 담당) 이건 내부 표현까지 담당한다.

---

## 10. Header : 브랜드

── Header : 브랜드 ──

---

## 11. [2026-09-03 요청] "접힌 사이드메뉴도 툴팁으로 적용" — Tooltip

[2026-09-03 요청] "접힌 사이드메뉴도 툴팁으로 적용" — Tooltip
                   프리미티브(tooltip.css/js)를 재사용하되, 헤더처럼 `[data-slot=
                   "tooltip"]`로 감싸지 않는다. sidebar.css의 배지·활성 표시
                   규칙이 sidebar-menu-button을 menu-item의 "직계 자식"으로
                   요구해서(예: `:has(> [data-slot="sidebar-menu-badge"]) >
                   [data-slot="sidebar-menu-button"]`) 감싸면 그 관계가 깨진다
                   — 대신 형제로 두고(menu-item은 이미 position:relative)
                   data-tooltip 속성으로 트리거를 표시, tooltip.js가 형제
                   tooltip-content와 짝짓는다(패턴 B). 펼침 상태에는 라벨이
                   이미 보이므로 접힘 상태에서만 연다.

---

## 12. [2026-09-03 요청] "로고 우측에 시스템아이콘 추가" — 티스토리

[2026-09-03 요청] "로고 우측에 시스템아이콘 추가" — 티스토리
                   관리 페이지로 바로 연결(사유는 sidebar.css의 "시스템 아이콘"
                   주석 참고: 계정/블로그 전환 UI는 스킨에 직접 만들지 않고
                   티스토리 자체 관리 메뉴바에 맡긴다).
                   [2026-09-04 요청] "표시한 아이콘이 sidebar-menu-item 안쪽으로
                   포함되게" — <ul> 밖 형제(<div data-slot="tooltip"> 래퍼 +
                   Button 프리미티브)였던 것을 이 <li> 안, 브랜드 버튼의 형제로
                   옮기고 shadcn 정본의 SidebarMenuAction으로 교체했다. 원본의
                   `showOnHover` 동작 그대로 기본 opacity:0 → menu-item hover 시
                   1이 되고, 접힘 상태는 menu-action 규칙이 이미 display:none
                   한다(원본 `group-data-[collapsible=icon]:hidden`).
                   Tooltip 프리미티브는 쓰지 않는다 — (1) shadcn 원본
                   SidebarMenuAction에는 툴팁이 없고, (2) 패턴 B(data-tooltip
                   형제)는 `onlyWhenCollapsed:true`로 묶여 있어 "펼침에서만
                   존재하는" 이 액션과 조건이 정반대이며, (3) 패턴 A(래퍼)로
                   감싸면 sidebar.css의 peer 선택자
                   (`[data-size="lg"] ~ [data-slot="sidebar-menu-action"]`,
                   원본의 `peer-data-[size=lg]/menu-button:top-2.5`)가 깨진다.
                   대신 aria-label(접근성) + title(브라우저 네이티브 툴팁).

---

## 13. Content

── Content ──

---

## 14. [2026-09-03, D:\MyCloud FilePreview.tsx 선례] data-lenis-prevent가 핵심이다 —

[2026-09-03, D:\MyCloud FilePreview.tsx 선례] data-lenis-prevent가 핵심이다 —
             이게 없으면 이 안에서 휠을 굴려도 문서 전체를 스무스 스크롤하는 Lenis가
             이벤트를 가로채서, 이 영역 자체의 스크롤(이 요소에 별도로 붙인 Lenis
             인스턴스, smooth-scroll.js 참고)은 전혀 안 움직이는 것처럼 보인다
             (Playwright로 실측 재현 후 확인 — 문서 scrollTop이 대신 움직였음).

---

## 15. 검색 (접힘 시 그룹 전체 숨김)

검색 (접힘 시 그룹 전체 숨김)

---

## 16. [2026-09-02 요청] "둘러보기"(홈/태그/방명록) 그룹 제거 — 헤더 우측

[2026-09-02 요청] "둘러보기"(홈/태그/방명록) 그룹 제거 — 헤더 우측
               버튼 3개와 중복이라 정리. 검색 바로 아래 구분선만 남겨 아카이브와 분리한다.

---

## 17. 아카이브 — [SPEC §8-Q2 = A안(정적 하드코딩)] 확정.

아카이브 — [SPEC §8-Q2 = A안(정적 하드코딩)] 확정.
            [##_category_list_##]는 서버가 고정 마크업(<ul class="tt_category">)을 생성해
            data-slot을 붙일 수 없으므로 카테고리를 여기에 직접 적는다.
            아래 항목/글 수는 daitnu.tistory.com 실측(2026-09-02) 값이다.
            ※ A안의 알려진 비용: 카테고리 추가·이름변경·글 수 변동 시 이 블록과
              sidebar-menu-badge 숫자를 손으로 갱신하고 스킨을 재업로드해야 한다.

---

## 18. [2026-09-03 요청] 접힘 전용 툴팁 — 브랜드 로고 항목과 동일한

[2026-09-03 요청] 접힘 전용 툴팁 — 브랜드 로고 항목과 동일한
                       패턴(패턴 B, tooltip.js 참고).

---

## 19. Footer : 방문자 수 ([SPEC §8-Q4], 테마 토글은 2026-09-02 요청으로 제거 —

── Footer : 방문자 수 ([SPEC §8-Q4], 테마 토글은 2026-09-02 요청으로 제거 —
             헤더의 [data-header-theme-toggle]이 PC에서도 노출되도록 바뀌어 그쪽이 이 역할을 이어받는다.
             [HEADER SPEC §6-4] 참고.
             [2026-09-03 요청] "카드형태로 1행으로 나열, 접힌상태에서는 현재상태 유지" —
             펼침/접힘 두 표현을 완전히 분리했다. 접힘: 기존 그대로(아이콘 하나 +
             hover 시 tooltip, sidebar-menu-button/[data-muted] 패턴 유지 — 손대지
             않음). 펼침: 그 자리를 Today/Total 두 장의 작은 카드(sidebar-stat-card,
             Design-system Card의 배경·radius·보더 언어를 sidebar 전용 토큰
             (--color-sidebar-accent/-border)으로 축소 재구성 — sidebar-menu-item
             높이 32px 규격에 맞는 전체 Card 컴포넌트는 이 좁은 자리에 과함)가
             대신한다. 두 표현은 [data-slot="sidebar-wrapper"]의 data-state로
             sidebar.css가 서로 반대로 숨긴다(아래 두 li 중 하나만 항상 보임).

---

## 20. [의도적 이탈] shadcn SidebarRail(사이드바 우측 경계의 클릭 토글 핸들)은

[의도적 이탈] shadcn SidebarRail(사이드바 우측 경계의 클릭 토글 핸들)은
       사용자 요청("사이드메뉴 오른쪽 모서리 클릭 시 접히는 기능 제거")으로 삭제했다.
       토글 경로는 헤더의 [data-slot="sidebar-trigger"]와 Ctrl/Cmd+B 두 가지만 남는다.

---

## 21. sidebar-inset — 헤더 + 본문 영역.

══════════════════════════════════════════════════════════
       sidebar-inset — 헤더 + 본문 영역.
       Design-system은 이 자리에 자체 셸 [data-slot="main"]을 쓰지만
       (layout.css 머리말이 "이 문서 사이트 전용"이라고 못박고 있다),
       우리는 sidebar 구역에서 확정한 shadcn 정본 슬롯을 그대로 쓴다.
       [HEADER SPEC §6-1]
       ══════════════════════════════════════════════════════════

---

## 22. Header ──  Design-system index.html 292–319행 구조 그대로

── Header ──  Design-system index.html 292–319행 구조 그대로 ──

---

## 23. [HEADER SPEC §3-4] 사이드바 구역에서 완성된 트리거를 이 정식 위치로 옮겼다.

[HEADER SPEC §3-4] 사이드바 구역에서 완성된 트리거를 이 정식 위치로 옮겼다.
               Design-system은 이 자리에 data-slot="button" data-size="icon"(36px)을 쓰지만,
               shadcn 원본 SidebarTrigger가 data-slot="sidebar-trigger" + size-7(28px)이라
               shadcn 1:1 원칙에 따라 우리 쪽(28px)을 유지한다.

---

## 24. [HEADER SPEC §3-2] 티스토리가 스킨 최상위 스코프에서 확실히 채워주는 값은

[HEADER SPEC §3-2] 티스토리가 스킨 최상위 스코프에서 확실히 채워주는 값은
               [##_title_##]과 [##_page_title_##] 둘뿐이다(카테고리명은 s_article_rep 안에서만
               유효). 그래서 2단으로 구성하고, 홈에서 두 값이 같아지면 header.js가 앞 크럼과
               구분자를 접는다(§3-3).

---

## 25. [HEADER SPEC §2] 우측 끝 — 홈 / 태그 / 방명록 (data-size="icon-sm").

[HEADER SPEC §2] 우측 끝 — 홈 / 태그 / 방명록 (data-size="icon-sm").
             아이콘·링크는 원래 사이드바 "둘러보기" 그룹과 같은 것이었으나(§2-2),
             그 그룹은 2026-09-02 요청으로 제거돼 지금은 이 헤더 버튼 3개가 유일한
             경로다 — 아이콘/링크를 바꿀 때 사이드바 쪽을 참고할 필요 없음.
             [2026-09-03 요청] "텍스트 제거, 아이콘버튼으로" — <span> 라벨을 떼고
             data-size="sm"(텍스트 버튼) → "icon-sm"(32px 정사각, 이전과 동일한
             풋프린트)로 교체. 라벨이 사라진 만큼 aria-label로 접근성을 보강하고,
             "hover시 툴팁" 요청에 따라 각 버튼을 Tooltip 프리미티브(header.css/js에
             신규 포팅, 디자인시스템 pages/tooltip.html 마크업 그대로)로 감싼다.
             [2026-09-03 요청] "사이드메뉴 툴팁 기준으로 맞춰" — 처음엔 여기 4개에만
             `data-delay-duration="300"`을 줬는데, sidebar의 접힘 툴팁(패턴 B, tooltip.js)은
             래퍼가 없어 이 속성을 읽을 대상 자체가 없다 보니 항상 지연 0으로 즉시 뜨고
             있었다 — 그래서 둘의 등장 속도가 달라 보였다. 속성을 제거해(=지연 0, tooltip.js
             bindTooltip()의 기본값) sidebar와 동일하게 즉시 뜨도록 맞췄다.

---

## 26. [2026-09-02 요청] 테마 토글은 헤더에서 빼서 화면 우측 하단 고정(fixed)

[2026-09-02 요청] 테마 토글은 헤더에서 빼서 화면 우측 하단 고정(fixed)
               버튼으로 옮겼다 — 아래 </header> 밖의 [data-floating-theme-toggle] 참고.

---

## 27. [2026-09-02 요청] 우측 끝 즐겨찾기 — data-variant="default"(솔리드)로

[2026-09-02 요청] 우측 끝 즐겨찾기 — data-variant="default"(솔리드)로
               ghost 3개/테마 토글과 시각적으로 구분되는 주 액션 자리. 아직 "글" 콘텐츠
               구역이 없어 현재 페이지(URL) 단위로 localStorage에 저장하는 최소 동작만
               구현했다 — 즐겨찾기 목록을 모아보는 화면은 아직 없다(향후 구역 후보).
               [2026-09-03 요청] 나머지 3개와 동일하게 아이콘 전용(icon-sm) + 툴팁.

---

## 28. [2026-09-02 요청] 테마 토글 — 화면 우측 하단 고정(FAB). 헤더 밖으로 뺐으니

[2026-09-02 요청] 테마 토글 — 화면 우측 하단 고정(FAB). 헤더 밖으로 뺐으니
         위치는 DOM 순서와 무관(position:fixed). 향후 "맨 위로" 버튼이 추가되면
         이 버튼 위(예: bottom: calc(var(--spacing)*20))에 세로로 쌓을 자리를 남겨둔다.
         바인딩은 sidebar.js의 [data-theme-toggle] 속성 셀렉터가 그대로 처리한다.

---

## 29. content — 본문 + 우측 위젯 2단.

══════════════════════════════════════════════════════════
         content — 본문 + 우측 위젯 2단.
         [RIGHT-WIDGETS SPEC §2-1] `content` 슬롯 이름은 그대로 두고
         안쪽에 content-layout / content-inner 두 겹만 새로 끼웠다
         (Design-system layout.css 90–119행 / index.html 321–324행과 동일 구성).
         [2026-09-04 CONTENT SPEC] content-inner 안쪽을 이번 구역에서 정식
           구현했다(그리드 배경 + 타이틀영역 + 글 목록 + 빈 상태 + 페이징).
         ══════════════════════════════════════════════════════════

---

## 30. content-inner — 본문 캔버스. [CONTENT SPEC §2, §3]

══════════════════════════════════════════════════════
             content-inner — 본문 캔버스. [CONTENT SPEC §2, §3]

             속성 4종의 역할(전부 우측 위젯 패널과 **완전히 동일한 패턴**):
               data-lenis-prevent    문서 Lenis가 이 영역 위의 휠을 가로채지
                                     못하게 막는다. 없으면 여기서 휠을 굴려도
                                     문서가 대신 스크롤된다(2026-09-03에 위젯
                                     패널에서 실측 재현한 버그).
               class="scroll-fade-y" shadcn 공식 scroll-fade 유틸리티(정의는
                                     src/input.css). JS 없음.
                                     ★ 반드시 여기 **리터럴 문자열**로 있어야
                                     Tailwind CLI가 @source 스캔에서 찾아
                                     tailwind.css에 유틸리티를 생성한다 —
                                     JS로 붙이면 조용히 누락된다.
               data-custom-scrollbar 스크롤 중에만 보이는 얇은 커스텀 스크롤바
                                     (components/scrollbar.css + smooth-scroll.js
                                      의 3초 idle 타이머).
             ⚠ height:100%가 아니라 max-height: calc(100svh − 56px)다 —
               부모 높이가 불확정이라 height:100%는 CSS 규칙상 auto로 계산돼
               아무 일도 하지 않는다. 사유 전문은 content.css §1 참고.
             ══════════════════════════════════════════════════════

---

## 31. ★ 광고 치환자 2개는 그리드 래퍼 '바깥'에 둔다. [SPEC §1-2]

★ 광고 치환자 2개는 그리드 래퍼 '바깥'에 둔다. [SPEC §1-2]
               티스토리가 내려주는 광고는 높이를 우리가 통제할 수 없어서,
               content-grid 안에 있으면 임의 높이가 끼어들어 그 아래 모든 카드
               경계가 배경 가로선에서 어긋난다(§4-2의 정합 전제가 깨진다).
               밖에 두면 광고가 어떤 높이든 그리드 리듬에 영향이 없다.

---

## 32. content-grid — 콘텐츠 래퍼.

content-grid — 콘텐츠 래퍼.
               격자 배경은 부모 content-inner에 두어 스크롤과 분리·고정
               (background-origin: content-box로 패딩 안쪽만 그림).

---

## 33. 타이틀영역 [SPEC §5]

── 타이틀영역 [SPEC §5] ──
                 [##_page_title_##] = 공식 문서상 "현재 페이지 제목" — 홈/
                 카테고리/태그/검색/아카이브 어디서든 지금 보고 있는 컨텍스트를
                 그대로 반영한다. 정적 텍스트("최신 글")로 두면 카테고리
                 페이지에서도 "최신 글"로 떠 명백한 오정보가 된다.
                 헤더 브레드크럼과 문자열이 겹치지만 역할이 다르다 —
                 크럼은 "셸 어디에 있는지"(항상 보임), 타이틀은 "이 캔버스가
                 무엇인지"(스크롤하면 사라짐). shadcn 대시보드 예제와 같은 구성.

---

## 34. 빈 상태

── 빈 상태 ──
                 ⚠ 오해 주의: <s_list>는 "빈 상태 래퍼"가 **아니다.** Tistory
                   공식 문서(list/list.html)상 검색/카테고리/태그 목록 페이지의
                   **목록 블록 전체**이며, 안에 <s_list_image> / <s_list_rep> /
                   <s_list_rep_thumbnail>과 [##_list_conform_##] /
                   [##_list_count_##] 같은 목록 레벨 치환자를 가질 수 있다.
                   이 스킨은 목록을 <s_index_article_rep>(블로그형) 경로로
                   그리기로 했으므로 <s_list_rep> 계열을 채택하지 않고,
                   <s_list>는 **빈 상태 전달 통로로만** 남겨둔다. [SPEC §0-2-a, §13-1]
                 ⚠ 둘 중 무엇이 실제로 렌더되는지는 스킨이 아니라 티스토리
                   관리자의 "글 목록 표시 방식" 설정이 정한다 — 실사이트 확인 필요.

---

## 35. 리스트영역 [SPEC §6]

── 리스트영역 [SPEC §6] ──
                 ⚠ <s_index_article_rep> 블록은 **정확히 한 번**만 적는다.
                   서버가 글 개수만큼 반복한다(우측 위젯 구역에서 확정된 동일
                   원칙) — 복붙하면 실사이트에서 배수로 곱해진다.
                   로컬에서 여러 개로 보이게 하는 건 tools/make-preview.mjs의 몫.

                 현재 마크업:
                   post-item > a[post-item-inner](글 링크로 행 전체 클릭)
                     ├ post-body (텍스트: 메타·제목·요약)
                     └ s_article_rep_thumbnail > post-thumb (16:9, 오른쪽)
                   ⚠ 바깥이 <a>라 카테고리/제목은 중첩 <a>를 쓰지 않는다
                     (카테고리는 span, 제목은 텍스트만).
                   ⚠ <s_article_rep_thumbnail>은 대표이미지 있을 때만 서버가
                     내려준다 — 없으면 텍스트가 전폭을 쓴다.
                 <time>을 쓰지 않는 이유: [##_article_rep_simple_date_##]는
                 yyyy.mm.dd **표시 문자열**이라 <time>이 요구하는 기계 판독
                 형식이 아니고, 연/월/일 치환자는 0 패딩 보장이 없어 유효한
                 datetime 값을 조립할 수 없다. 잘못된 <time>은 없는 것만 못하다.

---

## 36. 단일 글 모드 — 이번 구역의 설계 대상이 아니라 "깨지지 않는

단일 글 모드 — 이번 구역의 설계 대상이 아니라 "깨지지 않는
                     최소 레이아웃"만 둔다. 이 블록이 존재하면 content.css의
                     :has() 규칙이 격자 배경과 타이틀영역을 끈다(사유는 그 파일
                     §7). 본문 스타일 전체(인용/코드/표/댓글)는 다음 구역의 몫.

---

## 37. 페이징 [SPEC §0-2-c, §8]

── 페이징 [SPEC §0-2-c, §8] ──
                 ⚠⚠ Tistory 공식 예제(list/paging.html) 형식으로 **교정**했다.
                   [##_prev_page_##] / [##_paging_rep_link_##] / [##_next_page_##]는
                   href 값이 아니라 **href="…" 속성 전체**를 내려준다 —
                   공식 예제가 <a [##_paging_rep_link_##]>로 쓴다.
                   기존 마크업의 <a href="[##_paging_rep_link_##]">는 이 형식과
                   달라 href="href=&quot;…&quot;"가 되어 링크가 깨진다.
                   이전/다음 링크는 아예 없었어서 함께 추가했다.
                 [##_no_more_prev_##] / [##_no_more_next_##]는 더 이상 이전/다음이
                 없을 때 서버가 부여하는 **클래스명**이다(정확한 문자열은 공식
                 문서에 명시돼 있지 않아 content.css가 [class*="no_more"]도 병기).
                 ⚠ <s_paging_rep>도 **정확히 한 번**만 적는다(서버가 페이지 수만큼 반복).
                 버튼은 Button 프리미티브(header.css) 그대로 — ghost / icon-sm(32px).
                 "현재 페이지" 치환자는 Tistory에 존재하지 않아 components/content.js가
                 location 비교로 보완한다(sidebar.js의 initActiveState() 선례).

---

## 38. 우측 위젯 사이드바 — [RIGHT-WIDGETS SPEC] 이번 구역.

══════════════════════════════════════════════════════
             우측 위젯 사이드바 — [RIGHT-WIDGETS SPEC] 이번 구역.

             ⚠⚠ 이 블록의 s_... 태그 이름은 Tistory 공식 스킨 가이드
                (https://tistory.github.io/document-tistory-skin/ 의
                 sidebar/{recent_notice,recent_post,popular_post,
                 random_tag,recent_comment}.html)의 문자열 그대로다.
                서버는 정확히 이 문자열만 찾는다 — 한 글자라도 "읽기 쉽게"
                바꾸면 그 블록은 치환되지 않고 화면에 그대로 노출되거나
                통째로 사라진다. [SPEC §0]

             ⚠⚠ s_..._rep 반복 블록은 **정확히 한 번**만 적는다(항목
                1개짜리 템플릿). 5번 복붙하면 실사이트에서 5×N개로 곱해진다.
                실제 노출 개수는 스킨이 아니라 티스토리 관리자
                (꾸미기 > 사이드바 설정)의 위젯별 "노출 개수"가 정한다 —
                요청의 "5개까지만"은 거기서 5로 설정해야 충족된다. [SPEC §1-4]
                로컬에서 5개로 보이게 하는 건 tools/make-preview.mjs의 몫.

             위젯마다 s_sidebar_element 한 겹으로 감싼다(공식 문서 5개
             전부 이 래퍼로 시작). 푸터 방문자 수의 s_sidebar 2겹은
             구식 관례라 여기서는 따라 하지 않는다. [SPEC §1-1]
             ══════════════════════════════════════════════════════

---

## 39. data-lenis-prevent — sidebar-content와 같은 이유(위 주석 참고).

data-lenis-prevent — sidebar-content와 같은 이유(위 주석 참고).
             class="scroll-fade-y" — shadcn 공식 scroll-fade 유틸리티(정의는
             src/input.css). 순수 CSS(animation-timeline: scroll(self y))로
             스크롤 진행도에 따라 위/아래 가장자리를 마스크로 지운다.
             반드시 여기 리터럴 문자열로 있어야 Tailwind CLI가 @source 스캔에서
             찾아 tailwind.css에 유틸리티를 생성한다 — JS로 붙이면 누락된다.

---

## 40. [2026-09-04 CONTENT SPEC §3-1 ③] data-custom-scrollbar 추가 —

[2026-09-04 CONTENT SPEC §3-1 ③] data-custom-scrollbar 추가 —
             커스텀 스크롤바 CSS가 widgets.css §8에서 components/scrollbar.css로
             추출되면서 셀렉터가 [data-slot="widgets"] → [data-custom-scrollbar]로
             바뀌었다. **값·타이밍·색은 한 글자도 바뀌지 않았다**(회귀 0).

---

## 41. 1. 공지사항

── 1. 공지사항 ──
               s_rct_notice 를 카드 바깥(s_sidebar_element 안쪽)에 둔다 —
               공지가 0건이면 제목만 덩그러니 남지 않고 카드째 사라져야 한다.

---

## 42. 2. 최근 글 ── 썸네일 + 카테고리·날짜 [SPEC §5-3]

── 2. 최근 글 ── 썸네일 + 카테고리·날짜 [SPEC §5-3]
               의도적으로 쓰지 않는 치환자:
                 [##_rctps_rep_category_link_##] — 행 전체가 이미 <a>다.
                   <a> 안의 <a>는 HTML 사양상 무효라 DOM이 강제 교정된다.
                 [##_rctps_rep_rp_cnt_##]  — 댓글 0건이면 "0"이 그대로 찍히는데
                   "0일 때 숨김" 조건 태그가 없다. 댓글은 5번 위젯이 담당.
                 [##_rctps_rep_date_##]    — 320px 메타 한 줄에 과함(_simple_date_ 사용).
                 [##_rctps_rep_author_##]  — 팀블로그 전용.

---

## 43. 3. 인기 글 ── [SPEC §5-4]

── 3. 인기 글 ── [SPEC §5-4]
               반복 태그만 s_rctps_popular_rep 로 다르고 안쪽 치환자 이름은
               최근 글과 완전히 동일한 rctps_rep_*다(서버 동작 그대로).
               그래서 시각 구분을 두 가지로 준다:
                 (1) 썸네일 블록을 아예 넣지 않는다
                 (2) 순위 01~05 — widgets.css의 CSS counter가 그린다(마크업에 숫자 없음)

---

## 44. 4. 태그 ── [SPEC §5-5]

── 4. 태그 ── [SPEC §5-5]
               사이드바 위젯의 반복 태그는 s_random_tags 하나뿐이다
               (태그로그 페이지의 s_tag / s_tag_rep 와 다르다 — 혼동 주의).
               chip은 card.css의 Badge outline 변형. [##_tag_class_##]가
               넣어주는 cloud1~5는 widgets.css에서 색/굵기 5단계로 처리한다.

---

## 45. 5. 최근 댓글 ── [SPEC §5-6]

── 5. 최근 댓글 ── [SPEC §5-6]

---

## 46. [2026-09-03 요청] "모든 스크롤은 부드러운 스크롤링" → 이후 "D:\MyCloud에

[2026-09-03 요청] "모든 스크롤은 부드러운 스크롤링" → 이후 "D:\MyCloud에
     적용된 모든 영역 스크롤참고해서 다시적용" — 그 프로젝트가 실사용 중인
     Lenis + GSAP 조합을 그대로 재현한다(smooth-scroll.js 머리말 참고).
     GSAP ScrollSmoother(transform 기반이라 position:sticky를 깨뜨림)는
     처음부터 끝까지 채택하지 않았다 — Lenis는 네이티브 scrollTop을 직접
     움직이므로 헤더/우측 위젯 패널의 sticky가 그대로 정상 동작한다.
     로드 순서: GSAP core → ScrollTrigger(플러그인) → Lenis → 다른 구역 JS
     → smooth-scroll.js(마지막 — 위 세 전역과 sidebar-content/widgets
     엘리먼트가 전부 준비된 뒤 실행돼야 함). 버전은 참고 프로젝트의
     package.json(lenis ^1.3.25)과 동일하게 고정.

