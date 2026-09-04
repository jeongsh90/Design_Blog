# 글 상세(permalink) 본문 프로즈 타이포그래피 — 구현·검증 보고

- **스펙:** `_workspace/content-permalink-prose_designer-spec.md`
- **결정:** §9 확인필요 Q1~Q10 전부 스펙 저자 제안값 채택(오케스트레이터 지시)
- **검증 러너:** `dashboard-skin/tools/verify-prose.mjs` (신규)
- **결과:** §7-2 체크리스트 **28/28 PASS**(라이트/다크 각각) · 총 **275건 assert, 실패 0건**

---

## 1. 파일별 변경

| 파일 | 변경 | 스펙 대비 |
|---|---|---|
| `dashboard-skin/src/input.css` | `:root`에 `--link:#1447e6`, `.dark`에 `--link:#8ec5ff`, `@theme static`에 `--color-link: var(--link)` / `--tracking-lg:-0.01em` / `--tracking-xl:-0.012em` / `--font-mono`(Design-system 리터럴) | 스펙 §3-1 그대로 |
| `dashboard-skin/components/content.css` | 기존 406~415행(`post-single-body` 5줄 + `img` 4줄)을 **§10 프로즈 블록으로 대체**하며 그 뒤에 §4-1~§4-11 전문 추가. 1~405행 무변경 | 스펙 §4 그대로. 문서 내 상호참조 번호만 `§4-x` → `§10-x`로 정합화 |
| `dashboard-skin/components/content.js` | `initProseTables()` 추가 + `init()`에 호출 1줄 | 스펙 §4-9 JS 전문 그대로 |
| `dashboard-skin/tools/make-preview.mjs` | `THUMB` 아래에 `PROSE_IMAGE`/`PROSE_SAMPLE` + `SUBSTITUTIONS.article_rep_desc = PROSE_SAMPLE;`, permalink 출력의 `.replace("본문 영역은…")` 후처리 제거 | 스펙 §8-1/§8-2 그대로 + **추가 1건**(아래 2절) |
| `dashboard-skin/tools/verify-prose.mjs` | **신규** — §7-2 28항목 자동 검증 | 스펙에 없던 산출물(검증 도구) |
| `dashboard-skin/tailwind.css` | 재빌드 산출물 | 아래 3절 |
| `dashboard-skin/skin.html` | **변경 없음** | 스펙 예측대로 |
| `dashboard-skin/README.md` | **변경 없음**(새 업로드 파일 0개) | 스펙 예측대로 |

---

## 2. 스펙과 달라진 점 (3건, 전부 사유 있음)

### (1) `make-preview.mjs`에 permalink의 **JS 제거 사본** 출력 1건 추가
`_workspace/content_mockup-permalink-nojs.html`.
§7-2 **15번**("`content.js`를 제거한 사본에서 CSS 폴백이 발동하는지")을 검증하려면 이 사본이 반드시 필요한데 스펙 §7-1 파일 목록에는 생성 방법이 없었다. 임시로 손수 만들면 재현 불가능해지므로, `sidebar_mockup-nojs.html`(FOUC 검증용으로 `sidebar.js`를 빼는 기존 선례)과 **완전히 같은 패턴**으로 생성기에 넣었다. 실제 스킨 파일이 아니라 `_workspace/` 목업이므로 업로드 목록에는 영향 없음.

### (2) `content.css` 안의 상호참조 번호 정합화
스펙 CSS 주석이 자기 자신을 `§4-7`, `§4-4`, `§4-6` 등으로 부르는데, 이 코드는 `content.css`에 **§10**으로 들어간다. 주석 안의 참조만 `§10-3`/`§10-6`/`§10-9` 등으로 바꿨다(선언·값은 한 글자도 안 바꿈). 스펙 §7-1이 "415행 뒤에 §10 프로즈 블록으로 추가"라고 지시했으므로 그 지시에 맞춘 것.

