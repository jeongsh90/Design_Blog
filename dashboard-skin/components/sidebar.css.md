# `sidebar.css` — 설계 주석

소스: `dashboard-skin/components/sidebar.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. [RESPONSIVE SPEC §4-2] 모바일(≤767px) 오프캔버스 드로어

─────────────────────────────────────────────────────────────
   [RESPONSIVE SPEC §4-2] 모바일(≤767px) 오프캔버스 드로어
   shadcn 원본의 <Sheet side="left"> 재현. Tistory엔 Radix Dialog가
   없으므로 동일한 슬라이드인 + 백드롭을 순수 CSS transition으로 구현.
   ─────────────────────────────────────────────────────────────

---

## 2. 백드롭은 모바일에서만 존재한다(기본 display:none).

백드롭은 모바일에서만 존재한다(기본 display:none).

---

## 3. shadcn SheetOverlay의 bg-black/50 리터럴을 토큰으로 승격.

shadcn SheetOverlay의 bg-black/50 리터럴을 토큰으로 승격.
       (원본이 이 한 곳만 토큰 없이 하드코딩하므로 값은 그대로 두고
        이 프로젝트의 "색은 변수로" 규칙만 지킨다)

---

## 4. (1) 레이아웃 자리 제거 — 사이드바가 문서 흐름에서 완전히 빠진다.

(1) 레이아웃 자리 제거 — 사이드바가 문서 흐름에서 완전히 빠진다.
         접힘 쿠키가 남아 있어도 0이 되도록 세 형태 모두 덮는다.

---

## 5. (1-b) [구현 추가] JS가 뜨기 전(FOUC 힌트) 규칙까지 덮는다.

(1-b) [구현 추가] JS가 뜨기 전(FOUC 힌트) 규칙까지 덮는다.
     sidebar.css:54-57의 html[data-sidebar-init="collapsed"] 규칙은
     위 세 선택자에 걸리지 않는 별개 계열(자손 결합자 + html 속성)이라
     명시적으로 무력화하지 않으면 첫 페인트에서 gap이 48px로 남는다.

---

## 6. (2) 드로어 본체 — 폭은 항상 18rem(접힘 쿠키와 무관), 기본은 화면 밖.

(2) 드로어 본체 — 폭은 항상 18rem(접힘 쿠키와 무관), 기본은 화면 밖.

---

## 7. shadcn SheetContent = z-50

shadcn SheetContent = z-50

---

## 8. shadcn SheetContent = shadow-lg

shadcn SheetContent = shadow-lg

---

## 9. 닫힘: data-[state=closed]:duration-300

닫힘: data-[state=closed]:duration-300

---

## 10. (3) 열림

(3) 열림

---

## 11. 열림: data-[state=open]:duration-500

열림: data-[state=open]:duration-500

---

## 12. (4) 백드롭

(4) 백드롭

---

## 13. header(9) 위, 드로어(50) 아래

header(9) 위, 드로어(50) 아래

---

## 14. Radix fade-in-0/fade-out-0 기본

Radix fade-in-0/fade-out-0 기본

