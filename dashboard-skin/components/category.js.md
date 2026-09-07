# `category.js` — 설계 주석

소스: `dashboard-skin/components/category.js`

이 파일의 주석을 소스에서 분리해 보관한다. 구현 의도·함정·스펙 참조는 여기서 본다.
배경(왜 하드코딩을 버렸는지, 어떤 태그를 실측했는지)은 `skin.html.md` §10 참고.

## 1. [SPEC 2026-09-07] 실행 순서 — 반드시 `tooltip.js`/`sidebar.js`보다 먼저 로드

`skin.html`의 `<script>` 순서를 `category.js → tooltip.js → sidebar.js → …`로
바꿨다. 세 파일 모두 `DOMContentLoaded`에 자기 초기화 함수를 등록하는데, 같은
이벤트의 리스너는 **등록된 순서 그대로** 동기 실행된다 — `category.js`가
`#sidebar-category-menu`를 채우는 시점이 `tooltip.js`의 `initTooltips()`(형제
`[data-slot="tooltip-content"]`를 찾아 바인딩)와 `sidebar.js`의
`initCollapsibleMenus()`/`initActiveState()`(각각 `[data-slot="collapsible"]`,
`a[data-slot="sidebar-menu-button"]`를 스캔)보다 반드시 앞서야, 방금 합성해
넣은 노드들이 두 스크립트의 스캔 대상에 포함된다. 세 스크립트 다 동기 코드라
스캔 시점만 맞으면 별도 이벤트 연동(re-scan 함수 노출 등)이 필요 없다.

## 2. 왜 원본 클래스를 그대로 쓰지 않고 `data-slot` 마크업으로 다시 합성하는가

`[##_category_list_##]`가 내려주는 `.tt_category`/`.category_list`/
`.sub_category_list`/`.link_tit`/`.link_item`/`.link_sub_item`는 이 스킨의
`data-slot` 체계와 이름·구조가 다르다. 그 클래스를 직접 스타일링하면
sidebar.css/sidebar.js/tooltip.js의 접힘·아코디언·활성표시·툴팁 로직을 전부
새로 짜야 한다. 대신 숨겨둔 원본(`#category-source`)에서 이름·href·자식
유무·new 여부만 뽑아 **기존에 이미 검증된 `data-slot` 마크업 문자열**을
그대로 조립해 `#sidebar-category-menu`에 꽂아 넣는 쪽을 택했다 — 기존 CSS/JS
재사용률이 100%다.

## 3. `categoryName()` — `<a>`의 표시용 텍스트만 뽑아내는 이유

원본 `<a>`는 `이름 <span class="c_cnt">(N)</span> <img alt="N" ...>`처럼
글 개수·new 아이콘까지 텍스트 노드 사이에 섞여 있다. `a.textContent`를
그대로 쓰면 "Design (28)"처럼 개수가 이름에 붙어버린다 — 2026-07(개발
하네스 쪽 프로젝트) 결정을 그대로 따라 이 블로그도 1차 메뉴에 글 개수를
표시하지 않기로 했으므로, `<a>`를 복제한 뒤 `.c_cnt`/`img`를 제거하고
남은 텍스트만 공백 정규화해서 쓴다.

## 4. `hasNewIcon()`/`badgeHTML()` — 수동 배지 → Tistory 자체 신호로 교체