### (3) `verify-prose.mjs`가 Playwright가 아니라 puppeteer-core + 직접 spawn한 Chromium을 쓴다
이 환경에서 Playwright `launch()`가 WebSocket 핸드셰이크에서 멈춘다(선행 `verify-content.mjs`가 이미 같은 이유로 같은 방식을 쓰고 있어 그대로 따랐다). 스펙 §7-2 26번이 요구한 `ignoreDefaultArgs:["--hide-scrollbars"]`는 같은 의도의 `--show-scrollbars` 플래그로 대응했다.
> 부수: `verify-content.mjs`는 Chromium 경로를 `chromium-1234`로 하드코딩하고 있는데 현재 설치본은 `chromium-1228`이다(그 파일은 이번 범위 밖이라 손대지 않음). 새 러너는 설치 디렉터리에서 자동 탐색한다.

---

## 3. `tailwind.css` md5 비교 — **바뀌었다** (스펙 예측과 다름)

| | md5 | 크기 |
|---|---|---|
| 재빌드 전 | `fa50877c75091cfb24853482ce2caf43` | 34,446 B |
| 재빌드 후 | `25458015860f09b26f143d69671889b9` | 35,431 B (**+985 B**) |

스펙 §7-1은 "`class=` 변경이 0건이므로 산출물이 동일할 가능성이 높다"고 예측했다. **실제로는 달라졌고, 그게 정상이다** — `class=`는 정말 0건 변경이지만, `src/input.css`의 `:root` / `.dark` / `@theme static`에 추가한 토큰은 유틸리티 스캔과 무관하게 그대로 출력에 실리기 때문이다. 실측 확인:

- 추가됨: `--link:#1447e6`(:root) · `--link:#8ec5ff`(.dark) · `--color-link` · `--tracking-lg` · `--tracking-xl`
- **교체됨: `--font-mono`**
  - 전(Tailwind 기본 테마): `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
  - 후(Design-system 리터럴, 스펙 §0-2 의도): `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- 그 외 바이트 차이는 줄바꿈(작업 사본이 git 체크아웃으로 CRLF였고 Tailwind CLI는 LF로 씀) 뿐 — 개행을 정규화해도 위 토큰 외 차이는 없음.

---

## 4. Playwright(Chromium) 검증 결과 — 28/28 PASS

명령: `bun run skin:build && bun run skin:preview && bun run skin:serve` → `bun dashboard-skin/tools/verify-prose.mjs`

