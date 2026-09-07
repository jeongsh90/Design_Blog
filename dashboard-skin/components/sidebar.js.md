# `sidebar.js` — 설계 주석

소스: `dashboard-skin/components/sidebar.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [RESPONSIVE SPEC §4-7 ①] 모바일 판정 — shadcn hooks/use-mobile.ts의

[RESPONSIVE SPEC §4-7 ①] 모바일 판정 — shadcn hooks/use-mobile.ts의
       `window.matchMedia("(max-width: " + (768 - 1) + "px)")`와 1:1.

---

## 2. [RESPONSIVE SPEC §4-6] 쿠키가 없을 때만 쓰는 태블릿 기본값 판정.

[RESPONSIVE SPEC §4-6] 쿠키가 없을 때만 쓰는 태블릿 기본값 판정.

---

## 3. 드로어를 연 트리거를 기억해 뒀다 닫을 때 포커스를 되돌린다(§4-7 ②).

드로어를 연 트리거를 기억해 뒀다 닫을 때 포커스를 되돌린다(§4-7 ②).

---

## 4. [RESPONSIVE SPEC §4-7] 모바일 오프캔버스 드로어

─────────────────────────────────────────────────────────
       [RESPONSIVE SPEC §4-7] 모바일 오프캔버스 드로어
       shadcn SidebarProvider의 openMobile/setOpenMobile 대응.
       ─────────────────────────────────────────────────────────

---

## 5. ② setMobileOpen — shadcn setOpenMobile과 동일하게 쿠키에 쓰지 않는다.

② setMobileOpen — shadcn setOpenMobile과 동일하게 쿠키에 쓰지 않는다.

---

## 6. Radix Dialog가 SheetContent에 주는 것과 같은 역할.

Radix Dialog가 SheetContent에 주는 것과 같은 역할.
             Tab 순환 가둠은 미구현(§7 #4에 명시).

---

## 7. ③ 모드 전환

③ 모드 전환

---

## 8. 드로어는 언제나 펼침 레이아웃(§4-1) — 접힘 레이아웃 규칙이 전부

드로어는 언제나 펼침 레이아웃(§4-1) — 접힘 레이아웃 규칙이 전부
         wrapper[data-state="collapsed"]에 매달려 있으므로 여기만 고정하면 된다.
         쿠키는 건드리지 않는다(데스크톱 복귀 시 복원해야 하므로).

---

## 9. [§4-6] 쿠키가 있으면 쿠키가 이기고, 없을 때만 태블릿에서 접힘으로 시작.

[§4-6] 쿠키가 있으면 쿠키가 이기고, 없을 때만 태블릿에서 접힘으로 시작.

---

## 10. ④ shadcn toggleSidebar와 1:1 —

④ shadcn toggleSidebar와 1:1 —
       `isMobile ? setOpenMobile(o => !o) : setOpen(o => !o)`

---

## 11. 뷰포트가 모바일 경계를 넘나들 때 모드를 갈아탄다(shadcn useIsMobile의

뷰포트가 모바일 경계를 넘나들 때 모드를 갈아탄다(shadcn useIsMobile의
       mql change 리스너와 같은 자리). addEventListener가 없는 구형 Safari는
       addListener로 폴백.

---

## 12. ⑤ 닫기 경로 (1) 백드롭 클릭

⑤ 닫기 경로 (1) 백드롭 클릭

---

## 13. [RESPONSIVE SPEC §4-7 ⑤] Escape로 드로어 닫기.

[RESPONSIVE SPEC §4-7 ⑤] Escape로 드로어 닫기.
         새 리스너를 만들지 않고 기존 문서 keydown에 분기만 더한다.
         content.js의 Escape(드롭다운 전용)와는 대상이 달라 충돌하지 않는다.

---

## 14. display:none인 요소(접힘 전용 마크업 등)는 건너뛴다.

display:none인 요소(접힘 전용 마크업 등)는 건너뛴다.

---

## 15. [SPEC 2026-09-07] `initCollapsibleMenus` — 하위 메뉴 아코디언 토글

`sidebar.css.md` §15 참고. `[data-slot="collapsible"]`을 찾아 그 안의
`sidebar-menu-button`에 클릭 리스너만 건다 — `data-state`를 open/closed로 뒤집고
`aria-expanded`를 맞춰주는 게 전부다. `initActiveState`가 `a[data-slot=
"sidebar-menu-button"]`만 찾도록 이미 짜여 있어서(버튼으로 바뀐 Design 트리거는
그 셀렉터에 안 걸림), Design 자체는 더 이상 활성 표시 대상이 아니게 됐고 —
하위 링크(Logo/Font/Figma)는 그대로 `<a>`라 기존 활성 표시 로직이 손댈 필요 없이
그대로 동작한다.

**[2026-09-07 뒤늦게 발견된 배포 사고] 위 로직 자체는 처음부터 맞았지만, 실사이트
에는 오랫동안 반영이 안 돼 있었다.** 사용자가 "아코디언기능 작동안함"으로 재확인
요청하자 실측해보니, 실사이트 `sidebar.js`가 8553바이트(이 함수가 아예 없는 버전
— `grep initCollapsibleMenus` 0건)였고, 로컬 원본은 9184바이트였다. `category.js.md`
§10에 기록한 것과 동일한 `?_version_=` 캐시버스터 함정 — "파일업로드" 탭에서
`sidebar.js`를 올린 시점과 `skin.html`(HTML 탭)을 마지막으로 "적용"한 시점이
어긋나 있어서, `skin.html`이 참조하는 버전 번호 붙은 경로가 CDN에 옛 내용으로
굳어 있었다. 재업로드(9.2kB로 확인) + HTML 탭에서 무의미한 변경(끝에 빈 줄)으로
"적용" 재실행 → 새 버전 번호 발급 → 실사이트에서 Design/Code 두 아코디언을 실제로
클릭해 `data-state`가 open↔closed로 정확히 토글되는 것까지 확인 후 종결. **교훈:
JS/CSS를 새로 배포한 뒤에는 "파일 목록에 올라갔다"가 아니라, 실사이트에서 그
기능을 실제로 눌러보고 동작을 확인해야 완료다.**

## 16. [SPEC 2026-09-07] `setCollapsibleState`/`initCollapsibleMenus` 전면 재작성
— 트랜지션 + 단일 열림 (Design-system Accordion 1:1 이식)

배경·CSS 쪽 근거는 `sidebar.css.md` §19 참고. §15의 "클릭 시 그냥 뒤집기"
로직을 걷어내고, 실제 Design-system Accordion 사이트에서 fetch로 확인한
`setAccordionItemState(item, open, animate)` / `initAccordions(root)` 함수를
그대로 우리 구조에 맞게 옮겼다.

`setCollapsibleState(group, open, animate)`: `animate`가 참이면 토글 직전에
`sidebar-menu-sub-wrap`에 `--accordion-content-height`를 그 안 `<ul>`의
실측 `scrollHeight`로 세팅(원본과 동일하게 **매번 다시 잰다** — 캐싱하지
않는다, 카테고리 개수가 나중에 바뀔 수 있어서 정확도가 우선). 그다음
`group`/`wrap`이 아니라 `group` 자체에 `data-state`를, 트리거에
`aria-expanded`를 세팅하는 건 기존과 동일.

`initCollapsibleMenus()`: 이제 모든 `[data-slot="collapsible"]`을 무작정
한 그룹으로 묶지 않는다 — 각각의 **가장 가까운 `[data-slot="sidebar-menu"]`
조상**을 키로 묶어(`groupsByRoot`, `Array.prototype.filter(...)[0]`로 기존
항목 찾기 — 이 프로젝트가 `.find()`를 쓰지 않는 관례를 따름, `category.js`도
동일), 그 조상을 공유하는 collapsible들끼리만 "다른 거 열면 나는 닫힘"
관계를 맺는다. 클릭 핸들러: 이미 열려 있으면 닫고 끝(= `data-collapsible`
항상 켜짐); 닫혀 있으면 같은 그룹의 열려 있는 다른 형제를 전부 닫은 뒤
자신을 연다 — 원본의 "single + collapsible" 분기 그대로다.

`button.dataset.collapsibleBound`로 중복 바인딩 방지하는 것도 원본의
`trigger.dataset.accordionBound` 그대로 옮겨온 관례.

