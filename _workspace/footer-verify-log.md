# [FOOTER SPEC §9-4] 검증 원본 로그 (자동 생성)

총 assert 280건 · 실패 0건

## 실패 목록

없음


## 항목별 요약

| # | light | dark | assert |
|---|---|---|---|
| 1 | PASS | PASS | 12 |
| 2 | PASS | PASS | 32 |
| 3 | PASS | PASS | 10 |
| 4 | PASS | PASS | 22 |
| 5 | PASS | PASS | 8 |
| 6 | PASS | PASS | 5 |
| 7 | PASS | PASS | 10 |
| 8 | PASS | PASS | 6 |
| 9 | PASS | PASS | 6 |
| 10 | PASS | PASS | 2 |
| 13 | PASS | PASS | 4 |
| 12 | PASS | PASS | 10 |
| 11 | PASS | PASS | 2 |
| 14 | PASS | PASS | 16 |
| 15 | PASS | PASS | 4 |
| 17 | PASS | PASS | 4 |
| 18 | PASS | PASS | 24 |
| 19 | PASS | PASS | 6 |
| 20 | PASS | PASS | 6 |
| 21 | PASS | PASS | 10 |
| 22 | PASS | PASS | 2 |
| 23 | PASS | PASS | 12 |
| 24 | PASS | PASS | 4 |
| 25 | PASS | PASS | 20 |
| 26 | PASS | PASS | 8 |
| 28 | PASS | PASS | 4 |
| 29 | PASS | PASS | 6 |
| 30 | PASS | PASS | 4 |
| 16 | PASS | PASS | 16 |
| Q10 | PASS | PASS | 2 |
| 27 | PASS | — | 3 |

## 전체 assert