| # | 항목 | 결과 | 실측 핵심값 |
|---|---|---|---|
| 1 | h2~h6 크기·굵기 | ✅ | 20 / 18 / 16 / 14 / 14px, 전부 `600`. 자간도 `-0.24 / -0.18 / -0.16 / -0.112 / -0.112px`(= `--tracking-xl/lg/base/sm/sm`) |
| 2 | h6 색 = muted-foreground(h5와 다름) | ✅ | L `rgb(115,115,115)` / D `rgb(161,161,161)`, h5와 불일치 확인 |
| 3 | 목록 마커 복원 | ✅ | `disc` / 중첩 `circle` / `decimal` / 중첩 `lower-alpha`, `::marker` 색 = muted-foreground. 스크린샷으로 불릿 실제 렌더 확인 |
| 4 | `ul`/`ol` padding-left | ✅ | 둘 다 `24px`, li 콘텐츠가 24px 안쪽, `li+li` 8px. 본문 기본값도 함께 확인(16px / 26px(1.625) / -0.16px / keep-all / break-word) |
| 5 | 연속 `<p>` 간격 | ✅ | **16px** |
| 6 | 제목 여백 | ✅ | h2 48 / h3 40 / h4 32 / 제목 직후 12 / blockquote·pre 24px |
| 7 | 첫 자식 margin-top | ✅ | `0px` |
| 8 | `hr` 위·아래 대칭 | ✅ | 둘 다 **40px** |
| 9 | 코드 폰트 | ✅ | `pre`·인라인 `code` 모두 `ui-monospace…`로 시작, **Pretendard 미포함** |
| 10 | 코드 자간 리셋 | ✅ | 둘 다 `letter-spacing: normal`, `white-space: pre`, `tab-size: 2` |
| 11 | 긴 줄 가로 스크롤 | ✅ | `pre` scrollWidth **1606** > clientWidth **718** 이면서 **본문 720px 불변 · content-inner/document 오버플로 0** |
| 12 | `pre > code` 장식 해제 | ✅ | 배경 `rgba(0,0,0,0)`, padding 0. 인라인 code 배경 = `--color-muted`, 14px/600 |
| 13 | 표 래퍼 주입 | ✅ | 모든 `table`이 `[data-slot="prose-table-wrap"]` 자식 + `data-prose-table="wrapped"`, `display:table` 유지(폴백 아님), 래퍼 `overflow-x:auto`·`margin-top:24px` |
| 14 | 넓은 표 가로 스크롤 | ✅ | ※ 아래 5절 참조 — 자연 상태는 720=720(안 넘침), 넘치는 셀 주입 시 래퍼 scrollWidth **2576** > clientWidth **720**, 본문 폭 720px·문서 오버플로 0 불변 |
| 15 | **JS 제거 사본에서 CSS 폴백** | ✅ | 래퍼 미주입 상태에서 `table{display:block; overflow-x:auto}` 발동, 넘치는 표 주입 시 표 자체가 스크롤하고 본문 720px·오버플로 0 유지 |
| 16 | zebra / th / 셀 | ✅ | 짝수 행 = `--color-muted`, 홀수 행 투명, th `600`, td `8px 16px` + 1px border, 표 14px |
| 17 | 래퍼 키보드 포커스 | ✅ | 실제 **Tab 키**로 포커스 진입(`tabindex=0`), `:focus-visible`에서 2px solid + offset 2px |
| 18 | 링크 색·밑줄·hover | ✅ | L `rgb(20,71,230)`(=`#1447e6`) / D `rgb(142,197,255)`(=`#8ec5ff`), weight 500, underline, offset 4px, 기본 밑줄은 옅고 **hover에서 `currentColor`로 일치** |
| 19 | 링크 포커스 링 | ✅ | 2px solid |
| 20 | 인용 / hr | ✅ | `font-style: normal`(이탤릭 제거됨), border-left 2px, padding-left 24px, 색 = `--content-divider`. hr은 렌더 높이 정확히 1px + border-bottom 0 |
| 21 | **`--content-divider` 상속** | ✅ | `getComputedStyle(post-single-body).getPropertyValue("--content-divider")`가 빈 문자열이 아님 — 실제 상속됨(§10-6/§10-10이 조용히 무효화되지 않음) |
| 22 | 이미지 | ✅ | 1200px 원본 → 본문 폭 720px로 축소, radius 8px. 96px 원본은 **확대되지 않고**(96px 유지) 좌우 여백 동일(가운데 정렬) |
| 23 | figcaption | ✅ | center, muted-foreground, margin-top 8px, 14px. `figure > img` margin-top 0 |
| 24 | **index 회귀** | ✅ | `post-single` 없음(분기 정상), content-inner 격자 배경 3겹 그라디언트 유지, 열 수 유효, 카드 7개 높이가 전부 격자 행의 정수배, 오버플로 0, 콘솔 에러 0 |
| 25 | permalink 분기 | ✅ | `post-single` 존재, content-inner `background-image: none`(격자 꺼짐), `[data-slot="content-title"]` `display:none` |
| 26 | 스크롤 모델 + 스크롤바 | ✅ | content-inner가 스크롤 컨테이너이고 실제 스크롤됨, **문서는 스크롤 안 됨**, `data-custom-scrollbar` 있음, 스크롤 중 `data-scrolling="true"` → idle 후 해제(페이드) |
| 27 | scroll-fade + 앵커 | ✅ | content-inner에 마스크 적용, `scroll-margin-top: 48px`, 앵커 이동 시 제목이 컨테이너 상단 48px 아래(상단 페이드 40px보다 큼 = 안 가림) |
| 28 | 오버플로 / 콘솔 | ✅ | document·body·content-inner 가로 오버플로 전부 0, 콘솔 에러 0 |

**스크린샷:** `_workspace/prose-shots/` — `prose-body-{light,dark}.png`(본문 상단), `scroll-{code,table,hr}-{light,dark}.png`(코드 블록 가로 스크롤바 / 표 zebra / 이미지·hr), `index-regression-{light,dark}.png`, `permalink-nojs-fallback.png`.

