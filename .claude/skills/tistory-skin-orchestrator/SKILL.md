---
name: tistory-skin-orchestrator
description: 디자인 블로그(daitnu.tistory.com)를 대시보드 느낌으로 만드는 shadcn/ui 방식(Tailwind CSS + CSS 변수 + data-slot + calc(var(--spacing)*n)) 티스토리 스킨 제작을 총괄하는 오케스트레이터. "스킨 만들어줘", "shadcn 컴포넌트 똑같이 만들어", "sidebar 추가", "이 구역 만들어줘", "대시보드 레이아웃", "테일윈드로 스킨", "다크모드 지원", "커버 배너", "TOC", "스킨 수정/보완" 등 이 블로그의 시각 디자인·스킨 코드와 관련된 모든 요청에 반드시 사용한다. 최초 구역 제작뿐 아니라 다음 구역 추가·기존 구역 수정·반응형 보완 요청에도 동일하게 사용한다.
---

# 티스토리 스킨 오케스트레이터

디자인 블로그(https://daitnu.tistory.com/)를 **대시보드 느낌**으로 만드는 shadcn/ui 방식 티스토리 스킨을 구역(컴포넌트) 단위로 하나씩 제작한다. `design-blog-orchestrator`(글 콘텐츠 파이프라인)와는 완전히 다른 작업이다.

**필수 선행 문서:** `references/dashboard-shadcn-requirements.md`(현재 방향의 유일한 근거 — 배포 방식, 레이아웃 원칙, shadcn 포팅 원칙, sidebar 실측 레퍼런스를 담고 있다) — 매 구역 작업 전 반드시 읽는다. `references/skin-requirements.md`(1차 daitnu-skin-v1.01 리스킨, 폐기됨)는 Tistory 템플릿 태그 문법 등 참고용으로만 남아 있다.

**실행 모드: 서브 에이전트 (구역별 반복 루프)** — 1차 때의 "감사→스펙→구현" 1회성 파이프라인이 아니라, 사용자가 구역을 하나씩 요청할 때마다 아래 루프를 반복한다.

**전제:** 이 하네스는 티스토리 계정에 접근하지 않는다. Node/빌드 파이프라인이 없는 Tistory 환경이므로 Tailwind CSS는 이 프로젝트 로컬에서 빌드해 정적 파일로 만든다. 최종 산출물은 사용자가 관리자 페이지(`https://daitnu.tistory.com/manage/design/skin/edit#/source/file`, 스킨 편집 > HTML 편집 > 파일 업로드)에서 직접 업로드하는 개별 파일(tailwind.css + 컴포넌트별 css/js)까지다.

## Phase 0: 컨텍스트 확인

1. `Design_Blog/dashboard-skin/`(2차 산출물 위치 — 1차 `skin/`과 구분) 존재 여부 확인
2. `references/dashboard-shadcn-requirements.md`의 "다음 구역 대기열"을 확인해 이미 완성된 구역과 이번에 요청받은 구역을 파악
3. 판별:
   - 새 구역 요청("sidebar 만들어줘") → **신규 구역 루프**: Phase 1부터 그 구역만 진행. 이미 완성된 다른 구역 파일은 건드리지 않는다.
   - 기존 구역 수정 요청("사이드바 색 바꿔줘") → **부분 재실행**: 해당 구역의 designer/developer만 재호출
   - "PC 다 됐으니 반응형 작업해줘" 같은 단계 전환 요청 → 요구사항 문서의 "레이아웃 원칙"을 반응형 대응 단계로 갱신 후 완성된 구역들을 순회하며 반응형만 추가

## Phase 1: 요구사항/레퍼런스 갱신

`references/dashboard-shadcn-requirements.md`의 "다음 구역 대기열"에 이번 요청을 기록(이미 있으면 건너뜀). 사용자가 새 구역을 요청하면서 참고 shadcn 컴포넌트명을 준 경우, **WebFetch로 `https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/ui/{component}.tsx`(또는 관련 공식 문서)를 실제로 읽어** export 목록/CSS 변수/data-slot/상태 로직을 이 문서에 실측 기록한다 — 추측으로 채우지 않는다(sidebar는 이미 기록됨, 새 컴포넌트만 추가).

## Phase 2: 구역 비주얼 스펙 (tistory-skin-designer)

`Agent(subagent_type: "tistory-skin-designer", model: "opus")` 호출. 입력: `references/dashboard-shadcn-requirements.md` + 이번 구역의 shadcn 실측 레퍼런스.

산출물: `_workspace/{구역명}_designer-spec.md` — shadcn 원본의 CSS 변수/data-slot/컴포넌트 구조를 그대로 유지하면서, 색상 값만 Design-system에서 매핑한 표(oklch 변환 포함), 이 구역에 적용할 PC 레이아웃 상세(100vw 기준 실제 치수), Tistory 환경 제약으로 원본과 달라질 수밖에 없는 부분(예: React Sheet → 바닐라 CSS 드로어)을 명시.

## Phase 3: 구역 구현 (tistory-skin-developer)

`Agent(subagent_type: "tistory-skin-developer", model: "opus")` 호출. 입력: 위 스펙 + shadcn 실측 레퍼런스.

작업은 `dashboard-skin/`에서 진행(1차 `skin/`과 별도 — 서로 덮어쓰지 않는다). 산출물:
- `dashboard-skin/tailwind.css` — 로컬 Tailwind v4 CLI로 빌드한 정적 CSS(누적 — 매 구역마다 마크업을 다시 스캔해 재생성)
- `dashboard-skin/components/{구역명}.css` / `dashboard-skin/components/{구역명}.js` — 이 구역 전용 파일(shadcn의 data-slot/CSS 변수/상태 로직을 그대로 반영)
- `dashboard-skin/skin.html`에 해당 구역 마크업 추가·통합
- `dashboard-skin/README.md` — 파일 업로드 순서(경로: `/manage/design/skin/edit#/source/file`)와 skin.html에서의 참조 방법

developer는 shadcn 원본과 **DOM 구조·클래스·data-slot·CSS 변수명·상태 전환 로직이 1:1 대응**하는지 스스로 대조 확인한 뒤, 로컬 정적 목업으로 Playwright 검증(PC 뷰포트만, 반응형은 별도 단계)한다.

## Phase 4: 전달

1. 이번 구역의 산출물 경로와 shadcn 원본 대비 달라진 점(Tistory 제약으로 인한 것)을 사용자에게 보고
2. 업로드 방법 안내(스킨 편집 > HTML 편집 > 파일 업로드)
3. "다음 구역은 무엇으로 할까요?" 확인 — 대기열에 추가하고 다음 요청을 기다린다

## 에러 핸들링

- shadcn 실제 소스를 WebFetch로 확인할 수 없으면(네트워크 문제 등) 추측으로 구현하지 않고 사용자에게 확인 필요 상태로 보고한다.
- Tistory 환경 제약(React 전용 API, Next.js 라우팅 의존 등)으로 원본과 완전히 동일하게 만들 수 없는 부분은 반드시 "왜 다른지"와 함께 명시 — 조용히 다르게 만들지 않는다.
- 이전 구역과 새 구역의 CSS 변수/토큰이 충돌하면(예: 서로 다른 `--radius` 정의) 병합하지 않고 사용자에게 확인 요청.

## 테스트 시나리오

**정상 흐름:** "sidebar 만들어줘, shadcn이랑 똑같이" → Phase 1(WebFetch로 sidebar.tsx 실측, 이미 완료돼 있으면 재사용) → Phase 2(색상 매핑 스펙) → Phase 3(`dashboard-skin/`에 sidebar 마크업+CSS+JS, PC 뷰포트 Playwright 검증) → Phase 4(다음 구역 확인)

**부분 재실행 흐름:** "사이드바 축소 모드일 때 아이콘이 너무 작아" → Phase 0에서 기존 sidebar 산출물 감지 → developer만 재호출해 해당 컴포넌트 CSS만 수정 → 재검증 → 나머지 구역 변경 없이 전달
