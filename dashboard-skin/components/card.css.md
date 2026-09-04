# `card.css` — 설계 주석

소스: `dashboard-skin/components/card.css`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.

## 1. Card + Badge — Design-system 프리미티브의 바닐라 이식

════════════════════════════════════════════════════════════════
   Card + Badge — Design-system 프리미티브의 바닐라 이식
   ────────────────────────────────────────────────────────────────
   이식 원본: D:\MyCloud\2026포트폴리오\Design-system
              css/components.css  6277–6410행 (Card)
              css/components.css  7947–7977행 (Badge base)
              css/components.css  8142–8160행 (Badge outline 변형)
              css/components.css  8188–8191행 (Badge focus-visible)
              css/components.css  8211–8213행 (a[data-slot="badge"])
   스펙:      _workspace/right-widgets_designer-spec.md §3 / §5-5
   원본과 달라진 부분은 전부 `[SPEC …]` 주석으로 표시했다.

   [SPEC §8] header.css의 Button/Breadcrumb과 달리 처음부터 독립 파일로 둔다 —
   content 구역이 글 목록 카드에 확실히 다시 쓸 공용 프리미티브이기 때문.
   로드 순서: tailwind.css → tooltip.css → **card.css** → sidebar.css →
             header.css → widgets.css (프리미티브 먼저, 구역 스타일 나중).
   ════════════════════════════════════════════════════════════════

---

## 2. 공용 프리미티브 ── Card

════════════════════════════════════════════════════════════════
   ── 공용 프리미티브 ── Card
   [SPEC §3-1 "쓰지 않는 변형"] 아래 4가지는 의도적으로 이식하지 않는다.
     · data-layout="image" (+ card-cover-overlay)  → --color-black 토큰 없음
     · card-edge-panel                             → 이번 구역에서 안 씀
     · card-footer / card-action / card-description → 이번 구역에서 안 씀
   card-footer를 쓰지 않으므로 원본 6293–6295행
   (`[data-slot="card"]:has([data-slot="card-footer"]) { padding-bottom: 0 }`)도
   함께 뺐다 — 존재하지 않는 슬롯을 겨냥하는 규칙이라 무의미하다.
   content 구역에서 그 변형들이 필요해지면 원본 행번호를 보고 추가할 것.
   ════════════════════════════════════════════════════════════════

---

## 3. [SPEC §3-1] data-size="sm" — --card-spacing 16px → 12px.

[SPEC §3-1] data-size="sm" — --card-spacing 16px → 12px.
   원본의 max-width(spacing*96 = 384px)도 그대로 둔다. 우측 패널 카드 폭은
   288px이라 이 상한에 닿지 않지만, 다른 구역에서 재사용할 때의 원본 동작을
   임의로 바꾸지 않는다.

---

## 4. 공용 프리미티브 ── Badge

════════════════════════════════════════════════════════════════
   ── 공용 프리미티브 ── Badge
   [SPEC §5-5] outline 변형만 이식한다. data-color(blue/green/…)·destructive·
   secondary·ghost 변형은 해당 색상군 토큰이 src/input.css에 없어서 이식하면
   조용히 무색이 된다 — Button 이식(header.css) 때와 동일한 원칙.
   그에 따라 원본 8193–8209행(destructive focus / aria-invalid)도 제외했다.
   ════════════════════════════════════════════════════════════════

---

## 5. [SPEC §6-7 관례] 원본은 <i data-lucide>도 함께 받는다 — 우리는 인라인 <svg>만

[SPEC §6-7 관례] 원본은 <i data-lucide>도 함께 받는다 — 우리는 인라인 <svg>만
   쓰지만 선택자를 원본 그대로 유지한다. [data-slot="spinner"]는 그 컴포넌트
   자체를 이식하지 않았으므로 뺐다.

