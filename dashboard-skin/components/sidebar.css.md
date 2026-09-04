# `sidebar.css` — 설계 주석

소스: `dashboard-skin/components/sidebar.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Sidebar — shadcn/ui 바닐라 포트

════════════════════════════════════════════════════════════════
   Sidebar — shadcn/ui 바닐라 포트
   ────────────────────────────────────────────────────────────────
   기반(baseline): D:\MyCloud\2026포트폴리오\Design-system\css\components.css
                   368–789행 (`[data-slot="sidebar-*"]` 포트)
                   → 새로 짜지 않고 그대로 가져와 스펙대로 수정/확장했다.
   스펙:           _workspace/sidebar_designer-spec.md
   변경분은 전부 `[SPEC …]` 주석으로 표시했다.
   ════════════════════════════════════════════════════════════════

---

## 2. Wrapper

── Wrapper ──

---

## 3. 16rem / 256px

16rem / 256px

---

## 4. 3rem  / 48px

3rem  / 48px

---

## 5. [SPEC §7-4] 모바일 Sheet용. 이번 구역에서는 선언만 하고 쓰지 않는다.

[SPEC §7-4] 모바일 Sheet용. 이번 구역에서는 선언만 하고 쓰지 않는다.

---

## 6. 18rem / 288px

18rem / 288px

---

## 7. [SPEC §4-4 / 요구사항 "100vw"] 데모의 .app-shell이 하던 레이아웃 역할을

[SPEC §4-4 / 요구사항 "100vw"] 데모의 .app-shell이 하던 레이아웃 역할을
     wrapper 자신이 맡는다.

---

## 8. [SPEC §7-2 보강] wrapper 레벨 상태만으로도 폭이 확정되게 한다.

[SPEC §7-2 보강] wrapper 레벨 상태만으로도 폭이 확정되게 한다.
     skin.html은 wrapper 여는 태그 직후의 동기 스크립트로 wrapper에만
     data-state를 심는다(그 시점에 자식 <aside>는 아직 파싱 전이다).
     이 규칙이 없으면 첫 페인트에서 폭이 튄다. 위의 원본 규칙은 그대로 둔다.

---

## 9. [SPEC §7-2] <head> 인라인 스크립트가 심는 초기 힌트.

[SPEC §7-2] <head> 인라인 스크립트가 심는 초기 힌트.
     JS가 실제 data-state를 세팅하는 순간 :not([data-state])가 풀려 정상 규칙이 이긴다.

---

## 10. [SPEC §4-3(1)] 전환 애니메이션 — 포트에 transition이 하나도 없어 접힘이 튄다.

[SPEC §4-3(1)] 전환 애니메이션 — 포트에 transition이 하나도 없어 접힘이 튄다.
     shadcn 원본: transition-[width,left,right] duration-200 ease-linear

---

## 11. Header / Footer

── Header / Footer ──

---

## 12. 56px — [SPEC §8-Q3] 다음 구역 header와 동일

56px — [SPEC §8-Q3] 다음 구역 header와 동일

---

## 13. [2026-09-04] flex-direction:row / align-items:center 오버라이드 제거.

[2026-09-04] flex-direction:row / align-items:center 오버라이드 제거.
       2026-09-03에 "로고 우측 시스템 아이콘"을 <ul>의 형제로 두면서 필요했던
       가로 배치인데, 그 아이콘이 <li> 안 sidebar-menu-action(absolute)으로
       들어가면서 header의 flex 자식이 다시 <ul> 하나뿐이 됐다 — 위 공용
       규칙의 column + 여기의 justify-content:center로 이전과 동일한 결과다
       (실측: 펼침/접힘 모두 ul이 헤더 콘텐츠 폭을 온전히 차지).
       gap:8px도 자식이 하나뿐이라 적용될 상대가 없다 → 2026-09-04의
       "폭 0 유령 flex 아이템이 gap을 먹어 로고가 4px 밀리던" 버그의
       구조적 원인 자체가 사라졌고, 그 핫픽스([data-sidebar-header-action]
       래퍼 숨김 규칙 2종)도 함께 삭제했다.

---

## 14. [2026-09-03 요청] 로고 우측 "시스템 아이콘" — 티스토리 관리 페이지로

[2026-09-03 요청] 로고 우측 "시스템 아이콘" — 티스토리 관리 페이지로
     바로 연결. 사용자 확인 결과: 실제 계정/블로그 목록 콤보박스는 스킨에
     직접 만들지 않기로 함(스킨엔 "로그인한 소유자에게만" 조건부 표시할
     방법이 없어 — Tistory 공식 문서 실측 확인 — 만들면 방문자 전원에게
     개인정보가 노출된다. 그 UI는 티스토리가 로그인 시 자동으로 얹는
     관리 메뉴바가 이미 담당한다). 대신 `/manage`(루트 상대경로 — 이
     스킨이 다른 티스토리 블로그에 재사용돼도 항상 그 블로그 자신의
     관리 페이지를 가리킨다)로 바로 연결해, 실제 소유자가 로그인한
     상태로 클릭하면 그 이후 계정 전환 등은 티스토리 자체 UI가 이어받는다.
     [2026-09-04] 이 아이콘은 이제 전용 스타일(`[data-sidebar-header-action]`)이
     아니라 shadcn 정본 프리미티브 `sidebar-menu-action`을 그대로 쓴다 —
     정의는 이 파일 아래 "Menu action" 절. 접힘 숨김·오른쪽 패딩 예약·
     hover 노출이 전부 그 프리미티브에 이미 들어 있어 헤더 전용 규칙이
     필요 없어졌다(전용 규칙 3종 삭제, 죽은 코드 정리).

---

## 15. Footer 방문자 수 — 접힘/펼침 두 표현 전환 (2026-09-03 요청)

── Footer 방문자 수 — 접힘/펼침 두 표현 전환 (2026-09-03 요청) ──
     "카드형태로 1행으로 나열, 접힌상태에서는 현재상태 유지" — skin.html에 두 개의
     <li>를 나란히 두고(하나는 기존 아이콘+tooltip, 하나는 아래 카드 2장) 이 두
     규칙으로 정확히 하나만 보이게 한다(shadcn 원본에 없는 이 프로젝트 전용 패턴 —
     sidebar-menu-button의 `tooltip` prop이 라벨만 접었다 폈다 하는 것과 달리,
     여기는 표현 자체가 아예 다른 마크업이라 서로 완전히 다른 두 요소를 토글해야 함).

---

## 16. Footer 방문자 수 카드 (펼침 전용)

── Footer 방문자 수 카드 (펼침 전용) ──
     Design-system Card(`components.css` 6278행, bg-card/radius-xl/링 섀도)를
     그대로 쓰기엔 이 자리가 좁아(사이드바 16rem − 패딩) 과하다 — 배경·보더·radius
     "언어"만 가져오되 sidebar 전용 토큰(--color-sidebar-accent/-border)으로
     축소 재구성한 미니 통계 카드다.

---

## 17. Content

── Content ──

---

## 18. Group

── Group ──

---

## 19. Menu

── Menu ──

---

## 20. [SPEC §3-3(c)] hover는 배경만 바꾼다 — 원본에 있던

[SPEC §3-3(c)] hover는 배경만 바꾼다 — 원본에 있던
     `color: var(--color-sidebar-accent-foreground)` 선언을 의도적으로 제거했다.
     accent-foreground가 파랑이 된 이상 이 선언을 두면 hover와 active가 동일해진다.

---

## 21. [2026-09-04 요청] "sidebar-menu-item hover시 배경 제거" — 단, 헤더의

[2026-09-04 요청] "sidebar-menu-item hover시 배경 제거" — 단, 헤더의
     브랜드 로고 행 하나만이다. 위 전역 규칙은 Design/Ai 등 실제 네비게이션
     항목의 hover 피드백이라 그대로 둔다(전역으로 지우면 사이드바 전체의
     hover 피드백이 사라지는 회귀). 헤더 로고는 "현재 페이지로 이동"이라
     행 전체가 밝아질 필요가 없고, 이제 그 행 안에 자체 hover 배경을 가진
     sidebar-menu-action(톱니바퀴)이 들어와 두 배경이 겹쳐 보이는 문제도 있다.
     [data-active="true"]는 유지 — :not()으로 제외해 활성 배경이 hover 중에도
     남게 한다(현재 initActiveState()는 [data-slot="sidebar-content"] 안의
     링크만 훑으므로 이 브랜드 링크는 active가 될 수 없지만, 나중에 범위가
     넓어져도 깨지지 않도록 미리 막아 둔다).
     접힘 상태의 동일 효과는 아래 `[data-size="lg"]:hover` 규칙이 이미 담당.

---

## 22. 상호작용하지 않는 표시용 행(예: 방문자 수)은 포인터 커서를 주지 않는다.

상호작용하지 않는 표시용 행(예: 방문자 수)은 포인터 커서를 주지 않는다.
     hover 배경도 뜨지 않게 한다 — 누를 수 있는 것처럼 보이면 안 된다.

---

## 23. 접힘(icon) 상태

── 접힘(icon) 상태 ──

---

## 24. 헤더 로고 버튼의 좌우 패딩을 제거해 접힘/펼침 모두 icon-box 위치를 header padding(8px) 기준으로 고정

헤더 로고 버튼의 좌우 패딩을 제거해 접힘/펼침 모두 icon-box 위치를 header padding(8px) 기준으로 고정

---

## 25. Team / Avatar icon box

── Team / Avatar icon box ──

---

## 26. Sub menu

── Sub menu ──

---

## 27. [SPEC §3-3(c)] menu-button과 같은 이유로 hover에서는 색을 바꾸지 않는다.

[SPEC §3-3(c)] menu-button과 같은 이유로 hover에서는 색을 바꾸지 않는다.

---

## 28. Menu action

── Menu action ──

---

## 29. 접힘에서는 action 자체가 display:none이므로 예약 패딩도 주지 않는다.

접힘에서는 action 자체가 display:none이므로 예약 패딩도 주지 않는다.
     (:has 선택자는 특이성이 높아 접힘의 `padding: 0`을 이기므로 여기서 제외해야 한다 —
      badge 쪽에서 실제로 아이콘이 왼쪽으로 밀리는 버그가 났던 것과 같은 구조다.)

---

## 30. [2026-09-04 추가] shadcn 원본의

[2026-09-04 추가] shadcn 원본의
       "peer-data-[size=sm]/menu-button:top-1"
       "peer-data-[size=default]/menu-button:top-1.5"
       "peer-data-[size=lg]/menu-button:top-2.5"
     3종 변형(sidebar.tsx SidebarMenuAction, WebFetch로 원문 확인).
     Tailwind의 `peer`는 "바로 앞 형제"이므로 CSS에서는 형제 결합자로 옮긴다.
     이 프리미티브가 처음 실제로 쓰이는 곳이 헤더 브랜드 행([data-size="lg"],
     48px)이라, lg 변형이 없으면 default용 top:6px이 그대로 적용돼 아이콘이
     행 위쪽으로 치우친다. default(6px)는 위 기본 선언이 이미 담당.

---

## 31. shadcn 원본 showOnHover: "group-focus-within/menu-item:opacity-100

shadcn 원본 showOnHover: "group-focus-within/menu-item:opacity-100
     group-hover/menu-item:opacity-100 data-[state=open]:opacity-100".
     [2026-09-04 추가] focus-within 항목이 우리 포트에 빠져 있었다 —
     opacity:0인 채로 Tab 포커스가 들어오면 보이지 않는 요소에 포커스 링만
     생기는 접근성 문제라 원본대로 채웠다(이 프리미티브를 실제로 쓰기
     시작하면서 드러난 누락).

---

## 32. 여기서부터는 Design-system 포트에 없던 슬롯 — 스펙 §4-3 신규 작성분

════════════════════════════════════════════════════════════════
   여기서부터는 Design-system 포트에 없던 슬롯 — 스펙 §4-3 신규 작성분
   ════════════════════════════════════════════════════════════════

---

## 33. [SPEC §4-3(6)] sidebar-menu-badge

── [SPEC §4-3(6)] sidebar-menu-badge ──

---

## 34. 펼침에서만 배지 자리를 예약한다.

펼침에서만 배지 자리를 예약한다.
   접힘에서는 배지가 display:none인데도 이 규칙이 살아 있으면(`:has` + 자식 결합자라
   접힘의 `padding: 0`보다 특이성이 높다) 오른쪽 패딩 28px가 남아 아이콘이 왼쪽으로
   밀리고 잘렸다 — 배지가 있는 Design/Ai만 헤더·푸터 아이콘과 중심이 어긋났던 원인.

---

## 35. 배지 폭(20) + 여백 — 스펙 §4-1의 라벨 가용폭 계산과 동일한 예약

배지 폭(20) + 여백 — 스펙 §4-1의 라벨 가용폭 계산과 동일한 예약

---

## 36. [SPEC §5-2] 별도 회색 토큰 대신 전경색 + opacity로 구성해

[SPEC §5-2] 별도 회색 토큰 대신 전경색 + opacity로 구성해
     라이트/다크 양쪽에서 한 줄로 동작하고, 활성 시 자연스럽게 살아난다.

---

## 37. sidebar-group-action

── sidebar-group-action ──
   스펙 §0 누락표에는 없지만 shadcn 원본에는 있는 슬롯이다(그룹 우상단 액션).
   다음 구역에서 바로 쓸 수 있도록 menu-action과 같은 규격으로 스타일만 만들어 둔다.
   이번 구역의 마크업에서는 사용하지 않는다.

---

## 38. [SPEC §4-3(7)] sidebar-separator

── [SPEC §4-3(7)] sidebar-separator ──

---

## 39. [SPEC §4-3(5)] sidebar-input (검색)

── [SPEC §4-3(5)] sidebar-input (검색) ──

---

## 40. [SPEC §4-3(5)] 기본 input은 36px이지만 메뉴 버튼(32px)과 리듬을 맞춘다.

[SPEC §4-3(5)] 기본 input은 36px이지만 메뉴 버튼(32px)과 리듬을 맞춘다.

---

## 41. [SPEC §4-3(2)] sidebar-trigger — ghost 버튼 기반

── [SPEC §4-3(2)] sidebar-trigger — ghost 버튼 기반 ──

---

## 42. 28px

28px

---

## 43. [SPEC §4-3(3)] sidebar-rail — 삭제

── [SPEC §4-3(3)] sidebar-rail — 삭제 ──
   사용자 요청("사이드메뉴 오른쪽 모서리 클릭 시 접히는 기능 제거")으로
   마크업에서 rail 버튼을 뺐다. 16px 히트영역 / cursor:w-resize·e-resize /
   hover 시 세로선 강조(::after) 규칙 전부 죽은 코드라 함께 제거한다.
   사이드바 우측 경계선 자체는 sidebar-container의 border-right가 계속 그린다
   (장식용이며 클릭해도 아무 일도 일어나지 않는다).

---

## 44. [SPEC §4-3(4)] sidebar-inset — 본문 영역(다음 구역에서 확장)

── [SPEC §4-3(4)] sidebar-inset — 본문 영역(다음 구역에서 확장) ──

---

## 45. [SPEC §7-6, 2026-09-03 Tooltip 프리미티브로 교체] 접힘 상태 전용 툴팁

── [SPEC §7-6, 2026-09-03 Tooltip 프리미티브로 교체] 접힘 상태 전용 툴팁 ──
   Radix Portal이 없어 툴팁이 sidebar-container의 overflow:hidden에 잘린다.
   → 접힘 상태에서만 해당 조상들의 overflow를 열어준다(펼침 상태는 그대로).
   (기존엔 sidebar-menu-button 자신도 overflow:visible로 열었었다 — 그때는
   툴팁이 버튼의 ::after 가상요소였기 때문. 지금은 tooltip-content가 버튼이
   아니라 sidebar-menu-item의 형제 자식이라(skin.html, 아래 [data-tooltip]
   주석·tooltip.js 참고) 버튼 자신의 overflow는 더 이상 관련 없다.)

---

## 46. [data-tooltip] 자체는 CSS에서 더 이상 쓰이지 않는다 — tooltip.js가 트리거를

[data-tooltip] 자체는 CSS에서 더 이상 쓰이지 않는다 — tooltip.js가 트리거를
   찾는 마커 속성일 뿐이다(실제 텍스트/포지셔닝은 tooltip.css의 Tooltip
   프리미티브 + skin.html에 형제로 둔 [data-slot="tooltip-content"]가 담당).
   접힘 여부 판정도 CSS가 아니라 tooltip.js의 bindTooltip({onlyWhenCollapsed:
   true})가 sidebar-wrapper의 data-state를 읽어 처리한다.

---

## 47. 테마 토글: 아이콘·라벨 전환을 JS 없이 CSS로만 (FOUC 없음)

── 테마 토글: 아이콘·라벨 전환을 JS 없이 CSS로만 (FOUC 없음) ──

---

## 48. 스크린리더 전용 텍스트 (shadcn sr-only 대응)

── 스크린리더 전용 텍스트 (shadcn sr-only 대응) ──

