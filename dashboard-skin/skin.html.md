# `skin.html` — 설계 주석

소스: `dashboard-skin/skin.html`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [RESPONSIVE SPEC §4-5] 모바일 오프캔버스 백드롭.

[RESPONSIVE SPEC §4-5] 모바일 오프캔버스 백드롭.
           shadcn <SheetOverlay>에 대응. Radix는 Portal로 body 끝에 그리지만
           Tistory 스킨엔 Portal이 없으므로 사이드바 자신의 마지막 자식으로 둔다
           (position:fixed라 flex 레이아웃에는 참여하지 않는다).
           PC/태블릿에서는 display:none이라 존재 자체가 무해하다.

---

## 2. [SPEC 2026-09-05] 첨부 레퍼런스 스크린샷 구조와 맞춤: 좌측은 공감(♡+카운트) 하나만.

[SPEC 2026-09-05] 첨부 레퍼런스 스크린샷 구조와 맞춤: 좌측은 공감(♡+카운트) 하나만.
                               댓글 수는 이 행에서 빼고(레퍼런스에 없음), 아래 댓글 섹션 타이틀에서만 보여준다.

---

## 3. [SPEC 2026-09-05] 공유 아이콘을 레퍼런스와 동일한 "박스+위쪽 화살표"(lucide Share)로 교체.

[SPEC 2026-09-05] 공유 아이콘을 레퍼런스와 동일한 "박스+위쪽 화살표"(lucide Share)로 교체.
                               기존 Share2(원 3개 네트워크 아이콘)는 레퍼런스와 모양이 달랐음.

---

## 4. [SPEC 2026-09-05] 링크 복사 아이콘을 레퍼런스와 동일한 "겹친 사각형"(lucide Copy)으로 교체.

[SPEC 2026-09-05] 링크 복사 아이콘을 레퍼런스와 동일한 "겹친 사각형"(lucide Copy)으로 교체.
                               기존 Link(사슬) 아이콘은 레퍼런스와 모양이 달랐음 — 동작(클립보드 복사)은 그대로.

---

## 5. [SPEC 2026-09-05] 관리자 전용 3개 버튼(수정/공개상태/삭제)을 레퍼런스의 "더보기(⋯)" 아이콘

[SPEC 2026-09-05] 관리자 전용 3개 버튼(수정/공개상태/삭제)을 레퍼런스의 "더보기(⋯)" 아이콘
                               하나로 묶었다. Design-system dropdown-menu(css/components.css 4719행~, js/components.js
                               initDropdownMenus)를 이 post-actions 안에서만 쓰는 공용 프리미티브로 이식(추후 분리 예정,
                               header.css의 Button/Breadcrumb과 같은 선례). 방문자에게는 <s_ad_div> 자체가 렌더되지 않으므로
                               "더보기" 아이콘도 자동으로 함께 숨는다(레퍼런스가 로그인 상태 캡처였을 가능성과 일치하는 동작).

---

## 6. [PREVNEXT 요청] "이전/다음글 기능 넣어" — Tistory 공식 문서

[PREVNEXT 요청] "이전/다음글 기능 넣어" — Tistory 공식 문서
                           (contents/post.html "이전 글 / 다음 글" 절) 실측: <s_article_prev>/
                           <s_article_next>는 서로 독립된 조건 그룹(글이 맨 처음/맨 끝이면
                           해당 쪽이 통째로 빠진다) — 관련글처럼 반복 태그가 아니라 각각
                           0~1개만 존재한다. 위 "관련글"과 나란히 "다른 글 보기" 성격이라
                           태그/댓글(참여 성격) 앞에 배치했다. 아래 nav 자체는 둘 다 없을
                           때만 CSS로 숨긴다(content.css [data-slot="post-prevnext"]).

---

## 7. [SPEC 2026-09-06] 공지사항(/notice/N) 단일 글 본문 — `<s_notice_rep>` 블록

공지사항은 일반 글의 `<s_article_rep>` 루프를 타지 않고 별도의 `<s_notice_rep>`/
`notice_rep_*` 치환자를 쓴다(티스토리 공식 스킨 문서로 확인 — `s_rct_notice`는
사이드바 위젯용 반복일 뿐, 단일 공지 페이지 본문에는 대응하지 않아 처음엔
제목만 나오고 본문이 비어 있는 버그가 있었다). article 쪽(`<s_permalink_article_rep>`
내부)과 동일한 `data-slot`(`post-single`/`post-single-title`/`post-single-meta`/
`post-thumb`/`post-single-body`)을 그대로 재사용해 같은 타이포그래피가 적용되게
했다. 댓글(`<s_rp>`)은 콘텐츠 종류와 무관한 공통 태그라 article 쪽과 동일하게
포함했지만, 좋아요/공유/이전-다음글/태그/관련글은 공지사항 개념상 의미가 없어
계속 제외했다.

## 8. [SPEC 2026-09-06] 공지사항 댓글 헤딩에 개수 치환자를 안 쓰는 이유

article 쪽 댓글 헤딩은 `[##_article_rep_rp_cnt_##]`로 개수를 보여주는데, 이
치환자는 article 전용이라 공지사항 컨텍스트에서는 치환되지 않고 리터럴 텍스트
그대로("댓글 [##_article_rep_rp_cnt_##]") 출력되는 실제 버그가 있었다(대응하는
`notice_rep_rp_cnt`류 치환자는 티스토리 문서에 없음). 그래서 공지사항 쪽
헤딩은 숫자 없이 "댓글"만 표시 — 실제 개수는 아래 댓글 목록으로 확인 가능하다.

---

## 9. [SPEC 2026-09-06] 위젯 영역 하단 "소개" 메뉴