---

## 5. 실측이 스펙 예측과 달랐던 점 (2건 — 코드는 정상, 스펙 기술이 부정확했던 부분)

### (a) §8-3의 "table 5열 ✅ 긴 셀 포함 → 가로 스크롤"이 **실제로는 발생하지 않는다**
스펙 §8-2의 샘플 표를 실측하니 **min-content 폭이 347px**로 본문 720px에 여유 있게 들어간다(`word-break: keep-all`이 걸린 셀들이지만 각 셀 내용이 짧다). 따라서 자연 상태에서는 `wrap.scrollWidth === wrap.clientWidth`다.
→ CSS 자체는 문제 없다. 래퍼의 `overflow-x:auto`가 실제로 동작하는지 확인하려고, 검증 시 **240자 무공백 셀을 런타임에 주입**해 넘치게 만든 뒤 (i) 래퍼가 가로 스크롤하고 (ii) 본문 폭 720px과 문서 오버플로가 전혀 영향받지 않는지를 측정했다(14번·15번 모두 이 방식). 주입한 셀은 측정 직후 제거하므로 목업 파일은 그대로다.
→ **후속 참고:** 이 목업으로는 "넓은 표"를 눈으로 볼 수 없다. 표 스크롤을 시각적으로도 확인하고 싶다면 `PROSE_SAMPLE`의 표에 긴 셀을 하나 넣는 스펙 수정이 필요하다(임의로 하지 않았다).

### (b) §7-2 26번의 "커스텀 스크롤바 **3초** idle 페이드"
`smooth-scroll.js` 43행 실측 `SCROLLBAR_IDLE_MS = 1000`(1초)이다. 구현값 기준으로 검증했다(스크롤 직후 `data-scrolling="true"` → 1.4초 대기 후 해제). 스킨 코드를 3초로 바꾸는 것은 이번 범위가 아니라고 판단해 손대지 않았다.

---

## 6. ⚠ 실사이트 배포 후 확인 필요 (Q8 — 티스토리 계정이 없어 로컬에서 검증 불가)

이 4건은 **모두 "붙어도 우리 자손 태그 셀렉터는 계속 매치된다"가 설계 전제**이지만, 에디터가 **인라인 스타일**을 함께 내려주면 그것만은 우리 CSS를 이긴다. 실사이트 배포 후 반드시 육안 확인이 필요하다.

1. **본문 래퍼** — 티스토리가 `[##_article_rep_desc_##]` 내용을 한 겹 더 감싸 내려주는지. 감싼다면 §10-1의 `> :first-child > :first-child` 방어 규칙이 실제로 쓰이게 된다.
2. **코드 블록 마크업** — 에디터가 `<pre><code>` 형태로 내려주는지, 자체 클래스/인라인 스타일(배경·폰트)이 붙는지. 붙으면 §10-5의 배경/폰트가 덮일 수 있다.
3. **이미지 래핑** — `<figure>`/`<span>` 등으로 감싸져 오는지(§10-9의 `figure img { margin-top: 0 }`가 그 대비다). 티스토리 이미지에 흔한 인라인 `width`/`height`가 붙으면 가운데 정렬이 달라질 수 있다.
4. **인용/표의 에디터 고유 속성** — 우리 규칙과 충돌하는 클래스·인라인 스타일이 붙는지.

추가로, 선행 구역들과 마찬가지로 **티스토리 서버 렌더링 전반**(관리 메뉴바 주입, 광고 삽입 위치 등)이 본문 프로즈 영역과 겹치는지도 실사이트에서만 확인 가능하다.

---

## 7. 범위 밖으로 남은 것

TOC · 댓글 · 반응형 · **구문 강조(Q3 — 이번 범위 밖으로 확정)**. 구문 강조를 나중에 도입한다면 Q2(코드 블록 배경: 현재 `--color-muted` 테마 추종 vs 고정 다크)와 함께 결정하는 편이 낫고, 그 전에 위 Q8-2(에디터가 내려주는 코드블록 마크업)를 실사이트에서 먼저 확인해야 한다.