이전엔 `<span data-slot="sidebar-menu-badge" data-variant="new">N</span>`을
새 글을 올릴 때마다 사람이 직접 넣고 식으면 다시 뺐다(`sidebar.css.md` §16
경고 참고). 실측해보니 Tistory가 이미 각 카테고리(최상위든 하위든, "새 글이
있는가"를 재귀적으로 판정해) `<a>` 안에 `<img alt="N" src=".../
new_ico_5.gif">`를 조건부로 넣어준다 — 이 프로젝트가 원하는 "관리자 데이터에
완전히 연동"이라는 방향과 정확히 맞아떨어져서, 수동 관리를 걷어내고 이
이미지의 존재 여부로 배지를 자동 생성하도록 바꿨다. 최상위 카테고리에도
자식과 별개로 이 아이콘이 독립적으로 붙으므로(예: Design 자신에도, 그
자식 Font에도 각각) `buildTopItem`의 두 분기(리프/아코디언) 모두, 그리고
`buildSubItem` 모두 동일한 `badgeHTML(anchor)` 호출로 처리한다.

**배지 자체는 도트로 단순화됐다(2026-09-07 후속 지시 "N 텍스트 제거,
도트로")** — `<span>` 안에 텍스트를 넣지 않고 `aria-hidden="true"`만
붙인 빈 요소로 만들고, 실제 8×8px 원형 시각화는 `sidebar.css`의
`[data-variant="new"]` 규칙(`width/height: calc(var(--spacing) * 2)`,
`border-radius: 999px`)이 전담한다. 배지가 순수 장식(색 하나로만 "새 글
있음"을 알림)이라 스크린리더에 텍스트 없는 빈 span을 노출하지 않도록
`aria-hidden`으로 접근성 트리에서 뺐다.

## 5. 배지의 DOM 위치 — `<li>`의 직계 자식이어야 하는 이유

`sidebar.css`의 패딩 예약 규칙이 `:has(> [data-slot="sidebar-menu-badge"])`
(직계 자식 결합자)를 쓴다. 아코디언(자식 있는) 분기에서 배지를
`</div>`(collapsible 닫힘) **다음**에 두는 이유가 이것 — `.collapsible` 안에
넣으면 `<li>`의 직계 자식이 아니게 되어 그 선택자가 안 걸리고, 버튼의
오른쪽 여백 예약도, 절대위치 기준(`.sidebar-menu-item`이 `position:
relative`)도 어긋나지 않게 리프 항목과 동일한 자리(`<li>` 바로 아래)에
둔다.

## 6. 폴더 아이콘 — 카테고리별 커스텀 아이콘을 전부 버리고 공용 아이콘 하나로

"사이드바가 접힘 모드일 때는 라벨 없이 아이콘만 보이는데, 관리자가 아이콘을
지정해준 적 없는 새 카테고리는 어떤 아이콘을 자동으로 붙일지" 확인 질문에
사용자가 **"전체 카테고리 공용(폴더) 아이콘 하나로 통일"**을 선택 — 기존에
Design/Ai가 갖고 있던 고유 아이콘(팔레트/반짝임)도 이번 기회에 버리고,
Lucide `folder`/`folder-open` 아이콘 하나로 전 카테고리를 통일했다(2026-07
당시 매핑표 유지 방안도 검토했으나 사용자가 명시적으로 기각).

이어서 **"하위메뉴 펼쳐졌을때 펼쳐진 아이콘으로"** 지시에 따라, 자식이 있는
(아코디언) 카테고리만 `FOLDER_CLOSED_SVG`+`FOLDER_OPEN_SVG` 두 개를 함께
심고 `sidebar.css`의 `[data-slot="collapsible"][data-state="..."]
[data-slot="folder-icon"][data-icon-state="..."]` 규칙(기존 쉐브런 회전
규칙과 같은 자리)이 `data-state`에 따라 하나만 보이게 토글한다. 자식이 없는
리프 카테고리(Ai, Code 등)는 애초에 접고 펼 수 없으므로 `data-icon-state`
없이 닫힌 폴더 아이콘 하나만 고정으로 둔다(다른 CSS 규칙이 이 아이콘을
건드리지 않는다 — `[data-slot="collapsible"]` 조상이 없어 규칙 자체가
매치되지 않음).

## 7. 깊이 가정 — 2단(부모/자식)까지만 지원

실측한 원본이 `category_list`(1단) → `sub_category_list`(2단)까지만
중첩되고 그 이상은 관찰되지 않았다(Tistory 카테고리 관리 자체가 2단
구조라는 통설과 일치). `buildTopItem`은 최상위 `<li>`의 직계
`ul.sub_category_list`만 보고, 그 안의 손자 카테고리(3단)는 애초에
파싱하지 않는다 — 만약 Tistory가 3단을 지원하게 되면(현재로선 근거 없음)
이 함수를 재귀로 바꿔야 한다.

## 8. "분류 전체보기"(카테고리 전체 링크)는 렌더링하지 않는다

원본 최상위 `<li class="tt_category">`의 첫 항목은 `/category`로 가는
"분류 전체보기" 링크다. 기존 디자인(하드코딩 시절)에 이 항목이 없었고
요청에도 언급이 없어, `initCategoryMenu()`는 이 항목을 건너뛰고 곧바로
`ul.category_list`의 자식들(실제 카테고리들)만 순회한다 — 필요해지면
`root`의 형제 `<a class="link_tit">`를 별도로 뽑아 추가하면 된다.
