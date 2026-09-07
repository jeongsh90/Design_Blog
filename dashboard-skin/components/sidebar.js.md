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

