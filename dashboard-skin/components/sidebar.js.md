# `sidebar.js` — 설계 주석

소스: `dashboard-skin/components/sidebar.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Sidebar — shadcn/ui 동작 로직의 바닐라 포트

════════════════════════════════════════════════════════════════
   Sidebar — shadcn/ui 동작 로직의 바닐라 포트
   ────────────────────────────────────────────────────────────────
   기반: D:\MyCloud\2026포트폴리오\Design-system\js\components.js 28–57행
         (initDocSidebars — data-state를 wrapper와 [data-slot="sidebar"]
          양쪽에 세팅하는 방식)  → 그대로 가져와 스펙대로 확장했다.
   스펙: _workspace/sidebar_designer-spec.md §7-1 / §7-2 / §7-8
   ════════════════════════════════════════════════════════════════

---

## 2. shadcn 원본과 동일한 쿠키 이름/수명 (§7-2 — localStorage로 바꾸지 않는다)

shadcn 원본과 동일한 쿠키 이름/수명 (§7-2 — localStorage로 바꾸지 않는다)

---

## 3. 쿠키가 막힌 환경에서도 토글 자체는 계속 동작해야 한다

쿠키가 막힌 환경에서도 토글 자체는 계속 동작해야 한다

---

## 4. 사이드바

── 사이드바 ───────────────────────────────────────────────

---

## 5. §7-1 — React Context가 없으므로 DOM 속성 자체가 상태 보유자다.

§7-1 — React Context가 없으므로 DOM 속성 자체가 상태 보유자다.
       CSS 셀렉터가 wrapper 레벨과 sidebar 레벨을 모두 참조하므로
       한쪽만 바꾸면 절반이 안 먹는다.

---

## 6. shadcn 원본: data-collapsible={state === "collapsed" ? collapsible : ""}

shadcn 원본: data-collapsible={state === "collapsed" ? collapsible : ""}

---

## 7. §7-2 — 초기 힌트는 실제 상태가 정해진 뒤에는 역할이 끝났다

§7-2 — 초기 힌트는 실제 상태가 정해진 뒤에는 역할이 끝났다

---

## 8. 초기 상태: 쿠키 우선. 쿠키가 없으면 펼침(shadcn defaultOpen=true)

초기 상태: 쿠키 우선. 쿠키가 없으면 펼침(shadcn defaultOpen=true)

---

## 9. [의도적 이탈] shadcn SidebarRail의 클릭 토글은 사용자 요청으로 제거했다.

[의도적 이탈] shadcn SidebarRail의 클릭 토글은 사용자 요청으로 제거했다.
       토글 경로는 sidebar-trigger 클릭과 Ctrl/Cmd+B 두 가지뿐이다.

---

## 10. §7-8 — Cmd/Ctrl + B. Firefox의 북마크 사이드바와 충돌하므로

§7-8 — Cmd/Ctrl + B. Firefox의 북마크 사이드바와 충돌하므로
       preventDefault()는 필수. 단 입력 필드 안에서는 가로채지 않는다.

---

## 11. 사이드바 검색 — 티스토리 검색 URL 패턴(/search/{키워드})으로 이동.

사이드바 검색 — 티스토리 검색 URL 패턴(/search/{키워드})으로 이동.
       [##_search_text_##] 치환자는 우리가 data-slot을 붙일 수 없는 마크업을
       서버가 생성하므로(§7-3과 같은 제약) 폼을 직접 만들고 이동만 시킨다.

---

## 12. 테마 토글

── 테마 토글 ────────────────────────────────────────────────
     Design-system js/components.js 1803–1825행과 동일한 방식:
     <html>의 .dark 클래스 + localStorage.theme.
     아이콘/라벨 전환은 sidebar.css가 [data-theme-when]으로 처리하므로
     여기서는 클래스와 저장만 담당한다.

---

## 13. 활성 항목 표시

── 활성 항목 표시 ──────────────────────────────────────────
     [SPEC §1-2 / §8-Q2] 카테고리를 정적으로 하드코딩(A안)하는 이상
     "지금 어느 카테고리인가"는 마크업만으로 알 수 없다. 티스토리가 주는
     [##_body_id_##]도 페이지 종류만 알려줄 뿐 어느 카테고리인지는 모른다.
     → 현재 경로와 각 링크의 경로를 비교해 가장 길게 일치하는 하나만
        data-active="true"로 둔다. (스펙 A안의 "JS 무의존"에서 벗어나는
        유일한 지점이며, 이게 없으면 활성 표시가 항상 홈에 고정된다.)

---

## 14.

7일