"위젯영역 하단에 about 페이지 메뉴 추가" 요청 — 링크 대상은 Tistory "페이지
관리"로 등록한 정적 Page(`/pages/about`) — Page는 알고 보니 Notice와 달리
일반 글과 동일한 `<s_article_rep>`/`<s_permalink_article_rep>` 템플릿을 그대로
타서(실측 확인) 별도 `s_notice_rep` 같은 전용 블록이 필요 없었다.

**2026-09-07 갱신 — 다른 위젯과 동일한 카드로 통일.** 처음엔 공지사항/최근 글처럼
반복되는 Tistory 위젯이 아니라 정적 링크 하나라는 이유로 `<s_sidebar_element>`
"card" 패턴 대신 가벼운 `<nav data-slot="widgets-footer">` + 전용 링크 클래스로
구현했었는데, 사용자가 "다른 섹션과 마찬가지로 데이터슬롯 카드로 구분"을 요청해
다른 위젯 5개와 완전히 같은 `<s_sidebar_element><section data-slot="card"
data-size="sm" data-widget="about"><div data-slot="card-content">...` 구조로
교체(제목 개념이 없는 단일 링크라 `card-header` 없이 `card-content`만). 앞에
붙였던 정보(ⓘ) 아이콘도 "앞에 아이콘 제거" 요청으로 함께 제거 — 이제 "소개"
텍스트 링크(공용 `data-variant="link"` Button)만 남는다.

## 10. [SPEC 2026-09-07] 사이드바 "아카이브" 카테고리 트리 — 정적 하드코딩 →
실제 관리자 카테고리와 연동

"사이드메뉴의 메뉴가 하드코딩되어있어 실제 관리자페이지의 카테고리관리가
연결되야돼" 요청 — 2026-09-01 Q2에서 "A(정적 하드코딩)"로 확정했던 결정을
뒤집는다. 실사이트 HTML 편집에 `[##_category_list_##]`/`[##_category_##]`를
임시로 넣어(적용 후 즉시 원복) 실측한 결과: 후자(트리형)는 구식 `<table>` +
`tab_*.gif` 스프라이트 기반이라 재이식이 사실상 불가능하지만, 전자(리스트형)는
깨끗한 `<ul class="tt_category"><li><a class="link_tit">분류 전체보기…
<ul class="category_list"><li><a class="link_item">Design…
<ul class="sub_category_list"><li><a class="link_sub_item">Logo…`
구조를 내려준다 — 게다가 각 `<a>` 안에 `<span class="c_cnt">(N)</span>`(글
개수, 2026-07 결정에 따라 표시 안 함)과 조건부 `<img alt="N" src=".../
new_ico_5.gif">`(Tistory 자체 "새 글" 판정 — 최상위/하위 카테고리 모두에
독립적으로 붙는다)까지 포함한다.

이 리스트형 태그를 그대로 스타일링하는 대신(원본 클래스가 이 스킨의
`data-slot` 체계와 완전히 다름), `<div id="category-source" hidden>
[##_category_list_##]</div>`로 실제 데이터를 숨겨서 심어두고, 빈
`<ul id="sidebar-category-menu" data-slot="sidebar-menu"></ul>`에
`category.js`(신규)가 페이지 로드 시 그 숨은 소스를 파싱해 **기존
아코디언/배지/툴팁 마크업과 완전히 동일한 `data-slot` 구조**를 런타임에
합성해 넣는다 — sidebar.css/sidebar.js/tooltip.js를 단 한 줄도 건드리지
않고도 그대로 재사용된다(sidebar.js의 `initCollapsibleMenus`/
`initActiveState`, tooltip.js의 `initTooltips`가 이미 data-slot 속성
기반으로만 동작해서 가능). 상세 파싱 로직·아이콘 정책·실행 순서 이유는
`category.js.md` 참고.

**노스크립트 대응**: 카테고리 트리 자체가 client-side에서 조립되므로,
JS가 꺼지면 `<ul id="sidebar-category-menu">`가 빈 채로 남는다(이전엔
정적 하드코딩이라 JS 없이도 항상 보였음 — 이 아키텍처의 불가피한 트레이드
오프). `<noscript>`로 "전체 카테고리 보기"(`/category`) 링크 하나만
최소 대체 제공.

**로컬 검증 픽스처**: `make-preview.mjs`의 `SUBSTITUTIONS.category_list`에
위에서 실측한 원본 그대로(클래스명·개수·new 아이콘까지)를 고정해 뒀다 —
Design(하위 3개, Font만 new)/Code(신규, 이전엔 하드코딩 목록에 없던 빈
카테고리)/Ai로 구성, 실사이트의 "하드코딩된 사이드바가 실제로는 최신
카테고리 상태와 어긋나 있었다"는 문제 상황을 그대로 재현한다.

---

## 2026-09-08 수정 — 사이드바 방문자 위젯 마크업: 카드 2개 → `ul`/`li` 리스트 행

`sidebar-menu-item[data-footer-stat="expanded"]` 안쪽을 `div.sidebar-stat-row`
(flex row) > `div.sidebar-stat-card` × 2(각각 label/value 세로 쌓임)에서
`ul[data-slot="sidebar-stat-list"]` > `li[data-slot="sidebar-stat-row"]` × 2
(각 행 안에 라벨 `span[data-slot="card-title"]` + 값
`span[data-slot="sidebar-stat-value"]`을 좌우로 배치)로 재구성. 상세 사유·CSS는
`components/sidebar.css.md` 참고. 접힘 상태(`data-footer-stat="collapsed"`)의
아이콘+`data-tooltip`/`tooltip-content` 마크업은 그대로 유지.