PASS #1 [light] post-footer가 post-single의 직계 자식(<footer>) — inside=true parentIsSingle=true tag=footer
PASS #1 [light] post-footer margin-top 48px — actual="48px" expected="48px"
PASS #1 [light] post-actions 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [light] post-actions padding-top — actual="32px" expected="32px"
PASS #2 [light] post-actions padding-bottom — actual="32px" expected="32px"
PASS #2 [light] post-actions border-top-width — actual="1px" expected="1px"
PASS #2 [light] post-actions border-top-color === --content-divider — actual="oklab(0 0 0 / 0.16)" expected="oklab(0 0 0 / 0.16)"
PASS #1 [light] post-related 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [light] post-related padding-top — actual="32px" expected="32px"
PASS #2 [light] post-related padding-bottom — actual="32px" expected="32px"
PASS #2 [light] post-related border-top-width — actual="1px" expected="1px"
PASS #2 [light] post-related border-top-color === --content-divider — actual="oklab(0 0 0 / 0.16)" expected="oklab(0 0 0 / 0.16)"
PASS #1 [light] post-tags 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [light] post-tags padding-top — actual="32px" expected="32px"
PASS #2 [light] post-tags padding-bottom — actual="32px" expected="32px"
PASS #2 [light] post-tags border-top-width — actual="1px" expected="1px"
PASS #2 [light] post-tags border-top-color === --content-divider — actual="oklab(0 0 0 / 0.16)" expected="oklab(0 0 0 / 0.16)"
PASS #1 [light] post-comments 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [light] post-comments padding-top — actual="32px" expected="32px"
PASS #2 [light] post-comments padding-bottom — actual="32px" expected="32px"
PASS #2 [light] post-comments border-top-width — actual="1px" expected="1px"
PASS #2 [light] post-comments border-top-color === --content-divider — actual="oklab(0 0 0 / 0.16)" expected="oklab(0 0 0 / 0.16)"
PASS #3 [light] 프로즈 미유출: body의 <p> margin-top — actual="16px" expected="16px"
PASS #3 [light] 프로즈 미유출: footer의 <p> margin-top(프로즈 아님) — actual="0px" expected="0px"
PASS #3 [light] 댓글 링크 color === --color-link — actual="rgb(20, 71, 230)" expected="rgb(20, 71, 230)"
PASS #3 [light] 댓글 링크 font-weight 400(프로즈 a의 500이 아님) — actual="400" expected="400"
PASS #3 [light] 댓글 링크 text-decoration-color === currentColor(프로즈 40% 혼합 아님) — td=rgb(20, 71, 230) color=rgb(20, 71, 230)
PASS #4 [light] 초기 aria-pressed — actual="false" expected="false"
PASS #4 [light] 초기 카운트 — actual="0" expected="0"
PASS #4 [light] 초기 하트 fill none — actual="none" expected="none"
PASS #4 [light] 클릭 후 aria-pressed — actual="true" expected="true"
PASS #4 [light] 클릭 후 data-liked — actual="true" expected="true"
PASS #4 [light] 클릭 후 카운트 0→1 — actual="1" expected="1"
PASS #4 [light] 클릭 후 하트 fill이 none 아님(currentColor 채움) — fill=rgb(0, 0, 0) color=rgb(0, 0, 0)
PASS #4 [light] 활성 하트 색 === --color-foreground(무채색 유지 / Q3) — actual="rgb(0, 0, 0)" expected="rgb(0, 0, 0)"
PASS #4 [light] localStorage 저장값 — actual="1" expected="1"
PASS #4 [light] 새로고침 후 공감 유지(aria-pressed) — actual="true" expected="true"
PASS #4 [light] 새로고침 후 공감 유지(카운트) — actual="1" expected="1"
PASS #5 [light] 재클릭 aria-pressed false — actual="false" expected="false"
PASS #5 [light] 재클릭 카운트 1→0 — actual="0" expected="0"
PASS #5 [light] 재클릭 fill none 복귀 — actual="none" expected="none"
PASS #5 [light] 재클릭 localStorage 0 — actual="0" expected="0"
PASS #6 [light] navigator.share 있음 → hidden 제거 + 노출 — hasApi=true hidden=false visible=true
PASS #7 [light] 복사 클릭 data-copied — actual="true" expected="true"
PASS #7 [light] 복사 후 idle 아이콘 숨김 — actual="none" expected="none"
PASS #7 [light] 복사 후 done(체크) 아이콘 표시 — display=flex
PASS #7 [light] sr-only 상태 문구 — actual="링크를 복사했습니다" expected="링크를 복사했습니다"
PASS #7 [light] 1.6초 뒤 원복 — copied=null done=none
PASS #8 [light] post-admin 버튼 3개 렌더(목업 한정) — {"count":3,"visible":true,"editHref":"/manage/post/301","stateLabel":"비공개로","onclicks":[null,"return false;","return false;"]}
PASS #8 [light] 수정 링크 href — actual="/manage/post/301" expected="/manage/post/301"
PASS #8 [light] 공개상태 전환 라벨 — actual="비공개로" expected="비공개로"
PASS #9 [light] 관련글 항목 5개(s_article_related_rep 확장) — actual=5 expected=5
PASS #9 [light] 각 항목이 widget-* 프리미티브 재사용 — ["widget-link","widget-body","widget-title","post-related-date"]
PASS #10 [light] widget-title color === --content-item-title-color (§6-2 재선언) — actual="oklab(0.277762 0.0000126958 0.00000554323)" expected="oklab(0.277762 0.0000126958 0.00000554323)"
PASS #13 [light] 항목 border-top-color === --color-border — actual="rgb(229, 229, 229)" expected="rgb(229, 229, 229)"
PASS #13 [light] 항목 border-top-width — actual="1px" expected="1px"
PASS #12 [light] 긴 제목 한 줄 말줄임 — scrollW=659 clientW=628 ws=nowrap to=ellipsis lines=1
PASS #12 [light] 긴 제목이 날짜를 밀어내지 않음 — dateRight=1000 linkRight=1008 dateW=64
PASS #12 [light] 날짜 font-size 12px — actual="12px" expected="12px"
PASS #12 [light] 날짜 margin-left 16px — actual="16px" expected="16px"
PASS #12 [light] 날짜 tabular-nums — tabular-nums
PASS #9 [light] 제목이 카테고리 링크 — actual="/category/Design" expected="/category/Design"
PASS #11 [light] hover 제목 색 === --color-card-foreground — actual="rgb(0, 0, 0)" expected="rgb(0, 0, 0)"
PASS #14 [light] data-tags=normalized — actual="normalized" expected="normalized"
PASS #14 [light] 태그 앵커 5개 — actual=5 expected=5
PASS #14 [light] 모든 앵커에 data-slot=badge · data-variant=outline — true
PASS #14 [light] 컨테이너 텍스트 노드 0개(쉼표 제거) — actual=0 expected=0
PASS #14 [light] 태그 텍스트에 '#' 미포함(CSS가 붙임) — actual=false expected=false
PASS #14 [light] 정규화 후 display flex — actual="flex" expected="flex"
PASS #14 [light] flex-wrap wrap — actual="wrap" expected="wrap"
PASS #14 [light] gap 8px — actual="8px" expected="8px"
PASS #15 [light] ::before가 '#' 렌더 — "#"
PASS #15 [light] ::before opacity 0.5 — actual="0.5" expected="0.5"
PASS #17 [light] 태그 가로 오버플로 0 — overflowRight=-315.234375
PASS #17 [light] 태그가 감싸질 수 있는 구조(행 수 관측) — rows=1
PASS #18 [light] 최상위 댓글 3개 — actual=3 expected=3
PASS #18 [light] 대댓글 1개 — actual=1 expected=1
PASS #18 [light] comment-replies margin-left 44px — actual="44px" expected="44px"
PASS #18 [light] 대댓글 들여쓰기 = 부모 아바타(32)+gap(12) = 44px — actual=44 expected≈44 (±0.6)
PASS #18 [light] 대댓글 항목(아바타) 좌측선 === 부모 본문 좌측선 — actual=324 expected≈324 (±0.6)
PASS #18 [light] [실측] 부모 본문 left=324 · 대댓글 본문 left=360 (차 36px = 대댓글아바타24+gap12) — parentBody=324 replyAvatar=324 replyBody=360
PASS #18 [light] 부모 아바타 32px — actual=32 expected=32
PASS #18 [light] 대댓글 아바타 24px(data-size=sm) — actual=24 expected=24
PASS #18 [light] 댓글 항목 상하 패딩 20px — actual="20px/20px" expected="20px/20px"
PASS #18 [light] 2번째 댓글 border-top 1px — actual="1px" expected="1px"
PASS #18 [light] 대댓글 첫 항목 border-top 1px — actual="1px" expected="1px"
PASS #18 [light] 대댓글에는 답글 버튼 없음(수정·삭제만) — actual="수정·삭제" expected="수정·삭제"
PASS #19 [light] 댓글1: <img>가 fallback 위를 덮음(z-index 1 · object-fit cover) — {"hasImg":true,"imgSrcHead":"data:image/svg+xml;utf8,","imgSlot":"avatar-image","imgZ":"1","imgObjectFit":"cover","fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #19 [light] 댓글2: 이미지 없음 → fallback 아이콘 노출 — {"hasImg":false,"imgSrcHead":null,"imgSlot":null,"imgZ":null,"imgObjectFit":null,"fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #19 [light] 아바타 원형(border-radius) — actual="3996px" expected="3996px"
PASS #20 [light] 댓글3: URL 문자열이 <img data-slot=avatar-image>로 승격 — {"hasImg":true,"imgSrcHead":"data:image/svg+xml;utf8,","imgSlot":"avatar-image","imgZ":"1","imgObjectFit":"cover","fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #20 [light] 승격 후 아바타 안 텍스트 노드 0 — actual=0 expected=0
PASS #20 [light] 아바타 박스에 남은 텍스트 노드 0(전 댓글) — actual="0,0,0" expected="0,0,0"
PASS #21 [light] 댓글 액션 기본 opacity 0 — actual="0" expected="0"
PASS #21 [light] 액션 버튼 2개(답글·수정·삭제) data-size=xs — actual="답글:xs:ghost|수정·삭제:xs:ghost" expected="답글:xs:ghost|수정·삭제:xs:ghost"
PASS #21 [light] onclick 문자열 그대로 유지 — actual="return false;|return false;" expected="return false;|return false;"
PASS #21 [light] hover 시 opacity 1 — actual="1" expected="1"
PASS #21 [light] 포커스(:focus-within)만으로도 opacity 1 + 탭 순서에 존재 — {"opacity":"1","isActive":true,"tabIndex":0,"matchesFocusWithin":true}
PASS #22 [light] 댓글 본문 링크 색 === --color-link — actual="rgb(20, 71, 230)" expected="rgb(20, 71, 230)"
PASS #23 [light] 게스트 입력 3칸 정확히 3등분(±1px) — widths=220,220,220
PASS #23 [light] 게스트 name 속성 값(치환자 자리) — actual="name,password,homepage" expected="name,password,homepage"
PASS #23 [light] Input 높이 36px — actual="36px,36px,36px" expected="36px,36px,36px"
PASS #23 [light] textarea name 속성 값 — actual="comment" expected="comment"
PASS #23 [light] textarea rows=3 · min-height 64px — actual="3/64px" expected="3/64px"
PASS #23 [light] textarea padding 8px 12px — actual="8px 12px" expected="8px 12px"
PASS #24 [light] textarea 포커스 border-color === --color-ring — actual="rgb(161, 161, 161)" expected="rgb(161, 161, 161)"
PASS #24 [light] textarea 포커스 box-shadow에 3px ring — oklab(0.708995 0.0000324249 0.0000141263 / 0.5) 0px 0px 0px 3px
PASS #25 [light] 비밀글 초기 unchecked — actual=false expected=false
PASS #25 [light] 비밀글 초기: 열린 자물쇠만 표시 — off=block on=none
PASS #25 [light] 비밀글 checkbox name 속성 값 — actual="secret" expected="secret"
PASS #25 [light] 클릭 후 checkbox checked — actual=true expected=true
PASS #25 [light] 클릭 후 잠긴 자물쇠로 교체 — off=none on=flex
PASS #25 [light] 클릭 후 배경 === --color-accent — bg=rgb(245, 245, 245) accent=rgb(245, 245, 245)
PASS #25 [light] 클릭 후 아이콘 색 === --color-foreground — actual="rgb(0, 0, 0)" expected="rgb(0, 0, 0)"
PASS #25 [light] 키보드 포커스 가능(sr-only checkbox가 탭 순서에 있음) — {"isActive":true,"tabIndex":0,"checked":true}
PASS #25 [light] Space로 토글 해제 + 열린 자물쇠 복귀 — {"checked":false,"off":"block","boxShadow":"oklab(0.708995 0.0000324249 0.0000141263 / 0.5) 0px 0px 0px 3px"}
PASS #25 [light] :has(:focus-visible) 포커스 링 — oklab(0.708995 0.0000324249 0.0000141263 / 0.5) 0px 0px 0px 3px
PASS #26 [light] 제출 버튼 background === --color-primary — actual="rgb(0, 0, 0)" expected="rgb(0, 0, 0)"
PASS #26 [light] 제출 버튼 <button type=button>(공식 예제 input[submit] 대체) — actual="button/button" expected="button/button"
PASS #26 [light] 제출 onclick 문자열 그대로 — actual="return false;" expected="return false;"
PASS #26 [light] 댓글 수 칩 === article_rep_rp_cnt — actual="3" expected="3"
PASS #28 [light] permalink 격자 배경 none — actual="none" expected="none"
PASS #28 [light] permalink 목록 타이틀 display none — actual="none" expected="none"
PASS #29 [light] content-inner가 스크롤(문서는 스크롤 안 함) — inner=4036/844 doc=900/900
PASS #29 [light] 커스텀 스크롤바 거터 존재 + thin/색 지정 유지(회귀 없음) — gutter=10 width=thin color=oklab(0.869938 0.0000396967 0.0000174046) rgba(0, 0, 0, 0)
PASS #29 [light] scroll-fade-y 마스크 적용 — mask=linear-gradient(rgba(0, 0, 0, 0) 0px, rgb(0, 0, 0) calc(0% +
PASS #30 [light] 가로 오버플로 0 — docScrollW=1440 innerW=1440
PASS #30 [light] 콘솔/네트워크 에러 0 — none
PASS #1 [dark] post-footer가 post-single의 직계 자식(<footer>) — inside=true parentIsSingle=true tag=footer
PASS #1 [dark] post-footer margin-top 48px — actual="48px" expected="48px"
PASS #1 [dark] post-actions 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [dark] post-actions padding-top — actual="32px" expected="32px"
PASS #2 [dark] post-actions padding-bottom — actual="32px" expected="32px"
PASS #2 [dark] post-actions border-top-width — actual="1px" expected="1px"
PASS #2 [dark] post-actions border-top-color === --content-divider — actual="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)" expected="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)"
PASS #1 [dark] post-related 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [dark] post-related padding-top — actual="32px" expected="32px"
PASS #2 [dark] post-related padding-bottom — actual="32px" expected="32px"
PASS #2 [dark] post-related border-top-width — actual="1px" expected="1px"
PASS #2 [dark] post-related border-top-color === --content-divider — actual="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)" expected="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)"
PASS #1 [dark] post-tags 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [dark] post-tags padding-top — actual="32px" expected="32px"
PASS #2 [dark] post-tags padding-bottom — actual="32px" expected="32px"
PASS #2 [dark] post-tags border-top-width — actual="1px" expected="1px"
PASS #2 [dark] post-tags border-top-color === --content-divider — actual="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)" expected="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)"
PASS #1 [dark] post-comments 좌우 경계 === post-single-body — block=[280,1000] body=[280,1000]
PASS #2 [dark] post-comments padding-top — actual="32px" expected="32px"
PASS #2 [dark] post-comments padding-bottom — actual="32px" expected="32px"
PASS #2 [dark] post-comments border-top-width — actual="1px" expected="1px"
PASS #2 [dark] post-comments border-top-color === --content-divider — actual="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)" expected="oklab(0.985098 0.0000447631 0.0000197291 / 0.16)"
PASS #3 [dark] 프로즈 미유출: body의 <p> margin-top — actual="16px" expected="16px"
PASS #3 [dark] 프로즈 미유출: footer의 <p> margin-top(프로즈 아님) — actual="0px" expected="0px"
PASS #3 [dark] 댓글 링크 color === --color-link — actual="rgb(142, 197, 255)" expected="rgb(142, 197, 255)"
PASS #3 [dark] 댓글 링크 font-weight 400(프로즈 a의 500이 아님) — actual="400" expected="400"
PASS #3 [dark] 댓글 링크 text-decoration-color === currentColor(프로즈 40% 혼합 아님) — td=rgb(142, 197, 255) color=rgb(142, 197, 255)
PASS #4 [dark] 초기 aria-pressed — actual="false" expected="false"
PASS #4 [dark] 초기 카운트 — actual="0" expected="0"
PASS #4 [dark] 초기 하트 fill none — actual="none" expected="none"
PASS #4 [dark] 클릭 후 aria-pressed — actual="true" expected="true"
PASS #4 [dark] 클릭 후 data-liked — actual="true" expected="true"
PASS #4 [dark] 클릭 후 카운트 0→1 — actual="1" expected="1"
PASS #4 [dark] 클릭 후 하트 fill이 none 아님(currentColor 채움) — fill=rgb(250, 250, 250) color=rgb(250, 250, 250)
PASS #4 [dark] 활성 하트 색 === --color-foreground(무채색 유지 / Q3) — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #4 [dark] localStorage 저장값 — actual="1" expected="1"
PASS #4 [dark] 새로고침 후 공감 유지(aria-pressed) — actual="true" expected="true"
PASS #4 [dark] 새로고침 후 공감 유지(카운트) — actual="1" expected="1"
PASS #5 [dark] 재클릭 aria-pressed false — actual="false" expected="false"
PASS #5 [dark] 재클릭 카운트 1→0 — actual="0" expected="0"
PASS #5 [dark] 재클릭 fill none 복귀 — actual="none" expected="none"
PASS #5 [dark] 재클릭 localStorage 0 — actual="0" expected="0"
PASS #6 [dark] navigator.share 있음 → hidden 제거 + 노출 — hasApi=true hidden=false visible=true
PASS #7 [dark] 복사 클릭 data-copied — actual="true" expected="true"
PASS #7 [dark] 복사 후 idle 아이콘 숨김 — actual="none" expected="none"
PASS #7 [dark] 복사 후 done(체크) 아이콘 표시 — display=flex
PASS #7 [dark] sr-only 상태 문구 — actual="링크를 복사했습니다" expected="링크를 복사했습니다"
PASS #7 [dark] 1.6초 뒤 원복 — copied=null done=none
PASS #8 [dark] post-admin 버튼 3개 렌더(목업 한정) — {"count":3,"visible":true,"editHref":"/manage/post/301","stateLabel":"비공개로","onclicks":[null,"return false;","return false;"]}
PASS #8 [dark] 수정 링크 href — actual="/manage/post/301" expected="/manage/post/301"
PASS #8 [dark] 공개상태 전환 라벨 — actual="비공개로" expected="비공개로"
PASS #9 [dark] 관련글 항목 5개(s_article_related_rep 확장) — actual=5 expected=5
PASS #9 [dark] 각 항목이 widget-* 프리미티브 재사용 — ["widget-link","widget-body","widget-title","post-related-date"]
PASS #10 [dark] widget-title color === --content-item-title-color (§6-2 재선언) — actual="oklab(0.847046 0.000038594 0.0000169277)" expected="oklab(0.847046 0.000038594 0.0000169277)"
PASS #13 [dark] 항목 border-top-color === --color-border — actual="rgba(255, 255, 255, 0.1)" expected="rgba(255, 255, 255, 0.1)"
PASS #13 [dark] 항목 border-top-width — actual="1px" expected="1px"
PASS #12 [dark] 긴 제목 한 줄 말줄임 — scrollW=659 clientW=628 ws=nowrap to=ellipsis lines=1
PASS #12 [dark] 긴 제목이 날짜를 밀어내지 않음 — dateRight=1000 linkRight=1008 dateW=64
PASS #12 [dark] 날짜 font-size 12px — actual="12px" expected="12px"
PASS #12 [dark] 날짜 margin-left 16px — actual="16px" expected="16px"
PASS #12 [dark] 날짜 tabular-nums — tabular-nums
PASS #9 [dark] 제목이 카테고리 링크 — actual="/category/Design" expected="/category/Design"
PASS #11 [dark] hover 제목 색 === --color-card-foreground — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #14 [dark] data-tags=normalized — actual="normalized" expected="normalized"
PASS #14 [dark] 태그 앵커 5개 — actual=5 expected=5
PASS #14 [dark] 모든 앵커에 data-slot=badge · data-variant=outline — true
PASS #14 [dark] 컨테이너 텍스트 노드 0개(쉼표 제거) — actual=0 expected=0
PASS #14 [dark] 태그 텍스트에 '#' 미포함(CSS가 붙임) — actual=false expected=false
PASS #14 [dark] 정규화 후 display flex — actual="flex" expected="flex"
PASS #14 [dark] flex-wrap wrap — actual="wrap" expected="wrap"
PASS #14 [dark] gap 8px — actual="8px" expected="8px"
PASS #15 [dark] ::before가 '#' 렌더 — "#"
PASS #15 [dark] ::before opacity 0.5 — actual="0.5" expected="0.5"
PASS #17 [dark] 태그 가로 오버플로 0 — overflowRight=-315.234375
PASS #17 [dark] 태그가 감싸질 수 있는 구조(행 수 관측) — rows=1
PASS #18 [dark] 최상위 댓글 3개 — actual=3 expected=3
PASS #18 [dark] 대댓글 1개 — actual=1 expected=1
PASS #18 [dark] comment-replies margin-left 44px — actual="44px" expected="44px"
PASS #18 [dark] 대댓글 들여쓰기 = 부모 아바타(32)+gap(12) = 44px — actual=44 expected≈44 (±0.6)
PASS #18 [dark] 대댓글 항목(아바타) 좌측선 === 부모 본문 좌측선 — actual=324 expected≈324 (±0.6)
PASS #18 [dark] [실측] 부모 본문 left=324 · 대댓글 본문 left=360 (차 36px = 대댓글아바타24+gap12) — parentBody=324 replyAvatar=324 replyBody=360
PASS #18 [dark] 부모 아바타 32px — actual=32 expected=32
PASS #18 [dark] 대댓글 아바타 24px(data-size=sm) — actual=24 expected=24
PASS #18 [dark] 댓글 항목 상하 패딩 20px — actual="20px/20px" expected="20px/20px"
PASS #18 [dark] 2번째 댓글 border-top 1px — actual="1px" expected="1px"
PASS #18 [dark] 대댓글 첫 항목 border-top 1px — actual="1px" expected="1px"
PASS #18 [dark] 대댓글에는 답글 버튼 없음(수정·삭제만) — actual="수정·삭제" expected="수정·삭제"
PASS #19 [dark] 댓글1: <img>가 fallback 위를 덮음(z-index 1 · object-fit cover) — {"hasImg":true,"imgSrcHead":"data:image/svg+xml;utf8,","imgSlot":"avatar-image","imgZ":"1","imgObjectFit":"cover","fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #19 [dark] 댓글2: 이미지 없음 → fallback 아이콘 노출 — {"hasImg":false,"imgSrcHead":null,"imgSlot":null,"imgZ":null,"imgObjectFit":null,"fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #19 [dark] 아바타 원형(border-radius) — actual="3996px" expected="3996px"
PASS #20 [dark] 댓글3: URL 문자열이 <img data-slot=avatar-image>로 승격 — {"hasImg":true,"imgSrcHead":"data:image/svg+xml;utf8,","imgSlot":"avatar-image","imgZ":"1","imgObjectFit":"cover","fbVisible":true,"fbPosition":"absolute","size":"32x32","textLeft":0,"radius":"3996px"}
PASS #20 [dark] 승격 후 아바타 안 텍스트 노드 0 — actual=0 expected=0
PASS #20 [dark] 아바타 박스에 남은 텍스트 노드 0(전 댓글) — actual="0,0,0" expected="0,0,0"
PASS #21 [dark] 댓글 액션 기본 opacity 0 — actual="0" expected="0"
PASS #21 [dark] 액션 버튼 2개(답글·수정·삭제) data-size=xs — actual="답글:xs:ghost|수정·삭제:xs:ghost" expected="답글:xs:ghost|수정·삭제:xs:ghost"
PASS #21 [dark] onclick 문자열 그대로 유지 — actual="return false;|return false;" expected="return false;|return false;"
PASS #21 [dark] hover 시 opacity 1 — actual="1" expected="1"
PASS #21 [dark] 포커스(:focus-within)만으로도 opacity 1 + 탭 순서에 존재 — {"opacity":"1","isActive":true,"tabIndex":0,"matchesFocusWithin":true}
PASS #22 [dark] 댓글 본문 링크 색 === --color-link — actual="rgb(142, 197, 255)" expected="rgb(142, 197, 255)"
PASS #23 [dark] 게스트 입력 3칸 정확히 3등분(±1px) — widths=220,220,220
PASS #23 [dark] 게스트 name 속성 값(치환자 자리) — actual="name,password,homepage" expected="name,password,homepage"
PASS #23 [dark] Input 높이 36px — actual="36px,36px,36px" expected="36px,36px,36px"
PASS #23 [dark] textarea name 속성 값 — actual="comment" expected="comment"
PASS #23 [dark] textarea rows=3 · min-height 64px — actual="3/64px" expected="3/64px"
PASS #23 [dark] textarea padding 8px 12px — actual="8px 12px" expected="8px 12px"
PASS #24 [dark] textarea 포커스 border-color === --color-ring — actual="rgb(115, 115, 115)" expected="rgb(115, 115, 115)"
PASS #24 [dark] textarea 포커스 box-shadow에 3px ring — oklab(0.555523 0.0000253916 0.0000110865 / 0.5) 0px 0px 0px 3px
PASS #25 [dark] 비밀글 초기 unchecked — actual=false expected=false
PASS #25 [dark] 비밀글 초기: 열린 자물쇠만 표시 — off=block on=none
PASS #25 [dark] 비밀글 checkbox name 속성 값 — actual="secret" expected="secret"
PASS #25 [dark] 클릭 후 checkbox checked — actual=true expected=true
PASS #25 [dark] 클릭 후 잠긴 자물쇠로 교체 — off=none on=flex
PASS #25 [dark] 클릭 후 배경 === --color-accent — bg=rgb(64, 64, 64) accent=rgb(64, 64, 64)
PASS #25 [dark] 클릭 후 아이콘 색 === --color-foreground — actual="rgb(250, 250, 250)" expected="rgb(250, 250, 250)"
PASS #25 [dark] 키보드 포커스 가능(sr-only checkbox가 탭 순서에 있음) — {"isActive":true,"tabIndex":0,"checked":true}
PASS #25 [dark] Space로 토글 해제 + 열린 자물쇠 복귀 — {"checked":false,"off":"block","boxShadow":"oklab(0.555523 0.0000253916 0.0000110865 / 0.5) 0px 0px 0px 3px"}
PASS #25 [dark] :has(:focus-visible) 포커스 링 — oklab(0.555523 0.0000253916 0.0000110865 / 0.5) 0px 0px 0px 3px
PASS #26 [dark] 제출 버튼 background === --color-primary — actual="rgb(229, 229, 229)" expected="rgb(229, 229, 229)"
PASS #26 [dark] 제출 버튼 <button type=button>(공식 예제 input[submit] 대체) — actual="button/button" expected="button/button"
PASS #26 [dark] 제출 onclick 문자열 그대로 — actual="return false;" expected="return false;"
PASS #26 [dark] 댓글 수 칩 === article_rep_rp_cnt — actual="3" expected="3"
PASS #28 [dark] permalink 격자 배경 none — actual="none" expected="none"
PASS #28 [dark] permalink 목록 타이틀 display none — actual="none" expected="none"
PASS #29 [dark] content-inner가 스크롤(문서는 스크롤 안 함) — inner=4036/844 doc=900/900
PASS #29 [dark] 커스텀 스크롤바 거터 존재 + thin/색 지정 유지(회귀 없음) — gutter=10 width=thin color=oklab(0.370321 0.00325234 -0.0114229) rgba(0, 0, 0, 0)
PASS #29 [dark] scroll-fade-y 마스크 적용 — mask=linear-gradient(rgba(0, 0, 0, 0) 0px, rgb(0, 0, 0) calc(0% +
PASS #30 [dark] 가로 오버플로 0 — docScrollW=1440 innerW=1440
PASS #30 [dark] 콘솔/네트워크 에러 0 — none
PASS #6 [light] navigator.share stub → hidden 제거 + 실제 노출 — {"hasApi":true,"hidden":false,"visible":true,"label":"공유하기"}
PASS #6 [light] navigator.share 제거 → 공유 버튼 hidden 유지(링크 복사만 남음) — {"hasApi":false,"hidden":true,"visible":false,"copyVisible":true}
PASS #6 [light] share 미지원 컨텍스트에서도 콘솔 에러 0 — none
PASS #16 [light] nojs: content.js 미로드 확인 — loaded=false
PASS #16 [light] nojs: data-tags 미부여(폴백 경로) — normalized=null
PASS #16 [light] nojs: badge 미부여 — anyBadge=false
PASS #16 [light] nojs: 태그 앵커 5개 그대로 — actual=5 expected=5
PASS #16 [light] nojs: 태그가 여전히 읽힌다(쉼표 보여도 OK) — Pretendard, shadcn, 타이포그래피, Tailwind, 스킨
PASS #16 [light] nojs: 폴백 앵커 색 === --color-link — actual="rgb(20, 71, 230)" expected="rgb(20, 71, 230)"
PASS #16 [light] nojs: 가로 오버플로 0 — overflowRight=-432.484375 doc=1440/1440
PASS #16 [light] nojs: 콘솔 에러 0 — none
PASS #Q10 [light] nojs 관측: 아바타 URL 문자열이 텍스트로 남음(JS 승격 없음) — "data:image/svg+xml;utf8,%3Csvg"
PASS #16 [dark] nojs: content.js 미로드 확인 — loaded=false
PASS #16 [dark] nojs: data-tags 미부여(폴백 경로) — normalized=null
PASS #16 [dark] nojs: badge 미부여 — anyBadge=false
PASS #16 [dark] nojs: 태그 앵커 5개 그대로 — actual=5 expected=5
PASS #16 [dark] nojs: 태그가 여전히 읽힌다(쉼표 보여도 OK) — Pretendard, shadcn, 타이포그래피, Tailwind, 스킨
PASS #16 [dark] nojs: 폴백 앵커 색 === --color-link — actual="rgb(142, 197, 255)" expected="rgb(142, 197, 255)"
PASS #16 [dark] nojs: 가로 오버플로 0 — overflowRight=-432.484375 doc=1440/1440
PASS #16 [dark] nojs: 콘솔 에러 0 — none
PASS #Q10 [dark] nojs 관측: 아바타 URL 문자열이 텍스트로 남음(JS 승격 없음) — "data:image/svg+xml;utf8,%3Csvg"
PASS #27 [light] 인덱스 목업에 post-footer 계열 0개(permalink 전용 블록 미유출) — {"footer":0,"actions":0,"related":0,"tags":0,"comments":0,"commentItems":0,"postSingle":0,"gridBg":"present","titleDisplay":"flex"}
PASS #27 [light] 인덱스 격자 배경 유지 + 목록 타이틀 노출(:has 분기 회귀 없음) — gridBg=present titleDisplay=flex
PASS #27 [light] 인덱스 콘솔 에러 0 — none