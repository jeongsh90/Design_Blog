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

