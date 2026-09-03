---
name: blog-skin-visual-spec
description: 대시보드형 shadcn/ui 티스토리 스킨의 구역(컴포넌트)별 비주얼 스펙 — shadcn 원본의 CSS 변수/data-slot 구조를 유지하면서 D:\MyCloud\2026포트폴리오\Design-system의 색상을 매핑하는 방법을 안내. tistory-skin-designer 에이전트가 사용. "sidebar 스펙", "컬러 토큰 매핑", "shadcn 구조 그대로", "대시보드 컴포넌트 디자인" 요청 시 사용.
---

# 대시보드 shadcn 스킨 비주얼 스펙 설계

## 함께 로드할 스킬

- **`pretendard-typography`** (이 세션에 이미 등록됨) — 한글 자간/행간/크기/굵기 규칙
- **`impeccable`** — 대시보드 느낌의 첫인상 완성도를 위해

## 원칙: shadcn의 구조를 재설계하지 않는다

`references/dashboard-shadcn-requirements.md`에 기록된 shadcn 원본 실측 레퍼런스(CSS 변수명, `data-slot` 값, 상태 전환 로직)는 **그대로 유지**한다. 당신의 역할은 새 컴포넌트 구조를 설계하는 게 아니라, 그 구조 안의 **색상 값만** Design-system에서 가져와 채우는 것이다. shadcn이 `--sidebar-primary`라는 변수를 쓴다면 이 스킨도 정확히 `--sidebar-primary`를 쓴다 — 이름을 바꾸거나 구조를 단순화하지 않는다. 원본과 다르게 만들어야 하는 유일한 경우는 Tistory/바닐라 JS 환경의 실제 제약(React 전용 API 등) 때문일 때뿐이며, 그때도 "왜 다른지"를 스펙에 명시한다.

## 색상 매핑 절차

1. shadcn 원본은 `oklch()` 색공간을 쓴다(라이트/다크 각각). Design-system(`D:\MyCloud\2026포트폴리오\Design-system\css\globals.css`)의 실제 팔레트가 hex/hsl이면 oklch로 변환하거나, 프로젝트의 다른 곳(예: 이전 리스킨에서 이미 파랑 액센트를 확정한 이력)과 일관되게 형식을 통일한다 — 형식은 스펙에서 한 번 정하고 이후 전 구역에서 동일하게 따른다.
2. shadcn 변수명 규칙을 그대로 따라 값만 채운 표를 만든다: `--background`/`--foreground`/`--primary`/`--secondary`/`--accent`/`--destructive`/`--border`/`--sidebar`/`--sidebar-foreground`/`--sidebar-primary`/`--sidebar-primary-foreground`/`--sidebar-accent`/`--sidebar-accent-foreground`/`--sidebar-border`/`--sidebar-ring`/`--radius` 등 — 실제 작업 중인 구역이 쓰는 변수만 채우되, 이름은 shadcn 그대로.
3. `@theme inline` 매핑 블록(`--color-background: var(--background)` 형태)도 shadcn 패턴 그대로 유지 — Tailwind 유틸리티가 소비하는 네임스페이스이므로 이름을 바꾸면 빌드된 tailwind.css가 어긋난다.

## 여백/치수 규칙

- 모든 padding/margin/gap은 `calc(var(--spacing) * n)` 형태로 명시한다(`--spacing` 기본값 0.25rem). 임의의 rem/px 하드코딩을 스펙에 쓰지 않는다 — developer가 그대로 Tailwind 클래스나 커스텀 CSS로 옮길 수 있어야 한다.
- 이 구역이 100vw PC 레이아웃에서 실제로 몇 px/rem을 차지하는지 구체적으로 계산해 스펙에 적는다(예: sidebar면 `--sidebar-width: 16rem`을 그대로 쓸지, 대시보드 톤에 맞게 조정할지 결정하고 이유를 남긴다).

## 산출물 형식

`_workspace/{구역명}_designer-spec.md`:

```markdown
# {구역명} 비주얼 스펙

## shadcn 원본 구조 (참고 레퍼런스 그대로)
- data-slot 목록, CSS 변수 목록, 상태 로직 — dashboard-shadcn-requirements.md에서 인용

## 색상 매핑
| shadcn 변수명 | 라이트 값 | 다크 값 | Design-system 출처 |
|---|---|---|---|

## 치수/여백
| 항목 | 값 (calc(var(--spacing)*n) 형태) | 비고 |
|---|---|---|

## Tistory/바닐라 환경 제약으로 원본과 달라지는 부분
- (React Sheet → CSS 드로어 등, 반드시 이유 포함)
```

## 첫 구역: Sidebar

첫 요청은 sidebar다. `references/dashboard-shadcn-requirements.md`의 "Sidebar 컴포넌트 — 실측 레퍼런스" 절을 그대로 기반으로 스펙을 채운다 — 이미 CSS 변수/data-slot/상태 로직이 실측 정리돼 있으니 다시 조사할 필요 없이 색상 매핑과 PC 치수만 확정하면 된다.
